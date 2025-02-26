const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");

// Route to get quiz questions
router.get("/", quizController.getQuizQuestions);

// Route to submit quiz answers
router.post("/submit", async (req, res) => {
    try {
        const { answers } = req.body;

        // Fetch correct answers from the database
        const questionIds = Object.keys(answers);
        const questions = await Quiz.find({ _id: { $in: questionIds } });

        let score = 0;
        questions.forEach((question) => {
            if (answers[question._id] === question.correctAnswer) {
                score++;
            }
        });

        const quizResult = new QuizResult({
            user: req.session.user._id,
            score,
            totalQuestions: questions.length,
            completedInTime: true
        });

        await quizResult.save();

        // Save the result to the user's profile
        await User.findByIdAndUpdate(req.session.user._id, {
            $push: { quizResults: quizResult._id }
        });

        res.redirect("/quiz/result");
    } catch (error) {
        console.error("❌ Error submitting quiz:", error);
        res.status(500).render("error", { message: "Failed to submit quiz." });
    }
});

// Route to get quiz results
router.get("/result", async (req, res) => {
    try {
        const results = await QuizResult.find({ user: req.session.user._id }).sort({ date: -1 }).limit(5);
        res.render("quizResult", { results, user: req.session.user });
    } catch (error) {
        console.error("❌ Error fetching quiz results:", error);
        res.status(500).render("error", { message: "Failed to load quiz results." });
    }
});

module.exports = router;
