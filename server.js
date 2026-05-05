import nodemailer from "nodemailer"
import express from "express";
import "dotenv/config";
import multer from "multer"
import bcrypt from "bcrypt";
import path from "path";
import session from "express-session";
import db from "./db.js";

const app = express();
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendVerifyEmail(email, token) {
    console.log("-----------------------");
    console.log(`GİDEN MAİL: ${email}`);
    console.log(`DOĞRULAMA KODU: ${token}`);
    console.log("-----------------------");

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Doğrulama Kodunuz",
            text: `Kodunuz: ${token}`
        });
        console.log("Mail gönderildi!");
    } catch (error) {
        console.error("MAİL GÖNDERME HATASI:", error.message);
    }
}
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.get("/", async (req, res) => {
    try {
        const [products] = await db.query("select * from products")

        res.render("index.ejs", { products })
    } catch (error) {
        res.status(500).send("Error loading products " + error)
    }
})

app.get("/seller/products", (req, res) => {
    res.render("seller-products.ejs")
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect("/dashboard")
        }
        res.clearCookie("connect.sid")
        res.redirect("/")
    })
})

app.get("/dashboard", (req, res) => {
    if (!req.session.isAuthenticated) {
        req.session.message = "Please login to access the dashboard";
        return res.redirect("/");
    }
    res.render("dashboard", { user: req.session.user });
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/seller-register", (req, res) => {
    res.render("seller-register");
});

app.get("/user-register", async (req, res) => {
    res.render("user-register")
})

app.get("/add-product", async (req, res) => {
    res.render("seller-products")
})

app.get("/seller-home", (req, res) => {
    if (req.session.user) {
        res.render("seller-home", { user: req.session.user });
    } else {
        res.redirect("/login");
    }
})

app.get("/resend-code", async (req, res) => {
    const email = req.session.verifyEmail;
    if (!email) return res.redirect("/login");

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query("UPDATE users SET verification_code = ? WHERE email = ?", [newCode, email]);
    await sendVerifyEmail(email, newCode);
    
    res.redirect("/verify-page?message=resent");
});

app.post("/add", upload.single("productImage"), async (req, res)=> {
    try {
        const { title, oldP, newP, type, tarih, stock } = req.body;
        let newT
        const imagePath = req.file ? `/images/${req.file.filename}` : null
        switch(type) {
            case "makeUp": newT = 1;
            break;
            case "medicine": newT = 2;
            break;
            case "market": newT = 3;
            break;
        }
        const query = await db.query(
"INSERT INTO products (title, normal_price, discounted_price, market_id, expiration_date, image_path, stock) VALUES (?, ?, ?, ?, ?, ?, ?)", 
[title, oldP, newP, newT, tarih, imagePath, stock]);
        res.send("Ürün ve resim başarıyla kaydedildi!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Bir hata oluştu: " + error.message);
    }
})
app.post("/login", async (req, res) => {
    //login system for customer and buyers
    // console.log("entered end point")
    const { email, password, remember } = req.body
    
    try {
        // console.log("sending select query")
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email])
        if (rows.length > 0) {
            // console.log("There is a match in database")
            const user = rows[0]
            const match = await bcrypt.compare(password, user.password_hash)
            if (match) {
                
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 
                await db.query("UPDATE users SET verification_code = ? WHERE email = ?", 
                    [verificationCode, email]);
                    
                await sendVerifyEmail(email, verificationCode);
                req.session.verifyEmail = email;    
                
                req.session.user = user;
                // req.session.isAuthenticated = true;
                
                if (remember) {
                    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000
                }
<<<<<<< HEAD
                res.render("verification")
=======
                if (user.role === "consumer"){
                    res.render("consumer-home")
                }
                else {
                    res.render("seller-home", { user: req.session.user })
                }
>>>>>>> 35830fe (little fixes, user and seller registration problem)
            } else {
                req.session.message = "Invalid username or password"
                return res.redirect("/login")
            }
        } else {
            req.session.message = "Invalid username or password"
            return res.redirect("/login")
        }
    } catch (error) {
        res.status(500).send(error.code)
    }
})

app.get("/verify-page", (req, res) => {
    if (!req.session.verifyEmail) return res.redirect("/login");
    let info = null
    let isError = null
    if (req.query.message === 'resent') {
        info = "New Code Sent";
    } else if (req.query.message === 'error') {
        info = "Wrong input. Try Again";
        isError = 1
    }
    res.render("verification", { email: req.session.verifyEmail, info: info, isError: isError });
});

app.post("/verif", async (req, res) => {
    const { code } = req.body;
    const email = req.session.verifyEmail;
    console.log("Onaylanacak Email:", email); 
    console.log("Girilen Kod:", code);
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ? AND verification_code = ?", 
            [email, code]);

        if (rows.length > 0) {
            const user = rows[0];
            console.log("Hangi mail:", req.session.verifyEmail);
            console.log("Kod:", code);
            await db.query("UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE email = ?", [email]);
            delete req.session.verifyEmail; 
            req.session.message = "success";
            res.redirect("/seller-home");
        } else {
            res.redirect("/verify-page?message=error")
        }
    } catch (error) {
        res.status(500).send(error.code);
    }
});

app.post("/seller-register", async (req, res) => {
    try {
        const { email, password, name, city, district } = req.body;

        // 1. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Insert into users
        const [result] = await db.query(
            `INSERT INTO users (email, password_hash, role, is_verified)
<<<<<<< HEAD
             VALUES (?, ?, 'market', FALSE)`, // THe cosumer role is given by default here, also we just verified them for now
=======
             VALUES (?, ?, 'market', TRUE)`, // THe market role is given by default here, also we just verified them for now
>>>>>>> 35830fe (little fixes, user and seller registration problem)
            [email, hashedPassword]
        );

        // 3. Get inserted user_id to insert it into the markets table
        const userId = result.insertId;

        // 4. Insert into market_profiles
        await db.query(
            `INSERT INTO market_profiles (user_id, market_name, city, district)
             VALUES (?, ?, ?, ?)`,
            [userId, name, city, district]
        );

        res.redirect("/login");

    } catch (error) {
        res.status(500).send("Registration error " + error);
    }
})

app.post("/user-register", async (req, res) => {
    try {
        const { email, password, name, city, district } = req.body;

        // 1. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // 2. Insert into users
        const [result] = await db.query(
            `INSERT INTO users (email, password_hash, role, is_verified)
             VALUES (?, ?, 'consumer', FALSE)`, // THe cosumer role is given by default here, also we just verified them for now
            [email, hashedPassword]
        );
        const userId = result.insertId;
        // 3. Get inserted user_id to insert it into the customer table
        
        // 4. Insert into consumer_profiles
        await db.query(
            `INSERT INTO consumer_profiles (user_id, full_name, city, district)
             VALUES (?, ?, ?, ?)`,
            [userId, name, city, district]
        );
        
        // req.session.verifyEmail = email; 
        res.redirect("/login");

    } catch (error) {
        res.status(500).send("Registration error " + error);
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000")
})

