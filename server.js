import express from "express";
import "dotenv/config";
import session from "express-session";

import authRoutes from './routes/auth.js';
import sellerRoutes from './routes/seller.js';
import indexRoutes from './routes/index.js';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json()); //added this for ajax
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: { 
         secure: false,
         maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use('/', authRoutes);
app.use('/', sellerRoutes);
app.use('/', indexRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});