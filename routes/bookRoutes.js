const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/gutendex", async (req, res) => {
  const { search } = req.query;
  try {
    const response = await axios.get("https://gutendex.com/books/", {
      params: { search },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

module.exports = router;
