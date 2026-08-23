import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type HubEmbedFrameProps = {
  src: string;
  title: string;
  heightClassName?: string;
  testId: string;
};

export const HubEmbedFrame = ({
  src,
  title,
  heightClassName = "h-[560px] md:h-[720px]",
  testId,
}: HubEmbedFrameProps) => {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setTimedOut(false);
    const id = window.setTimeout(() => {
      setTimedOut(true);
    }, 12000);
    return () => window.clearTimeout(id);
  }, [src]);

  return (
    <div
      className="overflow-hidden bg-transparent shadow-none"
      data-testid={testId}
    >
      <div className={cn("relative w-full bg-transparent", heightClassName)}>
        {!loaded && (
          <div
            className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_top,rgba(232,121,249,0.18),transparent_45%),linear-gradient(180deg,rgba(8,12,24,0.98),rgba(8,12,24,0.9))]"
            data-testid={`${testId}-loading`}
          >
            <div className="flex flex-col items-center gap-4 px-4 text-center">
              <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-fuchsia-400 animate-spin" />
              {timedOut && (
                <a
                  href={src}
                  className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Ouvrir le Hub Ferry directement
                </a>
              )}
            </div>
          </div>
        )}

        <iframe
          src={src}
          title={title}
          loading="eager"
          allow="autoplay; fullscreen"
          className="h-full w-full border-0 bg-slate-950"
          onLoad={() => setLoaded(true)}
          data-testid={`${testId}-iframe`}
        />
      </div>
    </div>
  );
};
