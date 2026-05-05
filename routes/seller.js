import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

router.get("/seller-home", async (req, res) => {
    if (req.session.user) {
        console.log("Seller Home Girişi - user_id: " + req.session.user.user_id);
        
        const [marketRows] = await db.query("SELECT market_id FROM market_profiles WHERE user_id = ?", [req.session.user.user_id]);
        
        let products = [];
        if(marketRows.length > 0) {
            [products] = await db.query("SELECT * FROM products WHERE market_id = ?", [marketRows[0].market_id]);
        }
        
        console.log("Listelenecek Ürün Sayısı:", products.length);
        res.render("seller-home", { user: req.session.user, products: products });
    } else {
        res.redirect("/login");
    }
});

router.get("/seller/products", (req, res) => {
    res.render("seller-products.ejs");
});

router.get("/add-product", async (req, res) => {
    res.render("seller-products");
});

router.post("/add", upload.single("productImage"), async (req, res) => {
    try {
        console.log("Dosya bilgisi:", req.file); 
        console.log("Body bilgisi:", req.body);
        
        const { title, oldP, newP, type, tarih, stock } = req.body;
        const imagePath = req.file ? `/images/${req.file.filename}` : null;
        
        const userId = req.session.user.user_id;
        
        const [marketRows] = await db.query(
            "SELECT market_id FROM market_profiles WHERE user_id = ?", 
            [userId]
        );
        
        if (marketRows.length === 0) {
            console.log("HATA: Bu kullanıcı ID'sine ait bir market_profiles kaydı yok.");
            return res.status(400).send("Bu kullanıcıya ait bir market profili bulunamadı.");
        }
        
        const correctMarketId = marketRows[0].market_id;

        await db.query(
            "INSERT INTO products (market_id, title, stock, normal_price, discounted_price, expiration_date, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [correctMarketId, title, stock, oldP, newP, tarih, imagePath]
        );
                    
        console.log("Ürün başarıyla eklendi!");
        res.redirect("/seller-home");
    } catch (error) {
        console.error("Ürün Ekleme Hatası:", error);
        res.status(500).send("Bir hata oluştu: " + error.message);
    }
});

router.get("/update/:id", async (req, res) => {
    const id = req.params.id;
    try {
    } catch (error) {
        console.error(error);
    }
    res.render("update");
});

export default router;