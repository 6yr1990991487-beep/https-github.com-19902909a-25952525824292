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
      className="overflow-hidden bg-transparent shadow-none"
      data-testid={testId}
    >
      <div className={cn("relative w-full bg-transparent", heightClassName)}>
        {!loaded && (
          <div
            className="absolute inset-0 grid place-items-center bg-black"
            data-testid={`${testId}-loading`}
          >
            <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-fuchsia-400 animate-spin" />
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
