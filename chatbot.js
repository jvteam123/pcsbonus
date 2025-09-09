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

    // --- MAJOR UPGRADE TO THE RESPONSE LOGIC ---
    function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        
        // --- 1. NEW: Check for questions about calculated stats ---
        const techIdRegex = /(\d{4}[A-Z]{2})/;
        const potentialIdMatch = lowerCaseMessage.toUpperCase().match(techIdRegex);

        if (potentialIdMatch) {
            const techId = potentialIdMatch[0];
            
            // Check if there are any results to query
            if (typeof AppState === 'undefined' || !AppState.currentTechStats || Object.keys(AppState.currentTechStats).length === 0) {
                addMessage('bot', "I can't answer that yet. Please run a calculation first, and then I can look up the results for you.");
                return;
            }

            const techData = AppState.currentTechStats[techId];
            if (!techData) {
                addMessage('bot', `I couldn't find any results for Tech ID ${techId} in the current calculation.`);
                return;
            }

            // Determine what metric the user is asking for
            if (lowerCaseMessage.includes('quality')) {
                const denominator = techData.fixTasks + techData.refixTasks + techData.warnings.length;
                const quality = denominator > 0 ? (techData.fixTasks / denominator) * 100 : 0;
                addMessage('bot', `Tech ${techId} has a <b>Fix Quality of ${quality.toFixed(2)}%</b>.`);
                return;
            }
            if (lowerCaseMessage.includes('point')) {
                addMessage('bot', `Tech ${techId} has <b>${techData.points.toFixed(3)} points</b>.`);
                return;
            }
            if (lowerCaseMessage.includes('task')) {
                addMessage('bot', `Tech ${techId} completed <b>${techData.fixTasks} primary fix tasks</b>.`);
                return;
            }
            if (lowerCaseMessage.includes('refix')) {
                addMessage('bot', `Tech ${techId} has <b>${techData.refixTasks} refix tasks</b>.`);
                return;
            }
            if (lowerCaseMessage.includes('payout')) {
                const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
                const denominator = techData.fixTasks + techData.refixTasks + techData.warnings.length;
                const quality = denominator > 0 ? (techData.fixTasks / denominator) * 100 : 0;
                const qualityModifier = Calculator.calculateQualityModifier(quality);
                const payout = techData.points * bonusMultiplier * qualityModifier;
                addMessage('bot', `The calculated <b>payout for ${techId} is ${payout.toFixed(2)}</b> (based on the current bonus multiplier).`);
                return;
            }
        }

        // --- 2. Check for Tech Name questions (from previous update) ---
        if (potentialIdMatch) {
            const foundId = potentialIdMatch[0];
            if (techNameDatabase[foundId]) {
                const name = techNameDatabase[foundId];
                addMessage('bot', `Tech ID ${foundId} belongs to ${name}.`);
                consecutiveMisses = 0;
                return;
            }
        }
        
        // --- 3. Fallback to General Knowledge Base ---
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
        const suggestions = [
            "What is the quality of 7249SS?",
            "How do I use the calculator?",
            "What files can I drop here?",
            "Who is 7249SS?",
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
