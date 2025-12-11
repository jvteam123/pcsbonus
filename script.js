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
            // CODE UPDATE: Apply consistent quality color logic (Green >= 95, Orange >= 85, Red < 85)
            let colorClass = quality >= 95 ? 'green' : quality >= 85 ? 'orange' : 'red';
            // END CODE UPDATE
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
        const searchValue = document.getElementById('search-tech-id').value.toUpperCase();
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
    openModal(modalId) { const modal = document.getElementById(modalId); if(modal) modal.classList.remove('hidden'); },
    closeModal(modalId) { const modal = document.getElementById(modalId); if(modal) modal.classList.add('hidden'); },
    generateTechBreakdownHTML(tech) {
        const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
        const fixQuality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
        const qualityModifier = Calculator.calculateQualityModifier(fixQuality);
        const finalPayout = tech.points * (parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1) * qualityModifier;
        
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

        return `<div class="space-y-4 text-sm">${projectBreakdownHTML}<div class="p-3 bg-accent/10 rounded-lg border border-accent/50"><h4 class="font-semibold text-base text-accent mb-2">Final Payout</h4><div class="flex justify-between font-bold text-lg"><span class="text-white">Payout (PHP):</span><span class="text-accent font-mono">${finalPayout.toFixed(2)}</span></div></div>${categoryBreakdownHTML}${qcBreakdownHTML}${i3qaBreakdownHTML}${rvBreakdownHTML}<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Points Breakdown</h4><div class="space-y-1 font-mono"><div class="flex justify-between"><span class="text-brand-400">Fix Tasks:</span><span>${tech.pointsBreakdown.fix.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">QC Tasks:</span><span>${tech.pointsBreakdown.qc.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">i3qa Tasks:</span><span>${tech.pointsBreakdown.i3qa.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">RV Tasks:</span><span>${tech.pointsBreakdown.rv.toFixed(3)}</span></div>${tech.pointsBreakdown.qcTransfer > 0 ? `<div class="flex justify-between"><span class="text-brand-400">QC Transfers:</span><span>+${tech.pointsBreakdown.qcTransfer.toFixed(3)}</span></div>` : ''}<div class="flex justify-between border-t border-brand-600 mt-1 pt-1"><span class="text-white font-bold">Total Points:</span><span class="text-white font-bold">${tech.points.toFixed(3)}</span></div></div></div><div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Core Stats & Quality</h4><div class="space-y-1 font-mono"><div class="flex justify-between"><span class="text-brand-400">Fix Tasks:</span><span>${tech.fixTasks}</span></div><div class="flex justify-between"><span class="text-brand-400">Refix Tasks:</span><span class="${tech.refixTasks > 0 ? 'text-red-400' : ''}">${tech.refixTasks}</span></div><div class="flex justify-between"><span class="text-brand-400">Warnings:</span><span class="${tech.warnings.length > 0 ? 'text-red-400' : ''}">${tech.warnings.length}</span></div><div class="flex justify-between border-t border-brand-600 mt-1 pt-1"><span class="text-white font-bold">Quality:</span><span class="text-white font-bold">${fixQuality.toFixed(2)}%</span></div></div></div><div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Warnings & Penalties</h4>${tech.warnings.length > 0 ? `<ul class="list-disc list-inside text-sm text-red-400">${tech.warnings.map(w => `<li>${w}</li>`).join('')}</ul>` : `<p class="text-brand-400 text-sm">No recorded warnings.</p>`}</div></div>`;
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
        ['#bonus-payout-section', '#tl-summary-card', '#quick-summary-section'].forEach(id => document.querySelector(id)?.classList.add('hidden'));
        document.getElementById('tech-results-tbody').innerHTML = '';
        document.getElementById('leaderboard-body').innerHTML = `<tr><td class="p-4 text-center text-brand-400" colspan="3">Calculate results to see data.</td></tr>`;
        document.getElementById('team-quality-container').innerHTML = '';
        document.getElementById('fix4-breakdown-container').innerHTML = '';
    },
    generateTeamBreakdownHTML(teamName, teamTechs, techStats, projectName) {
        const teamStats = teamTechs.map(id => techStats[id]).filter(Boolean);
        if (teamStats.length === 0) return `<p class="text-center p-4">No data found for team ${teamName} in project ${projectName}.</p>`;

        const teamSummary = teamStats.reduce((acc, tech) => {
            acc.totalPoints += tech.points;
            acc.totalFixTasks += tech.fixTasks;
            acc.totalRefixTasks += tech.refixTasks;
            acc.totalWarnings += tech.warnings.length;
            const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
            acc.totalQuality += denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
            return acc;
        }, { totalPoints: 0, totalFixTasks: 0, totalRefixTasks: 0, totalWarnings: 0, totalQuality: 0 });

        const avgQuality = teamSummary.totalQuality / teamStats.length;
        const totalQualityDenominator = teamStats.reduce((sum, tech) => sum + tech.fixTasks + tech.refixTasks + tech.warnings.length, 0);
        const overallQuality = (teamSummary.totalFixTasks / totalQualityDenominator) * 100;

        let breakdownTableRows = teamStats.sort((a, b) => b.points - a.points).map(tech => {
            const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
            const quality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
            const qualityPill = `<span class="quality-pill ${quality >= 95 ? 'quality-pill-green' : quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${quality.toFixed(2)}%</span>`;
            return `<tr><td class="p-2">${tech.id}</td><td class="p-2 text-center">${tech.points.toFixed(2)}</td><td class="p-2 text-center">${tech.fixTasks}</td><td class="p-2 text-center">${tech.refixTasks}</td><td class="p-2 text-center">${qualityPill}</td></tr>`;
        }).join('');

        let html = `
            <div class="space-y-4 text-sm">
                <div class="grid grid-cols-2 gap-3 p-3 bg-brand-900/50 rounded-lg border border-brand-700">
                    <div class="summary-item">Total Points:<span class="font-mono">${teamSummary.totalPoints.toFixed(2)}</span></div>
                    <div class="summary-item">Total Fix Tasks:<span class="font-mono">${teamSummary.totalFixTasks}</span></div>
                    <div class="summary-item">Total Refix Tasks:<span class="font-mono ${teamSummary.totalRefixTasks > 0 ? 'text-red-400' : ''}">${teamSummary.totalRefixTasks}</span></div>
                    <div class="summary-item">Total Warnings:<span class="font-mono ${teamSummary.totalWarnings > 0 ? 'text-red-400' : ''}">${teamSummary.totalWarnings}</span></div>
                    <div class="summary-item col-span-2 border-t border-brand-600 pt-2 font-bold text-accent">Average Individual Quality:<span class="font-mono">${avgQuality.toFixed(2)}%</span></div>
                </div>
                
                <h4 class="font-semibold text-base text-white mb-2">Individual Performance Breakdown</h4>
                <div class="table-container text-sm">
                    <table class="min-w-full">
                        <thead class="bg-brand-800/70">
                            <tr><th>Tech ID</th><th class="text-center">Points</th><th class="text-center">Fix</th><th class="text-center">Refix</th><th class="text-center">Quality</th></tr>
                        </thead>
                        <tbody>${breakdownTableRows}</tbody>
                    </table>
                </div>
            </div>
        `;
        return html;
    }
};

