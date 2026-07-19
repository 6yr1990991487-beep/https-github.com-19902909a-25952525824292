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
- Paramétrer le SEO : meta tags, OpenGraph/Twitter, canonical/hreflang.
- Générer et maintenir les fichiers d’indexation :
  - `robots.txt`
  - `sitemap.xml` + sitemaps spécialisés **Pages / Images / Vidéos / Produits / News**
  - flux **RSS/Atom** (Actualités)
  - données structurées **JSON‑LD schema.org** (Organization, WebSite, WebPage, Product, VideoObject, BreadcrumbList, Article/NewsArticle)
  - inclure les champs demandés : **`aggregateRating`** et **`review`** (là où applicable)
- **Logo utilisateur** : navbar + favicon + SEO (`Organization.logo` etc.).
- Préparer l’occupation des verticales : **Google Web, Images, Vidéos, Produits, Actualités** (best-effort).

### Objectif (Search Console)
- Ajouter la balise de vérification Google **sur toutes les pages** :
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

### Statut actuel
- ✅ Phase 1 terminée (extraction/inventaire/mirror).
- ✅ Phase 2 terminée (V1 full-stack + tests).
- ✅ Phase 3 terminée (auto-sync externe + UI + tests).
- ✅ Phase 4 terminée (import Lovable/GitHub/ZIP + adaptations).
- ⏳ Phase 5 en cours :
  - ✅ Logo + favicon + SEO critiques.
  - ✅ Search Console : meta + endpoints + gestion erreur (API Google désactivée) + tests.
  - ✅ Validation sitemaps/RSS/JSON‑LD.
  - ✅ TikTok : expérience restaurée via fallback widget officiel si 0 vidéo (test iteration_5).
  - ⏳ Reste : **étendre le SEO partout pour les domaines secondaires** (`animeofficiel.fr` + `animemomentsofficiel.fr`) et **soumission technique** complète côté Search Console (dépendances externes).

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

### Phase 5 — SEO + Search Console + TikTok + Multi-domain ⏳ IN PROGRESS

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
1) ✅ Balise meta vérification sur toutes les pages.
2) ✅ Endpoints backend :
   - `GET /api/seo/search-console/status`
   - `POST /api/seo/search-console/submit`
3) ✅ Gestion d’état : retourne `api_access_not_configured` + URL d’activation quand l’API Google Search Console est désactivée.
4) ⚠️ DÉPENDANCE EXTERNE :
   - Activer l’API Search Console sur le projet Google (`dynamic-cove-502914-u0`) et donner accès au service account sur les propriétés.

#### Phase 5.6 — Validation des sitemaps / RSS / JSON‑LD ✅ DONE
- Fichiers validés dans `/frontend/public` :
  - `sitemap.xml`, `sitemap-pages.xml`, `sitemap-images.xml`, `sitemap-videos.xml`, `sitemap-products.xml`, `sitemap-news.xml`, `rss.xml`, `atom.xml`, `structured-data.json`.

#### Phase 5.7 — TikTok : expérience complète restaurée ✅ DONE (validée)
- UI riche (player + carrousel) si vidéos disponibles.
- Fallback officiel : widget profil TikTok via oEmbed quand la sync renvoie 0 vidéo.
- Validé par `testing_agent` iteration_5.

#### Phase 5.8 — Multi-domain SEO “PARTOUT” (animeofficiel.fr + animemomentsofficiel.fr) ⏳ TODO (priorité)
Objectif : assurer la **présence des signaux SEO** et la **soumission technique** pour :
- pages
- images (miniatures)
- vidéos
- actualités
- catalogue (y compris volumétrie annoncée > 10k items)

Actions :
1) **Meta + canonical/hreflang/alternate**
   - intégrer les domaines secondaires dans les `alternate` (et revoir la cohérence canonique).
2) **JSON‑LD**
   - `Organization.sameAs` + `WebSite`/`WebPage` cohérents multi-domain
   - s’assurer que les assets (logo/og) sont accessibles et cohérents.
3) **Sitemaps**
   - générer/séparer si nécessaire des sitemaps dédiés par domaine (ou à minima un plan de publication côté domaines secondaires).
   - pour gros catalogue : prévoir **sitemap index paginé** (ex: `sitemap-catalog-1.xml`, `sitemap-catalog-2.xml`…) si on dépasse les limites.
4) **Images / miniatures**
   - s’assurer que les URLs d’images sont crawlables (pas bloquées robots).
5) **Vidéos**
   - valider `VideoObject` + sitemap vidéo.
6) **Actualités**
   - valider RSS/Atom + NewsArticle + sitemap news.

#### Phase 5.9 — Soumission technique Search Console (tous listings) ⏳ TODO (bloqué tant que Google n’est pas activé)
- Objectif : **soumettre** (API) toutes les URLs sitemap nécessaires :
  - pages
  - images
  - vidéos
  - produits
  - news
  - catalogue
- Vérifier via `GET /api/seo/search-console/status` puis lancer `POST /api/seo/search-console/submit`.

#### Phase 5.10 — QA obligatoire (testing_agent) ⏳ TODO
- Après Phase 5.8/5.9 :
  - vérifier présence meta/JSON‑LD sur routes clés
  - vérifier accessibilité sitemaps + RSS/Atom
  - vérifier que les domaines secondaires sont présents dans les signaux et les listings soumis
  - rapport testing_agent obligatoire

---

## 3) Next Actions (ordre d’exécution)
1) **Phase 5.8** : intégrer `animeofficiel.fr` + `animemomentsofficiel.fr` **PARTOUT** (meta/JSON‑LD/sitemaps/listings).
2) **Phase 5.9** : activer côté Google l’API Search Console + donner les droits au compte de service, puis soumettre les sitemaps (images/vidéos/news/catalogue).
3) **Phase 5.10** : lancer `testing_agent` de validation globale (SEO + listings).
4) **Production** : l’utilisateur **redeploy** pour pousser toutes les corrections sur `https://animemomentsofficiel.fr` (et la config du domaine `animeofficiel.fr`).

---

## 4) Success Criteria
### Atteints (Phases 1–4)
- Socle complet + import Lovable + auto-sync + pages + tests.

### Atteints (Phase 5 — déjà fait)
- Logo navbar intégré.
- Favicon/touch icons générés.
- `/shop` JSON‑LD enrichi (`aggregateRating` + `review`).
- `/actualites` meta description non dupliquée.
- Search Console meta + endpoints backend + message d’activation API.
- Sitemaps/RSS/JSON‑LD validés.
- TikTok : page `/tiktok` non vide + expérience visible restaurée (fallback widget officiel) + tests OK.

### À atteindre (Phase 5 — restant)
- Ajout **PARTOUT** des domaines `animeofficiel.fr` + `animemomentsofficiel.fr` dans les signaux SEO.
- Soumission technique Search Console de tous les listings (pages/images/vidéos/news/catalogue) une fois l’API activée côté Google.
- Rapport `testing_agent` final après ces changements.

### Contraintes / transparence
- Les corrections faites en preview nécessitent un **redeploy** pour production.
- TikTok reste best-effort sans API officielle : l’énumération peut rester à 0 ; le fallback widget officiel garantit un affichage non vide.
- Search Console : soumission via API dépend de l’activation Google + permissions sur les propriétés.
- L’indexation finale (Google) n’est pas garantie, seulement la **soumission** et la **présence** des signaux SEO.