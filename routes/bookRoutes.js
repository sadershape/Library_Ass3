const express = require("express");
const axios = require("axios");
const router = express.Router();

const GUTENDEX_API_URL = "https://gutendex.com/books/";
const OPEN_LIBRARY_API_URL = "https://openlibrary.org/search.json";
const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY; // Store API key in .env

// 📌 Route 1: Gutenberg Books (Existing Route)
router.get("/", async (req, res) => {
    try {
        const searchQuery = req.query.q || "library";
        const response = await axios.get(`${GUTENDEX_API_URL}?search=${encodeURIComponent(searchQuery)}`);
        const books = response.data.results || []; // Ensure books is always an array

        res.render("books", { books, user: req.session.user || null });
    } catch (error) {
        console.error("❌ Error fetching Gutenberg books:", error);
        res.status(500).render("error", { message: "Error retrieving books", user: req.session.user || null });
    }
});

// 📌 Route 2: Open Library Books
router.get("/openlibrary", async (req, res) => {
    try {
        const searchQuery = req.query.q || "science";
        const response = await axios.get(`${OPEN_LIBRARY_API_URL}?q=${encodeURIComponent(searchQuery)}`);

        const books = response.data.docs.slice(0, 10).map(book => ({
            title: book.title,
            author: book.author_name ? book.author_name.join(", ") : "Unknown",
            cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
            first_publish_year: book.first_publish_year,
            openLibraryUrl: `https://openlibrary.org${book.key}`
        }));

        res.render("openLibrary", { books, user: req.session.user || null });
    } catch (error) {
        console.error("❌ Error fetching Open Library books:", error);
        res.status(500).render("error", { message: "Error retrieving Open Library books", user: req.session.user || null });
    }
});

// 📌 Route 3: Google Books API
router.get("/googlebooks", async (req, res) => {
    try {
        const searchQuery = req.query.q || "fiction";
        const response = await axios.get(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(searchQuery)}&key=${GOOGLE_BOOKS_API_KEY}`);

        if (!response.data.items) {
            return res.render("googleBooks", { books: [], user: req.session.user || null });
        }

        const books = response.data.items.map(item => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown",
            cover: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
            publishedDate: item.volumeInfo.publishedDate,
            googleBooksUrl: item.volumeInfo.infoLink
        }));

        res.render("googleBooks", { books, user: req.session.user || null });
    } catch (error) {
        console.error("❌ Error fetching Google Books:", error);
        res.status(500).render("error", { message: "Error retrieving Google Books", user: req.session.user || null });
    }
});

module.exports = router;
