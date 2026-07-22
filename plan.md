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
- Commandes lecteur + PiP.
- Favoris persistants (localStorage) + bandeau “file personnelle”.

#### Phase 14.2 — Ajustements Catalogue (exigences consolidées) ⏳ IN PROGRESS
**But :** lecture stable, UX premium des cartes (vertical + blister), masquage YouTube, sélection auto, et traductions.

1) **Lecture automatique fiable (sans coupure) + politique son (1B)** ✅ PARTIELLEMENT FAIT
- **Autoplay en muet** au chargement.
- **Activation du son au 1er clic** (déverrouillage + play).
- Stabiliser l’embed YouTube pour éviter remount intempestif.
- Ajouter lecture « complète » : éviter arrêt prématuré et gérer l’enchaînement (fin → vidéo suivante).

2) **Masquage UI/branding YouTube (2B)** ✅ PARTIELLEMENT FAIT
- Réduction maximale de l’UI via paramètres embed (`controls=0`, `modestbranding`, `rel=0`, etc.).
- Suppression des overlays/mentions YouTube ajoutés par le site.
- Note : masquage total du branding non garanti (limites iframe).

3) **Sélection automatique + panneau de proposition (3C)** ✅ FAIT (mais à ajuster)
- Afficher au chargement un panneau de proposition :
  - « Ajouter la sélection aux favoris »
  - « Lire maintenant »
- **Important (nouvelle demande)** : le panneau doit rester visuel mais les **textes listés** doivent être retirés (voir point 6).

4) **Refonte style cartes (vertical, verre/brillance/transparence)** ✅ FAIT (à ajuster)
- Miniatures **plus verticales** (ratio type 5/8).
- Cartes / panneaux **très transparents**, premium, cadrés par **blister verre brillant**.
- **Nouvelle demande** : retirer tout calque/filtre qui assombrit ou floute les miniatures.

5) **Bulle flottante (droite) = couleurs cartes** ✅ FAIT (à re-valider)
- Conserver les variables CSS `--catalog-card-*` pour piloter : fond, bordure, animation.

6) **Nettoyage des textes UI (nouvelle demande)** ⏳ TODO
Retirer (sans supprimer la structure visuelle) les textes suivants :
- Dans le header/panneau supérieur :
  - « Catalogue vidéo géant »
  - « Un écran principal lumineux pour piloter tout le catalogue. »
  - le paragraphe d’explication “Per design guidelines…”
  - les libellés/phrases des compteurs (ex. « Favoris », « Playlist persistante locale », « Vidéos prêtes », « Lecture auto stabilisée »)
- Dans le panneau de sélection :
  - « Sélection vidéo détectée »
  - « 10 cartes vidéo prêtes… »
  - « 10 cartes vidéo ont été détectées… »

Objectif : garder les zones (cadres, effets, layout) mais supprimer les phrases.

7) **Traductions des cartes (nouvelle demande)** ⏳ TODO
- Ajouter une **option/bulle flottante** sur les cartes (ou un toggle discret) qui permet :
  - **(a)** afficher titre original + titre traduit (si dispo)
  - **(b)** traduire aussi le texte descriptif/synopsis
  - **(c)** permettre d’activer/désactiver à la demande.
- Étape préalable : vérifier la présence d’une mécanique existante (i18n/traduction) dans le projet.
- Implémentation :
  - mode “auto” basé sur champs existants (romaji/english/native) + fallback
  - traduction du synopsis via service (si déjà existant) ou via mapping local minimal (si requis) ; sinon proposer option “en cours/indispo”.

8) **Robustesse réseau (AniList 429/CORS)** ⏳ TODO
- Constat preview : erreurs AniList (429/CORS) peuvent empêcher `trailer`.
- Ajuster la logique “carte avec vidéo” :
  - considérer “jouable” via recherche YouTube fallback (déjà partiellement fait)
  - dégrader proprement (cache, délais, fallback, pas de blocage UI).

#### Phase 14.3 — SEO bloquant ✅ CONTRÔLÉ (preview)
- `/shop` : JSON-LD contient `aggregateRating` + `review` ✅
- `/actualites` : une seule meta description ✅

> À re-confirmer après les derniers changements via audit final.

#### Phase 14.4 — Validation & preuves (obligatoire) ⏳ TODO
- Vérifier (desktop + mobile) :
  - autoplay muet + unmute au premier clic
  - lecture complète + enchaînement playlist
  - commandes (play/pause/mute/précédent/suivant) actives
  - PiP / mini-fenêtre
  - panneau proposition visible au chargement (sans les textes listés)
  - cartes : miniatures verticales **sans assombrissement**, blister verre brillant
  - bulle couleur à droite : impact visible sur toutes les cartes
  - option/bulle de traduction sur les cartes : titre + description
- Captures d’écran :
  - `/anime-catalog` (lecteur + cartes + panneau)
  - `/shop` (SEO JSON-LD)
  - `/actualites` (meta description unique)
- Exécuter le **testing agent frontend** et corriger tous les retours.

---

## 3) Next Actions (ordre d’exécution — VALIDÉ UTILISATEUR)
1) **Catalogue** (Phase 14.2) :
   - retirer les textes listés (sans supprimer la structure)
   - retirer tout filtre/calve sombre ou flou sur miniatures
   - renforcer la brillance/scintillement autour du blister verre
   - ajouter option/bulle flottante “Traductions” (titre + description)
   - revalider contrôles lecteur (actifs même en fallback YouTube search)
   - robustifier face à AniList 429/CORS
2) **SEO** (re-check) : `/shop` JSON-LD + `/actualites` meta description.
3) **Vérifs** : captures + testing agent frontend complet.

> Rappel important : tout est implémenté en **preview** ; un **redéploiement** est nécessaire pour voir les changements en production.

---

## 4) Success Criteria
- Catalogue :
  - lecteur vidéo géant premium + PiP
  - **autoplay muet** sans coupure + **son au 1er clic utilisateur**
  - UI/branding YouTube masqué au maximum (et overlays du site supprimés)
  - cartes : miniatures **verticales**, **nettes** (sans assombrissement/flou), panneau transparent, **blister verre** brillant
  - panneau au chargement visible, mais **sans** les textes listés
  - bulle droite : change bien les couleurs de toutes les cartes
  - option/bulle de traduction : **titre + description** (activable)
- SEO :
  - `/shop` JSON-LD contient `aggregateRating` + `review`
  - `/actualites` n’a qu’une seule meta description
- Frontend stable : pas d’erreurs console bloquantes, tests frontend OK.

---

## 5) Current Execution Order (validé utilisateur)
1) Catalogue (refonte + ajustements lecture/styling + nettoyage texte + traductions) ⏳ EN COURS
2) SEO bloquant ✅ contrôlé (à revalider)
3) Build/captures/tests ⏳ à exécuter
