function normalizeGoogleDriveSource(value: string) {
  const match = value.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) || value.match(/id=([a-zA-Z0-9_-]+)/i);
  if (!match?.[1]) return null;
  return `https://drive.google.com/uc?export=download&id=${match[1]}`;
}

export function safeLovableVideoSource(input?: string | null, fallback = "/global-bg-web.mp4") {
  const value = String(input ?? "").trim();
  if (!value) return fallback;

  // Lovable asset proxy paths are not available on Emergent runtime.
  if (value.startsWith("/__l5e/") || value.startsWith("/__l5e")) {
    return fallback;
  }

  if (value.startsWith("/")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    if (value.includes("/__l5e/") || value.includes("googleusercontent")) {
      return fallback;
    }
    if (value.includes("drive.google.com")) {
      return normalizeGoogleDriveSource(value) ?? fallback;
    }
    return value;
  }

  return fallback;
}
