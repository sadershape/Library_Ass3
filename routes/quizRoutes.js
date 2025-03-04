const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const User = require("../models/User");

// Route to get quiz questions
router.get("/", async (req, res) => {
    try {
        const questions = await Quiz.aggregate([{ $sample: { size: 5 } }]);
        res.render("quiz", { questions, user: req.session.user });
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).render("error", { message: "Failed to load quiz questions." });
    }
});

// Route to submit quiz answers
router.post("/submit", async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers) {
            throw new Error("No answers provided.");
        }

        // Fetch correct answers from the database
        const questionIds = Object.keys(answers);
        const questions = await Quiz.find({ _id: { $in: questionIds } });

        let score = 0;
        questions.forEach((question) => {
            if (answers[question._id] === question.correctAnswer) {
                score++;
            }
        });

        const quizResult = {
            score,
            date: new Date()
        };

        // Save the result to the user's profile
        await User.findByIdAndUpdate(req.session.user._id, {
            $push: { quizResults: quizResult }
        });

        // Redirect to results page with score and total questions
        res.redirect(`/quiz/result?score=${score}&totalQuestions=${questions.length}`);
    } catch (error) {
        console.error("❌ Error submitting quiz:", error);
        res.status(500).render("error", { message: "Failed to submit quiz." });
    }
});

// Route to get quiz results
router.get("/result", async (req, res) => {
    const { score, totalQuestions } = req.query;
    const message = score >= (totalQuestions / 2)
        ? "Well done! You passed the quiz."
        : "Better luck next time! Keep practicing.";

    res.render("results", { 
        score, 
        totalQuestions, 
        message 
    });
});

module.exports = router;
