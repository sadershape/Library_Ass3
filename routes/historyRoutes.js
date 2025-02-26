const express = require("express");
const History = require("../models/History");

const router = express.Router();

// Route to fetch history
router.get("/", async (req, res) => {
    try {
        const history = await History.find().sort({ timestamp: -1 }); // Sort by latest
        res.render("history", { history });
    } catch (err) {
        console.error("❌ Error fetching history:", err.message);
        res.status(500).render("error", { message: "Failed to load history." });
    }
});

// Route to add a new history entry
router.post("/add", async (req, res) => {
    try {
        const { user, action } = req.body;

        // Validate required fields
        if (!user || !action) {
            return res.status(400).send("User and action are required.");
        }

        const newEntry = new History({
            user,
            action,
            timestamp: new Date(),
        });

        await newEntry.save();
        console.log("✅ New history entry added:", newEntry);
        res.redirect("/history");
    } catch (err) {
        console.error("❌ Error saving history:", err.message);
        res.status(500).send("Error saving history.");
    }
});

module.exports = router;
