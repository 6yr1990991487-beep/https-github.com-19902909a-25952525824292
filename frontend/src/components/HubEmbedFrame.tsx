import { useState } from "react";
import { cn } from "@/lib/utils";

type HubEmbedFrameProps = {
  src: string;
  title: string;
  description: string;
  heightClassName?: string;
  testId: string;
};

export const HubEmbedFrame = ({
  src,
  title,
  description,
  heightClassName = "h-[560px] md:h-[720px]",
  testId,
}: HubEmbedFrameProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="rounded-[32px] border border-white/12 bg-black/20 backdrop-blur-xl shadow-[0_30px_90px_-40px_rgba(20,20,40,0.75)] overflow-hidden"
      data-testid={testId}
    >
      <div className="flex flex-col gap-2 border-b border-white/10 bg-gradient-to-r from-fuchsia-500/10 via-cyan-400/10 to-transparent px-5 py-4 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia-300">Hub 3D importé</p>
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-black text-white">{title}</h2>
            <p className="text-sm text-white/65 max-w-3xl">{description}</p>
          </div>
          <span className="text-xs text-cyan-200/80">Source intégrée à l’identique</span>
        </div>
      </div>

      <div className={cn("relative w-full bg-slate-950", heightClassName)}>
        {!loaded && (
          <div
            className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_top,rgba(232,121,249,0.18),transparent_45%),linear-gradient(180deg,rgba(8,12,24,0.98),rgba(8,12,24,0.9))]"
            data-testid={`${testId}-loading`}
          >
            <div className="flex flex-col items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-fuchsia-400 animate-spin" />
              <p className="text-sm">Chargement du hub 3D…</p>
            </div>
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
