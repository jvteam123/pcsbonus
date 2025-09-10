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
            const request = indexedDB.open('BonusCalculatorDB', 4);
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
                    input.value = '';
                } else {
                    alert('Tech ID already exists in this team.');
                }
            } else {
                alert('Invalid Tech ID format. Must be 4 digits followed by 2 letters (e.g., 7244AA).');
            }
        });
    },
    addTechTag(list, techId) {
        const techName = techNameDatabase[techId] || 'Unknown';
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.dataset.techId = techId;
        tag.innerHTML = `${techId} (${techName}) <button class="remove-tech-btn"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button>`;
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
        const leaderboardTbody = document.getElementById('leaderboard-tbody');
        const leaderboardTable = document.getElementById('leaderboard-table');
        if (!leaderboardTbody || !leaderboardTable) return;

        const techArray = Object.values(techStats);
        if (techArray.length === 0) {
            leaderboardTable.classList.add('hidden');
            return;
        }

        leaderboardTable.classList.remove('hidden');
        leaderboardTbody.innerHTML = '';
        
        const leaderboardSortKey = document.getElementById('leaderboard-sort-select')?.value || 'points';
        const sortedTechs = [...techArray].sort((a, b) => b[leaderboardSortKey] - a[leaderboardSortKey]).slice(0, 10);
        
        sortedTechs.forEach((tech, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="font-bold text-white">${index + 1}</td><td>${tech.id}</td><td>${tech[leaderboardSortKey].toFixed(2)}</td>`;
            leaderboardTbody.appendChild(row);
        });
    },
    updateTLSummary(techStats) {
        const teamQualityContainer = document.getElementById('team-quality-container');
        const workloadContainer = document.getElementById('team-workload-container');
        const fix4Container = document.getElementById('tl-fix4-breakdown');
        
        if (!teamQualityContainer || !workloadContainer || !fix4Container) return;

        teamQualityContainer.innerHTML = '';
        workloadContainer.innerHTML = '';
        fix4Container.innerHTML = '';
        
        const teamStats = {};
        const getTeamName = (techId) => Object.keys(AppState.teamSettings).find(team => AppState.teamSettings[team].includes(techId)) || 'N/A';
        const selectedTeams = Array.from(document.querySelectorAll('#team-filter-container input:checked')).map(cb => cb.dataset.team);

        Object.values(techStats).forEach(tech => {
            const teamName = getTeamName(tech.id);
            if (teamName !== 'N/A' && (selectedTeams.length === 0 || selectedTeams.includes(teamName))) {
                if (!teamStats[teamName]) {
                    teamStats[teamName] = { fixTasks: 0, refixTasks: 0, warnings: 0, totalPoints: 0, techCount: 0 };
                }
                teamStats[teamName].fixTasks += tech.fixTasks;
                teamStats[teamName].refixTasks += tech.refixTasks;
                teamStats[teamName].warnings += tech.warnings.length;
                teamStats[teamName].totalPoints += tech.points;
                teamStats[teamName].techCount++;
            }
        });

        // Team Quality
        Object.entries(teamStats).forEach(([teamName, stats]) => {
            const denominator = stats.fixTasks + stats.refixTasks + stats.warnings;
            const quality = denominator > 0 ? (stats.fixTasks / denominator) * 100 : 0;
            const qualityClass = quality >= 95 ? 'quality-bar-green' : quality >= 85 ? 'quality-bar-orange' : 'quality-bar-red';
            const qualityEl = document.createElement('div');
            qualityEl.className = 'flex justify-between items-center bg-brand-900/50 p-3 rounded-lg border border-brand-700';
            qualityEl.innerHTML = `
                <span class="text-white font-medium">${teamName}</span>
                <span class="quality-pill ${qualityClass.replace('quality-bar-', 'quality-pill-')}">${quality.toFixed(2)}%</span>
            `;
            teamQualityContainer.appendChild(qualityEl);
        });

        // Team Workload
        const totalTasks = Object.values(techStats).reduce((sum, tech) => sum + tech.fixTasks, 0);
        Object.entries(teamStats).sort(([, a], [, b]) => b.fixTasks - a.fixTasks).forEach(([teamName, stats]) => {
            const percentage = totalTasks > 0 ? (stats.fixTasks / totalTasks) * 100 : 0;
            const workloadEl = document.createElement('div');
            workloadEl.className = 'workload-bar-container';
            workloadEl.innerHTML = `
                <div class="workload-label flex justify-between">
                    <span class="text-sm font-medium">${teamName}</span>
                    <span class="text-xs text-brand-400">${stats.fixTasks} tasks</span>
                </div>
                <div class="workload-bar bg-brand-700">
                    <div class="workload-bar-inner bg-accent" style="width: ${percentage.toFixed(2)}%;"></div>
                </div>
            `;
            workloadContainer.appendChild(workloadEl);
        });
        
        // Fix4 Breakdown
        const fix4CategoryCounts = {};
        Object.values(techStats).forEach(tech => {
            if (tech.fix4 && tech.fix4.length > 0) {
                tech.fix4.forEach(item => {
                    const teamName = getTeamName(tech.id);
                    if (teamName !== 'N/A' && (selectedTeams.length === 0 || selectedTeams.includes(teamName))) {
                         if (!fix4CategoryCounts[teamName]) {
                            fix4CategoryCounts[teamName] = {};
                        }
                        fix4CategoryCounts[teamName][item.category] = (fix4CategoryCounts[teamName][item.category] || 0) + 1;
                    }
                });
            }
        });

        if (Object.keys(fix4CategoryCounts).length > 0) {
            Object.entries(fix4CategoryCounts).forEach(([teamName, categories]) => {
                 const rows = Object.entries(categories).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([cat, count]) => `<tr><td class="p-2">Category ${cat}</td><td class="p-2">${count}</td></tr>`).join('');
                fix4Container.innerHTML += `<div class="table-container text-sm mb-4"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th colspan="2" class="p-2 text-left font-bold text-white">${teamName}</th></tr><tr><th class="p-2 text-left">Category</th><th class="p-2 text-left">Count</th></tr></thead><tbody>${rows}</tbody></table></div>`;
            });
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
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('hidden');
    },
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.add('hidden');
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
            const primaryTasks = (counts.primary || 0) + (counts.i3qa || 0);
            const rv1Tasks = counts.rv1 || 0;
            const rv2Tasks = counts.rv2 || 0;
            const totalTasks = primaryTasks + rv1Tasks + rv2Tasks;
            if (totalTasks > 0) {
                hasCategoryData = true;
                const points = (counts.primary * AppState.calculationSettings.points.qc) +
                                (counts.i3qa * AppState.calculationSettings.points.i3qa) +
                                (counts.rv1 * AppState.calculationSettings.points.rv1) +
                                (counts.rv2 * AppState.calculationSettings.points.rv2);
                totalCategoryPoints += points;
                summaryCategoryItems += `<div class="summary-item summary-cat-${i}"><div class="summary-label">Category ${i}</div><div class="summary-value-group"><span class="summary-task-count">${totalTasks} tasks</span><span class="summary-points-total">${points.toFixed(3)} pts</span></div></div>`;
            }
        }
        const totalPointsDifference = tech.points - totalCategoryPoints;
        const totalPointsText = totalPointsDifference > 0.001 ? `${tech.points.toFixed(3)} pts` : `${totalCategoryPoints.toFixed(3)} pts`;
        
        let fix4BreakdownHtml = '';
        if (tech.fix4 && tech.fix4.length > 0) {
            const fix4Rows = tech.fix4.map(item => `<tr><td class="p-2">${item.category}</td><td class="p-2">${item.subCategory}</td><td class="p-2">${item.techId}</td><td class="p-2">${item.errorCount}</td></tr>`).join('');
            fix4BreakdownHtml = `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4 mb-4"><h4 class="font-semibold text-base text-white mb-2">Fix4 Breakdown</h4><div class="table-container text-sm"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th class="p-2 text-left">Category</th><th class="p-2 text-left">Sub-category</th><th class="p-2 text-left">Tech ID</th><th class="p-2 text-left">Errors</th></tr></thead><tbody>${fix4Rows}</tbody></table></div></div>`;
        }
        
        return `<div class="flex-grow overflow-y-auto custom-scrollbar p-4 text-sm text-brand-400">
                    <h3 class="text-xl font-bold text-white mb-4">${tech.id} (${techNameDatabase[tech.id] || 'Unknown'})</h3>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-6">
                        <div class="summary-stat-card"><div class="text-xs text-brand-400">Total Points</div><div class="text-2xl font-bold text-white">${tech.points.toFixed(3)}</div></div>
                        <div class="summary-stat-card"><div class="text-xs text-brand-400">Fix Quality</div><div class="text-2xl font-bold text-white">${fixQuality.toFixed(2)}%</div></div>
                        <div class="summary-stat-card"><div class="text-xs text-brand-400">Bonus Earned</div><div class="text-2xl font-bold text-white">${(qualityModifier * 100).toFixed(2)}%</div></div>
                        <div class="summary-stat-card"><div class="text-xs text-brand-400">Est. Payout</div><div class="text-2xl font-bold text-white text-status-green">$${finalPayout.toFixed(2)}</div></div>
                    </div>
                    ${projectBreakdownHTML}
                    <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4 mb-4">
                        <h4 class="font-semibold text-base text-white mb-2">Task & Point Breakdown</h4>
                        <div class="summary-item"><div class="summary-label">Total Fix Tasks</div><div class="summary-value">${tech.fixTasks}</div></div>
                        <div class="summary-item"><div class="summary-label">Total Refix Tasks</div><div class="summary-value text-status-red">${tech.refixTasks}</div></div>
                        <div class="summary-item"><div class="summary-label">Total Warnings</div><div class="summary-value text-status-red">${tech.warnings.length}</div></div>
                        <div class="summary-item"><div class="summary-label">Total Points</div><div class="summary-value text-white">${totalPointsText}</div></div>
                    </div>
                    <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-2">
                        <h4 class="font-semibold text-base text-white">Category Contribution</h4>
                        ${hasCategoryData ? summaryCategoryItems : '<p class="text-brand-400">No category data available.</p>'}
                    </div>
                    ${fix4BreakdownHtml}
                    <div class="text-center p-4">
                         <p class="text-xs italic text-brand-400">Disclaimer: This is an estimated calculation for informational purposes only. It is not a guarantee of actual compensation and may differ from official salary offers or personal expectations.</p>
                    </div>
                </div>`;
    },
    // Main Functions
    hideLoading(button) {
        button.classList.remove('loading');
        button.querySelector('.spinner')?.remove();
    },
    showLoading(button) {
        button.classList.add('loading');
        button.innerHTML += `<div class="spinner ml-2"></div>`;
    },
    showModal(modalId, content) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        const contentContainer = modal.querySelector('.modal-content-container');
        if (contentContainer) contentContainer.innerHTML = content;
        modal.classList.remove('hidden');
    },
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('hidden');
    }
};

