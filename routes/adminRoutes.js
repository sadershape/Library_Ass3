const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming you have a User model
const bcrypt = require("bcrypt");
const { isAdmin } = require("../middleware/authMiddleware"); // Admin check middleware

// Admin Dashboard
router.get("/", isAdmin, async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render("admin", { users });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).send("Server Error");
    }
});

// Add New User
router.post("/add", isAdmin, async (req, res) => {
    const { username, password, isAdmin } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, isAdmin });
        await newUser.save();
        res.redirect("/admin");
    } catch (error) {
        console.error("User Add Error:", error);
        res.status(500).send("Error adding user");
    }
});

// Delete User
router.post("/delete/:id", isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/admin");
    } catch (error) {
        console.error("User Deletion Error:", error);
        res.status(500).send("Error deleting user");
    }
});

module.exports = router;
