// Normalise titles, descriptions and thumbnails of imported videos so every
// piece of content displayed on the site carries the brand keywords the SERP
// expects: anime · AnimeMoments · Animer officiel · manga.
//
// The helpers are pure and idempotent — calling them twice is a no-op. Use
// them when rendering data coming from the sync-videos / youtube-anime-sync
// edge functions.

import { siteFallbackImage } from "@/lib/mediaFallback";
const BRAND_TAGS = ["anime", "animemoments", "animer officiel", "manga"];
const BRAND_SUFFIX = " · Anime · AnimeMoments · Animer officiel · Manga";

// Fallback poster art shipped in /public/products used when a remote thumbnail
// is missing or blocked. Cycles through the branded catalog covers.

function hasAllBrandTags(text: string): boolean {
  const lower = text.toLowerCase();
  return BRAND_TAGS.every((t) => lower.includes(t));
}

/** Append the brand keyword chain to a title unless every tag is already
 * present. Removes em-dashes so the final SERP snippet never renders "—". */
export function normalizeTitle(raw: string | null | undefined): string {
  const clean = (raw ?? "").replace(/[—–]/g, ":").trim();
  if (!clean) return "Anime.Moments.officiel : AnimeMoments manga";
  return hasAllBrandTags(clean) ? clean : `${clean}${BRAND_SUFFIX}`;
}

/** Append the brand keyword chain to a description unless it already contains
 * every required tag. Never mutates a description that is already normalised. */
export function normalizeDescription(raw: string | null | undefined): string {
  const clean = (raw ?? "").replace(/[—–]/g, ":").trim();
  const base =
    clean ||
    "Anime.Moments.officiel : Lovanet Plateforme officielle. Chaîne YouTube AnimeMoments, shorts TikTok, Prime Video et boutique.";
  return hasAllBrandTags(base) ? base : `${base}${BRAND_SUFFIX}`;
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Return a usable thumbnail URL. When the source URL is missing or clearly
 * broken (empty / data:image / non-http), pick a deterministic branded poster
 * from /public/products so the card never shows a blank frame. */
export function normalizeThumbnail(
  raw: string | null | undefined,
  seed: string,
): string {
  const url = (raw ?? "").trim();
  const ok = /^https?:\/\//i.test(url);
  if (ok) return url;
  return siteFallbackImage(seed, url);
}

export type NormalizableVideo = {
  id: string;
  title?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  [k: string]: unknown;
};

/** Apply title/description/thumbnail normalization in one shot. */
export function normalizeVideo<T extends NormalizableVideo>(v: T): T {
  return {
    ...v,
    title: normalizeTitle(v.title as string | null | undefined),
    description: normalizeDescription(v.description as string | null | undefined),
    thumbnail: normalizeThumbnail(v.thumbnail as string | null | undefined, v.id),
  };
}
