import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Carousel3D } from "@/components/Carousel3D";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  items: any[];
  onSelect?: (item: any) => void;
  activeId?: any;
  className?: string;
  hint?: string;
};

/** Reusable 3D carousel block (canvas + controls + frame). */
export const Carousel3DSection = ({ items, onSelect, activeId, className = "", hint = "Faites glisser pour tourner" }: Props) => {
  if (!items?.length) return null;
  return (
    <div className={`relative w-full h-[520px] sm:h-[600px] rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 ${className}`} data-testid="carousel-3d-section">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.1),transparent)]" />
      <ErrorBoundary fallback={<div className="flex h-full items-center justify-center text-white/70">Impossible de charger la 3D.</div>}>
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Suspense fallback={null}>
            <Carousel3D items={items} onSelect={onSelect} activeId={activeId} />
          </Suspense>
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2.5} />
        </Canvas>
      </ErrorBoundary>
      <div className="absolute top-4 left-4 text-xs text-white/60 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 pointer-events-none">{hint}</div>
    </div>
  );
};

export default Carousel3DSection;
