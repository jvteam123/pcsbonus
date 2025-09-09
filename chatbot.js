document.addEventListener('DOMContentLoaded', () => {
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let isOpen = false;

    // Toggle chatbot window
    chatbotBubble.addEventListener('click', () => {
        isOpen = !isOpen;
        chatbotWindow.classList.toggle('hidden');
    });

    // Handle user input
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatbotInput.value.trim() !== '') {
            const userMessage = chatbotInput.value.trim();
            addMessage('user', userMessage);
            chatbotInput.value = '';
            getBotResponse(userMessage);
        }
    });

    // Add a message to the chat window
    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${sender}`;
        messageElement.innerHTML = `<div class="message-bubble">${message}</div>`;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Get a response from the bot
    function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        let bestMatch = { score: 0, answer: "I'm sorry, I don't understand that. Can you ask in a different way?" };

        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(keyword => {
                if (lowerCaseMessage.includes(keyword)) {
                    score++;
                }
            });

            if (score > bestMatch.score) {
                bestMatch = { score, answer: item.answer };
            }
        });

        setTimeout(() => {
            addMessage('bot', bestMatch.answer);
        }, 500);
    }
    
    // Initial bot message
    addMessage('bot', 'Hello! I am the PCS Calculator assistant. Ask me a question to get started.');
});
