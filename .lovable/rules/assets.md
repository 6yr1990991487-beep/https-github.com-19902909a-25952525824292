---
description: "Brand assets shipped by the 33 design system (logos, icons, illustrations, photography, fonts, videos) with exact import paths. Read before adding any logo, icon, illustration, image, video, or font to the app: use these real assets instead of placeholders, stock photos, or generated images."
---

# 33 — Assets

These files are copied into `src/design-system/{slug}/assets/` in this project — never generate, placeholder, or substitute an asset that exists here.

Raw files import directly, e.g. `import logo from "@/design-system/{slug}/assets/logos/logo.svg"`.
R2 pointer files (`.asset.json`) are imported as JSON — use the `url` property, e.g. `import hero from "@/design-system/{slug}/assets/hero.png.asset.json"` then `<img src={hero.url} />`.
The full machine-readable catalog lives in this library's `design-system.json` (`assets` array).

## Logos

- `@/design-system/{slug}/assets/hero-logo.png.asset.json` (png, R2 pointer)
- `@/design-system/{slug}/assets/lovanet-logo-v2.png.asset.json` (png, R2 pointer)
- `@/design-system/{slug}/assets/lovanet-logo.jpg.asset.json` (jpg, R2 pointer)

## Videos

- `@/design-system/{slug}/assets/aihub-banner-v2.mp4.asset.json` (mp4, R2 pointer)
- `@/design-system/{slug}/assets/aihub-long-banner.mp4.asset.json` (mp4, R2 pointer)
- `@/design-system/{slug}/assets/anime-moments-top.mp4` (mp4)
- `@/design-system/{slug}/assets/background-decor-video.mp4.asset.json` (mp4, R2 pointer)
- `@/design-system/{slug}/assets/footer-logo-banner.mp4.asset.json` (mp4, R2 pointer)
- `@/design-system/{slug}/assets/footer-lovanet-zone-video.mp4` (mp4)
- `@/design-system/{slug}/assets/hero-top-banner.mp4.asset.json` (mp4, R2 pointer)
- `@/design-system/{slug}/assets/portal-hero-video-1.mp4` (mp4)
- `@/design-system/{slug}/assets/portal-hero-video-2.mp4` (mp4)
- `@/design-system/{slug}/assets/portal-hero-video-3.mp4` (mp4)
- `@/design-system/{slug}/assets/portal-theme-video.mp4` (mp4)
- `@/design-system/{slug}/assets/portal-zone-replacement.mp4` (mp4)
- `@/design-system/{slug}/assets/root-capture-zone-video.mp4` (mp4)
- `@/design-system/{slug}/assets/short-banner.mp4.asset.json` (mp4, R2 pointer)
- `@/design-system/{slug}/assets/video_banner_compressed.mp4` (mp4)

## Images

- `@/design-system/{slug}/assets/anime-moments-hero.jpg` (jpg)
- `@/design-system/{slug}/assets/bling-bling.jpg.asset.json` (jpg, R2 pointer)
- `@/design-system/{slug}/assets/contact-left-character.png` (png)
- `@/design-system/{slug}/assets/contact-right-character.png` (png)
- `@/design-system/{slug}/assets/crystal-city.jpg.asset.json` (jpg, R2 pointer)
- `@/design-system/{slug}/assets/lovanet-icon.png` (png)
- `@/design-system/{slug}/assets/manga-banner.jpg` (jpg)

