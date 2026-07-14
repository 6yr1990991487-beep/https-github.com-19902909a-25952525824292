export const siteMeta = {
  title: "Anime.Moments.officiel : Lovanet Plateforme officielle",
  description: "Anime, AnimeMoments, Animer officiel : vidéos YouTube, TikTok, Prime Video, catalogue et boutique manga.",
  logo: "/favicon.png",
  ogImage: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2cb8c14b-725a-45a2-bb3f-b827e4d6158e",
};

export const navRoutes = [
  {
    "to": "/",
    "label": "Accueil",
    "desc": "Page d’accueil Lovanet"
  },
  {
    "to": "/lecteurs-video",
    "label": "Lecteurs vidéo",
    "desc": "Player immersif anime"
  },
  {
    "to": "/chaine-youtube",
    "label": "YouTube",
    "desc": "Vidéos & shorts officiels"
  },
  {
    "to": "/prime-video",
    "label": "Prime Vidéo",
    "desc": "Lecture immersive multi-plateforme"
  },
  {
    "to": "/tiktok",
    "label": "TikTok",
    "desc": "Shorts & réactions"
  },
  {
    "to": "/anime-countdown",
    "label": "À venir",
    "desc": "Countdown live des prochains épisodes"
  },
  {
    "to": "/anime-catalog",
    "label": "Catalogue",
    "desc": "1500+ animés manga"
  },
  {
    "to": "/decouvrir",
    "label": "Univers Lovanet",
    "desc": "Vitrine SEO produits & vidéos"
  },
  {
    "to": "/shop",
    "label": "Shop",
    "desc": "Affiches, collectors, vêtements"
  },
  {
    "to": "/contact",
    "label": "Contact",
    "desc": "Écrire à l’équipe"
  },
  {
    "to": "/legals",
    "label": "Mentions légales",
    "desc": "CGV & confidentialité"
  }
];

export const routeAliases = {
  "/youtube": "/chaine-youtube",
  "/anime-moments-youtube": "/chaine-youtube",
  "/amazon-prime": "/prime-video",
  "/prime": "/prime-video",
  "/catalogue": "/anime-catalog",
  "/anime": "/anime-catalog",
  "/animemoments": "/decouvrir",
  "/animemomentsanimeofficiel": "/decouvrir"
};

