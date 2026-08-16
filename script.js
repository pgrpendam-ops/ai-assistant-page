// ============================================================
// AI ASSISTANT FRONTEND
// script.js
// ============================================================


// ============================================================
// 1. USER INPUT STORAGE
// ============================================================

// Every piece of input the system receives (typed OR spoken) is
// stored here as-is. This array is a raw capture log only —
// nothing in this file reads from it to build a response.
// Each entry: { source: "text" | "voice", value: string, timestamp: string }
let userInputs = [];


// Pushes one captured input into userInputs.
// Called from BOTH the text submit flow and the voice result flow,
// so voice input is saved the instant it's recognized — even if
// the user never presses Send and even though the AI reply below
// is a fixed placeholder that ignores this value entirely.
function storeUserInput(value, source) {

    if (!value || !value.trim()) {
        return;
    }

    const entry = {
        source: source,
        value: value.trim(),
        timestamp: new Date().toISOString()
    };

    userInputs.push(entry);

    console.log("Stored user input:", entry);
}


// Fixed response for the frontend prototype.
// Replace handleAIOutput() later when connecting a real AI.
// NOTE: this reply is intentionally NOT derived from userInputs —
// we are only storing input right now, not acting on it.
const FIXED_AI_RESPONSE =
    "Samrat, Sampuran AI Agent Banaoo!!";


// ============================================================
// 2. SUPPLIED AI LOGOS
// ============================================================

const stateAssets = {

    greeting: "assets/hello.png",

    ready: "assets/ready.png",

    typing: "assets/typing.png",

    listening: "assets/listening.png",

    processing: "assets/thinking.png",

    responding: "assets/responding.png"
};


// ============================================================
// 3. AI STATE INFORMATION
// ============================================================

const stateInfo = {

    greeting: {
        text: "Hello! 👋",
        hint: "Your AI assistant is getting ready.",
        alt: "AI assistant greeting"
    },

    ready: {
        text: "Ready to listen...",
        hint: "Type a message or use your voice.",
        alt: "AI assistant ready"
    },

    typing: {
        text: "Watching your input...",
        hint: "I'm following what you type.",
        alt: "AI assistant watching input"
    },

    listening: {
        text: "Listening...",
        hint: "Speak clearly into your microphone.",
        alt: "AI assistant listening"
    },

    processing: {
        text: "Thinking...",
        hint: "Processing your request.",
        alt: "AI assistant thinking"
    },

    responding: {
        text: "Responding...",
        hint: "Preparing your answer.",
        alt: "AI assistant responding"
    }
};


// ============================================================
// 4. GET HTML ELEMENTS
// ============================================================

const assistantLogo =
    document.getElementById("assistantLogo");

const stateLogo =
    document.getElementById("stateLogo");

const statusText =
    document.getElementById("statusText");

const statusHint =
    document.getElementById("statusHint");

const inputForm =
    document.getElementById("inputForm");

const messageInput =
    document.getElementById("messageInput");

const responseArea =
    document.getElementById("responseArea");

const feedback =
    document.getElementById("feedback");

const sendButton =
    document.getElementById("sendButton");

const resetButton =
    document.getElementById("resetButton");

const voiceButton =
    document.getElementById("voiceButton");

const voiceIcon =
    document.getElementById("voiceIcon");

const voiceLabel =
    document.getElementById("voiceLabel");


// ============================================================
// 5. APPLICATION STATE
// ============================================================

let recognition = null;

let isListening = false;

let isProcessing = false;

let greetingTimer = null;

let typingTimer = null;


// ============================================================
// 6. CHANGE AI STATE
// ============================================================

function setAssistantState(state) {

    if (!stateInfo[state]) {
        return;
    }


    // Change CSS state.
    if (assistantLogo) {

        assistantLogo.className =
            `assistant-logo state-${state}`;
    }


    // Change supplied logo.
    if (stateLogo) {

        stateLogo.src =
            stateAssets[state];

        stateLogo.alt =
            stateInfo[state].alt;
    }


    // Change status.
    if (statusText) {

        statusText.textContent =
            stateInfo[state].text;
    }


    // Change description.
    if (statusHint) {

        statusHint.textContent =
            stateInfo[state].hint;
    }
}


// ============================================================
// 7. FEEDBACK
// ============================================================

function showFeedback(message, type = "") {

    if (!feedback) {
        return;
    }

    feedback.textContent = message;

    feedback.className =
        `feedback ${type}`.trim();
}


function clearFeedback() {

    if (!feedback) {
        return;
    }

    feedback.textContent = "";

    feedback.className =
        "feedback";
}


// ============================================================
// 8. GREETING
// ============================================================

