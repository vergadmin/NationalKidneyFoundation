import {appendAlexMessage} from "./message.js";

export async function playOnTtsAudioPlayer(InputMessage, WhoIsIt) {
    // Get the source from the provided audio element
    let source;

    function removeParenthesesContent(input) {
        return input.replace(/<[^>]*>|\[.*?\]/g, '');
    }

    var MessageStrippedCitations = removeParenthesesContent(InputMessage);

    if (WhoIsIt === "Nephrologist") {
        // source = `/ElevenLabsVoiceNephrologistStream?Message=${encodeURIComponent(InputMessage)}`;
        source = `/OpenAIVoiceNephrologistStream?Message=${encodeURIComponent(MessageStrippedCitations)}`;
    } else if (WhoIsIt === "Ex-patient") {
        source = `/OpenAIVoicePatientStream?Message=${encodeURIComponent(MessageStrippedCitations)}`;
    }

    if (!source) {
        console.error("No valid audio source found.");
        return;
    }

    // Get the target audio player
    const ttsAudioPlayer = document.getElementById("tts-audio-player");

    if (!ttsAudioPlayer) {
        console.error("Target audio player not found.");
        return;
    }

    // Set the source
    ttsAudioPlayer.src = source;

    try {
        HideElement("generatedVideo");

        await ttsAudioPlayer.play(); // Wait for the audio to start playing
        console.log("Audio started playing...");
        
        ShowElement("chatgptVideo", "flex");
        await loadWallaVideo(WhoIsIt);
        
        if (WhoIsIt === "Nephrologist") {
            appendAlexMessage(InputMessage, 80, true);
        } else if (WhoIsIt === "Ex-patient") {
            appendJohnMessage(InputMessage, 80, true);
        }

        // Wait for the audio to finish playing
        await new Promise((resolve) => {
            ttsAudioPlayer.onended = resolve;
        });

        console.log("Audio playback finished.");
        unloadVideo();
        PlayIdleVideo();
        
    } catch (error) {
        console.error("Error playing audio:", error);
    }
}

async function loadWallaVideo() {
    try {
        let VideoPlayer;
        VideoPlayer = document.getElementById("chatgptVideo");
        VideoPlayer.src = `https://national-kidney-foundation.s3.amazonaws.com/${type}/Alex_Walla.mp4`;
        VideoPlayer.loop = true;
        await VideoPlayer.play(); // Ensure it starts playing properly
    } catch (error) {
        console.error("Error loading or playing video:", error);
    }
}

export async function unloadVideo(){
    let VideoPlayer;
    VideoPlayer = document.getElementById("chatgptVideo");
    VideoPlayer.pause();  // Pause the video
    VideoPlayer.src = "";  // Remove the video source
    VideoPlayer.load();  // Reset the video
}

export async function MakeAgentListen(){
    try {
        let VideoPlayer;
        VideoPlayer = document.getElementById("chatgptVideo");
        VideoPlayer.src = `https://national-kidney-foundation.s3.amazonaws.com/${type}/Alex_Listening.mp4`;
        VideoPlayer.loop = true;
        await VideoPlayer.play(); // Ensure it starts playing properly
    } catch (error) {
        console.error("Error loading or playing video:", error);
    }
}

export function HideElement(idName){
    document.getElementById(idName).style.display = "none";
  }
  
export function ShowElement(idName, displayType){
    document.getElementById(idName).style.display = displayType;
  }

export function PlayIdleVideo(){
    HideElement("generatedVideo");
    ShowElement('chatgptVideo', "flex");
    chatbotVideo.src = `https://national-kidney-foundation.s3.amazonaws.com/${type}/chatbotIdleVideo.mp4`;
    chatbotVideo.loop = true;
    chatbotVideo.play();
  }