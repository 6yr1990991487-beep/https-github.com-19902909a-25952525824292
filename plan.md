# plan.md — Reconstruction de Lovanet.fr (FARM: FastAPI + React + MongoDB)

## 1) Objectives
- Reconstruire **Lovanet.fr à l’identique** (au mieux techniquement) : **toutes les pages accessibles**, design, mise en page, typographies/couleurs, navigation.
- Reprendre et servir **assets** (images/vidéos/fichiers), **liens**, **redirections** et comportements UI.
- Recréer les **fonctionnalités dynamiques** visibles ET les **configurations de synchronisation externe** (auto-sync) :
  - **YouTube** (sync officiel via API)
  - **TikTok** (best-effort sans API + fallback widget officiel)
  - **Prime Video** (best-effort sans API)
  - **Catalogue anime/manga** (AniList public + compléments best-effort)
- Mettre en place une synchronisation **autonome toutes les 5 minutes** (backend scheduler) avec **stockage MongoDB**.
- Respecter contraintes Emergent : `REACT_APP_BACKEND_URL`, `MONGO_URL`, backend préfixé `/api`.

### Objectif UI/UX (dernières exigences — PRIORITÉ ACTUELLE)
- Mettre à niveau l’expérience du site par des refontes UI/UX majeures :
  - remplacement de bannières statiques par des carrousels dynamiques
  - effets 3D / “drone camera” sur certaines vidéos hero
  - **refonte complète de la page Catalogue** : remplacement du carrousel circulaire par un **lecteur vidéo géant lumineux** avec **PiP** et interactions via les cartes

### Objectif SEO / Référencement
- Paramétrer le SEO : meta tags, OpenGraph/Twitter, canonical/hreflang/alternate.
- Générer et maintenir les fichiers d’indexation :
  - `robots.txt`
  - `sitemap.xml` + sitemaps spécialisés **Pages / Images / Vidéos / Produits / News / Books / Catalogue** (catalogue chunké)
  - flux **RSS/Atom** (Actualités)
  - données structurées **JSON‑LD schema.org** (Organization, WebSite, WebPage, Product, VideoObject, BreadcrumbList, Article/NewsArticle)
  - inclure les champs demandés : **`aggregateRating`** et **`review`** (là où applicable)

### Objectif (Search Console)
- Ajouter la balise de vérification Google :
  - `<meta name="google-site-verification" content="eDW28NAvAT9tr_dkYRKphCLRed_tlkJefXfYLvPbqd0" />`
- Finaliser l’automatisation Search Console :
  - soumission/validation des sitemaps via **Google Search Console API**
  - **2 modes d’authentification** :
    - **service account JSON**
    - **OAuth Web client**

### Objectif UI / Navigation (en attente / hors scope immédiat)
- Harmoniser la navigation :
  - Le texte **« Lovanet »** dans le menu doit adopter le **style des boutons principaux**.
  - Le bouton **« Boutique »** doit devenir une entrée de **sous-menu** (**desktop + mobile**).
  - Le style demandé : **RGB + blanc transparent**.

### Objectif Identité visuelle (logo/favicons) (en attente)
- Logo menu + favicon : nouvelle couleur + direction « icône animation 3D ».

### Objectif Mentions légales (en attente)
- Retirer 2 blocs de texte spécifiques sur la page Mentions légales.

### Objectif (TikTok) (en attente)
- Rétablir l’expérience TikTok (lecteur + liste/carrousel + fallback officiel).

### Objectif (Hubs 3D) (en attente)
- Hubs Ferry + Train Station : corriger bug runtime, retirer texte autour, désactiver auto-rotation caméra / auto-scènes.

---

## 2) Implementation Steps

### Phase 1 — POC Core (Isolation) ✅ COMPLETED
### Phase 2 — V1 App Development (MVP) ✅ COMPLETED
### Phase 3 — External Auto-Sync Parity + Fidelity UI ✅ COMPLETED
### Phase 4 — Import du projet source ✅ COMPLETED
### Phase 5 — SEO + Search Console + TikTok + Multi-domain ✅ COMPLETED (preview)
### Phase 6 — Search Console OAuth ✅ COMPLETED (preview)
### Phase 7 — Hubs 3D ⏳ IN PROGRESS
### Phase 8 — UI / Brand polish ⏳ IN PROGRESS
### Phase 9 — Nouvelle page d’arrivée ✅ COMPLETED
### Phase 10 — ThemeBubble 500+ ✅ COMPLETED
### Phase 11 — Remplacements vidéos utilisateur ✅ COMPLETED
### Phase 12 — Refonte Actualités premium ⏳ IN PROGRESS

### Phase 14 — Refonte Catalogue + SEO bloquant + validation (PRIORITÉ ACTIVE) ⏳ IN PROGRESS

#### Phase 14.1 — Base Catalogue (déjà implémentée en preview) ✅
- Remplacement du carrousel circulaire par un **lecteur géant**.
- Commandes : play/pause, mute/unmute, suivant/précédent.
- PiP : via API navigateur (avec fallback mini-fenêtre).
- Favoris persistants (localStorage) + bandeau “file personnelle”.

#### Phase 14.2 — Ajustements Catalogue (NOUVELLES EXIGENCES — à faire) ⏳ TODO
**But :** corriger la lecture et aligner le style des cartes + masquage YouTube + sélection auto + panneau de proposition.

