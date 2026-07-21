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
1) Revenir aux phases 7/8 restantes : polish menu/logo/favicons/sous-menu Boutique si encore à finaliser.
2) Étendre le contrôle visuel des thèmes sur les pages longues (catalogue, TikTok, countdown, actualités).
3) Prévoir des raccourcis d’accès à la personnalisation pour les zones éloignées de la bulle si demandé.
4) Préparer la prochaine itération de validation production après redéploiement utilisateur.

---

## 4) Success Criteria
- ThemeBubble affiche et gère **500+ thèmes** générés dynamiquement.
- Aucun état visible « OFF ».
- Le thème s’applique globalement (navbar, footer, fonds, overlays, bordures, glow).
- Le texte reste lisible automatiquement sur tous les thèmes.
- La landing `/` n’affiche plus la vidéo du bas.
- Le frontend compile et passe les vérifications visuelles + testing agent.
- Les régressions sur l’esthétique transparente RGB néon restent nulles ou minimales.
