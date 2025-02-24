const translate = require("@vitalets/google-translate-api");

/**
 * Translates a given text or object containing text fields.
 * @param {Object|string} data - The data to translate (can be a string or object).
 * @param {string} targetLang - The target language code ("ru" or "en").
 * @returns {Promise<Object|string>} - Translated text or object.
 */
async function translateText(data, targetLang) {
    if (targetLang === "en") return data; // Skip translation if English

    if (typeof data === "string") {
        try {
            const res = await translate(data, { to: targetLang });
            return res.text;
        } catch (err) {
            console.error("Translation error:", err);
            return data; // Return original if translation fails
        }
    }

    if (typeof data === "object" && data !== null) {
        let translatedData = {};
        for (const key in data) {
            if (typeof data[key] === "string") {
                translatedData[key] = await translateText(data[key], targetLang);
            } else {
                translatedData[key] = data[key]; // Keep non-text fields as they are
            }
        }
        return translatedData;
    }

    return data; // Return as is for unsupported types
}

module.exports = translateText;
