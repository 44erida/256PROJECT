import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt"
import "dotenv/config"; 
const router = express.Router();

// Mail verification function from Merve
// async function sendVerifyEmail(email, token) {
//     console.log("-----------------------");
//     console.log(`GİDEN MAİL: ${email}`);
//     console.log(`DOĞRULAMA KODU: ${token}`);
//     console.log("-----------------------");

//     try {
//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: "Doğrulama Kodunuz",
//             text: `Kodunuz: ${token}`
//         });
//         console.log("Mail başarıyla gönderildi!");
//     } catch (error) {
//         console.error("MAİL GÖNDERME HATASI:", error.message);
//     }
// }
const transporter = nodemailer.createTransport({
    service: "gmail",  // veya başka bir servis
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS   // Gmail App Password
    }
});

router.get("/", async (req, res) => {
    try {
        const [products] = await db.query("select * from products");
        res.render("index.ejs", { products });
    } catch (error) {
        console.error("Anasayfa ürün yükleme hatası:", error);
        res.status(500).send("Error loading products " + error.message);
    }
});

router.get("/dashboard", (req, res) => {
    if (!req.session.isAuthenticated) {
        req.session.message = "Please login to access the dashboard";
        return res.redirect("/");
    }
    res.render("dashboard", { user: req.session.user });
});

