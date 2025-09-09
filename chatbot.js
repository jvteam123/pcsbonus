document.addEventListener('DOMContentLoaded', () => {
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let isOpen = false;
    let consecutiveMisses = 0;
    let currentTechIdContext = null;

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

    // Handle user clicking on a suggestion OR an action button
    chatbotMessages.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('suggestion-btn')) {
            const question = target.textContent;
            addMessage('user', question);
            getBotResponse(question);
        }
        if (target.classList.contains('action-btn')) {
            const actionType = target.dataset.actionType;
            const actionValue = target.dataset.actionValue;
            if (actionType === 'open_modal' && typeof window.UI !== 'undefined') {
                window.UI.openModal(actionValue);
            }
        }
    });

    function handleUserInput() {
        const userMessage = chatbotInput.value.trim();
        addMessage('user', userMessage);
        chatbotInput.value = '';
        getBotResponse(userMessage);
    }

    // Add a message to the chat window, now with support for action buttons
    function addMessage(sender, messageData) {
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        if (sender === 'user') {
            bubble.textContent = messageData;
        } else {
            // Handle bot messages which might be strings or objects with actions
            let messageText = typeof messageData === 'string' ? messageData : messageData.answer;
            bubble.innerHTML = messageText;

            if (typeof messageData.action !== 'undefined') {
                const action = messageData.action;
                const actionButton = document.createElement('button');
                actionButton.className = 'action-btn';
                actionButton.textContent = action.label;
                actionButton.dataset.actionType = action.type;
                actionButton.dataset.actionValue = action.value;
                bubble.appendChild(actionButton);
            }
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
        return { id: techId, points: techData.points.toFixed(3), fixTasks: techData.fixTasks, refixTasks: techData.refixTasks, warnings: techData.warnings.length, quality: `${quality.toFixed(2)}%`, bonusEarned: `${bonusEarned.toFixed(2)}%`, payout: payout.toFixed(2) };
    }

    // Main response logic with memory and actions
    function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        const techIdRegex = /(\d{4}[A-Z]{2})/;
        const potentialIdMatch = lowerCaseMessage.toUpperCase().match(techIdRegex);
        if (potentialIdMatch) currentTechIdContext = potentialIdMatch[0];
        
        const metricKeywords = ['quality', 'point', 'task', 'refix', 'warning', 'payout', 'bonus', 'summary', 'all', 'everything', 'details'];
        const isAskingForStat = metricKeywords.some(keyword => lowerCaseMessage.includes(keyword));

        if (isAskingForStat) {
            if (currentTechIdContext) {
                const techId = currentTechIdContext;
                const summary = getTechStatSummary(techId);
                if (summary.error) { addMessage('bot', summary.error); return; }
                if (lowerCaseMessage.includes('summary') || lowerCaseMessage.includes('all') || lowerCaseMessage.includes('everything') || lowerCaseMessage.includes('details')) {
                    const fullSummary = `Here is the full summary for <b>${techId}</b>:<br>- <b>Points:</b> ${summary.points}<br>- <b>Fix Tasks:</b> ${summary.fixTasks}<br>- <b>Refix Tasks:</b> ${summary.refixTasks}<br>- <b>Warnings:</b> ${summary.warnings}<br>- <b>Fix Quality:</b> ${summary.quality}<br>- <b>Bonus Earned:</b> ${summary.bonusEarned}<br>- <b>Est. Payout:</b> ${summary.payout}`;
                    addMessage('bot', fullSummary); return;
                }
                const metrics = {'quality': `Tech ${techId} has a <b>Fix Quality of ${summary.quality}</b>.`, 'point': `Tech ${techId} has <b>${summary.points} points</b>.`, 'task': `Tech ${techId} completed <b>${summary.fixTasks} primary fix tasks</b>.`, 'refix': `Tech ${techId} has <b>${summary.refixTasks} refix tasks</b>.`, 'warning': `Tech ${techId} has <b>${summary.warnings} warnings</b>.`, 'payout': `The calculated <b>payout for ${techId} is ${summary.payout}</b>.`, 'bonus': `Tech ${techId} has a <b>Bonus Earned % of ${summary.bonusEarned}</b>.`};
                for (const metric in metrics) {
                    if (lowerCaseMessage.includes(metric)) { addMessage('bot', metrics[metric]); return; }
                }
            } else { addMessage('bot', "Which Tech ID are you asking about?"); return; }
        }

        if (potentialIdMatch) {
            const foundId = potentialIdMatch[0];
            if (techNameDatabase[foundId]) {
                addMessage('bot', `Tech ID ${foundId} belongs to ${techNameDatabase[foundId]}.`);
                consecutiveMisses = 0; return;
            }
        }
        
        currentTechIdContext = null;
        let bestMatch = { score: 0, answer: "I'm sorry, I don't know the answer to that." };
        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(keyword => { if (lowerCaseMessage.includes(keyword)) score++; });
            if (score > bestMatch.score) bestMatch = item;
        });

        if (bestMatch.score > 0) {
            consecutiveMisses = 0;
            addMessage('bot', bestMatch);
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
        const suggestions = ["Summary for 7249SS", "What is the quality of 7236LE?", "How many points does 4472JS have?", "Who is the developer?", "How do I use the calculator?", "What is a QC Penalty?", "Can I combine multiple projects?"];
        let suggestionHTML = `${greeting}<div class='suggestions-container'>`;
        suggestions.forEach(q => { suggestionHTML += `<button class='suggestion-btn'>${q}</button>`; });
        suggestionHTML += "</div>";
        return suggestionHTML;
    }
    
    const initialMessage = getSuggestionMessage("Hello! I am the PCS Calculator assistant. After you run a calculation, you can ask me about the results. Here are some examples:");
    addMessage('bot', { answer: initialMessage });
});
