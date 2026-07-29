import { Suspense, useEffect, useMemo, useRef, useState, useCallback, type CSSProperties } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

/**
 * Fullscreen holographic overlay: animated humanoids + procedural objects
 * (house, pool, garden, city, motorcycle, fountain, mountain, boat, yacht,
 * speaker...). Click a hologram to trigger a particle burst + animation swap.
 */

type GlbDef = {
  url: string;
  kind: "robot" | "soldier" | "human";
  scale: number;
  y: number;
  facing: number;
  loco: { walk?: string; run?: string; idle: string; dance?: string; wave?: string; jump?: string };
  extra: string[];
};

const GLBS: GlbDef[] = [
  {
    url: "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
    kind: "robot",
    scale: 0.35,
    y: -1.25,
    facing: -Math.PI / 2,
    loco: { walk: "Walking", run: "Running", idle: "Idle", dance: "Dance", wave: "Wave", jump: "Jump" },
    extra: ["Yes", "No", "Punch", "ThumbsUp"],
  },
  {
    url: "https://threejs.org/examples/models/gltf/Soldier.glb",
    kind: "soldier",
    scale: 0.6,
    y: -1.35,
    facing: Math.PI / 2,
    loco: { walk: "Walk", run: "Run", idle: "Idle" },
    extra: [],
  },
  {
    url: "https://threejs.org/examples/models/gltf/Xbot.glb",
    kind: "human",
    scale: 0.55,
    y: -1.35,
    facing: Math.PI / 2,
    loco: { idle: "idle" },
    extra: [],
  },
];

if (typeof window !== "undefined") {
  GLBS.forEach((m) => useGLTF.preload(m.url));
}

const TINTS = [
  "#22d3ee", "#f472b6", "#a78bfa", "#34d399", "#fbbf24",
  "#60a5fa", "#fb7185", "#ffffff", "#e879f9", "#fde047",
  "#4ade80", "#f87171", "#38bdf8", "#c084fc",
];

const holoMat = (tint: string, opacity = 0.7, wireframe = true) =>
  new THREE.MeshBasicMaterial({
    color: new THREE.Color(tint),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    wireframe,
  });

const addMesh = (
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  tint: string,
  pos: [number, number, number],
  rot: [number, number, number] = [0, 0, 0]
) => {
  const m = new THREE.Mesh(geo, holoMat(tint));
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.renderOrder = 10000;
  parent.add(m);
  return m;
};

