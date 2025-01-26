const express = require("express");
const router = express.Router();
const History = require("../models/History"); // Ensure you have a History model

// Route to fetch history
router.get("/", async (req, res) => {
  try {
    const history = await History.find();
    res.render("history", { history }); // Ensure you have a history.ejs file
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Route to add a new history entry
router.post("/add", async (req, res) => {
  try {
    const newEntry = new History({
      user: req.body.user,
      action: req.body.action,
      timestamp: new Date(),
    });
    await newEntry.save();
    res.redirect("/history");
  } catch (err) {
    res.status(500).send("Error saving history");
  }
});

module.exports = router;
