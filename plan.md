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
- Prioriser le contenu issu de `lovanet-fr_260714.backup`, compléter/valider via le site live.
- Respecter contraintes projet : `REACT_APP_BACKEND_URL`, `MONGO_URL`, routes backend préfixées par `/api`.

**Statut actuel**
- ✅ **Phase 1 terminée** : sauvegarde inspectée + crawl live + manifest + assets mirrorrés + script POC OK.
- ✅ **Phase 2 terminée (V1 UI/UX + dynamiques internes)** : application full-stack fonctionnelle (routes/pages, overlays, bulles flottantes, formulaires, panier/commande), validations (lint/build), E2E (backend 100%, frontend 98%), correctif mega-menu appliqué.
- ⏭️ **Phase 3 à faire (parité auto-sync externe + fidélité catalogue circulaire)** : auto-sync 5 min YouTube/TikTok/Prime + auto-sync catalogue (AniList) + amélioration visuelle/carrousel circulaire + réglages/recherche/navigation comme le site original.

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
- Frontend React reconstruit avec direction **dark neon + glassmorphism** + composants d’interaction :
  - Header fixed + **mega-menu** + menu mobile
  - **Cart drawer overlay** (panier) + quantités / suppression / total
  - **Video modal overlay**
  - **Floating bubbles/orbs** + floating actions
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
- Validations :
  - Lint JS ✅, lint Python ✅, build frontend ✅.
  - Testing Agent E2E : `/app/test_reports/iteration_1.json` → backend 100%, frontend 98%.
  - Issue mineure mega-menu (LOW) corrigée et vérifiée.

Limitation (transparence)
- Le checkout est un flux **demande de commande** (persisté en DB) : **pas de paiement externe** configuré.

---

### Phase 3 — External Auto-Sync Parity (YouTube/TikTok/Prime/Catalog) + Fidelity UI (catalog circulaire) ⏭️ IN PROGRESS / NEXT
**Nouvel objectif Phase 3 (prioritaire)**
- Reproduire le fonctionnement du site original côté **synchronisation autonome** et **catalogue dynamique** :
  1) **Auto-sync toutes les 5 minutes**
  2) Import/stockage des vidéos (YouTube/TikTok/Prime)
  3) Import/stockage du catalogue anime/manga (AniList public + best-effort)
  4) Reproduction du **carrousel circulaire (en cercle)** + réglages/recherche/navigation + positions des vidéos + polices/bannières.

#### Phase 3A — POC Sync (1 source à la fois, preuve technique)
**Core à prouver**: on peut synchroniser et persister en DB sans casser le quota/latence.

- YouTube (OFFICIEL via API key fournie)
  - Résoudre channel par handle `@animemomentsAnimeofficiel`
  - Sync des uploads (playlist uploads) : id, title, description, thumbnails, publishedAt, stats si nécessaire
  - Déduplication + upsert en MongoDB
  - Stratégie quotas (maxResults, pagination, backoff)
- AniList (public GraphQL)
  - Pull d’un set initial (trending/popular + recherche)
  - Stockage des champs nécessaires (cover/banner/trailerId/genres/score/year)
  - Déduplication + pagination
- TikTok (sans API) — best-effort
  - Stratégie : RSS/embeds publics si disponibles, ou extraction HTML légère sans authent (si légalement/techniquement possible)
  - Si impossible: fallback contrôlé (source “manual curated”) + marquage “sync degraded”
- Prime Video (sans API) — best-effort
  - Stratégie : pages publiques “anime/manga” Amazon/Prime (si accessibles) + extraction des items listés
  - Si paywall/anti-bot: fallback contrôlé (curated) + marquage “sync degraded”

**Deliverables POC**
- Endpoint `POST /api/sync/youtube` + `GET /api/videos?platform=youtube` alimenté par DB
- Endpoint `POST /api/sync/catalog/anilist` + `GET /api/catalog` alimenté par DB
- Rapport `sync_status` (dernière exécution, items ajoutés/maj, erreurs)

Exit criteria 3A
- Au moins YouTube + AniList sync OK end-to-end (API → DB → UI)
- Gestion des erreurs + statut sync.

#### Phase 3B — Scheduler Auto-sync (toutes les 5 minutes)
- Ajouter un scheduler côté backend (process interne) :
  - interval = **5 minutes** (configurable)
  - locks anti-concurrence
  - logs + métriques minimales
  - stockage `sync_state` en MongoDB : last_run, last_success, counts, last_error
