import { sendMessage } from "./message.js";

export function hideQuestionButtons() {
    const chatBoxContainer = document.getElementById('chat-box');
    const existingButtonContainer = chatBoxContainer.querySelector('.question-buttons-container');
    if (existingButtonContainer) {
        existingButtonContainer.style.display = 'none'; // Hides the container
    }
}


export async function createQuestionButtons(questions, InteractionType) {
    let chatBoxContainer = document.getElementById('chat-box');

    // Remove the old button container if it exists
    const existingButtonContainer = chatBoxContainer.querySelector('.question-buttons-container');
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Create a new button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "question-buttons-container"; // Add a class to target this container if needed

    // Fetch all "WhoShouldAnswer" responses concurrently
    const answers = await Promise.all(questions.map(async (question) => {
        return {
            question,
            whoShouldAnswer: "Alex"
        };
    }));

    // Process each question after fetching the responses
    answers.forEach(({ question, whoShouldAnswer }) => {
        const individualQuestionDiv = document.createElement("div");

        // individualQuestionDiv.style.marginBottom = "8px";

        const button = document.createElement("button");
        button.className = "question-button";
        button.innerHTML = question;

        // Add an event listener for the click event to call sendMessage(question)
        button.addEventListener("click", () => {
            sendMessage(button.innerText);
        });

        if(InteractionType == "NephrologistAndPatient"){
            const WhoWillAnswer = document.createElement("p");
            if(whoShouldAnswer == "Both"){
                whoShouldAnswer = "Alex & John";
            }
            individualQuestionDiv.style.marginTop = "-16px";
            WhoWillAnswer.innerText = whoShouldAnswer;
            WhoWillAnswer.classList.add("who-will-answer-indicator");
            individualQuestionDiv.appendChild(WhoWillAnswer);
        }

        individualQuestionDiv.appendChild(button);

        // Append the button to the container
        buttonContainer.appendChild(individualQuestionDiv);
    });

    // Append the new button container to the chatBoxContainer
    chatBoxContainer.appendChild(buttonContainer);
}