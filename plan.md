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
- ✅ **Phase 3 terminée (parité auto-sync externe + fidélité catalogue circulaire)** : auto-sync 5 min YouTube/TikTok/Prime + auto-sync catalogue (AniList) + UI sync panels + catalogue carrousel circulaire + E2E (backend 100%, frontend 100%).
- ⏭️ **Phase 4 optionnelle** : hardening pixel-level + SEO avancé + exports/admin + amélioration Prime si une source légitime/API est fournie.

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

### Phase 3 — External Auto-Sync Parity (YouTube/TikTok/Prime/Catalog) + Fidelity UI (catalog circulaire) ✅ COMPLETED
**Objectif Phase 3**
- Reproduire le comportement de l’autre site sur la partie **synchro externe** et **catalogue dynamique** :
  1) **Auto-sync toutes les 5 minutes**
  2) Import/stockage des vidéos (YouTube/TikTok/Prime)
  3) Import/stockage du catalogue anime/manga (AniList public + best-effort)
  4) Reproduction du **carrousel circulaire (en cercle)** + réglages/recherche/navigation + états de sync

#### Phase 3A — POC Sync (preuve technique) ✅
- Script POC : `/app/tests/test_phase3_sync_poc.py` → **PHASE3_SYNC_POC_SUCCESS**
  - YouTube API OK
  - AniList GraphQL OK
  - TikTok best-effort OK (variable selon blocage)
  - Prime best-effort : **degraded** (attendu)

#### Phase 3B — Scheduler Auto-sync (toutes les 5 minutes) ✅
- Scheduler backend interne démarré au startup
  - interval = **300s** (5 minutes) via `SYNC_INTERVAL_SECONDS` (défaut 300)
  - lock anti-concurrence
  - tracking MongoDB `sync_state`

#### Phase 3C — Data Model MongoDB ✅
Collections utilisées :
- `videos`
- `catalog_items`
- `sync_state`

#### Phase 3D — Frontend Fidelity Pass (catalog + médias) ✅
- Pages vidéos (YouTube/TikTok/Prime) alimentées par `/api/videos` (MongoDB)
- Ajout panneau de statut sync + bouton sync manuel par page
- Floating sync button déclenche sync globale
- `/anime-catalog` :
  - badge source (mongodb vs fallback)
  - bouton **Sync AniList**
  - recherche + select genres
  - toggle **Grille** / **Carrousel cercle**
  - carrousel circulaire avec prev/next + panneau détail + trailer
- `/admin` : inventaire + panneau sync status

#### Phase 3E — Tests & Validation ✅
- Validations : Lint JS ✅, lint Python ✅, build frontend ✅
- Backend manual sync vérifié :
  - YouTube **ok** (24 vidéos)
  - AniList **ok** (50 items)
  - TikTok **ok** (best-effort, 1 item lors du test)
  - Prime **degraded** (0 item, attendu)
- Testing Agent E2E : `/app/test_reports/iteration_2.json`
  - Backend **100% (26/26)**
  - Frontend **100%** (features phase 3 + régressions)

Limitation connue (Prime Video) — transparence
- **Prime Video n’a pas d’API publique** et les pages sont souvent **bloquées/geo-gated** ou non fiables côté serveur.
- Le système est donc en **best-effort** et peut rester **degraded** sans une source légitime :
  - URL stable exportable,
  - feed/partenariat,
  - ou mécanisme interne déjà existant (à fournir).
- L’application gère proprement ce cas (pas de crash, fallback UI + statut clair).

---

### Phase 4 — Hardening & SEO/Exports/Advanced Parity ⏭️ OPTIONAL
User stories (Hardening/Parity)
1. Pas de liens cassés après un crawl interne complet.
2. Responsive proche pixel-level sur pages clés.
3. SEO complet (meta/OG/canonical/hreflang) route par route.
4. Redirections historiques SEO/backlinks.
5. Exports admin (soumissions/commandes/sync logs) + notifications email (option).
6. Prime Video : améliorer la parité **si** une source légitime (API/feed/URL machine-readable) est fournie.

Steps
- Crawl interne + audit 404.
- Optimisations perf (cache headers, compression, lazyload, pagination).
- SEO : titres/meta/OG dynamiques par route.
- Exports CSV + notifications email (option).
- Prime: intégrer une source autorisée si disponible (sinon conserver degraded).

---

## 3) Next Actions
**Statut**: Phases 1–3 livrées. Next = Phase 4 optionnelle.

1. **Hardening UI** (pixel-level) sur pages clés : home, catalogue (cercle), shop, media pages.
2. **SEO avancé** : meta dynamiques, OG images par route, hreflang complet.
3. **Admin exports** : CSV/JSON pour `submissions`, `orders`, `sync_state`.
4. **Notifications** : email (SendGrid/Mailgun) sur contact/commande (option).
5. **Prime Video parity** : si vous fournissez une source légitime (ex: liste exportable, feed, URL stable), on remplace le best-effort degraded.

---

## 4) Success Criteria
### Atteints (V1 + Phase 3)
- Pages accessibles principales rendues et navigables + aliases/redirects.
- Médias principaux (images/SVG/bundles) servis depuis l’app.
- Bulles flottantes + superpositions (cart drawer, modals, menus) présents.
- Formulaires dynamiques OK (contact + stockage) + demandes de commande OK (stockage).
- Auto-sync **toutes les 5 minutes** opérationnel.
- YouTube sync via API officielle OK.
- AniList sync catalogue OK.
- TikTok best-effort OK (statut géré).
- Catalogue : recherche + filtres + **carrousel circulaire** + grille.
- UI sync : statut + sync manuel + admin sync inventory.
- Tests E2E :
  - Phase 2: backend 100%, frontend 98%
  - Phase 3: backend 100%, frontend 100%

### Transparence / contraintes externes
- TikTok/Prime sans API : fiabilité dépend des pages publiques et protections anti-scraping.
- Prime : peut rester **degraded** sans source officielle/légitime (API/feed/export) — l’app le gère sans crash, avec fallback.