const Calculator = {
    calculateQualityModifier(quality) {
        const bonusTier = AppState.bonusTiers.find(tier => quality >= tier.quality);
        return bonusTier ? bonusTier.bonus : 0;
    },
    async runCalculation(isCombined = false, projectIds = []) {
        AppState.currentTechStats = {};
        const projectsToCalculate = isCombined ? projectIds : [document.getElementById('project-select').value];
        const gsdValue = isCombined ? document.getElementById('merge-gsd-select').value : AppState.lastUsedGsdValue;

        if (!projectsToCalculate || projectsToCalculate.length === 0 || projectsToCalculate.includes("")) {
            UI.showNotification('Please select a project to calculate.');
            return;
        }

        const projects = await Promise.all(projectsToCalculate.map(id => DB.get('projects', id)));
        const validProjects = projects.filter(p => p);

        if (validProjects.length === 0) {
            UI.showNotification('Selected project data not found.');
            return;
        }
        
        if (isCombined) {
            UI.showNotification(`Calculating ${validProjects.length} projects...`);
        } else {
             UI.showNotification(`Calculating project: ${validProjects[0].name}...`);
        }

        validProjects.forEach(project => {
            const projectGsd = project.gsd || gsdValue;
            const irModifier = (project.irModifier !== undefined && project.irModifier !== null) ? project.irModifier : AppState.calculationSettings.irModifierValue;
            
            project.data.forEach(row => {
                const techId = row.tech_id.toUpperCase();
                if (!AppState.currentTechStats[techId]) {
                    AppState.currentTechStats[techId] = {
                        id: techId,
                        points: 0,
                        fixTasks: 0,
                        refixTasks: 0,
                        warnings: [],
                        isCombined: isCombined,
                        projectName: project.name,
                        pointsBreakdownByProject: {},
                        categoryCounts: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {} },
                        fix4: []
                    };
                }

                const techStats = AppState.currentTechStats[techId];
                if (isCombined) {
                     if (!techStats.pointsBreakdownByProject[project.name]) {
                        techStats.pointsBreakdownByProject[project.name] = { points: 0, fixTasks: 0, refixTasks: 0, warnings: 0 };
                    }
                }

                let pointsEarned = 0;
                let isFix = false;

                // Points & Task Counting
                if (row.project_type === 'qc' || row.project_type === 'i3qa') {
                    if (row.qc_label === 'f' || row.i3qa_label === 'f') { // Fix
                        pointsEarned = AppState.calculationSettings.points[row.project_type];
                        isFix = true;
                        techStats.fixTasks++;
                        if (isCombined) techStats.pointsBreakdownByProject[project.name].fixTasks++;
                    }
                }
                
                // Refixes
                CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers.refix.columns.forEach(col => {
                    const label = row[col] ? row[col].toLowerCase() : null;
                    if (label && CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers.refix.labels.includes(label)) {
                        techStats.refixTasks++;
                        if (isCombined) techStats.pointsBreakdownByProject[project.name].refixTasks++;
                    }
                });

                // Warnings
                 CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers.warning.columns.forEach(col => {
                    if (row[col]) {
                        techStats.warnings.push({ type: 'warning', source: col, value: row[col] });
                        if (isCombined) techStats.pointsBreakdownByProject[project.name].warnings++;
                    }
                });

                // Fix4
                if(row.fix_4_category) {
                     techStats.fix4.push({
                        category: row.fix_4_category,
                        subCategory: row.fix_4_sub_category,
                        techId: row.tech_id,
                        errorCount: row.fix_4_error_count
                    });
                }
                
                // Additional points for specific projects/categories
                if (row.project_type === 'i3qa' && row.i3qa_label === 'f') {
                    const category = parseInt(row.category_num);
                    if (AppState.calculationSettings.categoryValues[category] && AppState.calculationSettings.categoryValues[category][projectGsd]) {
                        pointsEarned += AppState.calculationSettings.categoryValues[category][projectGsd] * irModifier;
                    }
                }

                techStats.points += pointsEarned;
                if (isCombined) techStats.pointsBreakdownByProject[project.name].points += pointsEarned;

                // Category Counts
                const category = parseInt(row.category_num);
                if (!isNaN(category) && category >= 1 && category <= 9) {
                    if (row.project_type === 'qc') techStats.categoryCounts[category].qc = (techStats.categoryCounts[category].qc || 0) + 1;
                    if (row.project_type === 'i3qa') techStats.categoryCounts[category].i3qa = (techStats.categoryCounts[category].i3qa || 0) + 1;
                    if (row.project_type === 'rv1') techStats.categoryCounts[category].rv1 = (techStats.categoryCounts[category].rv1 || 0) + 1;
                    if (row.project_type === 'rv2') techStats.categoryCounts[category].rv2 = (techStats.categoryCounts[category].rv2 || 0) + 1;
                }
            });
        });

        UI.applyFilters();
        UI.showNotification('Calculation complete!');
    }
};

