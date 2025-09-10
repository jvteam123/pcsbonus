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

// --- General Knowledge Base ---
const knowledgeBase = [
    { id: "developer", keywords: ["developer", "creator", "renzku", "who made"], answer: "Renzku is the developer of this application." },
    { id: "serge", keywords: ["serge", "taga leyte", "mamuhiay", "7249ss"], answer: "Serge is taga Leyte mamuhiay ug manok!" },
    { id: "jeave", keywords: ["jeave", "babaydor"], answer: "Jeave is babaydor." },
    { id: "setup", keywords: ["setup", "how to use", "guide", "tutorial", "start"], answer: "To use the app: 1) Add project data 2) Enter bonus multiplier 3) Click 'Calculate'. Or follow Menu > Guided Setup." },
    { id: "teams", keywords: ["teams", "manage members"], answer: "Manage teams and members in Menu > Manage Teams." },
    { id: "settings", keywords: ["settings", "advanced settings", "customize formula"], answer: "All calculation logic, points, and bonus tiers can be customized in Menu > Advanced Settings." },
    { id: "summary", keywords: ["summary", "top performers", "leader"], answer: "Quick Summary shows top performers in points, tasks, quality, and refixes." },
    { id: "quality", keywords: ["quality", "calculate quality", "quality formula"], answer: "Fix Quality = (Fix Tasks / (Fix Tasks + Refix Tasks + Warnings)) × 100." },
    { id: "refix", keywords: ["refix", "refix error"], answer: "A 'refix' is an error that reduces a tech's quality." },
    { id: "warning", keywords: ["warning", "what is warning"], answer: "A 'warning' counts against quality. Triggered by labels b–g or i in warning columns." },
    { id: "qcpenalty", keywords: ["qc penalty", "qc error"], answer: "QC Penalty = when a QC tech misses an error. Points are transferred to the i3qa tech." },
    { id: "data", keywords: ["data", "storage", "where is data saved"], answer: "All data is stored locally in your browser’s IndexedDB. Nothing is uploaded." },
    { id: "clear", keywords: ["clear data", "reset"], answer: "Clear all projects & reset settings in Menu > Clear All Data. ⚠️ This cannot be undone." },
    { id: "shapefile", keywords: ["shapefile", "shp", "dbf", "drag drop files"], answer: "Drag and drop .shp + .dbf files into the data area to parse them automatically." },
    { id: "calculate", keywords: ["calculate all", "merge projects", "combine projects"], answer: "Use 'Calculate All / Specific' to merge multiple projects." },
    { id: "theme", keywords: ["theme", "dark mode", "light mode"], answer: "Switch between light and dark themes in Menu > Toggle Theme." },
    { id: "bug", keywords: ["bug", "report problem", "contact support"], answer: "Report bugs via Menu > Report a Bug (opens Microsoft Teams)." }
];

// --- Setup Fuzzy Search (requires Fuse.js) ---
const fuse = new Fuse(knowledgeBase, {
    keys: ["keywords"],
    threshold: 0.4, // 0 = strict, 1 = very loose
});

// --- Find Answer ---
function findAnswer(question) {
    const results = fuse.search(question);

    if (results.length > 0) {
        return results[0].item.answer;
    } else {
        return "🤔 I’m not sure about that. Try rephrasing, or check Menu > Help.";
    }
}

// --- Example Integration for Chat UI ---
function handleUserInput(inputText) {
    const userMsg = inputText.trim();
    if (!userMsg) return;

    const botReply = findAnswer(userMsg);

    // Hook this into your UI
    if (typeof addMessage === "function") {
        addMessage("user", userMsg);
        addMessage("bot", botReply);
    } else {
        console.log("User:", userMsg);
        console.log("Bot:", botReply);
    }
}

// Example usage in console:
console.log(findAnswer("how do i calculate qualiti?")); // fuzzy match works
