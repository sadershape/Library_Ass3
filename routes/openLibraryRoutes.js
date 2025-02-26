import express from "express";
import axios from "axios";

const router = express.Router();

// ✅ Open Library API Route
router.get("/search", async (req, res) => {
    try {
        const query = req.query.q ? encodeURIComponent(req.query.q) : "science"; // Default query
        const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);

        const booksData = response.data?.docs || []; // Ensure `docs` exists

        if (booksData.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }

        const books = booksData.slice(0, 10).map(book => ({
            title: book.title || "Unknown Title",
            author: book.author_name?.join(", ") || "Unknown",
            cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
            first_publish_year: book.first_publish_year || "Unknown Year",
            openLibraryUrl: book.key ? `https://openlibrary.org${book.key}` : "#"
        }));

        res.json(books);
    } catch (error) {
        console.error("❌ Open Library API Error:", error.message);
        res.status(500).json({ message: "Error fetching books from Open Library." });
    }
});

console.log("📚 OpenLibrary routes initialized");
module.exports = router;

