import express from "express";
import History from "../models/History.js"; // Ensure the .js extension is included

const router = express.Router();

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

// ✅ Correct ES Module Export
export default router;
