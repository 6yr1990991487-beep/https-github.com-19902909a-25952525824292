// Vite plugin: after `vite build` writes dist/index.html, we clone it into
// dist/{lang}/{route}/index.html for every non-default locale × indexable
// route, swapping <title>, <meta description>, <html lang>, canonical,
// og:*, twitter:* and hreflang alternates so bots read the localized head
// WITHOUT depending on client-side JS execution.
//
// Lovable hosting serves the bare file when the URL matches an existing
// file in dist/, so /en/shop/index.html is delivered as-is; only URLs with
// no matching file fall back to the SPA index.html. This gives Google a
// distinct, static, fully-translated document per language + route.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import type { Plugin } from "vite";
import { SEO_I18N, SUPPORTED_LOCALES, DEFAULT_LOCALE, ROUTES, type Locale, type RouteKey } from "../src/lib/seoI18n";

const OG_LOCALE: Record<Locale, string> = {
  fr: "fr_FR", en: "en_US", es: "es_ES", de: "de_DE",
  it: "it_IT", pt: "pt_BR", ja: "ja_JP", zh: "zh_CN",
};

type Meta = { title: string; description: string };

const SITE = "https://lovanet.fr";

function localizedPath(route: string, locale: Locale) {
  const suffix = route === "/" ? "" : route;
  return locale === DEFAULT_LOCALE ? (suffix || "/") : `/${locale}${suffix}`;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderHead(locale: Locale, route: string, meta: Meta): string {
  const canonical = `${SITE}${localizedPath(route, locale)}`;
  const hreflangs = SUPPORTED_LOCALES.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${localizedPath(route, l)}" />`,
  ).join("\n    ");
  const xDefault = `<link rel="alternate" hreflang="x-default" href="${SITE}${route === "/" ? "/" : route}" />`;
  const ogAlt = SUPPORTED_LOCALES
    .filter((l) => l !== locale)
    .map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`)
    .join("\n    ");

  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[locale]}" />`,
    ogAlt,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    hreflangs,
    xDefault,
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: meta.title,
      description: meta.description,
      url: canonical,
      inLanguage: locale,
      isPartOf: { "@type": "WebSite", "@id": "https://lovanet.fr/#website" },
    })}</script>`,
  ].join("\n    ");
}

function rewriteHead(html: string, locale: Locale, route: string, meta: Meta): string {
  let out = html;
  // Replace the static <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`);
  // Replace the sitewide description
  out = out.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(meta.description)}" />`,
  );
  // Swap html lang
  out = out.replace(/<html lang="[^"]*">/, `<html lang="${locale}">`);
  // Replace canonical
  const canonical = `${SITE}${localizedPath(route, locale)}`;
  out = out.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${canonical}" />`,
  );
  // Drop the existing hreflang alternates block — we'll inject a fresh one.
  out = out.replace(/(\s*<link rel="alternate" hreflang="[^"]+"[^>]*>)+/g, "");
  // Replace og:title / og:description / og:url / twitter:title / twitter:description
  const replacements: Array<[RegExp, string]> = [
    [/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(meta.title)}" />`],
    [/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(meta.description)}" />`],
    [/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`],
    [/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(meta.title)}" />`],
    [/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(meta.description)}" />`],
  ];
  for (const [re, val] of replacements) {
    if (re.test(out)) out = out.replace(re, val);
    else out = out.replace("</head>", `    ${val}\n  </head>`);
  }
  // Inject fresh hreflang alternates + WebPage JSON-LD + og:locale
  const injected = [
    ...SUPPORTED_LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${localizedPath(route, l)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}${route === "/" ? "/" : route}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[locale]}" />`,
    ...SUPPORTED_LOCALES.filter((l) => l !== locale).map(
      (l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`,
    ),
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: meta.title,
      description: meta.description,
      url: canonical,
      inLanguage: locale,
      isPartOf: { "@type": "WebSite", "@id": "https://lovanet.fr/#website" },
    })}</script>`,
  ].join("\n    ");
  out = out.replace("</head>", `    ${injected}\n  </head>`);
  return out;
}

export default function prerenderLocalesPlugin(): Plugin {
  return {
    name: "prerender-locales",
    apply: "build",
    closeBundle() {
      const distDir = resolve("dist");
      const indexPath = join(distDir, "index.html");
      if (!existsSync(indexPath)) {
        console.warn("[prerender-locales] dist/index.html not found — skipping");
        return;
      }
      const html = readFileSync(indexPath, "utf8");
      let count = 0;
      // For every non-default locale × every indexable route, emit
      // dist/{lang}{route}/index.html so hosting serves it directly on
      // matching URLs (e.g. /en/shop → dist/en/shop/index.html).
      for (const locale of SUPPORTED_LOCALES) {
        if (locale === DEFAULT_LOCALE) continue;
        for (const route of ROUTES) {
          const meta = SEO_I18N?.[locale]?.[route as RouteKey];
          if (!meta) continue;
          const rel = route === "/" ? `/${locale}` : `/${locale}${route}`;
          const outDir = join(distDir, rel);
          mkdirSync(outDir, { recursive: true });
          writeFileSync(join(outDir, "index.html"), rewriteHead(html, locale, route, meta), "utf8");
          count++;
        }
      }
      console.log(`[prerender-locales] wrote ${count} localized HTML files`);
    },
  };
}