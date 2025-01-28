const express = require("express");
const router = express.Router();
const axios = require("axios");

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = process.env.OPENWEATHER_API_KEY;

router.get("/", async (req, res) => {
    try {
        const city = req.query.city || "London"; // Default to London if no city is provided
        const response = await axios.get(`${WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const weather = response.data;

        // Log the weather data for debugging
        console.log("Weather Data:", weather);

        // Render the weather.ejs template with the weather data
        res.render("weather", { 
            weather: {
                city: weather.name, // City name
                temp: weather.main.temp, // Temperature in Celsius
                description: weather.weather[0].description, // Weather condition
                icon: weather.weather[0].icon // Weather icon (optional)
            }
        });
    } catch (error) {
        console.error("Error fetching weather:", error);

        // Render an error page or send a user-friendly message
        res.status(500).render("error", { 
            message: "Unable to retrieve weather data. Please try again later."
        });
    }
});

module.exports = router;
