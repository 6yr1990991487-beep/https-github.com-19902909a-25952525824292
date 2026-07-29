# Boutique AnimemomentsAnimeofficiel — refonte pro type AliExpress

Objectif : transformer `/shop` (et la vitrine d'accueil) en boutique moderne et dynamique, avec des produits **uniques** (plus de doublons), une **bannière hero image + vidéo + carrousel auto-défilant**, un catalogue calibré, des fiches produit riches, et un référencement optimisé (Google Images / Vidéos / Livres / Actualités).

## 1. Produits uniques et catalogue calibré

Fichier `src/data/generatedProducts.ts` (regénération complète) + nouveau `src/data/catalog.ts` :

- Passer de 5000 générés à **1500 produits uniques**, chacun avec :
  - `id` unique, `slug` SEO (kebab-case), `name` unique (aucune collision),
  - `category` + `subcategory`, `tags[]`, `brand`, `sku`,
  - `price`, `compareAt` (prix barré), `currency: "EUR"`,
  - `rating` (4.2–5.0), `reviewsCount`, `sold`, `stock`,
  - `type: "physical" | "digital"` (produits numériques ET réels),
  - `shipping: { from, days, freeOver }`,
  - `images[]` (4–6 vues via `ProductArtwork` seedé unique par index),
  - `video?` (URL YouTube/TikTok pour ~30 % des fiches, réutilise les IDs présents),
  - `description` longue + `bullets[]` + `specs{}`,
  - `affiliateUrl?` / `sourceApiId?` (placeholders prêts pour clés API/affiliation à venir).
- Un `Set` de signatures (`name|category|theme|style`) garantit l'unicité à la génération.
- Persistance des ajouts/retraits admin dans `localStorage` (déjà en place, on garde `manual` + `hidden ids`).

## 2. Bannière hero shop dynamique

Nouveau `src/components/ShopHeroBanner.tsx` :

- Slides auto-défilants (Embla, autoplay 4 s, pause on hover) mixant :
  - **image full-bleed** (ProductArtwork XL) avec parallax léger,
  - **vidéo** en background (`<video muted loop playsInline>` avec poster) pour 2 slides,
  - CTA "Voir le produit" → ouvre la fiche.
- Ticker néon dessous (livraison, retours, note 4.8/5, nouveautés).
- Remplace le hero statique actuel de `src/pages/Shop.tsx`.

## 3. Carrousels auto-défilants

- `Flash Deals` et `Meilleures ventes` : passage en **marquee infini** (CSS keyframes + duplication de la liste), pause au survol, bord dégradé (mask).
- Nouveau rail **"Nouveautés"** + rail **"Produits numériques"** (ebooks, wallpapers 4K, packs sons).
- Chaque carte carrousel = fiche unique (jamais deux fois le même id sur la page).

## 4. Fiches produit enrichies (`ProductDetailDialog`)

Refactor du `Dialog` actuel :

- Galerie image + vidéo (thumbs verticales, viewer 360° conservé),
- Bloc prix : prix barré + prix actuel + % remise + stock + vendus,
- Onglets : Description / Caractéristiques / Livraison / Avis (mock déterministe),
- Sélecteur variantes (taille/coloris) quand applicable,
- Bouton **Ajouter** / **Acheter maintenant** (checkout express),
- Lien affiliation externe si `affiliateUrl` présent,
- Bouton admin **Retirer** (masque l'id dans `localStorage`).

## 5. Admin publication (manuel + auto)

`DropshipAdminPanel` étendu :

- Formulaire complet (nom, prix, images multi, vidéo URL, description, specs, catégorie, type),
- Import CSV / JSON,
- Zone "Sources dropshipping" : champs API key + endpoint (Zendrop / Spocket / AliExpress DS / CJ) — stockage côté client pour l'instant, prêt à basculer vers edge function quand les clés seront fournies,
- Bouton **Sync auto** (mock actuellement, hook prêt).

## 6. Catalogue orbital réduit

`src/components/MiniCatalogOrb.tsx` :

- Réduire le rayon (`size * 0.48` au lieu de `0.58`) et le container (`clamp` en `min(72vw, 520px)`),
- Diminuer le nombre de cartes visibles à 12 pour aérer,
- Ajuster le halo/anneaux pour rester proportionnels.

## 7. SEO — Google Images / Vidéos / Livres / News

- JSON-LD `Product` (déjà présent) enrichi : `aggregateRating`, `review`, `brand`, `image[]` (toutes les vues), `video` (VideoObject) quand disponible.
- JSON-LD `ItemList` étendu à 200 items les mieux notés.
- Nouveau **sitemap dédié** `public/sitemap-shop.xml` généré par `scripts/vite-plugin-shop-seo.ts` (existant) : une entrée par produit (`/shop/p/{slug}`) avec `image:image` et `video:video` (Google Image/Video sitemap namespaces).
- Sitemap **manga/livres** `sitemap-books.xml` avec JSON-LD `Book` pour la catégorie manga.
- Ajout `robots.txt` : lignes `Sitemap:` pour chaque sitemap.
- Route publique `/shop/p/:slug` (SPA) + `<Helmet>` par produit (title, description, canonical, og:image, og:video, JSON-LD).
- `og:type=product` sur les fiches, `og:type=video.other` quand la fiche a une vidéo.

## 8. Design moderne et jeune

- `src/index.css` : ajout de tokens `--gradient-hero`, `--shadow-card-lift`, animation `marquee` et `float-y`.
- Cartes produit : coins 2xl, dégradé subtil, badge remise, micro-interactions (tilt léger via `lib/tilt3d`), skeleton shimmer pendant scroll.
- Typo display renforcée sur titres shop, chips catégories avec icônes lucide dédiées.

## 9. Technique / dépendances

- Aucune nouvelle dépendance nécessaire (Embla, Helmet déjà présents ; sinon `react-helmet-async` — à confirmer).
- Aucune modification backend requise pour cette étape (les clés API / liens d'affiliation seront branchés plus tard via `add_secret` + edge function).

## Fichiers touchés (résumé)

```text
src/data/generatedProducts.ts       (réécrit, unicité, 1500 items)
src/data/shopProducts.ts            (schéma étendu)
src/components/ShopHeroBanner.tsx   (nouveau)
src/components/ProductDetailDialog.tsx (nouveau, extrait de Shop.tsx)
src/components/ProductCard.tsx      (nouveau)
src/components/MarqueeRow.tsx       (nouveau)
src/components/DropshipAdminPanel.tsx (étendu)
src/components/MiniCatalogOrb.tsx   (rayon réduit)
src/pages/Shop.tsx                  (assemblage)
src/pages/ProductPage.tsx           (nouveau, /shop/p/:slug)
src/App.tsx                         (route produit)
scripts/vite-plugin-shop-seo.ts     (sitemaps image/video/book)
public/robots.txt                   (Sitemap: entries)
src/index.css                       (animations, tokens)
```

## Questions avant de lancer

1. On garde **1500 produits** (bon équilibre perf/SEO) ou tu préfères conserver 5000 ?
2. Les vidéos de fiches : je réutilise les IDs YouTube déjà présents dans `src/data/videos.ts` (pas de nouvelles clés à fournir tout de suite) — OK ?
3. Confirmer que les **clés API dropshipping/affiliation** seront fournies plus tard (je prépare les emplacements sans les demander maintenant).