router.get("/consumer-home", async (req, res) => {
    try {
        if (req.session.user) {
            const searchQuery = req.query.search;
            
            let productsQuery = "SELECT * FROM products";
            let queryParams = [];

            if (searchQuery) {
                productsQuery += " WHERE title LIKE ?";
                queryParams.push(`%${searchQuery}%`);
            }

            const [products] = await db.query(productsQuery, queryParams);

            const query = `
            SELECT p.title, p.discounted_price, p.image_path, ci.quantity,
            (p.discounted_price * ci.quantity) AS total_item_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            JOIN carts c ON ci.cart_id = c.cart_id
            JOIN consumer_profiles cp ON c.consumer_id = cp.consumer_id
            WHERE cp.user_id = ?
            `;
            
            const [items] = await db.query(query, [req.session.user.user_id]);
            const [consumer] = await db.query("select * from consumer_profiles where user_id=?", [req.session.user.user_id]);
            
            res.render("consumer-home", { 
                consumer: consumer, 
                products: products, 
                items: items,
                searchQuery: searchQuery 
            });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Consumer Home Hatası:", error);
        res.status(500).send("There was an error: " + error.message);
    }
});

router.post('/add-to-cart', async (req, res) => {

    const { product_id, quantity } = req.body;
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const user_id = req.session.user.user_id;

    try {
        const [profiles] = await db.query("SELECT consumer_id FROM consumer_profiles WHERE user_id = ?", [user_id]);
        const consumer_id = profiles[0].consumer_id;

        let [carts] = await db.query("SELECT cart_id FROM carts WHERE consumer_id = ?", [consumer_id]);

        let cart_id;
        if (carts.length === 0) {
            const [newCart] = await db.query("INSERT INTO carts (consumer_id) VALUES (?)", [consumer_id]);
            cart_id = newCart.insertId;
        } else {
            cart_id = carts[0].cart_id;
        }

        await db.query(`
            INSERT INTO cart_items (cart_id, product_id, quantity) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
            [cart_id, product_id, quantity, quantity]
        );

        const [updatedItems] = await db.query(`
            SELECT p.product_id, p.title, p.discounted_price, p.image_path, ci.quantity,
            (p.discounted_price * ci.quantity) AS total_item_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_id = ?`, [cart_id]);

        // ajax line
        res.json({ success: true, items: updatedItems });
    } catch (error) {
        console.error(error);
        res.status(500).send("Could not add item to cart");
    }
});


router.post('/update-quantity', async (req, res) => {
    const { product_id, action } = req.body;
    const user_id = req.session.user.user_id;

    const change = (action === 'inc') ? 1 : -1;

    try {
        await db.query(`
            UPDATE cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            JOIN consumer_profiles cp ON c.consumer_id = cp.consumer_id
            SET ci.quantity = GREATEST(1, ci.quantity + ?)
            WHERE cp.user_id = ? AND ci.product_id = ?`,
            [change, user_id, product_id]);

        const query = `
            SELECT p.product_id, p.title, p.discounted_price, p.image_path, ci.quantity,
            (p.discounted_price * ci.quantity) AS total_item_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            JOIN carts c ON ci.cart_id = c.cart_id
            JOIN consumer_profiles cp ON c.consumer_id = cp.consumer_id
            WHERE cp.user_id = ?
        `;

        const [items] = await db.query(query, [user_id]);
        res.json({ success: true, items });
    } catch (err) {
        console.error("SERVER CRASH:", err);
        res.status(500).json({ success: false });
    }
});

router.post('/remove-item', async (req, res) => {
    const { product_id } = req.body;
    const user_id = req.session.user.user_id;

    try {
        await db.query(`
            DELETE ci FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            JOIN consumer_profiles cp ON c.consumer_id = cp.consumer_id
            WHERE cp.user_id = ? AND ci.product_id = ?`,
            [user_id, product_id]);

        const query = `
            SELECT p.product_id, p.title, p.discounted_price, p.image_path, ci.quantity,
            (p.discounted_price * ci.quantity) AS total_item_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            JOIN carts c ON ci.cart_id = c.cart_id
            JOIN consumer_profiles cp ON c.consumer_id = cp.consumer_id
            WHERE cp.user_id = ?
        `;
        const [items] = await db.query(query, [user_id]);
        res.json({ success: true, items });
    } catch (err) {
        console.error("SERVER CRASH:", err);
        res.status(500).json({ success: false });
    }
});


router.post('/clear-cart', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, error: "Please log in first" });
    }

    const user_id = req.session.user.user_id;

    try {
        await db.query(`
            DELETE ci FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            JOIN consumer_profiles cp ON c.consumer_id = cp.consumer_id
            WHERE cp.user_id = ?`, 
            [user_id]
        );
        res.json({ success: true, items: [] });
    } catch (err) {
        console.error("Clear cart error:", err);
        res.status(500).json({ success: false, error: "Could not complete purchase" });
    }
});

router.get("/cons-profile", async (req, res) => {
    try {
        const [orders] = await db.query("select * from orders");
        if (req.session.user) {
            const [cards] = await db.query("select * from credit_cards where user_id = ? ", [req.session.user.user_id]);
            const [address] = await db.query("select * from consumer_profiles where user_id = ? ", [req.session.user.user_id]);
            res.render("cons-profile", { user: req.session.user, orders: orders, cards: cards, address: address });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Consumer Home Hatası:", error);
        res.status(500).send("There was an error: " + error.message);
    }
});

router.get("/cons-settings", async (req, res) => {
    try {
        if (req.session.user) {
            const [userInfo] = await db.query("SELECT * FROM users WHERE user_id = ?",
                [req.session.user.user_id])

            res.render("consumer-sett", { userInfo: userInfo[0], message: req.session.message })
        } else {
            res.redirect("/login");
        }
    } catch (error) {

    }
})

router.post("/cons-settings/change-password", async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.redirect("/login")
        }

        // Get the users enetered passwords
        const { oldPassword, newPassword, confirmPassword } = req.body

        // Get current user from DB
        const [rows] = await db.query(
            "SELECT * FROM users WHERE user_id = ?",
            [req.session.user.user_id]
        )

        const user = rows[0]

        // Compare old password
        const match = await bcrypt.compare(
            oldPassword,
            user.password_hash
        )

        // Wrong old password
        if (!match) {
            req.session.message = "Old password is incorrect"
            return res.redirect("/cons-settings")
        }

        // Check new password confirmation
        if (newPassword !== confirmPassword) {
            req.session.message = "New passwords do not match"
            return res.redirect("/cons-settings")
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password in DB
        await db.query(
            "UPDATE users SET password_hash = ? WHERE user_id = ?",
            [hashedPassword, user.user_id]
        )

        // The user gets logout automatically, then redirected to login page
        req.session.destroy(() => {
            res.send(`
        <h1>Password updated successfully</h1>

        <script>
            setTimeout(() => {
                window.location.href = "/login"
            }, 2000)
        </script>
            `)
        })

    } catch (error) {
        console.error(error)
        res.status(500).send("Password update error")
    }
})

router.post("/cons-settings/change-email", async (req, res) => {
    try {

        const { newEmail, password } = req.body

        const [rows] = await db.query(
            "SELECT * FROM users WHERE user_id = ?",
            [req.session.user.user_id]
        )

        const user = rows[0]

        // Verify current password
        const match = await bcrypt.compare(
            password,
            user.password_hash
        )

        if (!match) {
            req.session.message = "Password is incorrect"
            return res.redirect("/cons-settings")
        }

        // Generate verification code
        const verificationCode =
            Math.floor(100000 + Math.random() * 900000).toString()

        // Save temporary info in session
        req.session.newEmail = newEmail
        req.session.emailCode = verificationCode

        // Send code
        await sendVerifyEmail(newEmail, verificationCode)

        res.redirect("/verify-new-email")

    } catch (error) {
        console.error(error)
        res.status(500).send("Email change error")
    }
})

router.get("/verify-new-email", (req, res) => {

    if (!req.session.newEmail) {
        return res.redirect("/cons-settings")
    }

    res.render("verify-new-email")
})

router.post("/verify-new-email", async (req, res) => {
    try {

        const { code } = req.body

        if (code !== req.session.emailCode) {
            return res.send("Wrong verification code")
        }

        // Update email
        await db.query(
            "UPDATE users SET email = ? WHERE user_id = ?",
            [
                req.session.newEmail,
                req.session.user.user_id
            ]
        )

        // Logout after email change
        req.session.destroy(() => {
            res.send(`
                <h1>Email updated successfully</h1>

                <script>
                    setTimeout(() => {
                        window.location.href = "/login"
                    }, 2000)
                </script>
            `)
        })

    } catch (error) {
        console.error(error)
        res.status(500).send("Verification error")
    }
})

router.post("/cons-settings/delete-account", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login")
        }

        const { password } = req.body

        const [rows] = await db.query(
            "SELECT * FROM users WHERE user_id = ?",
            [req.session.user.user_id]
        )

        const user = rows[0]

        const match = await bcrypt.compare(password, user.password_hash)

        if (!match) {
            req.session.message = "Password is incorrect"
            return res.redirect("/cons-settings")
        }

        await db.query(
            "DELETE FROM users WHERE user_id = ?",
            [user.user_id]
        )

        req.session.destroy(() => {
            res.send(`
                <h1>Account deleted successfully</h1>

                <script>
                    setTimeout(() => {
                        window.location.href = "/"
                    }, 2000)
                </script>
            `)
        })

    } catch (error) {
        console.error(error)
        res.status(500).send("Account deletion error")
    }
})

export default router;