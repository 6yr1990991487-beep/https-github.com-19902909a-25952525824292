import { useMemo, useState } from "react";
import type { VideoHTMLAttributes } from "react";

type VideoWithFallbackProps = VideoHTMLAttributes<HTMLVideoElement> & {
  seed?: string;
};

const FALLBACKS = [
  "linear-gradient(135deg, rgba(56,189,248,0.35), rgba(15,23,42,0.9))",
  "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(15,23,42,0.92))",
  "linear-gradient(135deg, rgba(34,197,94,0.28), rgba(15,23,42,0.9))",
  "linear-gradient(135deg, rgba(245,158,11,0.32), rgba(15,23,42,0.92))",
];

const pickFallback = (seed?: string) => {
  if (!seed) return FALLBACKS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return FALLBACKS[hash % FALLBACKS.length];
};

export default function VideoWithFallback({
  seed,
  className,
  onError,
  children,
  ...props
}: VideoWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const fallbackBg = useMemo(() => pickFallback(seed), [seed]);

  if (failed) {
    return (
      <div
        className={className}
        style={{
          background: fallbackBg,
          display: "block",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <video
      {...props}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    >
      {children}
    </video>
  );
}
