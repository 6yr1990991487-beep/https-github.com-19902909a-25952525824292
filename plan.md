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

#### Objectif SEO — Merchant listings / Fiches de marchand (NOUVEAU P0)
- Corriger les erreurs Search Console **Fiches de marchand** (production signalée) en mettant à jour le balisage **Product** sur `/shop` :
  - `image`
  - `aggregateRating`
  - `review`
  - `offers.availability`
  - `offers.shippingDetails`
  - `offers.hasMerchantReturnPolicy`
  - identifiant global (GTIN/MPN) **ou** à défaut `brand` + `sku` cohérents

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

#### Phase 14.1 — Base Catalogue ✅
- Remplacement du carrousel circulaire par un **lecteur géant**.
- Commandes lecteur + PiP.
- Favoris persistants (localStorage) + bandeau “file personnelle”.

#### Phase 14.2 — Ajustements Catalogue (exigences consolidées) ✅ MAJORITAIREMENT FAIT
**But :** lecture stable, UX premium des cartes (vertical + blister), masquage YouTube, sélection auto, traductions, et nettoyage de texte.

1) **Lecture automatique fiable (sans coupure) + politique son (1B)** ✅
- **Autoplay en muet** au chargement.
- **Activation du son au 1er clic** (déverrouillage + play).
- Stabilisation du composant `YouTubeEmbed`.

2) **Masquage UI/branding YouTube (2B)** ✅
- Réduction maximale de l’UI via paramètres embed (`controls=0`, `modestbranding`, `rel=0`, etc.).

3) **Sélection automatique + panneau de proposition (3C)** ✅
- Panneau visible au chargement avec actions :
  - « Ajouter la sélection aux favoris »
  - « Lire maintenant »
- Nettoyage demandé : suppression des textes explicatifs/marketing (voir point 6) ✅

4) **Refonte style cartes (vertical, verre/brillance/transparence)** ✅
- Miniatures plus verticales (ratio type 5/8).
- Cartes/panneaux transparents avec blister verre.
- Suppression des calques trop sombres + amélioration de la brillance/visibilité ✅

5) **Bulle flottante (droite) = couleurs cartes** ✅
- Variables CSS `--catalog-card-*` utilisées pour piloter fond/bordure/animation.

6) **Nettoyage des textes UI** ✅
- Suppression des textes listés du header et du panneau de sélection (structure conservée).

7) **Traductions des cartes (option/toggle)** ✅
- Ajout d’un toggle « Traduire les cartes » :
  - affiche titre “traduit” (fallback basé sur champs dispo) + affiche l’original si différent
  - description “traduite” (fallback synthétique)

8) **Micro-nettoyage Landing** ✅
- Suppression des textes `Sélection collector` et `Expérience premium` sur la landing page.

9) **Robustesse réseau (AniList 429/CORS)** ⏳ EN COURS
- Constat preview : erreurs AniList peuvent empêcher le chargement de trailers.
- Dégradation : lecture possible via recherche YouTube fallback.

#### Phase 14.3 — SEO bloquant (contrôlé en preview) ✅
- `/shop` : JSON-LD contient `aggregateRating` + `review` ✅ (à étendre pour Merchant listings)
- `/actualites` : une seule meta description ✅

#### Phase 14.4 — SEO Merchant listings / Fiches de marchand (P0 — PRODUCTION SIGNALÉE) ⏳ TODO
**Contexte :** Search Console remonte des erreurs en **production**. 
**Action :** corriger le code en **preview**, puis l’utilisateur devra **redéployer** pour pousser en production.

À faire dans `/shop` (Product JSON-LD) :
- Ajouter/corriger **obligatoires & critiques** :
  - `image` (URL absolue)
- Ajouter/corriger **recommandés** :
  - `aggregateRating`
  - `review` (tableau)
  - `offers.availability`
  - `offers.shippingDetails`
  - `offers.hasMerchantReturnPolicy`
  - identifiant global : GTIN/MPN si possible ; sinon `brand` + `sku`
- Vérifier la conformité schema.org :
  - `offers` en tableau si multi-offres
  - `priceCurrency`, `price`, `url`, `itemCondition`

#### Phase 14.5 — Validation & preuves (obligatoire) ⏳ TODO
- Vérifier (desktop + mobile) :
  - Catalogue : autoplay muet + unmute au premier clic
  - cartes : miniatures nettes (sans assombrissement), blister clair
  - panneau sélection : visible sans textes marketing
  - toggle traduction : impact visible sur titres + descriptions
- Vérifier SEO :
  - `/shop` : Product JSON-LD complet (Merchant listings)
  - `/actualites` : 1 seule meta description
- Captures d’écran :
  - `/anime-catalog` (lecteur + cartes + panneau + toggle traduction)
  - `/shop` (SEO JSON-LD)
  - `/actualites` (meta description unique)
- Exécuter le **testing agent frontend** et corriger tous les retours.

---

## 3) Next Actions (ordre d’exécution — MIS À JOUR)
1) **SEO Merchant listings (P0)** : compléter le balisage Product sur `/shop` (image + offers.* + policy + shipping + availability + identifiants) puis revalider via inspection.
2) **Catalogue** : finaliser robustesse réseau AniList (429/CORS) + vérifier contrôles lecteur (actifs même en fallback YouTube search).
3) **Vérifs** : captures + testing agent frontend complet.

> Important : l’alerte Search Console concerne la **production**. Les correctifs seront faits en **preview** et un **redéploiement** sera nécessaire pour les voir en production.

---

## 4) Success Criteria
- Catalogue :
  - lecteur vidéo géant premium + PiP
  - autoplay muet sans coupure + son au 1er clic utilisateur
  - UI/branding YouTube masqué au maximum
  - cartes : miniatures verticales nettes, sans assombrissement/flou, blister verre brillant
  - panneau au chargement visible, sans textes marketing listés
  - bulle couleur à droite : change les couleurs des cartes
  - option traduction : titre + description (activable)
- SEO :
  - `/shop` : balisage Product conforme Merchant listings (image + offers.availability + shippingDetails + hasMerchantReturnPolicy + brand/sku + aggregateRating/review)
  - `/actualites` : une seule meta description
- Frontend stable : pas d’erreurs console bloquantes, tests frontend OK.

---

## 5) Current Execution Order (mis à jour)
1) SEO Merchant listings / `/shop` ⏳ À FAIRE (suite alertes production)
2) Catalogue (robustesse réseau + contrôles lecteur) ⏳ EN COURS
3) Build/captures/tests ⏳ À EXÉCUTER
