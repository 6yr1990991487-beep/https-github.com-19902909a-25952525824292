# plan.md — Reconstruction de Lovanet.fr (FARM: FastAPI + React + MongoDB)

## 1) Objectives
- Reconstruire **Lovanet.fr à l’identique** (au mieux techniquement) : **toutes les pages accessibles**, design, mise en page, typographies/couleurs, navigation.
- Reprendre et servir **assets** (images/vidéos/fichiers), **liens**, **redirections** et comportements UI.
- Recréer les **fonctionnalités dynamiques** visibles ET les **configurations de synchronisation externe** (auto-sync) :
  - **YouTube** (sync officiel via API)
  - **TikTok** (best-effort sans API + fallback widget officiel)
  - **Prime Video** (best-effort sans API)
  - **Catalogue anime/manga** (AniList public + compléments best-effort)
- Mettre en place une synchronisation **autonome toutes les 5 minutes** (backend scheduler) avec **stockage MongoDB**.
- Respecter contraintes Emergent : `REACT_APP_BACKEND_URL`, `MONGO_URL`, backend préfixé `/api`.

### Objectif SEO / Référencement
- Paramétrer le SEO : meta tags, OpenGraph/Twitter, canonical/hreflang/alternate.
- Générer et maintenir les fichiers d’indexation :
  - `robots.txt`
  - `sitemap.xml` + sitemaps spécialisés **Pages / Images / Vidéos / Produits / News / Books / Catalogue** (catalogue chunké)
  - flux **RSS/Atom** (Actualités)
  - données structurées **JSON‑LD schema.org** (Organization, WebSite, WebPage, Product, VideoObject, BreadcrumbList, Article/NewsArticle)
  - inclure les champs demandés : **`aggregateRating`** et **`review`** (là où applicable)
- **Logo utilisateur** : navbar + favicon + SEO (`Organization.logo` etc.).
- Préparer l’occupation des verticales : **Google Web, Images, Vidéos, Produits, Actualités, Catalogue** (best-effort).

### Objectif (Search Console)
- Ajouter la balise de vérification Google :
  - `<meta name="google-site-verification" content="eDW28NAvAT9tr_dkYRKphCLRed_tlkJefXfYLvPbqd0" />`
- Finaliser l’automatisation Search Console :
  - soumission/validation des sitemaps via **Google Search Console API**
  - **2 modes d’authentification** :
    - **service account JSON** — utile si la propriété est partagée avec le compte de service + API activée
    - **OAuth Web client** — permet d’utiliser le compte Google utilisateur pour soumettre les sitemaps

> ⚠️ Sécurité (prioritaire)
> - ne jamais exposer le *client secret* OAuth (ni l’écrire dans le code/plan/logs)
> - utiliser un **upload de fichier JSON OAuth** (client_id/client_secret) ou des variables d’environnement sécurisées
> - stockage sécurisé du **refresh token** côté backend (DB), idéalement chiffré

### Objectif (TikTok)
- **Rétablir l’expérience “comme avant”** sur la page TikTok du site :
  - lecteur TikTok
  - liste/carrousel
  - flux visible (fallback officiel quand TikTok bloque l’énumération)
- Source officielle : `https://www.tiktok.com/@anime.moments.officiel`

### Objectif (Hubs 3D — EN COURS)
- Extraire depuis les archives fournies **uniquement** 2 hubs 3D à l’identique visuel :
  - **Hub Ferry**
  - **Hub Train Station**
- Les intégrer **sans adaptation créative** (identique) si techniquement possible.
- Implantations demandées :
  - **Hub Train Station** : page **Shop** (`/shop`) **au-dessus de la bannière**.
  - **Hub Ferry** : page **Univers Lovanet** (route `/decouvrir`) **en dessous** du CTA **« Explorer le catalogue »**.
- **Source de vérité extraction hubs** :
  - archive initiale : `49003I909E0-main.zip`
  - **nouvelle archive prioritaire** si les hubs ne sont pas complets : `0nnnnryg5ew4554876-main` (upload utilisateur)

### Domaines / cibles SEO (confirmé utilisateur)
- Domaine primaire (canonique) : `https://lovanet.fr`
- Domaines secondaires à traiter **PARTOUT** (SEO + JSON‑LD + sitemaps + meta) :
  - `https://animemomentsofficiel.fr`
  - `https://animeofficiel.fr`

