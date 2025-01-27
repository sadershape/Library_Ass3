const express = require("express");
const router = express.Router();
const axios = require("axios");

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = process.env.OPENWEATHER_API_KEY;

router.get("/", async (req, res) => {
    try {
        const city = req.query.city || "London";
        const response = await axios.get(`${WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const weather = response.data;

        res.render("weather", { weather });
    } catch (error) {
        console.error("Error fetching weather:", error);
        res.status(500).send("Error retrieving weather data");
    }
});

module.exports = router;
