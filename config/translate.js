const translate = require("google-translate-api-x");

/**
 * Translates a given text, object, or array containing text fields.
 * @param {Object|string|Array} data - The data to translate (can be a string, object, or array).
 * @param {string} targetLang - The target language code ("ru" or "en").
 * @returns {Promise<Object|string|Array>} - Translated text, object, or array.
 */
async function translateText(data, targetLang) {
    if (targetLang === "en") return data; // Skip translation if English

    try {
        if (typeof data === "string") {
            const res = await translate(data, { to: targetLang });
            return res.text;
        }

        if (Array.isArray(data)) {
            return Promise.all(data.map(item => translateText(item, targetLang)));
        }

        if (typeof data === "object" && data !== null) {
            const translatedEntries = await Promise.all(
                Object.entries(data).map(async ([key, value]) => {
                    if (typeof value === "string") {
                        return [key, await translateText(value, targetLang)];
                    }
                    return [key, value]; // Keep non-text fields as they are
                })
            );

            return Object.fromEntries(translatedEntries);
        }
    } catch (err) {
        console.error("❌ Translation error:", err);
    }

    return data; // Return original data if an error occurs
}

module.exports = translateText;
