const FALLBACK_SITE_ORIGIN = "https://animemomentsofficiel.fr";

const isPreviewLikeHost = (host: string) =>
  host === "localhost" ||
  host === "127.0.0.1" ||
  host.includes("preview") ||
  host.includes("emergent") ||
  host.endsWith(".emergentcf.cloud") ||
  host.endsWith(".emergent.host") ||
  host.endsWith("lovableproject.com") ||
  host.endsWith("lovableproject-dev.com");

export function getSiteOrigin() {
  const envOrigin = (import.meta.env.VITE_PRIMARY_SITE ?? "").trim();
  if (envOrigin) return envOrigin.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (!isPreviewLikeHost(host)) return window.location.origin.replace(/\/+$/, "");
  }

  return FALLBACK_SITE_ORIGIN;
}
