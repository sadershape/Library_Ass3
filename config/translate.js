const translate = require("@vitalets/google-translate-api");

const translateText = async (text, targetLanguage) => {
    if (!text) return "";
    try {
        const result = await translate(text, { to: targetLanguage });
        return result.text;
    } catch (error) {
        console.error("Translation Error:", error);
        return text; // Return original text on error
    }
};

module.exports = translateText;
