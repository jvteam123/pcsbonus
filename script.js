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
                    <td class="tech-detail-trigger" data-tech-id="${tech.id}">${tech.points.toFixed(3)}</td>
                    <td class="tech-detail-trigger" data-tech-id="${tech.id}">${tech.fixTasks}</td>
                    <td class="${tech.refixTasks > 0 ? 'text-red-400' : ''} tech-detail-trigger" data-tech-id="${tech.id}">${tech.refixTasks}</td>
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

        return `<div class="space-y-4 text-sm">${projectBreakdownHTML}<div class="p-3 bg-accent/10 rounded-lg border border-accent/50"><h4 class="font-semibold text-base text-accent mb-2">Final Payout</h4><div class="flex justify-between font-bold text-lg"><span class="text-white">Payout (PHP):</span><span class="text-accent font-mono">${finalPayout.toFixed(2)}</span></div></div>${categoryBreakdownHTML}${qcBreakdownHTML}${i3qaBreakdownHTML}${rvBreakdownHTML}<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Points Breakdown</h4><div class="space-y-1 font-mono"><div class="flex justify-between"><span class="text-brand-400">Fix Tasks:</span><span>${tech.pointsBreakdown.fix.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">QC Tasks:</span><span>${tech.pointsBreakdown.qc.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">i3qa Tasks:</span><span>${tech.pointsBreakdown.i3qa.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">RV Tasks:</span><span>${tech.pointsBreakdown.rv.toFixed(3)}</span></div><div class="flex justify-between font-bold text-base border-t border-brand-700 pt-1 mt-1"><span class="text-white">TOTAL POINTS:</span><span class="text-white">${tech.points.toFixed(3)}</span></div></div></div><div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Quality & Penalties</h4><div class="space-y-1 font-mono"><div class="flex justify-between"><span class="text-brand-400">Total Fix Tasks:</span><span>${tech.fixTasks}</span></div><div class="flex justify-between"><span class="text-brand-400">Refix Penalties:</span><span class="text-red-400">${tech.refixTasks}</span></div><div class="flex justify-between"><span class="text-brand-400">QC Warnings:</span><span class="text-red-400">${tech.warnings.length}</span></div><div class="flex justify-between font-bold text-base border-t border-brand-700 pt-1 mt-1"><span class="text-white">FIX QUALITY:</span><span class="quality-pill ${fixQuality >= 95 ? 'quality-pill-green' : fixQuality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${fixQuality.toFixed(2)}%</span></div><div class="flex justify-between font-bold text-base"><span class="text-white">BONUS EARNED:</span><span class="text-accent">${(qualityModifier * 100).toFixed(2)}%</span></div></div></div>${tech.fix4.length > 0 ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Fix4 Breakdown</h4><div class="space-y-1 text-sm">${tech.fix4.map(f => `<div class="flex justify-between"><span class="text-brand-400">Cat ${f.category} (${f.ir ? 'IR' : 'Std'}) from ${f.sourceType}</span><span class="text-red-400">${f.techId}</span></div>`).join('')}</div></div>` : ''}`;
    },
    generateTeamBreakdownHTML(teamName, techIds, techStats, projectName) {
        const teamStats = techIds.map(id => techStats[id]).filter(Boolean);
        if (teamStats.length === 0) return `<p class="p-4 text-center text-brand-400">No data found for this team in project: ${projectName}.</p>`;
        
        let totalPoints = 0; let totalFixTasks = 0; let totalRefixTasks = 0; let totalWarnings = 0;
        let summaryRows = '';

        teamStats.forEach(tech => {
            const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
            const quality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
            const qualityModifier = Calculator.calculateQualityModifier(quality);
            const payout = tech.points * (parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1) * qualityModifier;
            totalPoints += tech.points; totalFixTasks += tech.fixTasks; totalRefixTasks += tech.refixTasks; totalWarnings += tech.warnings.length;

            summaryRows += `<tr><td class="p-2 font-semibold">${tech.id}</td><td class="p-2 text-center">${tech.points.toFixed(2)}</td><td class="p-2 text-center">${tech.fixTasks}</td><td class="p-2 text-center">${tech.refixTasks}</td><td class="p-2 text-center"><span class="quality-pill ${quality >= 95 ? 'quality-pill-green' : quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${quality.toFixed(2)}%</span></td><td class="p-2 text-center">${payout.toFixed(2)}</td><td class="p-2 text-center"><button class="info-icon team-tech-summary-icon" data-tech-id="${tech.id}" title="View Details"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293.006.399.287.47l.45.083.082.38-2.29.287-.082-.38.45-.083a.89.89 0 0 1 .352-.176c.24-.11.24-.216.06-.563l-.738-3.468c-.18-.84.48-1.133 1.17-1.133H8l.084.38zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg></button></td></tr>`;
        });

        const teamDenominator = totalFixTasks + totalRefixTasks + totalWarnings;
        const teamQuality = teamDenominator > 0 ? (totalFixTasks / teamDenominator) * 100 : 0;
        const teamQualityModifier = Calculator.calculateQualityModifier(teamQuality);
        const teamBonus = teamQualityModifier * 100;

        return `<div class="space-y-4 text-sm"><div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Team Totals (${projectName})</h4><div class="space-y-1 font-mono"><div class="flex justify-between"><span class="text-brand-400">Total Points:</span><span class="text-white">${totalPoints.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">Total Fix Tasks:</span><span>${totalFixTasks}</span></div><div class="flex justify-between"><span class="text-brand-400">Total Refixes:</span><span class="text-red-400">${totalRefixTasks}</span></div><div class="flex justify-between"><span class="text-brand-400">Total Warnings:</span><span class="text-red-400">${totalWarnings}</span></div><div class="flex justify-between font-bold text-base border-t border-brand-700 pt-1 mt-1"><span class="text-white">TEAM QUALITY:</span><span class="quality-pill ${teamQuality >= 95 ? 'quality-pill-green' : teamQuality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${teamQuality.toFixed(2)}%</span></div><div class="flex justify-between font-bold text-base"><span class="text-white">AVG. BONUS EARNED:</span><span class="text-accent">${teamBonus.toFixed(2)}%</span></div></div></div><div class="table-container text-sm"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th class="p-2 text-left">Tech ID</th><th class="p-2 text-center">Points</th><th class="p-2 text-center">Fix</th><th class="p-2 text-center">Refix</th><th class="p-2 text-center">Quality</th><th class="p-2 text-center">Payout</th><th class="p-2 text-center">Details</th></tr></thead><tbody>${summaryRows}</tbody></table></div></div>`;
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
        if (!document.getElementById('project-select').value) {
            document.getElementById('project-name').value = '';
            document.getElementById('techData').value = '';
            Handlers.loadProjectIntoForm("");
        }
    },
    resetMergeModal() {
        document.getElementById('merge-file-list').innerHTML = '';
        document.getElementById('merge-project-name').value = '';
        document.getElementById('merge-options').classList.add('hidden');
        document.getElementById('merge-project-name').classList.remove('input-field-error');
        document.getElementById('merge-error-msg').textContent = '';
        document.getElementById('merge-options').classList.add('hidden');
        document.getElementById('merge-list-container').classList.remove('hidden');
    },
    showLoading(button) {
        button.classList.add('is-loading');
        button.disabled = true;
    },
    hideLoading(button) {
        button.classList.remove('is-loading');
        button.disabled = false;
    }
};

