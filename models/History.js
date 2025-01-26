const mongoose = require("mongoose");
const HistorySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    action: String,
    data: Object,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", HistorySchema);