const OBJECT_BUILDERS = {
  house: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.BoxGeometry(2, 1.3, 1.6), tint, [0, 0, 0]);
    addMesh(g, new THREE.ConeGeometry(1.5, 1, 4), tint, [0, 1.15, 0], [0, Math.PI / 4, 0]);
    addMesh(g, new THREE.BoxGeometry(0.35, 0.6, 0.05), tint, [0, -0.35, 0.83]);
    return g;
  },
  pool: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.BoxGeometry(3, 0.1, 1.6), tint, [0, 0, 0]);
    addMesh(g, new THREE.PlaneGeometry(2.8, 1.4), tint, [0, 0.06, 0], [-Math.PI / 2, 0, 0]);
    return g;
  },
  garden: (tint: string) => {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.5;
      addMesh(g, new THREE.ConeGeometry(0.25, 0.9, 8), tint, [x, 0.1, 0]);
      addMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), tint, [x, -0.35, 0]);
    }
    return g;
  },
  city: (tint: string) => {
    const g = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const h = 0.6 + Math.random() * 2.4;
      addMesh(g, new THREE.BoxGeometry(0.5, h, 0.5), tint, [(i - 3.5) * 0.55, h / 2 - 1, 0]);
    }
    return g;
  },
  motorcycle: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.TorusGeometry(0.35, 0.08, 8, 16), tint, [-0.7, -0.35, 0], [0, Math.PI / 2, 0]);
    addMesh(g, new THREE.TorusGeometry(0.35, 0.08, 8, 16), tint, [0.7, -0.35, 0], [0, Math.PI / 2, 0]);
    addMesh(g, new THREE.BoxGeometry(1.3, 0.25, 0.2), tint, [0, 0, 0]);
    addMesh(g, new THREE.BoxGeometry(0.25, 0.4, 0.15), tint, [0.55, 0.25, 0]);
    return g;
  },
  fountain: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.CylinderGeometry(1, 1.1, 0.3, 24), tint, [0, -0.5, 0]);
    addMesh(g, new THREE.CylinderGeometry(0.5, 0.6, 0.25, 20), tint, [0, -0.1, 0]);
    addMesh(g, new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), tint, [0, 0.5, 0]);
    return g;
  },
  mountain: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.ConeGeometry(1.6, 2.4, 5), tint, [0, 0.2, 0]);
    addMesh(g, new THREE.ConeGeometry(1.1, 1.7, 5), tint, [-1.3, -0.15, 0.2]);
    return g;
  },
  boat: (tint: string) => {
    const g = new THREE.Group();
    const hull = new THREE.Mesh(
      new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      holoMat(tint)
    );
    hull.scale.set(1.6, 0.5, 0.7);
    hull.renderOrder = 10000;
    g.add(hull);
    addMesh(g, new THREE.BoxGeometry(0.8, 0.4, 0.5), tint, [0, 0.2, 0]);
    addMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6), tint, [0, 0.9, 0]);
    return g;
  },
  yacht: (tint: string) => {
    const g = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 1), holoMat(tint));
    hull.position.y = -0.3;
    hull.renderOrder = 10000;
    g.add(hull);
    addMesh(g, new THREE.BoxGeometry(1.6, 0.5, 0.8), tint, [0.1, 0.05, 0]);
    addMesh(g, new THREE.BoxGeometry(0.9, 0.4, 0.7), tint, [0.2, 0.45, 0]);
    addMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6), tint, [-0.3, 1.1, 0]);
    return g;
  },
  speaker: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.BoxGeometry(0.9, 1.6, 0.7), tint, [0, 0, 0]);
    addMesh(g, new THREE.CircleGeometry(0.28, 20), tint, [0, 0.35, 0.36]);
    addMesh(g, new THREE.CircleGeometry(0.18, 20), tint, [0, -0.3, 0.36]);
    return g;
  },
  dog: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.BoxGeometry(1.1, 0.45, 0.4), tint, [0, 0, 0]);
    addMesh(g, new THREE.BoxGeometry(0.4, 0.4, 0.35), tint, [0.62, 0.22, 0]);
    addMesh(g, new THREE.ConeGeometry(0.09, 0.2, 4), tint, [0.72, 0.5, 0.1]);
    addMesh(g, new THREE.ConeGeometry(0.09, 0.2, 4), tint, [0.72, 0.5, -0.1]);
    for (const x of [-0.35, 0.35]) for (const z of [-0.15, 0.15])
      addMesh(g, new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6), tint, [x, -0.32, z]);
    addMesh(g, new THREE.CylinderGeometry(0.05, 0.02, 0.5, 6), tint, [-0.65, 0.15, 0], [0, 0, Math.PI / 3]);
    return g;
  },
  cat: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.BoxGeometry(0.85, 0.35, 0.35), tint, [0, 0, 0]);
    addMesh(g, new THREE.SphereGeometry(0.24, 10, 8), tint, [0.5, 0.22, 0]);
    addMesh(g, new THREE.ConeGeometry(0.09, 0.22, 3), tint, [0.6, 0.48, 0.08]);
    addMesh(g, new THREE.ConeGeometry(0.09, 0.22, 3), tint, [0.6, 0.48, -0.08]);
    for (const x of [-0.28, 0.28]) for (const z of [-0.12, 0.12])
      addMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.32, 6), tint, [x, -0.27, z]);
    addMesh(g, new THREE.CylinderGeometry(0.04, 0.02, 0.7, 6), tint, [-0.55, 0.1, 0], [0, 0, Math.PI / 4]);
    return g;
  },
  bird: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.SphereGeometry(0.28, 12, 10), tint, [0, 0, 0]);
    addMesh(g, new THREE.SphereGeometry(0.18, 10, 8), tint, [0.28, 0.18, 0]);
    addMesh(g, new THREE.ConeGeometry(0.06, 0.18, 4), tint, [0.45, 0.18, 0], [0, 0, -Math.PI / 2]);
    addMesh(g, new THREE.PlaneGeometry(0.55, 0.25), tint, [0, 0.05, 0.18], [0, 0, Math.PI / 8]);
    addMesh(g, new THREE.PlaneGeometry(0.55, 0.25), tint, [0, 0.05, -0.18], [0, 0, -Math.PI / 8]);
    return g;
  },
  horse: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.BoxGeometry(1.3, 0.55, 0.45), tint, [0, 0, 0]);
    addMesh(g, new THREE.BoxGeometry(0.35, 0.55, 0.4), tint, [0.75, 0.35, 0]);
    addMesh(g, new THREE.BoxGeometry(0.2, 0.55, 0.3), tint, [0.8, 0.75, 0]);
    for (const x of [-0.45, 0.45]) for (const z of [-0.18, 0.18])
      addMesh(g, new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6), tint, [x, -0.5, z]);
    return g;
  },
  dolphin: (tint: string) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), holoMat(tint));
    body.scale.set(1.8, 0.6, 0.6); body.renderOrder = 10000; g.add(body);
    addMesh(g, new THREE.ConeGeometry(0.15, 0.35, 6), tint, [-0.85, 0, 0], [0, 0, Math.PI / 2]);
    addMesh(g, new THREE.ConeGeometry(0.18, 0.35, 4), tint, [0.2, 0.3, 0], [Math.PI, 0, 0]);
    return g;
  },
  drone: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.BoxGeometry(0.5, 0.14, 0.5), tint, [0, 0, 0]);
    for (const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) {
      addMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4), tint, [x, 0.1, z]);
      addMesh(g, new THREE.TorusGeometry(0.18, 0.02, 4, 12), tint, [x, 0.28, z], [Math.PI / 2, 0, 0]);
    }
    return g;
  },
  rocket: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.CylinderGeometry(0.28, 0.28, 1.4, 12), tint, [0, 0, 0]);
    addMesh(g, new THREE.ConeGeometry(0.28, 0.55, 12), tint, [0, 0.95, 0]);
    addMesh(g, new THREE.ConeGeometry(0.18, 0.35, 3), tint, [0.35, -0.55, 0]);
    addMesh(g, new THREE.ConeGeometry(0.18, 0.35, 3), tint, [-0.35, -0.55, 0]);
    addMesh(g, new THREE.ConeGeometry(0.28, 0.5, 12), tint, [0, -0.95, 0], [Math.PI, 0, 0]);
    return g;
  },
  crystal: (tint: string) => {
    const g = new THREE.Group();
    addMesh(g, new THREE.OctahedronGeometry(0.6, 0), tint, [0, 0, 0]);
    addMesh(g, new THREE.OctahedronGeometry(0.28, 0), tint, [0.55, -0.3, 0]);
    addMesh(g, new THREE.OctahedronGeometry(0.35, 0), tint, [-0.5, -0.25, 0.2]);
    return g;
  },
};