const DataHandler = {
    async loadProjects() {
        const projectListCache = await DB.getAll('projects');
        UI.populateProjectSelect(projectListCache);
        document.getElementById('project-select').dispatchEvent(new Event('change'));
    },
    async saveSettings(storeName, settings) {
        await DB.put(storeName, { id: storeName, data: settings });
        UI.showNotification(`${storeName} settings saved successfully!`);
    },
    async loadSettings() {
        AppState.teamSettings = (await DB.get('teams', 'teams'))?.data || CONSTANTS.DEFAULT_TEAMS;
        AppState.bonusTiers = (await DB.get('bonusTiers', 'bonusTiers'))?.data || CONSTANTS.DEFAULT_BONUS_TIERS;
        AppState.calculationSettings = (await DB.get('calculationSettings', 'calculationSettings'))?.data || CONSTANTS.DEFAULT_CALCULATION_SETTINGS;
        AppState.countingSettings = (await DB.get('countingSettings', 'countingSettings'))?.data || CONSTANTS.DEFAULT_COUNTING_SETTINGS;
    },
    async saveTeamSettings() {
        const teams = {};
        document.querySelectorAll('.team-card').forEach(card => {
            const teamName = card.querySelector('.team-name-input').value.trim();
            const techIds = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.dataset.techId);
            if (teamName) teams[teamName] = techIds;
        });
        await this.saveSettings('teams', teams);
        this.loadTeamSettings();
    },
    async loadTeamSettings() {
        AppState.teamSettings = (await DB.get('teams', 'teams'))?.data || CONSTANTS.DEFAULT_TEAMS;
        UI.populateAdminTeamManagement();
        UI.populateTeamFilters();
        UI.applyFilters();
    }
};

