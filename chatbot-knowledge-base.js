const knowledgeBase = [
    // --- General & Basic Questions ---
    {
        keywords: ["what", "this", "purpose", "about", "site"],
        answer: "This is the PCS Bonus Calculator V2, a tool to calculate bonuses for tech projects based on various performance metrics."
    },
    {
        keywords: ["how", "use", "work", "guide", "setup", "start", "tutorial"],
        answer: "You can use the guided setup from the menu to get started. Generally: 1. Add your project data. 2. Enter a bonus multiplier. 3. Click 'Calculate' to see the results."
    },
    {
        keywords: ["hello", "hi", "hey"],
        answer: "Hello! I'm the PCS Bonus Calculator assistant. How can I help you?"
    },
    {
        keywords: ["bye", "goodbye", "thanks", "thank you"],
        answer: "You're welcome! Feel free to ask if you have more questions."
    },

    // --- Core Calculation Logic ---
    {
        keywords: ["calculation", "logic", "source", "documentation", "formula"],
        answer: "The calculator's logic is based on the 'Phili IC Fixpoints App Documentation v1.0.' All formulas can be customized in the 'Advance Settings' menu."
    },
    {
        keywords: ["quality", "quality formula", "calculated"],
        answer: "Fix Quality is calculated with the formula: (Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) * 100."
    },
    {
        keywords: ["bonus tier", "bonus earned", "quality modifier"],
        answer: "The 'Bonus Earned %' is a modifier based on Fix Quality. For example, 100% quality gives a 1.20 bonus modifier, while 95% gives 1.00. You can view and edit all tiers in Menu > Advance Settings."
    },
    {
        keywords: ["payout", "final payout", "php"],
        answer: "The final payout is calculated as: (Total Points * Bonus Multiplier * Quality Modifier)."
    },
    {
        keywords: ["refix", "what is a refix"],
        answer: "A 'refix' is counted against a tech's quality. By default, it's triggered when labels like 'i' are found in columns such as 'rv1_label', 'rv2_label', etc. You can customize these triggers in Advance Settings."
    },
    {
        keywords: ["warning", "what is a warning"],
        answer: "A 'warning' is counted against a tech's quality. By default, it's triggered by labels like 'b', 'c', 'd', 'e', 'f', 'g', or 'i' in the warning columns ('r1_warn', etc.). This can be customized in Advance Settings."
    },
    {
        keywords: ["qc penalty", "transfer"],
        answer: "A 'QC Penalty' is triggered if a QC tech misses something (e.g., labels 'm' or 'e' in 'i3qa_label'). When this happens, the points from the QC tasks are subtracted from the QC techs and transferred to the i3qa tech."
    },

    // --- Points & Tasks ---
    {
        keywords: ["points", "qc"],
        answer: "By default, a QC task is worth 0.125 points. This can be changed in 'Advance Settings'."
    },
    {
        keywords: ["points", "i3qa"],
        answer: "By default, an i3QA task is worth approximately 0.083 points. This can be changed in 'Advance Settings'."
    },
    {
        keywords: ["points", "rv1"],
        answer: "By default, an RV1 task is worth 0.2 points. If it's a 'Combo IR' task, it's worth 0.25 points. This can be changed in 'Advance Settings'."
    },
    {
        keywords: ["points", "rv2"],
        answer: "By default, an RV2 task is worth 0.5 points. This can be changed in 'Advance Settings'."
    },
    {
        keywords: ["ir project", "ir modifier", "infrared"],
        answer: "For an IR (Infrared) project, the point value for primary fix tasks is multiplied by a special modifier (default is 1.5). Mark a project as IR using the checkbox when you save it."
    },
    {
        keywords: ["gsd", "3in", "4in", "6in", "9in", "category", "categories"],
        answer: "GSD (Ground Sample Distance) affects points for primary fix tasks. For example, a Category 3 task is worth more for 3in/4in/6in GSD than for 9in GSD. You select the GSD when saving a project."
    },

    // --- Data & Features ---
    {
        keywords: ["data", "save", "store", "local", "where"],
        answer: "All project data, teams, and settings are stored locally in your browser's IndexedDB. Nothing is uploaded to a server."
    },
    {
        keywords: ["clear data", "delete all", "reset"],
        answer: "The 'Clear All Data' button in the menu deletes the entire local database, including all saved projects and settings. This cannot be undone."
    },
    {
        keywords: ["drag", "drop", "files", "shapefile", "shp", "dbf"],
        answer: "You can drag and drop shapefile sets (both the .shp and .dbf files) into the data area. The tool will parse them into the required text format."
    },
    {
        keywords: ["calculate all", "calculate specific", "combine", "merge", "multiple"],
        answer: "The 'Calculate All / Specific' button lets you combine multiple saved projects into one calculation. Check the 'Calculate Specific Projects' box to select which projects to include."
    },
    {
        keywords: ["edit", "change", "update", "saved project"],
        answer: "To edit a saved project, select it from the dropdown list and then click the pencil icon (Edit Selected Project). This will unlock the data fields for you to make changes."
    },
    {
        keywords: ["theme", "dark", "light", "color"],
        answer: "You can switch between light and dark themes in the main menu (Menu > Toggle Theme)."
    },

    // --- Disclaimers & Info ---
    {
        keywords: ["disclaimer", "accurate", "guarantee"],
        answer: "This tool is for informational purposes only. The results are estimates and not a guarantee of actual compensation."
    },
    {
        keywords: ["bug", "report", "contact", "error", "problem"],
        answer: "If you find a bug, click 'Report a Bug' in the menu to open a link to Microsoft Teams."
    }
];
