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

### Objectif Personnalisation extrême (NOUVEAU — confirmé utilisateur)
- Refaire totalement la **ThemeBubble** pour supporter **500+ thèmes générés dynamiquement**.
- Appliquer le thème **globalement** (menus, footer, fonds, overlays, bordures, glow, surfaces glass, textes) **sans casser** l’esthétique RGB néon transparente existante.
- Implémenter une **logique de contraste automatique** pour empêcher tout texte illisible.
- Rendre la bulle **très lumineuse / brillante** et supprimer complètement l’état visible **OFF**.
- Retirer la **vidéo du bas** sur la Root Landing Page (`/`).

### Statut actuel (projet)
- ✅ Phase 1 terminée (extraction/inventaire/mirror).
- ✅ Phase 2 terminée (V1 full-stack + tests).
- ✅ Phase 3 terminée (auto-sync externe + UI + tests).
- ✅ Phase 4 terminée (import Lovable/GitHub/ZIP + adaptations).
- ✅ Phase 5 terminée (SEO + Search Console + TikTok + Multi-domain) en preview.
- ✅ Phase 6 terminée : OAuth Search Console implémenté + connecté + soumission partielle exécutée en preview.
- ⏳ Phase 7 (Hubs 3D) : intégration faite mais bug runtime + UX à valider.
- ⏳ Phase 8 (UI/Brand polish) : menu + sous-menu Boutique + logo/favicons + mentions légales.
- ✅ Phase 9 (Nouvelle page d’arrivée) terminée.
- ✅ Phase 10 (ThemeBubble 500+ + contraste global + retrait vidéo basse) : TERMINÉE.
- ✅ Phase 11 (Remplacement ciblé des zones par vidéos utilisateur) : TERMINÉE.
- ⏳ Phase 12 (Refonte Actualités premium + backend auto vraies sources) : EN COURS.

---

## 2) Implementation Steps

### Phase 1 — POC Core (Isolation): extraction + inventaire + rendu minimal ✅ COMPLETED
### Phase 2 — V1 App Development (MVP): pages + dynamiques internes ✅ COMPLETED
### Phase 3 — External Auto-Sync Parity + Fidelity UI ✅ COMPLETED
### Phase 4 — Import du projet source Lovable/GitHub/ZIP ✅ COMPLETED
### Phase 5 — SEO + Search Console + TikTok + Multi-domain ✅ COMPLETED (preview)
### Phase 6 — Search Console OAuth (connexion + soumission) ✅ COMPLETED (preview)
### Phase 7 — Hubs 3D ⏳ IN PROGRESS
### Phase 8 — UI / Brand polish ⏳ IN PROGRESS
### Phase 9 — Nouvelle page d’arrivée + Home en sous-page ✅ COMPLETED

### Phase 10 — ThemeBubble 500+ + contraste global + landing cleanup ✅ COMPLETED
### Phase 11 — Remplacement ciblé des zones par vidéos utilisateur ✅ COMPLETED
### Phase 12 — Refonte Actualités premium + backend auto vraies sources ⏳ IN PROGRESS

#### Phase 12.1 — Architecture éditoriale + sources ⏳ TODO
- Remplacer le contenu statique/générique de `/actualites` par une architecture alimentée par de vraies sources.
- Prioriser APIs publiques + RSS + sites éditoriaux disposant de flux publics.
- Cœur éditorial: anime/manga + streaming + jeux + culture pop japonaise.

#### Phase 12.2 — Backend d’agrégation automatique ⏳ TODO
- Ajouter des collections Mongo dédiées aux news agrégées, sources, refresh status et déduplication.
- Implémenter ingestion RSS/API publique (ANN, Crunchyroll, MAL, Gematsu, Siliconera, IGN, AniList enrichissement, autres flux publics sûrs).
- Normaliser, catégoriser, dédupliquer, scorer les tendances et rafraîchir automatiquement via scheduler.
- Exposer des endpoints premium pour listing, hero, tendances, widgets, sources, détail article.

#### Phase 12.3 — Refonte premium `/actualites` ⏳ TODO
- Hero éditorial premium avec top story + stories secondaires.
- Ticker live, bento grid, carrousels thématiques, widgets sticky, bannières animées, cartes sophistiquées.
- Conserver et dépasser l’esthétique de `/decouvrir` avec lisibilité forte et crédibilité des sources.

#### Phase 12.4 — Détail article premium ⏳ TODO
- Refaire `/actualites/:slug` avec lecture premium, source, date, tags, contenus liés et CTA vers source originale.

#### Phase 12.5 — Validation complète ⏳ TODO
- Vérifier SEO/meta non cassés.
- Tester backend + frontend + rendu visuel + absence de contenu inventé.

#### Phase 11.1 — Intégration vidéo zone capture gauche ⏳ TODO
- Injecter la vidéo utilisateur 1 dans la zone visuelle de capture sur `/`.
- Garder les boutons en overlay au-dessus comme les itérations précédentes.
- Ajuster le cadrage pour épouser parfaitement le découpage demandé.

