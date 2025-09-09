document.addEventListener('DOMContentLoaded', () => {
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let isOpen = false;
    let consecutiveMisses = 0;
    let currentTechIdContext = null;
    let conversationHistory = [];

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

    // Handle user clicking on a suggestion button
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
        getBotResponse(userMessage);
    }

    // Add a message to the chat window
    function addMessage(sender, messageData, nextActionContext = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        if (sender === 'user') {
            bubble.textContent = messageData;
            chatbotInput.value = '';
            conversationHistory.push(messageData.toLowerCase());
            if (conversationHistory.length > 5) {
                conversationHistory.shift();
            }
        } else {
            bubble.innerHTML = messageData;
        }
        
        messageElement.appendChild(bubble);
        chatbotMessages.appendChild(messageElement);

        if (sender === 'bot' && nextActionContext && conversationDepth < 2) {
            const nextActionsMenu = getSuggestionMessage("What would you like to do next?", nextActionContext);
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
        if (typeof AppState === 'undefined' || !AppState.currentTechStats || Object.keys(AppState.currentTechStats).length === 0) {
            return { error: "no_calculation" };
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

    // --- Main Response Logic ---
    async function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        
        const techIdRegex = /(\d{4}[A-Z]{2})/;
        const potentialIdMatch = lowerCaseMessage.toUpperCase().match(techIdRegex);
        
        if (potentialIdMatch && potentialIdMatch[0] === currentTechIdContext) {
            conversationDepth++;
        } else {
            conversationDepth = 1;
        }
        
        if (potentialIdMatch) currentTechIdContext = potentialIdMatch[0];

        // --- 1. Quick Summary / Top Performer Questions ---
        const summaryKeywords = ["who", "top", "best", "most", "leader"];
        const isAskingForSummaryLeader = summaryKeywords.some(keyword => lowerCaseMessage.includes(keyword));

        if (isAskingForSummaryLeader) {
            conversationDepth = 1;
            if (typeof AppState === 'undefined' || !AppState.currentTechStats || Object.keys(AppState.currentTechStats).length === 0) {
                await handleNoCalculationError();
                return;
            }
            const techArray = Object.values(AppState.currentTechStats);
            if (lowerCaseMessage.includes('point')) {
                const topTech = techArray.reduce((top, tech) => !top || tech.points > top.points ? tech : top, null);
                addMessage('bot', `The tech with the most points is <b>${topTech.id}</b> with <b>${topTech.points.toFixed(2)}</b> points.`, 'summary'); return;
            }
            if (lowerCaseMessage.includes('task')) {
                const topTech = techArray.reduce((top, tech) => !top || tech.fixTasks > top.fixTasks ? tech : top, null);
                addMessage('bot', `The tech with the most tasks is <b>${topTech.id}</b> with <b>${topTech.fixTasks}</b> tasks.`, 'summary'); return;
            }
            if (lowerCaseMessage.includes('refix')) {
                const topTech = techArray.reduce((top, tech) => !top || tech.refixTasks > top.refixTasks ? tech : top, null);
                if (topTech && topTech.refixTasks > 0) { addMessage('bot', `The tech with the most refixes is <b>${topTech.id}</b> with <b>${topTech.refixTasks}</b> refixes.`, 'summary'); }
                else { addMessage('bot', "Good news! No one has any refixes in this calculation.", 'summary'); }
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
                addMessage('bot', `The tech(s) with the best quality are ${topTechIds} with <b>${maxQuality.toFixed(2)}%</b>.`, 'summary'); return;
            }
        }
        
        // --- 2. Specific Tech Stat Questions (using context) ---
        const metricKeywords = ['quality', 'point', 'task', 'refix', 'warning', 'payout', 'bonus', 'summary', 'all', 'everything', 'details'];
        const isAskingForSpecificStat = metricKeywords.some(keyword => lowerCaseMessage.includes(keyword));

        if (isAskingForSpecificStat) {
            if (currentTechIdContext) {
                const techId = currentTechIdContext;
                const summary = getTechStatSummary(techId);
                if (summary.error) {
                    if (summary.error === 'no_calculation') { await handleNoCalculationError(); }
                    else { addMessage('bot', summary.error, 'general'); }
                    return;
                }
                if (lowerCaseMessage.includes('summary') || lowerCaseMessage.includes('all')) {
                    const fullSummary = `Here is the full summary for <b>${techId}</b>:<br>- <b>Points:</b> ${summary.points}<br>- <b>Fix Tasks:</b> ${summary.fixTasks}<br>- <b>Refix Tasks:</b> ${summary.refixTasks}<br>- <b>Warnings:</b> ${summary.warnings}<br>- <b>Fix Quality:</b> ${summary.quality}<br>- <b>Bonus Earned:</b> ${summary.bonusEarned}<br>- <b>Est. Payout:</b> ${summary.payout}`;
                    addMessage('bot', fullSummary, 'stats'); return;
                }
                const metrics = {'quality': `Tech ${techId} has a <b>Fix Quality of ${summary.quality}</b>.`, 'point': `Tech ${techId} has <b>${summary.points} points</b>.`, 'task': `Tech ${techId} completed <b>${summary.fixTasks} primary fix tasks</b>.`, 'refix': `Tech ${techId} has <b>${summary.refixTasks} refix tasks</b>.`, 'warning': `Tech ${techId} has <b>${summary.warnings} warnings</b>.`, 'payout': `The calculated <b>payout for ${techId} is ${summary.payout}</b>.`, 'bonus': `Tech ${techId} has a <b>Bonus Earned % of ${summary.bonusEarned}</b>.`};
                for (const metric in metrics) {
                    if (lowerCaseMessage.includes(metric)) { addMessage('bot', metrics[metric], 'stats'); return; }
                }
            } else { addMessage('bot', "Which Tech ID are you asking about?", 'general'); return; }
        }

        // --- 3. Tech Name Lookups ---
        if (potentialIdMatch) {
            const foundId = potentialIdMatch[0];
            if (techNameDatabase[foundId]) {
                addMessage('bot', `Tech ID ${foundId} belongs to ${techNameDatabase[foundId]}.`, 'stats');
                consecutiveMisses = 0; return;
            }
        }
        
        // --- 4. Fallback to General Knowledge Base ---
        currentTechIdContext = null;
        conversationDepth = 0;
        let bestMatch = { score: 0, answer: "I'm sorry, I don't know the answer to that." };
        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(keyword => { if (lowerCaseMessage.includes(keyword)) score++; });
            if (score > bestMatch.score) bestMatch = item;
        });

        if (bestMatch.score > 0) {
            consecutiveMisses = 0;
            addMessage('bot', bestMatch.answer, 'general');
        } else {
            consecutiveMisses++;
            if (consecutiveMisses >= 3) {
                consecutiveMisses = 0;
                addMessage('bot', getSuggestionMessage("I'm having trouble understanding. Maybe you can try one of these questions:", 'initial'), null);
            } else {
                addMessage('bot', bestMatch.answer, null);
            }
        }
    }

    async function handleNoCalculationError() {
        addMessage('bot', "You need to run a calculation first. Please use the main interface to calculate a project.", 'general');
    }

    function getSuggestionMessage(greeting, context = 'initial') {
        let suggestions = [];
        const techIdExample = currentTechIdContext || "7249SS";

        switch (context) {
            case 'stats':
                suggestions = [`Summary for ${techIdExample}`, `What is the quality of ${techIdExample}?`, `Payout for ${techIdExample}`];
                break;
            case 'summary':
                suggestions = ["Who has the best quality?", "Who has the most tasks?", "Summary for 7249SS"];
                break;
            case 'general':
                suggestions = ["How do I use the calculator?", "What is a QC Penalty?", "How do I manage my teams?"];
                break;
            default: // 'initial'
                suggestions = ["Summary for 7249SS", "Who has the most points?", "How do I use the calculator?", "What is a QC Penalty?", "How do I manage my teams?"];
                break;
        }
        
        const filteredSuggestions = suggestions.filter(q => !conversationHistory.includes(q.toLowerCase()));
        let suggestionHTML = `${greeting}<div class='suggestions-container'>`;
        if (filteredSuggestions.length > 0) {
            filteredSuggestions.forEach(q => {
                suggestionHTML += `<button class='suggestion-btn'>${q}</button>`;
            });
        }
        suggestionHTML += "</div>";
        return suggestionHTML;
    }
    
    // Initial bot message with suggestions
    const initialMessage = getSuggestionMessage("Hello! I am the PCS Calculator assistant. Here are some things you can ask:", 'initial');
    addMessage('bot', initialMessage, null);
});
