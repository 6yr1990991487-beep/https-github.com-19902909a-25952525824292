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

### Objectif SEO / Référencement
- **Paramétrer le SEO** à l’identique / au maximum : meta tags, OpenGraph/Twitter, canonical/hreflang.
- Générer et maintenir les fichiers d’indexation :
  - `robots.txt`
  - `sitemap.xml` + sitemaps spécialisés **Image / Vidéo / Produits / News**
  - flux **RSS/Atom** (Actualités)
  - données structurées **JSON‑LD schema.org** (Organization, WebSite, WebPage, Product, VideoObject, BreadcrumbList, Article/NewsArticle)
  - inclure les champs Google demandés : **`aggregateRating`** et **`review`** (là où applicable)
- **Logo utilisateur** :
  - affichage dans le **menu/navigation**
  - utilisation comme **favicon** (+ déclinaisons)
  - réutilisation SEO (Organization.logo / publisher.logo) si pertinent
- Mettre en place une **sauvegarde locale** des données SEO (statique dans `/public`) + un **export backend** (MongoDB) si requis.
- Préparer l’occupation des verticales moteurs : **Google Web, Images, Vidéos, Produits, Actualités** (best-effort).

**Domaines / cibles SEO (confirmé utilisateur)**
- `https://lovanet.fr`
- `https://animemomentsofficiel.fr`

> Note canonique : éviter la duplication en choisissant un **domaine canonique primaire** (par défaut `lovanet.fr`) et traiter l’autre en **alternate** ou via stratégie de redirections/canonical.

**Statut actuel**
- ✅ **Phase 1 terminée** : sauvegarde inspectée + crawl live + manifest + assets mirrorrés + script POC OK.
- ✅ **Phase 2 terminée** : app full-stack fonctionnelle (routes/pages, overlays, bulles flottantes, formulaires, panier/commande), validations (lint/build), E2E.
- ✅ **Phase 3 terminée** : auto-sync 5 min YouTube/TikTok/Prime + catalogue (AniList) + UI sync panels + catalogue carrousel circulaire + E2E.
- ✅ **Phase 4 terminée** : import du projet Lovable/GitHub/ZIP + adaptations Emergent + tests OK.
- ⏳ **Phase 5 en cours** : sous-phase Logo + correctifs SEO critiques **validés** ; reste l’**harmonisation SEO avancée** (OG/Twitter/canonical/hreflang cross-routes + sitemaps) et la **préparation Search Console** (soumission automatique bloquée sans identifiants).

---

## 2) Implementation Steps

### Phase 1 — POC Core (Isolation): extraction + inventaire + rendu minimal ✅ COMPLETED
**Core prouvé**: capacité à **extraire** le site (backup + live), produire un **inventaire pages/assets/redirects**, et **valider** le socle de reconstruction.

Résultats Phase 1
- Backup `lovanet-fr_260714.backup` identifié : **PostgreSQL/Supabase custom dump** (`PGDMP` v1.16).
- Inventaire des tables publiques détectées.
- Crawl live : `https://lovanet.fr` + sitemaps + robots + bundles.
- Manifest : `/app/extraction/manifest/lovanet_manifest.json` (routes/assets).
- Assets mirrorrés dans `/app/frontend/public`.
- Script POC : `/app/tests/test_core_lovanet.py` → **CORE_POC_SUCCESS**.

Note technique
- `pg_restore` local incompatible avec **PGDMP v1.16** ; extraction via inventaire + crawl live.

Exit criteria Phase 1
- Manifest stable, assets mirrorrés, POC validé.

---

### Phase 2 — V1 App Development (MVP): reconstruction des pages + dynamiques internes ✅ COMPLETED
Objectif
- Déployer une V1 navigable et fidèle avec pages + UI + redirections + overlays + contact + panier/commande.

Résultats
- Frontend React (dark neon + glassmorphism) + routes principales.
- Backend FastAPI `/api` (pages, redirects, products, videos, catalog, countdowns, forms, orders).
- Validations : lint/build/E2E OK.

Limitation
- Checkout = demande de commande, pas de paiement.

