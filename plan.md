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
- Harmoniser la navigation selon la demande utilisateur (preview + production) :
  - Le texte **« Lovanet »** dans le menu doit adopter le **style des boutons principaux**.
  - Le bouton **« Boutique »** doit devenir une entrée de **sous-menu** (desktop + mobile).
  - Le bouton « Boutique » doit être **RGB + blanc transparent** comme les boutons principaux.
- Identité visuelle du logo :
  - le **logo menu** + **favicon** doivent passer à **une nouvelle couleur**
  - direction « **icône animation 3D** » pour la version du menu (tout en restant performante et lisible)

### Objectif Mentions légales (NOUVEAU)
- Sur la page Mentions légales :
  - retirer les blocs de texte :
    - `Éditeur du site ... utilisez la page contact.`
    - `Hébergement ... leurs plateformes respectives.`

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

### Objectif (Hubs 3D)
- Extraire depuis les archives fournies **uniquement** 2 hubs 3D à l’identique visuel :
  - **Hub Ferry**
  - **Hub Train Station**
- Les intégrer **sans adaptation créative** (identique) si techniquement possible.
- Implantations demandées :
  - **Hub Train Station** : page **Shop** (`/shop`) **au-dessus de la bannière**.
  - **Hub Ferry** : page **Univers Lovanet** (route `/decouvrir`) **en dessous** du CTA **« Explorer le catalogue »**.
- Exigences UX supplémentaires (bug utilisateur, confirmé sur les deux environnements) :
  - supprimer l’erreur runtime `Cannot read properties of undefined (reading 'testid')` (signalée sur **Hub Ferry**)
  - **retirer tout le texte** ajouté autour des hubs (titres/description “Hub 3D importé…”) : les hubs doivent apparaître seuls
  - **désactiver la rotation automatique caméra** et les **changements automatiques de scène** sur **Hub Ferry** + **Hub Train Station**

### Domaines / cibles SEO (confirmé utilisateur)
- Domaine primaire (canonique) : `https://lovanet.fr`
- Domaines secondaires à traiter **PARTOUT** (SEO + JSON‑LD + sitemaps + meta) :
  - `https://animemomentsofficiel.fr`
  - `https://animeofficiel.fr`
  - `https://animemomentsanimeofficiel.fr` (ajouté pour propriétés GSC/OAuth)

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
- ⏳ Phase 7 (Hubs 3D) : intégration réalisée + correctifs UX demandés (sans texte / sans auto-cam) mais nécessite **validation stable + tests**.
- ⏳ Phase 8 (UI/Brand polish) : menu, sous-menu Boutique, logo/favicons nouvelle couleur + mentions légales.

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

### Phase 7 — Hubs 3D (ZIP) ⏳ IN PROGRESS

#### Phase 7.1 — Extraction ciblée (ZIP) ✅ DONE
- Archive utilisable : `49003I909E0-main.zip` (copie des composants requis)
- L’archive `0nnnnryg5ew4554876-main` fournie ensuite est **vide** côté téléchargement (Content-Length 0) → non exploitable.

#### Phase 7.2 — Intégration “identique” (frontend) ✅ DONE (à stabiliser)
- **Shop (`/shop`)** : Hub Train Station ajouté au-dessus de la bannière.
- **Univers Lovanet (`/decouvrir`)** : Hub Ferry ajouté sous le CTA « Explorer le catalogue ».
- Stratégie : hubs rendus via routes internes `/hub/train-station` et `/hub/ferry` + iframe.

#### Phase 7.3 — Stabilisation (BUGFIX/UX) ⏳ TODO (critique)
- Corriger définitivement l’erreur runtime (confirmée user, preview + production) :
  - `Cannot read properties of undefined (reading 'testid')` — sur le **Hub Ferry**
  - neutraliser/retirer les props/attributs incompatibles (ex: `data-testid` sur nodes R3F)
- Retirer la UI texte autour des hubs :
  - sur `/shop` et `/decouvrir` ne laisser que le rendu 3D (iframe)
- Désactiver sur les deux hubs :
  - rotation automatique caméra
  - changements automatiques de scène
  - conserver uniquement les contrôles manuels (si existants)

