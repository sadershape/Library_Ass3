const mongoose = require("mongoose");


const AdminSectionSchema = new mongoose.Schema({
    title_en: { type: String, required: true },
    title_ru: { type: String, required: true },
    content_en: { type: String, required: true },
    content_ru: { type: String, required: true },
    image: { type: String, required: true }
});

module.exports = mongoose.model("AdminSection", AdminSectionSchema);
