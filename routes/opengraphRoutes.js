const express = require("express");
const axios = require("axios");
const router = express.Router();

const OPENGRAPH_API_KEY = process.env.OPENGRAPH_API_KEY;

router.get("/", async (req, res) => {
  const { site } = req.query;
  if (!site) return res.status(400).json({ error: "Site URL is required" });

  try {
    const response = await axios.get(
      `https://opengraph.io/api/1.1/site/${encodeURIComponent(site)}?app_id=${OPENGRAPH_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch site metadata" });
  }
});

module.exports = router;
