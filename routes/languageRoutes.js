import express from "express";

const router = express.Router();

router.get("/set-language/:lang", (req, res) => {
    const { lang } = req.params;
    const supportedLanguages = ["en", "ru"];

    if (!supportedLanguages.includes(lang)) {
        return res.status(400).json({ error: "Invalid language selection" });
    }

    req.session.language = lang; // Save the selected language in session
    res.json({ success: `Language changed to ${lang}` });
});

export default router;
