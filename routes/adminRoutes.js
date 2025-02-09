const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const Item = require("../models/Item"); // Import the Item model
const { isAdmin } = require("../middleware/authMiddleware"); // Admin middleware

// 📌 Admin Dashboard - Show Users and Items
router.get("/", isAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude passwords
        const items = await Item.find({ deletedAt: null }); // Only show active items

        res.render("admin", { 
            users, 
            items, 
            success: req.query.success, 
            error: req.query.error, 
            user: req.session.user 
        });
    } catch (error) {
        console.error("❌ Admin Dashboard Error:", error);
        res.status(500).render("error", { message: "Server Error", user: req.session.user });
    }
});

// 📌 Add New Item
router.post("/items/add", isAdmin, async (req, res) => {
    const { name_en, name_other, description_en, description_other, image1, image2, image3 } = req.body;

    if (!name_en || !name_other || !description_en || !description_other || !image1 || !image2 || !image3) {
        return res.redirect("/admin?error=All fields are required");
    }

    try {
        const newItem = new Item({
            images: [image1, image2, image3],
            name_en,
            name_other,
            description_en,
            description_other,
            createdAt: new Date()
        });

        await newItem.save();
        res.redirect("/admin?success=Item added successfully");
    } catch (error) {
        console.error("❌ Item Add Error:", error);
        res.redirect("/admin?error=Error adding item");
    }
});

// 📌 Edit Item
router.post("/items/edit/:id", isAdmin, async (req, res) => {
    const { name_en, name_other, description_en, description_other, image1, image2, image3 } = req.body;

    try {
        await Item.findByIdAndUpdate(req.params.id, {
            images: [image1, image2, image3],
            name_en,
            name_other,
            description_en,
            description_other,
            updatedAt: new Date()
        });

        res.redirect("/admin?success=Item updated successfully");
    } catch (error) {
        console.error("❌ Item Edit Error:", error);
        res.redirect("/admin?error=Error updating item");
    }
});

// 📌 Soft Delete Item
router.post("/items/delete/:id", isAdmin, async (req, res) => {
    try {
        await Item.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
        res.redirect("/admin?success=Item deleted successfully");
    } catch (error) {
        console.error("❌ Item Deletion Error:", error);
        res.redirect("/admin?error=Error deleting item");
    }
});

// 📌 Admin Login
router.get("/login", (req, res) => {
    res.render("login", { user: req.session.user || null });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in database
        const user = await User.findOne({ username });
        if (!user) return res.status(401).send("❌ Invalid username or password");

        // Compare passwords securely
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("❌ Invalid username or password");

        // Store user session with role
        req.session.user = { id: user._id, username: user.username, role: user.role };

        console.log("✅ Login successful:", req.session.user);

        // Redirect admin to /admin, users to home
        if (user.role === "admin") {
            return res.redirect("/admin");
        } else {
            return res.redirect("/");
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).send("❌ Internal server error");
    }
});

// 📌 Admin Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
