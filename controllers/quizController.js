const Quiz = require("../models/Quiz");
const User = require("../models/User"); // Ensure the path to your User model is correct

// Fetch quiz questions
exports.getQuizQuestions = async (req, res) => {
    try {
        const questions = await Quiz.aggregate([{ $sample: { size: 5 } }]); // Randomize questions
        res.render("quiz", { questions, user: req.session.user }); // Render quiz.ejs with questions and user data
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).render("error", { message: "Error fetching quiz questions" });
    }
};

// Validate answers and save results
exports.submitQuizAnswers = async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers) {
            throw new Error("No answers provided.");
        }

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

        // Save quiz result to user's profile
        if (req.session.user) {
            await User.updateOne(
                { _id: req.session.user._id },
                { $push: { quizResults: quizResult } }
            );
        }

        const message = score >= (questions.length / 2)
            ? "Well done! You passed the quiz."
            : "Better luck next time! Keep practicing.";

        res.render("results", { 
            score, 
            totalQuestions: questions.length, 
            message 
        });
    } catch (error) {
        console.error("Error submitting quiz answers:", error);
        res.status(500).render("error", { 
            message: "An error occurred while processing your quiz results."
        });
    }
};