const Calculator = {
    createNewTechStat(isCombined = false) {
        return {
            id: '', isCombined, projectName: '',
            points: 0, fixTasks: 0, afpTasks: 0, qcTasks: 0, i3qaTasks: 0, rvTasks: 0, refixTasks: 0,
            warnings: [], fix4: [],
            pointsBreakdown: { fix: 0, qc: 0, i3qa: 0, rv: 0, qcTransfer: 0 },
            pointsBreakdownByProject: {},
            categoryCounts: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {} }
        };
    },
    parseRawData(tsvData, isIRProject, projectName, gsdValue) {
        const lines = tsvData.split('\n').filter(line => line.trim() !== '');
        if (lines.length <= 1) return null;
        const headers = lines[0].toLowerCase().split('\t');
        const data = lines.slice(1).map(line => {
            const values = line.split('\t');
            const row = {};
            headers.forEach((header, i) => { row[header] = values[i]; });
            return row;
        });

        const techStats = {};
        const get = (row, column) => row[column.toLowerCase()] || '';

        data.forEach(row => {
            const techId = get(row, 'fix_id')?.trim().toUpperCase();
            if (!techId || !CONSTANTS.TECH_ID_REGEX.test(techId)) return;
            if (!techStats[techId]) { techStats[techId] = this.createNewTechStat(false); techStats[techId].id = techId; techStats[techId].projectName = projectName; }
            const tech = techStats[techId];

            // --- 1. Fix Task and Category Counting (Primary Tasks) ---
            const gsd = get(row, 'gsd')?.trim().toLowerCase() || gsdValue;
            const category = parseInt(get(row, 'cat'));
            const isAFP = get(row, 'job_type')?.trim().toLowerCase() === 'afp';
            const isI3QA = AppState.countingSettings.taskColumns.i3qa.some(col => get(row, col).trim());
            const hasFixId = !!get(row, 'fix_id')?.trim();

            if (hasFixId) {
                tech.fixTasks++;
                if (isAFP) tech.afpTasks++;
                if (isI3QA) tech.i3qaTasks++;

                if (!isNaN(category) && category >= 1 && category <= 9) {
                    const type = isAFP ? 'afp' : isI3QA ? 'i3qa' : 'primary';
                    tech.categoryCounts[category][type] = (tech.categoryCounts[category][type] || 0) + 1;
                    
                    const pointValue = AppState.calculationSettings.categoryValues[category]?.[gsd] || 0;
                    tech.pointsBreakdown.fix += pointValue * (isIRProject ? AppState.calculationSettings.irModifierValue : 1);
                }
            }

            // --- 2. QC Task Counting ---
            if (AppState.countingSettings.taskColumns.qc.some(col => get(row, col).trim().toUpperCase() === techId)) {
                tech.qcTasks++;
                tech.pointsBreakdown.qc += AppState.calculationSettings.points.qc;
            }

            // --- 3. RV Task Counting ---
            const rvColumns = ['rv1_id', 'rv2_id'];
            const rvLabels = ['rv1_label', 'rv2_label', 'rv3_label'];
            const isRv1 = get(row, rvColumns[0]).trim().toUpperCase() === techId;
            const isRv2 = get(row, rvColumns[1]).trim().toUpperCase() === techId;

            if (isRv1 || isRv2) {
                tech.rvTasks++;
                let rvPoints = 0;
                let isCombo = false;
                if (isRv1 && isRv2) {
                    rvPoints = AppState.calculationSettings.points.rv1_combo;
                    isCombo = true;
                } else if (isRv1) {
                    rvPoints = AppState.calculationSettings.points.rv1;
                } else if (isRv2) {
                    rvPoints = AppState.calculationSettings.points.rv2;
                }
                tech.pointsBreakdown.rv += rvPoints;
            }

            // --- 4. Refix/Miss/Warning Counting ---
            const triggers = AppState.countingSettings.triggers;
            const checkLabel = (labels, columns) => columns.some(col => labels.includes(get(row, col).trim().toLowerCase()));

            // Refix
            if (checkLabel(triggers.refix.labels, triggers.refix.columns) && hasFixId) {
                tech.refixTasks++;
            }

            // Warnings/Penalties
            const allWarningColumns = ['r1_warn', 'r2_warn', 'r3_warn', 'r4_warn'];
            allWarningColumns.forEach(warnCol => {
                const warningValue = get(row, warnCol)?.trim();
                if (triggers.warning.labels.includes(warningValue.toLowerCase())) {
                    tech.warnings.push(`${warnCol.toUpperCase()}: ${warningValue}`);
                }
            });

            // QC Penalty/Transfer
            if (checkLabel(triggers.qcPenalty.labels, triggers.qcPenalty.columns)) {
                const qcId = AppState.countingSettings.taskColumns.qc.map(col => get(row, col)?.trim().toUpperCase()).find(id => id && CONSTANTS.TECH_ID_REGEX.test(id));
                if (qcId && techStats[qcId]) {
                    const penalty = AppState.calculationSettings.points.qc * -1;
                    techStats[qcId].pointsBreakdown.qc += penalty;
                    tech.pointsBreakdown.qcTransfer += penalty * -1; // Transfer the penalty point to the person who got penalized
                }
            }

            // --- 5. Fix4 for TL Summary ---
            const fix4Id = get(row, 'fix4_id')?.trim().toUpperCase();
            if (fix4Id && techStats[fix4Id]) {
                const cat = parseInt(get(row, 'rv3_cat'));
                if (!isNaN(cat) && get(row, 'rv3_cat')?.trim()) techStats[fix4Id].fix4.push({ category: cat });
            }
        });

        // --- Final Point Tally ---
        Object.values(techStats).forEach(tech => {
            tech.points = tech.pointsBreakdown.fix + tech.pointsBreakdown.qc + tech.pointsBreakdown.i3qa + tech.pointsBreakdown.rv + tech.pointsBreakdown.qcTransfer;
        });

        return { techStats };
    },
    calculateQualityModifier(qualityRate) {
        return AppState.bonusTiers.find(tier => qualityRate >= tier.quality)?.bonus || 0;
    }
};

