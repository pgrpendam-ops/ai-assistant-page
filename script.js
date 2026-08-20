// ============================================================
// AI ASSISTANT FRONTEND
// script.js
// ============================================================


// ============================================================
// 1. INPUT STORAGE (session only, cleared on reset)
// ============================================================

// Every submitted message (typed OR spoken-then-converted) lands
// here as one simple object: { inputType, time, input }
const inputs = [];

// Tracks whether the text currently in the box came from typing
// or from voice. Read once, at submit time.
let currentInputType = "text";

function setInputType(type) {
    currentInputType = type;
}


// ============================================================
// 2. SUPPLIED AI LOGOS
// ============================================================

const stateAssets = {

    greeting: "assets/chill_hello.png",

    ready: "assets/goa_ai_orb.png",

    typing: "assets/input_context.png",

    listening: "assets/listening_vibe.png",

    processing: "assets/processing_logic.png",

    responding: "assets/responding_wave.png"
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


    // A real keystroke means the box now holds typed text,
    // even if it previously held a voice-converted transcript.
    setInputType("text");


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
// 18. GENERATE OUTPUT
// ============================================================

// For this prototype, the output is always the same fixed line.
// Later, swap the body of this function for a real AI/API call
// (OpenAI, Gemini, n8n, a custom backend, etc.) — everything
// upstream (storage, processInput) already feeds it plain text.
function generateOutput() {

    displayAIResponse("make an ai agent");
}


// ============================================================
// 19. PROCESS INPUT
// ============================================================

// Both text and voice input end up here as plain text — voice is
// already converted before this is ever called. One shared path,
// no duplicated logic.
function processInput(text) {

    generateOutput();
}


// ============================================================
// 20. STORE INPUT
// ============================================================

// Adds one entry to inputs[], then hands the text to processInput().
function handleInput(text, type) {

    inputs.push({
        inputType: type,
        time: new Date().toISOString(),
        input: text
    });

    console.log("Stored input:", inputs[inputs.length - 1]);

    processInput(text);
}


// ============================================================
// 21. WAIT
// ============================================================

function wait(milliseconds) {

    return new Promise(resolve => {

        setTimeout(resolve, milliseconds);

    });
}


// ============================================================
// 22. SUBMIT INPUT
// ============================================================

async function submitInput(event) {

    event.preventDefault();


    // Prevent double-click / duplicate submission.
    if (isProcessing) {
        return;
    }


    const text =
        messageInput.value.trim();


    // --------------------------------------------------------
    // EMPTY INPUT
    // --------------------------------------------------------

    if (!text) {

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
    // START PROCESSING
    // --------------------------------------------------------

    isProcessing = true;

    sendButton.disabled = true;


    // --------------------------------------------------------
    // SHOW USER MESSAGE
    // --------------------------------------------------------

    displayUserMessage(text);


    messageInput.value = "";

    autoResizeInput();

    clearFeedback();


    // --------------------------------------------------------
    // THINKING
    // --------------------------------------------------------

    setAssistantState("processing");

    displayThinking();


    await wait(900);


    // --------------------------------------------------------
    // STORE + PROCESS (this also generates the output)
    // --------------------------------------------------------

    handleInput(text, currentInputType);

    // Box is back to "text mode" until voice fills it again.
    setInputType("text");


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
// 23. VOICE RECOGNITION SUPPORT
// ============================================================

function getSpeechRecognition() {

    return (
        window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        null
    );
}


// ============================================================
// 24. CHECK VOICE SUPPORT
// ============================================================

function isVoiceSupported() {

    return getSpeechRecognition() !== null;
}


// ============================================================
// 25. SETUP VOICE RECOGNITION
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


            // Mark this box content as voice-sourced. It is
            // NOT stored in inputs[] yet — only the input box
            // is filled. Storing happens on Send, same as
            // typed text.
            setInputType("audio");


            // Put converted voice text in input.
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
// 26. START VOICE INPUT
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
// 27. STOP VOICE
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
// 28. RESET VOICE BUTTON
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
// 29. RESET ASSISTANT
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


    // Clear stored inputs for this session.
    inputs.length = 0;

    setInputType("text");


    console.log(
        "inputs[] cleared."
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
                    src="assets/responding_bubbles.png"
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
// 30. TEXT INPUT EVENT
// ============================================================

messageInput.addEventListener(
    "input",
    handleTyping
);


// ============================================================
// 31. TEXT INPUT FOCUS
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
// 32. SEND FORM
// ============================================================

inputForm.addEventListener(
    "submit",
    submitInput
);


// ============================================================
// 33. VOICE BUTTON
// ============================================================

voiceButton.addEventListener(
    "click",
    startVoiceInput
);


// ============================================================
// 34. RESET BUTTON
// ============================================================

resetButton.addEventListener(
    "click",
    resetAssistant
);


// ============================================================
// 35. ENTER KEY
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
// 36. START APPLICATION
// ============================================================

showGreeting();

autoResizeInput();
