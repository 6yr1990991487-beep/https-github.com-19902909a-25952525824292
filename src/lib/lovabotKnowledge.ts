// Base de connaissances locale de Lova-Bot (100% offline, gratuite).
export type BotId = "lova-bot" | "lova-ai" | "lova-king";

export type KnowledgeEntry = {
  id: string;
  keywords: string[];
  answer: string;
  link?: { label: string; to: string };
};

export const SITE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "portail",
    keywords: ["portail", "accueil", "home", "page principale", "landing", "demarrer", "commencer"],
    answer:
      "Le Portail est la page d'accueil de Lovanet : bannière vidéo, trailers en avant-première et accès rapide vers toutes les plateformes (YouTube, TikTok, Prime Vidéo, Catalogue, Boutique).",
    link: { label: "Aller au Portail", to: "/" },
  },
  {
    id: "catalogue",
    keywords: ["catalogue", "anime catalog", "carrousel 3d", "trailer", "trailers", "series", "films", "filtre", "filtres"],
    answer:
      "Le Catalogue regroupe les animes avec un carrousel 3D, des filtres par genre/année/statut, un lecteur multi-langues (VO, VF, VOSTFR) et le scroll infini. Astuce : tu peux changer la couleur des cartes via la bulle Palette dans la barre de rattachement à gauche.",
    link: { label: "Ouvrir le Catalogue", to: "/anime-catalog" },
  },
  {
    id: "youtube",
    keywords: ["youtube", "chaine", "chaîne", "video youtube", "abonner", "abonnement"],
    answer:
      "La page Chaîne YouTube affiche les dernières vidéos synchronisées automatiquement (toutes les 5 minutes). Si une vidéo récente manque, utilise le bouton de synchronisation manuelle en haut de la page.",
    link: { label: "Voir la chaîne", to: "/chaine-youtube" },
  },
  {
    id: "tiktok",
    keywords: ["tiktok", "tik tok", "shorts", "miniature", "vertical"],
    answer:
      "La page TikTok liste les vidéos courtes avec leurs miniatures. La synchro est automatique ; le bouton de sync manuel force la mise à jour et régénère les miniatures manquantes.",
    link: { label: "Ouvrir TikTok", to: "/tiktok" },
  },
  {
    id: "prime",
    keywords: ["prime", "prime video", "amazon", "streaming", "vod"],
    answer:
      "Prime Vidéo présente le catalogue de trailers et fiches avec lecteur multi-doublage (VO / VF / VOSTFR) et sous-titres.",
    link: { label: "Ouvrir Prime Vidéo", to: "/prime-video" },
  },
  {
    id: "shop",
    keywords: ["boutique", "shop", "magasin", "acheter", "poster", "collector", "produit", "produits", "panier", "commande", "livraison", "prix"],
    answer:
      "La Boutique propose posters, éditions collector, textiles et goodies. Ajoute au panier depuis une fiche produit : le panier s'ouvre dans un panneau transparent. Tu peux aussi ouvrir l'accès rapide Magasin depuis la barre de bulles à gauche.",
    link: { label: "Voir la boutique", to: "/shop" },
  },
  {
    id: "commande",
    keywords: ["suivi", "suivre ma commande", "tracking", "colis", "expedition", "livree"],
    answer:
      "Le suivi de commande est disponible depuis ton profil : entre ton numéro de commande pour voir la timeline animée (préparation, expédition, livraison).",
    link: { label: "Mon profil", to: "/profile" },
  },
  {
    id: "compte",
    keywords: ["compte", "connexion", "connecter", "login", "inscription", "google", "mot de passe", "profil"],
    answer:
      "Tu peux créer un compte ou te connecter avec Google. Ton profil garde tes favoris, ton historique et le suivi de tes commandes.",
    link: { label: "Se connecter", to: "/login" },
  },
  {
    id: "actualites",
    keywords: ["actualite", "actualités", "news", "article", "articles", "traduction", "langue", "langues"],
    answer:
      "La page Actualités agrège les flux d'infos anime/manga. Une barre de langues permet de traduire un article à la volée en 8 langues.",
    link: { label: "Lire les actualités", to: "/actualites" },
  },
  {
    id: "aihub",
    keywords: ["ai", "ai hub", "ia", "intelligence", "hub"],
    answer:
      "L'AI Hub réunit les outils et expériences IA de Lovanet, avec sa bannière vidéo immersive.",
    link: { label: "Ouvrir l'AI Hub", to: "/ai-hub" },
  },
  {
    id: "leaderboard",
    keywords: ["classement", "leaderboard", "score", "points", "jeu", "jeux", "snake", "quiz", "memory"],
    answer:
      "Les mini-jeux (Snake, Memory, Quiz) rapportent des points et le classement global se consulte sur la page Leaderboard.",
    link: { label: "Voir le classement", to: "/leaderboard" },
  },
  {
    id: "countdown",
    keywords: ["countdown", "sortie", "sorties", "a venir", "prochain episode", "calendrier"],
    answer:
      "La page Anime Countdown affiche les prochaines sorties avec un compte à rebours en temps réel.",
    link: { label: "Voir les sorties", to: "/anime-countdown" },
  },
  {
    id: "theme",
    keywords: ["theme", "thème", "couleur", "couleurs", "palette", "personnaliser", "apparence", "sombre", "neon"],
    answer:
      "La bulle Thème (barre de rattachement à gauche) change les couleurs du site. Le thème par défaut est « Menthe Vibrant Cypher ». Tu peux aussi activer/désactiver la teinte des panneaux avec l'icône palette dans l'entête d'un panneau.",
  },
  {
    id: "panneaux",
    keywords: ["bulle", "bulles", "panneau", "panneaux", "barre", "rattachement", "dock", "deplacer", "glisser"],
    answer:
      "Les bulles flottantes à gauche ouvrent des panneaux en verre 3D : thème, couleurs des cartes, accès rapide, magasin, réglages 3D. Chaque panneau se déplace par glisser sur son entête (ou appui long) et garde sa position même en changeant de page.",
  },
  {
    id: "navigation",
    keywords: ["menu", "navigation", "acces rapide", "accès rapide", "chercher", "trouver page"],
    answer:
      "Le menu de navigation est accessible en haut (PC) et via l'accès rapide sur mobile : boutons Portail, Catalogue, YouTube, TikTok, Prime, AI, Boutique, Actualités, Profil. Les listes de boutons défilent par simple glissement.",
  },
  {
    id: "lecteur",
    keywords: ["lecteur", "player", "preview", "lecture", "son", "audio", "vf", "vo", "vostfr", "sous titre", "sous-titres", "pip"],
    answer:
      "Le lecteur propose VO, VF et VOSTFR quand la piste existe, plus le mode mini (PiP) qui suit ta navigation. Sur mobile, la lecture d'un trailer bloque le défilement automatique du carrousel tant que la vidéo tourne.",
  },
  {
    id: "sync",
    keywords: ["sync", "synchro", "synchronisation", "manquante", "pas a jour", "cache", "recharger", "rafraichir"],
    answer:
      "Les vidéos se synchronisent automatiquement toutes les 5 minutes. Si quelque chose manque : bouton de sync manuelle sur la page concernée, ou la bulle « recharger » qui vide le cache local du site.",
  },
  {
    id: "install",
    keywords: ["application", "app", "installer", "pwa", "mobile", "telephone", "hors ligne"],
    answer:
      "Lovanet s'installe comme application (PWA) : accepte l'invite d'installation ou utilise « Ajouter à l'écran d'accueil ». L'app garde tes réglages de thème et de panneaux.",
  },
  {
    id: "contact",
    keywords: ["contact", "aide", "support", "probleme", "bug", "partenariat", "email"],
    answer:
      "Pour une demande, un bug ou un partenariat, passe par la page Contact : on répond par e-mail.",
    link: { label: "Nous contacter", to: "/contact" },
  },
  {
    id: "legal",
    keywords: ["mentions", "legales", "cgv", "confidentialite", "cookies", "rgpd", "donnees"],
    answer:
      "Les mentions légales, CGV et la politique de confidentialité sont regroupées sur la page Légal.",
    link: { label: "Infos légales", to: "/legals" },
  },
  {
    id: "prix-bot",
    keywords: ["gratuit", "payant", "abonnement bot", "cout", "credit"],
    answer:
      "Moi, Lova-Bot, je suis 100% gratuit et je réponds directement depuis le site, sans compte ni abonnement.",
  },
];

