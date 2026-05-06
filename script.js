

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
// --- NAVIGATION (GARANTIT L'AFFICHAGE CORRECT) ---
function switchView(viewId) {
    // Cache absolument tout ce qui a la classe game-view
    const views = document.querySelectorAll('.game-view');
    views.forEach(v => v.style.display = 'none');

    // Affiche uniquement la cible
    const target = document.getElementById(viewId);
    if (target) {
        target.style.display = 'block';
    }
    
    if (viewId === 'view-deck') renderDeck();
}

// --- INITIALISATION (CORRIGE LES BOUTONS DAILY/HOURLY) ---
window.onload = () => { 
    switchView('view-hub'); // Force l'affichage de l'accueil uniquement
    updateUI(); 
    moneyLoop(); 
    
    // On lance le rafraîchissement des timers immédiatement
    updateTimers(); 
    setInterval(updateTimers, 1000); 
};

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
    document.getElementById('single-result-info').innerHTML = ""; 

    if (count === 1) {
        document.getElementById('roulette-zone').style.display = "block";
        document.getElementById('chest-zone').style.display = "none";
        runRoulette(bannerName);
    } else {
        document.getElementById('roulette-zone').style.display = "none";
        document.getElementById('chest-zone').style.display = "block";
        // On lance la préparation qui va analyser les raretés
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
    maxTierForThisDraw = 1; // Score par défaut (T1)

    // 1. Génération des 11 cartes et calcul de la rareté maximale
    for (let i = 0; i < 11; i++) {
        const card = getRandomCard(bannerName);
        currentX11Results.push(card);
        
        const score = rarityScores[card.rarity.toLowerCase()] || 1;

        // Détermination du Tier du coffre selon ton barème :
        // T1: Basique(1), Atypique(2) | T2: Rare(3) | T3: Epique(4), Légendaire(5) | T4: Mythique(6), Universelle(7)
        if (score >= 6) {
            if (maxTierForThisDraw < 4) maxTierForThisDraw = 4;
        } else if (score >= 4) {
            if (maxTierForThisDraw < 3) maxTierForThisDraw = 3;
        } else if (score === 3) {
            if (maxTierForThisDraw < 2) maxTierForThisDraw = 2;
        }
    }

    // 2. MISE À JOUR VISUELLE : On affiche le coffre fermé correspondant au meilleur résultat
    // Ainsi, si on a une Mythique, le coffre est déjà rouge (T4) avant même de cliquer.
    const sprite = document.getElementById('chest-sprite');
    sprite.src = `img/close_chest_T${maxTierForThisDraw}.png`; 
    
    document.getElementById('chest-instructions').innerText = "Cliquez 3 fois !";
}

