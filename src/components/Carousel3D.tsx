import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Play } from "lucide-react";

type AnyItem = Record<string, any>;

const itemImage = (item: AnyItem) =>
  item?.coverImage?.extraLarge ||
  item?.coverImage?.large ||
  item?.cover ||
  item?.image ||
  item?.thumbnail ||
  item?.bannerImage ||
  item?.banner ||
  "";

const itemTitle = (item: AnyItem) =>
  (typeof item?.title === "string" ? item.title : null) ||
  item?.title?.userPreferred ||
  item?.title?.english ||
  item?.title?.romaji ||
  item?.name ||
  "Sans titre";

/**
 * 3D carousel rendering real poster/video cards (HTML in 3D space).
 * Using <Html transform> avoids WebGL texture CORS/rate-limit issues that
 * previously left the carousel showing blank plates.
 */
export const Carousel3D = ({ items = [], onSelect, activeId }: { items: AnyItem[]; onSelect?: (item: AnyItem) => void; activeId?: any }) => {
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState<any>(null);

  const count = Math.max(items.length, 1);
  const radius = Math.max(5, count * 0.42);
  const angleStep = (Math.PI * 2) / count;

  useFrame((_state, delta) => {
    if (groupRef.current && hovered === null) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -radius + 2]}>
      {items.map((item, i) => {
        const angle = i * angleStep;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const isHovered = hovered === item.id;
        const isActive = activeId != null && activeId === item.id;
        const image = itemImage(item);
        const title = itemTitle(item);

        return (
          <group key={item.id ?? i} position={[x, isActive ? 0.4 : 0, z]} rotation={[0, angle, 0]}>
            <Html
              transform
              distanceFactor={6}
              occlude={false}
              zIndexRange={[10, 0]}
              style={{ pointerEvents: "auto" }}
            >
              <div
                role="button"
                tabIndex={0}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect?.(item)}
                onKeyDown={(e) => { if (e.key === "Enter") onSelect?.(item); }}
                style={{ width: 200, height: 300 }}
                className={[
                  "group relative cursor-pointer overflow-hidden rounded-2xl border bg-[#0b1020] shadow-2xl transition-transform duration-300",
                  isActive
                    ? "border-amber-300/80 ring-2 ring-amber-300/60 scale-[1.04]"
                    : isHovered
                      ? "border-sky-300/70 ring-2 ring-sky-300/50 scale-[1.03]"
                      : "border-white/15",
                ].join(" ")}
              >
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white/50 text-xs">
                    {title}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
                  <p className="truncate text-[13px] font-bold text-white drop-shadow">{title}</p>
                  {isActive && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                      <Play className="h-3 w-3" /> En cours
                    </span>
                  )}
                </div>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40">
                    <Play className="h-5 w-5 text-white" />
                  </span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

export default Carousel3D;
