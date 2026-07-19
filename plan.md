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

### Objectif UI / Navigation (NOUVEAU)
- Harmoniser la navigation selon la demande utilisateur (**preview + production**) :
  - Le texte **« Lovanet »** dans le menu doit adopter le **style des boutons principaux**.
  - Le bouton **« Boutique »** doit devenir une entrée de **sous-menu** (**desktop + mobile**).
  - Le style demandé : **RGB + blanc transparent** comme les boutons principaux.

### Objectif Identité visuelle (logo/favicons)
- Le **logo menu** + **favicon** doivent passer à :
  - une **nouvelle couleur**
  - direction « **icône animation 3D** » (tout en restant performante)

### Objectif Mentions légales (NOUVEAU)
- Sur la page Mentions légales :
  - retirer les blocs de texte :
    - `Éditeur du site ... utilisez la page contact.`
    - `Hébergement ... leurs plateformes respectives.`

### Objectif Nouvelle Page d’arrivée (NOUVEAU — confirmé utilisateur)
- Créer une **nouvelle page d’arrivée premium** sur `/` :
  - **ne pas utiliser** le terme « Accueil »
  - style **moderne / manga / futuriste**, long format, riche en sections
  - dans l’esprit et l’originalité de la home actuelle, mais **plus “landing page”**
- Déplacer l’actuelle page d’accueil vers :
  - `/anime-moments`

### Objectif SEO / Référencement
- Paramétrer le SEO : meta tags, OpenGraph/Twitter, canonical/hreflang/alternate.
- Générer et maintenir les fichiers d’indexation :
  - `robots.txt`
  - `sitemap.xml` + sitemaps spécialisés **Pages / Images / Vidéos / Produits / News / Books / Catalogue** (catalogue chunké)
  - flux **RSS/Atom** (Actualités)
  - données structurées **JSON‑LD schema.org** (Organization, WebSite, WebPage, Product, VideoObject, BreadcrumbList, Article/NewsArticle)
  - inclure les champs demandés : **`aggregateRating`** et **`review`** (là où applicable)

### Objectif (Search Console)
- Ajouter la balise de vérification Google :
  - `<meta name="google-site-verification" content="eDW28NAvAT9tr_dkYRKphCLRed_tlkJefXfYLvPbqd0" />`
- Finaliser l’automatisation Search Console :
  - soumission/validation des sitemaps via **Google Search Console API**
  - **2 modes d’authentification** :
    - **service account JSON** — utile si la propriété est partagée avec le compte de service + API activée
    - **OAuth Web client** — permet d’utiliser le compte Google utilisateur pour soumettre les sitemaps

> ⚠️ Sécurité
> - ne jamais exposer le *client secret* OAuth
> - stockage du **refresh token** côté backend (DB)

### Objectif (TikTok)
- **Rétablir l’expérience “comme avant”** sur la page TikTok du site :
  - lecteur TikTok
  - liste/carrousel
  - flux visible (fallback officiel quand TikTok bloque l’énumération)
- Source officielle : `https://www.tiktok.com/@anime.moments.officiel`

### Objectif (Hubs 3D)
- Extraire depuis les archives fournies **uniquement** 2 hubs 3D à l’identique visuel :
  - **Hub Ferry**
  - **Hub Train Station**
- Implantations demandées :
  - **Hub Train Station** : page **Shop** (`/shop`) **au-dessus de la bannière**.
  - **Hub Ferry** : page **Univers Lovanet** (`/decouvrir`) **en dessous** du CTA **« Explorer le catalogue »**.
- Exigences UX supplémentaires (bug utilisateur, confirmé sur preview + production) :
  - corriger l’erreur runtime `Cannot read properties of undefined (reading 'testid')` (Hub Ferry)
  - **retirer tout le texte** ajouté autour des hubs
  - **désactiver la rotation automatique caméra** et les **changements automatiques de scène** sur les 2 hubs

