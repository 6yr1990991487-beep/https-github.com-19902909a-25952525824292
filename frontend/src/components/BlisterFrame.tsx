import type { CSSProperties } from "react";

/**
 * Glossy transparent "blister-pack" overlay for cards.
 * Renders a beveled clear-plastic frame + diagonal sheen + inner reflections.
 * pointer-events-none so it never blocks clicks on the card it wraps.
 */
export function BlisterFrame({
  radius = 12,
  intensity = 1,
  style,
}: {
  /** Border-radius in px, should match parent card. */
  radius?: number;
  /** 0..1.2 — scales sheen/highlight opacity for smaller vs. larger cards. */
  intensity?: number;
  style?: CSSProperties;
}) {
  const r = `${radius}px`;
  const a = Math.max(0, Math.min(1.2, intensity));
  return (
    <>
      {/* Diagonal sheen — the wide gloss streak across the front of the blister */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: r,
          background: `linear-gradient(125deg,
            hsla(0,0%,100%,${0.55 * a}) 0%,
            hsla(0,0%,100%,${0.18 * a}) 18%,
            hsla(0,0%,100%,0) 42%,
            hsla(0,0%,100%,0) 60%,
            hsla(0,0%,100%,${0.10 * a}) 82%,
            hsla(0,0%,100%,${0.28 * a}) 100%)`,
          mixBlendMode: "screen",
          ...style,
        }}
      />
      {/* Top-left crescent highlight — the bright plastic curve */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: r,
          background: `radial-gradient(140% 90% at 8% 0%,
            hsla(0,0%,100%,${0.55 * a}) 0%,
            hsla(0,0%,100%,${0.14 * a}) 22%,
            hsla(0,0%,100%,0) 45%)`,
        }}
      />
      {/* Bottom soft reflection — completes the "under glass" feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: r,
          background: `radial-gradient(120% 60% at 90% 100%,
            hsla(200,90%,80%,${0.22 * a}) 0%,
            hsla(0,0%,100%,0) 55%)`,
        }}
      />
      {/* Beveled clear-plastic frame — double inset ring for a 3D lip */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: r,
          boxShadow: [
            `inset 0 1px 0 hsla(0,0%,100%,${0.75 * a})`,
            `inset 0 -1px 2px hsla(0,0%,100%,${0.35 * a})`,
            `inset 0 0 0 1px hsla(0,0%,100%,${0.22 * a})`,
            `inset 0 0 18px hsla(0,0%,100%,${0.10 * a})`,
            `0 6px 22px hsla(210,80%,60%,${0.18 * a})`,
          ].join(","),
        }}
      />
      {/* Corner glint dots — small specular highlights */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: 4,
          left: 6,
          width: 10,
          height: 10,
          borderRadius: 999,
          background: `radial-gradient(circle, hsla(0,0%,100%,${0.9 * a}) 0%, hsla(0,0%,100%,0) 70%)`,
          filter: "blur(0.5px)",
        }}
      />
    </>
  );
}

export default BlisterFrame;