1) **Lecture automatique fiable (sans coupure)**
- Corriger le comportement « la vidéo se stop après quelques secondes » :
  - désactiver toute logique qui détruit/recrée le player de façon intempestive
  - stabiliser les clés React et dépendances pour éviter un remount du player
  - vérifier que les transitions d’état (`playerMode`, `activePlayerId`, favoris) ne relancent pas l’embed
- Politique autoplay validée : **1B**
  - **autoplay en muet** au chargement
  - **activation du son au premier clic utilisateur** (unmute + play)
  - si le navigateur bloque malgré tout : fallback (message discret + bouton)

2) **Masquage UI/branding YouTube**
- Choix validé : **2B**
  - supprimer le logo/couvercle/mentions ajoutés par le site au-dessus des vidéos
  - réduire l’UI YouTube au maximum via paramètres embed (`modestbranding`, `rel=0`, etc.)
  - noter qu’un masquage total du branding YouTube n’est pas garanti (limites iframe)

3) **Sélection automatique + panneau de proposition (au chargement)**
- Choix validé : **3C**
  - sélectionner automatiquement une **liste** des cartes disposant d’une vidéo (trailer YouTube)
  - afficher un **panneau** (non intrusif) proposant :
    - « Ajouter cette sélection aux favoris »
    - « Lire maintenant dans le grand lecteur »
  - si l’utilisateur refuse/ferme : ne plus ré-afficher pendant la session (sessionStorage)

4) **Refonte style cartes (miniatures verticales, verre/brillance/transparence)**
- Demande utilisateur : agrandir **uniquement les miniatures** en vertical.
- Objectifs visuels :
  - cartes **moins lumineuses / pas floues**, mais **brillantes**, **transparentes**, premium
  - panneau miniature **très transparent**
  - cadre « **blister de verre** » brillant autour de la miniature
- Grille : conserver une densité raisonnable, mais **miniatures plus hautes** (ratio plus vertical).

5) **Bulle flottante (droite) = couleurs cartes**
- Confirmer que la bulle **pilote bien les couleurs des cartes** via variables CSS `--catalog-card-*`.
- Si les nouvelles cartes premium n’appliquent plus ces variables, ré-intégrer :
  - `background: var(--catalog-card-bg, ...)`
  - `border-color: var(--catalog-card-border, ...)`
  - animations optionnelles via `--catalog-card-anim`.

#### Phase 14.3 — SEO bloquant (statut actuel) ✅ CONTRÔLÉ (manuel)
- `/shop` : présence `aggregateRating` + `review` dans JSON-LD (OK lors contrôle manuel).
- `/actualites` : une seule meta description (OK lors contrôle manuel).

> À re-confirmer après les derniers changements via audit final.

#### Phase 14.4 — Validation & preuves (obligatoire) ⏳ TODO
- Vérifier (desktop + mobile) :
  - autoplay muet au chargement + unmute au premier clic
  - aucune coupure après quelques secondes
  - play/pause/mute/précédent/suivant
  - PiP / mini-fenêtre
  - panneau de proposition au chargement (3C)
  - cartes : miniatures verticales + blister verre + transparence
  - bulle couleur à droite : impact visible sur toutes les cartes
- Captures d’écran :
  - `/anime-catalog` (lecteur + cartes + panneau)
  - `/shop` (SEO JSON-LD)
  - `/actualites` (meta description unique)
- Exécuter le **testing agent frontend** et corriger tous les retours.

---

## 3) Next Actions (ordre d’exécution — VALIDÉ UTILISATEUR)
1) **Catalogue** (Phase 14.2) :
   - corriger coupure vidéo
   - autoplay muet + son au premier clic
   - masquer YouTube (au max) + retirer overlays
   - cartes : miniatures verticales + blister verre + panneaux transparents
   - sélection auto des items avec vidéo + panneau (Ajouter aux favoris / Lire)
   - bulle de couleur à droite : doit piloter les cartes
2) **SEO** (re-check) : `/shop` JSON-LD + `/actualites` meta description.
3) **Vérifs** : captures + testing agent frontend complet.

> Rappel important : tout est implémenté en **preview** ; un **redéploiement** est nécessaire pour voir les changements en production.

---

## 4) Success Criteria
- Catalogue :
  - lecteur vidéo géant premium + PiP
  - **autoplay muet** sans coupure + **son au 1er clic utilisateur**
  - UI/branding YouTube masqué au maximum (et overlays du site supprimés)
  - cartes : miniatures **verticales**, panneau transparent, **blister verre** brillant
  - panneau au chargement : sélection auto des items avec vidéo + proposition favoris/lecture
  - bulle droite : change bien les couleurs de toutes les cartes
- SEO :
  - `/shop` JSON-LD contient `aggregateRating` + `review`
  - `/actualites` n’a qu’une seule meta description
- Frontend stable : pas d’erreurs console bloquantes, tests frontend OK.

---

## 5) Current Execution Order (validé utilisateur)
1) Catalogue (refonte + ajustements lecture/styling) ⏳ EN COURS
2) SEO bloquant ✅ contrôlé manuellement (à revalider)
3) Build/captures/tests ⏳ à exécuter
