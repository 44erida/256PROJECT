import express from 'express';
import db from '../db.js';

const router = express.Router();

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
        const [products] = await db.query("select * from products");
        if (req.session.user) {
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
            const [consumer] = await db.query("select * from consumer_profiles where user_id=?",[req.session.user.user_id]);
            res.render("consumer-home", { consumer: consumer, products: products ,items:items});
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

        res.redirect('/consumer-home'); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Could not add item to cart");
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

router.get("/cons-settings", (req, res) => {
    res.render("consumer-sett");
});

export default router;