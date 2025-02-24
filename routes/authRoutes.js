import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // Import the User model

const router = express.Router();

// 📌 Login Page Route
router.get("/login", (req, res) => {
    res.render("login", { user: req.session.user || null });
});

// 📌 Fixed Login Route (Uses Hashed Passwords & Admin Role)
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in database
        const user = await User.findOne({ username });
        if (!user) return res.status(401).send("❌ Invalid username or password");

        // ✅ Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("❌ Invalid username or password");

        // ✅ Save user session with correct role
        req.session.user = { id: user._id, username: user.username, role: user.role };

        console.log("✅ Login successful:", req.session.user);

        // ✅ Redirect admins to admin panel, users to home
        return res.redirect(user.role === "admin" ? "/admin" : "/");
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).send("❌ Internal server error");
    }
});

// 📌 Registration Page Route
router.get("/register", (req, res) => {
    res.render("register", { user: req.session.user || null });
});

// 📌 Fixed Registration Route (Uses Hashed Passwords & Supports Roles)
router.post("/register", async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).send("⚠️ Username already exists");

        // ✅ Hash the password before saving to DB
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Ensure role is "admin" only if specified (default is "user")
        const newUser = new User({ username, password: hashedPassword, role: role || "user" });
        await newUser.save();

        console.log("✅ New user registered:", newUser);

        // ✅ Log the user in after registration
        req.session.user = { id: newUser._id, username: newUser.username, role: newUser.role };

        // ✅ Redirect admins to `/admin`, users to `/`
        res.redirect(newUser.role === "admin" ? "/admin" : "/");
    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).send("❌ Internal server error");
    }
});

// 📌 Logout Route - Ends Session
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

export default router; // ✅ Use `export default` instead of `module.exports`
