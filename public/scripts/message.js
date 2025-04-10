import { hideQuestionButtons, createQuestionButtons } from "/scripts/suggestedQuestions.js";
import { getNephrologistResponse, getRedactedText, getBoldedQuestions, OpenAIChatCheckTopic, OpenAINephrologistFormattedMessage} from "/scripts/openAIRequests.js"
import {playOnTtsAudioPlayer} from "/scripts/audioPlayback.js"

window.sendMessage = sendMessage;

const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const micButton = document.getElementById('mic-toggleButton');
const chatBox = document.getElementById('chat-box');

    // JavaScript function to trigger when the user hits Enter after typing in the input field
    document.getElementById("user-input").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
  
  document.getElementById("user-input").addEventListener("input", function() {
    if (this.value.trim() === "") {
        sendButton.disabled = true;
    } else {
        sendButton.disabled = false;
    }
  });


function enableInput() {
    userInput.disabled = false;
    sendButton.disabled = false;
    micButton.disabled = false;
}

function disableInput() {
    userInput.disabled = true;
    sendButton.disabled = true;
    micButton.disabled = true;
}

function clearUserInput(){
    userInput.value = ''; // Clear input field after sending message
}

function ChangeTicksAndColor(UserMessageElement, Variation) {
    const child = UserMessageElement.querySelector('.user-message-tick');
    if (Variation == "SecondTick") {
        child.innerText = "\u2713\u2713"
    }
    if (Variation == "Color") {
        child.style.setProperty('color', '#4860d9');
    }
}

let LastUserMessageDiv;

function appendLoadingDots(name, MessageType) {
    const ellipse = document.createElement('div');
    ellipse.className = "lds-ellipsis";
    ellipse.setAttribute('id', "lds-ellipsis");

    const l1 = document.createElement('div');
    const l2 = document.createElement('div');
    const l3 = document.createElement('div');

    ellipse.appendChild(l1);
    ellipse.appendChild(l2);
    ellipse.appendChild(l3);

    // Create the "name is typing..." text element
    const typingText = document.createElement('span');
    typingText.className = "typing-text";
    if (MessageType == "text") {
        typingText.textContent = `${name} is typing`;
    }
    else if (MessageType == "audio") {
        typingText.textContent = `${name} is recording an audio message`;
    }
    else if(MessageType == "video"){
        typingText.textContent = ``;
    }

    // Wrap the dots and text in a container
    const container = document.createElement('div');
    container.className = "typing-indicator";
    container.setAttribute('id', "typingIndicator");
    // container.style.setProperty('overflow', 'hidden');

    container.appendChild(typingText);
    container.appendChild(ellipse);

    const chatBox = document.getElementById('chat-box');
    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

function removeLoadingDots() {
    const typingIdicator = document.getElementById('typingIndicator');
    if (typingIdicator) {
        typingIdicator.remove();
    }
}

export function appendUserMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    const labelText = document.createElement('span');
    labelText.className = "label-text";
    const messageText = document.createElement('span');
    const messageTick = document.createElement('span');

    labelText.innerText = `You`;
    messageText.innerText = `${message}`;
    messageText.style.setProperty('min-width', '50px');
    messageTick.innerText = "\u2713";
    messageTick.className = "user-message-tick";
    messageTick.style.setProperty('margin-left', '12px');
    messageTick.style.setProperty('margin-top', 'auto');
    messageTick.style.setProperty('font-weight', '900');
    messageTick.style.setProperty('color', '#bdbdbd');

    const innerMessageElement = document.createElement('div');
    innerMessageElement.style.setProperty('display', 'flex');
    innerMessageElement.style.setProperty('flex-direction', 'row');

    messageElement.className = "user-message"
    messageElement.appendChild(labelText);

    innerMessageElement.appendChild(messageText);
    innerMessageElement.appendChild(messageTick);

    messageElement.appendChild(innerMessageElement);


    chatBox.appendChild(messageElement);

    LastUserMessageDiv = messageElement;

    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}


