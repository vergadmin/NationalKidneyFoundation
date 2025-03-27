import {appendAlexMessage} from "./message.js";

export async function playOnTtsAudioPlayer(InputMessage, WhoIsIt) {
    // Get the source from the provided audio element
    let source;
    if (WhoIsIt === "Nephrologist") {
        source = `/OpenAIVoiceNephrologistStream?Message=${encodeURIComponent(InputMessage)}`;
    } else if (WhoIsIt === "Ex-patient") {
        source = `/OpenAIVoicePatientStream?Message=${encodeURIComponent(InputMessage)}`;
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
            appendAlexMessage(InputMessage, 60, true);
        } else if (WhoIsIt === "Ex-patient") {
            appendJohnMessage(InputMessage, 60, true);
        }

        // Wait for the audio to finish playing
        await new Promise((resolve) => {
            ttsAudioPlayer.onended = resolve;
        });

        console.log("Audio playback finished.");
        unloadVideo();
        ShowElement("generatedVideo", "flex");
        HideElement("chatgptVideo");
        
    } catch (error) {
        console.error("Error playing audio:", error);
    }
}

async function loadWallaVideo() {
    try {
        let VideoPlayer;
        VideoPlayer = document.getElementById("chatgptVideo");
        VideoPlayer.src = "/videos/Alex_Walla.mp4";
        VideoPlayer.loop = true;
        await VideoPlayer.play(); // Ensure it starts playing properly
    } catch (error) {
        console.error("Error loading or playing video:", error);
    }
}

async function unloadVideo(){
    let VideoPlayer;
    VideoPlayer = document.getElementById("chatgptVideo");
    VideoPlayer.pause();  // Pause the video
    VideoPlayer.src = "";  // Remove the video source
    VideoPlayer.load();  // Reset the video
}

export function MakeAgentListen(){
    if (WhoIsOther === "Nephrologist") {
        let VideoPlayer = document.getElementById("Nephrologist-Video");
        VideoPlayer.src = "/videos/Alex_Listening.mp4";
        VideoPlayer.loop = true;
        VideoPlayer.play();
    } else if (WhoIsOther === "Ex-patient") {
        let VideoPlayer = document.getElementById("Ex-patient-Video");
        VideoPlayer.src = "/videos/John_Listening.mp4";
        VideoPlayer.play();
    }
}


export function HideElement(idName){
    document.getElementById(idName).style.display = "none";
  }
  
export function ShowElement(idName, displayType){
    document.getElementById(idName).style.display = displayType;
  }