const Calculator = {
    calculateQualityModifier(quality) {
        const tiers = AppState.bonusTiers.slice().sort((a, b) => b.quality - a.quality);
        for (const tier of tiers) {
            if (quality >= tier.quality) return tier.bonus;
        }
        return 0;
    },
    createNewTechStat(isCombined = false) {
        return {
            id: '', points: 0, fixTasks: 0, refixTasks: 0, qcTasks: 0, i3qaTasks: 0, rvTasks: 0, warnings: [], fix4: [], isCombined, projectName: null,
            pointsBreakdown: { fix: 0, qc: 0, i3qa: 0, rv: 0 },
            pointsBreakdownByProject: {},
            categoryCounts: { 1: { primary: 0, i3qa: 0, afp: 0 }, 2: { primary: 0, i3qa: 0, afp: 0 }, 3: { primary: 0, i3qa: 0, afp: 0 }, 4: { primary: 0, i3qa: 0, afp: 0 }, 5: { primary: 0, i3qa: 0, afp: 0 }, 6: { primary: 0, i3qa: 0, afp: 0 }, 7: { primary: 0, i3qa: 0, afp: 0 }, 8: { primary: 0, i3qa: 0, afp: 0 }, 9: { primary: 0, i3qa: 0, afp: 0 } }
        };
    },
    parseRawData(data, isIRProject, projectName, gsdValue) {
        const rows = data.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        if (rows.length < 2) return null;
        const headers = rows[0].split('\t').map(h => h.trim().toLowerCase());
        const dataRows = rows.slice(1);
        
        const getColIndex = (colName) => headers.indexOf(colName.toLowerCase());
        const get = (colName) => {
            const index = getColIndex(colName);
            return index !== -1 ? rowData[index] : null;
        };

        const techStats = {};
        const triggers = AppState.countingSettings.triggers;
        const taskColumns = AppState.countingSettings.taskColumns;
        const gsdForCalculation = gsdValue || AppState.lastUsedGsdValue;

        const getTechStat = (techId) => {
            if (!techId || !CONSTANTS.TECH_ID_REGEX.test(techId)) return null;
            const upperId = techId.toUpperCase();
            if (!techStats[upperId]) {
                techStats[upperId] = this.createNewTechStat();
                techStats[upperId].id = upperId;
                techStats[upperId].projectName = projectName;
            }
            return techStats[upperId];
        };

        const processFixTech = (techId, catSources) => {
            const stat = getTechStat(techId);
            if (!stat) return;
            let techPoints = 0;
            let techCategories = 0;
            catSources.forEach(source => {
                if (source.isRQA && source.sourceType === 'afp') stat.afpTasks++;
                const labelValue = source.label ? get(source.label)?.trim().toUpperCase() : null;
                if (source.condition && !source.condition(labelValue)) return;

                const catValue = parseInt(get(source.cat));
                if (!isNaN(catValue) && catValue >= 1 && catValue <= 9) {
                    techCategories++;
                    techPoints += AppState.calculationSettings.categoryValues[catValue]?.[gsdForCalculation] || 0;
                    if(stat.categoryCounts[catValue]) stat.categoryCounts[catValue][source.sourceType]++;
                }
            });

            stat.fixTasks += techCategories;
            let pointsToAdd = techPoints * (isIRProject ? AppState.calculationSettings.irModifierValue : 1);
            stat.points += pointsToAdd;
            stat.pointsBreakdown.fix += pointsToAdd;
        };

        // Helper for non-fix tasks (QC, i3QA, RV)
        const addPointsForTask = (techId, points, field, taskType) => {
            const stat = getTechStat(techId);
            if (stat) {
                stat.points += points;
                stat.pointsBreakdown[field] += points;
                if (taskType) {
                    stat[`${taskType}Tasks`] += 1;
                }
            }
        };

        // Helper to check for refix trigger
        const isRefixTriggered = (reviewLabelCol, fixIndex) => {
            const label = get(reviewLabelCol)?.trim().toLowerCase();
            return label && triggers.refix.labels.includes(label) && fixIndex > 0;
        };

        // Helper to check for warning trigger
        const isWarningTriggered = (warningCol) => {
            const label = get(warningCol)?.trim().toLowerCase();
            return label && triggers.warning.labels.includes(label);
        };
        
        // Helper to check for a miss (m) or correct (c) in i3qa
        const isI3qaPenaltyTriggered = (i3qaLabelCol) => {
            const label = get(i3qaLabelCol)?.trim().toLowerCase();
            return label && triggers.qcPenalty.labels.includes(label);
        };

        dataRows.forEach(row => {
            const rowData = row.split('\t');
            // Ensure row is not empty or malformed
            if (rowData.length < headers.length) return;

            // --- 0. Warning/Penalty Check (Applies to the tech that produced the warning) ---
            triggers.warning.columns.forEach(col => {
                const techId = get(col.replace('_warn', '_id'));
                if (isWarningTriggered(col)) {
                    const stat = getTechStat(techId);
                    if (stat) {
                        stat.warnings.push({ col: col, label: get(col), sourceId: get('source_id') });
                    }
                }
            });

            // --- 1. Fix Points Calculation (Always credit the tech who *fixed*) ---
            // Process FIX1/AFP (Primary Fix)
            const fix1TechId = get('tech_id');
            if (fix1TechId) {
                const catSources = [{ cat: 'category', sourceType: 'primary' }];
                const afpTechId = get('afp_tech');
                if (afpTechId) { // AFP check
                    const afpSources = [{ cat: 'afp_category', isRQA: true, sourceType: 'afp' }];
                    processFixTech(afpTechId, afpSources);
                }
                processFixTech(fix1TechId, catSources);
            }

            // Process FIX2, FIX3, FIX4 (Secondary/Review Fixes)
            for (let i = 1; i <= 4; i++) {
                const fixTechId = get(`fix${i}_tech`);
                if (!fixTechId) continue;
                
                const catSources = [];
                let refixTriggered = false;

                // FIX1 (i=1) is handled above. Only process FIX2 (i=2) to FIX4 (i=4) here.
                if (i >= 2) {
                    const reviewCol = i === 2 ? 'rv1_label' : i === 3 ? 'rv2_label' : 'rv3_label';
                    if (isRefixTriggered(reviewCol, i)) {
                        refixTriggered = true;
                    }
                }

                // If refix is triggered, skip points for this tech in this row (they get refix points later)
                if (refixTriggered) continue;

                // Add points for Fix2, Fix3, Fix4
                if (get(`fix${i}_cat`)) {
                    catSources.push({ cat: `fix${i}_cat`, sourceType: 'primary' });
                    // Check for Fix4 and IR flag
                    if (i === 4) {
                        const stat = getTechStat(fixTechId);
                        if (stat) {
                            stat.fix4.push({ category: get(`fix${i}_cat`), sourceType: 'primary', techId: fixTechId, ir: isIRProject });
                        }
                    }
                }
                processFixTech(fixTechId, catSources);
            }

            // --- 2. Refix Penalty and Point Transfer ---
            for (let i = 1; i <= 4; i++) {
                const fixTechId = get(`fix${i}_tech`);
                if (!fixTechId) continue;
                
                // Only FIX2, FIX3, FIX4 can trigger a refix from the previous reviewer
                if (i >= 2) {
                    const reviewCol = i === 2 ? 'rv1_label' : i === 3 ? 'rv2_label' : 'rv3_label';
                    if (isRefixTriggered(reviewCol, i)) {
                        const originalFixTechId = get(`fix${i-1}_tech`);
                        if (originalFixTechId && getTechStat(originalFixTechId)) {
                            // a) Penalize original tech (refixTasks++)
                            getTechStat(originalFixTechId).refixTasks++;
                            
                            // b) Credit points to the refix tech (The one who performed the fix at step 'i')
                            const catValue = parseInt(get(`fix${i}_cat`));
                            if (!isNaN(catValue) && catValue >= 1 && catValue <= 9) {
                                const points = AppState.calculationSettings.categoryValues[catValue]?.[gsdForCalculation] || 0;
                                let pointsToAdd = points * (isIRProject ? AppState.calculationSettings.irModifierValue : 1);
                                addPointsForTask(fixTechId, pointsToAdd, 'fix');
                                
                                // Also credit as a fix task (but manually since it was skipped above)
                                getTechStat(fixTechId).fixTasks++;
                            }

                            // If this was a FIX4 refix, log it to the list
                            if (i === 4) {
                                const stat = getTechStat(fixTechId);
                                if (stat) {
                                    stat.fix4.push({ category: get(`fix${i}_cat`), sourceType: 'refix', techId: fixTechId, ir: isIRProject });
                                }
                            }
                        }
                    }
                }
            }


            // --- 3. QC/i3QA/RV Tasks (Points are always credited, but quality may be penalized) ---

            // QC Tasks
            taskColumns.qc.forEach(col => {
                const techId = get(col);
                if (techId) {
                    addPointsForTask(techId, AppState.calculationSettings.points.qc, 'qc', 'qc');
                }
            });

            // i3QA Tasks
            taskColumns.i3qa.forEach(col => {
                const techId = get(col);
                if (techId) {
                    addPointsForTask(techId, AppState.calculationSettings.points.i3qa, 'i3qa', 'i3qa');
                    // Check for i3qa penalty/warning on the original tech
                    const originalTechId = get('tech_id');
                    const i3qaLabelCol = col.replace('_id', '_label');
                    if (originalTechId && isI3qaPenaltyTriggered(i3qaLabelCol)) {
                        const stat = getTechStat(originalTechId);
                        if (stat) {
                            stat.warnings.push({ col: i3qaLabelCol, label: get(i3qaLabelCol), sourceId: get('source_id') });
                        }
                    }
                }
            });

            // RV Tasks (RV1, RV2)
            for (const key of ['rv1', 'rv2']) {
                taskColumns[key].forEach(col => {
                    const techId = get(col);
                    if (techId) {
                        const isCombo = key === 'rv1' && get('fix2_tech');
                        const points = isCombo ? AppState.calculationSettings.points.rv1_combo : AppState.calculationSettings.points[key];
                        addPointsForTask(techId, points, 'rv', 'rv');
                    }
                });
            }

        });

        // Update overall fix tasks count for each tech
        Object.values(techStats).forEach(tech => {
            tech.fixTasks = tech.fixTasks; // Recalculate if needed, but for now, this ensures consistency
        });

        AppState.currentTechStats = techStats;

        return { techStats, isIRProject, projectName, gsdValue };
    }
};

