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
            res.render("consumer-home", { user: req.session.user,products:products });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Consumer Home Hatası:", error);
        res.status(500).send("There was an error: " + error.message);
    }
});

router.get("/cons-profile", async(req, res) => {
    try {
        const [orders] = await db.query("select * from orders");
        if (req.session.user) {
            res.render("cons-profile", { user: req.session.user,orders:orders });
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