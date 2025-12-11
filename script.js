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
                row.innerHTML = `
                    <td class="font-semibold text-white">${tech.id}</td>
                    <td>${tech.points.toFixed(3)}</td>
                    <td>${tech.fixTasks}</td>
                    <td class="${tech.refixTasks > 0 ? 'text-red-400' : ''}">${tech.refixTasks}</td>
                    <td><span class="quality-pill ${tech.quality >= 95 ? 'quality-pill-green' : tech.quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${tech.quality.toFixed(2)}%</span></td>
                    <td>${tech.bonusEarned.toFixed(2)}%</td>
                    <td class="payout-amount">${tech.payout.toFixed(2)}</td>
                    <td class="text-center"><button class="info-icon tech-summary-icon" data-tech-id="${tech.id}" title="View Details">${infoIconSvg}</button></td>
                `;
                resultsTbody.appendChild(row);
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
            const qualityBar = document.createElement('div');
            qualityBar.className = 'workload-bar-wrapper';
            const qualityFloor = Math.floor(quality);
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
            if (selectedTeams.length === 0) return true;
            const teamName = getTeamName(techId);
            return teamName && selectedTeams.includes(teamName);
        });
        if (filteredFix4.length > 0) {
            fix4Container.innerHTML = filteredFix4.map(([techId, categories]) => {
                const rows = Object.entries(categories).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([cat, count]) => `<tr><td class="p-2">Category ${cat}</td><td class="p-2">${count}</td></tr>`).join('');
                return `<div class="table-container text-sm mb-4"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th colspan="2" class="p-2 text-left font-bold text-white">${techId}</th></tr><tr><th class="p-2 text-left">Category</th><th class="p-2 text-left">Count</th></tr></thead><tbody>${rows}</tbody></table></div>`;
            }).join('');
        } else {
            fix4Container.innerHTML = `<p class="text-brand-400 text-sm">No Fix4 data for selected filters.</p>`;
        }
    },
    updateQuickSummary(techStats) {
        const container = document.getElementById('quick-summary-container');
        const summarySection = document.getElementById('quick-summary-section');
        const techArray = Object.values(techStats);
        if (techArray.length === 0) {
            summarySection.classList.add('hidden');
            return;
        }
        summarySection.classList.remove('hidden');
        this.setPanelHeights();
        const totalPoints = techArray.reduce((sum, tech) => sum + tech.points, 0);
        const totalFixTasks = techArray.reduce((sum, tech) => sum + tech.fixTasks, 0);
        const totalRefixTasks = techArray.reduce((sum, tech) => sum + tech.refixTasks, 0);
        const totalWarnings = techArray.reduce((sum, tech) => sum + tech.warnings.length, 0);
        const totalDenominator = totalFixTasks + totalRefixTasks + totalWarnings;
        const overallQuality = totalDenominator > 0 ? (totalFixTasks / totalDenominator) * 100 : 0;
        const totalQCPenalty = techArray.reduce((sum, tech) => sum + tech.qcPenalty, 0);

        const categorySummary = {};
        techArray.forEach(tech => {
            Object.entries(tech.categoryCounts).forEach(([cat, counts]) => {
                categorySummary[cat] = (categorySummary[cat] || 0) + Object.values(counts).reduce((a, b) => a + b, 0);
            });
        });

        const sortedCategories = Object.entries(categorySummary)
            .sort(([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB));
        
        let categoriesHtml = '';
        sortedCategories.forEach(([cat, count]) => {
            categoriesHtml += `<div class="summary-item summary-cat-${cat}"><span class="font-medium">Category ${cat}:</span><span class="font-mono summary-item-value">${count}</span></div>`;
        });

        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
        const qualityModifier = Calculator.calculateQualityModifier(overallQuality);
        const overallPayout = totalPoints * bonusMultiplier * qualityModifier;
        const bonusEarned = qualityModifier * 100;
        
        container.innerHTML = `
            <div class="space-y-2">
                <div class="summary-item summary-cat-total">
                    <span class="text-white">Total Payout (PHP):</span>
                    <span class="font-mono summary-item-value">${overallPayout.toFixed(2)}</span>
                </div>
                <div class="summary-item summary-cat-total">
                    <span class="text-white">Points Earned:</span>
                    <span class="font-mono summary-item-value">${totalPoints.toFixed(3)}</span>
                </div>
                <div class="summary-item summary-cat-total">
                    <span class="text-white">Quality Modifier:</span>
                    <span class="font-mono summary-item-value">${bonusEarned.toFixed(2)}%</span>
                </div>
                <div class="summary-item summary-cat-total">
                    <span class="text-white">Overall Quality:</span>
                    <span class="font-mono summary-item-value">${overallQuality.toFixed(2)}%</span>
                </div>
                <div class="h-px bg-brand-700 my-2"></div>
                <div class="summary-item summary-cat-3">
                    <span class="font-medium">Total Fix Tasks:</span>
                    <span class="font-mono summary-item-value">${totalFixTasks}</span>
                </div>
                <div class="summary-item summary-cat-1">
                    <span class="font-medium text-red-400">Total Refix Tasks:</span>
                    <span class="font-mono summary-item-value">${totalRefixTasks}</span>
                </div>
                <div class="summary-item summary-cat-1">
                    <span class="font-medium text-red-400">Total Warnings:</span>
                    <span class="font-mono summary-item-value">${totalWarnings}</span>
                </div>
                <div class="summary-item summary-cat-1">
                    <span class="font-medium text-red-400">Total QC Penalty:</span>
                    <span class="font-mono summary-item-value">${totalQCPenalty.toFixed(3)} pts</span>
                </div>
                <div class="h-px bg-brand-700 my-2"></div>
                <h4 class="text-lg font-semibold mt-4 mb-2">Category Breakdown</h4>
                ${categoriesHtml}
            </div>
        `;
    },
    generateTeamBreakdownHTML(teamName, teamTechs, techStats, projectName) {
        let html = `<p class="text-sm text-brand-400 mb-4">Displaying results for project: <strong>${projectName || 'N/A'}</strong></p>`;
        const techArray = teamTechs.map(id => techStats[id]).filter(Boolean);
        if (techArray.length === 0) return html + `<p class="text-center text-brand-400">No data found for this team in the current results.</p>`;
        
        const sortedTechs = techArray.sort((a, b) => b.points - a.points);
        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
        
        html += `<div class="table-container h-full"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th class="p-2 text-left">Tech ID</th><th class="p-2 text-left">Points</th><th class="p-2 text-left">Fix/Refix</th><th class="p-2 text-left">Quality</th><th class="p-2 text-left">Payout</th></tr></thead><tbody>`;
        
        sortedTechs.forEach(tech => {
            const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
            const quality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
            const qualityModifier = Calculator.calculateQualityModifier(quality);
            const payout = tech.points * bonusMultiplier * qualityModifier;
            const qualityClass = quality >= 95 ? 'quality-pill-green' : quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red';

            html += `
                <tr>
                    <td class="p-2 font-semibold">${tech.id}</td>
                    <td class="p-2">${tech.points.toFixed(3)}</td>
                    <td class="p-2">${tech.fixTasks} / <span class="${tech.refixTasks > 0 ? 'text-red-400' : ''}">${tech.refixTasks}</span></td>
                    <td class="p-2"><span class="quality-pill ${qualityClass}">${quality.toFixed(2)}%</span></td>
                    <td class="p-2 payout-amount">${payout.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        return html;
    },
    generateTechBreakdownHTML(tech) {
        const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
        const fixQuality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
        const qualityModifier = Calculator.calculateQualityModifier(fixQuality);
        const finalPayout = tech.points * (parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1) * qualityModifier;
        
        let projectBreakdownHTML = '';
        if (tech.isCombined || tech.projectName) {
            let projectRows = '';
            const breakdownSource = tech.isCombined ? tech.pointsBreakdownByProject : { [tech.projectName]: { points: tech.points, fixTasks: tech.fixTasks, refixTasks: tech.refixTasks, warnings: tech.warnings.length } };

            Object.entries(breakdownSource).sort(([a], [b]) => a.localeCompare(b)).forEach(([projectName, stats]) => {
                const projectQualityDenominator = stats.fixTasks + stats.refixTasks + stats.warnings;
                const projectQuality = projectQualityDenominator > 0 ? (stats.fixTasks / projectQualityDenominator) * 100 : 0;
                const qualityClass = projectQuality >= 95 ? 'quality-pill-green' : projectQuality >= 85 ? 'quality-pill-orange' : 'quality-pill-red';
                
                projectRows += `
                    <tr>
                        <td class="p-2 font-semibold">${projectName}</td>
                        <td class="p-2">${stats.points.toFixed(3)}</td>
                        <td class="p-2">${stats.fixTasks} / <span class="${stats.refixTasks > 0 ? 'text-red-400' : ''}">${stats.refixTasks}</span></td>
                        <td class="p-2">${stats.warnings}</td>
                        <td class="p-2"><span class="quality-pill ${qualityClass}">${projectQuality.toFixed(2)}%</span></td>
                    </tr>
                `;
            });
            
            projectBreakdownHTML = `
                <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
                    <h4 class="font-semibold text-base text-white mb-2">${tech.isCombined ? 'Combined Project Breakdown' : 'Project Stats'}</h4>
                    <div class="table-container max-h-60">
                        <table class="min-w-full">
                            <thead class="bg-brand-900">
                                <tr>
                                    <th class="p-2 text-left text-xs text-brand-400">Project</th>
                                    <th class="p-2 text-left text-xs text-brand-400">Points</th>
                                    <th class="p-2 text-left text-xs text-brand-400">Fix/Refix</th>
                                    <th class="p-2 text-left text-xs text-brand-400">Warnings</th>
                                    <th class="p-2 text-left text-xs text-brand-400">Quality</th>
                                </tr>
                            </thead>
                            <tbody>${projectRows}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        let categoryRows = '';
        Object.entries(tech.categoryCounts).sort(([a], [b]) => parseInt(a) - parseInt(b)).forEach(([cat, counts]) => {
            const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
            const sources = Object.entries(counts).filter(([, count]) => count > 0).map(([source, count]) => `${source.toUpperCase()}: ${count}`).join(', ');
            categoryRows += `<tr><td class="p-2">Category ${cat}</td><td class="p-2">${totalCount}</td><td class="p-2 text-xs text-brand-400">${sources}</td></tr>`;
        });

        const categoryBreakdownHTML = categoryRows ? `
            <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
                <h4 class="font-semibold text-base text-white mb-2">Category Totals</h4>
                <div class="table-container max-h-60">
                    <table class="min-w-full">
                        <thead class="bg-brand-900">
                            <tr>
                                <th class="p-2 text-left text-xs text-brand-400">Category</th>
                                <th class="p-2 text-left text-xs text-brand-400">Total Fixes</th>
                                <th class="p-2 text-left text-xs text-brand-400">Sources</th>
                            </tr>
                        </thead>
                        <tbody>${categoryRows}</tbody>
                    </table>
                </div>
            </div>
        ` : '';
        
        const qcPoints = tech.qcTasks * AppState.calculationSettings.points.qc;
        const i3qaPoints = tech.i3qaTasks * AppState.calculationSettings.points.i3qa;
        const rvPoints = tech.rvTasks * AppState.calculationSettings.points.rv2;
        
        const qcBreakdownHTML = tech.qcTasks > 0 ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4"><h4 class="font-semibold text-base text-white mb-2">QC Tasks</h4><div class="space-y-2"><div class="summary-item">QC Tasks:<span class="font-mono">${tech.qcTasks} x ${AppState.calculationSettings.points.qc.toFixed(3)} = ${qcPoints.toFixed(3)} pts</span></div></div></div>` : '';
        const i3qaBreakdownHTML = tech.i3qaTasks > 0 ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4"><h4 class="font-semibold text-base text-white mb-2">i3qa Tasks</h4><div class="space-y-2"><div class="summary-item">i3qa Tasks:<span class="font-mono">${tech.i3qaTasks} x ${AppState.calculationSettings.points.i3qa.toFixed(3)} = ${i3qaPoints.toFixed(3)} pts</span></div></div></div>` : '';
        const rvBreakdownHTML = tech.rvTasks > 0 ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4"><h4 class="font-semibold text-base text-white mb-2">RV Tasks</h4><div class="space-y-2"><div class="summary-item">RV Tasks:<span class="font-mono">${tech.rvTasks} tasks = ${rvPoints.toFixed(3)} pts</span></div></div></div>` : '';

        return `<div class="space-y-4 text-sm">
            ${projectBreakdownHTML}
            <div class="p-3 bg-accent/10 rounded-lg border border-accent/50">
                <h4 class="font-semibold text-base text-accent mb-2">Final Payout</h4>
                <div class="flex justify-between font-bold text-lg">
                    <span class="text-white">Payout (PHP):</span>
                    <span class="text-accent font-mono">${finalPayout.toFixed(2)}</span>
                </div>
            </div>
            <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
                <h4 class="font-semibold text-base text-white mb-2">Quality Summary</h4>
                <div class="space-y-2">
                    <div class="summary-item">
                        <span>Total Points:</span>
                        <span class="font-mono">${tech.points.toFixed(3)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Total Fix Tasks:</span>
                        <span class="font-mono">${tech.fixTasks}</span>
                    </div>
                    <div class="summary-item text-red-400">
                        <span>Total Refix Tasks:</span>
                        <span class="font-mono">${tech.refixTasks}</span>
                    </div>
                    <div class="summary-item text-red-400">
                        <span>Total Warnings:</span>
                        <span class="font-mono">${tech.warnings.length}</span>
                    </div>
                    <div class="summary-item text-red-400">
                        <span>QC Penalty:</span>
                        <span class="font-mono">${tech.qcPenalty.toFixed(3)} pts</span>
                    </div>
                    <div class="summary-item">
                        <span>Fix Quality:</span>
                        <span class="font-mono quality-pill ${fixQuality >= 95 ? 'quality-pill-green' : fixQuality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${fixQuality.toFixed(2)}%</span>
                    </div>
                    <div class="summary-item">
                        <span>Bonus Multiplier:</span>
                        <span class="font-mono text-status-green">${qualityModifier.toFixed(2)}x</span>
                    </div>
                </div>
            </div>
            ${categoryBreakdownHTML}
            ${qcBreakdownHTML}
            ${i3qaBreakdownHTML}
            ${rvBreakdownHTML}
            <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
                <h4 class="font-semibold text-base text-white mb-2">Fix4 Breakdown</h4>
                ${tech.fix4.length > 0 ? tech.fix4.map(f => `<div class="summary-item summary-cat-${f.category}"><span>Cat ${f.category} - ${f.sourceType.toUpperCase()}</span><span class="font-mono text-xs text-brand-400">${f.id}</span></div>`).join('') : '<p class="text-brand-400 text-sm">No Fix4 items recorded.</p>'}
            </div>
        </div>`;
    },
    openTeamSummaryModal(teamName) {
        const teamTechs = AppState.teamSettings[teamName];
        if (!teamTechs) return;
        const currentProjectName = document.getElementById('results-title').textContent.replace('Bonus Payouts for: ', '');
        const modalBody = this.generateTeamBreakdownHTML(teamName, teamTechs, AppState.currentTechStats, currentProjectName);
        document.getElementById('team-summary-modal-title').textContent = `Summary for ${teamName}`;
        document.getElementById('team-summary-modal-body').innerHTML = modalBody;
        this.openModal('team-summary-modal');
    },
    openTechSummaryModal(techId) {
        const tech = AppState.currentTechStats[techId];
        if (!tech) return;
        document.getElementById('tech-summary-modal-title').textContent = `Summary for ${techId}`;
        document.getElementById('tech-summary-modal-body').innerHTML = this.generateTechBreakdownHTML(tech);
        this.openModal('tech-summary-modal');
    },
    resetUIForNewCalculation() {
        ['#bonus-payout-section', '#tl-summary-card', '#quick-summary-section'].forEach(s => document.querySelector(s)?.classList.add('hidden'));
        const resultsTitle = document.getElementById('results-title');
        if (resultsTitle) resultsTitle.textContent = 'Bonus Payouts';
        if (!document.getElementById('project-data').value) {
            document.getElementById('run-calculation-btn').disabled = true;
        }
    },
    applyFilters() {
        const searchValue = document.getElementById('tech-search-input').value.trim().toUpperCase();
        const selectedTeams = Array.from(document.querySelectorAll('#team-filter-container input:checked')).map(cb => cb.dataset.team);
        
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
        const el = document.getElementById('update-notification');
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
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('hidden');
    },
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.add('hidden');
    },
    showLoading(button, text = 'Processing...') {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>${text}`;
        button.disabled = true;
    },
    hideLoading(button) {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            button.disabled = false;
            delete button.dataset.originalText;
        }
    },
    updateGuidedSetupView() {
        const { currentStep, totalSteps } = AppState.guidedSetup;
        document.querySelectorAll('.guided-step-content').forEach(el => el.classList.add('hidden'));
        document.getElementById(`guided-step-${currentStep}`).classList.remove('hidden');
        document.getElementById('step-indicator').textContent = `Step ${currentStep} of ${totalSteps}`;
    }
};

const Calculator = {
    createNewTechStat(isCombined = false) {
        return {
            id: '',
            points: 0,
            fixTasks: 0,
            afpTasks: 0,
            i3qaTasks: 0,
            qcTasks: 0,
            rvTasks: 0,
            refixTasks: 0,
            warnings: [], // { column, label, row }
            qcPenalty: 0,
            fix4: [], // { id, category, sourceType, row }
            categoryCounts: { 1: { fix: 0, ir: 0, afp: 0, rv: 0 }, 2: { fix: 0, ir: 0, afp: 0, rv: 0 }, 3: { fix: 0, ir: 0, afp: 0, rv: 0 }, 4: { fix: 0, ir: 0, afp: 0, rv: 0 }, 5: { fix: 0, ir: 0, afp: 0, rv: 0 }, 6: { fix: 0, ir: 0, afp: 0, rv: 0 }, 7: { fix: 0, ir: 0, afp: 0, rv: 0 }, 8: { fix: 0, ir: 0, afp: 0, rv: 0 }, 9: { fix: 0, ir: 0, afp: 0, rv: 0 } },
            isCombined: isCombined,
            projectName: isCombined ? '' : null,
            pointsBreakdown: { fix: 0, qc: 0, i3qa: 0, rv1: 0, rv2: 0 },
            pointsBreakdownByProject: {} // Only used if isCombined is true
        };
    },
    calculateQualityModifier(quality) {
        const tier = AppState.bonusTiers.find(t => quality >= t.quality);
        return tier ? tier.bonus : 0.00;
    },
    parseRawData(rawData, isIRProject, projectName, gsdForCalculation) {
        const lines = atob(rawData).split('\n');
        if (lines.length <= 1) return { techStats: {} };

        const headers = lines[0].split('\t').map(h => h.toLowerCase().trim());
        const dataRows = lines.slice(1).filter(line => line.trim() !== '');
        
        const getIndex = (colName) => headers.indexOf(colName);
        const get = (colName) => {
            const index = getIndex(colName);
            return index !== -1 ? currentRow[index] : null;
        };
        const techStats = {};
        const countingSettings = AppState.countingSettings;

        const initTechStat = (techId) => {
            if (!techStats[techId]) {
                techStats[techId] = Calculator.createNewTechStat(false);
                techStats[techId].id = techId;
                techStats[techId].projectName = projectName;
            }
        };

        const processFixTech = (techId, catSources) => {
            if (!techId || !techStats[techId]) return;
            let techPoints = 0;
            let techCategories = 0;
            const isFixTaskIR = isIRProject && getIndex('ir_tech_id') !== -1;

            catSources.forEach(source => {
                if (source.isRQA && source.sourceType === 'afp') techStats[techId].afpTasks++;
                
                const labelValue = source.label ? get(source.label)?.trim().toUpperCase() : null;
                if (source.condition && !source.condition(labelValue)) return;

                const catValue = parseInt(get(source.cat));
                if (!isNaN(catValue) && catValue >= 1 && catValue <= 9) {
                    techCategories++;
                    techPoints += AppState.calculationSettings.categoryValues[catValue]?.[gsdForCalculation] || 0;
                    
                    if(techStats[techId].categoryCounts[catValue]) {
                        // Ensure the sourceType exists before incrementing
                        if (!techStats[techId].categoryCounts[catValue][source.sourceType]) {
                             techStats[techId].categoryCounts[catValue][source.sourceType] = 0;
                        }
                        techStats[techId].categoryCounts[catValue][source.sourceType]++;
                    }

                    // Log Fix4 tasks
                    if (source.sourceType === 'fix4') {
                        const fix4Id = get('rv1_id') || get('rv2_id') || get('rv3_id');
                        if (fix4Id) {
                            techStats[techId].fix4.push({ id: fix4Id, category: catValue, sourceType: 'rv', row: rowNum });
                        }
                    }
                }
            });

            techStats[techId].fixTasks += techCategories;
            let pointsToAdd = techPoints * (isFixTaskIR ? AppState.calculationSettings.irModifierValue : 1);
            techStats[techId].points += pointsToAdd;
            techStats[techId].pointsBreakdown.fix += pointsToAdd;
        };

        // Helper for non-fix tasks (QC, i3QA, RV)
        const addPointsForTask = (techId, points, field, taskType) => {
            if (techId && techStats[techId]) {
                techStats[techId].points += points;
                techStats[techId].pointsBreakdown[field] += points;
                if (taskType === 'qc') techStats[techId].qcTasks++;
                if (taskType === 'i3qa') techStats[techId].i3qaTasks++;
                if (taskType === 'rv') techStats[techId].rvTasks++;
            }
        };

        // Loop through data rows
        for (let rowNum = 1; rowNum < dataRows.length + 1; rowNum++) {
            const currentRow = dataRows[rowNum - 1].split('\t');

            // --- 1. Fix Task Points (All Fixes: Fix1, Fix2, Fix3, Fix4, AFP) ---
            const fixTechId = get('fix_tech_id')?.trim().toUpperCase();
            if (fixTechId && CONSTANTS.TECH_ID_REGEX.test(fixTechId)) {
                initTechStat(fixTechId);
                const catSources = [];
                const triggers = countingSettings.triggers;
                
                // FIX1 (Standard Fix)
                const fix1Cat = get('fix1_cat');
                if (fix1Cat) catSources.push({ cat: 'fix1_cat', sourceType: 'fix' });

                // AFP Fix
                const afpTechId = get('afp_tech_id')?.trim().toUpperCase();
                if (afpTechId === fixTechId) {
                    const afpCat = get('afp_cat');
                    if (afpCat) catSources.push({ cat: 'afp_cat', sourceType: 'afp', isRQA: true });
                }

                // FIX2, FIX3, FIX4 (RV/i3qa)
                for (let i = 1; i <= 3; i++) {
                    const fix = { cat: get(`fix${i + 1}_cat`), id: get(`rv${i}_id`) };
                    if (!fix.cat) continue;

                    const rvTechId = get(`rv${i}_tech_id`)?.trim().toUpperCase();
                    if (rvTechId === fixTechId) {
                        const reviewCol = `rv${i}_label`;
                        
                        // FIX2 is RQA (i3qa)
                        if (i === 1 && getIndex('i3qa_label') !== -1) {
                            catSources.push({ 
                                cat: fix.cat, 
                                label: 'i3qa_label', 
                                condition: v => v && triggers.miss.labels.some(l => v.includes(l.toUpperCase())),
                                sourceType: 'i3qa' 
                            });
                        } else if (fix.cat) { 
                            // FIX3, FIX4 RV logic
                            // Add RV points only if the RV label is a MISS (m) or CORRECT (c)
                            const reviewCol = i === 2 ? 'rv2_label' : 'rv3_label';
                            catSources.push({ 
                                cat: fix.cat, 
                                label: reviewCol, 
                                condition: v => v && triggers.miss.labels.some(l => v.includes(l.toUpperCase())), 
                                sourceType: 'rv' 
                            });

                            // Only log fix4 for RVs that are counted as fixes (miss or correct label)
                            if (i >= 2 && get('rv_type')?.trim().toUpperCase() === 'FIX4') {
                                catSources.push({ 
                                    cat: fix.cat, 
                                    label: reviewCol, 
                                    condition: v => v && triggers.miss.labels.some(l => v.includes(l.toUpperCase())), 
                                    sourceType: 'fix4' 
                                });
                            }
                        }
                    }
                }

                processFixTech(fixTechId, catSources);
            }

            // --- 2. IR Fix Task Points ---
            if (isIRProject) {
                const irTechId = get('ir_tech_id')?.trim().toUpperCase();
                const irCat = get('ir_cat');
                if (irTechId && CONSTANTS.TECH_ID_REGEX.test(irTechId) && irCat) {
                    initTechStat(irTechId);
                    processFixTech(irTechId, [{ cat: 'ir_cat', sourceType: 'ir' }]);
                }
            }

            // --- 3. Refix Tasks (Penalties) ---
            const refixTechId = get('refix_tech_id')?.trim().toUpperCase();
            if (refixTechId && CONSTANTS.TECH_ID_REGEX.test(refixTechId)) {
                initTechStat(refixTechId);
                const reviewCols = countingSettings.triggers.refix.columns;
                const refixLabels = countingSettings.triggers.refix.labels;

                for (const col of reviewCols) {
                    const label = get(col)?.trim().toUpperCase();
                    if (label && refixLabels.some(l => label.includes(l.toUpperCase()))) {
                        techStats[refixTechId].refixTasks++;
                        break; // Only count one refix penalty per task
                    }
                }
            }

            // --- 4. Warning Tasks (Penalties) ---
            const warningTechId = get('warning_tech_id')?.trim().toUpperCase();
            if (warningTechId && CONSTANTS.TECH_ID_REGEX.test(warningTechId)) {
                initTechStat(warningTechId);
                const warnCols = countingSettings.triggers.warning.columns;
                const warnLabels = countingSettings.triggers.warning.labels;

                for (const col of warnCols) {
                    const label = get(col)?.trim().toUpperCase();
                    if (label && warnLabels.some(l => label.includes(l.toUpperCase()))) {
                        // Log the warning but don't break, multiple warnings can be on one task
                        techStats[warningTechId].warnings.push({ column: col, label: label, row: rowNum });
                    }
                }
            }

            // --- 5. QC Penalty Points (i3qa_label 'M' or 'E') ---
            const qcPenaltyTechId = get('i3qa_tech_id')?.trim().toUpperCase();
            if (qcPenaltyTechId && CONSTANTS.TECH_ID_REGEX.test(qcPenaltyTechId)) {
                initTechStat(qcPenaltyTechId);
                const i3qaLabel = get('i3qa_label')?.trim().toUpperCase();
                const qcPenaltyLabels = countingSettings.triggers.qcPenalty.labels;

                if (i3qaLabel && qcPenaltyLabels.some(l => i3qaLabel.includes(l.toUpperCase()))) {
                    const penalty = AppState.calculationSettings.points.qc;
                    techStats[qcPenaltyTechId].qcPenalty += penalty;
                    techStats[qcPenaltyTechId].points -= penalty;
                }
            }

            // --- 6. QC Task Points ---
            const qcTechId = get('qc_tech_id')?.trim().toUpperCase();
            if (qcTechId && CONSTANTS.TECH_ID_REGEX.test(qcTechId)) {
                initTechStat(qcTechId);
                const qcPointValue = AppState.calculationSettings.points.qc;
                addPointsForTask(qcTechId, qcPointValue, 'qc', 'qc');
            }

            // --- 7. i3QA Task Points (RQA) ---
            const i3qaTechId = get('i3qa_tech_id')?.trim().toUpperCase();
            if (i3qaTechId && CONSTANTS.TECH_ID_REGEX.test(i3qaTechId)) {
                initTechStat(i3qaTechId);
                const i3qaPointValue = AppState.calculationSettings.points.i3qa;
                addPointsForTask(i3qaTechId, i3qaPointValue, 'i3qa', 'i3qa');
            }

            // --- 8. RV Task Points ---
            for (let i = 1; i <= 2; i++) {
                const rvTechId = get(`rv${i}_tech_id`)?.trim().toUpperCase();
                if (rvTechId && CONSTANTS.TECH_ID_REGEX.test(rvTechId)) {
                    initTechStat(rvTechId);
                    let rvPointValue = AppState.calculationSettings.points[`rv${i}`];
                    let rvPointField = `rv${i}`;

                    // Special condition for RV1 Combo
                    if (i === 1 && get('rv_type')?.trim().toUpperCase() === 'COMBO') {
                        rvPointValue = AppState.calculationSettings.points.rv1_combo;
                        rvPointField = 'rv1_combo'; // Use a special field for clarity
                    }
                    
                    addPointsForTask(rvTechId, rvPointValue, rvPointField, 'rv');
                }
            }
        }

        return { techStats };
    }
};

const App = {
    async initialize() {
        if (!window.indexedDB) {
            alert("Your browser does not support IndexedDB. Please use a modern browser (Chrome, Firefox, Edge, Safari).");
            return;
        }
        await DB.open();
        await this.loadSettings();
        await this.initFirebase();
        this.bindEventListeners();
        this.loadInitialState();
    },
    async loadSettings() {
        await Promise.all([
            this.loadTeamSettings(),
            this.loadBonusTiers(),
            this.loadCalculationSettings(),
            this.loadCountingSettings(),
            this.fetchProjectListSummary()
        ]);
        const theme = localStorage.getItem('theme');
        if (theme === 'light') document.body.classList.add('light-theme');
    },
    async loadInitialState() {
        const hasBeenSetup = await DB.get('settings', 'hasBeenSetup');
        if (!hasBeenSetup || !hasBeenSetup.value) {
            UI.openModal('guided-setup-modal');
        } else {
            // Check if there's a recent calculation to re-display
            const lastCalculation = await DB.get('settings', 'lastCalculation');
            if (lastCalculation) {
                AppState.currentTechStats = lastCalculation.techStats;
                document.getElementById('bonusMultiplierDirect').value = lastCalculation.bonusMultiplier || 1;
                document.getElementById('results-title').textContent = lastCalculation.title;
                UI.applyFilters();
            }
        }
        
        // Load chatbot state
        if (localStorage.getItem('chatbotVisible') === 'true') {
             document.getElementById('chatbot-window').classList.add('visible');
        }
    },
    async initFirebase() {
        if (typeof firebase === 'undefined') {
            console.warn("Firebase not loaded. Admin/Cloud features disabled.");
            return;
        }
        
        // Check for Firebase config in localStorage
        const configStr = localStorage.getItem('firebaseConfig');
        if (!configStr) {
            console.warn("Firebase config not found in localStorage.");
            return;
        }
        
        try {
            const firebaseConfig = JSON.parse(configStr);
            if (!firebase.apps.length) {
                AppState.firebase.app = firebase.initializeApp(firebaseConfig);
            } else {
                AppState.firebase.app = firebase.app(); // Get existing app instance
            }

            AppState.firebase.auth = firebase.auth();
            AppState.firebase.db = firebase.firestore();
            dayjs.extend(dayjs.plugin.relativeTime);

            // Tools object for easier use
            AppState.firebase.tools = {
                auth: AppState.firebase.auth,
                db: AppState.firebase.db,
                collection: AppState.firebase.db.collection.bind(AppState.firebase.db),
                getDocs: firebase.firestore.getDocs.bind(firebase.firestore),
                addDoc: firebase.firestore.addDoc.bind(firebase.firestore),
                query: firebase.firestore.query.bind(firebase.firestore),
                orderBy: firebase.firestore.orderBy.bind(firebase.firestore),
                limit: firebase.firestore.limit.bind(firebase.firestore),
                onSnapshot: firebase.firestore.onSnapshot.bind(firebase.firestore),
                doc: firebase.firestore.doc.bind(firebase.firestore),
                getDoc: firebase.firestore.getDoc.bind(firebase.firestore),
                updateDoc: firebase.firestore.updateDoc.bind(firebase.firestore),
                deleteDoc: firebase.firestore.deleteDoc.bind(firebase.firestore),
                where: firebase.firestore.where.bind(firebase.firestore),
            };

            // Setup Auth State Listener and other real-time listeners
            AppState.firebase.auth.onAuthStateChanged(user => {
                const adminPortalBtn = document.getElementById('admin-portal-btn');
                if (user) {
                    const isAdmin = CONSTANTS.ADMIN_EMAIL.includes(user.email);
                    AppState.firebase.isAdmin = isAdmin;
                    
                    document.getElementById('user-email').textContent = user.email;
                    document.getElementById('user-portal-status').textContent = isAdmin ? 'Admin' : 'User';
                    document.getElementById('admin-login-info').classList.remove('hidden');
                    document.getElementById('admin-google-signin-btn').classList.add('hidden');
                    
                    if (isAdmin) {
                        adminPortalBtn?.classList.remove('hidden');
                        document.getElementById('admin-project-list-tab-btn').classList.remove('hidden');
                        document.getElementById('admin-cloud-settings-tab-btn').classList.remove('hidden');
                        document.getElementById('admin-visitor-log-tab-btn').classList.remove('hidden');
                        this.listenForUpdates(); // Start listening for admin updates
                        this.logVisitor(); // Log visit
                    } else {
                        adminPortalBtn?.classList.add('hidden');
                    }
                } else {
                    AppState.firebase.isAdmin = false;
                    adminPortalBtn?.classList.add('hidden');
                    document.getElementById('user-portal-status').textContent = 'Signed Out';
                    document.getElementById('admin-login-info').classList.add('hidden');
                    document.getElementById('admin-google-signin-btn').classList.remove('hidden');
                    document.getElementById('admin-project-list-tab-btn')?.classList.add('hidden');
                    document.getElementById('admin-cloud-settings-tab-btn')?.classList.add('hidden');
                    document.getElementById('admin-visitor-log-tab-btn')?.classList.add('hidden');
                }
            });
            
        } catch (error) {
            console.error("Error initializing Firebase:", error);
        }
    },
    async loadVisitorLog() {
        if (!AppState.firebase.isAdmin) return;
        const logTbody = document.getElementById('visitor-log-tbody');
        if (!logTbody) return;
        logTbody.innerHTML = '<tr><td colspan="3" class="text-center p-4">Loading...</td></tr>';

        try {
            const { db, collection, getDocs, query, orderBy } = AppState.firebase.tools;
            const q = query(collection(db, "visitors"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            logTbody.innerHTML = '';
            
            const parser = new UAParser();

            querySnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const timestamp = data.timestamp.toDate();
                const result = parser.setUA(data.userAgent).getResult();

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="p-2">${dayjs(timestamp).fromNow()}</td>
                    <td class="p-2">${result.browser.name} ${result.browser.version} (${result.os.name})</td>
                    <td class="p-2">${result.device.vendor || 'Desktop'} ${result.device.model || ''}</td>
                `;
                logTbody.appendChild(row);
            });

            if (querySnapshot.empty) {
                logTbody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-brand-400">No recent visitor logs.</td></tr>`;
            }

        } catch (error) {
            console.error("Error loading visitor log:", error);
            logTbody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-red-400">Error: Could not load logs.</td></tr>`;
        }
    },
    async logVisitor() {
        try {
            const { db, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } = AppState.firebase.tools;
            await addDoc(collection(db, "visitors"), {
                timestamp: new Date(),
                userAgent: navigator.userAgent
            });

            const q = query(collection(db, "visitors"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.size > 10) {
                const deletePromises = [];
                for (let i = 10; i < querySnapshot.docs.length; i++) {
                    const docToDelete = querySnapshot.docs[i];
                    deletePromises.push(deleteDoc(doc(db, "visitors", docToDelete.id)));
                }
                await Promise.all(deletePromises);
            }
        } catch (error) {
            console.error("Error logging visitor:", error);
        }
    },
    async listenForUpdates() {
        const { db, collection, query, orderBy, limit, onSnapshot } = AppState.firebase.tools;
        const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(1));
        
        onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const latestUpdate = snapshot.docs[0].data();
                latestUpdate.id = snapshot.docs[0].id;
                
                const acceptedUpdateId = localStorage.getItem('acceptedUpdateId');
                
                if (latestUpdate.id !== acceptedUpdateId) {
                    const banner = document.getElementById('user-update-banner');
                    document.getElementById('update-banner-text').textContent = latestUpdate.message;
                    banner.classList.remove('hidden');
                }
            }
        });
    },
    async loadBonusTiers() {
        const saved = await DB.get('bonusTiers', 'customTiers');
        AppState.bonusTiers = (saved && saved.tiers.length > 0) ? saved.tiers : CONSTANTS.DEFAULT_BONUS_TIERS;
    },
    async loadCalculationSettings() {
        const saved = await DB.get('calculationSettings', 'customSettings');
        AppState.calculationSettings = saved ? saved.settings : JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_CALCULATION_SETTINGS));
    },
    async loadCountingSettings() {
        const saved = await DB.get('countingSettings', 'customSettings');
        AppState.countingSettings = saved ? saved.settings : JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_COUNTING_SETTINGS));
    },
    async saveAdvanceSettings() {
        const tiersContainer = document.getElementById('bonus-tier-editor-container');
        const newTiers = Array.from(tiersContainer.querySelectorAll('.tier-row')).map(row => ({
            quality: parseFloat(row.querySelector('.tier-quality').value),
            bonus: parseFloat(row.querySelector('.tier-bonus').value)
        })).filter(t => !isNaN(t.quality) && !isNaN(t.bonus) && t.quality >= 0 && t.bonus >= 0)
          .sort((a, b) => b.quality - a.quality);

        const newCalcSettings = {
            irModifierValue: parseFloat(document.getElementById('setting-ir-modifier').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.irModifierValue,
            points: {
                qc: parseFloat(document.getElementById('setting-qc-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.qc,
                i3qa: parseFloat(document.getElementById('setting-i3qa-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.i3qa,
                rv1: parseFloat(document.getElementById('setting-rv1-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.rv1,
                rv1_combo: parseFloat(document.getElementById('setting-rv1-combo-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.rv1_combo,
                rv2: parseFloat(document.getElementById('setting-rv2-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.rv2
            },
            categoryValues: JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_CALCULATION_SETTINGS.categoryValues)) // Start with default structure
        };
        document.querySelectorAll('.cat-value-input').forEach(input => {
            const [cat, gsd] = input.id.split('-').slice(1);
            const value = parseFloat(input.value);
            if (!isNaN(value) && cat && gsd) {
                if (!newCalcSettings.categoryValues[cat]) newCalcSettings.categoryValues[cat] = {};
                newCalcSettings.categoryValues[cat][gsd] = value;
            }
        });

        const newCountingSettings = {
            taskColumns: CONSTANTS.DEFAULT_COUNTING_SETTINGS.taskColumns, // Keep default unless admin controls are added
            triggers: JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers))
        };
        ['refix', 'miss', 'warning', 'qcPenalty'].forEach(trigger => {
            const labelsInput = document.getElementById(`setting-${trigger}-labels`);
            if (labelsInput) {
                newCountingSettings.triggers[trigger].labels = labelsInput.value.split(',').map(l => l.trim()).filter(l => l.length > 0);
            }
        });

        await Promise.all([
            DB.put('bonusTiers', { id: 'customTiers', tiers: newTiers }),
            DB.put('calculationSettings', { id: 'customSettings', settings: newCalcSettings }),
            DB.put('countingSettings', { id: 'customSettings', settings: newCountingSettings })
        ]);

        // Re-load to update AppState
       const [reloadedTiers, reloadedCalcSettings, reloadedCountingSettings] = await Promise.all([
    this.loadBonusTiers(),
    this.loadCalculationSettings(),
    this.loadCountingSettings()
]);
        [AppState.bonusTiers, AppState.calculationSettings, AppState.countingSettings] = [newTiers, newCalcSettings, newCountingSettings];
        UI.showNotification("Advance settings saved.");
        UI.closeModal('advance-settings-modal');
    },
    populateAdvanceSettingsEditor() {
        const container = document.getElementById('advance-settings-body');
        container.innerHTML = `<div class="flex items-center gap-2 border-b border-brand-700 mb-4"><button class="tab-button active" data-tab="bonus-tiers">Bonus Tiers</button><button class="tab-button" data-tab="points">Points</button><button class="tab-button" data-tab="counting">Counting Logic</button></div><div id="tab-bonus-tiers" class="tab-content active"><div id="bonus-tier-editor-container" class="space-y-2"></div><button id="add-tier-btn" class="btn-secondary mt-4">Add Tier</button></div><div id="tab-points" class="tab-content"><div class="space-y-4"><div><label for="setting-ir-modifier">IR Modifier</label><input type="number" step="0.1" id="setting-ir-modifier" class="input-field w-full mt-1"></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div><label for="setting-qc-points">QC</label><input type="number" step="0.01" id="setting-qc-points" class="input-field w-full mt-1"></div><div><label for="setting-i3qa-points">i3QA</label><input type="number" step="0.01" id="setting-i3qa-points" class="input-field w-full mt-1"></div><div><label for="setting-rv1-points">RV1</label><input type="number" step="0.01" id="setting-rv1-points" class="input-field w-full mt-1"></div><div><label for="setting-rv1-combo-points">RV1 Combo</label><input type="number" step="0.01" id="setting-rv1-combo-points" class="input-field w-full mt-1"></div><div><label for="setting-rv2-points">RV2</label><input type="number" step="0.01" id="setting-rv2-points" class="input-field w-full mt-1"></div></div><h4 class="font-semibold mt-4">Category Values (Points per Fix)</h4><div class="grid grid-cols-4 gap-2 text-xs text-brand-400 border-b border-brand-700 py-2"><span class="font-bold">Cat</span><span class="font-bold">3in/4in/6in</span><span class="font-bold">9in</span></div><div id="category-value-editor" class="space-y-1"></div></div></div><div id="tab-counting" class="tab-content"><div class="space-y-4"><div><label for="setting-refix-labels">Refix Labels (Comma separated, e.g., i)</label><input type="text" id="setting-refix-labels" class="input-field w-full mt-1"></div><div><label for="setting-miss-labels">Miss/Correct Labels (Comma separated, e.g., m, c)</label><input type="text" id="setting-miss-labels" class="input-field w-full mt-1"></div><div><label for="setting-warning-labels">Warning Labels (Comma separated, e.g., b, c, d)</label><input type="text" id="setting-warning-labels" class="input-field w-full mt-1"></div><div><label for="setting-qcPenalty-labels">QC Penalty Labels (Comma separated, e.g., m, e)</label><input type="text" id="setting-qcPenalty-labels" class="input-field w-full mt-1"></div></div></div>`;

        // Populate Bonus Tiers
        const tiersContainer = document.getElementById('bonus-tier-editor-container');
        AppState.bonusTiers.forEach(tier => this.addTierRow(tiersContainer, tier.quality, tier.bonus));
        document.getElementById('add-tier-btn').addEventListener('click', () => this.addTierRow(tiersContainer, 90.0, 1.00));

        // Populate Points Settings
        document.getElementById('setting-ir-modifier').value = AppState.calculationSettings.irModifierValue;
        document.getElementById('setting-qc-points').value = AppState.calculationSettings.points.qc;
        document.getElementById('setting-i3qa-points').value = AppState.calculationSettings.points.i3qa;
        document.getElementById('setting-rv1-points').value = AppState.calculationSettings.points.rv1;
        document.getElementById('setting-rv1-combo-points').value = AppState.calculationSettings.points.rv1_combo;
        document.getElementById('setting-rv2-points').value = AppState.calculationSettings.points.rv2;
        
        // Populate Category Values
        const catValueContainer = document.getElementById('category-value-editor');
        for (let cat = 1; cat <= 9; cat++) {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-4 gap-2 items-center';
            const catSettings = AppState.calculationSettings.categoryValues[cat] || {};
            const standardValue = catSettings['3in'] ?? CONSTANTS.DEFAULT_CALCULATION_SETTINGS.categoryValues[cat]['3in'];
            const nineInValue = catSettings['9in'] ?? CONSTANTS.DEFAULT_CALCULATION_SETTINGS.categoryValues[cat]['9in'];
            
            row.innerHTML = `
                <span class="font-semibold">Category ${cat}</span>
                <input type="number" step="0.01" id="cat-${cat}-3in" class="cat-value-input input-field text-sm p-1" value="${standardValue}">
                <input type="number" step="0.01" id="cat-${cat}-9in" class="cat-value-input input-field text-sm p-1" value="${nineInValue}">
            `;
            catValueContainer.appendChild(row);
        }

        // Populate Counting Logic
        document.getElementById('setting-refix-labels').value = AppState.countingSettings.triggers.refix.labels.join(', ');
        document.getElementById('setting-miss-labels').value = AppState.countingSettings.triggers.miss.labels.join(', ');
        document.getElementById('setting-warning-labels').value = AppState.countingSettings.triggers.warning.labels.join(', ');
        document.getElementById('setting-qcPenalty-labels').value = AppState.countingSettings.triggers.qcPenalty.labels.join(', ');

        // Tab functionality
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
            });
        });
    },
    addTierRow(container, quality, bonus) {
        const row = document.createElement('div');
        row.className = 'tier-row flex gap-2 items-center';
        row.innerHTML = `
            <div class="flex items-center w-full gap-2">
                <label class="w-24 text-sm font-medium">Quality % >=</label>
                <input type="number" step="0.1" class="tier-quality input-field w-20 text-sm p-1" value="${quality}">
            </div>
            <div class="flex items-center w-full gap-2">
                <label class="w-24 text-sm font-medium">Bonus Multiplier</label>
                <input type="number" step="0.01" class="tier-bonus input-field w-20 text-sm p-1" value="${bonus}">
            </div>
            <button class="delete-tier-btn control-btn-icon-danger flex-shrink-0" title="Remove Tier"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
        `;
        container.appendChild(row);
        row.querySelector('.delete-tier-btn').addEventListener('click', () => row.remove());
    },
    async loadTeamSettings() {
        const teamsData = await DB.get('teams', 'teams');
        AppState.teamSettings = (teamsData && Object.keys(teamsData.settings).length > 0) ? teamsData.settings : CONSTANTS.DEFAULT_TEAMS;
        UI.populateTeamFilters();
        UI.populateAdminTeamManagement();
    },
    async saveTeamSettings(containerId = 'team-list-container') {
        const newSettings = {};
        document.querySelectorAll(`#${containerId} .team-card`).forEach(div => {
            const teamName = div.querySelector('.team-name-input').value.trim();
            if (teamName) newSettings[teamName] = Array.from(div.querySelectorAll('.tech-tag')).map(tag => tag.dataset.techId);
        });

        // Simple validation: ensure no two teams have the same tech ID
        const allTechIds = new Set();
        let hasDuplicateTech = false;
        for (const team in newSettings) {
            for (const techId of newSettings[team]) {
                if (allTechIds.has(techId)) {
                    hasDuplicateTech = true;
                    UI.showNotification(`Error: Tech ID ${techId} is already in another team.`, true);
                    return; // Stop saving and exit
                }
                allTechIds.add(techId);
            }
        }


        await DB.put('teams', { id: 'teams', settings: newSettings });
        UI.showNotification("Team settings saved.");
        AppState.teamSettings = newSettings;
        UI.populateTeamFilters();
        UI.closeModal('manage-teams-modal');
        UI.applyFilters(); // Re-apply filters with new team structure
    },
    async saveProjectToIndexedDB(projectData) {
        try {
            await DB.put('projects', { ...projectData, projectOrder: projectData.projectOrder || Date.now() });
        } catch (error) {
            console.error("Error saving project:", error);
            UI.showNotification("Error saving project.", true);
        }
    },
    async fetchProjectListSummary() {
        const projects = await DB.getAll('projects');
        const sortedProjects = projects.sort((a, b) => (b.projectOrder || 0) - (a.projectOrder || 0));
        UI.populateProjectSelect(sortedProjects);
        return sortedProjects;
    },
    async loadProjectIntoForm(projectId) {
        const projectSelect = document.getElementById('project-select');
        const projectNameInput = document.getElementById('project-name');
        const projectDataTextarea = document.getElementById('project-data');
        const isIrCheckbox = document.getElementById('is-ir-project-checkbox');
        const gsdSelect = document.getElementById('gsd-value-select');
        const runBtn = document.getElementById('run-calculation-btn');
        const irProjectField = document.getElementById('ir-project-field');

        if (projectId) {
            const project = await DB.get('projects', projectId);
            if (project) {
                projectNameInput.value = project.name;
                projectDataTextarea.value = atob(project.rawData);
                isIrCheckbox.checked = project.isIRProject;
                gsdSelect.value = project.gsdValue || AppState.lastUsedGsdValue;

                // Disable the checkbox if a project is loaded
                isIrCheckbox.disabled = true; 
                irProjectField.title = project.isIRProject ? 'IR status is fixed for saved projects.' : '';

                runBtn.disabled = false;
                document.getElementById('save-project-btn').textContent = 'Update Project';
            }
        } else {
            // Reset to blank form
            projectNameInput.value = '';
            projectDataTextarea.value = '';
            isIrCheckbox.checked = false;
            isIrCheckbox.disabled = false;
            irProjectField.title = '';
            gsdSelect.value = AppState.lastUsedGsdValue; // Use last used GSD value
            runBtn.disabled = true;
            document.getElementById('save-project-btn').textContent = 'Save Project';
        }
    },
    async deleteProjectFromIndexedDB(projectId) {
        if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            await DB.delete('projects', projectId);
            UI.showNotification("Project deleted.");
            this.fetchProjectListSummary(); // Refresh the select list
            this.loadProjectIntoForm(""); // Reset form
        }
    },
    async handleRunCalculation(button) {
        UI.showLoading(button);
        UI.resetUIForNewCalculation();

        const projectDataTextarea = document.getElementById('project-data');
        const isCombinedCheckbox = document.getElementById('combined-projects-checkbox');
        const selectedProjectIds = Array.from(document.getElementById('combined-project-list').querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

        const isCombined = isCombinedCheckbox.checked && selectedProjectIds.length > 0;

        try {
            if (isCombined) {
                await this.runCalculation(true, selectedProjectIds);
            } else {
                const projectName = document.getElementById('project-name').value.trim() || 'Custom Data';
                const projectData = projectDataTextarea.value.trim();
                const isIRProject = document.getElementById('is-ir-project-checkbox').checked;
                const gsdValue = document.getElementById('gsd-value-select').value;
                AppState.lastUsedGsdValue = gsdValue;

                if (!projectData) {
                    UI.showNotification("Please provide data to calculate.", true);
                    return;
                }

                const rawData = btoa(projectData);
                const project = { rawData, isIRProject, name: projectName, gsdValue };
                
                // Also save GSD value for easy access on next run
                await DB.put('settings', { id: 'lastUsedGsdValue', value: gsdValue });

                await this.runCalculation(false, [project]);
            }
            
        } catch (error) {
            console.error("Calculation Error:", error);
            UI.showNotification("An error occurred during calculation. Check console for details.", true);
        } finally {
            UI.hideLoading(button);
        }
    },
    async runCalculation(isCombined, projects) {
        let techStats = {};
        let title = 'Bonus Payouts';

        if (isCombined) {
            title = 'Combined Payouts';
            techStats = await this.calculateCombinedStats(projects);
        } else {
            const project = projects[0];
            title = `Bonus Payouts for: ${project.name}`;
            const result = Calculator.parseRawData(project.rawData, project.isIRProject, project.name, project.gsdValue);
            techStats = result.techStats;
        }

        AppState.currentTechStats = techStats;
        document.getElementById('results-title').textContent = title;
        UI.applyFilters();
        UI.setPanelHeights();
        
        // Save the results to IndexedDB for persistence
        await DB.put('settings', {
            id: 'lastCalculation',
            techStats: techStats,
            title: title,
            bonusMultiplier: parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1
        });
    },
    async calculateCombinedStats(projectIds) {
        let combinedStats = {};

        for (const id of projectIds) {
            const project = await this.fetchFullProjectData(id);
            if (!project) continue;

            const parsed = Calculator.parseRawData(project.rawData, project.isIRProject, project.name, project.gsdValue);
            if (!parsed || Object.keys(parsed.techStats).length === 0) continue;

            for (const [techId, stat] of Object.entries(parsed.techStats)) {
                if (!combinedStats[techId]) {
                    combinedStats[techId] = Calculator.createNewTechStat(true);
                    combinedStats[techId].id = techId;
                }
                
                // Aggregate Points Breakdown
                Object.keys(stat.pointsBreakdown).forEach(k => combinedStats[techId].pointsBreakdown[k] += stat.pointsBreakdown[k]);

                // Aggregate Simple Stats
                ['points', 'fixTasks', 'afpTasks', 'i3qaTasks', 'qcTasks', 'rvTasks', 'refixTasks', 'qcPenalty'].forEach(k => combinedStats[techId][k] += stat[k]);

                // Aggregate Arrays (Warnings, Fix4)
                ['warnings', 'fix4'].forEach(k => combinedStats[techId][k].push(...stat[k]));

                // Aggregate Category Counts
                for (const cat in stat.categoryCounts) {
                    for (const type in stat.categoryCounts[cat]) {
                        if (stat.categoryCounts[cat][type] > 0) {
                            if (!combinedStats[techId].categoryCounts[cat][type]) {
                                combinedStats[techId].categoryCounts[cat][type] = 0;
                            }
                            combinedStats[techId].categoryCounts[cat][type] += stat.categoryCounts[cat][type];
                        }
                    }
                }

                // Aggregate by Project for Detailed Breakdown in Modal
                if (!combinedStats[techId].pointsBreakdownByProject[project.name]) {
                    combinedStats[techId].pointsBreakdownByProject[project.name] = { points: 0, fixTasks: 0, refixTasks: 0, warnings: 0 };
                }
                combinedStats[techId].pointsBreakdownByProject[project.name].points += stat.points;
                combinedStats[techId].pointsBreakdownByProject[project.name].fixTasks += stat.fixTasks;
                combinedStats[techId].pointsBreakdownByProject[project.name].refixTasks += stat.refixTasks;
                combinedStats[techId].pointsBreakdownByProject[project.name].warnings += stat.warnings.length;
            }
        }
        
        return combinedStats;
    },
    async fetchFullProjectData(projectId) {
        const project = await DB.get('projects', projectId);
        if (project && !project.rawData) {
            // Attempt to fetch from Firebase if available and rawData is missing (legacy projects)
            if (AppState.firebase.tools) {
                try {
                    const { db, doc, getDoc } = AppState.firebase.tools;
                    const docRef = doc(db, "projects", projectId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().rawData) {
                        project.rawData = docSnap.data().rawData;
                        // Update IndexedDB with the fetched rawData
                        await DB.put('projects', project);
                    }
                } catch (e) {
                    console.warn(`Could not fetch full project data for ${projectId} from cloud.`, e);
                }
            }
        }
        return project;
    },
    async handleAdminLogin() {
        if (!AppState.firebase.auth) {
            UI.showNotification("Firebase not initialized. Cannot log in.", true);
            return;
        }
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await AppState.firebase.auth.signInWithPopup(provider);
            UI.showNotification("Signed in successfully.");
            UI.closeModal('admin-portal-modal');

        } catch (error) {
            console.error("Admin login failed:", error);
            UI.showNotification(`Admin login failed: ${error.message}`, true);
        }
    },
    async handleAdminLogout() {
        if (AppState.firebase.auth) {
            await AppState.firebase.auth.signOut();
            UI.showNotification("Signed out.");
        }
    },
    async loadAdminProjectList() {
        const projectListBody = document.getElementById('admin-project-list-body');
        if (!projectListBody) return;
        projectListBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading...</td></tr>';
        
        if (!AppState.firebase.isAdmin) {
             projectListBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-400">Admin privileges required to view.</td></tr>';
             return;
        }

        try {
            const { db, collection, getDocs, query, orderBy } = AppState.firebase.tools;
            const q = query(collection(db, "projects"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            projectListBody.innerHTML = '';

            querySnapshot.docs.forEach((doc) => {
                const project = doc.data();
                project.id = doc.id;
                const date = project.timestamp ? dayjs(project.timestamp.toDate()).format('YYYY-MM-DD') : 'N/A';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="p-2">${project.name}</td>
                    <td class="p-2">${date}</td>
                    <td class="p-2 text-center">${project.isIRProject ? 'Yes' : 'No'}</td>
                    <td class="p-2 text-center">${project.isReleased ? 'Yes' : 'No'}</td>
                    <td class="p-2 text-center flex gap-2 justify-center">
                        <button class="control-btn-icon edit-cloud-project-btn" data-project-id="${project.id}" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.637a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg></button>
                        <button class="control-btn-icon-danger delete-cloud-project-btn" data-project-id="${project.id}" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
                    </td>
                `;
                projectListBody.appendChild(row);
            });
            
            if (querySnapshot.empty) {
                projectListBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-brand-400">No projects found in cloud.</td></tr>';
            }
            
            projectListBody.querySelectorAll('.edit-cloud-project-btn').forEach(btn => btn.addEventListener('click', (e) => this.loadAdminProjectToForm(e.currentTarget.dataset.projectId)));
            projectListBody.querySelectorAll('.delete-cloud-project-btn').forEach(btn => btn.addEventListener('click', (e) => this.deleteAdminProject(e.currentTarget.dataset.projectId)));
            
        } catch (error) {
            console.error("Error loading admin project list:", error);
            projectListBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-400">Error loading projects.</td></tr>';
        }
    },
    async loadAdminProjectToForm(projectId) {
        if (!AppState.firebase.isAdmin) return;
        this.resetAdminProjectForm();
        UI.showLoading(document.getElementById('admin-portal-modal').querySelector('.modal-content'));

        try {
            const { db, doc, getDoc } = AppState.firebase.tools;
            const docRef = doc(db, "projects", projectId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const project = docSnap.data();
                document.getElementById('admin-form-title').textContent = `Editing: ${project.name}`;
                document.getElementById('admin-project-id').value = projectId;
                document.getElementById('admin-project-name').value = project.name;
                document.getElementById('admin-gsd-select').value = project.gsdValue;
                document.getElementById('admin-is-ir-checkbox').checked = project.isIRProject;
                document.getElementById('admin-is-released-checkbox').checked = project.isReleased || false;
                
                // Decompress and populate raw data
                const binary_string = atob(project.rawData);
                const len = binary_string.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binary_string.charCodeAt(i);
                }
                const decompressed = pako.inflate(bytes, { to: 'string' });
                
                document.getElementById('admin-project-data').value = decompressed;

                document.getElementById('admin-project-tabs').classList.remove('hidden');
                document.getElementById('admin-data-tab-btn').classList.add('active');
                document.getElementById('tab-admin-data').classList.add('active');
                
                document.getElementById('admin-save-btn').textContent = 'Update Cloud Project';
                document.getElementById('admin-delete-btn').classList.remove('hidden');

            } else {
                UI.showNotification("Project not found in cloud.", true);
            }
        } catch (error) {
            console.error("Error loading project for admin edit:", error);
            UI.showNotification(`Error loading project: ${error.message}`, true);
        } finally {
             UI.hideLoading(document.getElementById('admin-portal-modal').querySelector('.modal-content'));
        }
    },
    async saveAdminProject(button) {
        if (!AppState.firebase.isAdmin) return;
        UI.showLoading(button);

        const projectId = document.getElementById('admin-project-id').value.trim();
        const name = document.getElementById('admin-project-name').value.trim();
        const rawDataText = document.getElementById('admin-project-data').value.trim();
        const isIRProject = document.getElementById('admin-is-ir-checkbox').checked;
        const gsdValue = document.getElementById('admin-gsd-select').value;
        const isReleased = document.getElementById('admin-is-released-checkbox').checked;

        if (!name || !rawDataText) {
            UI.showNotification("Project name and data are required.", true);
            UI.hideLoading(button);
            return;
        }

        try {
            // Compress and Base64 encode the data
            const compressed = pako.deflate(rawDataText, { to: 'string' });
            const base64Data = btoa(compressed);
            
            const projectFields = {
                name: name,
                rawData: base64Data,
                isIRProject: isIRProject,
                gsdValue: gsdValue,
                isReleased: isReleased,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            const { db, collection, doc, updateDoc, addDoc } = AppState.firebase.tools;

            if (projectId) {
                await updateDoc(doc(db, "projects", projectId), projectFields);
                UI.showNotification("Project updated successfully.");
            } else {
                // Add new project, default 'isReleased' to false
                await addDoc(collection(db, "projects"), { ...projectFields, isReleased: false });
                UI.showNotification("Project saved to the cloud.");
            }
            
            this.resetAdminProjectForm();
            this.loadAdminProjectList();
        } catch (error) {
             console.error("Error saving project to cloud:", error);
             UI.showNotification("Error saving project.", true);
        } finally {
            UI.hideLoading(button);
        }
    },
    async deleteAdminProject(projectId) {
        if (!AppState.firebase.isAdmin) return;
        if (confirm(`Are you sure you want to delete project ${projectId} from the cloud? This action cannot be undone.`)) {
            try {
                const { db, doc, deleteDoc } = AppState.firebase.tools;
                await deleteDoc(doc(db, "projects", projectId));
                UI.showNotification("Project deleted from cloud.");
                this.loadAdminProjectList();
                this.resetAdminProjectForm();
            } catch (error) {
                console.error("Error deleting project:", error);
                UI.showNotification("Error deleting project.", true);
            }
        }
    },
    resetAdminProjectForm() {
        document.getElementById('admin-form-title').textContent = 'Add New Project';
        document.getElementById('admin-project-id').value = '';
        document.getElementById('admin-project-name').value = '';
        document.getElementById('admin-project-data').value = '';
        document.getElementById('admin-is-ir-checkbox').checked = false;
        document.getElementById('admin-is-released-checkbox').checked = false;
        document.getElementById('admin-gsd-select').value = '3in';
        document.getElementById('admin-save-btn').textContent = 'Save to Cloud';
        document.getElementById('admin-delete-btn').classList.add('hidden');
        document.getElementById('admin-project-tabs').classList.add('hidden');
        // Reset tab view
        document.querySelectorAll('#admin-project-tabs .tab-button, #admin-panel-view .admin-tab-content').forEach(el => el.classList.remove('active'));
    },
    async handleAdminDroppedFiles(files) {
        if (!AppState.firebase.isAdmin) {
             UI.showNotification("Admin privileges required for this action.", true);
             return;
        }
        
        const fileGroups = {}; // key: filename without extension, value: { shp: file, dbf: file }

        for (const file of files) {
            const parts = file.name.split('.');
            if (parts.length > 1) {
                const ext = parts.pop().toLowerCase();
                const name = parts.join('.');
                if (ext === 'shp' || ext === 'dbf') {
                    if (!fileGroups[name]) fileGroups[name] = {};
                    fileGroups[name][ext] = file;
                }
            }
        }
        
        let allFeatures = [];
        let count = 0;

        // --- BUG FIX: Iterate over values of fileGroups to ensure proper reading ---
        for (const group of Object.values(fileGroups)) {
            if (group.shp && group.dbf) {
                try {
                    const geojson = await shapefile.read(await group.shp.arrayBuffer(), await group.dbf.arrayBuffer());
                    
                    // Ensure geojson is valid and contains features before pushing
                    if (geojson && geojson.features && geojson.features.length > 0) {
                        allFeatures.push(...geojson.features);
                        count++;
                    } else if (geojson && geojson.features && geojson.features.length === 0) {
                        // Log a warning if a file was read but was empty
                        console.warn(`Shapefile pair for ${group.shp.name.split('.')[0]} was successfully parsed but contained no features.`);
                    }

                } catch (e) {
                    // If parsing fails for one pair, show a notification but continue the loop
                    console.error("Error parsing shapefile pair:", e);
                    UI.showNotification(`Error processing file pair ${group.shp.name.split('.')[0]}. Please check file integrity.`, true);
                }
            }
        }
        // --- END BUG FIX ---

        if (allFeatures.length > 0) {
            const allKeys = new Set();
            allFeatures.forEach(feature => {
                if (feature.properties) {
                    Object.keys(feature.properties).forEach(key => allKeys.add(key));
                }
            });

            const headers = Array.from(allKeys);
            let tsv = headers.join('\t') + '\n';

            allFeatures.forEach(feature => {
                const row = headers.map(header => {
                    return feature.properties ? (feature.properties[header] ?? '') : '';
                });
                tsv += row.join('\t') + '\n';
            });

            document.getElementById('admin-project-data').value = tsv;
            UI.showNotification(`${count} shapefile set(s) processed for admin upload.`);
        } else {
            alert("No valid .shp/.dbf pairs found.");
        }
    },
    async clearAllData() {
        if (confirm("Clear ALL data? This deletes projects and resets all settings to their defaults.")) {
            if (AppState.db) {
                AppState.db.close();
            }
            const req = indexedDB.deleteDatabase('BonusCalculatorDB');
            req.onsuccess = async () => {
                alert("All data has been cleared. The application will now reset.");
                localStorage.clear();
                window.location.reload();
            };
            req.onerror = () => alert("Error clearing data. Please close all other tabs with this application open and try again.");
            req.onblocked = () => alert("Could not clear data. Please close all other tabs with this application open and try again.");
        }
    },
    async resetAdvanceSettingsToDefaults() {
        if (confirm("Are you sure you want to reset all advanced settings to their original defaults? This will apply to all users on next refresh.")) {
            AppState.bonusTiers = CONSTANTS.DEFAULT_BONUS_TIERS;
            AppState.calculationSettings = JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_CALCULATION_SETTINGS));
            AppState.countingSettings = JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_COUNTING_SETTINGS));
            
            await Promise.all([
                DB.delete('bonusTiers', 'customTiers'),
                DB.delete('calculationSettings', 'customSettings'),
                DB.delete('countingSettings', 'customSettings')
            ]);
            
            UI.showNotification("Advanced settings reset to defaults.");
            this.populateAdvanceSettingsEditor(); // Refresh the editor view
        }
    },
    startGuidedSetup() {
        UI.closeModal('guided-setup-modal');
        AppState.guidedSetup.currentStep = 1;
        AppState.guidedSetup.tourStep = 0;
        
        // Define tour elements dynamically
        AppState.guidedSetup.tourElements = [
            { id: 'data-projects-panel', text: 'This is where you load, save, and manage project data. You can paste TSV data or select a saved project.' },
            { id: 'project-select-group', text: 'Select an existing project from this dropdown or manage them in the Admin Portal.' },
            { id: 'project-data', text: 'Paste your TSV data here or use the "Load from File" button to upload a file.' },
            { id: 'run-calculation-btn', text: 'Click this button to process the data and display the results.' },
            { id: 'team-filter-container', text: 'Filter the results by your defined teams. You can manage teams via the main menu.' },
            { id: 'tech-search-input', text: 'Search and filter results by Tech ID.' },
            { id: 'leaderboard-panel', text: 'The leaderboard shows a summary of top performers based on your selected metric.' },
            { id: 'tl-summary-card', text: 'The TL Summary card displays a quick view of team quality and Fix4 breakdown (if applicable).' },
            { id: 'quick-summary-section', text: 'The Quick Summary shows the overall results, including total payout, quality, and category counts.' },
            { id: 'main-menu-btn', text: 'Use the main menu to manage teams, adjust advanced settings, or reset all data.' }
        ];

        this.runTourStep();
    },
    runTourStep() {
        const { tourStep, tourElements } = AppState.guidedSetup;
        this.clearSpotlight();

        if (tourStep >= tourElements.length) {
            AppState.guidedSetup.currentStep = 4;
            this.updateGuidedSetupView();
            UI.openModal('guided-setup-modal');
            return;
        }

        const { id, text } = tourElements[tourStep];
        const element = document.getElementById(id);
        
        if (element) {
            this.spotlightElement(element, text);
        } else {
            // Skip step if element is not found
            AppState.guidedSetup.tourStep++;
            this.runTourStep();
        }
    },
    spotlightElement(element, text) {
        const overlay = document.getElementById('spotlight-overlay');
        overlay.classList.remove('hidden');
        
        // Remove spotlight from previous element
        document.querySelector('.spotlight')?.classList.remove('spotlight');

        // Add spotlight to current element
        element.classList.add('spotlight');
        
        // Create and position tooltip
        let tooltip = document.getElementById('spotlight-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'spotlight-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.className = 'spotlight-tooltip';
        tooltip.innerHTML = `${text}<div class="flex justify-end mt-4 gap-2"><button id="tour-next-btn" class="btn-primary">Next</button></div>`;

        const rect = element.getBoundingClientRect();
        
        // Determine placement (default to bottom, check if enough space at the top)
        const tooltipHeightEstimate = 150; // Estimate height based on typical content
        let placement = 'bottom';
        if (rect.top > tooltipHeightEstimate + 20) { // Check if there's enough room above
            placement = 'top';
        }

        tooltip.classList.add(placement);
        
        // Reposition tooltip in a microtask to allow it to calculate its correct dimensions
        requestAnimationFrame(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            let top, left;
            
            if (placement === 'bottom') {
                top = rect.bottom + 10;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            } else { // top
                top = rect.top - tooltipRect.height - 10;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            }

            // Keep tooltip within bounds (simple x-axis correction)
            if (left < 10) {
                left = 10;
            } else if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        });
        

        document.getElementById('tour-next-btn').onclick = () => {
            AppState.guidedSetup.tourStep++;
            this.runTourStep();
        };
    },
    clearSpotlight() {
        document.getElementById('spotlight-overlay')?.classList.add('hidden');
        document.querySelector('.spotlight')?.classList.remove('spotlight');
        document.getElementById('spotlight-tooltip')?.remove();
    },
    async finishGuidedSetup() {
        await this.saveTeamSettings('setup-team-list');
        await DB.put('settings', { id: 'hasBeenSetup', value: true });
        UI.closeModal('guided-setup-modal');
        UI.showNotification("Setup complete. Welcome to the Advanced Bonus Calculator!");
    },
    bindEventListeners() {
        const listen = (id, event, handler) => {
            document.getElementById(id)?.addEventListener(event, handler);
        };
        
        window.addEventListener('resize', UI.setPanelHeights);
        
        // Main Listeners
        listen('project-select', 'change', e => {
            const projectId = e.target.value;
            this.loadProjectIntoForm(projectId);
            UI.resetUIForNewCalculation();
        });
        listen('run-calculation-btn', 'click', e => this.handleRunCalculation(e.target));
        listen('save-project-btn', 'click', async e => {
            UI.showLoading(e.target);
            const name = document.getElementById('project-name').value.trim();
            const rawDataText = document.getElementById('project-data').value.trim();
            const projectId = document.getElementById('project-select').value.trim() || `local-${Date.now()}`;
            const gsdValue = document.getElementById('gsd-value-select').value;
            
            if (!name || !rawDataText) {
                UI.showNotification("Project name and data are required to save.", true);
                UI.hideLoading(e.target);
                return;
            }

            // Compress and Base64 encode the data
            const compressed = pako.deflate(rawDataText, { to: 'string' });
            const base64Data = btoa(compressed);

            const projectData = {
                id: projectId,
                name: name,
                rawData: base64Data,
                isIRProject: document.getElementById('is-ir-project-checkbox').checked,
                gsdValue: gsdValue
            };

            await this.saveProjectToIndexedDB(projectData);
            await this.fetchProjectListSummary(); // Refresh the dropdown
            document.getElementById('project-select').value = projectData.id;
            await this.loadProjectIntoForm(projectData.id); // Reload the form to update state (e.g., button text)
            UI.hideLoading(e.target);
        });
        listen('delete-project-btn', 'click', () => {
            const projectId = document.getElementById('project-select').value;
            if (projectId) this.deleteProjectFromIndexedDB(projectId);
        });
        listen('load-file-btn', 'change', e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = event => {
                    const content = event.target.result;
                    document.getElementById('project-data').value = content;
                    document.getElementById('project-name').value = file.name.replace(/\.[^/.]+$/, ""); // Name without extension
                    document.getElementById('run-calculation-btn').disabled = false;
                    
                    // Forcefully remove the selected project context if it exists
                    const projectSelect = document.getElementById('project-select');
                    if (projectSelect.value !== '') {
                        projectSelect.value = '';
                        projectSelect.selectedIndex = 0; // Explicitly reset selected index
                        this.loadProjectIntoForm(""); // Resets to a blank form, enabling text areas
                    }
                    
                    // Explicitly set IR checkbox to unchecked and enabled for pasted data
                    document.getElementById('is-ir-project-checkbox').checked = false;
                    document.getElementById('is-ir-project-checkbox').disabled = false;
                    document.getElementById('project-name').value = file.name.replace(/\.[^/.]+$/, ""); // Clear project name on paste

                    e.target.value = ''; // Clear file input
                };
                reader.readAsText(file);
            }
        });
        listen('project-data', 'input', () => {
             const data = document.getElementById('project-data').value.trim();
             document.getElementById('run-calculation-btn').disabled = !data;
        });

        // --- FIX: Add listener to reset form state when pasting data into the textarea ---
        listen('project-data', 'paste', () => {
            const projectSelect = document.getElementById('project-select');
            // Forcefully remove the selected project context if it exists
            if (projectSelect.value !== '') {
                projectSelect.value = '';
                projectSelect.selectedIndex = 0; // Explicitly reset selected index
                this.loadProjectIntoForm(""); // Resets to a blank form, enabling text areas
            }
            // Explicitly set IR checkbox to unchecked and enabled for pasted data
            document.getElementById('is-ir-project-checkbox').checked = false;
            document.getElementById('is-ir-project-checkbox').disabled = false;
            document.getElementById('project-name').value = ''; // Clear project name on paste
        });
        // --- END FIX ---

        listen('admin-portal-btn', 'click', () => UI.openModal('admin-portal-modal'));
        listen('guided-setup-btn', 'click', this.startGuidedSetup.bind(this));
        listen('manage-teams-btn', 'click', () => {
            UI.populateAdminTeamManagement();
            UI.openModal('manage-teams-modal');
        });
        listen('advance-settings-btn', 'click', () => {
            this.populateAdvanceSettingsEditor();
            UI.openModal('advance-settings-modal');
        });
        listen('toggle-theme-btn', 'click', () => {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        });
        listen('save-advance-settings-btn', 'click', this.saveAdvanceSettings);
        listen('important-info-btn', 'click', () => UI.openModal('important-info-modal'));
        
        // --- REPORT A BUG FIX: Using window.open for Gmail URL ---
        const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=ev.lorens.ebrado@gmail.com&su=BUG%20REPORT%20-%20PCS%20Bonus%20Calculator&body=Please%20describe%20the%20bug%20you%20encountered%20in%20detail:%0A%0A%5BDescription%5D%0A%0A%5BSteps%20to%20Reproduce%5D%0A1.%0A2.%0A3.%0A%0A%5BScreenshot%20or%20Error%20Message%5D%0A';
        listen('report-bug-btn', 'click', () => window.open(gmailUrl, '_blank'));
        // --- END REPORT A BUG FIX ---
        
        listen('clear-data-btn', 'click', this.clearAllData);
        listen('reset-advance-settings-btn', 'click', this.resetAdvanceSettingsToDefaults.bind(this));

        // Combined Project Listeners
        listen('combined-projects-checkbox', 'change', e => {
            document.getElementById('combined-projects-list-container').classList.toggle('hidden', !e.target.checked);
            document.getElementById('single-project-inputs').classList.toggle('hidden', e.target.checked);
            
            // Re-populate the list whenever the checkbox is toggled
            if (e.target.checked) {
                this.populateCombinedProjectList();
            }
        });

        // Event delegation for dynamically created elements
        document.addEventListener('click', e => {
            if (e.target.closest('.tech-summary-icon')) {
                UI.openTechSummaryModal(e.target.closest('.tech-summary-icon').dataset.techId);
            } else if (e.target.closest('.team-summary-trigger')) {
                UI.openTeamSummaryModal(e.target.closest('.team-summary-trigger').dataset.teamName);
            }
        });
        
        // Guided Setup Listeners
        listen('guided-setup-next-btn-1', 'click', () => { AppState.guidedSetup.currentStep = 2; UI.updateGuidedSetupView(); });
        listen('guided-setup-next-btn-2', 'click', () => { AppState.guidedSetup.currentStep = 3; UI.updateGuidedSetupView(); });
        listen('guided-setup-start-tour-btn', 'click', this.startGuidedSetup.bind(this));
        listen('guided-setup-finish-btn', 'click', this.finishGuidedSetup.bind(this));
        listen('guided-setup-finish-tour-btn', 'click', () => { AppState.guidedSetup.currentStep = 4; UI.updateGuidedSetupView(); });
        
        // Chatbot Listeners
        listen('chatbot-bubble', 'click', () => {
             const windowEl = document.getElementById('chatbot-window');
             windowEl.classList.toggle('visible');
             localStorage.setItem('chatbotVisible', windowEl.classList.contains('visible'));
        });
        listen('chatbot-close-btn', 'click', () => {
             document.getElementById('chatbot-window').classList.remove('visible');
             localStorage.setItem('chatbotVisible', 'false');
        });
        listen('chatbot-send-btn', 'click', this.handleChatbotSend.bind(this));
        listen('chatbot-input', 'keydown', e => {
            if (e.key === 'Enter') this.handleChatbotSend();
        });
        document.addEventListener('click', e => {
             if (e.target.closest('.suggestion-btn')) {
                 this.handleChatbotSend(e.target.closest('.suggestion-btn').textContent.trim());
             }
        });
        listen('accept-update-btn', 'click', async () => {
             await this.resetAdvanceSettingsToDefaults(); // Reset to defaults as per instructions
             const { db, collection, query, orderBy, limit, getDocs } = AppState.firebase.tools;
             const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(1));
             const snapshot = await getDocs(q);
             if (!snapshot.empty) {
                 localStorage.setItem('acceptedUpdateId', snapshot.docs[0].id);
                 document.getElementById('user-update-banner').classList.add('hidden');
                 window.location.reload(); // Force refresh to apply new defaults
             }
        });

        // Filters and Sorting
        listen('tech-search-input', 'input', UI.applyFilters.bind(UI));
        listen('team-filter-container', 'change', UI.applyFilters.bind(UI));
        listen('refresh-teams-btn', 'click', this.loadTeamSettings);
        listen('leaderboard-sort-select', 'change', () => UI.applyFilters());
        
        // Team Management Listeners
        listen('add-team-btn', 'click', () => UI.addTeamCard());
        listen('save-teams-btn', 'click', () => this.saveTeamSettings());

        // Admin Portal Listeners
        listen('admin-google-signin-btn', 'click', this.handleAdminLogin.bind(this));
        listen('admin-logout-btn', 'click', this.handleAdminLogout.bind(this));
        listen('admin-save-btn', 'click', e => this.saveAdminProject(e.target));
        listen('admin-new-project-btn', 'click', this.resetAdminProjectForm);
        listen('admin-delete-btn', 'click', e => this.deleteAdminProject(document.getElementById('admin-project-id').value));
        listen('admin-upload-config-btn', 'click', () => UI.openModal('admin-config-upload-modal'));
        listen('admin-save-config-btn', 'click', this.saveAdminConfig.bind(this));
        
        document.querySelectorAll('#admin-panel-view .tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('#admin-panel-view .tab-button, .admin-tab-content').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
                
                if(button.dataset.tab === 'admin-visitors') this.loadVisitorLog();
                if(button.dataset.tab === 'admin-projects') this.loadAdminProjectList();
            });
        });

        // Admin Portal Drop Zone
        listen('admin-drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.add('bg-brand-700'); });
        listen('admin-drop-zone', 'dragleave', e => e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'));
        listen('admin-drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'); this.handleAdminDroppedFiles(e.dataTransfer.files); });
    },
    async populateCombinedProjectList() {
        const container = document.getElementById('combined-project-list');
        const projects = await this.fetchProjectListSummary(); // Use existing function to get list
        container.innerHTML = '';

        if (projects.length === 0) {
            container.innerHTML = '<p class="text-brand-400 text-sm p-2">No saved projects found to combine.</p>';
            document.getElementById('combined-projects-checkbox').checked = false;
            document.getElementById('combined-projects-list-container').classList.add('hidden');
            document.getElementById('single-project-inputs').classList.remove('hidden');
            return;
        }

        projects.forEach(p => {
            const div = document.createElement('div');
            div.className = 'flex items-center p-1 hover:bg-brand-900/50 rounded-md';
            div.innerHTML = `
                <input id="combine-project-${p.id}" type="checkbox" value="${p.id}" class="h-4 w-4 text-accent focus:ring-accent bg-brand-700 border-brand-600 rounded combine-project-checkbox">
                <label for="combine-project-${p.id}" class="ml-2 block text-sm cursor-pointer">${p.name}</label>
            `;
            container.appendChild(div);
        });

        // Add listener to re-enable/disable run button
        container.addEventListener('change', () => {
            const checkedCount = container.querySelectorAll('input[type="checkbox"]:checked').length;
            document.getElementById('run-calculation-btn').disabled = checkedCount === 0;
        });

        // Initially check the run button state
        document.getElementById('run-calculation-btn').disabled = true;
    },
    async saveAdminConfig(button) {
        if (!AppState.firebase.isAdmin) return;
        UI.showLoading(button);

        try {
            const configText = document.getElementById('admin-config-textarea').value.trim();
            if (!configText) {
                UI.showNotification("Config data is empty.", true);
                UI.hideLoading(button);
                return;
            }

            const config = JSON.parse(configText);
            const { db, doc, setDoc } = AppState.firebase.tools;

            // Save to Firebase (use a static ID for config)
            await setDoc(doc(db, "config", "advancedSettings"), {
                bonusTiers: config.bonusTiers || CONSTANTS.DEFAULT_BONUS_TIERS,
                calculationSettings: config.calculationSettings || CONSTANTS.DEFAULT_CALCULATION_SETTINGS,
                countingSettings: config.countingSettings || CONSTANTS.DEFAULT_COUNTING_SETTINGS,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            UI.showNotification("Cloud config settings updated. Users will see changes on next refresh.");
            UI.closeModal('admin-config-upload-modal');
        } catch (error) {
            console.error("Error saving cloud config:", error);
            UI.showNotification(`Error saving config: ${error.message}. Check JSON format.`, true);
        } finally {
            UI.hideLoading(button);
        }
    },
    async handleChatbotSend(input) {
        const chatInput = document.getElementById('chatbot-input');
        const message = input || chatInput.value.trim();
        if (!message) return;

        const chatBody = document.getElementById('chatbot-messages');
        const typingIndicator = document.getElementById('chatbot-typing-indicator');

        // 1. Clear input & add user message
        chatInput.value = '';
        this.addChatMessage(chatBody, 'user', message);

        // 2. Show typing indicator
        typingIndicator.classList.remove('hidden');
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            // 3. Simple static responses (to avoid a complex API call for a simple app)
            let botResponse = '';
            let suggestions = [];
            const lowerCaseMsg = message.toLowerCase();

            if (lowerCaseMsg.includes('hello') || lowerCaseMsg.includes('hi')) {
                botResponse = "Hello! I am the PCS Bonus Calculator Chatbot. How can I assist you with the app today?";
                suggestions = ["What are the default bonus tiers?", "How to use the calculator?", "How do I add a team?"];
            } else if (lowerCaseMsg.includes('bonus tiers') || lowerCaseMsg.includes('quality bonus')) {
                botResponse = "The default bonus tiers range from 77.5% quality (0.05x bonus) up to 100% quality (1.20x bonus). You can view and edit these tiers in the 'Advanced Settings' menu.";
                suggestions = ["Where is Advanced Settings?", "What is the formula for payout?", "Tell me about Fix4."];
            } else if (lowerCaseMsg.includes('formula') || lowerCaseMsg.includes('payout')) {
                botResponse = "The final payout is calculated as: **Total Points * Direct Multiplier * Quality Modifier**. The Quality Modifier is based on the Fix Quality (Fixes / (Fixes + Refixes + Warnings)).";
                suggestions = ["What is a Refix?", "How are points calculated?", "Show my current results."];
            } else if (lowerCaseMsg.includes('team') || lowerCaseMsg.includes('add a team')) {
                botResponse = "You can manage teams by going to the main menu (three dots) and selecting 'Manage Teams'. Here you can add, remove, and update the Tech IDs for each team.";
                suggestions = ["Where is the main menu?", "How to run a combined calculation?", "What is the Tech ID format?"];
            } else if (lowerCaseMsg.includes('fix4')) {
                 botResponse = "Fix4 items are tracked and broken down in the 'TL Summary' card. They are typically RV tasks where the reviewer marked a Fix2/Fix3/Fix4 category as a Miss or Correct, indicating a Fix-level quality issue.";
                 suggestions = ["What is the TL Summary?", "What is a Warning?", "Tell me about QC Points."];
            } else if (lowerCaseMsg.includes('advanced settings') || lowerCaseMsg.includes('settings')) {
                 botResponse = "The Advanced Settings are accessible via the main menu (three dots). You can customize bonus tiers, point values, and counting logic there.";
                 suggestions = ["How to access the main menu?", "How to reset settings?", "What does IR Modifier do?"];
            } else if (lowerCaseMsg.includes('run a combined calculation') || lowerCaseMsg.includes('combine projects')) {
                 botResponse = "To run a combined calculation, check the 'Combine Projects' checkbox in the data panel, then select the saved projects you wish to combine from the list that appears.";
                 suggestions = ["How to save a project?", "What does 'combined' mean?", "How to interpret the results?"];
            } else if (lowerCaseMsg.includes('current results') || lowerCaseMsg.includes('show results')) {
                 const resultsTitle = document.getElementById('results-title')?.textContent;
                 if (AppState.currentTechStats && Object.keys(AppState.currentTechStats).length > 0) {
                     const totalPoints = Object.values(AppState.currentTechStats).reduce((sum, tech) => sum + tech.points, 0);
                     const totalPayout = document.querySelector('.summary-cat-total .summary-item-value')?.textContent || 'N/A';
                     const overallQuality = document.querySelectorAll('.summary-item-value')[3]?.textContent || 'N/A';

                     botResponse = `The current calculation for "${resultsTitle}" shows: Total Points: ${totalPoints.toFixed(3)}, Overall Quality: ${overallQuality}, Estimated Total Payout: ₱${totalPayout}.`;
                 } else {
                     botResponse = "I don't see any calculated results right now. Please load a project and click 'Run Calculation' first.";
                 }
                 suggestions = ["Run a calculation now.", "Why are my results empty?", "What are points?"];
            } else {
                botResponse = "I'm sorry, I couldn't understand that. Could you try asking about a specific feature, like 'bonus tiers', 'teams', or 'calculation formula'?";
                suggestions = ["What are the default bonus tiers?", "How to use the calculator?", "Tell me about Fix4."];
            }

            // 4. Hide typing indicator & add bot message
            setTimeout(() => {
                typingIndicator.classList.add('hidden');
                this.addChatMessage(chatBody, 'bot', botResponse, suggestions);
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 500);

        } catch (error) {
            console.error("Chatbot error:", error);
            typingIndicator.classList.add('hidden');
            this.addChatMessage(chatBody, 'bot', "An internal error occurred. Please try again later.");
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    },
    addChatMessage(chatBody, sender, message, suggestions = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender} flex mb-2 ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <p class="text-xs mb-1 text-brand-400">${sender === 'user' ? 'You' : 'Chatbot'}</p>
                <div class="text-sm">${message}</div>
                ${suggestions.length > 0 ? `<div class="suggestions-container flex flex-wrap gap-2">${suggestions.map(s => `<button class="suggestion-btn">${s}</button>`).join('')}</div>` : ''}
            </div>
        `;
        chatBody.appendChild(messageDiv);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.initialize();
    
    // Initial UI setup
    UI.setPanelHeights();
    
    // Global event listeners for dropdowns/modals
    document.querySelectorAll('[data-dropdown-toggle]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.dataset.dropdownToggle;
            document.getElementById(targetId)?.classList.toggle('hidden');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', e => {
        const dropdown = document.getElementById('main-menu-dropdown');
        const trigger = document.getElementById('main-menu-btn');
        if (dropdown && trigger && !dropdown.classList.contains('hidden')) {
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        }
    });
    
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.fixed');
            if (modal) modal.classList.add('hidden');
        });
    });
    
});
