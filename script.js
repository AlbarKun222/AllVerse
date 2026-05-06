// --- BASE DE DONNÉES AVEC POIDS ÉQUILIBRÉS ---
const cardsDatabase = [
    { id: "goku", name: "Goku", rarity: "Légendaire", basePower: 2000, banner: "Anime", weight: 3 },
    { id: "naruto", name: "Naruto", rarity: "Épique", basePower: 1200, banner: "Anime", weight: 12 },
    { id: "luffy", name: "Luffy", rarity: "Épique", basePower: 1250, banner: "Anime", weight: 12 },
    { id: "saitama", name: "Saitama", rarity: "Universelle", basePower: 5000, banner: "Anime", weight: 0.2 },
    { id: "tanjiro", name: "Tanjiro", rarity: "Rare", basePower: 600, banner: "Anime", weight: 35 },
    { id: "deku", name: "Deku", rarity: "Rare", basePower: 550, banner: "Anime", weight: 35 },
    { id: "kurapika", name: "Kurapika", rarity: "Atypique", basePower: 300, banner: "Anime", weight: 80 },
    { id: "sakura", name: "Sakura", rarity: "Basique", basePower: 100, banner: "Anime", weight: 150 },
    { id: "gojo", name: "Gojo Satoru", rarity: "Mythique", basePower: 3500, banner: "Anime", weight: 0.8 },
    { id: "eren", name: "Eren Jäger", rarity: "Légendaire", basePower: 1900, banner: "Anime", weight: 3 },

    { id: "mario", name: "Mario", rarity: "Rare", basePower: 500, banner: "Jeux", weight: 35 },
    { id: "link", name: "Link", rarity: "Légendaire", basePower: 1800, banner: "Jeux", weight: 3 },
    { id: "kratos", name: "Kratos", rarity: "Mythique", basePower: 3800, banner: "Jeux", weight: 0.8 },
    { id: "master_chief", name: "Master Chief", rarity: "Épique", basePower: 1300, banner: "Jeux", weight: 12 },
    { id: "pikachu", name: "Pikachu", rarity: "Rare", basePower: 450, banner: "Jeux", weight: 35 },
    { id: "steve", name: "Steve", rarity: "Basique", basePower: 120, banner: "Jeux", weight: 150 },
    { id: "sans", name: "Sans", rarity: "Atypique", basePower: 1, banner: "Jeux", weight: 80 },
    { id: "arthas", name: "Lich King", rarity: "Mythique", basePower: 3600, banner: "Jeux", weight: 0.8 },
    { id: "lara_croft", name: "Lara Croft", rarity: "Épique", basePower: 1100, banner: "Jeux", weight: 12 },
    { id: "kirby", name: "Kirby", rarity: "Universelle", basePower: 4500, banner: "Jeux", weight: 0.2 }
];

const rarityScores = {
    "basique": 1,
    "atypique": 2, // Augmenté pour être au-dessus de Basique
    "rare": 3,
    "épique": 4,
    "légendaire": 5,
    "mythique": 6,
    "universelle": 7 // Score le plus haut
};

// --- VARIABLES D'ÉTAT ---
let userGems = 1000;
let userCristaux = 0;
let userDeck = {};
let totalPower = 0;
let currentSort = 'rarity';
let isGroupedByBanner = false;

let chestClicks = 0;
let currentX11Results = [];
let maxTierForThisDraw = 1;

// --- LOGIQUE DE TIRAGE ---
function getRandomCard(bannerName) {
    const available = cardsDatabase.filter(c => c.banner === bannerName);
    const totalWeight = available.reduce((sum, card) => sum + card.weight, 0);
    let random = Math.random() * totalWeight;
    for (const card of available) {
        if (random < card.weight) return card;
        random -= card.weight;
    }
    return available[0];
}