function showGreeting() {

    clearTimeout(greetingTimer);

    setAssistantState("greeting");


    greetingTimer = setTimeout(() => {

        if (
            !isProcessing &&
            !isListening &&
            !messageInput.value.trim()
        ) {

            setAssistantState("ready");
        }

    }, 1800);
}


// ============================================================
// 9. HANDLE TEXT TYPING
// ============================================================

function handleTyping() {

    clearTimeout(typingTimer);

    autoResizeInput();


    if (isProcessing || isListening) {
        return;
    }


    clearFeedback();


    if (messageInput.value.trim()) {

        setAssistantState("typing");

    } else {

        setAssistantState("ready");
    }


    typingTimer = setTimeout(() => {

        if (
            !isProcessing &&
            !isListening &&
            !messageInput.value.trim()
        ) {

            setAssistantState("ready");
        }

    }, 1000);
}


// ============================================================
// 10. INPUT AUTO RESIZE
// ============================================================

function autoResizeInput() {

    if (!messageInput) {
        return;
    }

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            120
        ) + "px";
}


// ============================================================
// 11. ESCAPE HTML
// ============================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ============================================================
// 12. REMOVE EMPTY RESPONSE MESSAGE
// ============================================================

function removeEmptyState() {

    const empty =
        responseArea.querySelector(
            ".empty-state"
        );

    if (empty) {
        empty.remove();
    }
}


// ============================================================
// 13. SCROLL RESPONSE AREA
// ============================================================

function scrollConversationToBottom() {

    responseArea.scrollTop =
        responseArea.scrollHeight;
}


// ============================================================
// 14. DISPLAY USER MESSAGE
// ============================================================

function displayUserMessage(text) {

    removeEmptyState();


    const message =
        document.createElement("div");


    message.className =
        "message user";


    message.innerHTML = `
        <span class="message-label">
            You
        </span>

        <div class="message-content">
            ${escapeHtml(text)}
        </div>
    `;


    responseArea.appendChild(message);


    scrollConversationToBottom();
}


// ============================================================
// 15. DISPLAY THINKING
// ============================================================

function displayThinking() {

    removeThinking();


    const thinking =
        document.createElement("div");


    thinking.id =
        "thinkingMessage";


    thinking.className =
        "thinking";


    thinking.innerHTML = `
        <span>Thinking</span>
        <i></i>
        <i></i>
        <i></i>
    `;


    responseArea.appendChild(thinking);


    scrollConversationToBottom();
}


// ============================================================
// 16. REMOVE THINKING
// ============================================================

function removeThinking() {

    const thinking =
        document.getElementById(
            "thinkingMessage"
        );


    if (thinking) {
        thinking.remove();
    }
}


// ============================================================
// 17. DISPLAY AI RESPONSE
// ============================================================

function displayAIResponse(text) {

    removeThinking();

    removeEmptyState();


    const message =
        document.createElement("div");


    message.className =
        "message ai";


    message.innerHTML = `
        <span class="message-label">
            AI Assistant
        </span>

        <div class="message-content">
            ${escapeHtml(text)}
        </div>
    `;


    responseArea.appendChild(message);


    scrollConversationToBottom();
}


// ============================================================
// 18. FUTURE AI FUNCTION
// ============================================================

function handleAIOutput(userInput) {

    /*
        Later replace this function with:

        OpenAI API
        Gemini API
        n8n
        Custom Backend
        REST API
        WebSocket
        Local AI model
    */

    return FIXED_AI_RESPONSE;
}


// ============================================================
// 19. WAIT
// ============================================================

function wait(milliseconds) {

    return new Promise(resolve => {

        setTimeout(resolve, milliseconds);

    });
}


// ============================================================
// 20. SUBMIT INPUT
// ============================================================

async function submitInput(event) {

    event.preventDefault();


    // Prevent double-click / duplicate submission.
    if (isProcessing) {
        return;
    }


    const userInput =
        messageInput.value.trim();


    // --------------------------------------------------------
    // EMPTY INPUT
    // --------------------------------------------------------

    if (!userInput) {

        showFeedback(
            "Please enter a message first.",
            "error"
        );

        setAssistantState("ready");

        messageInput.focus();

        return;
    }


    // --------------------------------------------------------
    // STOP VOICE
    // --------------------------------------------------------

    if (isListening) {

        stopVoiceInput();
    }


    // --------------------------------------------------------
    // STORE INPUT
    // --------------------------------------------------------

    // This captures it as a "text" entry regardless of whether
    // the text was typed directly or came from voice-to-text
    // filling the box — the act of submitting is what matters here.
    storeUserInput(userInput, "text");


    // --------------------------------------------------------
    // START PROCESSING
    // --------------------------------------------------------

    isProcessing = true;

    sendButton.disabled = true;


    // --------------------------------------------------------
    // SHOW USER MESSAGE
    // --------------------------------------------------------

    displayUserMessage(userInput);


    messageInput.value = "";

    autoResizeInput();

    clearFeedback();


    // --------------------------------------------------------
    // PROCESSING
    // --------------------------------------------------------

    setAssistantState("processing");

    displayThinking();


    await wait(900);


    // --------------------------------------------------------
    // GET AI RESPONSE
    // --------------------------------------------------------

    const response =
        handleAIOutput(userInput);


    // --------------------------------------------------------
    // DISPLAY RESPONSE
    // --------------------------------------------------------

    displayAIResponse(response);


    // --------------------------------------------------------
    // RESPONDING
    // --------------------------------------------------------

    setAssistantState("responding");


    await wait(900);


    // --------------------------------------------------------
    // READY
    // --------------------------------------------------------

    isProcessing = false;

    sendButton.disabled = false;

    setAssistantState("ready");

    messageInput.focus();
}


