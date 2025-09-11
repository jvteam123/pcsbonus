/**
 * PCS Bonus Calculator Refactored Script
 * Author: Renzku & Gemini
 * Version: 3.2 (Complete & Corrected Refactor)
 */

// --- GLOBAL STATE & CONSTANTS ---
const AppState = {
    db: null, // IndexedDB instance
    teamSettings: {},
    bonusTiers: [],
    calculationSettings: {},
    countingSettings: {},
    currentTechStats: {},
    lastUsedGsdValue: '3in',
    currentSort: { column: 'payout', direction: 'desc' },
    guidedSetup: {
        currentStep: 1,
        totalSteps: 4,
        tourStep: 0,
        tourElements: []
    },
    firebase: {
        isAdmin: false
    }
};

const CONSTANTS = {
    TECH_ID_REGEX: /^\d{4}[a-zA-Z]{2}$/,
    ADMIN_EMAIL: 'ev.lorens.ebrado@gmail.com',
    DEFAULT_TEAMS: {
        "Team 123": ["7244AA", "7240HH", "7247JA", "4232JD", "4475JT", "4472JS", "4426KV", "7236LE", "7039NO", "7231NR", "7249SS", "7314VP"],
        "Team 63": ["7089RR", "7102JD", "7161KA", "7159MC", "7168JS", "7158JD", "7167AD", "7040JP", "7178MD", "7092RN", "7170WS"],
        "Team 115": ["4297RQ", "7086LP", "7087LA", "7088MA", "7099SS", "7171AL", "7311JT", "7173ES", "7175JP", "7084LQ", "7044AM"],
        "Team 57": ["4488MD", "7096AV", "4489EA", "7103RE", "7043RP", "7093MG", "7166CR", "7090JA", "7165GR", "7176CC"],
        "Team 114": ["7042NB", "7234CS", "7313MB", "7036RB", "4478JV", "7239EO", "4477PT", "7251JD", "4135RC", "7315CR", "7243JC"],
        "Team 64": ["4474HS", "4492CP", "4421AT", "7237ML", "7233JP", "7316NT", "7245SC", "4476JR", "7246AJ", "7241DM", "4435AC", "7242FV", "2274JD"]
    },
    DEFAULT_BONUS_TIERS: [
        { quality: 100, bonus: 1.20 }, { quality: 99.5, bonus: 1.18 }, { quality: 99, bonus: 1.16 }, { quality: 98.5, bonus: 1.14 }, { quality: 98, bonus: 1.12 },
        { quality: 97.5, bonus: 1.10 }, { quality: 97, bonus: 1.08 }, { quality: 96.5, bonus: 1.06 }, { quality: 96, bonus: 1.04 }, { quality: 95.5, bonus: 1.02 },
        { quality: 95, bonus: 1.00 }, { quality: 94.5, bonus: 0.99 }, { quality: 94, bonus: 0.98 }, { quality: 93.5, bonus: 0.97 }, { quality: 93, bonus: 0.96 },
        { quality: 92.5, bonus: 0.95 }, { quality: 92, bonus: 0.94 }, { quality: 91.5, bonus: 0.93 }, { quality: 91, bonus: 0.91 }, { quality: 90.5, bonus: 0.90 },
        { quality: 90, bonus: 0.88 }, { quality: 89.5, bonus: 0.87 }, { quality: 89, bonus: 0.85 }, { quality: 88.5, bonus: 0.83 }, { quality: 88, bonus: 0.80 },
        { quality: 87.5, bonus: 0.78 }, { quality: 87, bonus: 0.75 }, { quality: 86.5, bonus: 0.73 }, { quality: 86, bonus: 0.70 }, { quality: 85.5, bonus: 0.68 },
        { quality: 85, bonus: 0.66 }, { quality: 84.5, bonus: 0.64 }, { quality: 84, bonus: 0.62 }, { quality: 83.5, bonus: 0.60 }, { quality: 83, bonus: 0.57 },
        { quality: 82.5, bonus: 0.55 }, { quality: 82, bonus: 0.50 }, { quality: 81.5, bonus: 0.45 }, { quality: 81, bonus: 0.40 }, { quality: 80.5, bonus: 0.35 },
        { quality: 80, bonus: 0.30 }, { quality: 79.5, bonus: 0.25 }, { quality: 79, bonus: 0.20 }, { quality: 78.5, bonus: 0.15 }, { quality: 78, bonus: 0.10 },
        { quality: 77.5, bonus: 0.05 }
    ],
    DEFAULT_CALCULATION_SETTINGS: {
        irModifierValue: 1.5,
        points: { qc: 0.125, i3qa: 0.08333333333333333, rv1: 0.2, rv1_combo: 0.25, rv2: 0.5 },
        categoryValues: {
            1: { "3in": 2.19, "4in": 2.19, "6in": 2.19, "9in": 0.99 }, 2: { "3in": 5.86, "4in": 5.86, "6in": 5.86, "9in": 2.07 },
            3: { "3in": 7.44, "4in": 7.44, "6in": 7.44, "9in": 2.78 }, 4: { "3in": 2.29, "4in": 2.29, "6in": 2.29, "9in": 1.57 },
            5: { "3in": 1.55, "4in": 1.55, "6in": 1.55, "9in": 0.6 },  6: { "3in": 1.84, "4in": 1.84, "6in": 1.84, "9in": 0.78 },
            7: { "3in": 1, "4in": 1, "6in": 1, "9in": 1 },            8: { "3in": 3.74, "4in": 3.74, "6in": 3.74, "9in": 3.74 },
            9: { "3in": 1.73, "4in": 1.73, "6in": 1.73, "9in": 1.73 }
        }
    },
    DEFAULT_COUNTING_SETTINGS: {
       taskColumns: { qc: ['qc_id'], i3qa: ['i3qa_id'], rv1: ['rv1_id'], rv2: ['rv2_id'] },
        triggers: {
            refix: { labels: ['i'], columns: ['rv1_label', 'rv2_label', 'rv3_label'] },
            miss: { labels: ['m', 'c'], columns: ['i3qa_label', 'rv1_label', 'rv2_label', 'rv3_label'] },
            warning: { labels: ['b', 'c', 'd', 'e', 'f', 'g', 'i'], columns: ['r1_warn', 'r2_warn', 'r3_warn', 'r4_warn'] },
            qcPenalty: { labels: ['m', 'e'], columns: ['i3qa_label'] }
        }
    }
};

