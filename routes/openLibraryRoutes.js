const express = require("express");
const axios = require("axios");
const router = express.Router();
const translateText = require("../config/translate");

// Open Library API Route
router.get("/search", async (req, res) => {
    try {
        const query = req.query.q || "science"; // Default query
        const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);

        if (!response.data.docs.length) {
            return res.status(404).json({ message: "No books found." });
        }

        let books = response.data.docs.slice(0, 10).map(book => ({
            title: book.title,
            author: book.author_name ? book.author_name.join(", ") : "Unknown",
            cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
            first_publish_year: book.first_publish_year,
            openLibraryUrl: `https://openlibrary.org${book.key}`
        }));

        // Translate if the language is set to Russian
        if (req.session.language === "ru") {
            for (let i = 0; i < books.length; i++) {
                books[i].title = await translateText(books[i].title, "ru");
                books[i].author = await translateText(books[i].author, "ru");
            }
        }

        res.json(books);
    } catch (error) {
        console.error("❌ Open Library API Error:", error);
        res.status(500).json({ message: "Error fetching books from Open Library." });
    }
});

module.exports = router;
