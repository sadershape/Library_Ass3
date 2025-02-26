const Quiz = require("../models/Quiz");
const User = require("../models/User");

// Fetch quiz questions
exports.getQuizQuestions = async (req, res) => {
    try {
        const questions = await Quiz.aggregate([{ $sample: { size: 5 } }]);
        res.render("quiz", { questions, user: req.session.user });
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).render("error", { message: "Error fetching quiz questions" });
    }
};

// Validate answers and save results
exports.submitQuizAnswers = async (req, res) => {
    const { answers } = req.body;
    try {
        const questions = await Quiz.find({ _id: { $in: Object.keys(answers) } });
        let score = 0;

        questions.forEach((question) => {
            if (answers[question._id] === question.answer) {
                score++;
            }
        });

        // Save quiz result to user's profile
        if (req.session.user) {
            await User.updateOne(
                { _id: req.session.user._id },
                { $push: { quizResults: { score, date: new Date() } } }
            );
        }

        // Redirect to results page with score and totalQuestions
        res.redirect(`/quiz/result?score=${score}&totalQuestions=${questions.length}`);
    } catch (error) {
        console.error("Error submitting quiz answers:", error);
        res.render("results", { 
            score: null, 
            totalQuestions: 0, 
            message: "An error occurred while processing your quiz results."
        });
    }
};

// Display quiz results
exports.getQuizResults = async (req, res) => {
    const { score, totalQuestions } = req.query;
    const message = score >= (totalQuestions / 2)
        ? "Well done! You passed the quiz."
        : "Better luck next time! Keep practicing.";

    res.render("results", { 
        score, 
        totalQuestions, 
        message 
    });
};
