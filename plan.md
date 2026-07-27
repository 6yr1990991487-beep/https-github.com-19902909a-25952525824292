# plan.md — Reconstruction de Lovanet.fr (FARM: FastAPI + React + MongoDB)

## 1) Objectives
- Reconstruire la plateforme « Lovanet » à l’identique (au mieux techniquement) : pages, design, navigation, assets.
- Recréer les fonctionnalités dynamiques visibles + auto-sync, stockage MongoDB, endpoints `/api`.
- Respecter les contraintes : ne pas modifier `REACT_APP_BACKEND_URL`, `MONGO_URL`.

### Objectif UI/UX (priorité actuelle)
- Refondre progressivement l’expérience UI/UX en **incréments sûrs** (sans casser le site) :
  - carrousels/rails dynamiques
  - effets 3D ciblés
  - pages média (Catalogue, Prime Video, YouTube, Lecteurs vidéo) avec **cartes compactes HD**, lecteurs héro, interactions premium.

### Objectif SEO / Référencement
- Meta tags, OpenGraph/Twitter, canonical.
- Données structurées JSON‑LD (Organization/WebSite/WebPage/Product/VideoObject/Article).
- Sitemaps/robots/RSS.

#### Objectif SEO — Merchant listings / Fiches de marchand (P0)
- Corriger les erreurs Search Console « Fiches de marchand » (signalées en **production**) sur `/shop` :
  - `image`, `aggregateRating`, `review`
  - `offers.availability`, `offers.shippingDetails`, `offers.hasMerchantReturnPolicy`
  - identifiants `brand`/`sku` + `mpn` (fallback)
  - éviter des microdata concurrentes incomplètes.

### Objectif Search Console
- Conserver la meta de vérification + automatisation future.

### Objectif — Refonte Premium multi‑pages (Phase 15)
- Appliquer des améliorations premium demandées sur **Prime Video / YouTube / Lecteurs vidéo** + extensions possibles sur d’autres pages.
- Décision utilisateur : *aller au plus rapide, sans casser le site, puis dérouler le reste progressivement*.

### Objectif — Bannière “capture” Anime Moments (P0 prod)
- Problème vu en **production** sur la page **Anime Moments** (route `/anime-moments`).
- But : **conserver la bannière identique à avant** (overlays/spots/effets), **supprimer uniquement** le carrousel/roulette de **cartes vidéo défilantes**, et **ajouter la vidéo utilisateur** en overlay centré.
- Ajustement validé : garder un rendu **sobre** (annuler le boost lumineux extrême testé).

### Objectif (NOUVEAU) — Traduction automatique fiable (P0 UX)
- Besoin confirmé : traduction automatique pour **tout le contenu non traduit** :
  - cartes (Catalogue/Prime/YouTube)
  - trailers
  - articles
  - produits
  - vidéos externes (sources externes)
- Choix utilisateur : **1C (tout)**, **2C (bouton rapide + IA quand dispo)**, **4C (auto + bouton manuel)**.
- Contrainte coût : **si l’IA est payante, ne pas la sélectionner**. Sinon choisir automatiquement le moteur le plus fiable.
- Direction retenue :
  1) **Prioriser une solution gratuite/intégrée** (mécanisme existant type widget/GoogleTranslate) + auto/bouton.
  2) **N’évaluer une IA** (backend) qu’en second recours si aucune option gratuite fiable n’existe.

> Note environnement : beaucoup de retours sont vus en **production** ; les correctifs sont réalisés en **preview**, puis un **redéploiement** est nécessaire côté utilisateur.

---

## 2) Implementation Steps

