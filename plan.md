# plan.md — Reconstruction de Lovanet.fr (FARM: FastAPI + React + MongoDB)

## 1) Objectives
- Reconstruire **Lovanet.fr à l’identique** (au mieux techniquement) : **toutes les pages accessibles**, design, mise en page, typographies/couleurs, navigation.
- Reprendre et servir **assets** (images/vidéos/fichiers), **liens**, **redirections** et comportements UI.
- Recréer les **fonctionnalités dynamiques** visibles ET les **configurations de synchronisation externe** (auto-sync) :
  - **YouTube** (sync officiel via API)
  - **TikTok** (best-effort sans API)
  - **Prime Video** (best-effort sans API)
  - **Catalogue anime/manga** (AniList public + compléments best-effort)
- Mettre en place une synchronisation **autonome toutes les 5 minutes** (backend scheduler) avec **stockage MongoDB**.
- Respecter contraintes Emergent : `REACT_APP_BACKEND_URL`, `MONGO_URL`, backend préfixé `/api`.

### Objectif SEO / Référencement
- Paramétrer le SEO : meta tags, OpenGraph/Twitter, canonical/hreflang/alternate.
- Générer et maintenir les fichiers d’indexation :
  - `robots.txt`
  - `sitemap.xml` + sitemaps spécialisés **Pages / Images / Vidéos / Produits / News / Catalogue**
  - flux **RSS/Atom** (Actualités)
  - données structurées **JSON‑LD schema.org** (Organization, WebSite, WebPage, Product, VideoObject, BreadcrumbList, Article/NewsArticle)
  - inclure les champs demandés : **`aggregateRating`** et **`review`** (là où applicable)
- **Logo utilisateur** : navbar + favicon + SEO (`Organization.logo` etc.).
- Préparer l’occupation des verticales : **Google Web, Images, Vidéos, Produits, Actualités** (best-effort).

### Objectif (Search Console)
- Ajouter la balise de vérification Google :
  - `<meta name="google-site-verification" content="eDW28NAvAT9tr_dkYRKphCLRed_tlkJefXfYLvPbqd0" />`
- Finaliser l’automatisation Search Console :
  - soumission/validation des sitemaps via **Google Search Console API**
  - credentials fournis par l’utilisateur via **service account JSON**

### Objectif (TikTok)
- **Rétablir l’expérience “comme avant”** sur la page TikTok du site :
  - lecteur TikTok
  - liste/carrousel
  - flux visible (avec fallback officiel quand TikTok bloque l’énumération)
- Source officielle : `https://www.tiktok.com/@anime.moments.officiel`

### Domaines / cibles SEO (confirmé utilisateur)
- Domaine primaire (canonique) : `https://lovanet.fr`
- Domaines secondaires à traiter **PARTOUT** (SEO + JSON‑LD + sitemaps + meta) :
  - `https://animemomentsofficiel.fr`
  - `https://animeofficiel.fr`

> Note canonique : éviter la duplication en conservant une stratégie de canonique primaire, et utiliser `alternate`/`hreflang`/redirections si nécessaire.

### Statut environnements
- Deux environnements existent : **Preview** (dev) + **Production** (`https://animemomentsofficiel.fr`).
- Priorité utilisateur : **les deux** → corrections faites en **Preview**, puis **redeploy** nécessaire pour pousser en production.

### Validation attendue (clarifiée)
- Attendu : **soumission technique** (sitemaps/pages/images/vidéos/news/catalogue) + **vérification des signaux SEO** (meta/JSON‑LD/miniatures/descriptions/routes indexables).
- Non garanti : **indexation finale** (décision/crawl Google).

### Statut actuel (mesuré)
- SEO export (preview) :
  - `catalogCount = 1500`
  - `videos = 1297`
  - `news = 30`
  - `products = 76`

### Statut actuel (projet)
- ✅ Phase 1 terminée (extraction/inventaire/mirror).
- ✅ Phase 2 terminée (V1 full-stack + tests).
- ✅ Phase 3 terminée (auto-sync externe + UI + tests).
- ✅ Phase 4 terminée (import Lovable/GitHub/ZIP + adaptations).
- ✅ Phase 5 terminée (SEO + Search Console + TikTok + Multi-domain) **en preview**.
- ⚠️ Blocage externe persistant : la soumission réelle Search Console reste en état `api_access_not_configured` tant que l’API Search Console n’est pas activée sur le projet `dynamic-cove-502914-u0`.

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

### Phase 5 — SEO + Search Console + TikTok + Multi-domain ✅ COMPLETED (en preview)

#### Phase 5.1 — Logo + navigation ✅ DONE
- Logo utilisateur dans navbar : `/lovanet-logo-custom.png`.

#### Phase 5.2 — Favicon & icônes ✅ DONE
- `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` + liens `public/index.html`.

#### Phase 5.3 — Correctifs SEO critiques ✅ DONE
- `/shop` JSON‑LD : ajout/normalisation `aggregateRating` + `review`.
- `/actualites` : suppression duplication meta description via ownership.

#### Phase 5.4 — Harmonisation SEO logo statique ✅ DONE
- Références SEO vers `lovanet-logo-custom.png` (LocalizedHead / Actualites / index.html / structured-data.json / robots.txt / script SEO).

