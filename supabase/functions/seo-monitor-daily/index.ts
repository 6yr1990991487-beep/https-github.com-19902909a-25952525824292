// Daily scheduled edge function: pulls Search Console performance metrics
// (impressions, clicks, CTR, position) aggregated per country → language
// and coverage of localized /xx/… prefixes. Called by pg_cron once a day.
// Console output is captured in edge function logs.

const SITE = "https://lovanet.fr/";
const BASE = "https://connector-gateway.lovable.dev/google_search_console";

const COUNTRY_TO_LOCALE: Record<string, string> = {
  fra: "fr", bel: "fr", che: "fr", lux: "fr", mco: "fr", can: "fr",
  usa: "en", gbr: "en", irl: "en", aus: "en", nzl: "en", ind: "en", zaf: "en",
  esp: "es", mex: "es", arg: "es", col: "es", chl: "es", per: "es",
  deu: "de", aut: "de",
  ita: "it", smr: "it", vat: "it",
  prt: "pt", bra: "pt", ago: "pt", moz: "pt",
  jpn: "ja",
  chn: "zh", twn: "zh", hkg: "zh", sgp: "zh",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function iso(daysAgo: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function query(dimensions: string[]) {
  const lk = Deno.env.get("LOVABLE_API_KEY");
  const ck = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lk || !ck) throw new Error("connector not linked");
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
    const body = await r.text();
    throw new Error(`GSC ${dimensions.join("+")} ${r.status}: ${body}`);
  }
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    console.log(`[seo-monitor] window ${iso(28)} → ${iso(1)}`);

    const perCountry = await query(["country", "page"]);
    const byLocale = new Map<string, { clicks: number; impressions: number; ctrSum: number; posSum: number; n: number }>();
    for (const row of perCountry.rows ?? []) {
      const [country] = row.keys;
      const locale = COUNTRY_TO_LOCALE[country] || "other";
      const b = byLocale.get(locale) ?? { clicks: 0, impressions: 0, ctrSum: 0, posSum: 0, n: 0 };
      b.clicks += row.clicks;
      b.impressions += row.impressions;
      b.ctrSum += row.ctr * row.impressions;
      b.posSum += row.position * row.impressions;
      b.n += row.impressions;
      byLocale.set(locale, b);
    }

    const perLocale = [...byLocale.entries()]
      .sort((a, b) => b[1].impressions - a[1].impressions)
      .map(([locale, b]) => ({
        locale,
        clicks: b.clicks,
        impressions: b.impressions,
        ctr: b.n > 0 ? +(b.ctrSum / b.n * 100).toFixed(2) : 0,
        position: b.n > 0 ? +(b.posSum / b.n).toFixed(2) : 0,
      }));

    console.log("[seo-monitor] per-locale", JSON.stringify(perLocale));

    const perPage = await query(["page"]);
    const topPages = (perPage.rows ?? [])
      .map((r: any) => ({ page: r.keys[0], impressions: r.impressions, clicks: r.clicks }))
      .sort((a: any, b: any) => b.impressions - a.impressions)
      .slice(0, 20);
    console.log("[seo-monitor] top-pages", JSON.stringify(topPages));

    return new Response(
      JSON.stringify({ ok: true, window: { start: iso(28), end: iso(1) }, perLocale, topPages }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[seo-monitor] failed", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});