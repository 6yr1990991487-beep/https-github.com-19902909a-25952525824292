import { useState } from "react";
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

  return (
    <div
      className="rounded-[32px] border border-white/12 bg-black/20 backdrop-blur-xl shadow-[0_30px_90px_-40px_rgba(20,20,40,0.75)] overflow-hidden"
      data-testid={testId}
    >
      <div className={cn("relative w-full bg-slate-950", heightClassName)}>
        {!loaded && (
          <div
            className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_top,rgba(232,121,249,0.18),transparent_45%),linear-gradient(180deg,rgba(8,12,24,0.98),rgba(8,12,24,0.9))]"
            data-testid={`${testId}-loading`}
          >
            <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-fuchsia-400 animate-spin" />
          </div>
        )}

        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="autoplay; fullscreen"
          className="h-full w-full border-0 bg-slate-950"
          onLoad={() => setLoaded(true)}
          data-testid={`${testId}-iframe`}
        />
      </div>
    </div>
  );
};
