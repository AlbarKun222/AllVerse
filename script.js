// Base de données des cartes (on ajoute un ID unique)
const cardsDatabase = [
    { id: "guerrier_pixel", name: "Guerrier Pixel", rarity: "Basique", type: "Personnage", basePower: 100 },
    { id: "mage_ancien", name: "Mage Ancien", rarity: "Rare", type: "Personnage", basePower: 450 },
    { id: "excalibur_hd", name: "Excalibur HD", rarity: "Légendaire", type: "Objet", basePower: 1200 },
    { id: "potion_mana", name: "Potion de Mana", rarity: "Basique", type: "Magie", basePower: 50 },
    { id: "dragon_infini", name: "Dragon de l'Infini", rarity: "Légendaire", type: "Personnage", basePower: 2500 }
];

let userGems = 1000; // Un peu plus pour tester
let userCristaux = 0;
let userDeck = {}; // Changement : on utilise un objet {} au lieu d'un tableau []

function drawCard() {
    if (userGems < 10) {
        alert("Pas assez de Gems !");
        return;
    }

    userGems -= 10;
    
    // Sélection aléatoire
    const cardTemplate = cardsDatabase[Math.floor(Math.random() * cardsDatabase.length)];
    
    // Système d'évolution / Doublons
    if (userDeck[cardTemplate.id]) {
        let cardInDeck = userDeck[cardTemplate.id];
        
        if (cardInDeck.stars < 5) {
            // Augmenter les étoiles
            cardInDeck.stars += 1;
            // Puissance augmente de 25% (Base + (25% * étoiles))
            cardInDeck.currentPower = Math.floor(cardTemplate.basePower * (1 + (cardInDeck.stars * 0.25)));
            console.log(`Évolution ! ${cardInDeck.name} est maintenant ${cardInDeck.stars}⭐`);
        } else {
            // Déjà max étoiles -> Gain de cristaux
            userCristaux += 50; 
            alert(`Doublon Max ! +50 Cristaux reçu pour ${cardTemplate.name}`);
        }
    } else {
        // Première fois qu'on a la carte
        userDeck[cardTemplate.id] = {
            ...cardTemplate,
            stars: 0,
            currentPower: cardTemplate.basePower
        };
    }

    displayCard(userDeck[cardTemplate.id]);
    calculateTotalPower();
    updateUI();
}

function calculateTotalPower() {
    let total = 0;
    // On additionne la puissance de toutes les cartes possédées
    for (let key in userDeck) {
        total += userDeck[key].currentPower;
    }
    
    // Bonus de type (Ex: si 2 Objets)
    const objects = Object.values(userDeck).filter(c => c.type === "Objet").length;
    if (objects >= 2) total = Math.floor(total * 1.5);

    document.getElementById('total-power').innerText = total;
}

function displayCard(card) {
    const display = document.getElementById('card-display');
    const starsIcon = "⭐".repeat(card.stars);
    
    display.innerHTML = `
        <div class="card rarity-${card.rarity.toLowerCase()}">
            <div class="card-inner">
                <div class="card-name">${card.name}</div>
                <div class="card-stars">${starsIcon || "Nouvelle !"}</div>
                <div class="card-type">${card.type}</div>
                <div class="card-power">Pwr: ${card.currentPower}</div>
                <div class="card-rarity-label">${card.rarity}</div>
            </div>
        </div>
    `;
}

function showDeck() {
    const display = document.getElementById('card-display');
    display.innerHTML = `<h3>Mon Deck (${Object.keys(userDeck).length} cartes)</h3>`;
    
    const deckGrid = document.createElement('div');
    deckGrid.className = "deck-grid"; // Ajoute cette classe dans ton CSS pour le style

    Object.values(userDeck).forEach(card => {
        const starsIcon = "⭐".repeat(card.stars);
        deckGrid.innerHTML += `
            <div class="card rarity-${card.rarity.toLowerCase()}">
                <div class="card-inner">
                    <div class="card-name">${card.name}</div>
                    <div class="stars-display">${starsIcon}</div>
                    <div class="card-power">${card.currentPower}</div>
                </div>
            </div>
        `;
    });
    display.appendChild(deckGrid);
}

function updateUI() {
    document.getElementById('gems-count').innerText = userGems;
    document.getElementById('cristaux-count').innerText = userCristaux;
}