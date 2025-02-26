const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", (req, res) => res.render("currency"));

router.post("/", async (req, res) => {
    try {
        const { from, to, amount } = req.body;

        // Validate input
        if (!from || !to || !amount || isNaN(amount) || amount <= 0) {
            return res.render("currency", { error: "Invalid input. Please enter valid currencies and amount." });
        }

        // Corrected API URL
        const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
        const response = await axios.get(url);

        // Check if target currency exists
        const rate = response.data.rates[to];
        if (!rate) {
            return res.render("currency", { error: `Exchange rate for ${to} not found.` });
        }

        const result = (amount * rate).toFixed(2);

        res.render("currency", { result, from, to, amount });
    } catch (error) {
        console.error("❌ Error fetching exchange rate:", error.message);
        res.render("currency", { error: "Failed to retrieve exchange rate. Please try again." });
    }
});

module.exports = router;
