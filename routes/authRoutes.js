import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // Import the User model

const router = express.Router();

// 🔹 Login Page Route
router.get("/login", (req, res) => {
    res.render("login", { user: req.session.user || null });
});

// 🔹 Login Route (Verifies Hashed Password & Role)
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send("Invalid username or password.");
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid username or password.");
        }

        // Save user session
        req.session.user = { id: user._id, username: user.username, role: user.role };

        console.log("Login successful:", req.session.user);

        // Redirect admins to admin panel, users to home
        return res.redirect(user.role === "admin" ? "/admin" : "/");
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Internal server error.");
    }
});

// 🔹 Registration Page Route
router.get("/register", (req, res) => {
    res.render("register", { user: req.session.user || null });
});

// 🔹 Registration Route (Uses Hashed Passwords & Ensures Role)
router.post("/register", async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send("Username already exists.");
        }

        // Hash the password before saving to DB
        const hashedPassword = await bcrypt.hash(password, 10);

        // Ensure role is valid (default to "user")
        const assignedRole = role === "admin" ? "admin" : "user";

        // Prevent non-admins from creating admin accounts (optional security)
        // if (role === "admin" && !req.session.user?.isAdmin) {
        //     return res.status(403).send("You are not authorized to create an admin account.");
        // }

        // Create new user
        const newUser = new User({ username, password: hashedPassword, role: assignedRole });
        await newUser.save();

        console.log("New user registered:", newUser);

        // Auto-login after registration
        req.session.user = { id: newUser._id, username: newUser.username, role: newUser.role };

        // Redirect based on role
        res.redirect(newUser.role === "admin" ? "/admin" : "/");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Internal server error.");
    }
});

// 🔹 Logout Route (Destroys Session)
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Error logging out.");
        }
        res.redirect("/");
    });
});

module.exports = router;

