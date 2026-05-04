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

app.get("/register", (req, res) => {
    res.render("register");
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
    const { email, password, remember } = req.body
    try {
        const [rows] = await db.query(
            "SELECT * FROM user WHERE email = ?", [email])
        if (rows.length > 0) {
            const user = rows[0]
            const match = await bcrypt.compare(password, user.password)
            if (match) {
                req.session.user = user
                req.session.isAuthenticated = true
                if (remember) {
                    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000
                }
                res.render("seller-home", { user: req.session.user })
            } else {
                req.session.message = "Invalid username or password"
                res.redirect("/login")
            }
        } else {
            req.session.message = "Invalid username or password"
            res.redirect("/login")
        }
    } catch (error) {
        res.status(500).send(error.code)
    }
})



app.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO user (email, password, name) VALUES (?, ?, ?)", [email, hashedPassword, name]);
        req.session.message = "Registration successful. Please login.";
        res.redirect("/login");
    } catch (error) {
        res.send("REGISTER ERROR")
    }

})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})

