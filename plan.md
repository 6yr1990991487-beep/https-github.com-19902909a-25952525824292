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
- Prioriser les sources les plus complètes (**backup + live + projet Lovable/GitHub/ZIP**) afin d’obtenir une **fidélité maximale**.
- Respecter contraintes projet Emergent : `REACT_APP_BACKEND_URL`, `MONGO_URL`, routes backend préfixées par `/api`.

**Statut actuel**
- ✅ **Phase 1 terminée** : sauvegarde inspectée + crawl live + manifest + assets mirrorrés + script POC OK.
- ✅ **Phase 2 terminée (V1 UI/UX + dynamiques internes)** : application full-stack fonctionnelle (routes/pages, overlays, bulles flottantes, formulaires, panier/commande), validations (lint/build), E2E.
- ✅ **Phase 3 terminée (parité auto-sync externe + fidélité catalogue circulaire)** : auto-sync 5 min YouTube/TikTok/Prime + auto-sync catalogue (AniList) + UI sync panels + catalogue carrousel circulaire + E2E.
- ✅ **Phase 4 terminée (import projet Lovable/GitHub/ZIP)** : import de la **vraie base Lovable** (ZIP/GitHub identiques), adaptation à l’environnement CRA/Emergent, réintégration backend auto-sync, tests E2E OK.

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

### Phase 4 — Import du projet source Lovable/GitHub/ZIP pour fidélité maximale ✅ COMPLETED
**Contexte**
- L’utilisateur juge la reconstruction initiale insuffisamment identique.
- Nouvelles sources fournies :
  - ZIP : `lovanet-fr-main.zip` (upload)
  - GitHub : `https://github.com/19902909a/lovanet-fr.git`
  - Supabase MCP : `https://pvgfxzzwuhjhfqsiylpr.supabase.co/functions/v1/mcp` (**401 Unauthorized** sans token)
- Choix utilisateur : **utiliser les deux (ZIP + GitHub), comparer, garder le plus complet**, et autoriser le remplacement.

**Résultats Phase 4**
- GitHub rendu public et cloné avec succès.
- Comparaison ZIP vs GitHub : **sources identiques**
  - 268 fichiers vs 268 fichiers
  - `only_zip`: 0, `only_git`: 0, `changed`: 0
  - Commit observé : `a23f1fa Ajouté bulle catalogue RGB`
- Le **vrai projet Lovable** est désormais la base active du frontend (remplace le replica “from scratch”).
- Adaptation Vite → environnement CRA/Emergent :
  - Mappage des variables Supabase vers `REACT_APP_SUPABASE_*` (valeurs publiques anon)
  - Préservation de `REACT_APP_BACKEND_URL`
  - Ajustements dépendances (React 18.3.x, three/fiber/drei, etc.)
- MCP Supabase non utilisé (401) : aucun token fourni.
- Réintégration backend Phase 3 dans l’UI Lovable :
  - `ManualSyncButton` → `POST /api/admin/sync/run`
  - Dashboard `/admin/sync` → `GET /api/admin/sync/status` + relance jobs
  - Pages YouTube/TikTok/Prime → consomment `GET /api/videos?...` avec fallback
- Corrections post-import :
  - `/api/videos` accepte `limit=200` (422 corrigé)
  - Correction bug SVG `<circle r>` négatif (normalisation hash unsigned + clamp)
- Validation :
  - Build frontend OK (warnings non bloquants)
  - E2E Testing Agent iteration 3 : backend 100% (26/26), frontend 100%

**Exit criteria Phase 4 (atteints)**
- Fidélité visuelle/structurelle fortement améliorée (base Lovable réelle).
- Endpoints `/api` et scheduler auto-sync conservés.
- Tests E2E passent.

---

## 3) Next Actions
### Phase 5 (optionnelle) — Hardening “identique au pixel” + production readiness
1. **Supabase MCP (si souhaité)**
   - Obtenir un token/headers pour lever le `401`.
   - Si accessible : importer la configuration/états supplémentaires (si le projet original s’appuie dessus).
2. **Prime Video parity**
   - Fournir une source légitime (export, feed interne, ou autre) si l’objectif est une parité stricte.
   - Sinon conserver le mode **degraded** + fallback (comportement actuel).
3. **Qualité & perf**
   - Réduire les warnings non bloquants (ex: source-map `@mediapipe/tasks-vision`).
   - Audit Lighthouse, optimisation images, réduction bundles.
4. **Fonctionnalités production** (si besoin)
   - Emails transactionnels (contact/commande), export admin, analytics, paiement.

---

## 4) Success Criteria
### Atteints (Phases 1–4)
- Pages accessibles principales rendues et navigables + aliases/redirects.
- Médias principaux servis.
- Bulles flottantes + superpositions (cart drawer, modals, menus).
- Formulaires dynamiques + demandes de commande persistées.
- Auto-sync 5 minutes : YouTube/AniList OK, TikTok best-effort, Prime degraded possible.
- Catalogue : recherche + filtres + carrousel (incluant composant orb/cercle) + grille.
- Import Lovable complet (ZIP=GitHub) : UI/UX et composants réels récupérés.
- Tests E2E : iteration 3 backend 100%, frontend 100%.

### Transparence / contraintes externes (toujours valables)
- TikTok/Prime sans API : fiabilité dépend des pages publiques et protections anti-scraping.
- Prime : peut rester **degraded** sans source officielle/légitime (API/feed/export).
- Supabase MCP : nécessite un token (actuellement `401 Unauthorized`).
- Warnings build non bloquants possibles (ex: source-map manquant `@mediapipe/tasks-vision`).
