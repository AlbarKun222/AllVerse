// --- BASE DE DONNÉES AVEC POIDS ÉQUILIBRÉS ---
const cardsDatabase = [
    { id: "goku", name: "Goku", rarity: "Légendaire", basePower: 2000, banner: "Anime", type: "permanent", weight: 3 },
    { id: "naruto", name: "Naruto", rarity: "Epique", basePower: 1200, banner: "Anime", type: "permanent", weight: 12 },
    { id: "luffy", name: "Luffy", rarity: "Epique", basePower: 1250, banner: "Anime", type: "permanent", weight: 12 },
    { id: "saitama", name: "Saitama", rarity: "Universelle", basePower: 5000, banner: "Anime", type: "permanent", weight: 0.2 },
    { id: "tanjiro", name: "Tanjiro", rarity: "Rare", basePower: 600, banner: "Anime", type: "permanent", weight: 35 },
    { id: "deku", name: "Deku", rarity: "Rare", basePower: 550, banner: "Anime", weight: 35 },
    { id: "kurapika", name: "Kurapika", rarity: "Atypique", basePower: 300, banner: "Anime", type: "permanent", weight: 80 },
    { id: "sakura", name: "Sakura", rarity: "Basique", basePower: 100, banner: "Anime", type: "permanent", weight: 150 },
    { id: "gojo", name: "Gojo Satoru", rarity: "Mythique", basePower: 3500, banner: "Anime", type: "permanent", weight: 0.8 },
    { id: "eren", name: "Eren Jäger", rarity: "Légendaire", basePower: 1900, banner: "Anime", type: "permanent", weight: 3 },

    //----------------------------------------------------------------
    //Bannière : Minecraft
    { id: "chicken", name: "Poule", rarity: "Basique", basePower: 110, banner: "Minecraft", type: "event", weight: 150 },
    { id: "sheep", name: "Mouton", rarity: "Basique", basePower: 120, banner: "Minecraft", type: "event", weight: 145 },
    { id: "cow", name: "Vache", rarity: "Basique", basePower: 120, banner: "Minecraft", type: "event", weight: 145 },
    { id: "rabbit", name: "Lapin", rarity: "Basique", basePower: 120, banner: "Minecraft", type: "event", weight: 145 },

    { id: "Marchand Ambulant", name: "Marchand Ambulant", rarity: "Atypique", basePower: 250, banner: "Minecraft", type: "event", weight: 80 },
    { id: "Idiot du Village", name: "Idiot Du Village", rarity: "Atypique", basePower: 250, banner: "Minecraft", type: "event", weight: 80 },

    { id: "Champi-Meuh", name: "Champi-Meuh", rarity: "Rare", basePower: 500, banner: "Minecraft", type: "event", weight: 35 },
    { id: "Creeper", name: "Creeper", rarity: "Rare", basePower: 450, banner: "Minecraft", type: "event", weight: 35 },

    { id: "Fluffy", name: "Fluffy", rarity: "Epique", basePower: 1300, banner: "Minecraft", type: "event", weight: 12 },
    { id: "Didier", name: "Didier", rarity: "Epique", basePower: 1100, banner: "Minecraft", type: "event", weight: 12 },

    { id: "Steve", name: "Steve", rarity: "Légendaire", basePower: 1800, banner: "Minecraft", type: "event", weight: 3 },
    { id: "Alex", name: "Alex", rarity: "Légendaire", basePower: 1700, banner: "Minecraft", type: "event", weight: 3 },

    { id: "Wither", name: "Wither", rarity: "Mythique", basePower: 3800, banner: "Minecraft", type: "event", weight: 0.8 },
    { id: "Warden", name: "Warden", rarity: "Mythique", basePower: 3600, banner: "Minecraft", type: "event", weight: 0.8 },
    { id: "EnderDragon", name: "EnderDragon", rarity: "Mythique", basePower: 3900, banner: "Minecraft", type: "event", weight: 0.8 },
    
    { id: "Herobrine", name: "Herobrine", rarity: "Universelle", basePower: 4500, banner: "Minecraft", type: "event", weight: 0.2 }

];

