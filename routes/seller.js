import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db.js';
import bcrypt from "bcrypt"

const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended: true}))

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
        
        const [marketRows] = await db.query("SELECT market_id, market_name FROM market_profiles WHERE user_id = ?", [req.session.user.user_id]);
        
        let products = [];
        if(marketRows.length > 0) {
            req.session.user.brand_name = marketRows[0].market_name;
            [products] = await db.query("SELECT * FROM products WHERE market_id = ?", [marketRows[0].market_id]);
        }
        
        console.log("Listelenecek Ürün Sayısı:", products.length);
        res.render("seller-home", { user: req.session.user, products: products, count: products.length });
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
    const id = req.params.id
    try {
        const [row] = await db.query(
            "select * from products where product_id = ?", 
        [id])
        console.log(row)
        res.render("update", {pro: row[0]})
    } catch (error) {
        
    }
})

router.post("/update/:id", upload.single("productImage"), async (req, res) => {
    const productId = req.params.id;
    const { title, oldP, newP, stock, type, tarih } = req.body;
    
     if (!title || title.trim() === "" || !oldP || oldP.trim() === ""
||!newP || newP.trim() === "" || !stock ||stock.trim() === "" || !type ||type.trim() === ""
||!tarih ||tarih.trim() === "") {
        const [row] = await db.query("SELECT * FROM products WHERE product_id = ?", [productId]);
        return res.render("update", {
            pro: row[0],
            info: "Lütfen tüm alanları doldurun!", 
            isError: true 
        });
    }
    try {
        const [rows] = await db.query("SELECT image_path FROM products WHERE product_id = ?", [productId]);
        let imagePath = rows[0].image_path;

        if (req.file) {
            imagePath = `/images/${req.file.filename}`;
        }

        await db.query(
            `UPDATE products SET 
                title = ?, 
                normal_price = ?, 
                discounted_price = ?, 
                stock = ?, 
                expiration_date = ?, 
                image_path = ? 
             WHERE product_id = ?`,
            [title, oldP, newP, stock, tarih, imagePath, productId]
        );

        console.log("Ürün güncellendi, ID:", productId);
        res.redirect("/seller-home");

    } catch (error) {
        console.error("Güncelleme Hatası:", error);
        res.status(500).send("Güncelleme sırasında bir hata oluştu.");
    }
})

router.get("/edit-info", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("seller-edit-info", { user: req.session.user, info: null, isError: false });
});

router.post("/update-info", async (req, res) => {
    const { name, brand_name } = req.body;
    const userId = req.session.user.user_id;
    try {
        await db.query("UPDATE users SET name = ? WHERE user_id = ?", [name, userId]);
        await db.query("UPDATE market_profiles SET market_name = ? WHERE user_id = ?", [brand_name, userId]);
        req.session.user.name = name;
        req.session.user.brand_name = brand_name;
        res.render("seller-edit-info", { info: "Bilgiler başarıyla güncellendi.", isError: false, user: req.session.user });
    } catch (error) {
        res.render("seller-edit-info", { info: "Bir hata oluştu.", isError: true, user: req.session.user });
    }
});

router.get("/edit-password", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("seller-edit-password", { info: null, isError: false });
});

router.post("/update-password", async (req, res) => {
    const { oldPass, newPass } = req.body;
    const userId = req.session.user.user_id;
    try {
        const [users] = await db.query("SELECT password_hash FROM users WHERE user_id = ?", [userId]);
        const isMatch = await bcrypt.compare(oldPass, users[0].password_hash);
        
        if (!isMatch) {
            return res.render("seller-edit-password", { info: "Mevcut şifre hatalı!", isError: true });
        }

        const hashedPass = await bcrypt.hash(newPass, 10);
        await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [hashedPass, userId]);
        res.render("seller-edit-password", { info: "Şifre başarıyla güncellendi.", isError: false });
    } catch (error) {
        res.render("seller-edit-password", { info: "Şifre güncellenirken hata oluştu.", isError: true });
    }
});

router.get("/edit-address", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("seller-edit-address", { info: null, isError: false });
});

router.post("/update-address", async (req, res) => {
    const { city, district } = req.body;
    const userId = req.session.user.user_id;
    try {
        await db.query("UPDATE market_profiles SET city = ?, district = ? WHERE user_id = ?", [city, district, userId]);
        res.render("seller-edit-address", { info: "Adres bilgileri güncellendi.", isError: false });
    } catch (error) {
        res.render("seller-edit-address", { info: "Adres güncellenirken hata oluştu.", isError: true });
    }
});

export default router;