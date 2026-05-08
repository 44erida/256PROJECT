import express from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import db from '../db.js';

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
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
        console.log("Mail başarıyla gönderildi!");
    } catch (error) {
        console.error("MAİL GÖNDERME HATASI:", error.message);
    }
}

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {
    const { email, password, remember } = req.body;
    
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (rows.length > 0) {
            const user = rows[0];
            const match = await bcrypt.compare(password, user.password_hash);
            
            if (match) {
                console.log("Kullanıcı doğrulandı, session oluşturuluyor.");
                req.session.user = user;
                req.session.isAuthenticated = true;
                
                if (remember === "on") {
                    req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
                } else {
                    req.session.cookie.expires = false;
                }
                
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                await db.query("UPDATE users SET verification_code = ? WHERE email = ?", [verificationCode, email]);
                await sendVerifyEmail(email, verificationCode);
                
                req.session.verifyEmail = email;
                res.redirect("/verify-page");
            } else {
                console.log("Hatalı şifre girildi.");
                req.session.message = "Invalid username or password";
                return res.redirect("/login");
            }
        } else {
            console.log("Veritabanında böyle bir e-posta bulunamadı.");
            req.session.message = "You don't have an account. Register";
            return res.redirect("/login");
        }
    } catch (error) {
        console.error("Login Hatası:", error);
        res.status(500).send(error.code);
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect("/dashboard");
        }
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

router.get("/seller-register", (req, res) => {
    res.render("seller-register");
});

router.post("/seller-register", async (req, res) => {
    try {
        const { email, password, name, city, district } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            `INSERT INTO users (email, password_hash, role, is_verified, name) VALUES (?, ?, 'market', FALSE, ?)`,
            [email, hashedPassword, name]
        );
        
        const userId = result.insertId;
        await db.query(
            `INSERT INTO market_profiles (user_id, market_name, city, district) VALUES (?, ?, ?, ?)`,
            [userId, name, city, district]
        );
        
        res.redirect("/login");
    } catch (error) {
        console.error("Satıcı Kayıt Hatası:", error);
        res.status(500).send("Registration error " + error);
    }
});

router.get("/user-register", async (req, res) => {
    res.render("user-register");
});

router.post("/user-register", async (req, res) => {
    try {
        const { email, password, name, city, district } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            `INSERT INTO users (email, password_hash, role, is_verified, name) VALUES (?, ?, 'consumer', FALSE, ?)`,
            [email, hashedPassword, name]
        );
        
        const userId = result.insertId;
        await db.query(
            `INSERT INTO consumer_profiles (user_id, full_name, city, district) VALUES (?, ?, ?, ?)`,
            [userId, name, city, district]
        );
        
        res.redirect("/login");
    } catch (error) {
        console.error("Kullanıcı Kayıt Hatası:", error);
        res.status(500).send("Registration error " + error);
    }
});

router.get("/verify-page", (req, res) => {
    if (!req.session.verifyEmail) return res.redirect("/login");
    let info = null;
    let isError = null;
    
    if (req.query.message === 'resent') {
        info = "New Code Sent";
    } else if (req.query.message === 'error') {
        info = "Wrong input. Try Again";
        isError = 1;
    }
    
    res.render("verification", { email: req.session.verifyEmail, info: info, isError: isError });
});

router.post("/verif", async (req, res) => {
    const { code } = req.body;
    const email = req.session.verifyEmail;
    
    console.log("Onaylanacak Email:", email);
    console.log("Girilen Kod:", code);
    
    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ? AND verification_code = ?",
            [email, code]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            req.session.user = user;
            
            await db.query(
                "UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE email = ?",
                [email]
            );
            
            delete req.session.verifyEmail;
            req.session.message = "success";
            
            if (user.role === "market") {
                res.redirect("/seller-home");
            } else {
                res.redirect("/consumer-home");
            }
        } else {
            console.log("Hatalı doğrulama kodu girildi.");
            res.redirect("/verify-page?message=error");
        }
    } catch (error) {
        console.error("Doğrulama Hatası:", error);
        res.status(500).send(error.code);
    }
});

router.get("/resend-code", async (req, res) => {
    const email = req.session.verifyEmail;
    if (!email) return res.redirect("/login");
    
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query("UPDATE users SET verification_code = ? WHERE email = ?", [newCode, email]);
    await sendVerifyEmail(email, newCode);
    res.redirect("/verify-page?message=resent");
});

export default router;