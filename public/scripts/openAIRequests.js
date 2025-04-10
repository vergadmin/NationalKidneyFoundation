export async function getNephrologistResponse(ConversationLog, InteractionType) {
    try {
        const res = await fetch('/OpenAIChatNephrologist', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                conversationHistorySoFar: JSON.stringify(ConversationLog),
                InteractionType: InteractionType,
            })
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;  // Rethrow to handle it at the caller level
    }
}

export async function OpenAIChatCheckTopic(ConversationLog) {
    try {
        const res = await fetch('/OpenAIChatCheckTopic', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                conversationHistorySoFar: JSON.stringify(ConversationLog),
            })
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;  // Rethrow to handle it at the caller level
    }
}

export async function OpenAINephrologistFormattedMessage(ConversationLog) {
    try {
        const res = await fetch('/OpenAINephrologistFormattedMessage', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                conversationHistorySoFar: JSON.stringify(ConversationLog),
            })
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;  // Rethrow to handle it at the caller level
    }
}

export async function getNeprologistAudio(InputMessage) {
    const response = await fetch("/OpenAIVoiceNephrologist", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            Message: JSON.stringify(InputMessage)
        })
    });

    if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        // Create the audio element
        const audioElement = document.createElement("audio");
        audioElement.src = audioUrl;
        audioElement.controls = true;  // Add controls (play/pause, volume, etc.)

        // Return the wrapper containing the audio element and download button
        return audioElement;
    } else {
        console.error("Error fetching audio");
    }
}

export async function getExPatientResponse(ConversationLog, InteractionType) {
    try {
        const res = await fetch('/OpenAIChatExPatient', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                conversationHistorySoFar: JSON.stringify(ConversationLog),
                InteractionType: InteractionType,
            })
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;  // Rethrow to handle it at the caller level
    }
}

export async function getPatientAudio(InputMessage) {
    const response = await fetch("/OpenAIVoicePatient", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            Message: JSON.stringify(InputMessage)
        })
    });

    if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        // Create the audio element
        const audioElement = document.createElement("audio");
        audioElement.src = audioUrl;
        audioElement.controls = true;  // Add controls (play/pause, volume, etc.)

        // Return the wrapper containing the audio element and download button
        return audioElement;
    } else {
        console.error("Error fetching audio");
    }
}


export async function getRedactedText(UserMessage) {
    try {
        const res = await fetch('/OpenAIRedactedText', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                TextToBeRedacted: UserMessage,
            })
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;  // Rethrow to handle it at the caller level
    }
}


export async function getPunctuatedText(UserMessage) {
    try {
        const res = await fetch('/OpenAIPuncatuateText', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                TextToBePunctuated: UserMessage,
            })
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;  // Rethrow to handle it at the caller level
    }
}


export async function getBoldedQuestions(questions_Array) {
    try {
        const res = await fetch('/OpenAIBoldQuestions', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                QuestionsArray: JSON.stringify(questions_Array),
            })
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;  // Rethrow to handle it at the caller level
    }
}