# plan.md — Reconstruction de Lovanet.fr (FARM: FastAPI + React + MongoDB)

## 1) Objectives
- Reconstruire **Lovanet.fr à l’identique** (au mieux techniquement) : **toutes les pages accessibles**, design, mise en page, typographies/couleurs, navigation.
- Reprendre et servir **assets** (images/vidéos/fichiers), **liens**, **redirections** et comportements UI (overlays, bulles flottantes, etc.).
- Recréer les **fonctionnalités dynamiques** visibles ET les **configurations de synchronisation externe** (auto-sync) présentes sur l’autre site :
  - **YouTube** (sync officiel via API)
  - **TikTok** (best-effort sans API)
  - **Prime Video** (best-effort sans API)
  - **Catalogue anime/manga** (AniList public + compléments best-effort)
- Mettre en place une synchronisation **autonome toutes les 5 minutes** (backend scheduler) avec **stockage MongoDB** et **endpoints admin/sync**.
- Prioriser les sources les plus complètes (**backup + live + projet Lovable/GitHub/ZIP**) afin d’obtenir une **fidélité maximale**.
- Respecter contraintes projet Emergent : `REACT_APP_BACKEND_URL`, `MONGO_URL`, routes backend préfixées par `/api`.

### Objectif SEO / Référencement
- Paramétrer le SEO : meta tags, OpenGraph/Twitter, canonical/hreflang.
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

### Nouvel objectif (Search Console)
- Ajouter la balise de vérification Google **sur toutes les pages** :
  - `<meta name="google-site-verification" content="eDW28NAvAT9tr_dkYRKphCLRed_tlkJefXfYLvPbqd0" />`
- Finaliser l’automatisation Search Console :
  - soumission/validation des sitemaps via **Google Search Console API**
  - credentials fournis par l’utilisateur via un **fichier JSON** (artifact upload)

### Nouvel objectif (TikTok)
- Corriger la page TikTok du site pour **n’afficher et ne synchroniser que** les vidéos du compte :
  - `https://www.tiktok.com/@anime.moments.officiel`

**Domaines / cibles SEO (confirmé utilisateur)**
- `https://lovanet.fr`
- `https://animemomentsofficiel.fr`

> Note canonique : éviter la duplication en choisissant un **domaine canonique primaire** (par défaut `lovanet.fr`) et traiter l’autre en **alternate** ou via stratégie de redirections/canonical.

**Statut environnements**
- Deux environnements existent : **Preview** (dev) + **Production** (déployé sur `https://animemomentsofficiel.fr`).
- L’utilisateur signale les sujets **sur les deux** : on corrige en **Preview**, puis l’utilisateur devra **redeployer** pour propager en production.

**Statut actuel**
- ✅ Phase 1 terminée (extraction/inventaire/mirror).
- ✅ Phase 2 terminée (V1 full-stack + tests).
- ✅ Phase 3 terminée (auto-sync externe + UI + tests).
- ✅ Phase 4 terminée (import Lovable/GitHub/ZIP + adaptations).
- ⏳ Phase 5 en cours :
  - ✅ Logo + favicon + correctifs SEO critiques (shop JSON‑LD + actualités meta) terminés.
  - ⏳ Reste à faire : **Search Console meta + automatisation API**, validation sitemaps/RSS/JSON‑LD, correctif TikTok page.

---

## 2) Implementation Steps

### Phase 1 — POC Core (Isolation): extraction + inventaire + rendu minimal ✅ COMPLETED
- Backup identifié, crawl live, manifest, mirroring assets.

### Phase 2 — V1 App Development (MVP): pages + dynamiques internes ✅ COMPLETED
- Frontend routes principales, backend `/api`, validations build/E2E.

### Phase 3 — External Auto-Sync Parity + Fidelity UI ✅ COMPLETED
- Scheduler 5 minutes, YouTube/AniList OK, TikTok/Prime best-effort, UI sync.

### Phase 4 — Import du projet source Lovable/GitHub/ZIP ✅ COMPLETED
- Base Lovable intégrée + adaptation Emergent + build/E2E OK.

### Phase 5 — SEO + Search Console + TikTok ⏳ IN PROGRESS

#### Phase 5.1 — Logo + navigation ✅ DONE
- Logo utilisateur dans navbar : `/lovanet-logo-custom.png`.

#### Phase 5.2 — Favicon & icônes ✅ DONE
- `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` + liens dans `public/index.html`.

#### Phase 5.3 — Correctifs SEO critiques ✅ DONE
- `/shop` JSON‑LD : ajout/normalisation `aggregateRating` + `review`.
- `/actualites` : suppression duplication meta description via ownership (`pageOwnsCoreSeo`).

#### Phase 5.4 — Harmonisation SEO logo statique ✅ DONE
- Références logo SEO basculées vers `lovanet-logo-custom.png` (LocalizedHead / Actualites / index.html / structured-data.json / robots.txt / script SEO).

#### Phase 5.5 — Search Console : balise meta + automatisation API ⏳ TODO (PRIORITÉ)
1) **Ajouter la meta de vérification** sur toutes les pages
   - Implémenter dans le head global (Helmet) pour s’appliquer à toutes les routes.
   - Vérifier qu’elle est présente sur pages clés : `/`, `/shop`, `/tiktok`, `/actualites`.

