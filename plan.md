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
- **Décision utilisateur implicite** : *aller au plus rapide, sans casser le site, puis dérouler le reste progressivement*.

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
- Grille densifiée et réduction paddings/typos/boutons.
- Priorité aux images `extraLarge`, `decoding="async"`, `fetchPriority` au-dessus de la ligne de flottaison, scaling réduit.

#### Phase 14.6 — Validation & preuves ⏳ TODO
- Captures : `/anime-catalog`, `/shop`, `/actualites`.
- Tests frontend complets + corrections.
- Rappel : redéploiement requis pour voir les changements en production.

---

### Phase 15 — Refonte Premium multi‑pages (Prime Video / YouTube / Lecteurs vidéo / autres pages) ⏳ À DÉMARRER

**Principe** : livrer par **lots rapides** et **stables**, sans refonte risquée globale.

#### Lot 1 (NOW, le plus rapide, sans casser) — Prime Video (priorité)
Objectif : appliquer le **pattern Catalogue** sur Prime Video, en conservant l’architecture existante.
1) **Cartes compactes HD** (mêmes principes que Catalogue)
   - grilles denses, cartes réduites, miniatures nettes (sources HD priorisées), couleurs rehaussées.
2) **Grand lecteur héro en haut de page**
   - clic sur carte → projection dans le lecteur héro (si trailer/preview dispo, sinon fallback image + CTA).
3) **Badges intelligents (version simple)**
   - format (Film/Série), VF/VOSTFR (si données dispos), nouveauté/populaire (heuristiques), durée/épisodes (si dispos).
4) **Mode “cinéma obscur” (léger)**
   - fond assombri autour du lecteur actif (CSS only, incrément sûr).

> Features plus lourdes explicitement demandées mais repoussées pour ne pas casser : comparateur, “reprendre plus tard”, tri émotionnel avancé, “similaire à ce titre” complet.

#### Lot 2 — YouTube (réplique du pattern)
1) Hero vidéo géant.
2) Miniatures unifiées.
3) Filtres (shorts/longs si possible via data).
4) Playlist auto (en s’appuyant sur la liste existante, sans API additionnelle risquée).

#### Lot 3 — Lecteurs vidéo (unification)
1) Lecteur géant « universel » (YouTube/Prime/TikTok/vidéos internes) avec UI cohérente.
2) PiP premium renforcé.
3) Mode théâtre/portrait.

#### Lot 4+ (optionnel, selon stabilité) — Extensions
- Catalogue : switch « ultra-compact / premium ».
- Actualités : mur plus compact + priorités.
- Boutique : cartes compactes + passerelles catalogue ↔ shop.

---

## 3) Next Actions (ordre d’exécution — MIS À JOUR)
1) **Phase 14.6 Validation** : captures + tests frontend + corrections.
2) **Phase 15 Lot 1** : Prime Video (cartes compactes HD + lecteur héro + badges base + mode cinéma léger).
3) **Phase 15 Lot 2** : YouTube.
4) **Phase 15 Lot 3** : Lecteurs vidéo.
5) **Redéploiement** par l’utilisateur pour pousser en production :
   - Merchant listings `/shop`
   - Catalogue compact + netteté
   - (ensuite) Prime Video/YouTube/Lecteurs vidéo
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
  - Prime Video : cartes compactes HD + lecteur héro opérationnel
  - YouTube : hero + cartes unifiées
  - Lecteurs vidéo : expérience unifiée + PiP renforcé

---

## 5) Current Execution Order (mis à jour)
1) Validation (captures/tests) ⏳
2) Phase 15 Lot 1 Prime Video (rapide, stable) ⏳
3) Phase 15 Lot 2 YouTube ⏳
4) Phase 15 Lot 3 Lecteurs vidéo ⏳
5) Déploiement côté utilisateur → production (obligatoire)
