export type ShopCategory =
  | "poster"
  | "collector"
  | "apparel"
  | "sneakers"
  | "music"
  | "manga"
  | "daily"
  | "lovacoins";

export type ShopProduct = {
  id: string;
  name: string;
  category: ShopCategory;
  tag: string;
  price: number;
  currency?: "EUR" | "LC";
  description: string;
  source: "youtube" | "tiktok" | "both";
  slug?: string;
  compareAt?: number;
  rating?: number;
  reviews?: number;
  sold?: number;
  stock?: number;
  type?: "physical" | "digital";
  brand?: string;
  images?: string[];
  video?: string;
  bullets?: string[];
  specs?: Record<string, string>;
  affiliateUrl?: string;
  shippingDays?: string;
};

const CATEGORY_LABEL: Record<ShopCategory, string> = {
  poster: "Affiche",
  collector: "Collector",
  apparel: "Vêtement",
  sneakers: "Chaussure",
  music: "Musique",
  manga: "Manga & BD",
  daily: "Quotidien",
  lovacoins: "LovaCoins Exclusif",
};

type Seed = {
  name: string;
  category: ShopCategory;
  tag: string;
  price: number;
  currency?: "EUR" | "LC";
  description: string;
  source: ShopProduct["source"];
};

const SEEDS: Seed[] = [
  // ===== AFFICHES / POSTERS (12) =====
  { name: "Affiche Néon Ruri no Houseki", category: "poster", tag: "Édition limitée", price: 24, description: "Tirage giclée 50×70 cm sur papier mat 250g, finition néon magenta. Numérotée et signée AnimemomentsAnimeofficiel.", source: "youtube" },
  { name: "Poster Holographique Anime Moments", category: "poster", tag: "Holo", price: 29, description: "Poster A2 imprimé sur film holographique, reflets arc-en-ciel selon l'angle. Tube cartonné inclus.", source: "both" },
  { name: "Affiche Glow-in-Dark TikTok Drop", category: "poster", tag: "Phosphorescent", price: 32, description: "Encre phosphorescente activée à la lumière, brille pendant 6h dans le noir. Format 60×90 cm.", source: "tiktok" },
  { name: "Triptyque Moments Forts S1", category: "poster", tag: "Set de 3", price: 49, description: "Trois posters 30×40 cm formant une scène panoramique. Best-of saison 1 de la chaîne YouTube.", source: "youtube" },
  { name: "Affiche Minimaliste Madoka", category: "poster", tag: "Art print", price: 19, description: "Style art déco minimaliste, papier coton 300g. Édition open de 500 exemplaires.", source: "youtube" },
  { name: "Poster Vintage Manga Animé", category: "poster", tag: "Rétro", price: 22, description: "Inspiration affiche cinéma japonaise des années 80, papier vieilli kraft. 50×70 cm.", source: "both" },
  { name: "Affiche XXL Mur Lovanet", category: "poster", tag: "Mural", price: 59, description: "Format mural 100×140 cm, idéal pour chambre gamer. Impression haute résolution.", source: "tiktok" },
  { name: "Poster Lenticulaire 3D Anime", category: "poster", tag: "3D lenticulaire", price: 39, description: "Effet 3D et changement d'image selon l'angle. Encadré bois noir 30×40 cm.", source: "both" },
  { name: "Affiche Calligraphie Kanji Lovanet", category: "poster", tag: "Signature", price: 25, description: "Calligraphie kanji à l'encre de Chine, hommage à la chaîne Lovanet. Papier washi 40×60 cm.", source: "youtube" },
  { name: "Set Mini-Posters Episodes Cultes", category: "poster", tag: "Pack x6", price: 34, description: "Six mini-posters A4 des épisodes les plus vus de la chaîne. Tube collector inclus.", source: "youtube" },
  { name: "Poster Cyberpunk TikTok Edit", category: "poster", tag: "Néo-Tokyo", price: 27, description: "Composition cyberpunk inspirée des edits TikTok viraux. Finition mate 50×70 cm.", source: "tiktok" },
  { name: "Affiche Premium Encadrée Alu", category: "poster", tag: "Encadré", price: 79, description: "Tirage Hahnemühle 70×100 cm encadré aluminium brossé. Prêt à accrocher.", source: "both" },

  // ===== OBJETS DE COLLECTION / COLLECTOR (13) =====
  { name: "Figurine LED Anime Glow 24cm", category: "collector", tag: "Collector", price: 89, description: "Figurine PVC 24 cm, socle LED RGB pilotable. Édition limitée à 500 exemplaires numérotés.", source: "youtube" },
  { name: "Statue Premium ÑLLÑ Resin", category: "collector", tag: "Édition 100", price: 249, description: "Statue résine peinte main, hauteur 32 cm, socle marbre. Certificat d'authenticité.", source: "both" },
  { name: "Nendoroid Anime Moments", category: "collector", tag: "Chibi", price: 59, description: "Figurine chibi 10 cm articulée avec 3 visages interchangeables et accessoires.", source: "youtube" },
  { name: "Bust Half-Scale Madoka", category: "collector", tag: "Demi-buste", price: 179, description: "Buste demi-échelle, 20 cm de haut, finition mate premium. Boîte collector incluse.", source: "youtube" },
  { name: "Set Pin's Émail Officiels", category: "collector", tag: "Pack x10", price: 39, description: "10 pin's émail dur, design exclusif AnimemomentsAnimeofficiel. Carte support cartonnée.", source: "tiktok" },
  { name: "Vinyle Picture Disc Lovanet", category: "collector", tag: "Vinyle 12\"", price: 34, description: "Vinyle picture disc 33 tours avec artwork anime, bande-son officielle Lovanet.", source: "both" },
  { name: "Carte Holo Tirage Limité", category: "collector", tag: "Trading card", price: 14, description: "Carte holographique format trading, scellée. Tirage 1000 exemplaires numérotés.", source: "tiktok" },
  { name: "Funko Style Anime Officiel", category: "collector", tag: "Vinyl figure", price: 29, description: "Figurine vinyle stylisée 10 cm, boîte fenêtre. Première édition signée.", source: "youtube" },
  { name: "Diorama LED Scène Culte", category: "collector", tag: "Diorama", price: 199, description: "Diorama 25×25 cm avec éclairage LED intégré, télécommande RGB. Pièce unique.", source: "youtube" },
  { name: "Médaille Métal Anniversaire", category: "collector", tag: "Métal", price: 24, description: "Médaille zamak finition or brossé, coffret velours. Édition anniversaire chaîne.", source: "both" },
  { name: "Manga Artbook Officiel", category: "collector", tag: "Artbook", price: 49, description: "200 pages d'illustrations, storyboards et croquis exclusifs. Couverture rigide.", source: "youtube" },
  { name: "Boule de Cristal Hologramme", category: "collector", tag: "Cristal 3D", price: 44, description: "Boule cristal gravée laser avec personnage en 3D et socle LED. Diamètre 8 cm.", source: "tiktok" },
  { name: "Coffret Collector Saison 1", category: "collector", tag: "Box set", price: 129, description: "Coffret rigide contenant artbook, pin's, poster, médaille et carte. Édition fans.", source: "youtube" },

  // ===== VÊTEMENTS / APPAREL (15) =====
  { name: "Hoodie Oversize Néon Lovanet", category: "apparel", tag: "Streetwear", price: 79, description: "Sweat capuche oversize 320g, broderie néon dos. Coton bio certifié. Tailles XS à XXL.", source: "both" },
  { name: "T-shirt Heavyweight ÑLLÑ", category: "apparel", tag: "Heavyweight", price: 35, description: "T-shirt épais 240g coupe boxy, sérigraphie poitrine + dos. 100% coton peigné.", source: "tiktok" },
  { name: "Crewneck Anime Moments Vintage", category: "apparel", tag: "Vintage wash", price: 65, description: "Sweat ras-du-cou délavage stone wash. Patch brodé manche gauche.", source: "youtube" },
  { name: "Veste Bomber Reversible Manga", category: "apparel", tag: "Bomber", price: 119, description: "Bomber réversible noir/magenta, doublure satin imprimée. Manches élastiquées.", source: "both" },
  { name: "Tee Long Sleeve Glitch Edit", category: "apparel", tag: "Long sleeve", price: 42, description: "Manches longues coupe oversize, print glitch sur manche. Sérigraphie haute densité.", source: "tiktok" },
  { name: "Hoodie Zip-Up Cyberpunk", category: "apparel", tag: "Full zip", price: 89, description: "Sweat zippé technique avec poches latérales, capuche doublée. Print dos all-over.", source: "youtube" },
  { name: "Shorts Cargo Streetwear", category: "apparel", tag: "Cargo", price: 55, description: "Short cargo ample avec poches latérales zippées. Imprimé katakana cuisse.", source: "tiktok" },
  { name: "Casquette Brodée Lovanet", category: "apparel", tag: "Cap", price: 29, description: "Casquette 6 panneaux structurée, broderie 3D logo Lovanet. Snapback ajustable.", source: "both" },
  { name: "Bonnet Beanie Magenta Glow", category: "apparel", tag: "Beanie", price: 22, description: "Bonnet maille côtelée, patch tissé Anime Moments. Acrylique doux.", source: "youtube" },
  { name: "Tee Tie-Dye Magenta Cyan", category: "apparel", tag: "Tie-dye", price: 39, description: "T-shirt tie-dye réalisé à la main, chaque pièce est unique. Coton lourd 220g.", source: "tiktok" },
  { name: "Veste Coach Anime Officiel", category: "apparel", tag: "Coach jacket", price: 95, description: "Veste coach nylon léger, pressions devant, broderie dos AnimemomentsAnimeofficiel.", source: "both" },
  { name: "Pantalon Jogger Tech Néon", category: "apparel", tag: "Jogger", price: 69, description: "Pantalon tech-fleece coupe slim, bandes réfléchissantes latérales. Cheville zippée.", source: "youtube" },
  { name: "Chaussettes Pack x3 Logo", category: "apparel", tag: "Pack x3", price: 19, description: "Trois paires de chaussettes hautes coton, broderie logo cheville. Taille unique 39-45.", source: "tiktok" },
  { name: "Polo Rétro Anime Club", category: "apparel", tag: "Polo", price: 49, description: "Polo piqué coton, broderie poitrine style college japonais. Coupe ajustée.", source: "youtube" },
  { name: "Robe T-Shirt Oversize Tokyo", category: "apparel", tag: "Tee-dress", price: 45, description: "Robe t-shirt longue oversize, print Tokyo nuit dos. Coton bio fluide.", source: "both" },

  // ===== CHAUSSURES / SNEAKERS (10) =====
  { name: "Sneakers High-Top LED Glow", category: "sneakers", tag: "Hype", price: 159, description: "Baskets montantes avec semelle LED rechargeable USB, 7 modes lumineux. Tailles 36-46.", source: "tiktok" },
  { name: "Runners Tech Neon Mesh", category: "sneakers", tag: "Runner", price: 129, description: "Runner technique mesh respirant, semelle EVA légère, accents néon magenta.", source: "youtube" },
  { name: "Skate Shoes Anime Print", category: "sneakers", tag: "Skate", price: 89, description: "Toile vulcanisée style skate, print intégral anime sur la tige. Renforts orteils.", source: "tiktok" },
  { name: "Boots Cyberpunk Platform", category: "sneakers", tag: "Plateforme", price: 179, description: "Bottes plateforme 5 cm, finition vinyle noir, lacets rouges. Édition capsule.", source: "youtube" },
  { name: "Mules Slides Logo Embossé", category: "sneakers", tag: "Slides", price: 49, description: "Claquettes EVA injecté, logo embossé sur la bride. Confort absolu été.", source: "tiktok" },
  { name: "Sneakers Low Magenta Suede", category: "sneakers", tag: "Suede", price: 119, description: "Baskets basses daim magenta, semelle gomme blanche. Boîte collector.", source: "both" },
  { name: "Trainers Bicolore Cyan/Noir", category: "sneakers", tag: "Trainer", price: 99, description: "Trainer vintage bicolore, languette épaisse, semelle gum. Coupe rétro 90s.", source: "youtube" },
  { name: "Chunky Sneakers Anime Beast", category: "sneakers", tag: "Chunky", price: 149, description: "Chunky sole 6 cm, multi-couches mesh et cuir, broderie créature anime talon.", source: "tiktok" },
  { name: "Sneakers Co-Lab Lovanet", category: "sneakers", tag: "Co-lab", price: 199, description: "Collaboration exclusive Lovanet. Numérotées sur la semelle.", source: "both" },
  { name: "Chaussons Maison Anime Plush", category: "sneakers", tag: "Cozy", price: 35, description: "Chaussons peluche imprimés personnages anime, semelle antidérapante.", source: "youtube" },

  // ===== MUSIQUE / MUSIC (8) =====
  { name: "Vinyle OST Ruri no Houseki", category: "music", tag: "Vinyle 12\"", price: 32, description: "Bande originale officielle pressée sur vinyle 180g coloré magenta translucide.", source: "youtube" },
  { name: "Cassette Mixtape TikTok Edits", category: "music", tag: "Cassette", price: 14, description: "Mixtape K7 audio limitée à 300 ex, compilation des edits TikTok viraux.", source: "tiktok" },
  { name: "EP Digital Lovanet Lo-Fi", category: "music", tag: "Digital", price: 9, description: "EP 6 titres lo-fi anime téléchargeable en FLAC et MP3 320kbps. Artwork HD inclus.", source: "both" },
  { name: "CD Collector Box Anime Beats", category: "music", tag: "CD digipack", price: 19, description: "Double CD digipack, 24 titres remasterisés, livret 24 pages.", source: "youtube" },
  { name: "Casque Audio Néon NLNQ", category: "music", tag: "Audio gear", price: 119, description: "Casque circum-aural sans-fil 40h d'autonomie, anneaux LED réactifs au son.", source: "both" },
  { name: "Platine Vinyle Compact Magenta", category: "music", tag: "Hardware", price: 189, description: "Platine vinyle Bluetooth coloris magenta, capot transparent, pré-ampli intégré.", source: "youtube" },
  { name: "Single 7\" Opening Cyber", category: "music", tag: "Single", price: 12, description: "Single 7 pouces avec opening + ending, jaquette holographique.", source: "tiktok" },
  { name: "Synthwave Pack Sample NLNQ", category: "music", tag: "Sample pack", price: 24, description: "150 samples synthwave royalty-free, kicks, snares, leads, presets Serum.", source: "both" },

  // ===== MANGA & BD / COMICS (8) =====
  { name: "Manga Tome 1 Anime Moments", category: "manga", tag: "Tome 01", price: 11, description: "Premier tome 192 pages, format poche, jaquette réversible et marque-page collector.", source: "youtube" },
  { name: "BD Hardcover Lovanet Saga", category: "manga", tag: "Hardcover", price: 29, description: "Roman graphique cartonné 120 pages couleur, papier mat 150g.", source: "both" },
  { name: "Light Novel Lovanet Chronicles", category: "manga", tag: "Light novel", price: 16, description: "Light novel illustré 320 pages, 12 illustrations couleur pleine page.", source: "youtube" },
  { name: "Doujinshi Édition Fan-Club", category: "manga", tag: "Doujin", price: 18, description: "Doujinshi A5 64 pages, tirage limité 500 ex numérotés à la main.", source: "tiktok" },
  { name: "Manga Box Set Saison 1", category: "manga", tag: "Coffret 6 tomes", price: 79, description: "Coffret carton rigide 6 premiers tomes + poster exclusif double face.", source: "youtube" },
  { name: "Webtoon Print Anniversaire", category: "manga", tag: "Webtoon", price: 22, description: "Première impression papier d'un webtoon viral, format vertical 21×40 cm.", source: "tiktok" },
  { name: "Artbook Storyboard Edition", category: "manga", tag: "Storyboard", price: 39, description: "Artbook 180 pages de storyboards bruts, croquis et planches d'animation.", source: "youtube" },
  { name: "Comics One-Shot ÑLLÑ Origin", category: "manga", tag: "One-shot", price: 14, description: "Comics one-shot format US 32 pages couleur, couverture variante exclusive.", source: "both" },

  // ===== OBJETS DU QUOTIDIEN / DAILY (10) =====
  { name: "Mug Thermoréactif Anime", category: "daily", tag: "Thermo", price: 18, description: "Mug céramique 350ml qui révèle son artwork avec une boisson chaude.", source: "youtube" },
  { name: "Gourde Inox Néon 750ml", category: "daily", tag: "Inox", price: 26, description: "Gourde double paroi inox, garde froid 24h / chaud 12h. Bouchon sport.", source: "tiktok" },
  { name: "Tote Bag Canvas Manga", category: "daily", tag: "Tote", price: 19, description: "Sac tote 320g coton recyclé, sérigraphie deux couleurs grand format.", source: "both" },
  { name: "Tapis de Souris XXL RGB", category: "daily", tag: "Gaming", price: 35, description: "Tapis 90×40 cm, contour LED RGB USB, surface micro-tissée pour souris gaming.", source: "youtube" },
  { name: "Bougie Parfumée Tokyo Rain", category: "daily", tag: "Bougie", price: 24, description: "Bougie cire de soja 200g, senteurs pluie, cèdre et yuzu. Mèche en bois.", source: "tiktok" },
  { name: "Plaid Sherpa Anime Moments", category: "daily", tag: "Plaid", price: 49, description: "Plaid sherpa 150×200 cm ultra doux, imprimé all-over, doublure peluche.", source: "both" },
  { name: "Stickers Pack Holographiques", category: "daily", tag: "Stickers x20", price: 12, description: "20 stickers holographiques découpés, vinyle waterproof résistant UV.", source: "tiktok" },
  { name: "Carnet A5 Pages Pointillées", category: "daily", tag: "Stationery", price: 16, description: "Carnet bullet journal 192 pages, papier 100g, élastique et marque-page.", source: "youtube" },
  { name: "Lampe LED Akari Cube Anime", category: "daily", tag: "Déco", price: 39, description: "Cube lumineux 15 cm, 16 millions de couleurs, télécommande et appli mobile.", source: "both" },
  { name: "Coque Smartphone Holo Magenta", category: "daily", tag: "Accessoire", price: 22, description: "Coque silicone renforcée effet holographique, compatible MagSafe.", source: "tiktok" },

  // ===== LOVACOINS EXCLUSIF (4) =====
  { name: "Titre Holographique: Otaku Suprême", category: "lovacoins", tag: "Digital", price: 1500, currency: "LC", description: "Débloque un titre holographique unique pour ton profil. Effet visuel incroyable.", source: "both" },
  { name: "Cadre Avatar Néon Flamme", category: "lovacoins", tag: "Digital", price: 800, currency: "LC", description: "Un cadre de profil animé avec des flammes néon magenta. Rends ton avatar épique.", source: "youtube" },
  { name: "Ticket Watch Party Privée", category: "lovacoins", tag: "Digital", price: 2500, currency: "LC", description: "Rejoins l'équipe Lovanet pour une séance de visionnage en direct exclusive.", source: "tiktok" },
  { name: "Bannière Profil Cyber-City", category: "lovacoins", tag: "Digital", price: 1200, currency: "LC", description: "Bannière de profil animée représentant une ville cyberpunk sous la pluie.", source: "both" },
];

export const SHOP_CATEGORIES: { id: ShopCategory; label: string }[] = (Object.keys(CATEGORY_LABEL) as ShopCategory[]).map((id) => ({
  id,
  label: CATEGORY_LABEL[id],
}));

export const SHOP_PRODUCTS: ShopProduct[] = [
  ...SEEDS.filter(s => s.category === "lovacoins").map((s, i) => ({
    id: `am-lc-${String(i + 1).padStart(3, "0")}`,
    name: s.name,
    category: s.category,
    tag: s.tag,
    price: s.price,
    currency: s.currency || "EUR",
    description: s.description,
    source: s.source,
  })),
  ...SEEDS.filter(s => s.category !== "lovacoins").map((s, i) => ({
    id: `am-${String(i + 1).padStart(3, "0")}`,
    name: s.name,
    category: s.category,
    tag: s.tag,
    price: s.price,
    currency: s.currency || "EUR",
    description: s.description,
    source: s.source,
  }))
];

export const categoryLabel = (c: ShopCategory) => CATEGORY_LABEL[c];