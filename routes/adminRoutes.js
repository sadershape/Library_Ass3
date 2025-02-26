const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Ensure this path is correct
const Item = require("../models/Item"); // Ensure this path is correct
const User = require("../models/User");
const Item = require("../models/Item");

const router = express.Router();

// Admin Dashboard
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
        res.render("admin", { users, items, success: req.flash("success"), error: req.flash("error") });
        res.render("admin", { users, items });
    } catch (err) {
        req.flash("error", "Error loading admin dashboard.");
        req.session.flash = { error: "Error loading admin dashboard." };
        res.redirect("/");
    }
});
@@ -22,25 +32,24 @@
    try {
        const { username, password, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        

        const newUser = new User({ username, password: hashedPassword, isAdmin: isAdmin === "on" });
        await newUser.save();

        req.flash("success", "User added successfully.");
        res.redirect("/admin");
        req.session.flash = { success: "User added successfully." };
    } catch (err) {
        req.flash("error", "Failed to add user.");
        res.redirect("/admin");
        req.session.flash = { error: "Failed to add user." };
    }
    res.redirect("/admin");
});

// 🔹 DELETE USER
router.post("/delete/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        req.flash("success", "User deleted.");
        req.session.flash = { success: "User deleted." };
    } catch (err) {
        req.flash("error", "Failed to delete user.");
        req.session.flash = { error: "Failed to delete user." };
    }
    res.redirect("/admin");
});
@@ -76,22 +85,22 @@
        });

        await newItem.save();
        req.flash("success", "Item added successfully.");
        req.session.flash = { success: "Item added successfully." };
    } catch (err) {
        req.flash("error", "Failed to add item.");
        req.session.flash = { error: "Failed to add item." };
    }
    res.redirect("/admin");
});

// 🔹 EDIT ITEM (Only name & description)
// 🔹 EDIT ITEM
router.post("/items/edit/:id", async (req, res) => {
    try {
        const { name_en, name_other, description_en, description_other } = req.body;

        await Item.findByIdAndUpdate(req.params.id, { name_en, name_other, description_en, description_other });
        req.flash("success", "Item updated.");
        req.session.flash = { success: "Item updated." };
    } catch (err) {
        req.flash("error", "Failed to update item.");
        req.session.flash = { error: "Failed to update item." };
    }
    res.redirect("/admin");
});
@@ -100,11 +109,11 @@
router.post("/items/delete/:id", async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        req.flash("success", "Item deleted.");
        req.session.flash = { success: "Item deleted." };
    } catch (err) {
        req.flash("error", "Failed to delete item.");
        req.session.flash = { error: "Failed to delete item." };
    }
    res.redirect("/admin");
});

module.exports = router;
