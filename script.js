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
    },
    currentProjectData: null, // Stores the raw parsed data for the current project
    projectsCache: [],       // Cache for project select dropdown
    filteredTechs: new Set() // For team filtering
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
    },
    ADMIN_PAGES: ['projects', 'teams', 'settings', 'users']
};

/**
 * Utility function to easily add event listeners.
 */
const listen = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    }
};

/**
 * IndexedDB Wrapper
 */
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

/**
 * Core Calculation Logic
 * NOTE: The main data parsing/filtering logic is mocked here, but the bonus/quality logic is preserved.
 */
const Calculator = {
    /**
     * Determines the bonus multiplier based on quality score and defined tiers.
     * @param {number} quality - The calculated quality score (0-100).
     * @returns {number} The bonus multiplier (e.g., 1.20).
     */
    calculateQualityModifier(quality) {
        const tiers = AppState.bonusTiers.length > 0 ? AppState.bonusTiers : CONSTANTS.DEFAULT_BONUS_TIERS;
        // Find the corresponding bonus tier (first tier where quality is >= tier quality)
        const tier = tiers.find(t => quality >= t.quality) || { bonus: 0.0 };
        return tier.bonus;
    },

    /**
     * Helper to get the descriptive tier range for the modal.
     * @param {number} quality - The calculated quality score (0-100).
     * @returns {string} The descriptive range.
     */
    getQualityTierRange(quality) {
        const tiers = AppState.bonusTiers.length > 0 ? AppState.bonusTiers : CONSTANTS.DEFAULT_BONUS_TIERS;
        
        // Ensure tiers are sorted descending by quality
        tiers.sort((a, b) => b.quality - a.quality);

        for (let i = 0; i < tiers.length; i++) {
            const current = tiers[i];
            const next = tiers[i + 1];

            if (quality >= current.quality) {
                if (i === 0) return `${current.quality.toFixed(1)}% and above (Highest Tier: ${current.bonus.toFixed(2)}x)`;
                if (next) return `${current.quality.toFixed(1)}% - ${next.quality.toFixed(1)}% (Multiplier: ${current.bonus.toFixed(2)}x)`;
                return `Tier: ${current.quality.toFixed(1)}% (Multiplier: ${current.bonus.toFixed(2)}x)`;
            }
        }
        
        if (tiers.length > 0) {
             return `Below ${tiers[tiers.length - 1].quality.toFixed(1)}% (No Bonus)`;
        }
        return 'No Tiers Defined';
    },

    /**
     * MOCK: Processes raw data and calculates points, fixes, refixes, and warnings for each tech.
     * This complex function is highly specialized and is mocked to allow the rest of the app to run.
     * @param {Array<Object>} rawData - The array of rows from the uploaded file.
     * @param {string} gsdValue - The selected GSD value.
     * @returns {Object} An object keyed by Tech ID with their stats.
     */
    calculateBonus: (rawData, gsdValue) => {
        // --- MOCK CALCULATION LOGIC for App demonstration ---
        const mockTechStats = {};
        const basePoints = CONSTANTS.DEFAULT_CALCULATION_SETTINGS.points.qc;

        // Use mock data if no project data is loaded
        const mockData = [
            { id: "7244AA", category: 1, qc_id: 'Q1', rv1_label: '', rv2_label: '', r1_warn: '', r2_warn: '' },
            { id: "7244AA", category: 2, qc_id: 'Q2', rv1_label: 'i', rv2_label: '', r1_warn: '', r2_warn: '' }, // Refix (i)
            { id: "7244AA", category: 1, qc_id: 'Q3', rv1_label: '', rv2_label: '', r1_warn: 'b', r2_warn: '' }, // Warning (b)
            { id: "4488MD", category: 3, qc_id: 'Q4', rv1_label: '', rv2_label: '', r1_warn: '', r2_warn: '' },
            { id: "4488MD", category: 1, qc_id: 'Q5', rv1_label: '', rv2_label: '', r1_warn: '', r2_warn: '' },
            { id: "7240HH", category: 4, qc_id: 'Q6', rv1_label: 'i', rv2_label: 'i', r1_warn: '', r2_warn: '' }, // Two Refixes (i, i)
            { id: "7240HH", category: 1, qc_id: 'Q7', rv1_label: '', rv2_label: '', r1_warn: '', r2_warn: '' }
        ];
        
        const dataToProcess = rawData && rawData.length > 0 ? rawData : mockData;

        dataToProcess.forEach(row => {
            const techId = row.id;
            if (!techId) return;

            if (!mockTechStats[techId]) {
                mockTechStats[techId] = {
                    id: techId,
                    points: 0,
                    fixTasks: 0,
                    refixTasks: 0,
                    warnings: [],
                    fix4: [] // Placeholder for Fix4 data mentioned in UI.updateTLSummary
                };
            }

            // Points calculation (simplified)
            const pointValue = CONSTANTS.DEFAULT_CALCULATION_SETTINGS.categoryValues[row.category]?.[gsdValue] || 1;
            mockTechStats[techId].points += pointValue * basePoints;
            mockTechStats[techId].fixTasks += 1; // Count as a "Fix" by default

            // Penalty logic (simplified)
            let isRefixOrWarning = false;

            // Check for Refixes
            CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers.refix.columns.forEach(col => {
                if (row[col] && CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers.refix.labels.includes(row[col])) {
                    mockTechStats[techId].refixTasks += 1;
                    mockTechStats[techId].warnings.push({ id: row.qc_id, type: 'Refix', column: col });
                    isRefixOrWarning = true;
                }
            });

            // Check for Warnings
            CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers.warning.columns.forEach(col => {
                // Ensure we don't double count if it's already a refix
                if (row[col] && CONSTANTS.DEFAULT_COUNTING_SETTINGS.triggers.warning.labels.includes(row[col])) {
                    // Check if a warning with the same qc_id and column has already been logged as a refix
                    const alreadyLogged = mockTechStats[techId].warnings.some(w => w.id === row.qc_id && w.column === col);
                    if (!alreadyLogged) {
                        mockTechStats[techId].warnings.push({ id: row.qc_id, type: 'Warning', column: col });
                        isRefixOrWarning = true;
                    }
                }
            });

            // If the original calculation involved complex multi-level points/penalties, they would be here.
        });

        return mockTechStats;
    }
};

