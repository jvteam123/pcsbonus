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
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = message;
        
        if(sender === 'user') {
            bubble.textContent = message;
        }

        messageElement.appendChild(bubble);
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Get a response from the bot
    function getBotResponse(userMessage) {
        const upperCaseMessage = userMessage.toUpperCase();
        
        // --- Tech ID Search Logic ---
        const techIdRegex = /\d{4}[A-Z]{2}/;
        const potentialIdMatch = upperCaseMessage.match(techIdRegex);
        
        if (potentialIdMatch) {
            const foundId = potentialIdMatch[0];
            if (techNameDatabase[foundId]) {
                const name = techNameDatabase[foundId];
                addMessage('bot', `Tech ID ${foundId} belongs to ${name}.`);
                consecutiveMisses = 0;
                return; 
            }
        }
        
        // --- Existing Keyword Search Logic ---
        const lowerCaseMessage = userMessage.toLowerCase();
        let bestMatch = { score: 0, answer: "I'm sorry, I don't know the answer to that. Please try asking in a different way." };

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
                botResponse = getSuggestionMessage("I'm having trouble understanding. Maybe you can try one of these questions:");
            } else {
                botResponse = bestMatch.answer;
            }
        }

        setTimeout(() => {
            addMessage('bot', botResponse);
        }, 500);
    }

    function getSuggestionMessage(greeting) {
        // --- NEW & IMPROVED SUGGESTIONS ---
        const suggestions = [
            "How do I use the calculator?",
            "How is quality calculated?",
            "What files can I drop here?",
            "Can I combine multiple projects?",
            "What is an IR project?",
            "How do I edit a saved project?"
        ];
        
        let suggestionHTML = `${greeting}<div class='suggestions-container'>`;
        suggestions.forEach(q => {
            suggestionHTML += `<button class='suggestion-btn'>${q}</button>`;
        });
        suggestionHTML += "</div>";
        
        return suggestionHTML;
    }
    
    // Initial bot message with suggestions
    const initialMessage = getSuggestionMessage("Hello! I am the PCS Calculator assistant. Here are some questions you can ask:");
    addMessage('bot', initialMessage);
});
