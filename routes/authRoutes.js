const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
    res.render("login", { user: req.session.user || null });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    if (username === "admin" && password === "password123") {
        req.session.user = { name: "Admin", role: "admin" };
        return res.redirect("/admin");
    }

    req.session.user = { name: username, role: "user" };
    res.redirect("/");
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

router.get("/signup", (req, res) => {
    res.render("signup", { user: req.session.user || null });
});

module.exports = router;
