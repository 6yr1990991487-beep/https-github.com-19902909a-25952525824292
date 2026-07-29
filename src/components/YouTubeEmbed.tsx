import { useEffect, useRef } from "react";

// Global YT IFrame API loader (singleton).
let ytApiPromise: Promise<any> | null = null;
function loadYouTubeAPI(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(w.YT);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    }
  });
  return ytApiPromise;
}

type Props = {
  /** Trailer video ID. If omitted, the component runs a search query instead. */
  videoId?: string;
  /** Fallback search string used when no id is provided or the id is unavailable. */
  searchQuery?: string;
  /** Called when the primary videoId fails to play (error 2/5/100/101/150) OR times out. */
  onUnavailable?: () => void;
  /** Called when even the search fallback yields nothing playable. Parent should hide the player. */
  onExhausted?: () => void;
  autoplay?: boolean;
  className?: string;
  title?: string;
};

/**
 * Wraps a YouTube iframe with the JS API so we can detect unavailable/blocked videos
 * and gracefully fall back to a search list or hide the player entirely.
 */
export default function YouTubeEmbed({
  videoId,
  searchQuery,
  onUnavailable,
  onExhausted,
  autoplay = true,
  className,
  title,
}: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const modeRef = useRef<"video" | "search">(videoId ? "video" : "search");
  const readyRef = useRef<boolean>(false);

  useEffect(() => {
    let disposed = false;
    let watchdog: any;

    modeRef.current = videoId ? "video" : "search";
    readyRef.current = false;

    loadYouTubeAPI().then((YT) => {
      if (disposed || !holderRef.current) return;
      // Reset holder (StrictMode / re-mount safe).
      holderRef.current.innerHTML = "";
      const mount = document.createElement("div");
      mount.className = "absolute inset-0 w-full h-full";
      holderRef.current.appendChild(mount);

      const commonVars: Record<string, any> = {
        autoplay: autoplay ? 1 : 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin,
        hl: "en",
      };

      const opts: any = {
        width: "100%",
        height: "100%",
        host: "https://www.youtube-nocookie.com",
        playerVars: commonVars,
        events: {
          onReady: () => {
            readyRef.current = true;
            clearTimeout(watchdog);
          },
          onError: (e: any) => {
            // 2 = invalid id, 5 = HTML5 error, 100 = removed/private,
            // 101 / 150 = embedding disabled or region-locked.
            const code = e?.data;
            if (!(code === 2 || code === 5 || code === 100 || code === 101 || code === 150)) return;
            if (modeRef.current === "video") {
              modeRef.current = "search";
              onUnavailable?.();
              if (searchQuery && playerRef.current?.cuePlaylist) {
                try {
                  playerRef.current.cuePlaylist({ listType: "search", list: searchQuery });
                  if (autoplay) playerRef.current.playVideo?.();
                  return;
                } catch { /* fall through */ }
              }
              onExhausted?.();
            } else {
              onExhausted?.();
            }
          },
        },
      };

      if (videoId) {
        opts.videoId = videoId;
      } else if (searchQuery) {
        opts.playerVars = { ...commonVars, listType: "search", list: searchQuery };
      }

      playerRef.current = new YT.Player(mount, opts);

      // Watchdog: if the player never reports ready within 6s AND we're on a specific
      // video id, assume it's unavailable (some regions block silently without an error event).
      if (videoId) {
        watchdog = setTimeout(() => {
          if (disposed || readyRef.current) return;
          if (modeRef.current === "video") {
            modeRef.current = "search";
            onUnavailable?.();
            if (searchQuery) {
              try {
                playerRef.current?.cuePlaylist?.({ listType: "search", list: searchQuery });
                if (autoplay) playerRef.current?.playVideo?.();
                return;
              } catch { /* ignore */ }
            }
            onExhausted?.();
          }
        }, 6000);
      }
    });

    return () => {
      disposed = true;
      clearTimeout(watchdog);
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
      playerRef.current = null;
    };
    // We deliberately re-create the player on id/search change.
  }, [videoId, searchQuery]);

  return (
    <div
      ref={holderRef}
      className={className ?? "absolute inset-0 w-full h-full"}
      aria-label={title}
    />
  );
}