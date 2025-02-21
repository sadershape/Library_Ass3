const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Item = require("../models/Item");

const router = express.Router();

// Middleware to handle flash messages
const flashMiddleware = (req, res, next) => {
    res.locals.success = req.session.flash?.success || null;
    res.locals.error = req.session.flash?.error || null;
    req.session.flash = {}; // Clear flash messages after being used
    next();
};

router.use(flashMiddleware);

// 🔹 Admin Dashboard
router.get("/", async (req, res) => {
    try {
        const users = await User.find({});
        const items = await Item.find({});
        res.render("admin", { users, items });
    } catch (err) {
        req.session.flash = { error: "Error loading admin dashboard." };
        res.redirect("/");
    }
});

// 🔹 ADD NEW USER
router.post("/add", async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword, isAdmin: isAdmin === "on" });
        await newUser.save();

        req.session.flash = { success: "User added successfully." };
    } catch (err) {
        req.session.flash = { error: "Failed to add user." };
    }
    res.redirect("/admin");
});

// 🔹 DELETE USER
router.post("/delete/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        req.session.flash = { success: "User deleted." };
    } catch (err) {
        req.session.flash = { error: "Failed to delete user." };
    }
    res.redirect("/admin");
});

// 🔹 UPDATE USER PASSWORD
router.post("/users/update-password/:id", async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });

        res.status(200).json({ success: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update password." });
    }
});

// 🔹 ADD NEW ITEM
router.post("/items/add", async (req, res) => {
    try {
        const { name_en, name_other, description_en, description_other, image1, image2, image3 } = req.body;

        const newItem = new Item({
            name_en,
            name_other,
            description_en,
            description_other,
            images: [image1, image2, image3]
        });

        await newItem.save();
        req.session.flash = { success: "Item added successfully." };
    } catch (err) {
        req.session.flash = { error: "Failed to add item." };
    }
    res.redirect("/admin");
});

// 🔹 EDIT ITEM
router.post("/items/edit/:id", async (req, res) => {
    try {
        const { name_en, name_other, description_en, description_other } = req.body;

        await Item.findByIdAndUpdate(req.params.id, { name_en, name_other, description_en, description_other });
        req.session.flash = { success: "Item updated." };
    } catch (err) {
        req.session.flash = { error: "Failed to update item." };
    }
    res.redirect("/admin");
});

// 🔹 DELETE ITEM
router.post("/items/delete/:id", async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        req.session.flash = { success: "Item deleted." };
    } catch (err) {
        req.session.flash = { error: "Failed to delete item." };
    }
    res.redirect("/admin");
});

module.exports = router;
