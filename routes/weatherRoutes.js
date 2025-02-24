import express from "express";
import axios from "axios";

const router = express.Router();

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = process.env.OPENWEATHER_API_KEY || "b800e222bd73afda72095131ec2840a1"; // Fallback API key

router.get("/", async (req, res) => {
    try {
        const city = req.query.city || "London"; // Default to London if no city is provided
        const response = await axios.get(`${WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        const weather = response.data;

        // Log the weather data for debugging
        console.log("Weather Data:", weather);

        // Render the weather.ejs template with the weather data and user session
        res.render("weather", { 
            weather: {
                city: weather.name, // City name
                temp: weather.main.temp, // Temperature in Celsius
                description: weather.weather[0].description, // Weather condition
                icon: `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png` // Weather icon
            },
            user: req.session?.user || null // Ensure user data is passed
        });
    } catch (error) {
        console.error("Error fetching weather:", error.response ? error.response.data : error.message);

        // Render an error page with a message
        res.status(500).render("error", { 
            message: "Unable to retrieve weather data. Please try again later.", 
            user: req.session?.user || null 
        });
    }
});

export default router; // ✅ Use `export default`