// --- NAVIGATION ---
function switchView(viewId) {
    document.querySelectorAll('.game-view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
    if (viewId === 'view-deck') renderDeck();
}

function updateUI() {
    totalPower = Object.values(userDeck).reduce((sum, card) => sum + card.currentPower, 0);
    document.getElementById('gems-count').innerText = userGems;
    document.getElementById('cristaux-count').innerText = userCristaux;
    document.getElementById('total-power').innerText = totalPower;
}

// --- GACHA CORE ---
function processDraw(bannerName, count) {
    const cost = (count === 11) ? 100 : 10;
    if (userGems < cost) return alert("Pas assez de Gems ! 💎");

    userGems -= cost;
    updateUI();

    document.getElementById('gacha-popup').style.display = 'block';
    document.getElementById('btn-popup-close').style.display = 'none';
    document.getElementById('popup-results-container').innerHTML = "";
    document.getElementById('single-result-info').innerHTML = ""; // Reset correctif[cite: 2]

    if (count === 1) {
        document.getElementById('roulette-zone').style.display = "block";
        document.getElementById('chest-zone').style.display = "none";
        runRoulette(bannerName);
    } else {
        document.getElementById('roulette-zone').style.display = "none";
        document.getElementById('chest-zone').style.display = "block";
        prepareX11(bannerName);
    }
}

function runRoulette(bannerName) {
    const track = document.getElementById('roulette-track');
    const winner = getRandomCard(bannerName);
    track.style.transition = "none";
    track.style.transform = "translateX(0px)";
    track.innerHTML = "";

    for (let i = 0; i < 40; i++) {
        const card = (i === 30) ? winner : cardsDatabase[Math.floor(Math.random() * cardsDatabase.length)];
        const el = document.createElement('div');
        el.className = `card card-roulette rarity-${card.rarity.toLowerCase()}`;
        el.innerHTML = `<h4>${card.name}</h4><small>${card.rarity}</small>`;
        track.appendChild(el);
    }

    setTimeout(() => {
        const wrapperWidth = document.querySelector('.roulette-wrapper').offsetWidth;
        const targetX = (wrapperWidth / 2) - (30 * 200) - 100;
        track.style.transition = "transform 4s cubic-bezier(0.1, 0, 0.1, 1)";
        track.style.transform = `translateX(${targetX}px)`;
    }, 50);

    setTimeout(() => {
        applyCardResult(winner);
        document.getElementById('single-result-info').innerHTML = `OBTENU : <b>${winner.name}</b>`;
        document.getElementById('btn-popup-close').style.display = "inline-block";
    }, 4100);
}

function prepareX11(bannerName) {
    chestClicks = 0;
    currentX11Results = [];
    maxTierForThisDraw = 1;
    document.getElementById('chest-sprite').src = "img/close_chest_T1.png";
    document.getElementById('chest-instructions').innerText = "Cliquez 3 fois !";

    for (let i = 0; i < 11; i++) {
        const card = getRandomCard(bannerName);
        currentX11Results.push(card);
        const score = rarityScores[card.rarity.toLowerCase()] || 1;
        // Nouvelle logique de seuil de coffre[cite: 2]
        if (score >= 4) maxTierForThisDraw = 4;
        else if (score === 3 && maxTierForThisDraw < 4) maxTierForThisDraw = 3;
        else if (score === 2 && maxTierForThisDraw < 3) maxTierForThisDraw = 2;
    }
}

function handleChestClick() {
    if (chestClicks >= 3) return;
    chestClicks++;
    const sprite = document.getElementById('chest-sprite');
    sprite.classList.remove('shake');
    void sprite.offsetWidth;
    sprite.classList.add('shake');

    if (chestClicks < 3) {
        sprite.src = `img/close_chest_T${Math.floor(Math.random() * 4) + 1}.png`;
    } else {
        sprite.src = `img/open_chest_T${maxTierForThisDraw}.png`;
        createParticles(maxTierForThisDraw);
        setTimeout(showX11Results, 600);
    }
}

function createParticles(tier) {
    const container = document.getElementById('chest-container');
    const colors = { 1: "#00ff00", 2: "#00d2ff", 3: "#ffd700", 4: "#ff0000" };
    const color = colors[tier] || "#ffffff";
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.color = color;
        const angle = Math.random() * Math.PI * 2;
        const velocity = 100 + Math.random() * 250;
        p.style.setProperty('--dx', Math.cos(angle) * velocity + "px");
        p.style.setProperty('--dy', Math.sin(angle) * velocity + "px");
        p.style.left = "50%"; p.style.top = "50%";
        container.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

function showX11Results() {
    const container = document.getElementById('popup-results-container');
    container.innerHTML = "";
    currentX11Results.forEach((card, i) => {
        applyCardResult(card);
        const score = rarityScores[card.rarity.toLowerCase()] || 1;
        const shakeClass = (score >= 4) ? "card-rare-shake" : "";
        const el = document.createElement('div');
        el.className = `card card-mini rarity-${card.rarity.toLowerCase()} card-anim ${shakeClass}`;
        el.style.animationDelay = `${i * 0.05}s`;
        el.innerHTML = `<h4>${card.name}</h4><div style="color:gold; font-size:0.6rem;">${"⭐".repeat(userDeck[card.id].stars) || "NEW"}</div><p>Pwr: ${card.basePower}</p>`;
        container.appendChild(el);
    });
    document.getElementById('btn-popup-close').style.display = "inline-block";
    updateUI();
}

// --- DECK & TRI ---
function toggleDisplayMode() {
    isGroupedByBanner = !isGroupedByBanner;
    const btn = document.getElementById('btn-switch-mode');
    btn.innerText = isGroupedByBanner ? "MODE : BANNIÈRES" : "MODE : VRAC";
    btn.style.background = isGroupedByBanner ? "#e94560" : "#4ecca3";
    renderDeck();
}

function setSort(type) {
    currentSort = type;
    renderDeck();
}

function renderDeck() {
    const container = document.getElementById('deck-container');
    if (!container) return;
    container.innerHTML = "";
    let deckArray = Object.values(userDeck);

    deckArray.sort((a, b) => {
        if (currentSort === 'power') {
            return b.currentPower - a.currentPower;
        } 
        if (currentSort === 'stars') {
            return b.stars - a.stars;
        }
        if (currentSort === 'rarity') {
            // On récupère le score ou 0 si la rareté est inconnue
            const scoreA = rarityScores[a.rarity.toLowerCase()] || 0;
            const scoreB = rarityScores[b.rarity.toLowerCase()] || 0;
            
            // Si les raretés sont identiques, on trie par puissance à l'intérieur de la rareté
            if (scoreB === scoreA) {
                return b.currentPower - a.currentPower;
            }
            return scoreB - scoreA;
        }
        return 0;
    });

    if (!isGroupedByBanner) {
        deckArray.forEach(card => container.appendChild(createCardHTML(card)));
    } else {
        ["Anime", "Jeux"].forEach(banner => {
            const filtered = deckArray.filter(c => c.banner === banner);
            if (filtered.length > 0) {
                const h2 = document.createElement('h2');
                h2.style.width = "100%"; h2.style.color = "gold"; h2.style.borderBottom = "2px solid #e94560";
                h2.innerText = banner.toUpperCase();
                container.appendChild(h2);
                filtered.forEach(card => container.appendChild(createCardHTML(card)));
            }
        });
    }
}

function createCardHTML(card) {
    const div = document.createElement('div');
    div.className = `card rarity-${card.rarity.toLowerCase()}`;
    div.innerHTML = `<h4>${card.name}</h4><div style="color:gold">${"⭐".repeat(card.stars)}</div><p>Pwr: ${card.currentPower}</p><small>${card.rarity}</small>`;
    return div;
}

function applyCardResult(template) {
    if (userDeck[template.id]) {
        let card = userDeck[template.id];
        if (card.stars < 5) {
            card.stars++;
            card.currentPower = Math.floor(template.basePower * (1 + (card.stars * 0.25)));
        } else {
            userCristaux += 50;
        }
    } else {
        userDeck[template.id] = { ...template, stars: 0, currentPower: template.basePower };
    }
}

// --- INIT ---
function createDollar() {
    const container = document.getElementById('money-rain-container');
    if (!container) return;
    const dollar = document.createElement('img');
    dollar.src = 'dollar.png';
    dollar.className = 'dollar-fx';
    dollar.style.left = Math.random() * 95 + "vw";
    const duration = 3 + Math.random() * 4;
    dollar.style.animationDuration = duration + "s";
    container.appendChild(dollar);
    setTimeout(() => dollar.remove(), duration * 1000);
}

function moneyLoop() {
    createDollar();
    setTimeout(moneyLoop, Math.max(100, 2000 - (totalPower / 5)));
}

window.onload = () => { switchView('view-hub'); updateUI(); moneyLoop(); };
function closeGachaPopup() { document.getElementById('gacha-popup').style.display = 'none'; }