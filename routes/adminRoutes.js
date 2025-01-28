const express = require("express");
const router = express.Router();
const User = require("../models/User"); // User model
const bcrypt = require("bcryptjs");
const { isAdmin } = require("../middleware/authMiddleware"); // Admin check middleware

// Admin Dashboard
router.get("/", isAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Fetch all users (exclude passwords)
        res.render("admin", { users, success: req.query.success, error: req.query.error });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).render("error", { message: "Server Error" });
    }
});

// Add New User
router.post("/add", isAdmin, async (req, res) => {
    const { username, password, isAdmin } = req.body;

    // Validate input
    if (!username || !password) {
        return res.redirect("/admin?error=Username and password are required");
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.redirect("/admin?error=Username already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, password: hashedPassword, isAdmin: isAdmin === "on" });
        await newUser.save();

        res.redirect("/admin?success=User added successfully");
    } catch (error) {
        console.error("User Add Error:", error);
        res.redirect("/admin?error=Error adding user");
    }
});

// Delete User
router.post("/delete/:id", isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/admin?success=User deleted successfully");
    } catch (error) {
        console.error("User Deletion Error:", error);
        res.redirect("/admin?error=Error deleting user");
    }
});

module.exports = router;