### Domaines / cibles SEO (confirmé utilisateur)
- Domaine primaire (canonique) : `https://lovanet.fr`
- Domaines secondaires à traiter **PARTOUT** :
  - `https://animemomentsofficiel.fr`
  - `https://animeofficiel.fr`
  - `https://animemomentsanimeofficiel.fr` (ajouté pour propriétés GSC/OAuth)

### Domaines (OAuth redirect URIs) — confirmé utilisateur
- Callback Preview : `https://actualites-hub.preview.emergentagent.com/api/seo/search-console/oauth/callback`
- Callback Production : `https://animemomentsofficiel.fr/api/seo/search-console/oauth/callback`
- Callbacks additionnels :
  - `https://animeofficiel.fr/api/seo/search-console/oauth/callback`
  - `https://animemomentsanimeofficiel.fr/api/seo/search-console/oauth/callback`

### Statut environnements
- Deux environnements existent : **Preview** (dev) + **Production** (`https://animemomentsofficiel.fr`).
- Priorité utilisateur : **les deux** → implémentation en **Preview**, puis **redeploy** nécessaire pour pousser en production.

### Validation attendue (clarifiée)
- Attendu : **soumission technique** (sitemaps/pages/images/vidéos/news/catalogue) + **vérification des signaux SEO**.
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
- ✅ Phase 6 terminée : OAuth Search Console implémenté + connecté + soumission partielle exécutée **en preview**.
- ⏳ Phase 7 (Hubs 3D) : intégration faite mais **bug runtime + UX** à valider (testing agent requis).
- ⏳ Phase 8 (UI/Brand polish) : menu + sous-menu Boutique + logo/favicons + mentions légales (en cours).
- ⏳ Phase 9 (Nouvelle page d’arrivée) : à implémenter (`/` landing, home → `/anime-moments`).

---

## 2) Implementation Steps

### Phase 1 — POC Core (Isolation): extraction + inventaire + rendu minimal ✅ COMPLETED

### Phase 2 — V1 App Development (MVP): pages + dynamiques internes ✅ COMPLETED

### Phase 3 — External Auto-Sync Parity + Fidelity UI ✅ COMPLETED

### Phase 4 — Import du projet source Lovable/GitHub/ZIP ✅ COMPLETED

### Phase 5 — SEO + Search Console + TikTok + Multi-domain ✅ COMPLETED (preview)

### Phase 6 — Search Console OAuth (connexion + soumission) ✅ COMPLETED (preview)

---

### Phase 7 — Hubs 3D (ZIP) ⏳ IN PROGRESS

#### Phase 7.1 — Extraction ciblée (ZIP) ✅ DONE
- Archive utilisable : `49003I909E0-main.zip` (composants hubs copiés dans le projet).
- Archive `0nnnnryg5ew4554876-main` : téléchargement **vide** (`Content-Length 0`) → non exploitable.

#### Phase 7.2 — Intégration “identique” (frontend) ✅ DONE
- `/shop` : hub Train Station au-dessus de la bannière.
- `/decouvrir` : hub Ferry sous « Explorer le catalogue ».
- Stratégie : routes internes `/hub/train-station` + `/hub/ferry` + intégration iframe.

#### Phase 7.3 — Stabilisation (BUGFIX/UX) ⏳ TODO (critique)
- Corriger définitivement le crash Ferry : `Cannot read properties of undefined (reading 'testid')`.
- Retirer les titres/texte autour des hubs.
- Désactiver auto rotation caméra / auto changements de scène (Ferry + Train Station).

#### Phase 7.4 — Tests & validation ⏳ TODO
- Smoke test : `/shop`, `/decouvrir`, `/hub/ferry`, `/hub/train-station`.
- Appeler **testing_agent** (obligatoire).

---

### Phase 8 — UI / Brand polish (menu + logo + mentions légales) ⏳ IN PROGRESS

