const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/search", async (req, res) => {
    try {
        console.log("📌 Google Books Route Hit");

        const query = req.query.q || "fiction";  // Default to "fiction" if no query is provided
        console.log("📌 Query:", query);

        // ✅ Ensure query is not empty
        if (!query.trim()) {
            console.error("❌ ERROR: Empty search query!");
            return res.status(400).render("error", { message: "Invalid search query. Please enter a valid book title." });
        }

        // ✅ Correct API URL
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
        console.log("📌 API URL:", apiUrl);

        const response = await axios.get(apiUrl);

        console.log("📌 API Response Status:", response.status);
        console.log("📌 API Response Data:", JSON.stringify(response.data, null, 2));

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

        console.log("📌 Processed Books Data:", JSON.stringify(books, null, 2));

        res.render("googleBooks", { books, message: null });
    } catch (error) {
        console.error("❌ Google Books API Error:", error.message);

        if (error.response) {
            console.error("❌ Full Error Response:", JSON.stringify(error.response.data, null, 2));
        }

        res.status(500).render("error", {
            message: `Error retrieving Google Books. ${error.response ? error.response.data.error.message : error.message}`,
        });
    }
});

module.exports = router;
