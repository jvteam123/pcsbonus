// chatbot.js

document.addEventListener('DOMContentLoaded', () => {
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // --- IMPORTANT ---
    // Replace this URL with the actual Trigger URL you get after deploying your Google Cloud Function.
    const CLOUD_FUNCTION_URL = 'https://your-cloud-function-trigger-url';

    let isOpen = false;

    // Toggle chatbot window
    chatbotBubble.addEventListener('click', () => {
        isOpen = !isOpen;
        chatbotWindow.classList.toggle('hidden');
        if (isOpen) {
            chatbotInput.focus();
        }
    });

    // Handle user input via Enter key
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatbotInput.value.trim() !== '') {
            handleUserInput();
        }
    });

    function handleUserInput() {
        const userMessage = chatbotInput.value.trim();
        addMessage('user', userMessage);
        getBotResponse(userMessage);
    }

    // Add a message to the chat window
    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = message;

        if (sender === 'user') {
            chatbotInput.value = '';
        }

        messageElement.appendChild(bubble);
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Get the bot's response from the secure cloud function
    async function getBotResponse(userMessage) {
        // Add a temporary "typing" indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chatbot-message bot';
        typingIndicator.innerHTML = `<div class="message-bubble">Typing...</div>`;
        chatbotMessages.appendChild(typingIndicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        try {
            if (!CLOUD_FUNCTION_URL.startsWith('https://')) {
                 chatbotMessages.removeChild(typingIndicator);
                 addMessage('bot', "The chatbot is not configured. Please set the Cloud Function URL.");
                 return;
            }

            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    // Pass application context to the AI for smarter answers
                    context: {
                        techStats: AppState.currentTechStats || {},
                        teamSettings: AppState.teamSettings || {},
                    }
                }),
            });

            // Remove the typing indicator
            chatbotMessages.removeChild(typingIndicator);

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.reply) {
                addMessage('bot', data.reply);
            } else {
                addMessage('bot', "I received an empty response. Please try again.");
            }
        } catch (error) {
             chatbotMessages.removeChild(typingIndicator);
            console.error("Error fetching bot response:", error);
            addMessage('bot', "Sorry, I'm having trouble connecting to my brain right now. Please try again later.");
        }
    }

    // Initial bot message
    addMessage('bot', "Hello! I am the PCS Calculator assistant, now powered by Gemini. How can I help you?");
});
