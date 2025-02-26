const express = require("express");
const QuizResult = require("../models/QuizResult");
const router = express.Router();

// ✅ Get Randomized Quiz Questions
router.get("/", async (req, res) => {
    try {
        const questions = [
            { question: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Rome"], answer: "Paris" },
            { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars" },
            { question: "What is 5 + 3?", options: ["5", "8", "12", "15"], answer: "8" },
            { question: "Who wrote 'To Kill a Mockingbird'?", options: ["Harper Lee", "J.K. Rowling", "George Orwell", "Mark Twain"], answer: "Harper Lee" },
            { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific" }
        ];

        // Shuffle questions for randomness
        const shuffledQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 3);

        res.render("quiz", { questions: shuffledQuestions, user: req.session.user });
    } catch (error) {
        console.error("❌ Error fetching quiz questions:", error);
        res.status(500).render("error", { message: "Failed to load quiz questions." });
    }
});

// ✅ Submit Quiz and Save Results
router.post("/submit", async (req, res) => {
    try {
        const { user, answers, totalQuestions, completedInTime } = req.body;

        if (!user || !answers) {
            return res.status(400).json({ error: "User and answers are required." });
        }

        let score = 0;
        const correctAnswers = {
            "What is the capital of France?": "Paris",
            "Which planet is known as the Red Planet?": "Mars",
            "What is 5 + 3?": "8",
            "Who wrote 'To Kill a Mockingbird'?": "Harper Lee",
            "What is the largest ocean on Earth?": "Pacific"
        };

        for (let [question, answer] of Object.entries(answers)) {
            if (correctAnswers[question] === answer) {
                score++;
            }
        }

        const quizResult = new QuizResult({
            user,
            score,
            totalQuestions,
            completedInTime
        });

        await quizResult.save();
        console.log("✅ Quiz result saved:", quizResult);
        res.redirect("/quiz/result");
    } catch (error) {
        console.error("❌ Error submitting quiz:", error);
        res.status(500).render("error", { message: "Failed to submit quiz." });
    }
});

// ✅ View Quiz Results
router.get("/result", async (req, res) => {
    try {
        const results = await QuizResult.find({ user: req.session.user?._id }).sort({ timestamp: -1 }).limit(5);
        res.render("quizResult", { results, user: req.session.user });
    } catch (error) {
        console.error("❌ Error fetching quiz results:", error);
        res.status(500).render("error", { message: "Failed to load quiz results." });
    }
});

module.exports = router;
