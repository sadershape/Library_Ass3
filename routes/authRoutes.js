const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import the User model

// Login routes (existing code)
router.get("/login", (req, res) => {
    res.render("login", { user: req.session.user || null });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Check if the user is the admin
    if (username === "admin" && password === "password123") {
        req.session.user = { name: "Admin", role: "admin" };
        return res.redirect("/admin");
    }

    // Check if the user exists in the database
    const user = await User.findOne({ username, password });
    if (user) {
        req.session.user = { name: username, role: "user" };
        return res.redirect("/");
    }

    res.status(401).send("Invalid credentials");
});

// Registration routes
router.get("/register", (req, res) => {
    res.render("register", { user: req.session.user || null });
});

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send("Username already exists");
        }

        // Create a new user
        const newUser = new User({ username, password });
        await newUser.save();

        // Log the user in after registration
        req.session.user = { name: username, role: "user" };
        res.redirect("/");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user");
    }
});

// Logout route (existing code)
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