const FileParser = {
    parseCsv(csv) {
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length !== headers.length) continue;
            const row = {};
            for (let j = 0; j < headers.length; j++) {
                let value = values[j].trim();
                if (value === '') {
                    row[headers[j]] = null;
                } else if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) {
                    row[headers[j]] = Number(value);
                } else {
                    row[headers[j]] = value;
                }
            }
            data.push(row);
        }
        return data;
    },
    async parseDbf(arrayBuffer) {
        const dbf = await shapefile.open(arrayBuffer);
        const data = [];
        let result = await dbf.read();
        while (!result.done) {
            data.push(result.value.properties);
            result = await dbf.read();
        }
        return data;
    },
    async parseZip(file) {
        const zip = new JSZip();
        const content = await zip.loadAsync(file);
        let projects = [];
        for (const filename of Object.keys(content.files)) {
            const file = content.files[filename];
            if (!file.dir && (filename.endsWith('.dbf') || filename.endsWith('.csv'))) {
                const arrayBuffer = await file.async('arraybuffer');
                const projectData = filename.endsWith('.dbf') ? await this.parseDbf(arrayBuffer) : this.parseCsv(new TextDecoder('utf-8').decode(arrayBuffer));
                projects.push({
                    id: crypto.randomUUID(),
                    name: filename.split('/').pop().replace(/\.(dbf|csv)/, ''),
                    data: projectData,
                    uploadDate: new Date().toISOString(),
                });
            }
        }
        return projects;
    }
};

