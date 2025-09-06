// --- GLOBAL VARIABLES ---
let db;
let projectListCache = [];
let fullProjectDataCache = {};
let currentTechStats = {};
let lastUsedBonusMultiplier = 1;
let lastCalculationUsedMultiplier = false;
let teamSettings = {};
let bonusTiers = []; // To hold the bonus tier settings
let calculationSettings = {}; // To hold all calculation logic values
let countingSettings = {}; // To hold all task counting rules
let reorderSortable = null;
let lastUsedGsdValue = '3in';
let isSaving = false; // Flag to prevent recursive event firing
let mergedFeatures = []; // To store features from dropped files in the merge modal
let currentDataHeaders = []; // To store headers of the currently parsed data
let currentDataLines = []; // To store lines of the currently parsed data
let fix4CategoryCounts = {}; // To store the fix4 category breakdown

const DB_NAME = 'BonusCalculatorDB';
const TECH_ID_REGEX = /^\d{4}[a-zA-Z]{2}$/;

// --- NEW FUNCTION TO SET PANEL HEIGHTS ---
function setPanelHeights() {
    const dataPanel = document.getElementById('data-projects-panel');
    const leaderboardPanel = document.getElementById('leaderboard-panel');
    const tlSummaryPanel = document.getElementById('tl-summary-card');

    // Ensure all panels exist before proceeding
    if (!dataPanel || !leaderboardPanel || !tlSummaryPanel) return;

    // On smaller screens (mobile view), remove fixed heights for natural document flow
    if (window.innerWidth < 1024) {
        dataPanel.style.height = '';
        leaderboardPanel.style.height = '';
        tlSummaryPanel.style.height = '';
        return;
    }

    // On larger screens, synchronize the heights.
    // Reset all panel heights to 'auto'. This removes previous fixed heights and lets the browser
    // calculate the natural height of the dataPanel based on its content.
    dataPanel.style.height = 'auto';
    leaderboardPanel.style.height = 'auto';
    tlSummaryPanel.style.height = 'auto';

    // Use requestAnimationFrame to ensure the measurement happens after the browser has
    // processed the 'auto' height styles. This prevents reading a stale, stretched height value.
    requestAnimationFrame(() => {
        const dataPanelHeight = dataPanel.getBoundingClientRect().height;
        
        // Set all panels to the same height as the data panel, creating a uniform row.
        // This also "locks" the data panel's height, preventing it from being stretched by its siblings.
        dataPanel.style.height = `${dataPanelHeight}px`;
        leaderboardPanel.style.height = `${dataPanelHeight}px`;
        tlSummaryPanel.style.height = `${dataPanelHeight}px`;
    });
}


// --- PREVIOUSLY EXISTING CODE ---

const defaultTeams = {
    "Team 123": ["7244AA", "7240HH", "7247JA", "4232JD", "4475JT", "4472JS", "4426KV", "7236LE", "7039NO", "7231NR", "7249SS", "7314VP"],
    "Team 63": ["7089RR", "7102JD", "7161KA", "7159MC", "7168JS", "7158JD", "7167AD", "7040JP", "7178MD", "7092RN", "7170WS"],
    "Team 115": ["4297RQ", "7086LP", "7087LA", "7088MA", "7099SS", "7171AL", "7311JT", "7173ES", "7175JP", "7084LQ", "7044AM"],
    "Team 57": ["4488MD", "7096AV", "4489EA", "7103RE", "7043RP", "7093MG", "7166CR", "7090JA", "7165GR", "7176CC"],
    "Team 114": ["7042NB", "7234CS", "7313MB", "7036RB", "4478JV", "7239EO", "4477PT", "7251JD", "4135RC", "7315CR", "7243JC"],
    "Team 64": ["4474HS", "4492CP", "4421AT", "7237ML", "7233JP", "7316NT", "7245SC", "4476JR", "7246AJ", "7241DM", "4435AC", "7242FV", "2274JD"]
};

const defaultBonusTiers = [
    { quality: 100, bonus: 1.20 }, { quality: 99.5, bonus: 1.18 }, { quality: 99, bonus: 1.16 },
    { quality: 98.5, bonus: 1.14 }, { quality: 98, bonus: 1.12 }, { quality: 97.5, bonus: 1.10 },
    { quality: 97, bonus: 1.08 }, { quality: 96.5, bonus: 1.06 }, { quality: 96, bonus: 1.04 },
    { quality: 95.5, bonus: 1.02 }, { quality: 95, bonus: 1.00 }, { quality: 94.5, bonus: 0.99 },
    { quality: 94, bonus: 0.98 }, { quality: 93.5, bonus: 0.97 }, { quality: 93, bonus: 0.96 },
    { quality: 92.5, bonus: 0.95 }, { quality: 92, bonus: 0.94 }, { quality: 91.5, bonus: 0.93 },
    { quality: 91, bonus: 0.91 }, { quality: 90.5, bonus: 0.90 }, { quality: 90, bonus: 0.88 },
    { quality: 89.5, bonus: 0.87 }, { quality: 89, bonus: 0.85 }, { quality: 88.5, bonus: 0.83 },
    { quality: 88, bonus: 0.80 }, { quality: 87.5, bonus: 0.78 }, { quality: 87, bonus: 0.75 },
    { quality: 86.5, bonus: 0.73 }, { quality: 86, bonus: 0.70 }, { quality: 85.5, bonus: 0.68 },
    { quality: 85, bonus: 0.66 }, { quality: 84.5, bonus: 0.64 }, { quality: 84, bonus: 0.62 },
    { quality: 83.5, bonus: 0.60 }, { quality: 83, bonus: 0.57 }, { quality: 82.5, bonus: 0.55 },
    { quality: 82, bonus: 0.50 }, { quality: 81.5, bonus: 0.45 }, { quality: 81, bonus: 0.40 },
    { quality: 80.5, bonus: 0.35 }, { quality: 80, bonus: 0.30 }, { quality: 79.5, bonus: 0.25 },
    { quality: 79, bonus: 0.20 }, { quality: 78.5, bonus: 0.15 }, { quality: 78, bonus: 0.10 },
    { quality: 77.5, bonus: 0.05 }
];

const defaultCalculationSettings = {
    irModifierValue: 1.5,
    points: { qc: 1 / 8, i3qa: 1 / 12, rv1: 0.2, rv1_combo: 0.25, rv2: 0.5 },
    categoryValues: {
        1: { "3in": 2.19, "4in": 2.19, "6in": 2.19, "9in": 0.99 },
        2: { "3in": 5.86, "4in": 5.86, "6in": 5.86, "9in": 2.07 },
        3: { "3in": 7.44, "4in": 7.44, "6in": 7.44, "9in": 2.78 },
        4: { "3in": 2.29, "4in": 2.29, "6in": 2.29, "9in": 1.57 },
        5: { "3in": 1.55, "4in": 1.55, "6in": 1.55, "9in": 0.6 },
        6: { "3in": 1.84, "4in": 1.84, "6in": 1.84, "9in": 0.78 },
        7: { "3in": 1, "4in": 1, "6in": 1, "9in": 1 },
        8: { "3in": 3.74, "4in": 3.74, "6in": 3.74, "9in": 3.74 },
        9: { "3in": 1.73, "4in": 1.73, "6in": 1.73, "9in": 1.73 }
    }
};

const defaultCountingSettings = {
    taskColumns: {
        qc: ['qc1_id', 'qc2_id', 'qc3_id'],
        i3qa: ['i3qa_id'],
        rv1: ['rv1_id'],
        rv2: ['rv2_id']
    },
    triggers: {
        refix: {
            labels: ['i'],
            columns: ['rv1_label', 'rv2_label', 'rv3_label']
        },
        miss: {
            labels: ['m', 'c'],
            columns: ['i3qa_label', 'rv1_label', 'rv2_label', 'rv3_label']
        },
        warning: {
            labels: ['b', 'c', 'd', 'e', 'f', 'g', 'i'],
            columns: ['r1_warn', 'r2_warn', 'r3_warn', 'r4_warn']
        },
        qcPenalty: { // Rule for penalizing QC and transferring points
            labels: ['m', 'e'], // M for Missing, E for Error
            columns: ['i3qa_label']
        }
    }
};

