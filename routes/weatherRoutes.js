const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", (req, res) => res.render("weather"));
router.post("/", async (req, res) => {
    const city = req.body.city;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    res.render("weather", { weather: response.data });
});

module.exports = router;
