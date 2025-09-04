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
let countingSettings = {}; // NEW: To hold all task counting rules
let reorderSortable = null;
let lastUsedGsdValue = '3in';
let isSaving = false; // Flag to prevent recursive event firing
let mergedFeatures = []; // To store features from dropped files in the merge modal
let currentDataHeaders = []; // To store headers of the currently parsed data
let currentDataLines = []; // To store lines of the currently parsed data

const DB_NAME = 'BonusCalculatorDB';

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
                             <li><strong class="text-gray-300">Customize Everything:</strong> Use the <strong class="text-purple-400">Edit Bonus Tiers</strong>, <strong class="text-red-400">Point Settings</strong>, and <strong class="text-orange-400">Counting Settings</strong> buttons to customize the entire calculation logic.</li>
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
                        <p class="text-gray-400">The tool first calculates the <strong class="text-gray-300">Total Points</strong> for each technician by summing up points from different task types, as defined in the <strong class="text-orange-400">Counting Settings</strong>:</p>
                        <ul class="list-disc list-inside mt-1 space-y-1 text-gray-400">
                            <li><strong class="text-gray-300">Fix Tasks:</strong> Points are based on the category and the selected GSD value. All point values are defined in the <strong class="text-red-400">Point Settings</strong>. If the project is marked as "IR", the total points for a fix task row are multiplied by the customizable IR Modifier.</li>
                            <li><strong class="text-gray-300">QC, i3qa, RV Tasks:</strong> Each task is awarded a specific point value, which can be edited in the <strong class="text-red-400">Point Settings</strong>.</li>
                            <li><strong class="text-yellow-300">Point Transfers:</strong> If a QC task is flagged with a 'Missing' or 'Incomplete' tag during i3QA, the points for that QC task are subtracted from the QC tech and awarded to the i3QA tech.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 class="font-bold text-gray-200">Step 2: Fix Quality Percentage</h4>
                        <p class="text-gray-400">A technician's quality is crucial. It's calculated with the formula:</p>
                        <div class="code-block my-2 text-gray-300">Fix Quality % = (Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) * 100</div>
                        <p class="text-gray-400">What counts as a "Refix" or "Warning" is defined in the <strong class="text-orange-400">Counting Settings</strong>.</p>
                    </div>
                     <div>
                        <h4 class="font-bold text-gray-200">Step 3: Bonus Earned Percentage</h4>
                        <p class="text-gray-400">The <strong class="text-gray-300">Fix Quality %</strong> is used to find the <strong class="text-gray-300">% of Bonus Earned</strong> from a predefined tiered table. This table is fully customizable via the <strong class="text-purple-400">Edit Bonus Tiers</strong> button.</p>
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
    totalPoints: { title: 'Total Points Calculation', body: `<p>Points are calculated for each individual task based on its type (Fix, QC, i3qa, RV) and category, then summed for each technician. All point values are customizable in the 'Point Settings' modal.</p>`},
    fixQuality: { title: 'Fix Quality % Calculation', body: `<p>This measures a technician's accuracy. It's calculated using the formula: <code>[# of Fix Tasks] / ([# of Fix Tasks] + [# of Refix Tasks] + [# of Warnings])</code>. What constitutes a refix or warning is defined in the 'Counting Settings' modal.</p>`},
    bonusEarned: { title: '% of Bonus Earned Calculation', body: `<p>This percentage is determined by looking up the <strong>Fix Quality %</strong> in a tiered table. This table is customizable via the "Edit Bonus Tiers" button.</p>`},
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
        id: '', points: 0, fixTasks: 0, refixTasks: 0, warnings: [],
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

async function saveBonusTiers() {
    const editor = document.getElementById('bonus-tier-editor-container');
    const rows = editor.querySelectorAll('.tier-row');
    const newTiers = [];
    let isValid = true;
    rows.forEach(row => {
        const quality = parseFloat(row.querySelector('.tier-quality-input').value);
        const bonus = parseFloat(row.querySelector('.tier-bonus-input').value);
        if (isNaN(quality) || isNaN(bonus)) isValid = false;
        else newTiers.push({ quality, bonus: bonus / 100 });
    });

    if (!isValid) return alert("Please ensure all fields are valid numbers.");

    newTiers.sort((a, b) => b.quality - a.quality);
    try {
        await putToDB('bonusTiers', { id: 'customTiers', tiers: newTiers });
        bonusTiers = newTiers; 
        showNotification("Bonus tiers saved successfully.");
        closeBonusTierModal();
    } catch (error) {
        console.error("Error saving bonus tiers: ", error);
        alert("Failed to save bonus tiers.");
    }
}

function populateBonusTierEditor() {
    const container = document.getElementById('bonus-tier-editor-container');
    container.innerHTML = `<div class="grid grid-cols-3 gap-4 font-semibold text-gray-400 pb-2 border-b border-gray-600"><span>Min. Quality %</span><span>Bonus Earned %</span><span>Action</span></div>`;
    bonusTiers.forEach(tier => addBonusTierRow(tier.quality, tier.bonus * 100));
}