export async function sendMessage(Buttontext) {

    let InteractionType = "NephrologistOnly";

    var userMessage
    if (!Buttontext) {
        userMessage = userInput.value;
    }
    else {
        userMessage = Buttontext;
    }

    if (userMessage !== '') {
        disableInput();
        hideQuestionButtons();
        let redactedText = await getRedactedText(userMessage);
        redactedText = JSON.parse(redactedText.message);
        userMessage = redactedText.redacted_text;
        // let punctuatedText =  await getPunctuatedText(redactedText.redacted_text);
        // punctuatedText = JSON.parse(punctuatedText.message);
        // userMessage = punctuatedText.punctuated_text;
        appendUserMessage(userMessage);

        let ConversationLog;

        if (sessionStorage.getItem("ConversationLog") === null) {
            ConversationLog = []
        }
        else {
            ConversationLog = JSON.parse(sessionStorage.getItem("ConversationLog"));
        }

        let ThisMessageJSON = {};
        ThisMessageJSON.userMessage = userMessage;
        ConversationLog.push(ThisMessageJSON);

        let follow_up_questions;
        let sources;

        await AlexReplies(InteractionType);

        ChangeTicksAndColor(LastUserMessageDiv, "SecondTick");


        ChangeTicksAndColor(LastUserMessageDiv, "Color");

        // chatGPTReply = JSON.parse(data.message);
        // console.log(chatGPTReply)

        // appendAlexMessage(chatGPTReply.answer);

        sessionStorage.setItem("ConversationLog", JSON.stringify(ConversationLog));
        console.log(JSON.parse(sessionStorage.getItem("ConversationLog")));

        // if(sources){
        // createSourceButtons(sources);
        // }

        // if (follow_up_questions) {
        //     let boldedQuestions = await getBoldedQuestions(follow_up_questions);
        //     follow_up_questions = JSON.parse(boldedQuestions.message).questions;
        //     await createQuestionButtons(follow_up_questions, InteractionType);
        // }

        const chatBox = document.getElementById('chat-box');
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom

        enableInput();
        clearUserInput();

        async function AlexReplies(InteractionType) {
                appendLoadingDots("Alex", "video");

                let IsRelated = await OpenAIChatCheckTopic(ConversationLog);
                IsRelated = JSON.parse(IsRelated.message)

                console.log(IsRelated.isRelated)

                if(IsRelated.isRelated === "No"){
                    removeLoadingDots();

                    var formattedMessage = formatMessageMarkdown(IsRelated.reply);

                    var finalFormattedText = await OpenAINephrologistFormattedMessage(formattedMessage);
                    var message = JSON.parse(finalFormattedText.message);

                    await playOnTtsAudioPlayer(message.formattedNephrologistResponse, "Nephrologist");
    
                    ThisMessageJSON.NephrologistResponse = message.formattedNephrologistResponse;
                    ConversationLog[ConversationLog.length - 1] = ThisMessageJSON;
                    follow_up_questions = "";
                    sources = "";
                }
                else{

                    let data = await getNephrologistResponse(ConversationLog, InteractionType);
                    let NephrologistResponse = JSON.parse(data.message);

                    var formattedMessage = formatMessageMarkdown(NephrologistResponse.answer);

                    var finalFormattedText = await OpenAINephrologistFormattedMessage(formattedMessage);
                    var message = JSON.parse(finalFormattedText.message);

                    removeLoadingDots();
                    await playOnTtsAudioPlayer(message.formattedNephrologistResponse, "Nephrologist");

                    ThisMessageJSON.NephrologistResponse = message.formattedNephrologistResponse;
                    ConversationLog[ConversationLog.length - 1] = ThisMessageJSON;
                    follow_up_questions = NephrologistResponse.follow_up_questions;
                    sources = NephrologistResponse.sources;
                }
        }
    }
}

export function streamPatientAudio(InputMessage) {
    if (!InputMessage) {
        console.error("No input message provided.");
        return;
    }

    // Create an audio element
    const audioElement = document.getElementById("tts-audio-player");
    
    // Set the audio source to the backend streaming URL with the message as a query parameter
    audioElement.src = `/OpenAIVoicePatient?Message=${encodeURIComponent(InputMessage)}`;

    // Auto-play once it starts loading
    audioElement.play().catch((error) => console.error("Playback error:", error));

    return audioElement;
}


// Async function to append Alex's message
export async function appendAlexMessage(message, typingSpeed = 15, isVideo = false) {
    const messageElement = document.createElement('div');
    const labelText = document.createElement('span');
    labelText.className = "label-text";
    const messageText = document.createElement('span');

    const avatarImg = document.createElement('img');
    var type = document.body.getAttribute("type-variable");
    avatarImg.src = `/profile_pics/${type}.png`; // Replace with your image path
    avatarImg.alt = 'Alex';
    avatarImg.className = 'alex-icon pulse-orange';
    if(isVideo){
        avatarImg.classList.add("alex-icon-video");
    }

    labelText.innerText = `Dr. Alex`;
    messageText.innerHTML = ``;

    messageElement.className = "chatbot-message"
    messageElement.appendChild(labelText);
    messageElement.appendChild(messageText);

    const alexMessage = document.createElement('div');
    alexMessage.className = "alex-message-item"

    alexMessage.appendChild(avatarImg)
    alexMessage.appendChild(messageElement);

    // Add the message container to the chat box
    chatBox.appendChild(alexMessage);

    // Wait for the typing effect to finish
    await typeWriter(message, messageText, typingSpeed);
}



function typeWriter(message, element, speed) {
    return new Promise(resolve => {
        let currentText = '';
        let i = 0;

        // Tokenize message into text + tags
        const tokens = [];
        const tagRegex = /<\/?[^>]+>/g;
        let lastIndex = 0;
        let match;

        while ((match = tagRegex.exec(message)) !== null) {
            if (match.index > lastIndex) {
                tokens.push({ type: 'text', content: message.slice(lastIndex, match.index) });
            }
            tokens.push({ type: 'tag', content: match[0] });
            lastIndex = tagRegex.lastIndex;
        }
        if (lastIndex < message.length) {
            tokens.push({ type: 'text', content: message.slice(lastIndex) });
        }

        let tokenIndex = 0;
        let charIndex = 0;

        function type() {
            if (tokenIndex >= tokens.length) {
                resolve();
                return;
            }

            const token = tokens[tokenIndex];

            if (token.type === 'tag') {
                currentText += token.content;
                element.innerHTML = currentText;
                tokenIndex++;
                setTimeout(type, 0); // Continue immediately with next token
            } else {
                // Type one character from the current text token
                currentText += token.content[charIndex];
                element.innerHTML = currentText;
                charIndex++;

                if (charIndex >= token.content.length) {
                    tokenIndex++;
                    charIndex = 0;
                }

                setTimeout(type, speed);
            }

            const chatBox = document.getElementById('chat-box');
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        type();
    });
}

function formatMessageMarkdown(message) {
    // Convert **bold** to <strong>
    let formatted = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    formatted = formatted.replace(
        /\(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\)\n*/g,
        '<a href="$2" target="_blank">[$1]</a><br><br>'
    );

    // Convert remaining \n to <br>
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