### Phase 1 — POC Core (Isolation) ✅ COMPLETED
### Phase 2 — V1 App Development (MVP) ✅ COMPLETED
### Phase 3 — External Auto-Sync Parity + Fidelity UI ✅ COMPLETED
### Phase 4 — Import du projet source ✅ COMPLETED
### Phase 5 — SEO + Search Console + TikTok + Multi-domain ✅ COMPLETED (preview)
### Phase 6 — Search Console OAuth ✅ COMPLETED (preview)
### Phase 7 — Hubs 3D ⏳ IN PROGRESS (hors priorité immédiate)
### Phase 8 — UI / Brand polish ⏳ IN PROGRESS (hors priorité immédiate)
### Phase 9 — Nouvelle page d’arrivée ✅ COMPLETED
### Phase 10 — ThemeBubble 500+ ✅ COMPLETED
### Phase 11 — Remplacements vidéos utilisateur ✅ COMPLETED
### Phase 12 — Refonte Actualités premium ⏳ IN PROGRESS (non bloquant)

---

### Phase 14 — Refonte Catalogue + SEO bloquant + validation ⏳ IN PROGRESS

#### Phase 14.1 — Base Catalogue ✅
- Carrousel circulaire remplacé par **lecteur géant** + commandes + PiP.
- Favoris persistants.

#### Phase 14.2 — Ajustements Catalogue ✅ MAJORITAIREMENT FAIT
- Autoplay muet + son au 1er clic (conforme contraintes navigateurs).
- Masquage UI/branding YouTube au maximum (paramètres embed).
- Sélection auto + panneau de proposition.
- Cartes : blister verre, plus transparentes, suppression calques assombrissants.
- Bulle couleur pilotant les variables CSS des cartes.
- Nettoyage textes UI demandés.
- Toggle « Traduire les cartes » (fallback title/description) ✅ (NB : ceci est **un fallback**, pas une vraie traduction).
- Landing : suppression de textes marketing (`Sélection collector`, `Expérience premium`).

#### Phase 14.3 — SEO bloquant ✅
- `/actualites` : une seule meta description.

#### Phase 14.4 — Merchant listings `/shop` (P0 prod) ✅ IMPLÉMENTÉ EN PREVIEW
- JSON‑LD enrichi : `image`, `aggregateRating`, `review`, `offers.availability`, `offers.shippingDetails`, `offers.hasMerchantReturnPolicy`, `brand`, `sku`, `mpn`, `inventoryLevel`, `itemCondition`.
- Suppression des microdata Product/Offer incomplètes dans la grille HTML (évite entités concurrentes).

#### Phase 14.5 — Catalogue compact + netteté (P0 prod) ✅ IMPLÉMENTÉ EN PREVIEW
- Réduction forte des cartes (~30%) + densification.
- Grille densifiée (4 colonnes demandées) + réduction paddings/typos/boutons.
- Priorité aux images `extraLarge`, `decoding="async"`, `fetchPriority` au-dessus de la ligne de flottaison, scaling réduit.

#### Phase 14.6 — Validation & preuves ⏳ TODO
- Captures : `/anime-catalog`, `/shop`, `/actualites`.
- Tests frontend complets + corrections.
- Rappel : redéploiement requis pour voir les changements en production.

---

### Phase 15 — Refonte Premium multi‑pages (Prime Video / YouTube / Lecteurs vidéo / autres pages) ⏳ IN PROGRESS

**Principe** : livrer par **lots rapides** et **stables**, sans refonte risquée globale.

#### Lot 1 — Prime Video ✅ TERMINÉ + TESTÉ (iteration_18.json)
Objectif : appliquer le **pattern Catalogue** sur Prime Video, en conservant l’architecture existante.
- ✅ **Cartes compactes HD** (grilles denses, cartes réduites, miniatures nettes, couleurs rehaussées).
- ✅ **Grand bloc héro Prime** en haut : clic carte → projection dans le héro.
- ✅ **Prévisualisation “bande‑annonce auto”** (Hover desktop / tap mobile) via `HoverPreview`.
- ✅ **Panneau “À regarder ce soir”** (favoris locaux persistants).
- ✅ **Barre “reprendre plus tard”** (historique local persistant).
- ✅ **Badges intelligents** (heuristiques : nouveauté/populaire/long format/film + ambiance).
- ✅ **Tri émotionnel simple** (mood filter basé sur genres).
- ✅ **Bloc “similaire à ce titre”** (heuristique genres/score).
- ✅ **Fallback visuel propre** si YouTube indisponible (évite UI cassée).
- ✅ **Lecteur principal Prime** stabilisé (YouTubeEmbed + fallback).