type ObjectKey = keyof typeof OBJECT_BUILDERS;

type Variant = {
  id: string;
  category: "human" | "object";
  label: string;
  buildKey?: ObjectKey;
  glbIndex?: number;
  tint: string;
  scaleMul: number;
  preferredAction?: PreferredAction;
};

type PreferredAction =
  | "dance" | "walk" | "run" | "idle" | "wave" | "jump"
  | "salute" | "greet" | "pushup" | "yes" | "no" | "thumbsup"
  | "punch" | "kick" | "sit" | "stand" | "sport";

const buildVariants = (): Variant[] => {
  const out: Variant[] = [];
  // 100 humanoid personas across three GLBs (robot / soldier / human).
  // Each has a preferred gesture drawn from a rich set: greeting, salute,
  // dance, run, jump, thumbs-up, boxing, kick, pushups, sit/stand… giving
  // Google-visible variety while the strict concurrency cap (2 humans + 1
  // object) keeps the stage uncluttered.
  const PERSONAS: Array<[string, number, PreferredAction]> = [
    ["greeter",   0, "greet"],   ["saluter",   0, "salute"],
    ["dancer",    0, "dance"],   ["runner",    1, "run"],
    ["walker",    1, "walk"],    ["sprinter",  1, "run"],
    ["boxer",     0, "punch"],   ["karateka",  0, "kick"],
    ["yogi",      2, "idle"],    ["thinker",   2, "sit"],
    ["athlete",   1, "sport"],   ["footballer",1, "kick"],
    ["basketballer",0, "jump"],  ["skater",    1, "walk"],
    ["breakdancer",0,"dance"],   ["ninja",     0, "jump"],
    ["samurai",   1, "punch"],   ["hero",      0, "salute"],
    ["worker",    1, "walk"],    ["engineer",  0, "thumbsup"],
    ["gardener",  1, "walk"],    ["chef",      0, "wave"],
    ["magician",  0, "wave"],    ["dj",        0, "dance"],
    ["singer",    0, "wave"],    ["conductor", 0, "wave"],
    ["artist",    0, "wave"],    ["scientist", 2, "idle"],
    ["astronaut", 0, "wave"],    ["pilot",     1, "salute"],
    ["captain",   1, "salute"],  ["officer",   1, "salute"],
    ["guardian",  1, "idle"],    ["cyborg",    0, "punch"],
    ["android",   0, "yes"],     ["mech",      0, "punch"],
    ["gamer",     0, "thumbsup"],["gymnast",   0, "jump"],
    ["marathoner",1, "run"],     ["hiker",     1, "walk"],
    ["climber",   0, "jump"],    ["surfer",    0, "dance"],
    ["swimmer",   2, "idle"],    ["cyclist",   1, "walk"],
    ["rollerblader",1,"run"],    ["fencer",    0, "punch"],
    ["archer",    0, "punch"],   ["bowler",    0, "throw"] as any,
    ["golfer",    1, "idle"],    ["photographer",0,"wave"],
    ["reporter",  0, "wave"],    ["dancer2",   0, "dance"],
    ["performer", 0, "dance"],   ["acrobat",   0, "jump"],
    ["clown",     0, "wave"],    ["mime",      2, "idle"],
    ["priest",    2, "idle"],    ["monk",      2, "idle"],
    ["teacher",   0, "wave"],    ["student",   1, "walk"],
    ["doctor",    0, "wave"],    ["nurse",     0, "wave"],
    ["firefighter",1,"salute"],  ["police",    1, "salute"],
    ["explorer",  1, "walk"],    ["diver",     0, "idle"],
    ["mountaineer",1,"walk"],    ["driver",    1, "idle"],
    ["rider",     1, "walk"],    ["cowboy",    1, "salute"],
    ["knight",    1, "punch"],   ["wizard",    0, "wave"],
    ["princess",  0, "wave"],    ["prince",    0, "salute"],
    ["dj2",       0, "dance"],   ["breaker",   0, "dance"],
    ["popper",    0, "dance"],   ["locker",    0, "dance"],
    ["hiphop",    0, "dance"],   ["ballerina", 0, "dance"],
    ["fitness",   0, "pushup"],  ["coach",     1, "salute"],
    ["trainer",   0, "pushup"],  ["bodybuilder",0,"punch"],
    ["yogini",    2, "idle"],    ["meditator", 2, "idle"],
    ["gpsrunner", 1, "run"],     ["parkour",   0, "jump"],
    ["skater2",   1, "walk"],    ["biker",     1, "walk"],
    ["driver2",   1, "idle"],    ["racer",     1, "run"],
    ["mascot",    0, "wave"],    ["celebrity", 0, "wave"],
    ["influencer",0, "thumbsup"],["streamer",  0, "thumbsup"],
    ["speaker",   0, "wave"],    ["host",      0, "wave"],
    ["greeter2",  0, "greet"],   ["salute2",   1, "salute"],
    ["dancer3",   0, "dance"],   ["jumper",    0, "jump"],
    ["thumbs",    0, "thumbsup"],["nodder",    0, "yes"],
    ["shaker",    0, "no"],      ["robotdance",0, "dance"],
  ];
  PERSONAS.slice(0, 100).forEach(([label, glbIndex, action], i) => {
    out.push({
      id: `${label}-${i}`,
      category: "human",
      label,
      glbIndex: glbIndex % GLBS.length,
      tint: TINTS[i % TINTS.length],
      scaleMul: 0.6 + ((i * 37) % 30) / 100,
      preferredAction: action,
    });
  });
  (Object.keys(OBJECT_BUILDERS) as ObjectKey[]).forEach((key) => {
    for (let k = 0; k < 3; k++) {
      out.push({
        id: `${key}-${k}`,
        category: "object",
        label: key,
        buildKey: key,
        tint: TINTS[(key.length + k) % TINTS.length],
        // Objets/bâtiments légèrement plus petits que les humanoïdes.
        scaleMul: 0.55 + Math.random() * 0.2,
      });
    }
  });
  return out;
};

