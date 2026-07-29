// Fetches up to 1500 anime titles from AniList (with trailers, covers, synopsis)
// and writes public/catalog-seo.json + public/sitemap-catalog.xml so search
// engines can index the catalogue's cards, trailers and thumbnails.
// Runs before dev and build; failures are non-fatal and preserve existing files.

import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = "https://lovanet.fr";
const TARGET = 1500;
const PER_PAGE = 50;
const OUT_JSON = resolve("public/catalog-seo.json");
const OUT_XML = resolve("public/sitemap-catalog.xml");

type AniMedia = {
  id: number;
  title: { english: string | null; romaji: string | null };
  description: string | null;
  coverImage: { extraLarge: string | null; large: string | null };
  bannerImage: string | null;
  averageScore: number | null;
  seasonYear: number | null;
  genres: string[];
  trailer: { id: string | null; site: string | null } | null;
};

const QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(sort: POPULARITY_DESC, type: ANIME) {
      id
      title { english romaji }
      description(asHtml: false)
      coverImage { extraLarge large }
      bannerImage
      averageScore
      seasonYear
      genres
      trailer { id site }
    }
  }
}`;

async function fetchPage(page: number): Promise<AniMedia[]> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { page, perPage: PER_PAGE } }),
  });
  if (!res.ok) throw new Error(`AniList page ${page}: ${res.status}`);
  const j = await res.json();
  return j?.data?.Page?.media ?? [];
}

function stripHtml(s: string | null): string {
  return (s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function xmlEscape(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

async function main() {
  const items: AniMedia[] = [];
  const pages = Math.ceil(TARGET / PER_PAGE);
  for (let p = 1; p <= pages; p++) {
    try {
      const batch = await fetchPage(p);
      if (!batch.length) break;
      items.push(...batch);
      // gentle: avoid 429s
      await new Promise((r) => setTimeout(r, 120));
    } catch (err) {
      console.warn(`[catalog-seo] page ${p} failed:`, (err as Error).message);
      break;
    }
  }

  if (!items.length) {
    console.warn("[catalog-seo] no items fetched — keeping existing files");
    return;
  }

  const slim = items.slice(0, TARGET).map((m) => {
    const title = m.title.english || m.title.romaji || `Anime #${m.id}`;
    const summary = stripHtml(m.description).slice(0, 500);
    return {
      id: m.id,
      title,
      summary,
      year: m.seasonYear,
      score: m.averageScore,
      genres: m.genres ?? [],
      cover: m.coverImage.extraLarge || m.coverImage.large,
      banner: m.bannerImage,
      trailerId: m.trailer?.site === "youtube" ? m.trailer.id : null,
      url: `${BASE_URL}/anime-catalog#anime-${m.id}`,
    };
  });

  writeFileSync(OUT_JSON, JSON.stringify(slim));

  const urls = slim.map((it) => {
    const desc = it.summary || `${it.title} — fiche & trailer sur Lovanet.`;
    const imgs: string[] = [];
    if (it.cover) imgs.push(it.cover);
    if (it.banner && it.banner !== it.cover) imgs.push(it.banner);
    if (it.trailerId) imgs.push(`https://i.ytimg.com/vi/${it.trailerId}/hqdefault.jpg`);
    return [
      `  <url>`,
      `    <loc>${xmlEscape(it.url)}</loc>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>0.5</priority>`,
      ...imgs.map((src) => [
        `    <image:image>`,
        `      <image:loc>${xmlEscape(src)}</image:loc>`,
        `      <image:title>${xmlEscape(it.title)}</image:title>`,
        `      <image:caption>${xmlEscape(desc)}</image:caption>`,
        `    </image:image>`,
      ].join("\n")),
      `  </url>`,
    ].join("\n");
  });

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
  writeFileSync(OUT_XML, xml);

  console.log(`[catalog-seo] wrote ${slim.length} items to ${OUT_JSON} & ${OUT_XML}`);

  if (!existsSync(resolve("public/sitemap-index.xml"))) {
    const idx = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      `  <sitemap><loc>${BASE_URL}/sitemap.xml</loc></sitemap>`,
      `  <sitemap><loc>${BASE_URL}/sitemap-catalog.xml</loc></sitemap>`,
      `</sitemapindex>`,
    ].join("\n");
    writeFileSync(resolve("public/sitemap-index.xml"), idx);
  }
}

main().catch((err) => {
  console.warn("[catalog-seo] failed:", err);
});