> Note : disponibilité YouTube variable. Le fallback est considéré “comportement attendu” et testé.

#### Lot 2 — YouTube (réplique du pattern) ⏳ À DÉMARRER
1) Hero vidéo géant type chaîne premium.
2) Miniatures unifiées style premium (cartes compactes HD, 4 colonnes denses, previews hover/tap).
3) Playlist auto (locale) + lecture continue.
4) Panneaux : “À ne pas manquer”, “les plus regardées”.
5) Filtres : “shorts / longs formats”.

#### Lot 3 — Lecteurs vidéo (unification) ⏳ À DÉMARRER
1) Lecteur géant « universel » (YouTube/Prime/TikTok/vidéos internes) avec UI cohérente.
2) PiP premium renforcé (titre + suivant + fermer).
3) Mode théâtre/portrait.
4) Overlay minimaliste (boutons discrets).

#### Lot 4+ (optionnel, selon stabilité) — Extensions ⏳ FUTUR
- Catalogue : switch « ultra-compact / premium ».
- Actualités : mur plus compact + priorités.
- Boutique : cartes compactes + passerelles catalogue ↔ shop.

---

### Phase 16 — Bannière “capture” Anime Moments (P0 prod) ⏳ IN PROGRESS
**Contexte** : retours utilisateur vus en production sur la page **Anime Moments**.

#### État actuel (preview)
- ✅ Bannière d’origine restaurée via `HeroCarousel` (effets, spots, overlays).
- ✅ Carrousel/roulette de **cartes vidéo** neutralisé (plus de rendu animé/carte).
- ✅ Vidéo utilisateur ajoutée en overlay centré, autoplay muet.
- ✅ Correction ordre des calques (z-index) pour que la vidéo ne soit pas masquée par les effets.
- ✅ Rollback du boost lumineux extrême (rendu plus sobre).

#### Objectif
- Conforme à la production demandée : bannière identique + vidéo centrée + sans carrousel cartes.

---

### Phase 17 — Traduction automatique fiable (P0 UX) ⏳ EN COURS
Objectif : ajouter une traduction automatique pour les contenus non traduits **sur toutes les pages concernées**, avec **auto + option manuelle**, et **sans IA payante**.

#### Phase 17.1 — Audit des points de traduction (frontend) ✅
- Cartes/sections à couvrir :
  - Catalogue (`AnimeCatalog.tsx`) : cartes + description + bloc lecteur/trailer.
  - Prime Video (`PrimeVideo.tsx`) : cartes + hero + descriptions.
  - YouTube (`ChaineYoutubeManga.tsx` / autres routes vidéo) : titres + descriptions.
  - Actualités : titre + résumé (si nécessaire).
  - Boutique : titres + descriptions.
- Décision utilisateur confirmée : **option C = auto + bouton manuel**.

#### Phase 17.2 — Solution gratuite/intégrée (prioritaire) ⏳ EN COURS
- Implémentation retenue après validation :
  - **endpoint backend `/api/translate` gratuit** avec cache Mongo et fallback web gratuit sans clé payante ;
  - **traduction auto activée par défaut** sur les pages externes ciblées ;
  - **bouton manuel de bascule/réactivation** sur Catalogue et Prime Video ;
  - persistance locale pour éviter de redemander inutilement la même traduction.
- Objectif : traduction UI/DOM “fiable” sans coût, cohérente sur toutes les pages.

#### Phase 17.3 — Option IA (uniquement si gratuite) ❌ ÉCARTÉE
- Contrainte utilisateur : **aucune IA payante**.
- Approche retenue : traduction gratuite + cache + contrôle manuel.

#### Phase 17.4 — Validation ⏳
- Tests UI : bascule traduction auto/manuelle, persistance, pas de casse SEO.
- Vérifier que la traduction n’introduit pas de doublons meta/JSON-LD.
### Phase 18 — Fallback vidéos YouTube privées / indisponibles (P0 production) ⏳ EN COURS
Objectif : empêcher l’affichage de miniatures cassées, previews mortes et lecteurs YouTube privés en les remplaçant par des médias de secours du site.

