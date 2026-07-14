# plan.md — Reconstruction de Lovanet.fr (FARM: FastAPI + React + MongoDB)

## 1) Objectives
- Reconstruire **Lovanet.fr à l’identique** (au mieux techniquement) : **toutes les pages accessibles**, design, mise en page, typographies/couleurs, navigation.
- Reprendre et servir **assets** (images/vidéos/fichiers), **liens**, **redirections** et comportements UI (ex: **bulles flottantes**, **superpositions/overlays**, bandeaux, popups).
- Recréer les **fonctionnalités dynamiques** détectées (ex: formulaires de contact, demandes de devis, inscriptions/newsletter, etc.) avec stockage + envoi si applicable.
- Prioriser le contenu issu de `lovanet-fr_260714.backup`, compléter/valider via le site live.
- Respecter contraintes projet : `REACT_APP_BACKEND_URL`, `MONGO_URL`, routes backend préfixées par `/api`.

## 2) Implementation Steps

### Phase 1 — POC Core (Isolation): extraction + inventaire + rendu minimal
**Core à prouver**: capacité à **extraire** le site (backup + live), produire un **inventaire pages/assets/redirects**, et **rendre fidèlement** 1–2 pages avec assets + bulles/overlays.

User stories (POC)
1. En tant qu’admin, je veux charger un backup et obtenir la liste des pages détectées pour savoir ce qui est récupérable.
2. En tant qu’admin, je veux crawler le site live et comparer pages/ressources vs backup pour détecter les manquants.
3. En tant que visiteur, je veux voir la page d’accueil rendue fidèlement (styles + images) pour valider la direction.
4. En tant que visiteur, je veux que les bulles flottantes/overlays visibles sur la home se comportent comme sur le site d’origine.
5. En tant qu’admin, je veux générer un rapport “OK / manquant / à refaire manuellement” pour cadrer le restant.

Steps
- Analyser le fichier `.backup` (identifier format: archive, DB dump, CMS export, etc.) et extraire :
  - structure pages (HTML/templates), CSS/JS, médias, config.
- Construire un **crawler** (Python) pour le site live :
  - sitemap si présent, sinon BFS liens internes ; normalisation URLs ; détection redirect (3xx).
  - téléchargement assets référencés (img/video/css/js/fonts) + hash pour dédup.
- Générer un **manifest JSON** unique :
  - `pages[] {url, title, html_source, assets[], last_seen_source}`
  - `assets[] {url, type, local_path, hash}`
  - `redirects[] {from,to,code,source}`
  - `ui_components[] {type: floatingBubble|overlay|banner, selectors/notes}`
- POC de rendu :
  - Servir 1–2 pages (Accueil + une page interne) via React (ou HTML rendu) en réutilisant CSS/JS.
  - Vérifier que les assets chargent depuis le projet, et que les overlays/bulles s’affichent.
- Websearch ciblé (best practices) :
  - “site mirroring assets rewrite relative URLs”, “FastAPI serve static mirrored site”, “React render external HTML safely”, “link rewriting for mirrored sites”.

Exit criteria Phase 1
- Manifest généré (pages + assets + redirects) et comparaison backup vs live.
- 1–2 pages rendues fidèlement avec assets + bulles/overlay visibles.

---

### Phase 2 — V1 App Development (MVP): reconstruction de toutes les pages accessibles
User stories (V1)
1. En tant que visiteur, je peux naviguer toutes les pages accessibles de Lovanet.fr avec la même structure et contenu.
2. En tant que visiteur, tous les médias (images/vidéos) s’affichent correctement et rapidement.
3. En tant que visiteur, les liens/menus/boutons redirigent vers les bonnes pages (internes/externes).
4. En tant que visiteur, les éléments interactifs (bulles flottantes, overlays, popups, banners) fonctionnent comme sur l’original.
5. En tant que visiteur, les formulaires (contact/devis/etc.) envoient bien les données et affichent un état succès/erreur clair.

Backend (FastAPI, `/api`)
- Modèles MongoDB:
  - `pages` (slug/url, html/body, metadata, source, updated_at)
  - `assets` (path, mime, hash, source)
  - `redirects` (from, to, code)
  - `submissions` (type, payload, created_at, status)
