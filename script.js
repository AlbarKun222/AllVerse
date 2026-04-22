// --- BASE DE DONNÉES DES CARTES ---
const cardsDatabase = [
    // --- BANNIÈRE ANIME (10) ---
    { id: "goku", name: "Goku", rarity: "Légendaire", type: "Personnage", basePower: 2000, banner: "Anime" },
    { id: "naruto", name: "Naruto", rarity: "Épique", type: "Personnage", basePower: 1200, banner: "Anime" },
    { id: "luffy", name: "Luffy", rarity: "Épique", type: "Personnage", basePower: 1250, banner: "Anime" },
    { id: "saitama", name: "Saitama", rarity: "Universelle", type: "Personnage", basePower: 5000, banner: "Anime" }, // T4 - Arc-en-ciel
    { id: "tanjiro", name: "Tanjiro", rarity: "Rare", type: "Personnage", basePower: 600, banner: "Anime" },
    { id: "deku", name: "Deku", rarity: "Rare", type: "Personnage", basePower: 550, banner: "Anime" },
    { id: "kurapika", name: "Kurapika", rarity: "Atypique", type: "Personnage", basePower: 300, banner: "Anime" },
    { id: "sakura", name: "Sakura", rarity: "Basique", type: "Personnage", basePower: 100, banner: "Anime" },
    { id: "gojo", name: "Gojo Satoru", rarity: "Mythique", type: "Personnage", basePower: 3500, banner: "Anime" }, // T4 - Rose/Violet
    { id: "eren", name: "Eren Jäger", rarity: "Légendaire", type: "Personnage", basePower: 1900, banner: "Anime" },

    // --- BANNIÈRE JEUX (10) ---
    { id: "mario", name: "Mario", rarity: "Rare", type: "Personnage", basePower: 500, banner: "Jeux" },
    { id: "link", name: "Link", rarity: "Légendaire", type: "Personnage", basePower: 1800, banner: "Jeux" },
    { id: "kratos", name: "Kratos", rarity: "Mythique", type: "Personnage", basePower: 3800, banner: "Jeux" }, // T4
    { id: "master_chief", name: "Master Chief", rarity: "Épique", type: "Personnage", basePower: 1300, banner: "Jeux" },
    { id: "pikachu", name: "Pikachu", rarity: "Rare", type: "Personnage", basePower: 450, banner: "Jeux" },
    { id: "steve", name: "Steve", rarity: "Basique", type: "Personnage", basePower: 120, banner: "Jeux" },
    { id: "sans", name: "Sans", rarity: "Atypique", type: "Personnage", basePower: 1, banner: "Jeux" }, // Clin d'oeil 1 PV
    { id: "arthas", name: "Lich King", rarity: "Mythique", type: "Personnage", basePower: 3600, banner: "Jeux" }, // T4
    { id: "lara_croft", name: "Lara Croft", rarity: "Épique", type: "Personnage", basePower: 1100, banner: "Jeux" },
    { id: "kirby", name: "Kirby", rarity: "Universelle", type: "Personnage", basePower: 4500, banner: "Jeux" } // T4
];

// --- SYSTÈME DE RARETÉ (SCORES POUR LES TIERS) ---
const rarityScores = {
    "basique": 1, "atypique": 1,
    "rare": 2, "magique": 2,
    "épique": 3, "légendaire": 3,
    "mythique": 4, "universelle": 4
};

// --- VARIABLES D'ÉTAT ---
let userGems = 1000;
let userCristaux = 0;
let userDeck = {};
let totalPower = 0;

// Variables pour le x11
let chestClicks = 0;
let currentX11Results = [];
let maxTierForThisDraw = 1;