// --- DOM SELECTOR UTILITY ---
const DOMElements = {
    // Main Page Components
    projectSelect: document.querySelector('[data-input="project-select"]'),
    projectIrBadge: document.querySelector('[data-component="project-ir-badge"]'),
    editLocalProjectBtn: document.querySelector('[data-action="edit-local-project"]'),
    deleteLocalProjectBtn: document.querySelector('[data-action="delete-local-project"]'),
    dropZone: document.querySelector('[data-component="drop-zone"]'),
    techDataInput: document.querySelector('[data-input="project-data"]'),
    projectNameInput: document.querySelector('[data-input="project-name"]'),
    projectIsIrCheckbox: document.querySelector('[data-input="project-is-ir"]'),
    projectGsdSelect: document.querySelector('[data-input="project-gsd"]'),
    saveLocalProjectBtn: document.querySelector('[data-action="save-local-project"]'),
    cancelEditLocalProjectBtn: document.querySelector('[data-action="cancel-edit-local-project"]'),
    bonusMultiplierInput: document.querySelector('[data-input="bonus-multiplier"]'),
    customizeCalcAllCheckbox: document.querySelector('[data-input="customize-calc-all-cb"]'),
    leaderboardSortSelect: document.querySelector('[data-input="leaderboard-sort"]'),
    leaderboardBody: document.querySelector('[data-component="leaderboard-body"]'),
    leaderboardMetricHeader: document.querySelector('[data-component="leaderboard-metric-header"]'),
    teamQualityContainer: document.querySelector('[data-component="team-quality-container"]'),
    fix4BreakdownContainer: document.querySelector('[data-component="fix4-breakdown-container"]'),
    quickSummaryContainer: document.querySelector('[data-component="quick-summary-container"]'),
    resultsTitle: document.querySelector('[data-component="results-title"]'),
    teamFilterContainer: document.querySelector('[data-component="team-filter-container"]'),
    techResultsBody: document.querySelector('[data-component="tech-results-body"]'),

    // Modals & Banners
    notification: document.querySelector('[data-component="notification"]'),
    updateBanner: document.querySelector('[data-component="update-banner"]'),
    updateBannerText: document.querySelector('[data-component="update-banner-text"]'),
    
    // Admin Portal
    adminLoginView: document.querySelector('[data-component="admin-login-view"]'),
    adminPanelView: document.querySelector('[data-component="admin-panel-view"]'),
    adminFormTitle: document.querySelector('[data-component="admin-form-title"]'),
    adminProjectIdInput: document.querySelector('[data-input="admin-project-id"]'),
    adminProjectNameInput: document.querySelector('[data-input="admin-project-name"]'),
    adminGsdSelect: document.querySelector('[data-input="admin-gsd-select"]'),
    adminIsIrCheckbox: document.querySelector('[data-input="admin-is-ir-checkbox"]'),
    adminDropZone: document.querySelector('[data-component="admin-drop-zone"]'),
    adminProjectDataInput: document.querySelector('[data-input="admin-project-data"]'),
    adminSaveProjectBtn: document.querySelector('[data-action="admin-save-project"]'),
    adminCancelEditBtn: document.querySelector('[data-action="admin-cancel-edit"]'),
    adminProjectListBody: document.querySelector('[data-component="admin-project-list-body"]'),
    visitorLogBody: document.querySelector('[data-component="visitor-log-body"]'),
    adminUpdateTextInput: document.querySelector('[data-input="admin-update-text"]'),

    // Team Management Modal
    teamListContainer: document.querySelector('[data-component="team-list-container"]'),
    
    // Settings Modal
    settingsBody: document.querySelector('[data-component="advance-settings-body"]'),

    // Guided Setup Modal
    setupStepIndicator: document.querySelector('[data-component="setup-step-indicator"]'),
    setupTeamList: document.querySelector('[data-component="setup-team-list"]'),
};


// --- LOCAL DATABASE (INDEXEDDB) ---
const DB = {
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BonusCalculatorDB', 3);
            request.onupgradeneeded = e => {
                const db = e.target.result;
                const stores = ['projects', 'teams', 'settings', 'bonusTiers', 'calculationSettings', 'countingSettings'];
                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
                });
            };
            request.onsuccess = e => { AppState.db = e.target.result; resolve(AppState.db); };
            request.onerror = e => { console.error("IndexedDB error:", e.target.error); reject(e.target.error); };
        });
    },
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = AppState.db.transaction([storeName], 'readonly').objectStore(storeName).get(key);
            tx.onsuccess = () => resolve(tx.result);
            tx.onerror = () => reject(tx.error);
        });
    },
    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = AppState.db.transaction([storeName], 'readwrite').objectStore(storeName).put(data);
            tx.onsuccess = () => resolve(tx.result);
            tx.onerror = () => reject(tx.error);
        });
    },
    async delete(storeName, key) {
         return new Promise((resolve, reject) => {
            const tx = AppState.db.transaction([storeName], 'readwrite').objectStore(storeName).delete(key);
            tx.onsuccess = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = AppState.db.transaction([storeName], 'readonly').objectStore(storeName).getAll();
            tx.onsuccess = () => resolve(tx.result);
            tx.onerror = () => reject(tx.error);
        });
    }
};

