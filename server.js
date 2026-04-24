import express from "express";
import "dotenv/config";
import bcrypt from "bcrypt";
import session from "express-session";
import db from "./db.js";

const app = express();
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false
}));

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.get("/seller", (req, res) => {
    res.render("seller-home.ejs")
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
                res.render("seller-home", {user: req.session.user})
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
        
    }
    
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})

