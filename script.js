// --- GLOBAL STATE ---
const AppState = {
    db: null, teamSettings: {}, bonusTiers: [], calculationSettings: {},
    countingSettings: {}, currentTechStats: {}, lastUsedGsdValue: '3in',
    currentSort: { column: 'payout', direction: 'desc' },
    guidedSetup: {
        currentStep: 1,
        totalSteps: 4,
        tourStep: 0,
        tourElements: []
    }
};

// --- CONSTANTS ---
const CONSTANTS = {
    APP_VERSION: 2.1, // New version number to trigger update modal
    TECH_ID_REGEX: /^\d{4}[a-zA-Z]{2}$/,
    DEFAULT_TEAMS: {
        "Team 123": ["7244AA", "7240HH", "7247JA", "4232JD", "4475JT", "4472JS", "4426KV", "7236LE", "7039NO", "7231NR", "7249SS", "7314VP"],
        "Team 63": ["7089RR", "7102JD", "7161KA", "7159MC", "7168JS", "7158JD", "7167AD", "7040JP", "7178MD", "7092RN", "7170WS"],
        "Team 115": ["4297RQ", "7086LP", "7087LA", "7088MA", "7099SS", "7171AL", "7166CR", "7311JT", "7174MC", "7173ES", "7090JA", "7175JP", "7165GR", "7176CC", "7044AM", "7095KA", "7042NB", "4474HS", "7234CS", "4421AT", "4477PT", "7245SC", "7246AJ", "7247JA", "7251JD", "7241DM", "7248AA", "7233JP", "4435AC", "4135RC", "7242FV", "7315CR", "2274JD", "7243JC"],
        "Team 111": ["4488MD", "7037HP", "4489EA", "7091HA", "7103RE", "7179KB", "7043RP", "7093MG", "7084LQ", "7036RB", "4481JV", "7240HH", "4478JV", "7316NT", "7096AV", "7092RN", "7310DR", "4476JR", "7239EO", "4492CP", "7099SS", "7237ML", "4475JT", "7231NR", "7313MB"]
    },
    DEFAULT_BONUS_TIERS: [
        { min: 90, max: 100, multiplier: 1.5, display: "90% - 100%" },
        { min: 80, max: 89.99, multiplier: 1.25, display: "80% - 89.99%" },
        { min: 70, max: 79.99, multiplier: 1.1, display: "70% - 79.99%" },
        { min: 0, max: 69.99, multiplier: 1.0, display: "Below 70%" },
    ],
    DEFAULT_CALCULATION_SETTINGS: {
        payoutType: 'per_task',
        bonusMultiplierDirect: 1,
        gsdMapping: {
            '1in': 1.00,
            '2in': 0.80,
            '3in': 0.70,
            '4in': 0.60,
            '5in': 0.50,
        },
        pointPerFix: 1,
        pointPerRefix: 0,
        bonusTiers: [],
        techData: {}
    },
    DEFAULT_COUNTING_SETTINGS: {
        qcPenalties: { isEnabled: true, points: 1.0 },
        taskPoints: { isEnabled: true, points: 1.0 },
    },
};

// --- IndexedDB ---
const DB = {
    name: 'BonusCalculatorDB',
    version: 1,
    stores: ['appState'],
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);
            request.onupgradeneeded = e => {
                e.target.result.createObjectStore('appState', { keyPath: 'id' });
            };
            request.onsuccess = e => {
                AppState.db = e.target.result;
                resolve();
            };
            request.onerror = e => reject(e.target.error);
        });
    },
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = AppState.db.transaction(storeName, 'readonly');
            const request = transaction.objectStore(storeName).get(key);
            request.onsuccess = e => resolve(e.target.result);
            request.onerror = e => reject(e.target.error);
        });
    },
    async put(storeName, value) {
        return new Promise((resolve, reject) => {
            const transaction = AppState.db.transaction(storeName, 'readwrite');
            const request = transaction.objectStore(storeName).put(value);
            request.onsuccess = () => resolve();
            request.onerror = e => reject(e.target.error);
        });
    },
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = AppState.db.transaction(storeName, 'readonly');
            const request = transaction.objectStore(storeName).getAll();
            request.onsuccess = e => resolve(e.target.result);
            request.onerror = e => reject(e.target.error);
        });
    },
    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = AppState.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = e => reject(e.target.error);
        });
    }
};

