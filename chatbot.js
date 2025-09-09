document.addEventListener('DOMContentLoaded', () => {
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let isOpen = false;
    let consecutiveMisses = 0;

    // Toggle chatbot window
    chatbotBubble.addEventListener('click', () => {
        isOpen = !isOpen;
        chatbotWindow.classList.toggle('hidden');
    });

    // Handle user input via Enter key
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatbotInput.value.trim() !== '') {
            handleUserInput();
        }
    });

    // Handle user clicking on a suggestion
    chatbotMessages.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-btn')) {
            const question = e.target.textContent;
            addMessage('user', question);
            getBotResponse(question);
        }
    });

    function handleUserInput() {
        const userMessage = chatbotInput.value.trim();
        addMessage('user', userMessage);
        chatbotInput.value = '';
        getBotResponse(userMessage);
    }

    // Add a message to the chat window
    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${sender}`;
        // Using textContent to prevent HTML injection from user input
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = message; // Use innerHTML only for bot messages with suggestions
        
        if(sender === 'user') {
            bubble.textContent = message;
        }

        messageElement.appendChild(bubble);
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

        let botResponse;

        if (bestMatch.score > 0) {
            consecutiveMisses = 0;
            botResponse = bestMatch.answer;
        } else {
            consecutiveMisses++;
            if (consecutiveMisses >= 3) {
                consecutiveMisses = 0;
                botResponse = getSuggestionMessage();
            } else {
                botResponse = bestMatch.answer;
            }
        }

        setTimeout(() => {
            addMessage('bot', botResponse);
        }, 500);
    }

    function getSuggestionMessage() {
        // A curated list of good example questions from the knowledge base
        const suggestions = [
            "How is quality calculated?",
            "What is a refix?",
            "How do I use the calculator?",
            "What are the points for a QC task?",
            "Can I combine projects?"
        ];
        
        let suggestionHTML = "I'm having trouble understanding. Maybe you can try one of these questions:<div class='suggestions-container'>";
        suggestions.forEach(q => {
            suggestionHTML += `<button class='suggestion-btn'>${q}</button>`;
        });
        suggestionHTML += "</div>";
        
        return suggestionHTML;
    }
    
    // Initial bot message
    addMessage('bot', 'Hello! I am the PCS Calculator assistant. Ask me a question to get started.');
});
