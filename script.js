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
    },
    firebase: {
        app: null,
        auth: null,
        db: null,
        tools: null,
        isAdmin: false
    }
};

// --- CONSTANTS ---
const CONSTANTS = {
    TECH_ID_REGEX: /^\d{4}[a-zA-Z]{2}$/,
    ADMIN_EMAIL: [ // Changed to an array to hold multiple emails
        'ev.lorens.ebrado@gmail.com',
        'ev.anderson4470@gmail.com'
    ],
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

const DB = {
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BonusCalculatorDB', 3);
            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('teams')) db.createObjectStore('teams', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('bonusTiers')) db.createObjectStore('bonusTiers', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('calculationSettings')) db.createObjectStore('calculationSettings', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('countingSettings')) db.createObjectStore('countingSettings', { keyPath: 'id' });
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
        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
        const resultsTbody = document.getElementById('tech-results-tbody');
        resultsTbody.innerHTML = '';
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
        techArray.sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return -1 * sortDir;
            if (a[sortKey] > b[sortKey]) return 1 * sortDir;
            return 0;
        });

        if (techArray.length === 0) {
            resultsTbody.innerHTML = `<tr><td colspan="8" class="text-center text-brand-400 p-4">No results to display.</td></tr>`;
        } else {
            techArray.forEach(tech => {
                const row = document.createElement('tr');
                // MODIFIED BLOCK START
                row.innerHTML = `
                    <td class="font-semibold text-white">${tech.id}</td>
                    <td class="breakdown-trigger clickable-metric" data-tech-id="${tech.id}" data-metric="points">${tech.points.toFixed(3)}</td>
                    <td class="breakdown-trigger clickable-metric" data-tech-id="${tech.id}" data-metric="fixTasks">${tech.fixTasks}</td>
                    <td class="breakdown-trigger clickable-metric ${tech.refixTasks > 0 ? 'text-red-400' : ''}" data-tech-id="${tech.id}" data-metric="refixTasks">${tech.refixTasks}</td>
                    <td><span class="quality-pill ${tech.quality >= 95 ? 'quality-pill-green' : tech.quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${tech.quality.toFixed(2)}%</span></td>
                    <td>${tech.bonusEarned.toFixed(2)}%</td>
                    <td class="payout-amount">${tech.payout.toFixed(2)}</td>
                    <td class="text-center"><button class="info-icon tech-summary-icon" data-tech-id="${tech.id}" title="View Details">${infoIconSvg}</button></td>
                `;
                // MODIFIED BLOCK END
                resultsTbody.appendChild(row);
            });
        }
        document.getElementById('bonus-payout-section').classList.remove('hidden');
        this.updateSortHeaders();
        // **NEW LINE:** Initialize the click listeners after results are displayed
        this.initBreakdownListeners();
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
        const select = document.getElementById('project-select');
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
    populateAdminTeamManagement() {
        const container = document.getElementById('team-list-container');
        if (!container) return;
        container.innerHTML = '';
        Object.entries(AppState.teamSettings).forEach(([teamName, techIds]) => this.addTeamCard(teamName, techIds));
    },
    addTeamCard(teamName = '', techIds = [], targetContainerId = 'team-list-container') {
        const container = document.getElementById(targetContainerId);
        const card = document.createElement('div');
        card.className = 'team-card p-4 rounded-lg bg-brand-900/50 border border-brand-700';
        card.innerHTML = `<div class="flex justify-between items-center mb-3"><input type="text" class="team-name-input input-field text-lg font-bold w-full" value="${teamName}" placeholder="Team Name"><button class="delete-team-btn control-btn-icon-danger ml-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button></div><div class="team-tech-list mb-3"></div><div class="flex gap-2"><input type="text" class="add-tech-input input-field w-full" placeholder="Add Tech ID"><button class="add-tech-btn btn-secondary">Add</button></div>`;
        container.appendChild(card);
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
        const container = document.getElementById('team-filter-container');
        if (!container) return;
        const refreshBtn = document.getElementById('refresh-teams-btn');
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
        const tbody = document.getElementById('leaderboard-body');
        const sortSelect = document.getElementById('leaderboard-sort-select');
        const metricHeader = document.getElementById('leaderboard-metric-header');
        if (!tbody || !sortSelect || !metricHeader) return;
        const sortBy = sortSelect.value;
        tbody.innerHTML = '';
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
        if (sortBy === 'totalPoints') { techArray.sort((a, b) => b.totalPoints - a.totalPoints); metricHeader.textContent = 'Points'; }
        else if (sortBy === 'fixTasks') { techArray.sort((a, b) => b.fixTasks - a.fixTasks); metricHeader.textContent = 'Tasks'; }
        else { techArray.sort((a, b) => b.fixQuality - a.fixQuality); metricHeader.textContent = 'Quality %'; }
        if (techArray.length === 0) return tbody.innerHTML = `<tr><td class="p-4 text-center text-brand-400" colspan="3">Calculate results to see data.</td></tr>`;
        techArray.forEach((stat, index) => {
            const row = document.createElement('tr');
            let value = sortBy === 'fixTasks' ? stat.fixTasks : sortBy === 'totalPoints' ? stat.totalPoints.toFixed(2) : `${stat.fixQuality.toFixed(2)}%`;
            row.innerHTML = `<td class="p-2">${index + 1}</td><td class="p-2">${stat.id}</td><td class="p-2">${value}</td>`;
            tbody.appendChild(row);
        });
    },
    updateTLSummary(techStats) {
        const tlCard = document.getElementById('tl-summary-card');
        if (Object.keys(techStats).length === 0) { tlCard.classList.add('hidden'); return; }
        tlCard.classList.remove('hidden'); this.setPanelHeights();
        const teamQualityContainer = document.getElementById('team-quality-container');
        teamQualityContainer.innerHTML = '';
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
            const qualityFloor = Math.floor(quality / 5) * 5;
            const qualityBar = document.createElement('div');
            let colorClass = qualityFloor < 90 ? 'red' : String(qualityFloor);
            qualityBar.innerHTML = `<div class="team-quality-label team-summary-trigger" data-team-name="${team}" title="${team}">${team}</div><div class="workload-bar"><div class="workload-bar-inner quality-bar-${colorClass}" style="width:${quality.toFixed(2)}%;">${quality.toFixed(2)}%</div></div>`;
            teamQualityContainer.appendChild(qualityBar);
        });

        const fix4Container = document.getElementById('fix4-breakdown-container');
        fix4Container.innerHTML = '';

        const selectedTeams = Array.from(document.querySelectorAll('#team-filter-container input:checked')).map(cb => cb.dataset.team);
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
            const teamName = getTeamName(techId);
            return selectedTeams.length === 0 || selectedTeams.includes(teamName);
        });

        if (filteredFix4.length > 0) {
            fix4Container.innerHTML = `<h3 class="text-lg font-bold text-white border-t border-brand-700 pt-4">Fix Category 4 (Breakdown)</h3>`;
            const table = document.createElement('table');
            table.className = 'min-w-full text-sm mt-2';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th class="text-left py-2 px-2 bg-brand-700/50">ID</th>
                        <th class="text-center py-2 px-2 bg-brand-700/50">C4-1</th>
                        <th class="text-center py-2 px-2 bg-brand-700/50">C4-2</th>
                        <th class="text-center py-2 px-2 bg-brand-700/50">C4-3</th>
                        <th class="text-center py-2 px-2 bg-brand-700/50">C4-4</th>
                    </tr>
                </thead>
                <tbody id="fix4-breakdown-tbody">
                    ${filteredFix4.map(([techId, counts]) => `
                        <tr>
                            <td class="py-1 px-2 font-semibold text-white">${techId}</td>
                            <td class="text-center py-1 px-2">${counts['4-1'] || 0}</td>
                            <td class="text-center py-1 px-2">${counts['4-2'] || 0}</td>
                            <td class="text-center py-1 px-2">${counts['4-3'] || 0}</td>
                            <td class="text-center py-1 px-2">${counts['4-4'] || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            fix4Container.appendChild(table);
        } else if (Object.keys(techStats).length > 0) {
            fix4Container.innerHTML = `<h3 class="text-lg font-bold text-white border-t border-brand-700 pt-4">Fix Category 4 (Breakdown)</h3><p class="text-brand-400 mt-2">No category 4 fixes found in this project for the selected teams.</p>`;
        }
    },
    updateQuickSummary(techStats) {
        // Implementation remains the same
        const container = document.getElementById('quick-summary-container');
        if (!container) return;
        const totalPoints = Object.values(techStats).reduce((sum, tech) => sum + tech.points, 0);
        const totalPayout = Object.values(techStats).reduce((sum, tech) => sum + tech.payout, 0);
        const totalFixTasks = Object.values(techStats).reduce((sum, tech) => sum + tech.fixTasks, 0);
        const totalRefixTasks = Object.values(techStats).reduce((sum, tech) => sum + tech.refixTasks, 0);
        const totalWarnings = Object.values(techStats).reduce((sum, tech) => sum + tech.warnings.length, 0);
        const totalDenominator = totalFixTasks + totalRefixTasks + totalWarnings;
        const overallQuality = totalDenominator > 0 ? (totalFixTasks / totalDenominator) * 100 : 0;

        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;

        const summaryItems = [
            { label: 'Total Points', value: totalPoints.toFixed(2), color: 'text-accent' },
            { label: 'Total Payout', value: totalPayout.toFixed(2), color: 'text-status-green' },
            { label: 'Total Fix Tasks', value: totalFixTasks, color: 'text-white' },
            { label: 'Overall Quality', value: `${overallQuality.toFixed(2)}%`, color: overallQuality >= 95 ? 'text-status-green' : overallQuality >= 85 ? 'text-status-orange' : 'text-status-red' },
            { label: 'Total Refix Tasks', value: totalRefixTasks, color: totalRefixTasks > 0 ? 'text-status-red' : 'text-white' },
            { label: 'Total Warnings', value: totalWarnings, color: totalWarnings > 0 ? 'text-status-red' : 'text-white' },
            { label: 'GSD Value', value: AppState.lastUsedGsdValue.toUpperCase(), color: 'text-brand-400' },
            { label: 'Bonus Multiplier', value: `x${bonusMultiplier.toFixed(2)}`, color: 'text-brand-400' },
        ];

        container.innerHTML = summaryItems.map(item => `
            <div class="p-3 bg-brand-700/50 rounded-lg">
                <p class="text-sm font-medium text-brand-400">${item.label}</p>
                <p class="text-xl font-bold ${item.color}">${item.value}</p>
            </div>
        `).join('');
    },
    
    // --- START NEW BREAKDOWN FUNCTIONS ---

    initBreakdownListeners() {
        const resultsTbody = document.getElementById('tech-results-tbody');
        if (!resultsTbody) return;
        
        // Use event delegation on the table body to handle clicks
        // Remove listener first to prevent multiple event bindings on re-calculation
        resultsTbody.removeEventListener('click', UI.handleBreakdownClick); 
        resultsTbody.addEventListener('click', UI.handleBreakdownClick);
    },
    
    handleBreakdownClick(e) {
        const target = e.target.closest('.breakdown-trigger');
        if (!target) return;
        
        const techId = target.dataset.techId;
        const metric = target.dataset.metric;
        
        if (techId && metric) {
            UI.openMetricBreakdownModal(techId, metric);
        }
    },

    openMetricBreakdownModal(techId, metricType) {
        const tech = AppState.currentTechStats[techId];
        if (!tech) return;

        let title = `${techId} - ${metricType.charAt(0).toUpperCase() + metricType.slice(1)} Breakdown`;
        let contentHTML = '<p class="text-brand-400">Could not generate breakdown details.</p>';
        const currentGsd = AppState.lastUsedGsdValue;

        try {
            switch (metricType) {
                case 'points':
                    title = `${techId} - Total Points Breakdown (GSD: ${currentGsd.toUpperCase()})`;
                    contentHTML = UI.generatePointsBreakdown(tech);
                    break;
                case 'fixTasks':
                    title = `${techId} - Successful Fix Tasks Breakdown`;
                    contentHTML = UI.generateFixTasksBreakdown(tech);
                    break;
                case 'refixTasks':
                    title = `${techId} - Refix Tasks Breakdown`;
                    contentHTML = UI.generateRefixTasksBreakdown(tech);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error("Error generating metric breakdown:", error);
        }

        document.getElementById('metric-breakdown-modal-title').textContent = title;
        document.getElementById('metric-breakdown-modal-body').innerHTML = contentHTML;
        document.getElementById('metric-breakdown-modal').classList.remove('hidden');
    },

    generatePointsBreakdown(tech) {
        const calc = AppState.calculationSettings;
        const gsd = AppState.lastUsedGsdValue;
        // Sums points from the tech.projectPoints array (successful fixes)
        const fixPoints = tech.projectPoints.reduce((sum, p) => sum + p.points, 0);
        const qcPoints = tech.qcTasks * (calc.points.qc || 0);
        const i3qaPoints = tech.i3qaTasks * (calc.points.i3qa || 0);
        // Note: tech.rvPoints is already the total points for RV tasks
        const rvPoints = tech.rvPoints || 0; 

        let html = `
            <h4 class="text-xl font-bold mb-4">Total Points Calculation</h4>
            <div class="space-y-3 p-4 rounded-lg bg-brand-900 border border-brand-700">
                <div class="summary-item flex justify-between">
                    <span>Base Fix Points (Cat. 1-9):</span>
                    <span class="font-mono text-white">${fixPoints.toFixed(3)} pts</span>
                </div>
                <div class="summary-item flex justify-between">
                    <span>QC Tasks (${tech.qcTasks} tasks):</span>
                    <span class="font-mono text-white">${tech.qcTasks} x ${(calc.points.qc || 0).toFixed(3)} = ${(qcPoints).toFixed(3)} pts</span>
                </div>
                <div class="summary-item flex justify-between">
                    <span>i3QA Tasks (${tech.i3qaTasks} tasks):</span>
                    <span class="font-mono text-white">${tech.i3qaTasks} x ${(calc.points.i3qa || 0).toFixed(3)} = ${(i3qaPoints).toFixed(3)} pts</span>
                </div>
                <div class="summary-item flex justify-between">
                    <span>RV Tasks (${tech.rvTasks} tasks):</span>
                    <span class="font-mono text-white">${(rvPoints).toFixed(3)} pts</span>
                </div>
                <div class="border-t border-brand-700 pt-3 flex justify-between font-bold text-lg text-accent">
                    <span>TOTAL POINTS:</span>
                    <span>${tech.points.toFixed(3)} pts</span>
                </div>
            </div>
            <p class="text-brand-400 mt-4">Total Points = Base Fix Points + QC Points + i3QA Points + RV Points. Base Fix Points are derived from the Fix Category points, weighted by the GSD value (${gsd.toUpperCase()}), and may include the IR modifier (${calc.irModifierValue}x).</p>
        `;
        return html;
    },

    generateFixTasksBreakdown(tech) {
        let fixListHTML = '';
        if (tech.projectPoints && tech.projectPoints.length > 0) {
            // Group successful fixes by category for a cleaner view
            const categorizedPoints = tech.projectPoints.reduce((acc, p) => {
                const key = `Category ${p.category}${p.isIR ? ' (IR)' : ''}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

            fixListHTML = Object.entries(categorizedPoints).map(([category, count]) => {
                return `<li class="flex justify-between items-center py-1 border-b border-brand-700/50">
                    <span class="text-brand-400">${category}:</span>
                    <span class="font-mono text-white">${count} fix${count > 1 ? 'es' : ''}</span>
                </li>`;
            }).join('');

            fixListHTML += `<li class="flex justify-between items-center py-1 font-bold text-white bg-brand-700/50 mt-2">
                <span>Total Unique Fixes (contributing to fixTasks):</span>
                <span class="font-mono">${tech.fixTasks}</span>
            </li>`;

        } else {
            fixListHTML = '<li class="text-center py-4 text-brand-400">No successful fix tasks recorded.</li>';
        }

        let html = `
            <h4 class="text-xl font-bold mb-4">Successful Fix Tasks (${tech.fixTasks} Total)</h4>
            <p class="mb-4 text-brand-400">This metric represents the number of fixes that were counted as successful after excluding fixes that triggered a **Refix, Miss, or Warning** that negates the fix (i.e., this is the **numerator** of your Quality calculation).</p>
            <ul class="space-y-1 p-4 rounded-lg bg-brand-900 border border-brand-700">
                ${fixListHTML}
            </ul>
        `;
        return html;
    },

    generateRefixTasksBreakdown(tech) {
        // Find Refix-triggering warnings
        const refixTriggers = tech.warnings ? tech.warnings.filter(w => w.isRefix) : [];
        let refixListHTML = '';
        
        if (tech.refixTasks > 0) {
            if (refixTriggers.length > 0) {
                refixListHTML = refixTriggers.map((warning, index) => {
                    const column = warning.column || 'N/A Column';
                    const label = warning.label || 'i';
                    return `<li class="flex justify-between items-center py-1 border-b border-brand-700/50">
                        <span class="text-brand-400">Refix Trigger: ${column}</span>
                        <span class="font-mono text-red-400">Label: ${label}</span>
                    </li>`;
                }).join('');
            } else {
                 refixListHTML = `<li class="text-center py-4 text-brand-400">Refix count is ${tech.refixTasks}, but detailed line-item breakdown is unavailable in the current session data.</li>`;
            }
        } else {
            refixListHTML = '<li class="text-center py-4 text-brand-400">No refix tasks recorded. Excellent work!</li>';
        }

        let html = `
            <h4 class="text-xl font-bold mb-4 text-red-400">Refix Tasks Breakdown (${tech.refixTasks} Total)</h4>
            <p class="mb-4 text-brand-400">This metric tracks fixes that were flagged with a **Refix-triggering label** ('i') in the RV columns (rv1_label, rv2_label, rv3_label). Each Refix adds to the **denominator** of your Quality calculation.</p>
            <ul class="space-y-1 p-4 rounded-lg bg-brand-900 border border-brand-700">
                ${refixListHTML}
            </ul>
        `;
        return html;
    },

    // --- END NEW BREAKDOWN FUNCTIONS ---
    
    openTeamSummaryModal(teamName) {
        // Implementation remains the same
        const modal = document.getElementById('team-summary-modal');
        const title = document.getElementById('team-summary-modal-title');
        const body = document.getElementById('team-summary-modal-body');
        if (!modal || !title || !body) return;
        
        const teamTechs = AppState.teamSettings[teamName] || [];
        const techStats = teamTechs.map(id => AppState.currentTechStats[id]).filter(Boolean);
        
        title.textContent = `${teamName} Summary (${techStats.length} Members)`;
        body.innerHTML = '';

        if (techStats.length === 0) {
            body.innerHTML = `<p class="text-brand-400">No calculation data available for team members in the current results.</p>`;
            modal.classList.remove('hidden');
            return;
        }

        const teamSummary = techStats.reduce((acc, tech) => {
            acc.totalPoints += tech.points;
            acc.totalPayout += tech.payout;
            acc.totalFixTasks += tech.fixTasks;
            acc.totalRefixTasks += tech.refixTasks;
            acc.totalWarnings += tech.warnings.length;
            return acc;
        }, { totalPoints: 0, totalPayout: 0, totalFixTasks: 0, totalRefixTasks: 0, totalWarnings: 0 });

        const denominator = teamSummary.totalFixTasks + teamSummary.totalRefixTasks + teamSummary.totalWarnings;
        const overallQuality = denominator > 0 ? (teamSummary.totalFixTasks / denominator) * 100 : 0;
        
        let detailTable = `<h4 class="text-lg font-bold text-white mb-2">Member Performance</h4><div class="overflow-x-auto custom-scrollbar"><table class="min-w-full text-sm"><thead><tr><th>ID</th><th>Points</th><th>Tasks</th><th>Refix</th><th>Quality</th><th>Payout</th></tr></thead><tbody>`;
        techStats.sort((a, b) => b.payout - a.payout).forEach(tech => {
            detailTable += `
                <tr>
                    <td class="font-semibold text-white">${tech.id}</td>
                    <td>${tech.points.toFixed(2)}</td>
                    <td>${tech.fixTasks}</td>
                    <td class="${tech.refixTasks > 0 ? 'text-red-400' : ''}">${tech.refixTasks}</td>
                    <td><span class="quality-pill ${tech.quality >= 95 ? 'quality-pill-green' : tech.quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${tech.quality.toFixed(2)}%</span></td>
                    <td class="payout-amount">${tech.payout.toFixed(2)}</td>
                </tr>
            `;
        });
        detailTable += `</tbody></table></div>`;

        body.innerHTML = `
            <div class="space-y-3 p-4 rounded-lg bg-brand-900 border border-brand-700 mb-6">
                <h4 class="text-xl font-bold text-accent">Team Totals</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="summary-item"><span>Total Points:</span> <span class="font-bold text-white">${teamSummary.totalPoints.toFixed(2)}</span></div>
                    <div class="summary-item"><span>Total Payout:</span> <span class="font-bold text-status-green">${teamSummary.totalPayout.toFixed(2)}</span></div>
                    <div class="summary-item"><span>Total Fix Tasks:</span> <span class="font-bold text-white">${teamSummary.totalFixTasks}</span></div>
                    <div class="summary-item"><span>Overall Quality:</span> <span class="font-bold ${overallQuality >= 95 ? 'text-status-green' : overallQuality >= 85 ? 'text-status-orange' : 'text-status-red'}">${overallQuality.toFixed(2)}%</span></div>
                </div>
            </div>
            ${detailTable}
        `;

        modal.classList.remove('hidden');
    },
    openTechSummaryModal(techId) {
        // Implementation remains the same
        const modal = document.getElementById('tech-summary-modal');
        const title = document.getElementById('tech-summary-modal-title');
        const body = document.getElementById('tech-summary-modal-body');
        if (!modal || !title || !body) return;
        
        const tech = AppState.currentTechStats[techId];
        if (!tech) {
            UI.showNotification(`No data found for Tech ID ${techId}.`, true);
            return;
        }

        const totalDenominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
        const totalProjectPoints = tech.projectPoints.reduce((sum, p) => sum + p.points, 0);
        const teamName = Object.keys(AppState.teamSettings).find(team => AppState.teamSettings[team].includes(techId)) || 'N/A';

        title.textContent = `Performance Details: ${techId}`;
        
        let warningsHtml = '';
        if (tech.warnings.length > 0) {
            warningsHtml = `
                <h4 class="text-lg font-bold text-status-red mt-4 border-t border-brand-700 pt-4">Warnings/Penalties (${tech.warnings.length})</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                    ${tech.warnings.map(w => {
                        const type = w.isRefix ? 'Refix' : w.isMiss ? 'Miss' : 'Warning';
                        const severity = w.isRefix ? 'text-status-red' : w.isMiss ? 'text-status-red' : 'text-status-orange';
                        return `<li class="${severity}"><span class="text-white">${type}</span>: Label '${w.label}' in column <span class="font-mono">${w.column}</span></li>`;
                    }).join('')}
                </ul>
            `;
        } else {
             warningsHtml = `<p class="text-status-green font-semibold mt-4 border-t border-brand-700 pt-4">No critical warnings or penalties recorded!</p>`;
        }

        body.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-brand-900 border border-brand-700">
                <div class="summary-item"><span>Team:</span> <span class="font-bold text-white">${teamName}</span></div>
                <div class="summary-item"><span>Project Points (Base):</span> <span class="font-bold text-white">${totalProjectPoints.toFixed(2)}</span></div>
                <div class="summary-item"><span>Total Points (Final):</span> <span class="font-bold text-accent">${tech.points.toFixed(2)}</span></div>
                <div class="summary-item"><span>Total Payout:</span> <span class="font-bold text-status-green">${tech.payout.toFixed(2)}</span></div>
                <div class="summary-item"><span>Fix Tasks:</span> <span class="font-bold text-white">${tech.fixTasks}</span></div>
                <div class="summary-item"><span>Refix Tasks:</span> <span class="font-bold ${tech.refixTasks > 0 ? 'text-status-red' : 'text-white'}">${tech.refixTasks}</span></div>
                <div class="summary-item col-span-2"><span>Quality:</span> <span class="quality-pill ${tech.quality >= 95 ? 'quality-pill-green' : tech.quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'} font-bold">${tech.quality.toFixed(2)}%</span></div>
            </div>

            <h4 class="text-lg font-bold text-white">Task Summary</h4>
            <div class="grid grid-cols-3 gap-3 text-sm mt-2">
                <div class="p-2 bg-brand-900 rounded">QC: ${tech.qcTasks}</div>
                <div class="p-2 bg-brand-900 rounded">i3QA: ${tech.i3qaTasks}</div>
                <div class="p-2 bg-brand-900 rounded">RV: ${tech.rvTasks}</div>
            </div>
            
            ${warningsHtml}
        `;

        modal.classList.remove('hidden');
    },
    closeModal(id) {
        // Implementation remains the same
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('hidden');
    },
    showNotification(message, isError = false) {
        // Implementation remains the same
        const notification = document.getElementById('update-notification');
        if (!notification) return;
        notification.textContent = message;
        notification.classList.remove('hidden', 'bg-accent', 'bg-status-red');
        notification.classList.add(isError ? 'bg-status-red' : 'bg-accent');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    },
    populateInfoModal() {
        // Implementation remains the same
        const tierTbody = document.getElementById('bonus-tier-info-tbody');
        const pointsTbody = document.getElementById('category-points-info-tbody');
        if (!tierTbody || !pointsTbody) return;

        // Populate Bonus Tiers
        tierTbody.innerHTML = '';
        const sortedTiers = [...AppState.bonusTiers].sort((a, b) => b.quality - a.quality);
        for (let i = 0; i < sortedTiers.length; i += 2) {
            const tier1 = sortedTiers[i];
            const tier2 = sortedTiers[i+1];
            let rowHtml = `<tr><td>${tier1.quality}%</td><td>${tier1.bonus}x</td>`;
            if (tier2) {
                 rowHtml += `<td>${tier2.quality}%</td><td>${tier2.bonus}x</td>`;
            } else {
                 rowHtml += `<td></td><td></td>`;
            }
            rowHtml += `</tr>`;
            tierTbody.insertAdjacentHTML('beforeend', rowHtml);
        }

        // Populate Category Points (using 3in GSD as default display)
        pointsTbody.innerHTML = '';
        const categories = Object.keys(AppState.calculationSettings.categoryValues).sort((a, b) => parseInt(a) - parseInt(b));
        const categoryValues = AppState.calculationSettings.categoryValues;
        for (let i = 0; i < categories.length; i += 2) {
            const cat1 = categories[i];
            const cat2 = categories[i+1];
            let rowHtml = `<tr><td>Cat ${cat1}</td><td>${categoryValues[cat1]['3in'].toFixed(2)}</td>`;
            if (cat2) {
                 rowHtml += `<td>Cat ${cat2}</td><td>${categoryValues[cat2]['3in'].toFixed(2)}</td>`;
            } else {
                 rowHtml += `<td></td><td></td>`;
            }
            rowHtml += `</tr>`;
            pointsTbody.insertAdjacentHTML('beforeend', rowHtml);
        }
    },
    initListeners() {
        // Implementation remains the same
        const listen = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) element.addEventListener(event, handler.bind(App));
        };

        // UI Listeners
        window.addEventListener('resize', UI.setPanelHeights);

        // Project/Data Panel
        listen('project-select', 'change', App.handleProjectSelectChange);
        listen('save-project-btn', 'click', App.saveProject);
        listen('clear-data-btn-local', 'click', App.clearLocalData);
        listen('delete-project-btn', 'click', App.deleteSelectedProject);
        listen('refresh-projects-btn', 'click', App.loadLocalProjects);
        listen('edit-data-btn', 'click', App.editSelectedProject);
        
        // Calculation Controls
        listen('calculate-btn', 'click', App.calculateAll);
        listen('calculate-combined-btn', 'click', App.calculateCombined);
        listen('customize-calc-all-cb', 'change', App.handleCustomizeCalcToggle);

        // Results/Filter/Sort
        listen('tech-results-tbody', 'click', App.handleTechDetailClick); // Existing Tech Detail Modal
        listen('team-filter-container', 'change', App.handleTeamFilterChange);
        listen('filter-reset-btn', 'click', App.resetFiltersAndSearch);
        listen('tech-search-input', 'input', App.handleSearchInput);
        listen('export-csv-btn', 'click', App.exportToCSV);
        document.querySelectorAll('.sortable-header').forEach(header => {
            header.addEventListener('click', App.handleSortClick.bind(App));
        });

        // Leaderboard/TL Summary
        listen('leaderboard-sort-select', 'change', App.handleLeaderboardSortChange);
        listen('leaderboard-refresh-btn', 'click', App.handleLeaderboardSortChange);
        listen('tl-summary-card', 'click', App.handleTeamSummaryTrigger);
        listen('tl-refresh-btn', 'click', App.calculateAll);

        // Main Menu Modals
        listen('main-menu-btn', 'click', App.toggleMainMenu);
        listen('manage-teams-btn', 'click', App.openManageTeamsModal);
        listen('add-team-btn', 'click', () => UI.addTeamCard('', []));
        listen('save-teams-btn', 'click', App.saveTeams);
        listen('reset-teams-btn', 'click', App.resetTeamsToDefault);
        listen('advance-settings-btn', 'click', App.openAdvanceSettingsModal);
        listen('save-advance-settings-btn', 'click', App.saveAdvanceSettings);
        listen('reset-advance-settings-btn', 'click', App.resetAdvanceSettings);
        listen('clear-data-btn', 'click', App.confirmClearAllData);
        listen('important-info-btn', 'click', App.openImportantInfoModal);
        listen('guided-setup-btn', 'click', App.openGuidedSetupModal);
        
        // Modal Close Buttons
        document.querySelectorAll('.modal-close-btn').forEach(button => {
            button.addEventListener('click', e => {
                const modal = e.target.closest('.fixed');
                if (modal) modal.classList.add('hidden');
            });
        });

        // Guided Setup
        listen('setup-next-btn', 'click', App.nextGuidedStep);
        listen('setup-prev-btn', 'click', App.prevGuidedStep);

        // Admin Portal
        listen('admin-portal-btn', 'click', App.openAdminPortalModal);
        listen('admin-save-project-btn', 'click', App.saveProjectToCloud);
        listen('admin-reset-form-btn', 'click', App.resetAdminProjectForm);
        document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById('admin-projects').classList.add('active');
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', App.handleAdminTabSwitch.bind(App));
        });
        listen('admin-users-tab', 'click', App.loadUserManagement);

        // Firebase Update Banner
        listen('accept-update-btn', 'click', App.acceptLatestSettings);
        listen('update-online-btn', 'click', App.syncProjects);
        
        // Chatbot
        listen('chatbot-bubble', 'click', App.toggleChatbot);
        listen('chatbot-close-btn', 'click', App.toggleChatbot);
        listen('chatbot-input', 'keydown', App.handleChatbotInput);


        // Custom Tailwing Theme Toggler
        listen('toggle-theme-btn', 'click', App.toggleTheme);
        
        // Merge FP Modal
        listen('edit-data-btn', 'click', App.openMergeFPModal);
        listen('execute-merge-btn', 'click', App.executeMerge);
        listen('merge-fp-modal', 'click', e => {
            if (e.target.id === 'merge-fp-modal') UI.closeModal('merge-fp-modal');
        });
        
        // Main Drop Zone
        listen('drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.add('bg-brand-700'); });
        listen('drop-zone', 'dragleave', e => e.target.closest('#drop-zone').classList.remove('bg-brand-700'));
        listen('drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.remove('bg-brand-700'); App.handleDroppedFiles(e.dataTransfer.files); });

        // Admin Portal Drop Zone
        listen('admin-drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.add('bg-brand-700'); });
        listen('admin-drop-zone', 'dragleave', e => e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'));
        listen('admin-drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'); App.handleAdminDroppedFiles(e.dataTransfer.files); });

        // Merge FP Drop Zone
        listen('merge-drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#merge-drop-zone').classList.add('border-accent'); });
        listen('merge-drop-zone', 'dragleave', e => e.target.closest('#merge-drop-zone').classList.remove('border-accent'));
        listen('merge-drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#merge-drop-zone').classList.remove('border-accent'); App.handleMergeDroppedFiles(e.dataTransfer.files); });

        // Initial set heights
        UI.setPanelHeights();
    }
};

const Calculator = {
    // This function calculates the points for a single row of data
    calculateRowPoints(row, gsd, isIR, customSettings) {
        // Implementation remains the same
        const settings = customSettings || AppState.calculationSettings;
        const categoryValues = settings.categoryValues;
        const irModifier = settings.irModifierValue || 1;
        
        const category = row.fix_category;
        const isFix = row.fix_count > 0 && row.fix_label === 'f'; 

        if (!isFix || !category || category === '0') {
            return { points: 0, category: '0', isIR: false, isFix: false };
        }

        const gsdKey = gsd || AppState.lastUsedGsdValue;
        let points = 0;
        let finalIR = isIR || false; // Use project IR status unless row indicates otherwise

        // Base points from category table
        if (categoryValues[category] && categoryValues[category][gsdKey]) {
            points = categoryValues[category][gsdKey];
        } else {
            return { points: 0, category: category, isIR: finalIR, isFix: true }; // Category not found or 0 points
        }
        
        // Apply IR multiplier if applicable
        if (finalIR && category !== '7') { // Category 7 (RV) does not get IR modifier
            points *= irModifier;
        }

        return {
            points: points,
            category: category,
            isIR: finalIR,
            isFix: true
        };
    },
    // This function aggregates all data and calculates final tech stats
    calculateTechStats(data, customSettings, projectGsd, techIdOverride) {
        // Implementation remains the same
        const settings = customSettings || AppState.calculationSettings;
        const counting = AppState.countingSettings;
        const techStats = {};
        const gsd = projectGsd || AppState.lastUsedGsdValue;
        
        const isIRProject = data.isIR || false;

        const initTech = (id) => ({
            id,
            points: 0,
            fixTasks: 0,
            refixTasks: 0,
            qcTasks: 0,
            i3qaTasks: 0,
            rvTasks: 0,
            rvPoints: 0,
            warnings: [],
            projectPoints: [], // Detailed list of points from fixes (for breakdown)
            fix4: [], // Detailed list of cat 4 fixes
            payout: 0, quality: 0, bonusEarned: 0
        });

        const uniqueFixes = {}; // key: techId_taskKey_category
        const uniqueQCTasks = {};
        const uniqueI3QATasks = {};
        const uniqueRVTasks = {};

        data.content.forEach(row => {
            const techId = techIdOverride || String(row.tech_id).toUpperCase();
            if (!techId || !CONSTANTS.TECH_ID_REGEX.test(techId)) return; // Skip invalid tech IDs

            if (!techStats[techId]) {
                techStats[techId] = initTech(techId);
            }
            const tech = techStats[techId];
            
            // --- 1. Calculate Points from Fixes ---
            const fixResult = Calculator.calculateRowPoints(row, gsd, isIRProject, settings);
            if (fixResult.isFix) {
                tech.projectPoints.push(fixResult);
                
                // Track Cat 4 fixes separately
                if (String(fixResult.category) === '4') {
                     const cat4Key = row.fix_type;
                     if (cat4Key) tech.fix4.push({ category: cat4Key, rowId: row.gid });
                }
            }

            // --- 2. Tally Warning/Penalty Metrics (Denominator) ---

            const rowWarnings = [];
            const checkWarning = (column, label, isRefix = false, isMiss = false) => {
                if (label && label !== 'na' && label !== 'f') {
                    rowWarnings.push({ column, label, isRefix, isMiss });
                }
            };
            
            // Check Refix/Miss (rv1_label, rv2_label, rv3_label, i3qa_label)
            counting.triggers.refix.columns.forEach(col => checkWarning(col, row[col], true));
            counting.triggers.miss.columns.forEach(col => checkWarning(col, row[col], false, true));

            // Check General Warnings (r1_warn, r2_warn, r3_warn, r4_warn)
            counting.triggers.warning.columns.forEach(col => checkWarning(col, row[col]));
            
            // Apply unique warning logic
            rowWarnings.forEach(warning => {
                const isRefixTrigger = counting.triggers.refix.labels.includes(warning.label) && counting.triggers.refix.columns.includes(warning.column);
                const isMissTrigger = counting.triggers.miss.labels.includes(warning.label) && counting.triggers.miss.columns.includes(warning.column);
                const isWarningTrigger = counting.triggers.warning.labels.includes(warning.label) && counting.triggers.warning.columns.includes(warning.column);

                // Use a combination of these checks to determine if it's a quality penalty
                if (isRefixTrigger || isMissTrigger || isWarningTrigger) {
                    // Check if a warning for this column/label combination has already been recorded for this tech
                    const warningKey = `${techId}_${warning.column}_${warning.label}`;
                    if (!tech.warnings.some(w => w.column === warning.column && w.label === warning.label)) {
                        tech.warnings.push({ 
                            column: warning.column, 
                            label: warning.label, 
                            isRefix: isRefixTrigger, 
                            isMiss: isMissTrigger
                        });
                        if (isRefixTrigger) tech.refixTasks++;
                    }
                }
            });


            // --- 3. Tally Task/Points Metrics (Numerator components) ---

            // Fix Tasks (Successful Fixes)
            // A fix is counted if it has a category and is labeled 'f' and is not negated by a refix/miss/warning
            if (fixResult.isFix) {
                const fixKey = `${techId}_${row.fix_id}_${row.fix_category}`;
                // Only count the fix task if it hasn't already been counted and there are no critical warnings (refix/miss) on this row
                const isCriticalPenaltyOnRow = rowWarnings.some(w => w.isRefix || w.isMiss);
                if (!uniqueFixes[fixKey] && !isCriticalPenaltyOnRow) {
                    uniqueFixes[fixKey] = true;
                    tech.fixTasks++;
                }
            }

            // QC Tasks
            if (row.qc_id && row.qc_id !== 'na') {
                const qcKey = `${techId}_${row.qc_id}`;
                if (!uniqueQCTasks[qcKey]) {
                    uniqueQCTasks[qcKey] = true;
                    tech.qcTasks++;
                    // Apply QC penalty check
                    const isQCPenalty = counting.triggers.qcPenalty.labels.includes(row.i3qa_label) && counting.triggers.qcPenalty.columns.includes('i3qa_label');
                    if (isQCPenalty) {
                        // QC task is penalized, count it as a negative warning
                        const warningKey = `${techId}_qc_penalty_${row.qc_id}`;
                        if (!tech.warnings.some(w => w.column === 'qc_penalty' && w.fixId === row.qc_id)) {
                             tech.warnings.push({ column: 'qc_penalty', label: row.i3qa_label, fixId: row.qc_id });
                        }
                    }
                }
            }
            
            // i3QA Tasks
            if (row.i3qa_id && row.i3qa_id !== 'na') {
                const i3qaKey = `${techId}_${row.i3qa_id}`;
                if (!uniqueI3QATasks[i3qaKey]) {
                    uniqueI3QATasks[i3qaKey] = true;
                    tech.i3qaTasks++;
                }
            }

            // RV Tasks (RV1, RV2) - We count any task with an RV ID
            if (row.rv1_id && row.rv1_id !== 'na') {
                 const rvKey = `${techId}_${row.rv1_id}`;
                 if (!uniqueRVTasks[rvKey]) {
                    uniqueRVTasks[rvKey] = true;
                    tech.rvTasks++;
                    tech.rvPoints += (settings.points.rv1 || 0);
                 }
            }
            if (row.rv2_id && row.rv2_id !== 'na') {
                 const rvKey = `${techId}_${row.rv2_id}`;
                 if (!uniqueRVTasks[rvKey]) {
                    uniqueRVTasks[rvKey] = true;
                    tech.rvTasks++;
                    tech.rvPoints += (settings.points.rv2 || 0);
                 }
            }
            // RV1 Combo Points
            if (row.rv1_id && row.rv1_id !== 'na' && row.rv2_id && row.rv2_id !== 'na') {
                 const rvKey = `${techId}_${row.rv1_id}_combo`;
                 if (uniqueRVTasks[rvKey]) { /* Do nothing - already applied */ }
                 else if (uniqueRVTasks[`${techId}_${row.rv1_id}`] && uniqueRVTasks[`${techId}_${row.rv2_id}`]) {
                    uniqueRVTasks[rvKey] = true;
                    tech.rvPoints += (settings.points.rv1_combo || 0);
                 }
            }
        });

        // --- 4. Final Aggregation ---
        Object.values(techStats).forEach(tech => {
            // Sum all project points (base fixes)
            const baseFixPoints = tech.projectPoints.reduce((sum, p) => sum + p.points, 0);
            // Add other task points
            tech.points = baseFixPoints
                + (tech.qcTasks * (settings.points.qc || 0))
                + (tech.i3qaTasks * (settings.points.i3qa || 0))
                + tech.rvPoints; // rvPoints is already summed up during the row loop
        });

        return techStats;
    },
    calculateQualityModifier(qualityPercentage) {
        // Implementation remains the same
        const tiers = AppState.bonusTiers;
        // Sort tiers from highest quality to lowest
        const sortedTiers = tiers.sort((a, b) => b.quality - a.quality);
        
        // Find the matching or closest lower tier
        for (const tier of sortedTiers) {
            if (qualityPercentage >= tier.quality) {
                return tier.bonus;
            }
        }
        
        // If quality is below the lowest defined tier, return 0 or the lowest tier's bonus
        return (sortedTiers[sortedTiers.length - 1] && qualityPercentage < sortedTiers[sortedTiers.length - 1].quality) 
               ? sortedTiers[sortedTiers.length - 1].bonus // Return lowest defined bonus
               : 0; // If tiers are empty or something unexpected
    },
    parseRawData(data, fileName, techIdOverride = null) {
        // Implementation remains the same
        const isFixFolder = data.includes('fix_category') && data.includes('tech_id');
        const isShapefileData = Array.isArray(data);

        if (isFixFolder) {
            // TSV/CSV Logic (assuming TSV for simplicity as it's common in this domain)
            const lines = data.trim().split('\n');
            if (lines.length < 2) throw new Error("File contains no data rows.");
            const headers = lines[0].toLowerCase().split('\t');
            if (!headers.includes('fix_category') || !headers.includes('tech_id')) {
                throw new Error("Missing required columns: 'fix_category' and 'tech_id'.");
            }
            const content = lines.slice(1).map(line => {
                const values = line.split('\t');
                const row = {};
                headers.forEach((header, i) => {
                    row[header.trim()] = values[i] ? values[i].trim().toLowerCase() : '';
                });
                // Ensure tech_id is processed correctly if override is used
                if (techIdOverride) row.tech_id = techIdOverride;
                return row;
            });
            
            return {
                id: fileName,
                name: fileName.replace(/\.[^/.]+$/, "") || 'Untitled Project',
                content: content,
                gsd: '3in', // Default GSD, will be overridden by UI/project settings
                isIR: fileName.toLowerCase().includes('ir')
            };

        } else if (isShapefileData) {
            // Shapefile/DBF Parsed Data Logic (Array of objects)
            if (data.length === 0) throw new Error("Shapefile data contains no records.");
            // Assuming required fields are present and lowercased by the parser
            if (!data[0].fix_category || !data[0].tech_id) {
                throw new Error("Shapefile data missing required properties: 'fix_category' and 'tech_id'.");
            }
            return {
                id: fileName,
                name: fileName.replace(/\.[^/.]+$/, "") || 'Untitled Project',
                content: data.map(row => {
                    if (techIdOverride) row.tech_id = techIdOverride;
                    return Object.fromEntries(
                        Object.entries(row).map(([k, v]) => [k.toLowerCase(), String(v).toLowerCase()])
                    );
                }),
                gsd: '3in', // Default GSD
                isIR: fileName.toLowerCase().includes('ir')
            };
        } else {
            throw new Error("Data format not recognized. Please use TSV/CSV or Fix Folder files.");
        }
    },
    mergeProjectData(projects) {
        // Implementation remains the same
         if (!Array.isArray(projects) || projects.length === 0) {
            return { content: [], isIR: false, gsd: '3in' };
        }

        const combinedContent = projects.flatMap(p => p.content || []);
        
        // Determine combined IR status (true if any project is IR)
        const combinedIR = projects.some(p => p.isIR);

        // Determine GSD (use the GSD of the first project as a convention)
        const combinedGsd = projects[0].gsd || '3in';

        return {
            content: combinedContent,
            isIR: combinedIR,
            gsd: combinedGsd
        };
    },
    parseDbf(buffer) {
        // Implementation remains the same
         return new Promise((resolve, reject) => {
            const worker = new Worker('dbf-worker.js'); // Assuming a web worker for dbf parsing
            worker.onmessage = (e) => {
                if (e.data.error) {
                    reject(e.data.error);
                } else {
                    resolve(e.data.data);
                }
            };
            worker.onerror = (e) => reject(new Error('DBF Worker error: ' + e.message));
            worker.postMessage({ buffer }, [buffer]);
        });
    },
    parseShp(buffer) {
        // Implementation remains the same
         return new Promise((resolve, reject) => {
            shapefile.openShp(buffer).then(source => {
                const records = [];
                let hasError = false;
                source.read().then(function log(result) {
                    if (result.done) return records;
                    records.push(result.value);
                    return source.read().then(log);
                }).then(records => {
                    if (!hasError) resolve(records);
                }).catch(error => {
                    if (!hasError) reject(error);
                    hasError = true;
                });
            }).catch(reject);
        });
    }
};

const App = {
    // Implementation remains the same
    init() {
        DB.open().then(() => {
            App.loadSettings().then(() => {
                App.loadLocalProjects();
                UI.populateTeamFilters();
                UI.populateInfoModal();
            });
            App.initFirebase();
            App.logVisit();
        }).catch(err => {
            console.error("Initialization failed:", err);
            UI.showNotification("Failed to initialize database. Data may not save.", true);
        });
    },
    initFirebase() {
        // Implementation remains the same
        const firebaseConfig = {
            // (Your Firebase config)
        };
        try {
            AppState.firebase.app = firebase.initializeApp(firebaseConfig);
            AppState.firebase.auth = firebase.auth();
            AppState.firebase.db = firebase.firestore();
            AppState.firebase.tools = firebase.firestore.FieldValue;
            AppState.firebase.auth.onAuthStateChanged(user => {
                if (user) {
                    App.handleUserLogin(user);
                } else {
                    App.signInAnonymously();
                }
            });
        } catch (e) {
            console.warn("Firebase initialization failed:", e.message);
            // This is acceptable if running locally without an internet connection
        }
    },
    signInAnonymously() {
        // Implementation remains the same
        AppState.firebase.auth.signInAnonymously().catch(error => {
            console.error("Anonymous sign-in failed:", error.code, error.message);
        });
    },
    async handleUserLogin(user) {
        // Implementation remains the same
        if (user.email && CONSTANTS.ADMIN_EMAIL.includes(user.email)) {
            AppState.firebase.isAdmin = true;
            document.getElementById('admin-portal-btn').classList.remove('hidden');
        } else {
            AppState.firebase.isAdmin = false;
            document.getElementById('admin-portal-btn').classList.add('hidden');
        }
        App.checkForUpdates();
    },
    async checkForUpdates() {
        // Implementation remains the same
        if (!AppState.firebase.db) return;
        const localVersion = (await DB.get('settings', 'version'))?.value || 0;

        AppState.firebase.db.collection('settings').doc('latest').get().then(doc => {
            if (doc.exists) {
                const latest = doc.data();
                if (latest.version > localVersion) {
                    document.getElementById('update-banner-text').textContent = `New calculation settings v${latest.version} are available.`;
                    document.getElementById('user-update-banner').classList.remove('hidden');
                } else {
                    document.getElementById('user-update-banner').classList.add('hidden');
                }
            }
        }).catch(error => {
            console.error("Error checking for updates:", error);
        });
    },
    async acceptLatestSettings() {
        // Implementation remains the same
        if (!AppState.firebase.db) return;
        try {
            const doc = await AppState.firebase.db.collection('settings').doc('latest').get();
            if (doc.exists) {
                const latest = doc.data();
                await DB.put('calculationSettings', { id: 'main', value: latest.calculationSettings });
                await DB.put('bonusTiers', { id: 'main', value: latest.bonusTiers });
                await DB.put('countingSettings', { id: 'main', value: latest.countingSettings });
                await DB.put('settings', { id: 'version', value: latest.version });
                
                // Reload the application state with new settings
                await App.loadSettings();

                document.getElementById('user-update-banner').classList.add('hidden');
                UI.showNotification(`Settings updated to v${latest.version}!`);
                UI.populateInfoModal();
            }
        } catch (error) {
            console.error("Error accepting update:", error);
            UI.showNotification("Error accepting update.", true);
        }
    },
    async logVisit() {
        // Implementation remains the same
         if (!AppState.firebase.db || !AppState.firebase.auth || !AppState.firebase.auth.currentUser) return;
        try {
            const parser = new UAParser();
            const result = parser.getResult();
            await AppState.firebase.db.collection('logs').add({
                userId: AppState.firebase.auth.currentUser.uid,
                timestamp: AppState.firebase.tools.serverTimestamp(),
                userAgent: navigator.userAgent,
                browser: result.browser.name || 'Unknown',
                os: result.os.name || 'Unknown',
                device: result.device.type || 'desktop'
            });
        } catch (error) {
            console.warn("Error logging visit:", error);
        }
    },
    async loadSettings() {
        // Implementation remains the same
        const defaultSettings = {
            bonusTiers: CONSTANTS.DEFAULT_BONUS_TIERS,
            teamSettings: CONSTANTS.DEFAULT_TEAMS,
            calculationSettings: CONSTANTS.DEFAULT_CALCULATION_SETTINGS,
            countingSettings: CONSTANTS.DEFAULT_COUNTING_SETTINGS
        };
        
        const tiers = (await DB.get('bonusTiers', 'main'))?.value;
        const teams = (await DB.get('teams', 'main'))?.value;
        const calc = (await DB.get('calculationSettings', 'main'))?.value;
        const count = (await DB.get('countingSettings', 'main'))?.value;

        AppState.bonusTiers = tiers || defaultSettings.bonusTiers;
        AppState.teamSettings = teams || defaultSettings.teamSettings;
        AppState.calculationSettings = calc || defaultSettings.calculationSettings;
        AppState.countingSettings = count || defaultSettings.countingSettings;
    },
    async loadLocalProjects() {
        // Implementation remains the same
        const projects = await DB.getAll('projects');
        const select = document.getElementById('project-select');
        const combinedSelect = document.getElementById('project-combined-select');
        
        AppState.projectListCache = projects;
        
        UI.populateProjectSelect(projects);

        // Populate combined select
        const combinedCurrent = Array.from(combinedSelect.options).filter(o => o.selected).map(o => o.value);
        combinedSelect.innerHTML = '';
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.name;
            if (combinedCurrent.includes(p.id)) option.selected = true;
            combinedSelect.appendChild(option);
        });

        App.handleProjectSelectChange(); // Update UI for the currently selected project
    },
    handleProjectSelectChange() {
        // Implementation remains the same
        const select = document.getElementById('project-select');
        const projectId = select.value;
        const project = AppState.projectListCache.find(p => p.id === projectId);
        const dataTextArea = document.getElementById('project-data');
        const nameInput = document.getElementById('project-name');
        const gsdSelect = document.getElementById('gsd-value-select');
        const irCheckbox = document.getElementById('is-ir-project-checkbox');
        const irBadge = document.getElementById('project-ir-badge');
        const editBtn = document.getElementById('edit-data-btn');
        const deleteBtn = document.getElementById('delete-project-btn');
        const combinedSelect = document.getElementById('project-combined-select');
        const calculateCombinedBtn = document.getElementById('calculate-combined-btn');
        
        if (projectId && project) {
            // Display data for editing
            dataTextArea.value = JSON.stringify(project.content[0], null, 2); // Show first row as sample
            dataTextArea.placeholder = `Data loaded for ${project.content.length} rows. Scroll up to see the first row, or start typing to replace data.`;
            nameInput.value = project.name;
            gsdSelect.value = project.gsd || '3in';
            irCheckbox.checked = project.isIR || false;
            irBadge.classList.toggle('hidden', !project.isIR);
            irBadge.textContent = 'IR';
            editBtn.classList.remove('hidden');
            deleteBtn.classList.remove('hidden');
            
            // Auto-select this project in the combined list
            Array.from(combinedSelect.options).forEach(option => {
                option.selected = option.value === projectId;
            });
            calculateCombinedBtn.disabled = false;

        } else {
            // Clear fields for new project entry
            dataTextArea.value = '';
            dataTextArea.placeholder = 'Paste data or drag & drop Fix folder files here...';
            nameInput.value = '';
            gsdSelect.value = '3in';
            irCheckbox.checked = false;
            irBadge.classList.add('hidden');
            editBtn.classList.add('hidden');
            deleteBtn.classList.add('hidden');
            
            // Clear combined selection
            Array.from(combinedSelect.options).forEach(option => option.selected = false);
            calculateCombinedBtn.disabled = true;
        }
        App.updateCombinedProjectInfo();
    },
    updateCombinedProjectInfo() {
        // Implementation remains the same
        const combinedSelect = document.getElementById('project-combined-select');
        const infoContainer = document.getElementById('combined-project-info');
        const calculateCombinedBtn = document.getElementById('calculate-combined-btn');
        const selectedIds = Array.from(combinedSelect.options).filter(o => o.selected).map(o => o.value);
        
        if (selectedIds.length > 0) {
            const selectedProjects = selectedIds.map(id => AppState.projectListCache.find(p => p.id === id)).filter(Boolean);
            const totalRows = selectedProjects.reduce((sum, p) => sum + (p.content ? p.content.length : 0), 0);
            const isIR = selectedProjects.some(p => p.isIR);
            const gsd = selectedProjects[0] ? selectedProjects[0].gsd : 'N/A';
            const name = selectedProjects.map(p => p.name).join(' + ');

            infoContainer.innerHTML = `Combining: ${selectedProjects.length} project(s) | ${totalRows} total rows | GSD: ${gsd.toUpperCase()} | IR: ${isIR ? 'Yes' : 'No'}`;
            infoContainer.classList.remove('hidden');
            calculateCombinedBtn.disabled = false;
        } else {
            infoContainer.classList.add('hidden');
            calculateCombinedBtn.disabled = true;
        }
    },
    editSelectedProject() {
        // Implementation remains the same
        const select = document.getElementById('project-select');
        const projectId = select.value;
        const project = AppState.projectListCache.find(p => p.id === projectId);
        
        if (project) {
            const modal = document.getElementById('merge-fp-modal');
            const fileList = document.getElementById('merge-file-list');
            document.getElementById('execute-merge-btn').disabled = true;
            fileList.innerHTML = `<li class="text-brand-400">Editing/Merging data for project: **${project.name}**</li>`;
            document.getElementById('merge-info-container').classList.remove('hidden');
            modal.classList.remove('hidden');
        }
    },
    async saveProject() {
        // Implementation remains the same
        const dataTextArea = document.getElementById('project-data');
        const nameInput = document.getElementById('project-name');
        const gsdSelect = document.getElementById('gsd-value-select');
        const irCheckbox = document.getElementById('is-ir-project-checkbox');
        const select = document.getElementById('project-select');
        const techIdOverride = document.getElementById('tech-id-override').value.trim().toUpperCase() || null;
        
        const rawData = dataTextArea.value.trim();
        const projectName = nameInput.value.trim();
        const projectId = select.value || `local:${Date.now()}`;

        if (!rawData || !projectName) {
            UI.showNotification("Project name and data cannot be empty.", true);
            return;
        }

        try {
            // Attempt to parse the data
            let parsedData;
            try {
                parsedData = Calculator.parseRawData(rawData, projectId, techIdOverride);
            } catch (jsonErr) {
                // If text parsing fails, assume the user pasted JSON and try to parse it
                try {
                    const content = JSON.parse(rawData);
                    if (!Array.isArray(content)) throw new Error('Not an array');
                    parsedData = {
                         id: projectId,
                         name: projectName,
                         content: content,
                         gsd: gsdSelect.value,
                         isIR: irCheckbox.checked
                    };
                } catch (finalErr) {
                    throw new Error("Invalid data format. Please paste TSV/CSV or correct JSON.");
                }
            }

            const projectToSave = {
                id: projectId,
                name: projectName,
                content: parsedData.content,
                gsd: gsdSelect.value,
                isIR: irCheckbox.checked,
                lastUpdated: Date.now()
            };
            
            await DB.put('projects', projectToSave);
            UI.showNotification(`Project '${projectName}' saved successfully.`);
            
            // Reload projects and update selection
            App.loadLocalProjects();
            select.value = projectId;
            App.handleProjectSelectChange();
            
        } catch (error) {
            console.error("Error saving project:", error);
            UI.showNotification(`Error: ${error.message}`, true);
        }
    },
    async deleteSelectedProject() {
        // Implementation remains the same
        const select = document.getElementById('project-select');
        const projectId = select.value;
        const project = AppState.projectListCache.find(p => p.id === projectId);
        
        if (!projectId || !project) return;
        
        if (confirm(`Are you sure you want to delete the project '${project.name}'? This cannot be undone.`)) {
            try {
                await DB.delete('projects', projectId);
                UI.showNotification(`Project '${project.name}' deleted.`);
                App.loadLocalProjects(); // Reload projects and clear selection
            } catch (error) {
                console.error("Error deleting project:", error);
                UI.showNotification("Error deleting project.", true);
            }
        }
    },
    async clearLocalData() {
        // Implementation remains the same
        if (confirm("Are you sure you want to clear the data text area?")) {
            document.getElementById('project-data').value = '';
            document.getElementById('project-name').value = '';
            document.getElementById('project-select').value = '';
            App.handleProjectSelectChange();
            UI.showNotification("Data cleared from editor.");
        }
    },
    async confirmClearAllData() {
        // Implementation remains the same
        UI.closeModal('main-menu-dropdown');
        if (confirm("WARNING: This will delete ALL local data, including saved projects, teams, and custom settings. Are you absolutely sure?")) {
            await DB.delete('projects', 'all'); // IndexedDB can't delete 'all' like this, need to clear stores
            await DB.delete('teams', 'main');
            await DB.delete('bonusTiers', 'main');
            await DB.delete('calculationSettings', 'main');
            await DB.delete('countingSettings', 'main');
            await DB.delete('settings', 'version');
            
            // Proper way to clear all stores (requires re-opening)
            indexedDB.deleteDatabase('BonusCalculatorDB');
            
            UI.showNotification("All local data has been cleared. Please refresh the page.", true);
            setTimeout(() => window.location.reload(), 1500);
        }
    },
    async calculateAll() {
        // Implementation remains the same
        const select = document.getElementById('project-select');
        const projectId = select.value;
        const techIdOverride = document.getElementById('tech-id-override').value.trim().toUpperCase() || null;
        
        if (!projectId) {
            UI.showNotification("Please select a project first.", true);
            return;
        }

        const project = AppState.projectListCache.find(p => p.id === projectId);
        if (!project || project.content.length === 0) {
            UI.showNotification("Selected project has no data to calculate.", true);
            return;
        }

        const stats = Calculator.calculateTechStats({
            content: project.content, 
            isIR: project.isIR,
        }, null, project.gsd, techIdOverride);

        AppState.currentTechStats = stats;
        AppState.lastUsedGsdValue = project.gsd;

        UI.displayResults(stats);
        App.filterAndDisplayResults();
        UI.updateQuickSummary(stats);
        UI.updateLeaderboard(stats);
        UI.updateTLSummary(stats);
        UI.showNotification(`Calculated results for ${project.name}.`);
    },
    async calculateCombined() {
        // Implementation remains the same
        const combinedSelect = document.getElementById('project-combined-select');
        const selectedIds = Array.from(combinedSelect.options).filter(o => o.selected).map(o => o.value);
        const techIdOverride = document.getElementById('tech-id-override').value.trim().toUpperCase() || null;

        if (selectedIds.length === 0) {
            UI.showNotification("Please select projects to combine.", true);
            return;
        }

        const selectedProjects = selectedIds.map(id => AppState.projectListCache.find(p => p.id === id)).filter(Boolean);
        if (selectedProjects.length === 0) {
            UI.showNotification("No project data found for selection.", true);
            return;
        }

        const combinedData = Calculator.mergeProjectData(selectedProjects);
        
        const stats = Calculator.calculateTechStats(combinedData, null, combinedData.gsd, techIdOverride);

        AppState.currentTechStats = stats;
        AppState.lastUsedGsdValue = combinedData.gsd;

        UI.displayResults(stats);
        App.filterAndDisplayResults();
        UI.updateQuickSummary(stats);
        UI.updateLeaderboard(stats);
        UI.updateTLSummary(stats);
        UI.showNotification(`Calculated combined results for ${selectedProjects.length} projects.`);
        document.getElementById('results-title').textContent = "Bonus Payouts (Combined)";
    },
    filterAndDisplayResults() {
        // Implementation remains the same
        const stats = AppState.currentTechStats;
        const allTechIds = Object.keys(stats);
        const selectedTeams = Array.from(document.querySelectorAll('#team-filter-container input:checked'))
            .map(cb => cb.dataset.team);
        const searchInput = document.getElementById('tech-search-input').value.trim().toUpperCase();

        let filteredIds = allTechIds;

        // 1. Team Filtering
        if (selectedTeams.length > 0) {
            const techsInSelectedTeams = new Set();
            selectedTeams.forEach(team => {
                (AppState.teamSettings[team] || []).forEach(id => techsInSelectedTeams.add(id));
            });
            filteredIds = filteredIds.filter(id => techsInSelectedTeams.has(id));
        }

        // 2. Search Filtering
        if (searchInput) {
            filteredIds = filteredIds.filter(id => id.includes(searchInput));
        }

        // 3. Rebuild the techStats object for filtered display
        const filteredStats = filteredIds.reduce((acc, id) => {
            acc[id] = stats[id];
            return acc;
        }, {});

        // Re-display the filtered and sorted results
        UI.displayResults(filteredStats);
        UI.updateTLSummary(filteredStats); // Recalculate TL summary for filtered view
    },
    handleTeamFilterChange() {
        // Implementation remains the same
        App.filterAndDisplayResults();
    },
    handleSearchInput() {
        // Implementation remains the same
        App.filterAndDisplayResults();
    },
    resetFiltersAndSearch() {
        // Implementation remains the same
        document.getElementById('tech-search-input').value = '';
        document.querySelectorAll('#team-filter-container input').forEach(cb => cb.checked = false);
        App.filterAndDisplayResults();
        UI.showNotification("Filters and search reset.");
    },
    handleSortClick(e) {
        // Implementation remains the same
        const column = e.currentTarget.dataset.sort;
        let direction = 'desc';

        if (AppState.currentSort.column === column) {
            direction = AppState.currentSort.direction === 'desc' ? 'asc' : 'desc';
        }

        AppState.currentSort = { column, direction };
        App.filterAndDisplayResults();
    },
    handleTechDetailClick(e) {
        // Implementation remains the same
        const target = e.target.closest('.tech-summary-icon');
        if (target) {
            const techId = target.dataset.techId;
            if (techId) UI.openTechSummaryModal(techId);
        }
    },
    handleTeamSummaryTrigger(e) {
        // Implementation remains the same
        const target = e.target.closest('.team-summary-trigger');
        if (target) {
            const teamName = target.dataset.teamName;
            if (teamName) UI.openTeamSummaryModal(teamName);
        }
    },
    handleLeaderboardSortChange() {
        // Implementation remains the same
        UI.updateLeaderboard(AppState.currentTechStats);
    },
    toggleMainMenu() {
        // Implementation remains the same
        document.getElementById('main-menu-dropdown').classList.toggle('hidden');
    },
    async openManageTeamsModal() {
        // Implementation remains the same
        UI.closeModal('main-menu-dropdown');
        UI.populateAdminTeamManagement();
        document.getElementById('manage-teams-modal').classList.remove('hidden');
    },
    async saveTeams() {
        // Implementation remains the same
        const container = document.getElementById('team-list-container');
        const newTeams = {};
        let isValid = true;

        container.querySelectorAll('.team-card').forEach(card => {
            const nameInput = card.querySelector('.team-name-input');
            const teamName = nameInput.value.trim();
            const techList = card.querySelector('.team-tech-list');
            const techIds = Array.from(techList.querySelectorAll('.tech-tag')).map(tag => tag.dataset.techId);
            
            if (!teamName) {
                isValid = false;
                nameInput.classList.add('border-status-red');
                return;
            } else {
                 nameInput.classList.remove('border-status-red');
            }
            newTeams[teamName] = techIds;
        });

        if (!isValid) {
            UI.showNotification("Please ensure all teams have a name.", true);
            return;
        }

        try {
            await DB.put('teams', { id: 'main', value: newTeams });
            AppState.teamSettings = newTeams;
            UI.showNotification("Team settings saved successfully.");
            UI.populateTeamFilters();
            UI.closeModal('manage-teams-modal');
        } catch (error) {
            console.error("Error saving teams:", error);
            UI.showNotification("Error saving team settings.", true);
        }
    },
    async resetTeamsToDefault() {
        // Implementation remains the same
        if (confirm("Are you sure you want to reset all team settings to the default list?")) {
            try {
                await DB.put('teams', { id: 'main', value: CONSTANTS.DEFAULT_TEAMS });
                AppState.teamSettings = CONSTANTS.DEFAULT_TEAMS;
                UI.populateAdminTeamManagement();
                UI.populateTeamFilters();
                UI.showNotification("Team settings reset to default.");
            } catch (error) {
                console.error("Error resetting teams:", error);
                UI.showNotification("Error resetting team settings.", true);
            }
        }
    },
    async openAdvanceSettingsModal() {
        // Implementation remains the same
        UI.closeModal('main-menu-dropdown');
        const body = document.getElementById('advance-settings-body');
        const editorContent = {
            bonusTiers: AppState.bonusTiers,
            calculationSettings: AppState.calculationSettings,
            countingSettings: AppState.countingSettings
        };

        body.innerHTML = `
            <p class="text-brand-400 mb-4">Edit the raw JSON settings for advanced customization. Ensure the format is valid JSON.</p>
            <textarea id="settings-editor" rows="30" class="input-field w-full font-mono text-xs custom-scrollbar">${JSON.stringify(editorContent, null, 2)}</textarea>
        `;
        document.getElementById('advance-settings-modal').classList.remove('hidden');
    },
    async saveAdvanceSettings() {
        // Implementation remains the same
        const editor = document.getElementById('settings-editor');
        try {
            const newSettings = JSON.parse(editor.value);
            
            if (newSettings.bonusTiers) {
                await DB.put('bonusTiers', { id: 'main', value: newSettings.bonusTiers });
                AppState.bonusTiers = newSettings.bonusTiers;
            }
            if (newSettings.calculationSettings) {
                await DB.put('calculationSettings', { id: 'main', value: newSettings.calculationSettings });
                AppState.calculationSettings = newSettings.calculationSettings;
            }
            if (newSettings.countingSettings) {
                await DB.put('countingSettings', { id: 'main', value: newSettings.countingSettings });
                AppState.countingSettings = newSettings.countingSettings;
            }
            
            UI.showNotification("Advanced settings saved successfully.");
            UI.populateInfoModal();
            UI.closeModal('advance-settings-modal');

            // Recalculate if results are displayed
            if (Object.keys(AppState.currentTechStats).length > 0) App.calculateCombined();

        } catch (error) {
            console.error("Error saving advanced settings:", error);
            UI.showNotification("Error saving settings. Invalid JSON format.", true);
        }
    },
    async resetAdvanceSettings() {
        // Implementation remains the same
         if (confirm("Are you sure you want to reset all advanced calculation settings (Tiers, Calculation values, Counting logic) to the default?")) {
            try {
                await DB.put('bonusTiers', { id: 'main', value: CONSTANTS.DEFAULT_BONUS_TIERS });
                await DB.put('calculationSettings', { id: 'main', value: CONSTANTS.DEFAULT_CALCULATION_SETTINGS });
                await DB.put('countingSettings', { id: 'main', value: CONSTANTS.DEFAULT_COUNTING_SETTINGS });
                
                // Reload the application state with new settings
                await App.loadSettings();

                UI.showNotification("Advanced settings reset to default. Please review the modal.");
                UI.populateInfoModal();
                App.openAdvanceSettingsModal(); // Reopen with default content
            } catch (error) {
                console.error("Error resetting advanced settings:", error);
                UI.showNotification("Error resetting settings.", true);
            }
        }
    },
    openImportantInfoModal() {
        // Implementation remains the same
        UI.closeModal('main-menu-dropdown');
        UI.populateInfoModal();
        document.getElementById('important-info-modal').classList.remove('hidden');
    },
    openGuidedSetupModal() {
        // Implementation remains the same
        UI.closeModal('main-menu-dropdown');
        AppState.guidedSetup.currentStep = 1;
        App.renderGuidedSetup();
        document.getElementById('guided-setup-modal').classList.remove('hidden');
    },
    renderGuidedSetup() {
        // Implementation remains the same
        const container = document.getElementById('setup-content-container');
        const stepIndicator = document.getElementById('setup-step-indicator');
        const nextBtn = document.getElementById('setup-next-btn');
        const prevBtn = document.getElementById('setup-prev-btn');
        const step = AppState.guidedSetup.currentStep;
        
        stepIndicator.innerHTML = Array.from({ length: AppState.guidedSetup.totalSteps }, (_, i) => 
            `<div class="h-2 w-1/4 rounded-full ${i + 1 === step ? 'bg-accent' : 'bg-brand-700'}"></div>`
        ).join('');

        let content = '';
        let nextText = 'Next';
        let nextAction = 'next';

        switch (step) {
            case 1:
                content = `
                    <h4 class="text-xl font-bold mb-4">Step 1: Get Your Data</h4>
                    <p class="text-brand-400">To begin, you need to load your Fix Folder data. You can either:</p>
                    <ul class="list-disc list-inside space-y-3 mt-4">
                        <li>**Option A (Recommended):** Drag and drop your `.shp` and `.dbf` files into the **Data & Projects** box on the left.</li>
                        <li>**Option B:** Copy the entire content of your raw TSV/CSV Fix Sheet and paste it into the **Data & Projects** box.</li>
                    </ul>
                    <p class="text-sm mt-4 text-status-orange">Make sure your data has the required columns: **tech_id**, **fix_category**, **fix_count**, **fix_label**, and RV/QC/i3QA columns.</p>
                `;
                prevBtn.disabled = true;
                break;
            case 2:
                content = `
                    <h4 class="text-xl font-bold mb-4">Step 2: Save and Select Project</h4>
                    <p class="text-brand-400">Once your data is loaded into the text area:</p>
                    <ul class="list-disc list-inside space-y-3 mt-4">
                        <li>Enter a **Project Name** (e.g., 'March Week 3').</li>
                        <li>Select the correct **GSD** value (e.g., '3in').</li>
                        <li>Check **IR Project** if applicable.</li>
                        <li>Click **Save Project**.</li>
                    </ul>
                    <p class="text-sm mt-4 text-brand-400">After saving, ensure your new project is selected in the **Select a project...** dropdown.</p>
                `;
                prevBtn.disabled = false;
                break;
            case 3:
                content = `
                    <h4 class="text-xl font-bold mb-4">Step 3: Run the Calculation</h4>
                    <p class="text-brand-400">You are now ready to calculate the bonus payouts.</p>
                    <ul class="list-disc list-inside space-y-3 mt-4">
                        <li>**Individual Project:** Click **Calculate All** to process the currently selected project.</li>
                        <li>**Multiple Projects:** Select multiple projects in the **Combine Projects** box and click **Calculate Combined**.</li>
                    </ul>
                    <p class="text-sm mt-4 text-accent">The results will appear in the **Bonus Payouts** table below.</p>
                `;
                nextText = 'View Results';
                nextAction = 'finish';
                break;
            case 4:
                content = `
                    <h4 class="text-xl font-bold mb-4">Step 4: Analyze Results</h4>
                    <p class="text-brand-400">Use the results table to find: </p>
                    <ul class="list-disc list-inside space-y-3 mt-4">
                        <li>Clickable **Points**, **Tasks**, and **Refix** metrics to see a detailed breakdown of the calculation logic.</li>
                        <li>**Quality** percentage and **Payout** amount.</li>
                        <li>Use the **Filter by Team** buttons to narrow the results.</li>
                        <li>Click the **Details** button (info icon) for a full tech summary.</li>
                    </ul>
                    <p class="text-sm mt-4 text-brand-400">You can also check the **Leaderboard** and **Team Leader Summary** panels on the right.</p>
                `;
                nextText = 'Close';
                nextAction = 'close';
                break;
        }

        container.innerHTML = content;
        nextBtn.textContent = nextText;
        nextBtn.dataset.action = nextAction;
    },
    nextGuidedStep() {
        // Implementation remains the same
        const nextBtn = document.getElementById('setup-next-btn');
        if (nextBtn.dataset.action === 'close') {
            UI.closeModal('guided-setup-modal');
            return;
        }
        if (AppState.guidedSetup.currentStep < AppState.guidedSetup.totalSteps) {
            AppState.guidedSetup.currentStep++;
        }
        App.renderGuidedSetup();
    },
    prevGuidedStep() {
        // Implementation remains the same
        if (AppState.guidedSetup.currentStep > 1) {
            AppState.guidedSetup.currentStep--;
        }
        App.renderGuidedSetup();
    },
    async handleDroppedFiles(files) {
        // Implementation remains the same
        const shpFile = Array.from(files).find(f => f.name.toLowerCase().endsWith('.shp'));
        const dbfFile = Array.from(files).find(f => f.name.toLowerCase().endsWith('.dbf'));
        const textFile = Array.from(files).find(f => f.type.startsWith('text/') || f.name.toLowerCase().endsWith('.txt') || f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.tsv'));
        const dataTextArea = document.getElementById('project-data');
        const nameInput = document.getElementById('project-name');
        
        if (shpFile && dbfFile) {
            UI.showNotification(`Processing Fix Folder: ${shpFile.name.replace('.shp', '')}...`);
            App.processShapeFile(shpFile, dbfFile);
        } else if (textFile) {
            UI.showNotification(`Loading text file: ${textFile.name}...`);
            const reader = new FileReader();
            reader.onload = (e) => {
                dataTextArea.value = e.target.result;
                nameInput.value = textFile.name.replace(/\.[^/.]+$/, "");
                UI.showNotification("Text file loaded into data editor.");
            };
            reader.onerror = (e) => UI.showNotification("Error reading text file.", true);
            reader.readAsText(textFile);
        } else {
            UI.showNotification("Unsupported file type. Please drop TSV/CSV, or a combined .shp and .dbf file.", true);
        }
    },
    async processShapeFile(shpFile, dbfFile) {
        // Implementation remains the same
        const name = shpFile.name.replace(/\.[^/.]+$/, "");
        document.getElementById('project-loading-spinner').classList.remove('hidden');
        try {
            const shpBuffer = await shpFile.arrayBuffer();
            const dbfBuffer = await dbfFile.arrayBuffer();

            const shpRecords = await Calculator.parseShp(shpBuffer);
            const dbfRecords = await shapefile.read(dbfBuffer, { encoding: 'utf-8' }).then(result => result.records);
            
            if (shpRecords.length !== dbfRecords.length) {
                throw new Error("Shapefile and DBF record counts do not match.");
            }

            const combinedData = dbfRecords.map((dbf, index) => {
                const combined = { ...dbf };
                // Add properties from geometry if needed (e.g., coordinates)
                if (shpRecords[index] && shpRecords[index].geometry) {
                    combined.geometry_type = shpRecords[index].geometry.type;
                    // Add first coordinate pair for reference
                    if (shpRecords[index].geometry.coordinates && shpRecords[index].geometry.coordinates.length > 0) {
                         combined.lon = shpRecords[index].geometry.coordinates[0];
                         combined.lat = shpRecords[index].geometry.coordinates[1];
                    }
                }
                return combined;
            });

            const dataTextArea = document.getElementById('project-data');
            const nameInput = document.getElementById('project-name');
            const irCheckbox = document.getElementById('is-ir-project-checkbox');

            dataTextArea.value = JSON.stringify(combinedData, null, 2);
            dataTextArea.placeholder = `Shapefile data loaded for ${combinedData.length} rows.`;
            nameInput.value = name;
            irCheckbox.checked = name.toLowerCase().includes('ir');

            UI.showNotification(`Fix Folder '${name}' loaded successfully.`);
        } catch (error) {
            console.error("Error processing shapefile:", error);
            UI.showNotification(`Error processing files: ${error.message}`, true);
        } finally {
            document.getElementById('project-loading-spinner').classList.add('hidden');
        }
    },
    async handleAdminDroppedFiles(files) {
        // Implementation remains the same
        const shpFile = Array.from(files).find(f => f.name.toLowerCase().endsWith('.shp'));
        const dbfFile = Array.from(files).find(f => f.name.toLowerCase().endsWith('.dbf'));
        const textFile = Array.from(files).find(f => f.type.startsWith('text/') || f.name.toLowerCase().endsWith('.txt') || f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.tsv'));
        const dataTextArea = document.getElementById('admin-project-data');
        const nameInput = document.getElementById('admin-project-name');
        const irCheckbox = document.getElementById('admin-is-ir-checkbox');

        if (shpFile && dbfFile) {
            UI.showNotification(`Processing Fix Folder: ${shpFile.name.replace('.shp', '')}...`);
            // Use the same processing logic but update admin fields
            App.processShapeFileForAdmin(shpFile, dbfFile);
        } else if (textFile) {
            UI.showNotification(`Loading text file: ${textFile.name}...`);
            const reader = new FileReader();
            reader.onload = (e) => {
                dataTextArea.value = e.target.result;
                nameInput.value = textFile.name.replace(/\.[^/.]+$/, "");
                irCheckbox.checked = textFile.name.toLowerCase().includes('ir');
                UI.showNotification("Text file loaded into admin data editor.");
            };
            reader.onerror = (e) => UI.showNotification("Error reading text file.", true);
            reader.readAsText(textFile);
        } else {
            UI.showNotification("Unsupported file type.", true);
        }
    },
    async processShapeFileForAdmin(shpFile, dbfFile) {
        // Implementation remains the same
        const name = shpFile.name.replace(/\.[^/.]+$/, "");
        // Simplified loading indicator for admin panel
        const saveBtn = document.getElementById('admin-save-project-btn');
        UI.showLoading(saveBtn);
        try {
            const shpBuffer = await shpFile.arrayBuffer();
            const dbfBuffer = await dbfFile.arrayBuffer();

            const shpRecords = await Calculator.parseShp(shpBuffer);
            const dbfRecords = await shapefile.read(dbfBuffer, { encoding: 'utf-8' }).then(result => result.records);
            
            if (shpRecords.length !== dbfRecords.length) {
                throw new Error("Shapefile and DBF record counts do not match.");
            }

            const combinedData = dbfRecords.map(dbf => Object.fromEntries(
                Object.entries(dbf).map(([k, v]) => [k.toLowerCase(), String(v).toLowerCase()])
            ));

            document.getElementById('admin-project-data').value = JSON.stringify(combinedData, null, 2);
            document.getElementById('admin-project-name').value = name;
            document.getElementById('admin-is-ir-checkbox').checked = name.toLowerCase().includes('ir');

            UI.showNotification(`Fix Folder '${name}' loaded into admin editor.`);
        } catch (error) {
            console.error("Error processing shapefile:", error);
            UI.showNotification(`Error processing files: ${error.message}`, true);
        } finally {
            UI.hideLoading(saveBtn);
        }
    },
    async openMergeFPModal() {
        // Implementation remains the same
         UI.closeModal('main-menu-dropdown');
         UI.closeModal('tech-summary-modal'); // Close if open
         UI.closeModal('team-summary-modal'); // Close if open
         
         const projectId = document.getElementById('project-select').value;
         const project = AppState.projectListCache.find(p => p.id === projectId);

         if (!project) {
             UI.showNotification("Please select a project to merge data into first.", true);
             return;
         }

         const fileList = document.getElementById('merge-file-list');
         fileList.innerHTML = `<li class="text-brand-400">Target Project: **${project.name}** (${project.content.length} rows)</li><li class="text-status-red">Drop files to merge below.</li>`;
         document.getElementById('merge-info-container').classList.remove('hidden');
         document.getElementById('execute-merge-btn').disabled = true;
         AppState.filesToMerge = [];

         document.getElementById('merge-fp-modal').classList.remove('hidden');
    },
    async handleMergeDroppedFiles(files) {
        // Implementation remains the same
        const shpFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.shp'));
        const dbfFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.dbf'));
        const fileList = document.getElementById('merge-file-list');
        const mergeBtn = document.getElementById('execute-merge-btn');

        if (shpFiles.length !== dbfFiles.length || shpFiles.length === 0) {
            UI.showNotification("Please drop pairs of .shp and .dbf files only.", true);
            return;
        }

        AppState.filesToMerge = [];
        fileList.innerHTML = fileList.firstElementChild.outerHTML; // Keep target project line

        for (const shpFile of shpFiles) {
            const dbfName = shpFile.name.replace('.shp', '.dbf');
            const dbfFile = dbfFiles.find(f => f.name === dbfName);

            if (dbfFile) {
                AppState.filesToMerge.push({ shpFile, dbfFile, name: shpFile.name.replace(/\.[^/.]+$/, "") });
                fileList.insertAdjacentHTML('beforeend', `<li class="text-white ml-5">${shpFile.name.replace('.shp', '')}</li>`);
            } else {
                 UI.showNotification(`Missing .dbf for ${shpFile.name}. Skipping.`, true);
            }
        }

        if (AppState.filesToMerge.length > 0) {
            mergeBtn.disabled = false;
            UI.showNotification(`Ready to merge ${AppState.filesToMerge.length} files.`);
        } else {
            mergeBtn.disabled = true;
            UI.showNotification("No valid file pairs found for merge.", true);
        }
    },
    async executeMerge() {
        // Implementation remains the same
        const mergeBtn = document.getElementById('execute-merge-btn');
        UI.showLoading(mergeBtn);
        const projectId = document.getElementById('project-select').value;
        const project = AppState.projectListCache.find(p => p.id === projectId);

        if (!project || !AppState.filesToMerge || AppState.filesToMerge.length === 0) {
            UI.hideLoading(mergeBtn);
            UI.showNotification("Error: No target project or files selected.", true);
            return;
        }
        
        try {
            let totalMergedRows = 0;
            const newContent = [...project.content]; // Start with existing data
            const techIdOverride = document.getElementById('tech-id-override').value.trim().toUpperCase() || null;


            for (const filePair of AppState.filesToMerge) {
                const shpBuffer = await filePair.shpFile.arrayBuffer();
                const dbfBuffer = await filePair.dbfFile.arrayBuffer();

                const shpRecords = await Calculator.parseShp(shpBuffer);
                const dbfRecords = await shapefile.read(dbfBuffer, { encoding: 'utf-8' }).then(result => result.records);
                
                if (shpRecords.length !== dbfRecords.length) {
                    throw new Error(`File pair ${filePair.name}: Record counts do not match.`);
                }
                
                const dataFromFiles = dbfRecords.map(dbf => {
                    const row = Object.fromEntries(
                        Object.entries(dbf).map(([k, v]) => [k.toLowerCase(), String(v).toLowerCase()])
                    );
                    if (techIdOverride) row.tech_id = techIdOverride;
                    return row;
                });

                newContent.push(...dataFromFiles);
                totalMergedRows += dataFromFiles.length;
            }

            // Update the project data
            const projectToSave = {
                ...project,
                content: newContent,
                lastUpdated: Date.now()
            };
            
            await DB.put('projects', projectToSave);
            
            // Reload projects and update UI
            App.loadLocalProjects();
            document.getElementById('project-select').value = projectId;
            App.handleProjectSelectChange();
            UI.closeModal('merge-fp-modal');
            UI.showNotification(`Merged ${totalMergedRows} rows into '${project.name}'. Total rows: ${newContent.length}`);

        } catch (error) {
            console.error("Error executing merge:", error);
            UI.showNotification(`Merge failed: ${error.message}`, true);
        } finally {
            UI.hideLoading(mergeBtn);
        }
    },
    openAdminPortalModal() {
        // Implementation remains the same
        UI.closeModal('main-menu-dropdown');
        if (!AppState.firebase.isAdmin) {
             UI.showNotification("Access denied. Admin privileges required.", true);
             return;
        }
        App.loadAdminProjectList();
        document.getElementById('admin-portal-modal').classList.remove('hidden');
    },
    async loadAdminProjectList() {
        // Implementation remains the same
        if (!AppState.firebase.db || !AppState.firebase.isAdmin) return;
        const tbody = document.getElementById('admin-project-list-tbody');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-brand-400">Loading projects...</td></tr>';
        
        try {
            const snapshot = await AppState.firebase.db.collection('projects').get();
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-brand-400">No cloud projects found.</td></tr>';
                return;
            }

            tbody.innerHTML = snapshot.docs.map(doc => {
                const p = doc.data();
                const status = p.content && p.content.length > 0 ? `${p.content.length} Rows` : 'No Data';
                return `
                    <tr data-id="${doc.id}">
                        <td>${p.name}</td>
                        <td>${p.gsd.toUpperCase()}</td>
                        <td>${status}</td>
                        <td class="flex gap-2">
                            <button class="control-btn-icon admin-edit-project" data-id="${doc.id}" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg></button>
                            <button class="control-btn-icon-danger admin-delete-project" data-id="${doc.id}" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Attach listeners to the new buttons
            document.querySelectorAll('.admin-edit-project').forEach(btn => btn.addEventListener('click', e => App.editAdminProject(e.currentTarget.dataset.id)));
            document.querySelectorAll('.admin-delete-project').forEach(btn => btn.addEventListener('click', e => App.deleteAdminProject(e.currentTarget.dataset.id)));

        } catch (error) {
            console.error("Error loading admin projects:", error);
            tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-status-red">Error loading projects.</td></tr>';
        }
    },
    async editAdminProject(projectId) {
        // Implementation remains the same
        if (!AppState.firebase.db || !AppState.firebase.isAdmin) return;
        try {
            const doc = await AppState.firebase.db.collection('projects').doc(projectId).get();
            if (!doc.exists) {
                UI.showNotification("Project not found.", true);
                return;
            }
            const p = doc.data();
            
            document.getElementById('admin-form-title').textContent = `Edit Project: ${p.name}`;
            document.getElementById('admin-project-id').value = doc.id;
            document.getElementById('admin-project-name').value = p.name;
            document.getElementById('admin-gsd-select').value = p.gsd;
            document.getElementById('admin-is-ir-checkbox').checked = p.isIR;
            document.getElementById('admin-project-data').value = JSON.stringify(p.content, null, 2);
            document.getElementById('admin-save-project-btn').textContent = 'Update Cloud Project';
            document.getElementById('admin-reset-form-btn').classList.remove('hidden');

        } catch (error) {
            console.error("Error loading project for edit:", error);
            UI.showNotification("Error loading project data.", true);
        }
    },
    resetAdminProjectForm() {
        // Implementation remains the same
        document.getElementById('admin-form-title').textContent = 'Add New Project';
        document.getElementById('admin-project-id').value = '';
        document.getElementById('admin-project-name').value = '';
        document.getElementById('admin-gsd-select').value = '3in';
        document.getElementById('admin-is-ir-checkbox').checked = false;
        document.getElementById('admin-project-data').value = '';
        document.getElementById('admin-project-data').placeholder = 'Paste data or drag & drop Fix folder files here...';
        document.getElementById('admin-save-project-btn').textContent = 'Save to Cloud';
        document.getElementById('admin-reset-form-btn').classList.add('hidden');
    },
    async deleteAdminProject(projectId) {
        // Implementation remains the same
        if (!AppState.firebase.db || !AppState.firebase.isAdmin) return;
        if (confirm(`Are you sure you want to delete this cloud project?`)) {
            try {
                await AppState.firebase.db.collection('projects').doc(projectId).delete();
                UI.showNotification("Cloud project deleted.");
                App.loadAdminProjectList();
            } catch (error) {
                console.error("Error deleting project from cloud:", error);
                UI.showNotification("Error deleting project from cloud.", true);
            }
        }
    },
    async saveProjectToCloud(e) {
        // Implementation remains the same
        if (!AppState.firebase.db || !AppState.firebase.isAdmin) return;
        const button = e.currentTarget;
        UI.showLoading(button);

        const projectId = document.getElementById('admin-project-id').value || AppState.firebase.db.collection('projects').doc().id;
        const projectName = document.getElementById('admin-project-name').value.trim();
        const gsd = document.getElementById('admin-gsd-select').value;
        const isIR = document.getElementById('admin-is-ir-checkbox').checked;
        const rawData = document.getElementById('admin-project-data').value.trim();

        if (!projectName || !rawData) {
            UI.showNotification("Project name and data cannot be empty.", true);
            UI.hideLoading(button);
            return;
        }

        try {
            let content;
            try {
                // Try parsing as raw data first, then as JSON array if that fails
                content = Calculator.parseRawData(rawData, projectName).content;
            } catch (rawError) {
                content = JSON.parse(rawData);
                if (!Array.isArray(content)) throw new Error('Data must be a JSON array of rows or raw TSV/CSV.');
            }

            const projectData = {
                name: projectName,
                gsd: gsd,
                isIR: isIR,
                content: content,
                updatedAt: AppState.firebase.tools.serverTimestamp()
            };

            await AppState.firebase.db.collection('projects').doc(projectId).set(projectData, { merge: true });

            if (!document.getElementById('admin-project-id').value) {
                UI.showNotification("Project saved to the cloud.");
            }
            this.resetAdminProjectForm();
            this.loadAdminProjectList();
        } catch (error) {
             console.error("Error saving project to cloud:", error);
             UI.showNotification("Error saving project: " + error.message, true);
        } finally {
            UI.hideLoading(button);
        }
    },
    async syncProjects() {
        // Implementation remains the same
        if (!AppState.firebase.db) {
            UI.showNotification("Cloud synchronization unavailable.", true);
            return;
        }
        const button = document.getElementById('update-online-btn');
        UI.showLoading(button);
        try {
            const snapshot = await AppState.firebase.db.collection('projects').get();
            let syncCount = 0;
            for (const doc of snapshot.docs) {
                const project = doc.data();
                const localProject = AppState.projectListCache.find(p => p.id === doc.id);
                // Simple logic: if cloud version is newer or local version doesn't exist, save it locally.
                if (!localProject || (project.updatedAt && localProject.lastUpdated < project.updatedAt.toDate().getTime())) {
                    const localProjectToSave = {
                        id: doc.id,
                        name: project.name,
                        content: project.content,
                        gsd: project.gsd,
                        isIR: project.isIR,
                        lastUpdated: project.updatedAt ? project.updatedAt.toDate().getTime() : Date.now()
                    };
                    await DB.put('projects', localProjectToSave);
                    syncCount++;
                }
            }
            await App.loadLocalProjects();
            UI.showNotification(`Successfully synced ${syncCount} projects from the cloud.`);
        } catch (error) {
            console.error("Error syncing projects:", error);
            UI.showNotification("Error syncing projects from cloud.", true);
        } finally {
            UI.hideLoading(button);
        }
    },
    async loadUserManagement() {
        // Implementation remains the same
        if (!AppState.firebase.db || !AppState.firebase.isAdmin) return;
        const container = document.getElementById('user-management-container');
        container.innerHTML = '<p class="text-brand-400">Loading user data...</p>';

        try {
            // Firestore doesn't provide a direct way to list all users' roles without a Cloud Function.
            // We will list the last 20 visitors instead as an admin feature.
            const snapshot = await AppState.firebase.db.collection('logs').orderBy('timestamp', 'desc').limit(20).get();
            
            let logTable = `<h4 class="text-lg font-bold mb-2">Last 20 Visitor Logs</h4><div class="overflow-x-auto custom-scrollbar"><table class="min-w-full text-sm"><thead><tr><th>Time</th><th>User ID</th><th>Browser (OS)</th></tr></thead><tbody>`;
            
            snapshot.docs.forEach(doc => {
                const log = doc.data();
                const time = log.timestamp ? dayjs(log.timestamp.toDate()).fromNow() : 'N/A';
                logTable += `
                    <tr>
                        <td class="whitespace-nowrap">${time}</td>
                        <td class="font-mono text-xs">${log.userId.substring(0, 10)}...</td>
                        <td>${log.browser} (${log.os})</td>
                    </tr>
                `;
            });

            logTable += `</tbody></table></div>`;
            container.innerHTML = logTable;

        } catch (error) {
            console.error("Error loading user management data:", error);
            container.innerHTML = `<p class="text-status-red">Error loading logs: ${error.message}</p>`;
        }
    },
    handleAdminTabSwitch(e) {
        // Implementation remains the same
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.add('hidden'));
        document.getElementById(e.currentTarget.dataset.tab).classList.remove('hidden');
    },
    exportToCSV() {
        // Implementation remains the same
        const techArray = Object.values(AppState.currentTechStats);
        if (techArray.length === 0) {
            UI.showNotification("No data to export.", true);
            return;
        }

        const headers = ["ID", "Points", "FixTasks", "RefixTasks", "Quality", "BonusEarned", "Payout"];
        const csvRows = [headers.join(',')];

        techArray.forEach(tech => {
            const row = [
                tech.id,
                tech.points.toFixed(3),
                tech.fixTasks,
                tech.refixTasks,
                tech.quality.toFixed(2),
                tech.bonusEarned.toFixed(2),
                tech.payout.toFixed(2)
            ].map(String).join(',');
            csvRows.push(row);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        let projectName = 'results';
        const select = document.getElementById('project-select');
        if (select.value) {
            const project = AppState.projectListCache.find(p => p.id === select.value);
            if (project) projectName = project.name.replace(/\s/g, '_');
        } else {
             const combinedSelect = document.getElementById('project-combined-select');
             const selectedIds = Array.from(combinedSelect.options).filter(o => o.selected);
             if (selectedIds.length > 0) projectName = `Combined_${selectedIds.length}P`;
        }

        link.setAttribute("href", url);
        link.setAttribute("download", `${projectName}_bonus_results.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        UI.showNotification("Results exported to CSV.");
    },
    toggleTheme() {
        // Implementation remains the same
        document.body.classList.toggle('light-theme');
        // This is a placeholder since the provided CSS doesn't show a full theme switch, 
        // but it provides the mechanism for a future implementation.
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        UI.showNotification(`Theme set to ${isLight ? 'Light' : 'Dark'}.`);
    },
    handleChatbotInput(e) {
        // Implementation remains the same
        if (e.key === 'Enter') {
            const input = e.target;
            const message = input.value.trim();
            if (message) {
                App.sendChatbotMessage(message);
                input.value = '';
            }
        }
    },
    sendChatbotMessage(message) {
        // Implementation remains the same
        const messagesContainer = document.getElementById('chatbot-messages');
        const userMessage = document.createElement('div');
        userMessage.className = 'chatbot-message user';
        userMessage.textContent = message;
        messagesContainer.appendChild(userMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Simulate Bot Response (simplified logic)
        const botMessage = document.createElement('div');
        botMessage.className = 'chatbot-message bot';
        
        let response = "I'm the PCS Bonus Calculator Chatbot. I can answer questions about the calculation logic, data formats, and UI features. ";
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('points') || lowerMessage.includes('calculate')) {
            response = "Points are calculated as: **(Base Fix Points * GSD/IR Modifier) + (QC Tasks * 0.125) + (i3QA Tasks * 0.0833) + RV Points**. The final value is then multiplied by the Bonus Multiplier and Quality Modifier.";
        } else if (lowerMessage.includes('quality') || lowerMessage.includes('refix')) {
            response = "Quality is calculated as: **Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)**. Check the 'Important Information' section for the full bonus tier table.";
        } else if (lowerMessage.includes('ir') || lowerMessage.includes('gsd')) {
             response = "IR Projects currently use a **1.5x** modifier on most fix points. GSD values (3in, 4in, 6in, 9in) change the base points for each fix category.";
        } else if (lowerMessage.includes('tasks')) {
            response = "Fix Tasks are the unique successful fixes. Refix Tasks, Misses, and Warnings reduce your final quality percentage.";
        } else {
             response += "Try asking, 'How are points calculated?' or 'What is the quality formula?'";
        }

        setTimeout(() => {
            botMessage.innerHTML = response;
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 800);
    },
    toggleChatbot() {
        // Implementation remains the same
        document.getElementById('chatbot-window').classList.toggle('hidden');
        document.getElementById('spotlight-overlay').classList.toggle('hidden');
    },
    handleCustomizeCalcToggle(e) {
        // Implementation remains the same
        const isChecked = e.target.checked;
        const multiplierInput = document.getElementById('bonusMultiplierDirect');
        multiplierInput.classList.toggle('hidden', isChecked);
        if (isChecked) {
             UI.showNotification("Bonus Multiplier is now controlled by Advanced Settings.", false);
        } else {
             UI.showNotification("Bonus Multiplier is controlled by the input field.", false);
        }
    },
    showLoading(button) {
        // Implementation remains the same
        button.disabled = true;
        button.originalText = button.textContent;
        button.innerHTML = '<div class="pulsing-spinner-small"></div> Loading...';
    },
    hideLoading(button) {
        // Implementation remains the same
        button.disabled = false;
        if (button.originalText) {
            button.textContent = button.originalText;
            delete button.originalText;
        }
    }
};