- Endpoints admin :
  - `POST /api/admin/sync/run` (run now)
  - `GET /api/admin/sync/status`
  - `POST /api/admin/sync/config` (optionnel) : interval/limits

#### Phase 3C — Data Model MongoDB (parité avec backup tables)
Collections proposées :
- `videos` : {platform, external_id, title, description, thumbnail_url, published_at, stats?, raw?, updated_at}
- `catalog_items` : {provider: anilist, id, title, summary, year, score, genres, cover, banner, trailerId, updated_at}
- `sync_state` : {key, last_run_at, last_success_at, inserted, updated, error}
- `blacklist` : {platform, kind, value, reason}

#### Phase 3D — Frontend Fidelity Pass (catalog + médias)
- Remplacer les seeds par données DB (React Query) :
  - Vidéos pages YouTube/TikTok/Prime
  - Lecteur vidéo + playlists
  - Catalogue
- Reproduire le **carrousel circulaire** sur `/anime-catalog` (CSS 3D / canvas / transforms)
  - navigation (drag / wheel / buttons)
  - recherche + filtres + réglages (densité, tri, mode performance)
- Harmoniser :
  - polices (Orbitron/Inter déjà) + bannières
  - positions/sections vidéos conformes
  - états “sync en cours / sync ok / sync dégradé”

#### Phase 3E — Tests & Validation
- Tests backend :
  - mocks YouTube/AniList
  - tests sync_state
- E2E avec Testing Agent :
  - vérifier auto-sync (simulate run now)
  - vérifier UI alimentée par DB
  - vérifier fallback TikTok/Prime (pas de crash)

---

### Phase 4 — Hardening & SEO/Exports/Advanced Parity ⏭️ OPTIONAL (après Phase 3)
User stories (Hardening/Parity)
1. Pas de liens cassés après un crawl interne complet.
2. Responsive proche pixel-level sur pages clés.
3. SEO complet (meta/OG/canonical/hreflang) route par route.
4. Redirections historiques SEO/backlinks.
5. Exports admin (soumissions/commandes/sync logs) + notifications email (option).

Steps
- Crawl interne + audit 404.
- Optimisations perf (cache headers, compression, lazyload, pagination).
- SEO : titres/meta/OG dynamiques par route.
- Exports CSV + notifications email (option).

---

## 3) Next Actions
**Statut**: V1 livrée; priorité = Phase 3 auto-sync externe + carrousel circulaire.

1. **Sécuriser la clé YouTube**
   - Ajouter `YOUTUBE_API_KEY` en variable d’environnement backend (ne pas hardcoder).
2. Implémenter **POC YouTube sync** (handle → channelId → uploads playlist → upsert MongoDB).
3. Implémenter **POC AniList sync** (GraphQL → upsert MongoDB) et basculer `/api/catalog` sur DB.
4. Mettre en place le **scheduler 5 minutes** + endpoints admin/sync status.
5. Ajouter TikTok + Prime en best-effort (avec fallback “sync degraded”).
6. Refaire `/anime-catalog` en **carrousel circulaire** + réglages/recherche/navigation + mise en page fidèle.
7. E2E final (auto-sync + UI) avec Testing Agent.

---

## 4) Success Criteria
### Atteints (V1)
- Pages accessibles principales rendues et navigables + aliases/redirects.
- Médias principaux (images/SVG/bundles) servis depuis l’app.
- Bulles flottantes + superpositions (cart drawer, modals, menus) présents.
- Formulaires dynamiques OK (contact + stockage) + demandes de commande OK (stockage).
- Tests E2E passants (avec correctif mega-menu).

### Nouveaux critères (Phase 3 — parité sync)
- Auto-sync **toutes les 5 minutes** opérationnel (YouTube + AniList minimum) avec `sync_state` visible.
- UI alimentée par **données synchronisées** (plus de seeds statiques pour les sections concernées).
- Catalogue : recherche + filtres + **carrousel circulaire** fonctionnels et proches du site original.
- TikTok + Prime : au minimum **best-effort** sans crash + statut “dégradé” clair si blocage externe.
- Tests E2E couvrant : run sync now, affichage vidéos, affichage catalogue, overlays, navigation.

### Transparence / contraintes externes
- TikTok/Prime sans API : fiabilité dépend des pages publiques et protections anti-scraping. Prévoir fallback contrôlé et logs de statut.
