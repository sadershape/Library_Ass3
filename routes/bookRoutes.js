const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
    const query = req.query.q || "programming";
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${process.env.BOOKS_API_KEY}`;
    const response = await axios.get(url);
    res.render("books", { books: response.data.items });
});

module.exports = router;