const ModalHandlers = {
    guidedSetup() {
        UI.openModal('guided-setup-modal');
    },
    manageTeams() {
        UI.openModal('teams-admin-modal');
        DataHandler.loadTeamSettings();
    },
    advanceSettings() {
        UI.openModal('settings-modal');
    },
    importantInfo() {
        UI.openModal('important-info-modal');
    },
    reportBug() {
        const teamsUrl = 'https://teams.microsoft.com/l/chat/0/0?users=your.email@example.com&topicName=PCS%20Bonus%20Calculator%20Bug%20Report&message=Please%20describe%20the%20bug...';
        window.open(teamsUrl, '_blank');
    },
    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            const stores = ['projects', 'teams', 'settings', 'bonusTiers', 'calculationSettings', 'countingSettings'];
            const tx = AppState.db.transaction(stores, 'readwrite');
            stores.forEach(store => tx.objectStore(store).clear());
            tx.oncomplete = () => {
                UI.showNotification('All data cleared successfully. Reloading page...');
                setTimeout(() => location.reload(), 2000);
            };
            tx.onerror = e => console.error("Error clearing data:", e.target.error);
        }
    }
};

const SetupHandlers = {
    startTour() {
        AppState.guidedSetup.tourStep = 0;
        document.querySelectorAll('.tour-step').forEach(el => el.classList.remove('tour-target'));
        const tourElements = ['project-drop-zone', 'calculate-btn', 'bonus-payout-section', 'leaderboard-panel'];
        AppState.guidedSetup.tourElements = tourElements.map(id => document.getElementById(id));
        this.nextTourStep();
    },
    nextTourStep() {
        if (AppState.guidedSetup.tourStep < AppState.guidedSetup.tourElements.length) {
            const currentEl = AppState.guidedSetup.tourElements[AppState.guidedSetup.tourStep];
            currentEl.classList.add('tour-target');
            currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            UI.showNotification(`Step ${AppState.guidedSetup.tourStep + 1}: ${currentEl.dataset.tourHint}`);
            AppState.guidedSetup.tourStep++;
        } else {
            UI.showNotification('Tour complete!');
            this.endTour();
        }
    },
    endTour() {
        document.querySelectorAll('.tour-step').forEach(el => el.classList.remove('tour-target'));
        AppState.guidedSetup.tourStep = 0;
        AppState.guidedSetup.tourElements = [];
        UI.showNotification('Tour ended.');
    }
};

