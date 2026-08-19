# 33 — Guidelines

## Components

The design system exports these components — import them from `@ws-sy5kzr35jy4czgsth0ok/32caf520-24c5-48d7-b1dd-2f29c09b7ada` and compose them before building anything from scratch:

`AnimeMomentsOrb`, `GoogleTranslate`, `MiniCatalogOrb`, `QuickNavCarousel`, `TabletTrailerPlayer`, `TopVideoBanner`, `YouTubeEmbed`, `YoutubeBrandCover`, `YoutubeBrandSettings`

Per-component details (import stanzas, props, variants, examples) live in `.lovable/rules/libraries/{slug}/components.md` — on disk, not auto-loaded. Read that file or the component source when the name alone isn't enough.

## Theme Files

The design system's theme is delivered through the following files. The author's original source files carry the full wiring the design system needs — variable declarations, framework-specific directives, provider objects, etc. — and are the canonical import target.

- `@ws-sy5kzr35jy4czgsth0ok/32caf520-24c5-48d7-b1dd-2f29c09b7ada/index.css` (source — preferred import)
- `@ws-sy5kzr35jy4czgsth0ok/32caf520-24c5-48d7-b1dd-2f29c09b7ada/dist/tokens.css` (auto-generated flat list of CSS custom properties — a raw-values fallback only; does NOT carry framework-specific wiring that the source files above provide)