const calculationInfo = {
    howItWorks: {
        title: 'How It Works: A Complete Guide',
        body: `<div class="space-y-4 text-sm">
            <p>This guide provides a comprehensive overview of the calculator's functions and the logic behind its calculations. All data you use is stored privately and securely in your own browser.</p>
            
            <details class="bg-gray-900/50 p-3 rounded-lg border border-gray-700" open>
                <summary class="font-semibold text-base text-gray-100 cursor-pointer">How to Use This Site</summary>
                <div class="mt-3 pt-3 border-t border-gray-600 space-y-4">
                    <div>
                        <h4 class="font-bold text-gray-200">1. Adding and Managing Project Data</h4>
                        <ul class="list-disc list-inside mt-1 space-y-1 text-gray-400">
                            <li><strong class="text-gray-300">Enter Data:</strong> Paste your tab-separated data into the main text area under "Project Data Entry". You can also drag-and-drop all shapefile components (.shp, .dbf, .shx, etc.) into this area to automatically extract and paste the attribute data.</li>
                            <li><strong class="text-gray-300">Set Project Options:</strong>
                                <ul class="list-['-_'] list-inside ml-4">
                                    <li>Check <span class="font-semibold text-yellow-300">Mark Project as IR</span> if it's an IR project to apply a 1.5x multiplier to Fix Tasks.</li>
                                    <li>Select the correct <span class="font-semibold text-gray-300">GSD Point Value</span> to ensure accurate point calculation for Fix Task categories.</li>
                                </ul>
                            </li>
                            <li><strong class="text-gray-300">Save Project:</strong> Enter a unique name in the "Enter Project Name" field and click <strong class="text-indigo-400">Save Project</strong>. The data is compressed and saved locally in your browser.</li>
                            <li><strong class="text-gray-300">Load Project:</strong> Click the <strong class="text-blue-400">Refresh</strong> button (circular arrow) to load all saved projects into the dropdown menu. Select a project to view its data.</li>
                             <li><strong class="text-gray-300">Edit/Delete:</strong> Once a project is loaded, you can click the <strong class="text-gray-400">Edit</strong> icon to modify its data or the <strong class="text-red-400">Trash</strong> icon to delete it permanently.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 class="font-bold text-gray-200">2. Calculating Bonuses</h4>
                        <ul class="list-disc list-inside mt-1 space-y-1 text-gray-400">
                            <li><strong class="text-gray-300">Single Project:</strong> Load a project from the dropdown and click <strong class="text-blue-400">Calculate Selected Project</strong>.</li>
                            <li><strong class="text-gray-300">Pasted Data:</strong> If you don't want to save the data, simply paste it, set the options, and click <strong class="text-purple-400">Calculate Pasted Data</strong>.</li>
                            <li><strong class="text-gray-300">Multiple Projects:</strong> Check the "Select specific projects" box, hold Ctrl/Cmd and click to select multiple projects from the list, then click <strong class="text-green-400">Calculate All Projects</strong>. To calculate every saved project, simply leave the box unchecked and click the same button.</li>
                            <li><strong class="text-gray-300">Bonus Multiplier:</strong> Enter a value in the "Bonus Multiplier (PHP)" field to apply a multiplier to the final payout for all technicians. For example, 1.1 means a 10% bonus.</li>
                             <li><strong class="text-gray-300">Customize Everything:</strong> Use the <strong class="text-purple-400">Advance Settings</strong> button to customize the entire calculation logic.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 class="font-bold text-gray-200">3. Viewing Results & Metrics</h4>
                        <ul class="list-disc list-inside mt-1 space-y-1 text-gray-400">
                            <li><strong class="text-gray-300">Results Table:</strong> After calculation, a detailed table appears. Use the search bar or team checkboxes to filter the results.</li>
                            <li><strong class="text-gray-300">Detailed View:</strong> Click the info icon next to any Tech ID in the results table to see a detailed modal with their specific stats, point breakdown, and quality calculation.</li>
                            <li><strong class="text-gray-300">Performance Metrics:</strong> The card on the left updates with a <strong class="text-gray-300">Leaderboard</strong> (sortable by tasks, points, or quality) and a <strong class="text-gray-300">Workload Distribution</strong> chart.</li>
                            <li><strong class="text-gray-300">Project/TL Summary:</strong> Cards will appear below the data entry section showing overall project quality and a summary for Team Leaders.</li>
                        </ul>
                    </div>
                </div>
            </details>
            
            <details class="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <summary class="font-semibold text-base text-gray-100 cursor-pointer">How The Calculation Works</summary>
                <div class="mt-3 pt-3 border-t border-gray-600 space-y-4">
                    <p>The calculation is a four-step process based on the official documentation. All numerical values and counting logic can be customized in the settings.</p>
                     <div>
                        <h4 class="font-bold text-gray-200">Step 1: Point Calculation</h4>
                        <p class="text-gray-400">The tool first calculates the <strong class="text-gray-300">Total Points</strong> for each technician by summing up points from different task types, as defined in the <strong class="text-orange-400">Advance Settings</strong>:</p>
                        <ul class="list-disc list-inside mt-1 space-y-1 text-gray-400">
                            <li><strong class="text-gray-300">Fix Tasks:</strong> Points are based on the category and the selected GSD value. All point values are defined in the <strong class="text-red-400">Advance Settings</strong>. If the project is marked as "IR", the total points for a fix task row are multiplied by the customizable IR Modifier.</li>
                            <li><strong class="text-gray-300">QC, i3qa, RV Tasks:</strong> Each task is awarded a specific point value, which can be edited in the <strong class="text-red-400">Advance Settings</strong>.</li>
                            <li><strong class="text-yellow-300">Point Transfers:</strong> If a QC task is flagged with a 'Missing' or 'Incomplete' tag during i3QA, the points for that QC task are subtracted from the QC tech and awarded to the i3QA tech.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 class="font-bold text-gray-200">Step 2: Fix Quality Percentage</h4>
                        <p class="text-gray-400">A technician's quality is crucial. It's calculated with the formula:</p>
                        <div class="code-block my-2 text-gray-300">Fix Quality % = (Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) * 100</div>
                        <p class="text-gray-400">What counts as a "Refix" or "Warning" is defined in the <strong class="text-orange-400">Advance Settings</strong>.</p>
                    </div>
                     <div>
                        <h4 class="font-bold text-gray-200">Step 3: Bonus Earned Percentage</h4>
                        <p class="text-gray-400">The <strong class="text-gray-300">Fix Quality %</strong> is used to find the <strong class="text-gray-300">% of Bonus Earned</strong> from a predefined tiered table. This table is fully customizable via the <strong class="text-purple-400">Advance Settings</strong> button.</p>
                    </div>
                     <div>
                        <h4 class="font-bold text-gray-200">Step 4: Final Payout</h4>
                        <p class="text-gray-400">The final payout in PHP is calculated by combining all the previous elements:</p>
                         <div class="code-block my-2 text-blue-300">Final Payout = Total Points * Bonus Multiplier * % of Bonus Earned</div>
                    </div>
                </div>
            </details>
        </div>`
    },
    bonusMultiplier: { title: 'Bonus Multiplier (PHP)', body: `<p>An optional multiplier for the final payout. Enter a number (e.g., 1.25 for a 25% bonus) to adjust the final calculated bonus for all technicians.</p>` },
    totalPoints: { title: 'Total Points Calculation', body: `<p>Points are calculated for each individual task based on its type (Fix, QC, i3qa, RV) and category, then summed for each technician. All point values are customizable in the 'Advance Settings' modal.</p>`},
    fixQuality: { title: 'Fix Quality % Calculation', body: `<p>This measures a technician's accuracy. It's calculated using the formula: <code>[# of Fix Tasks] / ([# of Fix Tasks] + [# of Refix Tasks] + [# of Warnings])</code>. What constitutes a refix or warning is defined in the 'Advance Settings' modal.</p>`},
    bonusEarned: { title: '% of Bonus Earned Calculation', body: `<p>This percentage is determined by looking up the <strong>Fix Quality %</strong> in a tiered table. This table is customizable via the "Advance Settings" button.</p>`},
    totalBonus: { title: 'Final Payout (PHP) Calculation', body: `<p>The final amount a technician receives. It's calculated with the formula: <code>Total Points * Bonus Multiplier * % of Bonus Earned</code></p>`}
};

// --- IndexedDB Helper Functions ---
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 3);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('teams')) db.createObjectStore('teams', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('bonusTiers')) db.createObjectStore('bonusTiers', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('calculationSettings')) db.createObjectStore('calculationSettings', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('countingSettings')) db.createObjectStore('countingSettings', { keyPath: 'id' });
        };
        request.onsuccess = (event) => { db = event.target.result; resolve(db); };
        request.onerror = (event) => { console.error("IndexedDB error:", event.target.error); reject(event.target.error); };
    });
}

