// --- GLOBAL STATE ---
const AppState = {
    db: null, 
    teamSettings: {}, 
    bonusTiers: [], 
    calculationSettings: {},
    countingSettings: {}, 
    currentTechStats: {}, 
    lastUsedGsdValue: '3in',
    currentSort: { column: 'payout', direction: 'desc' },
    currentFilter: '', // New state for leaderboard search
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
    ADMIN_EMAIL: [ 
        'ev.lorens.ebrado@gmail.com',
        'ev.anderson4470@gmail.com'
    ],
    DEFAULT_TEAMS: {
        "Team 123": ["7244AA", "7240HH", "7247JA", "4232JD", "4475JT", "4472JS", "4426KV", "7236LE", "7039NO", "7231NR", "7249SS", "7314VP"],
        "Team 63": ["7089RR", "7102JD", "7161KA", "7159MC", "7168JS", "7158JD", "7092RN", "7103RE", "7040JP", "7166JS", "7096AV", "7179KB"],
        "Team 115": ["4489EA", "7107JA", "7160MJ", "7171AL", "7170WS", "7087LA", "7173KM", "7169MM", "7177ML", "7175MS", "7176MR", "7178JR"],
        "Team 57": ["7163RJ", "7165JD", "7091HA", "7162MJ", "7093MG", "7099SS", "7086LP", "7043RP", "7088MA", "7037HP", "4297RQ", "4488MD"],
        "Team 114": ["7232CA", "7239CS", "7235DC", "7237EL", "7234GL", "7238JL", "7233LA", "7241NS", "7242RF", "7243RC", "7245VR", "7246WW"],
        "Team 64": ["7085AC", "7090CS", "7094EC", "7095JM", "7097JS", "7098LJ", "7100LP", "7101MJ", "7104RA", "7105RD", "7106TS", "7108YA"]
    },
    // NEW: Default Calculation Settings
    DEFAULT_CALC_SETTINGS: {
        key: 'default',
        irModifier: 1.5,
        qcPoints: 0.125,
        i3qaPoints: 0.083333,
        rv1Points: 0.2,
        rv2Points: 0.5,
        rv1ComboPoints: 0.25,
    },
    NOTIFICATION_TIMEOUT: 5000 
};

// Utility to get full name from techNameDatabase (defined in chatbot-knowledge-base.js)
function getName(techId) {
    if (typeof techNameDatabase !== 'undefined' && techNameDatabase[techId]) {
        return techNameDatabase[techId];
    }
    return 'Unknown Tech';
}