#### Phase 11.2 — Intégration vidéo zone LOVANET ⏳ TODO
- Injecter la vidéo utilisateur 2 dans la zone de gauche du footer / bloc LOVANET.
- Préserver le texte et le bouton au-dessus de la vidéo.
- Appliquer la même logique de découpe et de transparence premium.

#### Phase 11.3 — Validation visuelle ⏳ TODO
- Contrôle capture sur `/`.
- Vérifier que les vidéos restent sous les boutons et ne cassent pas la lisibilité.

#### Phase 10.1 — Architecture de thème globale ✅ COMPLETED
- Ajouter des tokens sémantiques globaux pilotés par ThemeBubble.
- Conserver la signature visuelle RGB néon transparente déjà en place.
- Prévoir `fg-on-bg`, `fg-on-card`, `fg-on-overlay` calculés automatiquement.

#### Phase 10.2 — ThemeBubble 500+ ✅ COMPLETED
- Générer dynamiquement un catalogue de 500+ thèmes à partir de familles, nuances et effets.
- Ajouter recherche, onglets (tous / favoris / récents), random, reset.
- Supprimer l’état OFF visible.
- Rendre la bulle plus brillante et premium.

#### Phase 10.3 — Application globale + contraste ✅ COMPLETED
- Appliquer les thèmes sur navbar, footer, fonds, bordures, glow, overlays et surfaces.
- Garantir la lisibilité automatique avec logique de contraste WCAG.
- Préserver les animations RGB existantes, avec fallback reduced-motion.

#### Phase 10.4 — Root landing cleanup ✅ COMPLETED
- Retirer la section vidéo du bas de `/`.
- Conserver uniquement la vidéo hero utile à l’expérience.

#### Phase 10.5 — Validation frontend ✅ COMPLETED
- Build frontend.
- Contrôle visuel par capture.
- Testing agent frontend obligatoire après implémentation.

---

## 3) Next Actions (ordre d’exécution)
1) Implémenter le backend d’agrégation news à partir de vraies sources publiques (RSS + APIs).
2) Exposer les endpoints dédiés à la nouvelle page Actualités premium.
3) Refaire complètement `/actualites` et `/actualites/:slug` en expérience magazine premium.
4) Tester puis préparer validation preview avant redéploiement production par l’utilisateur.

---

## 4) Success Criteria
- ThemeBubble affiche et gère **500+ thèmes** générés dynamiquement.
- Aucun état visible « OFF ».
- Le thème s’applique globalement (navbar, footer, fonds, overlays, bordures, glow).
- Le texte reste lisible automatiquement sur tous les thèmes.
- La landing `/` n’affiche plus la vidéo du bas.
- Le frontend compile et passe les vérifications visuelles + testing agent.
- Les régressions sur l’esthétique transparente RGB néon restent nulles ou minimales.


### Phase 13 — Responsive mobile/tablette + ThemeBubble navigation + variations captures + nettoyage éditorial + reliquats SEO ⏳ IN PROGRESS

#### Phase 13.1 — Responsive mobile/tablette global ⏳ TODO
- Revoir Navbar, RootLandingPage et Actualites pour mobile/tablette.
- Garantir touch targets 44px+, meilleure respiration, hauteurs médias maîtrisées et navigation plus fluide.
- Préserver l’esthétique RGB néon transparente existante.

#### Phase 13.2 — ThemeBubble + thème du menu de navigation ⏳ TODO
- Décaler la bulle flottante hors du bord gauche selon la guideline (left-4 / sm:left-6, bottom-4).
- Ajouter une section dédiée pour appliquer un thème dérivé à la navigation rapide et au menu.
- Définir/consommer les variables CSS `--nav-theme-*` et previews associées.

#### Phase 13.3 — Variations automatiques des zones de capture ⏳ TODO
- Ajouter des variations automatiques douces sur RootLandingPage (accent RGB, overlays, ordre mini-cards).
- Respecter `prefers-reduced-motion` et éviter tout jank.

#### Phase 13.4 — Nettoyage éditorial Actualités ⏳ TODO
- Supprimer les mentions marketing/dummy text (ex: « Magazine premium », « Vraies sources… », etc.).
- Remplacer par une micro-copie éditoriale plus courte et plus crédible.

#### Phase 13.5 — Correctifs SEO frontend finaux ⏳ TODO
- Corriger définitivement le JSON-LD `/shop` avec `aggregateRating` et `review` lisibles par Google.
- Supprimer le doublon de `meta description` sur `/actualites` / `LocalizedHead`.

#### Phase 13.6 — Validation frontend complète ⏳ TODO
- Lint frontend.
- Vérifications visuelles desktop/mobile.
- Testing agent frontend obligatoire puis correction de tous les retours avant clôture.

---

## 5) Current Execution Order (validé utilisateur)
1) Mobile/tablette sur tout le site
2) ThemeBubble + thème du menu de navigation
3) Variations automatiques des zones de capture
4) Nettoyage des mentions inutiles sur `/actualites`
5) Correctifs SEO frontend restants
6) Lint + tests + corrections
