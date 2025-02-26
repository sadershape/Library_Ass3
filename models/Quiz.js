const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
    correctAnswer: { type: String, required: true } // Add correctAnswer field
});

module.exports = mongoose.model("Quiz", quizSchema);