#### Phase 18.1 — Détection backend ✅
- Nouveau endpoint `/api/youtube/availability` pour sonder rapidement la disponibilité d’IDs YouTube.
- Le sync YouTube backend marque les vidéos privées/supprimées en `availability_status = private_or_unavailable`.
- L’API `/api/videos` exclut désormais ces vidéos côté frontend.

#### Phase 18.2 — Fallback frontend partagé ✅/⏳
- Nouveau composant `ResilientVideoFrame` : si la vidéo tombe en erreur, le site bascule sur une vidéo locale de secours.
- Nouveau helper `mediaFallback.ts` : image locale de secours + vidéo locale de secours.
- `HoverPreview` tient compte du cache de disponibilité et n’essaie plus de lire les vidéos déjà connues comme privées.

#### Phase 18.3 — Application sur pages clés ⏳ EN COURS
- Cible immédiate : `ChaineYoutube.tsx`, `ChaineYoutubeManga.tsx`, `LecteursVideo.tsx`, `MangaUniverseBanner.tsx`, `RecentEpisodesCarousel.tsx`, `ShopHeroBanner.tsx`.
- Étape suivante : validation visuelle + tests automatisés frontend.


---

## 3) Next Actions (ordre d’exécution — MIS À JOUR)
1) **Phase 17** : Traduction automatique fiable (audit + solution gratuite intégrée auto+bouton) → implémentation preview + captures.
2) **Phase 14.6 Validation** : captures + tests frontend + corrections (Catalogue/Shop/Actualités).
3) **Phase 15 Lot 2** : YouTube (réplique pattern Prime/Catalogue).
4) **Phase 15 Lot 3** : Lecteurs vidéo (unification + PiP premium).
5) **Redéploiement** par l’utilisateur pour pousser en production :
   - Merchant listings `/shop`
   - Catalogue compact + netteté
   - Prime Video (Lot 1)
   - Anime Moments (bannière capture corrigée + rollback)
   - Traduction auto (Phase 17)
   - puis YouTube/Lecteurs vidéo quand prêts
6) Post‑déploiement : validation Search Console / Rich Results sur la production.

---

## 4) Success Criteria
- Catalogue :
  - lecteur géant + PiP
  - autoplay muet + son au 1er clic
  - cartes compactes (~-30%), grilles denses, miniatures nettes
  - toggle traduction existant (fallback) + **traduction fiable** (Phase 17)
- SEO :
  - `/shop` : Product JSON‑LD conforme Merchant listings (champs requis) + pas de microdata concurrentes
  - `/actualites` : une seule meta description
- Prime Video / YouTube / Lecteurs vidéo (Phase 15) :
  - livraison incrémentale stable (pas de régression)
  - Prime Video : ✅ cartes compactes HD + héro + previews + favoris/history + fallback propre (testé)
  - YouTube : hero + cartes unifiées + playlist locale
  - Lecteurs vidéo : expérience unifiée + PiP renforcé
- Anime Moments (Phase 16) :
  - bannière top = overlays/spots/effets identiques à avant
  - suppression uniquement du carrousel/roulette de cartes vidéo défilantes
  - vidéo utilisateur centrée, réduite, semi‑transparente, autoplay muet
  - rendu vidéo sobre (pas de boost blanc/brillance extrême)
- Traduction automatique (Phase 17) :
  - auto + bouton manuel
  - couvre cartes/trailers/articles/produits/vidéos externes
  - solution gratuite prioritaire ; IA seulement si gratuite
  - pas de régression SEO

---

## 5) Current Execution Order (mis à jour)
1) Phase 17 Traduction automatique fiable ⏳
2) Validation Phase 14.6 (captures/tests) ⏳
3) Phase 15 Lot 2 YouTube ⏳
4) Phase 15 Lot 3 Lecteurs vidéo ⏳
5) Déploiement côté utilisateur → production (obligatoire)
