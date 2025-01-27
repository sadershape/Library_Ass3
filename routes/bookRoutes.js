const express = require("express");
const router = express.Router();
const axios = require("axios");

const GUTENDEX_API_URL = "https://gutendex.com/books/";

// Books Route
router.get("/", async (req, res) => {
    try {
        const searchQuery = req.query.q || "library";
        const response = await axios.get(`${GUTENDEX_API_URL}?search=${encodeURIComponent(searchQuery)}`);
        const books = response.data.results || []; // Ensure books is always an array

        res.render("books", { books, user: req.session.user || null }); // Pass user to EJS
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).render("error", { message: "Error retrieving books", user: req.session.user || null });
    }
});

module.exports = router;
