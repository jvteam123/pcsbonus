// --- Tech Name Database ---
const techNameDatabase = {
    "7092RN": "Romiel Nuevo", "4297RQ": "Ralph B. Quinto", "4488MD": "Maricris de Gracia", "7037HP": "Henry Patoc", "7086LP": "Lemuel Presbitero", "7096AV": "Ale-June Villacencio", "1173RR": "Reuel Andrew Roque", "7089RR": "Ravin Louis Relador", "7087LA": "Lorie Mae Año", "7102JD": "John Kenneth Dueñas", "7088MA": "Michelle Marie D. Alburo", "4489EA": "Everly Apurado", "7170WS": "Warren Salogaol", "7091HA": "Harvy Acevedo", "7103RE": "Roberto Ebarita Jr.", "7040JP": "Jose Poro III", "7179KB": "King Nino Barba", "7043RP": "Randolf Potot", "7159MC": "Ma. Angelica Cagigas", "7099SS": "Sallemie Solon", "7093MG": "MIchael Allien Getigan", "7161KA": "Kent C. Agraviador", "7171AL": "Alfe Marie G. Latras", "7166CR": "Carl Anthony Riñen", "7168JS": "Jennifer S. Solayao", "7311JT": "Joseph M. Tabada", "7174MC": "Michael A. Catadman", "7158JD": "Junie S. Dadol", "7173ES": "Earl Ryan Y. Santiago", "7090JA": "John Russian Arches", "7167AD": "Almer B. Dela Cruz", "7175JP": "Jumbo S. Paanod Jr.", "7165GR": "Ghee Ram N. Racaza", "7178MD": "Mary Mae Dagwayan", "7084LQ": "Lowel K. Quilinguen", "7176CC": "Clarfen D. Campilanan", "7044AM": "Anna Mae Mencho A. Macaraya", "7095KA": "Kirby L. Adobas", "7249SS": "Serg Sembrano", "7042NB": "Nikki Carlos Booc", "4474HS": "Soroño, Humfrey Dave Viaña", "7236LE": "Lorens Christopher Ebrado", "4283JP": "Janriel Paanod", "4492CP": "Christian Pontiano", "4426KV": "Kenneth Lester Villajos", "7234CS": "Christian Suico", "4421AT": "Anthony Talledo", "4472JS": "Sison, John Vincent Estopito", "7313MB": "Mark Kg Barong", "7237ML": "Michael Bryan Lambo", "4475JT": "Joana May Taboada", "7036RB": "Rodrigo Basnillo", "4481JV": "Jasmin Villocino", "7240HH": "Hyacint Hortelano", "4478JV": "Jervin Villocino", "7316NT": "Niel Fred Tabar", "7039NO": "Nazareno Oppus", "7310DR": "Dan Niel Rapas", "7245SC": "Sergio Cuizon Jr.", "7231NR": "Negel Roloma", "7239EO": "Eric Jason Omega", "4476JR": "Rico, Jefrey Labajo", "7244AA": "Arjohn Abapo", "4477PT": "Pacifico Tejam", "7246AJ": "Arvin Jasmin", "7247JA": "Jayson Aliser", "7251DJ": "Jan Dominic Dela Cruz", "7251JD": "Jan Dominic Dela Cruz", "7241DM": "Dejie Monterde", "7248AA": "Allan Paul Alforque", "7233JP": "Jeobenail Ii Parame", "4435AC": "Allan Codina", "4135RC": "Cantiveros, Ritche Bayo", "7242FV": "Francis Anthony Villarin", "7314VP": "Vince April Pitogo", "7315CR": "Christiane Repunte", "2274JD": "Jacky Dimla", "7243JC": "John Cañete"
};

// --- General Knowledge Base ---
const knowledgeBase = [
    // --- Custom Personal Questions ---
    {
        keywords: ["developer", "renzku", "creator", "who made"],
        answer: "Renzku is the developer of this application."
    },
    {
        keywords: ["jeave", "babaydor", "who is jeave"],
        answer: "jeave is babaydor"
    },
    // --- General & How-To ---
    {
        keywords: ["how", "use", "work", "guide", "setup", "start", "tutorial"],
        answer: "You can use the guided setup for a walkthrough. Generally: 1. Add your project data. 2. Enter a bonus multiplier. 3. Click 'Calculate'.",
        action: { label: "Start Guided Setup", type: "open_modal", value: "guided-setup-modal" }
    },
    {
        keywords: ["teams", "manage"],
        answer: "You can add/edit teams and their members in the Team Manager. Would you like to open it?",
        action: { label: "Open Team Manager", type: "open_modal", value: "manage-teams-modal" }
    },
    {
        keywords: ["settings", "advance", "customize", "edit logic"],
        answer: "You can customize all calculation logic, including points and bonus tiers, in the Advance Settings. Would you like to open it?",
        action: { label: "Open Advance Settings", type: "open_modal", value: "advance-settings-modal" }
    },

    // --- Core Calculation Logic ---
    {
        keywords: ["calculation", "logic", "source", "documentation", "formula"],
        answer: "The calculator's logic is based on the 'Phili IC Fixpoints App Documentation v1.0.' You can customize all formulas in 'Advance Settings'."
    },
    {
        keywords: ["quality", "quality formula", "calculated"],
        answer: "Fix Quality is calculated with the formula: (Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) * 100."
    },
    {
        keywords: ["refix", "what is a refix"],
        answer: "A 'refix' is an error that counts against a tech's quality. By default, it's triggered by the label 'i' in columns like 'rv1_label' and 'rv2_label'. You can see the full list of triggers in Advance Settings.",
        action: { label: "Open Advance Settings", type: "open_modal", value: "advance-settings-modal" }
    },
    {
        keywords: ["warning", "what is a warning"],
        answer: "A 'warning' also counts against a tech's quality. By default, it's triggered by labels like 'b', 'c', 'd', 'e', 'f', 'g', or 'i' in the warning columns ('r1_warn', etc.). You can see the full list in Advance Settings.",
        action: { label: "Open Advance Settings", type: "open_modal", value: "advance-settings-modal" }
    },
    {
        keywords: ["qc penalty", "transfer"],
        answer: "A 'QC Penalty' occurs if a QC tech misses an error. The points for that QC task are then subtracted from the QC tech and transferred to the i3qa tech who found the error."
    },
    
    // --- Data & Features ---
    {
        keywords: ["data", "save", "store", "local", "where"],
        answer: "All project data, teams, and settings are stored locally in your browser's IndexedDB. Nothing is uploaded to a server."
    },
    {
        keywords: ["clear data", "delete all", "reset"],
        answer: "You can delete all projects and reset all settings to their defaults from the main menu (Menu > Clear All Data). This action cannot be undone."
    },
    {
        keywords: ["drag", "drop", "files", "shapefile", "shp", "dbf"],
        answer: "You can drag and drop shapefile sets (both the .shp and .dbf files) into the data area to automatically parse them."
    },
    {
        keywords: ["calculate all", "calculate specific", "combine", "merge", "multiple"],
        answer: "The 'Calculate All / Specific' button lets you combine multiple saved projects into one calculation. Check the 'Calculate Specific Projects' box to select which projects to include."
    },
    {
        keywords: ["theme", "dark", "light", "color"],
        answer: "You can switch between light and dark themes in the main menu (Menu > Toggle Theme)."
    },
    {
        keywords: ["bug", "report", "contact", "error", "problem"],
        answer: "If you find a bug, click 'Report a Bug' in the menu to open a link to Microsoft Teams."
    }
];