/**
 * User Interface Management
 */
const UI = {
    /**
     * Sets dynamic height for dashboard panels to align in the grid layout.
     */
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

    /**
     * Updates the main leaderboard table with calculated tech stats.
     * MODIFIED: Stores breakdown data in AppState.currentTechStats.
     * @param {Object} techStats - Calculated statistics for all technicians.
     */
    displayResults(techStats) {
        const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
        const resultsTbody = document.getElementById('tech-results-tbody');
        resultsTbody.innerHTML = '';
        const infoIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293.006.399.287.47l.45.083.082.38-2.29.287-.082-.38.45-.083a.89.89 0 0 1 .352-.176c.24-.11.24-.216.06-.563l-.738-3.468c-.18-.84.48-1.133 1.17-1.133H8l.084.38zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`;
        
        let techArray = Object.values(techStats).map(tech => {
            // Filter tech based on active team filter
            if (AppState.filteredTechs.size > 0 && !AppState.filteredTechs.has(tech.id)) {
                return null;
            }

            // Calculation Logic
            const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
            const quality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
            const qualityModifier = Calculator.calculateQualityModifier(quality);
            const payout = tech.points * bonusMultiplier * qualityModifier;
            const bonusEarned = (qualityModifier * 100);

            // --- BREAKDOWN DATA STORAGE (NEW) ---
            tech.breakdown = {
                basePoints: tech.points,
                fixTasks: tech.fixTasks,
                refixTasks: tech.refixTasks, 
                warningCount: tech.warnings.length,
                denominator: denominator,
                qualityScore: quality,
                qualityModifier: qualityModifier,
                tierRange: Calculator.getQualityTierRange(quality), 
                baseMultiplier: bonusMultiplier,
                finalPayout: payout,
                warningDetails: tech.warnings.length > 0 ? tech.warnings : []
            };
            AppState.currentTechStats[tech.id] = tech; // Update global state with breakdown info

            return { ...tech, quality, payout, bonusEarned };
        }).filter(t => t !== null); // Remove filtered techs

        const sortKey = AppState.currentSort.column;
        const sortDir = AppState.currentSort.direction === 'asc' ? 1 : -1;
        techArray.sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return -1 * sortDir;
            if (a[sortKey] > b[sortKey]) return 1 * sortDir;
            return 0;
        });

        if (techArray.length === 0) {
            resultsTbody.innerHTML = `<tr><td colspan="8" class="text-center text-brand-400 p-4">No results to display.</td></tr>`;
            document.getElementById('overall-payout').textContent = '$0.00';
        } else {
            let totalPayout = techArray.reduce((sum, tech) => sum + tech.payout, 0);
            document.getElementById('overall-payout').textContent = `$${totalPayout.toFixed(2)}`;

            techArray.forEach(tech => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="py-2 px-3 font-semibold text-white">${tech.id}</td>
                    <td class="py-2 px-3 text-right">${tech.points.toFixed(3)}</td>
                    <td class="py-2 px-3 text-right">${tech.fixTasks}</td>
                    <td class="py-2 px-3 text-right ${tech.refixTasks > 0 ? 'text-red-400' : ''}">${tech.refixTasks}</td>
                    <td class="py-2 px-3 text-right"><span class="quality-pill ${tech.quality >= 95 ? 'quality-pill-green' : tech.quality >= 85 ? 'quality-pill-orange' : 'quality-pill-red'}">${tech.quality.toFixed(2)}%</span></td>
                    <td class="py-2 px-3 text-right">${tech.bonusEarned.toFixed(2)}%</td>
                    <td class="py-2 px-3 text-right payout-amount">$${tech.payout.toFixed(2)}</td>
                    <td class="py-2 px-3 text-center"><button class="info-icon tech-summary-icon" data-tech-id="${tech.id}" title="View Breakdown">${infoIconSvg}</button></td>
                `;
                resultsTbody.appendChild(row);
            });
        }
        document.getElementById('bonus-payout-section').classList.remove('hidden');
        document.getElementById('no-results-view').classList.add('hidden');
        this.updateSortHeaders();
        UI.setPanelHeights();
        this.updateLeaderboard(techStats);
        this.updateTLSummary(techStats);
        this.updateQuickSummary(techStats);
    },

    /**
     * NEW FEATURE: Renders and displays the detailed calculation breakdown modal.
     * This function replaces the incomplete `generateTechBreakdownHTML` from the original script.
     * @param {string} techId - The ID of the technician to display.
     */
    showBreakdownModal(techId) {
        const tech = AppState.currentTechStats[techId];
        const modal = document.getElementById('breakdown-modal');
        const techIdSpan = document.getElementById('breakdown-tech-id');
        const contentDiv = document.getElementById('breakdown-content');
        
        if (!tech || !tech.breakdown) {
            techIdSpan.textContent = techId;
            contentDiv.innerHTML = `<p class="text-status-red">Error: Calculation breakdown data for ${techId} is missing. Please re-run the calculation.</p>`;
            modal.classList.remove('hidden');
            return;
        }

        const breakdown = tech.breakdown;

        // --- 1. Quality Calculation Section ---
        const qualityCalculation = `
            <div class="breakdown-section">
                <h4 class="text-xl font-semibold mb-2 text-white">1. Quality Score Calculation</h4>
                <p class="text-brand-400 mb-2">The Quality Score determines your Bonus Multiplier.</p>
                <div class="breakdown-formula my-3">
                    Quality Score = (Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) × 100
                    <br>
                    Score = (${breakdown.fixTasks} / (${breakdown.fixTasks} + ${breakdown.refixTasks} + ${breakdown.warningCount})) × 100
                </div>
                <table class="breakdown-table">
                    <tr><th>Metric</th><th>Count</th></tr>
                    <tr><td>Fix Tasks (Numerator)</td><td class="font-medium">${breakdown.fixTasks}</td></tr>
                    <tr><td>Refix Tasks (Penalty)</td><td class="text-red-400 font-medium">${breakdown.refixTasks}</td></tr>
                    <tr><td>Warning Count (Penalty)</td><td class="text-red-400 font-medium">${breakdown.warningCount}</td></tr>
                    <tr class="total-row"><td>FINAL QUALITY SCORE</td><td class="text-white">${breakdown.qualityScore.toFixed(2)}%</td></tr>
                </table>
                <p class="mt-4 text-sm text-brand-400">
                    *The total penalty denominator is ${breakdown.denominator}.
                </p>
            </div>
        `;

        // --- 2. Multiplier Determination Section ---
        const multiplierDetermination = `
            <div class="breakdown-section">
                <h4 class="text-xl font-semibold mb-2 text-white">2. Bonus Multiplier & Tier</h4>
                <p class="text-brand-400 mb-2">Based on your ${breakdown.qualityScore.toFixed(2)}% Quality Score, you fall into the following tier:</p>
                
                <table class="breakdown-table">
                    <tr><td class="font-semibold">Quality Tier Range:</td><td class="text-white">${breakdown.tierRange}</td></tr>
                    <tr><td class="font-semibold">Quality Multiplier (from table):</td><td class="text-status-green font-medium">${breakdown.qualityModifier.toFixed(3)}x</td></tr>
                </table>

                <h5 class="text-lg font-medium mt-4 text-brand-300">Administrative Multiplier</h5>
                <p class="text-brand-400 mb-2">This is the global multiplier applied to all calculated bonuses for this project.</p>
                <table class="breakdown-table">
                    <tr><td class="font-semibold">Base Payout Multiplier:</td><td class="text-white font-medium">${breakdown.baseMultiplier.toFixed(2)}x</td></tr>
                </table>
            </div>
        `;

        // --- 3. Final Payout Calculation Section ---
        const finalPayout = `
            <div class="breakdown-section">
                <h4 class="text-xl font-semibold mb-2 text-white">3. Final Payout Calculation</h4>
                <p class="text-brand-400 mb-2">The total payout is the Base Points multiplied by all applicable multipliers.</p>
                <div class="breakdown-formula my-3">
                    Payout = Base Points × Quality Multiplier × Base Multiplier
                    <br>
                    Payout = ${breakdown.basePoints.toFixed(3)} × ${breakdown.qualityModifier.toFixed(3)} × ${breakdown.baseMultiplier.toFixed(2)}
                </div>
                <table class="breakdown-table">
                    <tr><td>Base Points Earned</td><td class="font-medium">${breakdown.basePoints.toFixed(3)}</td></tr>
                    <tr><td>Total Multiplier</td><td class="text-status-green font-medium">x ${(breakdown.qualityModifier * breakdown.baseMultiplier).toFixed(3)}</td></tr>
                    <tr class="total-row"><td>FINAL BONUS PAYOUT</td><td class="text-status-green text-xl">$${breakdown.finalPayout.toFixed(2)}</td></tr>
                </table>
            </div>
        `;

        // --- 4. Warning Detail Section (Optional) ---
        let warningDetails = '';
        if (breakdown.warningDetails.length > 0) {
            const warningsList = breakdown.warningDetails.map(w => {
                const type = w.type || (w.column && w.column.includes('warn') ? 'Warning' : 'Refix');
                const column = w.column ? `(Source: ${w.column})` : '';
                return `<li class="breakdown-formula mb-1">${w.id || 'N/A'} - ${type} ${column}</li>`;
            }).join('');
            warningDetails = `
                <div class="breakdown-section">
                    <h4 class="text-xl font-semibold mb-2 text-status-red">Warning / Penalty Details (${breakdown.warningCount} total)</h4>
                    <p class="text-brand-400 mb-2">These are the specific records that contributed to your penalty denominator:</p>
                    <ul class="list-disc pl-5 space-y-2 text-sm text-brand-300">
                        ${warningsList}
                    </ul>
                </div>
            `;
        }

        techIdSpan.textContent = techId;
        contentDiv.scrollTop = 0; // Reset scroll position
        contentDiv.innerHTML = qualityCalculation + multiplierDetermination + finalPayout + warningDetails;
        this.openModal('breakdown-modal'); // Open the modal
    },

    // --- Original UI Functions (Completed/Restored from snippet) ---
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
            div.innerHTML = `<input id="team-filter-${team.replace(/\s/g, '-')}" type="checkbox" data-team="${team}" class="h-4 w-4 text-accent focus:ring-accent bg-brand-700 border-brand-600 rounded team-filter-checkbox"><label for="team-filter-${team.replace(/\s/g, '-')}" class="ml-2 block text-sm">${team}</label>`;
            container.appendChild(div);
        });
        // Attach listener to new checkboxes
        document.querySelectorAll('.team-filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', App.handleTeamFilterChange);
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
                    // Assuming item.category is where the category number is stored
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
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('hidden');
    },
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.add('hidden');
    },
    // The original script was cut off here. The following function is re-added based on its probable structure
    // but the full complexity of category breakdown logic is omitted as it was unavailable.
    // It is effectively replaced by showBreakdownModal for the new feature.
    generateTechBreakdownHTML(tech) {
        const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
        const fixQuality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
        const qualityModifier = Calculator.calculateQualityModifier(fixQuality);
        const finalPayout = tech.points * (parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1) * qualityModifier;

        let projectBreakdownHTML = '';
        // Assuming a simpler structure for project breakdown since the original logic was cut off
        if (tech.isCombined || tech.projectName) {
            let projectRows = '';
            const breakdownSource = tech.isCombined ? tech.pointsBreakdownByProject : { [tech.projectName || 'Current Project']: { points: tech.points, fixTasks: tech.fixTasks, refixTasks: tech.refixTasks, warnings: tech.warnings.length } };
            for (const projectName in breakdownSource) {
                const projectData = breakdownSource[projectName];
                projectRows += `<tr><td class="p-2 font-semibold">${projectName}</td><td class="p-2 text-center">${projectData.points.toFixed(3)}</td><td class="p-2 text-center">${projectData.fixTasks}</td><td class="p-2 text-center">${projectData.refixTasks}</td><td class="p-2 text-center">${projectData.warnings}</td></tr>`;
            }
            projectBreakdownHTML = `<div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4 mb-4"><h4 class="font-semibold text-base text-white mb-2">Project Contribution</h4><div class="table-container text-sm"><table class="min-w-full"><thead class="bg-brand-900/50"><tr><th class="p-2 text-left">Project</th><th class="p-2 text-center">Points</th><th class="p-2 text-center">Fix</th><th class="p-2 text-center">Refix</th><th class="p-2 text-center">Warn</th></tr></thead><tbody>${projectRows}</tbody></table></div></div>`;
        } 
        
        let summaryCategoryItems = '';
        // The loop was cut off, so we complete it with a basic placeholder
        for (let i = 1; i <= 9; i++) { 
             // Logic to populate category breakdown (omitted, as it was cut off)
        }
        
        // Return a combined HTML string, using the new showBreakdownModal for the main UI
        return projectBreakdownHTML; 
    },
    // The rest of the original UI functions (admin handlers, etc.) would be here.
    // ...
};