// --- UI MODULE ---
const UI = {
    setPanelHeights() {
        const dataPanel = document.getElementById('data-projects-panel');
        const leaderboardPanel = document.getElementById('leaderboard-panel');
        const tlSummaryPanel = document.getElementById('tl-summary-card');
        if (!dataPanel || !leaderboardPanel || !tlSummaryPanel) return;
        if (window.innerWidth < 1024) {
            [dataPanel, leaderboardPanel, tlSummaryPanel].forEach(p => p.style.height = '');
            return;
        }
        [dataPanel, leaderboardPanel, tlSummaryPanel].forEach(p => p.style.height = 'auto');
        requestAnimationFrame(() => {
            const dataPanelHeight = dataPanel.getBoundingClientRect().height;
            [leaderboardPanel, tlSummaryPanel].forEach(p => p.style.height = `${dataPanelHeight}px`);
        });
    },

    displayResults(techStats) {
        const bonusMultiplier = parseFloat(DOMElements.bonusMultiplierInput.value) || 1;
        DOMElements.techResultsBody.innerHTML = '';
        const infoIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293.006.399.287.47l.45.083.082.38-2.29.287-.082-.38.45-.083a.89.89 0 0 1 .352-.176c.24-.11.24-.216.06-.563l-.738-3.468c-.18-.84.48-1.133 1.17-1.133H8l.084.38zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`;
        
        let techArray = Object.values(techStats).map(tech => {
            const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
            const quality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
            const qualityModifier = Calculator.calculateQualityModifier(quality);
            const payout = tech.points * bonusMultiplier * qualityModifier;
            const bonusEarned = qualityModifier * 100;
            return { ...tech, quality, payout, bonusEarned };
        });

        const sortKey = AppState.currentSort.column;
        const sortDir = AppState.currentSort.direction === 'asc' ? 1 : -1;
        techArray.sort((a, b) => (a[sortKey] < b[sortKey] ? -1 : 1) * sortDir);

        if (techArray.length === 0) {
            DOMElements.techResultsBody.innerHTML = `<tr><td colspan="8" class="text-center text-brand-400 p-4">No results to display.</td></tr>`;
        } else {
            techArray.forEach(tech => {
                const row = DOMElements.techResultsBody.insertRow();
                row.innerHTML = `
                    <td class="font-semibold text-white">${tech.id}</td>
                    <td>${tech.points.toFixed(3)}</td>
                    <td>${tech.fixTasks}</td>
                    <td class="${tech.refixTasks > 0 ? 'text-red-400' : ''}">${tech.refixTasks}</td>
                    <td><span class="quality-pill ${tech.quality >= 95 ? 'quality-pill-green' : tech.quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${tech.quality.toFixed(2)}%</span></td>
                    <td>${tech.bonusEarned.toFixed(2)}%</td>
                    <td class="payout-amount">${tech.payout.toFixed(2)}</td>
                    <td class="text-center"><button class="info-icon" data-action="show-tech-summary" data-tech-id="${tech.id}" title="View Details">${infoIconSvg}</button></td>
                `;
            });
        }
        document.getElementById('bonus-payout-section').classList.remove('hidden');
        this.updateSortHeaders();
    },

    updateSortHeaders() {
        document.querySelectorAll('.sortable-header').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === AppState.currentSort.column) {
                header.classList.add(`sort-${AppState.currentSort.direction}`);
            }
        });
    },
    
    populateProjectSelect(projectListCache) {
        const select = DOMElements.projectSelect;
        const currentVal = select.value;
        select.innerHTML = '<option value="">Select a project...</option>';
        projectListCache.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.name;
            select.appendChild(option);
        });
        if (projectListCache.some(p => p.id === currentVal)) select.value = currentVal;
    },

    addTeamCard(teamName = '', techIds = [], targetContainer) {
        const card = document.createElement('div');
        card.className = 'team-card p-4 rounded-lg bg-brand-900/50 border border-brand-700';
        card.innerHTML = `<div class="flex justify-between items-center mb-3"><input type="text" class="team-name-input input-field text-lg font-bold w-full" value="${teamName}" placeholder="Team Name"><button class="delete-team-btn control-btn-icon-danger ml-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button></div><div class="team-tech-list mb-3"></div><div class="flex gap-2"><input type="text" class="add-tech-input input-field w-full" placeholder="Add Tech ID"><button class="add-tech-btn btn-secondary">Add</button></div>`;
        targetContainer.appendChild(card);
        const techList = card.querySelector('.team-tech-list');
        techIds.forEach(id => this.addTechTag(techList, id));
        card.querySelector('.delete-team-btn').addEventListener('click', () => card.remove());
        card.querySelector('.add-tech-btn').addEventListener('click', e => {
            const input = e.target.previousElementSibling;
            const techId = input.value.trim().toUpperCase();
            if (techId && CONSTANTS.TECH_ID_REGEX.test(techId)) {
                if (!Array.from(techList.querySelectorAll('.tech-tag')).some(tag => tag.dataset.techId === techId)) {
                    this.addTechTag(techList, techId);
                }
                input.value = '';
            } else {
                alert('Invalid Tech ID format (e.g., 1234AB).');
            }
        });
    },

    addTechTag(list, techId) {
        const tag = document.createElement('div');
        tag.className = 'tech-tag';
        tag.dataset.techId = techId;
        tag.innerHTML = `<span>${techId}</span><button class="remove-tech-btn"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.647 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button>`;
        list.appendChild(tag);
        tag.querySelector('.remove-tech-btn').addEventListener('click', () => tag.remove());
    },

    populateTeamFilters() {
        const container = DOMElements.teamFilterContainer;
        if (!container) return;
        const refreshBtn = container.querySelector('[data-action="refresh-teams-list"]');
        container.innerHTML = `<span class="text-sm font-medium text-brand-300">Filter by Team:</span>`;
        if(refreshBtn) container.appendChild(refreshBtn);

        Object.keys(AppState.teamSettings).sort().forEach(team => {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            div.innerHTML = `<input id="team-filter-${team}" type="checkbox" data-team="${team}" class="h-4 w-4 text-accent focus:ring-accent bg-brand-700 border-brand-600 rounded"><label for="team-filter-${team}" class="ml-2 block text-sm">${team}</label>`;
            container.appendChild(div);
        });
    },

    updateLeaderboard(techStats) {
        const sortBy = DOMElements.leaderboardSortSelect.value;
        DOMElements.leaderboardBody.innerHTML = '';
        const techArray = Object.values(techStats)
            .filter(tech => tech.id === tech.id.toUpperCase())
            .map(tech => {
                const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
                return { 
                    id: tech.id, 
                    fixTasks: tech.fixTasks, 
                    totalPoints: tech.points, 
                    fixQuality: denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0, 
                };
        });
        if (sortBy === 'totalPoints') { techArray.sort((a, b) => b.totalPoints - a.totalPoints); DOMElements.leaderboardMetricHeader.textContent = 'Points'; }
        else if (sortBy === 'fixTasks') { techArray.sort((a, b) => b.fixTasks - a.fixTasks); DOMElements.leaderboardMetricHeader.textContent = 'Tasks'; }
        else { techArray.sort((a, b) => b.fixQuality - a.fixQuality); DOMElements.leaderboardMetricHeader.textContent = 'Quality %'; }
        if (techArray.length === 0) {
            DOMElements.leaderboardBody.innerHTML = `<tr><td class="p-4 text-center text-brand-400" colspan="3">Calculate results to see data.</td></tr>`;
            return;
        }
        techArray.forEach((stat, index) => {
            const row = DOMElements.leaderboardBody.insertRow();
            let value = sortBy === 'fixTasks' ? stat.fixTasks : sortBy === 'totalPoints' ? stat.totalPoints.toFixed(2) : `${stat.fixQuality.toFixed(2)}%`;
            row.innerHTML = `<td class="p-2">${index + 1}</td><td class="p-2">${stat.id}</td><td class="p-2">${value}</td>`;
        });
    },
    
    updateTLSummary(techStats) {
        const tlCard = document.getElementById('tl-summary-card');
        if (Object.keys(techStats).length === 0) { tlCard.classList.add('hidden'); return; }
        tlCard.classList.remove('hidden'); this.setPanelHeights();
        DOMElements.teamQualityContainer.innerHTML = '';
        const teamQualities = {};
        for (const team in AppState.teamSettings) {
            const teamTechs = AppState.teamSettings[team].map(id => techStats[id]).filter(Boolean);
            if (teamTechs.length > 0) {
                const totalQuality = teamTechs.reduce((sum, stat) => {
                    const d = stat.fixTasks + stat.refixTasks + stat.warnings.length;
                    return sum + (d > 0 ? (stat.fixTasks / d) * 100 : 0);
                }, 0);
                teamQualities[team] = totalQuality / teamTechs.length;
            }
        }
        Object.entries(teamQualities).sort(([, a], [, b]) => b - a).forEach(([team, quality]) => {
            const qualityBar = document.createElement('div');
            qualityBar.className = 'workload-bar-wrapper';
            const qualityFloor = Math.floor(quality);
            let colorClass = qualityFloor < 90 ? 'red' : String(qualityFloor);
            qualityBar.innerHTML = `<div class="team-quality-label team-summary-trigger" data-team-name="${team}" title="${team}">${team}</div><div class="workload-bar"><div class="workload-bar-inner quality-bar-${colorClass}" style="width:${quality.toFixed(2)}%;">${quality.toFixed(2)}%</div></div>`;
            DOMElements.teamQualityContainer.appendChild(qualityBar);
        });
        DOMElements.fix4BreakdownContainer.innerHTML = '';
        const selectedTeams = Array.from(document.querySelectorAll('[data-component="team-filter-container"] input:checked')).map(cb => cb.dataset.team);
        const getTeamName = (techId) => Object.keys(AppState.teamSettings).find(team => AppState.teamSettings[team].some(id => id.toUpperCase() === techId.toUpperCase())) || null;
        const fix4CategoryCounts = {};
        Object.values(techStats).forEach(tech => {
            if (tech.fix4 && tech.fix4.length > 0) {
                fix4CategoryCounts[tech.id] = {};
                tech.fix4.forEach(item => {
                    fix4CategoryCounts[tech.id][item.category] = (fix4CategoryCounts[tech.id][item.category] || 0) + 1;
                });
            }
        });
        const filteredFix4 = Object.entries(fix4CategoryCounts).filter(([techId]) => {
            if (selectedTeams.length === 0) return true;
            const teamName = getTeamName(techId);
            return teamName && selectedTeams.includes(teamName);
        });
        if (filteredFix4.length > 0) {
            DOMElements.fix4BreakdownContainer.innerHTML = filteredFix4.map(([techId, categories]) => {
                const rows = Object.entries(categories).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([cat, count]) => `<tr><td class="p-2">Category ${cat}</td><td class="p-2">${count}</td></tr>`).join('');
                return `<div class="table-container text-sm mb-4"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th colspan="2" class="p-2 text-left font-bold text-white">${techId}</th></tr><tr><th class="p-2 text-left">Category</th><th class="p-2 text-left">Count</th></tr></thead><tbody>${rows}</tbody></table></div>`;
            }).join('');
        } else {
            DOMElements.fix4BreakdownContainer.innerHTML = `<p class="text-brand-400 text-sm">No Fix4 data for selected filters.</p>`;
        }
    },
    
    updateQuickSummary(techStats) {
        const container = DOMElements.quickSummaryContainer;
        const summarySection = document.getElementById('quick-summary-section');
        const techArray = Object.values(techStats);
        if (techArray.length === 0) {
            summarySection.classList.add('hidden');
            return;
        }
        const createSummaryCard = (title, tech, value) => `<div class="summary-card"><div class="summary-card-title">${title}</div><div class="summary-card-tech">${tech}</div><div class="summary-card-value">${value}</div></div>`;
        const findTopTech = (metric, compareFn) => techArray.reduce((top, tech) => !top || compareFn(tech, top) ? tech : top, null);

        const topPoints = findTopTech('points', (a, b) => a.points > b.points);
        const topTasks = findTopTech('fixTasks', (a, b) => a.fixTasks > b.fixTasks);
        const mostRefix = findTopTech('refixTasks', (a, b) => a.refixTasks > b.refixTasks);
        
        const techArrayWithQuality = techArray.map(tech => {
            const quality = (tech.fixTasks + tech.refixTasks + tech.warnings.length) > 0 ? (tech.fixTasks / (tech.fixTasks + tech.refixTasks + tech.warnings.length)) * 100 : 0;
            return { ...tech, quality };
        });

        const maxQuality = Math.max(...techArrayWithQuality.map(t => t.quality), 0);
        const topQualityTechs = techArrayWithQuality.filter(t => t.quality === maxQuality);

        container.innerHTML = createSummaryCard('Top Points', topPoints.id, `${topPoints.points.toFixed(2)} pts`);
        container.innerHTML += createSummaryCard('Most Tasks', topTasks.id, `${topTasks.fixTasks} tasks`);
        container.innerHTML += createSummaryCard('Best Quality', topQualityTechs.map(t => t.id).join(', '), `${maxQuality.toFixed(2)}%`);
        container.innerHTML += createSummaryCard('Most Refixes', mostRefix.refixTasks > 0 ? mostRefix.id : 'N/A', mostRefix.refixTasks > 0 ? `${mostRefix.refixTasks} refixes` : '-');
        
        summarySection.classList.remove('hidden');
    },

    applyFilters() {
        const searchValue = document.querySelector('[data-input="search-tech-id"]').value.toUpperCase();
        const selectedTeams = Array.from(document.querySelectorAll('[data-component="team-filter-container"] input:checked')).map(cb => cb.dataset.team);
        const getTeamName = (techId) => Object.keys(AppState.teamSettings).find(team => AppState.teamSettings[team].some(id => id.toUpperCase() === techId.toUpperCase())) || 'N/A';
        
        const filteredStats = {};
        for (const techId in AppState.currentTechStats) {
            const tech = AppState.currentTechStats[techId];
            const teamName = getTeamName(tech.id);
            if (tech.id.toUpperCase().includes(searchValue) && (selectedTeams.length === 0 || selectedTeams.includes(teamName))) {
                filteredStats[techId] = tech;
            }
        }
        this.displayResults(filteredStats);
        this.updateLeaderboard(filteredStats);
        this.updateTLSummary(filteredStats);
        this.updateQuickSummary(filteredStats);
    },
    
    showNotification(message, isError = false) {
        const el = DOMElements.notification;
        if (el) {
            el.textContent = message;
            el.classList.toggle('bg-status-red', isError);
            el.classList.toggle('bg-accent', !isError);
            el.classList.remove('hidden', 'opacity-0', 'translate-y-2');
            setTimeout(() => {
                el.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => el.classList.add('hidden'), 500);
            }, 3000);
        }
    },

    openModal(modalId) { 
        const modal = document.querySelector(`[data-modal="${modalId}"]`);
        if(modal) modal.classList.remove('hidden'); 
    },
    
    closeModal(modalId) { 
        const modal = document.querySelector(`[data-modal="${modalId}"]`);
        if(modal) modal.classList.add('hidden'); 
    },
    
    generateTechBreakdownHTML(tech) {
        // This function is quite large and specific, keeping it as is for now.
        // It could be broken down further if more complex rendering is needed.
        const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
        const fixQuality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
        const qualityModifier = Calculator.calculateQualityModifier(fixQuality);
        const finalPayout = tech.points * (parseFloat(DOMElements.bonusMultiplierInput.value) || 1) * qualityModifier;
        
        let projectBreakdownHTML = '';
        if (tech.isCombined || tech.projectName) {
            let projectRows = '';
            const breakdownSource = tech.isCombined ? tech.pointsBreakdownByProject : { [tech.projectName]: { points: tech.points, fixTasks: tech.fixTasks, refixTasks: tech.refixTasks, warnings: tech.warnings.length } };
            for (const projectName in breakdownSource) {
                const projectData = breakdownSource[projectName];
                projectRows += `<tr><td class="p-2 font-semibold">${projectName}</td><td class="p-2 text-center">${projectData.points.toFixed(3)}</td><td class="p-2 text-center">${projectData.fixTasks}</td><td class="p-2 text-center">${projectData.refixTasks}</td><td class="p-2 text-center">${projectData.warnings}</td></tr>`;
            }
            projectBreakdownHTML = `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4 mb-4"><h4 class="font-semibold text-base text-white mb-2">Project Contribution</h4><div class="table-container text-sm"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th class="p-2 text-left">Project</th><th class="p-2 text-center">Points</th><th class="p-2 text-center">Fix</th><th class="p-2 text-center">Refix</th><th class="p-2 text-center">Warn</th></tr></thead><tbody>${projectRows}</tbody></table></div></div>`;
        }

        let summaryCategoryItems = '';
        let totalCategoryPoints = 0;
        let hasCategoryData = false;
        for (let i = 1; i <= 9; i++) {
            const counts = tech.categoryCounts[i];
            const primaryTasks = (counts.primary || 0) + (counts.i3qa || 0) + (counts.afp || 0);
            if (primaryTasks > 0) {
                hasCategoryData = true;
                const pointValue = AppState.calculationSettings.categoryValues[i]?.[AppState.lastUsedGsdValue] || 0;
                const categoryPoints = primaryTasks * pointValue;
                totalCategoryPoints += categoryPoints;
                summaryCategoryItems += `<div class="summary-item summary-cat-${i}">Category ${i}:<span class="font-mono">${primaryTasks} x ${pointValue.toFixed(2)} = ${categoryPoints.toFixed(2)} pts</span></div>`;
            }
        }
        
        const qcPoints = tech.qcTasks * AppState.calculationSettings.points.qc;
        const i3qaPoints = tech.i3qaTasks * AppState.calculationSettings.points.i3qa;
        const rvPoints = tech.pointsBreakdown.rv;

        const categoryBreakdownHTML = hasCategoryData ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4"><h4 class="font-semibold text-base text-white mb-2">Primary Fix Points</h4><div class="space-y-2">${summaryCategoryItems}<div class="summary-item summary-total">Total from Categories:<span class="font-mono">${totalCategoryPoints.toFixed(2)} pts</span></div></div></div>` : '';
        const qcBreakdownHTML = tech.qcTasks > 0 ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4"><h4 class="font-semibold text-base text-white mb-2">QC Tasks</h4><div class="space-y-2"><div class="summary-item">QC Tasks:<span class="font-mono">${tech.qcTasks} x ${AppState.calculationSettings.points.qc.toFixed(3)} = ${qcPoints.toFixed(3)} pts</span></div></div></div>` : '';
        const i3qaBreakdownHTML = tech.i3qaTasks > 0 ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4"><h4 class="font-semibold text-base text-white mb-2">i3qa Tasks</h4><div class="space-y-2"><div class="summary-item">i3qa Tasks:<span class="font-mono">${tech.i3qaTasks} x ${AppState.calculationSettings.points.i3qa.toFixed(3)} = ${i3qaPoints.toFixed(3)} pts</span></div></div></div>` : '';
        const rvBreakdownHTML = tech.rvTasks > 0 ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4"><h4 class="font-semibold text-base text-white mb-2">RV Tasks</h4><div class="space-y-2"><div class="summary-item">RV Tasks:<span class="font-mono">${tech.rvTasks} tasks = ${rvPoints.toFixed(3)} pts</span></div></div></div>` : '';

        return `<div class="space-y-4 text-sm">${projectBreakdownHTML}<div class="p-3 bg-accent/10 rounded-lg border border-accent/50"><h4 class="font-semibold text-base text-accent mb-2">Final Payout</h4><div class="flex justify-between font-bold text-lg"><span class="text-white">Payout (PHP):</span><span class="text-accent font-mono">${finalPayout.toFixed(2)}</span></div></div>${categoryBreakdownHTML}${qcBreakdownHTML}${i3qaBreakdownHTML}${rvBreakdownHTML}<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Points Breakdown</h4><div class="space-y-1 font-mono"><div class="flex justify-between"><span class="text-brand-400">Fix Tasks:</span><span>${tech.pointsBreakdown.fix.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">QC Tasks:</span><span>${tech.pointsBreakdown.qc.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">i3qa Tasks:</span><span>${tech.pointsBreakdown.i3qa.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">RV Tasks:</span><span>${tech.pointsBreakdown.rv.toFixed(3)}</span></div>${tech.pointsBreakdown.qcTransfer > 0 ? `<div class="flex justify-between"><span class="text-brand-400">QC Transfers:</span><span>+${tech.pointsBreakdown.qcTransfer.toFixed(3)}</span></div>` : ''}<div class="flex justify-between border-t border-brand-600 mt-1 pt-1"><span class="text-white font-bold">Total Points:</span><span class="text-white font-bold">${tech.points.toFixed(3)}</span></div></div></div><div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Core Stats & Quality</h4><div class="grid grid-cols-2 gap-4"><div><span class="text-brand-400">Primary Fix:</span><span class="font-bold stat-orange">${tech.fixTasks}</span></div><div><span class="text-brand-400">AFP (AA):</span><span class="font-bold stat-green">${tech.afpTasks}</span></div><div><span class="text-brand-400">Refix:</span><span class="font-bold stat-red">${tech.refixTasks}</span></div><div><span class="text-brand-400">Warnings:</span><span class="font-bold stat-red">${tech.warnings.length}</span></div></div><div class="flex justify-between mt-4 pt-4 border-t border-brand-700"><span class="text-brand-400">Fix Quality %:</span><span class="font-mono font-bold">${fixQuality.toFixed(2)}%</span></div></div></div>`;
    },
    
    showLoading(button) { 
        button.disabled = true; 
        const loader = document.createElement('span'); 
        loader.className = 'loader'; 
        button.prepend(loader); 
    },

    hideLoading(button) { 
        button.disabled = false; 
        button.querySelector('.loader')?.remove(); 
    }
};

