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

### Objectif (Search Console)
- Ajouter la balise de vérification Google **sur toutes les pages** :
  - `<meta name="google-site-verification" content="eDW28NAvAT9tr_dkYRKphCLRed_tlkJefXfYLvPbqd0" />`
- Finaliser l’automatisation Search Console :
  - soumission/validation des sitemaps via **Google Search Console API**
  - credentials fournis par l’utilisateur via un **fichier JSON** (service account)

### Objectif (TikTok)
- **Rétablir l’expérience “comme avant”** sur la page TikTok du site :
  - lecteur vidéo TikTok
  - liste/carrousel
  - flux de vidéos **visible** sur la page
- Source officielle cible : `https://www.tiktok.com/@anime.moments.officiel`
- Contrainte : TikTok est **best-effort sans API** ; prévoir une stratégie de fallback pour éviter une page vide quand TikTok bloque l’énumération.

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
  - ✅ Logo + favicon + correctifs SEO critiques terminés.
  - ✅ Search Console : meta + endpoints backend + gestion d’erreur Google (API désactivée) terminés.
  - ✅ Validation sitemaps/RSS/JSON‑LD terminée.
  - ⏳ TikTok : l’affichage a été rendu strict (vide si 0 vidéo). **Nouvelle priorité : rétablir l’expérience complète “comme avant” + vidéos visibles.**

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

#### Phase 5.5 — Search Console : balise meta + automatisation API ✅ DONE (avec dépendance externe)
1) ✅ **Balise meta de vérification** ajoutée globalement.
2) ✅ **Endpoints backend** :
   - `GET /api/seo/search-console/status`
   - `POST /api/seo/search-console/submit`
3) ✅ **Gestion d’état** : retourne un statut explicite `api_access_not_configured` si l’API Google Search Console n’est pas activée sur le projet du compte de service.
4) ⚠️ **Dépendance externe** : activation de l’API côté Google Console requise pour une soumission réelle.

#### Phase 5.6 — Validation des sitemaps / RSS / JSON-LD ✅ DONE
- Validation des fichiers présents dans `/frontend/public` :
  - `sitemap.xml`, `sitemap-pages.xml`, `sitemap-images.xml`, `sitemap-videos.xml`, `sitemap-products.xml`, `sitemap-news.xml`, `rss.xml`, `atom.xml`, `structured-data.json`.
- Vérification routes clés présentes dans `sitemap-pages.xml`.

#### Phase 5.7 — TikTok : rétablir l’expérience complète “comme avant” ⏳ TODO (PRIORITÉ)
**Objectif :** la page `/tiktok` doit réafficher un lecteur TikTok + une liste/carrousel + un flux de vidéos **visible**, en se basant sur le compte officiel.

Actions :
1) **Rétablir l’UI “riche”** (lecteur + carrousel + navigation) même si le backend retourne 0 vidéos.
2) **Stratégie de données (3 niveaux)** pour éviter une page vide :
   - Niveau 1 (préféré) : vidéos issues du backend MongoDB (sync TikTok best-effort).
   - Niveau 2 : tentative d’énumération publique améliorée (si possible) via parsing HTML/rehydration (best-effort, peut casser).
   - Niveau 3 (fallback UX) : un **fallback visuel utile** (liste curatée) qui reste strictement “TikTok officiel” (ex: IDs connus), afin d’avoir un flux visible quand TikTok bloque l’énumération.
3) **Conserver le lecteur TikTok officiel** (embed `player/v1/{id}`) et les liens sortants vers le compte.
4) **Guardrails** : indiquer clairement un mode “dégradé” si la synchro live est bloquée, sans afficher du contenu non-TikTok.

> Remarque : TikTok bloque fréquemment l’accès automatisé (anti-bot / geo / login). Le fallback (niveau 3) est la seule garantie d’affichage “comme avant” en toutes circonstances.

#### Phase 5.8 — QA obligatoire (avec testing_agent) ⏳ TODO
- Après le rétablissement de l’expérience TikTok :
  - exécuter le **testing_agent** pour valider le bug rapporté (obligatoire)
  - vérifier :
    - lecteur TikTok visible
    - carrousel/listing visible
    - pas de page vide
    - respect du compte officiel `@anime.moments.officiel` (liens et branding)

**Exit criteria Phase 5 (mis à jour)**
- ✅ Logo navbar + ✅ favicon.
- ✅ `/shop` JSON‑LD inclut `aggregateRating` + `review`.
- ✅ `/actualites` meta description unique.
- ✅ Meta `google-site-verification` présente sur toutes les pages.
- ✅ Search Console endpoints + état “API désactivée” géré proprement.
- ✅ Sitemaps/RSS/JSON‑LD validés.
- ⏳ `/tiktok` : lecteur + liste/carrousel + vidéos visibles (avec fallback si TikTok bloque).
- ⏳ Rapport testing_agent final fourni.

---

## 3) Next Actions (ordre d’exécution)
1) **TikTok** : rétablir le lecteur + carrousel + flux visible (avec fallback utile).
2) Lancer le **testing_agent** (obligatoire) et fournir le rapport.
3) L’utilisateur **redeploy** ensuite pour pousser en production `https://animemomentsofficiel.fr`.

---

## 4) Success Criteria
### Atteints (Phases 1–4)
- Socle complet + import Lovable + auto-sync + pages + tests.

### Atteints (Phase 5 — déjà fait)
- Logo navbar intégré.
- Favicon/touch icons générés.
- `/shop` JSON‑LD enrichi (`aggregateRating` + `review`).
- `/actualites` meta description non dupliquée.
- Meta Search Console présente + endpoints backend implémentés + statut explicite si API Google désactivée.
- Validation/correction sitemaps, RSS, JSON‑LD sur routes clés.

### À atteindre (Phase 5 — restant)
- TikTok : page `/tiktok` **expérience complète** (lecteur + carrousel + vidéos visibles), avec fallback si TikTok bloque.
- Testing_agent exécuté et rapport OK.

### Contraintes / transparence
- Les corrections effectuées en preview devront être **redeployées** pour corriger la production.
- TikTok reste best-effort sans API officielle : fiabilité dépend de l’accès public et des protections anti-scraping ; prévoir fallback.
- Search Console : la soumission automatisée nécessite que l’API Google Search Console soit **activée** sur le projet du compte de service + que la propriété soit autorisée/validée.