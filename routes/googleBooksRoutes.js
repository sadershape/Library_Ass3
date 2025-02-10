const express = require("express");
const axios = require("axios");
const router = express.Router();

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY; // Ensure this is set in .env

// Google Books API Route
router.get("/search", async (req, res) => {
    try {
        const query = req.query.q || "fiction"; // Default search term
        if (!query) {
            return res.render("googleBooks", { books: [], message: "Please enter a search query." });
        }

        const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}`
        );

        // Check if the API returned any books
        if (!response.data.items || response.data.items.length === 0) {
            return res.render("googleBooks", { books: [], message: "No books found for your search query." });
        }

        // Map the response data to a simpler structure
        const books = response.data.items.map((item) => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown",
            cover: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
            publishedDate: item.volumeInfo.publishedDate,
            googleBooksUrl: item.volumeInfo.infoLink,
        }));

        res.render("googleBooks", { books, message: null }); // Pass books and no error message
    } catch (error) {
        console.error("❌ Google Books API Error:", error.message);
        res.status(500).render("error", {
            message: "An error occurred while fetching books from Google Books API. Please try again later.",
        });
    }
});

module.exports = router;
