const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { isAdmin } = require("../middleware/authMiddleware");

// Admin Dashboard
router.get("/", isAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude passwords
        res.render("admin", { users, success: req.query.success, error: req.query.error, user: req.session.user });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).render("error", { message: "Server Error", user: req.session.user });
    }
});

// Add New User
router.post("/add", isAdmin, async (req, res) => {
    const { username, password, isAdmin } = req.body;

    if (!username || !password) {
        return res.redirect("/admin?error=Username and password are required");
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.redirect("/admin?error=Username already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
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