// --- UI Logic ---
const UI = {
    elements: {
        panels: document.querySelectorAll('.panel-content'),
        navLinks: document.querySelectorAll('.nav-link'),
        loadingOverlay: document.getElementById('loading-overlay'),
        projectSelect: document.getElementById('project-select'),
        resultsArea: document.getElementById('results-area'),
        resultsTable: document.getElementById('results-table-container'),
        leaderboardTable: document.getElementById('leaderboard-table-body'),
        summaryGrid: document.getElementById('tech-summary-grid'),
        teamContainer: document.getElementById('teams-container'),
        bonusTiersContainer: document.getElementById('bonus-tiers-container'),
        updateModal: document.getElementById('update-modal'),
        updateResetBtn: document.getElementById('update-reset-btn'),
        updateDismissBtn: document.getElementById('update-dismiss-btn')
    },
    showLoading(button) {
        button.disabled = true;
        button.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
    },
    hideLoading(button) {
        button.disabled = false;
        button.innerHTML = 'Calculate';
    },
    displayResults(techStats) {
        const sortedTechs = Object.values(techStats).sort((a, b) => b.payout - a.payout);
        AppState.currentTechStats = techStats;

        // Populate Results table
        let resultsHtml = `<table class="min-w-full text-sm text-left text-text-color"><thead><tr><th class="py-2 px-1">ID</th><th class="py-2 px-1">Points</th><th class="py-2 px-1">Quality</th><th class="py-2 px-1">Payout</th></tr></thead><tbody>`;
        sortedTechs.slice(0, 10).forEach(tech => {
            const techName = AppState.teamSettings.techNames[tech.id] || tech.id;
            resultsHtml += `<tr class="bg-brand-800 border-b border-border-color hover:bg-brand-700">
                                <td class="py-2 px-1 font-medium text-text-color truncate max-w-[80px]" title="${techName}">${tech.id}</td>
                                <td class="py-2 px-1">${tech.points.toFixed(2)}</td>
                                <td class="py-2 px-1">${((tech.fixTasks / (tech.fixTasks + tech.refixTasks + tech.warnings.length)) * 100).toFixed(1)}%</td>
                                <td class="py-2 px-1 text-accent font-semibold">${tech.payout.toFixed(2)}</td>
                            </tr>`;
        });
        resultsHtml += `</tbody></table>`;
        this.elements.resultsTable.innerHTML = resultsHtml;

        // Populate Leaderboard
        this.updateLeaderboard();

        // Populate TL Summary
        this.updateSummaryGrid();
    },
    updateLeaderboard() {
        const sortedTechs = this.sortTechs(AppState.currentTechStats);
        let leaderboardHtml = '';
        sortedTechs.forEach((tech, index) => {
            const quality = ((tech.fixTasks / (tech.fixTasks + tech.refixTasks + tech.warnings.length)) * 100).toFixed(2);
            leaderboardHtml += `<tr class="bg-brand-800 border-b border-border-color hover:bg-brand-700">
                                <td class="py-2 px-2 font-medium text-text-color">${index + 1}</td>
                                <td class="py-2 px-2">${tech.id}</td>
                                <td class="py-2 px-2">${tech.points.toFixed(2)}</td>
                                <td class="py-2 px-2">${quality}%</td>
                                <td class="py-2 px-2">${tech.fixTasks}</td>
                                <td class="py-2 px-2">${tech.refixTasks}</td>
                                <td class="py-2 px-2">${tech.warnings.length}</td>
                                <td class="py-2 px-2 text-accent font-semibold">${tech.payout.toFixed(2)}</td>
                            </tr>`;
        });
        this.elements.leaderboardTable.innerHTML = leaderboardHtml;
    },
    updateSummaryGrid() {
        const sortedTechs = this.sortTechs(AppState.currentTechStats);
        let summaryHtml = '';
        sortedTechs.forEach(tech => {
            const quality = ((tech.fixTasks / (tech.fixTasks + tech.refixTasks + tech.warnings.length)) * 100).toFixed(2);
            summaryHtml += `
            <div data-tech-id="${tech.id}" class="bg-summary-item-bg p-4 rounded-xl shadow-md text-center">
                <h4 class="text-lg font-bold text-text-color">${tech.id}</h4>
                <p class="text-xs text-text-muted-color mb-2 truncate">${AppState.teamSettings.techNames[tech.id] || 'Name not found'}</p>
                <div class="space-y-2 text-sm">
                    <p>Points: <span class="font-semibold text-accent">${tech.points.toFixed(2)}</span></p>
                    <p>Quality: <span class="font-semibold text-status-${this.getQualityColor(quality)}">${quality}%</span></p>
                    <p>Fixes: <span class="font-semibold">${tech.fixTasks}</span></p>
                    <p>Refixes: <span class="font-semibold">${tech.refixTasks}</span></p>
                    <p>Warnings: <span class="font-semibold">${tech.warnings.length}</span></p>
                    <p>Est. Payout: <span class="font-bold text-accent">${tech.payout.toFixed(2)}</span></p>
                </div>
            </div>`;
        });
        this.elements.summaryGrid.innerHTML = summaryHtml;
    },
    getQualityColor(quality) {
        if (quality >= 90) return 'green';
        if (quality >= 70) return 'orange';
        return 'red';
    },
    applyFilters() {
        const searchTerm = document.getElementById('search-tech-id')?.value.toLowerCase();
        const teamFilter = document.querySelector('input[name="team-filter"]:checked')?.value;
        
        const allCards = this.elements.summaryGrid.querySelectorAll('[data-tech-id]');
        allCards.forEach(card => {
            const techId = card.dataset.techId.toLowerCase();
            const team = this.findTechTeam(techId.toUpperCase());
            const matchesSearch = techId.includes(searchTerm);
            const matchesTeam = teamFilter === 'all' || team === teamFilter;
            
            card.classList.toggle('hidden', !(matchesSearch && matchesTeam));
        });

        const sortSelect = document.getElementById('leaderboard-sort-select');
        if (sortSelect) {
            const [column, direction] = sortSelect.value.split('_');
            AppState.currentSort.column = column;
            AppState.currentSort.direction = direction;
            this.updateLeaderboard();
        }
    },
    findTechTeam(techId) {
        for (const team in AppState.teamSettings.teams) {
            if (AppState.teamSettings.teams[team].includes(techId)) {
                return team;
            }
        }
        return 'undefined_team';
    },
    sortTechs(techStats) {
        const techs = Object.values(techStats);
        return techs.sort((a, b) => {
            let valA, valB;
            switch (AppState.currentSort.column) {
                case 'payout':
                    valA = a.payout;
                    valB = b.payout;
                    break;
                case 'points':
                    valA = a.points;
                    valB = b.points;
                    break;
                case 'quality':
                    valA = a.fixTasks / (a.fixTasks + a.refixTasks + a.warnings.length) || 0;
                    valB = b.fixTasks / (b.fixTasks + b.refixTasks + b.warnings.length) || 0;
                    break;
                case 'fixTasks':
                    valA = a.fixTasks;
                    valB = b.fixTasks;
                    break;
                case 'refixTasks':
                    valA = a.refixTasks;
                    valB = b.refixTasks;
                    break;
                case 'warnings':
                    valA = a.warnings.length;
                    valB = b.warnings.length;
                    break;
                default:
                    valA = a.payout;
                    valB = b.payout;
                    break;
            }
            if (AppState.currentSort.direction === 'asc') {
                return valA - valB;
            }
            return valB - valA;
        });
    },
    updateTotalsDisplay() {
        const totalProjects = AppState.calculationSettings.techData ? Object.keys(AppState.calculationSettings.techData).length : 0;
        const allTechs = new Set();
        const allTasks = new Set();
    
        if (AppState.calculationSettings.techData) {
            Object.values(AppState.calculationSettings.techData).forEach(project => {
                Object.keys(project.techStats).forEach(techId => allTechs.add(techId));
                Object.values(project.techStats).forEach(tech => allTasks.add(tech.fixTasks));
            });
        }
        
        document.getElementById('total-projects').textContent = totalProjects;
        document.getElementById('total-techs').textContent = allTechs.size;
        document.getElementById('total-tasks').textContent = Array.from(allTasks).reduce((acc, tasks) => acc + tasks, 0);
    },
    
    // UI Helpers
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white shadow-lg transition-transform duration-300 ease-out z-[60]`;
        if (type === 'success') notification.classList.add('bg-status-green');
        if (type === 'error') notification.classList.add('bg-status-red');
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('translate-y-full', 'opacity-0');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 3000);
    },
};

// --- Core Logic ---
const Calculator = {
    calculateTotalStats(data) {
        const techStats = {};
        data.forEach(tech => {
            const gsdModifier = AppState.calculationSettings.countingSettings.gsdMapping[tech.gsd.toLowerCase()] || 0.70;
            const points = (tech.fixTasks * AppState.calculationSettings.countingSettings.pointPerFix * gsdModifier) + (tech.refixTasks * AppState.calculationSettings.countingSettings.pointPerRefix);
            if (!techStats[tech.id]) {
                techStats[tech.id] = { id: tech.id, points: 0, fixTasks: 0, refixTasks: 0, warnings: [] };
            }
            techStats[tech.id].points += points;
            techStats[tech.id].fixTasks += tech.fixTasks;
            techStats[tech.id].refixTasks += tech.refixTasks;
            techStats[tech.id].warnings = techStats[tech.id].warnings.concat(tech.warnings);
        });

        // Calculate payout
        Object.values(techStats).forEach(tech => {
            const qualityModifier = this.calculateQualityModifier(tech);
            tech.payout = tech.points * AppState.calculationSettings.bonusMultiplierDirect * qualityModifier;
        });

        return techStats;
    },

    calculateQualityModifier(tech) {
        const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
        const quality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
        
        let bonusMultiplier = 1;
        for (const tier of AppState.bonusTiers) {
            if (quality >= tier.min && quality <= tier.max) {
                bonusMultiplier = tier.multiplier;
                break;
            }
        }
        return bonusMultiplier;
    }
};

// --- File Handling ---
async function handleFile(file) {
    if (file.name.endsWith('.shp')) {
        const dbfFile = [...document.getElementById('file-input').files].find(f => f.name.endsWith('.dbf'));
        if (!dbfFile) {
            UI.showNotification('Please upload the corresponding .dbf file with your .shp file.', 'error');
            return;
        }
        const shpBuffer = await file.arrayBuffer();
        const dbfBuffer = await dbfFile.arrayBuffer();
        try {
            const collection = await shapefile.open(shpBuffer, dbfBuffer);
            const data = [];
            while (true) {
                const result = await collection.read();
                if (result.done) break;
                data.push(result.value.properties);
            }
            parseAndProcessData(data);
        } catch (error) {
            UI.showNotification(`Error parsing shapefile: ${error.message}`, 'error');
        }
    } else if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = e => {
            const text = e.target.result;
            const data = parseCSV(text);
            parseAndProcessData(data);
        };
        reader.readAsText(file);
    } else {
        UI.showNotification('Unsupported file type. Please upload a .csv, .shp, or .dbf file.', 'error');
    }
}

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length !== headers.length) continue;
        const obj = {};
        headers.forEach((header, index) => obj[header] = values[index]);
        data.push(obj);
    }
    return data;
}

function parseAndProcessData(data) {
    const projectData = {
        name: `Project ${Object.keys(AppState.calculationSettings.techData).length + 1}`,
        date: new Date().toISOString().split('T')[0],
        techStats: {}
    };
    const techStats = {};
    data.forEach(row => {
        const techId = row['Tech ID'] || row['tech_id'] || row['TechID'] || '';
        if (!CONSTANTS.TECH_ID_REGEX.test(techId)) return;
        const gsd = row['GSD'] || row['gsd'] || '3in';
        const fixTasks = parseInt(row['Fix Tasks'] || row['fix_tasks'] || row['FixTasks']) || 0;
        const refixTasks = parseInt(row['Refix Tasks'] || row['refix_tasks'] || row['RefixTasks']) || 0;
        const warnings = (row['Warnings'] || row['warnings'] || '').split('').filter(w => w);
        const points = parseFloat(row['Points'] || row['points']) || 0;

        if (!techStats[techId]) {
            techStats[techId] = {
                id: techId,
                gsd: gsd,
                fixTasks: 0,
                refixTasks: 0,
                warnings: [],
                points: 0
            };
        }
        techStats[techId].fixTasks += fixTasks;
        techStats[techId].refixTasks += refixTasks;
        techStats[techId].warnings = techStats[techId].warnings.concat(warnings);
        techStats[techId].points += points;
    });

    projectData.techStats = techStats;
    AppState.calculationSettings.techData[projectData.name] = projectData;
    DB.put('appState', { id: 'calculationSettings', value: AppState.calculationSettings }).then(() => {
        UI.updateTotalsDisplay();
        UI.showNotification(`Project '${projectData.name}' loaded successfully!`);
        updateProjectSelect();
    }).catch(e => UI.showNotification('Error saving project data.', 'error'));
}

async function runCalculation(isCustom = false, idsToRun = []) {
    let combinedTechStats = {};
    const projectsToProcess = isCustom ? idsToRun : Object.keys(AppState.calculationSettings.techData);

    projectsToProcess.forEach(id => {
        const project = AppState.calculationSettings.techData[id];
        if (project) {
            Object.values(project.techStats).forEach(tech => {
                if (!combinedTechStats[tech.id]) {
                    combinedTechStats[tech.id] = { id: tech.id, points: 0, fixTasks: 0, refixTasks: 0, warnings: [] };
                }
                combinedTechStats[tech.id].points += tech.points;
                combinedTechStats[tech.id].fixTasks += tech.fixTasks;
                combinedTechStats[tech.id].refixTasks += tech.refixTasks;
                combinedTechStats[tech.id].warnings = combinedTechStats[tech.id].warnings.concat(tech.warnings);
            });
        }
    });
    
    // Calculate payout
    Object.values(combinedTechStats).forEach(tech => {
        const qualityModifier = Calculator.calculateQualityModifier(tech);
        tech.payout = tech.points * AppState.calculationSettings.bonusMultiplierDirect * qualityModifier;
    });

    UI.displayResults(combinedTechStats);
    UI.showNotification("Calculation complete!");
}

// --- Team Management Logic ---
function loadTeamSettings() {
    DB.get('appState', 'teamSettings').then(savedSettings => {
        if (savedSettings) {
            AppState.teamSettings = savedSettings.value;
        } else {
            AppState.teamSettings = { teams: CONSTANTS.DEFAULT_TEAMS, techNames: {} };
        }
        renderTeamCards();
    });
}
function renderTeamCards() {
    UI.elements.teamContainer.innerHTML = '';
    for (const teamName in AppState.teamSettings.teams) {
        UI.addTeamCard(teamName, AppState.teamSettings.teams[teamName]);
    }
}
function addTeamCard(teamName = `New Team ${Object.keys(AppState.teamSettings.teams).length + 1}`, techIds = []) {
    const card = document.createElement('div');
    card.className = 'team-card bg-brand-700 rounded-xl p-4 shadow-md flex flex-col gap-2';
    card.innerHTML = `
        <div class="flex justify-between items-center">
            <input type="text" value="${teamName}" class="team-name-input bg-transparent text-lg font-semibold text-text-color w-full outline-none border-b border-transparent focus:border-border-color transition-colors duration-200" data-original-name="${teamName}">
            <button class="delete-team-btn text-status-red hover:text-red-400 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
        </div>
        <textarea class="tech-id-input w-full h-32 bg-brand-800 border border-border-color rounded-md p-2 text-sm text-text-color custom-scrollbar focus:ring-accent focus:border-accent" placeholder="Enter Tech IDs, one per line">${techIds.join('\n')}</textarea>
    `;
    UI.elements.teamContainer.appendChild(card);
}
function saveTeamSettings() {
    const teams = {};
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        const teamName = card.querySelector('.team-name-input').value.trim();
        const techIds = card.querySelector('.tech-id-input').value.split('\n').map(id => id.trim().toUpperCase()).filter(id => CONSTANTS.TECH_ID_REGEX.test(id));
        if (teamName && techIds.length > 0) {
            teams[teamName] = techIds;
        }
    });
    AppState.teamSettings.teams = teams;
    DB.put('appState', { id: 'teamSettings', value: AppState.teamSettings }).then(() => {
        UI.showNotification('Team settings saved!');
        UI.applyFilters();
    }).catch(e => UI.showNotification('Error saving team settings.', 'error'));
}

// --- Settings Management Logic ---
function loadSettings() {
    DB.get('appState', 'calculationSettings').then(savedSettings => {
        if (savedSettings) {
            AppState.calculationSettings = savedSettings.value;
        } else {
            AppState.calculationSettings = JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_CALCULATION_SETTINGS));
            AppState.bonusTiers = JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_BONUS_TIERS));
        }
        renderSettings();
    });
}
function renderSettings() {
    document.getElementById('payoutType').value = AppState.calculationSettings.payoutType;
    document.getElementById('bonusMultiplierDirect').value = AppState.calculationSettings.bonusMultiplierDirect;
    document.getElementById('pointPerFix').value = AppState.calculationSettings.countingSettings.pointPerFix;
    document.getElementById('pointPerRefix').value = AppState.calculationSettings.countingSettings.pointPerRefix;
    renderBonusTiers();
}
function renderBonusTiers() {
    UI.elements.bonusTiersContainer.innerHTML = '';
    AppState.bonusTiers.forEach((tier, index) => {
        const tierHtml = `
            <div class="bonus-tier-item flex gap-4 items-center p-2 rounded-md bg-brand-800">
                <input type="number" data-key="min" value="${tier.min}" class="w-1/4 bg-input-bg border-border-color rounded-md p-2 text-sm text-text-color focus:ring-accent focus:border-accent">
                <input type="number" data-key="max" value="${tier.max}" class="w-1/4 bg-input-bg border-border-color rounded-md p-2 text-sm text-text-color focus:ring-accent focus:border-accent">
                <input type="number" data-key="multiplier" step="0.01" value="${tier.multiplier}" class="w-1/4 bg-input-bg border-border-color rounded-md p-2 text-sm text-text-color focus:ring-accent focus:border-accent">
                <button class="remove-tier-btn w-1/4 bg-status-red text-white py-2 rounded-xl text-sm hover:bg-red-400 transition-colors duration-200">Remove</button>
            </div>
        `;
        UI.elements.bonusTiersContainer.insertAdjacentHTML('beforeend', tierHtml);
    });
}
function saveSettings() {
    AppState.calculationSettings.payoutType = document.getElementById('payoutType').value;
    AppState.calculationSettings.bonusMultiplierDirect = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
    AppState.calculationSettings.countingSettings.pointPerFix = parseFloat(document.getElementById('pointPerFix').value) || 1;
    AppState.calculationSettings.countingSettings.pointPerRefix = parseFloat(document.getElementById('pointPerRefix').value) || 0;
    
    const tierInputs = document.querySelectorAll('.bonus-tier-item');
    AppState.bonusTiers = [];
    tierInputs.forEach(item => {
        const min = parseFloat(item.querySelector('[data-key="min"]').value);
        const max = parseFloat(item.querySelector('[data-key="max"]').value);
        const multiplier = parseFloat(item.querySelector('[data-key="multiplier"]').value);
        if (!isNaN(min) && !isNaN(max) && !isNaN(multiplier)) {
            AppState.bonusTiers.push({ min, max, multiplier });
        }
    });

    DB.put('appState', { id: 'calculationSettings', value: AppState.calculationSettings }).then(() => {
        DB.put('appState', { id: 'bonusTiers', value: AppState.bonusTiers }).then(() => {
            UI.showNotification('Settings saved!');
        });
    }).catch(e => UI.showNotification('Error saving settings.', 'error'));
}

// --- Initialization ---
function listen(selector, event, handler) {
    document.getElementById(selector)?.addEventListener(event, handler);
}

function updateProjectSelect() {
    UI.elements.projectSelect.innerHTML = Object.keys(AppState.calculationSettings.techData).map(name => `<option value="${name}">${name}</option>`).join('');
}

function handleUpdateNotification() {
    DB.get('appState', 'appVersion').then(result => {
        const lastVersion = result ? result.value : 0;
        if (lastVersion < CONSTANTS.APP_VERSION) {
            UI.elements.updateModal.classList.remove('hidden');
        }
    });

    UI.elements.updateResetBtn.addEventListener('click', () => {
        // Clear saved settings but keep project data
        DB.clearStore('appState').then(() => {
            DB.put('appState', { id: 'appVersion', value: CONSTANTS.APP_VERSION });
            location.reload(); // Refresh the page to apply new defaults
        });
    });

    UI.elements.updateDismissBtn.addEventListener('click', () => {
        UI.elements.updateModal.classList.add('hidden');
        DB.put('appState', { id: 'appVersion', value: CONSTANTS.APP_VERSION });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await DB.open();
    await loadSettings();
    await loadTeamSettings();
    updateProjectSelect();
    UI.updateTotalsDisplay();
    UI.applyFilters();
    handleUpdateNotification();
    
    // Panel navigation
    UI.elements.navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const panelId = e.currentTarget.dataset.panel;
            UI.elements.panels.forEach(panel => { panel.classList.add('hidden'); });
            document.getElementById(`${panelId}-panel`).classList.remove('hidden');
            UI.elements.navLinks.forEach(nav => { nav.classList.remove('active'); });
            e.currentTarget.classList.add('active');
        });
    });

    // Modals
    listen('guided-setup-btn', 'click', () => UI.openModal('guided-setup-modal'));
    listen('manage-teams-btn', 'click', () => UI.openModal('teams-modal'));
    listen('advanced-settings-btn', 'click', () => UI.openModal('settings-modal'));

    // Guided setup logic
    let currentStep = 1;
    const totalSteps = 4;
    function updateSetupModal() {
        document.querySelectorAll('.setup-step').forEach(step => step.classList.add('hidden'));
        document.getElementById(`setup-step-${currentStep}`).classList.remove('hidden');
        document.getElementById('setup-prev-btn').disabled = currentStep === 1;
        document.getElementById('setup-next-btn').textContent = currentStep === totalSteps ? 'Done' : 'Next';
    }
    listen('setup-next-btn', 'click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateSetupModal();
        } else {
            document.getElementById('guided-setup-modal').classList.add('hidden');
        }
    });
    listen('setup-prev-btn', 'click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateSetupModal();
        }
    });

    // Team management listeners
    listen('add-team-btn', 'click', () => addTeamCard());
    listen('save-teams-btn', 'click', () => saveTeamSettings());
    listen('refresh-teams-btn', 'click', () => {
        AppState.teamSettings.teams = JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_TEAMS));
        renderTeamCards();
        UI.showNotification('Team settings reset to default. Click "Save Changes" to confirm.');
    });
    UI.elements.teamContainer.addEventListener('click', e => {
        if (e.target.closest('.delete-team-btn')) {
            const card = e.target.closest('.team-card');
            card.remove();
        }
    });

    // Advanced settings listeners
    listen('add-tier-btn', 'click', () => {
        AppState.bonusTiers.push({ min: 0, max: 0, multiplier: 1 });
        renderBonusTiers();
    });
    listen('save-settings-btn', 'click', () => saveSettings());
    listen('reset-settings-btn', 'click', () => {
        AppState.calculationSettings = JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_CALCULATION_SETTINGS));
        AppState.bonusTiers = JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_BONUS_TIERS));
        renderSettings();
        UI.showNotification('Settings reset to default. Click "Save Changes" to confirm.');
    });

    // File handling
    listen('file-input', 'change', e => handleFile(e.target.files[0]));
    listen('drop-zone', 'drop', e => handleFile(e.dataTransfer.files[0]));
    listen('calculate-btn', 'click', async e => {
        const button = e.currentTarget;
        const isCustom = document.getElementById('customize-calc-all-cb').checked;
        const idsToRun = isCustom ? [...UI.elements.projectSelect.selectedOptions].map(opt => opt.value) : [];
        UI.showLoading(button);
        if (isCustom && idsToRun.length === 0) alert("Select projects from the list to calculate.");
        else if (idsToRun.length > 0) await runCalculation(true, idsToRun);
        UI.hideLoading(button);
    });
    listen('customize-calc-all-cb', 'change', e => {
        const selectEl = document.getElementById('project-select');
        const isChecked = e.target.checked;
        selectEl.multiple = isChecked; selectEl.size = isChecked ? 6 : 1;
        document.getElementById('calculate-btn').disabled = isChecked;
    });
    listen('search-tech-id', 'input', UI.applyFilters.bind(UI));
    listen('team-filter-container', 'change', UI.applyFilters.bind(UI));
    listen('refresh-teams-btn', 'click', UI.loadTeamSettings.bind(UI));
    listen('leaderboard-sort-select', 'change', () => UI.applyFilters());
    listen('add-team-btn', 'click', () => UI.addTeamCard());
    listen('save-teams-btn', 'click', () => saveTeamSettings());
    listen('drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.add('bg-brand-700'); });
    listen('drop-zone', 'dragleave', e => e.target.closest('#drop-zone').classList.remove('bg-brand-700'));
    listen('drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.remove('bg-brand-700'); handleFile(e.dataTransfer.files[0]); });
    
    // Modal close logic
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) modal.classList.add('hidden');
        });
    });

    // Chatbot close button
    document.getElementById('chatbot-close-btn').addEventListener('click', () => {
        document.getElementById('chatbot-window').classList.add('hidden');
    });
});