type Spawn = {
  id: number;
  variant: Variant;
  dir: 1 | -1;
  x: number;
  y: number;
  z: number;
  scale: number;
  action: string;
  speed: number;
  spin: number;
  bornAt: number;
};

const VARIANTS = buildVariants();
let uid = 1;

const pickAction = (v: Variant): { action: string; speed: number; spin: number } => {
  if (v.category === "object") {
    return { action: "idle", speed: 0, spin: (Math.random() - 0.5) * 0.4 };
  }
  const p = v.preferredAction ?? "idle";
  // Map extended gestures → base clip name (see GlbDef.loco + .extra).
  switch (p) {
    case "run":      return { action: "run", speed: 2.1, spin: 0 };
    case "sport":    return { action: "run", speed: 1.7, spin: 0 };
    case "walk":     return { action: "walk", speed: 1.1, spin: 0 };
    case "dance":    return { action: "dance", speed: 0, spin: 0 };
    case "jump":     return { action: "jump", speed: 0, spin: 0 };
    case "punch":    return { action: "punch", speed: 0, spin: 0 };
    case "kick":     return { action: "jump", speed: 0, spin: 0.3 };
    case "pushup":   return { action: "jump", speed: 0, spin: 0 };
    case "salute":
    case "greet":
    case "wave":     return { action: "wave", speed: 0, spin: 0 };
    case "yes":      return { action: "yes", speed: 0, spin: 0 };
    case "no":       return { action: "no", speed: 0, spin: 0 };
    case "thumbsup": return { action: "thumbsup", speed: 0, spin: 0 };
    case "sit":      return { action: "sitting", speed: 0, spin: 0 };
    case "stand":    return { action: "standing", speed: 0, spin: 0 };
    default:         return { action: "idle", speed: 0, spin: (Math.random() - 0.5) * 0.3 };
  }
};

const spawnOne = (): Spawn => {
  const v = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
  const { action, speed, spin } = pickAction(v);
  const glb = v.glbIndex != null ? GLBS[v.glbIndex] : null;
  const baseY = glb ? glb.y : -0.6;
  const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const stationary = speed === 0;
  return {
    id: uid++,
    variant: v,
    dir,
    x: stationary ? (Math.random() - 0.5) * 8 : dir === 1 ? -8.5 : 8.5,
    y: baseY + Math.random() * 0.25,
    z: -1.4 + Math.random() * 2.6,
    scale: (glb ? glb.scale : 0.7) * v.scaleMul,
    action,
    speed,
    spin,
    bornAt: performance.now(),
  };
};

type Burst = { id: number; pos: THREE.Vector3; color: string; bornAt: number };

const CaptureSofa = () => {
  const holoWire = (color: string, opacity = 0.9) => (
    <meshBasicMaterial
      color={color}
      wireframe
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  );
  const holoGlow = (color: string, opacity = 0.22) => (
    <meshBasicMaterial
      color={color}
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  );
  const Part = ({
    position,
    args,
    color,
    kind = "box",
  }: {
    position: [number, number, number];
    args: any;
    color: string;
    kind?: "box" | "cyl";
  }) => (
    <group position={position}>
      <mesh renderOrder={10000}>
        {kind === "box" ? <boxGeometry args={args} /> : <cylinderGeometry args={args} />}
        {holoWire(color)}
      </mesh>
      <mesh renderOrder={9999} scale={1.05}>
        {kind === "box" ? <boxGeometry args={args} /> : <cylinderGeometry args={args} />}
        {holoGlow(color)}
      </mesh>
    </group>
  );
  return (
    <group position={[0, -0.15, 0]} rotation={[0, 0.28, 0]} scale={1.15}>
      <Part position={[0, -0.25, 0]} args={[3.9, 0.62, 1.25]} color="#3b82f6" />
      <Part position={[0, 0.45, -0.42]} args={[3.9, 1.05, 0.34]} color="#60a5fa" />
      {[-1.85, 1.85].map((x) => (
        <Part key={x} position={[x, 0.1, 0]} args={[0.36, 0.78, 1.25]} color="#60a5fa" />
      ))}
      {[-1.15, 0, 1.15].map((x) => (
        <Part key={x} position={[x, 0.15, 0.2]} args={[1.02, 0.36, 0.88]} color="#38bdf8" />
      ))}
      {[[-1.65, -0.45], [1.65, -0.45], [-1.65, 0.45], [1.65, 0.45]].map(([x, z], i) => (
        <Part key={i} position={[x, -0.68, z]} args={[0.06, 0.06, 0.22, 10]} color="#22d3ee" kind="cyl" />
      ))}
    </group>
  );
};


