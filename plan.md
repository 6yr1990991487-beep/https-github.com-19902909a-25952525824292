# plan.md — Reconstruction de Lovanet.fr (FARM: FastAPI + React + MongoDB)

## 1) Objectives
- Reconstruire **Lovanet.fr à l’identique** (au mieux techniquement) : **toutes les pages accessibles**, design, mise en page, typographies/couleurs, navigation.
- Reprendre et servir **assets** (images/vidéos/fichiers), **liens**, **redirections** et comportements UI (ex: **bulles flottantes**, **superpositions/overlays**, bandeaux, popups).
- Recréer les **fonctionnalités dynamiques** visibles ET les **configurations de synchronisation externe** (auto-sync) présentes sur l’autre site :
  - **YouTube** (sync officiel via API)
  - **TikTok** (best-effort sans API)
  - **Prime Video** (best-effort sans API)
  - **Catalogue anime/manga** (AniList public + compléments best-effort)
- Mettre en place une synchronisation **autonome toutes les 5 minutes** (backend scheduler) avec **stockage MongoDB** et **endpoints admin/sync**.
- Prioriser les sources les plus complètes (backup + live + **projet Lovable/GitHub/ZIP**), et s’aligner sur la fidélité réelle.
- Respecter contraintes projet Emergent : `REACT_APP_BACKEND_URL`, `MONGO_URL`, routes backend préfixées par `/api`.

**Statut actuel**
- ✅ **Phase 1 terminée** : sauvegarde inspectée + crawl live + manifest + assets mirrorrés + script POC OK.
- ✅ **Phase 2 terminée (V1 UI/UX + dynamiques internes)** : application full-stack fonctionnelle (routes/pages, overlays, bulles flottantes, formulaires, panier/commande), validations (lint/build), E2E.
- ✅ **Phase 3 terminée (parité auto-sync externe + fidélité catalogue circulaire)** : auto-sync 5 min YouTube/TikTok/Prime + auto-sync catalogue (AniList) + UI sync panels + catalogue carrousel circulaire + E2E.
- 🔄 **Phase 4 en cours (import projet source Lovable/GitHub/ZIP)** : l’utilisateur fournit désormais une base projet (ZIP + GitHub) à comparer/importer pour améliorer fortement la fidélité.

---

## 2) Implementation Steps

### Phase 1 — POC Core (Isolation): extraction + inventaire + rendu minimal ✅ COMPLETED
**Core prouvé**: capacité à **extraire** le site (backup + live), produire un **inventaire pages/assets/redirects**, et **valider** le socle de reconstruction.

Résultats Phase 1
- Backup `lovanet-fr_260714.backup` identifié : **PostgreSQL/Supabase custom dump** (`PGDMP` v1.16), ~2.44MB.
- Inventaire (via `strings`) des tables publiques détectées :
  - `imported_videos`, `media_library`, `pages`, `profiles`, `user_roles`, `youtube_blacklist`, `youtube_manga_videos`, `youtube_sync_state`.
- Crawl live réalisé : `https://lovanet.fr` + `sitemap.xml`, `sitemap-catalog.xml`, `sitemap-index.xml`, `robots.txt`, bundles JS/CSS, produits `/products/am-*.svg`.
- **Manifest** généré : `/app/extraction/manifest/lovanet_manifest.json`
  - **27 routes/pages/aliases** recensées
  - **87 assets** mirrorrés.
- Assets mirrorrés dans `/app/frontend/public` : bundles, favicon, product SVGs, sitemaps, `catalog-seo.json`.
- Script de validation POC : `/app/tests/test_core_lovanet.py` → **CORE_POC_SUCCESS**.

Note technique (transparence)
- `pg_restore` local ne peut pas restaurer le dump **PGDMP v1.16** (mismatch version client). L’extraction a donc continué via **inventaire backup + crawl live + assets/sitemaps/catalog**.

Exit criteria Phase 1 (atteints)
- Manifest généré et inventaire stable.
- Mirroring assets OK.
- POC extraction/validation OK.

---

### Phase 2 — V1 App Development (MVP): reconstruction des pages + dynamiques internes ✅ COMPLETED
Objectif Phase 2
- Déployer une **V1 full-stack** navigable et fidèle avec pages + UI + redirections + overlays + fonctionnalités dynamiques (contact + panier/commande).

Résultats Phase 2
- Frontend React reconstruit avec direction **dark neon + glassmorphism** + composants d’interaction.
- Pages/routes implémentées :
  - `/`, `/shop`, `/decouvrir`, `/lecteurs-video`, `/chaine-youtube`, `/chaine-youtube/manga`, `/prime-video`, `/tiktok`, `/anime-countdown`, `/anime-catalog`, `/contact`, `/legals`
  - Routes langues : `/en /es /de /it /pt /ja /zh`
  - Routes admin inventaire : `/admin`, `/admin/sync`
  - Aliases/redirects : `/youtube /prime /amazon-prime /catalogue /anime /animemoments /animemomentsanimeofficiel /anime-moments-youtube`.
- Backend FastAPI (MongoDB) sous `/api` :
  - `GET /api/health`, `GET /api/site`, `GET /api/pages`, `GET /api/redirects`
  - `GET /api/products`, `GET /api/videos`, `GET /api/catalog`, `GET /api/countdowns`
  - `POST /api/forms/{form_type}` (ex: contact) → stockage MongoDB
  - `POST /api/orders` (demande de commande/panier) → stockage MongoDB
  - `GET /api/submissions`.
- Validations : lint JS ✅, lint Python ✅, build frontend ✅, E2E ✅.

Limitation (transparence)
- Checkout = **demande de commande** (persistée en DB), **pas de paiement** externe.

---