#### Phase 5.5 — Search Console : balise meta + automatisation API ✅ DONE (avec dépendance externe)
1) ✅ Balise meta vérification (1 seule occurrence globale).
2) ✅ Endpoints backend :
   - `GET /api/seo/search-console/status`
   - `POST /api/seo/search-console/submit`
3) ✅ Gestion d’état : retourne `api_access_not_configured` + URL d’activation quand l’API Google Search Console est désactivée.
4) ✅ Support multi-propriétés (préparé) : `lovanet.fr`, `animemomentsofficiel.fr`, `animeofficiel.fr`.
5) ⚠️ DÉPENDANCE EXTERNE :
   - Activer l’API Search Console sur le projet Google (`dynamic-cove-502914-u0`) et autoriser le service account sur les propriétés.

#### Phase 5.6 — Validation des sitemaps / RSS / JSON‑LD ✅ DONE
- Fichiers validés dans `/frontend/public` :
  - `sitemap.xml` + index
  - `sitemap-pages.xml`
  - `sitemap-images.xml`
  - `sitemap-videos.xml`
  - `sitemap-products.xml`
  - `sitemap-news.xml`
  - `sitemap-books.xml`
  - `sitemap-catalog.xml` + chunks (`sitemap-catalog-1.xml`, `sitemap-catalog-2.xml`)
  - `rss.xml`, `atom.xml`
  - `structured-data.json`

#### Phase 5.7 — TikTok : expérience complète restaurée ✅ DONE (validée)
- UI riche (player + carrousel) si vidéos disponibles.
- Fallback officiel : widget profil TikTok via oEmbed quand la sync renvoie 0 vidéo.
- Validé par `testing_agent` iteration_5.

#### Phase 5.8 — Multi-domain SEO “PARTOUT” ✅ DONE (validée)
Objectif : présence des signaux SEO + listings pour : pages, images, vidéos, actualités, catalogue.
- ✅ Ajout des domaines secondaires dans :
  - meta tags / links `alternate`
  - JSON‑LD `Organization.sameAs`
  - backend export SEO
- ✅ Canonicals/alternates conservent les paramètres profonds (indexables) :
  - `/shop?product=...`
  - `/lecteurs-video?video=...` (best-effort)
  - `/anime-catalog?anime=...`
- ✅ Sitemaps multi-domain générés :
  - `sitemap-animemomentsofficiel-fr.xml` (+ déclinaisons)
  - `sitemap-animeofficiel-fr.xml` (+ déclinaisons)
- ✅ Catalogue : sitemap dédié chunké via `sitemap-catalog.xml` → `sitemap-catalog-1.xml` (1000) + `sitemap-catalog-2.xml` (500)
- ✅ Validé par `testing_agent` iteration_6 (100%).

---

## 3) Next Actions (ordre d’exécution)
1) **Action Google (bloquant)** : activer l’API Search Console sur le projet `dynamic-cove-502914-u0` via l’URL fournie par `GET /api/seo/search-console/status`.
2) **Permissions** : ajouter le service account comme propriétaire/administrateur sur les 3 propriétés (`lovanet.fr`, `animemomentsofficiel.fr`, `animeofficiel.fr`).
3) **Soumission technique** : relancer `POST /api/seo/search-console/submit` pour soumettre tous les sitemaps (pages/images/vidéos/produits/news/books/catalogue + multi-domain).
4) **Production** : l’utilisateur **redeploy** pour pousser toutes les corrections de preview sur `https://animemomentsofficiel.fr` (et configurer le domaine `animeofficiel.fr`).
5) **Suivi** : vérifier côté Search Console (UI) l’apparition des sitemaps et l’état d’exploration (sans promesse d’indexation finale).

---

## 4) Success Criteria
### Atteints (Phases 1–4)
- Socle complet + import Lovable + auto-sync + pages + tests.

### Atteints (Phase 5 — en preview)
- Logo navbar intégré.
- Favicon/touch icons générés.
- `/shop` JSON‑LD enrichi (`aggregateRating` + `review`).
- `/actualites` meta description non dupliquée.
- Search Console meta + endpoints backend + message d’activation API.
- Sitemaps/RSS/JSON‑LD validés.
- TikTok : page `/tiktok` non vide + expérience visible restaurée (fallback widget officiel) + tests OK.
- Multi-domain SEO : `animemomentsofficiel.fr` + `animeofficiel.fr` présents **PARTOUT** (meta/link/JSON‑LD/sitemaps/backend) + tests OK (`testing_agent` iteration_6).

### À atteindre (restant — dépendances externes & déploiement)
- ✅ (Technique prête) Soumission Search Console de tous les listings dès activation Google + permissions.
- ✅ (Organisation) Redeploy en production pour appliquer les changements.
- 📈 (Après déploiement) Contrôler dans Search Console : sitemaps listés, erreurs d’exploration, couverture.

### Contraintes / transparence
- Les corrections faites en preview nécessitent un **redeploy** pour production.
- TikTok reste best-effort sans API officielle : l’énumération peut rester à 0 ; le fallback widget officiel garantit un affichage non vide.
- Search Console : soumission via API dépend de l’activation Google + permissions sur les propriétés.
- L’indexation finale (Google) n’est pas garantie, seulement la **soumission** et la **présence** des signaux SEO.
