const express = require("express");
const router = express.Router();
const axios = require("axios");

const GUTENDEX_API_URL = "https://gutendex.com/books/";
const OPEN_LIBRARY_API_URL = "https://openlibrary.org/search.json";

// ✅ Gutenberg Books Route
router.get("/", async (req, res) => {
    try {
        console.log("📌 Gutenberg Route Hit");
        const searchQuery = req.query.q || "library";
        console.log("📌 Search Query:", searchQuery);

        const response = await axios.get(`${GUTENDEX_API_URL}?search=${encodeURIComponent(searchQuery)}`);
        const books = response.data.results || [];

        res.render("books", { books, user: req.session.user });
    } catch (error) {
        console.error("❌ Error fetching books from Gutenberg API:", error.message);
        res.status(500).render("error", { message: "Error retrieving books from Gutenberg API." });
    }
});

// ✅ Open Library Books Route
router.get("/openlibrary", async (req, res) => {
    try {
        console.log("📌 Open Library Route Hit");
        const searchQuery = req.query.q || "library";
        console.log("📌 Search Query:", searchQuery);

        const response = await axios.get(`${OPEN_LIBRARY_API_URL}?q=${encodeURIComponent(searchQuery)}`);
        const books = response.data.docs || [];

        res.render("openLibrary", { books, user: req.session.user });
    } catch (error) {
        console.error("❌ Error fetching books from Open Library API:", error.message);
        res.status(500).render("error", { message: "Error retrieving books from Open Library API." });
    }
});

module.exports = router;