// ============================================================
// 21. VOICE RECOGNITION SUPPORT
// ============================================================

function getSpeechRecognition() {

    return (
        window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        null
    );
}


// ============================================================
// 22. CHECK VOICE SUPPORT
// ============================================================

function isVoiceSupported() {

    return getSpeechRecognition() !== null;
}


// ============================================================
// 23. SETUP VOICE RECOGNITION
// ============================================================

function setupVoiceRecognition() {

    const SpeechRecognition =
        getSpeechRecognition();


    // --------------------------------------------------------
    // IMPORTANT FIX
    // --------------------------------------------------------
    //
    // Do NOT insert demo text here.
    // We only report that recognition isn't supported.
    // --------------------------------------------------------

    if (!SpeechRecognition) {

        console.warn(
            "Web Speech API is not supported."
        );

        return false;
    }


    recognition =
        new SpeechRecognition();


    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    // English India.
    // Chrome normally supports this.
    recognition.lang = "en-IN";


    // Only final results.
    recognition.interimResults = false;


    // One voice session at a time.
    recognition.continuous = false;


    // Give browser one best result.
    recognition.maxAlternatives = 1;


    // ========================================================
    // ON START
    // ========================================================

    recognition.onstart = function() {

        isListening = true;


        voiceButton.classList.add(
            "active"
        );


        voiceIcon.textContent =
            "🔴";


        voiceLabel.textContent =
            "Listening";


        voiceButton.setAttribute(
            "aria-label",
            "Stop voice input"
        );


        setAssistantState(
            "listening"
        );


        showFeedback(
            "Listening... Speak now.",
            "success"
        );
    };


    // ========================================================
    // ON RESULT
    // ========================================================

    recognition.onresult = function(event) {

        console.log(
            "Speech recognition event:",
            event
        );


        let transcript = "";


        try {

            transcript =
                event.results[0][0]
                    .transcript
                    .trim();

        } catch (error) {

            console.error(
                "Could not read speech result:",
                error
            );
        }


        // ----------------------------------------------------
        // ACTUAL VOICE TEXT RECEIVED
        // ----------------------------------------------------

        if (transcript.length > 0) {

            console.log(
                "Recognized voice:",
                transcript
            );


            // --------------------------------------------
            // STORE VOICE INPUT IMMEDIATELY
            // --------------------------------------------
            // Captured the moment it's recognized, even if
            // the user edits the box afterward or never
            // presses Send. We do NOT act on this value —
            // it is saved only, same as the fixed AI reply
            // is unrelated to whatever was said.
            storeUserInput(transcript, "voice");


            // Put REAL voice text in input.
            messageInput.value =
                transcript;


            autoResizeInput();


            // Change logo to typing.
            setAssistantState(
                "typing"
            );


            showFeedback(
                "Voice converted to text successfully. Press Send.",
                "success"
            );
        }


        // ----------------------------------------------------
        // NO TEXT
        // ----------------------------------------------------

        else {

            showFeedback(
                "No speech was detected. Please try again.",
                "error"
            );
        }
    };


    // ========================================================
    // ON ERROR
    // ========================================================

    recognition.onerror = function(event) {

        console.error(
            "Speech recognition error:",
            event.error
        );


        switch (event.error) {


            case "not-allowed":

                showFeedback(
                    "Microphone permission was denied. Allow microphone access and try again.",
                    "error"
                );

                break;


            case "audio-capture":

                showFeedback(
                    "No microphone was detected. Check your microphone.",
                    "error"
                );

                break;


            case "no-speech":

                showFeedback(
                    "No speech detected. Please speak clearly and try again.",
                    "error"
                );

                break;


            case "network":

                showFeedback(
                    "Speech recognition needs a network connection.",
                    "error"
                );

                break;


            case "aborted":

                showFeedback(
                    "Voice input was stopped.",
                    ""
                );

                break;


            default:

                showFeedback(
                    "Voice recognition error: " +
                    event.error,
                    "error"
                );
        }
    };


    // ========================================================
    // ON END
    // ========================================================

    recognition.onend = function() {

        isListening = false;


        resetVoiceButton();


        if (!isProcessing) {

            if (
                messageInput.value.trim()
            ) {

                setAssistantState(
                    "typing"
                );

            } else {

                setAssistantState(
                    "ready"
                );
            }
        }
    };


    // ========================================================
    // ON ABORT
    // ========================================================

    recognition.onabort = function() {

        isListening = false;

        resetVoiceButton();

        if (!isProcessing) {

            setAssistantState("ready");
        }
    };


    return true;
}


