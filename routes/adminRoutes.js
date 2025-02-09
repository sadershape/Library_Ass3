const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Item = require("../models/Item");  // Import the Item model
const bcrypt = require("bcryptjs");
const { isAdmin } = require("../middleware/authMiddleware");

// 📌 Admin Dashboard - Show Users and Items
router.get("/", isAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude passwords
        const items = await Item.find();
        res.render("admin", { users, items, success: req.query.success, error: req.query.error, user: req.session.user });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
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
        console.error("Item Add Error:", error);
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
        console.error("Item Edit Error:", error);
        res.redirect("/admin?error=Error updating item");
    }
});

// 📌 Delete Item
router.post("/items/delete/:id", isAdmin, async (req, res) => {
    try {
        await Item.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
        res.redirect("/admin?success=Item deleted successfully");
    } catch (error) {
        console.error("Item Deletion Error:", error);
        res.redirect("/admin?error=Error deleting item");
    }
});

module.exports = router;