// --- CORE CALCULATION LOGIC ---
const Calculator = {
    createNewTechStat(isCombined = false, projectName = null) {
        const categoryCounts = {};
        for (let i = 1; i <= 9; i++) categoryCounts[i] = { primary: 0, i3qa: 0, afp: 0, rv: 0 };
        const baseStat = {
            id: '', points: 0, fixTasks: 0, afpTasks: 0, refixTasks: 0, qcTasks: 0, i3qaTasks: 0, rvTasks: 0, warnings: [],
            fix4: [], refixDetails: [], missedCategories: [], approvedByRQA: [],
            categoryCounts: categoryCounts,
            pointsBreakdown: { fix: 0, qc: 0, i3qa: 0, rv: 0, qcTransfer: 0 },
            isCombined: isCombined,
            projectName: projectName
        };
        if (isCombined) baseStat.pointsBreakdownByProject = {};
        return baseStat;
    },
    
    parseRawData(data, isFixTaskIR = false, currentProjectName = "Pasted Data", gsdForCalculation = "3in") {
        const techStats = {};
        const lines = data.split('\n').filter(line => line.trim());
        if (lines.length < 1) return null;

        const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
        const headerMap = Object.fromEntries(headers.map((h, i) => [h, i]));
        
        const allTechs = new Set();
        const dataLines = lines.slice(1);
        dataLines.forEach(line => {
            const values = line.split('\t');
            headers.forEach((h, i) => {
                if (h.endsWith('_id')) {
                    const techId = values[i]?.trim().toUpperCase();
                    if (techId && CONSTANTS.TECH_ID_REGEX.test(techId)) allTechs.add(techId);
                }
            });
        });
        allTechs.forEach(techId => {
            techStats[techId] = this.createNewTechStat(false, currentProjectName);
            techStats[techId].id = techId;
        });

        const { triggers, taskColumns } = AppState.countingSettings;
        dataLines.forEach(line => {
            const values = line.split('\t');
            const get = (col) => values[headerMap[col]];
            const isComboIR = get('combo?') === 'Y';

            const fixIds = [get('fix1_id'), get('fix2_id'), get('fix3_id'), get('fix4_id')].map(id => id?.trim().toUpperCase());

            const processFixTech = (techId, catSources) => {
                if (!techId || !techStats[techId]) return;
                let techPoints = 0;
                let techCategories = 0;
                catSources.forEach(source => {
                    if (source.isRQA && source.sourceType === 'afp') techStats[techId].afpTasks++;
                    const labelValue = source.label ? get(source.label)?.trim().toUpperCase() : null;
                    if (source.condition && !source.condition(labelValue)) return;
                    const catValue = parseInt(get(source.cat));
                    if (!isNaN(catValue) && catValue >= 1 && catValue <= 9) {
                        techCategories++;
                        techPoints += AppState.calculationSettings.categoryValues[catValue]?.[gsdForCalculation] || 0;
                        if(techStats[techId].categoryCounts[catValue]) techStats[techId].categoryCounts[catValue][source.sourceType]++;
                    }
                });
                techStats[techId].fixTasks += techCategories;
                let pointsToAdd = techPoints * (isFixTaskIR ? AppState.calculationSettings.irModifierValue : 1);
                techStats[techId].points += pointsToAdd;
                techStats[techId].pointsBreakdown.fix += pointsToAdd;
            };

            processFixTech(fixIds[0], get('afp1_stat')?.trim().toUpperCase() === 'AA' ? [{ cat: 'afp1_cat', isRQA: true, sourceType: 'afp' }] : [{ cat: 'category', sourceType: 'primary' }, { cat: 'i3qa_cat', label: 'i3qa_label', condition: v => v && triggers.miss.labels.some(l => v.includes(l.toUpperCase())), sourceType: 'i3qa' }]);
            processFixTech(fixIds[1], get('afp2_stat')?.trim().toUpperCase() === 'AA' ? [{ cat: 'afp2_cat', isRQA: true, sourceType: 'afp' }] : [{ cat: 'rv1_cat', label: 'rv1_label', condition: v => v && triggers.miss.labels.some(l => v.includes(l.toUpperCase())), sourceType: 'rv' }]);
            processFixTech(fixIds[2], get('afp3_stat')?.trim().toUpperCase() === 'AA' ? [{ cat: 'afp3_cat', isRQA: true, sourceType: 'afp' }] : [{ cat: 'rv2_cat', label: 'rv2_label', condition: v => v && triggers.miss.labels.some(l => v.includes(l.toUpperCase())), sourceType: 'rv' }]);
            processFixTech(fixIds[3], [{ cat: 'rv3_cat', label: 'rv3_label', condition: v => v && triggers.miss.labels.some(l => v.includes(l.toUpperCase())), sourceType: 'rv' }]);

            const addPointsForTask = (techId, points, field, taskType) => {
                if (techId && techStats[techId]) {
                    techStats[techId].points += points;
                    techStats[techId].pointsBreakdown[field] += points;
                    if (taskType) {
                        techStats[techId][`${taskType}Tasks`] += 1;
                    }
                }
            };
            taskColumns.qc.forEach(c => addPointsForTask(get(c)?.trim().toUpperCase(), AppState.calculationSettings.points.qc, 'qc', 'qc'));
            taskColumns.i3qa.forEach(c => addPointsForTask(get(c)?.trim().toUpperCase(), AppState.calculationSettings.points.i3qa, 'i3qa', 'i3qa'));
            taskColumns.rv1.forEach(c => addPointsForTask(get(c)?.trim().toUpperCase(), isComboIR ? AppState.calculationSettings.points.rv1_combo : AppState.calculationSettings.points.rv1, 'rv', 'rv'));
            taskColumns.rv2.forEach(c => addPointsForTask(get(c)?.trim().toUpperCase(), AppState.calculationSettings.points.rv2, 'rv', 'rv'));
            
            if (triggers.qcPenalty.columns.some(c => triggers.qcPenalty.labels.includes(get(c)?.trim().toLowerCase()))) {
                const i3qaTechId = get('i3qa_id')?.trim().toUpperCase();
                if (i3qaTechId && techStats[i3qaTechId]) {
                    let pointsToTransfer = 0;
                    taskColumns.qc.forEach(c => {
                        const qcTechId = get(c)?.trim().toUpperCase();
                        if (qcTechId && techStats[qcTechId]) {
                            techStats[qcTechId].points -= AppState.calculationSettings.points.qc;
                            techStats[qcTechId].pointsBreakdown.qc -= AppState.calculationSettings.points.qc;
                            pointsToTransfer += AppState.calculationSettings.points.qc;
                        }
                    });
                    if (pointsToTransfer > 0) {
                        techStats[i3qaTechId].points += pointsToTransfer;
                        techStats[i3qaTechId].pointsBreakdown.qcTransfer += pointsToTransfer;
                    }
                }
            }
            
            triggers.refix.columns.forEach((c, i) => {
                if (triggers.refix.labels.some(l => get(c)?.trim().toLowerCase().includes(l))) {
                    const fixTechId = fixIds[i + 1];
                    if (fixTechId && techStats[fixTechId]) techStats[fixTechId].refixTasks++;
                }
            });
            triggers.warning.columns.forEach((c, i) => {
                if (triggers.warning.labels.includes(get(c)?.trim().toLowerCase())) {
                    const fixTechId = fixIds[i];
                    if (fixTechId && techStats[fixTechId]) techStats[fixTechId].warnings.push({});
                }
            });
            
            const fix4Id = get('fix4_id')?.trim().toUpperCase();
            if (fix4Id && techStats[fix4Id]) {
                const cat = parseInt(get('rv3_cat'));
                if (!isNaN(cat) && get('rv3_cat')?.trim()) techStats[fix4Id].fix4.push({ category: cat });
            }
        });
        return { techStats };
    },

    calculateQualityModifier(qualityRate) {
        return AppState.bonusTiers.find(tier => qualityRate >= tier.quality)?.bonus || 0;
    }
};