const FixedCaptureFurniture = ({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) => {
  return <SofaZone hidden={hidden} onToggle={onToggle} />;
};

type MorphArch =
  | "robot" | "mech" | "cyborg"
  | "dragonIce" | "dragonFire" | "kraken"
  | "phoenix" | "eagle" | "angel"
  | "orbGuardian" | "ghost"
  | "crystalKnight" | "wizard" | "alienGrey" | "demon" | "samurai" | "ninjaShade" | "unicornStar"
  | "wolf" | "tigerCyber";
type MorphMotion = "spin" | "bob" | "pulse" | "wave" | "shake";

const MORPH_ARCHES: MorphArch[] = [
  // Uniquement les archétypes présents sur les captures fournies :
  // sphère/orb à anneaux et cristal/octaèdre.
  "orbGuardian","ghost","crystalKnight","unicornStar",
];
const MORPH_MOTIONS: MorphMotion[] = ["spin","bob","pulse","wave","shake"];
const MORPH_COLORS = [
  "#22d3ee","#60a5fa","#a78bfa","#f472b6","#34d399",
  "#fbbf24","#f87171","#e879f9","#38bdf8","#fde047",
];

type MorphSpec = { arch: MorphArch; motion: MorphMotion; color: string; label: string };
const MORPH_SPECS: MorphSpec[] = (() => {
  const arr: MorphSpec[] = [];
  MORPH_ARCHES.forEach((a, ai) =>
    MORPH_MOTIONS.forEach((m, mi) => {
      arr.push({
        arch: a,
        motion: m,
        color: MORPH_COLORS[(ai * 5 + mi) % MORPH_COLORS.length],
        label: `${a}·${m}`,
      });
    })
  );
  return arr; // 20 × 5 = 100
})();

const buildMorph = (spec: MorphSpec): THREE.Group => {
  const g = new THREE.Group();
  const color = spec.color;
  const add = (
    geo: THREE.BufferGeometry,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0],
    s = 1
  ) => {
    const wire = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    wire.position.set(...pos);
    wire.rotation.set(...rot);
    wire.scale.setScalar(s);
    wire.renderOrder = 10000;
    g.add(wire);
    const glow = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    glow.position.set(...pos);
    glow.rotation.set(...rot);
    glow.scale.setScalar(s * 1.08);
    glow.renderOrder = 9999;
    g.add(glow);
  };
  switch (spec.arch) {
    case "robot":
    case "mech":
    case "cyborg": {
      add(new THREE.BoxGeometry(1, 1.5, 0.6), [0, 0.2, 0]);
      add(new THREE.BoxGeometry(0.8, 0.7, 0.6), [0, 1.2, 0]);
      add(new THREE.SphereGeometry(0.12, 8, 6), [0.2, 1.3, 0.3]);
      add(new THREE.SphereGeometry(0.12, 8, 6), [-0.2, 1.3, 0.3]);
      add(new THREE.CylinderGeometry(0.12, 0.12, 1, 8), [-0.75, 0.1, 0]);
      add(new THREE.CylinderGeometry(0.12, 0.12, 1, 8), [0.75, 0.1, 0]);
      add(new THREE.CylinderGeometry(0.16, 0.16, 1, 8), [-0.3, -1, 0]);
      add(new THREE.CylinderGeometry(0.16, 0.16, 1, 8), [0.3, -1, 0]);
      break;
    }
    case "dragonIce":
    case "dragonFire":
    case "kraken": {
      add(new THREE.CylinderGeometry(0.45, 0.2, 2.4, 8), [0, 0, 0], [0, 0, Math.PI / 2]);
      add(new THREE.SphereGeometry(0.5, 10, 8), [1.25, 0.15, 0]);
      add(new THREE.ConeGeometry(0.12, 0.3, 4), [1.55, 0.5, 0.15]);
      add(new THREE.ConeGeometry(0.12, 0.3, 4), [1.55, 0.5, -0.15]);
      add(new THREE.PlaneGeometry(1.5, 0.9), [0, 0.5, 0.35], [0, 0, Math.PI / 8]);
      add(new THREE.PlaneGeometry(1.5, 0.9), [0, 0.5, -0.35], [0, 0, -Math.PI / 8]);
      add(new THREE.ConeGeometry(0.2, 1, 6), [-1.55, 0, 0], [0, 0, Math.PI / 2]);
      break;
    }
    case "phoenix":
    case "eagle":
    case "angel": {
      add(new THREE.SphereGeometry(0.5, 12, 10), [0, 0.5, 0]);
      add(new THREE.PlaneGeometry(2.4, 1.1), [0, 0.5, 0]);
      add(new THREE.ConeGeometry(0.28, 1.1, 6), [0, -0.4, 0], [Math.PI, 0, 0]);
      add(new THREE.ConeGeometry(0.1, 0.3, 4), [0.35, 0.7, 0.3]);
      add(new THREE.ConeGeometry(0.1, 0.3, 4), [-0.35, 0.7, 0.3]);
      break;
    }
    case "orbGuardian":
    case "ghost": {
      add(new THREE.SphereGeometry(0.9, 20, 16), [0, 0.2, 0]);
      add(new THREE.TorusGeometry(1.15, 0.05, 6, 32), [0, 0.2, 0], [Math.PI / 2, 0, 0]);
      add(new THREE.TorusGeometry(1.15, 0.05, 6, 32), [0, 0.2, 0], [0, Math.PI / 2, 0]);
      add(new THREE.TorusGeometry(1.35, 0.03, 6, 32), [0, 0.2, 0], [Math.PI / 3, 0, 0]);
      break;
    }
    case "crystalKnight":
    case "wizard":
    case "alienGrey":
    case "demon":
    case "samurai":
    case "ninjaShade":
    case "unicornStar": {
      add(new THREE.OctahedronGeometry(0.7, 0), [0, 0.55, 0]);
      add(new THREE.ConeGeometry(0.45, 1.3, 6), [0, -0.4, 0], [Math.PI, 0, 0]);
      add(new THREE.OctahedronGeometry(0.25, 0), [0.6, 0.35, 0]);
      add(new THREE.OctahedronGeometry(0.25, 0), [-0.6, 0.35, 0]);
      add(new THREE.ConeGeometry(0.08, 0.6, 6), [0, 1.35, 0]);
      break;
    }
    case "wolf":
    case "tigerCyber": {
      add(new THREE.BoxGeometry(1.5, 0.6, 0.55), [0, 0, 0]);
      add(new THREE.BoxGeometry(0.55, 0.55, 0.5), [0.8, 0.28, 0]);
      add(new THREE.ConeGeometry(0.12, 0.28, 4), [0.9, 0.6, 0.14]);
      add(new THREE.ConeGeometry(0.12, 0.28, 4), [0.9, 0.6, -0.14]);
      [[-0.55, -0.22], [0.55, -0.22], [-0.55, 0.22], [0.55, 0.22]].forEach(([x, z]) =>
        add(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 6), [x, -0.5, z])
      );
      add(new THREE.CylinderGeometry(0.07, 0.03, 0.8, 6), [-0.8, 0.2, 0], [0, 0, Math.PI / 3]);
      break;
    }
  }
  return g;
};

