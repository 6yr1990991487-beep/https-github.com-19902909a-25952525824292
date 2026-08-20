import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Ban, Play } from "lucide-react";
import { getVideoStatusSync } from "@/lib/videoAvailability";
import { siteFallbackImage } from "@/lib/mediaFallback";
import { buildYouTubeEmbedUrl } from "@/lib/youtubeEmbed";
import { acquireTrailerLock, releaseTrailerLock } from "@/lib/trailerPlaybackLock";
import { claimAudioFocus, getAudioFocusOwner, releaseAudioFocus, subscribeAudioFocus } from "@/lib/trailerAudioFocus";
import {
  claimActivePreview,
  getActivePreviewOwner,
  releaseActivePreview,
  subscribeActivePreview,
} from "@/lib/trailerActiveFocus";

type Props = {
  videoId: string;
  title: string;
  thumbnail: string;
  vertical?: boolean;
  aspectClass?: string;
  /** start muted (default true). When false, audio plays on hover. */
  muted?: boolean;
  /** delay before iframe loads on hover, in ms */
  delay?: number;
  /** Start playing automatically without waiting for hover (default true). */
  autoPlay?: boolean;
  /** Keep playback active after touch release instead of stopping on touch end. */
  retainOnTouchRelease?: boolean;
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
  aspectClass,
  muted = true,
  delay = 0,
  autoPlay = true,
  children,
  className = "",
  onImgLoad,
  onImgError,
}: Props) => {
  const [active, setActive] = useState(autoPlay);
  const [frameReady, setFrameReady] = useState(false);
  const audioId = useId();
  const audioOwner = useSyncExternalStore(subscribeAudioFocus, getAudioFocusOwner, () => null);
  const previewOwner = useSyncExternalStore(subscribeActivePreview, getActivePreviewOwner, () => null);
  // Un autre lecteur est selectionne : celui-ci doit rester en pause.
  const preempted = previewOwner !== null && previewOwner !== audioId;
  // Securite : le son n'est autorise que sur le lecteur explicitement selectionne.
  const effectiveMuted = muted || audioOwner !== audioId;
  const selectAudio = () => {
    claimActivePreview(audioId);
    if (muted) return;
    claimAudioFocus(audioId);
  };
  useEffect(() => () => {
    releaseAudioFocus(audioId);
    releaseActivePreview(audioId);
  }, [audioId]);
  useEffect(() => {
    if (muted) releaseAudioFocus(audioId);
  }, [muted, audioId]);
  useEffect(() => {
    if (!active) releaseAudioFocus(audioId);
  }, [active, audioId]);
  const [retainOnTouchReleaseState] = useState(Boolean(autoPlay));
  const retainOnTouchRelease = retainOnTouchReleaseState ?? autoPlay;
  const knownUnavailable = getVideoStatusSync(videoId);
  const timer = useRef<number | null>(null);
  const touchTriggeredRef = useRef(false);
  // Lecture declenchee par un tap (mobile) : la rotation auto est gelee
  // tant que l'utilisateur n'a pas lui-meme arrete la lecture.
  const heldRef = useRef(false);

  const hold = () => {
    if (heldRef.current) return;
    heldRef.current = true;
    acquireTrailerLock();
  };
  const releaseHold = () => {
    if (!heldRef.current) return;
    heldRef.current = false;
    releaseTrailerLock();
  };

  useEffect(() => releaseHold, []);

  useEffect(() => {
    if (knownUnavailable && knownUnavailable !== "ok") {
      setActive(false);
      return;
    }
    if (autoPlay) setActive(true);
  }, [autoPlay, videoId, knownUnavailable]);

  const start = () => {
    if (knownUnavailable && knownUnavailable !== "ok") return;
    selectAudio();
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(true), delay);
  };
  const stop = () => {
    releaseAudioFocus(audioId);
    releaseActivePreview(audioId);
    if (heldRef.current) return; // lecture verrouillee par un tap
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setActive(false);
  };

  useEffect(() => {
    if (!active) return undefined;
    hold();
    return () => {
      if (!heldRef.current) releaseHold();
    };
  }, [active]);

  const ratio = aspectClass || (vertical ? "aspect-[9/16]" : "aspect-video");
  const playing = active && !preempted;
  if (!playing && frameReady) {
    // reset le fondu quand l'apercu s'arrete
    queueMicrotask(() => setFrameReady(false));
  }
  const iframeWrap = vertical ? "absolute inset-0 overflow-hidden pointer-events-none" : "absolute inset-0 pointer-events-none";

  return (
    <div
      className={`soft-frame relative overflow-hidden bg-white/[0.04] backdrop-blur-[2px] ${ratio} ${className}`}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      onClick={(event) => {
        // PC : un clic sur l'apercu ne doit pas arrêter la lecture.
        if (knownUnavailable && knownUnavailable !== "ok") return;
        if (event.detail === 0) return; // clavier : laisse le lien agir
        if (touchTriggeredRef.current) {
          touchTriggeredRef.current = false;
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        selectAudio();
        if (!heldRef.current) {
          setActive(true);
          hold();
        }
      }}
      onTouchStart={() => {
        if (knownUnavailable && knownUnavailable !== "ok") return;
        touchTriggeredRef.current = true;
        selectAudio();
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setActive(true), delay);
      }}
      onTouchEnd={() => {
        if (!heldRef.current) {
          if (timer.current) {
            window.clearTimeout(timer.current);
            timer.current = null;
          }
          if (!retainOnTouchRelease) {
            setActive(false);
          }
        }
        touchTriggeredRef.current = false;
      }}
      onTouchCancel={() => {
        if (!heldRef.current) {
          if (timer.current) {
            window.clearTimeout(timer.current);
            timer.current = null;
          }
          if (!retainOnTouchRelease) {
            setActive(false);
          }
        }
        touchTriggeredRef.current = false;
      }}
    >
      <img
        src={knownUnavailable && knownUnavailable !== "ok" ? siteFallbackImage(videoId, thumbnail) : thumbnail}
        alt={title}
        loading="lazy"
        decoding="async"
        onLoad={onImgLoad}
        onError={onImgError}
        className={`w-full h-full object-cover transition-all duration-500 ${active && frameReady ? "scale-[1.02] opacity-0" : "opacity-100 group-hover:scale-[1.02]"}`}
      />

      {active && (
        <div className={`${iframeWrap} bg-transparent transition-opacity duration-700 ${frameReady ? "opacity-100" : "opacity-0"}`}>
          {vertical ? (
            <iframe
              src={buildYouTubeEmbedUrl(videoId, { autoplay: true, muted: effectiveMuted, controls: false, loop: true, playlist: videoId, playsInline: true, nocookie: false })}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture"
              onLoad={() => setFrameReady(true)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-[178%] border-0"
            />
          ) : (
            <iframe
              src={buildYouTubeEmbedUrl(videoId, { autoplay: true, muted: effectiveMuted, controls: false, loop: true, playlist: videoId, playsInline: true, nocookie: false })}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture"
              onLoad={() => setFrameReady(true)}
              className="w-full h-full border-0"
            />
          )}
        </div>
      )}

      {!active && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.6)]">
            <Play className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
        </div>
      )}

      {knownUnavailable && knownUnavailable !== "ok" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_center,transparent_20%,rgba(5,10,24,0.6)_100%)] pointer-events-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[rgba(8,12,24,0.68)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/88 shadow-lg">
            <Ban className="h-3.5 w-3.5" /> <span className="notranslate">Vidéo privée</span>
          </div>
        </div>
      )}


      {children}
    </div>
  );
};
