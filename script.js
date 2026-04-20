const cardsDatabase = [
    { id: "goku", name: "Goku", rarity: "Légendaire", type: "Personnage", basePower: 2000, banner: "Anime" },
    { id: "mario", name: "Mario", rarity: "Rare", type: "Personnage", basePower: 500, banner: "Jeux" },
    { id: "link", name: "Link", rarity: "Légendaire", type: "Personnage", basePower: 1800, banner: "Jeux" },
    { id: "naruto", name: "Naruto", rarity: "Épique", type: "Personnage", basePower: 1200, banner: "Anime" }
];

let userGems = 1000;
let userCristaux = 0;
let userDeck = {};
let totalPower = 0;

// Gestion du coffre
let chestClicks = 0;
let currentX11Results = [];
let maxRarityInDraw = "basique";

function switchView(viewId) {
    document.querySelectorAll('.game-view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
    if (viewId === 'view-deck') renderDeck();
}

function processDraw(bannerName, count) {
    const cost = (count === 11) ? 100 : 10;
    if (userGems < cost) return alert("Pas assez de Gems !");

    userGems -= cost;
    updateUI();

    document.getElementById('gacha-popup').style.display = 'block';
    document.getElementById('btn-popup-close').style.display = 'none';
    document.getElementById('popup-results-container').innerHTML = "";
    document.getElementById('single-result-info').innerText = "";

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

// --- LOGIQUE ROULETTE (x1) ---
function runRoulette(bannerName) {
    const track = document.getElementById('roulette-track');
    const available = cardsDatabase.filter(c => c.banner === bannerName);
    const winner = available[Math.floor(Math.random() * available.length)];
    
    track.style.transition = "none";
    track.style.transform = "translateX(0px)";
    track.innerHTML = "";

    const winnerIndex = 30;
    for (let i = 0; i < 40; i++) {
        const card = (i === winnerIndex) ? winner : cardsDatabase[Math.floor(Math.random() * cardsDatabase.length)];
        const el = document.createElement('div');
        el.className = `card card-roulette rarity-${card.rarity.toLowerCase()}`;
        el.innerHTML = `<h4>${card.name}</h4><small>${card.rarity}</small>`;
        track.appendChild(el);
    }

    setTimeout(() => {
        const targetX = (document.querySelector('.roulette-wrapper').offsetWidth / 2) - (winnerIndex * 200) - 100;
        track.style.transition = "transform 4s cubic-bezier(0.1, 0, 0.1, 1)";
        track.style.transform = `translateX(${targetX}px)`;
    }, 50);

    setTimeout(() => {
        applyCardResult(winner);
        document.getElementById('single-result-info').innerText = "Obtenu : " + winner.name;
        document.getElementById('btn-popup-close').style.display = "block";
    }, 4100);
}

// --- LOGIQUE COFFRE (x11) ---
function prepareX11(bannerName) {
    chestClicks = 0;
    currentX11Results = [];
    maxRarityInDraw = "basique";
    document.getElementById('chest-sprite').src = "img/close_chest_T1.png";
    document.getElementById('chest-instructions').innerText = "Cliquez 3 fois !";

    const available = cardsDatabase.filter(c => c.banner === bannerName);
    for (let i = 0; i < 11; i++) {
        const card = available[Math.floor(Math.random() * available.length)];
        currentX11Results.push(card);
        checkTier(card.rarity);
    }
}

function checkTier(rarity) {
    const rarityMap = { "basique":1, "atypique":1, "rare":2, "magique":2, "épique":3, "légendaire":3, "mythique":4, "universelle":4 };
    if (rarityMap[rarity.toLowerCase()] > rarityMap[maxRarityInDraw.toLowerCase()]) maxRarityInDraw = rarity;
}

function handleChestClick() {
    if (chestClicks >= 3) return;
    chestClicks++;
    
    const sprite = document.getElementById('chest-sprite');
    sprite.classList.remove('shake');
    void sprite.offsetWidth;
    sprite.classList.add('shake');

    if (chestClicks < 3) {
        sprite.src = `img/close_chest_T${Math.floor(Math.random()*4)+1}.png`;
    } else {
        const tier = getTier(maxRarityInDraw);
        sprite.src = `img/open_chest_T${tier}.png`;
        setTimeout(showX11Results, 600);
    }
}

function getTier(rarity) {
    rarity = rarity.toLowerCase();
    if (["basique", "atypique"].includes(rarity)) return 1;
    if (["rare", "magique"].includes(rarity)) return 2;
    if (["épique", "légendaire"].includes(rarity)) return 3;
    return 4;
}

function showX11Results() {
    const container = document.getElementById('popup-results-container');
    container.innerHTML = ""; // Sécurité pour vider le container

    currentX11Results.forEach((card, i) => {
        applyCardResult(card); // On enregistre dans le deck
        
        const el = document.createElement('div');
        // On ajoute la classe "card-mini" ici
        el.className = `card card-mini rarity-${card.rarity.toLowerCase()} card-anim`;
        
        // Délai d'apparition progressif
        el.style.animationDelay = `${i * 0.05}s`; 
        
        // Contenu simplifié pour les petites cartes
        el.innerHTML = `
            <h4>${card.name}</h4>
            <div style="color:gold; font-size:0.6rem;">${"⭐".repeat(userDeck[card.id].stars)}</div>
            <p style="font-weight:bold;">Pwr: ${card.basePower}</p>
            <small style="font-size:0.5rem;">${card.rarity}</small>
        `;
        
        container.appendChild(el);
    });
    
    document.getElementById('btn-popup-close').style.display = "inline-block";
    updateUI();
}

// --- SYSTEME CORE ---
function applyCardResult(template) {
    if (userDeck[template.id]) {
        let card = userDeck[template.id];
        if (card.stars < 5) {
            card.stars++;
            card.currentPower = Math.floor(template.basePower * (1 + (card.stars * 0.25)));
        } else { userCristaux += 50; }
    } else {
        userDeck[template.id] = { ...template, stars: 0, currentPower: template.basePower };
    }
    updateUI();
}

function updateUI() {
    totalPower = Object.values(userDeck).reduce((sum, c) => sum + c.currentPower, 0);
    document.getElementById('gems-count').innerText = userGems;
    document.getElementById('cristaux-count').innerText = userCristaux;
    document.getElementById('total-power').innerText = totalPower;
}

function renderDeck() {
    const container = document.getElementById('deck-container');
    container.innerHTML = "";
    Object.values(userDeck).forEach(card => {
        container.innerHTML += `<div class="card rarity-${card.rarity.toLowerCase()}"><h4>${card.name}</h4><p>${"⭐".repeat(card.stars)}</p><p>Pwr: ${card.currentPower}</p></div>`;
    });
}

// Pluie de monnaie
function createDollar() {
    const container = document.getElementById('money-rain-container');
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
    let delay = Math.max(100, 2000 - (totalPower / 5));
    createDollar();
    setTimeout(moneyLoop, delay);
}

window.onload = () => { switchView('view-hub'); updateUI(); moneyLoop(); };
function closeGachaPopup() { document.getElementById('gacha-popup').style.display = 'none'; }