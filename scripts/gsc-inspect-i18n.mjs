const SITE = "https://lovanet.fr/";
const BASE = "https://connector-gateway.lovable.dev/google_search_console";
const H = {
  Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
  "X-Connection-Api-Key": process.env.GOOGLE_SEARCH_CONSOLE_API_KEY,
  "Content-Type": "application/json",
};
const LOCALES = ["fr","en","es","de","it","pt","ja","zh"];
const ROUTES = ["/","/shop","/anime-catalog","/anime-countdown","/decouvrir","/chaine-youtube","/prime-video","/tiktok"];

function url(loc, r) {
  if (loc === "fr") return `https://lovanet.fr${r}`;
  return `https://lovanet.fr/${loc}${r === "/" ? "" : r}`;
}

const results = [];
for (const loc of LOCALES) {
  for (const r of ROUTES) {
    const u = url(loc, r);
    try {
      const res = await fetch(`${BASE}/v1/urlInspection/index:inspect`, {
        method: "POST",
        headers: H,
        body: JSON.stringify({ inspectionUrl: u, siteUrl: SITE }),
      });
      const body = await res.text();
      let verdict = "?", coverage = "?", lang = "?";
      try {
        const j = JSON.parse(body);
        verdict = j?.inspectionResult?.indexStatusResult?.verdict ?? "?";
        coverage = j?.inspectionResult?.indexStatusResult?.coverageState ?? "?";
      } catch {}
      const line = `[${loc}] ${r.padEnd(18)} → ${res.status} ${verdict} | ${coverage}`;
      console.log(line);
      results.push({ loc, route: r, url: u, status: res.status, verdict, coverage });
    } catch (e) {
      console.warn(`[${loc}] ${r} failed:`, e.message);
    }
    await new Promise(r => setTimeout(r, 250));
  }
}

// Summary
console.log("\n=== Summary by locale ===");
const byLoc = {};
for (const r of results) {
  byLoc[r.loc] ??= { pass:0, neutral:0, fail:0, total:0 };
  byLoc[r.loc].total++;
  if (r.verdict === "PASS") byLoc[r.loc].pass++;
  else if (r.verdict === "NEUTRAL") byLoc[r.loc].neutral++;
  else byLoc[r.loc].fail++;
}
for (const [loc, s] of Object.entries(byLoc)) {
  console.log(`${loc}: PASS=${s.pass} NEUTRAL=${s.neutral} FAIL=${s.fail} (${s.total} total)`);
}