const MorphCreature = () => {
  const [idx, setIdx] = useState<number>(-1);
  const group = useRef<THREE.Group>(null!);
  const current = idx >= 0 ? MORPH_SPECS[idx] : null;
  const built = useMemo(() => (current ? buildMorph(current) : null), [current]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const t = performance.now() / 1000;
    if (!current) {
      g.rotation.y = Math.sin(t * 0.7) * 0.15;
      g.position.y = 0;
      g.scale.set(1, 1, 1);
      return;
    }
    switch (current.motion) {
      case "spin":
        g.rotation.y += dt * 1.4;
        g.position.y = 0;
        break;
      case "bob":
        g.position.y = Math.sin(t * 2) * 0.2;
        g.rotation.y += dt * 0.5;
        break;
      case "pulse": {
        const s = 1 + Math.sin(t * 3) * 0.1;
        g.scale.set(s, s, s);
        g.rotation.y += dt * 0.4;
        break;
      }
      case "wave":
        g.rotation.z = Math.sin(t * 2.2) * 0.3;
        g.rotation.y += dt * 0.7;
        break;
      case "shake":
        g.position.x = Math.sin(t * 18) * 0.06;
        g.position.y = Math.cos(t * 15) * 0.04;
        g.rotation.y += dt * 0.8;
        break;
    }
  });

  const onClick = useCallback((e: any) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % MORPH_SPECS.length);
  }, []);

  return (
    <group ref={group} onClick={onClick}>
      {idx < 0 ? <CaptureSofa /> : built ? <primitive object={built} /> : null}
    </group>
  );
};

const SofaZone = ({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) => {
  const zoneBase: CSSProperties = {
    // Positioned lower to sit under the top carousel, smaller footprint.
    top: "clamp(460px, 58vh, 720px)",
    width: "clamp(180px, 18vw, 320px)",
    height: "clamp(160px, 20vh, 280px)",
    contain: "layout paint",
  };

  return (
    <>
      {/* Floating toggle bubble — always visible above everything */}
      <button
        type="button"
        aria-label={hidden ? "Afficher le canapé interactif" : "Masquer le canapé interactif"}
        onClick={onToggle}
        className="fixed rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{
          top: "clamp(460px, 58vh, 720px)",
          left: "clamp(4px, 1.6vw, 40px)",
          width: 36,
          height: 36,
          zIndex: 2147483002,
          background: "hsl(220 30% 8% / 0.55)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid hsl(var(--neon-cyan) / 0.7)",
          boxShadow:
            "0 0 8px hsl(var(--neon-cyan) / 0.6)," +
            "0 0 16px hsl(var(--neon-magenta) / 0.4)",
          color: "white",
          fontSize: 14,
          cursor: "pointer",
          pointerEvents: "auto",
        }}
      >
        {hidden ? "🛋️" : "×"}
      </button>
      {!hidden && (
        <div
          className="fixed overflow-visible"
          style={{
            ...zoneBase,
            left: "clamp(4px, 1.6vw, 40px)",
            // Sits BELOW the video carousels (which sit in normal document flow).
            zIndex: 1,
            pointerEvents: "none",
            background: "transparent",
          }}
        >
          <Canvas
            orthographic
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 8], zoom: 62 }}
            style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "auto", cursor: "pointer" }}
          >
            <ambientLight intensity={0.82} />
            <directionalLight position={[3, 4, 6]} intensity={1.35} color="#ffffff" />
            <pointLight position={[-3, 2, 5]} intensity={1.15} color="#66aaff" />
            <MorphCreature />
          </Canvas>
        </div>
      )}
    </>
  );
};

const BurstFX = ({ burst, onDone }: { burst: Burst; onDone: (id: number) => void }) => {
  const ref = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 80;
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const s = 2 + Math.random() * 3;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * s;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * s;
      vel[i * 3 + 2] = Math.cos(phi) * s;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("velocity", new THREE.BufferAttribute(vel, 3));
    return g;
  }, []);
  const mat = useMemo(
    () => new THREE.PointsMaterial({
      color: new THREE.Color(burst.color),
      size: 0.12,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    }),
    [burst.color]
  );

  useFrame((_, dt) => {
    const age = (performance.now() - burst.bornAt) / 1000;
    if (age > 1.1) { onDone(burst.id); return; }
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const vel = geo.getAttribute("velocity") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      (pos.array as Float32Array)[i * 3] += (vel.array as Float32Array)[i * 3] * dt;
      (pos.array as Float32Array)[i * 3 + 1] += (vel.array as Float32Array)[i * 3 + 1] * dt - 1.2 * dt;
      (pos.array as Float32Array)[i * 3 + 2] += (vel.array as Float32Array)[i * 3 + 2] * dt;
    }
    pos.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - age / 1.1);
  });

  return <points ref={ref} geometry={geo} material={mat} position={burst.pos} renderOrder={20000} />;
};