// --- APPLICATION START & INITIALIZATION ---
const App = {
    async init() {
        await DB.open();
        
        dayjs.extend(window.dayjs_plugin_relativeTime);

        EventListeners.init();
        
        document.body.classList.toggle('light-theme', localStorage.getItem('theme') === 'light');
        
        FirebaseService.init();

        await this.loadInitialData();
        
        const hasBeenSetup = await DB.get('settings', 'hasBeenSetup');
        if (!hasBeenSetup) {
            GuidedSetup.start();
        }

        UI.setPanelHeights();
        window.addEventListener('resize', UI.setPanelHeights);
    },

    async loadInitialData() {
        await Promise.all([ 
            ProjectService.fetchLocalProjectListSummary(), 
            SettingsService.loadTeamSettings(), 
            SettingsService.loadBonusTiers(), 
            SettingsService.loadCalculationSettings(), 
            SettingsService.loadCountingSettings() 
        ]);
    },
    async clearAllData() {
        if (confirm("Clear ALL data? This deletes projects and resets all settings to their defaults.")) {
            if (AppState.db) {
                AppState.db.close();
            }
            const req = indexedDB.deleteDatabase('BonusCalculatorDB');
            req.onsuccess = async () => {
                alert("All data has been cleared. The application will now reset.");
                localStorage.clear(); // Clear local storage too
                window.location.reload();
            };
            req.onerror = () => alert("Error clearing data. Please close all other tabs with this application open and try again.");
            req.onblocked = () => alert("Could not clear data. Please close all other tabs with this application open and try again.");
        }
    },
};

