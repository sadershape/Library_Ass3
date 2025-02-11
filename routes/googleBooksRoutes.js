const express = require("express");
const router = express.Router();

// Dummy route to prevent errors
router.get("/search", (req, res) => {
    res.json({ message: "Google Books API disabled" });
});

module.exports = router;
