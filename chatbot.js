document.addEventListener('DOMContentLoaded', () => {
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let isOpen = false;
    let consecutiveMisses = 0;
    let currentTechIdContext = null;
    let lastOfferedAction = null; // --- NEW: Add short-term memory for actions ---

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

    // Handle user clicking on a suggestion or action button
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
            performAction(actionType, actionValue);
        }
    });

    function handleUserInput() {
        const userMessage = chatbotInput.value.trim();
        addMessage('user', userMessage);
        getBotResponse(userMessage);
    }

    // --- NEW: Central function to perform actions ---
    function performAction(type, value) {
        if (type === 'open_modal' && typeof window.UI !== 'undefined') {
            window.UI.openModal(value);
        }
        lastOfferedAction = null; // Clear memory after action is taken
    }

    // Add a message to the chat window
    function addMessage(sender, messageData, showNextActions = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        if (sender === 'user') {
            bubble.textContent = messageData;
            chatbotInput.value = '';
        } else {
            let messageText = typeof messageData === 'string' ? messageData : messageData.answer;
            bubble.innerHTML = messageText;

            if (typeof messageData.action !== 'undefined') {
                const action = messageData.action;
                lastOfferedAction = action; // --- NEW: Remember the action ---
                const actionButton = document.createElement('button');
                actionButton.className = 'action-btn';
                actionButton.textContent = action.label;
                actionButton.dataset.actionType = action.type;
                actionButton.dataset.actionValue = action.value;
                bubble.appendChild(actionButton);
            } else {
                lastOfferedAction = null; // Clear memory if no action is offered
            }
        }
        
        messageElement.appendChild(bubble);
        chatbotMessages.appendChild(messageElement);

        if (sender === 'bot' && showNextActions) {
            const nextActionsMenu = getSuggestionMessage("What would you like to do next?");
            setTimeout(() => {
                const menuElement = document.createElement('div');
                menuElement.className = 'chatbot-message bot';
                menuElement.innerHTML = `<div class="message-bubble">${nextActionsMenu}</div>`;
                chatbotMessages.appendChild(menuElement);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }, 700);
        }
        
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function getTechStatSummary(techId) {
        // ... (This function remains the same as the previous version)
        if (typeof AppState === 'undefined' || !AppState.currentTechStats || Object.keys(AppState.currentTechStats).length === 0) { return { error: "No calculation has been run yet. Please calculate a project first." }; }
        const techData = AppState.currentTechStats[techId];
        if (!techData) { return { error: `I couldn't find any results for Tech ID ${techId} in the current calculation.` }; }
        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
        const denominator = techData.fixTasks + techData.refixTasks + techData.warnings.length;
        const quality = denominator > 0 ? (techData.fixTasks / denominator) * 100 : 0;
        const qualityModifier = Calculator.calculateQualityModifier(quality);
        const bonusEarned = qualityModifier * 100;
        const payout = techData.points * bonusMultiplier * qualityModifier;
        return { id: techId, points: techData.points.toFixed(3), fixTasks: techData.fixTasks, refixTasks: techData.refixTasks, warnings: techData.warnings.length, quality: `${quality.toFixed(2)}%`, bonusEarned: `${bonusEarned.toFixed(2)}%`, payout: payout.toFixed(2) };
    }

    // --- Main Response Logic ---
    function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        
        // --- NEW: Check for affirmative response to a remembered action ---
        const affirmativeResponses = ['yes', 'yep', 'sure', 'ok', 'okay', 'do it', 'open it'];
        if (lastOfferedAction && affirmativeResponses.includes(lowerCaseMessage)) {
            performAction(lastOfferedAction.type, lastOfferedAction.value);
            return;
        }

        const techIdRegex = /(\d{4}[A-Z]{2})/;
        const potentialIdMatch = lowerCaseMessage.toUpperCase().match(techIdRegex);
        if (potentialIdMatch) currentTechIdContext = potentialIdMatch[0];

        // --- 1. Handle Quick Summary / Top Performer Questions ---
        const summaryKeywords = ["who", "top", "best", "most", "leader"];
        const isAskingForSummaryLeader = summaryKeywords.some(keyword => lowerCaseMessage.includes(keyword));

        if (isAskingForSummaryLeader) {
             if (typeof AppState === 'undefined' || !AppState.currentTechStats || Object.keys(AppState.currentTechStats).length === 0) {
                addMessage('bot', "You need to run a calculation first before I can find the top performers.", true);
                return;
            }
            const techArray = Object.values(AppState.currentTechStats);

            if (lowerCaseMessage.includes('point')) {
                const topTech = techArray.reduce((top, tech) => !top || tech.points > top.points ? tech : top, null);
                addMessage('bot', `The tech with the most points is <b>${topTech.id}</b> with <b>${topTech.points.toFixed(2)}</b> points.`, true);
                return;
            }
            if (lowerCaseMessage.includes('task')) {
                const topTech = techArray.reduce((top, tech) => !top || tech.fixTasks > top.fixTasks ? tech : top, null);
                addMessage('bot', `The tech with the most tasks is <b>${topTech.id}</b> with <b>${topTech.fixTasks}</b> tasks.`, true);
                return;
            }
            if (lowerCaseMessage.includes('refix')) {
                const topTech = techArray.reduce((top, tech) => !top || tech.refixTasks > top.refixTasks ? tech : top, null);
                if (topTech && topTech.refixTasks > 0) {
                    addMessage('bot', `The tech with the most refixes is <b>${topTech.id}</b> with <b>${topTech.refixTasks}</b> refixes.`, true);
                } else {
                    addMessage('bot', "Good news! No one has any refixes in this calculation.", true);
                }
                return;
            }
            if (lowerCaseMessage.includes('quality')) {
                const techArrayWithQuality = techArray.map(tech => {
                    const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
                    const quality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
                    return { ...tech, quality };
                });
                const maxQuality = Math.max(...techArrayWithQuality.map(t => t.quality), 0);
                const topTechs = techArrayWithQuality.filter(t => t.quality === maxQuality);
                const topTechIds = topTechs.map(t => `<b>${t.id}</b>`).join(', ');
                addMessage('bot', `The tech(s) with the best quality are ${topTechIds} with <b>${maxQuality.toFixed(2)}%</b>.`, true);
                return;
            }
        }
        
        // --- 2. Handle Specific Tech Stat Questions (using context) ---
        const metricKeywords = ['quality', 'point', 'task', 'refix', 'warning', 'payout', 'bonus', 'summary', 'all', 'everything', 'details'];
        const isAskingForSpecificStat = metricKeywords.some(keyword => lowerCaseMessage.includes(keyword));

        if (isAskingForSpecificStat) {
            if (currentTechIdContext) {
                const techId = currentTechIdContext;
                const summary = getTechStatSummary(techId);
                if (summary.error) { addMessage('bot', summary.error, true); return; }

                if (lowerCaseMessage.includes('summary') || lowerCaseMessage.includes('all') || lowerCaseMessage.includes('everything') || lowerCaseMessage.includes('details')) {
                    const fullSummary = `Here is the full summary for <b>${techId}</b>:<br>- <b>Points:</b> ${summary.points}<br>- <b>Fix Tasks:</b> ${summary.fixTasks}<br>- <b>Refix Tasks:</b> ${summary.refixTasks}<br>- <b>Warnings:</b> ${summary.warnings}<br>- <b>Fix Quality:</b> ${summary.quality}<br>- <b>Bonus Earned:</b> ${summary.bonusEarned}<br>- <b>Est. Payout:</b> ${summary.payout}`;
                    addMessage('bot', fullSummary, true); return;
                }
                const metrics = {'quality': `Tech ${techId} has a <b>Fix Quality of ${summary.quality}</b>.`, 'point': `Tech ${techId} has <b>${summary.points} points</b>.`, 'task': `Tech ${techId} completed <b>${summary.fixTasks} primary fix tasks</b>.`, 'refix': `Tech ${techId} has <b>${summary.refixTasks} refix tasks</b>.`, 'warning': `Tech ${techId} has <b>${summary.warnings} warnings</b>.`, 'payout': `The calculated <b>payout for ${techId} is ${summary.payout}</b>.`, 'bonus': `Tech ${techId} has a <b>Bonus Earned % of ${summary.bonusEarned}</b>.`};
                for (const metric in metrics) {
                    if (lowerCaseMessage.includes(metric)) { addMessage('bot', metrics[metric], true); return; }
                }
            } else { addMessage('bot', "Which Tech ID are you asking about? For example: 'What is the quality of 7249SS?'", true); return; }
        }

        // --- 3. Handle Tech Name Lookups ---
        if (potentialIdMatch) {
            const foundId = potentialIdMatch[0];
            if (techNameDatabase[foundId]) {
                addMessage('bot', `Tech ID ${foundId} belongs to ${techNameDatabase[foundId]}.`, true);
                consecutiveMisses = 0; return;
            }
        }
        
        // --- 4. Fallback to General Knowledge Base ---
        currentTechIdContext = null;
        let bestMatch = { score: 0, answer: "I'm sorry, I don't know the answer to that." };
        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(keyword => { if (lowerCaseMessage.includes(keyword)) score++; });
            if (score > bestMatch.score) bestMatch = item;
        });

        if (bestMatch.score > 0) {
            consecutiveMisses = 0;
            addMessage('bot', bestMatch, true);
        } else {
            consecutiveMisses++;
            if (consecutiveMisses >= 3) {
                consecutiveMisses = 0;
                addMessage('bot', { answer: getSuggestionMessage("I'm having trouble understanding. Maybe you can try one of these questions:") });
            } else {
                addMessage('bot', bestMatch.answer);
            }
        }
    }

    function getSuggestionMessage(greeting) {
        const suggestions = [ "Summary for 7249SS", "Who has the most points?", "How do I use the calculator?", "What is a QC Penalty?", "Open Team Manager", "Open Advance Settings" ];
        let suggestionHTML = `${greeting}<div class='suggestions-container'>`;
        suggestions.forEach(q => { suggestionHTML += `<button class='suggestion-btn'>${q}</button>`; });
        suggestionHTML += "</div>";
        return suggestionHTML;
    }
    
    // Initial bot message with suggestions
    const initialMessage = getSuggestionMessage("Hello! I am the PCS Calculator assistant. Here are some things you can ask:");
    addMessage('bot', { answer: initialMessage });
});