function addBonusTierRow(quality = '', bonus = '') {
    const container = document.getElementById('bonus-tier-editor-container');
    const row = document.createElement('div');
    row.className = 'tier-row grid grid-cols-3 gap-4 items-center';
    row.innerHTML = `
        <input type="number" step="0.5" class="tier-quality-input w-full p-2" value="${quality}">
        <input type="number" step="1" class="tier-bonus-input w-full p-2" value="${bonus}">
        <button class="delete-tier-btn bg-red-600/80 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-700 text-sm">Delete</button>
    `;
    container.appendChild(row);
    row.querySelector('.delete-tier-btn').addEventListener('click', (e) => e.target.closest('.tier-row').remove());
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

async function saveCalculationSettings() {
    const newSettings = {
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
        newSettings.categoryValues[i] = {
            "3in": parseFloat(row.querySelector('input[data-gsd="3in"]').value),
            "4in": parseFloat(row.querySelector('input[data-gsd="4in"]').value),
            "6in": parseFloat(row.querySelector('input[data-gsd="6in"]').value),
            "9in": parseFloat(row.querySelector('input[data-gsd="9in"]').value),
        };
    }
    try {
        await putToDB('calculationSettings', { id: 'customSettings', settings: newSettings });
        calculationSettings = newSettings;
        showNotification("Calculation settings saved successfully.");
        closeCalcSettingsModal();
    } catch (error) {
        console.error("Error saving calculation settings:", error);
        alert("Failed to save calculation settings.");
    }
}

function populateCalcSettingsEditor() {
    document.getElementById('setting-ir-modifier').value = calculationSettings.irModifierValue;
    document.getElementById('setting-qc-points').value = calculationSettings.points.qc;
    document.getElementById('setting-i3qa-points').value = calculationSettings.points.i3qa;
    document.getElementById('setting-rv1-points').value = calculationSettings.points.rv1;
    document.getElementById('setting-rv1-combo-points').value = calculationSettings.points.rv1_combo;
    document.getElementById('setting-rv2-points').value = calculationSettings.points.rv2;
    const tbody = document.getElementById('category-points-tbody');
    tbody.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const row = document.createElement('tr');
        row.dataset.category = i;
        row.className = "bg-gray-800/50";
        row.innerHTML = `
            <td class="p-2 font-semibold">Category ${i}</td>
            <td class="p-2"><input type="number" step="0.01" class="w-full p-1" data-gsd="3in" value="${calculationSettings.categoryValues[i]['3in']}"></td>
            <td class="p-2"><input type="number" step="0.01" class="w-full p-1" data-gsd="4in" value="${calculationSettings.categoryValues[i]['4in']}"></td>
            <td class="p-2"><input type="number" step="0.01" class="w-full p-1" data-gsd="6in" value="${calculationSettings.categoryValues[i]['6in']}"></td>
            <td class="p-2"><input type="number" step="0.01" class="w-full p-1" data-gsd="9in" value="${calculationSettings.categoryValues[i]['9in']}"></td>
        `;
        tbody.appendChild(row);
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


async function saveCountingSettings() {
    const getValues = (id) => document.getElementById(id).value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    const newSettings = {
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
        await putToDB('countingSettings', { id: 'customCounting', settings: newSettings });
        countingSettings = newSettings;
        showNotification("Counting logic saved successfully.");
        closeCountingSettingsModal();
    } catch (error) {
        console.error("Error saving counting settings:", error);
        alert("Failed to save counting settings.");
    }
}

function populateCountingSettingsEditor() {
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

async function saveTeamSettings(settings) {
    try {
        await putToDB('teams', { id: 'teams', settings: settings });
        showNotification("Team settings saved successfully.");
        teamSettings = settings;
        populateTeamFilters();
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
    
    const summaryStats = { totalRows: 0, comboTasks: 0, totalIncorrect: 0, totalMiss: 0 };
    const allIdCols = currentDataHeaders.filter(h => h.toLowerCase().endsWith('_id'));
    
    // Initialize stats for all technicians found
    const allTechsInDataSet = new Set();
    currentDataLines.forEach(line => {
        const values = line.split('\t');
        allIdCols.forEach(col => {
            const techId = values[headerMap[col.toLowerCase()]]?.trim();
            if (techId) allTechsInDataSet.add(techId);
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

        // --- Fix Task Point Calculation ---
        const processFixTech = (techId, catSources) => {
            if (!techId || !techStats[techId]) return;
            let techPoints = 0;
            let techCategories = 0;
            catSources.forEach(source => {
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
            fix1Sources.push({ cat: 'i3qa_cat', label: 'i3qa_label', condition: val => val && countingSettings.triggers.miss.labels.some(l => val.includes(l.toUpperCase())), sourceType: 'i3qa' }); // Remove || val.includes('C')
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
                    // This logic assumes points were already added and now need to be subtracted.
                    // The addPointsForTask runs before this, so we subtract from the QC tech
                    // and then add to the i3QA tech.
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
            document.getElementById('edit-data-btn').classList.remove('hidden');
            document.getElementById('save-project-btn').disabled = true;
            document.getElementById('cancel-edit-btn').classList.add('hidden');
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
        document.getElementById('edit-data-btn').classList.add('hidden');
        document.getElementById('save-project-btn').disabled = false;
        document.getElementById('cancel-edit-btn').classList.add('hidden');
    }
}

function displayResults(techStats) {
    const bonusMultiplier = parseFloat(document.getElementById('bonusMultiplierDirect').value) || 1;
    lastUsedBonusMultiplier = bonusMultiplier;
    lastCalculationUsedMultiplier = !!bonusMultiplier && bonusMultiplier !== 1;

    document.getElementById('tech-results-container').classList.add('visible');
    const tbody = document.getElementById('tech-results-body');
    const thead = document.getElementById('results-thead');
    tbody.innerHTML = '';

    const infoIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293.006.399.287.47l.45.083.082.38-2.29.287-.082-.38.45-.083a.89.89 0 0 1 .352-.176c.24-.11.24-.216.06-.563l-.738-3.468c-.18-.84.48-1.133 1.17-1.133H8l.084.38zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`;
    thead.innerHTML = `
        <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tech ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Points <span class="info-icon" data-key="totalPoints">${infoIconSvg}</span></th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fix Quality % <span class="info-icon" data-key="fixQuality">${infoIconSvg}</span></th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">% of Bonus Earned <span class="info-icon" data-key="bonusEarned">${infoIconSvg}</span></th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Final Payout (PHP) <span class="info-icon" data-key="totalBonus">${infoIconSvg}</span></th>
        </tr>
    `;

    const sortedTechs = Object.values(techStats).sort((a,b) => b.points - a.points);

    sortedTechs.forEach(tech => {
        const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
        const fixQuality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
        const qualityModifier = calculateQualityModifier(fixQuality);
        const finalPayout = tech.points * bonusMultiplier * qualityModifier;

        const row = document.createElement('tr');
        row.className = "hover:bg-gray-700/50 transition-colors";
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                ${tech.id}
                <span class="info-icon tech-summary-icon" data-tech-id="${tech.id}">
                   ${infoIconSvg}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${tech.points.toFixed(3)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${fixQuality.toFixed(2)}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${(qualityModifier * 100).toFixed(0)}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">${finalPayout.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

function populateProjectSelect() {
    const select = document.getElementById('project-select');
    const currentVal = select.value;
    select.innerHTML = '<option value="">Select/add a project to load...</option>';
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

function populateAdminProjectReorder() {
    const list = document.getElementById('reorder-list');
    list.innerHTML = '';
    projectListCache.forEach(project => {
        const item = document.createElement('div');
        item.className = 'project-list-item bg-gray-700 hover:bg-gray-600 transition-colors duration-200';
        item.textContent = project.name;
        item.setAttribute('data-id', project.id);
        list.appendChild(item);
    });
    if (reorderSortable) reorderSortable.destroy();
    reorderSortable = Sortable.create(list, { animation: 150, ghostClass: 'sortable-ghost' });
}

function populateAdminTeamManagement() {
    const container = document.getElementById('team-list-container');
    container.innerHTML = '';
    for (const team in teamSettings) {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'card p-4 rounded-lg space-y-2';
        teamDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <h4 class="font-bold text-gray-100">${team}</h4>
                <button class="delete-team-btn text-red-400 hover:text-red-500 transition-colors" data-team="${team}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>
                </button>
            </div>
            <label class="block text-xs text-gray-400">Comma-separated Tech IDs:</label>
            <textarea class="team-ids-input w-full p-2 border rounded-lg text-sm bg-gray-700 text-gray-200" rows="3" data-team="${team}">${teamSettings[team].join(', ')}</textarea>
        `;
        container.appendChild(teamDiv);
    }
}

function populateTeamFilters() {
    const container = document.getElementById('team-filter-container');
    const existingRefreshButton = document.getElementById('refresh-teams-btn');
    container.innerHTML = `<span class="text-sm font-medium text-gray-300">Filter by Team:</span>`;
    if(existingRefreshButton) container.appendChild(existingRefreshButton);
    
    Object.keys(teamSettings).sort().forEach(team => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input id="team-filter-${team}" type="checkbox" data-team="${team}" class="team-filter-cb h-4 w-4 text-indigo-500 focus:ring-indigo-600 bg-gray-700 border-gray-600 rounded">
            <label for="team-filter-${team}" class="ml-2 block text-sm font-medium text-gray-300">${team}</label>
        `;
        container.appendChild(div);
    });
}

function updateLeaderboard(techStats) {
    const tbody = document.getElementById('leaderboard-body');
    const sortSelect = document.getElementById('leaderboard-sort-select');
    const metricHeader = document.getElementById('leaderboard-metric-header');
    const sortBy = sortSelect.value;
    tbody.innerHTML = '';

    const getTeamName = (techId) => {
        for (const team in teamSettings) {
            if (teamSettings[team].some(id => id.toUpperCase() === techId.toUpperCase())) {
                return team;
            }
        }
        return 'N/A';
    };

    const techArray = Object.values(techStats).map(tech => {
         const denominator = tech.fixTasks + tech.refixTasks + tech.warnings.length;
         return {
            id: tech.id,
            team: getTeamName(tech.id),
            fixTasks: tech.fixTasks,
            totalPoints: tech.points,
            fixQuality: denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0,
        };
    });

    if (sortBy === 'totalPoints') {
        techArray.sort((a, b) => b.totalPoints - a.totalPoints);
        metricHeader.textContent = 'Total Points';
    } else if (sortBy === 'fixQuality') {
        techArray.sort((a, b) => b.fixQuality - a.fixQuality);
        metricHeader.textContent = 'Fix Quality %';
    } else { // Default to totalTasks
        techArray.sort((a, b) => b.fixTasks - a.fixTasks);
        metricHeader.textContent = 'Total Tasks';
    }
    
    if (techArray.length === 0) return tbody.innerHTML = `<tr><td class="px-4 py-2 text-gray-400" colspan="3"><i>No data to display...</i></td></tr>`;

    techArray.forEach((stat, index) => {
        const row = document.createElement('tr');
        let value;
        if (sortBy === 'totalTasks') value = stat.fixTasks;
        else if (sortBy === 'totalPoints') value = stat.totalPoints.toFixed(2);
        else if (sortBy === 'fixQuality') value = `${stat.fixQuality.toFixed(2)}%`;
        
        row.innerHTML = `<td class="px-4 py-2">${index + 1}</td><td class="px-4 py-2">${stat.id}</td><td class="px-4 py-2">${value}</td>`;
        tbody.appendChild(row);
    });
}

function updateWorkloadChart(techStats) {
    const container = document.getElementById('workload-chart-container');
    container.innerHTML = '';
    
    const totalTasks = Object.values(techStats).reduce((sum, stat) => sum + stat.fixTasks, 0);
    if (totalTasks === 0) return container.innerHTML = `<p class="text-gray-500 italic text-sm text-center">No tasks found for workload chart.</p>`;
    
    Object.values(techStats).sort((a, b) => b.fixTasks - a.fixTasks).forEach(stat => {
        const percentage = (stat.fixTasks / totalTasks) * 100;
        const barWrapper = document.createElement('div');
        barWrapper.className = 'workload-bar-wrapper';
        barWrapper.innerHTML = `
            <div class="workload-label" title="${stat.id}">${stat.id}</div>
            <div class="workload-bar">
                <div class="workload-bar-inner" style="width: ${percentage.toFixed(2)}%;">${stat.fixTasks > 0 ? stat.fixTasks : ''}</div>
            </div>`;
        container.appendChild(barWrapper);
    });
}

function updateProjectProgress(techStats) {
    const container = document.getElementById('project-progress-content');
    container.innerHTML = '';
    const statsArray = Object.values(techStats);
    if (statsArray.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-500 italic">Project progress will be shown here after calculation.</p>`;
        return;
    }
    
    const totalFixTasks = statsArray.reduce((sum, stat) => sum + stat.fixTasks, 0);
    const totalRefixTasks = statsArray.reduce((sum, stat) => sum + stat.refixTasks, 0);
    const totalWarnings = statsArray.reduce((sum, stat) => sum + stat.warnings.length, 0);
    const totalDenominator = totalFixTasks + totalRefixTasks + totalWarnings;
    const totalFixQuality = totalDenominator > 0 ? (totalFixTasks / totalDenominator) * 100 : 0;

    let teamQualityHtml = '';
    for (const teamName in teamSettings) {
        const teamMemberIds = teamSettings[teamName].map(id => id.toUpperCase());
        const teamMembersStats = statsArray.filter(stat => teamMemberIds.includes(stat.id.toUpperCase()));

        if (teamMembersStats.length > 0) {
            const teamFix = teamMembersStats.reduce((sum, t) => sum + t.fixTasks, 0);
            const teamRefix = teamMembersStats.reduce((sum, t) => sum + t.refixTasks, 0);
            const teamWarnings = teamMembersStats.reduce((sum, t) => sum + t.warnings.length, 0);
            const teamDenominator = teamFix + teamRefix + teamWarnings;
            const teamQuality = teamDenominator > 0 ? (teamFix / teamDenominator) * 100 : 0;
            
            teamQualityHtml += `
                <div class="team-quality-item">
                    <span class="font-medium text-gray-300">${teamName}:</span>
                    <span class="font-bold text-lg ${teamQuality >= 95 ? 'text-green-400' : 'text-yellow-400'}">${teamQuality.toFixed(2)}%</span>
                </div>`;
        }
    }

    container.innerHTML = `
        <div class="space-y-2">
            <p class="text-sm font-medium text-gray-300">Total Fix Tasks: <span class="text-white">${totalFixTasks}</span></p>
            <p class="text-sm font-medium text-gray-300">Total Refix Tasks: <span class="text-white">${totalRefixTasks}</span></p>
            <p class="text-sm font-medium text-gray-300">Total Warnings: <span class="text-white">${totalWarnings}</span></p>
        </div>
        <div class="mt-4">
            <p class="text-sm font-medium text-gray-300 mb-2">Overall Project Quality: <span class="font-bold text-lg text-green-400">${totalFixQuality.toFixed(2)}%</span></p>
            <div class="progress-bar h-2.5"><div class="progress-bar-inner h-full" style="width: ${totalFixQuality.toFixed(2)}%; background-color: #34d399;"></div></div>
        </div>
        <div class="mt-4 border-t border-gray-700 pt-4">
            <h4 class="text-sm font-semibold text-gray-200 mb-2">Quality per Team:</h4>
            <div class="space-y-2">${teamQualityHtml || '<p class="text-xs text-gray-500 italic">No team members found in this dataset.</p>'}</div>
        </div>`;
    document.getElementById('project-progress-card').classList.add('visible');
}

function updateTlSummary(stats, projectBreakdown) {
    const content = document.getElementById('tl-summary-content');
    content.innerHTML = '';
    
    if (projectBreakdown && projectBreakdown.length > 1) {
        let grandTotalPoints = 0;
        let breakdownHtml = `<details open><summary class="font-semibold text-gray-200 cursor-pointer">Project Breakdown</summary><ul class="mt-2 border border-gray-700 rounded-lg divide-y divide-gray-700 text-sm overflow-hidden">`;
        projectBreakdown.forEach((proj, index) => {
            grandTotalPoints += proj.points;
            const bgColor = index % 2 === 0 ? 'bg-gray-700/50' : 'bg-gray-800/30';
            breakdownHtml += `<li class="p-3 flex justify-between items-center ${bgColor}"><span class="font-medium text-gray-300">${proj.name}</span><span class="font-mono font-medium text-gray-100">${proj.points.toFixed(3)} pts</span></li>`;
        });
        breakdownHtml += `</ul><div class="mt-3 p-3 bg-gray-700 rounded-lg flex justify-between font-bold text-base"><span>Grand Total:</span><span class="font-mono text-gray-100">${grandTotalPoints.toFixed(3)} pts</span></div></details>`;
        content.innerHTML = breakdownHtml;
    } else {
         content.innerHTML = `<p class="text-xs text-gray-500 italic">Project breakdown appears when multiple projects are calculated.</p>`
    }
    document.getElementById('tl-summary-card').classList.add('visible');
}

function updateFix4Breakdown(rawData) {
    const container = document.getElementById('fix4-breakdown-content');
    const card = document.getElementById('fix4-breakdown-card');
    container.innerHTML = '';

    const lines = rawData.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 1) {
        container.innerHTML = `<p class="text-xs text-gray-500 italic">No data to analyze.</p>`;
        card.classList.add('visible');
        return;
    }

    const headers = lines.shift().split('\t').map(h => h.trim().toLowerCase());
    const headerMap = {};
    headers.forEach((h, i) => { headerMap[h] = i; });

    if (headerMap['fix4_id'] === undefined || headerMap['rv3_cat'] === undefined) {
         container.innerHTML = `<p class="text-xs text-gray-500 italic">'fix4_id' or 'rv3_cat' columns not found.</p>`;
         card.classList.add('visible');
         return;
    }

    const fix4Data = {};

    lines.forEach(line => {
        const values = line.split('\t');
        const techId = values[headerMap['fix4_id']]?.trim();
        const category = parseInt(values[headerMap['rv3_cat']]);

        if (techId && !isNaN(category) && category >= 1 && category <= 9) {
            if (!fix4Data[techId]) {
                fix4Data[techId] = {};
            }
            fix4Data[techId][category] = (fix4Data[techId][category] || 0) + 1;
        }
    });

    if (Object.keys(fix4Data).length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-500 italic">No relevant Fix4 data found.</p>`;
        card.classList.add('visible');
        return;
    }

    let html = '<div class="space-y-3">';
    for (const techId in fix4Data) {
        html += `<div><strong class="text-gray-200">${techId}</strong><ul class="list-disc list-inside ml-4 text-gray-400">`;
        for (const category in fix4Data[techId]) {
            html += `<li>Category ${category}: <span class="font-mono text-gray-300">${fix4Data[techId][category]}</span></li>`;
        }
        html += `</ul></div>`;
    }
    html += `</div>`;
    
    container.innerHTML = html;
    card.classList.add('visible');
}

function applyFilters() {
    const searchValue = document.getElementById('search-tech-id').value.toUpperCase();
    const selectedTeams = Array.from(document.querySelectorAll('.team-filter-cb:checked')).map(cb => cb.dataset.team);

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
    updateWorkloadChart(filteredStats);
}

function showNotification(message) {
    const notification = document.getElementById('update-notification');
    notification.textContent = message;
    notification.classList.remove('hidden', 'opacity-0', 'translate-y-2');
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => notification.classList.add('hidden'), 500);
    }, 3000);
}

function showModal(key) {
    const info = calculationInfo[key];
    if (info) {
        document.getElementById('modal-title').textContent = info.title;
        document.getElementById('modal-body').innerHTML = info.body;
        document.getElementById('view-data-btn').classList.add('hidden');
        document.getElementById('info-modal').classList.remove('hidden');
    }
}

function generateTechBreakdownHTML(tech) {
    const warningsCount = tech.warnings.length;
    const denominator = tech.fixTasks + tech.refixTasks + warningsCount;
    const fixQuality = denominator > 0 ? (tech.fixTasks / denominator) * 100 : 0;
    const qualityModifier = calculateQualityModifier(fixQuality);
    const finalPayout = tech.points * lastUsedBonusMultiplier * qualityModifier;

    let detailedCategoryHtml = `<div class="text-sm space-y-3">
        <div class="grid grid-cols-3 gap-x-4 font-semibold text-gray-400 border-b border-gray-600 pb-2">
            <div>Category</div>
            <div class="text-center">Tasks Counted</div>
            <div>How they were counted</div>
        </div>
        <div class="space-y-2">`;
    
    let totalTasksFromCategories = 0;
    
    for (let i = 1; i <= 9; i++) {
        const counts = tech.categoryCounts[i];
        const totalCategoryTasks = counts.primary + counts.i3qa + counts.afp + counts.rv;
        
        if (totalCategoryTasks > 0) {
            totalTasksFromCategories += totalCategoryTasks;
            let breakdownParts = [];
            if (counts.primary > 0) breakdownParts.push(`${counts.primary} from CATEGORY`);
            if (counts.i3qa > 0) breakdownParts.push(`${counts.i3qa} from i3QA`);
            if (counts.afp > 0) breakdownParts.push(`${counts.afp} from AFP`);
            if (counts.rv > 0) breakdownParts.push(`${counts.rv} from RV`);
            
            const breakdownText = breakdownParts.join(', ');

            detailedCategoryHtml += `
                <div class="grid grid-cols-3 gap-x-4 items-center bg-gray-900/50 p-2 rounded-md">
                    <div class="font-medium text-gray-200">Category ${i}</div>
                    <div class="text-center font-mono font-bold text-lg text-white">${totalCategoryTasks}</div>
                    <div class="text-xs text-gray-400">${breakdownText}</div>
                </div>
            `;
        }
    }
    
    detailedCategoryHtml += `</div></div>`;
    if (totalTasksFromCategories === 0) {
        detailedCategoryHtml = '<p class="text-gray-500 italic">No primary fix tasks recorded from data.</p>';
    }

    const categoryColors = { 1: 'bg-teal-900/50 border-teal-700', 2: 'bg-cyan-900/50 border-cyan-700', 3: 'bg-sky-900/50 border-sky-700', 4: 'bg-indigo-900/50 border-indigo-700', 5: 'bg-purple-900/50 border-purple-700', 6: 'bg-pink-900/50 border-pink-700', 7: 'bg-rose-900/50 border-rose-700', 8: 'bg-amber-900/50 border-amber-700', 9: 'bg-lime-900/50 border-lime-700' };
    let oldCategoryHtml = '';
    let totalCategoryCount = 0;
    const gsd = lastUsedGsdValue || '3in';

    for (let i = 1; i <= 9; i++) {
        const counts = tech.categoryCounts[i];
        const count = counts.primary + counts.i3qa + counts.afp + counts.rv;
        if (count > 0) {
            totalCategoryCount += count;
            const pointsPerCategory = calculationSettings.categoryValues[i]?.[gsd] || 0;
            oldCategoryHtml += `<li class="flex justify-between p-1.5 rounded-md border text-gray-300 ${categoryColors[i]}"><span>Category ${i}:</span><span class="font-mono text-xs">${count} x ${pointsPerCategory.toFixed(2)} pts = ${(count * pointsPerCategory).toFixed(2)} pts</span></li>`;
        }
    }
    if (tech.pointsBreakdown.fix > 0) oldCategoryHtml += `<li class="flex justify-between font-bold border-t-2 border-gray-600 pt-2 mt-2 bg-gray-700 p-2 rounded-md"><span>Total from Categories:</span><span class="font-mono">(${totalCategoryCount} tasks) ${tech.pointsBreakdown.fix.toFixed(2)} pts</span></li>`;
    if (!oldCategoryHtml) oldCategoryHtml = '<li>No primary fix tasks.</li>';

    const multiplierDisplay = lastCalculationUsedMultiplier ? `${lastUsedBonusMultiplier.toFixed(2)} (Multiplier)` : '1 (No Multiplier)';
    const warningsDetailHtml = tech.warnings.length > 0 ? `<ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-0.5">${tech.warnings.map(w => `<li>Type: <span class="font-mono font-semibold">${w.type}</span> (Project: ${w.project})</li>`).join('')}</ul>` : `<p class="text-xs text-gray-500 italic mt-1 pl-4">No warnings.</p>`;
    const refixDetailHtml = tech.refixDetails.length > 0 ? `<ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-0.5">${tech.refixDetails.map(r => `<li>Task: <span class="font-mono font-semibold">${r.round}</span> <span class="font-semibold text-red-400">(Cat: ${r.category})</span> (Project: ${r.project})</li>`).join('')}</ul>` : `<p class="text-xs text-gray-500 italic mt-1 pl-4">No refixes.</p>`;
    
    const i3qaMisses = tech.missedCategories.filter(m => m.round.toUpperCase() === 'I3QA');
    const rvMisses = tech.missedCategories.filter(m => m.round.startsWith('RV'));
    let missesDetailHtml = '';
    if (i3qaMisses.length > 0) {
        missesDetailHtml += `<p class="text-xs text-gray-400 mt-1 font-semibold">from i3qa:</p><ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-0.5 pl-4">${i3qaMisses.map(m => `<li>Task: <span class="font-mono font-semibold">${m.round}</span> <span class="font-semibold text-orange-400">(Cat: ${m.category})</span> (Project: ${m.project})</li>`).join('')}</ul>`;
    }
    if (rvMisses.length > 0) {
        missesDetailHtml += `<p class="text-xs text-gray-400 mt-1 font-semibold">from RV:</p><ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-0.5 pl-4">${rvMisses.map(m => `<li>Task: <span class="font-mono font-semibold">${m.round}</span> <span class="font-semibold text-orange-400">(Cat: ${m.category})</span> (Project: ${m.project})</li>`).join('')}</ul>`;
    }
    if (tech.missedCategories.length === 0) {
        missesDetailHtml = `<p class="text-xs text-gray-500 italic mt-1 pl-4">No misses.</p>`;
    }
    
    const approvedByRQACount = tech.approvedByRQA.length;
    const approvedByRQADetailHtml = approvedByRQACount > 0 ? `<ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-0.5">${tech.approvedByRQA.map(a => `<li>Task: <span class="font-mono font-semibold">${a.round}</span> <span class="font-semibold text-green-400">(Cat: ${a.category})</span> (Project: ${a.project})</li>`).join('')}</ul>` : `<p class="text-xs text-gray-500 italic mt-1 pl-4">No RQA approvals.</p>`;
    
return `<div class="space-y-4 text-sm">
    <div class="p-3 bg-gray-800 rounded-lg border border-gray-700">
        <h4 class="font-semibold text-base text-gray-200 mb-2">Primary Fix Category Counts (Detailed)</h4>
        ${detailedCategoryHtml}
        <div class="mt-4 pt-4 border-t border-gray-600">
            <h4 class="font-medium text-gray-400 mb-1">Primary Fix Category Counts (Summary)</h4>
            <ul class="mt-1 space-y-1">${oldCategoryHtml}</ul>
        </div>
    </div>
    <div class="p-3 bg-gray-800 rounded-lg border border-gray-700">
        <h4 class="font-semibold text-base text-gray-200 mb-3">Core Stats</h4>
        <div class="core-stats-grid">
            <div class="stat-item">
                <div class="stat-item-header"><span>Total Primary Fix Tasks</span></div>
                <div class="stat-item-value text-green-400">${tech.fixTasks}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-header"><span>Approved by RQA (AA)</span></div>
                <div class="stat-item-value text-cyan-400">${approvedByRQACount}</div>
                <details class="stat-item-details"><summary>View ${approvedByRQACount} tasks</summary>${approvedByRQADetailHtml}</details>
            </div>
            <div class="stat-item">
                <div class="stat-item-header"><span>Refix Tasks</span></div>
                <div class="stat-item-value text-red-400">${tech.refixTasks}</div>
                <details class="stat-item-details"><summary>View ${tech.refixTasks} tasks</summary>${refixDetailHtml}</details>
            </div>
            <div class="stat-item">
                <div class="stat-item-header"><span>Misses (M)</span></div>
                <div class="stat-item-value text-orange-400">${tech.missedCategories.length}</div>
                <details class="stat-item-details"><summary>View ${tech.missedCategories.length} misses</summary>${missesDetailHtml}</details>
            </div>
             <div class="stat-item col-span-2">
                <div class="stat-item-header"><span>Warnings</span></div>
                <div class="stat-item-value text-yellow-400">${tech.warnings.length}</div>
                <details class="stat-item-details"><summary>View ${tech.warnings.length} warnings</summary>${warningsDetailHtml}</details>
            </div>
        </div>
    </div>
    <div class="p-3 bg-gray-800 rounded-lg border border-gray-700">
        <h4 class="font-semibold text-base text-gray-200 mb-2">Points Calculation</h4>
        <div class="flex justify-between"><span class="text-gray-400">Points from Fix Tasks:</span><span class="font-mono">${tech.pointsBreakdown.fix.toFixed(3)}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Points from QC Tasks:</span><span class="font-mono">${tech.pointsBreakdown.qc.toFixed(3)}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Points from i3qa Tasks:</span><span class="font-mono">${tech.pointsBreakdown.i3qa.toFixed(3)}</span></div>
        ${tech.pointsBreakdown.qcTransfer > 0 ? `<div class="flex justify-between text-green-400"><span class="text-green-400">Points Transferred from QC:</span><span class="font-mono">+${tech.pointsBreakdown.qcTransfer.toFixed(3)}</span></div>` : ''}
        <div class="flex justify-between"><span class="text-gray-400">Points from RV Tasks:</span><span class="font-mono">${tech.pointsBreakdown.rv.toFixed(3)}</span></div>
        <hr class="my-2 border-gray-600">
        <div class="flex justify-between font-bold"><span class="text-gray-200">Total Points:</span><span class="font-mono">${tech.points.toFixed(3)}</span></div>
    </div>
    <div class="p-3 bg-gray-800 rounded-lg border border-gray-700"><h4 class="font-semibold text-base text-gray-200 mb-2">Quality Calculation</h4><p class="text-xs text-gray-500 mb-2">Formula: [Fix Tasks] / ([Fix Tasks] + [Refix Tasks] + [Warnings])</p><div class="p-2 bg-gray-900 rounded text-center font-mono"><code>${tech.fixTasks} / (${tech.fixTasks} + ${tech.refixTasks} + ${warningsCount}) = ${(fixQuality / 100).toFixed(4)}</code></div><div class="flex justify-between font-bold"><span class="text-gray-200">Fix Quality %:</span><span class="font-mono">${fixQuality.toFixed(2)}%</span></div></div>
    <div class="p-3 bg-blue-900/30 rounded-lg border border-blue-700/50"><h4 class="font-semibold text-base text-blue-300 mb-2">Final Payout</h4><p class="text-xs text-gray-500 mt-2 mb-2">Formula: Total Points * Bonus Multiplier * % of Bonus Earned</p><div class="p-2 bg-gray-900 rounded text-center text-xs md:text-sm mb-2 font-mono"><code>${tech.points.toFixed(3)} * ${multiplierDisplay} * ${qualityModifier.toFixed(2)}</code></div><div class="flex justify-between font-bold text-lg"><span class="text-blue-200">Final Payout (PHP):</span><span class="text-blue-400 font-mono">${finalPayout.toFixed(2)}</span></div></div>
</div>`;
}


function openTechSummaryModal(techId) {
    const tech = currentTechStats[techId];
    if (!tech) return;

    const modal = document.getElementById('info-modal');
    document.getElementById('view-data-btn').dataset.techId = techId;
    document.getElementById('modal-title').innerHTML = `Detailed Breakdown for Tech ID: <span class="text-blue-400">${techId}</span>`;
    document.getElementById('modal-body').innerHTML = generateTechBreakdownHTML(tech);
    document.getElementById('view-data-btn').classList.remove('hidden');
    modal.classList.remove('hidden');
}


// --- File: script.js ---

function openTechDataView(techId) {
    const dataViewModal = document.getElementById('data-view-modal');
    const breakdownContainer = document.getElementById('data-view-breakdown');
    const tableContainer = document.getElementById('data-view-table-container');
    const tech = currentTechStats[techId];
    if (!tech) return;

    breakdownContainer.innerHTML = generateTechBreakdownHTML(tech);
    document.getElementById('data-view-title').innerHTML = `Full Data View for: <span class="text-blue-400">${techId}</span>`;

    const techIdUpper = techId.toUpperCase();
    const headerMap = {};
    currentDataHeaders.forEach((h, i) => { headerMap[h.toLowerCase()] = i; });

    // Helper function to determine if a task was counted for the tech in this row
    const isFixTaskCountedForRowForTech = (values) => {
        const techId = techIdUpper;

        // Check for Fix Tasks (Primary, from Misses, from AFP)
        for (let i = 1; i <= 4; i++) {
            const fixIdCol = `fix${i}_id`;
            if (headerMap[fixIdCol] !== undefined && values[headerMap[fixIdCol]]?.trim().toUpperCase() === techId) {
                // Check primary category
                if (i === 1 && !!values[headerMap['category']]?.trim()) return true;
                // Check for misses that grant fix points
                const missCheck = { 1: 'i3qa', 2: 'rv1', 3: 'rv2', 4: 'rv3' }[i];
                if (missCheck) {
                    const labelCol = headerMap[`${missCheck}_label`];
                    const catCol = headerMap[`${missCheck}_cat`];
                    if (labelCol !== undefined && catCol !== undefined) {
                        const labelValue = values[labelCol]?.trim().toLowerCase();
                        if (labelValue && (countingSettings.triggers.miss.labels.includes(labelValue) || labelValue.includes('c')) && !!values[catCol]?.trim()) {
                            return true;
                        }
                    }
                }
                // Check for AFP 'AA' status
                const afpStatCol = headerMap[`afp${i}_stat`];
                const afpCatCol = headerMap[`afp${i}_cat`];
                if (afpStatCol !== undefined && values[afpStatCol]?.trim().toUpperCase() === 'AA' && !!values[afpCatCol]?.trim()) {
                    return true;
                }
            }
        }
        return false;
    };

    const filteredLines = currentDataLines.filter(line => {
        const values = line.split('\t');
        return isFixTaskCountedForRowForTech(values);
    });

    const columnsToKeep = [
        'fix1_id', 'fix2_id', 'fix3_id', 'fix4_id', 'qc1_id', 'qc2_id', 'qc3_id', 'i3qa_id', 'rv1_id', 'rv2_id',
        'category', 'i3qa_cat', 'afp1_cat', 'afp2_cat', 'afp3_cat', 'rv1_cat', 'rv2_cat', 'rv3_cat',
        'i3qa_label', 'rv1_label', 'rv2_label', 'rv3_label',
        'afp1_stat', 'afp2_stat', 'afp3_stat', 'combo?',
        'r1_warn', 'r2_warn', 'r3_warn', 'r4_warn'
    ];

    const headerIndicesToKeep = currentDataHeaders.map((h, i) => columnsToKeep.includes(h.toLowerCase()) ? i : -1).filter(i => i !== -1);
    const filteredHeaders = headerIndicesToKeep.map(i => currentDataHeaders[i]);

    let tableHtml = `<table class="data-view-table"><thead><tr>${filteredHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;

    filteredLines.forEach(line => {
        const values = line.split('\t');
        const filteredValues = headerIndicesToKeep.map(i => values[i] || ''); // Ensure undefined becomes empty string
        tableHtml += `<tr>${filteredValues.map(v => `<td>${v}</td>`).join('')}</tr>`;
    });

    tableHtml += `</tbody></table>`;
    tableContainer.innerHTML = tableHtml;
    dataViewModal.classList.remove('hidden');
}


function closeModal() { document.getElementById('info-modal').classList.add('hidden'); }
function closeDataViewModal() { document.getElementById('data-view-modal').classList.add('hidden'); }
function closeTeamManagementModal() { document.getElementById('team-management-modal').classList.add('hidden'); }
function openTeamManagementModal() { populateAdminTeamManagement(); document.getElementById('team-management-modal').classList.remove('hidden'); }
function closeReorderModal() { if (reorderSortable) { reorderSortable.destroy(); reorderSortable = null; } document.getElementById('reorder-modal').classList.add('hidden'); }
function openBonusTierModal() { populateBonusTierEditor(); document.getElementById('bonus-tier-modal').classList.remove('hidden'); }
function closeBonusTierModal() { document.getElementById('bonus-tier-modal').classList.add('hidden'); }
function openCalcSettingsModal() { populateCalcSettingsEditor(); document.getElementById('calculation-settings-modal').classList.remove('hidden'); }
function closeCalcSettingsModal() { document.getElementById('calculation-settings-modal').classList.add('hidden'); }
function openCountingSettingsModal() { populateCountingSettingsEditor(); document.getElementById('counting-settings-modal').classList.remove('hidden'); }
function closeCountingSettingsModal() { document.getElementById('counting-settings-modal').classList.add('hidden'); }


async function saveReorderModal() {
    if (!reorderSortable) return;
    const newOrderIds = reorderSortable.toArray();
    try {
        const projects = await getAllFromDB('projects');
        const projectMap = new Map(projects.map(p => [p.id, p]));
        const reorderedList = newOrderIds.map((id, index) => {
            const project = projectMap.get(id);
            if (project) { project.projectOrder = Date.now() - index; return project; }
        }).filter(Boolean);
        
        const tx = db.transaction(['projects'], 'readwrite');
        const store = tx.objectStore('projects');
        const promises = [];
        for (const project of reorderedList) {
           promises.push(store.put(project));
        }
        await Promise.all(promises);

        await tx.done;
        
        showNotification("Project order saved!");
        await fetchProjectListSummary();
        closeReorderModal();
    } catch (err) {
        console.error("Failed to save reorder:", err);
        alert("Error saving order.");
    }
}

function resetUIForNewCalculation() {
    document.getElementById('tech-results-container').classList.remove('visible');
    document.getElementById('tech-results-body').innerHTML = '';
    document.getElementById('results-title').textContent = 'Technician Bonus Results';
    document.getElementById('leaderboard-body').innerHTML = `<tr><td class="px-4 py-2 text-gray-400" colspan="3"><i>Calculate a project to see data...</i></td></tr>`;
    document.getElementById('workload-chart-container').innerHTML = `<p class="text-gray-500 italic text-sm text-center">Calculate a project to see chart...</p>`;
    const cardsToReset = ['project-progress-card', 'tl-summary-card', 'fix4-breakdown-card'];
    cardsToReset.forEach(cardId => {
        const card = document.getElementById(cardId);
        card.classList.remove('visible');
        const content = card.querySelector('[id$="-content"]');
        if (content) {
            content.innerHTML = `<p class="text-xs text-gray-500 italic">Summary will be shown here after calculation.</p>`;
        }
    });
    
    document.getElementById('project-name').value = '';
    document.getElementById('techData').value = '';
    loadProjectIntoForm("");
}


async function handleDroppedFiles(files) {
    resetUIForNewCalculation();
    let dbfFile, shpFile;
    for (const file of files) {
        if (file.name.endsWith('.dbf')) dbfFile = file;
        if (file.name.endsWith('.shp')) shpFile = file;
    }

    if (dbfFile && shpFile) {
        try {
            const dbfBuffer = await dbfFile.arrayBuffer();
            const shpBuffer = await shpFile.arrayBuffer();
            const geojson = await shapefile.read(shpBuffer, dbfBuffer);
            
            if (geojson && geojson.features && geojson.features.length > 0) {
                const properties = geojson.features.map(f => f.properties);
                const headers = Object.keys(properties[0]);
                let tsv = headers.join('\t') + '\n';
                properties.forEach(row => {
                    tsv += headers.map(h => row[h] === undefined || row[h] === null ? '' : row[h]).join('\t') + '\n';
                });
                document.getElementById('techData').value = tsv;
                showNotification(`${files.length} files processed. Data loaded into text area.`);
            } else {
               alert("Could not extract features from the shapefile.");
            }
        } catch (error) {
            console.error("Error reading shapefile:", error);
            alert("Error processing shapefiles. Check the console for details.");
        }
    } else {
        alert("Please drop both a .shp and a .dbf file together.");
    }
}

async function handleMergeDrop(files) {
    const fileList = document.getElementById('merge-file-list');
    const loadBtn = document.getElementById('merge-load-btn');
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
        loadBtn.disabled = false;
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

function setupEventListeners() {
    document.getElementById('how-it-works-btn').addEventListener('click', () => showModal('howItWorks'));
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('view-data-btn').addEventListener('click', (e) => {
        closeModal();
        openTechDataView(e.target.dataset.techId);
    });
    document.getElementById('data-view-close-btn').addEventListener('click', closeDataViewModal);
    document.getElementById('data-view-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('#data-view-table-container tbody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
        });
    });
    document.body.addEventListener('click', (e) => {
        const icon = e.target.closest('.info-icon:not(.tech-summary-icon)');
        if (icon && icon.dataset.key) {
            e.stopPropagation();
            showModal(icon.dataset.key);
        }
        const techIcon = e.target.closest('.tech-summary-icon');
        if (techIcon && techIcon.dataset.techId) {
            openTechSummaryModal(techIcon.dataset.techId);
        }
    });

    document.getElementById('bug-report-btn').addEventListener('click', () => {
        window.open("https://teams.microsoft.com/l/chat/48:notes/conversations?context=%7B%22contextType%22%3A%22chat%22%7D", "_blank");
    });
    document.getElementById('clear-data-btn').addEventListener('click', clearAllData);


    const mergeModal = document.getElementById('merge-fixpoints-modal');
    const mergeDropZone = document.getElementById('merge-drop-zone');
    document.getElementById('merge-fixpoints-btn').addEventListener('click', () => {
        mergedFeatures = [];
        document.getElementById('merge-file-list').innerHTML = '';
        document.getElementById('merge-load-btn').disabled = true;
        mergeModal.classList.remove('hidden');
    });
    document.getElementById('merge-cancel-btn').addEventListener('click', () => mergeModal.classList.add('hidden'));
    
    document.getElementById('merge-load-btn').addEventListener('click', () => {
        if (mergedFeatures.length > 0) {
            const properties = mergedFeatures.map(f => f.properties);
            const allHeaders = new Set();
            properties.forEach(p => Object.keys(p).forEach(h => allHeaders.add(h)));
            const headers = Array.from(allHeaders);
            
            let tsv = headers.join('\t') + '\n';
            properties.forEach(row => {
                tsv += headers.map(h => row[h] === undefined || row[h] === null ? '' : String(row[h])).join('\t') + '\n';
            });
            
            resetUIForNewCalculation();
            document.getElementById('techData').value = tsv;
            document.getElementById('project-select').value = ""; 
            
            showNotification(`${mergedFeatures.length} merged features loaded into the text area.`);
            mergeModal.classList.add('hidden');
        }
    });

    mergeDropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); mergeDropZone.classList.add('drag-over'); });
    mergeDropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); mergeDropZone.classList.remove('drag-over'); });
    mergeDropZone.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); mergeDropZone.classList.remove('drag-over'); handleMergeDrop(e.dataTransfer.files); });

    document.getElementById('manage-teams-btn').addEventListener('click', openTeamManagementModal);
    document.getElementById('close-teams-modal-btn').addEventListener('click', closeTeamManagementModal);
    document.getElementById('add-team-btn').addEventListener('click', () => {
        const newTeamName = document.getElementById('new-team-name').value.trim();
        if (newTeamName && !teamSettings[newTeamName]) { teamSettings[newTeamName] = []; populateAdminTeamManagement(); document.getElementById('new-team-name').value = ''; }
    });
    document.getElementById('team-list-container').addEventListener('click', (e) => {
        if (e.target.closest('.delete-team-btn')) {
            const team = e.target.closest('.delete-team-btn').dataset.team;
            if (window.confirm(`Are you sure you want to delete the team "${team}"?`)) { delete teamSettings[team]; populateAdminTeamManagement(); }
        }
    });
    document.getElementById('save-teams-btn').addEventListener('click', () => {
        const newSettings = {};
        document.querySelectorAll('.team-ids-input').forEach(input => {
            const teamName = input.dataset.team;
            newSettings[teamName] = input.value.split(',').map(id => id.trim()).filter(id => id !== '');
        });
        saveTeamSettings(newSettings);
    });
    document.getElementById('refresh-teams-btn').addEventListener('click', loadTeamSettings);

    document.getElementById('edit-bonus-tiers-btn').addEventListener('click', openBonusTierModal);
    document.getElementById('close-bonus-tier-modal-btn').addEventListener('click', closeBonusTierModal);
    document.getElementById('save-bonus-tiers-btn').addEventListener('click', saveBonusTiers);
    document.getElementById('add-bonus-tier-btn').addEventListener('click', () => addBonusTierRow());
    document.getElementById('reset-bonus-tiers-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset the bonus tiers to their default values?")) {
            bonusTiers = defaultBonusTiers;
            populateBonusTierEditor();
        }
    });

    document.getElementById('calculation-settings-btn').addEventListener('click', openCalcSettingsModal);
    document.getElementById('close-calc-settings-modal-btn').addEventListener('click', closeCalcSettingsModal);
    document.getElementById('save-calc-settings-btn').addEventListener('click', saveCalculationSettings);
    document.getElementById('reset-calc-settings-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all calculation settings to their defaults?")) {
            calculationSettings = JSON.parse(JSON.stringify(defaultCalculationSettings));
            populateCalcSettingsEditor();
        }
    });
    
    document.getElementById('counting-settings-btn').addEventListener('click', openCountingSettingsModal);
    document.getElementById('close-counting-settings-modal-btn').addEventListener('click', closeCountingSettingsModal);
    document.getElementById('save-counting-settings-btn').addEventListener('click', saveCountingSettings);
    document.getElementById('reset-counting-settings-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset counting logic to its defaults?")) {
            countingSettings = JSON.parse(JSON.stringify(defaultCountingSettings));
            populateCountingSettingsEditor();
        }
    });

    document.getElementById('reorder-projects-btn').addEventListener('click', () => { populateAdminProjectReorder(); document.getElementById('reorder-modal').classList.remove('hidden'); });
    document.getElementById('reorder-save-btn').addEventListener('click', saveReorderModal);
    document.getElementById('reorder-cancel-btn').addEventListener('click', closeReorderModal);

    document.getElementById('refresh-projects-btn').addEventListener('click', fetchProjectListSummary);
    document.getElementById('project-select').addEventListener('change', (e) => {
        if (!isSaving) loadProjectIntoForm(e.target.value);
    });
    document.getElementById('delete-project-btn').addEventListener('click', () => { const projectId = document.getElementById('project-select').value; if(projectId) deleteProjectFromIndexedDB(projectId); });
    
    document.getElementById('edit-data-btn').addEventListener('click', () => {
        document.getElementById('techData').readOnly = false;
        document.getElementById('project-name').readOnly = false;
        document.getElementById('is-ir-project-checkbox').disabled = false;
        document.getElementById('gsd-value-select').disabled = false;
        document.getElementById('edit-data-btn').classList.add('hidden');
        document.getElementById('save-project-btn').disabled = false;
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
    });
    
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        const projectId = document.getElementById('project-select').value;
        if (projectId) loadProjectIntoForm(projectId);
    });

    document.getElementById('calculateCurrentBtn').addEventListener('click', async () => {
        const projectId = document.getElementById('project-select').value;
        if (!projectId) return alert("Please select a project.");
        
        showNotification('Calculating selected project...');
        const projectData = await fetchFullProjectData(projectId);
        if (projectData) {
            lastUsedGsdValue = projectData.gsdValue;
            const parsed = parseRawData(projectData.rawData, projectData.isIRProject, projectData.name, projectData.gsdValue);
            if (parsed) {
                currentTechStats = parsed.techStats;
                applyFilters();
                updateProjectProgress(currentTechStats);
                updateTlSummary(parsed.summaryStats, [{ name: projectData.name, points: Object.values(currentTechStats).reduce((sum, tech) => sum + tech.points, 0) }]);
                updateFix4Breakdown(projectData.rawData);
                document.getElementById('results-title').textContent = `Bonus Results for: ${projectData.name}`;
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        }
    });

    document.getElementById('calculatePastedDataBtn').addEventListener('click', () => {
        const techData = document.getElementById('techData').value.trim();
        const isIR = document.getElementById('is-ir-project-checkbox').checked;
        const gsdVal = document.getElementById('gsd-value-select').value;
        lastUsedGsdValue = gsdVal;
        
        if (techData) {
            showNotification('Calculating pasted data...');
            const parsed = parseRawData(techData, isIR, 'Pasted Data', gsdVal);
            if (parsed) {
                currentTechStats = parsed.techStats;
                applyFilters();
                updateProjectProgress(currentTechStats);
                updateTlSummary(parsed.summaryStats, [{ name: 'Pasted Data', points: Object.values(currentTechStats).reduce((sum, tech) => sum + tech.points, 0) }]);
                updateFix4Breakdown(techData);
                document.getElementById('results-title').textContent = `Bonus Results for: Pasted Data`;
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        } else alert("Please paste data into the text box first.");
    });
    
    document.getElementById('save-project-btn').addEventListener('click', async () => {
        if (isSaving) return;
        isSaving = true;
        const saveButton = document.getElementById('save-project-btn');
        const originalButtonText = saveButton.textContent;
        const projectName = document.getElementById('project-name').value.trim();
        const techData = document.getElementById('techData').value.trim();

        if (!projectName || !techData) {
            alert("Please provide both a project name and project data.");
            isSaving = false;
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
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
            // Error logged in save function
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = originalButtonText;
            isSaving = false;
        }
    });

    document.getElementById('calculate-all-btn').addEventListener('click', async () => {
        const selectedProjectIds = Array.from(document.querySelectorAll('#project-select option:checked')).map(opt => opt.value).filter(Boolean);
        const isCustomized = document.getElementById('customize-calc-all-cb').checked;

        let projectsToCalcIds = isCustomized ? selectedProjectIds : projectListCache.map(p => p.id);
        if (isCustomized && selectedProjectIds.length === 0) return alert("Please select projects from the list to calculate.");
        if (projectsToCalcIds.length === 0) return alert("No projects to calculate.");

        showNotification('Calculating projects...');

        let combinedRawData = '';
        const projectsToCalculate = await Promise.all(projectsToCalcIds.map(async (id) => {
            const proj = await fetchFullProjectData(id);
            if (proj) combinedRawData += proj.rawData + '\n';
            return proj;
        }));

        const combinedTechStats = {};
        const projectBreakdown = [];
        let combinedSummary = { totalRows: 0, totalIncorrect: 0, totalMiss: 0 };

        if (projectsToCalculate.filter(Boolean).length > 0) lastUsedGsdValue = projectsToCalculate.filter(Boolean)[0].gsdValue;

        for (const project of projectsToCalculate) {
            if (!project) continue;
            
            const parsed = parseRawData(project.rawData, project.isIRProject, project.name, project.gsdValue);
            if (parsed) {
                projectBreakdown.push({name: project.name, points: Object.values(parsed.techStats).reduce((s, t) => s + t.points, 0)});
                combinedSummary.totalRows += parsed.summaryStats.totalRows;
                combinedSummary.totalIncorrect += parsed.summaryStats.totalIncorrect;
                combinedSummary.totalMiss += parsed.summaryStats.totalMiss;
                
                for (const techId in parsed.techStats) {
                    const stat = parsed.techStats[techId];
                    if (!combinedTechStats[techId]) {
                        combinedTechStats[techId] = createNewTechStat();
                    }
                    combinedTechStats[techId].id = techId;
                    combinedTechStats[techId].points += stat.points;
                    combinedTechStats[techId].fixTasks += stat.fixTasks;
                    combinedTechStats[techId].refixTasks += stat.refixTasks;

                    combinedTechStats[techId].warnings.push(...stat.warnings);
                    combinedTechStats[techId].refixDetails.push(...stat.refixDetails);
                    combinedTechStats[techId].missedCategories.push(...stat.missedCategories);
                    combinedTechStats[techId].approvedByRQA.push(...stat.approvedByRQA);

                    for (const key in stat.pointsBreakdown) {
                        if (!combinedTechStats[techId].pointsBreakdown[key]) {
                            combinedTechStats[techId].pointsBreakdown[key] = 0;
                        }
                        combinedTechStats[techId].pointsBreakdown[key] += stat.pointsBreakdown[key];
                    }
                    for (let i = 1; i <= 9; i++) {
                         if (stat.categoryCounts[i]) {
                            const counts = stat.categoryCounts[i];
                            combinedTechStats[techId].categoryCounts[i].primary += counts.primary;
                            combinedTechStats[techId].categoryCounts[i].i3qa += counts.i3qa;
                            combinedTechStats[techId].categoryCounts[i].afp += counts.afp;
                            combinedTechStats[techId].categoryCounts[i].rv += counts.rv;
                        }
                    }
                }
            }
        }
        
        currentTechStats = combinedTechStats;
        applyFilters();
        updateProjectProgress(currentTechStats);
        updateTlSummary(combinedSummary, projectBreakdown);
        updateFix4Breakdown(combinedRawData);
        document.getElementById('results-title').textContent = `Bonus Results for: ${isCustomized ? 'Selected Projects' : 'All Projects'}`;
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    
    document.getElementById('search-tech-id').addEventListener('input', applyFilters);
    document.getElementById('team-filter-container').addEventListener('change', applyFilters);
    
    document.getElementById('customize-calc-all-cb').addEventListener('change', (e) => {
        const selectEl = document.getElementById('project-select');
        selectEl.multiple = e.target.checked;
        selectEl.size = e.target.checked ? 10 : 1;
    });
    document.getElementById('leaderboard-sort-select').addEventListener('change', applyFilters);

    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('drag-over'); });
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('drag-over'); handleDroppedFiles(e.dataTransfer.files); });
}

function populateUpdates() {
    const updates = [
        "**Update**: Fix bug in I3,i3QA,RV Calculation logic.",
    ];
    const updatesList = document.getElementById('updates-list');
    updatesList.innerHTML = updates.map(update => `<p>&bull; ${update}</p>`).join('');
}

async function main() {
    const dbStatusEl = document.getElementById('db-status');
    dbStatusEl.textContent = 'Connecting to database...';
    populateUpdates();

    try {
        await openDB();
        dbStatusEl.innerHTML = `Status: <span class="status-ok">Connected Successfully</span>`;
        setupEventListeners();
        await Promise.all([ 
            fetchProjectListSummary(), 
            loadTeamSettings(), 
            loadBonusTiers(),
            loadCalculationSettings(),
            loadCountingSettings()
        ]);
    } catch (e) {
        dbStatusEl.innerHTML = `Status: <span class="status-fail">Failed to connect</span>. Please check browser settings.`;
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', main);