const Handlers = {
    async initializeApp() {
        await DB.open();
        dayjs.extend(window.dayjs_plugin_relativeTime);
        Handlers.setupEventListeners();
        document.body.classList.toggle('light-theme', localStorage.getItem('theme') === 'light');
        this.initializeFirebase();
        await Promise.all([
            Handlers.fetchProjectListSummary(),
            Handlers.loadTeamSettings(),
            Handlers.loadBonusTiers(),
            Handlers.loadCalculationSettings(),
            Handlers.loadCountingSettings()
        ]);

        const hasBeenSetup = await DB.get('settings', 'hasBeenSetup');
        if (!hasBeenSetup) {
            this.startGuidedSetup();
        }

        UI.setPanelHeights();
        window.UI = UI;
    },
    initializeFirebase() {
        if (window.firebaseTools) {
            AppState.firebase.tools = window.firebaseTools;
            this.checkAdminAuthState();
            this.listenForUpdates();
            this.logVisitor();
        } else {
            console.error("Firebase is not initialized. Make sure the config script is in index.html");
        }
    },
    async handleAdminLogin() {
        const { auth, provider, signInWithPopup } = AppState.firebase.tools;
        try {
            const result = await signInWithPopup(auth, provider);
            // FIX: Check if the user's email is IN the ADMIN_EMAIL array.
            if (CONSTANTS.ADMIN_EMAIL.includes(result.user.email)) {
                AppState.firebase.isAdmin = true;
                this.updateAdminUI(true);
            } else {
                alert("Access Denied: This account is not authorized for admin access.");
                auth.signOut();
            }
        } catch (error) {
            console.error("Admin login error:", error);
            alert("An error occurred during sign-in.");
        }
    },
    handleAdminLogout() {
        AppState.firebase.tools.auth.signOut();
    },
    checkAdminAuthState() {
        const { auth, onAuthStateChanged } = AppState.firebase.tools;
        onAuthStateChanged(auth, (user) => {
            // FIX: Check if the user's email is IN the ADMIN_EMAIL array.
            const isAdmin = user && CONSTANTS.ADMIN_EMAIL.includes(user.email);
            AppState.firebase.isAdmin = isAdmin;
            this.updateAdminUI(isAdmin);
        });
    },
    updateAdminUI(isAdmin) {
        document.getElementById('admin-google-signin-btn').classList.toggle('hidden', isAdmin);
        document.getElementById('admin-logout-btn').classList.toggle('hidden', !isAdmin);
        document.getElementById('admin-panel-view').classList.toggle('hidden', !isAdmin);
        document.getElementById('admin-login-message').classList.toggle('hidden', isAdmin);
    },
    async loadVisitorLog() {
        const logTbody = document.getElementById('visitor-log-tbody');
        logTbody.innerHTML = '<tr><td colspan="3" class="text-center p-4">Loading logs...</td></tr>';
        try {
            const { db, collection, getDocs, query, orderBy } = AppState.firebase.tools;
            const q = query(collection(db, "visitors"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                logTbody.innerHTML = '<tr><td colspan="3" class="text-center p-4">No visitor logs found.</td></tr>';
                return;
            }
            let logsHTML = '';
            querySnapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const date = dayjs(data.timestamp.toDate()).format('YYYY-MM-DD HH:mm:ss');
                const relative = dayjs(data.timestamp.toDate()).fromNow();
                logsHTML += `<tr><td class="p-2">${index + 1}</td><td class="p-2">${date} (${relative})</td><td class="p-2 truncate" title="${data.userAgent}">${data.userAgent}</td></tr>`;
            });
            logTbody.innerHTML = logsHTML;
        } catch (error) {
            console.error("Error loading visitor logs:", error);
            logTbody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-red-400">Error: Could not load logs.</td></tr>`;
        }
    },
    async logVisitor() {
        try {
            const { db, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } = AppState.firebase.tools;
            await addDoc(collection(db, "visitors"), { timestamp: new Date(), userAgent: navigator.userAgent });
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
        const saved = await DB.get('countingSettings', 'customCounting');
        AppState.countingSettings = saved ? { ...CONSTANTS.DEFAULT_COUNTING_SETTINGS, ...saved.settings, triggers: { ...CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers, ...saved.settings.triggers } } : JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_COUNTING_SETTINGS));
    },
    async saveAdvanceSettings() {
        const button = document.getElementById('save-advance-settings-btn');
        UI.showLoading(button);

        const newTiers = Array.from(document.querySelectorAll('#bonus-tier-editor-container .tier-row'))
            .map(row => ({ quality: parseFloat(row.querySelector('.tier-quality-input').value), bonus: parseFloat(row.querySelector('.tier-bonus-input').value) / 100 }))
            .filter(t => !isNaN(t.quality) && !isNaN(t.bonus) && t.quality >= 0 && t.bonus >= 0)
            .sort((a, b) => b.quality - a.quality);

        if (newTiers.length === 0) {
            UI.showNotification("Cannot save: At least one valid bonus tier is required.", true);
            UI.hideLoading(button);
            return;
        }

        const newCalcSettings = {
            irModifierValue: parseFloat(document.getElementById('setting-ir-modifier').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.irModifierValue,
            points: {
                qc: parseFloat(document.getElementById('setting-qc-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.qc,
                i3qa: parseFloat(document.getElementById('setting-i3qa-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.i3qa,
                rv1: parseFloat(document.getElementById('setting-rv1-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.rv1,
                rv1_combo: parseFloat(document.getElementById('setting-rv1-combo-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.rv1_combo,
                rv2: parseFloat(document.getElementById('setting-rv2-points').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.rv2
            },
            categoryValues: {}
        };

        document.querySelectorAll('#category-points-tbody tr').forEach(row => {
            const cat = parseInt(row.dataset.category);
            newCalcSettings.categoryValues[cat] = {
                "3in": parseFloat(row.querySelector('.cat-3in').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.categoryValues[cat]['3in'],
                "4in": parseFloat(row.querySelector('.cat-4in').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.categoryValues[cat]['4in'],
                "6in": parseFloat(row.querySelector('.cat-6in').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.categoryValues[cat]['6in'],
                "9in": parseFloat(row.querySelector('.cat-9in').value) || CONSTANTS.DEFAULT_CALCULATION_SETTINGS.categoryValues[cat]['9in']
            };
        });

        const getValues = id => document.getElementById(id).value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const newCountingSettings = {
            taskColumns: {
                qc: getValues('setting-qc-columns'),
                i3qa: getValues('setting-i3qa-columns'),
                rv1: getValues('setting-rv1-columns'),
                rv2: getValues('setting-rv2-columns')
            },
            triggers: {
                refix: { labels: getValues('setting-refix-labels'), columns: getValues('setting-refix-columns') },
                miss: { labels: getValues('setting-miss-labels'), columns: getValues('setting-miss-columns') },
                warning: { labels: getValues('setting-warning-labels'), columns: getValues('setting-warning-columns') },
                qcPenalty: { labels: getValues('setting-qc-penalty-labels'), columns: getValues('setting-qc-penalty-columns') }
            }
        };

        await Promise.all([
            DB.put('bonusTiers', { id: 'customTiers', tiers: newTiers }),
            DB.put('calculationSettings', { id: 'customSettings', settings: newCalcSettings }),
            DB.put('countingSettings', { id: 'customCounting', settings: newCountingSettings })
        ]);

        [AppState.bonusTiers, AppState.calculationSettings, AppState.countingSettings] = [newTiers, newCalcSettings, newCountingSettings];

        UI.showNotification("Advance settings saved.");
        UI.closeModal('advance-settings-modal');
        UI.hideLoading(button);
    },
    populateAdvanceSettingsEditor() {
        const container = document.getElementById('advance-settings-body');
        container.innerHTML = `<div class="flex items-center gap-2 border-b border-brand-700 mb-4"><button class="tab-button active" data-tab="bonus-tiers">Bonus Tiers</button><button class="tab-button" data-tab="points">Points</button><button class="tab-button" data-tab="counting">Counting Logic</button></div><div id="tab-bonus-tiers" class="tab-content active"><div id="bonus-tier-editor-container" class="space-y-2"></div><button id="add-tier-btn" class="btn-secondary mt-4">Add Tier</button></div><div id="tab-points" class="tab-content"><div class="space-y-4"><div><label for="setting-ir-modifier">IR Modifier</label><input type="number" step="0.1" id="setting-ir-modifier" class="input-field w-full mt-1"></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div><label for="setting-qc-points">QC</label><input type="number" step="0.01" id="setting-qc-points" class="input-field w-full mt-1"></div><div><label for="setting-i3qa-points">i3QA</label><input type="number" step="0.01" id="setting-i3qa-points" class="input-field w-full mt-1"></div><div><label for="setting-rv1-points">RV1</label><input type="number" step="0.01" id="setting-rv1-points" class="input-field w-full mt-1"></div><div><label for="setting-rv1-combo-points">RV1 Combo</label><input type="number" step="0.01" id="setting-rv1-combo-points" class="input-field w-full mt-1"></div><div><label for="setting-rv2-points">RV2</label><input type="number" step="0.01" id="setting-rv2-points" class="input-field w-full mt-1"></div></div><div class="table-container text-sm border border-brand-700 rounded-md"><table class="min-w-full"><thead class="bg-brand-800"><tr><th>Category</th><th>3in</th><th>4in</th><th>6in</th><th>9in</th></tr></thead><tbody id="category-points-tbody"></tbody></table></div></div></div><div id="tab-counting" class="tab-content"><div class="space-y-4"><h5 class="font-bold text-white">Task Columns (Comma-separated column names)</h5><div class="grid grid-cols-2 gap-4"><div><label for="setting-qc-columns">QC</label><input type="text" id="setting-qc-columns" class="input-field w-full mt-1"></div><div><label for="setting-i3qa-columns">i3QA</label><input type="text" id="setting-i3qa-columns" class="input-field w-full mt-1"></div><div><label for="setting-rv1-columns">RV1</label><input type="text" id="setting-rv1-columns" class="input-field w-full mt-1"></div><div><label for="setting-rv2-columns">RV2</label><input type="text" id="setting-rv2-columns" class="input-field w-full mt-1"></div></div><h5 class="font-bold text-white mt-4">Triggers (Comma-separated labels/columns)</h5><div class="grid grid-cols-2 gap-4"><div><label for="setting-refix-labels">Refix Labels</label><input type="text" id="setting-refix-labels" class="input-field w-full mt-1"></div><div><label for="setting-refix-columns">Refix Columns</label><input type="text" id="setting-refix-columns" class="input-field w-full mt-1"></div><div><label for="setting-miss-labels">Miss Labels</label><input type="text" id="setting-miss-labels" class="input-field w-full mt-1"></div><div><label for="setting-miss-columns">Miss Columns</label><input type="text" id="setting-miss-columns" class="input-field w-full mt-1"></div><div><label for="setting-warning-labels">Warning Labels</label><input type="text" id="setting-warning-labels" class="input-field w-full mt-1"></div><div><label for="setting-warning-columns">Warning Columns</label><input type="text" id="setting-warning-columns" class="input-field w-full mt-1"></div><div><label for="setting-qc-penalty-labels">QC Penalty Labels</label><input type="text" id="setting-qc-penalty-labels" class="input-field w-full mt-1"></div><div><label for="setting-qc-penalty-columns">QC Penalty Columns</label><input type="text" id="setting-qc-penalty-columns" class="input-field w-full mt-1"></div></div><button id="reset-advance-settings-btn" class="btn-secondary-danger mt-4">Reset to Defaults</button></div></div>`;
        
        // Populate Bonus Tiers
        const tierContainer = document.getElementById('bonus-tier-editor-container');
        AppState.bonusTiers.forEach(tier => this.addTierRow(tierContainer, tier.quality, tier.bonus * 100));
        document.getElementById('add-tier-btn').addEventListener('click', () => this.addTierRow(tierContainer));

        // Populate Points
        document.getElementById('setting-ir-modifier').value = AppState.calculationSettings.irModifierValue;
        document.getElementById('setting-qc-points').value = AppState.calculationSettings.points.qc;
        document.getElementById('setting-i3qa-points').value = AppState.calculationSettings.points.i3qa;
        document.getElementById('setting-rv1-points').value = AppState.calculationSettings.points.rv1;
        document.getElementById('setting-rv1-combo-points').value = AppState.calculationSettings.points.rv1_combo;
        document.getElementById('setting-rv2-points').value = AppState.calculationSettings.points.rv2;

        const categoryTbody = document.getElementById('category-points-tbody');
        for (let i = 1; i <= 9; i++) {
            const values = AppState.calculationSettings.categoryValues[i] || {};
            const row = document.createElement('tr');
            row.dataset.category = i;
            row.innerHTML = `
                <td class="p-2 font-semibold">Category ${i}</td>
                <td><input type="number" step="0.01" class="input-field w-full mt-1 cat-3in text-center" value="${values['3in'] ?? 0}"></td>
                <td><input type="number" step="0.01" class="input-field w-full mt-1 cat-4in text-center" value="${values['4in'] ?? 0}"></td>
                <td><input type="number" step="0.01" class="input-field w-full mt-1 cat-6in text-center" value="${values['6in'] ?? 0}"></td>
                <td><input type="number" step="0.01" class="input-field w-full mt-1 cat-9in text-center" value="${values['9in'] ?? 0}"></td>
            `;
            categoryTbody.appendChild(row);
        }

        // Populate Counting Logic
        document.getElementById('setting-qc-columns').value = AppState.countingSettings.taskColumns.qc.join(', ');
        document.getElementById('setting-i3qa-columns').value = AppState.countingSettings.taskColumns.i3qa.join(', ');
        document.getElementById('setting-rv1-columns').value = AppState.countingSettings.taskColumns.rv1.join(', ');
        document.getElementById('setting-rv2-columns').value = AppState.countingSettings.taskColumns.rv2.join(', ');

        document.getElementById('setting-refix-labels').value = AppState.countingSettings.triggers.refix.labels.join(', ');
        document.getElementById('setting-refix-columns').value = AppState.countingSettings.triggers.refix.columns.join(', ');
        document.getElementById('setting-miss-labels').value = AppState.countingSettings.triggers.miss.labels.join(', ');
        document.getElementById('setting-miss-columns').value = AppState.countingSettings.triggers.miss.columns.join(', ');
        document.getElementById('setting-warning-labels').value = AppState.countingSettings.triggers.warning.labels.join(', ');
        document.getElementById('setting-warning-columns').value = AppState.countingSettings.triggers.warning.columns.join(', ');
        document.getElementById('setting-qc-penalty-labels').value = AppState.countingSettings.triggers.qcPenalty.labels.join(', ');
        document.getElementById('setting-qc-penalty-columns').value = AppState.countingSettings.triggers.qcPenalty.columns.join(', ');

        // Setup tab switching
        document.querySelectorAll('#advance-settings-body .tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('#advance-settings-body .tab-button, .tab-content').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
            });
        });
    },
    addTierRow(container, quality = 90, bonus = 0) {
        const row = document.createElement('div');
        row.className = 'tier-row flex gap-2 items-center';
        row.innerHTML = `<input type="number" step="0.1" class="tier-quality-input input-field w-1/2" placeholder="Quality %" value="${quality}"><span class="text-white">>=</span><input type="number" step="1" class="tier-bonus-input input-field w-1/2" placeholder="Bonus %" value="${bonus}"><span class="text-white">%</span><button class="delete-tier-btn control-btn-icon-danger ml-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>`;
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
        await DB.put('teams', { id: 'teams', settings: newSettings });
        UI.showNotification("Team settings saved.");
        AppState.teamSettings = newSettings;
        UI.populateTeamFilters();
        UI.closeModal('manage-teams-modal');
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
        UI.populateProjectSelect(projects.map(p => ({ id: p.id, name: p.name })).sort((a, b) => (b.projectOrder || 0) - (a.projectOrder || 0)));
    },
    async fetchFullProjectData(projectId) {
        const data = await DB.get('projects', projectId);
        if (data && data.rawData) {
            const binary_string = atob(data.rawData);
            const len = binary_string.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            try {
                const decompressedData = pako.inflate(bytes, { to: 'string' });
                return { ...data, rawData: decompressedData };
            } catch (e) {
                console.error("Error decompressing project data:", e);
                UI.showNotification("Error loading project data.", true);
                return null;
            }
        }
        return data;
    },
    async loadProjectIntoForm(projectId) {
        const data = await this.fetchFullProjectData(projectId);
        const nameInput = document.getElementById('project-name');
        const dataTextarea = document.getElementById('techData');
        const irCheckbox = document.getElementById('is-ir-project-checkbox');
        const gsdSelect = document.getElementById('gsd-value-select');

        if (data) {
            nameInput.value = data.name || '';
            dataTextarea.value = data.rawData || '';
            irCheckbox.checked = data.isIRProject || false;
            gsdSelect.value = data.gsdValue || '3in';

            // Disable editing for loaded projects
            dataTextarea.disabled = true;
            irCheckbox.disabled = true;
            document.getElementById('gsd-value-select').disabled = true;

            // Update calculation button
            document.getElementById('run-calculation-btn').textContent = 'Recalculate Project';
        } else {
            nameInput.value = '';
            dataTextarea.value = '';
            irCheckbox.checked = false;
            gsdSelect.value = '3in';

            // Enable editing for a blank form
            dataTextarea.disabled = false;
            irCheckbox.disabled = false;
            document.getElementById('gsd-value-select').disabled = false;

            // Update calculation button
            document.getElementById('run-calculation-btn').textContent = 'Run Calculation';
        }

        // Reset display
        document.getElementById('results-title').textContent = projectId ? `Bonus Payouts for: ${data?.name || projectId}` : `Bonus Payouts: No Project Selected`;
        UI.resetUIForNewCalculation();
    },
    async handleDroppedFiles(files) {
        const fileGroups = {};
        for (const file of files) {
            const parts = file.name.split('.');
            const ext = parts.pop().toLowerCase();
            const baseName = parts.join('.');
            if (ext === 'shp' || ext === 'dbf') {
                if (!fileGroups[baseName]) fileGroups[baseName] = {};
                fileGroups[baseName][ext] = file;
            }
        }

        const allFeatures = [];
        let count = 0;
        // --- START BUG FIX for shapefile read ---
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

            document.getElementById('techData').value = tsv;
            // FIX: Explicitly ensure the IR checkbox is unchecked after processing files
            document.getElementById('is-ir-project-checkbox').checked = false;
            UI.showNotification(`${count} shapefile set(s) processed.`);
        } else {
            alert("No valid .shp/.dbf pairs found, or all files were empty.");
        }
    },
    async handleAdminDroppedFiles(files) {
        const fileGroups = {};
        for (const file of files) {
            const parts = file.name.split('.');
            const ext = parts.pop().toLowerCase();
            const baseName = parts.join('.');
            if (ext === 'shp' || ext === 'dbf') {
                if (!fileGroups[baseName]) fileGroups[baseName] = {};
                fileGroups[baseName][ext] = file;
            }
        }

        const allFeatures = [];
        let count = 0;
        for (const group of Object.values(fileGroups)) {
            if (group.shp && group.dbf) {
                try {
                    const geojson = await shapefile.read(await group.shp.arrayBuffer(), await group.dbf.arrayBuffer());
                    if (geojson && geojson.features && geojson.features.length > 0) {
                        allFeatures.push(...geojson.features);
                        count++;
                    } else if (geojson && geojson.features && geojson.features.length === 0) {
                        console.warn(`Shapefile pair for ${group.shp.name.split('.')[0]} was successfully parsed but contained no features.`);
                    }
                } catch (e) {
                    console.error("Error parsing shapefile pair for admin:", e);
                    UI.showNotification(`Error processing admin file pair ${group.shp.name.split('.')[0]}. Please check file integrity.`, true);
                }
            }
        }

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
                DB.delete('countingSettings', 'customCounting')
            ]);
            this.populateAdvanceSettingsEditor();
            UI.showNotification("Settings have been reset to defaults locally.");
        }
    },
    startGuidedSetup() {
        AppState.guidedSetup.currentStep = 1;
        this.updateGuidedSetupView();
        
        const teamContainer = document.getElementById('setup-team-list');
        teamContainer.innerHTML = '';
        Object.entries(CONSTANTS.DEFAULT_TEAMS).forEach(([teamName, techIds]) => UI.addTeamCard(teamName, techIds, 'setup-team-list'));

        UI.openModal('guided-setup-modal');
    },
    updateGuidedSetupView() {
        const stepContainer = document.getElementById('guided-setup-step-content');
        const stepTitle = document.getElementById('setup-step-title');
        const stepNumber = document.getElementById('setup-step-number');
        const totalSteps = AppState.guidedSetup.totalSteps;
        const currentStep = AppState.guidedSetup.currentStep;

        stepNumber.textContent = `${currentStep} / ${totalSteps}`;

        document.getElementById('setup-prev-btn').classList.toggle('hidden', currentStep === 1);
        document.getElementById('setup-next-btn').classList.toggle('hidden', currentStep === totalSteps);
        document.getElementById('setup-finish-btn').classList.toggle('hidden', currentStep !== totalSteps);

        let content = '';
        let tourElements = [];

        switch (currentStep) {
            case 1:
                stepTitle.textContent = 'Welcome & Teams Setup';
                content = `
                    <p class="mb-3">Welcome to the Bonus Calculator! Let's get you set up. The first step is to configure your **Teams**.</p>
                    <p class="mb-3">Below are the default teams and their Tech IDs. **You must save your team configuration** before proceeding. Add, edit, or delete teams as needed.</p>
                    <div id="setup-team-list" class="space-y-4"></div>
                    <button id="setup-add-team-btn" class="btn-secondary mt-4">Add New Team</button>
                    <p class="mt-4 text-sm text-brand-300">*(This is a mandatory step. If you do not have teams, create a single team named 'All' and add all Tech IDs.)*</p>
                `;
                break;
            case 2:
                stepTitle.textContent = 'The UI: Quick Tour';
                content = `<p class="mb-3">Before we move on, here is a quick overview of the main features in the application.</p><div class="flex justify-center"><button id="start-tour-btn" class="btn-primary">Start Quick Tour</button></div>`;
                tourElements = [
                    { id: 'data-projects-panel', text: 'This is the **Data & Projects Panel**. Here you load your data (via drag-and-drop, pasting, or IndexedDB projects) and run the calculation.' },
                    { id: 'leaderboard-panel', text: 'This is the **Leaderboard**. It shows the top performers based on selected metrics (Points, Tasks, or Quality).' },
                    { id: 'tech-results-table', text: 'This is the **Results Table**. It displays the calculated points, quality, and final payout for each technician.' },
                    { id: 'tl-summary-card', text: 'This is the **Team Lead Summary**. It shows team-level quality and Fix4 breakdown by category for filtered teams.' },
                    { id: 'quick-summary-section', text: 'This is the **Quick Summary**. It highlights the top performers in key metrics.' },
                ];
                break;
            case 3:
                stepTitle.textContent = 'Data Import';
                content = `<p class="mb-3">There are three ways to import data for calculation:</p>
                    <ul class="list-disc list-inside space-y-2 ml-4">
                        <li>**Drag & Drop Shapefiles:** Drop a matching **.shp** and **.dbf** file pair into the drop zone. The app will automatically convert it to TSV.</li>
                        <li>**Paste TSV/CSV Data:** Paste raw data directly into the text area.</li>
                        <li>**Load Saved Project:** Select a previously saved project from the dropdown.</li>
                    </ul>
                    <p class="mt-4 text-brand-300 text-sm">*(Note: You can only save projects from the **Admin Portal**.)*</p>
                `;
                break;
            case 4:
                stepTitle.textContent = 'Finish Setup';
                content = `<p class="mb-3">You are now ready to use the Bonus Calculator!</p><p>Click **Finish Setup** to save your team settings and close this wizard. You can always manage your teams later in the **Manage Teams** modal.</p>`;
                break;
        }

        stepContainer.innerHTML = content;

        if (currentStep === 1) {
            Object.entries(AppState.teamSettings).forEach(([teamName, techIds]) => UI.addTeamCard(teamName, techIds, 'setup-team-list'));
            document.getElementById('setup-add-team-btn').addEventListener('click', () => UI.addTeamCard('', [], 'setup-team-list'));
        }
        
        if (currentStep === 2) {
            AppState.guidedSetup.tourElements = tourElements;
            document.getElementById('start-tour-btn').addEventListener('click', () => this.startTour(currentStep));
        }

    },
    startTour(tourStartStep) {
        AppState.guidedSetup.currentStep = tourStartStep;
        AppState.guidedSetup.tourStep = 0;
        this.runTourStep();
    },
    runTourStep() {
        const { tourStep, tourElements } = AppState.guidedSetup;
        this.clearSpotlight();

        if (tourStep >= tourElements.length) {
            AppState.guidedSetup.currentStep = 3;
            this.updateGuidedSetupView();
            UI.openModal('guided-setup-modal');
            return;
        }

        const { id, text } = tourElements[tourStep];
        const element = document.getElementById(id);
        this.spotlightElement(element, text);
    },
    spotlightElement(element, text) {
        const overlay = document.getElementById('spotlight-overlay');
        overlay.classList.remove('hidden');
        element.classList.add('spotlight');

        const tooltip = document.createElement('div');
        tooltip.id = 'spotlight-tooltip';
        tooltip.className = 'spotlight-tooltip bottom';
        tooltip.innerHTML = `${text}<div class="flex justify-end mt-4 gap-2"><button id="tour-next-btn" class="btn-primary">Next</button></div>`;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;

        document.getElementById('tour-next-btn').onclick = () => {
            AppState.guidedSetup.tourStep++;
            this.runTourStep();
        };
    },
    clearSpotlight() {
        document.getElementById('spotlight-overlay').classList.add('hidden');
        document.querySelector('.spotlight')?.classList.remove('spotlight');
        document.getElementById('spotlight-tooltip')?.remove();
    },
    async finishGuidedSetup() {
        await this.saveTeamSettings('setup-team-list');
        await DB.put('settings', { id: 'hasBeenSetup', value: true });
        UI.closeModal('guided-setup-modal');
        UI.showNotification("Setup complete. Welcome!");
    },
    async loadAdminProjectList() {
        const { db, collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } = AppState.firebase.tools;
        const tbody = document.getElementById('admin-project-list-tbody');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading projects...</td></tr>';
        try {
            const q = query(collection(db, "projects"), orderBy("projectOrder", "desc"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No cloud projects found.</td></tr>';
                return;
            }

            let projectsHTML = '';
            querySnapshot.docs.forEach((doc) => {
                const project = doc.data();
                const id = doc.id;
                const date = dayjs(project.projectOrder).format('YYYY-MM-DD');
                const isReleased = project.isReleased ? 'Yes' : 'No';
                
                projectsHTML += `<tr data-project-id="${id}">
                    <td class="p-2">${project.name}</td>
                    <td class="p-2">${date}</td>
                    <td class="p-2">${project.gsdValue}</td>
                    <td class="p-2 text-center">
                        <input type="checkbox" class="is-released-checkbox h-4 w-4 text-accent focus:ring-accent bg-brand-700 border-brand-600 rounded" ${project.isReleased ? 'checked' : ''} data-project-id="${id}">
                        <span class="text-sm ml-1">${isReleased}</span>
                    </td>
                    <td class="p-2 text-center flex gap-1 justify-center">
                        <button class="control-btn-icon admin-edit-project-btn" data-project-id="${id}" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.63a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg></button>
                        <button class="control-btn-icon-danger admin-delete-project-btn" data-project-id="${id}" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = projectsHTML;

            // Add event listeners for edit/delete/release
            document.querySelectorAll('.admin-edit-project-btn').forEach(btn => btn.addEventListener('click', this.loadAdminProject.bind(this)));
            document.querySelectorAll('.admin-delete-project-btn').forEach(btn => btn.addEventListener('click', this.deleteAdminProject.bind(this)));
            document.querySelectorAll('.is-released-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', async (e) => {
                    const projectId = e.target.dataset.projectId;
                    const isReleased = e.target.checked;
                    try {
                        const projectRef = doc(db, "projects", projectId);
                        await updateDoc(projectRef, { isReleased });
                        UI.showNotification(`Project release status updated to ${isReleased ? 'Released' : 'Not Released'}.`);
                        this.loadAdminProjectList(); // Refresh the list
                    } catch (error) {
                        console.error("Error updating project status:", error);
                        UI.showNotification("Error updating project status.", true);
                    }
                });
            });

        } catch (error) {
            console.error("Error loading admin projects:", error);
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-red-400">Error: Could not load projects.</td></tr>`;
        }
    },
    async loadAdminProject(e) {
        const projectId = e.target.closest('button').dataset.projectId;
        if (!projectId) return;
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

                const binary_string = atob(project.rawData);
                const len = binary_string.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binary_string.charCodeAt(i);
                }
                const decompressedData = pako.inflate(bytes, { to: 'string' });

                document.getElementById('admin-project-data').value = decompressedData;
                document.getElementById('admin-save-project-btn').textContent = 'Update Project';
                document.getElementById('admin-cancel-edit-btn').classList.remove('hidden');
            }
        } catch (error) {
            console.error("Error loading project for admin edit:", error);
            UI.showNotification("Error loading project for edit.", true);
        }
    },
    async deleteAdminProject(e) {
        const deleteTarget = e.target.closest('.admin-delete-project-btn');
        const projectId = deleteTarget.dataset.projectId;
        if (!projectId) return;

        if (confirm(`Are you sure you want to delete project: ${projectId}?`)) {
            try {
                const { db, doc, deleteDoc } = AppState.firebase.tools;
                await deleteDoc(doc(db, "projects", projectId));
                UI.showNotification("Project deleted successfully.");
                this.loadAdminProjectList();
            } catch (error) {
                console.error("Error deleting project:", error);
                UI.showNotification("Error deleting project.", true);
            }
        }
    },
    resetAdminProjectForm() {
        document.getElementById('admin-form-title').textContent = 'Create New Cloud Project';
        document.getElementById('admin-project-id').value = '';
        document.getElementById('admin-project-name').value = '';
        document.getElementById('admin-project-data').value = '';
        document.getElementById('admin-gsd-select').value = '3in';
        document.getElementById('admin-is-ir-checkbox').checked = false;
        document.getElementById('admin-save-project-btn').textContent = 'Save Project';
        document.getElementById('admin-cancel-edit-btn').classList.add('hidden');
    },
    setupEventListeners() {
        const listen = (id, event, handler) => document.getElementById(id)?.addEventListener(event, handler);

        // Core Listeners
        listen('run-calculation-btn', 'click', async (e) => {
            const button = e.target;
            UI.showLoading(button);
            const isCombined = document.getElementById('combine-projects-checkbox').checked;
            const projectIds = isCombined ?
                Array.from(document.querySelectorAll('.combined-project-checkbox:checked')).map(cb => cb.value) :
                [document.getElementById('project-select').value].filter(Boolean);
            
            if (projectIds.length === 0) {
                // If no project is selected/combined, run calculation on the text area data.
                const rawData = document.getElementById('techData').value;
                const isIR = document.getElementById('is-ir-project-checkbox').checked;
                const gsd = document.getElementById('gsd-value-select').value;
                if (!rawData.trim()) {
                    UI.showNotification("No data provided.", true);
                    UI.hideLoading(button);
                    return;
                }
                const parsed = Calculator.parseRawData(rawData, isIR, 'Direct Input', gsd);
                if (!parsed) {
                    UI.showNotification("Error parsing data. Check TSV format.", true);
                    UI.hideLoading(button);
                    return;
                }
                AppState.currentTechStats = parsed.techStats;
                AppState.lastUsedGsdValue = gsd;
                document.getElementById('results-title').textContent = `Bonus Payouts for: Direct Input`;

            } else {
                await this.runCalculation(isCombined, projectIds);
            }
            
            UI.applyFilters();
            UI.hideLoading(button);
            UI.setPanelHeights();
        });

        listen('project-select', 'change', (e) => this.loadProjectIntoForm(e.target.value));

        listen('reset-button', 'click', () => {
            this.loadProjectIntoForm('');
            document.getElementById('project-select').value = '';
        });
        
        // Sorting Listener
        document.querySelectorAll('.sortable-header').forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.dataset.sort;
                const currentSort = AppState.currentSort;
                if (currentSort.column === sortKey) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.column = sortKey;
                    currentSort.direction = 'desc'; // Default to desc for payout/points/quality
                }
                UI.applyFilters();
            });
        });

        // Filter Listeners
        listen('search-tech-id', 'input', UI.applyFilters.bind(UI));
        listen('team-filter-container', 'change', UI.applyFilters.bind(UI));
        listen('refresh-teams-btn', 'click', this.loadTeamSettings);
        listen('leaderboard-sort-select', 'change', () => UI.applyFilters());

        // Team Management Listeners
        listen('add-team-btn', 'click', () => UI.addTeamCard());
        listen('save-teams-btn', 'click', () => this.saveTeamSettings());

        // Modal Listeners
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.closest('.modal').id;
                UI.closeModal(modalId);
                if (modalId === 'guided-setup-modal') {
                    this.clearSpotlight();
                }
            });
        });
        
        // Summary Listeners (Delegated)
        document.getElementById('tech-results-tbody').addEventListener('click', e => {
            const btn = e.target.closest('.tech-summary-icon');
            if (btn) UI.openTechSummaryModal(btn.dataset.techId);
        });
        document.getElementById('team-quality-container').addEventListener('click', e => {
            const btn = e.target.closest('.team-summary-trigger');
            if (btn) UI.openTeamSummaryModal(btn.dataset.teamName);
        });

        // Combined Projects Listeners
        listen('toggle-combine-projects', 'click', (e) => {
            e.preventDefault();
            document.getElementById('combined-projects-list').classList.toggle('hidden');
            document.getElementById('combine-projects-checkbox').checked = !document.getElementById('combine-projects-checkbox').checked;
            document.getElementById('project-select-container').classList.toggle('hidden', document.getElementById('combine-projects-checkbox').checked);
            document.getElementById('project-action-buttons').classList.toggle('hidden', document.getElementById('combine-projects-checkbox').checked);
            document.getElementById('raw-data-area').classList.toggle('hidden', document.getElementById('combine-projects-checkbox').checked);
            UI.resetUIForNewCalculation();
        });

        // Admin Portal Listeners
        listen('admin-google-signin-btn', 'click', this.handleAdminLogin.bind(this));
        listen('admin-logout-btn', 'click', this.handleAdminLogout.bind(this));

        document.querySelectorAll('#admin-panel-view .tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('#admin-panel-view .tab-button, .admin-tab-content').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');

                if(button.dataset.tab === 'admin-visitors') this.loadVisitorLog();
                if(button.dataset.tab === 'admin-projects') this.loadAdminProjectList();
            });
        });

        listen('accept-update-btn', 'click', async () => {
            await this.resetAdvanceSettingsToDefaults();
            const { db, collection, query, orderBy, limit, getDocs } = AppState.firebase.tools;
            const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const latestUpdateId = snapshot.docs[0].id;
                localStorage.setItem('acceptedUpdateId', latestUpdateId);
            }
            document.getElementById('user-update-banner').classList.add('hidden');
            window.location.reload();
        });

        listen('admin-send-update-btn', 'click', async () => {
            const button = document.getElementById('admin-send-update-btn');
            UI.showLoading(button);
            const message = document.getElementById('admin-update-text').value.trim();
            if (message && AppState.firebase.isAdmin) {
                try {
                    const { db, collection, addDoc } = AppState.firebase.tools;
                    await addDoc(collection(db, "notifications"), {
                        message: message,
                        timestamp: new Date()
                    });
                    UI.showNotification("Update sent successfully.");
                    document.getElementById('admin-update-text').value = '';
                } catch (error) {
                    console.error("Error sending update:", error);
                    UI.showNotification("Error sending update.", true);
                }
            } else {
                UI.showNotification("Message cannot be empty.", true);
            }
            UI.hideLoading(button);
        });

        listen('admin-save-project-btn', 'click', async (e) => {
            const button = e.target;
            UI.showLoading(button);
            const projectId = document.getElementById('admin-project-id').value.trim() || dayjs().format('YYYYMMDDHHmmss');
            const name = document.getElementById('admin-project-name').value.trim();
            const rawData = document.getElementById('admin-project-data').value;
            const gsdValue = document.getElementById('admin-gsd-select').value;
            const isIRProject = document.getElementById('admin-is-ir-checkbox').checked;

            if (!name || !rawData) {
                UI.showNotification("Project Name and Data are required.", true);
                UI.hideLoading(button);
                return;
            }

            try {
                const { db, collection, doc, setDoc, addDoc } = AppState.firebase.tools;
                
                // Compression
                const compressed = pako.deflate(rawData, { to: 'uint8array' });
                const binary = String.fromCharCode.apply(null, compressed);
                const base64Data = btoa(binary);

                const projectFields = {
                    name: name,
                    rawData: base64Data,
                    isIRProject: isIRProject,
                    gsdValue: gsdValue,
                    projectOrder: Date.now()
                };

                if (document.getElementById('admin-project-id').value) {
                    // Update existing project
                    await setDoc(doc(db, "projects", projectId), projectFields, { merge: true });
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
        });

        listen('admin-cancel-edit-btn', 'click', this.resetAdminProjectForm);

        // --- Loading and Saving Projects to IndexedDB ---
        listen('save-local-project-btn', 'click', async (e) => {
            const button = e.target;
            UI.showLoading(button);
            const name = document.getElementById('project-name').value.trim();
            const rawData = document.getElementById('techData').value;
            const gsdValue = document.getElementById('gsd-value-select').value;
            const isIRProject = document.getElementById('is-ir-project-checkbox').checked;
            const projectId = document.getElementById('project-select').value || dayjs().format('YYYYMMDDHHmmss');

            if (!name || !rawData) {
                UI.showNotification("Project Name and Data are required to save.", true);
                UI.hideLoading(button);
                return;
            }

            // Compression
            const compressed = pako.deflate(rawData, { to: 'uint8array' });
            const binary = String.fromCharCode.apply(null, compressed);
            const base64Data = btoa(binary);

            const projectData = {
                id: projectId,
                name: name,
                rawData: base64Data,
                isIRProject: document.getElementById('is-ir-project-checkbox').checked,
                gsdValue: document.getElementById('gsd-value-select').value
            };

            await this.saveProjectToIndexedDB(projectData);
            await this.fetchProjectListSummary();
            document.getElementById('project-select').value = projectData.id;
            await this.loadProjectIntoForm(projectData.id);
            UI.showNotification("Project saved locally.");
            UI.hideLoading(button);
        });

        const runCalculation = async (isCombined, projectIds) => {
            let combinedStats = {};
            if (isCombined) {
                for (const id of projectIds) {
                    const project = await this.fetchFullProjectData(id);
                    if (!project) continue;

                    const parsed = Calculator.parseRawData(project.rawData, project.isIRProject, project.name, project.gsdValue);
                    if (!parsed) continue;

                    for (const [techId, stat] of Object.entries(parsed.techStats)) {
                        if (!combinedStats[techId]) combinedStats[techId] = Calculator.createNewTechStat(true);
                        combinedStats[techId].id = techId;
                        
                        Object.keys(stat.pointsBreakdown).forEach(k => combinedStats[techId].pointsBreakdown[k] += stat.pointsBreakdown[k]);
                        ['points', 'fixTasks', 'afpTasks', 'refixTasks'].forEach(k => combinedStats[techId][k] += stat[k]);
                        ['warnings', 'fix4'].forEach(k => combinedStats[techId][k].push(...stat[k]));
                        
                        // Handle category counts for combined projects (simple merge/sum for now)
                        for (let i = 1; i <= 9; i++) {
                            const catData = stat.categoryCounts[i];
                            if (catData) {
                                ['primary', 'i3qa', 'afp'].forEach(type => {
                                    if (catData[type]) {
                                        combinedStats[techId].categoryCounts[i][type] = (combinedStats[techId].categoryCounts[i][type] || 0) + catData[type];
                                    }
                                });
                            }
                        }

                        if (!combinedStats[techId].pointsBreakdownByProject[project.name]) combinedStats[techId].pointsBreakdownByProject[project.name] = { points: 0, fixTasks: 0, refixTasks: 0, warnings: 0 };
                        const projBreakdown = combinedStats[techId].pointsBreakdownByProject[project.name];
                        projBreakdown.points += stat.points;
                        projBreakdown.fixTasks += stat.fixTasks;
                        projBreakdown.refixTasks += stat.refixTasks;
                        projBreakdown.warnings += stat.warnings.length;
                    }
                }
                AppState.currentTechStats = combinedStats;
                AppState.lastUsedGsdValue = '3in'; // Since combined projects might have different GSDs, we can't show a single one
                document.getElementById('results-title').textContent = `Bonus Payouts for: Combined Projects`;

            } else {
                const project = projectIds.length > 0 ? await this.fetchFullProjectData(projectIds[0]) : null;
                if (!project) {
                    UI.showNotification("No valid project data to calculate.", true);
                    return;
                }
                const parsed = Calculator.parseRawData(project.rawData, project.isIRProject, project.name, project.gsdValue);
                if (!parsed) {
                    UI.showNotification("Error parsing project data. Check TSV format.", true);
                    return;
                }
                AppState.currentTechStats = parsed.techStats;
                AppState.lastUsedGsdValue = project.gsdValue;
                document.getElementById('results-title').textContent = `Bonus Payouts for: ${project.name}`;
            }
        };


        // Main Drop Zone
        listen('drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.add('bg-brand-700'); });
        listen('drop-zone', 'dragleave', e => e.target.closest('#drop-zone').classList.remove('bg-brand-700'));
        listen('drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.remove('bg-brand-700'); this.handleDroppedFiles(e.dataTransfer.files); });

        // Admin Portal Drop Zone
        listen('admin-drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.add('bg-brand-700'); });
        listen('admin-drop-zone', 'dragleave', e => e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'));
        listen('admin-drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'); this.handleAdminDroppedFiles(e.dataTransfer.files); });

        // FIX: Explicitly clear the project context when pasting data
        listen('techData', 'paste', () => {
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
        listen('reset-advance-settings-btn', 'click', this.resetAdvanceSettingsToDefaults.bind(this));
        listen('important-info-btn', 'click', () => UI.openModal('important-info-modal'));

        // --- REPORT A BUG FIX: Using window.open for Gmail URL ---
        const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=ev.lorens.ebrado@gmail.com&su=PCS%20Bonus%20Calculator%20Bug%20Report';
        listen('bug-report-btn', 'click', () => window.open(gmailUrl, '_blank'));
        // --------------------------------------------------------

        listen('clear-data-btn', 'click', this.clearAllData);

        listen('setup-next-btn', 'click', () => {
            AppState.guidedSetup.currentStep++;
            this.updateGuidedSetupView();
        });
        listen('setup-prev-btn', 'click', () => {
            AppState.guidedSetup.currentStep--;
            this.updateGuidedSetupView();
        });
        listen('setup-finish-btn', 'click', this.finishGuidedSetup.bind(this));
    },
    showLoading(button) {
        button.dataset.originalText = button.textContent;
        button.textContent = 'Processing...';
        button.disabled = true;
    },
    hideLoading(button) {
        button.textContent = button.dataset.originalText;
        button.disabled = false;
    }
};

window.onload = Handlers.initializeApp.bind(Handlers);
