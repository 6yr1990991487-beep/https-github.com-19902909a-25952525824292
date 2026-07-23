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

### Objectif (NOUVEAU) — Refonte Premium multi‑pages (Phase 15)
- Appliquer des améliorations premium demandées sur **Prime Video / YouTube / Lecteurs vidéo** + extensions possibles sur d’autres pages.
- Décision utilisateur : *aller au plus rapide, sans casser le site, puis dérouler le reste progressivement*.

### Objectif (MIS À JOUR) — Nettoyage bannière “capture” Anime Moments (P0 prod)
- Problème vu en **production** sur la page **Anime Moments** (route `/anime-moments`).
- Constat : la bannière capture comportait des **cartes vidéos animées/défilantes** (HeroCarousel).
- Demande mise à jour :
  1) **Revenir au principe visuel précédent** (le “cadre”/layout du haut doit rester comme avant)
  2) **Retirer uniquement** les **cartes vidéos animées/défilantes** (donc plus d’animation ni de cartes)
  3) **Ajouter la vidéo fournie** en **superposition au centre**, **taille réduite**, **semi‑transparente**, **autoplay muet**, sans **masquer** les composants derrière ni sur les côtés.

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
- Toggle « Traduire les cartes » (fallback title/description).
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
- ✅ **Panneau flottant “À regarder ce soir”** (favoris locaux persistants).
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
3) Playlist auto (locale) + lecture continue (sans dépendre de nouveaux credentials).
4) Panneaux : “À ne pas manquer”, “les plus regardées” (heuristiques ou stats si dispo via backend).
5) Filtres : “shorts / longs formats” (si déductible via durée/ratio, sinon heuristique).

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

### Phase 16 — Ajustement bannière “capture” Anime Moments (P0 prod) ⏳ IN PROGRESS
**Contexte** : retour utilisateur vu en production sur la page **Anime Moments**.

#### État actuel (preview)
- La bannière du haut a été remplacée par une **vidéo plein cadre**, ce qui **masque** les éléments/effets de la bannière et ne correspond pas au rendu souhaité.

#### Objectif correct (à livrer)
- Revenir au rendu du haut « comme avant » (cadre/ambiance identique).
- Retirer **uniquement** les **cartes vidéos animées/défilantes**.
- Ajouter la vidéo utilisateur :
  - **centrée**, **plus petite**, **semi-transparente**
  - **autoplay muet**, `playsInline`, `loop`
  - sans recouvrir/masquer les composants derrière ni sur les côtés.

#### Checklist
1) **Restaurer le container/structure** d’avant (sans le flux de cartes).
2) **Supprimer** l’injection des cartes + la logique d’animation (HeroCarousel).
3) **Ajouter une surcouche vidéo** au centre :
   - wrapper `position: absolute` centré
   - `max-width` contrôlée (ex : 52–62% desktop, 78–86% mobile)
   - `opacity` ~0.45–0.7 + `mix-blend-mode: screen/overlay` si nécessaire
   - `pointer-events: none` (pour ne pas gêner les composants)
4) Ajuster responsivité :
   - mobile : garder lisible, ne pas recouvrir navbar/CTA
   - desktop : laisser visibles les côtés/effets
5) Validation preview :
   - captures `/anime-moments` desktop + mobile
   - vérifier : plus de cartes défilantes, vidéo centrée non intrusive
6) Redéploiement côté utilisateur pour production.

---

## 3) Next Actions (ordre d’exécution — MIS À JOUR)
1) **Phase 16** : corriger la bannière Anime Moments selon le rendu demandé (retour au layout + vidéo centrée transparente) → implémentation preview + captures.
2) **Phase 14.6 Validation** : captures + tests frontend + corrections (Catalogue/Shop/Actualités).
3) **Phase 15 Lot 2** : YouTube (réplique pattern Prime/Catalogue).
4) **Phase 15 Lot 3** : Lecteurs vidéo (unification + PiP premium).
5) **Redéploiement** par l’utilisateur pour pousser en production :
   - Merchant listings `/shop`
   - Catalogue compact + netteté
   - Prime Video (Lot 1)
   - Anime Moments (bannière capture corrigée)
   - puis YouTube/Lecteurs vidéo quand prêts
6) Post‑déploiement : validation Search Console / Rich Results sur la production.

---

## 4) Success Criteria
- Catalogue :
  - lecteur géant + PiP
  - autoplay muet + son au 1er clic
  - cartes compactes (~-30%), grilles denses, miniatures nettes
  - toggle traduction fonctionnel
- SEO :
  - `/shop` : Product JSON‑LD conforme Merchant listings (champs requis) + pas de microdata concurrentes
  - `/actualites` : une seule meta description
- Prime Video / YouTube / Lecteurs vidéo (Phase 15) :
  - livraison incrémentale stable (pas de régression)
  - Prime Video : ✅ cartes compactes HD + héro + previews + favoris/history + fallback propre (testé)
  - YouTube : hero + cartes unifiées + playlist locale
  - Lecteurs vidéo : expérience unifiée + PiP renforcé
- Anime Moments (Phase 16) :
  - bannière top : plus de cartes défilantes
  - vidéo utilisateur centrée, réduite, semi-transparente, autoplay muet
  - les éléments arrière-plan/côtés restent visibles (pas d’écrasement)

---

## 5) Current Execution Order (mis à jour)
1) Phase 16 Anime Moments (bannière capture) ⏳
2) Validation Phase 14.6 (captures/tests) ⏳
3) Phase 15 Lot 2 YouTube ⏳
4) Phase 15 Lot 3 Lecteurs vidéo ⏳
5) Déploiement côté utilisateur → production (obligatoire)
