#!/usr/bin/env node
// Weekly-friendly SEO monitor: pulls Search Console performance for the
// last 28 days, aggregated per country + language, so we can verify that
// the localized snippets we ship are actually landing (impressions, CTR,
// average position). Prints a compact table per language.
//
// Usage: `bun run seo:monitor` (add the npm script) or `node scripts/seo-monitor-i18n.mjs`.
// Requires the same LOVABLE_API_KEY + GOOGLE_SEARCH_CONSOLE_API_KEY env
// vars as ping-search-engines.mjs. Non-fatal: exits 0 on transient errors.

const SITE = "https://lovanet.fr/";
const BASE = "https://connector-gateway.lovable.dev/google_search_console";

// Map ISO-3166-1 alpha-3 country codes returned by GSC to our hreflang codes.
// Coarse but sufficient to spot per-language traffic patterns.
const COUNTRY_TO_LOCALE = {
  fra: "fr", bel: "fr", che: "fr", lux: "fr", mco: "fr", can: "fr",
  usa: "en", gbr: "en", irl: "en", aus: "en", nzl: "en", ind: "en", zaf: "en",
  esp: "es", mex: "es", arg: "es", col: "es", chl: "es", per: "es",
  deu: "de", aut: "de",
  ita: "it", smr: "it", vat: "it",
  prt: "pt", bra: "pt", ago: "pt", moz: "pt",
  jpn: "ja",
  chn: "zh", twn: "zh", hkg: "zh", sgp: "zh",
};

function iso(daysAgo) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function query(dimensions) {
  const lk = process.env.LOVABLE_API_KEY;
  const ck = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lk || !ck) {
    console.log("[monitor] connector not linked — skipping");
    return null;
  }
  const encSite = encodeURIComponent(SITE);
  const r = await fetch(`${BASE}/webmasters/v3/sites/${encSite}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lk}`,
      "X-Connection-Api-Key": ck,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: iso(28),
      endDate: iso(1),
      dimensions,
      rowLimit: 500,
    }),
  });
  if (!r.ok) {
    console.warn(`[monitor] query ${dimensions.join("+")} → ${r.status}`);
    return null;
  }
  return r.json();
}

function fmt(n) {
  return typeof n === "number" ? n.toFixed(n < 1 ? 3 : 1) : String(n);
}

async function main() {
  console.log(`[monitor] Search Console — 28d rolling window (${iso(28)} → ${iso(1)})`);

  // 1) Per-country roll-up → per-language aggregate
  const perCountry = await query(["country", "page"]);
  if (!perCountry) return;

  const byLocale = new Map();
  for (const row of perCountry.rows ?? []) {
    const [country, page] = row.keys;
    const locale = COUNTRY_TO_LOCALE[country] || "other";
    const bucket = byLocale.get(locale) || { clicks: 0, impressions: 0, ctrSum: 0, posSum: 0, n: 0, samplePages: new Set() };
    bucket.clicks += row.clicks;
    bucket.impressions += row.impressions;
    bucket.ctrSum += row.ctr * row.impressions;
    bucket.posSum += row.position * row.impressions;
    bucket.n += row.impressions;
    if (bucket.samplePages.size < 3) bucket.samplePages.add(page);
    byLocale.set(locale, bucket);
  }

  console.log("\n=== Per-language performance (aggregated by user country) ===");
  console.log("lang | clicks | impress. | avg CTR | avg pos");
  console.log("-----+--------+----------+---------+--------");
  for (const [locale, b] of [...byLocale.entries()].sort((a, b) => b[1].impressions - a[1].impressions)) {
    const ctr = b.n > 0 ? (b.ctrSum / b.n) * 100 : 0;
    const pos = b.n > 0 ? b.posSum / b.n : 0;
    console.log(
      `${locale.padEnd(4)} | ${String(b.clicks).padStart(6)} | ${String(b.impressions).padStart(8)} | ${fmt(ctr).padStart(6)}% | ${fmt(pos).padStart(6)}`,
    );
  }

  // 2) Indexed-page coverage: which of our /xx/ prefixes actually got impressions?
  console.log("\n=== Localized URL coverage (top pages) ===");
  const perPage = await query(["page"]);
  if (perPage) {
    const rows = (perPage.rows ?? [])
      .map((r) => ({ page: r.keys[0], impressions: r.impressions, clicks: r.clicks }))
      .filter((r) => r.page.startsWith("https://lovanet.fr/"))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 15);
    for (const r of rows) {
      const path = r.page.replace("https://lovanet.fr", "");
      const prefix = path.split("/").filter(Boolean)[0];
      const isLocalized = ["en","es","de","it","pt","ja","zh"].includes(prefix);
      console.log(`${isLocalized ? "🌐" : "  "} ${path.padEnd(40)} imp=${r.impressions} clicks=${r.clicks}`);
    }
  }

  console.log("\n[monitor] done");
}

await main().catch((e) => {
  console.warn("[monitor] failed:", e.message);
  process.exit(0);
});