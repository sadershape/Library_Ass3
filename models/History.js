const mongoose = require("mongoose");


const HistorySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    action: String,
    data: Object,
    timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model("History", HistorySchema);
module.exports = History;
