import express from "express";
import axios from "axios";

const router = express.Router();

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = process.env.OPENWEATHER_API_KEY; // ✅ Secure: Uses environment variable

if (!API_KEY) {
    console.error("❌ OPENWEATHER_API_KEY is missing! Set it in the environment variables.");
}

// ✅ Weather Route
router.get("/", async (req, res) => {
    try {
        const city = req.query.city?.trim() || "London"; // Default to London if no city is provided

        // 🌐 Fetch weather data
        const response = await axios.get(`${WEATHER_API_URL}`, {
            params: { q: city, appid: API_KEY, units: "metric" }
        });

        const weather = response.data;

        // ✅ Ensure weather data exists before rendering
        if (!weather || !weather.main || !weather.weather) {
            throw new Error("Incomplete weather data received");
        }

        console.log("🌤 Weather Data:", weather);

        // 🎨 Render the weather page with data
        res.render("weather", {
            weather: {
                city: weather.name || "Unknown City",
                temp: weather.main.temp ?? "N/A",
                description: weather.weather[0]?.description || "No description available",
                icon: weather.weather[0]?.icon 
                    ? `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`
                    : null
            },
            user: req.session?.user || null
        });

    } catch (error) {
        console.error("❌ Weather API Error:", error.response?.data || error.message);

        const errorMessage = error.response?.data?.message 
            ? `Error: ${error.response.data.message}`
            : "Unable to retrieve weather data. Please try again later.";

        res.status(500).render("error", { 
            message: errorMessage, 
            user: req.session?.user || null
        });
    }
});

export default router;