// --- NAVIGATION ---
function switchView(viewId) {
    document.querySelectorAll('.game-view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
    
    // C'est cette ligne qui remplit le deck au moment où on clique sur le bouton
    if (viewId === 'view-deck') {
        renderDeck();
    }
}

// --- LOGIQUE GÉNÉRALE DE TIRAGE ---
function processDraw(bannerName, count) {
    const cost = (count === 11) ? 100 : 10;
    if (userGems < cost) return alert("Pas assez de Gems ! 💎");

    userGems -= cost;
    updateUI();

    // Reset Popup
    const popup = document.getElementById('gacha-popup');
    popup.style.display = 'block';
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
    const cardTotalWidth = 200; // 180px + 10px margin * 2

    for (let i = 0; i < 40; i++) {
        const card = (i === winnerIndex) ? winner : cardsDatabase[Math.floor(Math.random() * cardsDatabase.length)];
        const el = document.createElement('div');
        el.className = `card card-roulette rarity-${card.rarity.toLowerCase()}`;
        el.innerHTML = `<h4>${card.name}</h4><small>${card.rarity}</small>`;
        track.appendChild(el);
    }

    setTimeout(() => {
        const wrapperWidth = document.querySelector('.roulette-wrapper').offsetWidth;
        const targetX = (wrapperWidth / 2) - (winnerIndex * cardTotalWidth) - (cardTotalWidth / 2);
        track.style.transition = "transform 4s cubic-bezier(0.1, 0, 0.1, 1)";
        track.style.transform = `translateX(${Math.floor(targetX)}px)`;
    }, 50);

    setTimeout(() => {
        applyCardResult(winner);
        document.getElementById('single-result-info').innerHTML = `OBTENU : <b>${winner.name}</b>`;
        document.getElementById('btn-popup-close').style.display = "inline-block";
    }, 4100);
}

// --- LOGIQUE COFFRE (x11) ---
function prepareX11(bannerName) {
    chestClicks = 0;
    currentX11Results = [];
    maxTierForThisDraw = 1; // On reset le tier au plus bas (T1)

    // Reset visuel du coffre
    document.getElementById('chest-sprite').src = "img/close_chest_T1.png";
    document.getElementById('chest-instructions').innerText = "Cliquez 3 fois pour ouvrir !";

    const available = cardsDatabase.filter(c => c.banner === bannerName);
    
    for (let i = 0; i < 11; i++) {
        const card = available[Math.floor(Math.random() * available.length)];
        currentX11Results.push(card);
        
        // Calcul du Tier max du tirage
        const score = rarityScores[card.rarity.toLowerCase()] || 1;
        if (score > maxTierForThisDraw) {
            maxTierForThisDraw = score;
        }
    }
}

function handleChestClick() {
    if (chestClicks >= 3) return;
    
    chestClicks++;
    const sprite = document.getElementById('chest-sprite');
    
    // Animation de tremblement
    sprite.classList.remove('shake');
    void sprite.offsetWidth; // Reset animation
    sprite.classList.add('shake');

    if (chestClicks < 3) {
        // Clic 1 et 2 : Random pour le suspense
        const randomFakeTier = Math.floor(Math.random() * 4) + 1;
        sprite.src = `img/close_chest_T${randomFakeTier}.png`;
    } else {
        // Clic 3 : On affiche le vrai Tier final
        sprite.src = `img/open_chest_T${maxTierForThisDraw}.png`;
        document.getElementById('chest-instructions').innerText = "INCROYABLE !";
        setTimeout(showX11Results, 600);
    }
}

function showX11Results() {
    const container = document.getElementById('popup-results-container');
    container.innerHTML = "";

    currentX11Results.forEach((card, i) => {
        applyCardResult(card);
        
        const el = document.createElement('div');
        
        // Détection de la rareté pour le tremblement (Mythique ou Universelle)
        const score = rarityScores[card.rarity.toLowerCase()] || 1;
        const shakeClass = (score >= 4) ? "card-rare-shake" : "";
        
        // On ajoute la classe de rareté, la classe mini, l'animation d'apparition et le tremblement si besoin
        el.className = `card card-mini rarity-${card.rarity.toLowerCase()} card-anim ${shakeClass}`;
        el.style.animationDelay = `${i * 0.05}s`;
        
        const stars = userDeck[card.id].stars;
        
        el.innerHTML = `
            <h4>${card.name}</h4>
            <div style="color:gold; font-size:0.6rem;">${"⭐".repeat(stars) || "NEW"}</div>
            <p style="font-weight:bold;">Pwr: ${card.basePower}</p>
        `;
        
        container.appendChild(el);
    });
    
    document.getElementById('btn-popup-close').style.display = "inline-block";
    updateUI();
}

// --- CŒUR DU JEU (LOGIQUE & UI) ---
function applyCardResult(template) {
    if (userDeck[template.id]) {
        let card = userDeck[template.id];
        if (card.stars < 5) {
            card.stars++;
            card.currentPower = Math.floor(template.basePower * (1 + (card.stars * 0.25)));
        } else {
            userCristaux += 50; // Bonus doublon max
        }
    } else {
        userDeck[template.id] = { ...template, stars: 0, currentPower: template.basePower };
    }
}

function updateUI() {
    totalPower = Object.values(userDeck).reduce((sum, card) => sum + card.currentPower, 0);
    document.getElementById('gems-count').innerText = userGems;
    document.getElementById('cristaux-count').innerText = userCristaux;
    document.getElementById('total-power').innerText = totalPower;
}

let currentSort = 'rarity'; // Tri par défaut à l'ouverture

function setSort(type) {
    currentSort = type;
    renderDeck(); // Relance le rendu avec le nouveau tri
}

function renderDeck() {
    const container = document.getElementById('deck-container');
    if (!container) return; // Sécurité si l'élément n'existe pas
    
    container.innerHTML = "";
    
    // On convertit l'objet en tableau pour pouvoir utiliser .sort()
    let deckArray = Object.values(userDeck);

    // --- LOGIQUE DE TRI ---
    deckArray.sort((a, b) => {
        if (currentSort === 'power') {
            return b.currentPower - a.currentPower; // Plus gros Power en haut
        } else if (currentSort === 'stars') {
            return b.stars - a.stars; // Plus d'étoiles en haut
        } else if (currentSort === 'rarity') {
            // On compare les scores numériques définis dans rarityScores
            const scoreA = rarityScores[a.rarity.toLowerCase()] || 0;
            const scoreB = rarityScores[b.rarity.toLowerCase()] || 0;
            return scoreB - scoreA; // Plus rare en haut
        }
        return 0;
    });

    // --- AFFICHAGE ---
    deckArray.forEach(card => {
        container.innerHTML += `
            <div class="card rarity-${card.rarity.toLowerCase()}">
                <h4>${card.name}</h4>
                <div style="color:gold">${"⭐".repeat(card.stars)}</div>
                <p>Pwr: ${card.currentPower}</p>
                <small>${card.rarity}</small>
            </div>
        `;
    });
}

// --- PLUIE DE DOLLARS ---
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
    let delay = Math.max(100, 2000 - (totalPower / 5));
    createDollar();
    setTimeout(moneyLoop, delay);
}

// --- INIT ---
window.onload = () => {
    switchView('view-hub');
    updateUI();
    moneyLoop();
};

function closeGachaPopup() {
    document.getElementById('gacha-popup').style.display = 'none';
}