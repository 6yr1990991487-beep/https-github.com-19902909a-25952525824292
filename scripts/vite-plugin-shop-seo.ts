import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUB = resolve(ROOT, "public");
const PROD_DIR = resolve(PUB, "products");
const BASE_URL = "https://lovanet.fr";

const PALETTES: [string, string, string][] = [
  ["#ff2e93", "#7b2dff", "#00e0ff"],
  ["#ff5e3a", "#ffb13a", "#ffec5e"],
  ["#00ffa3", "#00b8ff", "#7b2dff"],
  ["#ff006e", "#fb5607", "#ffbe0b"],
  ["#8338ec", "#3a86ff", "#06ffa5"],
  ["#ef476f", "#ffd166", "#06d6a0"],
  ["#e63946", "#f1faee", "#a8dadc"],
  ["#ff7ad9", "#a78bfa", "#22d3ee"],
  ["#f43f5e", "#fb923c", "#facc15"],
  ["#10b981", "#06b6d4", "#6366f1"],
  ["#ec4899", "#8b5cf6", "#0ea5e9"],
  ["#facc15", "#ec4899", "#1e293b"],
];

function hash(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSvg(p: { id: string; name: string; category: string }) {
  const h = hash(p.id);
  const [c1, c2, c3] = PALETTES[h % PALETTES.length];
  const gid = `g${h.toString(36)}`;
  const rot = ((h >> 8) % 60) - 30;
  const dots = Array.from({ length: 18 })
    .map((_, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      const r = 80 + ((h + i * 31) % 110);
      const x = (200 + Math.cos(a) * r).toFixed(1);
      const y = (200 + Math.sin(a) * r).toFixed(1);
      const sz = 4 + ((h + i * 7) % 10);
      return `<circle cx="${x}" cy="${y}" r="${sz}" fill="#fff" opacity="0.45"/>`;
    })
    .join("");
  const label = escapeXml(`${p.name} — AnimemomentsAnimeofficiel`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${label}">
  <title>${label}</title>
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#${gid})"/>
  <g transform="rotate(${rot} 200 200)" opacity="0.55">
    <circle cx="200" cy="200" r="60"  fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="2"/>
    <circle cx="200" cy="200" r="100" fill="none" stroke="#fff" stroke-opacity="0.14" stroke-width="2"/>
    <circle cx="200" cy="200" r="140" fill="none" stroke="#fff" stroke-opacity="0.10" stroke-width="2"/>
  </g>
  ${dots}
  <rect x="40" y="60" width="320" height="280" rx="14" fill="#0c0c14" opacity="0.78"/>
  <text x="200" y="200" text-anchor="middle" font-family="serif" font-weight="900" font-size="120" fill="${c1}">${escapeXml(p.category[0].toUpperCase())}</text>
  <text x="200" y="260" text-anchor="middle" font-family="Orbitron, sans-serif" font-size="14" letter-spacing="4" fill="#fff">${escapeXml(p.category.toUpperCase())}</text>
  <text x="200" y="300" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#fff" opacity="0.9">${escapeXml(p.name.slice(0, 38))}</text>
  <text x="20" y="385" font-family="Orbitron, sans-serif" font-size="10" letter-spacing="3" fill="#fff" opacity="0.7">AnimemomentsAnimeofficiel · ${escapeXml(p.id.toUpperCase())}</text>
</svg>`;
}

type Product = { id: string; name: string; category: string; description: string };
type Video = { id: string; title: string; series: string };

function generate(products: Product[], videos: Video[]) {
  if (!existsSync(PROD_DIR)) mkdirSync(PROD_DIR, { recursive: true });

  // 1. Per-product SVGs
  for (const p of products) {
    writeFileSync(resolve(PROD_DIR, `${p.id}.svg`), buildSvg(p));
  }

  // 2. Sitemap with image extension for products + videos
  const staticRoutes = [
    { loc: "/",                  prio: "1.0", freq: "weekly" },
    { loc: "/shop",              prio: "0.9", freq: "weekly" },
    { loc: "/decouvrir",         prio: "0.9", freq: "weekly" },
    { loc: "/lecteurs-video",    prio: "0.8", freq: "weekly" },
    { loc: "/chaine-youtube",    prio: "0.7", freq: "weekly" },
    { loc: "/prime-video",       prio: "0.7", freq: "weekly" },
    { loc: "/tiktok",            prio: "0.7", freq: "weekly" },
    { loc: "/anime-countdown",   prio: "0.6", freq: "daily"  },
    { loc: "/anime-catalog",     prio: "0.6", freq: "weekly" },
    { loc: "/anime-moments",     prio: "0.7", freq: "weekly" },
    { loc: "/chaine-youtube/manga", prio: "0.6", freq: "weekly" },
    { loc: "/actualites",        prio: "0.7", freq: "daily"  },
    { loc: "/leaderboard",       prio: "0.5", freq: "weekly" },
    { loc: "/ai-hub",            prio: "0.6", freq: "weekly" },
    { loc: "/contact",           prio: "0.5", freq: "monthly" },
    { loc: "/legals",            prio: "0.2", freq: "yearly" },
  ];

  const shopImages = products
    .map(
      (p) => `    <image:image>
      <image:loc>${BASE_URL}/products/${p.id}.svg</image:loc>
      <image:title>${escapeXml(p.name)}</image:title>
      <image:caption>${escapeXml(p.description)}</image:caption>
    </image:image>`,
    )
    .join("\n");

  const videoImages = videos
    .map(
      (v) => `    <image:image>
      <image:loc>https://i.ytimg.com/vi/${v.id}/hqdefault.jpg</image:loc>
      <image:title>${escapeXml(v.title)}</image:title>
      <image:caption>${escapeXml(v.series)} — AnimemomentsAnimeofficiel</image:caption>
    </image:image>`,
    )
    .join("\n");

  const urls = staticRoutes.map((r) => {
    let extras = "";
    if (r.loc === "/shop") extras = "\n" + shopImages;
    if (r.loc === "/chaine-youtube" || r.loc === "/prime-video" || r.loc === "/lecteurs-video")
      extras = "\n" + videoImages;
    return `  <url>
    <loc>${BASE_URL}${r.loc}</loc>
    <changefreq>${r.freq}</changefreq>
    <priority>${r.prio}</priority>${extras}
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`;
  writeFileSync(resolve(PUB, "sitemap.xml"), xml);
}

function parseProducts(): Product[] {
  const src = readFileSync(resolve(ROOT, "src/data/shopProducts.ts"), "utf8");
  // Match each `{ name: "...", category: "...", ..., description: "..." }` seed entry.
  const re =
    /\{\s*name:\s*"((?:[^"\\]|\\.)*)",\s*category:\s*"([^"]+)",\s*tag:\s*"((?:[^"\\]|\\.)*)",\s*price:\s*(\d+(?:\.\d+)?),\s*description:\s*"((?:[^"\\]|\\.)*)"/g;
  const out: Product[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(src))) {
    i += 1;
    out.push({
      id: `am-${String(i).padStart(3, "0")}`,
      name: m[1].replace(/\\"/g, '"'),
      category: m[2],
      description: m[5].replace(/\\"/g, '"'),
    });
  }
  return out;
}

function parseVideos(): Video[] {
  const src = readFileSync(resolve(ROOT, "src/data/videos.ts"), "utf8");
  const re =
    /id:\s*"([^"]+)",\s*title:\s*"((?:[^"\\]|\\.)*)",\s*series:\s*"((?:[^"\\]|\\.)*)"/g;
  const out: Video[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    out.push({ id: m[1], title: m[2].replace(/\\"/g, '"'), series: m[3] });
  }
  return out;
}

function run() {
  const products = parseProducts();
  const videos = parseVideos();
  if (products.length === 0) {
    console.warn("[shop-seo] no products parsed — skipping");
    return;
  }
  generate(products, videos);
  console.log(`[shop-seo] wrote ${products.length} product SVGs + sitemap.xml`);
}

export default function shopSeoPlugin() {
  let ran = false;
  return {
    name: "shop-seo",
    buildStart() {
      if (ran) return;
      ran = true;
      try {
        run();
      } catch (e) {
        // Non-fatal: only affects SEO assets.
        console.warn("[shop-seo] generation failed:", (e as Error).message);
      }
    },
  };
}