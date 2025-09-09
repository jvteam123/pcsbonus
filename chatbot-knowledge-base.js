// --- Tech Name Database ---
// This database is populated with the list you provided.
const techNameDatabase = {
    "7092RN": "Romiel Nuevo",
    "4297RQ": "Ralph B. Quinto",
    "4488MD": "Maricris de Gracia",
    "7037HP": "Henry Patoc",
    "7086LP": "Lemuel Presbitero",
    "7096AV": "Ale-June Villacencio",
    "1173RR": "Reuel Andrew Roque",
    "7089RR": "Ravin Louis Relador",
    "7087LA": "Lorie Mae Año",
    "7102JD": "John Kenneth Dueñas",
    "7088MA": "Michelle Marie D. Alburo",
    "4489EA": "Everly Apurado",
    "7170WS": "Warren Salogaol",
    "7091HA": "Harvy Acevedo",
    "7103RE": "Roberto Ebarita Jr.",
    "7040JP": "Jose Poro III",
    "7179KB": "King Nino Barba",
    "7043RP": "Randolf Potot",
    "7159MC": "Ma. Angelica Cagigas",
    "7099SS": "Sallemie Solon",
    "7093MG": "MIchael Allien Getigan",
    "7161KA": "Kent C. Agraviador",
    "7171AL": "Alfe Marie G. Latras",
    "7166CR": "Carl Anthony Riñen",
    "7168JS": "Jennifer S. Solayao",
    "7311JT": "Joseph M. Tabada",
    "7174MC": "Michael A. Catadman",
    "7158JD": "Junie S. Dadol",
    "7173ES": "Earl Ryan Y. Santiago",
    "7090JA": "John Russian Arches",
    "7167AD": "Almer B. Dela Cruz",
    "7175JP": "Jumbo S. Paanod Jr.",
    "7165GR": "Ghee Ram N. Racaza",
    "7178MD": "Mary Mae Dagwayan",
    "7084LQ": "Lowel K. Quilinguen",
    "7176CC": "Clarfen D. Campilanan",
    "7044AM": "Anna Mae Mencho A. Macaraya",
    "7095KA": "Kirby L. Adobas",
    "7249SS": "Serg Sembrano",
    "7042NB": "Nikki Carlos Booc",
    "4474HS": "Soroño, Humfrey Dave Viaña",
    "7236LE": "Lorens Christopher Ebrado",
    "4283JP": "Janriel Paanod",
    "4492CP": "Christian Pontiano",
    "4426KV": "Kenneth Lester Villajos",
    "7234CS": "Christian Suico",
    "4421AT": "Anthony Talledo",
    "4472JS": "Sison, John Vincent Estopito",
    "7313MB": "Mark Kg Barong",
    "7237ML": "Michael Bryan Lambo",
    "4475JT": "Joana May Taboada",
    "7036RB": "Rodrigo Basnillo",
    "4481JV": "Jasmin Villocino",
    "7240HH": "Hyacint Hortelano",
    "4478JV": "Jervin Villocino",
    "7316NT": "Niel Fred Tabar",
    "7039NO": "Nazareno Oppus",
    "7310DR": "Dan Niel Rapas",
    "7245SC": "Sergio Cuizon Jr.",
    "7231NR": "Negel Roloma",
    "7239EO": "Eric Jason Omega",
    "4476JR": "Rico, Jefrey Labajo",
    "7244AA": "Arjohn Abapo",
    "4477PT": "Pacifico Tejam",
    "7246AJ": "Arvin Jasmin",
    "7247JA": "Jayson Aliser",
    "7251DJ": "Jan Dominic Dela Cruz",
    "7251JD": "Jan Dominic Dela Cruz",
    "7241DM": "Dejie Monterde",
    "7248AA": "Allan Paul Alforque",
    "7233JP": "Jeobenail Ii Parame",
    "4435AC": "Allan Codina",
    "4135RC": "Cantiveros, Ritche Bayo",
    "7242FV": "Francis Anthony Villarin",
    "7314VP": "Vince April Pitogo",
    "7315CR": "Christiane Repunte",
    "2274JD": "Jacky Dimla",
    "7243JC": "John Cañete"
};


// --- General Knowledge Base ---
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
    {
        keywords: ["developer", "renzku", "creator", "who made"],
        answer: "Renzku is the developer of this application."
    },
    {
        keywords: ["jeave", "babaydor", "who is jeave"],
        answer: "jeave is babaydor"
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
