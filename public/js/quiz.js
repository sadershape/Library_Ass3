document.addEventListener("DOMContentLoaded", () => {
    const timeLimit = 60; // Time limit in seconds
    let timeLeft = timeLimit;
    const timerElement = document.getElementById("timer");

    const updateTimer = () => {
        if (timeLeft <= 0) {
            document.getElementById("quiz-form").submit();
        } else {
            timerElement.textContent = timeLeft + " seconds";
            timeLeft--;
        }
    };

    setInterval(updateTimer, 1000);

    // Fetch quiz questions
    fetch("/quiz")
        .then(response => response.json())
        .then(questions => {
            const quizQuestions = document.getElementById("quiz-questions");
            questions.forEach((question, index) => {
                const questionDiv = document.createElement("div");
                questionDiv.classList.add("quiz-question");

                const questionLabel = document.createElement("label");
                questionLabel.textContent = question.question;
                questionDiv.appendChild(questionLabel);

                question.options.forEach(option => {
                    const optionInput = document.createElement("input");
                    optionInput.type = "radio";
                    optionInput.name = `question_${question._id}`;
                    optionInput.value = option;
                    optionInput.required = true;

                    const optionLabel = document.createElement("label");
                    optionLabel.textContent = option;

                    questionDiv.appendChild(optionInput);
                    questionDiv.appendChild(optionLabel);
                });

                quizQuestions.appendChild(questionDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching quiz questions:", error);
            const quizQuestions = document.getElementById("quiz-questions");
            quizQuestions.innerHTML = "<p>Error loading quiz. Please try again later.</p>";
        });
});
