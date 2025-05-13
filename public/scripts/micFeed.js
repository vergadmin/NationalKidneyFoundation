import { sendMessage } from "./message.js";
import { getPunctuatedText } from "./openAIRequests.js";
import {MakeAgentListen, unloadVideo, HideElement, ShowElement, PlayIdleVideo} from "./audioPlayback.js"

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioStream;
let recognition;
let liveTranscript = ""; // Variable to store transcribed text
let lastSpeechTime = Date.now(); // Track last speech timestamp
let silenceTimeout;

window.toggleMic = toggleMic;

export async function toggleMic() {
    const micButton = document.getElementById("mic-toggleButton");
    const params = new URLSearchParams(window.location.search);  

    HideElement("generatedVideo");
    ShowElement("chatgptVideo", "flex");
    MakeAgentListen();

    if (!isRecording) {
        try {
            // Request microphone access
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create MediaRecorder instance
            mediaRecorder = new MediaRecorder(audioStream);

            // Capture audio data
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            // When recording stops, create an audio element
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                const audioURL = URL.createObjectURL(audioBlob);
                const audioElement = document.getElementById("user-mic-audio");
                audioElement.src = audioURL;
                // Reset chunks for next recording
                audioChunks = [];

                let punctuatedText =  await getPunctuatedText(document.getElementById('user-input').value);
                punctuatedText = JSON.parse(punctuatedText.message);
                document.getElementById('user-input').value = punctuatedText.punctuated_text;
                
                unloadVideo();
                PlayIdleVideo();
                sendMessage();
                
                liveTranscript = "";
                document.getElementById('user-input').placeholder = "Type a message...";
            };

            // Start recording
            mediaRecorder.start();
            document.getElementById('user-input').placeholder = "Listening...";
            
            // Initialize SpeechRecognition
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';  // Set language
            recognition.continuous = true; // Keep recognizing while recording
            recognition.interimResults = true; // Show partial results live

            // Capture real-time transcription
            recognition.onresult = (event) => {
                let interimTranscript = "";
                let finalTranscript = "";
            
                // Loop through results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + " ";
                    } else {
                        interimTranscript += event.results[i][0].transcript + " ";
                    }
                }
            
                // Save final confirmed results (avoiding duplicates)
                if (finalTranscript) {
                    liveTranscript += finalTranscript;
                }
            
                // Normalize spaces and update textarea
                document.getElementById('user-input').value = (liveTranscript + interimTranscript).replace(/\s+/g, ' ').trim();
                document.getElementById('user-input').scrollTop = document.getElementById("user-input").scrollHeight;
            
                // Reset last speech timestamp
                lastSpeechTime = Date.now();
                resetSilenceTimer(); // Restart silence timer
            };
                        

            recognition.start(); // Start real-time transcription

            // Set up silence detection timer
            resetSilenceTimer();

            micButton.innerHTML = 
            `push to stop talking
            <span class="material-symbols-outlined" style="margin-left: 16px;">
            mic
            </span></button>`;
            isRecording = true;

        } catch (err) {
            console.error("Error accessing microphone: ", err);
            alert("Error accessing microphone. Please allow microphone access.");
        }
    } else {
        stopRecording();
        unloadVideo();
        // ShowElement("generatedVideo", "block");
        // // HideElement("chatgptVideo");
        PlayIdleVideo();
    }
}

// Function to stop recording
function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        audioStream.getTracks().forEach(track => track.stop());
    }

    if (recognition) {
        recognition.stop();
    }

    clearTimeout(silenceTimeout); // Clear silence detection timeout

    const micButton = document.getElementById("mic-toggleButton");
    micButton.innerHTML = 
    `push to talk
        <span class="material-symbols-outlined" style="margin-left: 16px;">
        mic_off
        </span></button>`;
    
    isRecording = false;
}

// Function to reset silence timer
function resetSilenceTimer() {
    clearTimeout(silenceTimeout);
    silenceTimeout = setTimeout(() => {
        const now = Date.now();
        if (now - lastSpeechTime >= 4000) { // Adjust threshold (4000ms = 4 seconds)
            stopRecording();
            unloadVideo();
            PlayIdleVideo();
        }
    }, 1000); // Check every 4 seconds
}