// --- BASE DE DONNÉES ---
const cardsDatabase = [
    { id: "goku", name: "Goku", rarity: "Légendaire", type: "Personnage", basePower: 2000, banner: "Anime" },
    { id: "luffy", name: "Luffy", rarity: "Épique", type: "Personnage", basePower: 1200, banner: "Anime" },
    { id: "mario", name: "Mario", rarity: "Rare", type: "Personnage", basePower: 500, banner: "Jeux" },
    { id: "link", name: "Link", rarity: "Légendaire", type: "Personnage", basePower: 1800, banner: "Jeux" },
    { id: "pixel_knight", name: "Chevalier Pixel", rarity: "Basique", type: "Personnage", basePower: 100, banner: "Jeux" }
];

// --- VARIABLES ÉTAT DU JEU ---
let userGems = 1000;
let userCristaux = 0;
let userDeck = {};
let totalPower = 0;

// --- NAVIGATION ---
function switchView(viewId) {
    // Cache toutes les sections
    const views = document.querySelectorAll('.game-view');
    views.forEach(v => v.style.display = 'none');

    // Affiche la section demandée
    const target = document.getElementById(viewId);
    if (target) {
        target.style.display = 'block';
    }

    // Refresh spécifique
    if (viewId === 'view-deck') renderDeck();
}

// --- LOGIQUE GACHA ---
function drawCard(bannerName) {
    if (userGems < 10) {
        alert("Pas assez de Gems !");
        return;
    }

    userGems -= 10;
    
    // 1. Sélectionner les cartes de la bannière
    const available = cardsDatabase.filter(c => c.banner === bannerName);
    const template = available[Math.floor(Math.random() * available.length)];

    // 2. Logique d'évolution ou de création
    if (userDeck[template.id]) {
        // La carte existe déjà
        if (userDeck[template.id].stars < 5) {
            userDeck[template.id].stars++;
            userDeck[template.id].currentPower = Math.floor(template.basePower * (1 + (userDeck[template.id].stars * 0.25)));
        } else {
            // Déjà 5 étoiles, on donne des cristaux
            userCristaux += 50;
        }
    } else {
        // Première fois qu'on tire cette carte
        userDeck[template.id] = {
            ...template,
            stars: 0,
            currentPower: template.basePower
        };
    }

    // 3. MISE À JOUR : On récupère la carte mise à jour pour l'affichage
    const finalCard = userDeck[template.id];

    updateUI();
    
    // 4. Affichage du résultat avec les bonnes étoiles
    const resultDiv = document.getElementById('draw-result');
    if (resultDiv) {
        // On vérifie si on vient de gagner des cristaux ou si on affiche la carte
        if (userDeck[template.id].stars === 5 && template.id in userDeck && userCristaux > 0) {
             // Optionnel : tu peux ajouter un message spécial si c'est un doublon max
        }
        
        resultDiv.innerHTML = `
            <div class="card rarity-${finalCard.rarity.toLowerCase()}" style="display:inline-block; float:none;">
                <h4>${finalCard.name}</h4>
                <div style="color:gold; font-size:1.2rem;">${"⭐".repeat(finalCard.stars) || "Nouveau !"}</div>
                <p><strong>Pwr: ${finalCard.currentPower}</strong></p>
                <small>${finalCard.stars === 5 ? "MAX LEVEL" : "NIVEAU UP !"}</small>
            </div>
        `;
    }
}

// --- AFFICHAGE ---
function updateUI() {
    // Calcul de la puissance totale
    totalPower = 0;
    for (let id in userDeck) {
        totalPower += userDeck[id].currentPower;
    }

    document.getElementById('gems-count').innerText = userGems;
    document.getElementById('cristaux-count').innerText = userCristaux;
    document.getElementById('total-power').innerText = totalPower;
}

function renderDeck() {
    const container = document.getElementById('deck-container');
    container.innerHTML = "";
    const grid = document.createElement('div');
    grid.className = "deck-grid";

    Object.values(userDeck).forEach(card => {
        grid.innerHTML += `
            <div class="card rarity-${card.rarity.toLowerCase()}">
                <h4>${card.name}</h4>
                <div style="color:gold">${"⭐".repeat(card.stars)}</div>
                <p>Type: ${card.type}</p>
                <p><strong>Pwr: ${card.currentPower}</strong></p>
                <small>${card.banner}</small>
            </div>
        `;
    });
    container.appendChild(grid);
}

// --- ANIMATION DOLLARS ---
function createDollar() {
    const container = document.getElementById('money-rain-container');
    if (!container) return;

    const dollar = document.createElement('img');
    dollar.src = 'dollar.png';
    dollar.className = 'dollar-fx';
    
    dollar.style.left = Math.random() * 95 + "vw";
    const size = 15 + Math.random() * 20;
    dollar.style.width = size + "px";
    
    const duration = 4 + Math.random() * 4;
    dollar.style.animation = `fall ${duration}s linear forwards`;
    dollar.style.transform = `rotate(${Math.random() * 360}deg)`;

    container.appendChild(dollar);

    setTimeout(() => {
        dollar.remove();
    }, duration * 1000);
}

function moneyLoop() {
    // Fréquence : plus de puissance = moins de délai entre chaque billet
    // On commence à 2000ms et on descend vers 100ms
    let delay = 2000 - (totalPower / 5); 
    if (delay < 100) delay = 100;

    createDollar();
    setTimeout(moneyLoop, delay);
}

// --- INITIALISATION ---
window.onload = () => {
    switchView('view-hub'); // Lance le Hub par défaut
    updateUI();
    moneyLoop(); // Lance la pluie de dollars
};