### Domaines (OAuth redirect URIs) — confirmé utilisateur
- Callback Preview : `https://actualites-hub.preview.emergentagent.com/api/seo/search-console/oauth/callback`
- Callback Production : `https://animemomentsofficiel.fr/api/seo/search-console/oauth/callback`
- Callbacks additionnels (à autoriser dans Google Cloud) :
  - `https://animeofficiel.fr/api/seo/search-console/oauth/callback`
  - `https://animemomentsanimeofficiel.fr/api/seo/search-console/oauth/callback`

> Note canonique : éviter la duplication en conservant une stratégie de canonique primaire, et utiliser `alternate`/`hreflang`/redirections si nécessaire.

### Statut environnements
- Deux environnements existent : **Preview** (dev) + **Production** (`https://animemomentsofficiel.fr`).
- Priorité utilisateur : **les deux** → implémentation en **Preview**, puis **redeploy** nécessaire pour pousser en production.

### Validation attendue (clarifiée)
- Attendu : **soumission technique** (sitemaps/pages/images/vidéos/news/catalogue) + **vérification des signaux SEO** (meta/JSON‑LD/miniatures/descriptions/routes indexables).
- Non garanti : **indexation finale** (décision/crawl Google).

### Statut actuel (mesuré)
- SEO export (preview) :
  - `catalogCount = 1500`
  - `videos = 1297`
  - `news = 30`
  - `products = 76`
- Search Console (preview, OAuth) :
  - ✅ OAuth connecté
  - ✅ Soumission technique effectuée sur `lovanet.fr`
  - ⚠️ `animemomentsofficiel.fr` : 403 (permissions Google insuffisantes)
  - ⚠️ `animeofficiel.fr` : propriété à ajouter/valider dans Search Console

### Statut actuel (projet)
- ✅ Phase 1 terminée (extraction/inventaire/mirror).
- ✅ Phase 2 terminée (V1 full-stack + tests).
- ✅ Phase 3 terminée (auto-sync externe + UI + tests).
- ✅ Phase 4 terminée (import Lovable/GitHub/ZIP + adaptations).
- ✅ Phase 5 terminée (SEO + Search Console + TikTok + Multi-domain) **en preview**.
- ✅ Phase 6 terminée : OAuth Search Console implémenté + connecté + soumission partielle exécutée (lovanet.fr OK) **en preview**.
- ⏳ Prochaine grande tâche : **Hubs 3D** (extraction ZIP + intégration pages).

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

#### Phase 5.5 — Search Console (service account + OAuth) ✅ DONE (preview)
- Meta vérification en place.
- Endpoints service account : `GET/POST /api/seo/search-console/*`.
- Endpoints OAuth : `GET /api/seo/search-console/oauth/*` + `POST /api/seo/search-console/oauth/submit`.
- Connexion OAuth réalisée (preview) et soumission exécutée :
  - ✅ `lovanet.fr`: sitemaps soumis
  - ⚠️ `animemomentsofficiel.fr`: 403 permissions insuffisantes
  - ⚠️ `animeofficiel.fr`: propriété non accessible tant qu’elle n’est pas validée et partagée

#### Phase 5.6 — Validation sitemaps / RSS / JSON‑LD ✅ DONE
- Sitemaps complets + catalogue chunké, RSS/Atom, JSON‑LD Organization/WebSite/WebPage validés.

#### Phase 5.7 — TikTok UX ✅ DONE
- Player + carrousel (si items disponibles)
- fallback widget officiel TikTok si la sync renvoie 0.

#### Phase 5.8 — Multi-domain SEO « PARTOUT » ✅ DONE
- Ajout `animemomentsofficiel.fr` + `animeofficiel.fr` dans meta/link/JSON‑LD/sitemaps.
- Canonicals/alternates conservent les paramètres profonds : `product`, `video`, `anime`.

---

### Phase 6 — Search Console OAuth (connexion + soumission) ✅ COMPLETED (preview)
- ✅ Client OAuth Web fourni et validé.
- ✅ Flux `/oauth/start` → consentement → `/oauth/callback` fonctionnel.
- ✅ Soumission exécutée (statut `partial` en raison des permissions Search Console).