export const productsSeed = [
  {
    "id": "am-001",
    "name": "Affiche Néon Ruri no Houseki",
    "image": "/products/am-001.svg",
    "description": "Tirage giclée 50×70 cm sur papier mat 250g, finition néon magenta. Numérotée et signée AnimemomentsAnimeofficiel.",
    "price": 24,
    "category": "poster",
    "tag": "Édition limitée",
    "source": "youtube"
  },
  {
    "id": "am-002",
    "name": "Poster Holographique Anime Moments",
    "image": "/products/am-002.svg",
    "description": "Poster A2 imprimé sur film holographique, reflets arc-en-ciel selon l'angle. Tube cartonné inclus.",
    "price": 29,
    "category": "collector",
    "tag": "Holo",
    "source": "tiktok"
  },
  {
    "id": "am-003",
    "name": "Affiche Glow-in-Dark TikTok Drop",
    "image": "/products/am-003.svg",
    "description": "Encre phosphorescente activée à la lumière, brille pendant 6h dans le noir. Format 60×90 cm.",
    "price": 32,
    "category": "apparel",
    "tag": "Phosphorescent",
    "source": "prime"
  },
  {
    "id": "am-004",
    "name": "Triptyque Moments Forts S1",
    "image": "/products/am-004.svg",
    "description": "Trois posters 30×40 cm formant une scène panoramique. Best-of saison 1 de la chaîne YouTube.",
    "price": 49,
    "category": "sneakers",
    "tag": "Set de 3",
    "source": "both"
  },
  {
    "id": "am-005",
    "name": "Affiche Minimaliste Madoka",
    "image": "/products/am-005.svg",
    "description": "Style art déco minimaliste, papier coton 300g. Édition open de 500 exemplaires.",
    "price": 19,
    "category": "music",
    "tag": "Art print",
    "source": "youtube"
  },
  {
    "id": "am-006",
    "name": "Poster Vintage Manga Animé",
    "image": "/products/am-006.svg",
    "description": "Inspiration affiche cinéma japonaise des années 80, papier vieilli kraft. 50×70 cm.",
    "price": 22,
    "category": "manga",
    "tag": "Rétro",
    "source": "tiktok"
  },
  {
    "id": "am-007",
    "name": "Affiche XXL Mur Lovanet",
    "image": "/products/am-007.svg",
    "description": "Format mural 100×140 cm, idéal pour chambre gamer. Impression haute résolution.",
    "price": 59,
    "category": "daily",
    "tag": "Mural",
    "source": "prime"
  },
  {
    "id": "am-008",
    "name": "Poster Lenticulaire 3D Anime",
    "image": "/products/am-008.svg",
    "description": "Effet 3D et changement d'image selon l'angle. Encadré bois noir 30×40 cm.",
    "price": 39,
    "category": "poster",
    "tag": "3D lenticulaire",
    "source": "both"
  },
  {
    "id": "am-009",
    "name": "Affiche Calligraphie Kanji Lovanet",
    "image": "/products/am-009.svg",
    "description": "Calligraphie kanji à l'encre de Chine, hommage à la chaîne Lovanet. Papier washi 40×60 cm.",
    "price": 25,
    "category": "collector",
    "tag": "Signature",
    "source": "youtube"
  },
  {
    "id": "am-010",
    "name": "Set Mini-Posters Episodes Cultes",
    "image": "/products/am-010.svg",
    "description": "Six mini-posters A4 des épisodes les plus vus de la chaîne. Tube collector inclus.",
    "price": 34,
    "category": "apparel",
    "tag": "Pack x6",
    "source": "tiktok"
  },
  {
    "id": "am-011",
    "name": "Poster Cyberpunk TikTok Edit",
    "image": "/products/am-011.svg",
    "description": "Composition cyberpunk inspirée des edits TikTok viraux. Finition mate 50×70 cm.",
    "price": 27,
    "category": "sneakers",
    "tag": "Néo-Tokyo",
    "source": "prime"
  },
  {
    "id": "am-012",
    "name": "Affiche Premium Encadrée Alu",
    "image": "/products/am-012.svg",
    "description": "Tirage Hahnemühle 70×100 cm encadré aluminium brossé. Prêt à accrocher.",
    "price": 79,
    "category": "music",
    "tag": "Premium",
    "source": "both"
  },
  {
    "id": "am-013",
    "name": "Figurine LED Anime Glow 24cm",
    "image": "/products/am-013.svg",
    "description": "Figurine PVC 24 cm, socle LED RGB pilotable. Édition limitée à 500 exemplaires numérotés.",
    "price": 89,
    "category": "manga",
    "tag": "Édition limitée",
    "source": "youtube"
  },
  {
    "id": "am-014",
    "name": "Statue Premium ÑLLÑ Resin",
    "image": "/products/am-014.svg",
    "description": "Statue résine peinte main, hauteur 32 cm, socle marbre. Certificat d'authenticité.",
    "price": 249,
    "category": "daily",
    "tag": "Holo",
    "source": "tiktok"
  },
  {
    "id": "am-015",
    "name": "Nendoroid Anime Moments",
    "image": "/products/am-015.svg",
    "description": "Figurine chibi 10 cm articulée avec 3 visages interchangeables et accessoires.",
    "price": 59,
    "category": "poster",
    "tag": "Phosphorescent",
    "source": "prime"
  },
  {
    "id": "am-016",
    "name": "Bust Half-Scale Madoka",
    "image": "/products/am-016.svg",
    "description": "Buste demi-échelle, 20 cm de haut, finition mate premium. Boîte collector incluse.",
    "price": 179,
    "category": "collector",
    "tag": "Set de 3",
    "source": "both"
  },
  {
    "id": "am-017",
    "name": "Set Pin's Émail Officiels",
    "image": "/products/am-017.svg",
    "description": "10 pin's émail dur, design exclusif AnimemomentsAnimeofficiel. Carte support cartonnée.",
    "price": 39,
    "category": "apparel",
    "tag": "Art print",
    "source": "youtube"
  },
  {
    "id": "am-018",
    "name": "Vinyle Picture Disc Lovanet",
    "image": "/products/am-018.svg",
    "description": "Vinyle picture disc 33 tours avec artwork anime, bande-son officielle Lovanet.",
    "price": 34,
    "category": "sneakers",
    "tag": "Rétro",
    "source": "tiktok"
  },
  {
    "id": "am-019",
    "name": "Carte Holo Tirage Limité",
    "image": "/products/am-019.svg",
    "description": "Carte holographique format trading, scellée. Tirage 1000 exemplaires numérotés.",
    "price": 14,
    "category": "music",
    "tag": "Mural",
    "source": "prime"
  },
  {
    "id": "am-020",
    "name": "Funko Style Anime Officiel",
    "image": "/products/am-020.svg",
    "description": "Figurine vinyle stylisée 10 cm, boîte fenêtre. Première édition signée.",
    "price": 29,
    "category": "manga",
    "tag": "3D lenticulaire",
    "source": "both"
  },
  {
    "id": "am-021",
    "name": "Diorama LED Scène Culte",
    "image": "/products/am-021.svg",
    "description": "Diorama 25×25 cm avec éclairage LED intégré, télécommande RGB. Pièce unique.",
    "price": 199,
    "category": "daily",
    "tag": "Signature",
    "source": "youtube"
  },
  {
    "id": "am-022",
    "name": "Médaille Métal Anniversaire",
    "image": "/products/am-022.svg",
    "description": "Médaille zamak finition or brossé, coffret velours. Édition anniversaire chaîne.",
    "price": 24,
    "category": "poster",
    "tag": "Pack x6",
    "source": "tiktok"
  },
  {
    "id": "am-023",
    "name": "Manga Artbook Officiel",
    "image": "/products/am-023.svg",
    "description": "200 pages d'illustrations, storyboards et croquis exclusifs. Couverture rigide.",
    "price": 49,
    "category": "collector",
    "tag": "Néo-Tokyo",
    "source": "prime"
  },
  {
    "id": "am-024",
    "name": "Boule de Cristal Hologramme",
    "image": "/products/am-024.svg",
    "description": "Boule cristal gravée laser avec personnage en 3D et socle LED. Diamètre 8 cm.",
    "price": 44,
    "category": "apparel",
    "tag": "Premium",
    "source": "both"
  },
  {
    "id": "am-025",
    "name": "Coffret Collector Saison 1",
    "image": "/products/am-025.svg",
    "description": "Coffret rigide contenant artbook, pin's, poster, médaille et carte. Édition fans.",
    "price": 24,
    "category": "sneakers",
    "tag": "Édition limitée",
    "source": "youtube"
  },
  {
    "id": "am-026",
    "name": "Hoodie Oversize Néon Lovanet",
    "image": "/products/am-026.svg",
    "description": "Sweat capuche oversize 320g, broderie néon dos. Coton bio certifié. Tailles XS à XXL.",
    "price": 29,
    "category": "music",
    "tag": "Holo",
    "source": "tiktok"
  },
  {
    "id": "am-027",
    "name": "T-shirt Heavyweight ÑLLÑ",
    "image": "/products/am-027.svg",
    "description": "T-shirt épais 240g coupe boxy, sérigraphie poitrine + dos. 100% coton peigné.",
    "price": 32,
    "category": "manga",
    "tag": "Phosphorescent",
    "source": "prime"
  },
  {
    "id": "am-028",
    "name": "Crewneck Anime Moments Vintage",
    "image": "/products/am-028.svg",
    "description": "Sweat ras-du-cou délavage stone wash. Patch brodé manche gauche.",
    "price": 49,
    "category": "daily",
    "tag": "Set de 3",
    "source": "both"
  },
  {
    "id": "am-029",
    "name": "Veste Bomber Reversible Manga",
    "image": "/products/am-029.svg",
    "description": "Bomber réversible noir/magenta, doublure satin imprimée. Manches élastiquées.",
    "price": 19,
    "category": "poster",
    "tag": "Art print",
    "source": "youtube"
  },
  {
    "id": "am-030",
    "name": "Tee Long Sleeve Glitch Edit",
    "image": "/products/am-030.svg",
    "description": "Manches longues coupe oversize, print glitch sur manche. Sérigraphie haute densité.",
    "price": 22,
    "category": "collector",
    "tag": "Rétro",
    "source": "tiktok"
  },
  {
    "id": "am-031",
    "name": "Hoodie Zip-Up Cyberpunk",
    "image": "/products/am-031.svg",
    "description": "Sweat zippé technique avec poches latérales, capuche doublée. Print dos all-over.",
    "price": 59,
    "category": "apparel",
    "tag": "Mural",
    "source": "prime"
  },
  {
    "id": "am-032",
    "name": "Shorts Cargo Streetwear",
    "image": "/products/am-032.svg",
    "description": "Short cargo ample avec poches latérales zippées. Imprimé katakana cuisse.",
    "price": 39,
    "category": "sneakers",
    "tag": "3D lenticulaire",
    "source": "both"
  },
  {
    "id": "am-033",
    "name": "Casquette Brodée Lovanet",
    "image": "/products/am-033.svg",
    "description": "Casquette 6 panneaux structurée, broderie 3D logo Lovanet. Snapback ajustable.",
    "price": 25,
    "category": "music",
    "tag": "Signature",
    "source": "youtube"
  },
  {
    "id": "am-034",
    "name": "Bonnet Beanie Magenta Glow",
    "image": "/products/am-034.svg",
    "description": "Bonnet maille côtelée, patch tissé Anime Moments. Acrylique doux.",
    "price": 34,
    "category": "manga",
    "tag": "Pack x6",
    "source": "tiktok"
  },
  {
    "id": "am-035",
    "name": "Tee Tie-Dye Magenta Cyan",
    "image": "/products/am-035.svg",
    "description": "T-shirt tie-dye réalisé à la main, chaque pièce est unique. Coton lourd 220g.",
    "price": 27,
    "category": "daily",
    "tag": "Néo-Tokyo",
    "source": "prime"
  },
  {
    "id": "am-036",
    "name": "Veste Coach Anime Officiel",
    "image": "/products/am-036.svg",
    "description": "Veste coach nylon léger, pressions devant, broderie dos AnimemomentsAnimeofficiel.",
    "price": 79,
    "category": "poster",
    "tag": "Premium",
    "source": "both"
  },
  {
    "id": "am-037",
    "name": "Pantalon Jogger Tech Néon",
    "image": "/products/am-037.svg",
    "description": "Pantalon tech-fleece coupe slim, bandes réfléchissantes latérales. Cheville zippée.",
    "price": 89,
    "category": "collector",
    "tag": "Édition limitée",
    "source": "youtube"
  },
  {
    "id": "am-038",
    "name": "Chaussettes Pack x3 Logo",
    "image": "/products/am-038.svg",
    "description": "Trois paires de chaussettes hautes coton, broderie logo cheville. Taille unique 39-45.",
    "price": 249,
    "category": "apparel",
    "tag": "Holo",
    "source": "tiktok"
  },
  {
    "id": "am-039",
    "name": "Polo Rétro Anime Club",
    "image": "/products/am-039.svg",
    "description": "Polo piqué coton, broderie poitrine style college japonais. Coupe ajustée.",
    "price": 59,
    "category": "sneakers",
    "tag": "Phosphorescent",
    "source": "prime"
  },
  {
    "id": "am-040",
    "name": "Robe T-Shirt Oversize Tokyo",
    "image": "/products/am-040.svg",
    "description": "Robe t-shirt longue oversize, print Tokyo nuit dos. Coton bio fluide.",
    "price": 179,
    "category": "music",
    "tag": "Set de 3",
    "source": "both"
  },
  {
    "id": "am-041",
    "name": "Sneakers High-Top LED Glow",
    "image": "/products/am-041.svg",
    "description": "Baskets montantes avec semelle LED rechargeable USB, 7 modes lumineux. Tailles 36-46.",
    "price": 39,
    "category": "manga",
    "tag": "Art print",
    "source": "youtube"
  },
  {
    "id": "am-042",
    "name": "Runners Tech Neon Mesh",
    "image": "/products/am-042.svg",
    "description": "Runner technique mesh respirant, semelle EVA légère, accents néon magenta.",
    "price": 34,
    "category": "daily",
    "tag": "Rétro",
    "source": "tiktok"
  },
  {
    "id": "am-043",
    "name": "Skate Shoes Anime Print",
    "image": "/products/am-043.svg",
    "description": "Toile vulcanisée style skate, print intégral anime sur la tige. Renforts orteils.",
    "price": 14,
    "category": "poster",
    "tag": "Mural",
    "source": "prime"
  },
  {
    "id": "am-044",
    "name": "Boots Cyberpunk Platform",
    "image": "/products/am-044.svg",
    "description": "Bottes plateforme 5 cm, finition vinyle noir, lacets rouges. Édition capsule.",
    "price": 29,
    "category": "collector",
    "tag": "3D lenticulaire",
    "source": "both"
  },
  {
    "id": "am-045",
    "name": "Mules Slides Logo Embossé",
    "image": "/products/am-045.svg",
    "description": "Claquettes EVA injecté, logo embossé sur la bride. Confort absolu été.",
    "price": 199,
    "category": "apparel",
    "tag": "Signature",
    "source": "youtube"
  },
  {
    "id": "am-046",
    "name": "Sneakers Low Magenta Suede",
    "image": "/products/am-046.svg",
    "description": "Baskets basses daim magenta, semelle gomme blanche. Boîte collector.",
    "price": 24,
    "category": "sneakers",
    "tag": "Pack x6",
    "source": "tiktok"
  },
  {
    "id": "am-047",
    "name": "Trainers Bicolore Cyan/Noir",
    "image": "/products/am-047.svg",
    "description": "Trainer vintage bicolore, languette épaisse, semelle gum. Coupe rétro 90s.",
    "price": 49,
    "category": "music",
    "tag": "Néo-Tokyo",
    "source": "prime"
  },
  {
    "id": "am-048",
    "name": "Chunky Sneakers Anime Beast",
    "image": "/products/am-048.svg",
    "description": "Chunky sole 6 cm, multi-couches mesh et cuir, broderie créature anime talon.",
    "price": 44,
    "category": "manga",
    "tag": "Premium",
    "source": "both"
  },
  {
    "id": "am-049",
    "name": "Sneakers Co-Lab Lovanet",
    "image": "/products/am-049.svg",
    "description": "Collaboration exclusive Lovanet. Numérotées sur la semelle.",
    "price": 24,
    "category": "daily",
    "tag": "Édition limitée",
    "source": "youtube"
  },
  {
    "id": "am-050",
    "name": "Chaussons Maison Anime Plush",
    "image": "/products/am-050.svg",
    "description": "Chaussons peluche imprimés personnages anime, semelle antidérapante.",
    "price": 29,
    "category": "poster",
    "tag": "Holo",
    "source": "tiktok"
  },
  {
    "id": "am-051",
    "name": "Vinyle OST Ruri no Houseki",
    "image": "/products/am-051.svg",
    "description": "Bande originale officielle pressée sur vinyle 180g coloré magenta translucide.",
    "price": 32,
    "category": "collector",
    "tag": "Phosphorescent",
    "source": "prime"
  },
  {
    "id": "am-052",
    "name": "Cassette Mixtape TikTok Edits",
    "image": "/products/am-052.svg",
    "description": "Mixtape K7 audio limitée à 300 ex, compilation des edits TikTok viraux.",
    "price": 49,
    "category": "apparel",
    "tag": "Set de 3",
    "source": "both"
  },
  {
    "id": "am-053",
    "name": "EP Digital Lovanet Lo-Fi",
    "image": "/products/am-053.svg",
    "description": "EP 6 titres lo-fi anime téléchargeable en FLAC et MP3 320kbps. Artwork HD inclus.",
    "price": 19,
    "category": "sneakers",
    "tag": "Art print",
    "source": "youtube"
  },
  {
    "id": "am-054",
    "name": "CD Collector Box Anime Beats",
    "image": "/products/am-054.svg",
    "description": "Double CD digipack, 24 titres remasterisés, livret 24 pages.",
    "price": 22,
    "category": "music",
    "tag": "Rétro",
    "source": "tiktok"
  },
  {
    "id": "am-055",
    "name": "Casque Audio Néon NLNQ",
    "image": "/products/am-055.svg",
    "description": "Casque circum-aural sans-fil 40h d'autonomie, anneaux LED réactifs au son.",
    "price": 59,
    "category": "manga",
    "tag": "Mural",
    "source": "prime"
  },
  {
    "id": "am-056",
    "name": "Platine Vinyle Compact Magenta",
    "image": "/products/am-056.svg",
    "description": "Platine vinyle Bluetooth coloris magenta, capot transparent, pré-ampli intégré.",
    "price": 39,
    "category": "daily",
    "tag": "3D lenticulaire",
    "source": "both"
  },
  {
    "id": "am-057",
    "name": "Single 7\" Opening Cyber",
    "image": "/products/am-057.svg",
    "description": "Single 7 pouces avec opening + ending, jaquette holographique.",
    "price": 25,
    "category": "poster",
    "tag": "Signature",
    "source": "youtube"
  },
  {
    "id": "am-058",
    "name": "Synthwave Pack Sample NLNQ",
    "image": "/products/am-058.svg",
    "description": "150 samples synthwave royalty-free, kicks, snares, leads, presets Serum.",
    "price": 34,
    "category": "collector",
    "tag": "Pack x6",
    "source": "tiktok"
  },
  {
    "id": "am-059",
    "name": "Manga Tome 1 Anime Moments",
    "image": "/products/am-059.svg",
    "description": "Premier tome 192 pages, format poche, jaquette réversible et marque-page collector.",
    "price": 27,
    "category": "apparel",
    "tag": "Néo-Tokyo",
    "source": "prime"
  },
  {
    "id": "am-060",
    "name": "BD Hardcover Lovanet Saga",
    "image": "/products/am-060.svg",
    "description": "Roman graphique cartonné 120 pages couleur, papier mat 150g.",
    "price": 79,
    "category": "sneakers",
    "tag": "Premium",
    "source": "both"
  },
  {
    "id": "am-061",
    "name": "Light Novel Lovanet Chronicles",
    "image": "/products/am-061.svg",
    "description": "Light novel illustré 320 pages, 12 illustrations couleur pleine page.",
    "price": 89,
    "category": "music",
    "tag": "Édition limitée",
    "source": "youtube"
  },
  {
    "id": "am-062",
    "name": "Doujinshi Édition Fan-Club",
    "image": "/products/am-062.svg",
    "description": "Doujinshi A5 64 pages, tirage limité 500 ex numérotés à la main.",
    "price": 249,
    "category": "manga",
    "tag": "Holo",
    "source": "tiktok"
  },
  {
    "id": "am-063",
    "name": "Manga Box Set Saison 1",
    "image": "/products/am-063.svg",
    "description": "Coffret carton rigide 6 premiers tomes + poster exclusif double face.",
    "price": 59,
    "category": "daily",
    "tag": "Phosphorescent",
    "source": "prime"
  },
  {
    "id": "am-064",
    "name": "Webtoon Print Anniversaire",
    "image": "/products/am-064.svg",
    "description": "Première impression papier d'un webtoon viral, format vertical 21×40 cm.",
    "price": 179,
    "category": "poster",
    "tag": "Set de 3",
    "source": "both"
  },
  {
    "id": "am-065",
    "name": "Artbook Storyboard Edition",
    "image": "/products/am-065.svg",
    "description": "Artbook 180 pages de storyboards bruts, croquis et planches d'animation.",
    "price": 39,
    "category": "collector",
    "tag": "Art print",
    "source": "youtube"
  },
  {
    "id": "am-066",
    "name": "Comics One-Shot ÑLLÑ Origin",
    "image": "/products/am-066.svg",
    "description": "Comics one-shot format US 32 pages couleur, couverture variante exclusive.",
    "price": 34,
    "category": "apparel",
    "tag": "Rétro",
    "source": "tiktok"
  },
  {
    "id": "am-067",
    "name": "Mug Thermoréactif Anime",
    "image": "/products/am-067.svg",
    "description": "Mug céramique 350ml qui révèle son artwork avec une boisson chaude.",
    "price": 14,
    "category": "sneakers",
    "tag": "Mural",
    "source": "prime"
  },
  {
    "id": "am-068",
    "name": "Gourde Inox Néon 750ml",
    "image": "/products/am-068.svg",
    "description": "Gourde double paroi inox, garde froid 24h / chaud 12h. Bouchon sport.",
    "price": 29,
    "category": "music",
    "tag": "3D lenticulaire",
    "source": "both"
  },
  {
    "id": "am-069",
    "name": "Tote Bag Canvas Manga",
    "image": "/products/am-069.svg",
    "description": "Sac tote 320g coton recyclé, sérigraphie deux couleurs grand format.",
    "price": 199,
    "category": "manga",
    "tag": "Signature",
    "source": "youtube"
  },
  {
    "id": "am-070",
    "name": "Tapis de Souris XXL RGB",
    "image": "/products/am-070.svg",
    "description": "Tapis 90×40 cm, contour LED RGB USB, surface micro-tissée pour souris gaming.",
    "price": 24,
    "category": "daily",
    "tag": "Pack x6",
    "source": "tiktok"
  },
  {
    "id": "am-071",
    "name": "Bougie Parfumée Tokyo Rain",
    "image": "/products/am-071.svg",
    "description": "Bougie cire de soja 200g, senteurs pluie, cèdre et yuzu. Mèche en bois.",
    "price": 49,
    "category": "poster",
    "tag": "Néo-Tokyo",
    "source": "prime"
  },
  {
    "id": "am-072",
    "name": "Plaid Sherpa Anime Moments",
    "image": "/products/am-072.svg",
    "description": "Plaid sherpa 150×200 cm ultra doux, imprimé all-over, doublure peluche.",
    "price": 44,
    "category": "collector",
    "tag": "Premium",
    "source": "both"
  }
];