---

### Phase 3 — External Auto-Sync Parity + Fidelity UI ✅ COMPLETED
Objectif
- Synchro externe + catalogue dynamique.

Résultats
- Scheduler backend 5 minutes.
- YouTube API + AniList OK.
- TikTok/Prime best-effort (degraded possible).
- UI panels sync + catalogue carrousel circulaire.
- Tests E2E OK.

---

### Phase 4 — Import du projet source Lovable/GitHub/ZIP ✅ COMPLETED
Objectif
- Maximiser la fidélité en important le vrai projet.

Résultats
- ZIP = GitHub identiques.
- Base UI Lovable adoptée + adaptation CRA/Emergent.
- Réintégration endpoints backend auto-sync.
- Fix SVG + limites `/api/videos`.
- Build/E2E OK.

---

### Phase 5 — Logo + SEO complet + backups + sitemaps verticaux ⏳ IN PROGRESS
**Objectif Phase 5 (ordre confirmé utilisateur)**
1) Intégrer le **logo utilisateur** dans le menu/navigation.
2) Décliner le logo en **favicon** et icônes.
3) Appliquer les **correctifs SEO critiques** :
   - `/shop` JSON‑LD : `aggregateRating` + `review`
   - `/actualites` : supprimer le doublon de `meta description`
4) Continuer l’indexation complète : OG/Twitter, canonical/hreflang, sitemaps spécialisés, robots, RSS/Atom, backups.
5) Préparer Search Console (automatisation bloquée sans identifiants exploitables).

#### Phase 5.0 — Préflight (anti-régression) ✅ DONE
- Identification composants : Navbar + head manager (Helmet) + JSON‑LD Shop + Actualités.
- Relecture `design_guidelines.md`.

#### Phase 5.1 — Logo dans navigation ✅ DONE + VALIDÉ
- Logo intégré dans `Navbar` en asset public : `/lovanet-logo-custom.png`.
- `data-testid="header-home-logo-link"` ajouté.
- Vérification visuelle preview : OK (logo visible).

#### Phase 5.2 — Favicon & icônes ✅ DONE + VALIDÉ
- Génération depuis le logo fourni :
  - `public/favicon.ico`
  - `public/favicon-32x32.png`, `public/favicon-16x16.png`
  - `public/apple-touch-icon.png`
  - `public/favicon.png`
  - `public/lovanet-logo-custom.png` (source)
- `public/index.html` mis à jour (liens PNG + apple-touch).

#### Phase 5.3 — Correctifs SEO critiques ✅ DONE + VALIDÉ
- **/shop** : JSON‑LD `ItemList` contient désormais `aggregateRating` + `review` (review en tableau, rating/reviewCount normalisés + fallback image).
- **/actualites** : plus de duplication de `meta description` grâce à la logique **`pageOwnsCoreSeo`** (la page Actualités “possède” sa description; `LocalizedHead` ne la duplique pas).

#### Phase 5.4 — Harmonisation SEO logo + assets statiques ✅ DONE
- Références logo SEO basculées vers `lovanet-logo-custom.png` :
  - `LocalizedHead` (`Organization.logo`)
  - `Actualites` (`publisher.logo`)
  - `public/index.html` JSON‑LD
  - `public/structured-data.json`
  - `public/robots.txt`
  - `scripts/generate_seo_assets.py` (robots allowances + JSON-LD static)

#### Phase 5.5 — Validation build/runtime + QA ✅ DONE
- `yarn build` : OK (warnings non bloquants mediapipe + ESLint plugin manquant).
- Note : les logs historiques contenaient une ancienne erreur `lovanetLogo` avant redémarrage ; l’état actuel du code/build est sain.

#### Phase 5.6 — SEO avancé “complet” (OG/Twitter/canonical/hreflang) ⏳ TODO
- Vérifier cohérence **sur toutes routes** (y compris routes i18n) :
  - canonical (pas de conflit LocalizedHead vs pages)
  - OG/Twitter (images, type, url)
  - `hreflang` / `x-default`
