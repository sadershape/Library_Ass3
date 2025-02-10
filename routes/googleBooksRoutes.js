const express = require("express");
const axios = require("axios");
const router = express.Router();

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY; // Ensure this is set in .env

router.get("/search", async (req, res) => {
    try {
        const query = req.query.q || "fiction";
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}`);

        if (!response.data.items) {
            return res.status(404).render("error", { message: "No books found." });
        }

        const books = response.data.items.map(item => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown",
            cover: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
            publishedDate: item.volumeInfo.publishedDate,
            googleBooksUrl: item.volumeInfo.infoLink
        }));

        res.render("googleBooks", { books });
    } catch (error) {
        console.error("❌ Google Books API Error:", error);
        res.status(500).render("error", { message: "Error fetching books from Google Books API." });
    }
});

module.exports = router;