function handleChestClick() {
    if (chestClicks >= 3) return;
    chestClicks++;
    const sprite = document.getElementById('chest-sprite');
    
    sprite.classList.remove('shake');
    void sprite.offsetWidth; // Force le redémarrage de l'animation
    sprite.classList.add('shake');

    if (chestClicks < 3) {
        // Optionnel : On garde le coffre fermé du bon Tier pendant qu'il tremble
        sprite.src = `img/close_chest_T${maxTierForThisDraw}.png`;
    } else {
        // Ouverture finale sur le bon Tier
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
        ["Anime", "Minecraft"].forEach(banner => {
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

const COOLDOWNS = {
    hourly: 60 * 60 * 1000,      // 1h
    daily: 24 * 60 * 60 * 1000   // 24h
};

function updateTimers() {
    const now = Date.now();
    
    // Traitement de la Bière (Hourly)
    const lastHourly = localStorage.getItem('last_claim_hourly') || 0;
    const timeHourly = (parseInt(lastHourly) + COOLDOWNS.hourly) - now;
    const boxHourly = document.getElementById('box-hourly');
    if (timeHourly > 0) {
        boxHourly.classList.add('disabled');
        document.getElementById('timer-hourly').innerText = formatTime(timeHourly);
    } else {
        boxHourly.classList.remove('disabled');
        document.getElementById('timer-hourly').innerText = "PRÊT !";
    }

    // Traitement du Baril (Daily)
    const lastDaily = localStorage.getItem('last_claim_daily') || 0;
    const timeDaily = (parseInt(lastDaily) + COOLDOWNS.daily) - now;
    const boxDaily = document.getElementById('box-daily');
    if (timeDaily > 0) {
        boxDaily.classList.add('disabled');
        document.getElementById('timer-daily').innerText = formatTime(timeDaily);
    } else {
        boxDaily.classList.remove('disabled');
        document.getElementById('timer-daily').innerText = "PRÊT !";
    }
}

function formatTime(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
}

// Appeler updateTimers chaque seconde
setInterval(updateTimers, 1000);

function claimReward(type) {
    console.log("Tentative de réclame : " + type);
    const lastClaim = localStorage.getItem('last_claim_' + type) || 0;
    const now = Date.now();
    
    if (now - lastClaim < COOLDOWNS[type]) return;

    currentWheelType = type;
    
    const popup = document.getElementById('gacha-popup');
    const resultsContainer = document.getElementById('popup-results-container');
    const singleInfo = document.getElementById('single-result-info');

    // 1. Affichage du popup
    popup.style.display = 'block';
    
    // 2. NETTOYAGE RADICAL : On cache les autres éléments internes
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (singleInfo) singleInfo.style.display = 'none';
    document.getElementById('roulette-zone').style.display = 'none';
    document.getElementById('chest-zone').style.display = 'none';
    document.getElementById('btn-popup-close').style.display = 'none';

    // 3. Gestion de la zone de la roue
    let wheelZone = document.getElementById('wheel-zone');
    if (!wheelZone) {
        wheelZone = document.createElement('div');
        wheelZone.id = 'wheel-zone';
        // On l'insère au tout début du contenu du popup pour être sûr qu'il soit vu
        document.querySelector('.popup-content').prepend(wheelZone);
    }
    
    // On force l'affichage de la zone
    wheelZone.style.display = 'block';
    wheelZone.style.visibility = 'visible';
    wheelZone.style.opacity = '1';

    wheelZone.innerHTML = `
        <h2 style="color:gold; text-align:center; margin:10px 0;">ROUE DE FORTUNE</h2>
        <div style="position:relative; width:300px; height:300px; margin: 0 auto;">
            <canvas id="wheelCanvas" width="300" height="300" style="background:transparent;"></canvas>
            <div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); font-size:30px; color:red; z-index:1000;">▼</div>
        </div>
        <div style="text-align:center; margin-top:15px;">
            <button id="btn-spin-wheel" class="pixel-button" onclick="spinWheel()">LANCER !</button>
        </div>
    `;
    
    // 4. On attend un petit délai pour le rendu du Canvas
    setTimeout(() => {
        initWheel();
        console.log("Roue dessinée avec succès");
    }, 150); 
}

function closeFortune() {
    document.getElementById('fortune-popup').style.display = 'none';
}

// Fonction appelée quand la roue finit de tourner
function finalizeReward() {
    localStorage.setItem('last_claim_' + currentRewardType, Date.now());
    updateTimers();
    // Ici on ajoutera les gemmes gagnées
}

const REWARDS_DATA = {
    hourly: [
        { label: "10 Gemmes", value: 10, type: "gems", color: "#4ecca3" },
        { label: "25 Gemmes", value: 25, type: "gems", color: "#45b6fe" },
        { label: "50 Gemmes", value: 50, type: "gems", color: "#a29bfe" },
        { label: "Tirage x1 Event", value: 1, type: "draw_event", color: "#e94560" },
        { label: "50 Crystaux", value: 50, type: "cristaux", color: "#fdcb6e" },
        { label: "100 Crystaux", value: 100, type: "cristaux", color: "#fab1a0" }
    ],
    daily: [
        { label: "50 Gemmes", value: 50, type: "gems", color: "#4ecca3" },
        { label: "100 Gemmes", value: 100, type: "gems", color: "#45b6fe" },
        { label: "Tirage x1 Perm", value: 1, type: "draw_perm", color: "#a29bfe" },
        { label: "Tirage x1 Event", value: 1, type: "draw_event", color: "#e94560" },
        { label: "Tirage x11 Event", value: 11, type: "draw_event", color: "#fdcb6e" },
        { label: "Tirage x11 Perm", value: 11, type: "draw_perm", color: "#fab1a0" }
    ]
};

let currentWheelType = "hourly";
let isSpinning = false;

function initWheel() {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rewards = REWARDS_DATA[currentWheelType]; // Sélectionne les bonnes récompenses
    const arc = (Math.PI * 2) / rewards.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rewards.forEach((reward, i) => {
        const angle = i * arc;
        
        // Dessin du quartier[cite: 1]
        ctx.beginPath();
        ctx.fillStyle = reward.color;
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 140, angle, angle + arc);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Texte de la récompense[cite: 1]
        ctx.save();
        ctx.translate(150, 150);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.fillText(reward.label, 130, 5);
        ctx.restore();
    });
}

function spinWheel() {
    // 1. Sécurité pour éviter de lancer plusieurs fois le spin
    if (isSpinning) return;
    isSpinning = true;
    
    const spinBtn = document.getElementById('btn-spin-wheel');
    if (spinBtn) spinBtn.disabled = true;

    const canvas = document.getElementById('wheelCanvas');
    const rewards = REWARDS_DATA[currentWheelType]; // Charge Hourly ou Daily selon le bouton cliqué
    
    // 2. Calcul d'une rotation aléatoire (minimum 5 tours complets + angle aléatoire)
    const extraDegree = Math.floor(Math.random() * 360);
    const totalRotation = 1800 + extraDegree; 
    
    // 3. Animation CSS[cite: 1]
    canvas.style.transition = "transform 4s cubic-bezier(0.15, 0, 0.15, 1)";
    canvas.style.transform = `rotate(${totalRotation}deg)`;

    // 4. Traitement après l'animation (4 secondes)[cite: 1]
    setTimeout(() => {
        // Calcul du segment gagnant (aligné sur le pointeur ▼ en haut)[cite: 1]
        const actualDeg = totalRotation % 360;
        const segmentAngle = 360 / rewards.length;
        const winningIndex = Math.floor(((360 - actualDeg + 270) % 360) / segmentAngle);
        const finalReward = rewards[winningIndex];

        // Distribution de la récompense[cite: 1]
        giveWheelReward(finalReward);
        
        // ENREGISTREMENT DU TIMER SPÉCIFIQUE[cite: 1]
        // Cela enregistre 'last_claim_hourly' OU 'last_claim_daily'[cite: 1]
        localStorage.setItem('last_claim_' + currentWheelType, Date.now());
        
            // Nettoyage de l'interface[cite: 1]
        isSpinning = false;
        if (spinBtn) spinBtn.disabled = false;
            
            // On cache la roue
        document.getElementById('wheel-zone').style.display = 'none';
        
        // On ré-affiche les conteneurs normaux pour les prochains tirages
        document.getElementById('popup-results-container').style.display = 'flex';
        document.getElementById('btn-popup-close').style.display = 'inline-block';
        
        localStorage.setItem('last_claim_' + currentWheelType, Date.now());
        updateTimers(); 
    }, 4000);
}

function giveWheelReward(reward) {
    console.log("Récompense gagnée : ", reward); // Debug
    
    if (reward.type === "gems") {
        userGems += reward.value;
    } else if (reward.type === "cristaux") {
        userCristaux += reward.value;
    } else if (reward.type === "draw_event" || reward.type === "draw_perm") {
        // On ferme la roue avant de lancer le tirage pour éviter les bugs d'affichage[cite: 1]
        document.getElementById('wheel-zone').style.display = 'none';
        const banner = (reward.type === "draw_event") ? "Minecraft" : "Anime";
        processDraw(banner, reward.value);
        return; // On sort pour laisser processDraw gérer la suite
    }

    updateUI();
    alert("Félicitations ! Tu as reçu : " + reward.label);
}
