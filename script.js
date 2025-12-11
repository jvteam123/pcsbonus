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
        tag.innerHTML = `${techId}<button class="remove-tech-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.647 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button>`;
        list.appendChild(tag);
        tag.querySelector('.remove-tech-btn').addEventListener('click', () => tag.remove());
    },

    // --- NEW HELPER FUNCTION FOR DETAILED CATEGORY BREAKDOWN ---
    generateCategoryBreakdownHTML(tech, irModifier) {
        let html = '';
        const categoryCounts = tech.categoryCounts; // { '1': { 'rv': 5, 'i3qa': 2 }, '2': { 'rv': 1 } }
        const gsd = tech.gsdValue;
        const categoryValues = AppState.calculationSettings.categoryValues;

        const categories = Object.keys(categoryCounts).map(Number).sort((a, b) => a - b);

        if (categories.length === 0) return '';

        let totalCatPoints = 0;
        let totalCatTasks = 0;

        // Calculate total points for Fix Tasks (Categories)
        categories.forEach(cat => {
            const catData = categoryCounts[cat];
            const value = categoryValues[cat]?.[gsd] || 0;
            Object.values(catData).forEach(count => {
                totalCatTasks += count;
                totalCatPoints += count * value * irModifier;
            });
        });

        html += `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
            <h4 class="font-semibold text-base text-white mb-2">Fix Task Points Breakdown (Category Level)</h4>
            <div class="space-y-2">`;

        categories.forEach(cat => {
            const catData = categoryCounts[cat];
            const value = categoryValues[cat]?.[gsd] || 0;
            let catTotalPoints = 0;
            
            // Iterate through sources (rv, i3qa, afp, etc.)
            const sourceBreakdown = Object.entries(catData).map(([source, count]) => {
                 const sourcePoints = count * value * irModifier;
                 catTotalPoints += sourcePoints;
                 return `<span class="tag-secondary">${count} ${source.toUpperCase()} (${sourcePoints.toFixed(3)} pts)</span>`;
            }).join('');

            const catValueDisplay = value.toFixed(3);
            const modifierDisplay = irModifier > 1 ? ` (x ${irModifier.toFixed(2)} IR)` : '';

            html += `<div class="summary-item border-l-status-green">
                <div class="flex flex-col">
                    <span class="text-white font-semibold">Cat ${cat} @ ${catValueDisplay} pts/task${modifierDisplay}</span>
                    <div class="text-xs text-brand-400 flex flex-wrap gap-1 mt-1">${sourceBreakdown}</div>
                </div>
                <span class="font-mono text-white font-bold">${catTotalPoints.toFixed(3)} pts</span>
            </div>`;
        });

        html += `</div>
            <div class="summary-item total-summary-item border-l-status-green">
                Total Fix Task Points: <span class="font-mono text-white">${totalCatPoints.toFixed(3)}</span>
            </div>
            </div>`;

        return html;
    },
    
    // --- REPLACED: Enhanced UI.generateTechBreakdownHTML for Full Transparency ---
    generateTechBreakdownHTML(tech) {
        // Recalculate values for full transparency
        const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
        const quality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
        const qualityModifier = Calculator.calculateQualityModifier(quality);
        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
        const payout = tech.points * bonusMultiplier * qualityModifier;
        const bonusEarned = qualityModifier * 100;
        const irModifier = tech.isIR ? AppState.calculationSettings.irModifierValue : 1;

        const projectName = document.getElementById('results-title').textContent.replace('Bonus Payouts for: ', '');

        // --- SECTION 1: Quality & Payout Calculation ---
        const qualitySectionHTML = `
            <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
                <h4 class="font-semibold text-base text-white mb-2">Quality & Payout Calculation</h4>
                <div class="space-y-2">
                    <div class="summary-item border-l-accent">Project: <span class="font-mono">${projectName}</span></div>
                    <div class="summary-item border-l-accent">GSD Used: <span class="font-mono">${tech.gsdValue}</span></div>
                    <div class="summary-item border-l-accent">IR Project: <span class="font-mono">${tech.isIR ? 'Yes' : 'No'}</span></div>
                </div>
                <div class="border-t border-brand-700 pt-3 mt-3 space-y-2">
                    <h5 class="font-semibold text-sm">Quality Rate Formula</h5>
                    <div class="text-xs text-brand-400 summary-item border-l-accent">
                        (Total Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) x 100
                    </div>
                    <div class="summary-item border-l-status-green">Fix Tasks (Numerator): <span class="font-mono">${tech.fixTasks}</span></div>
                    <div class="summary-item border-l-status-red">Refix Tasks: <span class="font-mono">${tech.refixTasks}</span></div>
                    <div class="summary-item border-l-status-orange">Warnings: <span class="font-mono">${tech.warnings.length}</span></div>
                    <div class="summary-item border-l-accent font-semibold">
                        Quality Rate: <span class="font-mono text-white">${tech.fixTasks} / ${denominator.toFixed(2)} = ${quality.toFixed(2)}%</span>
                    </div>
                </div>
                <div class="border-t border-brand-700 pt-3 mt-3 space-y-2">
                    <h5 class="font-semibold text-sm">Bonus Tier & Payout</h5>
                    <div class="summary-item border-l-accent">
                        Quality Modifier: <span class="font-mono text-white">${qualityModifier.toFixed(3)} (from ${quality.toFixed(2)}% quality)</span>
                    </div>
                    <div class="summary-item border-l-accent">
                        Bonus Multiplier (Input): <span class="font-mono text-white">${bonusMultiplier.toFixed(2)}x</span>
                    </div>
                    <div class="summary-item border-l-accent">
                        Total Points: <span class="font-mono text-white">${tech.points.toFixed(3)}</span>
                    </div>
                    <div class="text-xs text-brand-400 summary-item border-l-accent">
                        Payout Formula: Total Points x Multiplier (Input) x Quality Modifier
                    </div>
                    <div class="summary-item total-summary-item border-l-accent text-lg font-bold">
                        Total Payout: <span class="font-mono text-white">${tech.points.toFixed(3)} x ${bonusMultiplier.toFixed(2)} x ${qualityModifier.toFixed(3)} = ${payout.toFixed(2)}</span>
                    </div>
                </div>
            </div>`;

        // --- SECTION 2: Category Points Breakdown (Uses helper function) ---
        const categoryBreakdownHTML = this.generateCategoryBreakdownHTML(tech, irModifier);

        // --- SECTION 3: Task Points Breakdown (QC, I3QA, RV) ---
        const qcPoints = tech.qcTasks * AppState.calculationSettings.points.qc;
        const i3qaPoints = tech.i3qaTasks * AppState.calculationSettings.points.i3qa;
        const rvPoints = tech.rvTasks * AppState.calculationSettings.points.rv2;

        const taskPointsSectionHTML = `
            <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
                <h4 class="font-semibold text-base text-white mb-2">Non-Category Task Points Summary</h4>
                <div class="space-y-2">
                    <div class="summary-item border-l-accent">QC Tasks: <span class="font-mono">${tech.qcTasks} x ${AppState.calculationSettings.points.qc.toFixed(3)} = ${qcPoints.toFixed(3)} pts</span></div>
                    <div class="summary-item border-l-accent">i3qa Tasks: <span class="font-mono">${tech.i3qaTasks} x ${AppState.calculationSettings.points.i3qa.toFixed(3)} = ${i3qaPoints.toFixed(3)} pts</span></div>
                    <div class="summary-item border-l-accent">RV Tasks: <span class="font-mono">${tech.rvTasks} x ${AppState.calculationSettings.points.rv2.toFixed(3)} = ${rvPoints.toFixed(3)} pts</span></div>
                    <div class="summary-item total-summary-item border-l-status-green text-lg font-bold">
                        Total Points (All Sources): <span class="font-mono text-white">${tech.points.toFixed(3)}</span>
                    </div>
                </div>
            </div>`;


        // --- SECTION 4: Warnings Detail ---
        const warningsHTML = tech.warnings.length > 0 ? `
            <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
                <h4 class="font-semibold text-base text-white mb-2 text-status-orange">Warnings Detail (Items in Quality Denominator)</h4>
                <ul class="list-disc list-inside space-y-1 ml-4 text-sm text-brand-400">
                    ${tech.warnings.map(w => `<li class="break-words">${w}</li>`).join('')}
                </ul>
            </div>` : '';

        return `<div class="space-y-4 text-sm">
            ${qualitySectionHTML}
            ${taskPointsSectionHTML}
            ${categoryBreakdownHTML}
            ${warningsHTML}
        </div>`;
    },
    // --- END OF NEW/ENHANCED UI FUNCTIONS ---


    populateTeamFilters() {
        const container = document.getElementById('team-filter-container');
        const filterSelect = document.getElementById('team-filter-select');
        const currentFilter = filterSelect ? filterSelect.value : 'all';
        if (!container) return;

        const allTeams = ['All Teams', ...Object.keys(AppState.teamSettings)];
        const currentSelectedTeam = document.getElementById('team-summary-select')?.value;

        // Populate the main results filter
        filterSelect.innerHTML = allTeams.map(team => `<option value="${team === 'All Teams' ? 'all' : team}">${team}</option>`).join('');
        filterSelect.value = currentFilter;

        // Populate the Team Lead Summary card select
        const tlSelect = document.getElementById('team-summary-select');
        tlSelect.innerHTML = allTeams.map(team => `<option value="${team === 'All Teams' ? 'all' : team}">${team}</option>`).join('');
        tlSelect.value = currentSelectedTeam || 'all';
        this.updateTeamLeadSummary(tlSelect.value);
    },
    updateTeamLeadSummary(teamName) {
        const summaryCard = document.getElementById('tl-summary-card');
        const summaryInner = document.getElementById('team-summary-card-inner');
        const techStats = AppState.currentTechStats;
        const allTechIds = Object.keys(techStats);
        let targetTechIds = [];

        if (teamName === 'all') {
            targetTechIds = allTechIds;
            summaryCard.querySelector('.panel-title').textContent = 'All Techs Summary';
        } else {
            targetTechIds = AppState.teamSettings[teamName] || [];
            summaryCard.querySelector('.panel-title').textContent = `${teamName} Summary`;
        }

        const filteredStats = targetTechIds.map(id => techStats[id]).filter(Boolean);

        if (filteredStats.length === 0) {
            summaryInner.innerHTML = `<p class="text-center text-brand-400 p-4">No data available for this team.</p>`;
            return;
        }

        const totalFix = filteredStats.reduce((sum, tech) => sum + tech.fixTasks, 0);
        const totalRefix = filteredStats.reduce((sum, tech) => sum + tech.refixTasks, 0);
        const totalWarnings = filteredStats.reduce((sum, tech) => sum + tech.warnings.length, 0);
        const totalDenominator = totalFix + totalRefix + totalWarnings;
        const teamQuality = totalDenominator > 0 ? (totalFix / totalDenominator) * 100 : 0;
        const teamPoints = filteredStats.reduce((sum, tech) => sum + tech.points, 0);

        const qualityModifier = Calculator.calculateQualityModifier(teamQuality);
        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
        const teamPayout = teamPoints * bonusMultiplier * qualityModifier;

        const qualityClass = teamQuality >= 95 ? 'quality-bar-95' : teamQuality >= 90 ? 'quality-bar-90' : teamQuality >= 85 ? 'quality-bar-85' : 'quality-bar-red';
        const qualityPercent = Math.min(teamQuality, 100).toFixed(2); // Cap at 100 for display bar
        const qualityText = `${teamQuality.toFixed(2)}%`;

        let workloadHTML = '';
        if (totalFix > 0) {
            workloadHTML = filteredStats.sort((a, b) => b.fixTasks - a.fixTasks).slice(0, 10).map(tech => {
                const percent = (tech.fixTasks / totalFix) * 100;
                const techQuality = tech.fixTasks / (tech.fixTasks + tech.refixTasks + tech.warnings.length || 1) * 100;
                const techQualityClass = techQuality >= 95 ? 'quality-bar-95' : techQuality >= 90 ? 'quality-bar-90' : techQuality >= 85 ? 'quality-bar-85' : 'quality-bar-red';
                return `<div class="team-quality-item">
                            <span class="text-sm font-medium text-white">${tech.id}</span>
                            <div class="workload-bar">
                                <div class="workload-bar-inner ${techQualityClass}" style="width: ${percent.toFixed(1)}%;">
                                    ${tech.fixTasks}
                                </div>
                            </div>
                        </div>`;
            }).join('');
        }

        summaryInner.innerHTML = `
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="summary-item border-l-accent font-medium">Total Techs: <span>${filteredStats.length}</span></div>
                <div class="summary-item border-l-status-green font-medium">Total Points: <span>${teamPoints.toFixed(2)}</span></div>
                <div class="summary-item border-l-status-green font-medium">Total Fixes: <span>${totalFix}</span></div>
                <div class="summary-item border-l-status-red font-medium">Total Refixes: <span>${totalRefix}</span></div>
            </div>

            <div class="team-quality-item mb-4">
                <span class="text-sm font-medium text-white">Team Quality Rate:</span>
                <div class="workload-bar">
                    <div class="workload-bar-inner ${qualityClass}" style="width: ${qualityPercent}%;">
                        ${qualityText}
                    </div>
                </div>
            </div>

            <div class="summary-item total-summary-item border-l-accent text-lg font-bold mb-4">
                Team Total Payout: <span>${teamPayout.toFixed(2)}</span>
            </div>

            <h3 class="text-white font-semibold text-sm mb-2">Top 10 Workload (Fix Tasks)</h3>
            <div class="team-quality-bar-container">
                ${workloadHTML}
            </div>
        `;
    },
    displayTLSummaryWorkloadBreakdown(techStats) {
        const breakdownContainer = document.getElementById('tl-workload-breakdown');
        const tlTechIds = AppState.teamSettings['Team Lead'] || []; // Assuming 'Team Lead' is the group name
        const tlStats = tlTechIds.map(id => techStats[id]).filter(Boolean);

        if (tlStats.length === 0) {
            breakdownContainer.innerHTML = '<p class="text-center text-brand-400 p-4">No Team Lead data available.</p>';
            return;
        }

        const totalFix = tlStats.reduce((sum, tech) => sum + tech.fixTasks, 0);
        const categories = {}; // { 'Cat 1': { total: 0, techs: { '7244AA': 5 } } }

        tlStats.forEach(tech => {
            const techId = tech.id;
            Object.entries(tech.categoryCounts).forEach(([catId, sources]) => {
                const categoryName = `Cat ${catId}`;
                if (!categories[categoryName]) {
                    categories[categoryName] = { total: 0, techs: {} };
                }
                const catCount = Object.values(sources).reduce((sum, count) => sum + count, 0);
                categories[categoryName].total += catCount;
                categories[categoryName].techs[techId] = catCount;
            });
        });

        const sortedCategories = Object.entries(categories)
            .sort(([, a], [, b]) => b.total - a.total);

        let html = '';
        if (sortedCategories.length > 0) {
            html += '<div class="space-y-3 p-4">';
            sortedCategories.forEach(([categoryName, data]) => {
                const percent = (data.total / totalFix) * 100;
                const topContributors = Object.entries(data.techs)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([id, count]) => `<span class="tag-secondary">${id}: ${count}</span>`)
                    .join(' ');

                html += `
                    <div class="flex flex-col gap-1 fix4-breakdown-item">
                        <div class="flex justify-between items-center w-full">
                            <span class="fix4-category">${categoryName} (${data.total})</span>
                            <span class="fix4-count">${percent.toFixed(1)}%</span>
                        </div>
                        <div class="text-xs text-brand-400 w-full flex flex-wrap gap-1">
                            Top Techs: ${topContributors || 'N/A'}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html = '<p class="text-center text-brand-400 p-4">No Fix Task category data available.</p>';
        }

        breakdownContainer.innerHTML = html;
    },
    filterResults() {
        const filterSelect = document.getElementById('team-filter-select');
        const filterValue = filterSelect.value;
        const rows = document.getElementById('tech-results-tbody').querySelectorAll('tr');

        rows.forEach(row => {
            const techId = row.querySelector('td:first-child').textContent.trim();
            const shouldShow = filterValue === 'all' || AppState.teamSettings[filterValue]?.includes(techId);
            row.classList.toggle('hidden', !shouldShow);
        });
        this.updateLeaderboard();
    },
    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        const rows = Array.from(document.getElementById('tech-results-tbody').querySelectorAll('tr:not(.hidden)'));

        let filteredTechs = rows.map(row => {
            const id = row.querySelector('td:nth-child(1)').textContent.trim();
            const payout = parseFloat(row.querySelector('td:nth-child(7)').textContent);
            return { id, payout };
        });

        filteredTechs.sort((a, b) => b.payout - a.payout);

        if (filteredTechs.length === 0) {
             leaderboardList.innerHTML = `<li class="text-center text-brand-400 p-4">No tech data selected or filtered.</li>`;
             return;
        }

        filteredTechs.slice(0, 10).forEach((tech, index) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-list-item';
            li.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="font-bold text-lg w-6 text-right ${index < 3 ? 'text-accent' : 'text-brand-400'}">${index + 1}.</span>
                    <span class="font-medium text-white">${tech.id}</span>
                </div>
                <span class="font-mono text-lg font-bold text-status-green">${tech.payout.toFixed(2)}</span>
            `;
            leaderboardList.appendChild(li);
        });
    },
    showNotification(message, isError = false) {
        const notif = document.getElementById('notification');
        const icon = document.getElementById('notification-icon');
        const text = document.getElementById('notification-text');

        notif.classList.remove('hidden', 'bg-status-red', 'bg-status-green', 'border-status-red', 'border-status-green');
        icon.innerHTML = isError ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.188 4h1.624l.118 4.673H7.07l.118-4.673z"/><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-1 0A7 7 0 1 0 1 8a7 7 0 0 0 14 0z"/></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg>`;
        notif.classList.add(isError ? 'bg-status-red' : 'bg-status-green', isError ? 'border-status-red' : 'border-status-green');
        text.textContent = message;

        setTimeout(() => notif.classList.add('hidden'), 5000);
    },
    showLoading(button, originalText = 'Loading...') {
        button.setAttribute('data-original-text', button.innerHTML);
        button.disabled = true;
        button.innerHTML = `<div class="pulsing-spinner"></div><span>${originalText}</span>`;
    },
    hideLoading(button) {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text');
        button.removeAttribute('data-original-text');
    },
    populateBonusTierSettings() {
        const container = document.getElementById('bonus-tier-container');
        container.innerHTML = '';
        AppState.bonusTiers.sort((a, b) => b.quality - a.quality).forEach((tier, index) => {
            const row = document.createElement('div');
            row.className = 'config-tier-row mb-2';
            row.innerHTML = `
                <input type="number" step="0.01" class="input-field tier-quality-input text-right" value="${tier.quality.toFixed(2)}" placeholder="Quality %" data-index="${index}">
                <input type="number" step="0.01" class="input-field tier-bonus-input text-right" value="${tier.bonus.toFixed(2)}" placeholder="Bonus Multiplier" data-index="${index}">
                <button class="control-btn-icon-danger remove-tier-btn" data-index="${index}" title="Remove Tier">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z"/></svg>
                </button>
            `;
            container.appendChild(row);
        });
        Sortable.create(container, {
            animation: 150,
            handle: '.config-tier-row',
        });
    },
    populateCalculationSettings() {
        const settings = AppState.calculationSettings;
        document.getElementById('irModifierValue').value = settings.irModifierValue.toFixed(2);
        document.getElementById('qcPointValue').value = settings.points.qc.toFixed(3);
        document.getElementById('i3qaPointValue').value = settings.points.i3qa.toFixed(3);
        document.getElementById('rv2PointValue').value = settings.points.rv2.toFixed(3);

        const categoriesContainer = document.getElementById('category-values-container');
        categoriesContainer.innerHTML = '';
        const gsdOptions = Object.keys(settings.categoryValues[1] || {});
        
        Object.entries(settings.categoryValues).sort(([a], [b]) => a - b).forEach(([catId, values]) => {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-5 gap-2 items-center mb-2';
            row.innerHTML = `<span class="font-semibold text-white">Cat ${catId}:</span>`;
            
            gsdOptions.forEach(gsd => {
                const value = values[gsd]?.toFixed(3) || '0.000';
                row.innerHTML += `<input type="number" step="0.001" class="input-field cat-value-input text-right" data-cat-id="${catId}" data-gsd="${gsd}" value="${value}" placeholder="${gsd}">`;
            });
            categoriesContainer.appendChild(row);
        });
    }
};

const Calculator = {
    calculateQualityModifier(quality) {
        const sortedTiers = AppState.bonusTiers.sort((a, b) => b.quality - a.quality);
        const tier = sortedTiers.find(t => quality >= t.quality);
        return tier ? tier.bonus : 0;
    },
    async calculateTechStats(projectData, techIds) {
        const stats = {};
        const isIRProject = projectData.name.toLowerCase().includes('ir');
        const irModifier = isIRProject ? AppState.calculationSettings.irModifierValue : 1;
        const gsd = AppState.lastUsedGsdValue;
        const calcSettings = AppState.calculationSettings;
        const countingSettings = AppState.countingSettings;
        const data = projectData.data;

        // 1. Initialize stats for each tech in the project
        const projectTechs = new Set(data.map(row => row.tech_id).filter(id => techIds.includes(id)));
        projectTechs.forEach(id => {
            stats[id] = {
                id: id,
                points: 0,
                fixTasks: 0,
                refixTasks: 0,
                warnings: [],
                qcTasks: 0,
                i3qaTasks: 0,
                rvTasks: 0,
                categoryCounts: {}, // { '1': { 'rv': 5, 'i3qa': 2 }, '2': { 'rv': 1 } }
                isIR: isIRProject,
                gsdValue: gsd
            };
        });

        // 2. Process data row by row
        data.forEach(row => {
            const techId = row.tech_id;
            if (!stats[techId]) return; // Skip if tech ID is not in the project tech list

            let tech = stats[techId];
            let rowPoints = 0;
            let isFix = false; // Flag to check if the task is a Fix (contributes to numerator)

            // --- A. Quality Check (QC, i3QA, RV, etc.) ---
            const qcId = row[countingSettings.taskColumns.qc[0]];
            const i3qaId = row[countingSettings.taskColumns.i3qa[0]];
            const rv1Id = row[countingSettings.taskColumns.rv1[0]];
            const rv2Id = row[countingSettings.taskColumns.rv2[0]];

            if (qcId) { tech.qcTasks++; rowPoints += calcSettings.points.qc; }
            if (i3qaId) { tech.i3qaTasks++; rowPoints += calcSettings.points.i3qa; }
            if (rv2Id) { tech.rvTasks++; rowPoints += calcSettings.points.rv2; } // Using RV2 for all general RV tasks as per default settings

            // --- B. Fix Tasks (Categories) ---
            const catId = row.category_id;
            const catValue = calcSettings.categoryValues[catId]?.[gsd] || 0;
            if (catId && catValue > 0) {
                // Determine the source of the fix task (rv, i3qa, afp, etc.)
                // This logic is project-specific but based on provided columns, we can infer a source
                // For simplicity, we check if it's RV1 or RV2. If neither, we assume it's 'rv' for other review tasks
                let source = 'rv';
                if (rv1Id) source = 'rv1';
                if (i3qaId) source = 'i3qa';
                // Add more complex source detection here if needed (e.g., AFP, M3, etc.)

                if (!tech.categoryCounts[catId]) tech.categoryCounts[catId] = {};
                tech.categoryCounts[catId][source] = (tech.categoryCounts[catId][source] || 0) + 1;
                
                const fixPoints = catValue * irModifier;
                rowPoints += fixPoints;
                tech.fixTasks++;
                isFix = true;
            }

            // --- C. Refix and Warning Calculations (Quality Denominator) ---

            // Refix (Label 'i') - Contributes to Refix count (Denominator)
            let isRefix = false;
            for (const col of countingSettings.triggers.refix.columns) {
                const label = (row[col] || '').toLowerCase();
                if (countingSettings.triggers.refix.labels.includes(label)) {
                    tech.refixTasks++;
                    isRefix = true;
                    // Only count as one refix per task, even if multiple refix columns are flagged
                    break; 
                }
            }

            // Warnings (Label 'b', 'c', 'd', 'e', 'f', 'g', 'i') - Contributes to Warnings count (Denominator)
            let isWarning = false;
            for (const col of countingSettings.triggers.warning.columns) {
                const label = (row[col] || '').toLowerCase();
                if (countingSettings.triggers.warning.labels.includes(label)) {
                    // Record the actual warning for transparency
                    const warningDetail = `${col.toUpperCase()}: ${label.toUpperCase()} on Task ${row.task_id || row.id}`;
                    tech.warnings.push(warningDetail);
                    isWarning = true;
                    // Stop on first warning found in this task
                    break; 
                }
            }
            
            // --- D. Final Point Tally ---
            tech.points += rowPoints;
        });

        // 3. Final calculations (Quality and Payout are calculated in UI.displayResults)
        
        return stats;
    },
    filterTechsByTeam(techStats, teamName) {
        if (teamName === 'all') {
            return techStats;
        }
        const teamIds = AppState.teamSettings[teamName] || [];
        const filteredStats = {};
        teamIds.forEach(id => {
            if (techStats[id]) {
                filteredStats[id] = techStats[id];
            }
        });
        return filteredStats;
    }
};

const FileHandler = {
    handleDroppedFiles(files, isAdmin = false) {
        const file = Array.from(files).find(f => f.name.endsWith('.csv'));
        if (!file) {
            UI.showNotification('Please drop a CSV file (.csv).', true);
            return;
        }

        const buttonId = isAdmin ? 'admin-save-project-btn' : 'calculate-btn';
        const button = document.getElementById(buttonId);
        UI.showLoading(button, `Parsing ${file.name}...`);

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = this.parseCSV(e.target.result);
                if (isAdmin) {
                    this.openAdminProjectModal(file.name.replace('.csv', ''), data, button);
                } else {
                    this.processData(data, file.name.replace('.csv', ''));
                    UI.hideLoading(button);
                }
            } catch (error) {
                console.error("Error processing file:", error);
                UI.showNotification(`Error processing CSV: ${error.message}`, true);
                UI.hideLoading(button);
            }
        };
        reader.onerror = () => {
            UI.showNotification('Error reading file.', true);
            UI.hideLoading(button);
        };
        reader.readAsText(file);
    },
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error('CSV file is empty or too short.');

        const headers = lines[0].toLowerCase().split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length !== headers.length) continue; // Skip malformed rows
            
            const row = {};
            headers.forEach((header, index) => {
                const key = header.trim().replace(/\s/g, '_');
                let value = values[index].trim();
                
                // Attempt to cast numeric values
                if (!isNaN(value) && value !== '') {
                    const numberValue = parseFloat(value);
                    if (Number.isInteger(numberValue)) {
                        value = parseInt(value, 10);
                    } else {
                        value = numberValue;
                    }
                }
                row[key] = value;
            });
            data.push(row);
        }
        return data;
    },
    processData(data, projectName) {
        // Step 1: Extract unique tech IDs from the data
        const projectTechIds = [...new Set(data.map(row => row.tech_id).filter(Boolean))];
        
        // Step 2: Update AppState with the temporary project
        AppState.currentTechStats = {};
        
        const tempProject = {
            id: 'temp_uploaded',
            name: projectName,
            data: data,
            tech_ids: projectTechIds
        };
        
        // Step 3: Run calculation using all tech IDs in the temporary project
        const allTechStats = Calculator.calculateTechStats(tempProject, projectTechIds);
        
        // Step 4: Save to AppState and display
        AppState.currentTechStats = allTechStats;
        document.getElementById('results-title').textContent = `Bonus Payouts for: ${projectName}`;
        UI.displayResults(allTechStats);
        UI.populateTeamFilters();
        
        // Step 5: Update TL Summary with a default 'all' filter, or selected filter
        const currentFilter = document.getElementById('team-filter-select').value;
        UI.filterResults(); // Updates Leaderboard
        UI.updateTeamLeadSummary(currentFilter);
        UI.displayTLSummaryWorkloadBreakdown(allTechStats);
    },
    openAdminProjectModal(name, data, button) {
        document.getElementById('admin-project-name').value = name;
        document.getElementById('admin-project-data-count').textContent = data.length;
        
        // Determine unique tech IDs
        const projectTechIds = [...new Set(data.map(row => row.tech_id).filter(Boolean))];
        document.getElementById('admin-project-tech-count').textContent = projectTechIds.length;

        // Store data temporarily
        document.getElementById('admin-project-modal').dataset.tempProjectData = JSON.stringify(data);
        document.getElementById('admin-project-modal').dataset.tempProjectTechs = JSON.stringify(projectTechIds);
        
        // Show modal and hide loading
        document.getElementById('admin-project-modal').classList.remove('hidden');
        UI.hideLoading(button);
    },
    handleAdminDroppedFiles(files) {
        this.handleDroppedFiles(files, true);
    }
};

const Core = {
    async initialize() {
        await DB.open();
        await this.loadSettings();
        await this.loadAdminProjectList();
        
        this.setupEventListeners();
        UI.setPanelHeights();
        window.addEventListener('resize', UI.setPanelHeights);
    },
    async loadSettings() {
        // Load Bonus Tiers
        const tiers = await DB.get('bonusTiers', 'tiers');
        AppState.bonusTiers = tiers ? tiers.data : CONSTANTS.DEFAULT_BONUS_TIERS;
        
        // Load Team Settings
        const teams = await DB.get('teams', 'settings');
        AppState.teamSettings = teams ? teams.data : CONSTANTS.DEFAULT_TEAMS;

        // Load Calculation Settings
        const calc = await DB.get('calculationSettings', 'settings');
        AppState.calculationSettings = calc ? calc.data : CONSTANTS.DEFAULT_CALCULATION_SETTINGS;

        // Load Counting Settings
        const count = await DB.get('countingSettings', 'settings');
        AppState.countingSettings = count ? count.data : CONSTANTS.DEFAULT_COUNTING_SETTINGS;
    },
    async loadAdminProjectList() {
        const projects = await DB.getAll('projects');
        const listContainer = document.getElementById('admin-project-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        if (projects.length === 0) {
            listContainer.innerHTML = '<p class="text-center text-brand-400 p-4">No projects uploaded yet.</p>';
            return;
        }

        projects.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)).forEach(p => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-3 bg-brand-900/50 rounded-lg border border-brand-700 mb-2';
            div.innerHTML = `
                <div class="flex-1 min-w-0 mr-4">
                    <p class="font-semibold text-white truncate">${p.name}</p>
                    <p class="text-xs text-brand-400">
                        ${p.tech_ids.length} Techs | ${p.data.length} Rows 
                        ${p.uploaded_at ? `| Uploaded: ${dayjs(p.uploaded_at).fromNow()}` : ''}
                    </p>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <button class="control-btn-icon load-project-btn" data-project-id="${p.id}" title="Load to Calculator">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/><path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zM3 10.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/></svg>
                    </button>
                    <button class="control-btn-icon-danger delete-project-btn" data-project-id="${p.id}" title="Delete Project">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2.5zM7 1h2a1 1 0 0 1 1 1v1H6V2a1 1 0 0 1 1-1zm2 10a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5z"/></svg>
                    </button>
                </div>
            `;
            listContainer.appendChild(div);
        });

        document.querySelectorAll('.load-project-btn').forEach(button => {
            button.addEventListener('click', async e => {
                const projectId = e.currentTarget.dataset.projectId;
                const project = await DB.get('projects', projectId);
                if (project) {
                    UI.showNotification(`Loading project "${project.name}"...`);
                    FileHandler.processData(project.data, project.name);
                    document.getElementById('project-select').value = projectId;
                }
            });
        });

        document.querySelectorAll('.delete-project-btn').forEach(button => {
            button.addEventListener('click', async e => {
                const projectId = e.currentTarget.dataset.projectId;
                if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                    await DB.delete('projects', projectId);
                    UI.showNotification('Project deleted.');
                    this.loadAdminProjectList();
                }
            });
        });
        
        UI.populateProjectSelect(projects);
        
        // Load the first project if no calculation has been performed
        if (projects.length > 0 && Object.keys(AppState.currentTechStats).length === 0) {
             const latestProject = projects.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))[0];
             UI.showNotification(`Loading latest project: "${latestProject.name}"...`);
             FileHandler.processData(latestProject.data, latestProject.name);
             document.getElementById('project-select').value = latestProject.id;
        }
    },
    setupEventListeners() {
        const listen = (id, event, handler) => document.getElementById(id)?.addEventListener(event, handler);

        // --- Main Calculator Actions ---
        listen('project-select', 'change', async e => {
            const projectId = e.target.value;
            if (projectId) {
                const project = await DB.get('projects', projectId);
                if (project) {
                    FileHandler.processData(project.data, project.name);
                }
            } else {
                document.getElementById('tech-results-tbody').innerHTML = `<tr><td colspan="8" class="text-center text-brand-400 p-4">Select a project or upload a CSV.</td></tr>`;
                document.getElementById('bonus-payout-section').classList.add('hidden');
                document.getElementById('results-title').textContent = `Bonus Payouts for:`;
                AppState.currentTechStats = {};
                UI.populateTeamFilters();
                UI.updateLeaderboard();
                UI.updateTeamLeadSummary('all');
            }
        });

        listen('calculate-btn', 'click', () => {
            if (Object.keys(AppState.currentTechStats).length > 0) {
                const project = { name: document.getElementById('results-title').textContent.replace('Bonus Payouts for: ', ''), data: [] };
                const techIds = Object.keys(AppState.currentTechStats); // Use existing tech IDs
                const allTechStats = Calculator.calculateTechStats(project, techIds);
                AppState.currentTechStats = allTechStats;
                UI.displayResults(allTechStats);
                UI.filterResults(); // Updates Leaderboard
                const currentFilter = document.getElementById('team-filter-select').value;
                UI.updateTeamLeadSummary(currentFilter);
                UI.displayTLSummaryWorkloadBreakdown(allTechStats);
                UI.showNotification('Recalculation complete.');
            } else {
                UI.showNotification('No project data loaded to calculate.', true);
            }
        });
        
        listen('team-filter-select', 'change', () => UI.filterResults());
        listen('team-summary-select', 'change', e => UI.updateTeamLeadSummary(e.target.value));
        listen('gsd-select', 'change', e => {
            AppState.lastUsedGsdValue = e.target.value;
            // Trigger recalculation
            document.getElementById('calculate-btn').click();
        });

        // --- Dynamic Listeners for Results Table ---
        listen('tech-results-table', 'click', e => {
            if (e.target.closest('.sortable-header')) {
                const header = e.target.closest('.sortable-header');
                const column = header.dataset.sort;
                let direction = AppState.currentSort.direction;
                if (AppState.currentSort.column === column) {
                    direction = direction === 'asc' ? 'desc' : 'asc';
                } else {
                    direction = 'desc'; // Default sort for new column
                }
                AppState.currentSort = { column, direction };
                UI.displayResults(AppState.currentTechStats); // Re-display with new sort
                UI.filterResults(); // Re-filter and update leaderboard
            }

            if (e.target.closest('.tech-summary-icon')) {
                const techId = e.target.closest('.tech-summary-icon').dataset.techId;
                const tech = AppState.currentTechStats[techId];
                if (tech) {
                    document.getElementById('breakdown-modal-title').textContent = `Calculation Breakdown for ${techId}`;
                    document.getElementById('breakdown-modal-body').innerHTML = UI.generateTechBreakdownHTML(tech);
                    document.getElementById('breakdown-modal').classList.remove('hidden');
                }
            }
        });


        // --- Admin Actions ---
        listen('admin-tab-settings', 'click', () => {
            document.querySelectorAll('.admin-tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById('admin-tab-settings').classList.add('active');
            document.getElementById('admin-settings-content').classList.add('active');
            UI.populateBonusTierSettings();
            UI.populateCalculationSettings();
            UI.populateAdminTeamManagement();
        });
        
        listen('admin-tab-data', 'click', () => {
            document.querySelectorAll('.admin-tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById('admin-tab-data').classList.add('active');
            document.getElementById('admin-data-content').classList.add('active');
            Core.loadAdminProjectList();
        });

        // Team Management
        listen('add-new-team-btn', 'click', () => UI.addTeamCard('', []));
        listen('save-team-settings-btn', 'click', async e => {
            const button = e.target;
            UI.showLoading(button, 'Saving...');
            const newTeamSettings = {};
            document.querySelectorAll('.team-card').forEach(card => {
                const teamName = card.querySelector('.team-name-input').value.trim();
                const techIds = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.dataset.techId);
                if (teamName && techIds.length > 0) {
                    newTeamSettings[teamName] = techIds;
                }
            });
            AppState.teamSettings = newTeamSettings;
            await DB.put('teams', { id: 'settings', data: newTeamSettings });
            UI.populateTeamFilters();
            UI.showNotification('Team settings saved.');
            UI.hideLoading(button);
        });
        
        // Bonus Tier Management
        listen('add-new-tier-btn', 'click', () => {
            AppState.bonusTiers.push({ quality: 0, bonus: 0 });
            UI.populateBonusTierSettings();
        });
        listen('bonus-tier-container', 'click', e => {
            if (e.target.closest('.remove-tier-btn')) {
                const btn = e.target.closest('.remove-tier-btn');
                const index = parseInt(btn.dataset.index);
                AppState.bonusTiers.splice(index, 1);
                UI.populateBonusTierSettings();
            }
        });
        listen('save-bonus-tiers-btn', 'click', async e => {
            const button = e.target;
            UI.showLoading(button, 'Saving...');
            const tiers = [];
            document.querySelectorAll('.config-tier-row').forEach(row => {
                const quality = parseFloat(row.querySelector('.tier-quality-input').value);
                const bonus = parseFloat(row.querySelector('.tier-bonus-input').value);
                if (!isNaN(quality) && !isNaN(bonus)) {
                    tiers.push({ quality, bonus });
                }
            });
            AppState.bonusTiers = tiers.sort((a, b) => b.quality - a.quality);
            await DB.put('bonusTiers', { id: 'tiers', data: AppState.bonusTiers });
            UI.populateBonusTierSettings();
            UI.showNotification('Bonus tiers saved. Remember to recalculate!');
            UI.hideLoading(button);
        });

        // Calculation Settings
        listen('save-calc-settings-btn', 'click', async e => {
            const button = e.target;
            UI.showLoading(button, 'Saving...');
            
            const newCalcSettings = JSON.parse(JSON.stringify(AppState.calculationSettings)); // Deep copy
            newCalcSettings.irModifierValue = parseFloat(document.getElementById('irModifierValue').value);
            newCalcSettings.points.qc = parseFloat(document.getElementById('qcPointValue').value);
            newCalcSettings.points.i3qa = parseFloat(document.getElementById('i3qaPointValue').value);
            newCalcSettings.points.rv2 = parseFloat(document.getElementById('rv2PointValue').value);

            // Update category values
            document.querySelectorAll('.cat-value-input').forEach(input => {
                const catId = input.dataset.catId;
                const gsd = input.dataset.gsd;
                const value = parseFloat(input.value);

                if (!newCalcSettings.categoryValues[catId]) newCalcSettings.categoryValues[catId] = {};
                newCalcSettings.categoryValues[catId][gsd] = value;
            });
            
            AppState.calculationSettings = newCalcSettings;
            await DB.put('calculationSettings', { id: 'settings', data: newCalcSettings });
            UI.populateCalculationSettings();
            UI.showNotification('Calculation settings saved. Remember to recalculate!');
            UI.hideLoading(button);
        });

        // Project Saving
        listen('admin-save-project-btn', 'click', async e => {
            const button = e.target;
            const modal = document.getElementById('admin-project-modal');
            const projectName = document.getElementById('admin-project-name').value.trim();
            const projectData = JSON.parse(modal.dataset.tempProjectData || '[]');
            const projectTechs = JSON.parse(modal.dataset.tempProjectTechs || '[]');

            if (!projectName || projectData.length === 0) {
                 UI.showNotification('Project name is empty or data is missing.', true);
                 return;
            }

            UI.showLoading(button, 'Saving Project...');
            try {
                const projectId = projectName.replace(/\s/g, '_').toLowerCase() + '_' + Date.now();
                const project = {
                    id: projectId,
                    name: projectName,
                    data: projectData,
                    tech_ids: projectTechs,
                    uploaded_at: new Date().toISOString()
                };
                
                await DB.put('projects', project);

                // Check if cloud saving is enabled and save there too
                if (AppState.firebase.tools) {
                    await AppState.firebase.tools.saveProject(project);
                    UI.showNotification("Project saved locally and to the cloud.");
                } else {
                    UI.showNotification("Project saved locally.");
                }

                modal.classList.add('hidden');
                Core.loadAdminProjectList(); // Reload list
            } catch (error) {
                 console.error("Error saving project:", error);
                 UI.showNotification("Error saving project.", true);
            } finally {
                UI.hideLoading(button);
            }
        });

        listen('admin-modal-close-btn', 'click', () => document.getElementById('admin-project-modal').classList.add('hidden'));


        // --- Dropzone & File Input Listeners ---
        listen('drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.add('bg-brand-700'); });
        listen('drop-zone', 'dragleave', e => e.target.closest('#drop-zone').classList.remove('bg-brand-700'));
        listen('drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.remove('bg-brand-700'); FileHandler.handleDroppedFiles(e.dataTransfer.files); });
        listen('file-input', 'change', e => { FileHandler.handleDroppedFiles(e.target.files); e.target.value = ''; });

        listen('admin-drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.add('bg-brand-700'); });
        listen('admin-drop-zone', 'dragleave', e => e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'));
        listen('admin-drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'); FileHandler.handleAdminDroppedFiles(e.dataTransfer.files); });
        listen('admin-file-input', 'change', e => { FileHandler.handleAdminDroppedFiles(e.target.files); e.target.value = ''; });
        
        // --- Dark/Light Mode Toggle ---
        listen('theme-toggle', 'click', e => {
            const isDark = document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
            document.getElementById('moon-icon').classList.toggle('hidden', isDark);
            document.getElementById('sun-icon').classList.toggle('hidden', !isDark);
        });
        
        // Initial Theme Setup
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('moon-icon').classList.add('hidden');
            document.getElementById('sun-icon').classList.remove('hidden');
        } else {
            document.getElementById('moon-icon').classList.remove('hidden');
            document.getElementById('sun-icon').classList.add('hidden');
        }

        // --- Firebase Integration (Simplified stub) ---
        // This is where Firebase logic would go if implemented.
        const auth = { onAuthStateChanged: (cb) => cb({ email: 'default.user@example.com' }) }; // Stub user
        this.initFirebase(auth);

        // --- Dropdown setup ---
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', e => {
                const dropdown = document.getElementById(toggle.dataset.dropdownTarget);
                dropdown.classList.toggle('hidden');
                e.stopPropagation();
            });
        });

        // Close dropdowns when clicking outside
        window.addEventListener('click', e => {
            document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                const toggle = document.querySelector(`[data-dropdown-target="${dropdown.id}"]`);
                if (toggle && !toggle.contains(e.target) && !dropdown.contains(e.target)) dropdown.classList.add('hidden');
            });
        });
        
        // Close modals
        document.querySelectorAll('.modal-close-btn').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.fixed');
                if (modal) modal.classList.add('hidden');
            });
        });
    },
    
    // Stub for Firebase
    initFirebase(auth) {
        AppState.firebase.auth = auth;
        auth.onAuthStateChanged(user => {
            // Check if user is an admin
            if (user && CONSTANTS.ADMIN_EMAIL.includes(user.email)) {
                AppState.firebase.isAdmin = true;
                document.getElementById('admin-portal-menu-item').classList.remove('hidden');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Extend dayjs for relative time functionality
    // NOTE: This uses the global variable 'dayjs_plugin_relativeTime' provided by the CDN script.
    dayjs.extend(dayjs_plugin_relativeTime); 
    Core.initialize();
});
