import express from "express"

const app = express();
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.get("/seller", (req, res) => {
    res.render("main-seller.ejs")
})

app.get("/seller/products", (req, res) => {
    res.render("seller-products.ejs")
})


app.listen(3000, () => {
    console.log("Server running on port 3000")
})

