# plan.md — Reconstruction de Lovanet.fr (FARM: FastAPI + React + MongoDB)

## 1) Objectives
- Reconstruire **Lovanet.fr à l’identique** (au mieux techniquement) : **toutes les pages accessibles**, design, mise en page, typographies/couleurs, navigation.
- Reprendre et servir **assets** (images/vidéos/fichiers), **liens**, **redirections** et comportements UI (ex: **bulles flottantes**, **superpositions/overlays**, bandeaux, popups).
- Recréer les **fonctionnalités dynamiques** détectées (ex: formulaires de contact, demandes, panier/commande, etc.) avec stockage.
- Prioriser le contenu issu de `lovanet-fr_260714.backup`, compléter/valider via le site live.
- Respecter contraintes projet : `REACT_APP_BACKEND_URL`, `MONGO_URL`, routes backend préfixées par `/api`.

**Statut actuel** (au moment de cette mise à jour)
- **Phase 1 terminée** : sauvegarde inspectée + crawl live + manifest + assets mirrorrés + script POC OK.
- **Phase 2 terminée** : application full-stack fonctionnelle (routes/pages, overlays, bulles flottantes, formulaires, panier/commande) + validations (lint/build) + E2E (backend 100%, frontend 98%) + correctif mega-menu appliqué.
- **V1 prête à livrer**. Les prochaines étapes sont des optimisations/renforcements (Phase 3/4) si souhaitées.

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

### Phase 2 — V1 App Development (MVP): reconstruction de toutes les pages accessibles ✅ COMPLETED
Objectif Phase 2
- Déployer une **V1 full-stack** navigable et fidèle avec pages + UI + redirections + overlays + fonctionnalités dynamiques.

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
  - Issue mineure mega-menu (LOW) corrigée et vérifiée par screenshot automation (panel visible, 11 liens).

Conclure Phase 2 (atteint)
- E2E réussi : navigation, assets, redirections/aliases, bulles/overlays, formulaires, panier/commande.

Limitation (transparence)
- Le checkout est un flux **demande de commande** (persisté en DB) : **pas de paiement externe** configuré (non demandé / non requis détecté).

---

### Phase 3 — Hardening & Fidelity Pass (amélioration conformité + complétude) ⏭️ OPTIONAL / NEXT
User stories (Hardening)
1. En tant que visiteur, je ne vois pas de liens cassés (404) en parcourant le site.
2. En tant que visiteur mobile, le rendu est identique (responsive) sur les pages principales.
3. En tant que visiteur, les vidéos s’affichent comme prévu (autoplay si présent, fallback sinon).
4. En tant qu’admin, je peux voir un rapport des ressources manquantes et les remplacer.
5. En tant que visiteur, les performances sont bonnes (lazy-load images, caching headers) sans casser le rendu.

Steps
- Crawl interne complet de l’app reconstruite (détection 404/500 + assets manquants + routes non couvertes).
- Pass de fidélité pixel-level sur sections critiques (header/mega-menu, hero, shop cards, modals).
- Optimisations :
  - lazy-load images (déjà partiellement), cache headers statiques, compression,
  - réduction JS/CSS si possible sans altérer design.
- Ajout d’un écran “Asset Missing / Inventory” enrichi (admin/dev) pour remapper assets.
- Tests E2E + régressions (desktop + mobile).

---

### Phase 4 — Feature-complete parity (si détecté/confirmé sur l’original) ⏭️ OPTIONAL
User stories (Parity)
1. En tant que visiteur, les CTA (téléphone/mail/maps/whatsapp) fonctionnent partout.
2. En tant que visiteur, tout tracking/SEO visible (meta, OG tags) est cohérent page par page.
3. En tant que visiteur, les redirections historiques importantes fonctionnent (SEO/backlinks).
4. En tant que visiteur, les interactions avancées (carrousels, accordéons, animations) sont fidèles.
5. En tant qu’admin, je peux exporter les soumissions et commandes.

Steps
- SEO : titres/meta/OG par route, canonical, sitemap/robots cohérents (déjà récupérés côté assets).
- Audit redirections + tests automatiques (aliases + historiques).
- Parité interactions avancées (animations, carrousels, micro-interactions) en priorisant les pages à fort trafic.
- (Option) Intégration email provider (notification des formulaires) + export CSV.
- (Option) Intégration paiement (si requis) après validation du besoin.
- Test E2E final.

## 3) Next Actions
**Statut**: V1 livrée. Les next actions sont optionnelles selon vos priorités.

1. Validation métier : confirmer que le rendu V1 est conforme (pages, navigation, overlays, bulles flottantes).
2. Lister les écarts de fidélité visuelle (si besoin) : sections à ajuster en priorité.
3. Décider si vous souhaitez :
   - Phase 3 (hardening/perf/pixel-pass),
   - Phase 4 (SEO/exports/email/paiement).
4. (Si besoin) Fournir un `pg_restore` compatible v1.16 ou un export SQL “plain” pour restaurer 100% du contenu backup en base et remplacer les seeds live.

## 4) Success Criteria
**Atteints (V1)**
- Pages accessibles principales rendues et navigables + aliases/redirects.
- Médias principaux (images/SVG/bundles) servis depuis l’app.
- Bulles flottantes + superpositions (cart drawer, modals, menus) présents.
- Formulaires dynamiques OK (contact + stockage) + demandes de commande OK (stockage).
- Tests E2E passants (avec correctif mega-menu).

**À viser si Phase 3/4**
- Crawl interne = 0 lien interne cassé.
- Parité responsive + performance (LCP/CLS) améliorée.
- SEO complet route par route + audit redirections historiques.
- Exports admin (soumissions/commandes) + notifications email (option).