const Handlers = {
    setupEventListeners() {
        const listen = (id, event, handler) => document.getElementById(id)?.addEventListener(event, handler);
        listen('calculate-btn', 'click', this.handleCalculate.bind(this));
        listen('project-select', 'change', e => this.loadProjectIntoForm(e.target.value));
        listen('save-project-btn', 'click', this.handleSaveProject.bind(this));
        listen('delete-project-btn', 'click', this.handleDeleteProject.bind(this));
        listen('team-summary-modal-body', 'click', e => {
            const button = e.target.closest('.team-tech-summary-icon');
            if (button) {
                UI.closeModal('team-summary-modal');
                UI.openTechSummaryModal(button.dataset.techId);
            }
        });
        listen('merge-projects-btn', 'click', this.handleMergeProjects.bind(this));
        listen('merge-add-project-btn', 'click', this.handleMergeAddProject.bind(this));
        listen('merge-confirm-btn', 'click', this.handleMergeConfirm.bind(this));
        listen('merge-cancel-btn', 'click', () => UI.closeModal('merge-projects-modal'));
        listen('gsd-value-select', 'change', e => {
            AppState.lastUsedGsdValue = e.target.value;
            localStorage.setItem('lastUsedGsdValue', e.target.value);
        });
        listen('search-tech-id', 'input', UI.applyFilters.bind(UI));
        listen('team-filter-container', 'change', UI.applyFilters.bind(UI));
        listen('refresh-teams-btn', 'click', this.loadTeamSettings);
        listen('leaderboard-sort-select', 'change', () => UI.applyFilters());
        listen('add-team-btn', 'click', () => UI.addTeamCard());
        listen('save-teams-btn', 'click', () => this.saveTeamSettings());

        // Admin Portal Listeners
        listen('admin-google-signin-btn', 'click', this.handleAdminLogin.bind(this));
        document.querySelectorAll('#admin-panel-view .tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('#admin-panel-view .tab-button, .admin-tab-content').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
                if(button.dataset.tab === 'admin-visitors') this.loadVisitorLog();
                if(button.dataset.tab === 'admin-projects') this.loadAdminProjectList();
            });
        });
        listen('save-admin-project-btn', 'click', this.handleAdminSaveProject.bind(this));
        listen('upload-admin-project-btn', 'click', this.handleAdminUploadProject.bind(this));
        listen('admin-project-list-tbody', 'click', this.handleAdminProjectListClick.bind(this));
        listen('delete-admin-project-btn', 'click', this.handleAdminDeleteProject.bind(this));
        listen('reset-advance-settings-btn', 'click', this.resetAdvanceSettingsToDefaults.bind(this));
        listen('add-tier-btn', 'click', () => UI.addBonusTierRow());
        listen('admin-clear-data-btn', 'click', this.clearAllData);


        // Table Sort Listeners
        document.querySelectorAll('#tech-results-table th.sortable-header').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                if (AppState.currentSort.column === column) {
                    AppState.currentSort.direction = AppState.currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    AppState.currentSort.column = column;
                    AppState.currentSort.direction = 'desc';
                }
                UI.applyFilters(); // Re-sort and re-display
            });
        });

        // Theme dropdown
        listen('user-options-dropdown-trigger', 'click', () => {
            document.getElementById('user-options-dropdown').classList.toggle('hidden');
        });
        document.addEventListener('click', e => {
            const dropdown = document.getElementById('user-options-dropdown');
            const trigger = document.getElementById('user-options-dropdown-trigger');
            if (dropdown && trigger) {
                if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            }
        });

        // FIX: Ensure paste into data area resets project selection
        listen('techData', 'paste', e => {
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
        listen('start-tour-btn', 'click', this.startTour.bind(this));
        listen('finish-setup-btn', 'click', this.finishGuidedSetup.bind(this));
        
        document.querySelectorAll('#tech-data-panel-view .tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('#tech-data-panel-view .tab-button, .data-tab-content').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
                localStorage.setItem('activeDataTab', button.dataset.tab);
            });
        });

    },

    setupTableListeners() {
        const resultsTbody = document.getElementById('tech-results-tbody');
        if (resultsTbody) {
            // Event delegation for opening the Tech Summary Modal from the new clickable cells and the existing icon button.
            resultsTbody.addEventListener('click', e => {
                // Find the closest clickable element (new cell or existing button)
                const targetElement = e.target.closest('.tech-detail-trigger, .tech-summary-icon');
                
                if (targetElement) {
                    e.preventDefault();
                    // Get the tech ID from the data attribute
                    const techId = targetElement.dataset.techId;
                    if (techId) {
                        UI.openTechSummaryModal(techId);
                    }
                }
            });
        }
    },
    
    async initializeApp() {
        await DB.open();
        dayjs.extend(window.dayjs_plugin_relativeTime);
        Handlers.setupEventListeners();
        Handlers.setupTableListeners(); // Added for clickable table cells
        document.body.classList.toggle('light-theme', localStorage.getItem('theme') === 'light');

        AppState.lastUsedGsdValue = localStorage.getItem('lastUsedGsdValue') || AppState.lastUsedGsdValue;
        document.getElementById('gsd-value-select').value = AppState.lastUsedGsdValue;

        await Handlers.loadBonusTiers();
        await Handlers.loadCalculationSettings();
        await Handlers.loadCountingSettings();
        await Handlers.loadTeamSettings();
        await Handlers.fetchProjectListSummary();
        UI.setPanelHeights();

        // Admin Auth Setup
        try {
            const { initializeApp } = window.firebase;
            const firebaseConfig = {
                // Insert Firebase config here
                apiKey: "",
                authDomain: "",
                projectId: "",
                storageBucket: "",
                messagingSenderId: "",
                appId: ""
            };
            AppState.firebase.app = initializeApp(firebaseConfig);
            
            const { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } = window.firebase.auth;
            const { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, updateDoc, doc, deleteDoc } = window.firebase.firestore;

            AppState.firebase.tools = { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, getFirestore, collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, updateDoc, doc, deleteDoc };
            AppState.firebase.auth = getAuth(AppState.firebase.app);
            AppState.firebase.db = getFirestore(AppState.firebase.app);

            onAuthStateChanged(AppState.firebase.auth, (user) => {
                const adminBtn = document.getElementById('admin-portal-btn');
                const userStatusDiv = document.getElementById('user-status');
                const adminPanel = document.getElementById('admin-panel-view');

                if (user && CONSTANTS.ADMIN_EMAIL.includes(user.email)) {
                    AppState.firebase.isAdmin = true;
                    adminBtn.classList.remove('hidden');
                    userStatusDiv.textContent = `Signed in as Admin: ${user.email}`;
                    userStatusDiv.classList.remove('hidden');
                    adminPanel.classList.remove('hidden');
                    this.listenForUpdates();
                } else {
                    AppState.firebase.isAdmin = false;
                    adminBtn.classList.add('hidden');
                    adminPanel.classList.add('hidden');
                    userStatusDiv.classList.add('hidden');
                }
            });
            this.logVisitor();
        } catch (error) {
            console.error("Firebase initialization failed. Admin features disabled.", error);
            document.getElementById('admin-portal-btn').classList.add('hidden');
        }

        // Handle Guided Setup Check
        const setupStatus = await DB.get('settings', 'hasBeenSetup');
        if (!setupStatus) {
            UI.openModal('guided-setup-modal');
            this.updateGuidedSetupView();
        }

        // Restore active tab
        const activeDataTab = localStorage.getItem('activeDataTab') || 'manual';
        document.querySelectorAll('#tech-data-panel-view .tab-button, .data-tab-content').forEach(el => el.classList.remove('active'));
        document.querySelector(`.tab-button[data-tab="${activeDataTab}"]`)?.classList.add('active');
        document.getElementById(`tab-${activeDataTab}`)?.classList.add('active');
    },
    handleCalculate() {
        UI.showLoading(document.getElementById('calculate-btn'));
        const rawData = document.getElementById('techData').value;
        const projectName = document.getElementById('project-name').value.trim();
        const isIRProject = document.getElementById('is-ir-project-checkbox').checked;
        const gsdValue = document.getElementById('gsd-value-select').value;
        const isMerged = document.getElementById('merge-file-list').innerHTML.trim() !== '';

        if (!rawData && !isMerged) {
            UI.showNotification("Please paste data or upload a project file.", true);
            UI.hideLoading(document.getElementById('calculate-btn'));
            return;
        }

        if (isMerged) {
            this.runCalculation(true, Handlers.mergeProjectIdsCache);
        } else {
            const result = Calculator.parseRawData(rawData, isIRProject, projectName || 'Manual Data', gsdValue);
            if (result) {
                document.getElementById('results-title').textContent = `Bonus Payouts for: ${result.projectName}`;
                UI.applyFilters();
            } else {
                UI.showNotification("Failed to parse data. Please check the format.", true);
                UI.resetUIForNewCalculation();
            }
        }
        UI.hideLoading(document.getElementById('calculate-btn'));
    },
    async handleSaveProject(e) {
        const button = e.target;
        UI.showLoading(button);
        const name = document.getElementById('project-name').value.trim();
        const rawData = document.getElementById('techData').value;
        const projectId = document.getElementById('project-select').value || `proj-${Date.now()}`;
        
        if (!name || !rawData) {
            UI.showNotification("Project Name and Data are required.", true);
            UI.hideLoading(button);
            return;
        }

        try {
            // Compress the raw data
            const binary = pako.deflate(rawData, { to: 'string' });
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
            this.loadProjectIntoForm(projectData.id);

            UI.showNotification("Project saved successfully!");
        } catch (error) {
            console.error("Error saving project:", error);
            UI.showNotification("Error saving project data.", true);
        } finally {
            UI.hideLoading(button);
        }
    },
    async handleDeleteProject() {
        const projectId = document.getElementById('project-select').value;
        if (!projectId || !confirm("Are you sure you want to delete this project?")) return;
        try {
            await DB.delete('projects', projectId);
            await this.fetchProjectListSummary();
            this.loadProjectIntoForm(""); // Clear the form
            UI.showNotification("Project deleted successfully.");
        } catch (error) {
            console.error("Error deleting project:", error);
            UI.showNotification("Error deleting project.", true);
        }
    },
    async loadProjectIntoForm(projectId) {
        UI.resetMergeModal();
        const projectNameEl = document.getElementById('project-name');
        const techDataEl = document.getElementById('techData');
        const isIREl = document.getElementById('is-ir-project-checkbox');
        const gsdEl = document.getElementById('gsd-value-select');
        const calculateBtn = document.getElementById('calculate-btn');
        const saveBtn = document.getElementById('save-project-btn');
        const deleteBtn = document.getElementById('delete-project-btn');
        const mergeBtn = document.getElementById('merge-projects-btn');

        if (!projectId) {
            projectNameEl.value = '';
            techDataEl.value = '';
            isIREl.checked = false;
            isIREl.disabled = false;
            techDataEl.disabled = false;
            saveBtn.textContent = 'Save New Project';
            deleteBtn.classList.add('hidden');
            mergeBtn.classList.remove('hidden');
            calculateBtn.disabled = false;
            return;
        }

        const project = await this.fetchFullProjectData(projectId);
        if (project) {
            projectNameEl.value = project.name;
            techDataEl.value = project.rawData;
            isIREl.checked = project.isIRProject;
            gsdEl.value = project.gsdValue || '3in';

            // Disable editing raw data and IR/GSD when project is loaded from DB
            techDataEl.disabled = true;
            isIREl.disabled = true;
            gsdEl.disabled = true;

            saveBtn.textContent = 'Update Project';
            deleteBtn.classList.remove('hidden');
            mergeBtn.classList.add('hidden');
            calculateBtn.disabled = false;

            document.getElementById('techData').classList.remove('input-field-error');
        } else {
             // Project deleted or not found
            document.getElementById('project-select').value = '';
            this.loadProjectIntoForm("");
        }
    },
    async handleDroppedFiles(files) {
        if (!files || files.length === 0) return;
        const tsvFile = Array.from(files).find(file => file.name.endsWith('.tsv') || file.name.endsWith('.txt'));
        const shapeFiles = Array.from(files).filter(file => file.name.endsWith('.shp') || file.name.endsWith('.dbf'));

        if (tsvFile) {
            const content = await tsvFile.text();
            document.getElementById('techData').value = content;
            document.getElementById('project-name').value = tsvFile.name.replace(/\.(tsv|txt)$/i, '').trim();
            // Deselect any project to enable saving
            document.getElementById('project-select').value = '';
            this.loadProjectIntoForm("");

            UI.showNotification(`Loaded ${tsvFile.name}.`);
        } else if (shapeFiles.length > 0) {
            await this.processShapeFiles(shapeFiles, 'techData');
            // Deselect any project to enable saving
            document.getElementById('project-select').value = '';
            this.loadProjectIntoForm("");
            document.getElementById('project-name').value = shapeFiles[0].name.split('.')[0].trim();
        } else {
            UI.showNotification("Please drop a .tsv, .txt, or a pair of .shp/.dbf files.", true);
        }
    },
    async processShapeFiles(files, targetElementId) {
        const fileGroups = {};
        let count = 0;

        files.forEach(file => {
            const name = file.name.split('.').slice(0, -1).join('.');
            const ext = file.name.split('.').pop().toLowerCase();
            if (!fileGroups[name]) { fileGroups[name] = {}; }
            if (ext === 'shp') fileGroups[name].shp = file;
            if (ext === 'dbf') fileGroups[name].dbf = file;
        });

        const allFeatures = [];
        // --- START BUG FIX: Added a check for geojson.features.length > 0 ---
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

            document.getElementById(targetElementId).value = tsv;
            // FIX: Explicitly ensure the IR checkbox is unchecked after processing files
            document.getElementById('is-ir-project-checkbox').checked = false;
            document.getElementById('is-ir-project-checkbox').disabled = false;
            // Set project name from the first file name (without extension)
            document.getElementById('project-name').value = files[0].name.split('.')[0].trim();

            UI.showNotification(`${count} shapefile set(s) processed.`);
        } else {
            alert("No valid .shp/.dbf pairs found.");
        }
    },
    async runCalculation(isCombined, projectIds) {
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
                    ['points', 'fixTasks', 'afpTasks', 'refixTasks', 'qcTasks', 'i3qaTasks', 'rvTasks'].forEach(k => combinedStats[techId][k] += stat[k]);
                    ['warnings', 'fix4'].forEach(k => combinedStats[techId][k].push(...stat[k]));

                    // Combine category counts
                    for (let i = 1; i <= 9; i++) {
                        for (const source of ['primary', 'i3qa', 'afp']) {
                            combinedStats[techId].categoryCounts[i][source] += stat.categoryCounts[i][source];
                        }
                    }

                    if (!combinedStats[techId].pointsBreakdownByProject[project.name]) {
                        combinedStats[techId].pointsBreakdownByProject[project.name] = { points: 0, fixTasks: 0, refixTasks: 0, warnings: 0 };
                    }
                    const projBreakdown = combinedStats[techId].pointsBreakdownByProject[project.name];
                    projBreakdown.points += stat.points;
                    projBreakdown.fixTasks += stat.fixTasks;
                    projBreakdown.refixTasks += stat.refixTasks;
                    projBreakdown.warnings += stat.warnings.length;
                }
            }
            AppState.currentTechStats = combinedStats;
            document.getElementById('results-title').textContent = `Bonus Payouts for: ${document.getElementById('merge-project-name').value}`;
            UI.applyFilters();
        } else {
             // For single project calculation, already handled in handleCalculate
        }
    },
    handleMergeAddProject() {
        const select = document.getElementById('project-select');
        const projectId = select.value;
        const projectName = select.options[select.selectedIndex]?.textContent;
        
        if (!projectId) {
            UI.showNotification("Please select a project to add.", true);
            return;
        }

        const mergeList = document.getElementById('merge-file-list');
        const existingItem = mergeList.querySelector(`li[data-project-id="${projectId}"]`);

        if (existingItem) {
            UI.showNotification("Project is already added for merging.", true);
            return;
        }

        // Initialize cache if it doesn't exist
        if (!Handlers.mergeProjectIdsCache) Handlers.mergeProjectIdsCache = [];

        Handlers.mergeProjectIdsCache.push(projectId);

        const listItem = document.createElement('li');
        listItem.className = 'flex justify-between items-center bg-brand-700 p-2 rounded-md';
        listItem.dataset.projectId = projectId;
        listItem.innerHTML = `<span>${projectName}</span><button class="remove-merge-item control-btn-icon" data-project-id="${projectId}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.647 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button>`;
        mergeList.appendChild(listItem);

        // Remove from list listener
        listItem.querySelector('.remove-merge-item').addEventListener('click', () => {
            listItem.remove();
            Handlers.mergeProjectIdsCache = Handlers.mergeProjectIdsCache.filter(id => id !== projectId);
            if (Handlers.mergeProjectIdsCache.length === 0) {
                document.getElementById('merge-options').classList.add('hidden');
                document.getElementById('merge-list-container').classList.remove('hidden');
            }
        });

        document.getElementById('merge-options').classList.remove('hidden');
        document.getElementById('merge-list-container').classList.add('hidden');
    },
    handleMergeProjects() {
        UI.resetMergeModal();
        Handlers.mergeProjectIdsCache = [];
        UI.openModal('merge-projects-modal');
    },
    handleMergeConfirm(e) {
        const button = e.target;
        const projectName = document.getElementById('merge-project-name');
        const projectIds = Handlers.mergeProjectIdsCache;

        if (projectIds.length < 2) {
            document.getElementById('merge-error-msg').textContent = "Please select at least two projects to merge.";
            return;
        }
        if (projectName.value.trim() === '') {
            document.getElementById('merge-error-msg').textContent = "Please enter a name for the merged project.";
            projectName.classList.add('input-field-error');
            return;
        }

        projectName.classList.remove('input-field-error');
        document.getElementById('merge-error-msg').textContent = '';
        UI.showLoading(button);
        UI.closeModal('merge-projects-modal');
        
        // Run the calculation for merged projects
        this.runCalculation(true, projectIds);
        
        UI.hideLoading(button);
    },
    async handleAdminLogin() {
        if (AppState.firebase.isAdmin) {
            await AppState.firebase.tools.signOut(AppState.firebase.auth);
            UI.showNotification("Signed out successfully.");
            return;
        }

        const provider = new AppState.firebase.tools.GoogleAuthProvider();
        try {
            const result = await AppState.firebase.tools.signInWithPopup(AppState.firebase.auth, provider);
            const user = result.user;
            if (CONSTANTS.ADMIN_EMAIL.includes(user.email)) {
                UI.showNotification(`Admin sign-in successful for ${user.email}.`);
            } else {
                await AppState.firebase.tools.signOut(AppState.firebase.auth);
                UI.showNotification("Access denied. Not an authorized admin email.", true);
            }
        } catch (error) {
            console.error("Login error:", error);
            UI.showNotification(`Login failed: ${error.message}`, true);
        }
    },
    handleAdminUploadProject(e) {
        const button = e.target;
        const fileInput = document.getElementById('admin-project-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            UI.showNotification("Please select files to upload.", true);
            return;
        }

        UI.showLoading(button);

        const shapeFiles = Array.from(fileInput.files).filter(file => file.name.endsWith('.shp') || file.name.endsWith('.dbf'));
        if (shapeFiles.length > 0) {
            this.processShapeFiles(shapeFiles, 'admin-project-data').then(() => {
                UI.showNotification("Files loaded into the data editor.");
            }).catch(error => {
                console.error("Shapefile processing error:", error);
                UI.showNotification("Error processing shapefiles.", true);
            }).finally(() => {
                UI.hideLoading(button);
            });
        } else {
            UI.showNotification("Only .shp/.dbf pairs are supported for admin upload.", true);
            UI.hideLoading(button);
        }
    },
    async handleAdminSaveProject(e) {
        const { db, collection, addDoc, updateDoc, doc } = AppState.firebase.tools;
        const button = e.target;
        UI.showLoading(button);

        const name = document.getElementById('admin-project-name').value.trim();
        const rawData = document.getElementById('admin-project-data').value;
        const projectId = document.getElementById('admin-project-id').value.trim();
        const projectOrder = parseInt(document.getElementById('admin-project-order').value) || Date.now();
        const isIRProject = document.getElementById('admin-is-ir-project-checkbox').checked;
        const gsdValue = document.getElementById('admin-gsd-value-select').value;
        
        if (!name || !rawData) {
            UI.showNotification("Project Name and Data are required.", true);
            UI.hideLoading(button);
            return;
        }

        try {
            // Compress the raw data
            const binary = pako.deflate(rawData, { to: 'string' });
            const base64Data = btoa(binary);

            const projectFields = {
                name: name,
                rawData: base64Data,
                isIRProject: isIRProject,
                gsdValue: gsdValue,
                projectOrder: projectOrder
            };

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
    resetAdminProjectForm() {
        document.getElementById('admin-project-id').value = '';
        document.getElementById('admin-project-name').value = '';
        document.getElementById('admin-project-data').value = '';
        document.getElementById('admin-project-order').value = '';
        document.getElementById('admin-is-ir-project-checkbox').checked = false;
        document.getElementById('admin-gsd-value-select').value = '3in';
        document.getElementById('admin-project-status').textContent = 'Status: Not Saved';
        document.getElementById('delete-admin-project-btn').classList.add('hidden');
        document.getElementById('save-admin-project-btn').textContent = 'Save New Project';
    },
    handleAdminProjectListClick(e) {
        const button = e.target.closest('.admin-edit-project-btn, .admin-toggle-release-btn');
        if (!button) return;
        const projectId = button.dataset.projectId;

        if (button.classList.contains('admin-edit-project-btn')) {
            this.loadAdminProjectForEdit(projectId);
        } else if (button.classList.contains('admin-toggle-release-btn')) {
            this.toggleProjectReleaseStatus(projectId, button.dataset.isReleased === 'false');
        }
    },
    async loadAdminProjectForEdit(projectId) {
        const { db, doc, getDoc } = AppState.firebase.tools;
        try {
            const projectDoc = await getDoc(doc(db, "projects", projectId));
            if (projectDoc.exists()) {
                const project = projectDoc.data();
                document.getElementById('admin-project-id').value = projectId;
                document.getElementById('admin-project-name').value = project.name;
                document.getElementById('admin-project-order').value = project.projectOrder || '';
                document.getElementById('admin-is-ir-project-checkbox').checked = project.isIRProject || false;
                document.getElementById('admin-gsd-value-select').value = project.gsdValue || '3in';

                const rawData = pako.inflate(atob(project.rawData), { to: 'string' });
                document.getElementById('admin-project-data').value = rawData;
                
                document.getElementById('admin-project-status').textContent = `Status: ${project.isReleased ? 'Released' : 'Draft'}`;
                document.getElementById('delete-admin-project-btn').classList.remove('hidden');
                document.getElementById('save-admin-project-btn').textContent = 'Update Project';
                
                // Switch to project editor tab
                document.querySelectorAll('#admin-panel-view .tab-button, .admin-tab-content').forEach(el => el.classList.remove('active'));
                document.querySelector(`.tab-button[data-tab="admin-project-editor"]`)?.classList.add('active');
                document.getElementById('tab-admin-project-editor').classList.add('active');

                UI.showNotification(`Loaded project ${project.name} for editing.`);
            }
        } catch (error) {
            console.error("Error loading project for edit:", error);
            UI.showNotification("Error loading project data.", true);
        }
    },
    async toggleProjectReleaseStatus(projectId, newStatus) {
        const { db, doc, updateDoc } = AppState.firebase.tools;
        try {
            await updateDoc(doc(db, "projects", projectId), { isReleased: newStatus });
            UI.showNotification(`Project release status updated to ${newStatus ? 'Released' : 'Draft'}.`);
            this.loadAdminProjectList();
        } catch (error) {
            console.error("Error toggling project status:", error);
            UI.showNotification("Error updating project status.", true);
        }
    },
    async handleAdminDeleteProject() {
        const { db, doc, deleteDoc } = AppState.firebase.tools;
        const projectId = document.getElementById('admin-project-id').value;
        const projectName = document.getElementById('admin-project-name').value;
        if (!projectId || !confirm(`Are you sure you want to delete the cloud project: ${projectName}?`)) return;

        try {
            await deleteDoc(doc(db, "projects", projectId));
            UI.showNotification(`Project ${projectName} deleted from cloud.`);
            this.resetAdminProjectForm();
            this.loadAdminProjectList();
        } catch (error) {
            console.error("Error deleting cloud project:", error);
            UI.showNotification("Error deleting project from cloud.", true);
        }
    },
    async loadVisitorLog() {
        const { db, collection, getDocs, query, orderBy } = AppState.firebase.tools;
        const logTbody = document.getElementById('admin-visitor-log-tbody');
        logTbody.innerHTML = '<tr><td colspan="3" class="text-center p-4">Loading log...</td></tr>';
        try {
            const q = query(collection(db, "visitors"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            logTbody.innerHTML = '';
            
            const parser = new UAParser();

            querySnapshot.forEach(doc => {
                const data = doc.data();
                const ts = data.timestamp.toDate();
                const u = parser.setUA(data.userAgent).getResult();
                const row = document.createElement('tr');
                row.innerHTML = `<td class="p-2">${dayjs(ts).format('MMM D, h:mm:ss A')}</td><td class="p-2">${u.browser.name || 'Unknown'} / ${u.os.name || 'Unknown'}</td><td class="p-2">${u.device.model || 'Desktop'}</td>`;
                logTbody.appendChild(row);
            });
            if (querySnapshot.empty) {
                logTbody.innerHTML = '<tr><td colspan="3" class="text-center p-4">No visitor log data.</td></tr>';
            }
        } catch (error) {
            console.error("Error loading visitor log:", error);
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
        const getValues = id => document.getElementById(id).value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const newTiers = Array.from(document.querySelectorAll('#bonus-tier-editor-container .bonus-tier-row')).map(row => ({
            quality: parseFloat(row.querySelector('.tier-quality').value),
            bonus: parseFloat(row.querySelector('.tier-bonus').value)
        })).filter(t => !isNaN(t.quality) && !isNaN(t.bonus)).sort((a, b) => b.quality - a.quality);
        const newCalcSettings = {
            irModifierValue: parseFloat(document.getElementById('setting-ir-modifier').value) || 1,
            points: {
                qc: parseFloat(document.getElementById('setting-qc-points').value) || 0,
                i3qa: parseFloat(document.getElementById('setting-i3qa-points').value) || 0,
                rv1: parseFloat(document.getElementById('setting-rv1-points').value) || 0,
                rv1_combo: parseFloat(document.getElementById('setting-rv1-combo-points').value) || 0,
                rv2: parseFloat(document.getElementById('setting-rv2-points').value) || 0,
            },
            categoryValues: AppState.calculationSettings.categoryValues // Not editable in current UI
        };
        const newCountingSettings = {
            taskColumns: AppState.countingSettings.taskColumns, // Not editable in current UI
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
            DB.put('countingSettings', { id: 'customCounting', settings: newCountingSettings }),
        ]);
        [AppState.bonusTiers, AppState.calculationSettings, AppState.countingSettings] = [newTiers, newCalcSettings, newCountingSettings];
        UI.showNotification("Advance settings saved.");
        UI.closeModal('advance-settings-modal');
    },
    populateAdvanceSettingsEditor() {
        const container = document.getElementById('advance-settings-body');
        container.innerHTML = `<div class="flex items-center gap-2 border-b border-brand-700 mb-4"><button class="tab-button active" data-tab="bonus-tiers">Bonus Tiers</button><button class="tab-button" data-tab="points">Points</button><button class="tab-button" data-tab="counting">Counting Logic</button></div><div id="tab-bonus-tiers" class="tab-content active"><div id="bonus-tier-editor-container" class="space-y-2"></div><button id="add-tier-btn" class="btn-secondary mt-4">Add Tier</button></div><div id="tab-points" class="tab-content"><div class="space-y-4"><div><label for="setting-ir-modifier">IR Modifier</label><input type="number" step="0.1" id="setting-ir-modifier" class="input-field w-full mt-1"></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div><label for="setting-qc-points">QC</label><input type="number" step="0.01" id="setting-qc-points" class="input-field w-full mt-1"></div><div><label for="setting-i3qa-points">i3QA</label><input type="number" step="0.01" id="setting-i3qa-points" class="input-field w-full mt-1"></div><div><label for="setting-rv1-points">RV1</label><input type="number" step="0.01" id="setting-rv1-points" class="input-field w-full mt-1"></div><div><label for="setting-rv1-combo-points">RV1 Combo</label><input type="number" step="0.01" id="setting-rv1-combo-points" class="input-field w-full mt-1"></div><div><label for="setting-rv2-points">RV2</label><input type="number" step="0.01" id="setting-rv2-points" class="input-field w-full mt-1"></div></div><div class="table-container text-sm border border-brand-700 rounded-md"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th colspan="4" class="p-2 text-left font-bold text-white">Category Point Values (GSD)</th></tr><tr><th class="p-2 text-center">Cat</th><th class="p-2 text-center">3in/4in/6in</th><th class="p-2 text-center">9in</th></tr></thead><tbody>${Object.entries(AppState.calculationSettings.categoryValues).map(([cat, values]) => `<tr><td class="p-2 text-center">${cat}</td><td class="p-2 text-center">${values['3in'].toFixed(2)}</td><td class="p-2 text-center">${values['9in'].toFixed(2)}</td></tr>`).join('')}</tbody></table></div></div></div><div id="tab-counting" class="tab-content"><div class="space-y-4"><div><label for="setting-refix-labels">Refix Labels (Comma-separated, e.g., i)</label><input type="text" id="setting-refix-labels" class="input-field w-full mt-1"></div><div><label for="setting-refix-columns">Refix Columns (Comma-separated, e.g., rv1_label, rv2_label)</label><input type="text" id="setting-refix-columns" class="input-field w-full mt-1"></div><div><label for="setting-miss-labels">Fix Points Miss/Correct Labels (Comma-separated, e.g., m, c)</label><input type="text" id="setting-miss-labels" class="input-field w-full mt-1"></div><div><label for="setting-miss-columns">Fix Points Miss/Correct Columns (Comma-separated, e.g., i3qa_label, rv1_label)</label><input type="text" id="setting-miss-columns" class="input-field w-full mt-1"></div><div><label for="setting-warning-labels">Warning Labels (Comma-separated, e.g., b, c, d)</label><input type="text" id="setting-warning-labels" class="input-field w-full mt-1"></div><div><label for="setting-warning-columns">Warning Columns (Comma-separated, e.g., r1_warn, r2_warn)</label><input type="text" id="setting-warning-columns" class="input-field w-full mt-1"></div><div><label for="setting-qc-penalty-labels">i3qa Penalty/Warning Labels (Comma-separated, e.g., m, e)</label><input type="text" id="setting-qc-penalty-labels" class="input-field w-full mt-1"></div><div><label for="setting-qc-penalty-columns">i3qa Penalty/Warning Columns (Comma-separated, e.g., i3qa_label)</label><input type="text" id="setting-qc-penalty-columns" class="input-field w-full mt-1"></div></div></div>`;

        // Populate values
        AppState.bonusTiers.forEach(tier => UI.addBonusTierRow(tier.quality, tier.bonus));
        document.getElementById('setting-ir-modifier').value = AppState.calculationSettings.irModifierValue;
        Object.entries(AppState.calculationSettings.points).forEach(([key, value]) => {
            const el = document.getElementById(`setting-${key}-points`);
            if (el) el.value = value;
        });
        Object.entries(AppState.countingSettings.triggers).forEach(([key, trigger]) => {
            document.getElementById(`setting-${key}-labels`).value = trigger.labels.join(', ');
            document.getElementById(`setting-${key}-columns`).value = trigger.columns.join(', ');
        });

        // Add tab switching logic
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
            });
        });
    },
    addBonusTierRow(quality = 90, bonus = 0.8) {
        const container = document.getElementById('bonus-tier-editor-container');
        const row = document.createElement('div');
        row.className = 'flex gap-2 bonus-tier-row';
        row.innerHTML = `<input type="number" step="0.5" min="0" max="100" class="tier-quality input-field w-1/3" value="${quality}"><span>% Quality =</span><input type="number" step="0.01" min="0" max="2" class="tier-bonus input-field w-1/3" value="${bonus}"><span class="w-1/3">x Bonus</span><button class="delete-tier-btn control-btn-icon-danger"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>`;
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
            try {
                // Decompress
                const rawData = pako.inflate(atob(data.rawData), { to: 'string' });
                return { ...data, rawData };
            } catch (error) {
                console.error("Error decompressing project data:", error);
                UI.showNotification(`Error loading project ${data.name}. Project data may be corrupt.`, true);
                return null;
            }
        }
        return data;
    },
    async loadAdminProjectList() {
        const { db, collection, getDocs, query, orderBy } = AppState.firebase.tools;
        const tbody = document.getElementById('admin-project-list-tbody');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading projects...</td></tr>';
        try {
            const q = query(collection(db, "projects"), orderBy("projectOrder", "desc"));
            const querySnapshot = await getDocs(q);
            tbody.innerHTML = '';
            
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `<td class="p-2 font-semibold">${data.name}</td><td class="p-2">${data.projectOrder || 'N/A'}</td><td class="p-2">${data.gsdValue}</td><td class="p-2"><button class="btn-sm admin-toggle-release-btn ${data.isReleased ? 'btn-success' : 'btn-danger'}" data-project-id="${doc.id}" data-is-released="${data.isReleased}">${data.isReleased ? 'Released' : 'Draft'}</button></td><td class="p-2"><button class="btn-sm btn-secondary admin-edit-project-btn" data-project-id="${doc.id}">Edit</button></td>`;
                tbody.appendChild(row);
            });
            if (querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No cloud projects found.</td></tr>';
            }
        } catch (error) {
            console.error("Error loading admin projects:", error);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-400">Error: Could not load projects.</td></tr>';
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
        AppState.guidedSetup.tourStep = 0;
        this.updateGuidedSetupView();
        UI.openModal('guided-setup-modal');
    },
    updateGuidedSetupView() {
        const modal = document.getElementById('guided-setup-modal');
        if (!modal) return;
        
        document.querySelectorAll('.setup-step').forEach(step => step.classList.add('hidden'));
        document.getElementById(`step-${AppState.guidedSetup.currentStep}`).classList.remove('hidden');
        document.getElementById('setup-step-count').textContent = `Step ${AppState.guidedSetup.currentStep} of ${AppState.guidedSetup.totalSteps}`;

        const prevBtn = document.getElementById('setup-prev-btn');
        const nextBtn = document.getElementById('setup-next-btn');
        const startTourBtn = document.getElementById('start-tour-btn');
        const finishBtn = document.getElementById('finish-setup-btn');

        [prevBtn, nextBtn, startTourBtn, finishBtn].forEach(btn => btn.classList.add('hidden'));

        if (AppState.guidedSetup.currentStep === 1) {
            nextBtn.classList.remove('hidden');
        } else if (AppState.guidedSetup.currentStep === 2) {
            // Team Setup
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
            document.getElementById('setup-team-list').innerHTML = '';
            Object.entries(CONSTANTS.DEFAULT_TEAMS).forEach(([teamName, techIds]) => UI.addTeamCard(teamName, techIds, 'setup-team-list'));
        } else if (AppState.guidedSetup.currentStep === 3) {
            // Tour
            prevBtn.classList.remove('hidden');
            startTourBtn.classList.remove('hidden');
            AppState.guidedSetup.tourElements = [
                { id: 'project-select', text: 'All your saved projects can be quickly loaded here.' },
                { id: 'techData', text: 'This is where you paste or drop your raw TSV data for calculation.' },
                { id: 'calculate-btn', text: 'Click this button to run the calculation on the data provided.' },
                { id: 'tech-results-table', text: 'The results are displayed here, showing points, tasks, quality, and final payout.' },
                { id: 'leaderboard-panel', text: 'This panel shows the top 3 performers based on your selected metric.' },
                { id: 'tl-summary-card', text: 'The Team Lead summary provides an overview of team quality and Fix4 breakdown.' },
            ];
            this.clearSpotlight();
        } else if (AppState.guidedSetup.currentStep === 4) {
            // Finish
            prevBtn.classList.remove('hidden');
            finishBtn.classList.remove('hidden');
            this.clearSpotlight();
        }
    },
    startTour() {
        UI.closeModal('guided-setup-modal');
        AppState.guidedSetup.tourStep = 0;
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
        this.spotlightElement(element, text);
    },
    spotlightElement(element, text) {
        const overlay = document.getElementById('spotlight-overlay');
        overlay.classList.remove('hidden');
        element.classList.add('spotlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const tooltip = document.createElement('div');
        tooltip.id = 'spotlight-tooltip';
        tooltip.className = 'spotlight-tooltip bottom';
        tooltip.innerHTML = `${text}<div class="flex justify-end mt-4 gap-2"><button id="tour-next-btn" class="btn-primary">Next</button></div>`;
        document.body.appendChild(tooltip);

        requestAnimationFrame(() => {
            const rect = element.getBoundingClientRect();
            let top = rect.bottom + 10;
            let left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);

            // Keep tooltip on screen (simple check)
            if (left < 10) left = 10;
            if (left + tooltip.offsetWidth > window.innerWidth - 10) left = window.innerWidth - tooltip.offsetWidth - 10;
            if (top + tooltip.offsetHeight > window.innerHeight) {
                // If it goes off the bottom, put it above the element
                top = rect.top - tooltip.offsetHeight - 10;
                tooltip.classList.remove('bottom');
                tooltip.classList.add('top');
            } else {
                tooltip.classList.remove('top');
                tooltip.classList.add('bottom');
            }


            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;

            document.getElementById('tour-next-btn').onclick = () => {
                AppState.guidedSetup.tourStep++;
                this.runTourStep();
            };
        });

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
        UI.showNotification("Setup complete. Welcome!");
    },
    async loadAdminProjectList() {
        const { db, collection, getDocs, query, orderBy } = AppState.firebase.tools;
        const tbody = document.getElementById('admin-project-list-tbody');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading projects...</td></tr>';
        try {
            const q = query(collection(db, "projects"), orderBy("projectOrder", "desc"));
            const querySnapshot = await getDocs(q);
            tbody.innerHTML = '';
            
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `<td class="p-2 font-semibold">${data.name}</td><td class="p-2">${data.projectOrder || 'N/A'}</td><td class="p-2">${data.gsdValue}</td><td class="p-2"><button class="btn-sm admin-toggle-release-btn ${data.isReleased ? 'btn-success' : 'btn-danger'}" data-project-id="${doc.id}" data-is-released="${data.isReleased}">${data.isReleased ? 'Released' : 'Draft'}</button></td><td class="p-2"><button class="btn-sm btn-secondary admin-edit-project-btn" data-project-id="${doc.id}">Edit</button></td>`;
                tbody.appendChild(row);
            });
            if (querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No cloud projects found.</td></tr>';
            }
        } catch (error) {
            console.error("Error loading admin projects:", error);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-400">Error: Could not load projects.</td></tr>';
        }
    }
};

window.onload = Handlers.initializeApp;
