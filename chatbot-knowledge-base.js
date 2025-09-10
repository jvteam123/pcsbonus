// --- Tech Name Database ---
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

// --- Helper: Normalize Input ---
function normalizeText(text) {
    return text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

// --- General Knowledge Base ---
const knowledgeBase = [
    {
        id: "developer",
        keywords: ["developer", "creator", "renzku", "who made"],
        answer: "Renzku is the developer of this application."
    },
    {
        id: "serge",
        keywords: ["serge", "taga leyte", "mamuhiay", "7249ss"],
        answer: "Serge is taga Leyte mamuhiay ug manok!"
    },
    {
        id: "jeave",
        keywords: ["jeave", "babaydor", "who is jeave"],
        answer: "Jeave is babaydor."
    },
    {
        id: "setup",
        keywords: ["how", "use", "work", "guide", "setup", "start", "tutorial"],
        answer: "To use the app: 1) Add project data 2) Enter bonus multiplier 3) Click 'Calculate'. Or follow Menu > Guided Setup."
    },
    {
        id: "teams",
        keywords: ["teams", "manage", "members"],
        answer: "Manage teams and members in Menu > Manage Teams."
    },
    {
        id: "settings",
        keywords: ["settings", "advanced", "customize", "logic", "formula"],
        answer: "All calculation logic, points, and bonus tiers can be customized in Menu > Advanced Settings."
    },
    {
        id: "summary",
        keywords: ["quick summary", "summary card", "top performers", "leader"],
        answer: "Quick Summary shows top performers in points, tasks, quality, and refixes. Ask 'who has the most points?' for details."
    },
    {
        id: "quality",
        keywords: ["quality", "formula", "calculated", "compute quality"],
        answer: "Fix Quality = (Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) × 100."
    },
    {
        id: "refix",
        keywords: ["refix", "what is refix", "refix error"],
        answer: "A 'refix' is an error that reduces a tech's quality. By default triggered by label 'i' in rv1_label/rv2_label."
    },
    {
        id: "warning",
        keywords: ["warning", "what is warning"],
        answer: "A 'warning' counts against quality. Triggered by labels b–g or i in warning columns (e.g. r1_warn)."
    },
    {
        id: "qcpenalty",
        keywords: ["qc penalty", "transfer", "qc error"],
        answer: "QC Penalty = when a QC tech misses an error. Points are subtracted and given to the i3qa tech."
    },
    {
        id: "data",
        keywords: ["data", "save", "store", "local", "where"],
        answer: "All project data, teams, and settings are stored locally in your browser's IndexedDB. Nothing is uploaded."
    },
    {
        id: "clear",
        keywords: ["clear data", "delete all", "reset"],
        answer: "Clear all projects & reset settings in Menu > Clear All Data. ⚠️ This cannot be undone."
    },
    {
        id: "shapefile",
        keywords: ["drag", "drop", "files", "shapefile", "shp", "dbf"],
        answer: "Drag and drop .shp + .dbf files into the data area to parse them automatically."
    },
    {
        id: "calculate",
        keywords: ["calculate all", "calculate specific", "combine", "merge", "multiple"],
        answer: "Use 'Calculate All / Specific' to merge multiple projects. Check 'Calculate Specific Projects' to choose which ones."
    },
    {
        id: "theme",
        keywords: ["theme", "dark", "light", "color"],
        answer: "Switch between light and dark themes in Menu > Toggle Theme."
    },
    {
        id: "bug",
        keywords: ["bug", "report", "contact", "error", "problem"],
        answer: "Report bugs via Menu > Report a Bug (opens Microsoft Teams)."
    }
];

// --- Search Function ---
function findAnswer(question) {
    const q = normalizeText(question);
    let bestMatch = null;
    let highestScore = 0;

    for (const entry of knowledgeBase) {
        let score = 0;
        for (const keyword of entry.keywords) {
            if (q.includes(keyword)) score++;
        }
        if (score > highestScore) {
            highestScore = score;
            bestMatch = entry;
        }
    }

    if (bestMatch) {
        return bestMatch.answer;
    } else {
        return "🤔 I’m not sure about that. Try rephrasing, or check Menu > Help.";
    }
}

// Example usage (for testing in console)
console.log(findAnswer("how do i calculate quality?"));