const HumanoidFigure = ({
  spawn,
  onDone,
  onClickBurst,
}: {
  spawn: Spawn;
  onDone: (id: number) => void;
  onClickBurst: (id: number, pos: THREE.Vector3, color: string) => void;
}) => {
  const glb = GLBS[spawn.variant.glbIndex!];
  const { scene, animations } = useGLTF(glb.url) as any;
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as THREE.Object3D, [scene]);
  const group = useRef<THREE.Group>(null!);
  const { actions, mixer } = useAnimations(animations, group);
  const [action, setAction] = useState<string>(spawn.action);
  const speedRef = useRef(spawn.speed);
  const spinRef = useRef(spawn.spin);

  useEffect(() => {
    const tint = new THREE.Color(spawn.variant.tint);
    cloned.traverse((o: any) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      o.renderOrder = 10000;
      o.material = new THREE.MeshBasicMaterial({
        color: tint,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      });
    });
  }, [cloned, spawn.variant.tint]);

  useEffect(() => {
    const keys = Object.keys(actions || {});
    if (!keys.length) return;
    const loco = glb.loco as Record<string, string | undefined>;
    // 1) direct match on requested action, 2) mapped clip via loco table,
    // 3) any extra clip, 4) first available clip.
    const wanted = (loco[action] || action || "").toLowerCase();
    const key =
      keys.find((n) => n.toLowerCase() === wanted) ||
      keys.find((n) => n.toLowerCase().includes(wanted)) ||
      keys.find((n) => glb.extra.includes(n)) ||
      keys[0];
    const clip = actions[key];
    clip?.reset().fadeIn(0.25).play();
    return () => { clip?.fadeOut(0.2); };
  }, [actions, action, glb]);

  const posRef = useRef(new THREE.Vector3(spawn.x, spawn.y, spawn.z));

  useFrame((_, dt) => {
    mixer?.update(dt);
    const g = group.current;
    if (!g) return;
    const isLoco = action === "walk" || action === "run";
    if (isLoco) {
      posRef.current.x += spawn.dir * speedRef.current * dt;
      g.rotation.y = spawn.dir === 1 ? glb.facing : glb.facing + Math.PI;
    } else {
      g.rotation.y += spinRef.current * dt;
    }
    const t = performance.now() / 1000;
    g.position.set(
      posRef.current.x,
      posRef.current.y + Math.sin(t * 1.3 + spawn.id) * 0.03 + (action === "jump" ? Math.abs(Math.sin(t * 4.6)) * 0.34 : 0),
      posRef.current.z
    );
    const flick = 0.6 + 0.14 * Math.sin(t * 9 + spawn.id);
    cloned.traverse((o: any) => {
      if (o.isMesh && o.material) o.material.opacity = flick;
    });
    if (Math.abs(posRef.current.x) > 9.5 || (!isLoco && performance.now() - spawn.bornAt > 15000)) {
      onDone(spawn.id);
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onClickBurst(spawn.id, group.current.position.clone(), spawn.variant.tint);
    const options = ["dance", "wave", "jump", "walk", "run", "idle"];
    setAction(options[Math.floor(Math.random() * options.length)]);
    speedRef.current = 0;
    spinRef.current = 1.2;
  }, [onClickBurst, spawn.id, spawn.variant.tint]);

  return (
    <group
      ref={group}
      position={[spawn.x, spawn.y, spawn.z]}
      scale={spawn.scale}
      onClick={handleClick}
    >
      <primitive object={cloned} />
    </group>
  );
};

const ObjectFigure = ({
  spawn,
  onDone,
  onClickBurst,
}: {
  spawn: Spawn;
  onDone: (id: number) => void;
  onClickBurst: (id: number, pos: THREE.Vector3, color: string) => void;
}) => {
  const group = useRef<THREE.Group>(null!);
  const built = useMemo(
    () => OBJECT_BUILDERS[spawn.variant.buildKey!](spawn.variant.tint),
    [spawn.variant.buildKey, spawn.variant.tint]
  );
  const spinRef = useRef(spawn.spin || 0.3);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += spinRef.current * dt;
    const t = performance.now() / 1000;
    g.position.y = spawn.y + Math.sin(t * 1.1 + spawn.id) * 0.08;
    const flick = 0.55 + 0.2 * Math.sin(t * 7 + spawn.id);
    built.traverse((o: any) => {
      if (o.isMesh && o.material) o.material.opacity = flick;
    });
    if (performance.now() - spawn.bornAt > 14000) onDone(spawn.id);
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onClickBurst(spawn.id, group.current.position.clone(), spawn.variant.tint);
    spinRef.current = 2.5;
  }, [onClickBurst, spawn.id, spawn.variant.tint]);

  return (
    <group ref={group} position={[spawn.x, spawn.y, spawn.z]} scale={spawn.scale} onClick={handleClick}>
      <primitive object={built} />
    </group>
  );
};