const EventListeners = {
    init() {
        const listen = (id, event, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, handler);
        };
        const listenAll = (selector, event, handler) => {
            document.querySelectorAll(selector).forEach(el => el.addEventListener(event, handler));
        };

        listen('main-menu-btn', 'click', () => document.getElementById('main-menu-dropdown').classList.toggle('hidden'));
        document.addEventListener('click', e => {
            const menu = document.getElementById('main-menu-dropdown');
            const button = document.getElementById('main-menu-btn');
            if (menu && !menu.contains(e.target) && !button.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });

        listen('guided-setup-btn', 'click', ModalHandlers.guidedSetup);
        listen('manage-teams-btn', 'click', ModalHandlers.manageTeams);
        listen('advance-settings-btn', 'click', ModalHandlers.advanceSettings);
        listen('important-info-btn', 'click', ModalHandlers.importantInfo);
        listen('bug-report-btn', 'click', ModalHandlers.reportBug);
        listen('clear-data-btn', 'click', ModalHandlers.clearData);

        listen('calculate-btn', 'click', async e => {
            const button = e.target;
            UI.showLoading(button);
            await Calculator.runCalculation();
            UI.hideLoading(button);
        });

        listen('merge-projects-btn', 'click', async e => {
            const button = e.target;
            const projectIds = Array.from(document.getElementById('project-select').selectedOptions).map(o => o.value);
            UI.showLoading(button);
            await Calculator.runCalculation(true, projectIds);
            UI.hideLoading(button);
        });

        listenAll('.modal-close-btn', 'click', e => UI.closeModal(e.target.closest('.modal').id));
        listen('setup-start-tour-btn', 'click', SetupHandlers.startTour);
        listen('setup-next-step-btn', 'click', SetupHandlers.nextTourStep);
        listen('setup-add-team-btn', 'click', () => UI.addTeamCard());
        listen('setup-save-teams-btn', 'click', () => DataHandler.saveTeamSettings());

        listen('save-bonus-tiers-btn', 'click', async () => {
            const tiers = [];
            document.querySelectorAll('.bonus-tier-row').forEach(row => {
                const quality = parseFloat(row.querySelector('.quality-input').value);
                const bonus = parseFloat(row.querySelector('.bonus-input').value);
                if (!isNaN(quality) && !isNaN(bonus)) {
                    tiers.push({ quality, bonus });
                }
            });
            await DataHandler.saveSettings('bonusTiers', tiers);
        });

        listen('save-calculation-settings-btn', 'click', async () => {
            const points = {};
            document.querySelectorAll('.points-input').forEach(input => points[input.dataset.type] = parseFloat(input.value));
            const categoryValues = {};
            document.querySelectorAll('.category-row').forEach(row => {
                const cat = row.dataset.category;
                categoryValues[cat] = {};
                row.querySelectorAll('input').forEach(input => categoryValues[cat][input.dataset.gsd] = parseFloat(input.value));
            });
            const settings = {
                irModifierValue: parseFloat(document.getElementById('ir-modifier-input').value),
                points,
                categoryValues
            };
            await DataHandler.saveSettings('calculationSettings', settings);
        });

        listen('project-select', 'change', e => {
            const selectedId = e.target.value;
            const editBtn = document.getElementById('edit-data-btn');
            const deleteBtn = document.getElementById('delete-project-btn');
            if (selectedId) {
                editBtn.classList.remove('hidden');
                deleteBtn.classList.remove('hidden');
                DB.get('projects', selectedId).then(project => {
                    if (project) {
                        const irBadge = document.getElementById('project-ir-badge');
                        irBadge.textContent = project.irModifier ? `IR: ${project.irModifier}` : '';
                        irBadge.classList.toggle('hidden', !project.irModifier);
                    }
                });
            } else {
                editBtn.classList.add('hidden');
                deleteBtn.classList.add('hidden');
                document.getElementById('project-ir-badge').classList.add('hidden');
            }
        });
        
        listen('delete-project-btn', 'click', async () => {
            const projectId = document.getElementById('project-select').value;
            if (!projectId) return;
            if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
                await DB.delete('projects', projectId);
                DataHandler.loadProjects();
                UI.showNotification('Project deleted.');
                AppState.currentTechStats = {};
                UI.displayResults({});
            }
        });

        listenAll('.sortable-header', 'click', e => {
            const column = e.currentTarget.dataset.sort;
            if (AppState.currentSort.column === column) {
                AppState.currentSort.direction = AppState.currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                AppState.currentSort.column = column;
                AppState.currentSort.direction = 'asc';
            }
            UI.applyFilters();
        });

        listenAll('.dashboard-panel', 'scroll', () => UI.setPanelHeights());
        window.addEventListener('resize', UI.setPanelHeights);

        listen('tech-results-tbody', 'click', async e => {
            const target = e.target.closest('.tech-summary-icon');
            if (target) {
                const techId = target.dataset.techId;
                const techData = AppState.currentTechStats[techId];
                if (techData) {
                    const htmlContent = UI.generateTechBreakdownHTML(techData);
                    UI.showModal('tech-summary-modal', htmlContent);
                }
            }
        });

        listen('drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.add('bg-brand-700'); });
        listen('drop-zone', 'dragleave', e => e.target.closest('#drop-zone').classList.remove('bg-brand-700'));
        listen('drop-zone', 'drop', async e => {
            e.preventDefault();
            const dropZone = e.target.closest('#drop-zone');
            dropZone.classList.remove('bg-brand-700');
            const files = Array.from(e.dataTransfer.files);
            const zipFile = files.find(file => file.name.endsWith('.zip'));

            if (!zipFile) {
                alert("Please drop a single .zip file containing your .csv or .dbf files.");
                return;
            }

            const projects = await FileParser.parseZip(zipFile);
            if (projects.length === 0) {
                 UI.showNotification('No valid .csv or .dbf files found in the zip archive.');
                 return;
            }

            const existingProjectNames = (await DB.getAll('projects')).map(p => p.name);
            const projectsToAdd = projects.filter(p => !existingProjectNames.includes(p.name));
            if (projectsToAdd.length === 0) {
                 UI.showNotification('All projects in the zip file already exist.');
                 return;
            }

            const tx = AppState.db.transaction(['projects'], 'readwrite');
            await Promise.all(projectsToAdd.map(p => tx.objectStore('projects').put(p)));
            await new Promise(resolve => tx.oncomplete = resolve);

            await DataHandler.loadProjects();
            UI.showNotification(`Successfully imported ${projectsToAdd.length} new projects!`);
        });

        // Initial setup
        DB.open().then(async () => {
            await DataHandler.loadSettings();
            await DataHandler.loadProjects();
            UI.populateTeamFilters();
            UI.setPanelHeights();
        }).catch(err => console.error("Failed to initialize app:", err));
    }
};

document.addEventListener('DOMContentLoaded', EventListeners.init);
