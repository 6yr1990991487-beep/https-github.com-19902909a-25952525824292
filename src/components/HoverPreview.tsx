import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play } from "lucide-react";

type Props = {
  videoId: string;
  title: string;
  thumbnail: string;
  vertical?: boolean;
  /** start muted (default true). When false, audio plays on hover. */
  muted?: boolean;
  /** delay before iframe loads on hover, in ms */
  delay?: number;
  /** Start playing automatically without waiting for hover (default true). */
  autoPlay?: boolean;
  /** extra overlays rendered above the player (badges, captions...) */
  children?: ReactNode;
  className?: string;
  onImgLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onImgError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
};

/**
 * Thumbnail that, on hover (or focus / touch), loads a muted YouTube iframe
 * playing the video in autoplay+loop — a TikTok-style mini preview.
 * The iframe is only inserted in the DOM while active, to keep the page light.
 */
export const HoverPreview = ({
  videoId,
  title,
  thumbnail,
  vertical,
  muted = true,
  delay = 0,
  autoPlay = false,
  children,
  className = "",
  onImgLoad,
  onImgError,
}: Props) => {
  const [active, setActive] = useState(autoPlay);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (autoPlay) setActive(true);
  }, [autoPlay, videoId]);

  const start = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(true), delay);
  };
  const stop = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setActive(false);
  };

  const ratio = vertical ? "aspect-[9/16]" : "aspect-video";
  // Vertical preview = crop the 16:9 player to portrait to mimic Shorts/TikTok
  const iframeWrap = vertical
    ? "absolute inset-0 overflow-hidden pointer-events-none"
    : "absolute inset-0 pointer-events-none";

  return (
    <div
      className={`rgb-frame relative overflow-hidden bg-white/95 ${ratio} ${className}`}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      onTouchStart={() => setActive((a) => !a)}
    >
      <img
        src={thumbnail}
        alt={title}
        loading="lazy"
        onLoad={onImgLoad}
        onError={onImgError}
        className={`w-full h-full object-cover transition-transform duration-500 ${
          active ? "scale-105 opacity-0" : "opacity-100 group-hover:scale-105"
        }`}
      />

      {active && (
        <div className={iframeWrap}>
          {vertical ? (
            // Crop a 16:9 iframe to a 9:16 viewport: scale up and center
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&rel=0&playsinline=1&loop=1&playlist=${videoId}&modestbranding=1`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-[178%] border-0"
            />
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&rel=0&playsinline=1&loop=1&playlist=${videoId}&modestbranding=1`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="w-full h-full border-0"
            />
          )}
        </div>
      )}

      {/* Play affordance when not previewing */}
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.6)]">
            <Play className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
        </div>
      )}

      {/* Live preview indicator */}
      {active && (
        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Preview
        </span>
      )}

      {children}
    </div>
  );
};