> Reste à faire côté Google (humain) :
> - ajouter/valider la propriété `animeofficiel.fr` dans Search Console
> - donner au compte OAuth un accès suffisant sur `animemomentsofficiel.fr`

---

### Phase 7 — Hubs 3D (ZIP) ⏳ PLANNED / IN PROGRESS

#### Phase 7.1 — Extraction ciblée (ZIP)
- Télécharger et décompresser :
  - archive #1 : `49003I909E0-main.zip`
  - archive #2 (prioritaire si besoin) : `0nnnnryg5ew4554876-main`
- Localiser et extraire **uniquement** les modules nécessaires aux 2 hubs :
  - `TrainStation` (+ hooks/data utilisés)
  - `FerryBackground` (+ `FerryTrainCityPlaza`, audio, controls)
- Identifier les dépendances manquantes dans le projet actuel :
  - `react-icons` (dépendance non présente actuellement)
  - fichiers `/audio/train-announcements/*.mp3` référencés
  - tout asset additionnel requis
- Décider la stratégie d’intégration "identique" :
  - intégration brute des composants + dépendances
  - encapsulation pour éviter `position:fixed` globale du hub ferry qui écraserait tout le layout

#### Phase 7.2 — Intégration identique (frontend)
- **Shop (`/shop`)** : ajouter **Hub Train Station** au-dessus de la bannière (avant `ShopHeroBanner`).
- **Univers Lovanet (`/decouvrir`)** : ajouter **Hub Ferry** **sous** le CTA **« Explorer le catalogue »**.
- Conserver l’apparence « identique » : shaders/textures/contrôles/caméra/animations.
- Ajouter un lazy-load + fallback de chargement (sans changer le rendu final).

#### Phase 7.3 — Performance & compatibilité (sans changer le visuel)
- Vérifier chargement progressif (lazy-load) et absence de blocage du rendu.
- S’assurer que le hub 3D ne casse pas le mobile (canvas responsive, hauteur contrôlée, fallback si WebGL indisponible).
- Attention particulière :
  - `FerryBackground` utilise un overlay `fixed` + injection DOM (`document.body.appendChild`) : à encapsuler pour ne pas casser le reste du site.

#### Phase 7.4 — Tests & validation
- Build frontend.
- Test navigation : Shop + Univers Lovanet.
- Vérifier que les hubs s’affichent aux positions demandées.
- Appeler **testing_agent** pour valider la régression UI et la présence des hubs.

---

## 3) Next Actions (ordre d’exécution)
1) **Phase 7.1** : analyser `0nnnnryg5ew4554876-main` (prioritaire) + fallback vers `49003I909E0-main.zip` si besoin.
2) Copier/intégrer dans le projet actuel uniquement les composants/hook/data requis + ajouter dépendances npm manquantes (notamment `react-icons`).
3) **Phase 7.2** : intégrer Train Station sur `/shop` au-dessus du hero.
4) **Phase 7.2** : intégrer Ferry sous « Explorer le catalogue » sur `/decouvrir`.
5) **Phase 7.3** : encapsuler Ferry pour éviter les effets globaux (`fixed`/DOM injection) tout en gardant le rendu.
6) **Phase 7.4** : tests + rapport testing_agent.
7) **Production** : redeploy pour pousser les hubs 3D + endpoints OAuth live.

---

## 4) Success Criteria

### Atteints (Phases 1–6)
- Socle complet + import Lovable + auto-sync + pages + tests.
- SEO complet : meta/JSON‑LD/sitemaps/RSS + multi-domain.
- Search Console OAuth : connecté + soumission lancée sur `lovanet.fr`.

### À atteindre (Phase 7)
- Hub 3D **Train Station** visible sur `/shop` au bon emplacement (au-dessus de la bannière).
- Hub 3D **Ferry** visible sur `/decouvrir` sous « Explorer le catalogue ».
- Intégration « identique » au ZIP sans casse responsive.

### Contraintes / transparence
- Modifs en preview → **redeploy** nécessaire pour production.
- Indexation Google : non garantie (on garantit la soumission + présence des signaux).
- Hubs 3D : dépendances WebGL/ThreeJS doivent rester compatibles (fallback si nécessaire).