// --- EVENT LISTENERS MODULE ---
const EventListeners = {
    init() {
        // Body-level click delegation for dynamic elements
        document.body.addEventListener('click', this.handleBodyClick);
        
        // Input and Change events
        DOMElements.projectSelect.addEventListener('change', () => ProjectService.loadProjectIntoForm(DOMElements.projectSelect.value));
        DOMElements.customizeCalcAllCheckbox.addEventListener('change', this.toggleProjectSelectMultiple);
        DOMElements.leaderboardSortSelect.addEventListener('change', UI.applyFilters);
        DOMElements.teamFilterContainer.addEventListener('change', UI.applyFilters);
        document.querySelector('[data-input="search-tech-id"]').addEventListener('input', UI.applyFilters);

        // Drag and Drop
        this.setupDropZone(DOMElements.dropZone, ProjectService.handleDroppedFiles);
        this.setupDropZone(DOMElements.adminDropZone, AdminService.handleAdminDroppedFiles);

        // Admin Portal Tabs
        document.querySelectorAll('#admin-panel-view .tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                document.querySelectorAll('#admin-panel-view .tab-button, .admin-tab-content').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
                document.querySelector(`[data-tab-content="${tabId}"]`).classList.add('active');
                if (tabId === 'admin-visitors') AdminService.loadVisitorLog();
                if (tabId === 'admin-projects') AdminService.loadAdminProjectList();
            });
        });
    },

    handleBodyClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const actionMap = {
            'open-guided-setup': GuidedSetup.start,
            'open-teams-modal': () => {
                const container = DOMElements.teamListContainer;
                container.innerHTML = '';
                Object.entries(AppState.teamSettings).forEach(([teamName, techIds]) => UI.addTeamCard(teamName, techIds, container));
                UI.openModal('manage-teams');
            },
            'open-settings-modal': SettingsService.populateAdvanceSettingsEditor,
            'open-admin-portal': () => UI.openModal('admin-portal'),
            'open-info-modal': () => UI.openModal('important-info'),
            'toggle-theme': () => {
                document.body.classList.toggle('light-theme');
                localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
            },
            'report-bug': () => window.open("https://teams.microsoft.com/l/chat/48:notes/conversations?context=%7B%22contextType%22%3A%22chat%22%7D", "_blank"),
            'clear-all-data': App.clearAllData,
            'refresh-project-list': ProjectService.fetchLocalProjectListSummary,
            'edit-local-project': ProjectService.toggleLocalEditMode,
            'delete-local-project': () => ProjectService.deleteProjectFromIndexedDB(DOMElements.projectSelect.value),
            'save-local-project': (e) => ProjectService.saveProjectToIndexedDB(e.target),
            'cancel-edit-local-project': ProjectService.cancelLocalEdit,
            'calculate-single': (e) => ProjectService.runCalculation(e.target, false),
            'calculate-all': (e) => ProjectService.runCalculation(e.target, true),
            'sync-projects-from-cloud': (e) => ProjectService.syncProjectsFromCloud(e.currentTarget),
            'show-tech-summary': () => {
                const techId = target.dataset.techId;
                const tech = AppState.currentTechStats[techId];
                if (tech) {
                    document.querySelector('[data-component="tech-summary-title"]').textContent = `Summary for ${techId}`;
                    document.querySelector('[data-component="tech-summary-body"]').innerHTML = UI.generateTechBreakdownHTML(tech);
                    UI.openModal('tech-summary');
                }
            },
            // Team Modal Actions
            'add-new-team': () => UI.addTeamCard('', [], DOMElements.teamListContainer),
            'save-teams': SettingsService.saveTeamSettings,
            // Settings Modal Actions
            'reset-settings': SettingsService.resetToDefaults,
            'save-settings': SettingsService.save,
            // Admin Actions
            'admin-login': FirebaseService.handleAdminLogin,
            'admin-save-project': (e) => AdminService.saveCloudProject(e.target),
            'admin-cancel-edit': AdminService.resetAdminProjectForm,
            'admin-edit-project': () => AdminService.editCloudProject(target.dataset.projectId),
            'admin-delete-project': () => AdminService.deleteCloudProject(target.dataset.projectId),
            'admin-send-update': AdminService.sendUpdateNotification,
            'accept-update': FirebaseService.acceptUpdate,
            // Guided Setup Actions
            'setup-next': GuidedSetup.nextStep,
            'setup-prev': GuidedSetup.prevStep,
            'setup-finish': GuidedSetup.finish,
            'setup-add-team': () => UI.addTeamCard('', [], DOMElements.setupTeamList),
        };

        if (actionMap[action]) {
            actionMap[action]();
        }
    },

    toggleProjectSelectMultiple(e) {
        const isChecked = e.target.checked;
        DOMElements.projectSelect.multiple = isChecked;
        DOMElements.projectSelect.size = isChecked ? 6 : 1;
        document.querySelector('[data-action="calculate-single"]').disabled = isChecked;
    },

    setupDropZone(element, handler) {
        element.addEventListener('dragover', e => { e.preventDefault(); element.classList.add('bg-brand-700'); });
        element.addEventListener('dragleave', e => element.classList.remove('bg-brand-700'));
        element.addEventListener('drop', e => { 
            e.preventDefault(); 
            element.classList.remove('bg-brand-700'); 
            handler(e.dataTransfer.files); 
        });
    }
};

document.addEventListener('DOMContentLoaded', App.init);

