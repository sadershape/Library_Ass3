const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", (req, res) => res.render("currency"));
router.post("/", async (req, res) => {
    const from = req.body.from;
    const to = req.body.to;
    const amount = req.body.amount;
    const url = `https://v6.exchangeratesapi.io/latest?base=${from}&symbols=${to}&apikey=${process.env.EXCHANGE_RATES_API_KEY}`;
    const response = await axios.get(url);
    const rate = response.data.rates[to];
    res.render("currency", { result: amount * rate });
});

module.exports = router;
