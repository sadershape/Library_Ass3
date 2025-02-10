const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/search", async (req, res) => {
    try {
        console.log("📌 Google Books Route Hit");

        const query = req.query.q || "fiction";
        console.log("📌 Query:", query);

        // ✅ Use Free Version of Google Books API (No API Key)
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
            console.error("❌ Error Response Data:", JSON.stringify(error.response.data, null, 2));
        }

        res.status(500).render("error", {
            message: "Error retrieving Google Books. Please try again later.",
        });
    }
});

module.exports = router;