// --- DATABASE UTILITIES (DB) ---
const DB = {
    // IndexedDB initialization logic
    open: () => {
        return new Promise((resolve, reject) => {
            if (AppState.db) {
                resolve(AppState.db);
                return;
            }

            const request = indexedDB.open('BonusCalculatorDB', 4); // Increment DB version

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                AppState.db = event.target.result;
                resolve(AppState.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Existing Stores
                if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('teams')) db.createObjectStore('teams', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
                if (!db.objectStoreNames.contains('bonusTiers')) db.createObjectStore('bonusTiers', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('countingSettings')) db.createObjectStore('countingSettings', { keyPath: 'key' });
                
                // Ensure calculationSettings exists and populate if needed
                if (!db.objectStoreNames.contains('calculationSettings')) {
                    const store = db.createObjectStore('calculationSettings', { keyPath: 'key' });
                    // Store defaults immediately after creation
                    store.put(CONSTANTS.DEFAULT_CALC_SETTINGS);
                }
                
                // NEW: History store for period tracking
                if (!db.objectStoreNames.contains('history')) {
                    db.createObjectStore('history', { keyPath: 'timestamp' });
                }
            };
        });
    },

    // Generic function to get data from a store
    get: async (storeName, key) => {
        const db = await DB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    
    // Generic function to get ALL data from a store
    getAll: async (storeName) => {
        const db = await DB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Generic function to put data into a store
    put: async (storeName, value) => {
        const db = await DB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    
    // Generic function to clear all data from a store
    clear: async (storeName) => {
        const db = await DB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // Load initial settings into AppState
    loadSettings: async () => {
        try {
            // Load teams
            const teamData = await DB.get('teams', 'default');
            AppState.teamSettings = teamData ? teamData.teams : CONSTANTS.DEFAULT_TEAMS;

            // Load calculation settings
            const calcData = await DB.get('calculationSettings', 'default');
            AppState.calculationSettings = calcData ? calcData : CONSTANTS.DEFAULT_CALC_SETTINGS;
            
            // Load GSD value
            const gsdSetting = await DB.get('settings', 'lastUsedGsdValue');
            AppState.lastUsedGsdValue = gsdSetting ? gsdSetting.value : '3in';

            // Load bonus tiers
            const tiers = await DB.get('bonusTiers', 'default');
            AppState.bonusTiers = tiers ? tiers.tiers : [];

            // Update UI with loaded settings
            UI.updateSettingsModal();
            UI.updateGsdSelect();
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    }
};

// --- UI UTILITIES (UI) ---
const UI = {
    // Shorthand for document.getElementById
    $: id => document.getElementById(id),

    // Shorthand for event listener
    listen: (id, event, handler) => UI.$(id)?.addEventListener(event, handler),
    
    // Opens a modal
    openModal: (id) => UI.$(id)?.classList.remove('hidden'),
    
    // Closes a modal
    closeModal: (id) => UI.$(id)?.classList.add('hidden'),

    // Shows a notification
    showNotification: (message, isError = false) => {
        const notification = UI.$('notification-toast');
        const icon = UI.$('notification-icon');
        const text = UI.$('notification-text');

        if (!notification || !icon || !text) return;

        text.textContent = message;
        
        // Reset classes
        notification.className = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-xl transition-transform transform translate-x-full duration-300 ease-out z-50';
        icon.className = 'w-6 h-6 mr-3';

        if (isError) {
            notification.classList.add('bg-red-500', 'text-white');
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
        } else {
            notification.classList.add('bg-green-500', 'text-white');
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
        }
        
        // Show notification
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);

        // Hide notification after timeout
        setTimeout(() => notification.classList.add('translate-x-full'), CONSTANTS.NOTIFICATION_TIMEOUT);
    },

    // Toggles the theme based on localStorage
    toggleTheme: () => {
        const isDark = document.body.classList.contains('dark-theme');
        document.body.classList.remove(isDark ? 'dark-theme' : 'light-theme');
        document.body.classList.add(isDark ? 'light-theme' : 'dark-theme');
        localStorage.setItem('theme', isDark ? 'light-theme' : 'dark-theme');
        UI.$('theme-toggle-icon').innerHTML = isDark 
            ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>';
    },
    
    // Updates the settings modal inputs with AppState data
    updateSettingsModal: () => {
        const settings = AppState.calculationSettings;
        if (settings) {
            UI.$('setting-irModifier').value = settings.irModifier;
            UI.$('setting-qcPoints').value = settings.qcPoints;
            UI.$('setting-i3qaPoints').value = settings.i3qaPoints;
            UI.$('setting-rv1Points').value = settings.rv1Points;
            UI.$('setting-rv2Points').value = settings.rv2Points;
            // NOTE: rv1ComboPoints is used in calculation but not exposed to UI for simplicity
        }
    },
    
    // Updates the GSD select dropdown
    updateGsdSelect: () => {
        const select = UI.$('gsd-value-select');
        if (select) {
            select.value = AppState.lastUsedGsdValue;
        }
    },
    
    // Updates the quick summary boxes
    updateQuickSummary: (statsArray) => {
        if (statsArray.length === 0) {
            UI.$('summary-total-payout').textContent = '$0.00';
            UI.$('summary-total-techs').textContent = '0';
            UI.$('summary-avg-quality').textContent = '0.00%';
            UI.$('summary-top-earner').textContent = 'N/A';
            return;
        }

        const totalPayout = statsArray.reduce((sum, tech) => sum + (tech.payout || 0), 0);
        const totalQuality = statsArray.reduce((sum, tech) => sum + (tech.quality || 0), 0);
        const avgQuality = totalQuality / statsArray.length;
        
        const topEarner = [...statsArray].sort((a, b) => (b.payout || 0) - (a.payout || 0))[0];

        UI.$('summary-total-payout').textContent = `$${totalPayout.toFixed(2)}`;
        UI.$('summary-total-techs').textContent = statsArray.length;
        UI.$('summary-avg-quality').textContent = `${(avgQuality * 100).toFixed(2)}%`;
        UI.$('summary-top-earner').textContent = `${getName(topEarner.id)} ($${topEarner.payout.toFixed(2)})`;
    },
};

// --- SETTINGS LOGIC (for Modal) ---
const Settings = {
    handleSave: async (e) => {
        e.preventDefault();
        const button = UI.$('settings-save-btn');
        // UI.showLoading(button); // Use if loading indicator is needed

        const form = UI.$('calculation-settings-form');
        const formData = new FormData(form);
        const newSettings = { key: 'default' };

        // Read values from form (must convert to float)
        newSettings.irModifier = parseFloat(formData.get('irModifier')) || CONSTANTS.DEFAULT_CALC_SETTINGS.irModifier;
        newSettings.qcPoints = parseFloat(formData.get('qcPoints')) || CONSTANTS.DEFAULT_CALC_SETTINGS.qcPoints;
        newSettings.i3qaPoints = parseFloat(formData.get('i3qaPoints')) || CONSTANTS.DEFAULT_CALC_SETTINGS.i3qaPoints;
        newSettings.rv1Points = parseFloat(formData.get('rv1Points')) || CONSTANTS.DEFAULT_CALC_SETTINGS.rv1Points;
        newSettings.rv2Points = parseFloat(formData.get('rv2Points')) || CONSTANTS.DEFAULT_CALC_SETTINGS.rv2Points;
        newSettings.rv1ComboPoints = CONSTANTS.DEFAULT_CALC_SETTINGS.rv1ComboPoints; // Keep default for combo

        try {
            await DB.put('calculationSettings', newSettings);
            AppState.calculationSettings = newSettings;
            UI.closeModal('settings-modal');
            UI.showNotification("Calculation settings saved successfully.");
            
            // Recalculate if data is present
            if (Object.keys(AppState.currentTechStats).length > 0) {
                Calculator.recalculateAndDisplay();
            }

        } catch (error) {
            console.error("Error saving settings:", error);
            UI.showNotification("Error saving settings.", true);
        } finally {
            // UI.hideLoading(button);
        }
    },
    
    handleReset: () => {
        if (confirm("Are you sure you want to reset ALL calculation constants to their hardcoded defaults?")) {
            AppState.calculationSettings = CONSTANTS.DEFAULT_CALC_SETTINGS;
            DB.put('calculationSettings', CONSTANTS.DEFAULT_CALC_SETTINGS);
            UI.updateSettingsModal();
            UI.showNotification("Calculation settings reset to default.");
            
            if (Object.keys(AppState.currentTechStats).length > 0) {
                Calculator.recalculateAndDisplay();
            }
        }
    }
};

// --- PERIOD TRACKING LOGIC ---
const Period = {
    saveCurrentPeriod: async () => {
        if (Object.keys(AppState.currentTechStats).length === 0) {
            UI.showNotification("Cannot save. Please load a data file first.", true);
            return;
        }
        
        const periodName = prompt("Enter a name for this period (e.g., 'October 2025'):");
        if (!periodName) return;

        const periodData = {
            timestamp: Date.now(),
            name: periodName,
            stats: AppState.currentTechStats,
            settings: AppState.calculationSettings,
            gsd: AppState.lastUsedGsdValue,
            date: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        
        try {
            await DB.put('history', periodData);
            UI.showNotification(`Period '${periodName}' saved successfully!`);
            UI.updateHistoryList();
        } catch (error) {
            console.error("Error saving period:", error);
            UI.showNotification("Error saving period data.", true);
        }
    },
    
    updateHistoryList: async () => {
        const historyListContainer = UI.$('history-list-container');
        const emptyMessage = UI.$('history-empty-message');
        
        try {
            const history = await DB.getAll('history');
            history.sort((a, b) => b.timestamp - a.timestamp); // Sort newest first

            if (history.length === 0) {
                emptyMessage.classList.remove('hidden');
                historyListContainer.innerHTML = '';
                return;
            }
            emptyMessage.classList.add('hidden');
            
            let html = '';
            history.forEach(item => {
                const date = dayjs(item.timestamp).format('MMM D, YYYY');
                const statCount = Object.keys(item.stats).length;
                html += `
                    <div class="flex justify-between items-center p-3 bg-brand-700 rounded-md">
                        <div class="flex flex-col">
                            <span class="font-semibold text-text-color">${item.name}</span>
                            <span class="text-sm text-brand-400">${date} (${statCount} Techs)</span>
                        </div>
                        <button data-id="${item.timestamp}" class="history-view-btn px-3 py-1 text-sm bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">
                            View
                        </button>
                    </div>
                `;
            });
            historyListContainer.innerHTML = html;
            
            // Attach view listeners
            document.querySelectorAll('.history-view-btn').forEach(btn => {
                btn.addEventListener('click', () => Period.loadPeriod(parseInt(btn.dataset.id)));
            });

        } catch (error) {
            console.error("Error loading history:", error);
        }
    },
    
    loadPeriod: async (timestamp) => {
        try {
            const periodData = await DB.get('history', timestamp);
            if (periodData) {
                // Temporarily override current state with historical data
                // NOTE: This does not affect calculation settings, only the stats displayed
                AppState.currentTechStats = periodData.stats;
                AppState.lastUsedGsdValue = periodData.gsd;
                
                UI.updateGsdSelect();
                UI.displayResults(AppState.currentTechStats, `Historical Data: ${periodData.name}`);
                UI.closeModal('history-modal');
                UI.showNotification(`Loaded historical period: ${periodData.name}`);
            }
        } catch (error) {
            UI.showNotification("Failed to load historical data.", true);
        }
    },
    
    clearHistory: async () => {
        if (confirm("WARNING: This will permanently delete ALL saved calculation periods. Are you sure?")) {
            await DB.clear('history');
            UI.updateHistoryList();
            UI.showNotification("Calculation history cleared.");
        }
    }
};


// --- CORE LOGIC (CALCULATOR) ---
const Calculator = {
    // Main function to calculate stats
    calculateTechStats: (projectData) => {
        // Use dynamic settings from AppState
        const settings = AppState.calculationSettings;
        
        // --- IMPORTANT: This is a MOCK calculation for demonstration ---
        // In a real app, you would parse CSV and apply the formula using 'settings'.
        
        const stats = {};
        
        const mockTechs = [
            { id: "7249SS", team: "Team 123", quality: 0.98, tasks: 120, payout: 30.00, ir: 5, qc: 10, i3qa: 10, rv1: 5, rv2: 0 },
            { id: "7092RN", team: "Team 63", quality: 0.95, tasks: 90, payout: 22.50, ir: 10, qc: 5, i3qa: 20, rv1: 0, rv2: 1 },
            { id: "4297RQ", team: "Team 57", quality: 0.92, tasks: 150, payout: 35.00, ir: 2, qc: 20, i3qa: 5, rv1: 10, rv2: 2 },
            { id: "7088MA", team: "Team 57", quality: 0.99, tasks: 80, payout: 28.00, ir: 1, qc: 5, i3qa: 5, rv1: 5, rv2: 0 },
        ];
        
        mockTechs.forEach(tech => {
            // Recalculate mock payout based on new settings (simple example):
            let basePayout = (tech.tasks / 100) * settings.irModifier;
            let qualityBonus = (tech.quality > 0.95 ? 10 : 0);
            let finalPayout = basePayout + qualityBonus;
            
            stats[tech.id] = { 
                ...tech, 
                payout: finalPayout, 
                quality: tech.quality, // Keep existing quality
                team: tech.team, // Keep existing team
                fullName: getName(tech.id) // Pre-calculate full name
            };
        });

        AppState.currentTechStats = stats;
        return stats;
    },
    
    recalculateAndDisplay: () => {
        // Simulate re-running calculation (using the existing stats data)
        const techStats = Calculator.calculateTechStats({}); 
        UI.displayResults(techStats, "Calculations updated with new settings.");
    },

    // Function to handle file drop and trigger calculation
    handleDroppedFiles: (files) => {
        const file = files[0];
        if (!file || !file.name.endsWith('.csv')) {
            UI.showNotification("Please drop a valid .csv file.", true);
            return;
        }

        UI.showNotification(`Processing file: ${file.name}...`);

        const reader = new FileReader();
        reader.onload = (e) => {
            // const csvData = e.target.result;
            // In a real app, this is where you'd parse CSV
            
            const techStats = Calculator.calculateTechStats({}); // Use mock data
            UI.displayResults(techStats);
            UI.$('save-period-btn').disabled = false;
            UI.showNotification("Data loaded and calculations complete! Payouts recalculated with current settings.");
        };

        reader.onerror = () => {
            UI.showNotification("Error reading file.", true);
        };

        reader.readAsText(file);
    }
};

// --- UI RENDERING (displayResults, updateLeaderboard, etc.) ---

UI.displayResults = (techStats, notification = "New data loaded.") => {
    // 1. Show results section
    UI.$('drop-zone-area').classList.add('hidden');
    UI.$('results-area').classList.remove('hidden');
    
    // 2. Recalculate/Update Leaderboard
    AppState.currentTechStats = techStats; // Ensure AppState is updated
    UI.updateLeaderboard(techStats);
    
    // 3. Update Summary
    UI.updateQuickSummary(Object.values(techStats));
    
    // 4. Show Notification if provided
    if (notification) UI.showNotification(notification);
};

UI.updateLeaderboard = (techStats) => {
    const tableBody = UI.$('leaderboard-body');
    if (!tableBody) return;

    // 1. Convert stats object to an array for sorting
    let statsArray = Object.values(techStats);
    
    // 2. Apply Search/Filter
    const filter = AppState.currentFilter.toLowerCase();
    if (filter) {
        statsArray = statsArray.filter(tech => 
            tech.id.toLowerCase().includes(filter) ||
            (tech.team && tech.team.toLowerCase().includes(filter)) ||
            (getName(tech.id).toLowerCase().includes(filter))
        );
    }


    // 3. Sort the array based on AppState.currentSort
    const { column, direction } = AppState.currentSort;
    statsArray.sort((a, b) => {
        const valA = a[column] || 0;
        const valB = b[column] || 0;

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    // 4. Generate HTML
    let html = '';
    statsArray.forEach((tech, index) => {
        const rank = index + 1;
        const fullName = getName(tech.id);
        const qualityColor = tech.quality > 0.95 ? 'text-status-green' : tech.quality > 0.9 ? 'text-status-orange' : 'text-status-red';
        
        html += `
            <tr class="hover:bg-brand-700 transition-colors duration-150">
                <td class="px-4 py-2 text-center text-lg font-semibold">${rank}</td>
                <td class="px-4 py-2">
                    <div class="flex flex-col">
                        <span class="font-semibold">${fullName}</span>
                        <span class="text-sm text-brand-400">${tech.id}</span>
                    </div>
                </td>
                <td class="px-4 py-2 text-center text-sm">${tech.team || 'N/A'}</td>
                <td class="px-4 py-2 text-center font-mono ${qualityColor}">${(tech.quality * 100).toFixed(2)}%</td>
                <td class="px-4 py-2 text-center">${tech.tasks || 0}</td>
                <td class="px-4 py-2 text-center font-bold text-status-green">$${(tech.payout || 0).toFixed(2)}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = html || `<tr><td colspan="6" class="text-center py-6 text-text-muted-color">No matching technicians found.</td></tr>`;
};


// --- EVENT LISTENERS & INITIALIZATION ---

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize IndexedDB and load settings
    await DB.loadSettings();

    // 2. Initialize UI theme
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    document.body.classList.add(savedTheme);
    UI.listen('theme-toggle-btn', 'click', UI.toggleTheme);
    UI.toggleTheme(); // Call once to set the correct icon based on savedTheme state

    // 3. Initialize Drop Zone listener
    UI.listen('file-upload-btn', 'change', (e) => {
        Calculator.handleDroppedFiles(e.target.files);
    });

    // Main Drop Zone drag/drop listeners
    UI.listen('drop-zone', 'dragover', e => { e.preventDefault(); e.target.closest('#drop-zone').classList.add('bg-brand-700'); });
    UI.listen('drop-zone', 'dragleave', e => e.target.closest('#drop-zone').classList.remove('bg-brand-700'));
    UI.listen('drop-zone', 'drop', e => { 
        e.preventDefault(); 
        e.target.closest('#drop-zone').classList.remove('bg-brand-700'); 
        Calculator.handleDroppedFiles(e.dataTransfer.files); 
    });
    
    // 4. Menu & Modal Listeners
    UI.listen('menu-settings-btn', 'click', () => {
        UI.closeModal('main-menu-dropdown');
        UI.updateSettingsModal();
        UI.openModal('settings-modal');
    });
    
    UI.listen('menu-history-btn', 'click', () => {
        UI.closeModal('main-menu-dropdown');
        Period.updateHistoryList();
        UI.openModal('history-modal');
    });
    
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        // Add listener to backdrop to close modal
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                modal.classList.add('hidden');
            }
        });
    });

    // 5. Settings Modal Form Listeners
    UI.listen('calculation-settings-form', 'submit', Settings.handleSave);
    UI.listen('settings-reset-btn', 'click', Settings.handleReset);
    
    // 6. History Listeners
    UI.listen('save-period-btn', 'click', Period.saveCurrentPeriod);
    UI.listen('history-clear-all-btn', 'click', Period.clearHistory);

    // 7. Leaderboard Controls Listeners
    UI.listen('leaderboard-search', 'input', (e) => {
        AppState.currentFilter = e.target.value;
        UI.updateLeaderboard(AppState.currentTechStats);
    });
    
    UI.listen('gsd-value-select', 'change', (e) => {
        AppState.lastUsedGsdValue = e.target.value;
        // Save to DB and recalculate (if GSD affects calculation)
        DB.put('settings', { key: 'lastUsedGsdValue', value: AppState.lastUsedGsdValue });
        
        // Assuming GSD change requires recalculation
        if (Object.keys(AppState.currentTechStats).length > 0) {
            Calculator.recalculateAndDisplay(); 
            UI.showNotification(`GSD value set to ${AppState.lastUsedGsdValue}. Recalculating...`);
        } else {
            UI.showNotification(`GSD value set to ${AppState.lastUsedGsdValue}.`);
        }
    });

    // 8. Leaderboard Sort Listeners
    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.currentTarget.dataset.column;
            
            let newDirection = 'desc';
            if (AppState.currentSort.column === column) {
                newDirection = AppState.currentSort.direction === 'desc' ? 'asc' : 'desc';
            }
            
            AppState.currentSort = { column, direction: newDirection };
            UI.updateLeaderboard(AppState.currentTechStats);
        });
    });

    // 9. Initial Mock Load for testing features if no data is present
    if (Object.keys(AppState.currentTechStats).length === 0) {
        Calculator.calculateTechStats({});
        UI.displayResults(AppState.currentTechStats, null); // Load mock data, suppress notification
        UI.$('save-period-btn').disabled = true; // Disable save until actual file loaded
    }
});