#### Phase 8.1 — Menu / boutons (RGB + blanc transparent)
- Texte **Lovanet** : style boutons principaux.
- **Boutique** : sous-menu desktop + mobile, style RGB + blanc transparent.

#### Phase 8.2 — Logo menu + favicon (nouvelle couleur + icône 3D)
- Variante logo “3D” (menu + favicon) + cohérence SEO.

#### Phase 8.3 — Mentions légales
- Retirer les blocs `Éditeur du site` et `Hébergement` demandés.

#### Phase 8.4 — Tests UI
- Smoke test navigation desktop + mobile.
- Appeler **testing_agent** (obligatoire).

---

### Phase 9 — Nouvelle page d’arrivée + Home en sous-page ⏳ IN PROGRESS

#### Phase 9.1 — Routing ✅ DONE
- `/` devient la **nouvelle landing page** (pas “Accueil”).
- L’actuelle home est déplacée vers `/anime-moments`.
- Navbar, footer et liens internes principaux mis à jour pour la nouvelle structure.

#### Phase 9.2 — Nouvelle landing (long format) ⏳ DONE
- Nouvelle page racine créée avec hero, portails, storyline, passerelles plateformes, vidéos, teaser hubs 3D, preuves, FAQ, CTA final.
- Style aligné sur les tokens néon/verre existants et cohérent avec l’identité visuelle importée.
- `data-testid` ajoutés sur les CTA et sections critiques de la landing.

#### Phase 9.3 — SEO de la landing et de `/anime-moments` ⏳ DONE
- `seoI18n` et `LocalizedHead` mis à jour pour la route `/anime-moments`.
- Breadcrumbs / labels SEO adaptés à la nouvelle landing `/`.
- Build frontend validé ; reste le passage de testing agent pour la non-régression complète.

#### Phase 9.4 — Tests
- Appeler **testing_agent** (obligatoire) pour non-régression.

---

## 3) Next Actions (ordre d’exécution)
1) **Phase 7.3** : corriger crash Ferry (`testid`) + supprimer texte hubs + désactiver auto-cam/auto-scènes.
2) **Phase 7.4** : rebuild + smoke + **testing_agent** (obligatoire).
3) **Phase 8** : menu (Boutique sous-menu + style), logo/favicons, Mentions légales.
4) **Phase 8.4** : **testing_agent** (obligatoire) UI + hubs.
5) **Phase 9** : nouvelle landing `/` + déplacer home en `/anime-moments` + SEO/sitemaps.
6) **Phase 9.4** : **testing_agent** (obligatoire) landing + routing.
7) **Production** : redeploy final pour pousser en production.

---

## 4) Success Criteria

### Atteints (Phases 1–6)
- Socle complet + import Lovable + auto-sync + pages + tests.
- SEO complet : meta/JSON‑LD/sitemaps/RSS + multi-domain.
- Search Console OAuth : connecté + soumission lancée sur `lovanet.fr`.

### À atteindre (Phase 7)
- `/shop` : hub Train Station visible, **sans texte**, **sans auto-cam**.
- `/decouvrir` : hub Ferry visible, **sans texte**, **sans auto-cam**.
- Plus d’erreur runtime `testid`.

### À atteindre (Phase 8)
- Texte **Lovanet** dans le menu stylé comme les boutons principaux.
- **Boutique** en sous-menu (desktop + mobile) + style RGB + blanc transparent.
- Logo menu + favicon : nouvelle couleur + look “icône 3D”.
- Mentions légales : suppression des blocs demandés.

### À atteindre (Phase 9)
- Nouvelle page d’arrivée premium sur `/` (pas “Accueil”).
- Home déplacée vers `/anime-moments` et accessible.
- SEO/sitemaps/canonicals mis à jour.

### Contraintes / transparence
- Modifs en preview → **redeploy** nécessaire pour production.
- Indexation Google : non garantie.
- Hubs 3D : dépendances WebGL/ThreeJS doivent rester compatibles (fallback si nécessaire).