### Phase 3 — External Auto-Sync Parity (YouTube/TikTok/Prime/Catalog) + Fidelity UI (catalog circulaire) ✅ COMPLETED
**Objectif Phase 3**
- Reproduire le comportement de l’autre site sur la partie **synchro externe** et **catalogue dynamique**.

Résultats Phase 3
- Auto-sync backend toutes les **5 minutes** (300s) au startup.
- Sync YouTube via **YouTube Data API** (clé fournie et stockée en `.env`, non exposée).
- Sync AniList via **GraphQL public** vers MongoDB.
- Sync TikTok **best-effort** (sans API officielle).
- Sync Prime Video **best-effort** + statut **degraded** possible (pas d’API publique, pages parfois bloquées/geo-gated).
- UI : panneaux de statut sync + bouton sync manuel + bouton flottant sync.
- Catalogue : **carrousel circulaire** + grille + recherche + filtres.
- Tests E2E : `/app/test_reports/iteration_2.json` → backend 100%, frontend 100%.

Limitation connue (Prime Video)
- Sans source légitime (API/feed/export), Prime peut rester **degraded** ; comportement géré sans crash.

---

### Phase 4 — Import du projet source Lovable/GitHub/ZIP pour fidélité maximale 🔄 IN PROGRESS
**Contexte**
- L’utilisateur juge la reconstruction actuelle insuffisamment identique.
- Nouvelles sources fournies :
  - ZIP : `lovanet-fr-main.zip` (upload)
  - GitHub : `https://github.com/19902909a/lovanet-fr.git`
  - Supabase MCP : `https://pvgfxzzwuhjhfqsiylpr.supabase.co/functions/v1/mcp` (auth inconnue)
- Choix utilisateur : **utiliser les deux (ZIP + GitHub), comparer, garder le plus complet**, et autoriser le remplacement de la base actuelle si compatible.

**Objectif Phase 4**
- Importer/aligner le **vrai projet** (Lovable/GitHub/ZIP) pour récupérer **tous les éléments manquants** (layout exact, composants, assets, comportements) puis **réintégrer** notre backend FARM + auto-sync si nécessaire.

#### Phase 4A — Acquisition & Diff (ZIP vs GitHub)
1. Télécharger et extraire `lovanet-fr-main.zip` dans un dossier de travail.
2. Cloner `lovanet-fr.git` (ou télécharger l’archive) et comparer :
   - Structure (React/Vite/Next?), dépendances, assets, pages/routes.
   - Présence de configuration Supabase, endpoints sync, données catalogue.
   - Identifier la source la plus complète (ou fusionner).
3. Produire une **matrice de diff** (ce que le projet source a et ce que notre reconstruction a).

#### Phase 4B — Adaptation à l’environnement Emergent (FARM)
1. Faire tourner le frontend du projet source localement :
   - Adapter `REACT_APP_BACKEND_URL` si CRA, ou `VITE_*` si Vite.
   - Adapter routing pour fonctionner en SPA sous preview.
2. Aligner le backend :
   - Si le projet source utilise Supabase directement :
     - Décider entre **(A)** conserver Supabase côté frontend (si acceptable) ou **(B)** proxy via FastAPI/MongoDB.
   - Conserver la contrainte : toutes les routes backend en `/api`.
3. Réintégrer les modules Phase 3 (si absents du projet source) :
   - Scheduler 5 minutes
   - Sync YouTube/AniList/TikTok/Prime
   - Collections MongoDB + endpoints admin.

#### Phase 4C — Supabase MCP (optionnel)
1. Tester si l’endpoint MCP requiert auth.
2. Si token requis : demander au client le header (ex: `Authorization: Bearer ...`).
3. Si accessible : l’utiliser pour récupérer configuration/données additionnelles (pages, vidéos, sync state) afin d’améliorer la fidélité.

#### Phase 4D — Validation & Non-régression
1. Lint/build : JS + Python + build frontend.
2. Tests E2E (Testing Agent) :
   - Navigation complète
   - Sync status, sync manuel
   - Catalogue (cercle)
   - Boutique/panier/contact
3. Vérifier que la nouvelle base **augmente la fidélité** sans casser :
   - `/api` contract
   - MongoDB
   - scheduler
   - assets local/public

**Exit criteria Phase 4**
- UI/UX nettement plus identiques (composants manquants récupérés du projet source).
- Fonctionnalités Phase 2–3 intactes (ou réintégrées).
- Tests E2E passent.

---

## 3) Next Actions
1. **Importer ZIP + cloner GitHub** → comparer et identifier la base la plus complète.
2. **Adapter le projet source** au runtime Emergent (env vars + routing + build).
3. **Réintégrer** notre backend/scheduler/sync si absent.
4. **Tester E2E** et corriger les écarts visuels/fonctionnels.

---

## 4) Success Criteria
### Déjà atteints (Phases 1–3)
- Pages accessibles principales rendues et navigables + aliases/redirects.
- Médias principaux servis.
- Bulles flottantes + superpositions (cart drawer, modals, menus).
- Formulaires dynamiques + demandes de commande persistées.
- Auto-sync 5 minutes : YouTube/AniList OK, TikTok best-effort, Prime degraded possible.
- Catalogue : recherche + filtres + carrousel circulaire + grille.
- Tests E2E phase 3 : backend 100%, frontend 100%.

### Objectif Phase 4 (nouveau)
- **Fidélité maximale** par import du projet Lovable/GitHub/ZIP (UI/components/assets/behaviors exacts).
- Aucune régression des endpoints `/api` et des features d’auto-sync.
- Tests E2E passent après migration.

### Transparence / contraintes externes
- TikTok/Prime sans API : fiabilité dépend des pages publiques et protections anti-scraping.
- Prime : peut rester **degraded** sans source officielle/légitime (API/feed/export).