export const videosSeed = [
  {
    "id": "LHtdKWJdif4",
    "title": "Attack on Titan",
    "description": "Several hundred years ago, humans were nearly exterminated by titans. Titans are typically several stories tall, seem to have no intelligence, devour human beings and, worst of all, seem to do it for the pleasure rather ",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg",
    "platform": "youtube",
    "animeId": 16498,
    "year": 2013,
    "score": 85
  },
  {
    "id": "6vMuWuWlW4I",
    "title": "Demon Slayer: Kimetsu no Yaiba",
    "description": "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transfo",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg",
    "platform": "tiktok",
    "animeId": 101922,
    "year": 2019,
    "score": 83
  },
  {
    "id": "RIyb52EMx8c",
    "title": "JUJUTSU KAISEN",
    "description": "A boy fights... for \"the right death.\" Hardship, regret, shame: the negative feelings that humans feel become Curses that lurk in our everyday lives. The Curses run rampant throughout the world, capable of leading people",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
    "platform": "prime",
    "animeId": 113415,
    "year": 2020,
    "score": 84
  },
  {
    "id": "NlJZ-YgAt-c",
    "title": "Death Note",
    "description": "Light Yagami is a genius high school student who is about to learn about life through a book of death. When a bored shinigami, a God of Death, named Ryuk drops a black notepad called a Death Note, Light receives power ov",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg",
    "platform": "youtube",
    "animeId": 1535,
    "year": 2006,
    "score": 84
  },
  {
    "id": "AhqVltWDqFA",
    "title": "My Hero Academia",
    "description": "What would the world be like if 80 percent of the population manifested extraordinary superpowers called “Quirks” at age four? Heroes and villains would be battling it out everywhere! Becoming a hero would mean learning ",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21459-yeVkolGKdGUV.jpg",
    "platform": "tiktok",
    "animeId": 21459,
    "year": 2016,
    "score": 77
  },
  {
    "id": "d6kBeJjTGnY",
    "title": "Hunter x Hunter (2011)",
    "description": "A new adaption of the manga of the same name by Togashi Yoshihiro. A Hunter is one who travels the world doing all sorts of dangerous tasks. From capturing criminals to searching deep within uncharted lands for any lost ",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/11061-8WkkTZ6duKpq.jpg",
    "platform": "prime",
    "animeId": 11061,
    "year": 2011,
    "score": 89
  },
  {
    "id": "RzmFKUDOUgw",
    "title": "One-Punch Man",
    "description": "Saitama has a rather peculiar hobby, being a superhero, but despite his heroic deeds and superhuman abilities, a shadow looms over his life. He's become much too powerful, to the point that every opponent ends up defeate",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21087-sHb9zUZFsHe1.jpg",
    "platform": "youtube",
    "animeId": 21087,
    "year": 2015,
    "score": 83
  },
  {
    "id": "XfQUjYsVBrE",
    "title": "Tokyo Ghoul",
    "description": "The suspense horror/dark fantasy story is set in Tokyo, which is haunted by mysterious \"ghouls\" who are devouring humans. People are gripped by the fear of these ghouls whose identities are masked in mystery. An ordinary",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20605-RCJ7M71zLmrh.jpg",
    "platform": "prime",
    "animeId": 20605,
    "year": 2014,
    "score": 76
  },
  {
    "id": "zLaVP8IhIuc",
    "title": "Attack on Titan Season 2",
    "description": "Eren Jaeger swore to wipe out every last Titan, but in a battle for his life he wound up becoming the thing he hates most. With his new powers, he fights for humanity's freedom facing the monsters that threaten his home.",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20958-Y7eQdz9VENBD.jpg",
    "platform": "youtube",
    "animeId": 20958,
    "year": 2017,
    "score": 85
  },
  {
    "id": "-G9BqkgZXRA",
    "title": "Naruto",
    "description": "Naruto Uzumaki, a hyperactive and knuckle-headed ninja, lives in Konohagakure, the Hidden Leaf village. Moments prior to his birth, a huge demon known as the Kyuubi, the Nine-tailed Fox, attacked Konohagakure and wreaked",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20-HHxhPj5JD13a.jpg",
    "platform": "prime",
    "animeId": 20,
    "year": 2002,
    "score": 80
  },
  {
    "id": "C8Jl_-b7ju0",
    "title": "Sword Art Online",
    "description": "In the near future, a Virtual Reality Massive Multiplayer Online Role-Playing Game (VRMMORPG) called Sword Art Online has been released where players control their avatars with their bodies using a piece of technology ca",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/11757-TlEEV9weG4Ag.jpg",
    "platform": "youtube",
    "animeId": 11757,
    "year": 2012,
    "score": 70
  },
  {
    "id": "k4xGqY5IDBE",
    "title": "Your Name.",
    "description": "Mitsuha Miyamizu, a high school girl, yearns to live the life of a boy in the bustling city of Tokyo—a dream that stands in stark contrast to her present life in the countryside. Meanwhile in the city, Taki Tachibana liv",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg",
    "platform": "tiktok",
    "animeId": 21519,
    "year": 2016,
    "score": 86
  },
  {
    "id": "Sy4bPCuzfiQ",
    "title": "A Silent Voice",
    "description": "After transferring into a new school, a deaf girl, Shouko Nishimiya, is bullied by the popular Shouya Ishida. As Shouya continues to bully Shouko, the class turns its back on him. Shouko transfers and Shouya grows up as ",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20954-f30bHMXa5Qoe.jpg",
    "platform": "prime",
    "animeId": 20954,
    "year": 2016,
    "score": 88
  },
  {
    "id": "EHzBhrncmac",
    "title": "Attack on Titan Season 3",
    "description": "Eren and his companions in the 104th are assigned to the newly-formed Levi Squad, whose assignment is to keep Eren and Historia safe given Eren's newly-discovered power and Historia's knowledge and pedigree. Levi and Erw",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/99147-HACsFVrynFf5.jpg",
    "platform": "youtube",
    "animeId": 99147,
    "year": 2018,
    "score": 86
  },
  {
    "id": "tEPneR3KFK8",
    "title": "My Hero Academia Season 2",
    "description": "Taking off right after the last episode of the first season. The school is temporarily closed due to security. When U.A. restarts, it is announced that the highly anticipated School Sports Festival will soon be taking pl",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21856-wtSHgeHFmzdG.jpg",
    "platform": "tiktok",
    "animeId": 21856,
    "year": 2017,
    "score": 79
  },
  {
    "id": "MUCN-JwUvbY",
    "title": "Attack on Titan Final Season",
    "description": "It’s been four years since the Scout Regiment reached the shoreline, and the world looks different now. Things are heating up as the fate of the Scout Regiment—and the people of Paradis—are determined at last. However, E",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/110277-iuGn6F5bK1U1.jpg",
    "platform": "prime",
    "animeId": 110277,
    "year": 2021,
    "score": 87
  },
  {
    "id": "ApLudqucq-s",
    "title": "The Promised Neverland",
    "description": "Emma, Norman and Ray are the brightest kids at the Grace Field House orphanage. And under the care of the woman they refer to as “Mom,” all the kids have enjoyed a comfortable life. Good food, clean clothes and the perfe",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101759-MhlCoeqnODso.jpg",
    "platform": "youtube",
    "animeId": 101759,
    "year": 2019,
    "score": 83
  },
  {
    "id": "vAuTJFzjNLs",
    "title": "Assassination Classroom",
    "description": "The students of class 3-E have a mission: kill their teacher before graduation. He has already destroyed the moon, and has promised to destroy the Earth if he can not be killed within a year. But how can this class of mi",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20755-D4ipww9U8YkC.jpg",
    "platform": "tiktok",
    "animeId": 20755,
    "year": 2015,
    "score": 79
  },
  {
    "id": "mV39saBlBLI",
    "title": "Mob Psycho 100",
    "description": "The story revolves around \"Mob,\" a boy who will explode if his emotional capacity reaches 100%. This boy with psychic powers earned his nickname \"Mob\" because he does not stand out among other people. He keeps his psychi",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21507-Qx8bGsLXUgLo.jpg",
    "platform": "prime",
    "animeId": 21507,
    "year": 2016,
    "score": 84
  },
  {
    "id": "v4yLeNt-kCU",
    "title": "Chainsaw Man",
    "description": "Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying his debt by harvesting devil corpses with Pochita. One day, ",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg",
    "platform": "youtube",
    "animeId": 127230,
    "year": 2022,
    "score": 83
  },
  {
    "id": "vFfXjuVA1Jk",
    "title": "Re:ZERO -Starting Life in Another World-",
    "description": "In the story, Subaru Natsuki is an ordinary high school student who is lost in an alternate world, where he is rescued by a beautiful, silver-haired girl. He stays near her to return the favor, but the destiny she is bur",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21355-f9SjOfEJMk5P.jpg",
    "platform": "tiktok",
    "animeId": 21355,
    "year": 2016,
    "score": 81
  },
  {
    "id": "3aL0gDZtFbE",
    "title": "Your lie in April",
    "description": "Piano prodigy Arima Kousei dominated the competition and all child musicians knew his name. But after his mother, who was also his instructor, passed away, he had a mental breakdown while performing at a recital. This re",
    "thumbnail": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20665-j4kSsfhfkM24.jpg",
    "platform": "prime",
    "animeId": 20665,
    "year": 2014,
    "score": 84
  }
];