async function getFromDB(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function putToDB(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteFromDB(storeName, key) {
     return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getAllFromDB(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// --- CORE LOGIC FUNCTIONS ---
function createNewTechStat() {
    const categoryCounts = {};
    for (let i = 1; i <= 9; i++) {
        categoryCounts[i] = { primary: 0, i3qa: 0, afp: 0, rv: 0 };
    }
    return {
        id: '', points: 0, fixTasks: 0, afpTasks: 0, refixTasks: 0, warnings: [],
        refixDetails: [], missedCategories: [], approvedByRQA: [],
        approvedByRQACategoryCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
        categoryCounts: categoryCounts,
        pointsBreakdown: { fix: 0, qc: 0, i3qa: 0, rv: 0, qcTransfer: 0 }
    };
}

// --- Settings and Tiers Functions ---
async function loadBonusTiers() {
    try {
        const savedTiers = await getFromDB('bonusTiers', 'customTiers');
        bonusTiers = (savedTiers && savedTiers.tiers.length > 0) ? savedTiers.tiers : defaultBonusTiers;
    } catch (error) {
        console.error("Error loading bonus tiers:", error);
        bonusTiers = defaultBonusTiers;
    }
}

async function loadCalculationSettings() {
    try {
        const savedSettings = await getFromDB('calculationSettings', 'customSettings');
        calculationSettings = savedSettings ? savedSettings.settings : JSON.parse(JSON.stringify(defaultCalculationSettings));
    } catch (error) {
        console.error("Error loading calculation settings:", error);
        calculationSettings = JSON.parse(JSON.stringify(defaultCalculationSettings));
    }
}

async function loadCountingSettings() {
    try {
        const savedSettings = await getFromDB('countingSettings', 'customCounting');
        // Ensure that new settings keys (like qcPenalty) are merged with older saved settings
        countingSettings = savedSettings ? 
            { ...defaultCountingSettings, ...savedSettings.settings, triggers: { ...defaultCountingSettings.triggers, ...savedSettings.settings.triggers } } : 
            JSON.parse(JSON.stringify(defaultCountingSettings));
    } catch (error) {
        console.error("Error loading counting settings:", error);
        countingSettings = JSON.parse(JSON.stringify(defaultCountingSettings));
    }
}

async function saveAdvanceSettings() {
    // Save Bonus Tiers
    const editor = document.getElementById('bonus-tier-editor-container');
    const rows = editor.querySelectorAll('.tier-row');
    const newTiers = [];
    let isTiersValid = true;
    rows.forEach(row => {
        const quality = parseFloat(row.querySelector('.tier-quality-input').value);
        const bonus = parseFloat(row.querySelector('.tier-bonus-input').value);
        if (isNaN(quality) || isNaN(bonus)) isTiersValid = false;
        else newTiers.push({ quality, bonus: bonus / 100 });
    });
    if (!isTiersValid) return alert("Please ensure all bonus tier fields are valid numbers.");
    newTiers.sort((a, b) => b.quality - a.quality);

    // Save Calculation Settings
    const newCalcSettings = {
        irModifierValue: parseFloat(document.getElementById('setting-ir-modifier').value),
        points: {
            qc: parseFloat(document.getElementById('setting-qc-points').value),
            i3qa: parseFloat(document.getElementById('setting-i3qa-points').value),
            rv1: parseFloat(document.getElementById('setting-rv1-points').value),
            rv1_combo: parseFloat(document.getElementById('setting-rv1-combo-points').value),
            rv2: parseFloat(document.getElementById('setting-rv2-points').value)
        },
        categoryValues: {}
    };
    const tbody = document.getElementById('category-points-tbody');
    for (let i = 1; i <= 9; i++) {
        const row = tbody.querySelector(`tr[data-category="${i}"]`);
        newCalcSettings.categoryValues[i] = {
            "3in": parseFloat(row.querySelector('input[data-gsd="3in"]').value),
            "4in": parseFloat(row.querySelector('input[data-gsd="4in"]').value),
            "6in": parseFloat(row.querySelector('input[data-gsd="6in"]').value),
            "9in": parseFloat(row.querySelector('input[data-gsd="9in"]').value),
        };
    }

    // Save Counting Settings
    const getValues = (id) => document.getElementById(id).value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const newCountingSettings = {
        taskColumns: {
            qc: getValues('setting-qc-cols'),
            i3qa: getValues('setting-i3qa-cols'),
            rv1: getValues('setting-rv1-cols'),
            rv2: getValues('setting-rv2-cols'),
        },
        triggers: {
            refix: { labels: getValues('setting-refix-labels'), columns: getValues('setting-refix-cols') },
            miss: { labels: getValues('setting-miss-labels'), columns: getValues('setting-miss-cols') },
            warning: { labels: getValues('setting-warning-labels'), columns: getValues('setting-warning-cols') },
            qcPenalty: { labels: getValues('setting-qc-penalty-labels'), columns: getValues('setting-qc-penalty-cols') }
        }
    };
    
    try {
        await Promise.all([
            putToDB('bonusTiers', { id: 'customTiers', tiers: newTiers }),
            putToDB('calculationSettings', { id: 'customSettings', settings: newCalcSettings }),
            putToDB('countingSettings', { id: 'customCounting', settings: newCountingSettings })
        ]);
        bonusTiers = newTiers;
        calculationSettings = newCalcSettings;
        countingSettings = newCountingSettings;
        showNotification("Advance settings saved successfully.");
        closeModal('advance-settings-modal');
    } catch (error) {
        console.error("Error saving advance settings:", error);
        alert("Failed to save advance settings.");
    }
}

function populateAdvanceSettingsEditor() {
    const container = document.getElementById('advance-settings-body');
    container.innerHTML = `
        <div class="flex items-center gap-2 border-b border-brand-700 mb-4">
            <button class="tab-button active" data-tab="bonus-tiers">Bonus Tiers</button>
            <button class="tab-button" data-tab="points">Points</button>
            <button class="tab-button" data-tab="counting">Counting Logic</button>
        </div>
        <div id="tab-bonus-tiers" class="tab-content active">
            <div id="bonus-tier-editor-container" class="space-y-2"></div>
            <button id="add-tier-btn" class="btn-secondary mt-4">Add Tier</button>
        </div>
        <div id="tab-points" class="tab-content">
            <div class="space-y-4">
                <div>
                    <label for="setting-ir-modifier" class="block text-sm font-medium text-brand-400">IR Modifier</label>
                    <input type="number" step="0.1" id="setting-ir-modifier" class="input-field w-full mt-1">
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label for="setting-qc-points" class="block text-sm font-medium text-brand-400">QC Points</label>
                        <input type="number" step="0.01" id="setting-qc-points" class="input-field w-full mt-1">
                    </div>
                    <div>
                        <label for="setting-i3qa-points" class="block text-sm font-medium text-brand-400">i3QA Points</label>
                        <input type="number" step="0.01" id="setting-i3qa-points" class="input-field w-full mt-1">
                    </div>
                    <div>
                        <label for="setting-rv1-points" class="block text-sm font-medium text-brand-400">RV1 Points</label>
                        <input type="number" step="0.01" id="setting-rv1-points" class="input-field w-full mt-1">
                    </div>
                    <div>
                        <label for="setting-rv1-combo-points" class="block text-sm font-medium text-brand-400">RV1 Combo Points</label>
                        <input type="number" step="0.01" id="setting-rv1-combo-points" class="input-field w-full mt-1">
                    </div>
                    <div>
                        <label for="setting-rv2-points" class="block text-sm font-medium text-brand-400">RV2 Points</label>
                        <input type="number" step="0.01" id="setting-rv2-points" class="input-field w-full mt-1">
                    </div>
                </div>
                <div class="table-container text-sm border border-brand-700 rounded-md">
                    <table class="min-w-full">
                        <thead class="bg-brand-800">
                            <tr>
                                <th class="p-2 text-left">Category</th>
                                <th class="p-2 text-left">3in</th>
                                <th class="p-2 text-left">4in</th>
                                <th class="p-2 text-left">6in</th>
                                <th class="p-2 text-left">9in</th>
                            </tr>
                        </thead>
                        <tbody id="category-points-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="tab-counting" class="tab-content">
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-white">Task Columns</h4>
                    <p class="text-xs text-brand-400 mb-2">Comma-separated column names that count for each task type.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label for="setting-qc-cols">QC</label><input type="text" id="setting-qc-cols" class="input-field w-full mt-1"></div>
                        <div><label for="setting-i3qa-cols">i3QA</label><input type="text" id="setting-i3qa-cols" class="input-field w-full mt-1"></div>
                        <div><label for="setting-rv1-cols">RV1</label><input type="text" id="setting-rv1-cols" class="input-field w-full mt-1"></div>
                        <div><label for="setting-rv2-cols">RV2</label><input type="text" id="setting-rv2-cols" class="input-field w-full mt-1"></div>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-white">Trigger Conditions</h4>
                    <p class="text-xs text-brand-400 mb-2">Define labels and columns that trigger refixes, misses, warnings, etc.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Refix Labels</label><input type="text" id="setting-refix-labels" class="input-field w-full mt-1"></div>
                        <div><label>Refix Columns</label><input type="text" id="setting-refix-cols" class="input-field w-full mt-1"></div>
                        <div><label>Miss Labels</label><input type="text" id="setting-miss-labels" class="input-field w-full mt-1"></div>
                        <div><label>Miss Columns</label><input type="text" id="setting-miss-cols" class="input-field w-full mt-1"></div>
                        <div><label>Warning Labels</label><input type="text" id="setting-warning-labels" class="input-field w-full mt-1"></div>
                        <div><label>Warning Columns</label><input type="text" id="setting-warning-cols" class="input-field w-full mt-1"></div>
                        <div><label>QC Penalty Labels</label><input type="text" id="setting-qc-penalty-labels" class="input-field w-full mt-1"></div>
                        <div><label>QC Penalty Columns</label><input type="text" id="setting-qc-penalty-cols" class="input-field w-full mt-1"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Populate Bonus Tiers
    const tierContainer = document.getElementById('bonus-tier-editor-container');
    tierContainer.innerHTML = `<div class="grid grid-cols-3 gap-4 font-semibold text-gray-400 pb-2 border-b border-gray-600"><span>Min. Quality %</span><span>Bonus Earned %</span><span>Action</span></div>`;
    bonusTiers.forEach(tier => addBonusTierRow(tier.quality, tier.bonus * 100));
    document.getElementById('add-tier-btn').addEventListener('click', () => addBonusTierRow());

    // Populate Calculation Settings
    document.getElementById('setting-ir-modifier').value = calculationSettings.irModifierValue;
    document.getElementById('setting-qc-points').value = calculationSettings.points.qc;
    document.getElementById('setting-i3qa-points').value = calculationSettings.points.i3qa;
    document.getElementById('setting-rv1-points').value = calculationSettings.points.rv1;
    document.getElementById('setting-rv1-combo-points').value = calculationSettings.points.rv1_combo;
    document.getElementById('setting-rv2-points').value = calculationSettings.points.rv2;
    const catTbody = document.getElementById('category-points-tbody');
    catTbody.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const row = document.createElement('tr');
        row.dataset.category = i;
        row.className = "bg-gray-800/50";
        row.innerHTML = `
            <td class="p-2 font-semibold">Category ${i}</td>
            <td class="p-2"><input type="number" step="0.01" class="input-field w-full p-1" data-gsd="3in" value="${calculationSettings.categoryValues[i]['3in']}"></td>
            <td class="p-2"><input type="number" step="0.01" class="input-field w-full p-1" data-gsd="4in" value="${calculationSettings.categoryValues[i]['4in']}"></td>
            <td class="p-2"><input type="number" step="0.01" class="input-field w-full p-1" data-gsd="6in" value="${calculationSettings.categoryValues[i]['6in']}"></td>
            <td class="p-2"><input type="number" step="0.01" class="input-field w-full p-1" data-gsd="9in" value="${calculationSettings.categoryValues[i]['9in']}"></td>
        `;
        catTbody.appendChild(row);
    }

    // Populate Counting Settings
    const setValues = (id, arr) => { 
        const el = document.getElementById(id);
        if (el && arr) {
            el.value = arr.join(', '); 
        }
    };
    setValues('setting-qc-cols', countingSettings.taskColumns.qc);
    setValues('setting-i3qa-cols', countingSettings.taskColumns.i3qa);
    setValues('setting-rv1-cols', countingSettings.taskColumns.rv1);
    setValues('setting-rv2-cols', countingSettings.taskColumns.rv2);
    setValues('setting-refix-labels', countingSettings.triggers.refix.labels);
    setValues('setting-refix-cols', countingSettings.triggers.refix.columns);
    setValues('setting-miss-labels', countingSettings.triggers.miss.labels);
    setValues('setting-miss-cols', countingSettings.triggers.miss.columns);
    setValues('setting-warning-labels', countingSettings.triggers.warning.labels);
    setValues('setting-warning-cols', countingSettings.triggers.warning.columns);
    setValues('setting-qc-penalty-labels', countingSettings.triggers.qcPenalty.labels);
    setValues('setting-qc-penalty-cols', countingSettings.triggers.qcPenalty.columns);

    // Tab functionality
    const tabs = container.querySelectorAll('.tab-button');
    const contents = container.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

function addBonusTierRow(quality = '', bonus = '') {
    const container = document.getElementById('bonus-tier-editor-container');
    const row = document.createElement('div');
    row.className = 'tier-row grid grid-cols-3 gap-4 items-center';
    row.innerHTML = `
        <input type="number" step="0.5" class="tier-quality-input w-full p-2 input-field" value="${quality}">
        <input type="number" step="1" class="tier-bonus-input w-full p-2 input-field" value="${bonus}">
        <button class="delete-tier-btn bg-red-600/80 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-700 text-sm">Delete</button>
    `;
    container.appendChild(row);
    row.querySelector('.delete-tier-btn').addEventListener('click', (e) => e.target.closest('.tier-row').remove());
}

async function loadTeamSettings() {
    try {
        const teamsData = await getFromDB('teams', 'teams');
        teamSettings = (teamsData && Object.keys(teamsData.settings).length > 0) ? teamsData.settings : defaultTeams;
    } catch (error) {
        console.error("Error loading team settings:", error);
        teamSettings = defaultTeams;
    }
    populateTeamFilters();
    populateAdminTeamManagement();
}

async function saveTeamSettings() {
    const newSettings = {};
    const teamDivs = document.querySelectorAll('#team-list-container .team-card');
    let isValid = true;
    teamDivs.forEach(div => {
        const teamName = div.querySelector('.team-name-input').value.trim();
        if (teamName) {
            const techTags = div.querySelectorAll('.tech-tag');
            const techIds = Array.from(techTags).map(tag => tag.dataset.techId);
            newSettings[teamName] = techIds;
        } else {
            isValid = false;
        }
    });

    if (!isValid) {
        return alert("Team names cannot be empty.");
    }
    
    try {
        await putToDB('teams', { id: 'teams', settings: newSettings });
        showNotification("Team settings saved successfully.");
        teamSettings = newSettings;
        populateTeamFilters();
        closeModal('manage-teams-modal');
    } catch (error) {
        console.error("Error saving team settings: ", error);
        alert("Failed to save team settings.");
    }
}

async function saveProjectToIndexedDB(projectData) {
    try {
        const textEncoder = new TextEncoder();
        const dataAsUint8Array = textEncoder.encode(projectData.rawData);
        const compressed = pako.deflate(dataAsUint8Array);
        const uint8ArrayToBase64 = (array) => {
            let result = '';
            for (let i = 0; i < array.length; i += 0x8000) {
                result += String.fromCharCode.apply(null, array.subarray(i, i + 0x8000));
            }
            return btoa(result);
        };
        const base64String = uint8ArrayToBase64(compressed);
        const fullDataToSave = { ...projectData, rawData: base64String, projectOrder: projectData.projectOrder || Date.now() };
        await putToDB('projects', fullDataToSave);
        showNotification("Project saved/updated successfully!");
    } catch (err) {
        console.error("Error saving project:", err);
        alert("Failed to save project. Check console for details.");
        throw err;
    }
}

async function fetchProjectListSummary() {
    try {
        const projects = await getAllFromDB('projects');
        projectListCache = projects.map(p => ({ id: p.id, name: p.name, projectOrder: p.projectOrder || 0 }));
        projectListCache.sort((a, b) => b.projectOrder - a.projectOrder);
        populateProjectSelect();
    } catch (err) {
        console.error("Failed to fetch project list summary:", err);
    }
}

async function fetchFullProjectData(projectId) {
    if (fullProjectDataCache[projectId]) return fullProjectDataCache[projectId];
    try {
        const data = await getFromDB('projects', projectId);
        if (data) {
            const compressedData = atob(data.rawData);
            const pakoData = new Uint8Array(compressedData.split('').map(c => c.charCodeAt(0)));
            const decompressed = pako.inflate(pakoData, { to: 'string' });
            data.rawData = decompressed;
            fullProjectDataCache[projectId] = data;
            return data;
        }
    } catch (err) {
        console.error("Error fetching project data:", err);
    }
    return null;
}

async function deleteProjectFromIndexedDB(projectId) {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
        await deleteFromDB('projects', projectId);
        delete fullProjectDataCache[projectId];
        await fetchProjectListSummary();
        showNotification("Project deleted successfully.");
        loadProjectIntoForm(""); 
    } catch (err) {
        console.error("Failed to delete project:", err);
        alert("Error deleting project. Check console for details.");
    }
}

// --- REFACTORED CALCULATION LOGIC ---
function parseRawData(data, isFixTaskIR = false, currentProjectName = "Pasted Data", gsdForCalculation = "3in") {
    const techStats = {};
    const lines = data.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 1) return null;

    currentDataLines = lines.slice(1);
    currentDataHeaders = lines[0].split('\t').map(h => h.trim());
    const headerMap = {};
    currentDataHeaders.forEach((h, i) => { headerMap[h.toLowerCase()] = i; });
    
    fix4CategoryCounts = {};
    const summaryStats = { totalRows: 0, comboTasks: 0, totalIncorrect: 0, totalMiss: 0 };
    const allIdCols = currentDataHeaders.filter(h => h.toLowerCase().endsWith('_id'));
    
    // Initialize stats for all technicians found
    const allTechsInDataSet = new Set();
    currentDataLines.forEach(line => {
        const values = line.split('\t');
        allIdCols.forEach(col => {
            const techId = values[headerMap[col.toLowerCase()]]?.trim();
            if (techId && TECH_ID_REGEX.test(techId)) {
                allTechsInDataSet.add(techId);
            }
        });
    });
    allTechsInDataSet.forEach(techId => {
        if (!techStats[techId]) {
            techStats[techId] = createNewTechStat();
            techStats[techId].id = techId;
        }
    });

    // --- Build dynamic column maps from settings ---
    const refixCheckCols = countingSettings.triggers.refix.columns.map(c => headerMap[c]).filter(i => i !== undefined);
    const missCheckCols = countingSettings.triggers.miss.columns.map(c => headerMap[c]).filter(i => i !== undefined);
    const warningCheckCols = countingSettings.triggers.warning.columns.map(c => headerMap[c]).filter(i => i !== undefined);
    const qcPenaltyCheckCols = (countingSettings.triggers.qcPenalty.columns || []).map(c => headerMap[c]).filter(i => i !== undefined);
    const qcPenaltyLabels = countingSettings.triggers.qcPenalty.labels || [];


    currentDataLines.forEach(line => {
        summaryStats.totalRows++;
        const values = line.split('\t');

        const isComboIR = headerMap['combo?'] !== undefined && values[headerMap['combo?']] === 'Y';
        if (isComboIR) summaryStats.comboTasks++;
        
        const fix1_id = values[headerMap['fix1_id']]?.trim();
        const fix2_id = values[headerMap['fix2_id']]?.trim();
        const fix3_id = values[headerMap['fix3_id']]?.trim();
        const fix4_id = values[headerMap['fix4_id']]?.trim();

        if (fix4_id && TECH_ID_REGEX.test(fix4_id)) {
            const category = values[headerMap['rv3_cat']]?.trim();
            if (category) {
                if (!fix4CategoryCounts[fix4_id]) {
                    fix4CategoryCounts[fix4_id] = {};
                }
                fix4CategoryCounts[fix4_id][category] = (fix4CategoryCounts[fix4_id][category] || 0) + 1;
            }
        }

        // --- Fix Task Point Calculation ---
        const processFixTech = (techId, catSources) => {
            if (!techId || !techStats[techId]) return;
            let techPoints = 0;
            let techCategories = 0;
            catSources.forEach(source => {
                 if (source.isRQA && source.sourceType === 'afp') {
                    techStats[techId].afpTasks++;
                }

                const labelValue = source.label ? values[headerMap[source.label]]?.trim().toUpperCase() : null;
                if (source.condition && !source.condition(labelValue)) return;
                const catValue = parseInt(values[headerMap[source.cat]]);
                if (!isNaN(catValue) && catValue >= 1 && catValue <= 9) {
                    techCategories++;
                    techPoints += calculationSettings.categoryValues[catValue]?.[gsdForCalculation] || 0;
                    if (techStats[techId].categoryCounts[catValue] && source.sourceType) {
                        techStats[techId].categoryCounts[catValue][source.sourceType]++;
                    }
                    if(source.isRQA) {
                        techStats[techId].approvedByRQA.push({ round: source.round, category: catValue, project: currentProjectName });
                    }
                }
            });
            techStats[techId].fixTasks += techCategories;
            let pointsToAdd = techPoints;
            if (isFixTaskIR && pointsToAdd > 0) pointsToAdd *= calculationSettings.irModifierValue;
            techStats[techId].points += pointsToAdd;
            techStats[techId].pointsBreakdown.fix += pointsToAdd;
        };
        
        const afp1_stat = values[headerMap['afp1_stat']]?.trim().toUpperCase();
        const fix1Sources = [];
        if (afp1_stat === 'AA') {
            fix1Sources.push({ cat: 'afp1_cat', isRQA: true, round: 'AFP1', sourceType: 'afp' });
        } else {
            if (!!values[headerMap['category']]?.trim()) {
                fix1Sources.push({ cat: 'category', sourceType: 'primary' });
            }
            fix1Sources.push({ cat: 'i3qa_cat', label: 'i3qa_label', condition: val => val && countingSettings.triggers.miss.labels.some(l => val.includes(l.toUpperCase())), sourceType: 'i3qa' });
        }  
        processFixTech(fix1_id, fix1Sources);

        const afp2_stat = values[headerMap['afp2_stat']]?.trim().toUpperCase();
        const fix2Sources = [];
        if (afp2_stat === 'AA') {
            fix2Sources.push({ cat: 'afp2_cat', isRQA: true, round: 'AFP2', sourceType: 'afp' });
        } else {
            fix2Sources.push({ cat: 'rv1_cat', label: 'rv1_label', condition: val => val && countingSettings.triggers.miss.labels.some(l => val.includes(l.toUpperCase())), sourceType: 'rv' });
        }
        processFixTech(fix2_id, fix2Sources);

        const afp3_stat = values[headerMap['afp3_stat']]?.trim().toUpperCase();
        const fix3Sources = [];
        if (afp3_stat === 'AA') {
            fix3Sources.push({ cat: 'afp3_cat', isRQA: true, round: 'AFP3', sourceType: 'afp' });
        } else {
            fix3Sources.push({ cat: 'rv2_cat', label: 'rv2_label', condition: val => val && countingSettings.triggers.miss.labels.some(l => val.includes(l.toUpperCase())), sourceType: 'rv' });
        }
        processFixTech(fix3_id, fix3Sources);
        
        processFixTech(fix4_id, [{ cat: 'rv3_cat', label: 'rv3_label', condition: val => val && countingSettings.triggers.miss.labels.some(l => val.includes(l.toUpperCase())), sourceType: 'rv' }]);

        // --- QC, i3qa, RV Task Point Calculation ---
        const addPointsForTask = (colNames, pointValue, breakdownField, comboCheck = false) => {
            colNames.forEach(colName => {
                const colIndex = headerMap[colName];
                if (colIndex !== undefined) {
                    const techId = values[colIndex]?.trim();
                    if (techId && techStats[techId]) {
                        let pointsToAdd = pointValue;
                        if (comboCheck) {
                             pointsToAdd = isComboIR ? calculationSettings.points.rv1_combo : calculationSettings.points.rv1;
                        }
                        techStats[techId].points += pointsToAdd;
                        techStats[techId].pointsBreakdown[breakdownField] += pointsToAdd;
                    }
                }
            });
        };

        addPointsForTask(countingSettings.taskColumns.qc, calculationSettings.points.qc, 'qc');
        addPointsForTask(countingSettings.taskColumns.i3qa, calculationSettings.points.i3qa, 'i3qa');
        addPointsForTask(countingSettings.taskColumns.rv1, calculationSettings.points.rv1, 'rv', true); // Special handling for RV1 combo
        addPointsForTask(countingSettings.taskColumns.rv2, calculationSettings.points.rv2, 'rv');
        
        // QC Penalty and Point Transfer Logic
        let penaltyTriggered = false;
        for (const colIndex of qcPenaltyCheckCols) {
            const cellValue = values[colIndex]?.trim().toLowerCase();
            if (cellValue && qcPenaltyLabels.includes(cellValue)) {
                penaltyTriggered = true;
                break;
            }
        }

        if (penaltyTriggered) {
            const i3qaTechId = values[headerMap['i3qa_id']]?.trim();
            let pointsToTransfer = 0;
            const qcColIndices = countingSettings.taskColumns.qc.map(c => headerMap[c]).filter(i => i !== undefined);

            qcColIndices.forEach(qcColIndex => {
                const qcTechId = values[qcColIndex]?.trim();
                if (qcTechId && techStats[qcTechId]) {
                    techStats[qcTechId].points -= calculationSettings.points.qc;
                    techStats[qcTechId].pointsBreakdown.qc -= calculationSettings.points.qc;
                    pointsToTransfer += calculationSettings.points.qc;
                }
            });

            if (i3qaTechId && techStats[i3qaTechId] && pointsToTransfer > 0) {
                techStats[i3qaTechId].points += pointsToTransfer;
                techStats[i3qaTechId].pointsBreakdown.qcTransfer += pointsToTransfer;
            }
        }

        // Refixes
        refixCheckCols.forEach(colIndex => {
            const labelValue = values[colIndex]?.trim().toLowerCase();
            if (labelValue && countingSettings.triggers.refix.labels.some(l => labelValue.includes(l))) {
                const roundMatch = currentDataHeaders[colIndex].match(/\d+/);
                if (roundMatch) {
                    const round = roundMatch[0];
                    const fixTechId = values[headerMap[`fix${round}_id`]]?.trim();
                    if (fixTechId && techStats[fixTechId]) {
                        summaryStats.totalIncorrect++;
                        const refixCategory = values[headerMap[`rv${round}_cat`]]?.trim() || 'N/A';
                        techStats[fixTechId].refixTasks++;
                        techStats[fixTechId].refixDetails.push({ round: `RV${round}`, project: currentProjectName, category: refixCategory });
                    }
                }
            }
        });

        // Misses
        missCheckCols.forEach(colIndex => {
            const labelValue = values[colIndex]?.trim().toLowerCase();
            if (labelValue && countingSettings.triggers.miss.labels.some(l => labelValue.includes(l))) {
                const colName = currentDataHeaders[colIndex];
                const roundName = colName.split('_')[0].toUpperCase();
                let techToBlame;
                if (roundName === 'I3QA') techToBlame = fix1_id;
                else if (roundName === 'RV1') techToBlame = fix2_id;
                else if (roundName === 'RV2') techToBlame = fix3_id;
                else if (roundName === 'RV3') techToBlame = fix4_id;
                
                if (techToBlame && techStats[techToBlame]) {
                    const category = values[headerMap[`${roundName.toLowerCase()}_cat`]]?.trim() || 'N/A';
                    techStats[techToBlame].missedCategories.push({ round: roundName, category: category, project: currentProjectName });
                }
            }
        });

        // Warnings
        warningCheckCols.forEach(colIndex => {
            const warnValue = values[colIndex]?.trim().toLowerCase();
            if (warnValue && countingSettings.triggers.warning.labels.includes(warnValue)) {
                const roundMatch = currentDataHeaders[colIndex].match(/\d+/);
                if(roundMatch) {
                    const round = roundMatch[0];
                    const fixTechId = values[headerMap[`fix${round}_id`]]?.trim();
                    if (fixTechId && techStats[fixTechId]) {
                        techStats[fixTechId].warnings.push({ type: warnValue.toUpperCase(), project: currentProjectName });
                    }
                }
            }
        });
    });
    return { techStats, summaryStats };
}


function calculateQualityModifier(qualityRate) {
    for (const tier of bonusTiers) {
        if (qualityRate >= tier.quality) {
            return tier.bonus;
        }
    }
    return 0;
}

// --- UI MANIPULATION AND STATE MANAGEMENT ---
async function loadProjectIntoForm(projectId) {
    const editBtn = document.getElementById('edit-data-btn');
    const spinner = document.getElementById('project-loading-spinner');
    
    if (spinner) spinner.classList.remove('hidden');

    try {
        if (projectId) {
            const projectData = await fetchFullProjectData(projectId);
            if (projectData) {
                document.getElementById('techData').value = projectData.rawData;
                document.getElementById('techData').readOnly = true;
                document.getElementById('project-name').value = projectData.name;
                document.getElementById('project-name').readOnly = true;
                document.getElementById('is-ir-project-checkbox').checked = projectData.isIRProject;
                document.getElementById('is-ir-project-checkbox').disabled = true;
                document.getElementById('gsd-value-select').value = projectData.gsdValue;
                document.getElementById('gsd-value-select').disabled = true;
                if(editBtn) editBtn.classList.remove('hidden');
                document.getElementById('save-project-btn').disabled = true;
                document.getElementById('cancel-edit-btn').classList.add('hidden');
                document.getElementById('save-project-btn').textContent = 'Save Project';
            }
        } else {
            document.getElementById('techData').value = '';
            document.getElementById('techData').readOnly = false;
            document.getElementById('project-name').value = '';
            document.getElementById('project-name').readOnly = false;
            document.getElementById('is-ir-project-checkbox').checked = false;
            document.getElementById('is-ir-project-checkbox').disabled = false;
            document.getElementById('gsd-value-select').value = '3in';
            document.getElementById('gsd-value-select').disabled = false;
            if(editBtn) editBtn.classList.add('hidden');
            document.getElementById('save-project-btn').disabled = false;
            document.getElementById('cancel-edit-btn').classList.add('hidden');
        }
    } finally {
        if (spinner) spinner.classList.add('hidden');
    }
}

function showResultsPanel() {
    const placeholder = document.getElementById('results-placeholder');
    const content = document.getElementById('results-content');
    if (placeholder) placeholder.classList.add('hidden');
    if (content) content.classList.remove('hidden');
}

function displayResults(techStats) {
    showResultsPanel();
    const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
    lastUsedBonusMultiplier = bonusMultiplier;
    lastCalculationUsedMultiplier = !!bonusMultiplier && bonusMultiplier !== 1;

    const resultsTbody = document.getElementById('tech-results-tbody');
    resultsTbody.innerHTML = '';

    const infoIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293.006.399.287.47l.45.083.082.38-2.29.287-.082-.38.45-.083a.89.89 0 0 1 .352-.176c.24-.11.24-.216.06-.563l-.738-3.468c-.18-.84.48-1.133 1.17-1.133H8l.084.38zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`;

    const sortedTechs = Object.values(techStats)
        .sort((a,b) => b.points - a.points);

    if (sortedTechs.length === 0) {
        resultsTbody.innerHTML = `<tr><td colspan="6" class="text-center text-brand-400 p-4">No results to display.</td></tr>`;
    } else {
        sortedTechs.forEach(tech => {
            const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
            const fixQuality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
            const qualityModifier = calculateQualityModifier(fixQuality);
            const finalPayout = tech.points * bonusMultiplier * qualityModifier;

            let qualityPillClass = 'quality-pill-red'; // Default to red
            if (fixQuality >= 95) {
                qualityPillClass = 'quality-pill-green';
            } else if (fixQuality >= 85) {
                qualityPillClass = 'quality-pill-orange';
            } else if (fixQuality >= 75) {
                qualityPillClass = 'quality-pill-yellow';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="font-semibold text-white">${tech.id}</td>
                <td>${tech.points.toFixed(3)}</td>
                <td><span class="quality-pill ${qualityPillClass}">${fixQuality.toFixed(2)}%</span></td>
                <td>${(qualityModifier * 100).toFixed(0)}%</td>
                <td class="font-bold text-accent">${finalPayout.toFixed(2)}</td>
                <td class="text-center">
                    <button class="info-icon tech-summary-icon" data-tech-id="${tech.id}" title="View Details for ${tech.id}">
                        ${infoIconSvg}
                    </button>
                </td>
            `;
            resultsTbody.appendChild(row);
        });
    }

    document.getElementById('bonus-payout-section').classList.remove('hidden');
}

function populateProjectSelect() {
    const select = document.getElementById('project-select');
    const currentVal = select.value;
    select.innerHTML = '<option value="">Select a project...</option>';
    projectListCache.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
    });
    if (projectListCache.some(p => p.id === currentVal)) {
        select.value = currentVal;
    }
    document.getElementById('refresh-projects-btn').disabled = false;
}

function populateAdminTeamManagement() {
    const container = document.getElementById('team-list-container');
    if (!container) return;
    container.innerHTML = '';
    Object.entries(teamSettings).forEach(([teamName, techIds]) => {
        addTeamCard(teamName, techIds);
    });
}

function addTeamCard(teamName = '', techIds = []) {
    const container = document.getElementById('team-list-container');
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card p-4 rounded-lg bg-brand-900/50 border border-brand-700';
    teamCard.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <input type="text" class="team-name-input input-field text-lg font-bold w-full" value="${teamName}" placeholder="Enter Team Name">
            <button class="delete-team-btn control-btn-icon-danger ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
            </button>
        </div>
        <div class="team-tech-list mb-2 min-h-[40px]"></div>
        <div class="flex gap-2">
            <input type="text" class="add-tech-input input-field w-full" placeholder="Add Tech ID">
            <button class="add-tech-btn btn-secondary">Add</button>
        </div>
    `;
    container.appendChild(teamCard);

    const techList = teamCard.querySelector('.team-tech-list');
    techIds.forEach(id => addTechTag(techList, id));

    teamCard.querySelector('.delete-team-btn').addEventListener('click', () => teamCard.remove());
    teamCard.querySelector('.add-tech-btn').addEventListener('click', (e) => {
        const input = e.target.previousElementSibling;
        const techId = input.value.trim().toUpperCase();
        if (techId && TECH_ID_REGEX.test(techId)) {
            addTechTag(techList, techId);
            input.value = '';
        } else {
            alert('Invalid Tech ID format. It should be 4 numbers followed by 2 letters.');
        }
    });
}

function addTechTag(list, techId) {
    const tag = document.createElement('div');
    tag.className = 'tech-tag';
    tag.dataset.techId = techId;
    tag.innerHTML = `
        <span>${techId}</span>
        <button class="remove-tech-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.647 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
        </button>
    `;
    list.appendChild(tag);
    tag.querySelector('.remove-tech-btn').addEventListener('click', () => tag.remove());
}

function populateTeamFilters() {
    const container = document.getElementById('team-filter-container');
    if (!container) return;
    const existingRefreshButton = document.getElementById('refresh-teams-btn');
    container.innerHTML = `<span class="text-sm font-medium text-brand-300">Filter by Team:</span>`;
    if(existingRefreshButton) container.appendChild(existingRefreshButton);
    
    Object.keys(teamSettings).sort().forEach(team => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input id="team-filter-${team}" type="checkbox" data-team="${team}" class="h-4 w-4 text-accent focus:ring-accent bg-brand-700 border-brand-600 rounded">
            <label for="team-filter-${team}" class="ml-2 block text-sm font-medium text-brand-300">${team}</label>
        `;
        container.appendChild(div);
    });
}

function updateLeaderboard(techStats) {
    const tbody = document.getElementById('leaderboard-body');
    const sortSelect = document.getElementById('leaderboard-sort-select');
    const metricHeader = document.getElementById('leaderboard-metric-header');
    if (!tbody || !sortSelect || !metricHeader) return;
    
    const sortBy = sortSelect.value;
    tbody.innerHTML = '';

    const techArray = Object.values(techStats).map(tech => {
         const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
         return {
            id: tech.id,
            fixTasks: tech.fixTasks,
            totalPoints: tech.points,
            fixQuality: denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0,
        };
    });
    
    if (sortBy === 'totalPoints') {
        techArray.sort((a, b) => b.totalPoints - a.totalPoints);
        metricHeader.textContent = 'Points';
    } else if (sortBy === 'fixTasks') {
        techArray.sort((a, b) => b.fixTasks - a.fixTasks);
        metricHeader.textContent = 'Tasks';
    } else { // Default to fixQuality
        techArray.sort((a, b) => b.fixQuality - a.fixQuality);
        metricHeader.textContent = 'Quality %';
    }
    
    if (techArray.length === 0) return tbody.innerHTML = `<tr><td class="p-4 text-center text-brand-400" colspan="3">Calculate a project to see results.</td></tr>`;

    techArray.forEach((stat, index) => {
        const row = document.createElement('tr');
        let value;
        if (sortBy === 'fixTasks') value = stat.fixTasks;
        else if (sortBy === 'totalPoints') value = stat.totalPoints.toFixed(2);
        else if (sortBy === 'fixQuality') value = `${stat.fixQuality.toFixed(2)}%`;
        
        row.innerHTML = `<td class="p-2">${index + 1}</td><td class="p-2">${stat.id}</td><td class="p-2">${value}</td>`;
        tbody.appendChild(row);
    });
}

function updateTLSummary(techStats) {
    const tlCard = document.getElementById('tl-summary-card');
    if (Object.keys(techStats).length === 0) {
        tlCard.classList.add('hidden');
        return;
    }
    tlCard.classList.remove('hidden');
    setPanelHeights(); // Recalculate heights when this panel appears

    // Quality Per Team
    const teamQualityContainer = document.getElementById('team-quality-container');
    teamQualityContainer.innerHTML = '';
    const teamQualities = {};
    for (const team in teamSettings) {
        const teamTechs = teamSettings[team];
        const teamTechStats = teamTechs.map(id => techStats[id]).filter(Boolean);
        if (teamTechStats.length > 0) {
            const totalQuality = teamTechStats.reduce((sum, stat) => {
                const denominator = stat.fixTasks + stat.refixTasks + stat.warnings.length;
                return sum + (denominator > 0 ? (stat.fixTasks / denominator) * 100 : 0);
            }, 0);
            teamQualities[team] = totalQuality / teamTechStats.length;
        }
    }

    const sortedTeams = Object.entries(teamQualities).sort(([, a], [, b]) => b - a);

    for (const [team, quality] of sortedTeams) {
        const qualityBar = document.createElement('div');
        qualityBar.className = 'workload-bar-wrapper';
        let colorClass = 'quality-bar-red';
        if (quality >= 98) colorClass = 'quality-bar-green';
        else if (quality >= 95) colorClass = 'quality-bar-cyan';
        else if (quality >= 90) colorClass = 'quality-bar-yellow';
        
        qualityBar.innerHTML = `
            <div class="workload-label" title="${team}">${team}</div>
            <div class="workload-bar">
                <div class="workload-bar-inner ${colorClass}" style="width: ${quality.toFixed(2)}%;">${quality.toFixed(2)}%</div>
            </div>`;
        teamQualityContainer.appendChild(qualityBar);
    }
    
    // Fix4 Breakdown
    const fix4Container = document.getElementById('fix4-breakdown-container');
    fix4Container.innerHTML = '';
    const selectedTeams = Array.from(document.querySelectorAll('#team-filter-container input:checked')).map(cb => cb.dataset.team);
    
    const getTeamName = (techId) => {
        for (const team in teamSettings) {
            if (teamSettings[team].some(id => id.toUpperCase() === techId.toUpperCase())) {
                return team;
            }
        }
        return null;
    };

    const filteredFix4 = Object.entries(fix4CategoryCounts).filter(([techId]) => {
        if (selectedTeams.length === 0) return true;
        const teamName = getTeamName(techId);
        return teamName && selectedTeams.includes(teamName);
    });

    if (filteredFix4.length > 0) {
        let allTablesHTML = '';
        for (const [techId, categories] of filteredFix4) {
            const sortedCategories = Object.entries(categories).sort(([catA], [catB]) => parseInt(catA) - parseInt(catB));
            
            let tableHTML = `
                <div class="table-container text-sm mb-4">
                    <table class="min-w-full">
                        <thead class="bg-brand-900/50">
                            <tr><th colspan="2" class="p-2 text-left font-bold text-white">${techId}</th></tr>
                            <tr>
                                <th class="p-2 text-left">Category</th>
                                <th class="p-2 text-left">Count</th>
                            </tr>
                        </thead>
                        <tbody>`;

            for (const [category, count] of sortedCategories) {
                tableHTML += `
                    <tr>
                        <td class="p-2">Category ${category}</td>
                        <td class="p-2">${count}</td>
                    </tr>`;
            }

            tableHTML += `</tbody></table></div>`;
            allTablesHTML += tableHTML;
        }
        fix4Container.innerHTML = allTablesHTML;
    } else {
        fix4Container.innerHTML = `<p class="text-brand-400 text-sm">No Fix4 data for selected filters.</p>`;
    }
}


function applyFilters() {
    const searchInput = document.getElementById('search-tech-id');
    if (!searchInput) return;
    
    const searchValue = searchInput.value.toUpperCase();
    const selectedTeams = Array.from(document.querySelectorAll('#team-filter-container input:checked')).map(cb => cb.dataset.team);

    const getTeamName = (techId) => {
        for (const team in teamSettings) {
            if (teamSettings[team].some(id => id.toUpperCase() === techId.toUpperCase())) {
                return team;
            }
        }
        return 'N/A';
    };

    const filteredStats = {};
    for (const techId in currentTechStats) {
        const tech = currentTechStats[techId];
        const teamName = getTeamName(tech.id);

        const searchMatch = tech.id.toUpperCase().includes(searchValue);
        const teamMatch = selectedTeams.length === 0 || selectedTeams.includes(teamName);

        if (searchMatch && teamMatch) {
            filteredStats[techId] = tech;
        }
    }
    
    displayResults(filteredStats);
    updateLeaderboard(filteredStats);
    updateTLSummary(filteredStats);
}

function showNotification(message) {
    const notification = document.getElementById('update-notification');
    if (!notification) return;
    notification.textContent = message;
    notification.classList.remove('hidden', 'opacity-0', 'translate-y-2');
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => notification.classList.add('hidden'), 500);
    }, 3000);
}

// --- MODAL FUNCTIONS ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error(`Modal with ID "${modalId}" not found in HTML.`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function generateTechBreakdownHTML(tech) {
    const warningsCount = tech.warnings.length;
    const denominator = tech.fixTasks + tech.refixTasks + warningsCount;
    const fixQuality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
    const qualityModifier = calculateQualityModifier(fixQuality);
    const finalPayout = tech.points * lastUsedBonusMultiplier * qualityModifier;

    // --- Start Category Breakdown Calculation ---
    let detailedCategoryRows = '';
    let summaryCategoryItems = '';
    let totalCategoryTasks = 0;
    let totalCategoryPoints = 0;
    let hasCategoryData = false;

    for (let i = 1; i <= 9; i++) {
        const counts = tech.categoryCounts[i];
        const primaryTasks = (counts.primary || 0) + (counts.i3qa || 0) + (counts.afp || 0);

        if (primaryTasks > 0) {
            hasCategoryData = true;
            totalCategoryTasks += primaryTasks;
            
            // Build "How they were counted" string
            const breakdownParts = [];
            if (counts.primary > 0) breakdownParts.push(`${counts.primary} from CATEGORY`);
            if (counts.i3qa > 0) breakdownParts.push(`${counts.i3qa} from i3QA`);
            if (counts.afp > 0) breakdownParts.push(`${counts.afp} from AFP`);
            const breakdownString = breakdownParts.join(', ');

            detailedCategoryRows += `
                <tr>
                    <td class="p-2 font-semibold">Category ${i}</td>
                    <td class="p-2 font-bold text-white text-center">${primaryTasks}</td>
                    <td class="p-2 text-brand-400">${breakdownString}</td>
                </tr>
            `;

            // Build Summary Item
            const pointValue = calculationSettings.categoryValues[i]?.[lastUsedGsdValue] || 0;
            const categoryPoints = primaryTasks * pointValue;
            totalCategoryPoints += categoryPoints;
            summaryCategoryItems += `
                <div class="summary-item summary-cat-${i}">
                    Category ${i}: 
                    <span class="font-mono">${primaryTasks} x ${pointValue.toFixed(2)} pts = ${categoryPoints.toFixed(2)} pts</span>
                </div>
            `;
        }
    }
    // --- End Category Breakdown Calculation ---

    let categoryBreakdownHTML = '';
    if (hasCategoryData) {
        categoryBreakdownHTML = `
        <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700 space-y-4">
            <div>
                <h4 class="font-semibold text-base text-white mb-2">Primary Fix Category Counts (Detailed)</h4>
                <div class="table-container text-sm">
                    <table class="min-w-full">
                        <thead class="bg-brand-900/50">
                            <tr>
                                <th class="p-2 text-left">Category</th>
                                <th class="p-2 text-center">Tasks Counted</th>
                                <th class="p-2 text-left">How they were counted</th>
                            </tr>
                        </thead>
                        <tbody>${detailedCategoryRows}</tbody>
                    </table>
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-base text-white mb-2">Primary Fix Category Counts (Summary)</h4>
                <div class="space-y-2">
                    ${summaryCategoryItems}
                    <div class="summary-item summary-total">
                        Total from Categories:
                        <span class="font-mono">(${totalCategoryTasks} tasks) ${totalCategoryPoints.toFixed(2)} pts</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    return `<div class="space-y-4 text-sm">
        <div class="p-3 bg-accent/10 rounded-lg border border-accent/50">
            <h4 class="font-semibold text-base text-accent mb-2">Final Payout</h4>
            <div class="flex justify-between font-bold text-lg"><span class="text-white">Payout (PHP):</span><span class="text-accent font-mono">${finalPayout.toFixed(2)}</span></div>
        </div>
        ${categoryBreakdownHTML}
        <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700">
            <h4 class="font-semibold text-base text-white mb-2">Points Breakdown</h4>
            <div class="space-y-1 font-mono">
                <div class="flex justify-between"><span class="text-brand-400">Fix Tasks:</span><span>${tech.pointsBreakdown.fix.toFixed(3)}</span></div>
                <div class="flex justify-between"><span class="text-brand-400">QC Tasks:</span><span>${tech.pointsBreakdown.qc.toFixed(3)}</span></div>
                <div class="flex justify-between"><span class="text-brand-400">i3qa Tasks:</span><span>${tech.pointsBreakdown.i3qa.toFixed(3)}</span></div>
                <div class="flex justify-between"><span class="text-brand-400">RV Tasks:</span><span>${tech.pointsBreakdown.rv.toFixed(3)}</span></div>
                ${tech.pointsBreakdown.qcTransfer > 0 ? `<div class="flex justify-between"><span class="text-brand-400">QC Transfers:</span><span>+${tech.pointsBreakdown.qcTransfer.toFixed(3)}</span></div>` : ''}
                <div class="flex justify-between border-t border-brand-600 mt-1 pt-1"><span class="text-white font-bold">Total Points:</span><span class="text-white font-bold">${tech.points.toFixed(3)}</span></div>
            </div>
        </div>
        <div class="p-3 bg-brand-900/50 rounded-lg border border-brand-700">
            <h4 class="font-semibold text-base text-white mb-2">Core Stats & Quality</h4>
            <div class="grid grid-cols-2 gap-4">
                <div><span class="text-brand-400">Primary Fix Tasks:</span> <span class="font-bold text-green-400">${tech.fixTasks}</span></div>
                <div><span class="text-brand-400">AFP Tasks (AA):</span> <span class="font-bold text-blue-400">${tech.afpTasks}</span></div>
                <div><span class="text-brand-400">Refix Tasks:</span> <span class="font-bold text-red-400">${tech.refixTasks}</span></div>
                <div><span class="text-brand-400">Warnings:</span> <span class="font-bold text-yellow-400">${tech.warnings.length}</span></div>
            </div>
            <div class="flex justify-between mt-4 pt-4 border-t border-brand-700"><span class="text-brand-400">Fix Quality %:</span><span class="font-mono font-bold">${fixQuality.toFixed(2)}%</span></div>
        </div>
    </div>`;
}


function openTechSummaryModal(techId) {
    const tech = currentTechStats[techId];
    if (!tech) return;

    const modalTitle = `Summary for ${techId}`;
    const modalBody = generateTechBreakdownHTML(tech);
    
    document.getElementById('tech-summary-modal-title').textContent = modalTitle;
    document.getElementById('tech-summary-modal-body').innerHTML = modalBody;
    openModal('tech-summary-modal');
}


function resetUIForNewCalculation() {
    const placeholder = document.getElementById('results-placeholder');
    const content = document.getElementById('results-content');
    const tlCard = document.getElementById('tl-summary-card');
    if (placeholder) placeholder.classList.remove('hidden');
    if (content) content.classList.add('hidden');
    if(tlCard) tlCard.classList.add('hidden');
    
    const techResultsGrid = document.getElementById('tech-results-grid');
    const resultsTitle = document.getElementById('results-title');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const workloadChart = document.getElementById('workload-chart-container');

    if (techResultsGrid) techResultsGrid.innerHTML = '';
    if (resultsTitle) resultsTitle.textContent = 'Bonus Payouts';
    if (leaderboardBody) leaderboardBody.innerHTML = '';
    
    if (!document.getElementById('project-select').value) {
        document.getElementById('project-name').value = '';
        document.getElementById('techData').value = '';
        loadProjectIntoForm("");
    }
}

function resetMergeModal() {
    document.getElementById('merge-file-list').innerHTML = '';
    document.getElementById('merge-project-name').value = '';
    document.getElementById('merge-options').classList.add('hidden');
    document.getElementById('merge-save-btn').disabled = true;
    mergedFeatures = []; // Clear the stored data
}

async function handleDroppedFiles(files) {
    // If a project is currently selected in the dropdown, reset it
    const projectSelect = document.getElementById('project-select');
    if (projectSelect && projectSelect.value) {
        projectSelect.value = '';
    }

    resetUIForNewCalculation();
    const fileGroups = {};

    for (const file of files) {
        const baseName = file.name.split('.')[0];
        if (!fileGroups[baseName]) {
            fileGroups[baseName] = {};
        }
        const extension = file.name.split('.').pop().toLowerCase();
        if (extension === 'shp') fileGroups[baseName].shp = file;
        if (extension === 'dbf') fileGroups[baseName].dbf = file;
    }

    try {
        let allFeatures = [];
        let processedCount = 0;
        for (const baseName in fileGroups) {
            const group = fileGroups[baseName];
            if (group.shp && group.dbf) {
                const shpBuffer = await group.shp.arrayBuffer();
                const dbfBuffer = await group.dbf.arrayBuffer();
                const geojson = await shapefile.read(shpBuffer, dbfBuffer);
                if (geojson && geojson.features) {
                    allFeatures.push(...geojson.features);
                    processedCount++;
                }
            }
        }
        
        if (allFeatures.length > 0) {
            const properties = allFeatures.map(f => f.properties);
            const headers = Object.keys(properties[0]);
            let tsv = headers.join('\t') + '\n';
            properties.forEach(row => {
                tsv += headers.map(h => row[h] === undefined || row[h] === null ? '' : row[h]).join('\t') + '\n';
            });
            document.getElementById('techData').value = tsv;
            showNotification(`${processedCount} shapefile set(s) processed. Data loaded.`);
        } else {
           alert("No valid .shp and .dbf pairs were found in the dropped files.");
        }
    } catch (error) {
        console.error("Error reading shapefile:", error);
        alert("An error occurred while processing shapefiles. Check the console for details.");
    }
}

async function handleMergeDrop(files) {
    const fileList = document.getElementById('merge-file-list');
    const saveBtn = document.getElementById('merge-save-btn');
    const mergeOptions = document.getElementById('merge-options');
    if (!fileList || !saveBtn) return;

    const shpFiles = new Map();
    const dbfFiles = new Map();

    for (const file of files) {
        const name = file.name.split('.').slice(0, -1).join('.');
        if (file.name.endsWith('.shp')) {
            shpFiles.set(name, file);
        } else if (file.name.endsWith('.dbf')) {
            dbfFiles.set(name, file);
        }
    }

    fileList.innerHTML = '<p>Processing files...</p>';
    mergedFeatures = [];

    for (const [name, shpFile] of shpFiles) {
        if (dbfFiles.has(name)) {
            const dbfFile = dbfFiles.get(name);
            try {
                const shpBuffer = await shpFile.arrayBuffer();
                const dbfBuffer = await dbfFile.arrayBuffer();
                const geojson = await shapefile.read(shpBuffer, dbfBuffer);
                if (geojson && geojson.features) {
                    mergedFeatures.push(...geojson.features);
                    fileList.innerHTML += `<p class="text-green-400">✓ Merged ${shpFile.name} & ${dbfFile.name} (${geojson.features.length} features)</p>`;
                }
            } catch (error) {
                console.error(`Error processing ${name}:`, error);
                fileList.innerHTML += `<p class="text-red-400">✗ Error with ${name}.shp/.dbf pair.</p>`;
            }
        } else {
            fileList.innerHTML += `<p class="text-yellow-400">! Missing .dbf for ${name}.shp.</p>`;
        }
    }

    if (mergedFeatures.length > 0) {
        saveBtn.disabled = false;
        mergeOptions.classList.remove('hidden');
        fileList.innerHTML += `<p class="font-bold mt-2">Total Features Merged: ${mergedFeatures.length}</p>`;
    } else {
        fileList.innerHTML += `<p class="font-bold mt-2 text-red-400">No data was merged. Please check your files.</p>`;
    }
}

function clearAllData() {
    if (!confirm("Are you sure you want to clear ALL data? This will delete all saved projects and reset all custom settings to default. This action cannot be undone.")) {
        return;
    }

    if (db) {
        db.close();
    }

    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

    deleteRequest.onsuccess = function() {
        console.log("Database deleted successfully");
        alert("All data and settings have been cleared. The page will now reload.");
        location.reload();
    };
    deleteRequest.onerror = function(event) {
        console.error("Error deleting database:", event.target.error);
        alert("An error occurred while clearing data. Please check the console and try clearing your browser's site data manually.");
    };
    deleteRequest.onblocked = function() {
        console.warn("Database deletion blocked. Please close other tabs with this page open.");
        alert("Could not delete the database because it's in use in another tab. Please close all other tabs with this tool open and try again.");
    };
}

function showLoading(button) {
    button.disabled = true;
    const loader = document.createElement('span');
    loader.className = 'loader';
    button.prepend(loader);
}

function hideLoading(button) {
    button.disabled = false;
    const loader = button.querySelector('.loader');
    if (loader) loader.remove();
}

function setupEventListeners() {
    // Helper function to safely add event listeners
    const addSafeListener = (id, event, handler) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element with ID '${id}' not found.`);
        }
    };

    // --- Main Menu Dropdown Items ---
    addSafeListener('merge-fixpoints-btn', 'click', () => {
        resetMergeModal();
        openModal('merge-fixpoints-modal');
    });
    addSafeListener('manage-teams-btn', 'click', () => {
        populateAdminTeamManagement(); // Re-populate with current settings
        openModal('manage-teams-modal');
    });
    addSafeListener('advance-settings-btn', 'click', () => {
        populateAdvanceSettingsEditor();
        openModal('advance-settings-modal');
    });
    addSafeListener('toggle-theme-btn', 'click', () => {
        document.body.classList.toggle('light-theme');
        // Save theme preference
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    });
    addSafeListener('save-advance-settings-btn', 'click', saveAdvanceSettings);
    addSafeListener('how-it-works-btn', 'click', () => {
        document.getElementById('how-it-works-body').innerHTML = calculationInfo.howItWorks.body;
        openModal('how-it-works-modal');
    });
    addSafeListener('bug-report-btn', 'click', () => {
        window.open("https://teams.microsoft.com/l/chat/48:notes/conversations?context=%7B%22contextType%22%3A%22chat%22%7D", "_blank");
    });
    addSafeListener('clear-data-btn', 'click', clearAllData);
    
    // --- Info Icons ---
    document.body.addEventListener('click', (e) => {
        const icon = e.target.closest('.info-icon:not(.tech-summary-icon)');
        if (icon && icon.dataset.key) {
            e.stopPropagation();
            const info = calculationInfo[icon.dataset.key];
            if(info) {
                alert(`${info.title}\n\n${info.body.replace(/<[^>]*>/g, '')}`);
            }
        }
        const techIcon = e.target.closest('.tech-summary-icon');
        if (techIcon && techIcon.dataset.techId) {
            openTechSummaryModal(techIcon.dataset.techId);
        }
    });
    
    // --- Project Panel ---
    addSafeListener('refresh-projects-btn', 'click', fetchProjectListSummary);
    addSafeListener('project-select', 'change', (e) => {
        if (!isSaving) loadProjectIntoForm(e.target.value);
    });
    addSafeListener('delete-project-btn', 'click', () => { 
        const projectId = document.getElementById('project-select').value;
        if(projectId) deleteProjectFromIndexedDB(projectId); 
    });
    
    addSafeListener('edit-data-btn', 'click', () => {
        document.getElementById('techData').readOnly = false;
        document.getElementById('project-name').readOnly = false;
        document.getElementById('is-ir-project-checkbox').disabled = false;
        document.getElementById('gsd-value-select').disabled = false;
        document.getElementById('edit-data-btn').classList.add('hidden');
        document.getElementById('save-project-btn').disabled = false;
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
        // Change button text
        document.getElementById('save-project-btn').textContent = 'Update Project';
        document.getElementById('cancel-edit-btn').textContent = 'Cancel Edit';
    });
    
    addSafeListener('cancel-edit-btn', 'click', () => {
        const projectId = document.getElementById('project-select').value;
        if (projectId) loadProjectIntoForm(projectId);
        // Reset button text
        document.getElementById('save-project-btn').textContent = 'Save Project';
    });

    addSafeListener('save-project-btn', 'click', async (e) => {
        const button = e.target;
        showLoading(button);
        if (isSaving) return;
        isSaving = true;
        
        const projectName = document.getElementById('project-name').value.trim();
        const techData = document.getElementById('techData').value.trim();

        if (!projectName || !techData) {
            alert("Please provide both a project name and project data.");
            isSaving = false;
            hideLoading(button);
            return;
        }

        const existingId = document.getElementById('project-select').value;
        const isEditing = !!existingId && !document.getElementById('techData').readOnly;
        const projectId = isEditing ? existingId : projectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + Date.now();
        const isIR = document.getElementById('is-ir-project-checkbox').checked;
        const gsdVal = document.getElementById('gsd-value-select').value;
        const projectData = { id: projectId, name: projectName, rawData: techData, isIRProject: isIR, gsdValue: gsdVal };
        
        if (isEditing) delete fullProjectDataCache[projectId];

        try {
            await saveProjectToIndexedDB(projectData);
            await fetchProjectListSummary();
            document.getElementById('project-select').value = projectData.id;
            await loadProjectIntoForm(projectData.id);
        } catch (error) {
            // Error is logged in save function
        } finally {
            hideLoading(button);
            isSaving = false;
            // Reset button text
            document.getElementById('save-project-btn').textContent = 'Save Project';
        }
    });

    // --- Calculation Panel ---
    addSafeListener('calculate-btn', 'click', async (e) => {
        const button = e.target;
        showLoading(button);

        const projectId = document.getElementById('project-select').value;
        if (!projectId) {
            const techData = document.getElementById('techData').value.trim();
            if(!techData) {
                alert("Please select a project or paste data to calculate.");
                hideLoading(button);
                return;
            }
            
            const isIR = document.getElementById('is-ir-project-checkbox').checked;
            const gsdVal = document.getElementById('gsd-value-select').value;
            lastUsedGsdValue = gsdVal;
            
            const parsed = parseRawData(techData, isIR, 'Pasted Data', gsdVal);
            if (parsed) {
                currentTechStats = parsed.techStats;
                applyFilters();
                document.getElementById('results-title').textContent = `Bonus Payouts for: Pasted Data`;
            }

        } else {
            const projectData = await fetchFullProjectData(projectId);
            if (projectData) {
                lastUsedGsdValue = projectData.gsdValue;
                const parsed = parseRawData(projectData.rawData, projectData.isIRProject, projectData.name, projectData.gsdValue);
                if (parsed) {
                    currentTechStats = parsed.techStats;
                    applyFilters();
                    document.getElementById('results-title').textContent = `Bonus Payouts for: ${projectData.name}`;
                }
            }
        }
        hideLoading(button);
    });

    addSafeListener('calculate-all-btn', 'click', async (e) => {
        const button = e.target;
        showLoading(button);

        const selectEl = document.getElementById('project-select');
        const selectedProjectIds = Array.from(selectEl.options).filter(opt => opt.selected).map(opt => opt.value).filter(Boolean);
        const isCustomized = document.getElementById('customize-calc-all-cb').checked;

        let projectsToCalcIds = isCustomized ? selectedProjectIds : projectListCache.map(p => p.id);
        if (isCustomized && selectedProjectIds.length === 0) {
            alert("Please select projects from the list to calculate.");
            hideLoading(button);
            return;
        }
        if (projectsToCalcIds.length === 0) {
            alert("No projects to calculate.");
            hideLoading(button);
            return;
        }

        const combinedTechStats = {};

        for (const id of projectsToCalcIds) {
            const project = await fetchFullProjectData(id);
            if (!project) continue;
            
            const parsed = parseRawData(project.rawData, project.isIRProject, project.name, project.gsdValue);
            if (parsed) {
                for (const techId in parsed.techStats) {
                    const stat = parsed.techStats[techId];
                    if (!combinedTechStats[techId]) {
                        combinedTechStats[techId] = createNewTechStat();
                    }
                    combinedTechStats[techId].id = techId;
                    combinedTechStats[techId].points += stat.points;
                    combinedTechStats[techId].fixTasks += stat.fixTasks;
                    combinedTechStats[techId].afpTasks += stat.afpTasks;
                    combinedTechStats[techId].refixTasks += stat.refixTasks;
                    combinedTechStats[techId].warnings.push(...stat.warnings);
                }
            }
        }
        
        currentTechStats = combinedTechStats;
        applyFilters();
        document.getElementById('results-title').textContent = `Bonus Payouts for: ${isCustomized ? 'Selected Projects' : 'All Projects'}`;
        hideLoading(button);
    });
    
    addSafeListener('customize-calc-all-cb', 'change', (e) => {
        const selectEl = document.getElementById('project-select');
        if (selectEl) {
            selectEl.multiple = e.target.checked;
            selectEl.size = e.target.checked ? 6 : 1;
        }
    });

    // --- Results Panel ---
    addSafeListener('search-tech-id', 'input', applyFilters);
    addSafeListener('team-filter-container', 'change', applyFilters);
    addSafeListener('refresh-teams-btn', 'click', loadTeamSettings);
    addSafeListener('leaderboard-sort-select', 'change', () => applyFilters());

    // --- Manage Teams Modal ---
    addSafeListener('add-team-btn', 'click', () => addTeamCard());
    addSafeListener('save-teams-btn', 'click', saveTeamSettings);

    // --- Merge Modal ---
    addSafeListener('merge-save-btn', 'click', async (e) => {
        const button = e.target;
        showLoading(button);

        const projectName = document.getElementById('merge-project-name').value.trim();
        if (!projectName) {
            alert("Please enter a project name.");
            hideLoading(button);
            return;
        }
        const properties = mergedFeatures.map(f => f.properties);
        const headers = Object.keys(properties[0]);
        let tsv = headers.join('\t') + '\n';
        properties.forEach(row => {
            tsv += headers.map(h => row[h] === undefined || row[h] === null ? '' : row[h]).join('\t') + '\n';
        });

        const projectId = projectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + Date.now();
        const isIR = document.getElementById('merge-is-ir-checkbox').checked;
        const gsdVal = document.getElementById('merge-gsd-select').value;
        const projectData = { id: projectId, name: projectName, rawData: tsv, isIRProject: isIR, gsdValue: gsdVal };

        try {
            await saveProjectToIndexedDB(projectData);
            await fetchProjectListSummary();
            document.getElementById('project-select').value = projectData.id;
            await loadProjectIntoForm(projectData.id);
            closeModal('merge-fixpoints-modal');
        } catch (error) {
            // Error is logged in save function
        } finally {
            hideLoading(button);
        }
    });

    // --- Drag and Drop ---
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('bg-brand-700'); });
        dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('bg-brand-700'); });
        dropZone.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('bg-brand-700'); handleDroppedFiles(e.dataTransfer.files); });
    }
    const mergeDropZone = document.getElementById('merge-drop-zone');
    if (mergeDropZone) {
        mergeDropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); mergeDropZone.classList.add('bg-brand-700'); });
        mergeDropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); mergeDropZone.classList.remove('bg-brand-700'); });
        mergeDropZone.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); mergeDropZone.classList.remove('bg-brand-700'); handleMergeDrop(e.dataTransfer.files); });
    }
}


async function main() {
    try {
        await openDB();
        setupEventListeners();
        // Check for saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
        await Promise.all([ 
            fetchProjectListSummary(), 
            loadTeamSettings(), 
            loadBonusTiers(),
            loadCalculationSettings(),
            loadCountingSettings()
        ]);
        setPanelHeights();
        window.addEventListener('resize', setPanelHeights);
    } catch (e) {
        console.error(e);
        alert("Failed to initialize the application. Please check browser settings (IndexedDB may be disabled).");
    }
}

document.addEventListener('DOMContentLoaded', main);
