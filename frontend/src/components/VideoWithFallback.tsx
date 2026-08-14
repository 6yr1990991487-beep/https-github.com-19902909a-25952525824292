import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { siteFallbackVideo } from "@/lib/mediaFallback";

type VideoWithFallbackProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  seed?: string;
  fallbacks?: string[];
};

const VideoWithFallback = forwardRef<HTMLVideoElement, VideoWithFallbackProps>(
  ({ src, seed, fallbacks = [], onError, ...props }, ref) => {
    const sources = useMemo(() => {
      const list = [String(src)];
      fallbacks.forEach((fallback) => {
        const fallbackSrc = String(fallback);
        if (fallbackSrc && !list.includes(fallbackSrc)) {
          list.push(fallbackSrc);
        }
      });
      try {
        const fb = siteFallbackVideo(seed || String(src));
        if (fb && !list.includes(fb)) list.push(fb);
      } catch {}
      if (!list.includes("/banner-top.mp4")) list.push("/banner-top.mp4");
      return list;
    }, [src, seed, JSON.stringify(fallbacks)]);

    const [index, setIndex] = useState(0);
    useEffect(() => {
      setIndex(0);
    }, [JSON.stringify(sources)]);

    const current = sources[index] || sources[0];

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      if (onError) {
        try {
          onError(e);
        } catch {}
      }
      if (index < sources.length - 1) {
        setIndex((i) => i + 1);
      }
    };

    return <video ref={ref} {...props} src={current} onError={handleError} />;
  },
);

VideoWithFallback.displayName = "VideoWithFallback";
export default VideoWithFallback;