- Endpoints:
  - `GET /api/pages` + `GET /api/pages/{path}`
  - `GET /api/redirects` (pour génération côté front + validation)
  - `POST /api/forms/{form_type}` (contact/devis/newsletter…)
  - `GET /api/assets/{path}` (si on ne sert pas via static direct)
- Static serving:
  - Servir `/static/...` pour assets mirrorrés (images/videos/fonts/css/js).

Frontend (React)
- Router qui :
  - applique les redirects (mapping depuis backend)
  - rend les pages dynamiquement (HTML stocké / composants si pages identifiées)
- Intégration styles:
  - importer CSS mirrorré + fonts ; garantir mêmes breakpoints.
- Composants UI spécifiques:
  - FloatingBubble / Overlay / Popup / Banner (pilotés par config issue du manifest).
- Formulaires:
  - validation + états (loading/success/error)
  - envoi vers `/api/forms/...`

Migration contenu
- Remplir MongoDB à partir du manifest + extraction backup/live.
- Réécriture liens relatifs/absolus:
  - internal links -> routes React
  - assets -> `/static/...` (ou `/api/assets/...`).

Conclure Phase 2
- 1 round E2E avec Testing Agent sur : navigation, assets, redirects, bulles/overlays, formulaires.

---

### Phase 3 — Hardening & Fidelity Pass (amélioration conformité + complétude)
User stories (Hardening)
1. En tant que visiteur, je ne vois pas de liens cassés (404) en parcourant le site.
2. En tant que visiteur mobile, le rendu est identique (responsive) sur les pages principales.
3. En tant que visiteur, les vidéos se lancent/affichent comme prévu (autoplay si présent, fallback sinon).
4. En tant qu’admin, je peux voir un rapport des ressources manquantes et les remplacer.
5. En tant que visiteur, les performances sont bonnes (lazy-load images, caching headers) sans casser le rendu.

Steps
- Crawl interne de l’app reconstruite pour détecter 404/500, assets manquants, mixed content.
- Ajustements CSS/JS pour correspondance pixel-level sur sections critiques.
- Optimisations : cache static, compression, lazy loading (sans modifier layout).
- Ajout d’un écran “Asset Missing” interne (mode admin/dev) pour lister/remapper assets.
- Tests E2E + régressions.

---

### Phase 4 — Feature-complete parity (si détecté sur l’original)
User stories (Parity)
1. En tant que visiteur, les CTA (téléphone/mail/maps/whatsapp) fonctionnent partout.
2. En tant que visiteur, tout tracking/SEO visible (meta, OG tags) est cohérent page par page.
3. En tant que visiteur, les redirections historiques importantes fonctionnent (SEO/backlinks).
4. En tant que visiteur, les interactions avancées (carrousels, accordéons, animations) sont fidèles.
5. En tant qu’admin, je peux exporter les soumissions de formulaires.

Steps
- SEO: titles/meta/OG, sitemap, robots (si requis), canonical.
- Redirections complètes + tests automatiques.
- Parité interactions (carrousels/animations) en priorisant pages à fort trafic.
- (Option) Email provider pour formulaires (si besoin) après validation utilisateur.
- Test E2E final.

## 3) Next Actions
1. Télécharger/inspecter `lovanet-fr_260714.backup` et identifier son format + contenu réel.
2. Lancer un crawl du site live (liste exhaustive pages accessibles + assets + redirects).
3. Générer le manifest de comparaison (backup vs live) et sélectionner 2 pages pour POC (Accueil + une interne).
4. Implémenter POC de rendu avec assets + bulles/overlay.
5. Une fois POC validé, dérouler la reconstruction V1 de toutes les pages + formulaires.

## 4) Success Criteria
- 100% des **pages accessibles** recensées sont rendues et navigables dans l’app.
- 0 lien interne cassé sur un crawl complet ; redirects conformes.
- Médias (images/vidéos/fonts) chargent correctement, sans placeholders manquants.
- Bulles flottantes / superpositions / popups présents et comportement proche de l’original.
- Formulaires dynamiques fonctionnent E2E (submit, validation, stockage) avec UX claire.
- Tests E2E passent sur les flows clés (desktop + mobile).