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
        
        const [marketRows] = await db.query("SELECT market_id FROM market_profiles WHERE user_id = ?", [req.session.user.user_id]);
        
        let products = [];
        if(marketRows.length > 0) {
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

router.post("/update/:id", async (req, res) => {
    const id = req.params.id
    console.log(id)
    res.redirect("seller-home")
})

router.get("/profile-settings", (req, res) => {
    res.render("profile-settings")
})

router.post("/update-profile", async (req, res) => {
    // Formdaki 'name' değerleri ile buradaki değişken isimleri aynı olmalı
    const { name, brand_name, oldPass, newPass } = req.body;
    const userId = req.session.user_id;

    try {
        // 1. Kullanıcıyı ve mevcut şifresini getir
        const [users] = await db.query("SELECT * FROM users WHERE user_id = ?", [userId]);
        const user = users[0];

        // 2. Şifre değiştirme isteği var mı?
        if (oldPass && newPass) {
            // Şifre kontrolü
            const isMatch = await bcrypt.compare(oldPass, user.password);

            if (!isMatch) {
                return res.render("profile-settings", { 
                    info: "Mevcut şifreniz hatalı!", 
                    isError: true,
                    user: req.session.user 
                });
            }

            // Şifre doğruysa: Yeni şifreyi hashle ve her şeyi güncelle
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(newPass, salt);

            await db.query(
                "UPDATE users SET name = ?,  password = ? WHERE user_id = ?",
                [name, hashedPass, userId]
            );
        } else {
            // Şifre değiştirme isteği yoksa: Sadece isim ve email güncelle
            await db.query(
                "UPDATE users SET name = ? WHERE user_id = ?",
                [name, userId]
            );
        }

        // 3. Market ismini güncelle (Ayrı tablo olduğu için her durumda çalışabilir)
        if (brand_name) {
            await db.query(
                "UPDATE market_profiles SET market_name = ? WHERE user_id = ?", 
                [brand_name, userId]
            );
        }

        // 4. Session'ı güncelle (Arayüzde ismin anlık değişmesi için)
        req.session.user.name = name;

        res.render("profile-settings", { 
            info: "Profiliniz başarıyla güncellendi.", 
            isError: false,
            user: req.session.user 
        });

    } catch (error) {
        console.error("Güncelleme hatası:", error);
        res.status(500).send("Sunucu hatası oluştu.");
    }
});


export default router;