export const SUGGESTIONS = [
  "Où trouver les trailers ?",
  "Comment changer le thème ?",
  "Une vidéo YouTube manque",
  "Comment suivre ma commande ?",
  "Comment installer l'application ?",
];

export const BOT_GREETINGS: Record<BotId, string> = {
  "lova-bot":
    "Salut ! Je suis Lova-Bot, ton guide sur Lovanet. Pose-moi une question sur les pages, les vidéos, la boutique ou la personnalisation — c'est gratuit.",
  "lova-ai":
    "Lova-AI en ligne. Je t'oriente vers le bon contenu : catalogue, filtres, langues du lecteur, recommandations.",
  "lova-king":
    "Lova King AI, gardien de l'écosystème. Je réponds sur les comptes, les commandes, la sécurité et les infos légales.",
};

const STOP_WORDS = new Set([
  "le","la","les","un","une","des","de","du","d","l","je","tu","il","on","nous","vous","ils","est","es","suis","et","ou","à","a","au","aux","en","dans","pour","par","sur","que","qui","quoi","comment","où","ou'","quel","quelle","quels","quelles","pas","ne","plus","mon","ma","mes","ton","ta","tes","son","sa","ses","ce","cet","cette","c","s","y","the","how","what","where","is","to","of","my","i",
]);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string) =>
  normalize(value)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

export type BotAnswer = {
  text: string;
  link?: { label: string; to: string };
  matched: boolean;
};

export function answerQuestion(question: string, botId: BotId = "lova-bot"): BotAnswer {
  const raw = normalize(question);
  if (!raw) return { text: BOT_GREETINGS[botId], matched: false };

  if (/^(salut|bonjour|hello|coucou|hey|bonsoir|yo)\b/.test(raw)) {
    return { text: BOT_GREETINGS[botId], matched: true };
  }
  if (/(merci|super|genial|parfait)/.test(raw)) {
    return { text: "Avec plaisir ! Une autre question sur Lovanet ?", matched: true };
  }

  const tokens = tokenize(question);
  let best: { entry: KnowledgeEntry; score: number } | null = null;

  for (const entry of SITE_KNOWLEDGE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const key = normalize(keyword);
      if (!key) continue;
      if (raw.includes(key)) score += key.includes(" ") ? 4 : 3;
      else if (tokens.some((t) => t === key || (t.length > 4 && key.startsWith(t)) || (key.length > 4 && t.startsWith(key)))) {
        score += 2;
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }

  if (!best) {
    return {
      text:
        "Je n'ai pas la réponse exacte à ça. Je peux t'aider sur : les pages du site (Portail, Catalogue, YouTube, TikTok, Prime, Boutique, Actualités, AI Hub), le lecteur et les langues, la personnalisation (thème, bulles, couleurs des cartes), les comptes et les commandes.",
      matched: false,
    };
  }

  return { text: best.entry.answer, link: best.entry.link, matched: true };
}
