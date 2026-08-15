import { useEffect, useRef, useState, type RefObject } from "react";
import { PictureInPicture2, Cast } from "lucide-react";

type Props = {
  videoRef: RefObject<HTMLVideoElement>;
  className?: string;
};

/** Boutons Picture-in-Picture et diffusion (Cast / AirPlay) pour un <video>. */
export function VideoExtrasControls({ videoRef, className = "" }: Props) {
  const [pipReady, setPipReady] = useState(false);
  const [castReady, setCastReady] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setPipReady(
      typeof document !== "undefined" &&
        (document as Document & { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled === true &&
        typeof video.requestPictureInPicture === "function",
    );

    const remote = (video as HTMLVideoElement & { remote?: RemotePlayback }).remote;
    const hasAirplay = typeof (window as unknown as { WebKitPlaybackTargetAvailabilityEvent?: unknown })
      .WebKitPlaybackTargetAvailabilityEvent !== "undefined";
    if (remote) {
      remote
        .watchAvailability((available) => setCastReady(available))
        .then((id) => {
          watchIdRef.current = id;
        })
        .catch(() => setCastReady(hasAirplay));
    } else {
      setCastReady(hasAirplay);
    }

    return () => {
      if (remote && watchIdRef.current !== null) {
        remote.cancelWatchAvailability(watchIdRef.current).catch(() => {});
        watchIdRef.current = null;
      }
    };
  }, [videoRef]);

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      /* ignore */
    }
  };

  const startCast = async () => {
    const video = videoRef.current as (HTMLVideoElement & {
      remote?: RemotePlayback;
      webkitShowPlaybackTargetPicker?: () => void;
    }) | null;
    if (!video) return;
    try {
      if (video.remote) await video.remote.prompt();
      else video.webkitShowPlaybackTargetPicker?.();
    } catch {
      /* ignore */
    }
  };

  if (!pipReady && !castReady) return null;

  return (
    <div className={`pointer-events-auto absolute right-3 top-3 z-20 flex gap-2 ${className}`}>
      {pipReady && (
        <button
          type="button"
          onClick={togglePip}
          aria-label="Lecture en incrustation (Picture-in-Picture)"
          className="rounded-full border border-white/30 bg-background/40 p-2 text-foreground backdrop-blur-xl transition hover:bg-background/60"
        >
          <PictureInPicture2 className="h-4 w-4" />
        </button>
      )}
      {castReady && (
        <button
          type="button"
          onClick={startCast}
          aria-label="Diffuser sur un écran (Cast / AirPlay)"
          className="rounded-full border border-white/30 bg-background/40 p-2 text-foreground backdrop-blur-xl transition hover:bg-background/60"
        >
          <Cast className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default VideoExtrasControls;
