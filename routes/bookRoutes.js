const express = require("express");
const router = express.Router();
const axios = require("axios");

const GUTENDEX_API_URL = "https://gutendex.com/books/";

// Books Route
router.get("/", async (req, res) => {
    try {
        const searchQuery = req.query.q || "library";
        const response = await axios.get(`${GUTENDEX_API_URL}?search=${searchQuery}`);
        const books = response.data.results;

        res.render("books", { books });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).send("Error retrieving books");
    }
});

module.exports = router;
