document.addEventListener('DOMContentLoaded', () => {
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let isOpen = false;
    let consecutiveMisses = 0;
    let currentTechIdContext = null; // --- NEW: Add memory for the last Tech ID ---

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

    // Helper function to get a full summary of a tech's stats
    function getTechStatSummary(techId) {
        if (typeof AppState === 'undefined' || !AppState.currentTechStats || Object.keys(AppState.currentTechStats).length === 0) {
            return { error: "No calculation has been run yet. Please calculate a project first." };
        }

        const techData = AppState.currentTechStats[techId];
        if (!techData) {
            return { error: `I couldn't find any results for Tech ID ${techId} in the current calculation.` };
        }

        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
        const denominator = techData.fixTasks + techData.refixTasks + techData.warnings.length;
        const quality = denominator > 0 ? (techData.fixTasks / denominator) * 100 : 0;
        const qualityModifier = Calculator.calculateQualityModifier(quality);
        const bonusEarned = qualityModifier * 100;
        const payout = techData.points * bonusMultiplier * qualityModifier;

        return {
            id: techId,
            points: techData.points.toFixed(3),
            fixTasks: techData.fixTasks,
            refixTasks: techData.refixTasks,
            warnings: techData.warnings.length,
            quality: `${quality.toFixed(2)}%`,
            bonusEarned: `${bonusEarned.toFixed(2)}%`,
            payout: payout.toFixed(2)
        };
    }

    // --- MAJOR UPGRADE TO THE RESPONSE LOGIC WITH MEMORY ---
    function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        const techIdRegex = /(\d{4}[A-Z]{2})/;
        const potentialIdMatch = lowerCaseMessage.toUpperCase().match(techIdRegex);

        // --- NEW: Update context if a new Tech ID is mentioned ---
        if (potentialIdMatch) {
            currentTechIdContext = potentialIdMatch[0];
        }
        
        // --- 1. Handle Questions About Calculated Stats (using context) ---
        const metricKeywords = ['quality', 'point', 'task', 'refix', 'warning', 'payout', 'bonus', 'summary', 'all', 'everything', 'details'];
        const isAskingForStat = metricKeywords.some(keyword => lowerCaseMessage.includes(keyword));

        if (isAskingForStat) {
            if (currentTechIdContext) {
                const techId = currentTechIdContext;
                const summary = getTechStatSummary(techId);

                if (summary.error) {
                    addMessage('bot', summary.error);
                    return;
                }
                
                if (lowerCaseMessage.includes('summary') || lowerCaseMessage.includes('all') || lowerCaseMessage.includes('everything') || lowerCaseMessage.includes('details')) {
                    const fullSummary = `Here is the full summary for <b>${techId}</b>:<br>- <b>Points:</b> ${summary.points}<br>- <b>Fix Tasks:</b> ${summary.fixTasks}<br>- <b>Refix Tasks:</b> ${summary.refixTasks}<br>- <b>Warnings:</b> ${summary.warnings}<br>- <b>Fix Quality:</b> ${summary.quality}<br>- <b>Bonus Earned:</b> ${summary.bonusEarned}<br>- <b>Est. Payout:</b> ${summary.payout}`;
                    addMessage('bot', fullSummary);
                    return;
                }

                const metrics = {'quality': `Tech ${techId} has a <b>Fix Quality of ${summary.quality}</b>.`, 'point': `Tech ${techId} has <b>${summary.points} points</b>.`, 'task': `Tech ${techId} completed <b>${summary.fixTasks} primary fix tasks</b>.`, 'refix': `Tech ${techId} has <b>${summary.refixTasks} refix tasks</b>.`, 'warning': `Tech ${techId} has <b>${summary.warnings} warnings</b>.`, 'payout': `The calculated <b>payout for ${techId} is ${summary.payout}</b>.`, 'bonus': `Tech ${techId} has a <b>Bonus Earned % of ${summary.bonusEarned}</b>.`};
                for (const metric in metrics) {
                    if (lowerCaseMessage.includes(metric)) {
                        addMessage('bot', metrics[metric]);
                        return;
                    }
                }
            } else {
                addMessage('bot', "Which Tech ID are you asking about?");
                return;
            }
        }

        // --- 2. Handle Tech Name Lookups ---
        if (potentialIdMatch) {
            const foundId = potentialIdMatch[0];
            if (techNameDatabase[foundId]) {
                addMessage('bot', `Tech ID ${foundId} belongs to ${techNameDatabase[foundId]}.`);
                consecutiveMisses = 0;
                return;
            }
        }
        
        // --- 3. Fallback to General Knowledge Base ---
        currentTechIdContext = null; // Reset context if the question is not about stats
        let bestMatch = { score: 0, answer: "I'm sorry, I don't know the answer to that." };
        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(keyword => {
                if (lowerCaseMessage.includes(keyword)) score++;
            });
            if (score > bestMatch.score) bestMatch = { score, answer: item.answer };
        });

        if (bestMatch.score > 0) {
            consecutiveMisses = 0;
            addMessage('bot', bestMatch.answer);
        } else {
            consecutiveMisses++;
            if (consecutiveMisses >= 3) {
                consecutiveMisses = 0;
                addMessage('bot', getSuggestionMessage("I'm having trouble understanding. Maybe you can try one of these questions:"));
            } else {
                addMessage('bot', bestMatch.answer);
            }
        }
    }

    function getSuggestionMessage(greeting) {
        const suggestions = [
            "Summary for 7249SS",
            "What is the quality of 7236LE?",
            "How many points does 4472JS have?",
            "Who is the developer?",
            "How do I use the calculator?",
            "Can I combine multiple projects?"
        ];
        
        let suggestionHTML = `${greeting}<div class='suggestions-container'>`;
        suggestions.forEach(q => {
            suggestionHTML += `<button class='suggestion-btn'>${q}</button>`;
        });
        suggestionHTML += "</div>";
        
        return suggestionHTML;
    }
    
    // Initial bot message with suggestions
    const initialMessage = getSuggestionMessage("Hello! I am the PCS Calculator assistant. After you run a calculation, you can ask me about the results. Here are some examples:");
    addMessage('bot', initialMessage);
});