2) **Intégrer les credentials Search Console** (fichier JSON upload)
   - Déterminer le type : service account ou OAuth.
   - Stockage sécurisé dans l’environnement (variables / secret store) ; ne pas commiter.

3) **Implémenter la soumission automatique des sitemaps**
   - Backend : endpoint admin (ex: `POST /api/admin/search-console/submit`) et/ou job scheduler.
   - API Google Search Console : soumettre/ping les sitemaps :
     - `sitemap.xml`, `sitemap-images.xml`, `sitemap-videos.xml`, `sitemap-products.xml`, `sitemap-news.xml` (et autres s’ils existent).
   - Ajouter logs/retours JSON (succès/erreur) + statut.

4) **Validation**
   - Confirmer que la propriété Search Console est bien `https://animemomentsofficiel.fr/` (prod) et/ou `https://lovanet.fr/` selon configuration.
   - Documenter la procédure de redeploy pour que la prod récupère la balise et les endpoints.

#### Phase 5.6 — Validation des sitemaps / RSS / JSON-LD sur routes clés ⏳ TODO
- Auditer et corriger :
  - sitemaps : URLs, lastmod, namespaces, cohérence domaine canonique, présence routes clés
  - RSS/Atom : dates, liens, images, conformité best-effort
  - JSON‑LD : Organization/WebSite/WebPage/BreadcrumbList + Product/ItemList + NewsArticle + (si requis) VideoObject
- Routes clés à valider :
  - `/` (home)
  - `/shop`
  - `/tiktok`
  - `/chaine-youtube`
  - `/prime-video`
  - `/actualites` et `/actualites/:slug`
  - `/anime-catalog`

#### Phase 5.7 — Correctif TikTok : page TikTok filtrée sur @anime.moments.officiel ⏳ TODO (PRIORITÉ)
- Objectif : la page `/tiktok` doit afficher **uniquement** les vidéos du compte `@anime.moments.officiel`.
- Actions :
  - Identifier la source actuelle (backend sync TikTok + collection Mongo + endpoint `/api/videos?source=tiktok` ou équivalent).
  - Implémenter un filtre robuste :
    - soit côté backend (store/ingest seulement ce compte)
    - soit côté query (paramètre `username=@anime.moments.officiel` ou `channelId`/`authorId` selon ce qui est stocké)
  - Corriger le carrousel / liste sur la page TikTok pour ne plus mélanger d’autres comptes.
  - Ajouter tests/guardrails : si aucune vidéo disponible, fallback UI sans crash.

#### Phase 5.8 — QA obligatoire (avec testing_agent) ⏳ TODO
- Après implémentation (Search Console + sitemaps/RSS/JSON‑LD + TikTok page) :
  - exécuter le **testing_agent** pour valider les bugs rapportés (obligatoire)
  - fournir un rapport :
    - balise meta présente sur routes clés
    - endpoints/automatisation Search Console OK (au moins côté preview)
    - `/tiktok` affiche uniquement `@anime.moments.officiel`
    - sitemaps/RSS/JSON‑LD accessibles et valides

**Exit criteria Phase 5 (mis à jour)**
- ✅ Logo navbar + ✅ favicon.
- ✅ `/shop` JSON‑LD inclut `aggregateRating` + `review`.
- ✅ `/actualites` meta description unique.
- ✅ Meta `google-site-verification` présente sur toutes les pages.
- ✅ Soumission Search Console automatisée (API) opérationnelle en preview.
- ✅ `/tiktok` limité à `@anime.moments.officiel`.
- ✅ Sitemaps/RSS/JSON‑LD validés sur routes clés.
- ✅ Rapport testing_agent fourni.

---

## 3) Next Actions (ordre d’exécution)
1) Ajouter la meta `google-site-verification` globalement (toutes pages).
2) Intégrer le JSON credentials et implémenter l’automatisation Search Console (API submit sitemaps).
3) Auditer/corriger sitemaps + RSS/Atom + JSON‑LD sur routes clés.
4) Corriger TikTok (page `/tiktok` filtrée `@anime.moments.officiel`).
5) Lancer le **testing_agent** (obligatoire) et fournir le rapport.
6) L’utilisateur redeploy ensuite pour pousser en production `https://animemomentsofficiel.fr`.

---

## 4) Success Criteria
### Atteints (Phases 1–4)
- Socle complet + import Lovable + auto-sync + pages + tests.

### Atteints (Phase 5 — déjà fait)
- Logo navbar intégré.
- Favicon/touch icons générés.
- `/shop` JSON‑LD enrichi (`aggregateRating` + `review`).
- `/actualites` meta description non dupliquée.

### À atteindre (Phase 5 — restant)
- Meta Search Console + automatisation API via credentials JSON.
- Validation/correction sitemaps, RSS, JSON‑LD sur routes clés.
- TikTok : page `/tiktok` uniquement `@anime.moments.officiel`.
- Testing_agent exécuté et rapport OK.

### Contraintes / transparence
- Les corrections effectuées en preview devront être **redeployées** pour corriger la production.
- TikTok reste best-effort sans API officielle : fiabilité dépend de l’accès public et des protections anti-scraping.
