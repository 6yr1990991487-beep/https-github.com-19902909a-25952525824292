import { useEffect, useState, type CSSProperties } from "react";

/**
 * Overlay placed inside a `relative` container that also holds a YouTube iframe.
 * Masks the YouTube logo watermark with a customizable color / logo.
 * Config is stored in localStorage under `lovanet.yt.cover.v1` and reacts to
 * changes broadcast via the `yt-cover-change` custom event.
 */

export type YTCoverConfig = {
  enabled: boolean;
  color: string;
  logoUrl?: string;
  position: "br" | "bl" | "tr" | "tl";
  width: number;
  height: number;
};

export const YT_COVER_DEFAULT: YTCoverConfig = {
  enabled: true,
  color: "#0c0a16",
  logoUrl: "",
  position: "br",
  width: 74,
  height: 26,
};

const KEY = "lovanet.yt.cover.v1";

export function loadYTCover(): YTCoverConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return YT_COVER_DEFAULT;
    return { ...YT_COVER_DEFAULT, ...JSON.parse(raw) };
  } catch {
    return YT_COVER_DEFAULT;
  }
}

export function saveYTCover(cfg: YTCoverConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent("yt-cover-change"));
}

export default function YoutubeBrandCover() {
  const [cfg, setCfg] = useState<YTCoverConfig>(YT_COVER_DEFAULT);

  useEffect(() => {
    setCfg(loadYTCover());
    const on = () => setCfg(loadYTCover());
    window.addEventListener("yt-cover-change", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("yt-cover-change", on);
      window.removeEventListener("storage", on);
    };
  }, []);

  if (!cfg.enabled) return null;

  const style: CSSProperties = {
    position: "absolute",
    width: cfg.width,
    height: cfg.height,
    background: cfg.color,
    borderRadius: 6,
    pointerEvents: "none",
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...(cfg.position === "br" ? { bottom: 8, right: 8 } : {}),
    ...(cfg.position === "bl" ? { bottom: 8, left: 8 } : {}),
    ...(cfg.position === "tr" ? { top: 8, right: 8 } : {}),
    ...(cfg.position === "tl" ? { top: 8, left: 8 } : {}),
  };

  return (
    <div style={style} aria-hidden>
      {cfg.logoUrl ? (
        <img
          src={cfg.logoUrl}
          alt=""
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      ) : null}
    </div>
  );
}