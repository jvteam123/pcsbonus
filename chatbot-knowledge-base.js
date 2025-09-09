const knowledgeBase = [
    // --- General & Basic Questions ---
    {
        keywords: ["what", "this", "purpose", "about"],
        answer: "This is the PCS Bonus Calculator V2, a tool to calculate bonuses for tech projects based on various performance metrics."
    },
    {
        keywords: ["how", "use", "work", "guide", "setup", "start"],
        answer: "You can use the guided setup from the menu to get started. Generally, you need to add your teams, paste your project data, set a bonus multiplier, and then click 'Calculate'."
    },
    {
        keywords: ["hello", "hi", "hey"],
        answer: "Hello! I'm the PCS Bonus Calculator assistant. How can I help you?"
    },
    {
        keywords: ["bye", "goodbye"],
        answer: "Goodbye! Feel free to ask if you have more questions."
    },

    // --- Calculation Logic & Formulas ---
    {
        keywords: ["calculation", "logic", "source", "documentation", "formula"],
        answer: "The calculator's logic is based on the 'Phili IC Fixpoints App Documentation v1.0.' All formulas for points, quality, and bonuses are derived from this document."
    },
    {
        keywords: ["quality", "quality formula"],
        answer: "Fix Quality is calculated with the formula: (Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) * 100."
    },
    {
        keywords: ["bonus tier", "bonus earned", "quality modifier"],
        answer: "The 'Bonus Earned %' is determined by the Fix Quality. For example, a quality of 100% gives a 1.20 bonus modifier (120%), 95% gives 1.00 (100%), and 80% gives 0.30 (30%). You can see all tiers in Menu > Advance Settings."
    },
    {
        keywords: ["payout formula", "final payout"],
        answer: "The final payout is calculated as: (Total Points * Bonus Multiplier * Quality Modifier)."
    },

    // --- Points & Tasks ---
    {
        keywords: ["points", "qc"],
        answer: "By default, a QC task is worth 0.125 points. This can be changed in the 'Advance Settings' menu."
    },
    {
        keywords: ["points", "i3qa"],
        answer: "By default, an i3QA task is worth approximately 0.083 points. This can be changed in the 'Advance Settings' menu."
    },
    {
        keywords: ["points", "rv1"],
        answer: "By default, an RV1 task is worth 0.2 points, and an RV1 Combo task is worth 0.25 points. This can be changed in the 'Advance Settings' menu."
    },
    {
        keywords: ["points", "rv2"],
        answer: "By default, an RV2 task is worth 0.5 points. This can be changed in the 'Advance Settings' menu."
    },
    {
        keywords: ["ir project", "ir modifier"],
        answer: "An IR (Infrared) project uses a special modifier. By default, the point value for fix tasks in an IR project is multiplied by 1.5. You can mark a project as an IR project using the checkbox when you save it."
    },
    {
        keywords: ["gsd", "3in", "4in", "6in", "9in", "category points"],
        answer: "GSD (Ground Sample Distance) affects the points awarded for primary fix tasks. For example, a Category 3 task is worth 7.44 points for 3in, 4in, and 6in GSD, but only 2.78 points for 9in GSD. You select the GSD when saving a project."
    },

    // --- Data & Features ---
    {
        keywords: ["data", "save", "store", "local"],
        answer: "The calculator uses your browser's IndexedDB to store all project data, team settings, and other configurations. All data is stored locally on your computer and is not sent to any server."
    },
    {
        keywords: ["clear data", "delete all", "reset"],
        answer: "The 'Clear All Data' button in the main menu will delete the entire local database, including all saved projects and custom settings. This action cannot be undone."
    },
    {
        keywords: ["drag", "drop", "files", "shapefile", "shp", "dbf"],
        answer: "You can drag and drop shapefile sets (.shp and .dbf files) into the data area. The tool will automatically parse them into the required text format."
    },
    {
        keywords: ["calculate all", "calculate specific", "combine projects", "merge"],
        answer: "The 'Calculate All / Specific' button allows you to combine the data from multiple saved projects into a single calculation. You can either calculate all saved projects or check the 'Calculate Specific Projects' box to select multiple projects from the list."
    },
    {
        keywords: ["teams", "manage"],
        answer: "You can manage your teams from the main menu (Menu > Manage Teams). There you can add new teams, add or remove tech IDs, and save your changes."
    },
    {
        keywords: ["theme", "dark mode", "light mode", "color"],
        answer: "You can switch between light and dark themes by clicking 'Toggle Theme' in the main menu. Your preference is saved locally."
    },

    // --- Disclaimers & Info ---
    {
        keywords: ["disclaimer", "accuracy", "guarantee"],
        answer: "This tool is intended for personal and informational purposes only. The results generated are estimates and should be used as a general guideline. These figures are not a guarantee of actual compensation."
    },
    {
        keywords: ["bug", "report", "contact", "error"],
        answer: "If you find a bug, you can report it by clicking 'Report a Bug' in the main menu, which will open a link to Microsoft Teams."
    }
];