- Ajouter/valider `rel=alternate` pour le domaine secondaire selon stratégie canonique.

#### Phase 5.7 — Données structurées (extensions) ⏳ TODO
- Compléter/valider selon pages :
  - `VideoObject` sur pages vidéos
  - `BreadcrumbList` cohérent pour routes dynamiques
- Valider via tests Rich Results / schema validators.

#### Phase 5.8 — Sitemaps spécialisés + robots ✅ PARTIAL → TODO
- Fichiers déjà présents en `public/`.
- À faire : audit des URLs, images, routes i18n, et cohérence avec le contenu réel.

#### Phase 5.9 — RSS/Atom Actualités ✅ DONE (existant) → ⏳ VALIDATION
- `rss.xml` + `atom.xml` présents.
- À valider : contenu, dates, images, conformité Google News (best-effort).

#### Phase 5.10 — Backups SEO + export backend ⏳ PARTIAL
- `public/seo-backup.json` présent.
- À faire (si requis) : endpoint backend d’export SEO depuis MongoDB + pipeline d’update.

#### Phase 5.11 — Google Search Console (soumission autonome) ⏳ BLOCKED
- Préparation : sitemaps prêts.
- Automatisation API : nécessite credentials (OAuth/service account + vérification du site).

**Exit criteria Phase 5**
- ✅ Logo navbar + ✅ favicon/touch icons.
- ✅ `/shop` JSON‑LD inclut `aggregateRating` + `review`.
- ✅ `/actualites` : meta description unique.
- SEO avancé harmonisé : OG/Twitter/canonical/hreflang cohérents et non dupliqués.
- Sitemaps/robots/RSS/Atom validés.
- Backups/exports SEO opérationnels.
- Prêt Search Console (soumission auto uniquement si credentials fournis).

---

## 3) Next Actions
1) **Audit SEO global** :
   - canonical/hreflang sur toutes routes (incl. i18n)
   - OG/Twitter (images, type, url)
   - vérifier absence de duplications Helmet (title/description/canonical)
2) **Valider structured data** :
   - Rich Results test sur `/shop` et `/actualites`
   - compléter `VideoObject` si nécessaire
3) **Audit sitemaps** : vérifier URLs/images/videos/news, et cohérence domaine canonique.
4) **Backups/export SEO** : confirmer besoin d’un endpoint backend d’export et l’implémenter si validé.
5) **Search Console** : demander/collecter credentials si l’utilisateur veut l’automatisation (sinon fournir procédure manuelle).

---

## 4) Success Criteria
### Atteints (Phases 1–4)
- Pages accessibles principales rendues et navigables + aliases/redirects.
- Médias principaux servis.
- Overlays/bulles + formulaires + demandes de commande.
- Auto-sync 5 minutes (YouTube/AniList OK ; TikTok/Prime best-effort).
- Catalogue (recherche/filtres/carrousel/grille).
- Import Lovable complet + stabilité (build/E2E OK).

### Atteints (Phase 5 — sous-phase logo + correctifs SEO critiques)
- ✅ Logo utilisateur visible dans la navbar.
- ✅ Favicon/touch icons générés et référencés.
- ✅ `/shop` JSON‑LD contient `aggregateRating` et `review`.
- ✅ `/actualites` : plus de meta description dupliquée (`pageOwnsCoreSeo`).
- ✅ Build production OK (`yarn build`).

### À atteindre (Phase 5 — restant)
- Harmonisation SEO avancée complète (OG/Twitter/canonical/hreflang) sur toutes routes.
- Validation et complétion JSON‑LD (VideoObject, etc.) + tests Rich Results.
- Sitemaps/robots/RSS/Atom validés et cohérents.
- Backups/export SEO finalisés.
- Search Console prêt (automatisation uniquement si credentials fournis).

### Transparence / contraintes externes
- TikTok/Prime sans API : fiabilité variable.
- Supabase MCP : nécessite token (401 actuel).
- Warnings build non bloquants possibles (source maps mediapipe).
- Google News : préparation possible (NewsArticle + sitemap news + RSS), pas de garantie d’éligibilité.
