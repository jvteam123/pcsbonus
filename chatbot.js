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
        bubble.innerHTML = message; // Use innerHTML for bot messages with suggestions
        
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
        // A curated list of good example questions from the knowledge base
        const suggestions = [
            "How is quality calculated?",
            "What is a refix?",
            "How do I use the calculator?",
            "What are the points for a QC task?",
            "Who is the developer?"
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