export const countdownSeed = [
  {
    "title": "Solo Leveling — prochain arc",
    "date": "2026-08-22T20:00:00+02:00",
    "platform": "Prime Video",
    "image": "/products/am-005.svg"
  },
  {
    "title": "Jujutsu Kaisen — compilation moments cultes",
    "date": "2026-09-06T18:30:00+02:00",
    "platform": "YouTube",
    "image": "/products/am-003.svg"
  },
  {
    "title": "Demon Slayer — short vertical spécial",
    "date": "2026-09-18T21:00:00+02:00",
    "platform": "TikTok",
    "image": "/products/am-007.svg"
  },
  {
    "title": "Attack on Titan — marathon Lovanet",
    "date": "2026-10-01T19:00:00+02:00",
    "platform": "Lecteur vidéo",
    "image": "/products/am-001.svg"
  }
];

export const languages = [
  { code: "en", name: "English", headline: "Lovanet official anime platform" },
  { code: "es", name: "Español", headline: "Lovanet plataforma oficial anime" },
  { code: "de", name: "Deutsch", headline: "Lovanet offizielle Anime-Plattform" },
  { code: "it", name: "Italiano", headline: "Lovanet piattaforma anime ufficiale" },
  { code: "pt", name: "Português", headline: "Lovanet plataforma anime oficial" },
  { code: "ja", name: "日本語", headline: "Lovanet 公式アニメプラットフォーム" },
  { code: "zh", name: "中文", headline: "Lovanet 官方动漫平台" },
];
