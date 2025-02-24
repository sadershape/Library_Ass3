import express from "express";
import axios from "axios";
import { translateText } from "../config/translate.js"; // ✅ Correct import

const router = express.Router();

const GUTENDEX_API_URL = "https://gutendex.com/books/";
const OPEN_LIBRARY_API_URL = "https://openlibrary.org/search.json";

// ✅ Gutenberg Books Route
router.get("/", async (req, res) => {
    try {
        console.log("📌 Gutenberg Route Hit");
        const searchQuery = req.query.q || "library";
        console.log("📌 Search Query:", searchQuery);

        const response = await axios.get(`${GUTENDEX_API_URL}?search=${encodeURIComponent(searchQuery)}`);
        let books = response.data.results || [];

        // Translate book titles if Russian is selected
        if (req.session.language === "ru") {
            for (let i = 0; i < books.length; i++) {
                books[i].title = await translateText(books[i].title, "ru");
                if (books[i].authors.length) {
                    books[i].authors = await translateText(books[i].authors[0].name, "ru");
                }
            }
        }

        res.render("books", { books, user: req.session.user, language: req.session.language });
    } catch (error) {
        console.error("❌ Error fetching books from Gutenberg API:", error.message);
        res.status(500).json({ error: "Error retrieving books from Gutenberg API." });
    }
});

// ✅ Open Library Books Route
router.get("/openlibrary", async (req, res) => {
    try {
        console.log("📌 Open Library Route Hit");
        const searchQuery = req.query.q || "library";
        console.log("📌 Search Query:", searchQuery);

        const response = await axios.get(`${OPEN_LIBRARY_API_URL}?q=${encodeURIComponent(searchQuery)}`);
        let books = response.data.docs || [];

        // Translate book titles if Russian is selected
        if (req.session.language === "ru") {
            for (let i = 0; i < books.length; i++) {
                books[i].title = await translateText(books[i].title, "ru");
                if (books[i].author_name) {
                    books[i].author_name = await translateText(books[i].author_name.join(", "), "ru");
                }
            }
        }

        res.render("openLibrary", { books, user: req.session.user, language: req.session.language });
    } catch (error) {
        console.error("❌ Error fetching books from Open Library API:", error.message);
        res.status(500).render("error", { message: "Error retrieving books from Open Library API." });
    }
});

export default router; // ✅ Use `export default`
