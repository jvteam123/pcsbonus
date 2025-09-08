// --- GLOBAL STATE ---
const AppState = {
    db: null, teamSettings: {}, bonusTiers: [], calculationSettings: {},
    countingSettings: {}, currentTechStats: {}, lastUsedGsdValue: '3in',
    currentSort: { column: 'payout', direction: 'desc' }
};

// --- CONSTANTS ---
const CONSTANTS = {
    TECH_ID_REGEX: /^\d{4}[a-zA-Z]{2}$/,
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
        taskColumns: { qc: ['qc1_id', 'qc2_id', 'qc3_id'], i3qa: ['i3qa_id'], rv1: ['rv1_id'], rv2: ['rv2_id'] },
        triggers: {
            refix: { labels: ['i'], columns: ['rv1_label', 'rv2_label', 'rv3_label'] },
            miss: { labels: ['m', 'c'], columns: ['i3qa_label', 'rv1_label', 'rv2_label', 'rv3_label'] },
            warning: { labels: ['b', 'c', 'd', 'e', 'f', 'g', 'i'], columns: ['r1_warn', 'r2_warn', 'r3_warn', 'r4_warn'] },
            qcPenalty: { labels: ['m', 'e'], columns: ['i3qa_label'] }
        }
    }
};

// --- DATABASE MODULE ---
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
                    <td class="font-bold text-accent">${tech.payout.toFixed(2)}</td>
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
    addTeamCard(teamName = '', techIds = []) {
        const container = document.getElementById('team-list-container');
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
        const techArray = Object.values(techStats).map(tech => {
             const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
             return { id: tech.id, fixTasks: tech.fixTasks, totalPoints: tech.points, fixQuality: denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0, };
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
        const topQuality = findTopTech('quality', (a, b) => {
            const qualityA = (a.fixTasks + a.refixTasks + a.warnings.length) > 0 ? (a.fixTasks / (a.fixTasks + a.refixTasks + a.warnings.length)) * 100 : 0;
            const qualityB = (b.fixTasks + b.refixTasks + b.warnings.length) > 0 ? (b.fixTasks / (b.fixTasks + b.refixTasks + b.warnings.length)) * 100 : 0;
            return qualityA > qualityB;
        });

        container.innerHTML = createSummaryCard('Top Points', topPoints.id, `${topPoints.points.toFixed(2)} pts`);
        container.innerHTML += createSummaryCard('Most Tasks', topTasks.id, `${topTasks.fixTasks} tasks`);
        const topQualityVal = (topQuality.fixTasks + topQuality.refixTasks + topQuality.warnings.length) > 0 ? (topQuality.fixTasks / (topQuality.fixTasks + topQuality.refixTasks + topQuality.warnings.length)) * 100 : 0;
        container.innerHTML += createSummaryCard('Best Quality', topQuality.id, `${topQualityVal.toFixed(2)}%`);
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
    showNotification(message) {
        const el = document.getElementById('update-notification');
        if (el) {
            el.textContent = message;
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
        const categoryBreakdownHTML = hasCategoryData ? `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4"><h4 class="font-semibold text-base text-white mb-2">Primary Fix Points</h4><div class="space-y-2">${summaryCategoryItems}<div class="summary-item summary-total">Total from Categories:<span class="font-mono">${totalCategoryPoints.toFixed(2)} pts</span></div></div></div>` : '';
        
        return `<div class="space-y-4 text-sm">${projectBreakdownHTML}<div class="p-3 bg-accent/10 rounded-lg border border-accent/50"><h4 class="font-semibold text-base text-accent mb-2">Final Payout</h4><div class="flex justify-between font-bold text-lg"><span class="text-white">Payout (PHP):</span><span class="text-accent font-mono">${finalPayout.toFixed(2)}</span></div></div>${categoryBreakdownHTML}<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Points Breakdown</h4><div class="space-y-1 font-mono"><div class="flex justify-between"><span class="text-brand-400">Fix Tasks:</span><span>${tech.pointsBreakdown.fix.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">QC Tasks:</span><span>${tech.pointsBreakdown.qc.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">i3qa Tasks:</span><span>${tech.pointsBreakdown.i3qa.toFixed(3)}</span></div><div class="flex justify-between"><span class="text-brand-400">RV Tasks:</span><span>${tech.pointsBreakdown.rv.toFixed(3)}</span></div>${tech.pointsBreakdown.qcTransfer > 0 ? `<div class="flex justify-between"><span class="text-brand-400">QC Transfers:</span><span>+${tech.pointsBreakdown.qcTransfer.toFixed(3)}</span></div>` : ''}<div class="flex justify-between border-t border-brand-600 mt-1 pt-1"><span class="text-white font-bold">Total Points:</span><span class="text-white font-bold">${tech.points.toFixed(3)}</span></div></div></div><div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Core Stats & Quality</h4><div class="grid grid-cols-2 gap-4"><div><span class="text-brand-400">Primary Fix:</span><span class="font-bold stat-orange">${tech.fixTasks}</span></div><div><span class="text-brand-400">AFP (AA):</span><span class="font-bold stat-green">${tech.afpTasks}</span></div><div><span class="text-brand-400">Refix:</span><span class="font-bold stat-red">${tech.refixTasks}</span></div><div><span class="text-brand-400">Warnings:</span><span class="font-bold stat-red">${tech.warnings.length}</span></div></div><div class="flex justify-between mt-4 pt-4 border-t border-brand-700"><span class="text-brand-400">Fix Quality %:</span><span class="font-mono font-bold">${fixQuality.toFixed(2)}%</span></div></div></div>`;
    },
    generateTeamBreakdownHTML(teamName, teamTechs, allTechStats, currentProjectName) {
        const projectBreakdown = {};
        let totalTeamPoints = 0;
        const isSingleProject = !Object.values(allTechStats)[0]?.isCombined;

        teamTechs.forEach(techId => {
            const tech = allTechStats[techId];
            if (!tech) return;
            totalTeamPoints += tech.points;
            if (isSingleProject) {
                if (!projectBreakdown[currentProjectName]) projectBreakdown[currentProjectName] = { points: 0, fixTasks: 0, refixTasks: 0, warnings: 0 };
                projectBreakdown[currentProjectName].points += tech.points;
                projectBreakdown[currentProjectName].fixTasks += tech.fixTasks;
                projectBreakdown[currentProjectName].refixTasks += tech.refixTasks;
                projectBreakdown[currentProjectName].warnings += tech.warnings.length;
            } else { // Combined
                for (const projectName in tech.pointsBreakdownByProject) {
                    const data = tech.pointsBreakdownByProject[projectName];
                    if (!projectBreakdown[projectName]) projectBreakdown[projectName] = { points: 0, fixTasks: 0, refixTasks: 0, warnings: 0 };
                    projectBreakdown[projectName].points += data.points;
                    projectBreakdown[projectName].fixTasks += data.fixTasks;
                    projectBreakdown[projectName].refixTasks += data.refixTasks;
                    projectBreakdown[projectName].warnings += data.warnings;
                }
            }
        });

        if (Object.keys(projectBreakdown).length === 0) return `<p class="text-brand-400">No data available for this team in the current calculation.</p>`;
        
        const projectRows = Object.entries(projectBreakdown).map(([name, data]) => `<tr><td class="p-2 font-semibold">${name}</td><td class="p-2 text-center">${data.points.toFixed(3)}</td><td class="p-2 text-center">${data.fixTasks}</td><td class="p-2 text-center">${data.refixTasks}</td><td class="p-2 text-center">${data.warnings}</td></tr>`).join('');
        return `<div class="space-y-4 text-sm"><div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Project Contribution</h4><div class="table-container text-sm"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th class="p-2 text-left">Project</th><th class="p-2 text-center">Points</th><th class="p-2 text-center">Fix</th><th class="p-2 text-center">Refix</th><th class="p-2 text-center">Warn</th></tr></thead><tbody>${projectRows}</tbody></table></div></div><div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700"><h4 class="font-semibold text-base text-white mb-2">Total Team Points</h4><div class="flex justify-between font-bold text-lg"><span class="text-white">Total Points:</span><span class="text-accent font-mono">${totalTeamPoints.toFixed(3)}</span></div></div></div>`;
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
        document.getElementById('merge-save-btn').disabled = true;
    },
    showLoading(button) { button.disabled = true; const loader = document.createElement('span'); loader.className = 'loader'; button.prepend(loader); },
    hideLoading(button) { button.disabled = false; button.querySelector('.loader')?.remove(); }
};

// --- CALCULATION MODULE ---
const Calculator = {
    createNewTechStat(isCombined = false, projectName = null) {
        const categoryCounts = {};
        for (let i = 1; i <= 9; i++) categoryCounts[i] = { primary: 0, i3qa: 0, afp: 0, rv: 0 };
        const baseStat = {
            id: '', points: 0, fixTasks: 0, afpTasks: 0, refixTasks: 0, warnings: [],
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
                    const techId = values[i]?.trim();
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

            const fixIds = [get('fix1_id'), get('fix2_id'), get('fix3_id'), get('fix4_id')].map(id => id?.trim());

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

            const addPointsForTask = (techId, points, field) => {
                if (techId && techStats[techId]) {
                    techStats[techId].points += points;
                    techStats[techId].pointsBreakdown[field] += points;
                }
            };
            taskColumns.qc.forEach(c => addPointsForTask(get(c)?.trim(), AppState.calculationSettings.points.qc, 'qc'));
            taskColumns.i3qa.forEach(c => addPointsForTask(get(c)?.trim(), AppState.calculationSettings.points.i3qa, 'i3qa'));
            taskColumns.rv1.forEach(c => addPointsForTask(get(c)?.trim(), isComboIR ? AppState.calculationSettings.points.rv1_combo : AppState.calculationSettings.points.rv1, 'rv'));
            taskColumns.rv2.forEach(c => addPointsForTask(get(c)?.trim(), AppState.calculationSettings.points.rv2, 'rv'));
            
            if (triggers.qcPenalty.columns.some(c => triggers.qcPenalty.labels.includes(get(c)?.trim().toLowerCase()))) {
                const i3qaTechId = get('i3qa_id')?.trim();
                if (i3qaTechId && techStats[i3qaTechId]) {
                    let pointsToTransfer = 0;
                    taskColumns.qc.forEach(c => {
                        const qcTechId = get(c)?.trim();
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
            
            const fix4Id = get('fix4_id')?.trim();
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

// --- EVENT HANDLERS AND HELPERS ---
const Handlers = {
    async initializeApp() {
        await DB.open();
        Handlers.setupEventListeners();
        document.body.classList.toggle('light-theme', localStorage.getItem('theme') === 'light');
        await Promise.all([ Handlers.fetchProjectListSummary(), Handlers.loadTeamSettings(), Handlers.loadBonusTiers(), Handlers.loadCalculationSettings(), Handlers.loadCountingSettings() ]);
        UI.setPanelHeights();
        window.addEventListener('resize', UI.setPanelHeights);
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
        const newTiers = Array.from(document.querySelectorAll('#bonus-tier-editor-container .tier-row')).map(row => ({ quality: parseFloat(row.querySelector('.tier-quality-input').value), bonus: parseFloat(row.querySelector('.tier-bonus-input').value) / 100 })).filter(t => !isNaN(t.quality) && !isNaN(t.bonus)).sort((a, b) => b.quality - a.quality);
        const newCalcSettings = {
            irModifierValue: parseFloat(document.getElementById('setting-ir-modifier').value),
            points: { qc: parseFloat(document.getElementById('setting-qc-points').value), i3qa: parseFloat(document.getElementById('setting-i3qa-points').value), rv1: parseFloat(document.getElementById('setting-rv1-points').value), rv1_combo: parseFloat(document.getElementById('setting-rv1-combo-points').value), rv2: parseFloat(document.getElementById('setting-rv2-points').value) },
            categoryValues: Object.fromEntries(Array.from({length: 9}, (_, i) => [i + 1, { "3in": parseFloat(document.querySelector(`tr[data-category="${i+1}"] input[data-gsd="3in"]`).value), "4in": parseFloat(document.querySelector(`tr[data-category="${i+1}"] input[data-gsd="4in"]`).value), "6in": parseFloat(document.querySelector(`tr[data-category="${i+1}"] input[data-gsd="6in"]`).value), "9in": parseFloat(document.querySelector(`tr[data-category="${i+1}"] input[data-gsd="9in"]`).value) }]))
        };
        const newCountingSettings = {
            taskColumns: { qc: getValues('setting-qc-cols'), i3qa: getValues('setting-i3qa-cols'), rv1: getValues('setting-rv1-cols'), rv2: getValues('setting-rv2-cols'), },
            triggers: { refix: { labels: getValues('setting-refix-labels'), columns: getValues('setting-refix-cols') }, miss: { labels: getValues('setting-miss-labels'), columns: getValues('setting-miss-cols') }, warning: { labels: getValues('setting-warning-labels'), columns: getValues('setting-warning-cols') }, qcPenalty: { labels: getValues('setting-qc-penalty-labels'), columns: getValues('setting-qc-penalty-cols') } }
        };
        await Promise.all([ DB.put('bonusTiers', { id: 'customTiers', tiers: newTiers }), DB.put('calculationSettings', { id: 'customSettings', settings: newCalcSettings }), DB.put('countingSettings', { id: 'customCounting', settings: newCountingSettings }) ]);
        [AppState.bonusTiers, AppState.calculationSettings, AppState.countingSettings] = [newTiers, newCalcSettings, newCountingSettings];
        UI.showNotification("Advance settings saved."); UI.closeModal('advance-settings-modal');
    },
    populateAdvanceSettingsEditor() {
        const container = document.getElementById('advance-settings-body');
        container.innerHTML = `<div class="flex items-center gap-2 border-b border-brand-700 mb-4"><button class="tab-button active" data-tab="bonus-tiers">Bonus Tiers</button><button class="tab-button" data-tab="points">Points</button><button class="tab-button" data-tab="counting">Counting Logic</button></div><div id="tab-bonus-tiers" class="tab-content active"><div id="bonus-tier-editor-container" class="space-y-2"></div><button id="add-tier-btn" class="btn-secondary mt-4">Add Tier</button></div><div id="tab-points" class="tab-content"><div class="space-y-4"><div><label for="setting-ir-modifier">IR Modifier</label><input type="number" step="0.1" id="setting-ir-modifier" class="input-field w-full mt-1"></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div><label for="setting-qc-points">QC</label><input type="number" step="0.01" id="setting-qc-points" class="input-field w-full mt-1"></div><div><label for="setting-i3qa-points">i3QA</label><input type="number" step="0.01" id="setting-i3qa-points" class="input-field w-full mt-1"></div><div><label for="setting-rv1-points">RV1</label><input type="number" step="0.01" id="setting-rv1-points" class="input-field w-full mt-1"></div><div><label for="setting-rv1-combo-points">RV1 Combo</label><input type="number" step="0.01" id="setting-rv1-combo-points" class="input-field w-full mt-1"></div><div><label for="setting-rv2-points">RV2</label><input type="number" step="0.01" id="setting-rv2-points" class="input-field w-full mt-1"></div></div><div class="table-container text-sm border border-brand-700 rounded-md"><table class="min-w-full"><thead class="bg-brand-800"><tr><th>Category</th><th>3in</th><th>4in</th><th>6in</th><th>9in</th></tr></thead><tbody id="category-points-tbody"></tbody></table></div></div></div><div id="tab-counting" class="tab-content"><div class="space-y-4"><div><h4 class="font-semibold">Task Columns</h4><div class="grid grid-cols-2 gap-4"><div><label>QC</label><input type="text" id="setting-qc-cols" class="input-field w-full mt-1"></div><div><label>i3QA</label><input type="text" id="setting-i3qa-cols" class="input-field w-full mt-1"></div><div><label>RV1</label><input type="text" id="setting-rv1-cols" class="input-field w-full mt-1"></div><div><label>RV2</label><input type="text" id="setting-rv2-cols" class="input-field w-full mt-1"></div></div></div><div><h4 class="font-semibold">Trigger Conditions</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label>Refix Labels</label><input type="text" id="setting-refix-labels" class="input-field w-full mt-1"></div><div><label>Refix Columns</label><input type="text" id="setting-refix-cols" class="input-field w-full mt-1"></div><div><label>Miss Labels</label><input type="text" id="setting-miss-labels" class="input-field w-full mt-1"></div><div><label>Miss Columns</label><input type="text" id="setting-miss-cols" class="input-field w-full mt-1"></div><div><label>Warning Labels</label><input type="text" id="setting-warning-labels" class="input-field w-full mt-1"></div><div><label>Warning Columns</label><input type="text" id="setting-warning-cols" class="input-field w-full mt-1"></div><div><label>QC Penalty Labels</label><input type="text" id="setting-qc-penalty-labels" class="input-field w-full mt-1"></div><div><label>QC Penalty Columns</label><input type="text" id="setting-qc-penalty-cols" class="input-field w-full mt-1"></div></div></div></div></div>`;
        const tierContainer = document.getElementById('bonus-tier-editor-container');
        tierContainer.innerHTML = `<div class="grid grid-cols-3 gap-4 font-semibold text-gray-400 pb-2 border-b border-gray-600"><span>Min. Quality %</span><span>Bonus Earned %</span><span>Action</span></div>`;
        AppState.bonusTiers.forEach(t => this.addBonusTierRow(t.quality, t.bonus * 100));
        document.getElementById('add-tier-btn').addEventListener('click', () => this.addBonusTierRow());
        document.getElementById('setting-ir-modifier').value = AppState.calculationSettings.irModifierValue;
        Object.keys(AppState.calculationSettings.points).forEach(k => {
            const pointInput = document.getElementById(`setting-${k.replace('_','-')}-points`);
            if (pointInput) {
                pointInput.value = AppState.calculationSettings.points[k];
            }
        });
        document.getElementById('category-points-tbody').innerHTML = Object.entries(AppState.calculationSettings.categoryValues).map(([cat, gsd]) => `<tr data-category="${cat}"><td>Cat ${cat}</td>${Object.entries(gsd).map(([size, val]) => `<td><input type="number" step="0.01" class="input-field w-full p-1" data-gsd="${size}" value="${val}"></td>`).join('')}</tr>`).join('');
        Object.keys(AppState.countingSettings.taskColumns).forEach(k => {
            const taskColInput = document.getElementById(`setting-${k}-cols`);
            if (taskColInput) {
                taskColInput.value = AppState.countingSettings.taskColumns[k].join(', ');
            }
        });
        Object.keys(AppState.countingSettings.triggers).forEach(k => {
            const kebabCaseKey = k.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
            const labelsInput = document.getElementById(`setting-${kebabCaseKey}-labels`);
            if (labelsInput) {
                labelsInput.value = AppState.countingSettings.triggers[k].labels.join(', ');
            }
            const colsInput = document.getElementById(`setting-${kebabCaseKey}-cols`);
            if (colsInput) {
                colsInput.value = AppState.countingSettings.triggers[k].columns.join(', ');
            }
        });
        container.querySelectorAll('.tab-button').forEach(tab => tab.addEventListener('click', () => { container.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active')); tab.classList.add('active'); document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active'); }));
    },
    addBonusTierRow(quality = '', bonus = '') {
        const row = document.createElement('div');
        row.className = 'tier-row grid grid-cols-3 gap-4 items-center';
        row.innerHTML = `<input type="number" step="0.5" class="tier-quality-input w-full p-2 input-field" value="${quality}"><input type="number" step="1" class="tier-bonus-input w-full p-2 input-field" value="${bonus}"><button class="delete-tier-btn bg-red-600/80 text-white rounded-lg hover:bg-red-700 text-sm p-2">Delete</button>`;
        document.getElementById('bonus-tier-editor-container').appendChild(row);
        row.querySelector('.delete-tier-btn').addEventListener('click', () => row.remove());
    },
    async loadTeamSettings() {
        const teamsData = await DB.get('teams', 'teams');
        AppState.teamSettings = (teamsData && Object.keys(teamsData.settings).length > 0) ? teamsData.settings : CONSTANTS.DEFAULT_TEAMS;
        UI.populateTeamFilters();
        UI.populateAdminTeamManagement();
    },
    async saveTeamSettings() {
        const newSettings = {};
        document.querySelectorAll('#team-list-container .team-card').forEach(div => {
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
        const compressed = pako.deflate(new TextEncoder().encode(projectData.rawData));
        const base64 = btoa(String.fromCharCode.apply(null, compressed));
        await DB.put('projects', { ...projectData, rawData: base64, projectOrder: projectData.projectOrder || Date.now() });
        UI.showNotification("Project saved/updated.");
    },
    async fetchProjectListSummary() {
        const projects = await DB.getAll('projects');
        UI.populateProjectSelect(projects.map(p => ({ id: p.id, name: p.name })).sort((a, b) => (b.projectOrder || 0) - (a.projectOrder || 0)));
    },
    async fetchFullProjectData(projectId) {
        const data = await DB.get('projects', projectId);
        if (data && data.rawData) {
            const compressed = new Uint8Array(atob(data.rawData).split('').map(c => c.charCodeAt(0)));
            data.rawData = pako.inflate(compressed, { to: 'string' });
            return data;
        }
        return null;
    },
    async deleteProjectFromIndexedDB(projectId) {
        if (confirm("Delete this project? This cannot be undone.")) {
            await DB.delete('projects', projectId);
            await this.fetchProjectListSummary();
            UI.showNotification("Project deleted.");
            this.loadProjectIntoForm("");
        }
    },
    async loadProjectIntoForm(projectId) {
        const refreshBtn = document.getElementById('refresh-projects-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('spinning');
            refreshBtn.disabled = true;
        }
        try {
            const projectData = projectId ? await this.fetchFullProjectData(projectId) : null;
            document.getElementById('techData').value = projectData?.rawData || '';
            document.getElementById('techData').readOnly = !!projectData;
            document.getElementById('project-name').value = projectData?.name || '';
            document.getElementById('project-name').readOnly = !!projectData;
            document.getElementById('is-ir-project-checkbox').checked = projectData?.isIRProject || false;
            document.getElementById('is-ir-project-checkbox').disabled = !!projectData;
            document.getElementById('gsd-value-select').value = projectData?.gsdValue || '3in';
            document.getElementById('gsd-value-select').disabled = !!projectData;
            document.getElementById('edit-data-btn').classList.toggle('hidden', !projectData);
            document.getElementById('save-project-btn').disabled = !!projectData;
            document.getElementById('cancel-edit-btn').classList.add('hidden');
            const irBadge = document.getElementById('project-ir-badge');
            irBadge.classList.toggle('hidden', !projectData);
            if(projectData) {
                irBadge.textContent = projectData.isIRProject ? 'IR' : 'Non-IR';
                irBadge.className = `project-info-badge ${projectData.isIRProject ? 'is-ir' : 'is-not-ir'}`;
            }
        } finally {
            if (refreshBtn) {
                refreshBtn.classList.remove('spinning');
                refreshBtn.disabled = false;
            }
        }
    },
    async handleDroppedFiles(files) {
        document.getElementById('project-select').value = '';
        UI.resetUIForNewCalculation();
        const fileGroups = {};
        for (const file of files) {
            const baseName = file.name.split('.')[0];
            fileGroups[baseName] = fileGroups[baseName] || {};
            const ext = file.name.split('.').pop().toLowerCase();
            if (['shp', 'dbf'].includes(ext)) fileGroups[baseName][ext] = file;
        }
        let allFeatures = [];
        let count = 0;
        for (const group of Object.values(fileGroups)) {
            if (group.shp && group.dbf) {
                const geojson = await shapefile.read(await group.shp.arrayBuffer(), await group.dbf.arrayBuffer());
                if (geojson && geojson.features) { allFeatures.push(...geojson.features); count++; }
            }
        }
        if (allFeatures.length > 0) {
            const properties = allFeatures.map(f => f.properties);
            const headers = Object.keys(properties[0]);
            let tsv = headers.join('\t') + '\n';
            properties.forEach(row => { tsv += headers.map(h => row[h] ?? '').join('\t') + '\n'; });
            document.getElementById('techData').value = tsv;
            UI.showNotification(`${count} shapefile set(s) processed.`);
        } else {
           alert("No valid .shp/.dbf pairs found.");
        }
    },
    clearAllData() {
        if (confirm("Clear ALL data? This deletes projects and resets all settings.")) {
            if (AppState.db) AppState.db.close();
            const req = indexedDB.deleteDatabase('BonusCalculatorDB');
            req.onsuccess = () => { alert("All data cleared. Page will reload."); location.reload(); };
            req.onerror = () => alert("Error clearing data.");
            req.onblocked = () => alert("Could not clear data. Close other tabs with this tool open.");
        }
    },
    setupEventListeners() {
        const listen = (id, event, handler) => document.getElementById(id)?.addEventListener(event, handler);
        listen('merge-fixpoints-btn', 'click', () => { UI.resetMergeModal(); UI.openModal('merge-fixpoints-modal'); });
        listen('manage-teams-btn', 'click', () => { UI.populateAdminTeamManagement(); UI.openModal('manage-teams-modal'); });
        listen('advance-settings-btn', 'click', () => { this.populateAdvanceSettingsEditor(); UI.openModal('advance-settings-modal'); });
        listen('toggle-theme-btn', 'click', () => { document.body.classList.toggle('light-theme'); localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark'); });
        listen('save-advance-settings-btn', 'click', this.saveAdvanceSettings);
        listen('important-info-btn', 'click', () => UI.openModal('important-info-modal'));
        listen('bug-report-btn', 'click', () => window.open("https://teams.microsoft.com/l/chat/48:notes/conversations?context=%7B%22contextType%22%3A%22chat%22%7D", "_blank"));
        listen('clear-data-btn', 'click', this.clearAllData);
        document.body.addEventListener('click', e => {
            const techIcon = e.target.closest('.tech-summary-icon');
            if (techIcon) UI.openTechSummaryModal(techIcon.dataset.techId);
            const teamLabel = e.target.closest('.team-summary-trigger');
            if (teamLabel) UI.openTeamSummaryModal(teamLabel.dataset.teamName);
            const sortHeader = e.target.closest('.sortable-header');
            if (sortHeader) {
                const column = sortHeader.dataset.sort;
                AppState.currentSort.direction = AppState.currentSort.column === column && AppState.currentSort.direction === 'desc' ? 'asc' : 'desc';
                AppState.currentSort.column = column;
                UI.applyFilters();
            }
        });
        listen('refresh-projects-btn', 'click', this.fetchProjectListSummary);
        listen('project-select', 'change', e => this.loadProjectIntoForm(e.target.value));
        listen('delete-project-btn', 'click', () => { const id = document.getElementById('project-select').value; if(id) this.deleteProjectFromIndexedDB(id); });
        listen('edit-data-btn', 'click', () => {
            ['techData', 'project-name', 'is-ir-project-checkbox', 'gsd-value-select'].forEach(id => document.getElementById(id).disabled = false);
            document.getElementById('techData').readOnly = false; document.getElementById('project-name').readOnly = false;
            document.getElementById('edit-data-btn').classList.add('hidden');
            document.getElementById('save-project-btn').disabled = false;
            document.getElementById('cancel-edit-btn').classList.remove('hidden');
        });
        listen('cancel-edit-btn', 'click', () => this.loadProjectIntoForm(document.getElementById('project-select').value));
        listen('save-project-btn', 'click', async e => {
            const button = e.target; UI.showLoading(button);
            const name = document.getElementById('project-name').value.trim();
            const data = document.getElementById('techData').value.trim();
            if (!name || !data) { alert("Project Name and Data are required."); UI.hideLoading(button); return; }
            const existingId = document.getElementById('project-select').value;
            const projectId = existingId && !document.getElementById('techData').readOnly ? existingId : `${name.replace(/\W/g, '_').toLowerCase()}_${Date.now()}`;
            const projectData = { id: projectId, name: name, rawData: data, isIRProject: document.getElementById('is-ir-project-checkbox').checked, gsdValue: document.getElementById('gsd-value-select').value };
            await this.saveProjectToIndexedDB(projectData);
            await this.fetchProjectListSummary();
            document.getElementById('project-select').value = projectData.id;
            await this.loadProjectIntoForm(projectData.id);
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
                        if (!combinedStats[techId].pointsBreakdownByProject[project.name]) combinedStats[techId].pointsBreakdownByProject[project.name] = { points: 0, fixTasks: 0, refixTasks: 0, warnings: 0 };
                        const projBreakdown = combinedStats[techId].pointsBreakdownByProject[project.name];
                        projBreakdown.points += stat.points; projBreakdown.fixTasks += stat.fixTasks; projBreakdown.refixTasks += stat.refixTasks; projBreakdown.warnings += stat.warnings.length;
                    }
                }
            } else { // Single project / pasted data
                const project = projectIds.length > 0 ? await this.fetchFullProjectData(projectIds[0]) : null;
                const data = project ? project.rawData : document.getElementById('techData').value.trim();
                const name = project ? project.name : 'Pasted Data';
                const isIR = project ? project.isIRProject : document.getElementById('is-ir-project-checkbox').checked;
                const gsd = project ? project.gsdValue : document.getElementById('gsd-value-select').value;
                if (!data) return alert("No data to calculate.");
                AppState.lastUsedGsdValue = gsd;
                const parsed = Calculator.parseRawData(data, isIR, name, gsd);
                if (parsed) combinedStats = parsed.techStats;
            }
            AppState.currentTechStats = combinedStats;
            UI.applyFilters();
            let title = 'Bonus Payouts for: ';
            if (isCombined) title += projectIds.length > 1 ? 'Selected Projects' : (await this.fetchFullProjectData(projectIds[0]))?.name || '...';
            else title += projectIds.length > 0 ? (await this.fetchFullProjectData(projectIds[0]))?.name : 'Pasted Data';
            document.getElementById('results-title').textContent = title;
        };
        listen('calculate-btn', 'click', async e => {
            const button = e.target; UI.showLoading(button);
            const projectId = document.getElementById('project-select').value;
            await runCalculation(false, projectId ? [projectId] : []);
            UI.hideLoading(button);
        });
        listen('calculate-all-btn', 'click', async e => {
            const button = e.target; UI.showLoading(button);
            const selectEl = document.getElementById('project-select');
            const isCustom = document.getElementById('customize-calc-all-cb').checked;
            const allProjectIds = (await DB.getAll('projects')).map(p => p.id);
            const selectedIds = Array.from(selectEl.selectedOptions).map(opt => opt.value);
            const idsToRun = isCustom ? selectedIds : allProjectIds;
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
        listen('refresh-teams-btn', 'click', this.loadTeamSettings);
        listen('leaderboard-sort-select', 'change', () => UI.applyFilters());
        listen('add-team-btn', 'click', () => UI.addTeamCard());
        listen('save-teams-btn', 'click', this.saveTeamSettings);
        listen('drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.add('bg-brand-700'); });
        listen('drop-zone', 'dragleave', e => e.target.closest('#drop-zone').classList.remove('bg-brand-700'));
        listen('drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.remove('bg-brand-700'); this.handleDroppedFiles(e.dataTransfer.files); });
    }
};

document.addEventListener('DOMContentLoaded', Handlers.initializeApp);