#### Phase 7.4 — Tests & validation ⏳ TODO
- Build frontend + smoke runtime.
- Vérifier :
  - `/shop` charge sans erreur et le hub Train Station reste visible au bon emplacement.
  - `/decouvrir` charge sans erreur et le hub Ferry reste visible sous « Explorer le catalogue ».
  - plus d’erreur `testid`.
  - plus de rotation/changement auto.
- Appeler **testing_agent** (obligatoire) pour valider le bug et la non-régression.

---

### Phase 8 — UI / Brand polish (menu + logo + mentions légales) ⏳ TODO

#### Phase 8.1 — Menu / boutons (RGB + blanc transparent)
- Mettre le texte **Lovanet** du menu au même niveau de style que les boutons principaux.
- Transformer **Boutique** en entrée de **sous-menu** (desktop + mobile) et appliquer le style RGB + blanc transparent.

#### Phase 8.2 — Logo menu + favicon (nouvelle couleur + direction icône 3D)
- Créer une variante du logo en **nouvelle couleur**.
- Ajouter une version **icône 3D/animée** pour le menu (tout en gardant une alternative statique + performant).
- Mettre à jour favicon/OG/logo SEO si demandé (en conservant la cohérence multi-domaines).

#### Phase 8.3 — Mentions légales
- Retirer les blocs de texte `Éditeur du site` et `Hébergement` mentionnés.
- Vérifier que la page reste conforme et sans contenu résiduel non voulu.

#### Phase 8.4 — Tests UI
- Smoke test navigation desktop + mobile.
- Tester la présence et le placement du sous-menu Boutique.
- Appeler **testing_agent** (obligatoire) pour valider :
  - pas de régression visuelle critique
  - conformité aux demandes UI
  - hubs toujours stables (pas de crash)

---

## 3) Next Actions (ordre d’exécution)
1) **Phase 7.3** : corriger définitivement le crash Ferry (`testid`) + supprimer tout texte autour des hubs + désactiver auto-cam/auto-scènes.
2) **Phase 7.4** : rebuild + smoke (Shop/Discover + routes hub) + logs.
3) **Phase 7.4** : lancer **testing_agent** (obligatoire) pour valider la correction du bug `testid` + exigences UX hubs.
4) **Phase 8.1** : menu — appliquer style boutons au texte Lovanet + passer Boutique en sous-menu (desktop+mobile).
5) **Phase 8.2** : nouvelle couleur logo + favicon + direction icône 3D/animée.
6) **Phase 8.3** : nettoyer Mentions légales (suppression des blocs texte indiqués).
7) **Phase 8.4** : lancer **testing_agent** (obligatoire) pour valider les changements UI + non-régression.
8) **Production** : redeploy pour pousser hubs 3D stabilisés + endpoints OAuth live + polish UI.

---

## 4) Success Criteria

### Atteints (Phases 1–6)
- Socle complet + import Lovable + auto-sync + pages + tests.
- SEO complet : meta/JSON‑LD/sitemaps/RSS + multi-domain.
- Search Console OAuth : connecté + soumission lancée sur `lovanet.fr`.

### À atteindre (Phase 7 — stabilisation hubs)
- Hub 3D **Train Station** visible sur `/shop` au bon emplacement (au-dessus de la bannière), **sans texte**, **sans auto-cam**.
- Hub 3D **Ferry** visible sur `/decouvrir` sous « Explorer le catalogue », **sans texte**, **sans auto-cam**.
- Plus d’erreur runtime : `Cannot read properties of undefined (reading 'testid')`.

### À atteindre (Phase 8 — UI/Brand)
- Texte **Lovanet** dans le menu stylé comme les boutons principaux.
- **Boutique** en sous-menu (desktop + mobile) avec style RGB + blanc transparent.
- Logo menu + favicon : **nouvelle couleur** + direction **icône 3D/animée**.
- Mentions légales : suppression des blocs `Éditeur du site` et `Hébergement` demandés.

### Contraintes / transparence
- Modifs en preview → **redeploy** nécessaire pour production.
- Indexation Google : non garantie (on garantit la soumission + présence des signaux).
- Hubs 3D : dépendances WebGL/ThreeJS doivent rester compatibles (fallback si nécessaire).