// ============================================================
// 24. START VOICE INPUT
// ============================================================

function startVoiceInput() {

    // Don't use microphone while processing AI response.
    if (isProcessing) {

        showFeedback(
            "Please wait until the AI finishes responding.",
            "error"
        );

        return;
    }


    // --------------------------------------------------------
    // IF ALREADY LISTENING
    // --------------------------------------------------------

    if (isListening) {

        stopVoiceInput();

        return;
    }


    // --------------------------------------------------------
    // CREATE RECOGNITION
    // --------------------------------------------------------

    if (!recognition) {

        const created =
            setupVoiceRecognition();


        if (!created) {

            showFeedback(
                "Your browser does not support voice recognition. Try Chrome or Edge.",
                "error"
            );

            return;
        }
    }


    // --------------------------------------------------------
    // START
    // --------------------------------------------------------

    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Could not start recognition:",
            error
        );


        /*
            DOMException "already started" can happen
            if the browser has not completely finished
            a previous recognition session.
        */

        if (
            error.name !==
            "InvalidStateError"
        ) {

            showFeedback(
                "Could not start voice recognition. Please try again.",
                "error"
            );
        }
    }
}


// ============================================================
// 25. STOP VOICE
// ============================================================

function stopVoiceInput() {

    if (
        recognition &&
        isListening
    ) {

        try {

            recognition.stop();

        } catch (error) {

            console.warn(
                "Voice stop warning:",
                error
            );
        }
    }
}


// ============================================================
// 26. RESET VOICE BUTTON
// ============================================================

function resetVoiceButton() {

    isListening = false;


    voiceButton.classList.remove(
        "active"
    );


    voiceButton.setAttribute(
        "aria-label",
        "Start voice input"
    );


    voiceButton.title =
        "Voice input";


    voiceIcon.textContent =
        "🎤";


    voiceLabel.textContent =
        "Voice";
}


// ============================================================
// 27. RESET ASSISTANT
// ============================================================

function resetAssistant() {

    // Stop timers.
    clearTimeout(
        greetingTimer
    );

    clearTimeout(
        typingTimer
    );


    // Stop microphone.
    stopVoiceInput();


    // Clear stored inputs (both text and voice entries).
    userInputs = [];


    console.log(
        "userInputs array cleared."
    );


    // Reset application.
    isProcessing = false;


    // Enable send.
    sendButton.disabled = false;


    // Clear input.
    messageInput.value = "";


    autoResizeInput();


    // Clear response area.
    responseArea.innerHTML = `
        <div class="empty-state">

            <div class="empty-logo">

                <img
                    src="assets/ready.png"
                    alt=""
                >

            </div>

            <p>
                Ask your AI assistant something.
            </p>

            <span>
                Your response will appear here.
            </span>

        </div>
    `;


    // Clear feedback.
    clearFeedback();


    // Reset microphone.
    resetVoiceButton();


    // Start greeting again.
    showGreeting();


    messageInput.focus();
}


// ============================================================
// 28. TEXT INPUT EVENT
// ============================================================

messageInput.addEventListener(
    "input",
    handleTyping
);


// ============================================================
// 29. TEXT INPUT FOCUS
// ============================================================

messageInput.addEventListener(
    "focus",
    function() {

        if (
            !isProcessing &&
            !isListening &&
            messageInput.value.trim()
        ) {

            setAssistantState(
                "typing"
            );
        }
    }
);


// ============================================================
// 30. SEND FORM
// ============================================================

inputForm.addEventListener(
    "submit",
    submitInput
);


// ============================================================
// 31. VOICE BUTTON
// ============================================================

voiceButton.addEventListener(
    "click",
    startVoiceInput
);


// ============================================================
// 32. RESET BUTTON
// ============================================================

resetButton.addEventListener(
    "click",
    resetAssistant
);


// ============================================================
// 33. ENTER KEY
// ============================================================

// Enter = Send
// Shift + Enter = New line

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            inputForm.requestSubmit();
        }
    }
);


// ============================================================
// 34. START APPLICATION
// ============================================================

showGreeting();

autoResizeInput();