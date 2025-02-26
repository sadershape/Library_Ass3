require("dotenv").config();
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz"); // Adjust the path to your Quiz model

const sampleQuestions = [
    {
        question: "What is the capital of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        answer: "Paris",
        correctAnswer: "Paris" // Add the correctAnswer field
    },
    {
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Jupiter", "Saturn", "Mars"],
        answer: "Jupiter",
        correctAnswer: "Jupiter" // Add the correctAnswer field
    },
    {
        question: "Who wrote 'To Kill a Mockingbird'?",
        options: ["Harper Lee", "J.K. Rowling", "Mark Twain", "Ernest Hemingway"],
        answer: "Harper Lee",
        correctAnswer: "Harper Lee" // Add the correctAnswer field
    },
    {
        question: "What is the smallest prime number?",
        options: ["1", "2", "3", "5"],
        answer: "2",
        correctAnswer: "2" // Add the correctAnswer field
    },
    {
        question: "In which year did the Titanic sink?",
        options: ["1912", "1905", "1898", "1923"],
        answer: "1912",
        correctAnswer: "1912" // Add the correctAnswer field
    }
];

const populateQuizzes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Quiz.insertMany(sampleQuestions);
        console.log("✅ Quizzes collection populated with sample questions.");

        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error populating quizzes collection:", error);
        mongoose.connection.close();
    }
};

populateQuizzes();
