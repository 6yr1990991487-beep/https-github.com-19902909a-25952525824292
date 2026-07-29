import { thumb, type Video } from "@/data/videos";
import { Link } from "react-router-dom";
import { HoverPreview } from "@/components/HoverPreview";

export const VideoCard = ({ video }: { video: Video }) => (
  <Link
    to={`/lecteurs-video?video=${video.id}`}
    className="rgb-card group block rounded-2xl overflow-hidden bg-card border border-border transition-all"
  >
    <HoverPreview videoId={video.id} title={video.title} thumbnail={thumb(video.id)}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wider text-white/90 font-semibold z-10">
        {video.channel}
      </div>
    </HoverPreview>
    <div className="p-4">
      <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {video.title}
      </h3>
      <p className="text-xs text-muted-foreground mt-2">{video.series}</p>
    </div>
  </Link>
);