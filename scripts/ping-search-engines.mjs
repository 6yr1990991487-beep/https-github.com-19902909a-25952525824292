#!/usr/bin/env node
// Post-deploy: pings Bing/IndexNow with the sitemap URL and, if the Google
// Search Console connector is linked, submits the sitemap and force-inspects
// key URLs via the Lovable connector gateway. Safe to run anytime — never
// fails the deploy: any provider error is logged and the process exits 0.

const SITE = "https://lovanet.fr";
const SITEMAP = `${SITE}/sitemap-index.xml`;
const KEY_URLS = [
  "/",
  "/shop",
  "/anime-catalog",
  "/anime-countdown",
  "/decouvrir",
  "/chaine-youtube",
  "/prime-video",
  "/tiktok",
];

async function bingIndexNow() {
  // IndexNow accepts a public GET with the sitemap URL; response body is often empty.
  const url = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`;
  try {
    const r = await fetch(url);
    console.log(`[ping] bing ${r.status}`);
  } catch (e) {
    console.warn("[ping] bing failed:", e.message);
  }
}

async function gscSubmitSitemap() {
  const lk = process.env.LOVABLE_API_KEY;
  const ck = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lk || !ck) {
    console.log("[gsc] connector not linked — skipping sitemap submit & URL inspection");
    return;
  }
  const base = "https://connector-gateway.lovable.dev/google_search_console";
  const headers = { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": ck };

  // 1) Discover a verified property that matches SITE.
  let siteUrl = null;
  try {
    const r = await fetch(`${base}/webmasters/v3/sites`, { headers });
    const j = await r.json();
    const entries = j?.siteEntry ?? [];
    const match =
      entries.find((e) => e.siteUrl === `${SITE}/`) ||
      entries.find((e) => e.siteUrl === `sc-domain:${new URL(SITE).host}`) ||
      entries[0];
    siteUrl = match?.siteUrl ?? null;
    console.log(`[gsc] verified property: ${siteUrl ?? "none"}`);
  } catch (e) {
    console.warn("[gsc] sites list failed:", e.message);
    return;
  }
  if (!siteUrl) return;

  // 2) Submit the sitemap
  try {
    const encSite = encodeURIComponent(siteUrl);
    const encMap = encodeURIComponent(SITEMAP);
    const r = await fetch(`${base}/webmasters/v3/sites/${encSite}/sitemaps/${encMap}`, {
      method: "PUT",
      headers,
    });
    console.log(`[gsc] sitemap submit ${r.status}`);
  } catch (e) {
    console.warn("[gsc] sitemap submit failed:", e.message);
  }

  // 3) URL inspection for each key URL (read-only; does not force indexing but
  //    warms up the cache and returns the current coverage state).
  for (const path of KEY_URLS) {
    const inspectionUrl = `${SITE}${path}`;
    try {
      const r = await fetch(`${base}/v1/urlInspection/index:inspect`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionUrl, siteUrl: siteUrl.startsWith("sc-domain:") ? `${SITE}/` : siteUrl }),
      });
      const body = await r.text();
      const state = (() => { try { return JSON.parse(body)?.inspectionResult?.indexStatusResult?.verdict ?? "?"; } catch { return "?"; } })();
      console.log(`[gsc] inspect ${path} → ${r.status} ${state}`);
    } catch (e) {
      console.warn(`[gsc] inspect ${path} failed:`, e.message);
    }
  }
}

await bingIndexNow();
await gscSubmitSitemap();
console.log("[ping] done");