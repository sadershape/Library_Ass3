const express = require("express");
const QuizResult = require("../models/QuizResult");
const router = express.Router();
const quizController = require("../controllers/quizController");

// Route to get quiz questions
router.get("/", quizController.getQuizQuestions);

// Route to submit quiz answers
router.post("/submit", async (req, res) => {
    try {
        const { answers } = req.body;
        const correctAnswers = {
            "What is the capital of France?": "Paris",
            "Which planet is known as the Red Planet?": "Mars",
            "What is 5 + 3?": "8",
            "Who wrote 'To Kill a Mockingbird'?": "Harper Lee",
            "What is the largest ocean on Earth?": "Pacific"
        };

        let score = 0;
        for (let question in answers) {
            if (answers[question] === correctAnswers[question]) {
                score++;
            }
        }

        const quizResult = new QuizResult({
            user: req.session.user._id,
            score,
            totalQuestions: Object.keys(answers).length,
            completedInTime: true
        });

        await quizResult.save();
        res.redirect("/quiz/result");
    } catch (error) {
        console.error("❌ Error submitting quiz:", error);
        res.status(500).render("error", { message: "Failed to submit quiz." });
    }
});

module.exports = router;
