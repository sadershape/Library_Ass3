const express = require("express");
const axios = require("axios");
const router = express.Router();

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY; // Ensure your .env file has this!

router.get("/search", async (req, res) => {
    try {
        console.log("📌 Google Books Route Hit");

        const query = req.query.q || "fiction"; // Default search if empty
        console.log("📌 Query:", query);

        if (!query.trim()) {
            console.error("❌ ERROR: Empty search query!");
            return res.status(400).render("error", { message: "Invalid search query. Please enter a valid book title." });
        }

        // ✅ Use API Key
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}`;
        console.log("📌 API URL:", apiUrl);

        const response = await axios.get(apiUrl);
        console.log("📌 API Response Status:", response.status);

        if (!response.data.items || response.data.items.length === 0) {
            return res.render("googleBooks", { books: [], message: "No books found for your search query." });
        }

        const books = response.data.items.map((item) => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown",
            cover: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
            publishedDate: item.volumeInfo.publishedDate,
            googleBooksUrl: item.volumeInfo.infoLink,
        }));

        res.render("googleBooks", { books, message: null });
    } catch (error) {
        console.error("❌ Google Books API Error:", error.message);

        if (error.response) {
            console.error("❌ Full Error Response:", JSON.stringify(error.response.data, null, 2));
        }

        res.status(500).render("error", {
            message: "Error retrieving Google Books. Please try again later.",
        });
    }
});

module.exports = router;