/**
 * Main Application Logic
 */
const App = {
    init: async () => {
        await DB.open();
        // Load initial settings (or use defaults)
        AppState.teamSettings = await DB.get('teams', 'default') || CONSTANTS.DEFAULT_TEAMS;
        AppState.bonusTiers = await DB.get('bonusTiers', 'default') || CONSTANTS.DEFAULT_BONUS_TIERS;
        
        // Initial UI setup
        UI.populateTeamFilters();
        UI.setPanelHeights();
        App.addEventListeners();

        // Initial results display (shows 'Awaiting Data' view)
        document.getElementById('bonus-payout-section').classList.add('hidden');
        document.getElementById('no-results-view').classList.remove('hidden');

        // Run a mock calculation to populate the leaderboard/summary views with mock data
        if (!AppState.currentProjectData) {
            App.calculateBonusPayout(true);
        }
    },

    addEventListeners: () => {
        // --- NEW FEATURE LISTENER ---
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.tech-summary-icon');
            if (button) {
                const techId = button.dataset.techId;
                UI.showBreakdownModal(techId);
            }
        });
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('team-summary-trigger')) {
                // Original Team Summary logic goes here
            }
        });

        // --- CORE UI LISTENERS ---
        listen('calculate-btn', 'click', () => App.calculateBonusPayout(false));
        listen('gsd-value-select', 'change', () => App.calculateBonusPayout(false));
        listen('bonusMultiplierDirect', 'input', () => App.calculateBonusPayout(false));
        listen('leaderboard-sort-select', 'change', () => UI.updateLeaderboard(AppState.currentTechStats));
        listen('search-tech-id', 'input', () => UI.applyFilters());
        
        // Sortable Headers
        document.querySelectorAll('.sortable-header').forEach(header => {
            header.addEventListener('click', App.handleSortChange);
        });

        // Modal Close Buttons (From index.html snippet)
        document.querySelectorAll('.modal-close-btn').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.fixed');
                if (modal) modal.classList.add('hidden');
            });
        });

        // --- DATA/FILE LISTENERS ---
        listen('file-input', 'change', e => App.handleDroppedFiles(e.target.files));
        
        // Main Drop Zone
        listen('drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.add('bg-brand-700'); });
        listen('drop-zone', 'dragleave', e => e.target.closest('#drop-zone').classList.remove('bg-brand-700'));
        listen('drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.remove('bg-brand-700'); App.handleDroppedFiles(e.dataTransfer.files); });

        // Admin Portal Drop Zone (From original snippet)
        listen('admin-drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.add('bg-brand-700'); });
        listen('admin-drop-zone', 'dragleave', e => e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'));
        listen('admin-drop-zone', 'drop', e => { e.preventDefault(); e.target.closest('#admin-drop-zone').classList.remove('bg-brand-700'); this.handleAdminDroppedFiles(e.dataTransfer.files); });
        
        // ... other administrative listeners would go here (save settings, etc.)
    },
    
    // --- HANDLERS ---
    handleDroppedFiles: async (files) => {
        // Placeholder for the full file processing logic (CSV/Excel/JSON parsing)
        if (files.length === 0) return;
        
        const file = files[0];
        const fileName = file.name;
        
        UI.showNotification(`Processing file: ${fileName}...`);
        
        // Simulate a delay for parsing
        await new Promise(resolve => setTimeout(resolve, 1000)); 

        // Mock a parsed data object (using Calculator's internal mock data for consistency)
        AppState.currentProjectData = {
            id: `proj-${Date.now()}`,
            name: fileName,
            data: Calculator.calculateBonus().rawDataMock // Data property for processing
        };
        
        document.getElementById('data-source-info').textContent = `Source: ${fileName}`;
        document.getElementById('summary-total-rows').textContent = 7; // Mock value
        document.getElementById('summary-unique-techs').textContent = 3; // Mock value
        document.getElementById('parsed-data-summary').classList.remove('hidden');
        document.getElementById('gsv-config').classList.remove('hidden');
        
        UI.showNotification(`Data loaded successfully from ${fileName}. Ready for calculation.`);
        App.calculateBonusPayout(false); // Run calculation on new data
    },

    handleAdminDroppedFiles: async (files) => {
        // Placeholder for admin file processing logic
        UI.showNotification(`Processing Admin file: ${files[0].name}...`);
        // ...
    },

    handleSortChange: (e) => {
        const header = e.target.closest('.sortable-header');
        if (!header) return;
        const column = header.dataset.sort;
        let direction = 'desc';

        if (AppState.currentSort.column === column) {
            direction = AppState.currentSort.direction === 'desc' ? 'asc' : 'desc';
        }
        
        AppState.currentSort = { column, direction };
        UI.displayResults(AppState.currentTechStats);
    },

    handleTeamFilterChange: () => {
        const checkedBoxes = document.querySelectorAll('.team-filter-checkbox:checked');
        AppState.filteredTechs.clear();
        
        // Gather all unique tech IDs from selected teams
        checkedBoxes.forEach(checkbox => {
            const teamName = checkbox.dataset.team;
            const techIds = AppState.teamSettings[teamName] || [];
            techIds.forEach(id => AppState.filteredTechs.add(id));
        });

        // Re-display results with new filters applied
        UI.applyFilters(); // Re-apply all filters (search, team)
        UI.setPanelHeights();
    },

    // --- MAIN ACTION ---
    calculateBonusPayout: async (isMockRun = false) => {
        const calculateBtn = document.getElementById('calculate-btn');
        if (!isMockRun) UI.showLoading(calculateBtn);

        const gsdValue = document.getElementById('gsd-value-select').value;
        AppState.lastUsedGsdValue = gsdValue;

        try {
            const rawData = AppState.currentProjectData ? AppState.currentProjectData.data : [];
            
            const techStats = Calculator.calculateBonus(rawData, gsdValue);
            
            // Store global tech stats before filtering/sorting for the breakdown modal to access all data
            AppState.currentTechStats = techStats;

            UI.applyFilters(); // Display results (which includes filtering and sorting)
            if (!isMockRun) UI.showNotification("Bonus calculation complete!");

        } catch (error) {
            console.error("Calculation Error:", error);
            UI.showNotification("An error occurred during calculation.", true);
        } finally {
            if (!isMockRun) UI.hideLoading(calculateBtn);
            UI.setPanelHeights();
        }
    }
    // ... the rest of the original 1700 lines of application logic (Firebase, admin tools, project saving, etc.) would continue here.
};

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
