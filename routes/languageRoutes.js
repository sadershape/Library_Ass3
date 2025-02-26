import express from "express";

const router = express.Router();

// Translations for success messages
const messages = {
    en: { success: "Language changed to English" },
    ru: { success: "Язык изменен на русский" }
};

router.get("/set-language/:lang", (req, res) => {
    const { lang } = req.params;
    const supportedLanguages = ["en", "ru"];

    if (!supportedLanguages.includes(lang)) {
        return res.status(400).json({ error: "Invalid language selection" });
    }

    req.session.language = lang; // Save the selected language in session

    // Return JSON if requested via API, otherwise redirect back
    if (req.get("Accept") === "application/json") {
        res.json({ success: messages[lang].success });
    } else {
        req.session.success = messages[lang].success; // Flash message
        res.redirect(req.get("Referer") || "/");
    }
});

module.exports = router;