const Stage = ({
  figures,
  bursts,
  removeFigure,
  removeBurst,
  addBurst,
}: {
  figures: Spawn[];
  bursts: Burst[];
  removeFigure: (id: number) => void;
  removeBurst: (id: number) => void;
  addBurst: (id: number, pos: THREE.Vector3, color: string) => void;
}) => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.4, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 6]} intensity={1.4} color="#ffffff" />
      <pointLight position={[5, 5, 5]} intensity={1.6} color="#ff66ff" />
      <pointLight position={[-5, 3, 5]} intensity={1.6} color="#66ffff" />
      <pointLight position={[0, 6, -3]} intensity={1.2} color="#a78bfa" />
      <Suspense fallback={null}>
        {figures.map((f) =>
          f.variant.category === "human" ? (
            <HumanoidFigure key={f.id} spawn={f} onDone={removeFigure} onClickBurst={addBurst} />
          ) : (
            <ObjectFigure key={f.id} spawn={f} onDone={removeFigure} onClickBurst={addBurst} />
          )
        )}
      </Suspense>
      {bursts.map((b) => (
        <BurstFX key={b.id} burst={b} onDone={removeBurst} />
      ))}
    </>
  );
};

// Concurrency caps: strict, per-category. New spawn only when a slot is free.
const MAX_HUMANS = 2;
const MAX_OBJECTS = 1;

const spawnHuman = (): Spawn => {
  // Force a human variant.
  let v: Variant;
  do { v = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]; } while (v.category !== "human");
  return spawnFromVariant(v);
};
const spawnObject = (): Spawn => {
  let v: Variant;
  do { v = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]; } while (v.category !== "object");
  return spawnFromVariant(v);
};
const spawnFromVariant = (v: Variant): Spawn => {
  const { action, speed, spin } = pickAction(v);
  const glb = v.glbIndex != null ? GLBS[v.glbIndex] : null;
  const baseY = glb ? glb.y : -0.6;
  const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const stationary = speed === 0;
  return {
    id: uid++,
    variant: v,
    dir,
    x: stationary ? (Math.random() - 0.5) * 8 : dir === 1 ? -8.5 : 8.5,
    y: baseY + Math.random() * 0.25,
    z: -1.4 + Math.random() * 2.6,
    scale: (glb ? glb.scale : 0.7) * v.scaleMul,
    action,
    speed,
    spin,
    bornAt: performance.now(),
  };
};

export const HologramOverlay = () => {
  const [figures, setFigures] = useState<Spawn[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [visible, setVisible] = useState<boolean>(typeof document === "undefined" ? true : !document.hidden);
  const [clipPath, setClipPath] = useState<string | undefined>(undefined);
  const [sofaHidden, setSofaHidden] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("lovanet.sofa.hidden") === "1";
  });
  const toggleSofa = useCallback(() => {
    setSofaHidden((h) => {
      const next = !h;
      try { localStorage.setItem("lovanet.sofa.hidden", next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const selectors = "video, iframe, [data-hologram-block]";
      const rects: DOMRect[] = [];
      document.querySelectorAll<HTMLElement>(selectors).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.height < 24) return;
        if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) return;
        rects.push(r);
      });
      if (!rects.length) { setClipPath(undefined); return; }
      let d = `M0 0 H${w} V${h} H0 Z`;
      for (const r of rects) {
        const x1 = Math.max(0, r.left);
        const y1 = Math.max(0, r.top);
        const x2 = Math.min(w, r.right);
        const y2 = Math.min(h, r.bottom);
        d += ` M${x1} ${y1} V${y2} H${x2} V${y1} Z`;
      }
      setClipPath(`path(evenodd, "${d}")`);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const interval = window.setInterval(schedule, 500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setFigures((arr) => {
        const humans = arr.filter((f) => f.variant.category === "human").length;
        const objects = arr.filter((f) => f.variant.category === "object").length;
        let next = arr;
        if (humans < MAX_HUMANS && Math.random() < 0.7) next = [...next, spawnHuman()];
        if (objects < MAX_OBJECTS && Math.random() < 0.5) next = [...next, spawnObject()];
        return next;
      });
      window.setTimeout(tick, 1400 + Math.random() * 1800);
    };
    setFigures([spawnHuman()]);
    const first = window.setTimeout(tick, 1200);
    return () => { cancelled = true; window.clearTimeout(first); };
  }, []);

  const removeFigure = useCallback(
    (id: number) => setFigures((arr) => arr.filter((f) => f.id !== id)),
    []
  );
  const removeBurst = useCallback(
    (id: number) => setBursts((arr) => arr.filter((b) => b.id !== id)),
    []
  );
  const addBurst = useCallback((id: number, pos: THREE.Vector3, color: string) => {
    setBursts((arr) => [...arr.slice(-8), { id: uid++, pos, color, bornAt: performance.now() }]);
  }, []);

  return (
    <>
      <FixedCaptureFurniture hidden={sofaHidden} onToggle={toggleSofa} />
      <div
        aria-hidden
        data-hologram-overlay
        className="fixed inset-0 h-screen w-screen overflow-visible"
        style={{
          isolation: "isolate",
          zIndex: 2147483000,
          pointerEvents: "none",
          clipPath,
          WebkitClipPath: clipPath,
        }}
      >
        <Canvas
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.4, 6], fov: 45 }}
          eventSource={typeof document !== "undefined" ? document.body : undefined}
          eventPrefix="client"
          style={{ width: "100vw", height: "100vh", background: "transparent", pointerEvents: "none" }}
        >
          <Stage
            figures={figures}
            bursts={bursts}
            removeFigure={removeFigure}
            removeBurst={removeBurst}
            addBurst={addBurst}
          />
        </Canvas>
      </div>
    </>
  );
};

export default HologramOverlay;