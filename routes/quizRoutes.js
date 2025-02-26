const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz"); // Ensure the path is correct for your project
const QuizResult = require("../models/QuizResult"); // Ensure the path is correct for your project

// ✅ Get Randomized Quiz Questions
router.get("/", async (req, res) => {
    try {
        // Fetch quiz questions from the database and shuffle them
        const questions = await Quiz.aggregate([{ $sample: { size: 5 } }]); // Adjust the sample size as needed

        res.render("quiz", { questions, user: req.session.user });
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
        // Fetch all questions and answers from the database
        const questions = await Quiz.find({});
        const correctAnswers = {};

        // Create a map of question to correct answer
        questions.forEach(question => {
            correctAnswers[question.question] = question.answer;
        });

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
