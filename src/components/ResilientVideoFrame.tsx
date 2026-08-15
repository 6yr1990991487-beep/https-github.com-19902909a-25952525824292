import { useEffect, useMemo, useRef, useState } from "react";
import { PlayCircle } from "lucide-react";
import { siteFallbackImage, siteFallbackVideo } from "@/lib/mediaFallback";
import { getVideoStatusSync, setVideoStatus } from "@/lib/videoAvailability";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import VideoExtrasControls from "@/components/VideoExtrasControls";

type ResilientVideoFrameProps = {
  videoId?: string | null;
  title: string;
  searchQuery?: string;
  poster?: string | null;
  seed: string;
  autoplay?: boolean;
  muted?: boolean;
  hideControls?: boolean;
  className?: string;
  fallbackBadge?: string;
  fallbackDescription?: string;
  dataTestId?: string;
};

export function ResilientVideoFrame({
  videoId,
  title,
  searchQuery,
  poster,
  seed,
  autoplay = true,
  muted = true,
  hideControls = true,
  className = "absolute inset-0 h-full w-full",
  fallbackBadge = "Vidéo de secours",
  fallbackDescription = "La vidéo d’origine n’est plus disponible. Un média de secours du site est affiché.",
  dataTestId,
}: ResilientVideoFrameProps) {
  const [fallbackMode, setFallbackMode] = useState(
    () => Boolean(videoId && getVideoStatusSync(videoId) && getVideoStatusSync(videoId) !== "ok") || !videoId,
  );
  const fallbackPoster = useMemo(() => siteFallbackImage(seed, poster), [poster, seed]);
  const fallbackVideo = useMemo(() => siteFallbackVideo(seed), [seed]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoId) {
      setFallbackMode(true);
      return;
    }
    const status = getVideoStatusSync(videoId);
    setFallbackMode(Boolean(status && status !== "ok"));
  }, [videoId]);

  if (!videoId || fallbackMode) {
    return (
      <div className={className} data-testid={dataTestId || "resilient-video-fallback-frame"}>
        <video
          ref={videoRef}
          src={fallbackVideo}
          poster={fallbackPoster}
          autoPlay
          loop
          muted
          playsInline
          x-webkit-airplay="allow"
          className="h-full w-full object-cover"
        />
        <VideoExtrasControls videoRef={videoRef} />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,10,24,0.82)] via-[rgba(5,10,24,0.12)] to-transparent" />
        <div className="absolute left-4 right-4 bottom-4 z-10 max-w-2xl space-y-2 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[rgba(8,12,24,0.46)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/84 backdrop-blur-xl">
            <PlayCircle className="h-3.5 w-3.5" /> {fallbackBadge}
          </div>
          <h3 className="font-display text-xl font-black sm:text-2xl">{title}</h3>
          <p className="text-sm leading-7 text-white/72">{fallbackDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <YouTubeEmbed
      videoId={videoId}
      searchQuery={searchQuery}
      title={title}
      autoplay={autoplay}
      muted={muted}
      hideControls={hideControls}
      className={className}
      onUnavailable={() => {
        setVideoStatus(videoId, "unavailable");
        setFallbackMode(true);
      }}
      onExhausted={() => {
        setVideoStatus(videoId, "hidden");
        setFallbackMode(true);
      }}
      onPlayerReady={() => {
        setVideoStatus(videoId, "ok");
      }}
    />
  );
}
