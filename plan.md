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
- ⚠️ Blocage externe service account : la soumission réelle Search Console reste en état `api_access_not_configured` tant que l’API Search Console n’est pas activée sur le projet `dynamic-cove-502914-u0`.
- ✅ **NOUVEAU : Phase 6 (OAuth Search Console) implémentée et testée** (testing_agent iteration_7).
  - État actuel attendu : `not_connected` tant que le consentement Google n’a pas été effectué via `/oauth/start`.

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

#### Phase 5.5 — Search Console (mode Service Account) ✅ DONE (avec dépendance externe)
1) ✅ Balise meta vérification (1 seule occurrence globale).
2) ✅ Endpoints backend :
   - `GET /api/seo/search-console/status`
   - `POST /api/seo/search-console/submit`
3) ✅ Gestion d’état : retourne `api_access_not_configured` + URL d’activation quand l’API Google Search Console est désactivée.
4) ✅ Support multi-propriétés + sitemaps multi-domaines.
5) ⚠️ Dépendance externe : activer l’API Search Console + partager les propriétés au service account.

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
  - sitemaps multi-domaines (`sitemap-animemomentsofficiel-fr.xml`, `sitemap-animeofficiel-fr.xml` + déclinaisons)
  - `rss.xml`, `atom.xml`
  - `structured-data.json`

#### Phase 5.7 — TikTok : expérience complète restaurée ✅ DONE (validée)
- UI riche (player + carrousel) si vidéos disponibles.
- Fallback officiel : widget profil TikTok via oEmbed quand la sync renvoie 0 vidéo.

#### Phase 5.8 — Multi-domain SEO “PARTOUT” ✅ DONE (validée)
- Ajout des domaines secondaires dans : meta/link `alternate`, JSON‑LD `Organization.sameAs`, backend export SEO.
- Canonicals/alternates conservent les paramètres profonds (indexables) :
  - `/shop?product=...`
  - `/lecteurs-video?video=...`
  - `/anime-catalog?anime=...` (title/description/canonical/JSON‑LD dédiés)
- Catalogue : sitemap dédié chunké via `sitemap-catalog.xml`.

---

### Phase 6 — Search Console OAuth (NOUVEAU) ✅ IMPLEMENTED (preview) — ⏳ à connecter
Objectif : permettre une **soumission réelle** des sitemaps en utilisant le compte Google utilisateur.

#### Phase 6.0 — Sécurisation des credentials OAuth ✅ DONE (preview-only)
- ✅ JSON OAuth Google **Web application** uploadé par l’utilisateur.
- ✅ Choix utilisateur : usage en preview pour l’instant.
- ⚠️ À préparer ensuite : migration des credentials OAuth vers variables/secret manager en production.

#### Phase 6.1 — Backend OAuth endpoints ✅ DONE (validated by testing_agent iteration_7)
- ✅ Endpoints disponibles :
  - `GET /api/seo/search-console/oauth/start`
  - `GET /api/seo/search-console/oauth/callback`
  - `GET /api/seo/search-console/oauth/status`
  - `POST /api/seo/search-console/oauth/submit`
- ✅ Stockage DB :
  - `oauth_state` (state + redirect_after + redirect_uri)
  - `oauth_credentials` (access_token + refresh_token + expires_at)
- ✅ Refresh token: auto-refresh via `GoogleAuthRequest()` et mise à jour DB.

#### Phase 6.2 — Status unifié ✅ DONE
- `GET /api/seo/search-console/status` inclut maintenant :
  - statut service account
  - statut OAuth imbriqué (`oauth: {...}`)

#### Phase 6.3 — Connexion OAuth (action utilisateur) ⏳ PENDING
- Étape manquante : réaliser le consentement Google
  - Ouvrir : `GET /api/seo/search-console/oauth/start`
  - Autoriser l’accès Search Console
  - Retour automatique via `/oauth/callback`
  - Vérifier ensuite : `/api/seo/search-console/oauth/status` doit passer à `ok`

#### Phase 6.4 — Soumission sitemaps via OAuth ⏳ PENDING (après connexion)
- Appeler : `POST /api/seo/search-console/oauth/submit`
- Attendu : soumission technique de **tous les sitemaps** (pages/images/vidéos/produits/news/books/catalogue + multi-domain)

#### Phase 6.5 — Déploiement production ⏳ PENDING
- Une fois validé en preview, **redeploy** requis pour pousser en production.

---

## 3) Next Actions (ordre d’exécution)
1) **Connecter OAuth en preview** : aller sur `/api/seo/search-console/oauth/start` et valider le consentement Google.
2) Vérifier `/api/seo/search-console/oauth/status` → doit être `ok` + permissions sur les propriétés.
3) Lancer `POST /api/seo/search-console/oauth/submit` et vérifier :
   - sitemaps “submitted/partial/skipped”
   - messages d’erreur éventuels (propriété non accessible, etc.)
4) Si permissions manquantes : ajouter le compte Google OAuth (celui utilisé au consentement) comme propriétaire/gestionnaire des propriétés.
5) **Production** : redeploy pour appliquer les changements (SEO + OAuth + endpoints) sur `https://animemomentsofficiel.fr`.
6) **Suivi Search Console (UI)** : sitemaps listés, erreurs d’exploration, couverture, indexing video/image/news.

---

## 4) Success Criteria
### Atteints (Phases 1–4)
- Socle complet + import Lovable + auto-sync + pages + tests.

### Atteints (Phase 5 — en preview)
- Logo navbar intégré.
- Favicon/touch icons générés.
- `/shop` JSON‑LD enrichi (`aggregateRating` + `review`).
- `/actualites` meta description non dupliquée.
- Search Console meta + endpoints backend (service account) + message d’activation API.
- Sitemaps/RSS/JSON‑LD validés, catalogue chunké + multi-domain.
- TikTok : page `/tiktok` non vide + expérience visible restaurée (fallback widget officiel).
- Multi-domain SEO : `animemomentsofficiel.fr` + `animeofficiel.fr` présents **PARTOUT**.

### Atteints (Phase 6 — OAuth)
- ✅ Endpoints OAuth implémentés.
- ✅ Client OAuth Web reconnu (callbacks preview + domaines prod).
- ✅ Tests backend + sanity frontend validés (testing_agent iteration_7).

### À atteindre (restant — connexion OAuth + soumission + déploiement)
- ⏳ Réaliser le consentement OAuth (passer `not_connected` → `ok`).
- ⏳ Soumission réelle des sitemaps via OAuth (si propriétés accessibles).
- ⏳ Redeploy en production.
- 📈 Après déploiement : vérifier l’état d’exploration et les rapports (sans promesse d’indexation finale).

### Contraintes / transparence
- Corrections en preview → **redeploy** nécessaire pour production.
- Search Console service account : dépend de l’activation API + permissions sur les propriétés.
- Search Console OAuth : dépend du consentement utilisateur + permissions sur les propriétés + stockage sécurisé des tokens.
- Indexation Google : non garantie (on garantit la soumission + présence des signaux).