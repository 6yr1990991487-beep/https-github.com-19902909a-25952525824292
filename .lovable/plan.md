## Constat

Le site `animemomentsofficiel.fr` n'est pas une simple redirection : il sert une **application différente**, dont le code source est déjà présent dans ce dépôt sous `frontend/` (application Create React App, thème sombre néon, pages `Actualites`, `RootLandingPage`, `HubFerryStandalone`, etc.).

L'application actuellement déployée par Lovable est celle de la racine (`src/`, Vite) — design différent (fond clair/coloré, lecteur vidéo plein écran, carrousels d'affiches).

Reproduire l'un « à l'identique » revient donc à choisir laquelle des deux applications devient le site officiel.

## Ce qui est déjà fait ce tour-ci

- **AdSense** : `<meta name="google-adsense-account" content="ca-pub-6025342914124007">` est présent dans `index.html` (donc sur toutes les pages du SPA), et `public/ads.txt` contient bien `google.com, pub-6025342914124007, DIRECT, f08c47fec0942fa0`.
- **Search Console** :
  - Suppression du `sitemap-catalog.xml` (1 500 URL à ancres `#anime-…` que Google fusionne sur `/anime-catalog` → cause principale des 1 070 « Explorée, actuellement non indexée »).
  - `sitemap-index.xml` régénéré (sitemap principal + i18n uniquement).
  - `robots.txt` : blocage des URL d'alias qui ne font que rediriger (`/youtube$`, `/discover$`, `/prime$`, `/boutique$`, `/catalogue$`, …) → cible les 1 532 « Page avec redirection ».
  - Sitemaps resoumis à Search Console, anciens supprimés.

## Étapes proposées pour le clone

1. Choisir la cible :
   - **Option A** — faire du site Lovable une copie visuelle de `animemomentsofficiel.fr` : porter le thème sombre néon, la navigation, la landing (hero « Anime Moments / Univers Lovanet / Actualités ») et les pages de `frontend/src` vers `src/`.
   - **Option B** — garder le design actuel et n'aligner que le contenu (menus, textes, pages manquantes).
2. Porter le design système (`frontend/src/index.css`, tokens Tailwind) vers `src/index.css` + `tailwind.config.ts`.
3. Porter les pages manquantes / différentes une par une, en conservant l'intégration backend actuelle (Lovable Cloud, sync YouTube/TikTok/Prime).
4. Vérification visuelle page par page (captures live vs local).

## Restant côté Search Console

- **Erreur serveur (5xx)** — 8 URL : nécessite la liste exacte via l'inspection d'URL pour identifier la route fautive (probablement une fonction edge ou un fichier absent).
- **Bloquée 4xx** : à identifier de la même manière une fois les sitemaps rescannés.

## Détails techniques

Fichiers modifiés ce tour : `scripts/generate-catalog-seo.ts`, `public/sitemap-index.xml`, `public/robots.txt`, suppression de `public/sitemap-catalog.xml`.
