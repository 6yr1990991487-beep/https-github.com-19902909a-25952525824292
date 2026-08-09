import React, { useRef, useMemo, useState, useEffect, useCallback, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRotateCw, FiSun, FiMoon } from 'react-icons/fi';
import useSoundEffects from '../hooks/useSoundEffects';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import HubAudioControls from './HubAudioControls';
import FullscreenToggle from './FullscreenToggle';
import { getRandomTrainAnnouncement } from '../data/trainAnnouncements';

const PREMIUM_TRAVELER_OUTFITS = [
  { top: '#f05d5e', bottom: '#213547' },
  { top: '#00c2a8', bottom: '#243447' },
  { top: '#f5a623', bottom: '#2f3d4a' },
  { top: '#ff4fa3', bottom: '#20242d' },
  { top: '#53a7ff', bottom: '#171b21' },
  { top: '#9b7dff', bottom: '#1e2333' },
  { top: '#8ad66d', bottom: '#28333e' },
  { top: '#ffd166', bottom: '#2c2c36' },
];

const PREMIUM_TRAVELER_SKIN_TONES = ['#FDBCB4', '#DEB887', '#C68642', '#8D5524', '#F5DEB3', '#D2B48C', '#CD853F', '#E8BEAC'];
const PREMIUM_TRAVELER_HAIR = ['#1a1a1a', '#4a3728', '#8B4513', '#FFD700', '#C0C0C0', '#2c1810', '#5c3317', '#8B0000'];

const blendTravelerTone = (from, to, amount = 0.5) => {
  const base = new THREE.Color(from);
  base.lerp(new THREE.Color(to), amount);
  return `#${base.getHexString()}`;
};

const pickTravelerVariant = (items, seed) => items[Math.abs(seed) % items.length];

const TRANSIT_SCREEN_FEEDS = [
  {
    title: 'DÉPARTS',
    rows: [
      ['PARIS', '19:42', 'P3'],
      ['MILAN', '20:05', 'P1'],
      ['ZURICH', '20:21', 'P4'],
    ],
  },
  {
    title: 'RETOURS',
    rows: [
      ['LYON', '19:38', 'A'],
      ['LILLE', '19:54', 'B'],
      ['ROME', '20:14', 'C'],
    ],
  },
];

/* ============================================================
   FUTURISTIC HYPERLOOP STATION 3D — Station Ultra Moderne 2050
   ============================================================ */

// ─── Modern Glass Station Building ────────────────────────
function StationBuilding() {
  return (
    <group position={[-6, 0, -4]}>
      {/* Main glass structure - ultra modern */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[8, 5, 3.5]} />
        <meshStandardMaterial 
          color="#0a0a1a" 
          roughness={0.1} 
          metalness={0.9}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Glass panels with cyan glow */}
      <mesh position={[0, 2.5, -1.76]}>
        <planeGeometry args={[7.5, 4.5]} />
        <meshStandardMaterial 
          color="#1d5c66" 
          emissive="#2d9fb0" 
          emissiveIntensity={0.18} 
          transparent 
          opacity={0.12}
          metalness={0.9}
        />
      </mesh>
      
      {/* LED strip borders - neon cyan */}
      {[
        [-4, 2.5, -1.8],
        [4, 2.5, -1.8],
        [0, 5, -1.8],
        [0, 0, -1.8]
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={i < 2 ? [0.05, 5, 0.05] : [8, 0.05, 0.05]} />
          <meshStandardMaterial 
            color="#00FFFF" 
            emissive="#00FFFF" 
            emissiveIntensity={3}
          />
        </mesh>
      ))}
      
      {/* Digital display panels */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <group key={i} position={[x, 3, -1.78]}>
          <mesh>
            <planeGeometry args={[1.5, 0.8]} />
            <meshStandardMaterial 
              color="#000" 
              emissive="#00D2BE" 
              emissiveIntensity={1.5}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.15}
            color="#00FFFF"
            anchorX="center"
          >
            HYPERLOOP
          </Text>
        </group>
      ))}
      
      {/* Modern entrance with sliding door effect */}
      <mesh position={[0, 1.2, -1.77]}>
        <boxGeometry args={[2, 2.4, 0.05]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.95} 
          roughness={0.05}
          emissive="#00D2BE"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Holographic station name */}
      <Float speed={2} floatIntensity={0.3}>
        <Text
          position={[0, 5.5, -1.9]}
          fontSize={0.5}
          color="#00FFFF"
          anchorX="center"
          anchorY="middle"
        >
          ⚡ STATION ÑLLÑ ⚡
        </Text>
      </Float>
      
      {/* LED accent lights */}
      {[-3.5, -1.5, 1.5, 3.5].map((x, i) => (
        <group key={`led-${i}`} position={[x, 4.5, -1.8]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color="#00FFFF" 
              emissive="#00FFFF" 
              emissiveIntensity={4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Platform ──────────────────────────────────────────────
function Platform({ isNight }) {
  // 4 voies : z=2, 4.5, 7, 9.5
  // Quai principal (gare) : z=-0.5 à z=1.5
  // Quai A (entre voies 1-2) : z=2.8 à z=4.2 → centre z=3.25
  // Quai B (entre voies 2-3) : z=5.3 à z=6.7 → centre z=5.75
  // Quai C (entre voies 3-4) : z=7.8 à z=9.2 → centre z=8.25
  const platformColor = isNight ? '#3a3e44' : '#8B8B8B';
  const edgeColor = isNight ? '#2a2e34' : '#555';
  const benchColor = isNight ? '#1a3a5a' : '#1a5276';
  const shelterPillar = isNight ? '#3a4454' : '#e8eef3';
  const shelterRoof = isNight ? '#2a3444' : '#e7eef3';

  const platforms = [
    { z: 0.5, width: 2.0, label: 'HALL GARE', isMain: true },
    { z: 3.25, width: 0.8, label: 'QUAI A — Voies 1/2' },
    { z: 5.75, width: 0.8, label: 'QUAI B — Voies 2/3' },
    { z: 8.25, width: 0.8, label: 'QUAI C — Voies 3/4' },
  ];

  const Bench = ({ pos }) => (
    <group position={pos}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.0, 0.05, 0.35]} />
        <meshStandardMaterial color={benchColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.38, -0.15]}>
        <boxGeometry args={[1.0, 0.3, 0.04]} />
        <meshStandardMaterial color={benchColor} roughness={0.5} />
      </mesh>
      {[-0.42, 0.42].map((lx, li) => (
        <mesh key={li} position={[lx, 0.1, 0]}>
          <boxGeometry args={[0.04, 0.2, 0.3]} />
          <meshStandardMaterial color="#333" metalness={0.6} />
        </mesh>
      ))}
    </group>
  );

  const VendingMachine = ({ pos, color }) => (
    <group position={pos}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.55, 1.3, 0.45]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.75, 0.24]}>
        <boxGeometry args={[0.4, 0.6, 0.02]} />
        <meshPhysicalMaterial color="#a0d8ee" transmission={0.4} roughness={0.05} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0.24]}>
        <boxGeometry args={[0.3, 0.15, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
    </group>
  );

  const TrashBin = ({ pos }) => (
    <group position={pos}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.6, 8]} />
        <meshStandardMaterial color={isNight ? '#2a3040' : '#606468'} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.17, 0.15, 0.04, 8]} />
        <meshStandardMaterial color={isNight ? '#3a4050' : '#505458'} metalness={0.5} />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* Track beds — gravier sombre sous les rails pour les 4 voies */}
      {[2, 4.5, 7, 9.5].map((tz, ti) => (
        <mesh key={`trackbed-${ti}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, tz]}>
          <planeGeometry args={[32, 1.2]} />
          <meshStandardMaterial color={isNight ? '#1a1e22' : '#555860'} roughness={0.95} />
        </mesh>
      ))}
      {platforms.map((plat, pi) => (
        <group key={`platform-${pi}`}>
          {/* Surface du quai */}
          <mesh position={[0, 0.15, plat.z]}>
            <boxGeometry args={[30, 0.3, plat.width]} />
            <meshStandardMaterial color={platformColor} roughness={0.8} />
          </mesh>
          {/* Lignes jaunes de sécurité — les 2 bords */}
          {[-plat.width / 2 + 0.08, plat.width / 2 - 0.08].map((edge, ei) => (
            <mesh key={`yline-${ei}`} position={[0, 0.32, plat.z + edge]}>
              <boxGeometry args={[30, 0.02, 0.12]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={isNight ? 1.5 : 0.5} />
            </mesh>
          ))}
          {/* Bordures du quai */}
          {[-plat.width / 2, plat.width / 2].map((edge, ei) => (
            <mesh key={`edge-${ei}`} position={[0, 0.15, plat.z + edge]}>
              <boxGeometry args={[30, 0.3, 0.1]} />
              <meshStandardMaterial color={edgeColor} roughness={0.6} />
            </mesh>
          ))}

          {/* Bancs — tous les 5m */}
          {[-10, -5, 0, 5, 10].map((bx, bi) => (
            <Bench key={`bench-${bi}`} pos={[bx, 0.3, plat.z]} />
          ))}

          {/* Distributeurs automatiques */}
          <VendingMachine pos={[-8, 0.3, plat.z]} color="#cc3300" />
          <VendingMachine pos={[8, 0.3, plat.z]} color="#0066aa" />

          {/* Poubelles */}
          {[-12, -3, 3, 12].map((tx, ti) => (
            <TrashBin key={`trash-${ti}`} pos={[tx, 0.3, plat.z]} />
          ))}

          {/* Abri / toit */}
          <group position={[0, 0, plat.z]}>
            {[-12, -4, 4, 12].map((px, pxi) => (
              <mesh key={`pillar-${pxi}`} position={[px, 1.8, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 3.3, 8]} />
                <meshStandardMaterial color={shelterPillar} metalness={0.5} roughness={0.16} />
              </mesh>
            ))}
            <mesh position={[0, 3.4, 0]}>
              <boxGeometry args={[26, 0.08, plat.width + 0.4]} />
              <meshStandardMaterial color={shelterRoof} metalness={0.28} roughness={0.22} transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 3.48, 0]}>
              <boxGeometry args={[26.2, 0.04, plat.width + 0.6]} />
              <meshStandardMaterial color="#88edf2" emissive="#88edf2" emissiveIntensity={isNight ? 0.6 : 0.15} transparent opacity={0.5} />
            </mesh>
          </group>

          {/* Panneau de quai */}
          <mesh position={[-14, 2.8, plat.z]}>
            <boxGeometry args={[3.5, 0.5, 0.08]} />
            <meshStandardMaterial color={isNight ? '#1a3355' : '#1a5588'} roughness={0.3} />
          </mesh>
          <Text position={[-14, 2.8, plat.z + 0.05]} fontSize={0.16} color="#ffffff" anchorX="center">
            {plat.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

function StationAgentFigure({ position, rotation = 0, accent = '#7cf5ff', gesture = 'tablet', scale = 1 }) {
  const rootRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const batonRef = useRef();
  const badgeRef = useRef();

  useFrame(({ clock }) => {
    if (!rootRef.current) return;
    const t = clock.getElapsedTime();
    rootRef.current.position.y = position[1] + Math.sin(t * 1.8 + position[0]) * 0.018;
    rootRef.current.rotation.y = rotation + Math.sin(t * 0.4 + position[2]) * 0.04;

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = gesture === 'tablet' ? -0.85 + Math.sin(t * 1.4) * 0.06 : -0.25 + Math.sin(t * 1.8) * 0.08;
      leftArmRef.current.rotation.z = 0.16;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = gesture === 'signal' ? -1.02 + Math.sin(t * 1.8) * 0.15 : 0.22 + Math.sin(t * 1.8) * 0.08;
      rightArmRef.current.rotation.z = gesture === 'signal' ? -0.28 : -0.16;
    }

    if (batonRef.current?.material) {
      batonRef.current.material.emissiveIntensity = 0.55 + Math.abs(Math.sin(t * 2.6)) * 0.8;
    }

    if (badgeRef.current?.material) {
      badgeRef.current.material.emissiveIntensity = 0.3 + Math.abs(Math.sin(t * 2.1)) * 0.45;
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={[0, rotation, 0]} scale={[scale, scale, scale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.026, 0.02]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.14} />
      </mesh>

      <mesh position={[-0.05, 0.14, 0]}>
        <capsuleGeometry args={[0.03, 0.2, 6, 12]} />
        <meshStandardMaterial color="#18222e" roughness={0.5} />
      </mesh>
      <mesh position={[0.05, 0.14, 0]}>
        <capsuleGeometry args={[0.03, 0.2, 6, 12]} />
        <meshStandardMaterial color="#18222e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <capsuleGeometry args={[0.072, 0.22, 8, 16]} />
        <meshStandardMaterial color="#233647" roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.56, 0.065]}>
        <boxGeometry args={[0.11, 0.18, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.16} transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.73, 0]}>
        <sphereGeometry args={[0.082, 16, 16]} />
        <meshStandardMaterial color="#D8B08C" roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.78, -0.01]}>
        <sphereGeometry args={[0.086, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.75]} />
        <meshStandardMaterial color="#1f1f24" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.05, 16]} />
        <meshStandardMaterial color="#0f141a" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.18, 0.03, 0.16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} />
      </mesh>

      <group ref={leftArmRef} position={[-0.11, 0.48, 0.015]}>
        <mesh>
          <capsuleGeometry args={[0.024, 0.16, 6, 10]} />
          <meshStandardMaterial color="#D8B08C" roughness={0.35} />
        </mesh>
        {gesture === 'tablet' && (
          <group position={[-0.01, -0.12, 0.09]}>
            <mesh>
              <boxGeometry args={[0.06, 0.09, 0.01]} />
              <meshStandardMaterial color="#111826" metalness={0.8} roughness={0.18} />
            </mesh>
            <mesh position={[0, 0, 0.007]}>
              <boxGeometry args={[0.048, 0.074, 0.003]} />
              <meshStandardMaterial color="#7cecff" emissive="#7cecff" emissiveIntensity={0.65} />
            </mesh>
          </group>
        )}
      </group>

      <group ref={rightArmRef} position={[0.11, 0.48, 0.015]}>
        <mesh>
          <capsuleGeometry args={[0.024, 0.16, 6, 10]} />
          <meshStandardMaterial color="#D8B08C" roughness={0.35} />
        </mesh>
        {gesture === 'signal' && (
          <mesh ref={batonRef} position={[0.01, -0.14, 0.12]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.26, 10]} />
            <meshStandardMaterial color="#ffd76a" emissive="#ffd76a" emissiveIntensity={0.8} />
          </mesh>
        )}
      </group>

      <mesh ref={badgeRef} position={[0.05, 0.53, 0.08]}>
        <boxGeometry args={[0.045, 0.06, 0.012]} />
        <meshStandardMaterial color="#8fe7ff" emissive="#8fe7ff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function TicketControlGates({ isNight }) {
  const accent = isNight ? '#7cf5ff' : '#4ddde0';
  const gates = [-5.6, -3.7, -1.8, 0.1, 2.0, 3.9];

  return (
    <group position={[-0.8, 0, -1.55]}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[13.8, 0.16, 1.65]} />
        <meshStandardMaterial color="#eef5f8" roughness={0.24} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.22, -0.78]}>
        <boxGeometry args={[13.2, 0.04, 0.08]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={isNight ? 0.9 : 0.24} />
      </mesh>
      <Text position={[0, 2.35, -0.22]} fontSize={0.26} color="#ffffff" anchorX="center">CONTRÔLE BILLETS • GATES</Text>
      <Text position={[0, 2.05, -0.22]} fontSize={0.12} color={accent} anchorX="center">Scan express • Embarkation rapide</Text>

      {gates.map((x, gateIndex) => (
        <group key={`ticket-gate-${gateIndex}`} position={[x, 0, 0]}>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[1.1, 2.1, 0.16]} />
            <meshPhysicalMaterial color="#dff4fb" transmission={0.82} roughness={0.05} thickness={0.12} transparent opacity={0.34} />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[1.18, 0.08, 0.22]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={isNight ? 1.5 : 0.35} />
          </mesh>
          {[-0.45, 0.45].map((side, sideIndex) => (
            <group key={`ticket-gate-column-${gateIndex}-${sideIndex}`} position={[side, 0.68, 0]}>
              <mesh>
                <boxGeometry args={[0.14, 1.36, 0.18]} />
                <meshStandardMaterial color="#edf4f8" roughness={0.24} metalness={0.24} />
              </mesh>
              <mesh position={[0, 0.38, 0.1]}>
                <boxGeometry args={[0.07, 0.15, 0.03]} />
                <meshStandardMaterial color="#111a22" emissive={accent} emissiveIntensity={isNight ? 1.1 : 0.28} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.55, 0.02]}>
            <boxGeometry args={[0.45, 0.04, 0.24]} />
            <meshStandardMaterial color="#d9eef6" emissive={accent} emissiveIntensity={isNight ? 0.55 : 0.12} />
          </mesh>
          <Text position={[0, 2.48, 0.08]} fontSize={0.1} color="#ffffff" anchorX="center">A{gateIndex + 1}</Text>
        </group>
      ))}

      <StationAgentFigure position={[-6.8, 0.02, -0.46]} rotation={0.22} accent="#ffd76a" gesture="signal" scale={0.88} />
      <StationAgentFigure position={[5.2, 0.02, -0.34]} rotation={-0.28} accent="#7cf5ff" gesture="tablet" scale={0.86} />
    </group>
  );
}

function UndergroundPassage({ isNight }) {
  const wallColor = isNight ? '#1a2434' : '#d8dce0';
  const stairColor = isNight ? '#2a3040' : '#b8bcc0';
  const accentColor = isNight ? '#69ebff' : '#2288aa';

  // Entrées sur chaque quai : Hall gare (z=0.5), Quai A (z=3.25), Quai B (z=5.75), Quai C (z=8.25), Sortie Nord (z=11)
  const platformEntrances = [
    { z: 0.5, label: 'HALL GARE', faceZ: 1 },
    { z: 3.25, label: 'QUAI A', faceZ: 1 },
    { z: 5.75, label: 'QUAI B', faceZ: 1 },
    { z: 8.25, label: 'QUAI C', faceZ: 1 },
    { z: 10.8, label: 'SORTIE NORD', faceZ: -1 },
  ];

  // 2 accès par quai : x=-4 et x=4
  const xPositions = [-4, 4];

  return (
    <group>
      {platformEntrances.map((plat, pi) => (
        xPositions.map((xp, xi) => (
          <group key={`ug-${pi}-${xi}`} position={[xp, 0.3, plat.z]}>
            {/* Murets latéraux */}
            {[-0.9, 0.9].map((wx, wi) => (
              <mesh key={`w-${wi}`} position={[wx, 0.2, plat.faceZ * 0.5]}>
                <boxGeometry args={[0.12, 1.2, 1.6]} />
                <meshStandardMaterial color={wallColor} roughness={0.3} metalness={0.2} />
              </mesh>
            ))}
            {/* Main courante lumineuse */}
            {[-0.9, 0.9].map((wx, wi) => (
              <mesh key={`hr-${wi}`} position={[wx, 0.85, plat.faceZ * 0.5]}>
                <boxGeometry args={[0.06, 0.05, 1.8]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={isNight ? 1.5 : 0.3} metalness={0.6} roughness={0.15} />
              </mesh>
            ))}
            {/* Marches descendantes */}
            {[...Array(5)].map((_, si) => (
              <mesh key={`st-${si}`} position={[0, -0.1 - si * 0.2, plat.faceZ * (0.15 + si * 0.25)]}>
                <boxGeometry args={[1.6, 0.07, 0.28]} />
                <meshStandardMaterial color={stairColor} roughness={0.4} metalness={0.15} />
              </mesh>
            ))}
            {/* Couverture au-dessus de l'escalier */}
            <mesh position={[0, 0.95, plat.faceZ * 0.5]}>
              <boxGeometry args={[2.2, 0.1, 1.8]} />
              <meshStandardMaterial color={wallColor} roughness={0.25} metalness={0.15} />
            </mesh>
            {/* Panneau indicateur */}
            <mesh position={[0, 1.1, plat.faceZ * -0.1]}>
              <boxGeometry args={[1.6, 0.35, 0.05]} />
              <meshStandardMaterial color={isNight ? '#1a3355' : '#1a5588'} roughness={0.3} />
            </mesh>
            <Text position={[0, 1.1, plat.faceZ * -0.13]} fontSize={0.11} color="#ffffff" anchorX="center">
              {plat.label}
            </Text>
            {/* Flèche vers le bas */}
            <mesh position={[0, 1.32, plat.faceZ * -0.1]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.08, 0.15, 3]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={isNight ? 2.0 : 0.5} />
            </mesh>
            {/* Éclairage intérieur */}
            <mesh position={[0, 0.7, plat.faceZ * 0.5]}>
              <boxGeometry args={[1.4, 0.03, 0.06]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={isNight ? 2.5 : 0.5} />
            </mesh>
          </group>
        ))
      ))}

      {/* Grilles de ventilation entre les voies au sol */}
      {[3.25, 5.75, 8.25].map((gz, gi) => (
        <group key={`vent-${gi}`}>
          {[-8, 0, 8].map((vx, vi) => (
            <group key={`vent-g-${vi}`} position={[vx, 0.02, gz]}>
              <mesh>
                <boxGeometry args={[1.6, 0.03, 0.8]} />
                <meshStandardMaterial color="#4a4e54" roughness={0.3} metalness={0.7} />
              </mesh>
              {[...Array(5)].map((_, si) => (
                <mesh key={`sl-${si}`} position={[-0.6 + si * 0.3, 0.02, 0]}>
                  <boxGeometry args={[0.03, 0.02, 0.7]} />
                  <meshStandardMaterial color="#3a3e44" metalness={0.8} roughness={0.15} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* Panneau principal "PASSAGE SOUTERRAIN" au-dessus du hall gare */}
      <group position={[0, 0.3, -0.5]}>
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[5, 0.55, 0.1]} />
          <meshStandardMaterial color={isNight ? '#1a3355' : '#1a5588'} roughness={0.3} />
        </mesh>
        <Text position={[0, 2.8, 0.06]} fontSize={0.18} color="#ffffff" anchorX="center">
          PASSAGE SOUTERRAIN
        </Text>
        <mesh position={[0, 2.48, 0]}>
          <boxGeometry args={[4.8, 0.04, 0.06]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={isNight ? 2.0 : 0.5} />
        </mesh>
      </group>
    </group>
  );
}

function StationAgentsPatrol({ isMobile = false }) {
  const patrolAgents = useMemo(() => ([
    { position: [-10.8, 0.02, -0.9], rotation: 0.2, accent: '#7cf5ff', gesture: 'tablet', scale: 0.84 },
    { position: [7.4, 0.02, -0.8], rotation: -0.24, accent: '#ffd76a', gesture: 'signal', scale: 0.84 },
    { position: [-9.6, 4.24, 2.3], rotation: 0.34, accent: '#7cf5ff', gesture: 'signal', scale: 0.76 },
    { position: [8.4, 4.24, 2.5], rotation: -0.34, accent: '#ffd76a', gesture: 'tablet', scale: 0.76 },
  ]), []);

  const activeAgents = isMobile ? patrolAgents.slice(0, 2) : patrolAgents;

  return (
    <group>
      {activeAgents.map((agent, index) => (
        <StationAgentFigure key={`station-agent-${index}`} {...agent} />
      ))}
    </group>
  );
}

const setMeshOpacity = (material, opacity) => {
  if (!material) return;
  material.transparent = opacity < 0.999;
  material.opacity = opacity;
};

const getTunnelOpacity = (xPosition) => {
  const absX = Math.abs(xPosition);
  return absX > 38 ? Math.max(0, 1 - (absX - 38) / 12) : 1;
};

const updateTrainOpacity = (train, opacity, opacityRef) => {
  if (!train || Math.abs(opacityRef.current - opacity) < 0.02) return;

  opacityRef.current = opacity;
  train.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => setMeshOpacity(material, opacity));
      return;
    }

    setMeshOpacity(child.material, opacity);
  });
};

// ─── Rails améliorés (grande portée, plus réalistes) ──────
function Rails({ zPosition }) {
  const sleepers = useMemo(() => {
    return [...Array(90)].map((_, i) => ({
      x: -90 + i * 2,
      z: zPosition
    }));
  }, [zPosition]);

  return (
    <group>
      {/* Rails en acier — métalliques brillants — REHAUSSÉS */}
      {[-0.32, 0.32].map((offset, i) => (
        <group key={i}>
          <mesh position={[0, 0.14, zPosition + offset]}>
            <boxGeometry args={[180, 0.1, 0.07]} />
            <meshStandardMaterial color="#999" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.2, zPosition + offset]}>
            <boxGeometry args={[180, 0.04, 0.045]} />
            <meshStandardMaterial color="#CCC" metalness={0.98} roughness={0.02} />
          </mesh>
        </group>
      ))}

      {/* Traverses en béton — rehaussées */}
      {sleepers.map((s, i) => (
        <mesh key={i} position={[s.x, 0.08, s.z]}>
          <boxGeometry args={[0.35, 0.07, 1.1]} />
          <meshStandardMaterial color="#808890" roughness={0.8} />
        </mesh>
      ))}

      {/* Lit de ballast principal — rehaussé au-dessus du sol ville */}
      <mesh position={[0, 0.02, zPosition]}>
        <boxGeometry args={[180, 0.08, 1.5]} />
        <meshStandardMaterial color="#6a6e74" roughness={1} />
      </mesh>
      {/* Ballast latéral */}
      {[-0.8, 0.8].map((offset, i) => (
        <mesh key={i} position={[0, 0.04, zPosition + offset]}>
          <boxGeometry args={[180, 0.06, 0.5]} />
          <meshStandardMaterial color="#787c82" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Locomotive TGV ────────────────────────────────────────
function TGVLocomotive({ isBoosted = false, color = "#1e2d5a" }) {
  return (
    <group>
      {/* Effet de boost - trainée lumineuse */}
      {isBoosted && (
        <>
          <mesh position={[0, 0.6, 3]}>
            <boxGeometry args={[0.3, 0.3, 2]} />
            <meshStandardMaterial 
              color="#00FFFF" 
              emissive="#00FFFF" 
              emissiveIntensity={5}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}
      
      {/* Corps principal */}
      <mesh position={[0, 0.65, 0.9]}>
        <boxGeometry args={[0.95, 0.88, 2.6]} />
        <meshStandardMaterial 
          color={isBoosted ? "#3355CC" : color} 
          metalness={0.65} 
          roughness={0.3}
          emissive={isBoosted ? "#00FFFF" : "#000000"}
          emissiveIntensity={isBoosted ? 0.3 : 0}
        />
      </mesh>

      {/* Bande argentée du haut */}
      <mesh position={[0, 1.12, 0.9]}>
        <boxGeometry args={[0.97, 0.07, 2.62]} />
        <meshStandardMaterial color="#C0C8D8" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Section nez — biseautée */}
      <mesh position={[0, 0.6, -0.3]} rotation={[0.14, 0, 0]}>
        <boxGeometry args={[0.9, 0.78, 1.7]} />
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.3} />
      </mesh>

      {/* Pointe du nez — jaune TGV */}
      <mesh position={[0, 0.42, -1.18]}>
        <boxGeometry args={[0.72, 0.58, 0.55]} />
        <meshStandardMaterial color="#FFD700" metalness={0.55} roughness={0.35} />
      </mesh>

      {/* Pare-brise */}
      <mesh position={[0, 0.92, -0.95]} rotation={[0.32, 0, 0]}>
        <planeGeometry args={[0.78, 0.38]} />
        <meshStandardMaterial color="#7ec8e3" transparent opacity={0.75} side={THREE.DoubleSide} emissive="#7ec8e3" emissiveIntensity={0.35} />
      </mesh>

      {/* Bande bleue latérale */}
      <mesh position={[0, 0.78, 0.6]}>
        <boxGeometry args={[0.97, 0.14, 4.6]} />
        <meshStandardMaterial color="#3355AA" emissive="#3355AA" emissiveIntensity={0.25} />
      </mesh>

      {/* Bande rouge bas (livrée SNCF) */}
      <mesh position={[0, 0.2, 0.6]}>
        <boxGeometry args={[0.97, 0.1, 4.6]} />
        <meshStandardMaterial color="#CC2222" />
      </mesh>

      {/* Fenêtres latérales */}
      {[-0.7, -0.1, 0.5, 1.1, 1.7].map((z, i) => (
        <group key={i}>
          {[[-0.49, -Math.PI / 2], [0.49, Math.PI / 2]].map(([x, ry], j) => (
            <mesh key={j} position={[x, 0.82, z]} rotation={[0, ry, 0]}>
              <planeGeometry args={[0.4, 0.3]} />
              <meshStandardMaterial color="#7ec8e3" transparent opacity={0.8} emissive="#7ec8e3" emissiveIntensity={0.4} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Pantographe */}
      <group position={[0, 1.26, 1.0]}>
        <mesh><boxGeometry args={[0.55, 0.04, 0.04]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
        <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.35, 0.04, 0.04]} /><meshStandardMaterial color="#666" metalness={0.9} /></mesh>
        <mesh position={[-0.25, 0.11, 0]}><boxGeometry args={[0.04, 0.24, 0.04]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
        <mesh position={[0.25, 0.11, 0]}><boxGeometry args={[0.04, 0.24, 0.04]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
      </group>

      {/* Bogies / Essieux (3 groupes) */}
      {[-0.8, 0.1, 1.0].map((z, i) => (
        <group key={i} position={[0, 0.24, z]}>
          <mesh><boxGeometry args={[0.88, 0.1, 0.65]} /><meshStandardMaterial color="#2a2a2a" metalness={0.85} /></mesh>
          {[-0.44, 0.44].map((x, j) => (
            <mesh key={j} position={[x, -0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.21, 0.21, 0.11, 16]} />
              <meshStandardMaterial color="#111" metalness={0.95} roughness={0.05} />
            </mesh>
          ))}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 1.0, 8]} />
            <meshStandardMaterial color="#333" metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Phares */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={i} position={[x, 0.66, -1.45]}>
          <mesh><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#FFFFA0" emissive="#FFFFA0" emissiveIntensity={4} /></mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Wagon TGV ─────────────────────────────────────────────
function TGVWagon({ color = "#1e2d5a", doorsOpen = false }) {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();
  
  // Animation des portes coulissantes
  useFrame(() => {
    if (!leftDoorRef.current || !rightDoorRef.current) return;
    const targetOffset = doorsOpen ? 0.22 : 0; // Glissement horizontal
    const currentLeft = leftDoorRef.current.position.z;
    const currentRight = rightDoorRef.current.position.z;
    // Interpolation douce
    leftDoorRef.current.position.z += ((-1.35 - targetOffset) - currentLeft) * 0.08;
    rightDoorRef.current.position.z += ((-1.35 + targetOffset) - currentRight) * 0.08;
  });
  
  return (
    <group>
      {/* Corps du wagon */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.95, 0.85, 2.85]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.32} />
      </mesh>

      {/* Toit argenté */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.97, 0.06, 2.87]} />
        <meshStandardMaterial color="#C0C8D8" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Bande colorée */}
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[0.97, 0.12, 2.87]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Bande argent bas */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.97, 0.1, 2.87]} />
        <meshStandardMaterial color="#A0A8B8" metalness={0.7} />
      </mesh>

      {/* Fenêtres */}
      {[-0.9, -0.4, 0.1, 0.6, 1.1].map((z, i) => (
        <group key={i}>
          {[[-0.49, -Math.PI / 2], [0.49, Math.PI / 2]].map(([x, ry], j) => (
            <mesh key={j} position={[x, 0.8, z]} rotation={[0, ry, 0]}>
              <planeGeometry args={[0.36, 0.28]} />
              <meshStandardMaterial color="#7ec8e3" transparent opacity={0.78} emissive="#7ec8e3" emissiveIntensity={0.3} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}

      {/* PORTES COULISSANTES ANIMÉES - côté gauche du wagon */}
      <group position={[-0.49, 0.65, 0]}>
        {/* Cadre de porte */}
        <mesh position={[0.02, 0, -1.35]}>
          <boxGeometry args={[0.04, 0.7, 0.5]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.9} />
        </mesh>
        {/* Porte gauche coulissante */}
        <mesh ref={leftDoorRef} position={[0.025, 0, -1.35]}>
          <boxGeometry args={[0.03, 0.62, 0.22]} />
          <meshStandardMaterial 
            color={doorsOpen ? "#2a4a6a" : color} 
            metalness={0.7} 
            emissive={doorsOpen ? "#00FF00" : "#000000"}
            emissiveIntensity={doorsOpen ? 0.3 : 0}
          />
        </mesh>
        {/* Porte droite coulissante */}
        <mesh ref={rightDoorRef} position={[0.025, 0, -1.35]}>
          <boxGeometry args={[0.03, 0.62, 0.22]} />
          <meshStandardMaterial 
            color={doorsOpen ? "#2a4a6a" : color} 
            metalness={0.7}
            emissive={doorsOpen ? "#00FF00" : "#000000"}
            emissiveIntensity={doorsOpen ? 0.3 : 0}
          />
        </mesh>
        {/* Lumière d'indication porte */}
        <mesh position={[0.03, 0.42, -1.35]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial 
            color={doorsOpen ? "#00FF00" : "#FF0000"} 
            emissive={doorsOpen ? "#00FF00" : "#FF0000"} 
            emissiveIntensity={2} 
          />
        </mesh>
      </group>

      {/* PORTES COULISSANTES ANIMÉES - côté droit du wagon */}
      <group position={[0.49, 0.65, 0]} rotation={[0, Math.PI, 0]}>
        {/* Cadre de porte */}
        <mesh position={[0.02, 0, -1.35]}>
          <boxGeometry args={[0.04, 0.7, 0.5]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.9} />
        </mesh>
        {/* Porte gauche */}
        <mesh position={[0.025, 0, -1.35 - (doorsOpen ? 0.22 : 0)]}>
          <boxGeometry args={[0.03, 0.62, 0.22]} />
          <meshStandardMaterial 
            color={doorsOpen ? "#2a4a6a" : color} 
            metalness={0.7}
            emissive={doorsOpen ? "#00FF00" : "#000000"}
            emissiveIntensity={doorsOpen ? 0.3 : 0}
          />
        </mesh>
        {/* Porte droite */}
        <mesh position={[0.025, 0, -1.35 + (doorsOpen ? 0.22 : 0)]}>
          <boxGeometry args={[0.03, 0.62, 0.22]} />
          <meshStandardMaterial 
            color={doorsOpen ? "#2a4a6a" : color} 
            metalness={0.7}
            emissive={doorsOpen ? "#00FF00" : "#000000"}
            emissiveIntensity={doorsOpen ? 0.3 : 0}
          />
        </mesh>
        {/* Lumière d'indication porte */}
        <mesh position={[0.03, 0.42, -1.35]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial 
            color={doorsOpen ? "#00FF00" : "#FF0000"} 
            emissive={doorsOpen ? "#00FF00" : "#FF0000"} 
            emissiveIntensity={2} 
          />
        </mesh>
      </group>

      {/* Bogies (2 par wagon) */}
      {[-0.9, 0.9].map((z, i) => (
        <group key={i} position={[0, 0.24, z]}>
          <mesh><boxGeometry args={[0.88, 0.1, 0.55]} /><meshStandardMaterial color="#2a2a2a" metalness={0.85} /></mesh>
          {[-0.44, 0.44].map((x, j) => (
            <mesh key={j} position={[x, -0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.21, 0.21, 0.1, 16]} />
              <meshStandardMaterial color="#111" metalness={0.95} roughness={0.05} />
            </mesh>
          ))}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
            <meshStandardMaterial color="#333" metalness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── TGV Animé ─────────────────────────────────────────────
function AnimatedTGV({ railZ, startX = -25, onHorn }) {
  const trainRef = useRef();
  const stopStateRef = useRef(false);
  const opacityRef = useRef(1);
  const [isBoosted, setIsBoosted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [trainColor, setTrainColor] = useState('#00D2BE');
  const baseSpeed = 9;
  const wagonsCount = 6;
  const spacing = 3.1;
  const stationX = 0; // Station position
  const stopDuration = 8; // Seconds to stop at station
  
  // Change train color periodically
  useEffect(() => {
    const colors = ['#00D2BE', '#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#9B59B6', '#3498DB'];
    const interval = setInterval(() => {
      setTrainColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useFrame(({ clock }) => {
    if (!trainRef.current) return;
    const t = clock.getElapsedTime();
    const cycleTime = 20; // Total cycle time
    const cyclePosition = t % cycleTime;
    
    // Stop at station between 8-16 seconds of each cycle
    const shouldStop = cyclePosition > 8 && cyclePosition < 16;
    if (stopStateRef.current !== shouldStop) {
      stopStateRef.current = shouldStop;
      setIsStopped(shouldStop);
    }
    
    if (shouldStop) {
      // Smoothly decelerate to station
      const stopProgress = (cyclePosition - 8) / 2;
      const decelX = stationX - (1 - Math.min(stopProgress, 1)) * 5;
      trainRef.current.position.x = Math.max(stationX - 2, decelX);
    } else {
      const currentSpeed = isBoosted ? baseSpeed * 2.5 : baseSpeed;
      let x = startX + (cyclePosition > 16 ? (cyclePosition - 8) : cyclePosition) * currentSpeed;
      const range = 95;
      x = ((x + range) % (range * 2)) - range;
      trainRef.current.position.x = x;
    }

    updateTrainOpacity(trainRef.current, getTunnelOpacity(trainRef.current.position.x), opacityRef);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onHorn) onHorn();
    setIsBoosted(true);
    setTimeout(() => setIsBoosted(false), 2000);
  };

  return (
    <group 
      ref={trainRef} 
      position={[startX, 0, railZ]}
      onClick={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Stopped indicator */}
      {isStopped && (
        <group position={[0, 3, 0]}>
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={2}
              transparent
              opacity={0.7}
            />
          </mesh>
          <Text position={[0, 0.8, 0]} fontSize={0.3} color="#FFFFFF" anchorX="center">
            EN GARE
          </Text>
        </group>
      )}
      
      {/* Boost effect */}
      {isBoosted && (
        <mesh position={[12, 0.6, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial 
            color="#00FFFF" 
            emissive="#00FFFF" 
            emissiveIntensity={3}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
      
      {/* Hover indicator */}
      {isHovered && !isBoosted && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* Front locomotive */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <TGVLocomotive isBoosted={isBoosted} color={trainColor} />
      </group>
      {/* Wagons */}
      {[...Array(wagonsCount)].map((_, i) => (
        <group key={i} position={[-(i + 1) * spacing, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <TGVWagon color={trainColor} doorsOpen={isStopped} />
        </group>
      ))}
      {/* Rear locomotive (reversed) */}
      <group position={[-(wagonsCount + 1) * spacing, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <TGVLocomotive isBoosted={isBoosted} color={trainColor} />
      </group>
      
      {/* Boarding passengers when stopped */}
      {isStopped && <BoardingPassengers trainStopped={isStopped} trainPosition={0} />}
    </group>
  );
}

// ─── Futuristic Hyperloop Train ────────────────────────────
function Locomotive({ color, size = 1 }) {
  return (
    <group scale={[size, size, size]}>
      {/* Aerodynamic front capsule */}
      <mesh position={[0, 0.6, -1]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.4, 1.5, 16, 32]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.95} 
          roughness={0.05}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Main body - sleek tube */}
      <mesh position={[0, 0.6, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 2.5, 32]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Cockpit windows - panoramic */}
      <mesh position={[0, 0.8, -1.3]}>
        <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          metalness={0.95} 
          roughness={0.05}
          transparent 
          opacity={0.4}
          emissive="#00FFFF"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* LED strip along body */}
      {[-0.8, -0.3, 0.2, 0.7, 1.2].map((z, i) => (
        <mesh key={i} position={[0, 1, z]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.44, 0.02, 16, 32]} />
          <meshStandardMaterial 
            color="#00FFFF" 
            emissive="#00FFFF" 
            emissiveIntensity={3}
          />
        </mesh>
      ))}
      
      {/* Powerful headlight - blue beam */}
      <mesh position={[0, 0.6, -1.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          emissive="#00FFFF" 
          emissiveIntensity={5}
        />
      </mesh>
      
      
      {/* Maglev hover effect - no wheels! */}
      <Float speed={3} floatIntensity={0.1}>
        <group>
          {/* Magnetic field visualizer */}
          {[-0.8, 0, 0.8].map((z, i) => (
            <mesh key={i} position={[0, 0.15, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.5, 0.55, 32]} />
              <meshStandardMaterial 
                color="#FF00FF" 
                emissive="#FF00FF" 
                emissiveIntensity={2}
                transparent
                opacity={0.3}
              />
            </mesh>
          ))}
        </group>
      </Float>
      
      {/* Undercarriage - magnetic rail */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.08, 3]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.95} 
          roughness={0.05}
        />
      </mesh>
      
      {/* Energy glow underneath */}
    </group>
  );
}

// ─── Futuristic Wagon/Capsule ──────────────────────────────
function Wagon({ type = 'passenger', color = '#1a1a2e' }) {
  return (
    <group>
      {/* Sleek aerodynamic body */}
      <mesh position={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.4, 2, 16, 32]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Glass windows with cyan glow */}
      {type === 'passenger' && [-0.8, -0.3, 0.3, 0.8].map((z, i) => (
        <group key={i}>
          <mesh position={[-0.42, 0.7, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.4, 0.35]} />
            <meshStandardMaterial 
              color="#00FFFF" 
              emissive="#00FFFF" 
              emissiveIntensity={1} 
              transparent 
              opacity={0.4}
              side={THREE.DoubleSide} 
            />
          </mesh>
          <mesh position={[0.42, 0.7, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.4, 0.35]} />
            <meshStandardMaterial 
              color="#00FFFF" 
              emissive="#00FFFF" 
              emissiveIntensity={1} 
              transparent 
              opacity={0.4}
              side={THREE.DoubleSide} 
            />
          </mesh>
        </group>
      ))}
      
      {/* LED strip along wagon */}
      <mesh position={[0, 1.05, 0]}>
        <torusGeometry args={[0.42, 0.015, 16, 32]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          emissive="#00FFFF" 
          emissiveIntensity={3}
        />
      </mesh>
      
      {/* Maglev hover - no wheels */}
      <Float speed={3} floatIntensity={0.1}>
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.48, 0.52, 32]} />
          <meshStandardMaterial 
            color="#FF00FF" 
            emissive="#FF00FF" 
            emissiveIntensity={2}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>
      
      {/* Undercarriage - magnetic rail */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.06, 2.2]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.95} 
          roughness={0.05}
        />
      </mesh>
      
      {/* Coupling connector - electromagnetic */}
      <mesh position={[0, 0.6, 1.05]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial 
          color="#FF00FF" 
          emissive="#FF00FF" 
          emissiveIntensity={3}
        />
      </mesh>
      
      {/* Energy glow */}
    </group>
  );
}

// ─── Energy Plasma Effect (Au lieu de vapeur) ─────────────
function SteamEffect({ position }) {
  const particlesRef = useRef();
  const particleCount = 50;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = position[0] + (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 1] = position[1] + Math.random() * 1;
      pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.3;
    }
    return pos;
  }, [position]);
  
  useFrame(() => {
    if (!particlesRef.current) return;
    const positions = particlesRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      // Energy particles flowing backward
      positions[i * 3 + 2] += 0.05;
      positions[i * 3 + 1] += (Math.random() - 0.5) * 0.02;
      
      // Reset if too far
      if (positions[i * 3 + 2] > position[2] + 3) {
        positions[i * 3] = position[0] + (Math.random() - 0.5) * 0.3;
        positions[i * 3 + 1] = position[1];
        positions[i * 3 + 2] = position[2];
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#00FFFF" transparent opacity={0.7} />
    </points>
  );
}

// ─── Holographic Departure Board ──────────────────────────
function DepartureBoard() {
  const destinations = useMemo(() => [
    { city: 'TOKYO', time: '14:30', track: 'A1', color: '#FF00FF' },
    { city: 'NEW YORK', time: '15:15', track: 'B2', color: '#00FFFF' },
    { city: 'DUBAI', time: '16:00', track: 'C3', color: '#00FF00' },
  ], []);
  
  return (
    <Float speed={1.5} floatIntensity={0.2}>
      <group position={[-2, 4.5, -3.8]} rotation={[0, 0, 0]}>
        {/* Holographic frame */}
        <mesh>
          <boxGeometry args={[5, 2.5, 0.05]} />
          <meshStandardMaterial 
            color="#000" 
            metalness={0.95} 
            roughness={0.05}
            emissive="#00FFFF"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Glowing border */}
        {[
          [-2.5, 0, 0.03],
          [2.5, 0, 0.03],
          [0, 1.25, 0.03],
          [0, -1.25, 0.03]
        ].map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={i < 2 ? [0.02, 2.5, 0.02] : [5, 0.02, 0.02]} />
            <meshStandardMaterial 
              color="#00FFFF" 
              emissive="#00FFFF" 
              emissiveIntensity={4}
            />
          </mesh>
        ))}
        
        {/* Title */}
        <Text
          position={[0, 1, 0.06]}
          fontSize={0.25}
          color="#00FFFF"
          anchorX="center"
        >
          ⚡ HYPERLOOP DEPARTURES ⚡
        </Text>
        
        {/* Destinations */}
        {destinations.map((dest, i) => (
          <group key={i} position={[-2, 0.3 - i * 0.6, 0.06]}>
            <Text fontSize={0.22} color={dest.color}>
              {dest.city}
            </Text>
            <Text position={[2.2, 0, 0]} fontSize={0.18} color="#00FF00">
              {dest.time}
            </Text>
            <Text position={[3.5, 0, 0]} fontSize={0.18} color="#FFFF00">
              {dest.track}
            </Text>
          </group>
        ))}
        
      </group>
    </Float>
  );
}

function AnimatedPremiumTraveler({
  basePosition,
  outfit,
  skin,
  hair,
  scale = 1,
  behavior = 'walker',
  movementAxis = 'z',
  movementRange = 1.2,
  movementSpeed = 0.45,
  phase = 0,
  baseRotation = 0,
  accent = '#66e4ff',
  hasLuggage = false,
  hasPhone = false,
  hasGlasses = false,
}) {
  const rootRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const headRef = useRef();
  const luggageRef = useRef();
  const cupRef = useRef();
  const snackRef = useRef();
  const phoneGlowRef = useRef();

  useFrame(({ clock }) => {
    if (!rootRef.current) return;

    const t = clock.getElapsedTime() * movementSpeed + phase;
    const stride = Math.sin(t * 3.2);
    const travel = Math.sin(t);
    const direction = Math.cos(t) >= 0 ? 1 : -1;
    const isWalker = behavior === 'walker' || behavior === 'return-walk';

    let x = basePosition[0];
    let y = basePosition[1];
    let z = basePosition[2];

    if (isWalker) {
      if (movementAxis === 'x') {
        x += travel * movementRange;
        rootRef.current.rotation.y = direction > 0 ? baseRotation : baseRotation + Math.PI;
      } else {
        z += travel * movementRange;
        rootRef.current.rotation.y = direction > 0 ? baseRotation : baseRotation + Math.PI;
      }

      y += Math.abs(Math.sin(t * 4)) * 0.035;
    } else {
      y += Math.sin(t * 2) * 0.022;
      rootRef.current.rotation.y = baseRotation + Math.sin(t * 0.7) * 0.08;
    }

    rootRef.current.position.set(x, y, z);

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = isWalker ? stride * 0.45 : Math.sin(t * 1.8) * 0.04;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = isWalker ? -stride * 0.45 : -Math.sin(t * 1.8) * 0.04;
    }

    if (leftArmRef.current) {
      if (behavior === 'coffee') {
        leftArmRef.current.rotation.set(-0.82 + Math.sin(t * 1.6) * 0.08, 0.08, 0.2);
      } else if (behavior === 'screen') {
        leftArmRef.current.rotation.set(-0.35, 0.18, 0.08);
      } else {
        leftArmRef.current.rotation.set(isWalker ? -stride * 0.38 : 0.1, 0, 0.15);
      }
    }

    if (rightArmRef.current) {
      if (behavior === 'snack') {
        rightArmRef.current.rotation.set(-0.95 + Math.sin(t * 1.4) * 0.05, -0.06, -0.25);
      } else if (behavior === 'screen') {
        rightArmRef.current.rotation.set(-0.22, -0.18, -0.08);
      } else if (behavior === 'coffee') {
        rightArmRef.current.rotation.set(0.18, -0.04, -0.16);
      } else {
        rightArmRef.current.rotation.set(isWalker ? stride * 0.38 : 0.12, 0, -0.15);
      }
    }

    if (headRef.current) {
      headRef.current.rotation.x = behavior === 'screen' ? -0.08 : Math.sin(t * 1.2) * 0.02;
      headRef.current.rotation.y = behavior === 'screen' ? 0.18 : Math.sin(t * 0.9) * 0.04;
    }

    if (luggageRef.current) {
      luggageRef.current.position.z = 0.01 + (isWalker ? Math.sin(t * 3.2) * 0.04 : 0);
      luggageRef.current.rotation.y = isWalker ? Math.sin(t * 1.5) * 0.12 : 0;
    }

    if (cupRef.current) {
      cupRef.current.rotation.z = -0.1 + Math.sin(t * 1.8) * 0.06;
      cupRef.current.position.y = 0.11 + Math.sin(t * 2.4) * 0.01;
    }

    if (snackRef.current) {
      snackRef.current.rotation.x = 0.25 + Math.sin(t * 2.2) * 0.08;
      snackRef.current.rotation.z = 0.08 + Math.sin(t * 1.8) * 0.05;
    }

    if (phoneGlowRef.current?.material) {
      phoneGlowRef.current.material.emissiveIntensity = 0.5 + Math.abs(Math.sin(t * 2.6)) * 0.55;
    }
  });

  const showCup = behavior === 'coffee';
  const showSnack = behavior === 'snack';
  const showPhone = hasPhone || behavior === 'screen';
  const styleSeed = useMemo(() => Math.abs(Math.round(basePosition[0] * 12 + basePosition[2] * 7 + phase * 31 + scale * 17)), [basePosition, phase, scale]);
  const stylePalette = useMemo(() => ({
    sleeve: blendTravelerTone(outfit.top, '#eef4fb', 0.08),
    collar: blendTravelerTone(outfit.top, accent, 0.24),
    hand: blendTravelerTone(skin, '#f6dcc7', 0.08),
    hairStyle: pickTravelerVariant(['short', 'bob', 'bun', 'waves', 'fade'], styleSeed + 3),
    expression: behavior === 'screen' ? 'focused' : behavior === 'coffee' || behavior === 'snack' ? 'smile' : pickTravelerVariant(['smile', 'neutral', 'grin'], styleSeed + 9),
    hasFacialHair: scale > 0.84 && !hasGlasses && styleSeed % 5 === 0,
  }), [outfit.top, accent, skin, styleSeed, behavior, scale, hasGlasses]);

  return (
    <group ref={rootRef} position={basePosition} scale={[scale, scale, scale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0.02]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>

      <group ref={leftLegRef} position={[-0.05, 0.13, 0]}>
        <mesh>
          <capsuleGeometry args={[0.04, 0.24, 6, 12]} />
          <meshStandardMaterial color={outfit.bottom} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.01, 0.018]}>
          <boxGeometry args={[0.04, 0.08, 0.05]} />
          <meshStandardMaterial color={blendTravelerTone(outfit.bottom, '#ffffff', 0.08)} roughness={0.58} />
        </mesh>
        <mesh position={[0, -0.15, 0.015]}>
          <boxGeometry args={[0.055, 0.035, 0.085]} />
          <meshStandardMaterial color="#16181d" roughness={0.35} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.05, 0.13, 0]}>
        <mesh>
          <capsuleGeometry args={[0.04, 0.24, 6, 12]} />
          <meshStandardMaterial color={outfit.bottom} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.01, 0.018]}>
          <boxGeometry args={[0.04, 0.08, 0.05]} />
          <meshStandardMaterial color={blendTravelerTone(outfit.bottom, '#ffffff', 0.08)} roughness={0.58} />
        </mesh>
        <mesh position={[0, -0.15, 0.015]}>
          <boxGeometry args={[0.055, 0.035, 0.085]} />
          <meshStandardMaterial color="#16181d" roughness={0.35} />
        </mesh>
      </group>

      <group position={[0, 0.37, 0]}>
        <mesh>
          <capsuleGeometry args={[0.067, 0.2, 8, 16]} />
          <meshStandardMaterial color={outfit.top} roughness={0.44} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.12, 0.01]}>
          <boxGeometry args={[0.19, 0.035, 0.1]} />
          <meshStandardMaterial color={stylePalette.collar} roughness={0.3} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.11, 0.035]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color={skin} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.03, 0.068]}>
          <boxGeometry args={[0.05, 0.11, 0.014]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.12} transparent opacity={0.2} />
        </mesh>
      </group>

      <group ref={leftArmRef} position={[-0.105, 0.47, 0.02]}>
        <mesh>
          <capsuleGeometry args={[0.033, 0.13, 6, 10]} />
          <meshStandardMaterial color={stylePalette.sleeve} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.1, 0.02]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={stylePalette.hand} roughness={0.35} />
        </mesh>
        {showCup && (
          <group ref={cupRef} position={[-0.005, -0.12, 0.085]}>
            <mesh>
              <cylinderGeometry args={[0.022, 0.026, 0.07, 12]} />
              <meshStandardMaterial color="#f5f1e5" roughness={0.42} />
            </mesh>
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.016, 0.018, 0.03, 12]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} transparent opacity={0.75} />
            </mesh>
          </group>
        )}
      </group>

      <group ref={rightArmRef} position={[0.105, 0.47, 0.02]}>
        <mesh>
          <capsuleGeometry args={[0.033, 0.13, 6, 10]} />
          <meshStandardMaterial color={stylePalette.sleeve} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.1, 0.02]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={stylePalette.hand} roughness={0.35} />
        </mesh>
        {showSnack && (
          <group ref={snackRef} position={[0.005, -0.12, 0.085]}>
            <mesh>
              <boxGeometry args={[0.045, 0.035, 0.03]} />
              <meshStandardMaterial color="#f3d47a" roughness={0.55} />
            </mesh>
            <mesh position={[0.02, 0.012, 0]} rotation={[0, 0, Math.PI / 6]}>
              <coneGeometry args={[0.014, 0.05, 4]} />
              <meshStandardMaterial color="#ff9f43" roughness={0.45} />
            </mesh>
          </group>
        )}
      </group>

      <group ref={headRef} position={[0, 0.68, 0]}>
        <mesh scale={[1, 1.08, 0.95]}>
          <sphereGeometry args={[0.082, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.3} />
        </mesh>
        {[-0.075, 0.075].map((x, index) => (
          <mesh key={`traveler-ear-${index}`} position={[x, 0.005, -0.008]}><sphereGeometry args={[0.017, 8, 8]} /><meshStandardMaterial color={skin} roughness={0.35} /></mesh>
        ))}
        <mesh position={[0, 0.04, -0.01]} scale={[1, stylePalette.hairStyle === 'fade' ? 0.62 : 1, 1]}>
          <sphereGeometry args={[0.086, 16, 16, 0, Math.PI * 2, 0, Math.PI / (stylePalette.hairStyle === 'fade' ? 1.95 : 1.7)]} />
          <meshStandardMaterial color={hair} roughness={0.65} />
        </mesh>
        {stylePalette.hairStyle === 'bob' && [-0.05, 0.05].map((x, index) => (
          <mesh key={`traveler-bob-${index}`} position={[x, 0.01, 0.018]}><sphereGeometry args={[0.028, 8, 8]} /><meshStandardMaterial color={hair} roughness={0.7} /></mesh>
        ))}
        {stylePalette.hairStyle === 'waves' && [-0.045, 0, 0.045].map((x, index) => (
          <mesh key={`traveler-wave-${index}`} position={[x, 0.01, -0.04 + index * 0.01]}><sphereGeometry args={[0.022, 8, 8]} /><meshStandardMaterial color={hair} roughness={0.72} /></mesh>
        ))}
        {stylePalette.hairStyle === 'bun' && <mesh position={[0, 0.06, -0.055]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color={hair} roughness={0.7} /></mesh>}
        <mesh position={[-0.03, 0.01, 0.068]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#f6f6f6" />
        </mesh>
        <mesh position={[0.03, 0.01, 0.068]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#f6f6f6" />
        </mesh>
        {[-0.03, 0.03].map((x, index) => (
          <React.Fragment key={`traveler-eye-detail-${index}`}>
            <mesh position={[x + (index === 0 ? -0.004 : 0.004), 0.01, 0.078]}><sphereGeometry args={[0.005, 8, 8]} /><meshStandardMaterial color="#171c24" roughness={0.18} /></mesh>
            <mesh position={[x, 0.035, 0.064]} rotation={[0.08, 0, index === 0 ? 0.1 : -0.1]}><boxGeometry args={[0.028, 0.004, 0.008]} /><meshStandardMaterial color={blendTravelerTone(hair, '#111111', 0.18)} roughness={0.55} /></mesh>
          </React.Fragment>
        ))}
        <mesh position={[0, -0.005, 0.077]} scale={[0.8, 1, 1]}><sphereGeometry args={[0.01, 8, 8]} /><meshStandardMaterial color={blendTravelerTone(skin, '#c08a67', 0.2)} roughness={0.35} /></mesh>
        <mesh position={[0, stylePalette.expression === 'grin' ? -0.033 : -0.03, 0.075]} rotation={[stylePalette.expression === 'smile' ? 0.2 : 0.04, 0, 0]}>
          <capsuleGeometry args={[0.018, stylePalette.expression === 'focused' ? 0.008 : 0.014, 4, 8]} />
          <meshStandardMaterial color="#c05b5b" roughness={0.45} />
        </mesh>
        {stylePalette.hasFacialHair && <mesh position={[0, -0.022, 0.055]} scale={[1, 0.7, 0.9]}><sphereGeometry args={[0.052, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2.2]} /><meshStandardMaterial color={blendTravelerTone(hair, '#101010', 0.16)} roughness={0.72} /></mesh>}
        {hasGlasses && (
          <group position={[0, 0.015, 0.078]}>
            <mesh position={[-0.022, 0, 0]}>
              <torusGeometry args={[0.018, 0.003, 8, 18]} />
              <meshStandardMaterial color="#0f1116" metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh position={[0.022, 0, 0]}>
              <torusGeometry args={[0.018, 0.003, 8, 18]} />
              <meshStandardMaterial color="#0f1116" metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.018, 0.003, 0.003]} />
              <meshStandardMaterial color="#0f1116" metalness={0.7} roughness={0.2} />
            </mesh>
          </group>
        )}
      </group>

      {showPhone && (
        <group position={[-0.135, 0.52, 0.16]} rotation={[0.3, 0, 0.08]}>
          <mesh>
            <boxGeometry args={[0.04, 0.08, 0.008]} />
            <meshStandardMaterial color="#111826" metalness={0.82} roughness={0.18} />
          </mesh>
          <mesh ref={phoneGlowRef} position={[0, 0, 0.005]}>
            <boxGeometry args={[0.032, 0.062, 0.003]} />
            <meshStandardMaterial color="#7cecff" emissive="#7cecff" emissiveIntensity={0.65} />
          </mesh>
        </group>
      )}

      {hasLuggage && (
        <group ref={luggageRef} position={[0.2, 0.16, 0.01]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.12, 0.2, 0.085]} />
            <meshStandardMaterial color="#243447" roughness={0.42} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0.23, 0]}>
            <boxGeometry args={[0.05, 0.07, 0.01]} />
            <meshStandardMaterial color="#b9c2cc" metalness={0.88} roughness={0.12} />
          </mesh>
          <mesh position={[0.04, 0.11, 0.044]}>
            <boxGeometry args={[0.008, 0.04, 0.02]} />
            <meshStandardMaterial color="#ffdb6e" emissive="#ffdb6e" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function BridgeTransitScreens({ isNight }) {
  const panelRefs = useRef([]);
  const screenConfigs = useMemo(() => ([
    { position: [0, 6.35, 5], rotation: [-0.12, 0, 0], accent: '#73ffd7', feed: TRANSIT_SCREEN_FEEDS[0] },
    { position: [-17.6, 5.05, 10.1], rotation: [0, 0.7, 0], accent: '#71ff7f', feed: TRANSIT_SCREEN_FEEDS[0] },
    { position: [17.6, 5.05, 10.1], rotation: [0, -0.7, 0], accent: '#ffd86b', feed: TRANSIT_SCREEN_FEEDS[1] },
  ]), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    panelRefs.current.forEach((panel, index) => {
      if (!panel?.material) return;
      panel.material.emissiveIntensity = (isNight ? 0.85 : 0.32) + Math.abs(Math.sin(t * 2.1 + index)) * (isNight ? 0.95 : 0.2);
    });
  });

  return (
    <group>
      {screenConfigs.map((screen, index) => (
        <group key={`screen-${index}`} position={screen.position} rotation={screen.rotation}>
          <mesh position={[0, -0.65, -0.04]}>
            <boxGeometry args={[0.12, 1.25, 0.12]} />
            <meshStandardMaterial color="#dce8ef" metalness={0.7} roughness={0.16} />
          </mesh>
          <mesh>
            <boxGeometry args={[1.75, 1.05, 0.08]} />
            <meshStandardMaterial color="#061521" metalness={0.45} roughness={0.24} />
          </mesh>
          <mesh ref={(node) => { panelRefs.current[index] = node; }} position={[0, 0, 0.045]}>
            <planeGeometry args={[1.52, 0.82]} />
            <meshStandardMaterial color="#0e2436" emissive={screen.accent} emissiveIntensity={isNight ? 1.2 : 0.4} />
          </mesh>
          <Text position={[0, 0.32, 0.06]} fontSize={0.11} color={screen.accent} anchorX="center">
            {screen.feed.title}
          </Text>
          {screen.feed.rows.map((row, rowIndex) => (
            <group key={`${screen.feed.title}-${rowIndex}`} position={[-0.62, 0.04 - rowIndex * 0.21, 0.06]}>
              <Text fontSize={0.075} color="#f3fbff">{row[0]}</Text>
              <Text position={[0.76, 0, 0]} fontSize={0.068} color="#83fff0">{row[1]}</Text>
              <Text position={[1.15, 0, 0]} fontSize={0.068} color="#ffe38a">{row[2]}</Text>
            </group>
          ))}
          {isNight && <pointLight position={[0, 0, 0.25]} color={screen.accent} intensity={1.35} distance={6.5} />}
        </group>
      ))}
    </group>
  );
}

// ─── Place Sud — Jardin avec bancs bleus et écrans d'information ───
function SouthParkScreens({ isNight }) {
  const panelRefs = useRef([]);
  const screenConfigs = useMemo(() => ([
    { position: [-5, 3.2, 0], rotation: [0, 0.3, 0], accent: '#00f7ff', feed: TRANSIT_SCREEN_FEEDS[0] },
    { position: [5, 3.2, 0], rotation: [0, -0.3, 0], accent: '#ff61d8', feed: TRANSIT_SCREEN_FEEDS[1] },
  ]), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    panelRefs.current.forEach((panel, i) => {
      if (!panel?.material) return;
      panel.material.emissiveIntensity = (isNight ? 0.85 : 0.32) + Math.abs(Math.sin(t * 2.1 + i)) * (isNight ? 0.95 : 0.2);
    });
  });

  // Bench positions (blue benches around the garden)
  const benches = useMemo(() => ([
    { pos: [-7, 0, 2], rot: 0 },
    { pos: [-3, 0, 4.5], rot: 0 },
    { pos: [3, 0, 4.5], rot: 0 },
    { pos: [7, 0, 2], rot: 0 },
    { pos: [-5, 0, -3], rot: Math.PI },
    { pos: [5, 0, -3], rot: Math.PI },
  ]), []);

  // Simple trees
  const trees = useMemo(() => ([
    [-9, 0, 0], [-6, 0, -2], [6, 0, -2], [9, 0, 0],
    [-3, 0, -4], [3, 0, -4], [0, 0, 4],
  ]), []);

  return (
    <group position={[0, 0.02, 32]}>
      {/* Garden grass area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial color="#7ab866" roughness={0.92} />
      </mesh>
      {/* Decorative border path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[5, 5.4, 32]} />
        <meshStandardMaterial color="#d4d8dc" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Blue Benches */}
      {benches.map((bench, i) => (
        <group key={`south-bench-${i}`} position={bench.pos} rotation={[0, bench.rot, 0]}>
          {/* Seat */}
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[1.6, 0.08, 0.5]} />
            <meshStandardMaterial color="#1a6fc4" roughness={0.4} metalness={0.3} emissive={isNight ? '#1a6fc4' : '#000'} emissiveIntensity={isNight ? 0.3 : 0} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.65, -0.22]}>
            <boxGeometry args={[1.6, 0.42, 0.06]} />
            <meshStandardMaterial color="#1565b8" roughness={0.4} metalness={0.3} emissive={isNight ? '#1565b8' : '#000'} emissiveIntensity={isNight ? 0.3 : 0} />
          </mesh>
          {/* Legs */}
          {[-0.65, 0.65].map((lx, li) => (
            <mesh key={`leg-${li}`} position={[lx, 0.21, 0]}>
              <boxGeometry args={[0.06, 0.42, 0.5]} />
              <meshStandardMaterial color="#b0b8c0" metalness={0.6} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Trees */}
      {trees.map((treePos, i) => (
        <group key={`south-tree-${i}`} position={treePos}>
          {/* Trunk */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 2.4, 8]} />
            <meshStandardMaterial color="#6b4226" roughness={0.85} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[1.1 + (i % 3) * 0.2, 8, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#3d8c3a' : '#4aa847'} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Transit Screens on poles */}
      {screenConfigs.map((screen, index) => (
        <group key={`south-screen-${index}`} position={screen.position} rotation={screen.rotation}>
          {/* Pole */}
          <mesh position={[0, -1.55, -0.04]}>
            <cylinderGeometry args={[0.06, 0.08, 3.1, 8]} />
            <meshStandardMaterial color="#c0c8d0" metalness={0.7} roughness={0.16} />
          </mesh>
          {/* Screen housing */}
          <mesh>
            <boxGeometry args={[1.75, 1.05, 0.08]} />
            <meshStandardMaterial color="#061521" metalness={0.45} roughness={0.24} />
          </mesh>
          {/* Screen panel */}
          <mesh ref={(node) => { panelRefs.current[index] = node; }} position={[0, 0, 0.045]}>
            <planeGeometry args={[1.52, 0.82]} />
            <meshStandardMaterial color="#0e2436" emissive={screen.accent} emissiveIntensity={isNight ? 1.2 : 0.4} />
          </mesh>
          <Text position={[0, 0.32, 0.06]} fontSize={0.11} color={screen.accent} anchorX="center">
            {screen.feed.title}
          </Text>
          {screen.feed.rows.map((row, rowIndex) => (
            <group key={`south-feed-${index}-${rowIndex}`} position={[-0.62, 0.04 - rowIndex * 0.21, 0.06]}>
              <Text fontSize={0.075} color="#f3fbff">{row[0]}</Text>
              <Text position={[0.76, 0, 0]} fontSize={0.068} color="#83fff0">{row[1]}</Text>
              <Text position={[1.15, 0, 0]} fontSize={0.068} color="#ffe38a">{row[2]}</Text>
            </group>
          ))}
          {isNight && <pointLight position={[0, 0, 0.25]} color={screen.accent} intensity={1.35} distance={6.5} />}
        </group>
      ))}

      {/* Garden lights */}
      {isNight && (
        <>
          <pointLight position={[0, 2, 0]} color="#ffe4a0" intensity={1.5} distance={12} />
          <pointLight position={[-6, 2, 0]} color="#c0e8ff" intensity={0.8} distance={8} />
          <pointLight position={[6, 2, 0]} color="#c0e8ff" intensity={0.8} distance={8} />
        </>
      )}
    </group>
  );
}


function BridgeMovingWalkways({ isNight }) {
  const arrowRefs = useRef([]);
  const laneConfigs = useMemo(() => ([
    { x: -1.62, color: '#dff7ff', accent: '#69ebff', direction: 1, label: 'DÉPART' },
    { x: 1.62, color: '#f7f9ff', accent: '#ffd46b', direction: -1, label: 'RETOUR' },
  ]), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    arrowRefs.current.forEach((arrow, index) => {
      if (!arrow) return;
      const laneIndex = index < 9 ? 0 : 1;
      const itemIndex = laneIndex === 0 ? index : index - 9;
      const direction = laneConfigs[laneIndex].direction;
      const start = -9 + itemIndex * 2.2;
      let z = start + ((t * 2.2 * direction) % 20);
      if (direction > 0 && z > 10) z -= 20;
      if (direction < 0 && z < -10) z += 20;
      arrow.position.z = z;
      if (arrow.material?.emissive) {
        arrow.material.emissiveIntensity = (isNight ? 1.2 : 0.45) + Math.abs(Math.sin(t * 2.4 + index)) * (isNight ? 1.2 : 0.25);
      }
    });
  });

  return (
    <group position={[0, 4.28, 9]}>
      {laneConfigs.map((lane, laneIndex) => (
        <group key={`walkway-${laneIndex}`} position={[lane.x, 0, 0]}>
          <mesh position={[0, -0.03, 0]}>
            <boxGeometry args={[1.08, 0.06, 12]} />
            <meshStandardMaterial color="#f6fbff" roughness={0.34} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.005, 0]}>
            <boxGeometry args={[0.84, 0.02, 11.8]} />
            <meshStandardMaterial color={lane.color} emissive={lane.accent} emissiveIntensity={isNight ? 0.55 : 0.12} />
          </mesh>
          {[-0.58, 0.58].map((railX, railIndex) => (
            <group key={`walkway-rail-${laneIndex}-${railIndex}`} position={[railX, 0.38, 0]}>
              <mesh>
                <boxGeometry args={[0.06, 0.82, 11.9]} />
                <meshPhysicalMaterial color="#c8e6f8" transmission={0.65} roughness={0.04} thickness={0.12} transparent opacity={isNight ? 0.72 : 0.58} />
              </mesh>
              <mesh position={[0, 0.46, 0]}>
                <boxGeometry args={[0.08, 0.06, 11.9]} />
                <meshStandardMaterial color="#f5fbff" emissive={lane.accent} emissiveIntensity={isNight ? 1.1 : 0.2} />
              </mesh>
            </group>
          ))}
          {[...Array(5)].map((_, arrowIndex) => (
            <mesh
              key={`walkway-arrow-${laneIndex}-${arrowIndex}`}
              ref={(node) => { arrowRefs.current[laneIndex * 5 + arrowIndex] = node; }}
              position={[0, 0.015, -5 + arrowIndex * 2.2]}
              rotation={[-Math.PI / 2, 0, lane.direction > 0 ? 0 : Math.PI]}
            >
              <coneGeometry args={[0.16, 0.34, 3]} />
              <meshStandardMaterial color={lane.accent} emissive={lane.accent} emissiveIntensity={isNight ? 1.3 : 0.45} />
            </mesh>
          ))}
          <Text position={[0, 0.16, lane.direction > 0 ? -6.5 : 6.5]} fontSize={0.12} color={lane.accent} anchorX="center">
            {lane.label}
          </Text>
        </group>
      ))}

      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[1.55, 0.03, 12]} />
        <meshStandardMaterial color="#f9f7f2" roughness={0.55} />
      </mesh>

      {/* Séparateur vitré central entre les deux voies */}
      <group position={[0, 0.38, 0]}>
        <mesh>
          <boxGeometry args={[0.06, 0.82, 11.9]} />
          <meshPhysicalMaterial color="#c8e6f8" transmission={0.65} roughness={0.04} thickness={0.12} transparent opacity={isNight ? 0.72 : 0.58} />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[0.08, 0.06, 11.9]} />
          <meshStandardMaterial color="#f5fbff" emissive="#ffd46b" emissiveIntensity={isNight ? 1.1 : 0.2} />
        </mesh>
      </group>
    </group>
  );
}


// ─── Bridge Ramp Walkways — répliques exactes inclinées des tapis roulants ───
function BridgeSimpleRamps({ isNight }) {
  const arrowRefs = useRef([]);
  const bridgeY = 4.28;
  const groundY = 0.06;
  const hDist = 5;
  const vDist = bridgeY - groundY;
  const slopeAngle = Math.atan2(vDist, hDist);
  const slopeLen = Math.sqrt(hDist * hDist + vDist * vDist);
  const midY = (bridgeY + groundY) / 2;

  const laneConfigs = useMemo(() => ([
    { x: -1.62, color: '#dff7ff', accent: '#69ebff', direction: 1, label: 'MONTÉE' },
    { x: 1.62, color: '#f7f9ff', accent: '#ffd46b', direction: -1, label: 'DESCENTE' },
  ]), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    arrowRefs.current.forEach((arrow, index) => {
      if (!arrow) return;
      const rampIndex = Math.floor(index / 10);
      const laneIndex = Math.floor((index % 10) / 5);
      const arrowIndex = index % 5;
      const direction = laneConfigs[laneIndex].direction;
      const start = -slopeLen / 2 + 0.5 + arrowIndex * (slopeLen - 1) / 4;
      let z = start + ((t * 1.8 * direction) % slopeLen);
      if (direction > 0 && z > slopeLen / 2) z -= slopeLen;
      if (direction < 0 && z < -slopeLen / 2) z += slopeLen;
      arrow.position.z = z;
      if (arrow.material?.emissive) {
        arrow.material.emissiveIntensity = (isNight ? 1.2 : 0.45) + Math.abs(Math.sin(t * 2.4 + index)) * (isNight ? 1.2 : 0.25);
      }
    });
  });

  const ramps = [
    { posZ: -4.5, rot: [-slopeAngle, 0, 0], rampIdx: 0, labelEnd: -1 },
    { posZ: 17.5, rot: [slopeAngle, 0, 0], rampIdx: 1, labelEnd: 1 },
  ];

  return (
    <group>
      {ramps.map(({ posZ, rot, rampIdx, labelEnd }) => (
        <group key={`ramp-${rampIdx}`} position={[0, midY, posZ]} rotation={rot}>
          {laneConfigs.map((lane, laneIndex) => (
            <group key={`ramp-lane-${rampIdx}-${laneIndex}`} position={[lane.x, 0, 0]}>
              <mesh position={[0, -0.03, 0]}>
                <boxGeometry args={[1.08, 0.06, slopeLen]} />
                <meshStandardMaterial color="#f6fbff" roughness={0.34} metalness={0.2} />
              </mesh>
              <mesh position={[0, -0.005, 0]}>
                <boxGeometry args={[0.84, 0.02, slopeLen - 0.2]} />
                <meshStandardMaterial color={lane.color} emissive={lane.accent} emissiveIntensity={isNight ? 0.55 : 0.12} />
              </mesh>
              {[-0.58, 0.58].map((railX, railIndex) => (
                <group key={`ramp-rail-${rampIdx}-${laneIndex}-${railIndex}`} position={[railX, 0.38, 0]}>
                  <mesh>
                    <boxGeometry args={[0.06, 0.82, slopeLen - 0.1]} />
                    <meshPhysicalMaterial color="#c8e6f8" transmission={0.65} roughness={0.04} thickness={0.12} transparent opacity={isNight ? 0.72 : 0.58} />
                  </mesh>
                  <mesh position={[0, 0.46, 0]}>
                    <boxGeometry args={[0.08, 0.06, slopeLen - 0.1]} />
                    <meshStandardMaterial color="#f5fbff" emissive={lane.accent} emissiveIntensity={isNight ? 1.1 : 0.2} />
                  </mesh>
                </group>
              ))}
              {[...Array(5)].map((_, arrowIndex) => (
                <mesh
                  key={`ramp-arrow-${rampIdx}-${laneIndex}-${arrowIndex}`}
                  ref={(node) => { arrowRefs.current[rampIdx * 10 + laneIndex * 5 + arrowIndex] = node; }}
                  position={[0, 0.015, -slopeLen / 2 + 0.5 + arrowIndex * (slopeLen - 1) / 4]}
                  rotation={[-Math.PI / 2, 0, lane.direction > 0 ? 0 : Math.PI]}
                >
                  <coneGeometry args={[0.16, 0.34, 3]} />
                  <meshStandardMaterial color={lane.accent} emissive={lane.accent} emissiveIntensity={isNight ? 1.3 : 0.45} />
                </mesh>
              ))}
              <Text position={[0, 0.16, labelEnd * (slopeLen / 2 - 0.4)]} fontSize={0.12} color={lane.accent} anchorX="center">
                {lane.label}
              </Text>
            </group>
          ))}
          <mesh position={[0, -0.005, 0]}>
            <boxGeometry args={[1.55, 0.03, slopeLen]} />
            <meshStandardMaterial color="#f9f7f2" roughness={0.55} />
          </mesh>
          <group position={[0, 0.38, 0]}>
            <mesh>
              <boxGeometry args={[0.06, 0.82, slopeLen - 0.1]} />
              <meshPhysicalMaterial color="#c8e6f8" transmission={0.65} roughness={0.04} thickness={0.12} transparent opacity={isNight ? 0.72 : 0.58} />
            </mesh>
            <mesh position={[0, 0.46, 0]}>
              <boxGeometry args={[0.08, 0.06, slopeLen - 0.1]} />
              <meshStandardMaterial color="#f5fbff" emissive="#ffd46b" emissiveIntensity={isNight ? 1.1 : 0.2} />
            </mesh>
          </group>
        </group>
      ))}
      {/* ═══ ENTRÉES ESCALATOR — NORD (z=-7) et SUD (z=20.5) ═══ */}
      {[
        { z: -7, sign: 'ACCÈS PASSERELLE', faceZ: 1 },
        { z: 20.5, sign: 'ACCÈS PASSERELLE', faceZ: -1 },
      ].map((entry, ei) => (
        <group key={`esc-entry-${ei}`} position={[0, 0, entry.z]}>
          {/* Plateforme d'entrée — GRIS ACIER brillant entre les poteaux et la rampe */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[6.2, 0.24, 3.2]} />
            <meshStandardMaterial color="#6e7a88" roughness={0.12} metalness={0.55} />
          </mesh>
          {/* Rebords lumineux de la plateforme */}
          <mesh position={[0, 0.26, entry.faceZ * -1.4]}>
            <boxGeometry args={[6.2, 0.06, 0.12]} />
            <meshStandardMaterial color="#69ebff" emissive="#69ebff" emissiveIntensity={isNight ? 2.5 : 0.6} />
          </mesh>

          {/* Plaques de peigne — bandes métalliques dentées */}
          {laneConfigs.map((lane, li) => (
            <mesh key={`comb-${li}`} position={[lane.x, 0.26, entry.faceZ * -0.8]}>
              <boxGeometry args={[1.12, 0.04, 0.35]} />
              <meshStandardMaterial color="#a8b0b8" roughness={0.15} metalness={0.75} />
            </mesh>
          ))}

          {/* Jupes latérales métalliques — panneaux arrondis */}
          {laneConfigs.map((lane, li) => (
            <group key={`skirt-${li}`}>
              {[-0.62, 0.62].map((sx, si) => (
                <mesh key={`skirt-p-${si}`} position={[lane.x + sx, 0.55, 0]}>
                  <boxGeometry args={[0.08, 0.9, 2.6]} />
                  <meshStandardMaterial color={isNight ? '#2a3444' : '#c8d4de'} roughness={0.15} metalness={0.55} />
                </mesh>
              ))}
            </group>
          ))}
          {/* Jupe séparateur central */}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.08, 0.9, 2.6]} />
            <meshStandardMaterial color={isNight ? '#2a3444' : '#c8d4de'} roughness={0.15} metalness={0.55} />
          </mesh>

          {/* ═══ ARCHE D'ENTRÉE — portique visible de loin ═══ */}
          {/* Piliers gauche et droit */}
          {[-2.9, 2.9].map((px, pi) => (
            <group key={`arch-pillar-${pi}`} position={[px, 0, entry.faceZ * -1.3]}>
              <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[0.2, 3.2, 0.2]} />
                <meshStandardMaterial color={isNight ? '#2a3444' : '#b8c4d0'} roughness={0.12} metalness={0.65} />
              </mesh>
              {/* LED verticale sur le pilier */}
              <mesh position={[pi === 0 ? 0.12 : -0.12, 1.6, 0]}>
                <boxGeometry args={[0.04, 2.8, 0.08]} />
                <meshStandardMaterial
                  color={pi === 0 ? '#69ebff' : '#ffd46b'}
                  emissive={pi === 0 ? '#69ebff' : '#ffd46b'}
                  emissiveIntensity={isNight ? 3.0 : 0.8}
                />
              </mesh>
            </group>
          ))}
          {/* Traverse horizontale de l'arche */}
          <mesh position={[0, 3.3, entry.faceZ * -1.3]}>
            <boxGeometry args={[6.0, 0.22, 0.3]} />
            <meshStandardMaterial color={isNight ? '#2a3444' : '#b8c4d0'} roughness={0.12} metalness={0.65} />
          </mesh>
          {/* LED sur la traverse */}
          <mesh position={[0, 3.2, entry.faceZ * -1.3]}>
            <boxGeometry args={[5.6, 0.05, 0.1]} />
            <meshStandardMaterial
              color="#69ebff"
              emissive="#69ebff"
              emissiveIntensity={isNight ? 3.0 : 0.8}
            />
          </mesh>
          {/* Panneau de signalétique sur l'arche */}
          <Text
            position={[0, 3.55, entry.faceZ * -1.3]}
            fontSize={0.22}
            color={isNight ? '#ffffff' : '#1a2030'}
            anchorX="center"
            fontWeight="bold"
          >
            {entry.sign}
          </Text>

          {/* Bande LED au sol — bien visible */}
          <mesh position={[0, 0.26, entry.faceZ * -1.0]}>
            <boxGeometry args={[5.4, 0.03, 0.14]} />
            <meshStandardMaterial
              color="#69ebff"
              emissive="#69ebff"
              emissiveIntensity={isNight ? 2.5 : 0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LowerConcoursePassengerFlow({ isMobile = false }) {
  const travelers = useMemo(() => ([
    { start: [-7.4, 0.02, 20.6], end: [7.4, 0.02, 20.6], phase: 0.2, speed: 0.22, outfit: PREMIUM_TRAVELER_OUTFITS[0], skin: PREMIUM_TRAVELER_SKIN_TONES[1], hair: PREMIUM_TRAVELER_HAIR[2], accent: '#72f4ff', scale: 0.82, hasLuggage: true },
    { start: [6.8, 0.02, 23.1], end: [-6.8, 0.02, 23.1], phase: 1.4, speed: 0.2, outfit: PREMIUM_TRAVELER_OUTFITS[2], skin: PREMIUM_TRAVELER_SKIN_TONES[4], hair: PREMIUM_TRAVELER_HAIR[0], accent: '#ffd36b', scale: 0.8, hasPhone: true },
    { start: [-5.5, 0.02, 26.6], end: [5.5, 0.02, 26.6], phase: 2.1, speed: 0.18, outfit: PREMIUM_TRAVELER_OUTFITS[5], skin: PREMIUM_TRAVELER_SKIN_TONES[6], hair: PREMIUM_TRAVELER_HAIR[7], accent: '#ff82d7', scale: 0.79 },
    { start: [4.2, 0.02, 29.2], end: [-4.2, 0.02, 29.2], phase: 3.2, speed: 0.17, outfit: PREMIUM_TRAVELER_OUTFITS[6], skin: PREMIUM_TRAVELER_SKIN_TONES[0], hair: PREMIUM_TRAVELER_HAIR[4], accent: '#7cff9a', scale: 0.78, hasPhone: true },
  ]), []);

  const activeTravelers = isMobile ? travelers.slice(0, 2) : travelers;

  return (
    <group>
      {activeTravelers.map((traveler, index) => (
        <RearAccessTraveler key={`lower-concourse-traveler-${index}`} {...traveler} />
      ))}
    </group>
  );
}

function RearAccessTraveler({
  start,
  end,
  phase = 0,
  speed = 0.18,
  outfit,
  skin,
  hair,
  accent,
  scale = 0.84,
  hasLuggage = false,
  hasPhone = false,
}) {
  const rootRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const headRef = useRef();
  const luggageRef = useRef();
  const styleSeed = useMemo(() => Math.abs(Math.round(start[0] * 9 + end[2] * 6 + phase * 29 + scale * 17)), [start, end, phase, scale]);
  const stylePalette = useMemo(() => ({
    sleeve: blendTravelerTone(outfit.top, '#eef4fb', 0.08),
    collar: blendTravelerTone(outfit.top, accent, 0.24),
    hand: blendTravelerTone(skin, '#f6dcc7', 0.08),
    hairStyle: pickTravelerVariant(['short', 'bob', 'bun', 'waves', 'fade'], styleSeed + 3),
  }), [outfit.top, accent, skin, styleSeed]);

  useFrame(({ clock }) => {
    if (!rootRef.current) return;

    const t = clock.getElapsedTime() * speed + phase;
    const pingPong = (Math.sin(t) + 1) / 2;
    const x = start[0] + (end[0] - start[0]) * pingPong;
    const y = start[1] + (end[1] - start[1]) * pingPong + Math.abs(Math.sin(t * 4.2)) * 0.035;
    const z = start[2] + (end[2] - start[2]) * pingPong;
    const dx = (end[0] - start[0]) * Math.cos(t);
    const dz = (end[2] - start[2]) * Math.cos(t);
    const stride = Math.sin(t * 5.2);

    rootRef.current.position.set(x, y, z);
    rootRef.current.rotation.y = Math.atan2(dx || 0.001, dz || 0.001);

    if (leftLegRef.current) leftLegRef.current.rotation.x = stride * 0.42;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -stride * 0.42;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -stride * 0.34;
    if (rightArmRef.current) rightArmRef.current.rotation.x = stride * 0.34;
    if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.4) * 0.04;
    if (luggageRef.current) luggageRef.current.rotation.y = Math.sin(t * 2.2) * 0.1;
  });

  return (
    <group ref={rootRef} position={start} scale={[scale, scale, scale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0.02]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.14} />
      </mesh>

      <group ref={leftLegRef} position={[-0.05, 0.13, 0]}>
        <mesh>
          <capsuleGeometry args={[0.04, 0.24, 6, 12]} />
          <meshStandardMaterial color={outfit.bottom} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.01, 0.018]}><boxGeometry args={[0.04, 0.08, 0.05]} /><meshStandardMaterial color={blendTravelerTone(outfit.bottom, '#ffffff', 0.08)} roughness={0.58} /></mesh>
      </group>
      <group ref={rightLegRef} position={[0.05, 0.13, 0]}>
        <mesh>
          <capsuleGeometry args={[0.04, 0.24, 6, 12]} />
          <meshStandardMaterial color={outfit.bottom} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.01, 0.018]}><boxGeometry args={[0.04, 0.08, 0.05]} /><meshStandardMaterial color={blendTravelerTone(outfit.bottom, '#ffffff', 0.08)} roughness={0.58} /></mesh>
      </group>

      <group position={[0, 0.37, 0]}>
        <mesh>
          <capsuleGeometry args={[0.067, 0.2, 8, 16]} />
          <meshStandardMaterial color={outfit.top} roughness={0.44} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.12, 0.01]}><boxGeometry args={[0.19, 0.035, 0.1]} /><meshStandardMaterial color={stylePalette.collar} roughness={0.3} metalness={0.04} /></mesh>
        <mesh position={[0, -0.03, 0.068]}>
          <boxGeometry args={[0.05, 0.11, 0.014]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.18} transparent opacity={0.24} />
        </mesh>
      </group>

      <group ref={leftArmRef} position={[-0.105, 0.47, 0.02]}>
        <mesh>
          <capsuleGeometry args={[0.033, 0.13, 6, 10]} />
          <meshStandardMaterial color={stylePalette.sleeve} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.1, 0.02]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color={stylePalette.hand} roughness={0.35} /></mesh>
      </group>
      <group ref={rightArmRef} position={[0.105, 0.47, 0.02]}>
        <mesh>
          <capsuleGeometry args={[0.033, 0.13, 6, 10]} />
          <meshStandardMaterial color={stylePalette.sleeve} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.1, 0.02]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color={stylePalette.hand} roughness={0.35} /></mesh>
      </group>

      <group ref={headRef} position={[0, 0.68, 0]}>
        <mesh scale={[1, 1.08, 0.95]}>
          <sphereGeometry args={[0.082, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.3} />
        </mesh>
        {[-0.075, 0.075].map((x, index) => (
          <mesh key={`rear-ear-${index}`} position={[x, 0.005, -0.008]}><sphereGeometry args={[0.017, 8, 8]} /><meshStandardMaterial color={skin} roughness={0.35} /></mesh>
        ))}
        <mesh position={[0, 0.04, -0.01]} scale={[1, stylePalette.hairStyle === 'fade' ? 0.62 : 1, 1]}>
          <sphereGeometry args={[0.086, 16, 16, 0, Math.PI * 2, 0, Math.PI / (stylePalette.hairStyle === 'fade' ? 1.95 : 1.7)]} />
          <meshStandardMaterial color={hair} roughness={0.65} />
        </mesh>
        {stylePalette.hairStyle === 'bob' && [-0.05, 0.05].map((x, index) => (
          <mesh key={`rear-bob-${index}`} position={[x, 0.01, 0.018]}><sphereGeometry args={[0.028, 8, 8]} /><meshStandardMaterial color={hair} roughness={0.7} /></mesh>
        ))}
        {stylePalette.hairStyle === 'waves' && [-0.045, 0, 0.045].map((x, index) => (
          <mesh key={`rear-wave-${index}`} position={[x, 0.01, -0.04 + index * 0.01]}><sphereGeometry args={[0.022, 8, 8]} /><meshStandardMaterial color={hair} roughness={0.72} /></mesh>
        ))}
        {stylePalette.hairStyle === 'bun' && <mesh position={[0, 0.06, -0.055]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color={hair} roughness={0.7} /></mesh>}
        <mesh position={[-0.03, 0.01, 0.068]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color="#f6f6f6" /></mesh>
        <mesh position={[0.03, 0.01, 0.068]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color="#f6f6f6" /></mesh>
        {[-0.03, 0.03].map((x, index) => (
          <React.Fragment key={`rear-eye-${index}`}>
            <mesh position={[x + (index === 0 ? -0.004 : 0.004), 0.01, 0.078]}><sphereGeometry args={[0.005, 8, 8]} /><meshStandardMaterial color="#171c24" roughness={0.18} /></mesh>
            <mesh position={[x, 0.035, 0.064]} rotation={[0.08, 0, index === 0 ? 0.1 : -0.1]}><boxGeometry args={[0.028, 0.004, 0.008]} /><meshStandardMaterial color={blendTravelerTone(hair, '#111111', 0.18)} roughness={0.55} /></mesh>
          </React.Fragment>
        ))}
        <mesh position={[0, -0.005, 0.077]} scale={[0.8, 1, 1]}><sphereGeometry args={[0.01, 8, 8]} /><meshStandardMaterial color={blendTravelerTone(skin, '#c08a67', 0.2)} roughness={0.35} /></mesh>
        <mesh position={[0, -0.03, 0.075]} rotation={[0.15, 0, 0]}><capsuleGeometry args={[0.018, 0.014, 4, 8]} /><meshStandardMaterial color="#c05b5b" roughness={0.45} /></mesh>
      </group>

      {hasPhone && (
        <group position={[-0.12, 0.52, 0.12]} rotation={[0.3, 0, 0.08]}>
          <mesh>
            <boxGeometry args={[0.04, 0.08, 0.008]} />
            <meshStandardMaterial color="#111826" metalness={0.82} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.032, 0.062, 0.003]} />
            <meshStandardMaterial color="#7cecff" emissive="#7cecff" emissiveIntensity={0.7} />
          </mesh>
        </group>
      )}

      {hasLuggage && (
        <group ref={luggageRef} position={[0.2, 0.16, 0.01]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.12, 0.2, 0.085]} />
            <meshStandardMaterial color="#243447" roughness={0.42} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0.23, 0]}>
            <boxGeometry args={[0.05, 0.07, 0.01]} />
            <meshStandardMaterial color="#b9c2cc" metalness={0.88} roughness={0.12} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function RearAccessPassengerFlow({ isMobile = false }) {
  const travelers = useMemo(() => ([
    { start: [-4.55, 0.34, 31.9], end: [-4.55, 4.16, 21.3], phase: 0.2, speed: 0.2, outfit: PREMIUM_TRAVELER_OUTFITS[0], skin: PREMIUM_TRAVELER_SKIN_TONES[0], hair: PREMIUM_TRAVELER_HAIR[1], accent: '#72f4ff', scale: 0.78, hasLuggage: true },
    { start: [4.55, 4.16, 21.3], end: [4.55, 0.34, 31.9], phase: 1.5, speed: 0.18, outfit: PREMIUM_TRAVELER_OUTFITS[3], skin: PREMIUM_TRAVELER_SKIN_TONES[5], hair: PREMIUM_TRAVELER_HAIR[0], accent: '#ffd36b', scale: 0.78, hasPhone: true },
    { start: [-1.7, 4.14, 21.3], end: [-1.7, 0.34, 31.9], phase: 2.2, speed: 0.17, outfit: PREMIUM_TRAVELER_OUTFITS[6], skin: PREMIUM_TRAVELER_SKIN_TONES[4], hair: PREMIUM_TRAVELER_HAIR[5], accent: '#72f4ff', scale: 0.8 },
    { start: [1.7, 0.34, 31.9], end: [1.7, 4.14, 21.3], phase: 3.1, speed: 0.16, outfit: PREMIUM_TRAVELER_OUTFITS[2], skin: PREMIUM_TRAVELER_SKIN_TONES[2], hair: PREMIUM_TRAVELER_HAIR[2], accent: '#ff82d7', scale: 0.8, hasPhone: true },
  ]), []);

  const activeTravelers = isMobile ? travelers.slice(0, 2) : travelers;

  return (
    <group>
      {activeTravelers.map((traveler, index) => (
        <RearAccessTraveler key={`rear-access-traveler-${index}`} {...traveler} />
      ))}
    </group>
  );
}

function PremiumBridgeLife({ isMobile = false }) {
  const bridgeTravelers = useMemo(() => ([
    { basePosition: [-1.62, 4.31, 11.9], outfit: PREMIUM_TRAVELER_OUTFITS[0], skin: PREMIUM_TRAVELER_SKIN_TONES[0], hair: PREMIUM_TRAVELER_HAIR[0], behavior: 'walker', movementAxis: 'z', movementRange: 7.8, movementSpeed: 0.58, phase: 0.2, accent: '#74f6ff', hasLuggage: true, scale: 0.9 },
    { basePosition: [1.62, 4.31, 12.2], outfit: PREMIUM_TRAVELER_OUTFITS[2], skin: PREMIUM_TRAVELER_SKIN_TONES[3], hair: PREMIUM_TRAVELER_HAIR[2], behavior: 'return-walk', movementAxis: 'z', movementRange: 7.5, movementSpeed: 0.5, phase: 1.6, accent: '#ffd76a', hasPhone: true, scale: 0.88 },
    { basePosition: [0.05, 4.31, 9.4], outfit: PREMIUM_TRAVELER_OUTFITS[5], skin: PREMIUM_TRAVELER_SKIN_TONES[5], hair: PREMIUM_TRAVELER_HAIR[4], behavior: 'screen', movementAxis: 'z', movementRange: 0.16, movementSpeed: 0.32, phase: 2.1, accent: '#ff78e1', hasGlasses: true, scale: 0.85, baseRotation: 0.1 },
    { basePosition: [-0.35, 4.31, 15.6], outfit: PREMIUM_TRAVELER_OUTFITS[7], skin: PREMIUM_TRAVELER_SKIN_TONES[6], hair: PREMIUM_TRAVELER_HAIR[6], behavior: 'coffee', movementAxis: 'z', movementRange: 0.14, movementSpeed: 0.3, phase: 2.9, accent: '#ffaa55', scale: 0.82, baseRotation: 0.32, hasGlasses: true },
    { basePosition: [0.35, 4.31, 16.4], outfit: PREMIUM_TRAVELER_OUTFITS[3], skin: PREMIUM_TRAVELER_SKIN_TONES[7], hair: PREMIUM_TRAVELER_HAIR[7], behavior: 'snack', movementAxis: 'z', movementRange: 0.12, movementSpeed: 0.28, phase: 1.2, accent: '#ff7ba5', scale: 0.82, baseRotation: -0.42 },
    { basePosition: [-14.35, 4.08, 10.2], outfit: PREMIUM_TRAVELER_OUTFITS[1], skin: PREMIUM_TRAVELER_SKIN_TONES[1], hair: PREMIUM_TRAVELER_HAIR[1], behavior: 'walker', movementAxis: 'z', movementRange: 5.5, movementSpeed: 0.54, phase: 0.8, accent: '#65f0ff', hasLuggage: true, scale: 0.82 },
    { basePosition: [-15.55, 4.08, 8.8], outfit: PREMIUM_TRAVELER_OUTFITS[6], skin: PREMIUM_TRAVELER_SKIN_TONES[4], hair: PREMIUM_TRAVELER_HAIR[5], behavior: 'screen', movementAxis: 'z', movementRange: 0.14, movementSpeed: 0.26, phase: 0.6, accent: '#69ff8a', scale: 0.82, hasPhone: true, baseRotation: 0.48 },
    { basePosition: [14.35, 4.08, 10.7], outfit: PREMIUM_TRAVELER_OUTFITS[4], skin: PREMIUM_TRAVELER_SKIN_TONES[2], hair: PREMIUM_TRAVELER_HAIR[3], behavior: 'walker', movementAxis: 'z', movementRange: 5.6, movementSpeed: 0.52, phase: 2.4, accent: '#55ffd7', hasPhone: true, scale: 0.84 },
    { basePosition: [15.55, 4.08, 14.5], outfit: PREMIUM_TRAVELER_OUTFITS[3], skin: PREMIUM_TRAVELER_SKIN_TONES[7], hair: PREMIUM_TRAVELER_HAIR[7], behavior: 'coffee', movementAxis: 'z', movementRange: 0.12, movementSpeed: 0.24, phase: 1.2, accent: '#ff7ba5', scale: 0.8, baseRotation: -0.62 },
  ]), []);

  const activeTravelers = isMobile ? bridgeTravelers.slice(0, 4) : bridgeTravelers;

  return (
    <group>
      {activeTravelers.map((traveler, index) => (
        <AnimatedPremiumTraveler key={`bridge-traveler-${index}`} {...traveler} />
      ))}
    </group>
  );
}

function PremiumPlazaLife({ isMobile = false }) {
  const plazaTravelers = useMemo(() => ([
    { basePosition: [-6.8, 0.02, 21.6], outfit: PREMIUM_TRAVELER_OUTFITS[0], skin: PREMIUM_TRAVELER_SKIN_TONES[5], hair: PREMIUM_TRAVELER_HAIR[1], behavior: 'coffee', movementAxis: 'x', movementRange: 0.2, movementSpeed: 0.28, phase: 0.4, accent: '#ffb05d', scale: 0.86, baseRotation: 1.3 },
    { basePosition: [6.7, 0.02, 21.3], outfit: PREMIUM_TRAVELER_OUTFITS[2], skin: PREMIUM_TRAVELER_SKIN_TONES[2], hair: PREMIUM_TRAVELER_HAIR[0], behavior: 'snack', movementAxis: 'x', movementRange: 0.16, movementSpeed: 0.3, phase: 2.2, accent: '#ffd86a', scale: 0.88, baseRotation: -1.45 },
    { basePosition: [-11.4, 0.02, 29.3], outfit: PREMIUM_TRAVELER_OUTFITS[5], skin: PREMIUM_TRAVELER_SKIN_TONES[0], hair: PREMIUM_TRAVELER_HAIR[4], behavior: 'walker', movementAxis: 'x', movementRange: 2.6, movementSpeed: 0.34, phase: 1.8, accent: '#70e4ff', hasLuggage: true, scale: 0.84 },
    { basePosition: [-3.8, 0.02, 29.7], outfit: PREMIUM_TRAVELER_OUTFITS[7], skin: PREMIUM_TRAVELER_SKIN_TONES[3], hair: PREMIUM_TRAVELER_HAIR[2], behavior: 'screen', movementAxis: 'x', movementRange: 0.12, movementSpeed: 0.24, phase: 0.8, accent: '#ff78d7', scale: 0.86, hasPhone: true, baseRotation: Math.PI },
    { basePosition: [-25.8, 0.02, 18.9], outfit: PREMIUM_TRAVELER_OUTFITS[1], skin: PREMIUM_TRAVELER_SKIN_TONES[1], hair: PREMIUM_TRAVELER_HAIR[6], behavior: 'coffee', movementAxis: 'z', movementRange: 0.16, movementSpeed: 0.26, phase: 2.7, accent: '#67f8ff', scale: 0.8, baseRotation: 0.7 },
    { basePosition: [22.8, 0.02, 18.6], outfit: PREMIUM_TRAVELER_OUTFITS[4], skin: PREMIUM_TRAVELER_SKIN_TONES[7], hair: PREMIUM_TRAVELER_HAIR[3], behavior: 'screen', movementAxis: 'z', movementRange: 0.14, movementSpeed: 0.22, phase: 1.1, accent: '#91ff80', scale: 0.82, hasGlasses: true, baseRotation: -0.9 },
    { basePosition: [4.5, 0.02, 29.5], outfit: PREMIUM_TRAVELER_OUTFITS[6], skin: PREMIUM_TRAVELER_SKIN_TONES[4], hair: PREMIUM_TRAVELER_HAIR[7], behavior: 'walker', movementAxis: 'x', movementRange: 2.1, movementSpeed: 0.36, phase: 1.5, accent: '#5dffe9', scale: 0.82 },
    { basePosition: [13.6, 0.02, 29.4], outfit: PREMIUM_TRAVELER_OUTFITS[3], skin: PREMIUM_TRAVELER_SKIN_TONES[6], hair: PREMIUM_TRAVELER_HAIR[5], behavior: 'walker', movementAxis: 'x', movementRange: 2.2, movementSpeed: 0.35, phase: 2.4, accent: '#ff86af', scale: 0.8, hasPhone: true },
  ]), []);

  const activeTravelers = isMobile ? plazaTravelers.slice(0, 4) : plazaTravelers;

  return (
    <group>
      {activeTravelers.map((traveler, index) => (
        <AnimatedPremiumTraveler key={`plaza-traveler-${index}`} {...traveler} />
      ))}
    </group>
  );
}

function PremiumTransitAmenities({ isNight }) {
  const kiosks = useMemo(() => ([
    { position: [0, 0.4, 28], width: 1.25, depth: 0.58, height: 0.58, label: 'KIOSQUE', accent: '#74f8ff' },
    { position: [-12, 0.4, 35.1], width: 4.1, depth: 2.1, height: 2.7, label: 'BILLETS', accent: '#67f8ff', frontText: 'Retrait • Infos' },
    { position: [-2.6, 0.4, 35.1], width: 3.7, depth: 2.1, height: 2.7, label: 'BANQUE', accent: '#8cd1ff', frontText: 'ATM • Change' },
    { position: [7, 0.4, 35.1], width: 4.1, depth: 2.1, height: 2.7, label: 'SHOP', accent: '#ff88d8', frontText: 'Presse • Cadeaux' },
    { position: [17, 0.4, 35.1], width: 4.5, depth: 2.1, height: 2.7, label: 'LOUNGE', accent: '#8dff98', frontText: 'Café • Snacks' },
  ]), []);

  const benches = useMemo(() => ([
    [-7.2, 0.02, 24.1], [7.2, 0.02, 24.1], [-12, 0.02, 32.4], [-2.6, 0.02, 32.4], [7, 0.02, 32.4], [17, 0.02, 32.4],
  ]), []);

  const bins = useMemo(() => ([
    [-9.2, 0.02, 24.1], [9.2, 0.02, 24.1], [-14.5, 0.02, 33.7], [0, 0.02, 33.7], [10.2, 0.02, 33.7], [20.2, 0.02, 33.7],
  ]), []);

  return (
    <group>
      {kiosks.map((kiosk, index) => (
        <group key={`kiosk-${index}`} position={kiosk.position}>
          <mesh position={[0, kiosk.height ? kiosk.height / 2 : 0.25, 0]}>
            <boxGeometry args={[kiosk.width, kiosk.height || 0.5, kiosk.depth]} />
            <meshStandardMaterial color="#112132" metalness={0.45} roughness={0.25} />
          </mesh>
          <mesh position={[0, (kiosk.height || 0.5) + 0.08, 0]}>
            <boxGeometry args={[kiosk.width + 0.08, 0.1, kiosk.depth + 0.08]} />
            <meshStandardMaterial color={kiosk.accent} emissive={kiosk.accent} emissiveIntensity={isNight ? 1.4 : 0.45} />
          </mesh>
          <mesh position={[0, kiosk.height ? kiosk.height * 0.58 : 0.28, kiosk.depth / 2 + 0.04]}>
            <planeGeometry args={[Math.max(1.5, kiosk.width * 0.8), kiosk.height ? 0.7 : 0.34]} />
            <meshStandardMaterial color="#071421" emissive={kiosk.accent} emissiveIntensity={isNight ? 0.4 : 0.12} />
          </mesh>
          <Text position={[0, kiosk.height ? kiosk.height * 0.82 : 0.28, kiosk.depth / 2 + 0.05]} fontSize={kiosk.height ? 0.18 : 0.12} color="#ffffff" anchorX="center">
            {kiosk.label}
          </Text>
          {kiosk.frontText && (
            <Text position={[0, kiosk.height ? kiosk.height * 0.58 : 0.12, kiosk.depth / 2 + 0.05]} fontSize={0.09} color={kiosk.accent} anchorX="center">
              {kiosk.frontText}
            </Text>
          )}
          {kiosk.height && [-0.95, 0, 0.95].map((offset, atmIndex) => (
            <group key={`atm-${index}-${atmIndex}`} position={[offset, 0.8, kiosk.depth / 2 + 0.04]}>
              <mesh>
                <boxGeometry args={[0.42, 0.72, 0.08]} />
                <meshStandardMaterial color="#d8e5ec" roughness={0.2} metalness={0.45} />
              </mesh>
              <mesh position={[0, 0.1, 0.05]}>
                <planeGeometry args={[0.24, 0.18]} />
                <meshStandardMaterial color="#0f2432" emissive={kiosk.accent} emissiveIntensity={isNight ? 0.9 : 0.22} />
              </mesh>
            </group>
          ))}
          {isNight && <pointLight position={[0, 0.55, 0.18]} color={kiosk.accent} intensity={0.8} distance={4.6} />}
        </group>
      ))}

      {benches.map(([x, y, z], index) => (
        <group key={`premium-bench-${index}`} position={[x, y, z]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.4, 0.08, 0.45]} />
            <meshStandardMaterial color="#1a5276" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.55, -0.18]}>
            <boxGeometry args={[1.4, 0.45, 0.06]} />
            <meshStandardMaterial color="#1a5276" roughness={0.5} />
          </mesh>
          {[-0.58, 0.58].map((leg, legIndex) => (
            <mesh key={`premium-bench-leg-${index}-${legIndex}`} position={[leg, 0.15, 0]}>
              <boxGeometry args={[0.08, 0.3, 0.36]} />
              <meshStandardMaterial color="#2f353c" metalness={0.58} roughness={0.24} />
            </mesh>
          ))}
        </group>
      ))}

      {bins.map(([x, y, z], index) => (
        <group key={`premium-bin-${index}`} position={[x, y, z]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.7, 12]} />
            <meshStandardMaterial color="#263340" metalness={0.42} roughness={0.24} />
          </mesh>
          <mesh position={[0, 0.73, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.05, 12]} />
            <meshStandardMaterial color="#e5eef4" emissive="#8ecaff" emissiveIntensity={isNight ? 0.25 : 0.08} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function NightNeonAura({ isNight }) {
  if (!isNight) return null;

  return (
    <group>
      {[
        { position: [0, 6.2, 12.2], color: '#62e8ff', intensity: 2.6, distance: 18 },
        { position: [-15, 5.2, 10.4], color: '#ff58cf', intensity: 2.1, distance: 14 },
        { position: [15, 5.2, 10.4], color: '#7dff8f', intensity: 2.1, distance: 14 },
        { position: [0, 3.6, 18.2], color: '#ffcf70', intensity: 1.8, distance: 16 },
        { position: [-25.5, 3.2, 18.4], color: '#72f6ff', intensity: 1.2, distance: 10 },
        { position: [23, 3.3, 18.8], color: '#8cc7ff', intensity: 1.2, distance: 10 },
      ].map((light, index) => (
        <pointLight
          key={`night-aura-${index}`}
          position={light.position}
          color={light.color}
          intensity={light.intensity}
          distance={light.distance}
          decay={2}
        />
      ))}

      {[[-15, 4.02, 10.2, 4.1, 15.8, '#ff58cf'], [15, 4.02, 10.2, 4.1, 15.8, '#6dfff2'], [0, 4.02, 12.2, 6.1, 25.2, '#5e7dff']].map(([x, y, z, width, depth, color], index) => (
        <mesh key={`aura-floor-${index}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

// ─── City Buildings Background — Distant skyline, clear station view ───────────
function CityBackground({ isNight }) {
  const buildings = useMemo(() => {
    const cityBuildings = [];
    const seed = 42;
    const seededRandom = (i) => ((Math.sin(seed + i * 12.9898) * 43758.5453) % 1 + 1) % 1;

    // Grand skyline behind the station
    for (let i = 0; i < 16; i++) {
      cityBuildings.push({
        x: -56 + i * 7.5,
        z: -42 - seededRandom(i + 12) * 8,
        height: 16 + seededRandom(i) * 18,
        width: 3.5 + seededRandom(i + 100) * 3.8,
        depth: 4 + seededRandom(i + 200) * 3,
        color: ['#1a2a3a', '#22364c', '#1c3044', '#203247'][i % 4],
        hasSpire: seededRandom(i + 300) > 0.65,
        hasCrown: seededRandom(i + 301) > 0.45,
        glass: ['#74b8de', '#5dd4d7', '#6ea3ff', '#8cd7ff'][i % 4],
      });
    }

    // Secondary skyline, separated from tracks
    for (let i = 0; i < 12; i++) {
      cityBuildings.push({
        x: -68 + i * 12,
        z: 54 + seededRandom(i + 400) * 10,
        height: 9 + seededRandom(i + 500) * 12,
        width: 5.5 + seededRandom(i + 600) * 3.5,
        depth: 5 + seededRandom(i + 700) * 2.5,
        color: ['#314456', '#405164', '#344657'][i % 3],
        hasAntenna: seededRandom(i + 800) > 0.72,
        glass: ['#7cb9da', '#7fe0e6', '#92c7f5'][i % 3],
      });
    }

    // Lateral district framing the station without blocking it
    for (let i = 0; i < 6; i++) {
      cityBuildings.push({
        x: -78 - seededRandom(i + 900) * 10,
        z: -26 + i * 11,
        height: 9 + seededRandom(i + 1000) * 14,
        width: 5 + seededRandom(i + 1100) * 3,
        depth: 5 + seededRandom(i + 1200) * 3,
        color: ['#2f3d4d', '#39495b', '#35475a'][i % 3],
        glass: ['#5fa7c9', '#74c4dc', '#6ea4d2'][i % 3],
      });

      cityBuildings.push({
        x: 78 + seededRandom(i + 1300) * 10,
        z: -26 + i * 11,
        height: 9 + seededRandom(i + 1400) * 14,
        width: 5 + seededRandom(i + 1500) * 3,
        depth: 5 + seededRandom(i + 1600) * 3,
        color: ['#2f3d4d', '#39495b', '#35475a'][i % 3],
        hasAntenna: seededRandom(i + 1700) > 0.7,
        glass: ['#5fa7c9', '#74c4dc', '#6ea4d2'][i % 3],
      });
    }

    cityBuildings.push({
      x: -82, z: -48, height: 30, width: 7.5, depth: 7.5,
      color: '#223549', hasSpire: true, hasCrown: true, glass: '#89d7ef',
    });
    cityBuildings.push({
      x: 82, z: -48, height: 30, width: 7.5, depth: 7.5,
      color: '#223549', hasSpire: true, hasCrown: true, glass: '#89d7ef',
    });

    return cityBuildings;
  }, []);
  
  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.height / 2, 0]}>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial color={b.color} roughness={0.72} metalness={0.18} />
          </mesh>

          <mesh position={[0, b.height + 0.45, 0]}>
            <boxGeometry args={[b.width * 0.92, 0.18, b.depth * 0.92]} />
            <meshStandardMaterial color="#7d8b98" metalness={0.34} roughness={0.65} />
          </mesh>

          <mesh position={[0, b.height * 0.58, b.depth / 2 + 0.12]}>
            <boxGeometry args={[b.width * 0.72, Math.max(2, b.height * 0.34), 0.22]} />
            <meshStandardMaterial color={b.glass || '#4b6f8b'} emissive={b.glass || '#24455d'} emissiveIntensity={isNight ? 0.85 : 0.32} roughness={0.2} metalness={0.42} />
          </mesh>

          <mesh position={[b.width / 2 + 0.1, b.height * 0.52, 0]}>
            <boxGeometry args={[0.16, Math.max(2.4, b.height * 0.44), b.depth * 0.62]} />
            <meshStandardMaterial color={b.glass || '#4b6f8b'} emissive={b.glass || '#24455d'} emissiveIntensity={isNight ? 0.55 : 0.18} roughness={0.18} metalness={0.38} />
          </mesh>

          <mesh position={[-b.width / 2 - 0.1, b.height * 0.52, 0]}>
            <boxGeometry args={[0.16, Math.max(2.4, b.height * 0.44), b.depth * 0.62]} />
            <meshStandardMaterial color={b.glass || '#4b6f8b'} emissive={b.glass || '#24455d'} emissiveIntensity={isNight ? 0.55 : 0.18} roughness={0.18} metalness={0.38} />
          </mesh>

          {[0.22, 0.5, 0.78].map((heightRatio, stripIndex) => (
            <mesh key={`glow-strip-${stripIndex}`} position={[0, b.height * heightRatio, b.depth / 2 + 0.18]}>
              <boxGeometry args={[b.width * 0.82, 0.12, 0.08]} />
              <meshStandardMaterial color="#89b4d6" emissive="#89b4d6" emissiveIntensity={isNight ? 0.75 : 0.18} />
            </mesh>
          ))}

          {[-0.22, 0, 0.22].map((xOffset, colIndex) => (
            [0.26, 0.42, 0.58, 0.74].map((heightRatio, rowIndex) => (
              <mesh key={`front-window-${colIndex}-${rowIndex}`} position={[xOffset * b.width, b.height * heightRatio, b.depth / 2 + 0.15]}>
                <boxGeometry args={[Math.max(0.22, b.width * 0.14), Math.max(0.24, b.height * 0.05), 0.05]} />
                <meshStandardMaterial color={isNight ? '#dff6ff' : '#9ed9ef'} emissive={isNight ? '#dff6ff' : '#9ed9ef'} emissiveIntensity={isNight ? 1.4 : 0.22} transparent opacity={isNight ? 0.95 : 0.72} />
              </mesh>
            ))
          ))}

          {[0.28, 0.5, 0.72].map((heightRatio, sideRow) => (
            <group key={`side-window-group-${sideRow}`}>
              <mesh position={[b.width / 2 + 0.12, b.height * heightRatio, b.depth * 0.22]}>
                <boxGeometry args={[0.05, Math.max(0.22, b.height * 0.05), Math.max(0.5, b.depth * 0.18)]} />
                <meshStandardMaterial color={isNight ? '#d7f0ff' : '#8dd5ec'} emissive={isNight ? '#d7f0ff' : '#8dd5ec'} emissiveIntensity={isNight ? 1.05 : 0.16} transparent opacity={isNight ? 0.95 : 0.65} />
              </mesh>
              <mesh position={[-b.width / 2 - 0.12, b.height * heightRatio, -b.depth * 0.22]}>
                <boxGeometry args={[0.05, Math.max(0.22, b.height * 0.05), Math.max(0.5, b.depth * 0.18)]} />
                <meshStandardMaterial color={isNight ? '#d7f0ff' : '#8dd5ec'} emissive={isNight ? '#d7f0ff' : '#8dd5ec'} emissiveIntensity={isNight ? 1.05 : 0.16} transparent opacity={isNight ? 0.95 : 0.65} />
              </mesh>
            </group>
          ))}

          {b.hasSpire && (
            <mesh position={[0, b.height + 2, 0]}>
              <coneGeometry args={[0.4, 4, 8]} />
              <meshStandardMaterial color="#8a8a9a" metalness={0.9} roughness={0.1} />
            </mesh>
          )}

          {b.hasCrown && (
            <group position={[0, b.height + 0.9, 0]}>
              <mesh>
                <boxGeometry args={[b.width * 0.78, 0.16, b.depth * 0.78]} />
                <meshStandardMaterial color="#86d3f5" emissive="#86d3f5" emissiveIntensity={isNight ? 1.2 : 0.45} />
              </mesh>
            </group>
          )}

          {b.hasAntenna && (
            <group position={[0, b.height, 0]}>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 3, 8]} />
                <meshStandardMaterial color="#888" metalness={0.9} />
              </mesh>
              <mesh position={[0, 3, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={2} />
              </mesh>
            </group>
          )}


        </group>
      ))}
      
      {buildings.slice(0, 10).map((b, i) => (
        <mesh key={`city-glow-${i}`} position={[b.x, b.height * 0.55, b.z + 3]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshBasicMaterial color="#FFE4B5" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ─── PREMIUM MAGLEV/SHINKANSEN Train ────────────────────────────────
function MaglevTrain({ railZ, speed = 12, color = "#E8E8E8", startX = -35 }) {
  const trainRef = useRef();
  const opacityRef = useRef(1);
  const direction = speed > 0 ? 1 : -1;
  const wagonsCount = 5;
  const captureAccentPalette = ['#00D2BE', '#00A6FF', '#FF47C8', '#FFD166'];
  
  useFrame(({ clock }) => {
    if (!trainRef.current) return;
    const t = clock.getElapsedTime();
    let x = startX + t * speed;
    const range = 95;
    if (speed > 0) {
      x = ((x + range) % (range * 2)) - range;
    } else {
      x = -((-x + range) % (range * 2)) + range;
    }
    trainRef.current.position.x = x;

    updateTrainOpacity(trainRef.current, getTunnelOpacity(x), opacityRef);
  });
  
  // Sleek futuristic locomotive
  const MaglevLocomotive = () => (
    <group>
      {/* Aerodynamic nose */}
      <mesh position={[0, 0.5, -1.5]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.1, 0.6, 2]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, 0.6, 0.8]}>
        <boxGeometry args={[1.15, 0.8, 3]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Windshield - dark tinted */}
      <mesh position={[0, 0.75, -1.8]} rotation={[0.4, 0, 0]}>
        <planeGeometry args={[0.9, 0.6]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.95} roughness={0.05} transparent opacity={0.9} />
      </mesh>
      {/* Blue accent stripe */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.17, 0.08, 5.5]} />
        <meshStandardMaterial color="#0066CC" emissive="#0066CC" emissiveIntensity={0.5} />
      </mesh>
      {captureAccentPalette.map((accent, accentIndex) => (
        <mesh key={`maglev-front-accent-${accentIndex}`} position={[accentIndex < 2 ? -0.42 : 0.42, 0.83, -0.4 + accentIndex * 0.9]}>
          <boxGeometry args={[0.08, 0.18, 0.7]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.25} />
        </mesh>
      ))}
      {/* LED strip */}
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[1.1, 0.03, 5]} />
        <meshStandardMaterial color="#00D2BE" emissive="#00D2BE" emissiveIntensity={2} />
      </mesh>
      {/* Front light */}
      <mesh position={[0, 0.4, -2.4]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={3} />
      </mesh>
    </group>
  );
  
  // Maglev wagon
  const MaglevWagon = ({ wagonIndex }) => {
    const accent = captureAccentPalette[wagonIndex % captureAccentPalette.length];
    return (
    <group>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.15, 0.8, 3.2]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Blue stripe */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.17, 0.08, 3.25]} />
        <meshStandardMaterial color="#0066CC" emissive="#0066CC" emissiveIntensity={0.3} />
      </mesh>
      {/* Windows */}
      {[-1.1, -0.4, 0.3, 1].map((z, i) => (
        <group key={i}>
          <mesh position={[0.59, 0.7, z]}>
            <boxGeometry args={[0.03, 0.5, 0.55]} />
            <meshStandardMaterial color="#1a3a5a" transparent opacity={0.8} emissive="#3a5a8a" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[-0.59, 0.7, z]}>
            <boxGeometry args={[0.03, 0.5, 0.55]} />
            <meshStandardMaterial color="#1a3a5a" transparent opacity={0.8} emissive="#3a5a8a" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      {/* LED strip */}
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[1.1, 0.03, 3.1]} />
        <meshStandardMaterial color="#00D2BE" emissive="#00D2BE" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[1.12, 0.05, 3.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} transparent opacity={0.92} />
      </mesh>
    </group>
  );
  };
  
  return (
    <group ref={trainRef} position={[startX, 0.1, railZ]}>
      {/* Front locomotive */}
      <group rotation={[0, direction > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <MaglevLocomotive />
      </group>
      {/* Wagons */}
      {[...Array(wagonsCount)].map((_, i) => (
        <group key={i} position={[-direction * (3.5 + i * 3.3), 0, 0]} rotation={[0, direction > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <MaglevWagon wagonIndex={i} />
        </group>
      ))}
      {/* Rear locomotive (reversed) */}
      <group position={[-direction * (3.5 + wagonsCount * 3.3), 0, 0]} rotation={[0, direction > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <MaglevLocomotive />
      </group>
    </group>
  );
}

// ─── PREMIUM ICE/EUROSTAR Train ────────────────────────────────
function ICETrain({ railZ, speed = 8, startX = -30 }) {
  const trainRef = useRef();
  const stopStateRef = useRef(false);
  const opacityRef = useRef(1);
  const [isStopped, setIsStopped] = useState(false);
  const direction = speed > 0 ? 1 : -1;
  const wagonsCount = 4;
  const colors = ['#FFFFFF', '#CC0000']; // ICE white with red stripe
  
  useFrame(({ clock }) => {
    if (!trainRef.current) return;
    const t = clock.getElapsedTime();
    const cycleTime = 25;
    const cyclePosition = t % cycleTime;
    
    // Stop at station
    const shouldStop = cyclePosition > 10 && cyclePosition < 18;
    if (stopStateRef.current !== shouldStop) {
      stopStateRef.current = shouldStop;
      setIsStopped(shouldStop);
    }
    
    if (shouldStop) {
      trainRef.current.position.x = 2; // Station position
    } else {
      let x = startX + ((cyclePosition > 18 ? cyclePosition - 8 : cyclePosition) * speed);
      const range = 95;
      x = ((x + range) % (range * 2)) - range;
      trainRef.current.position.x = x;
    }

    updateTrainOpacity(trainRef.current, getTunnelOpacity(trainRef.current.position.x), opacityRef);
  });
  
  const ICELocomotive = () => (
    <group>
      {/* Streamlined nose */}
      <mesh position={[0, 0.55, -1.2]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[1, 0.65, 1.8]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, 0.6, 0.7]}>
        <boxGeometry args={[1.05, 0.8, 2.8]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.75} roughness={0.2} />
      </mesh>
      {/* Red stripe */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.07, 0.12, 5]} />
        <meshStandardMaterial color="#CC0000" />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.8, -1.6]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.85, 0.55, 0.03]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.9} roughness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* DB Logo placeholder */}
      <mesh position={[0, 0.85, 0.5]}>
        <boxGeometry args={[0.4, 0.25, 0.02]} />
        <meshStandardMaterial color="#CC0000" />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.3, 0.45, -2]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.3, 0.45, -2]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={2} />
      </mesh>
    </group>
  );
  
  const ICEWagon = ({ doorsOpen = false }) => (
    <group>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.05, 0.8, 3]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.75} roughness={0.2} />
      </mesh>
      {/* Red stripe */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.07, 0.12, 3.05]} />
        <meshStandardMaterial color="#CC0000" />
      </mesh>
      {/* Windows */}
      {[-1, -0.35, 0.3, 0.95].map((z, i) => (
        <group key={i}>
          <mesh position={[0.54, 0.72, z]}>
            <boxGeometry args={[0.03, 0.45, 0.5]} />
            <meshStandardMaterial color="#2a4a6a" transparent opacity={0.75} />
          </mesh>
          <mesh position={[-0.54, 0.72, z]}>
            <boxGeometry args={[0.03, 0.45, 0.5]} />
            <meshStandardMaterial color="#2a4a6a" transparent opacity={0.75} />
          </mesh>
        </group>
      ))}
      
      {/* PORTES COULISSANTES - côté gauche */}
      <group position={[-0.54, 0.55, -1.4]}>
        {/* Cadre de porte */}
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.04, 0.65, 0.55]} />
          <meshStandardMaterial color="#333333" metalness={0.9} />
        </mesh>
        {/* Porte gauche */}
        <mesh position={[0.025, 0, doorsOpen ? -0.24 : 0]}>
          <boxGeometry args={[0.03, 0.58, 0.24]} />
          <meshStandardMaterial color={doorsOpen ? "#888888" : "#FFFFFF"} metalness={0.7} />
        </mesh>
        {/* Porte droite */}
        <mesh position={[0.025, 0, doorsOpen ? 0.24 : 0]}>
          <boxGeometry args={[0.03, 0.58, 0.24]} />
          <meshStandardMaterial color={doorsOpen ? "#888888" : "#FFFFFF"} metalness={0.7} />
        </mesh>
        {/* Lumière indicateur */}
        <mesh position={[0.03, 0.38, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial 
            color={doorsOpen ? "#00FF00" : "#FF0000"} 
            emissive={doorsOpen ? "#00FF00" : "#FF0000"} 
            emissiveIntensity={2.5} 
          />
        </mesh>
      </group>
      
      {/* PORTES COULISSANTES - côté droit */}
      <group position={[0.54, 0.55, -1.4]} rotation={[0, Math.PI, 0]}>
        {/* Cadre de porte */}
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.04, 0.65, 0.55]} />
          <meshStandardMaterial color="#333333" metalness={0.9} />
        </mesh>
        {/* Porte gauche */}
        <mesh position={[0.025, 0, doorsOpen ? -0.24 : 0]}>
          <boxGeometry args={[0.03, 0.58, 0.24]} />
          <meshStandardMaterial color={doorsOpen ? "#888888" : "#FFFFFF"} metalness={0.7} />
        </mesh>
        {/* Porte droite */}
        <mesh position={[0.025, 0, doorsOpen ? 0.24 : 0]}>
          <boxGeometry args={[0.03, 0.58, 0.24]} />
          <meshStandardMaterial color={doorsOpen ? "#888888" : "#FFFFFF"} metalness={0.7} />
        </mesh>
        {/* Lumière indicateur */}
        <mesh position={[0.03, 0.38, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial 
            color={doorsOpen ? "#00FF00" : "#FF0000"} 
            emissive={doorsOpen ? "#00FF00" : "#FF0000"} 
            emissiveIntensity={2.5} 
          />
        </mesh>
      </group>
    </group>
  );
  
  return (
    <group ref={trainRef} position={[startX, 0, railZ]}>
      {/* Stopped indicator */}
      {isStopped && (
        <group position={[0, 2.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={2} transparent opacity={0.7} />
          </mesh>
          <Text position={[0, 0.7, 0]} fontSize={0.25} color="#FFFFFF" anchorX="center">
            ARRÊT
          </Text>
        </group>
      )}
      
      <group rotation={[0, direction > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <ICELocomotive />
      </group>
      {[...Array(wagonsCount)].map((_, i) => (
        <group key={i} position={[-direction * (3.2 + i * 3.1), 0, 0]} rotation={[0, direction > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <ICEWagon doorsOpen={isStopped} />
        </group>
      ))}
      <group position={[-direction * (3.2 + wagonsCount * 3.1), 0, 0]} rotation={[0, direction > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <ICELocomotive />
      </group>
    </group>
  );
}

// ─── FREIGHT TRAIN ────────────────────────────────────────
function FreightTrain({ railZ, speed = 4, startX = 20 }) {
  const trainRef = useRef();
  const opacityRef = useRef(1);
  const direction = speed > 0 ? 1 : -1;
  const containerColors = ['#DC143C', '#228B22', '#1E90FF', '#FF8C00', '#8B008B', '#20B2AA', '#FFD700', '#FF69B4'];
  const locoPalette = ['#ffd54f', '#64d8ff', '#ff77cc', '#7ef29a'];
  
  useFrame(({ clock }) => {
    if (!trainRef.current) return;
    const t = clock.getElapsedTime();
    let x = startX + t * speed;
    const range = 95;
    if (speed > 0) {
      x = ((x + range) % (range * 2)) - range;
    } else {
      x = -((-x + range) % (range * 2)) + range;
    }
    trainRef.current.position.x = x;

    updateTrainOpacity(trainRef.current, getTunnelOpacity(x), opacityRef);
  });
  
  // Diesel locomotive
  const DieselLoco = () => (
    <group>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.2, 1.1, 4]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Cab */}
      <mesh position={[0, 1.4, -1]}>
        <boxGeometry args={[1.1, 0.7, 1.5]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Black stripe */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.22, 0.2, 4.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {locoPalette.map((accent, accentIndex) => (
        <mesh key={`freight-loco-accent-${accentIndex}`} position={[0, 0.98 + accentIndex * 0.14, -0.9 + accentIndex * 1.1]}>
          <boxGeometry args={[1.23, 0.05, 0.35]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* Windows */}
      <mesh position={[0.57, 1.5, -1]}>
        <boxGeometry args={[0.03, 0.4, 0.8]} />
        <meshStandardMaterial color="#3a5a7a" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.57, 1.5, -1]}>
        <boxGeometry args={[0.03, 0.4, 0.8]} />
        <meshStandardMaterial color="#3a5a7a" transparent opacity={0.8} />
      </mesh>
      {/* Headlight */}
      <mesh position={[0, 0.9, -2.05]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={2} />
      </mesh>
    </group>
  );
  
  // Container wagon
  const ContainerWagon = ({ containerColor }) => (
    <group>
      {/* Flat car base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.1, 0.15, 3.5]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Container */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1, 1.2, 3.2]} />
        <meshStandardMaterial color={containerColor} roughness={0.6} />
      </mesh>
      {/* Container ribs */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((z, i) => (
        <mesh key={i} position={[0.52, 0.9, z]}>
          <boxGeometry args={[0.03, 1.15, 0.08]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      ))}
    </group>
  );
  
  return (
    <group ref={trainRef} position={[startX, 0, railZ]}>
      <group rotation={[0, direction > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <DieselLoco />
      </group>
      {[...Array(6)].map((_, i) => (
        <group key={i} position={[-direction * (4.5 + i * 3.8), 0, 0]} rotation={[0, direction > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <ContainerWagon containerColor={containerColors[i % containerColors.length]} />
        </group>
      ))}
    </group>
  );
}

// ─── Animated Train ────────────────────────────────────────
function AnimatedTrain({ railZ, speed, color, wagons = 3, type = 'passenger', startX = -20 }) {
  const trainRef = useRef();
  const direction = speed > 0 ? 1 : -1;
  
  useFrame(({ clock }) => {
    if (!trainRef.current) return;
    const t = clock.getElapsedTime();
    let x = startX + t * speed;
    
    // Loop
    const range = 40;
    if (speed > 0) {
      x = ((x + range) % (range * 2)) - range;
    } else {
      x = -((-x + range) % (range * 2)) + range;
    }
    
    trainRef.current.position.x = x;
    trainRef.current.position.z = railZ;
  });
  
  return (
    <group ref={trainRef} position={[startX, 0, railZ]}>
      {/* Locomotive */}
      <group rotation={[0, direction > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <Locomotive color={color} />
      </group>
      
      {/* Wagons */}
      {[...Array(wagons)].map((_, i) => (
        <group key={i} position={[-direction * (2.8 + i * 2.8), 0, 0]} rotation={[0, direction > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <Wagon type={type} color={type === 'passenger' ? '#3a3a5c' : '#8B4513'} />
        </group>
      ))}
    </group>
  );
}

// ─── Passengers on Platform — ULTRA PREMIUM ────────────────────────────────
function Passengers({ isMobile = false }) {
  // Palette de vêtements réalistes premium
  const outfitColors = [
    { top: '#e74c3c', bottom: '#2c3e50' }, // Rouge / Bleu marine
    { top: '#9b59b6', bottom: '#1a1a2e' }, // Violet / Noir
    { top: '#00d4aa', bottom: '#2c3e50' }, // Turquoise / Navy
    { top: '#f39c12', bottom: '#34495e' }, // Orange / Gris
    { top: '#e91e63', bottom: '#212121' }, // Rose / Noir
    { top: '#3498db', bottom: '#1a1a1a' }, // Bleu / Noir
    { top: '#2ecc71', bottom: '#2c3e50' }, // Vert / Navy
    { top: '#f1c40f', bottom: '#2c2c2c' }, // Jaune / Charbon
  ];
  
  // Teintes de peau diverses
  const skinTones = ['#FDBCB4', '#DEB887', '#C68642', '#8D5524', '#F5DEB3', '#D2B48C', '#CD853F', '#E8BEAC'];
  
  // Couleurs de cheveux
  const hairColors = ['#1a1a1a', '#4a3728', '#8B4513', '#FFD700', '#C0C0C0', '#2c1810', '#5c3317', '#8B0000'];
  
  // Accessoires premium
  const accessoryColors = ['#FFD700', '#C0C0C0', '#FF69B4', '#00CED1', '#FF4500'];
  
  // Personnage Premium réutilisable
  const PremiumPassenger = ({ position, outfit, skin, hair, hasLuggage, isWaiting, scale = 1, hasPhone, hasGlasses }) => (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.028, 0.02]}>
        <circleGeometry args={[0.11, 14]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>

      {/* ═══ JAMBES PREMIUM ═══ */}
      <group position={[0, 0, 0]}>
        {/* Jambe gauche */}
        <mesh position={[-0.05, 0.12, 0]}>
          <capsuleGeometry args={[0.035, 0.2, 6, 12]} />
          <meshStandardMaterial color={outfit.bottom} roughness={0.55} />
        </mesh>
        {/* Jambe droite */}
        <mesh position={[0.05, 0.12, 0]}>
          <capsuleGeometry args={[0.035, 0.2, 6, 12]} />
          <meshStandardMaterial color={outfit.bottom} roughness={0.55} />
        </mesh>
        
        {/* Chaussures premium */}
        <group position={[-0.05, -0.02, 0.015]}>
          <mesh>
            <boxGeometry args={[0.05, 0.035, 0.08]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.018, 0]}>
            <boxGeometry args={[0.055, 0.01, 0.085]} />
            <meshStandardMaterial color="#333" roughness={0.4} />
          </mesh>
        </group>
        <group position={[0.05, -0.02, 0.015]}>
          <mesh>
            <boxGeometry args={[0.05, 0.035, 0.08]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.018, 0]}>
            <boxGeometry args={[0.055, 0.01, 0.085]} />
            <meshStandardMaterial color="#333" roughness={0.4} />
          </mesh>
        </group>
      </group>
      
      {/* ═══ TORSE PREMIUM ═══ */}
      <group position={[0, 0.35, 0]}>
        {/* Corps principal */}
        <mesh>
          <capsuleGeometry args={[0.065, 0.18, 8, 16]} />
          <meshStandardMaterial 
            color={outfit.top} 
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
        
        {/* Col visible */}
        <mesh position={[0, 0.1, 0.035]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color={skin} roughness={0.35} />
        </mesh>
        
        {/* Boutons ou détails sur vêtement */}
        {[0.02, -0.02, -0.06].map((y, i) => (
          <mesh key={i} position={[0, y, 0.066]}>
            <sphereGeometry args={[0.008, 6, 6]} />
            <meshStandardMaterial color={outfit.bottom} roughness={0.5} />
          </mesh>
        ))}
      </group>
      
      {/* ═══ BRAS PREMIUM ═══ */}
      <group position={[0, 0.38, 0]}>
        {/* Épaules */}
        <mesh position={[-0.08, 0.04, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={outfit.top} roughness={0.45} />
        </mesh>
        <mesh position={[0.08, 0.04, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={outfit.top} roughness={0.45} />
        </mesh>
        
        {/* Bras gauche */}
        <mesh position={[-0.1, hasPhone ? 0.02 : -0.04, hasPhone ? 0.05 : 0]} rotation={[hasPhone ? -0.8 : 0.15, 0, 0.2]}>
          <capsuleGeometry args={[0.028, 0.15, 6, 10]} />
          <meshStandardMaterial color={skin} roughness={0.38} />
        </mesh>
        
        {/* Main gauche */}
        <mesh position={[-0.12, hasPhone ? 0.1 : -0.15, hasPhone ? 0.12 : 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.35} />
        </mesh>
        
        {/* Téléphone dans la main */}
        {hasPhone && (
          <group position={[-0.12, 0.12, 0.14]}>
            <mesh rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.04, 0.08, 0.008]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.005]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.035, 0.065, 0.002]} />
              <meshStandardMaterial color="#4a90d4" emissive="#4a90d4" emissiveIntensity={0.4} />
            </mesh>
          </group>
        )}
        
        {/* Bras droit */}
        <mesh position={[0.1, -0.04, 0]} rotation={[0.15, 0, -0.2]}>
          <capsuleGeometry args={[0.028, 0.15, 6, 10]} />
          <meshStandardMaterial color={skin} roughness={0.38} />
        </mesh>
        
        {/* Main droite */}
        <mesh position={[0.12, -0.15, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.35} />
        </mesh>
      </group>
      
      {/* ═══ TÊTE ULTRA PREMIUM ═══ */}
      <group position={[0, 0.62, 0]}>
        {/* Crâne ovale */}
        <mesh scale={[1, 1.1, 0.95]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.32} />
        </mesh>
        
        {/* Oreilles */}
        <mesh position={[-0.075, 0, 0]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.35} />
        </mesh>
        <mesh position={[0.075, 0, 0]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.35} />
        </mesh>
        
        {/* Cheveux premium */}
        <group position={[0, 0.035, -0.01]}>
          <mesh>
            <sphereGeometry args={[0.085, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
            <meshStandardMaterial color={hair} roughness={0.65} />
          </mesh>
          {/* Mèches */}
          <mesh position={[0.03, 0.01, 0.04]} rotation={[0.2, 0.3, 0.1]}>
            <boxGeometry args={[0.02, 0.03, 0.01]} />
            <meshStandardMaterial color={hair} roughness={0.7} />
          </mesh>
        </group>
        
        {/* Sourcils */}
        <mesh position={[-0.03, 0.03, 0.065]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.025, 0.006, 0.004]} />
          <meshStandardMaterial color={hair} roughness={0.8} />
        </mesh>
        <mesh position={[0.03, 0.03, 0.065]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.025, 0.006, 0.004]} />
          <meshStandardMaterial color={hair} roughness={0.8} />
        </mesh>
        
        {/* Yeux premium avec détails */}
        <group position={[-0.03, 0.01, 0.065]}>
          <mesh>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.008]}>
            <circleGeometry args={[0.008, 12]} />
            <meshStandardMaterial color="#4a3020" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.004, 8]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[0.003, 0.003, 0.011]}>
            <circleGeometry args={[0.002, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
        </group>
        <group position={[0.03, 0.01, 0.065]}>
          <mesh>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.008]}>
            <circleGeometry args={[0.008, 12]} />
            <meshStandardMaterial color="#4a3020" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.004, 8]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[0.003, 0.003, 0.011]}>
            <circleGeometry args={[0.002, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
        </group>
        
        {/* Lunettes de soleil */}
        {hasGlasses && (
          <group position={[0, 0.015, 0.075]}>
            <mesh>
              <torusGeometry args={[0.05, 0.004, 8, 32, Math.PI]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-0.025, 0, 0.004]}>
              <circleGeometry args={[0.02, 12]} />
              <meshStandardMaterial color="#1a1a1a" transparent opacity={0.85} metalness={0.5} />
            </mesh>
            <mesh position={[0.025, 0, 0.004]}>
              <circleGeometry args={[0.02, 12]} />
              <meshStandardMaterial color="#1a1a1a" transparent opacity={0.85} metalness={0.5} />
            </mesh>
          </group>
        )}
        
        {/* Nez */}
        <mesh position={[0, -0.01, 0.075]}>
          <coneGeometry args={[0.012, 0.025, 4]} />
          <meshStandardMaterial color={skin} roughness={0.35} />
        </mesh>
        
        {/* Bouche */}
        <group position={[0, -0.035, 0.068]}>
          <mesh scale={[1, 0.6, 1]}>
            <capsuleGeometry args={[0.018, 0.012, 4, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#c0392b" roughness={0.4} />
          </mesh>
        </group>
      </group>
      
      {/* ═══ BAGAGES PREMIUM ═══ */}
      {hasLuggage && (
        <group position={[0.2, 0.15, 0]}>
          {/* Valise à roulettes */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.12, 0.22, 0.08]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Poignée télescopique */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[0.06, 0.02, 0.02]} />
            <meshStandardMaterial color="#333" roughness={0.3} />
          </mesh>
          {/* Roulettes */}
          <mesh position={[-0.04, 0, 0]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
          {/* Étiquette */}
          <mesh position={[0.065, 0.15, 0]}>
            <boxGeometry args={[0.005, 0.04, 0.025]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>
      )}
      
      {/* Sac à dos (alternative au bagage) */}
      {!hasLuggage && isWaiting && (
        <mesh position={[0, 0.35, -0.1]}>
          <boxGeometry args={[0.12, 0.15, 0.06]} />
          <meshStandardMaterial color="#34495e" roughness={0.5} />
        </mesh>
      )}
    </group>
  );
  
  // Positions des passagers sur le quai
  const basePassengers = [
    { x: -4, z: 0.5, outfit: 0, skin: 0, hair: 0, luggage: true, waiting: true, phone: false, glasses: false, scale: 1.0 },
    { x: -2.5, z: 0.8, outfit: 1, skin: 1, hair: 1, luggage: false, waiting: true, phone: true, glasses: false, scale: 0.95 },
    { x: -1, z: 0.3, outfit: 2, skin: 2, hair: 2, luggage: true, waiting: false, phone: false, glasses: true, scale: 1.05 },
    { x: 0.5, z: 0.7, outfit: 3, skin: 3, hair: 3, luggage: false, waiting: true, phone: false, glasses: false, scale: 0.9 },
    { x: 2, z: 0.4, outfit: 4, skin: 4, hair: 4, luggage: true, waiting: true, phone: false, glasses: true, scale: 1.0 },
    { x: 3.5, z: 0.9, outfit: 5, skin: 5, hair: 5, luggage: false, waiting: false, phone: true, glasses: false, scale: 0.95 },
    { x: 5, z: 0.5, outfit: 6, skin: 6, hair: 6, luggage: true, waiting: true, phone: false, glasses: false, scale: 1.05 },
    { x: -3.2, z: 1.2, outfit: 7, skin: 7, hair: 7, luggage: false, waiting: true, phone: true, glasses: true, scale: 0.92 },
    // Quelques passagers supplémentaires
    { x: 1.2, z: 1.0, outfit: 0, skin: 3, hair: 2, luggage: false, waiting: true, phone: false, glasses: false, scale: 0.88 },
    { x: 4.2, z: 1.1, outfit: 2, skin: 5, hair: 0, luggage: true, waiting: false, phone: false, glasses: true, scale: 1.0 },
  ];

  const generatedPassengers = useMemo(() => {
    const people = [...basePassengers];
    const waitingCount = isMobile ? 28 : 110;
    const bridgeCount = isMobile ? 10 : 40;
    const parkCount = isMobile ? 14 : 70;

    for (let i = 0; i < waitingCount; i += 1) {
      people.push({
        x: -26 + (i % 18) * 2.9,
        z: 0.25 + Math.floor(i / 18) * 0.2,
        y: 0.02,
        outfit: i % outfitColors.length,
        skin: (i * 2) % skinTones.length,
        hair: (i * 3) % hairColors.length,
        luggage: i % 3 === 0,
        waiting: true,
        phone: i % 5 === 0,
        glasses: i % 7 === 0,
        scale: 0.84 + (i % 5) * 0.04,
      });
    }

    for (let i = 0; i < bridgeCount; i += 1) {
      people.push({
        x: -2 + (i % 5) * 1.05,
        z: -2 + Math.floor(i / 5) * 1.65,
        y: 4.25,
        outfit: (i + 2) % outfitColors.length,
        skin: (i + 3) % skinTones.length,
        hair: (i + 4) % hairColors.length,
        luggage: i % 4 === 0,
        waiting: false,
        phone: i % 6 === 0,
        glasses: i % 5 === 0,
        scale: 0.8 + (i % 4) * 0.05,
      });
    }

    for (let i = 0; i < parkCount; i += 1) {
      people.push({
        x: -32 + (i % 16) * 4,
        z: 13.8 + Math.floor(i / 16) * 3.7,
        y: 0.02,
        outfit: (i + 5) % outfitColors.length,
        skin: (i + 1) % skinTones.length,
        hair: (i + 6) % hairColors.length,
        luggage: i % 6 === 0,
        waiting: i % 2 === 0,
        phone: i % 7 === 0,
        glasses: i % 8 === 0,
        scale: 0.82 + (i % 6) * 0.03,
      });
    }

    return people;
  }, [basePassengers, hairColors, isMobile, outfitColors, skinTones]);
  
  const parkRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    parkRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const speed = 0.15 + (i % 5) * 0.04;
      const radius = 0.8 + (i % 3) * 0.5;
      const phase = i * 1.3;
      ref.position.x += Math.sin(t * speed + phase) * 0.003;
      ref.position.z += Math.cos(t * speed * 0.7 + phase) * 0.003;
      ref.rotation.y = Math.sin(t * speed + phase) * 0.3;
    });
  });

  return (
    <group>
      {generatedPassengers.map((p, i) => {
        const isPark = p.z > 10 && p.y < 1;
        return (
          <group key={i} ref={isPark ? (el => parkRefs.current[i] = el) : undefined}>
            <PremiumPassenger
              position={[p.x, p.y ?? 0.02, p.z]}
              outfit={outfitColors[p.outfit % outfitColors.length]}
              skin={skinTones[p.skin % skinTones.length]}
              hair={hairColors[p.hair % hairColors.length]}
              hasLuggage={p.luggage}
              isWaiting={p.waiting}
              hasPhone={p.phone}
              hasGlasses={p.glasses}
              scale={p.scale}
            />
          </group>
        );
      })}
    </group>
  );
}

// ─── Trees ─────────────────────────────────────────────────
function Trees() {
  return (
    <group>
      {/* Arbres principaux */}
      {[[-12, -6], [-10, -7], [10, -6], [12, -5], [14, -7], [-14, -5], [-16, -8], [16, -8], [-8, -8], [8, -8]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Trunk */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1.6, 8]} />
            <meshStandardMaterial color="#654321" roughness={0.9} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 2.05, 0]}>
            <sphereGeometry args={[0.9, 8, 8]} />
            <meshStandardMaterial color="#2d7a2d" roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.7, 0]}>
            <sphereGeometry args={[0.62, 8, 8]} />
            <meshStandardMaterial color="#3f9440" roughness={0.85} />
          </mesh>
        </group>
      ))}
      
      {/* Buissons décoratifs */}
      {[[-6, -7], [-4, -8], [4, -7], [6, -8], [-2, -9], [2, -9], [0, -8.5]].map(([x, z], i) => (
        <mesh key={`bush-${i}`} position={[x, 0.3, z]}>
          <sphereGeometry args={[0.4 + Math.random() * 0.2, 8, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#2d6a2d" : "#3d7a3d"} roughness={0.9} />
        </mesh>
      ))}
      
      {/* Fleurs colorées près du quai */}
      {[-5, -3, -1, 1, 3, 5].map((x, i) => (
        <group key={`flower-${i}`} position={[x, 0.15, -1.8]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial 
              color={['#FF69B4', '#FFD700', '#FF6347', '#9370DB', '#00CED1', '#FF1493'][i]} 
              emissive={['#FF69B4', '#FFD700', '#FF6347', '#9370DB', '#00CED1', '#FF1493'][i]} 
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Urban Suburban Landscape — Premium Flat Terrain ──────────────────
function Mountains({ isNight }) {
  const concreteColor = isNight ? '#2a2e34' : '#e8eaed';
  const asphaltColor = isNight ? '#1a1e24' : '#505458';
  const markingColor = isNight ? '#888c90' : '#f0f0f0';
  const buildingBase = isNight ? '#222832' : '#a0a4a8';
  const glassColor = isNight ? '#FFE8B0' : '#7ab8d8';
  const glassEmissive = isNight ? 3.5 : 0;

  const vehicleRefs = useRef([]);
  const vehicleData = useMemo(() => [
    { lane: -9.2, speed: 8, dir: 1, color: '#c0392b', len: 1.8, w: 0.7, h: 0.6 },
    { lane: -8, speed: 10, dir: 1, color: '#2c3e50', len: 1.6, w: 0.65, h: 0.55 },
    { lane: -6.8, speed: 6, dir: 1, color: '#ecf0f1', len: 3.2, w: 0.9, h: 1.0 },
    { lane: -9.2, speed: 9, dir: 1, color: '#f39c12', len: 1.5, w: 0.6, h: 0.5 },
    { lane: -7.4, speed: 7, dir: 1, color: '#1abc9c', len: 1.7, w: 0.65, h: 0.55 },
    { lane: -6.8, speed: 11, dir: -1, color: '#8e44ad', len: 1.6, w: 0.65, h: 0.55 },
    { lane: -8, speed: 5, dir: -1, color: '#e74c3c', len: 2.8, w: 0.85, h: 0.9 },
    { lane: -9.2, speed: 7.5, dir: -1, color: '#3498db', len: 1.7, w: 0.65, h: 0.55 },
    { lane: -7.4, speed: 9.5, dir: -1, color: '#95a5a6', len: 1.5, w: 0.6, h: 0.5 },
    { lane: -6.8, speed: 6.5, dir: -1, color: '#2ecc71', len: 1.6, w: 0.65, h: 0.55 },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    vehicleRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const v = vehicleData[i];
      let x = ((t * v.speed * v.dir + i * 18) % 120) - 60;
      if (x > 60) x -= 120;
      if (x < -60) x += 120;
      ref.position.x = x;
    });
  });

  return (
    <group position={[0, 0, -30]}>
      {/* Grande plaine bétonnée */}
      <mesh position={[0, -0.05, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 50]} />
        <meshStandardMaterial color={concreteColor} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* AUTOROUTE PRINCIPALE — 6 voies */}
      <mesh position={[0, 0.02, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 6]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.9} />
      </mesh>
      {/* Lignes centrales jaunes */}
      {[-0.2, 0.2].map((off, i) => (
        <mesh key={`hwyC${i}`} position={[0, 0.03, -8 + off]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 0.08]} />
          <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 1 : 0} />
        </mesh>
      ))}
      {/* Lignes de voie blanches */}
      {[-1.5, 1.5].map((off, i) => (
        <mesh key={`hwyL${i}`} position={[0, 0.03, -8 + off]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 0.06]} />
          <meshStandardMaterial color={markingColor} />
        </mesh>
      ))}

      {/* BRETELLE D'AUTOROUTE */}
      <mesh position={[25, 0.02, -14]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[22, 3]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.9} />
      </mesh>

      {/* VÉHICULES ANIMÉS */}
      {vehicleData.map((v, i) => (
        <group key={`veh${i}`} ref={el => vehicleRefs.current[i] = el} position={[0, v.h / 2 + 0.05, v.lane]}>
          {/* Carrosserie */}
          <mesh><boxGeometry args={[v.len, v.h, v.w]} />
            <meshStandardMaterial color={v.color} metalness={0.5} roughness={0.3} /></mesh>
          {/* Pare-brise */}
          {v.len < 2.5 && <mesh position={[v.dir * v.len * 0.25, v.h * 0.15, 0]}>
            <boxGeometry args={[v.len * 0.3, v.h * 0.5, v.w + 0.02]} />
            <meshStandardMaterial color="#a0c8e0" transparent opacity={0.7} metalness={0.6} /></mesh>}
          {/* Phares */}
          <mesh position={[v.dir * v.len / 2, 0, 0]}>
            <boxGeometry args={[0.04, v.h * 0.3, v.w * 0.8]} />
            <meshStandardMaterial color={isNight ? '#FFE8B0' : '#fff'} emissive="#FFD700" emissiveIntensity={isNight ? 3 : 0.3} /></mesh>
          {/* Feux arrière */}
          <mesh position={[-v.dir * v.len / 2, 0, 0]}>
            <boxGeometry args={[0.04, v.h * 0.2, v.w * 0.6]} />
            <meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={isNight ? 2 : 0.2} /></mesh>
        </group>
      ))}

      {/* STATION-SERVICE */}
      <group position={[-22, 0, -16]}>
        <mesh position={[0, 1.8, 0]}><boxGeometry args={[8, 3.6, 5]} />
          <meshStandardMaterial color={isNight ? '#1e2228' : '#dce0e4'} roughness={0.6} metalness={0.2} /></mesh>
        {/* Auvent */}
        <mesh position={[0, 3.8, 2]}><boxGeometry args={[10, 0.15, 8]} />
          <meshStandardMaterial color="#e0e4e8" roughness={0.3} metalness={0.4} /></mesh>
        {/* Piliers auvent */}
        {[[-4, 5], [4, 5], [-4, -1], [4, -1]].map(([px, pz], i) => (
          <mesh key={`gp${i}`} position={[px, 2, pz]}><cylinderGeometry args={[0.12, 0.12, 3.8, 6]} />
            <meshStandardMaterial color="#c0c4c8" metalness={0.6} /></mesh>
        ))}
        {/* Pompes */}
        {[-2, 0, 2].map((x, i) => (
          <mesh key={`pump${i}`} position={[x, 0.9, 3]}><boxGeometry args={[0.6, 1.8, 0.5]} />
            <meshStandardMaterial color={['#c0392b', '#2980b9', '#27ae60'][i]} roughness={0.4} /></mesh>
        ))}
        {/* Enseigne lumineuse */}
        <mesh position={[0, 5.5, 0]}><boxGeometry args={[4, 1, 0.3]} />
          <meshStandardMaterial color="#ffffff" emissive="#ff4444" emissiveIntensity={isNight ? 3 : 0.5} /></mesh>
      </group>

      {/* VILLE LOINTAINE — silhouette urbaine */}
      {[
        { x: -40, h: 16, w: 5, d: 5 },
        { x: -34, h: 22, w: 6, d: 5 },
        { x: -28, h: 12, w: 4, d: 4 },
        { x: 30, h: 18, w: 5, d: 5 },
        { x: 36, h: 25, w: 7, d: 6 },
        { x: 43, h: 14, w: 5, d: 4 },
        { x: 48, h: 20, w: 6, d: 5 },
      ].map((b, i) => (
        <group key={`farCity${i}`} position={[b.x, 0, -22]}>
          <mesh position={[0, b.h / 2, 0]}><boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={buildingBase} roughness={0.6} metalness={0.25} /></mesh>
          {/* Fenêtres */}
          {Array.from({ length: Math.floor(b.h / 3) }).map((_, fi) => (
            <mesh key={`fw${fi}`} position={[0, fi * 3 + 2, b.d / 2 + 0.06]}>
              <boxGeometry args={[b.w * 0.7, 1, 0.04]} />
              <meshStandardMaterial color={glassColor} emissive={glassColor} emissiveIntensity={glassEmissive} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ENTREPOTS / HANGARS industriels */}
      {[
        { x: 12, z: -18, w: 10, d: 8, h: 5 },
        { x: -8, z: -22, w: 12, d: 6, h: 4 },
      ].map((e, i) => (
        <group key={`warehouse${i}`} position={[e.x, 0, e.z]}>
          <mesh position={[0, e.h / 2, 0]}><boxGeometry args={[e.w, e.h, e.d]} />
            <meshStandardMaterial color={isNight ? '#252a30' : '#909498'} roughness={0.8} metalness={0.15} /></mesh>
          {/* Toit ondulé */}
          <mesh position={[0, e.h + 0.3, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[e.w + 0.5, 0.5, e.d + 0.5]} />
            <meshStandardMaterial color={isNight ? '#303540' : '#b0b4b8'} metalness={0.5} roughness={0.3} /></mesh>
          {/* Porte */}
          <mesh position={[0, 1.5, e.d / 2 + 0.05]}>
            <boxGeometry args={[3, 3, 0.05]} />
            <meshStandardMaterial color={isNight ? '#1a1e24' : '#606468'} roughness={0.7} /></mesh>
        </group>
      ))}

      {/* LAMPADAIRES autoroute */}
      {[-30, -18, -6, 6, 18, 30].map((x, i) => (
        <group key={`lamp${i}`} position={[x, 0, -5]}>
          <mesh position={[0, 5, 0]}><cylinderGeometry args={[0.06, 0.08, 10, 6]} />
            <meshStandardMaterial color="#808488" metalness={0.6} /></mesh>
          <mesh position={[0.6, 10.2, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[1.2, 0.15, 0.3]} />
            <meshStandardMaterial color="#e8e8e0" emissive="#FFD700" emissiveIntensity={isNight ? 4 : 0.5} /></mesh>
        </group>
      ))}

      {/* PARKING bétonné */}
      <group position={[18, 0, -14]}>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 8]} />
          <meshStandardMaterial color={isNight ? '#222628' : '#9a9ea2'} roughness={0.9} /></mesh>
        {/* Places de parking */}
        {[-3, -1, 1, 3].map((x, i) => (
          <mesh key={`pk${i}`} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.04, 4]} />
            <meshStandardMaterial color={markingColor} /></mesh>
        ))}
      </group>

      {/* ROND-POINT */}
      <group position={[-5, 0, -18]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 4, 24]} />
          <meshStandardMaterial color={asphaltColor} roughness={0.9} /></mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2, 16]} />
          <meshStandardMaterial color={isNight ? '#1a3020' : '#4a8050'} roughness={0.95} /></mesh>
      </group>
    </group>
  );
}



// ─── VILLE COMPLETE — Rues + Batiments + Amenites integres ──────
function UrbanCircuitRoads({ isNight }) {
  const asphalt = isNight ? '#1a1e24' : '#505458';
  const tramRail = '#707880';
  const shoulderLine = '#f5f7fb';
  const ballast = isNight ? '#434a54' : '#b8bec6';
  const tramRef1 = useRef();
  const tramRef2 = useRef();
  const busRef1 = useRef();
  const busRef2 = useRef();

  // Route rectangulaire élargie — boucle carrée autour du centre (fontaine + gare)
  // Centre Z = 10, Rayon = 45
  const CENTER_Z = 10;
  const N = -35, S = 55, W = -50, E = 50;
  const rW = 5;
  const getLoopPose = (dist, inset = 0) => {
    const left = W + inset;
    const right = E - inset;
    const top = N + inset;
    const bottom = S - inset;
    const radius = Math.max(0, Math.min(Math.abs(inset), (right - left) / 2 - 0.01, (bottom - top) / 2 - 0.01));
    const normalize = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

    if (radius < 0.01) {
      const spanX = right - left;
      const spanZ = bottom - top;
      const perimeter = spanX * 2 + spanZ * 2;
      const d = ((dist % perimeter) + perimeter) % perimeter;

      if (d < spanX) return { x: left + d, z: top, rot: 0, perimeter };
      if (d < spanX + spanZ) return { x: right, z: top + (d - spanX), rot: Math.PI / 2, perimeter };
      if (d < spanX * 2 + spanZ) return { x: right - (d - spanX - spanZ), z: bottom, rot: Math.PI, perimeter };
      return { x: left, z: bottom - (d - spanX * 2 - spanZ), rot: -Math.PI / 2, perimeter };
    }

    const straightX = Math.max(0, right - left - radius * 2);
    const straightZ = Math.max(0, bottom - top - radius * 2);
    const arc = Math.PI * radius * 0.5;
    const perimeter = straightX * 2 + straightZ * 2 + arc * 4;
    let d = ((dist % perimeter) + perimeter) % perimeter;

    if (d < straightX) return { x: left + radius + d, z: top, rot: 0, perimeter };
    d -= straightX;

    if (d < arc) {
      const theta = -Math.PI / 2 + d / radius;
      return {
        x: right - radius + Math.cos(theta) * radius,
        z: top + radius + Math.sin(theta) * radius,
        rot: normalize(theta + Math.PI / 2),
        perimeter,
      };
    }
    d -= arc;

    if (d < straightZ) return { x: right, z: top + radius + d, rot: Math.PI / 2, perimeter };
    d -= straightZ;

    if (d < arc) {
      const theta = d / radius;
      return {
        x: right - radius + Math.cos(theta) * radius,
        z: bottom - radius + Math.sin(theta) * radius,
        rot: normalize(theta + Math.PI / 2),
        perimeter,
      };
    }
    d -= arc;

    if (d < straightX) return { x: right - radius - d, z: bottom, rot: Math.PI, perimeter };
    d -= straightX;

    if (d < arc) {
      const theta = Math.PI / 2 + d / radius;
      return {
        x: left + radius + Math.cos(theta) * radius,
        z: bottom - radius + Math.sin(theta) * radius,
        rot: normalize(theta + Math.PI / 2),
        perimeter,
      };
    }
    d -= arc;

    if (d < straightZ) return { x: left, z: bottom - radius - d, rot: -Math.PI / 2, perimeter };
    d -= straightZ;

    const theta = Math.PI + d / radius;
    return {
      x: left + radius + Math.cos(theta) * radius,
      z: top + radius + Math.sin(theta) * radius,
      rot: normalize(theta + Math.PI / 2),
      perimeter,
    };
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mv = (ref, sp, off, inset, y = 0.35) => {
      if (!ref.current) return;
      const pose = getLoopPose(t * sp + off, inset);
      ref.current.position.set(pose.x, y, pose.z);
      ref.current.rotation.set(0, pose.rot, 0);
    };
    const tramPerimeter = getLoopPose(0, 1.2).perimeter;
    const busPerimeter = getLoopPose(0, 0.55).perimeter;
    mv(tramRef1, 6, 0, 1.2);
    mv(tramRef2, 6, tramPerimeter / 2, -1.2);
    mv(busRef1, 8, busPerimeter / 4, 0.55);
    mv(busRef2, 8, busPerimeter * 3 / 4, -0.55);
  });

  const mZ = CENTER_Z, lH = E - W, lV = S - N;
  return (
    <group>
      {/* 4 segments route périphérique intérieur avec rails tramway */}
      {/* Route Nord (z=-35) */}
      <mesh position={[0, 0.03, N]}><boxGeometry args={[lH, 0.06, rW]}/><meshStandardMaterial color={asphalt} roughness={0.92}/></mesh>
      <mesh position={[0, 0.04, N]}><boxGeometry args={[lH - 4, 0.02, 0.08]}/><meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/></mesh>
      
      {/* Route Sud (z=55) */}
      <mesh position={[0, 0.03, S]}><boxGeometry args={[lH, 0.06, rW]}/><meshStandardMaterial color={asphalt} roughness={0.92}/></mesh>
      <mesh position={[0, 0.04, S]}><boxGeometry args={[lH - 4, 0.02, 0.08]}/><meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/></mesh>
      
      {/* Route Ouest (x=-50) */}
      <mesh position={[W, 0.03, mZ]}><boxGeometry args={[rW, 0.06, lV]}/><meshStandardMaterial color={asphalt} roughness={0.92}/></mesh>
      <mesh position={[W, 0.04, mZ]}><boxGeometry args={[0.08, 0.02, lV - 4]}/><meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/></mesh>
      
      {/* Route Est (x=50) */}
      <mesh position={[E, 0.03, mZ]}><boxGeometry args={[rW, 0.06, lV]}/><meshStandardMaterial color={asphalt} roughness={0.92}/></mesh>
      <mesh position={[E, 0.04, mZ]}><boxGeometry args={[0.08, 0.02, lV - 4]}/><meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/></mesh>

      {/* Lignes de rive et lecture des voies sur toute la boucle */}
      {[N, S].map((z, zi) => (
        <group key={`road-edges-h-${zi}`}>
          {[-rW / 2 + 0.45, rW / 2 - 0.45].map((offset, oi) => (
            <mesh key={`road-edge-h-${zi}-${oi}`} position={[0, 0.045, z + offset]}>
              <boxGeometry args={[lH - 4, 0.02, 0.08]} />
              <meshStandardMaterial color={shoulderLine} emissive={shoulderLine} emissiveIntensity={isNight ? 0.18 : 0} />
            </mesh>
          ))}
        </group>
      ))}
      {[W, E].map((x, xi) => (
        <group key={`road-edges-v-${xi}`}>
          {[-rW / 2 + 0.45, rW / 2 - 0.45].map((offset, oi) => (
            <mesh key={`road-edge-v-${xi}-${oi}`} position={[x + offset, 0.045, mZ]}>
              <boxGeometry args={[0.08, 0.02, lV - 4]} />
              <meshStandardMaterial color={shoulderLine} emissive={shoulderLine} emissiveIntensity={isNight ? 0.18 : 0} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Coins arrondis */}
      {[[W, N], [E, N], [E, S], [W, S]].map(([cx, cz], i) => (
        <group key={`cn-${i}`} position={[cx, 0.03, cz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[rW / 2, 16]}/>
            <meshStandardMaterial color={asphalt} roughness={0.92}/>
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
            <ringGeometry args={[rW / 2 - 0.5, rW / 2 - 0.38, 18]} />
            <meshStandardMaterial color={shoulderLine} emissive={shoulderLine} emissiveIntensity={isNight ? 0.16 : 0} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]}>
            <ringGeometry args={[0.52, 0.66, 18]} />
            <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.7 : 0} />
          </mesh>
        </group>
      ))}
      
      {/* Rails tramway sur les 4 côtés */}
      {[-1.2, 1.2].map((o, i) => (
        <group key={`tr-${i}`}>
          <mesh position={[0, 0.05, N + o]}><boxGeometry args={[lH, 0.04, 0.06]}/><meshStandardMaterial color={tramRail} metalness={0.8} roughness={0.2}/></mesh>
          <mesh position={[0, 0.05, S + o]}><boxGeometry args={[lH, 0.04, 0.06]}/><meshStandardMaterial color={tramRail} metalness={0.8} roughness={0.2}/></mesh>
          <mesh position={[W + o, 0.05, mZ]}><boxGeometry args={[0.06, 0.04, lV]}/><meshStandardMaterial color={tramRail} metalness={0.8} roughness={0.2}/></mesh>
          <mesh position={[E + o, 0.05, mZ]}><boxGeometry args={[0.06, 0.04, lV]}/><meshStandardMaterial color={tramRail} metalness={0.8} roughness={0.2}/></mesh>
        </group>
      ))}

      {/* Ballast et continuité des virages ferrés sur la boucle */}
      {[[W, N], [E, N], [E, S], [W, S]].map(([cx, cz], i) => (
        <group key={`tram-corner-${i}`} position={[cx, 0.04, cz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.05, 20]} />
            <meshStandardMaterial color={ballast} roughness={0.92} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[1.12, 1.28, 20]} />
            <meshStandardMaterial color={tramRail} metalness={0.86} roughness={0.16} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = W + 8 + i * 10;
        return (
          <React.Fragment key={`tram-ties-h-${i}`}>
            <mesh position={[x, 0.035, N]}><boxGeometry args={[0.38, 0.02, 2.8]} /><meshStandardMaterial color={ballast} roughness={0.9} /></mesh>
            <mesh position={[x, 0.035, S]}><boxGeometry args={[0.38, 0.02, 2.8]} /><meshStandardMaterial color={ballast} roughness={0.9} /></mesh>
          </React.Fragment>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const z = N + 8 + i * 10;
        return (
          <React.Fragment key={`tram-ties-v-${i}`}>
            <mesh position={[W, 0.035, z]}><boxGeometry args={[2.8, 0.02, 0.38]} /><meshStandardMaterial color={ballast} roughness={0.9} /></mesh>
            <mesh position={[E, 0.035, z]}><boxGeometry args={[2.8, 0.02, 0.38]} /><meshStandardMaterial color={ballast} roughness={0.9} /></mesh>
          </React.Fragment>
        );
      })}
      
      {/* Tramway bleu */}
      <group ref={tramRef1}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[4.5, 1.2, 1.5]}/><meshStandardMaterial color="#2c5f8a" metalness={0.4} roughness={0.3}/></mesh>
        <mesh position={[0, 1.2, 0]}><boxGeometry args={[4.2, 0.5, 1.4]}/><meshStandardMaterial color="#a0d8ee" transparent opacity={0.7}/></mesh>
        <mesh position={[0, 1.7, 0]}><boxGeometry args={[0.06, 0.6, 0.8]}/><meshStandardMaterial color="#444" metalness={0.7}/></mesh>
      </group>
      {/* Tramway rouge */}
      <group ref={tramRef2}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[4.5, 1.2, 1.5]}/><meshStandardMaterial color="#8a2c2c" metalness={0.4} roughness={0.3}/></mesh>
        <mesh position={[0, 1.2, 0]}><boxGeometry args={[4.2, 0.5, 1.4]}/><meshStandardMaterial color="#d8a0a0" transparent opacity={0.7}/></mesh>
        <mesh position={[0, 1.7, 0]}><boxGeometry args={[0.06, 0.6, 0.8]}/><meshStandardMaterial color="#444" metalness={0.7}/></mesh>
      </group>
      {/* Bus vert */}
      <group ref={busRef1}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[3.2, 1.0, 1.2]}/><meshStandardMaterial color="#1abc9c" metalness={0.35} roughness={0.4}/></mesh>
        <mesh position={[0, 1.1, 0]}><boxGeometry args={[2.8, 0.4, 1.1]}/><meshStandardMaterial color="#a0e8d8" transparent opacity={0.65}/></mesh>
      </group>
      {/* Bus orange */}
      <group ref={busRef2}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[3.2, 1.0, 1.2]}/><meshStandardMaterial color="#e67e22" metalness={0.35} roughness={0.4}/></mesh>
        <mesh position={[0, 1.1, 0]}><boxGeometry args={[2.8, 0.4, 1.1]}/><meshStandardMaterial color="#f5d4a0" transparent opacity={0.65}/></mesh>
      </group>
    </group>
  );
}

// ─── CityBlock : un immeuble avec son trottoir, arbres, lampadaire integre ──────
function CityBlock({ x, z, h, w, d, type, name, facing, isNight }) {
  const glass = isNight ? '#dff6ff' : '#74b8de';
  const gE = isNight ? 1.4 : 0.25;
  const shopC = isNight ? '#FFE8B0' : '#c8a060';
  const shopE = isNight ? 2.5 : 0.3;
  const fZ = facing === 'z+' ? d/2 + 0.1 : facing === 'z-' ? -d/2 - 0.1 : 0;
  const fX = facing === 'x+' ? w/2 + 0.1 : facing === 'x-' ? -w/2 - 0.1 : 0;
  const isHoriz = facing === 'z+' || facing === 'z-';
  const pad = 4;
  // 70% blancs, 30% colorés (basé sur la position)
  const hash = Math.abs(x * 7 + z * 13) % 10;
  const buildingColor = hash < 7
    ? (isNight ? '#c8ccd4' : ['#f0f2f6', '#eef0f4', '#f4f6fa', '#e8ecf0', '#f2f4f8', '#edf0f5', '#f0f4f8'][hash])
    : (isNight ? '#152535' : ['#2980b9', '#d35400', '#8e44ad'][hash - 7]);

  return (
    <group position={[x, 0, z]}>
      {/* SOL PROPRE sous et autour du batiment (BOX SOLIDE) */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[w + pad * 2 + 2, 0.4, d + pad * 2 + 2]}/>
        <meshStandardMaterial color={isNight ? '#1e222a' : '#d8d4cb'} roughness={0.9}/>
      </mesh>

      {/* Batiment */}
      <mesh position={[0, h/2, 0]}>
        <boxGeometry args={[w, h, d]}/>
        <meshStandardMaterial color={buildingColor} roughness={0.5} metalness={0.2}/>
      </mesh>
      <mesh position={[0, h+0.2, 0]}>
        <boxGeometry args={[w*0.96, 0.14, d*0.96]}/>
        <meshStandardMaterial color="#7d8b98" metalness={0.35} roughness={0.6}/>
      </mesh>

      {/* Fenetres 4 faces */}
      <mesh position={[0, h*0.55, d/2+0.06]}><boxGeometry args={[w*0.75, h*0.4, 0.05]}/><meshStandardMaterial color={glass} emissive={glass} emissiveIntensity={gE} roughness={0.2} metalness={0.4}/></mesh>
      <mesh position={[0, h*0.55, -d/2-0.06]}><boxGeometry args={[w*0.75, h*0.4, 0.05]}/><meshStandardMaterial color={glass} emissive={glass} emissiveIntensity={gE} roughness={0.2} metalness={0.4}/></mesh>
      <mesh position={[w/2+0.06, h*0.5, 0]}><boxGeometry args={[0.05, h*0.4, d*0.65]}/><meshStandardMaterial color={glass} emissive={glass} emissiveIntensity={gE*0.7} roughness={0.2}/></mesh>
      <mesh position={[-w/2-0.06, h*0.5, 0]}><boxGeometry args={[0.05, h*0.4, d*0.65]}/><meshStandardMaterial color={glass} emissive={glass} emissiveIntensity={gE*0.7} roughness={0.2}/></mesh>

      {/* Commerce / Banque sur le cote face route */}
      {type === 'shop' && (
        <group>
          <mesh position={[fX || 0, 1.2, fZ || 0]}>
            <boxGeometry args={[isHoriz ? w*0.8 : 0.05, 2, isHoriz ? 0.05 : d*0.8]}/>
            <meshStandardMaterial color={shopC} emissive={shopC} emissiveIntensity={shopE} transparent opacity={0.85}/>
          </mesh>
          <Text position={[fX ? fX*1.15 : 0, 2.8, fZ ? fZ*1.15 : 0]} fontSize={0.45} color={isNight ? '#FFD700' : '#222'} anchorX="center" rotation={[0, facing==='x-' ? Math.PI/2 : facing==='x+' ? -Math.PI/2 : facing==='z-' ? Math.PI : 0, 0]}>
            {name}
          </Text>
        </group>
      )}
      {type === 'bank' && (
        <group>
          <mesh position={[fX || 0, 1.5, fZ || 0]}>
            <boxGeometry args={[isHoriz ? w*0.85 : 0.05, 2.5, isHoriz ? 0.05 : d*0.85]}/>
            <meshStandardMaterial color="#1a3a5a" emissive="#2a5a8a" emissiveIntensity={isNight ? 1.5 : 0.3}/>
          </mesh>
          <Text position={[fX ? fX*1.15 : 0, 3.2, fZ ? fZ*1.15 : 0]} fontSize={0.5} color="#FFD700" anchorX="center" fontWeight="bold" rotation={[0, facing==='x-' ? Math.PI/2 : facing==='x+' ? -Math.PI/2 : facing==='z-' ? Math.PI : 0, 0]}>
            BANQUE
          </Text>
        </group>
      )}

      {/* TROTTOIRS SURELEVES sur les 4 cotes (BOX visibles de partout) */}
      {/* z+ */}
      <mesh position={[0, 0.12, d/2 + 1.2]}>
        <boxGeometry args={[w + 2, 0.24, 1.8]}/><meshStandardMaterial color={isNight ? '#2a2e34' : '#c0c4c8'} roughness={0.85}/></mesh>
      {/* z- */}
      <mesh position={[0, 0.12, -d/2 - 1.2]}>
        <boxGeometry args={[w + 2, 0.24, 1.8]}/><meshStandardMaterial color={isNight ? '#2a2e34' : '#c0c4c8'} roughness={0.85}/></mesh>
      {/* x+ */}
      <mesh position={[w/2 + 1.2, 0.12, 0]}>
        <boxGeometry args={[1.8, 0.24, d + 2]}/><meshStandardMaterial color={isNight ? '#2a2e34' : '#c0c4c8'} roughness={0.85}/></mesh>
      {/* x- */}
      <mesh position={[-w/2 - 1.2, 0.12, 0]}>
        <boxGeometry args={[1.8, 0.24, d + 2]}/><meshStandardMaterial color={isNight ? '#2a2e34' : '#c0c4c8'} roughness={0.85}/></mesh>

      {/* Bordures fines sur le dessus des trottoirs */}
      {[
        [0, 0.26, d/2 + 1.2, w + 2.1, 0.06, 0.16],
        [0, 0.26, -d/2 - 1.2, w + 2.1, 0.06, 0.16],
        [w/2 + 1.2, 0.26, 0, 0.16, 0.06, d + 2.1],
        [-w/2 - 1.2, 0.26, 0, 0.16, 0.06, d + 2.1],
      ].map(([cx, cy, cz, bw, bh, bd], curbIndex) => (
        <mesh key={`curb-cap-${curbIndex}`} position={[cx, cy, cz]}>
          <boxGeometry args={[bw, bh, bd]} />
          <meshStandardMaterial color={isNight ? '#d6dbe1' : '#eef2f5'} roughness={0.28} metalness={0.08} />
        </mesh>
      ))}

      {/* Bouches d'égout / grilles de drainage */}
      {[
        [0, 0.25, d/2 + 0.58, w * 0.24, 0.42],
        [0, 0.25, -d/2 - 0.58, w * 0.24, 0.42],
      ].map(([gx, gy, gz, gw, gd], grateIndex) => (
        <group key={`drain-grate-${grateIndex}`} position={[gx, gy, gz]}>
          <mesh><boxGeometry args={[gw, 0.04, gd]} /><meshStandardMaterial color={isNight ? '#5d6670' : '#7c858d'} metalness={0.7} roughness={0.22} /></mesh>
          {[-0.36, -0.12, 0.12, 0.36].map((barOffset, barIndex) => (
            <mesh key={`drain-bar-${barIndex}`} position={[barOffset * gw, 0.03, 0]}>
              <boxGeometry args={[0.03, 0.02, gd * 0.86]} />
              <meshStandardMaterial color="#2a3138" metalness={0.82} roughness={0.18} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ARBRES aux 4 coins */}
      {[
        [w/2 + 2.5, d/2 + 2.5],
        [-w/2 - 2.5, d/2 + 2.5],
        [w/2 + 2.5, -d/2 - 2.5],
        [-w/2 - 2.5, -d/2 - 2.5],
      ].map(([tx, tz], ti) => (
        <group key={`tree-${ti}`} position={[tx, 0, tz]}>
          <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.08, 0.1, 2.4, 5]}/><meshStandardMaterial color="#654321" roughness={0.9}/></mesh>
          <mesh position={[0, 2.76, 0]}><sphereGeometry args={[0.92, 8, 8]}/><meshStandardMaterial color="#2d7a2d" roughness={0.85}/></mesh>
        </group>
      ))}

      {/* LAMPADAIRES sur 2 cotes opposes */}
      {[
        [w/2 + 2.5, 0],
        [-w/2 - 2.5, 0],
      ].map(([lx, lz], li) => (
        <group key={`lamp-${li}`} position={[lx, 0, lz]}>
          <mesh position={[0, 3.5, 0]}><cylinderGeometry args={[0.04, 0.06, 7, 5]}/><meshStandardMaterial color="#808488" metalness={0.6}/></mesh>
          <mesh position={[0.3, 7.1, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.7, 0.08, 0.15]}/>
            <meshStandardMaterial color="#e8e8e0" emissive="#FFD700" emissiveIntensity={isNight ? 3.5 : 0.3}/>
          </mesh>
        </group>
      ))}

      {/* BARRIERES sur les 4 cotes */}
      {[
        [0, d/2 + 2.5, w * 0.4, 0],
        [0, -d/2 - 2.5, w * 0.4, 0],
        [w/2 + 2.5, 0, d * 0.4, Math.PI/2],
        [-w/2 - 2.5, 0, d * 0.4, Math.PI/2],
      ].map(([bx, bz, bw, br], bi) => (
        <mesh key={`bar-${bi}`} position={[bx, 0.22, bz]} rotation={[0, br, 0]}>
          <boxGeometry args={[bw, 0.44, 0.1]}/>
          <meshStandardMaterial color={bi % 2 === 0 ? '#cc3333' : '#eeeeee'} roughness={0.6}/>
        </mesh>
      ))}
    </group>
  );
}

function DowntownDistrict({ isNight, replicaSouthAvenue = false }) {
  const groundC = isNight ? '#1e222a' : '#ffffff';     // blanc brillant en mode jour
  const roadC = isNight ? '#1a1e24' : '#505458';
  const sidewalkC = isNight ? '#2a2e34' : '#ffffff';
  const southAvenueWidth = replicaSouthAvenue ? 14 : 8;
  const southSidewalkOffset = replicaSouthAvenue ? 9 : 5.5;
  const southSidewalkWidth = replicaSouthAvenue ? 3 : 2;
  const northAvenueWidth = replicaSouthAvenue ? 12 : 8;
  const northSidewalkOffset = replicaSouthAvenue ? 8 : 5.5;
  const northSidewalkWidth = replicaSouthAvenue ? 3 : 2;
  
  // Centre de la ville = point entre fontaine (z=18) et gare (z=-4)
  // Rayon de la boucle carrée = 45 unités depuis le centre
  const CENTER_Z = 10;
  const RADIUS = 45;
  
  return (
    <group>
      {/* ═══ SOL URBAIN SUD — dalle blanc brillant entre fontaine et immeubles ═══ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 42]}>
        <planeGeometry args={[160, 80]} />
        <meshStandardMaterial color={groundC} roughness={0.08} metalness={0.12} />
      </mesh>
      
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ ZONE SUD COMPLÈTE — Routes, trottoirs, rails entre fontaine et immeubles ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {/* === ROUTES TRANSVERSALES EST-OUEST === */}
      {/* Route z=24 SUPPRIMÉE — remplacée par la place de la fontaine */}
      {/* Route z=32 */}
      <mesh position={[0, 0.4, 32]}>
        <boxGeometry args={[100, 0.5, 6]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[0, 0.67, 32]}>
        <boxGeometry args={[98, 0.06, 0.2]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      {/* Route z=40 (avant les immeubles) */}
      <mesh position={[0, 0.4, 40]}>
        <boxGeometry args={[100, 0.5, 6]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[0, 0.67, 40]}>
        <boxGeometry args={[98, 0.06, 0.2]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      {/* Route z=50 */}
      <mesh position={[0, 0.4, 50]}>
        <boxGeometry args={[100, 0.5, 6]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[0, 0.67, 50]}>
        <boxGeometry args={[98, 0.06, 0.2]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      {/* Route z=60 */}
      <mesh position={[0, 0.4, 60]}>
        <boxGeometry args={[100, 0.5, 6]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[0, 0.67, 60]}>
        <boxGeometry args={[98, 0.06, 0.2]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      
      {/* === AVENUE CENTRALE SUD (z=18 à z=70) === */}
      <mesh position={[0, 0.4, 44]}>
        <boxGeometry args={[southAvenueWidth, 0.5, 52]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[-southSidewalkOffset, 0.5, 44]}>
        <boxGeometry args={[southSidewalkWidth, 0.7, 52]}/>
        <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
      </mesh>
      <mesh position={[southSidewalkOffset, 0.5, 44]}>
        <boxGeometry args={[southSidewalkWidth, 0.7, 52]}/>
        <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
      </mesh>
      
      {/* === RAILS DE TRAMWAY sur routes transversales SUD === */}
      {[32, 40, 50, 60].map((rz, ri) => (
        <group key={`rails-sud-${ri}`}>
          {[-1.2, 1.2].map((o, oi) => (
            <mesh key={`rail-${oi}`} position={[0, 0.7, rz + o]}>
              <boxGeometry args={[98, 0.06, 0.08]}/>
              <meshStandardMaterial color="#707880" metalness={0.8} roughness={0.2}/>
            </mesh>
          ))}
        </group>
      ))}
      
      {/* === TROTTOIRS le long des routes transversales SUD === */}
      {[32, 40, 50, 60].map((tz, ti) => (
        <group key={`trot-sud-${ti}`}>
          <mesh position={[0, 0.45, tz - 4]}>
            <boxGeometry args={[100, 0.6, 2]}/>
            <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
          </mesh>
          <mesh position={[0, 0.45, tz + 4]}>
            <boxGeometry args={[100, 0.6, 2]}/>
            <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
          </mesh>
        </group>
      ))}
      
      {/* === AVENUES PARALLÈLES NORD-SUD (côtés gauche et droit) === */}
      {/* Avenue gauche x=-25 */}
      <mesh position={[-25, 0.4, 42]}>
        <boxGeometry args={[6, 0.5, 50]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[-25, 0.67, 42]}>
        <boxGeometry args={[0.1, 0.04, 48]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      {/* Avenue droite x=25 */}
      <mesh position={[25, 0.4, 42]}>
        <boxGeometry args={[6, 0.5, 50]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[25, 0.67, 42]}>
        <boxGeometry args={[0.1, 0.04, 48]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      {/* Avenue extrême gauche x=-40 */}
      <mesh position={[-40, 0.4, 42]}>
        <boxGeometry args={[6, 0.5, 50]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      {/* Avenue extrême droite x=40 */}
      <mesh position={[40, 0.4, 42]}>
        <boxGeometry args={[6, 0.5, 50]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      
      {/* === RAILS DE TRAMWAY sur avenues parallèles === */}
      {[-25, 25].map((ax, ai) => (
        <group key={`rails-av-${ai}`}>
          {[-1.2, 1.2].map((o, oi) => (
            <mesh key={`rail-av-${oi}`} position={[ax + o, 0.7, 42]}>
              <boxGeometry args={[0.08, 0.06, 48]}/>
              <meshStandardMaterial color="#707880" metalness={0.8} roughness={0.2}/>
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Arbres des routes SUD retirés pour libérer totalement les chaussées */}
      
      {/* === LAMPADAIRES le long des routes SUD === */}
      {[24, 32, 40, 50, 60].map((tz, ti) => (
        <group key={`lamp-sud-${ti}`}>
          {[-35, -20, -5, 5, 20, 35].map((tx, txi) => (
            <group key={`lamp-${txi}`} position={[tx, 0, tz]}>
              <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.04, 0.06, 8, 5]}/><meshStandardMaterial color="#808488" metalness={0.6}/></mesh>
              <mesh position={[0.3, 8.1, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.7, 0.08, 0.15]}/><meshStandardMaterial color="#e8e8e0" emissive="#FFD700" emissiveIntensity={isNight ? 3.5 : 0.3}/></mesh>
            </group>
          ))}
        </group>
      ))}
      {[-40, 40].map((ax, ai) => (
        <group key={`south-avenue-markings-${ai}`}>
          <mesh position={[ax, 0.68, 42]}><boxGeometry args={[0.08, 0.03, 48]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[ax - 2.1, 0.68, 42]}><boxGeometry args={[0.08, 0.03, 48]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[ax + 2.1, 0.68, 42]}><boxGeometry args={[0.08, 0.03, 48]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      ))}
      
      {/* === BARRIÈRES le long des routes SUD === */}
      {[24, 32, 40, 50, 60].map((tz, ti) => (
        <group key={`bar-sud-${ti}`}>
          {[-45, -35, -15, 15, 35, 45].map((tx, txi) => (
            <mesh key={`bar-${txi}`} position={[tx, 0.3, tz - 3.5]}>
              <boxGeometry args={[0.12, 0.6, 3]}/>
              <meshStandardMaterial color={ti % 2 === 0 ? '#cc3333' : '#eee'} roughness={0.6}/>
            </mesh>
          ))}
        </group>
      ))}
      
      {/* ═══ IMMEUBLES LE LONG DE L'AVENUE SUD — REPOSITIONNÉS pour ne pas chevaucher les routes ═══ */}
      {/* Bâtiments déplacés APRÈS toutes les routes (z=60 fin à z=63) pour éviter les collisions visuelles */}
      {/* Côté GAUCHE — skyline sud lointain */}
      <CityBlock x={replicaSouthAvenue ? -24 : -14} z={68} h={20} w={6} d={5} type="shop" name="FLEURS" facing="z-" isNight={isNight}/>
      <CityBlock x={replicaSouthAvenue ? -30 : -18} z={78} h={24} w={7} d={5.5} type="office" name="" facing="z-" isNight={isNight}/>
      {/* Côté DROIT — skyline sud lointain */}
      <CityBlock x={replicaSouthAvenue ? 24 : 14} z={68} h={18} w={6} d={5} type="shop" name="BIJOU" facing="z-" isNight={isNight}/>
      <CityBlock x={replicaSouthAvenue ? 30 : 18} z={78} h={22} w={7} d={5.5} type="office" name="" facing="z-" isNight={isNight}/>
      {/* 2ème rang gauche */}
      <CityBlock x={replicaSouthAvenue ? -46 : -32} z={70} h={28} w={7} d={6} type="office" name="SUD-W" facing="z-" isNight={isNight}/>
      <CityBlock x={replicaSouthAvenue ? -50 : -34} z={82} h={30} w={8} d={6.5} type="office" name="" facing="z-" isNight={isNight}/>
      {/* 2ème rang droit */}
      <CityBlock x={replicaSouthAvenue ? 46 : 32} z={70} h={26} w={7} d={6} type="office" name="SUD-E" facing="z-" isNight={isNight}/>
      <CityBlock x={replicaSouthAvenue ? 50 : 34} z={82} h={28} w={8} d={6.5} type="office" name="" facing="z-" isNight={isNight}/>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ AVENUE NORD — de la gare vers les immeubles nord (z=-35 et au-delà) ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* Route principale NORD - étendue jusqu'à z=-70 */}
      <mesh position={[0, 0.08, -30]}>
        <boxGeometry args={[northAvenueWidth, 0.16, 60]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      {/* Trottoirs NORD gauche et droit */}
      <mesh position={[-northSidewalkOffset, 0.15, -30]}>
        <boxGeometry args={[northSidewalkWidth, 0.3, 60]}/>
        <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
      </mesh>
      <mesh position={[northSidewalkOffset, 0.15, -30]}>
        <boxGeometry args={[northSidewalkWidth, 0.3, 60]}/>
        <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
      </mesh>
      
      {/* ═══ IMMEUBLES LE LONG DE L'AVENUE NORD (entre gare z=0 et route z=-35) ═══ */}
      {/* Côté GAUCHE de l'avenue NORD (x=-15 à x=-25) */}
      <CityBlock x={-18} z={-8} h={16} w={6} d={5} type="shop" name="NORD-1" facing="x+" isNight={isNight}/>
      <CityBlock x={-20} z={-18} h={22} w={7} d={5.5} type="office" name="" facing="x+" isNight={isNight}/>
      <CityBlock x={-18} z={-28} h={18} w={6.5} d={5} type="shop" name="KIOSK" facing="x+" isNight={isNight}/>
      {/* Côté DROIT de l'avenue NORD (x=15 à x=25) */}
      <CityBlock x={18} z={-8} h={14} w={6} d={5} type="shop" name="NORD-2" facing="x-" isNight={isNight}/>
      <CityBlock x={20} z={-18} h={20} w={7} d={5.5} type="office" name="" facing="x-" isNight={isNight}/>
      <CityBlock x={18} z={-28} h={16} w={6.5} d={5} type="shop" name="SNACK" facing="x-" isNight={isNight}/>
      {/* 2ème rang gauche (x=-28 à x=-35) */}
      <CityBlock x={-30} z={-10} h={24} w={7} d={6} type="office" name="" facing="x+" isNight={isNight}/>
      <CityBlock x={-32} z={-22} h={28} w={8} d={6.5} type="office" name="TOWER-N" facing="x+" isNight={isNight}/>
      {/* 2ème rang droit (x=28 à x=35) */}
      <CityBlock x={30} z={-10} h={24} w={7} d={6} type="office" name="" facing="x-" isNight={isNight}/>
      <CityBlock x={32} z={-22} h={26} w={8} d={6.5} type="office" name="EAST-N" facing="x-" isNight={isNight}/>
      
      {/* Arbres de l'avenue NORD retirés des emprises routières */}
      {[-6, -18, -30, -42, -54].map((tz, i) => (
        <group key={`north-avenue-markings-${i}`}>
          <mesh position={[0, 0.18, tz]}><boxGeometry args={[1.6, 0.03, 0.12]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      ))}
      <mesh position={[-northAvenueWidth / 2 + 0.22, 0.18, -30]}><boxGeometry args={[0.08, 0.03, 60]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[northAvenueWidth / 2 - 0.22, 0.18, -30]}><boxGeometry args={[0.08, 0.03, 60]} /><meshStandardMaterial color="#ffffff" /></mesh>
      {/* Lampadaires NORD */}
      {[-10, -22, -34, -46, -56].map((tz, i) => (
        <group key={`ln-${i}`}>
          {[-8, 8].map((lx, j) => (
            <group key={`lnp-${j}`} position={[lx, 0, tz]}>
              <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.04, 0.06, 8, 5]}/><meshStandardMaterial color="#808488" metalness={0.6}/></mesh>
              <mesh position={[0.3, 8.1, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.7, 0.08, 0.15]}/><meshStandardMaterial color="#e8e8e0" emissive="#FFD700" emissiveIntensity={isNight ? 3.5 : 0.3}/></mesh>
            </group>
          ))}
        </group>
      ))}
      {/* Barrières NORD */}
      {[-8, -18, -28, -38, -48, -56].map((tz, i) => (
        <group key={`bn-${i}`}>
          <mesh position={[-4.3, 0.3, tz]}><boxGeometry args={[0.12, 0.6, 3]}/><meshStandardMaterial color={i%2===0 ? '#cc3333' : '#eee'} roughness={0.6}/></mesh>
          <mesh position={[4.3, 0.3, tz]}><boxGeometry args={[0.12, 0.6, 3]}/><meshStandardMaterial color={i%2===0 ? '#cc3333' : '#eee'} roughness={0.6}/></mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ AVENUE OUEST — étendue vers le Nord (z=-30 à z=50) ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <mesh position={[-30, 0.08, 10]}>
        <boxGeometry args={[40, 0.16, 80]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[-30, 0.15, -25]}>
        <boxGeometry args={[40, 0.3, 2]}/>
        <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
      </mesh>
      <mesh position={[-30, 0.15, 45]}>
        <boxGeometry args={[40, 0.3, 2]}/>
        <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
      </mesh>
      {/* Arbres Ouest retirés des chaussées */}
      {[-18, -30, -42].map((tx, i) => (
        <group key={`lw-${i}`}>
          {[-18, -4, 10, 24, 38].map((lz, j) => (
            <group key={`lwp-${j}`} position={[tx, 0, lz]}>
              <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.04, 0.06, 8, 5]}/><meshStandardMaterial color="#808488" metalness={0.6}/></mesh>
              <mesh position={[0.3, 8.1, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.7, 0.08, 0.15]}/><meshStandardMaterial color="#e8e8e0" emissive="#FFD700" emissiveIntensity={isNight ? 3.5 : 0.3}/></mesh>
            </group>
          ))}
        </group>
      ))}
      {[-16, -26, -36, -46].map((tx, i) => (
        <group key={`bw-${i}`}>
          <mesh position={[tx, 0.3, -22]}><boxGeometry args={[3, 0.6, 0.12]}/><meshStandardMaterial color={i%2===0 ? '#cc3333' : '#eee'} roughness={0.6}/></mesh>
          <mesh position={[tx, 0.3, 42]}><boxGeometry args={[3, 0.6, 0.12]}/><meshStandardMaterial color={i%2===0 ? '#cc3333' : '#eee'} roughness={0.6}/></mesh>
        </group>
      ))}
      <mesh position={[-30, 0.18, 10]}><boxGeometry args={[0.08, 0.03, 80]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[-48.6, 0.18, 10]}><boxGeometry args={[0.08, 0.03, 80]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[-11.4, 0.18, 10]}><boxGeometry args={[0.08, 0.03, 80]} /><meshStandardMaterial color="#ffffff" /></mesh>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ BOULEVARD EST — route normale (6 unités de large) ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <mesh position={[30, 0.06, 10]}>
        <boxGeometry args={[6, 0.12, 80]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[30, 0.13, 10]}>
        <boxGeometry args={[0.1, 0.02, 78]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      <mesh position={[34, 0.1, 10]}>
        <boxGeometry args={[2, 0.2, 80]}/>
        <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
      </mesh>
      <mesh position={[26, 0.1, 10]}>
        <boxGeometry args={[2, 0.2, 80]}/>
        <meshStandardMaterial color={sidewalkC} roughness={0.85}/>
      </mesh>
      {/* Arbres Est retirés des chaussées */}
      {[18, 30, 42].map((tx, i) => (
        <group key={`le-${i}`}>
          {[-18, -4, 10, 24, 38].map((lz, j) => (
            <group key={`lep-${j}`} position={[tx, 0, lz]}>
              <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.04, 0.06, 8, 5]}/><meshStandardMaterial color="#808488" metalness={0.6}/></mesh>
              <mesh position={[0.3, 8.1, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.7, 0.08, 0.15]}/><meshStandardMaterial color="#e8e8e0" emissive="#FFD700" emissiveIntensity={isNight ? 3.5 : 0.3}/></mesh>
            </group>
          ))}
        </group>
      ))}
      {[16, 26, 36, 46].map((tx, i) => (
        <group key={`be-${i}`}>
          <mesh position={[tx, 0.3, -22]}><boxGeometry args={[3, 0.6, 0.12]}/><meshStandardMaterial color={i%2===0 ? '#cc3333' : '#eee'} roughness={0.6}/></mesh>
          <mesh position={[tx, 0.3, 42]}><boxGeometry args={[3, 0.6, 0.12]}/><meshStandardMaterial color={i%2===0 ? '#cc3333' : '#eee'} roughness={0.6}/></mesh>
        </group>
      ))}
      <mesh position={[30, 0.18, 10]}><boxGeometry args={[0.08, 0.03, 80]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[27.2, 0.18, 10]}><boxGeometry args={[0.08, 0.03, 80]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[32.8, 0.18, 10]}><boxGeometry args={[0.08, 0.03, 80]} /><meshStandardMaterial color="#ffffff" /></mesh>

      {/* Parkings centre-ville : en épi, souterrain et immeuble */}
      <group position={[53, 0, 24]}>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[18, 14]} /><meshStandardMaterial color={roadC} roughness={0.92} /></mesh>
        {Array.from({ length: 7 }).map((_, i) => {
          const z = -5.5 + i * 1.8;
          return <mesh key={`epi-${i}`} position={[0, 0.08, z]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[3.4, 0.03, 0.1]} /><meshStandardMaterial color="#ffffff" /></mesh>;
        })}
        <mesh position={[0, 1.8, 7.2]}><boxGeometry args={[7.2, 0.9, 0.12]} /><meshStandardMaterial color="#17324f" emissive="#7ce7ff" emissiveIntensity={isNight ? 1.6 : 0.12} /></mesh>
        <Text position={[0, 1.82, 7.36]} fontSize={0.38} color="#ffffff" anchorX="center" fontWeight="bold">PARKING EN ÉPI</Text>
      </group>
      <group position={[-54, 0, 20]}>
        <mesh position={[0, -0.4, 0]} rotation={[-0.42, 0, 0]}><boxGeometry args={[8, 0.22, 12]} /><meshStandardMaterial color={roadC} roughness={0.9} /></mesh>
        <mesh position={[0, 0.8, 7.2]}><boxGeometry args={[6.4, 0.9, 0.12]} /><meshStandardMaterial color="#17324f" emissive="#ffd870" emissiveIntensity={isNight ? 1.6 : 0.12} /></mesh>
        <Text position={[0, 0.82, 7.36]} fontSize={0.34} color="#ffffff" anchorX="center" fontWeight="bold">PARKING -1</Text>
      </group>
      <group position={[58, 0, -44]}>
        <mesh position={[0, 5, 0]}><boxGeometry args={[12, 10, 14]} /><meshStandardMaterial color={isNight ? '#2a3440' : '#d8dde5'} roughness={0.45} metalness={0.18} /></mesh>
        {[1.8, 5, 8.2].map((y, i) => <mesh key={`parking-floor-${i}`} position={[0, y, 0]}><boxGeometry args={[11.4, 0.14, 13.4]} /><meshStandardMaterial color={isNight ? '#4a5560' : '#f0f3f7'} roughness={0.2} /></mesh>)}
        <mesh position={[0, 9.6, 7.12]}><boxGeometry args={[8.2, 0.9, 0.12]} /><meshStandardMaterial color="#17324f" emissive="#7ce7ff" emissiveIntensity={isNight ? 1.6 : 0.12} /></mesh>
        <Text position={[0, 9.62, 7.28]} fontSize={0.36} color="#ffffff" anchorX="center" fontWeight="bold">PARKING IMMEUBLE</Text>
      </group>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ ROUTE PERIMETRIQUE — Boucle carrée autour du centre ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* Route Sud (z=55) */}
      <mesh position={[0, 0.08, 55]}>
        <boxGeometry args={[110, 0.16, 6]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[0, 0.17, 55]}>
        <boxGeometry args={[108, 0.02, 0.1]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      
      {/* Route Nord (z=-35) */}
      <mesh position={[0, 0.08, -35]}>
        <boxGeometry args={[110, 0.16, 6]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[0, 0.17, -35]}>
        <boxGeometry args={[108, 0.02, 0.1]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      
      {/* Route Ouest (x=-50) */}
      <mesh position={[-50, 0.08, CENTER_Z]}>
        <boxGeometry args={[6, 0.16, 96]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[-50, 0.17, CENTER_Z]}>
        <boxGeometry args={[0.1, 0.02, 94]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>
      
      {/* Route Est (x=50) */}
      <mesh position={[50, 0.08, CENTER_Z]}>
        <boxGeometry args={[6, 0.16, 96]}/>
        <meshStandardMaterial color={roadC} roughness={0.92}/>
      </mesh>
      <mesh position={[50, 0.17, CENTER_Z]}>
        <boxGeometry args={[0.1, 0.02, 94]}/>
        <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.8 : 0}/>
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ IMMEUBLES SUD — DÉPLACÉS après la route z=60 (fin à z=63) pour éviter les collisions ═══ */}
      {/* Rang 1 Sud (z=68) - 5 immeubles - skyline visible en arrière-plan */}
      <CityBlock x={replicaSouthAvenue ? -58 : -32} z={68} h={22} w={7} d={5} type="shop" name="MODE" facing="z-" isNight={isNight}/>
      {!replicaSouthAvenue && <CityBlock x={-16} z={70} h={30} w={7.5} d={5.5} type="office" name="" facing="z-" isNight={isNight}/>}
      {!replicaSouthAvenue && <CityBlock x={0} z={69} h={26} w={6.5} d={5} type="bank" name="" facing="z-" isNight={isNight}/>}
      {!replicaSouthAvenue && <CityBlock x={16} z={68} h={22} w={7} d={5} type="shop" name="CAFE" facing="z-" isNight={isNight}/>}
      <CityBlock x={replicaSouthAvenue ? 58 : 32} z={70} h={28} w={7} d={5.5} type="office" name="" facing="z-" isNight={isNight}/>
      {/* Rang 2 Sud (z=78) - 4 immeubles */}
      <CityBlock x={replicaSouthAvenue ? -44 : -24} z={78} h={34} w={8} d={6} type="office" name="" facing="z-" isNight={isNight}/>
      {!replicaSouthAvenue && <CityBlock x={-6} z={80} h={28} w={7} d={6} type="shop" name="LIVRES" facing="z-" isNight={isNight}/>}
      {!replicaSouthAvenue && <CityBlock x={12} z={79} h={32} w={7.5} d={6} type="office" name="" facing="z-" isNight={isNight}/>}
      <CityBlock x={replicaSouthAvenue ? 44 : 28} z={78} h={30} w={7} d={6} type="shop" name="SPA" facing="z-" isNight={isNight}/>
      {/* Rang 3 Sud (z=90) - 3 grands immeubles tours */}
      <CityBlock x={replicaSouthAvenue ? -40 : -20} z={90} h={40} w={9} d={7} type="office" name="PLAZA" facing="z-" isNight={isNight}/>
      {!replicaSouthAvenue && <CityBlock x={0} z={92} h={34} w={8} d={7} type="shop" name="CENTRE" facing="z-" isNight={isNight}/>}
      <CityBlock x={replicaSouthAvenue ? 40 : 20} z={90} h={38} w={8.5} d={7} type="office" name="" facing="z-" isNight={isNight}/>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ IMMEUBLES NORD — 12 grands immeubles (5 rang 1 + 4 rang 2 + 3 rang 3) ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* Rang 1 Nord (z=-42) - 5 immeubles */}
      <CityBlock x={-32} z={-42} h={18} w={7} d={5} type="shop" name="SPORT" facing="z+" isNight={isNight}/>
      <CityBlock x={-16} z={-44} h={26} w={7.5} d={5.5} type="office" name="" facing="z+" isNight={isNight}/>
      <CityBlock x={0} z={-43} h={22} w={6.5} d={5} type="bank" name="" facing="z+" isNight={isNight}/>
      <CityBlock x={16} z={-42} h={18} w={7} d={5} type="shop" name="METRO" facing="z+" isNight={isNight}/>
      <CityBlock x={32} z={-44} h={24} w={7} d={5.5} type="office" name="" facing="z+" isNight={isNight}/>
      {/* Rang 2 Nord (z=-54) - 4 immeubles */}
      <CityBlock x={-24} z={-54} h={30} w={8} d={6} type="office" name="" facing="z+" isNight={isNight}/>
      <CityBlock x={-6} z={-56} h={24} w={7} d={6} type="shop" name="CINEMA" facing="z+" isNight={isNight}/>
      <CityBlock x={12} z={-55} h={28} w={7.5} d={6} type="office" name="" facing="z+" isNight={isNight}/>
      <CityBlock x={28} z={-54} h={26} w={7} d={6} type="shop" name="HOTEL" facing="z+" isNight={isNight}/>
      {/* Rang 3 Nord (z=-66) - 3 grands immeubles */}
      <CityBlock x={-20} z={-66} h={35} w={9} d={7} type="office" name="TOWER" facing="z+" isNight={isNight}/>
      <CityBlock x={0} z={-68} h={28} w={8} d={7} type="shop" name="GALERIA" facing="z+" isNight={isNight}/>
      <CityBlock x={20} z={-66} h={32} w={8.5} d={7} type="office" name="" facing="z+" isNight={isNight}/>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ IMMEUBLES OUEST — Rangées PROCHES et LOINTAINES ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* Rang PROCHE Ouest (x=-40 à -48) - VISIBLE depuis la fontaine */}
      <CityBlock x={-42} z={20} h={16} w={5.5} d={6} type="shop" name="OUEST-1" facing="x+" isNight={isNight}/>
      <CityBlock x={-44} z={24} h={22} w={6} d={6.5} type="office" name="" facing="x+" isNight={isNight}/>
      {/* Bâtiments z=36 et z=48 supprimés (conflits routes z=32 et z=50) — remplacés plus loin */}
      <CityBlock x={-42} z={68} h={22} w={5.5} d={6} type="shop" name="OUEST-2" facing="x+" isNight={isNight}/>
      <CityBlock x={-44} z={80} h={24} w={6} d={6} type="office" name="" facing="x+" isNight={isNight}/>
      {/* Rang 1 Ouest LOINTAIN (x=-57) - repositionné pour éviter les routes */}
      <CityBlock x={-57} z={-28} h={20} w={5} d={7} type="shop" name="OPTIQUE" facing="x+" isNight={isNight}/>
      <CityBlock x={-58} z={-14} h={24} w={5.5} d={7.5} type="office" name="" facing="x+" isNight={isNight}/>
      <CityBlock x={-57} z={-8} h={18} w={5} d={7} type="shop" name="PHARMA" facing="x+" isNight={isNight}/>
      <CityBlock x={-59} z={22} h={26} w={5.5} d={7.5} type="office" name="" facing="x+" isNight={isNight}/>
      <CityBlock x={-58} z={25} h={22} w={5} d={6.5} type="bank" name="" facing="x+" isNight={isNight}/>
      <CityBlock x={-57} z={68} h={22} w={5} d={7} type="shop" name="TECH" facing="x+" isNight={isNight}/>
      <CityBlock x={-59} z={75} h={28} w={5.5} d={7} type="office" name="" facing="x+" isNight={isNight}/>
      {/* Rang 2 Ouest (x=-69) - repositionné pour éviter les routes */}
      <CityBlock x={-69} z={-20} h={30} w={6} d={8} type="office" name="" facing="x+" isNight={isNight}/>
      <CityBlock x={-70} z={-12} h={26} w={6} d={7} type="shop" name="ART" facing="x+" isNight={isNight}/>
      <CityBlock x={-69} z={20} h={28} w={6} d={7.5} type="office" name="" facing="x+" isNight={isNight}/>
      <CityBlock x={-70} z={25} h={24} w={6} d={7} type="shop" name="DESIGN" facing="x+" isNight={isNight}/>
      <CityBlock x={-69} z={70} h={36} w={6.5} d={8} type="office" name="WEST" facing="x+" isNight={isNight}/>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ═══ IMMEUBLES EST — Rangées PROCHES et LOINTAINES ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* Rang PROCHE Est (x=40 à 48) - VISIBLE depuis la fontaine */}
      <CityBlock x={42} z={20} h={16} w={5.5} d={6} type="shop" name="EST-1" facing="x-" isNight={isNight}/>
      <CityBlock x={44} z={24} h={22} w={6} d={6.5} type="office" name="" facing="x-" isNight={isNight}/>
      {/* Bâtiments z=36 et z=48 supprimés (conflits routes z=32 et z=50) — remplacés plus loin */}
      <CityBlock x={42} z={68} h={22} w={5.5} d={6} type="shop" name="EST-2" facing="x-" isNight={isNight}/>
      <CityBlock x={44} z={80} h={24} w={6} d={6} type="office" name="" facing="x-" isNight={isNight}/>
      {/* Rang 1 Est LOINTAIN (x=57) - repositionné pour éviter les routes */}
      <CityBlock x={57} z={-28} h={20} w={5} d={7} type="shop" name="BIJOUX" facing="x-" isNight={isNight}/>
      <CityBlock x={58} z={-14} h={24} w={5.5} d={7.5} type="office" name="" facing="x-" isNight={isNight}/>
      <CityBlock x={57} z={-8} h={18} w={5} d={7} type="shop" name="MARCHE" facing="x-" isNight={isNight}/>
      <CityBlock x={59} z={22} h={26} w={5.5} d={7.5} type="office" name="" facing="x-" isNight={isNight}/>
      <CityBlock x={58} z={25} h={22} w={5} d={6.5} type="bank" name="" facing="x-" isNight={isNight}/>
      <CityBlock x={57} z={68} h={22} w={5} d={7} type="shop" name="PRESSE" facing="x-" isNight={isNight}/>
      <CityBlock x={59} z={75} h={28} w={5.5} d={7} type="office" name="" facing="x-" isNight={isNight}/>
      {/* Rang 2 Est (x=69) - repositionné pour éviter les routes */}
      <CityBlock x={69} z={-20} h={30} w={6} d={8} type="office" name="" facing="x-" isNight={isNight}/>
      <CityBlock x={70} z={-12} h={26} w={6} d={7} type="shop" name="MUSIC" facing="x-" isNight={isNight}/>
      <CityBlock x={69} z={20} h={28} w={6} d={7.5} type="office" name="" facing="x-" isNight={isNight}/>
      <CityBlock x={70} z={25} h={24} w={6} d={7} type="shop" name="GAMES" facing="x-" isNight={isNight}/>
      <CityBlock x={69} z={70} h={36} w={6.5} d={8} type="office" name="EAST" facing="x-" isNight={isNight}/>

      {/* ═══ ACCES METRO SOUTERRAIN — 8 entrees symétriques Nord/Sud ═══ */}
      {/* SUD: z=38 et z=48 déplacés à z=35 et z=45 pour éviter les routes z=40 et z=50 */}
      {[
        // SUD - 4 accès (reculés pour ne pas empiéter sur les routes)
        { x: -12, z: 35, rot: Math.PI },
        { x: 12, z: 35, rot: Math.PI },
        { x: -30, z: 45, rot: Math.PI },
        { x: 30, z: 45, rot: Math.PI },
        // NORD - 4 accès (miroir)
        { x: -12, z: -18, rot: 0 },
        { x: 12, z: -18, rot: 0 },
        { x: -30, z: -28, rot: 0 },
        { x: 30, z: -28, rot: 0 },
      ].map((m, i) => (
        <group key={`mt-${i}`} position={[m.x, 0, m.z]} rotation={[0, m.rot, 0]}>
          <mesh position={[0, 1.5, 0]}><boxGeometry args={[3.5, 3, 2]}/><meshStandardMaterial color={isNight ? '#1a2030' : '#404850'} roughness={0.7} metalness={0.2}/></mesh>
          <mesh position={[0, 1.5, 1.05]}><boxGeometry args={[3, 2.5, 0.05]}/><meshStandardMaterial color="#80c0e0" transparent opacity={0.6} metalness={0.4}/></mesh>
          <mesh position={[0, 3.2, 0]}><boxGeometry args={[1.5, 0.7, 0.12]}/><meshStandardMaterial color="#1a3a80" emissive="#3366ff" emissiveIntensity={isNight ? 3 : 0.8}/></mesh>
          <Text position={[0, 3.2, 0.14]} fontSize={0.5} color="#ffffff" anchorX="center" fontWeight="bold">M</Text>
          {[0,1,2,3].map(s => (
            <mesh key={`s-${s}`} position={[0, -0.1-s*0.3, -0.3-s*0.4]}><boxGeometry args={[2.5, 0.12, 0.4]}/><meshStandardMaterial color={isNight ? '#303840' : '#909498'} roughness={0.8}/></mesh>
          ))}
        </group>
      ))}

      {/* ═══ ESPACES VERTS — symétriques Nord/Sud ═══ */}
      {[
        // SUD
        [-24, 38, 5, 2.5], [24, 38, 5, 2.5], [0, 42, 6, 2.5],
        [-36, 26, 2.5, 5], [36, 26, 2.5, 5],
        [-36, 40, 2.5, 5], [36, 40, 2.5, 5],
        // NORD (miroir)
        [-24, -18, 5, 2.5], [24, -18, 5, 2.5], [0, -22, 6, 2.5],
        [-36, -6, 2.5, 5], [36, -6, 2.5, 5],
        [-36, -20, 2.5, 5], [36, -20, 2.5, 5],
      ].map(([px, pz, sx, sz], pi) => (
        <group key={`pk-${pi}`} position={[px, 0, pz]}>
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[sx, sz]}/><meshStandardMaterial color={isNight ? '#1a3020' : '#4a8050'} roughness={0.95}/></mesh>
          {[-1, 0, 1].map((tx, ti) => (
            <group key={`t-${ti}`} position={[tx * (sx > 3 ? 1.5 : 0), 0, 0]}>
              <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.07, 0.09, 2, 5]}/><meshStandardMaterial color="#654321" roughness={0.9}/></mesh>
              <mesh position={[0, 2.28, 0]}><sphereGeometry args={[0.82, 8, 8]}/><meshStandardMaterial color="#2d7a2d" roughness={0.85}/></mesh>
            </group>
          ))}
          <mesh position={[0, 0.3, sz/2-0.3]}><boxGeometry args={[1.5, 0.6, 0.4]}/><meshStandardMaterial color="#1a5276" roughness={0.6}/></mesh>
        </group>
      ))}

      {/* ═══ ABRIBUS — 8 arrêts symétriques Nord/Sud ═══ */}
      {[
        // SUD
        { x: -20, z: 40, ry: Math.PI },
        { x: 20, z: 40, ry: Math.PI },
        { x: -38, z: 32, ry: Math.PI/2 },
        { x: 38, z: 32, ry: -Math.PI/2 },
        // NORD (miroir)
        { x: -20, z: -20, ry: 0 },
        { x: 20, z: -20, ry: 0 },
        { x: -38, z: -12, ry: Math.PI/2 },
        { x: 38, z: -12, ry: -Math.PI/2 },
      ].map((ab, i) => (
        <group key={`ab-${i}`} position={[ab.x, 0, ab.z]} rotation={[0, ab.ry, 0]}>
          <mesh position={[0, 1.5, 0]}><boxGeometry args={[3, 3, 0.1]}/><meshStandardMaterial color={isNight ? '#1a2030' : '#555'} roughness={0.6}/></mesh>
          <mesh position={[0, 3.1, -0.4]}><boxGeometry args={[3.5, 0.08, 1.2]}/><meshStandardMaterial color="#e0e4e8" roughness={0.3} metalness={0.4}/></mesh>
          <mesh position={[0, 1.5, -0.04]}><boxGeometry args={[2.6, 2.4, 0.04]}/><meshStandardMaterial color="#80c0e0" transparent opacity={0.5} roughness={0.1}/></mesh>
          <Text position={[0, 3.3, 0]} fontSize={0.25} color={isNight ? '#FFD700' : '#333'} anchorX="center">BUS</Text>
        </group>
      ))}
    </group>
  );
}

function ReplicaWideAccessDistrict({ isNight }) {
  const groundC = isNight ? '#1e222a' : '#ffffff';
  const roadC = isNight ? '#1a1e24' : '#505458';
  const sidewalkC = isNight ? '#2a2e34' : '#ffffff';

  const sideBuildings = [
    { x: -38, z: -54, h: 24, w: 7, d: 6, type: 'office', name: '', facing: 'x+' },
    { x: -56, z: -48, h: 30, w: 8, d: 7, type: 'office', name: 'WEST' , facing: 'x+' },
    { x: -72, z: -42, h: 22, w: 6, d: 6, type: 'shop', name: 'ART', facing: 'x+' },
    { x: 38, z: -54, h: 24, w: 7, d: 6, type: 'office', name: '', facing: 'x-' },
    { x: 56, z: -48, h: 30, w: 8, d: 7, type: 'office', name: 'EAST', facing: 'x-' },
    { x: 72, z: -42, h: 22, w: 6, d: 6, type: 'shop', name: 'MUSIC', facing: 'x-' },
    { x: -38, z: -18, h: 20, w: 6.5, d: 5.5, type: 'shop', name: 'KIOSK', facing: 'x+' },
    { x: -56, z: -12, h: 26, w: 7.5, d: 6.5, type: 'office', name: '', facing: 'x+' },
    { x: -72, z: -6, h: 18, w: 6, d: 5.5, type: 'shop', name: 'CAFE', facing: 'x+' },
    { x: 38, z: -18, h: 20, w: 6.5, d: 5.5, type: 'shop', name: 'SHOP', facing: 'x-' },
    { x: 56, z: -12, h: 26, w: 7.5, d: 6.5, type: 'office', name: '', facing: 'x-' },
    { x: 72, z: -6, h: 18, w: 6, d: 5.5, type: 'shop', name: 'LOUNGE', facing: 'x-' },
    { x: -38, z: 34, h: 18, w: 6, d: 5.5, type: 'shop', name: 'FLEURS', facing: 'x+' },
    { x: -56, z: 42, h: 26, w: 7.5, d: 6.5, type: 'office', name: '', facing: 'x+' },
    { x: -72, z: 50, h: 32, w: 8, d: 7, type: 'office', name: 'PLAZA', facing: 'x+' },
    { x: 38, z: 34, h: 18, w: 6, d: 5.5, type: 'shop', name: 'BIJOU', facing: 'x-' },
    { x: 56, z: 42, h: 26, w: 7.5, d: 6.5, type: 'office', name: '', facing: 'x-' },
    { x: 72, z: 50, h: 32, w: 8, d: 7, type: 'office', name: 'CENTRE', facing: 'x-' },
    { x: -38, z: 74, h: 22, w: 6.5, d: 6, type: 'shop', name: 'MODE', facing: 'x+' },
    { x: -56, z: 82, h: 28, w: 7.5, d: 6.5, type: 'office', name: '', facing: 'x+' },
    { x: -74, z: 92, h: 36, w: 8.5, d: 7.5, type: 'office', name: 'TOWER', facing: 'x+' },
    { x: 38, z: 74, h: 22, w: 6.5, d: 6, type: 'shop', name: 'SPA', facing: 'x-' },
    { x: 56, z: 82, h: 28, w: 7.5, d: 6.5, type: 'office', name: '', facing: 'x-' },
    { x: 74, z: 92, h: 36, w: 8.5, d: 7.5, type: 'office', name: 'CITY', facing: 'x-' },
  ];

  return (
    <group>
      {/* Sol urbain recopié */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 30]}>
        <planeGeometry args={[180, 170]} />
        <meshStandardMaterial color={groundC} roughness={0.08} metalness={0.1} />
      </mesh>

      {/* Axe routier complet du nouveau monde */}
      <mesh position={[0, 0.18, 20]}>
        <boxGeometry args={[22, 0.26, 156]} />
        <meshStandardMaterial color={roadC} roughness={0.9} />
      </mesh>
      <mesh position={[-13, 0.24, 20]}>
        <boxGeometry args={[4, 0.32, 156]} />
        <meshStandardMaterial color={sidewalkC} roughness={0.82} />
      </mesh>
      <mesh position={[13, 0.24, 20]}>
        <boxGeometry args={[4, 0.32, 156]} />
        <meshStandardMaterial color={sidewalkC} roughness={0.82} />
      </mesh>
      {[...Array(16)].map((_, i) => (
        <mesh key={`replica-central-mark-${i}`} position={[0, 0.33, -48 + i * 10]}>
          <boxGeometry args={[0.24, 0.06, 4.6]} />
          <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.7 : 0} />
        </mesh>
      ))}

      {/* Routes latérales reprises du hub Train */}
      {[-44, 44].map((x, i) => (
        <group key={`replica-side-avenue-${i}`} position={[x, 0, 30]}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[8, 0.26, 142]} />
            <meshStandardMaterial color={roadC} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <boxGeometry args={[0.16, 0.05, 138]} />
            <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.6 : 0} />
          </mesh>
        </group>
      ))}

      {[8, 26, 44, 62].map((z, index) => (
        <group key={`replica-cross-road-${index}`} position={[0, 0, z]}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[132, 0.24, 6]} />
            <meshStandardMaterial color={roadC} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <boxGeometry args={[126, 0.05, 0.18]} />
            <meshStandardMaterial color="#d4a020" emissive="#d4a020" emissiveIntensity={isNight ? 0.65 : 0} />
          </mesh>
        </group>
      ))}

      {/* Trottoirs et passerelles d'accès lisibles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.26, -4]}>
        <planeGeometry args={[34, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.14} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.27, 22]}>
        <planeGeometry args={[34, 18]} />
        <meshStandardMaterial color="#f4f7fb" roughness={0.14} metalness={0.05} />
      </mesh>

      {/* Ville du nouveau monde rétablie entièrement */}
      {sideBuildings.map((building, index) => (
        <CityBlock key={`replica-side-building-${index}`} {...building} isNight={isNight} />
      ))}
    </group>
  );
}

// ─── Clouds ────────────────────────────────────────────────
function Clouds({ isNight }) {
  return (
    <group>
      {[
        { x: -26, y: 17, z: -22, scale: 1.6 },
        { x: -8, y: 15, z: -20, scale: 1.2 },
        { x: 10, y: 18, z: -25, scale: 1.7 },
        { x: 26, y: 14, z: -22, scale: 1.1 },
        { x: -12, y: 20, z: -30, scale: 2.1 },
        { x: 16, y: 16, z: -18, scale: 1.1 },
        { x: 2, y: 22, z: -34, scale: 2.4 },
      ].map((c, i) => (
        <Float key={i} speed={0.3} floatIntensity={0.5}>
          <group position={[c.x, c.y, c.z]} scale={c.scale}>
            <mesh>
              <sphereGeometry args={[1.5, 8, 8]} />
              <meshStandardMaterial color={isNight ? "#2a3040" : "#FFFFFF"} emissive={isNight ? '#5f6d90' : '#ffffff'} emissiveIntensity={isNight ? 0.35 : 0.05} transparent opacity={isNight ? 0.5 : 0.9} />
            </mesh>
            <mesh position={[1.2, -0.2, 0]}>
              <sphereGeometry args={[1.2, 8, 8]} />
              <meshStandardMaterial color={isNight ? "#2a3040" : "#FFFFFF"} emissive={isNight ? '#556482' : '#ffffff'} emissiveIntensity={isNight ? 0.28 : 0.04} transparent opacity={isNight ? 0.45 : 0.85} />
            </mesh>
            <mesh position={[-1, -0.3, 0.3]}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color={isNight ? "#2a3040" : "#FFFFFF"} emissive={isNight ? '#556482' : '#ffffff'} emissiveIntensity={isNight ? 0.28 : 0.04} transparent opacity={isNight ? 0.45 : 0.85} />
            </mesh>
            <mesh position={[0.5, 0.3, 0.5]}>
              <sphereGeometry args={[0.8, 8, 8]} />
              <meshStandardMaterial color={isNight ? "#2a3040" : "#FFFFFF"} emissive={isNight ? '#556482' : '#ffffff'} emissiveIntensity={isNight ? 0.24 : 0.03} transparent opacity={isNight ? 0.4 : 0.8} />
            </mesh>
            <mesh position={[-0.1, -0.15, 0.9]}>
              <sphereGeometry args={[0.95, 8, 8]} />
              <meshStandardMaterial color={isNight ? "#2a3040" : "#fbffff"} emissive={isNight ? '#4f5f82' : '#ffffff'} emissiveIntensity={isNight ? 0.22 : 0.02} transparent opacity={isNight ? 0.36 : 0.74} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

function SkyBackdrop({ isNight }) {
  return (
    <group renderOrder={-100}>
      <mesh position={[0, 20, -10]}>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial color={isNight ? "#050a18" : "#bfe7ff"} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {!isNight && (
        <mesh position={[18, 55, -80]}>
          <circleGeometry args={[8, 32]} />
          <meshBasicMaterial color="#fff6d1" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      )}
      {isNight && (
        <mesh position={[-15, 50, -80]}>
          <circleGeometry args={[5, 32]} />
          <meshBasicMaterial color="#e8e8f0" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── Railway Signals ───────────────────────────────────────
function RailwaySignals() {
  return (
    <group>
      {/* Signaux de chaque côté des voies */}
      {[
        { x: -22, z: 3.5, color: '#00FF00' },
        { x: 22, z: 3.5, color: '#FF0000' },
        { x: -22, z: 6.5, color: '#00FF00' },
        { x: 22, z: 6.5, color: '#FFFF00' },
      ].map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          {/* Poteau */}
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
            <meshStandardMaterial color="#eef4f7" metalness={0.55} roughness={0.16} />
          </mesh>
          {/* Boîtier signal */}
          <mesh position={[0, 3.5, 0]}>
            <boxGeometry args={[0.3, 0.6, 0.15]} />
            <meshStandardMaterial color="#dfe7ed" metalness={0.4} roughness={0.2} />
          </mesh>
          {/* Lumière */}
          <mesh position={[0, 3.5, 0.08]}>
            <circleGeometry args={[0.1, 16]} />
            <meshStandardMaterial 
              color={s.color} 
              emissive={s.color} 
              emissiveIntensity={3}
            />
          </mesh>
        </group>
      ))}
      
      {/* Barrières de passage à niveau */}
      {[-15, 15].map((x, i) => (
        <group key={`barrier-${i}`} position={[x, 0, 1]}>
          {/* Poteau barrière */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[0.15, 2, 0.15]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          {/* Barre rayée (levée) */}
          <mesh position={[i === 0 ? 1.5 : -1.5, 1.8, 0]} rotation={[0, 0, i === 0 ? 0.1 : -0.1]}>
            <boxGeometry args={[3, 0.1, 0.05]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
          {/* Bandes blanches */}
          {[0.5, 1.5, 2.5].map((offset, j) => (
            <mesh key={j} position={[i === 0 ? offset : -offset, 1.8, 0.03]} rotation={[0, 0, i === 0 ? 0.1 : -0.1]}>
              <boxGeometry args={[0.3, 0.12, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
          {/* Feu clignotant */}
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Barrières de sécurité ferroviaires — clôtures aux bords extérieurs des voies ───
function TrackSafetyBarriers({ isNight }) {
  const fenceColor = isNight ? '#3a4050' : '#808890';
  const postColor = isNight ? '#2a3040' : '#606870';
  const fenceLines = [
    { z: 0.5, side: 'south' },
    { z: 11.0, side: 'north' },
  ];

  return (
    <group>
      {/* ═══ TALUS FERROVIAIRE — base sombre sous les voies rehaussées ═══ */}
      <mesh position={[0, -0.05, 5.75]}>
        <boxGeometry args={[180, 0.12, 12.5]} />
        <meshStandardMaterial color="#3a3e44" roughness={0.95} />
      </mesh>
      {/* Bordures latérales */}
      {[-0.2, 11.7].map((bz, bi) => (
        <mesh key={`berm-${bi}`} position={[0, -0.02, bz]} rotation={[bi === 0 ? 0.3 : -0.3, 0, 0]}>
          <boxGeometry args={[180, 0.12, 0.8]} />
          <meshStandardMaterial color="#353840" roughness={0.95} />
        </mesh>
      ))}

      {/* Clôtures de sécurité */}
      {fenceLines.map((fence, fi) => (
        <group key={`track-fence-${fi}`}>
          <mesh position={[0, 1.0, fence.z]}>
            <boxGeometry args={[180, 1.4, 0.05]} />
            <meshStandardMaterial color={fenceColor} metalness={0.45} roughness={0.35} transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, 1.72, fence.z]}>
            <boxGeometry args={[180, 0.06, 0.06]} />
            <meshStandardMaterial color={postColor} metalness={0.6} roughness={0.2} />
          </mesh>
          {[...Array(18)].map((_, pi) => (
            <mesh key={`tp-${fi}-${pi}`} position={[-85 + pi * 10, 1.0, fence.z]}>
              <boxGeometry args={[0.08, 1.4, 0.08]} />
              <meshStandardMaterial color={postColor} metalness={0.6} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}


// ─── Birds Flying ──────────────────────────────────────────
function Birds({ isNight }) {
  const birdsRef = useRef();
  
  useFrame(({ clock }) => {
    if (birdsRef.current && !isNight) {
      birdsRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.3) * 15;
      birdsRef.current.position.z = -15 + Math.cos(clock.getElapsedTime() * 0.2) * 5;
    }
  });
  
  if (isNight) return null;
  
  return (
    <group ref={birdsRef} position={[0, 12, -15]}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Float key={i} speed={2 + i * 0.5} floatIntensity={0.3}>
          <group position={[i * 1.5 - 3, Math.sin(i) * 0.5, i * 0.3]}>
            {/* Corps */}
            <mesh>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Ailes */}
            <mesh position={[-0.1, 0, 0]} rotation={[0, 0, 0.3]}>
              <planeGeometry args={[0.15, 0.05]} />
              <meshStandardMaterial color="#2a2a2a" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.3]}>
              <planeGeometry args={[0.15, 0.05]} />
              <meshStandardMaterial color="#2a2a2a" side={THREE.DoubleSide} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

// ─── Platform Lights - Futuristic LED ─────────────────────
function PlatformLights({ isNight }) {
  return (
    <group>
      {[-13, 0, 13].map((x, i) => (
        <group key={i} position={[x, 0, -1.5]}>
          {/* Sleek metal pole */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.035, 0.04, 4.6, 16]} />
            <meshStandardMaterial 
              color="#f0f5f8" 
              metalness={0.62} 
              roughness={0.12}
            />
          </mesh>
          
          {/* LED disk lamp */}
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
            <meshStandardMaterial 
              color={isNight ? '#6af2ff' : '#00FFFF'} 
              emissive={isNight ? '#6af2ff' : '#00FFFF'} 
              emissiveIntensity={isNight ? 6 : 3.6}
            />
          </mesh>

          <mesh position={[0, 4.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.18, 0.42, 24]} />
            <meshStandardMaterial color={isNight ? '#ff7ae8' : '#9aefff'} emissive={isNight ? '#ff7ae8' : '#9aefff'} emissiveIntensity={isNight ? 1.8 : 0.6} transparent opacity={0.4} />
          </mesh>
          
          {/* Holographic ring */}
          <Float speed={2} floatIntensity={0.3}>
            <mesh position={[0, 5.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.28, 0.32, 32]} />
              <meshStandardMaterial 
                color={isNight ? '#f4c2ff' : '#c9f7ff'} 
                emissive={isNight ? '#f4c2ff' : '#c9f7ff'} 
                emissiveIntensity={isNight ? 2.2 : 1.25}
                transparent
                opacity={0.45}
              />
            </mesh>
          </Float>

          <pointLight position={[0, 4.9, 0]} color={isNight ? '#7cf4ff' : '#dffcff'} intensity={isNight ? 1.55 : 0.7} distance={12} decay={2} />
          
        </group>
      ))}
    </group>
  );
}

function RectangularFountain() {
  const jetsRef = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    jetsRef.current.forEach((jet, i) => {
      if (!jet) return;
      const height = 1.8 + Math.sin(t * 2.4 + i * 0.45) * 0.55;
      jet.scale.y = Math.max(0.6, height);
      jet.position.y = 0.75 + jet.scale.y * 0.45;
    });
  });

  return (
    <group position={[0, 0, 18.2]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[16.5, 0.7, 7.2]} />
        <meshStandardMaterial color="#d5dce2" roughness={0.34} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[14.4, 0.16, 5.4]} />
        <meshStandardMaterial color="#6dc6e8" emissive="#6dc6e8" emissiveIntensity={0.22} transparent opacity={0.84} />
      </mesh>
      {[...Array(9)].map((_, i) => (
        <group key={`jet-${i}`} position={[-6.4 + i * 1.6, 0, 0]}>
          <mesh ref={(el) => { jetsRef.current[i] = el; }} position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.09, 0.16, 2.3, 10]} />
            <meshStandardMaterial color="#d7f4ff" emissive="#d7f4ff" emissiveIntensity={0.48} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CityBirdLife() {
  const flightRef = useRef();
  const flock = useMemo(() => [...Array(10)].map((_, i) => ({
    cx: -8 + i * 2.2,
    cy: 4 + (i % 3) * 1.2,
    cz: -16 + (i % 4) * 2.2,
    sp: 0.25 + i * 0.04,
    radius: 6 + (i % 4) * 1.8,
  })), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flightRef.current) {
      flightRef.current.children.forEach((bird, i) => {
        const b = flock[i];
        bird.position.x = b.cx + Math.sin(t * b.sp) * b.radius;
        bird.position.z = b.cz + Math.cos(t * b.sp) * b.radius * 0.8;
        bird.position.y = b.cy + Math.sin(t * 2 + i) * 1.2;
        bird.rotation.y = Math.atan2(Math.cos(t * b.sp) * b.radius, -Math.sin(t * b.sp) * b.radius * 0.8);
        if (bird.children[1]) bird.children[1].rotation.z = Math.sin(t * 6 + i) * 0.4;
        if (bird.children[2]) bird.children[2].rotation.z = -Math.sin(t * 6 + i) * 0.4;
      });
    }
  });

  return (
    <group>
      <group ref={flightRef}>
        {flock.map((bird, i) => (
          <group key={`flying-city-bird-${i}`} position={[bird.cx, bird.cy, bird.cz]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
              <meshStandardMaterial color="#eef0ea" />
            </mesh>
            <mesh position={[0.16, 0.02, 0]}>
              <boxGeometry args={[0.3, 0.012, 0.12]} />
              <meshStandardMaterial color="#d8ddd6" />
            </mesh>
            <mesh position={[-0.16, 0.02, 0]}>
              <boxGeometry args={[0.3, 0.012, 0.12]} />
              <meshStandardMaterial color="#d8ddd6" />
            </mesh>
          </group>
        ))}
      </group>

      {[[-1.4, -15.6], [0.9, -14.3], [4.4, -15.8], [5.8, -13.9]].map(([x, z], i) => (
        <group key={`pigeon-${i}`} position={[x, 0.08, z]}>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#a8afb7" roughness={0.65} />
          </mesh>
          <mesh position={[0.08, 0.1, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#8e959c" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Smoke from locomotive ─────────────────────────────────
function SmokeParticles() {
  const particles = useRef([]);
  const meshRefs = useRef([]);
  
  useMemo(() => {
    particles.current = [...Array(15)].map(() => ({
      x: (Math.random() - 0.5) * 0.5,
      y: 2 + Math.random() * 2,
      z: (Math.random() - 0.5) * 0.3,
      speed: 0.5 + Math.random() * 0.5,
      scale: 0.1 + Math.random() * 0.2
    }));
  }, []);
  
  return (
    <group position={[0, 0, 3.5]}>
      {particles.current.map((p, i) => (
        <Float key={i} speed={p.speed} floatIntensity={0.8}>
          <mesh position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[p.scale, 6, 6]} />
            <meshStandardMaterial color="#ccc" transparent opacity={0.12} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// ─── Ground — URBAN CITY STYLE ────────────────────────────────────────────
function Ground({ isMobile = false }) {
  // SOL LIMITÉ À LA ZONE NORD (z < 12) pour laisser DowntownDistrict gérer le SUD
  if (isMobile) {
    return (
      <group>
        {/* Sol principal mobile - couvre TOUTE la ville */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 5]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#e9e5dc" roughness={0.96} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, -6]}>
          <planeGeometry args={[110, 8]} />
          <meshStandardMaterial color="#47484c" roughness={0.92} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {/* Main urban ground - couvre TOUTE la ville (Nord + Sud) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 5]}>
        <planeGeometry args={[250, 200]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.12} metalness={0.08} />
      </mesh>
      
      {/* Main road running parallel to tracks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, -6]}>
        <planeGeometry args={[130, 8]} />
        <meshStandardMaterial color="#47484c" roughness={0.9} />
      </mesh>
      
      {/* Road markings - center line */}
      {[...Array(36)].map((_, i) => (
        <mesh key={`center-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-60 + i * 3.5, -0.11, -6]}>
          <planeGeometry args={[2, 0.15]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>
      ))}
      
      {/* Road markings - edge lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, -2.2]}>
        <planeGeometry args={[130, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, -9.8]}>
        <planeGeometry args={[130, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Crosswalk near station */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`cross-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-8, -0.11, -3 - i * 0.8]}>
          <planeGeometry args={[3, 0.5]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
      
      {/* Sidewalks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -0.8]}>
        <planeGeometry args={[130, 1.2]} />
        <meshStandardMaterial color="#e7e3da" roughness={0.22} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -11.6]}>
        <planeGeometry args={[130, 1.4]} />
        <meshStandardMaterial color="#e3dfd6" roughness={0.24} metalness={0.02} />
      </mesh>
      
      {/* Gravel area near tracks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 3.5]}>
        <planeGeometry args={[120, 2]} />
        <meshStandardMaterial color="#8c867d" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 6.5]}>
        <planeGeometry args={[120, 2]} />
        <meshStandardMaterial color="#8c867d" roughness={1} />
      </mesh>

      {/* ZONE SUD RETIRÉE - gérée par DowntownDistrict */}
      
      {/* Parking lot area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, -0.13, -17.2]}>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color="#ece7db" roughness={0.22} />
      </mesh>
      
      {/* Parking space lines */}
      {[...Array(10)].map((_, i) => (
        <mesh key={`park-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[8 + i * 2, -0.12, -15]}>
          <planeGeometry args={[0.1, 5]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
      
      {/* Plaza/square area with pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-17, -0.1, -17.2]}>
        <planeGeometry args={[20, 9]} />
        <meshStandardMaterial color="#ebe5d8" roughness={0.22} metalness={0.02} />
      </mesh>
      
      {/* Plaza tile pattern */}
      {[...Array(5)].map((_, i) => (
        [...Array(3)].map((_, j) => (
          <mesh key={`tile-${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[-21 + i * 2.8, -0.09, -19.8 + j * 2.8]}>
            <planeGeometry args={[2.4, 2.4]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? "#efe9dd" : "#dfd8cc"} roughness={0.16} metalness={0.02} />
          </mesh>
        ))
      ))}

      {/* Premium forecourt extension */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -0.095, -18]}>
        <planeGeometry args={[26, 8]} />
        <meshStandardMaterial color="#eee7da" roughness={0.2} metalness={0.02} />
      </mesh>
    </group>
  );
}

// ─── Pedestrian Walkway Amenities — Trees + Blue Benches along sidewalks ───
function PedestrianWalkwayAmenities({ isNight }) {
  // Trees along the north sidewalk (z=-1) and south sidewalk (z=-11)
  const trees = useMemo(() => {
    const t = [];
    // North sidewalk trees
    for (let x = -50; x <= 50; x += 8) {
      t.push([x, 0, -0.6]);
    }
    // South sidewalk trees
    for (let x = -45; x <= 45; x += 8) {
      t.push([x, 0, -13.1]);
    }
    // Plaza trees
    t.push([-23, 0, -17], [-11, 0, -16.6], [20, 0, -14.6], [-24, 0, -11.8]);
    // Forecourt trees
    t.push([-10, 0, -14.8], [10, 0, -14.8], [18, 0, -17.6], [-8, 0, -19.2]);
    return t;
  }, []);

  // Blue benches along walkways
  const benches = useMemo(() => {
    const b = [];
    // North sidewalk benches
    for (let x = -40; x <= 40; x += 12) {
      b.push({ pos: [x, 0, -0.2], rot: 0 });
    }
    // South sidewalk benches
    for (let x = -35; x <= 35; x += 12) {
      b.push({ pos: [x, 0, -13], rot: Math.PI });
    }
    // Plaza benches
    b.push({ pos: [-19, 0, -18.4], rot: 0 }, { pos: [-11, 0, -18.2], rot: 0 });
    b.push({ pos: [6, 0, -14.6], rot: Math.PI / 2 }, { pos: [14, 0, -18.8], rot: 0 });
    return b;
  }, []);

  return (
    <group>
      {/* Trees */}
      {trees.map((pos, i) => (
        <group key={`walk-tree-${i}`} position={pos}>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 2.2, 8]} />
            <meshStandardMaterial color="#5a3a1a" roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <sphereGeometry args={[0.9 + (i % 3) * 0.15, 8, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#3d8c3a' : '#4aa847'} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Blue Benches */}
      {benches.map((bench, i) => (
        <group key={`walk-bench-${i}`} position={bench.pos} rotation={[0, bench.rot, 0]}>
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[1.4, 0.07, 0.45]} />
            <meshStandardMaterial color="#1a6fc4" roughness={0.4} metalness={0.3} emissive={isNight ? '#1a6fc4' : '#000'} emissiveIntensity={isNight ? 0.25 : 0} />
          </mesh>
          <mesh position={[0, 0.58, -0.2]}>
            <boxGeometry args={[1.4, 0.36, 0.05]} />
            <meshStandardMaterial color="#1565b8" roughness={0.4} metalness={0.3} emissive={isNight ? '#1565b8' : '#000'} emissiveIntensity={isNight ? 0.25 : 0} />
          </mesh>
          {[-0.58, 0.58].map((lx, li) => (
            <mesh key={`bleg-${li}`} position={[lx, 0.19, 0]}>
              <boxGeometry args={[0.05, 0.38, 0.45]} />
              <meshStandardMaterial color="#b0b8c0" metalness={0.6} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}



// ─── PREMIUM URBAN ELEMENTS ──────────────────────────────────
// Cars in parking lot
function ParkingCars() {
  const carColors = ['#2a2a3a', '#8B0000', '#1a1a4a', '#4a4a4a', '#f0f0f0', '#FFD700', '#00CED1'];
  const cars = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      x: 9 + i * 2,
      z: -15,
      color: carColors[Math.floor(Math.random() * carColors.length)],
      rotation: Math.PI / 2
    }));
  }, []);
  
  return (
    <group>
      {cars.map((car, i) => (
        <group key={i} position={[car.x, 0, car.z]} rotation={[0, car.rotation, 0]}>
          {/* Car body */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.8, 0.5, 0.9]} />
            <meshStandardMaterial color={car.color} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Cabin */}
          <mesh position={[0.1, 0.75, 0]}>
            <boxGeometry args={[1, 0.4, 0.8]} />
            <meshStandardMaterial color="#1a1a2a" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Wheels */}
          {[[-0.55, -0.35], [-0.55, 0.35], [0.55, -0.35], [0.55, 0.35]].map(([x, z], j) => (
            <mesh key={j} position={[x, 0.15, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          ))}
          {/* Headlights */}
          <mesh position={[0.9, 0.4, 0.3]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.9, 0.4, -0.3]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </mesh>
          {/* Taillights */}
          <mesh position={[-0.9, 0.4, 0.3]}>
            <boxGeometry args={[0.05, 0.1, 0.15]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.9, 0.4, -0.3]}>
            <boxGeometry args={[0.05, 0.1, 0.15]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Moving cars on the road
function MovingCars() {
  const carRef1 = useRef();
  const carRef2 = useRef();
  const carRef3 = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (carRef1.current) {
      carRef1.current.position.x = ((t * 5 + 40) % 80) - 40;
    }
    if (carRef2.current) {
      carRef2.current.position.x = -(((t * 4 + 20) % 80) - 40);
    }
    if (carRef3.current) {
      carRef3.current.position.x = ((t * 6 + 60) % 80) - 40;
    }
  });
  
  const CarModel = ({ color, direction }) => (
    <group rotation={[0, direction > 0 ? 0 : Math.PI, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.8, 0]}>
        <boxGeometry args={[1.2, 0.45, 0.9]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.9} roughness={0.1} />
      </mesh>
      {[[-0.6, -0.4], [-0.6, 0.4], [0.6, -0.4], [0.6, 0.4]].map(([x, z], j) => (
        <mesh key={j} position={[x, 0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
  
  return (
    <group>
      <group ref={carRef1} position={[-30, 0, -4.5]}>
        <CarModel color="#2a3a5a" direction={1} />
      </group>
      <group ref={carRef2} position={[20, 0, -7.5]}>
        <CarModel color="#8B0000" direction={-1} />
      </group>
      <group ref={carRef3} position={[-10, 0, -4.5]}>
        <CarModel color="#FFD700" direction={1} />
      </group>
    </group>
  );
}

// Street Lamps - Modern Urban Style
function StreetLamps({ isNight }) {
  const lampPositions = [
    [-34, -6], [-22, -6], [22, -6], [34, -6],
    [-28, -14], [28, -14]
  ];
  
  return (
    <group>
      {lampPositions.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Pole */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 5, 12]} />
            <meshStandardMaterial color="#edf3f7" metalness={0.58} roughness={0.14} />
          </mesh>
          {/* Arm */}
          <mesh position={[0.4, 4.8, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
            <meshStandardMaterial color="#edf3f7" metalness={0.58} roughness={0.14} />
          </mesh>
          {/* Light housing */}
          <mesh position={[0.7, 4.9, 0]}>
            <boxGeometry args={[0.4, 0.15, 0.25]} />
            <meshStandardMaterial color="#dce4ea" roughness={0.18} metalness={0.28} />
          </mesh>
          {/* Light */}
          <mesh position={[0.7, 4.8, 0]}>
            <boxGeometry args={[0.35, 0.05, 0.2]} />
            <meshStandardMaterial 
              color="#FFE4B5" 
              emissive="#FFD700" 
              emissiveIntensity={isNight ? 2 : 0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Urban Furniture (benches, trash cans, bus stops)
function UrbanFurniture({ isNight }) {
  return (
    <group>
      <RectangularFountain />

      {/* Promenade paths — recentrée sur la fontaine à z=24 — blanc brillant */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.085, 24]}>
        <planeGeometry args={[28, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.06} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, -0.084, 24]}>
        <planeGeometry args={[8, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, -0.084, 24]}>
        <planeGeometry args={[8, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} />
      </mesh>

      {/* Lawn islands — ajustées autour de la fontaine à z=24 */}
      {[[-21, 24, 9, 10], [21, 24, 9, 10], [-10, 30, 8, 4]].map(([x, z, w, h], i) => (
        <mesh key={`lawn-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.082, z]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color="#9cc18b" roughness={0.95} />
        </mesh>
      ))}

      {/* Pedestrian shelter */}
      <group position={[23, 0, 24]}>
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[5.2, 0.16, 2.8]} />
          <meshStandardMaterial color="#eef5f8" roughness={0.28} metalness={0.12} />
        </mesh>
        {[-2, 2].map((x, i) => (
          <mesh key={`shelter-post-${i}`} position={[x, 1.2, 0]}>
            <boxGeometry args={[0.12, 2.4, 0.12]} />
            <meshStandardMaterial color="#f2f6f9" metalness={0.44} roughness={0.14} />
          </mesh>
        ))}
        <mesh position={[0, 1.45, -1.32]}>
          <boxGeometry args={[4.8, 2.3, 0.08]} />
          <meshStandardMaterial color="#bfe7f2" transparent opacity={0.35} metalness={0.82} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[3.3, 0.12, 0.44]} />
          <meshStandardMaterial color="#7c5a34" roughness={0.7} />
        </mesh>
      </group>

      {/* Relay kiosk */}
      <group position={[-26, 0, 24]}>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[4, 2.8, 2.2]} />
          <meshStandardMaterial color="#1d2430" roughness={0.4} metalness={0.22} />
        </mesh>
        <mesh position={[0, 2.9, 0]}>
          <boxGeometry args={[4.3, 0.18, 2.5]} />
          <meshStandardMaterial color="#7ee1ec" emissive="#7ee1ec" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 1.55, 1.12]}>
          <boxGeometry args={[3.2, 1.9, 0.08]} />
          <meshStandardMaterial color="#99d7e6" transparent opacity={0.35} metalness={0.85} roughness={0.08} />
        </mesh>
        <Text position={[0, 2.3, 1.18]} fontSize={0.34} color="#ffffff" anchorX="center">RELAY</Text>
        <Text position={[0, 1.85, 1.18]} fontSize={0.14} color="#8ff4ff" anchorX="center">PRESSE • CAFÉ • BILLETS</Text>
      </group>

      {/* Open pergola promenade element */}
      <group position={[22, 0, 24.2]}>
        <mesh position={[0, 2.9, 0]}>
          <boxGeometry args={[8.6, 0.18, 3.4]} />
          <meshStandardMaterial color="#eef4f7" roughness={0.24} metalness={0.14} />
        </mesh>
        {[-3.6, -1.2, 1.2, 3.6].map((x, i) => (
          <mesh key={`pergola-post-${i}`} position={[x, 1.35, 0]}>
            <boxGeometry args={[0.12, 2.7, 0.12]} />
            <meshStandardMaterial color="#eef4f7" metalness={0.42} roughness={0.14} />
          </mesh>
        ))}
        <mesh position={[0, 1.45, -1.55]}>
          <boxGeometry args={[8.2, 2.1, 0.08]} />
          <meshStandardMaterial color="#bfe7f2" transparent opacity={0.28} metalness={0.82} roughness={0.08} />
        </mesh>
      </group>
      
      {/* Benches on plaza */}
      {[[-16, 14.2], [-16, 22.4], [-9, 14.2], [-9, 22.4], [8, 25.6], [16, 25.6], [15, 14.8], [21, 14.8], [-3.5, 27.6], [3.5, 27.6]].map(([x, z], i) => (
        <group key={`bench-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.5, 0.1, 0.5]} />
            <meshStandardMaterial color="#1a5276" roughness={0.5} />
          </mesh>
          <mesh position={[-0.6, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.4]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.7} />
          </mesh>
          <mesh position={[0.6, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.4]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* Trash cans */}
      {[[-24, 16], [24, 16], [-12, 26.4], [12, 26.4]].map(([x, z], i) => (
        <group key={`trash-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.2, 0.18, 0.8, 12]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.05, 12]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* Bike racks */}
      <group position={[-13.5, 0, 26.2]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[i * 0.6, 0.4, 0]}>
            <torusGeometry args={[0.25, 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.8} />
          </mesh>
        ))}
        {/* Base bar */}
        <mesh position={[1.2, 0.05, 0]}>
          <boxGeometry args={[3, 0.1, 0.3]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
      </group>
      
      {/* Premium planters */}
      {[[-7, 13.5], [-1, 13.5], [5, 13.5], [11, 13.5], [-10, 25], [18, 14.5], [2, 29.2], [-24, 21.8], [24, 22.1]].map(([x, z], i) => (
        <group key={`planter-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.1, 0.7, 1.1]} />
            <meshStandardMaterial color="#d7ddd9" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <sphereGeometry args={[0.55, 12, 12]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#5a8f5e' : '#6ca865'} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Static bikes */}
      {[[-18.6, 27], [-17.4, 27.5], [18.2, 27], [19.4, 27.4]].map(([x, z], i) => (
        <group key={`bike-${i}`} position={[x, 0, z]} rotation={[0, i === 0 ? 0.22 : -0.12, 0]}>
          <mesh position={[-0.28, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.02, 10, 20]} />
            <meshStandardMaterial color="#394b5a" metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0.3, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.02, 10, 20]} />
            <meshStandardMaterial color="#394b5a" metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 10]}>
            <boxGeometry args={[0.7, 0.04, 0.04]} />
            <meshStandardMaterial color="#7fd5ea" emissive="#7fd5ea" emissiveIntensity={0.14} />
          </mesh>
        </group>
      ))}

      <CityBirdLife />
    </group>
  );
}

// Premium City Pedestrians
function CityPedestrians({ isNight }) {
  const crowd = useMemo(() => ([
    { basePosition: [-18, 0.02, -13.2], outfit: PREMIUM_TRAVELER_OUTFITS[0], skin: PREMIUM_TRAVELER_SKIN_TONES[0], hair: PREMIUM_TRAVELER_HAIR[0], scale: 0.72, behavior: 'walker', movementAxis: 'x', movementRange: 1.8, movementSpeed: 0.28, phase: 0.2, accent: '#6ce8ff', hasLuggage: true },
    { basePosition: [-15, 0.02, -16.2], outfit: PREMIUM_TRAVELER_OUTFITS[5], skin: PREMIUM_TRAVELER_SKIN_TONES[2], hair: PREMIUM_TRAVELER_HAIR[1], scale: 0.68, behavior: 'coffee', movementAxis: 'z', movementRange: 0.12, movementSpeed: 0.22, phase: 2.2, accent: '#ffb057', baseRotation: 0.8 },
    { basePosition: [-11.2, 0.02, -13.6], outfit: PREMIUM_TRAVELER_OUTFITS[1], skin: PREMIUM_TRAVELER_SKIN_TONES[1], hair: PREMIUM_TRAVELER_HAIR[2], scale: 0.7, behavior: 'walker', movementAxis: 'x', movementRange: 1.6, movementSpeed: 0.32, phase: 1.3, accent: '#66ffd7', hasLuggage: true },
    { basePosition: [-7.4, 0.02, -17.6], outfit: PREMIUM_TRAVELER_OUTFITS[2], skin: PREMIUM_TRAVELER_SKIN_TONES[3], hair: PREMIUM_TRAVELER_HAIR[5], scale: 0.66, behavior: 'snack', movementAxis: 'z', movementRange: 0.14, movementSpeed: 0.24, phase: 0.4, accent: '#ffd86a', baseRotation: -0.5 },
    { basePosition: [-2.5, 0.02, -14.1], outfit: PREMIUM_TRAVELER_OUTFITS[3], skin: PREMIUM_TRAVELER_SKIN_TONES[4], hair: PREMIUM_TRAVELER_HAIR[4], scale: 0.75, behavior: 'screen', movementAxis: 'x', movementRange: 0.12, movementSpeed: 0.2, phase: 1.1, accent: '#ff7ad3', hasPhone: true, baseRotation: 0.2 },
    { basePosition: [2.2, 0.02, -16.5], outfit: PREMIUM_TRAVELER_OUTFITS[4], skin: PREMIUM_TRAVELER_SKIN_TONES[5], hair: PREMIUM_TRAVELER_HAIR[6], scale: 0.68, behavior: 'walker', movementAxis: 'x', movementRange: 1.4, movementSpeed: 0.3, phase: 2.9, accent: '#86b9ff' },
    { basePosition: [7.8, 0.02, -13.4], outfit: PREMIUM_TRAVELER_OUTFITS[6], skin: PREMIUM_TRAVELER_SKIN_TONES[6], hair: PREMIUM_TRAVELER_HAIR[7], scale: 0.72, behavior: 'walker', movementAxis: 'x', movementRange: 1.5, movementSpeed: 0.31, phase: 1.7, accent: '#6fffa9', hasLuggage: true },
    { basePosition: [13.6, 0.02, -12.8], outfit: PREMIUM_TRAVELER_OUTFITS[7], skin: PREMIUM_TRAVELER_SKIN_TONES[7], hair: PREMIUM_TRAVELER_HAIR[0], scale: 0.7, behavior: 'screen', movementAxis: 'z', movementRange: 0.12, movementSpeed: 0.18, phase: 2.1, accent: '#ffe57c', hasGlasses: true, baseRotation: -0.22 },
    { basePosition: [16.8, 0.02, -11.4], outfit: PREMIUM_TRAVELER_OUTFITS[1], skin: PREMIUM_TRAVELER_SKIN_TONES[3], hair: PREMIUM_TRAVELER_HAIR[1], scale: 0.63, behavior: 'coffee', movementAxis: 'x', movementRange: 0.12, movementSpeed: 0.2, phase: 0.9, accent: '#65f3ff', baseRotation: -0.72 },
    { basePosition: [20.8, 0.02, -11.9], outfit: PREMIUM_TRAVELER_OUTFITS[2], skin: PREMIUM_TRAVELER_SKIN_TONES[5], hair: PREMIUM_TRAVELER_HAIR[0], scale: 0.69, behavior: 'walker', movementAxis: 'x', movementRange: 1.7, movementSpeed: 0.33, phase: 0.5, accent: '#ff9d6e', hasLuggage: true },
  ]), []);

  return (
    <group>
      {crowd.map((traveler, index) => (
        <AnimatedPremiumTraveler key={`city-traveler-${index}`} {...traveler} accent={isNight ? traveler.accent : '#7fc8dd'} />
      ))}
    </group>
  );
}

// ═══ URBAN REALISM — Passages piétons, feux, métro, boutiques, passerelles ═══

// ═══ FOULES CYCLIQUES AUX ESCALATORS — personnages complets animés ═══
function EscalatorCrowds({ isNight }) {
  const crowdRefs = useRef([]);
  const SKINS = PREMIUM_TRAVELER_SKIN_TONES;
  const HAIRS = PREMIUM_TRAVELER_HAIR;
  const SHIRTS = ['#e74c3c','#3498db','#9b59b6','#2ecc71','#f39c12','#00d4aa','#e91e63','#ff8c00','#1abc9c','#f1c40f','#6c5ce7','#fd79a8','#0984e3','#d63031','#00b894','#8e44ad'];
  const PANTS = ['#2c3e50','#34495e','#1a252f','#2d3436','#212529','#1b2631','#1c2833','#17202a','#1e272e','#273746','#3d3d3d','#263238'];

  const passengers = useMemo(() => {
    const list = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 3 + (i / 12) * 8;
      list.push({
        homeX: Math.cos(angle) * r, homeZ: 20.5 + Math.sin(angle) * r,
        targetX: (i % 3 - 1) * 1.5, targetZ: 20.5,
        speed: 0.08 + (i % 5) * 0.022, phase: i * 1.4,
        rushPhase: i * 0.52,
        skin: SKINS[i % SKINS.length],
        hair: HAIRS[i % HAIRS.length],
        shirt: SHIRTS[i % SHIRTS.length],
        pants: PANTS[i % PANTS.length],
        hasLuggage: i % 4 === 0,
        scale: 0.92 + (i % 4) * 0.06,
      });
    }
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 2 + (i / 8) * 5;
      list.push({
        homeX: Math.cos(angle) * r, homeZ: -2.5 + Math.sin(angle) * r,
        targetX: (i % 3 - 1) * 1.2, targetZ: -2.5,
        speed: 0.08 + (i % 5) * 0.022, phase: i * 1.8,
        rushPhase: i * 0.65,
        skin: SKINS[(i + 4) % SKINS.length],
        hair: HAIRS[(i + 3) % HAIRS.length],
        shirt: SHIRTS[(i + 6) % SHIRTS.length],
        pants: PANTS[(i + 2) % PANTS.length],
        hasLuggage: i % 5 === 0,
        scale: 0.9 + (i % 3) * 0.06,
      });
    }
    return list;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const rushIntensity = Math.max(0, Math.sin(t * 0.3)) ** 2;
    passengers.forEach((p, i) => {
      const ref = crowdRefs.current[i];
      if (!ref) return;
      ref.visible = rushIntensity > (i < 20 ? 0 : (i - 20) / 20);
      if (!ref.visible) return;
      const walkT = t * p.speed + p.phase;
      const going = (Math.sin(walkT * 0.5 + p.rushPhase) + 1) / 2;
      const x = p.homeX + (p.targetX - p.homeX) * going;
      const z = p.homeZ + (p.targetZ - p.homeZ) * going;
      ref.position.set(x, 0.3 + Math.abs(Math.sin(walkT * 4)) * 0.022, z);
      ref.rotation.y = Math.atan2(p.targetX - p.homeX, p.targetZ - p.homeZ) * going + (1 - going) * Math.atan2(-p.homeX, 1);
      const stride = Math.sin(walkT * 3.5) * going;
      // [0]=jambeG, [1]=jambeD, [4]=brasG, [5]=brasD
      if (ref.children[0]) ref.children[0].rotation.x = stride * 0.42;
      if (ref.children[1]) ref.children[1].rotation.x = -stride * 0.42;
      if (ref.children[4]) ref.children[4].rotation.x = -stride * 0.32;
      if (ref.children[5]) ref.children[5].rotation.x = stride * 0.32;
    });
  });

  return (
    <group>
      {passengers.map((p, i) => (
        <group key={`crowd-${i}`} ref={el => { crowdRefs.current[i] = el; }} position={[p.homeX, 0.3, p.homeZ]} scale={p.scale}>
          {/* Jambe gauche (pantalon) */}
          <mesh position={[-0.042, 0.12, 0]}>
            <boxGeometry args={[0.052, 0.24, 0.058]} />
            <meshStandardMaterial color={p.pants} roughness={0.6} />
          </mesh>
          {/* Jambe droite (pantalon) */}
          <mesh position={[0.042, 0.12, 0]}>
            <boxGeometry args={[0.052, 0.24, 0.058]} />
            <meshStandardMaterial color={p.pants} roughness={0.6} />
          </mesh>
          {/* Chaussure gauche */}
          <mesh position={[-0.042, 0.018, 0.026]}>
            <boxGeometry args={[0.054, 0.024, 0.082]} />
            <meshStandardMaterial color="#111111" roughness={0.35} />
          </mesh>
          {/* Chaussure droite */}
          <mesh position={[0.042, 0.018, 0.026]}>
            <boxGeometry args={[0.054, 0.024, 0.082]} />
            <meshStandardMaterial color="#111111" roughness={0.35} />
          </mesh>
          {/* Bras gauche (peau) */}
          <mesh position={[-0.108, 0.365, 0]}>
            <boxGeometry args={[0.04, 0.19, 0.044]} />
            <meshStandardMaterial color={p.skin} roughness={0.42} />
          </mesh>
          {/* Bras droit (peau) */}
          <mesh position={[0.108, 0.365, 0]}>
            <boxGeometry args={[0.04, 0.19, 0.044]} />
            <meshStandardMaterial color={p.skin} roughness={0.42} />
          </mesh>
          {/* Torse (chemise/veste) */}
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[0.158, 0.245, 0.112]} />
            <meshStandardMaterial color={p.shirt} roughness={0.5} />
          </mesh>
          {/* Cou */}
          <mesh position={[0, 0.525, 0]}>
            <boxGeometry args={[0.044, 0.042, 0.044]} />
            <meshStandardMaterial color={p.skin} roughness={0.38} />
          </mesh>
          {/* Tête (peau) */}
          <mesh position={[0, 0.605, 0]} scale={[1, 1.06, 0.96]}>
            <sphereGeometry args={[0.067, 8, 8]} />
            <meshStandardMaterial color={p.skin} roughness={0.32} />
          </mesh>
          {/* Cheveux */}
          <mesh position={[0, 0.638, -0.008]}>
            <sphereGeometry args={[0.07, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.72]} />
            <meshStandardMaterial color={p.hair} roughness={0.68} />
          </mesh>
          {/* Œil gauche */}
          <mesh position={[-0.024, 0.608, 0.06]}>
            <boxGeometry args={[0.013, 0.011, 0.005]} />
            <meshStandardMaterial color="#0f0f0f" />
          </mesh>
          {/* Œil droit */}
          <mesh position={[0.024, 0.608, 0.06]}>
            <boxGeometry args={[0.013, 0.011, 0.005]} />
            <meshStandardMaterial color="#0f0f0f" />
          </mesh>
          {/* Bouche */}
          <mesh position={[0, 0.583, 0.062]}>
            <boxGeometry args={[0.022, 0.007, 0.004]} />
            <meshStandardMaterial color="#9b4040" />
          </mesh>
          {/* Bagage (certains) */}
          {p.hasLuggage && (
            <mesh position={[0.19, 0.18, 0]}>
              <boxGeometry args={[0.1, 0.18, 0.072]} />
              <meshStandardMaterial color="#243447" roughness={0.5} metalness={0.15} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// ═══ PIÉTONS DANS LES RUES — personnages AnimatedPremiumTraveler sur trottoirs ═══
function StreetPedestrians({ isNight }) {
  const streetCrowd = useMemo(() => ([
    // Trottoir EST (x=+9 à +13), zone promenade (z=24-28)
    { basePosition: [9.5, 0.02, 25.5], outfit: PREMIUM_TRAVELER_OUTFITS[1], skin: PREMIUM_TRAVELER_SKIN_TONES[2], hair: PREMIUM_TRAVELER_HAIR[3], behavior: 'walker', movementAxis: 'z', movementRange: 2.0, movementSpeed: 0.3, phase: 0.5, accent: '#6ce8ff', scale: 0.85 },
    { basePosition: [13, 0.02, 26.5], outfit: PREMIUM_TRAVELER_OUTFITS[6], skin: PREMIUM_TRAVELER_SKIN_TONES[4], hair: PREMIUM_TRAVELER_HAIR[6], behavior: 'walker', movementAxis: 'z', movementRange: 1.8, movementSpeed: 0.28, phase: 2.4, accent: '#7cff9a', scale: 0.83 },
    // Trottoir OUEST (x=-9 à -13), zone promenade (z=24-28)
    { basePosition: [-9.5, 0.02, 26], outfit: PREMIUM_TRAVELER_OUTFITS[4], skin: PREMIUM_TRAVELER_SKIN_TONES[5], hair: PREMIUM_TRAVELER_HAIR[1], behavior: 'coffee', movementAxis: 'x', movementRange: 0.12, movementSpeed: 0.22, phase: 1.2, accent: '#ffb057', scale: 0.82, baseRotation: 0.5 },
    { basePosition: [-13, 0.02, 27], outfit: PREMIUM_TRAVELER_OUTFITS[2], skin: PREMIUM_TRAVELER_SKIN_TONES[1], hair: PREMIUM_TRAVELER_HAIR[4], behavior: 'screen', movementAxis: 'x', movementRange: 0.12, movementSpeed: 0.22, phase: 0.8, accent: '#ff78d7', scale: 0.82, hasPhone: true, baseRotation: 0.2 },
    // Zone entre routes z=40 et z=50 (trottoir y=0.75 → personnages à y=0.76)
    { basePosition: [9.5, 0.76, 44.5], outfit: PREMIUM_TRAVELER_OUTFITS[7], skin: PREMIUM_TRAVELER_SKIN_TONES[3], hair: PREMIUM_TRAVELER_HAIR[2], behavior: 'walker', movementAxis: 'x', movementRange: 2.5, movementSpeed: 0.3, phase: 1.6, accent: '#65f0ff', hasLuggage: true, scale: 0.83 },
    { basePosition: [-9.5, 0.76, 44.5], outfit: PREMIUM_TRAVELER_OUTFITS[3], skin: PREMIUM_TRAVELER_SKIN_TONES[6], hair: PREMIUM_TRAVELER_HAIR[0], behavior: 'walker', movementAxis: 'x', movementRange: 2.8, movementSpeed: 0.29, phase: 2.1, accent: '#ffe57c', scale: 0.82 },
    { basePosition: [13.5, 0.76, 45.5], outfit: PREMIUM_TRAVELER_OUTFITS[0], skin: PREMIUM_TRAVELER_SKIN_TONES[7], hair: PREMIUM_TRAVELER_HAIR[5], behavior: 'coffee', movementAxis: 'x', movementRange: 0.1, movementSpeed: 0.2, phase: 3.1, accent: '#55ffd7', scale: 0.82, baseRotation: -0.8 },
    { basePosition: [-13.5, 0.76, 45], outfit: PREMIUM_TRAVELER_OUTFITS[5], skin: PREMIUM_TRAVELER_SKIN_TONES[0], hair: PREMIUM_TRAVELER_HAIR[7], behavior: 'walker', movementAxis: 'x', movementRange: 2.6, movementSpeed: 0.27, phase: 0.3, accent: '#ff9d6e', scale: 0.81 },
    // Zone entre routes z=50 et z=60 (trottoir y=0.75 → personnages à y=0.76)
    { basePosition: [9.5, 0.76, 54.5], outfit: PREMIUM_TRAVELER_OUTFITS[6], skin: PREMIUM_TRAVELER_SKIN_TONES[5], hair: PREMIUM_TRAVELER_HAIR[2], behavior: 'walker', movementAxis: 'x', movementRange: 2.5, movementSpeed: 0.31, phase: 0.4, accent: '#6fffa9', scale: 0.82, hasLuggage: true },
    { basePosition: [-9.5, 0.76, 54], outfit: PREMIUM_TRAVELER_OUTFITS[4], skin: PREMIUM_TRAVELER_SKIN_TONES[3], hair: PREMIUM_TRAVELER_HAIR[1], behavior: 'screen', movementAxis: 'x', movementRange: 0.12, movementSpeed: 0.24, phase: 2.7, accent: '#ffd36b', scale: 0.81, hasPhone: true, hasGlasses: true },
  ]), []);

  return (
    <group>
      {streetCrowd.map((traveler, index) => (
        <AnimatedPremiumTraveler
          key={`street-traveler-${index}`}
          {...traveler}
          accent={isNight ? traveler.accent : '#7fc8dd'}
        />
      ))}
    </group>
  );
}


function CityVehicles({ isNight }) {
  const vehicleRefs = useRef([]);

  const vehicleTypes = useMemo(() => ({
    sedan: { w: 1.6, h: 0.65, d: 0.75, wheelY: -0.2, colors: ['#cc2222','#2244aa','#228844','#444444','#eeeeee','#aa6622'] },
    suv: { w: 2.0, h: 0.85, d: 0.85, wheelY: -0.2, colors: ['#1a1a1a','#4a2a1a','#2a4a6a','#eeeeee'] },
    luxury: { w: 2.2, h: 0.6, d: 0.8, wheelY: -0.18, colors: ['#1a1a2a','#880022','#f0e68c','#c0c0c0'] },
    limo: { w: 3.2, h: 0.62, d: 0.82, wheelY: -0.18, colors: ['#111111','#f2efe7','#7f1530'] },
    tuning: { w: 1.95, h: 0.58, d: 0.78, wheelY: -0.18, colors: ['#00a8ff','#ff4444','#ffffff','#121212'], spoiler: true },
    truck: { w: 3.5, h: 1.6, d: 1.0, wheelY: -0.3, colors: ['#ffffff','#2255aa','#dd6622','#448844'] },
    heavy: { w: 3.1, h: 1.45, d: 1.05, wheelY: -0.32, colors: ['#f0b400','#e36f10','#5a5f68'], beacon: true },
    service: { w: 2.7, h: 1.0, d: 0.92, wheelY: -0.24, colors: ['#ffdd33','#f47c20','#d9dee4'], beacon: true },
    vipvan: { w: 2.95, h: 1.02, d: 0.96, wheelY: -0.24, colors: ['#0f1216','#f0ebe1','#4d0f21'], vip: true },
    tow: { w: 3.15, h: 1.18, d: 1.02, wheelY: -0.28, colors: ['#ffb400','#f47c20','#d9dee4'], beacon: true, tow: true },
    van: { w: 2.4, h: 1.1, d: 0.85, wheelY: -0.25, colors: ['#ffffff','#ffcc00','#cc4400'] },
    moto: { w: 0.9, h: 0.55, d: 0.35, wheelY: -0.12, colors: ['#cc0000','#1a1a1a','#ffaa00','#0066cc'] },
    scooter: { w: 0.75, h: 0.5, d: 0.3, wheelY: -0.1, colors: ['#ff6699','#66ccff','#99cc33'] },
    bike: { w: 0.7, h: 0.55, d: 0.2, wheelY: -0.1, colors: ['#cc4400','#2266aa','#44aa44'] },
    trottinette: { w: 0.4, h: 0.65, d: 0.15, wheelY: -0.08, colors: ['#333333','#ff4400','#00aaff'] },
    bus: { w: 4.5, h: 1.5, d: 1.1, wheelY: -0.35, colors: ['#225588','#cc3333','#33aa55'] },
  }), []);

  const vehicles = useMemo(() => {
    const list = [];
    const roads = [
      // Routes transversales (axe X) à z=32,40,50,60 — lane offset ±1.5
      { axis: 'x', z: 31, dir: 1, range: [-48, 48] },
      { axis: 'x', z: 33, dir: -1, range: [-48, 48] },
      { axis: 'x', z: 39, dir: 1, range: [-48, 48] },
      { axis: 'x', z: 41, dir: -1, range: [-48, 48] },
      { axis: 'x', z: 49, dir: 1, range: [-48, 48] },
      { axis: 'x', z: 51, dir: -1, range: [-48, 48] },
      { axis: 'x', z: 59, dir: 1, range: [-48, 48] },
      { axis: 'x', z: 61, dir: -1, range: [-48, 48] },
      // Avenues N-S (axe Z) à x=-25,0,25 — démarrent APRÈS la zone piétonne (z=28+)
      { axis: 'z', x: -2, dir: 1, range: [29, 62] },
      { axis: 'z', x: 2, dir: -1, range: [29, 62] },
      { axis: 'z', x: -26.5, dir: 1, range: [28, 58] },
      { axis: 'z', x: -23.5, dir: -1, range: [28, 58] },
      { axis: 'z', x: 23.5, dir: 1, range: [28, 58] },
      { axis: 'z', x: 26.5, dir: -1, range: [28, 58] },
      // Périphérique
      { axis: 'x', z: -34, dir: 1, range: [-48, 48] },
      { axis: 'x', z: -36, dir: -1, range: [-48, 48] },
      { axis: 'x', z: 54, dir: 1, range: [-48, 48] },
      { axis: 'x', z: 56, dir: -1, range: [-48, 48] },
    ];
    const types = ['sedan','sedan','suv','luxury','limo','vipvan','tuning','truck','heavy','service','tow','van','moto','moto','scooter','bike','trottinette','bus'];
    let idx = 0;
    roads.forEach((road, ri) => {
      const count = road.axis === 'x' ? 2 : 2;
      for (let v = 0; v < count; v++) {
        const type = types[(ri * 3 + v) % types.length];
        const spec = vehicleTypes[type];
        const color = spec.colors[(ri + v) % spec.colors.length];
        const speed = (2 + Math.random() * 3) * road.dir * (type === 'truck' || type === 'bus' ? 0.6 : type === 'bike' || type === 'trottinette' ? 0.5 : 1);
        const start = road.range[0] + (road.range[1] - road.range[0]) * (v / count);
        list.push({ id: idx++, type, spec, color, speed, road, start });
      }
    });
    return list;
  }, [vehicleTypes]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    vehicles.forEach((v, i) => {
      const ref = vehicleRefs.current[i];
      if (!ref) return;
      const { road, speed, start } = v;
      const len = road.range[1] - road.range[0];
      let pos = ((start + speed * t) % len);
      if (pos < 0) pos += len;
      pos += road.range[0];
      if (road.axis === 'x') {
        ref.position.x = pos;
        ref.position.z = road.z;
        ref.rotation.y = speed > 0 ? 0 : Math.PI;
      } else {
        ref.position.z = pos;
        ref.position.x = road.x;
        ref.rotation.y = speed > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    });
  });

  return (
    <group>
      {vehicles.map((v, i) => (
        <group key={`veh-${v.id}`} ref={el => { vehicleRefs.current[i] = el; }} position={[0, 0.75, 0]}>
          {['moto','scooter','bike','trottinette'].includes(v.type) ? (
            <>
              {[ -v.spec.w * 0.42, v.spec.w * 0.42 ].map((wheelX, wi) => (
                <mesh key={`light-wheel-${wi}`} position={[wheelX, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.16, 0.16, 0.08, 10]} />
                  <meshStandardMaterial color="#111111" roughness={0.92} />
                </mesh>
              ))}
              <mesh position={[0, 0.42, 0]} rotation={[0, 0, v.type === 'bike' ? Math.PI / 10 : Math.PI / 14]}><boxGeometry args={[v.spec.w * 1.15, 0.08, 0.08]} /><meshStandardMaterial color={v.color} metalness={0.62} roughness={0.2} /></mesh>
              <mesh position={[0.04, 0.54, 0]}><boxGeometry args={[v.spec.w * 0.42, 0.16, Math.max(v.spec.d * 0.8, 0.16)]} /><meshStandardMaterial color={v.color} metalness={0.58} roughness={0.22} /></mesh>
              <mesh position={[-0.04, 0.8, 0]}><boxGeometry args={[0.14, 0.45, 0.14]} /><meshStandardMaterial color="#2a2a3a" roughness={0.8} /></mesh>
              <mesh position={[v.spec.w * 0.45, 0.66, 0]} rotation={[0, 0, Math.PI / 6]}><boxGeometry args={[0.32, 0.05, 0.05]} /><meshStandardMaterial color="#cfd8df" metalness={0.86} roughness={0.12} /></mesh>
              <mesh position={[v.spec.w * 0.58, 0.48, 0]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#ffe08a" emissive="#ffe08a" emissiveIntensity={isNight ? 2.2 : 0.22} /></mesh>
            </>
          ) : (
            <>
              <mesh position={[0, v.spec.h * 0.42, 0]}>
                <boxGeometry args={[v.spec.w, v.spec.h * 0.74, v.spec.d]} />
                <meshStandardMaterial color={v.color} roughness={0.32} metalness={0.46} />
              </mesh>
              <mesh position={[-v.spec.w * 0.1, v.spec.h * 0.8, 0]}>
                <boxGeometry args={[v.spec.w * (v.type === 'truck' || v.type === 'heavy' ? 0.5 : 0.58), v.spec.h * 0.48, v.spec.d * 0.9]} />
                <meshStandardMaterial color={v.color} roughness={0.34} metalness={0.42} />
              </mesh>
              <mesh position={[v.spec.w * 0.1, v.spec.h * 0.88, 0]}>
                <boxGeometry args={[v.spec.w * (v.type === 'limo' ? 0.72 : 0.42), v.spec.h * 0.52, v.spec.d * 0.84]} />
                <meshPhysicalMaterial color="#b8d8f0" transmission={0.3} roughness={0.05} transparent opacity={0.58} />
              </mesh>
              {(v.type === 'truck' || v.type === 'heavy' || v.type === 'bus') && (
                <mesh position={[-v.spec.w * 0.2, v.spec.h * 0.95, 0]}>
                  <boxGeometry args={[v.spec.w * (v.type === 'bus' ? 0.72 : 0.52), v.spec.h * 0.7, v.spec.d * 0.96]} />
                  <meshStandardMaterial color={v.type === 'heavy' ? '#555c65' : '#dfe6eb'} roughness={0.34} metalness={0.28} />
                </mesh>
              )}
              {(v.type === 'truck' || v.type === 'heavy') && (
                <group position={[-v.spec.w * 0.92, v.spec.h * 0.34, 0]}>
                  <mesh><boxGeometry args={[v.spec.w * 0.68, v.spec.h * 0.24, v.spec.d * 0.92]} /><meshStandardMaterial color="#4a5058" metalness={0.42} roughness={0.4} /></mesh>
                  <mesh position={[0, 0.3, 0]}><boxGeometry args={[v.spec.w * 0.6, v.spec.h * 0.3, v.spec.d * 0.9]} /><meshStandardMaterial color={v.type === 'heavy' ? '#646b73' : '#dfe6eb'} metalness={0.3} roughness={0.34} /></mesh>
                </group>
              )}
              <mesh position={[v.spec.w / 2 - 0.04, v.spec.h * 0.22, 0]}><boxGeometry args={[0.08, 0.16, v.spec.d * 0.64]} /><meshStandardMaterial color="#bcc6cf" metalness={0.88} roughness={0.1} /></mesh>
              <mesh position={[v.spec.w / 2 - 0.08, v.spec.h * 0.32, 0]}><boxGeometry args={[0.14, 0.18, v.spec.d * 0.72]} /><meshStandardMaterial color="#1f2428" metalness={0.62} roughness={0.24} /></mesh>
              {[-1, 1].map((side, mirrorIndex) => (
                <mesh key={`mirror-${mirrorIndex}`} position={[v.spec.w * 0.22, v.spec.h * 0.86, side * (v.spec.d * 0.54)]}><boxGeometry args={[0.08, 0.05, 0.12]} /><meshStandardMaterial color="#101317" metalness={0.82} roughness={0.12} /></mesh>
              ))}
              {[-0.18, 0.18].map((doorOffset, doorIndex) => (
                <mesh key={`door-${doorIndex}`} position={[v.spec.w * doorOffset, v.spec.h * 0.46, v.spec.d / 2 + 0.01]}><boxGeometry args={[0.04, v.spec.h * 0.48, 0.02]} /><meshStandardMaterial color="#dfe5eb" metalness={0.88} roughness={0.08} /></mesh>
              ))}
              <mesh position={[-v.spec.w / 2 + 0.12, Math.max(v.spec.wheelY + 0.18, 0.06), -v.spec.d * 0.22]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.26, 8]} /><meshStandardMaterial color="#8c949c" metalness={0.9} roughness={0.1} /></mesh>
              {[-1, 1].map((side, li) => (
                <React.Fragment key={`lights-${li}`}>
                  <mesh position={[v.spec.w / 2 - 0.02, v.spec.h * 0.3, side * v.spec.d * 0.34]}><boxGeometry args={[0.08, 0.08, 0.08]} /><meshStandardMaterial color="#ffeeaa" emissive="#ffeeaa" emissiveIntensity={isNight ? 3.2 : 0.22} /></mesh>
                  <mesh position={[-v.spec.w / 2 + 0.02, v.spec.h * 0.26, side * v.spec.d * 0.3]}><boxGeometry args={[0.08, 0.08, 0.08]} /><meshStandardMaterial color="#ff2a16" emissive="#ff2a16" emissiveIntensity={isNight ? 2.2 : 0.22} /></mesh>
                </React.Fragment>
              ))}
              {(v.type === 'service' || v.type === 'tow') && (
                <group position={[-v.spec.w / 2 + 0.12, v.spec.h * 0.42, 0]}>
                  {[-0.18, 0, 0.18].map((stripe, stripeIndex) => (
                    <mesh key={`chevron-${stripeIndex}`} position={[0, stripe, 0]} rotation={[0, 0, Math.PI / 4]}>
                      <boxGeometry args={[0.28, 0.05, v.spec.d * 0.72]} />
                      <meshStandardMaterial color={stripeIndex % 2 === 0 ? '#101317' : '#ffb400'} metalness={0.82} roughness={0.12} />
                    </mesh>
                  ))}
                </group>
              )}
              {v.spec.spoiler && <mesh position={[-v.spec.w * 0.34, v.spec.h * 1.02, 0]}><boxGeometry args={[0.18, 0.16, v.spec.d * 0.82]} /><meshStandardMaterial color="#101317" metalness={0.8} roughness={0.12} /></mesh>}
              {v.type === 'suv' && <mesh position={[-0.05, v.spec.h * 1.18, 0]}><boxGeometry args={[v.spec.w * 0.42, 0.08, v.spec.d * 0.88]} /><meshStandardMaterial color="#191c20" metalness={0.74} roughness={0.12} /></mesh>}
              {v.type === 'limo' && <mesh position={[0, v.spec.h * 0.66, -v.spec.d / 2 - 0.02]}><boxGeometry args={[v.spec.w * 0.82, 0.04, 0.02]} /><meshStandardMaterial color="#d7dee6" metalness={0.95} roughness={0.08} /></mesh>}
              {v.spec.vip && <mesh position={[0, v.spec.h * 1.08, v.spec.d / 2 + 0.02]}><boxGeometry args={[v.spec.w * 0.76, 0.04, 0.02]} /><meshStandardMaterial color="#f2f4f7" metalness={0.96} roughness={0.08} /></mesh>}
              {v.spec.tow && (
                <group position={[-v.spec.w * 0.68, v.spec.h * 0.88, 0]}>
                  <mesh rotation={[0, 0, -0.4]}><boxGeometry args={[1.18, 0.1, 0.14]} /><meshStandardMaterial color="#cfd6dd" metalness={0.9} roughness={0.08} /></mesh>
                  <mesh position={[-0.48, -0.4, 0]}><boxGeometry args={[0.12, 0.62, 0.12]} /><meshStandardMaterial color="#cfd6dd" metalness={0.9} roughness={0.08} /></mesh>
                </group>
              )}
              {v.spec.beacon && <mesh position={[0.08, v.spec.h * 1.38, 0]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#ffb400" emissive="#ffb400" emissiveIntensity={isNight ? 2.4 : 0.3} /></mesh>}
              {[[-v.spec.w * 0.3, v.spec.wheelY, v.spec.d * 0.42], [-v.spec.w * 0.3, v.spec.wheelY, -v.spec.d * 0.42],
                [v.spec.w * 0.3, v.spec.wheelY, v.spec.d * 0.42], [v.spec.w * 0.3, v.spec.wheelY, -v.spec.d * 0.42]].map((wp, wi) => (
                <group key={`wh-${wi}`} position={wp} rotation={[Math.PI / 2, 0, 0]}>
                  <mesh><cylinderGeometry args={[0.14, 0.14, 0.1, 10]} /><meshStandardMaterial color="#111111" roughness={0.92} /></mesh>
                  <mesh position={[0, 0, 0.01]}><cylinderGeometry args={[0.06, 0.06, 0.12, 8]} /><meshStandardMaterial color="#c2ccd4" metalness={0.88} roughness={0.12} /></mesh>
                </group>
              ))}
            </>
          )}
        </group>
      ))}
    </group>
  );
}

// ═══ CAMÉRA PREMIÈRE PERSONNE — Balade interactive dans la ville et la gare ═══
function FirstPersonWalkthrough({ isNight, active, onEnd }) {
  const cameraRef = useRef();
  const { camera } = useThree();
  const startTime = useRef(0);
  const originalPos = useRef(null);
  const originalRot = useRef(null);

  const waypoints = useMemo(() => [
    // Phase 1 : Approche depuis la ville SUD
    { t: 0, pos: [0, 1.7, 45], lookAt: [0, 1.7, 30] },
    { t: 4, pos: [0, 1.7, 30], lookAt: [0, 2, 24] },
    // Phase 2 : Passer devant la fontaine
    { t: 7, pos: [2, 1.7, 24], lookAt: [0, 3, 20] },
    // Phase 3 : Approche de l'entrée escalator (rampe sud z=20.5)
    { t: 10, pos: [1.5, 1.7, 21], lookAt: [0, 2, 18] },
    // Phase 4 : Montée sur le tapis roulant (rampe sud)
    { t: 13, pos: [1.5, 2.5, 19], lookAt: [0, 4, 15] },
    { t: 16, pos: [1.5, 3.5, 17], lookAt: [0, 4.5, 12] },
    // Phase 5 : Sur la passerelle principale
    { t: 19, pos: [1.5, 4.5, 14], lookAt: [0, 4.5, 9] },
    { t: 22, pos: [1.5, 4.5, 10], lookAt: [0, 4, 5] },
    // Phase 6 : Descente du tapis roulant nord
    { t: 25, pos: [1.5, 3.5, 5], lookAt: [0, 2, 0] },
    { t: 28, pos: [1.5, 2.0, 2], lookAt: [0, 1.7, 0] },
    // Phase 7 : Arrivée au quai — descente passage souterrain
    { t: 31, pos: [4, 1.7, 0.5], lookAt: [4, 0.5, 0.5] },
    { t: 34, pos: [4, 0.5, 0.5], lookAt: [4, 0.3, 3.25] },
    // Phase 8 : Sur le quai A — attente du train
    { t: 37, pos: [2, 1.7, 3.25], lookAt: [-5, 1.7, 3.25] },
    { t: 42, pos: [-5, 1.7, 3.25], lookAt: [-15, 1.5, 2] },
    // Fin : Vue panoramique
    { t: 46, pos: [0, 12, 25], lookAt: [0, 0, 5] },
  ], []);

  useEffect(() => {
    if (active) {
      startTime.current = 0;
      originalPos.current = camera.position.clone();
      originalRot.current = camera.quaternion.clone();
    }
  }, [active, camera]);

  useFrame(({ clock }, delta) => {
    if (!active) return;
    startTime.current += delta;
    const t = startTime.current;
    const totalDuration = waypoints[waypoints.length - 1].t;

    if (t >= totalDuration) {
      if (originalPos.current) {
        camera.position.copy(originalPos.current);
        camera.quaternion.copy(originalRot.current);
      }
      if (onEnd) onEnd();
      return;
    }

    let wpIdx = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      if (t >= waypoints[i].t && t < waypoints[i + 1].t) { wpIdx = i; break; }
    }
    const wp0 = waypoints[wpIdx];
    const wp1 = waypoints[wpIdx + 1];
    const progress = (t - wp0.t) / (wp1.t - wp0.t);
    const ease = progress * progress * (3 - 2 * progress);

    camera.position.set(
      wp0.pos[0] + (wp1.pos[0] - wp0.pos[0]) * ease,
      wp0.pos[1] + (wp1.pos[1] - wp0.pos[1]) * ease,
      wp0.pos[2] + (wp1.pos[2] - wp0.pos[2]) * ease
    );
    camera.lookAt(
      wp0.lookAt[0] + (wp1.lookAt[0] - wp0.lookAt[0]) * ease,
      wp0.lookAt[1] + (wp1.lookAt[1] - wp0.lookAt[1]) * ease,
      wp0.lookAt[2] + (wp1.lookAt[2] - wp0.lookAt[2]) * ease
    );
  });

  return null;
}


function UrbanRealism({ isNight }) {
  const trafficLightRefs = useRef([]);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    trafficLightRefs.current.forEach((lights, i) => {
      if (!lights) return;
      const cycle = (t * 0.3 + i * 2.1) % 3;
      const r = lights.children[0];
      const y = lights.children[1];
      const g = lights.children[2];
      if (r?.material) r.material.emissiveIntensity = cycle < 1 ? 3 : 0.1;
      if (y?.material) y.material.emissiveIntensity = (cycle >= 1 && cycle < 1.5) ? 3 : 0.1;
      if (g?.material) g.material.emissiveIntensity = cycle >= 1.5 ? 3 : 0.1;
    });
  });

  const roadC = isNight ? '#1a1e24' : '#505458';
  const sidewalkC = isNight ? '#2a2e34' : '#ffffff';
  const metalC = isNight ? '#2a3444' : '#808890';
  const guideC = isNight ? '#cfd8df' : '#f6f7f9';
  const guideGlow = isNight ? '#7ce7ff' : '#ffffff';

  const trafficLightPositions = [
    { x: 5, z: 32, ry: 0 }, { x: -5, z: 32, ry: Math.PI },
    { x: 5, z: 40, ry: 0 }, { x: -5, z: 40, ry: Math.PI },
    { x: 5, z: 50, ry: 0 }, { x: -5, z: 50, ry: Math.PI },
  ];

  const crosswalkRoads = [32, 40, 50, 60];

  return (
    <group>
      {/* ═══ 1. PASSAGES PIÉTONS (ZEBRA CROSSINGS) ═══ */}
      {crosswalkRoads.map((rz, ri) => (
        <group key={`xwalk-group-${ri}`}>
          {/* Passage central (avenue x=0) */}
          {[-8, 8].map((cx, ci) => (
            <group key={`xwalk-${ri}-${ci}`} position={[cx, 0.68, rz]}>
              {[...Array(4)].map((_, si) => (
                <mesh key={`stripe-${si}`} position={[0, 0, -1.6 + si * 1.0]}>
                  <boxGeometry args={[2.8, 0.02, 0.45]} />
                  <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
                </mesh>
              ))}
            </group>
          ))}
          {/* Passages sur avenues latérales */}
          {[-25, 25].map((ax, ai) => (
            <group key={`xwalk-lat-${ri}-${ai}`} position={[ax, 0.68, rz]}>
              {[...Array(3)].map((_, si) => (
                <mesh key={`stripe-lat-${si}`} position={[0, 0, -1.2 + si * 1.2]}>
                  <boxGeometry args={[2.4, 0.02, 0.4]} />
                  <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* ═══ 1 BIS. GUIDES DE VIRAGE ET LIGNES D'ARRÊT SUR LES CARREFOURS MAJEURS ═══ */}
      {[32, 40, 50].map((rz, ri) => (
        <group key={`junction-guides-${ri}`}>
          {[-25, 0, 25].map((ax, ai) => (
            <group key={`junction-guide-${ri}-${ai}`} position={[ax, 0.69, rz]}>
              {[
                [-2.2, -2.0, Math.PI / 4],
                [2.2, -2.0, -Math.PI / 4],
                [2.2, 2.0, Math.PI / 4],
                [-2.2, 2.0, -Math.PI / 4],
              ].map(([gx, gz, rot], gi) => (
                <mesh key={`turn-guide-${gi}`} position={[gx, 0, gz]} rotation={[0, rot, 0]}>
                  <boxGeometry args={[2.7, 0.02, 0.14]} />
                  <meshStandardMaterial color={guideC} emissive={guideGlow} emissiveIntensity={isNight ? 0.42 : 0.08} />
                </mesh>
              ))}
              {[
                [0, -3.15, 4.8, 0.18],
                [0, 3.15, 4.8, 0.18],
                [-3.15, 0, 0.18, 4.8],
                [3.15, 0, 0.18, 4.8],
              ].map(([sx, sz, sw, sd], si) => (
                <mesh key={`stop-line-${si}`} position={[sx, 0.01, sz]}>
                  <boxGeometry args={[sw, 0.02, sd]} />
                  <meshStandardMaterial color={guideC} roughness={0.28} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* ═══ 2. FEUX TRICOLORES ═══ */}
      {trafficLightPositions.map((tl, ti) => (
        <group key={`tlight-${ti}`} position={[tl.x, 0, tl.z]} rotation={[0, tl.ry, 0]}>
          {/* Poteau */}
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 4.4, 6]} />
            <meshStandardMaterial color={metalC} metalness={0.6} roughness={0.2} />
          </mesh>
          {/* Boîtier feux */}
          <mesh position={[0, 4.2, 0.12]}>
            <boxGeometry args={[0.36, 1.1, 0.2]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
          {/* 3 feux (rouge, orange, vert) */}
          <group ref={el => { trafficLightRefs.current[ti] = el; }}>
            <mesh position={[0, 4.55, 0.24]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ff2020" emissive="#ff2020" emissiveIntensity={0.1} />
            </mesh>
            <mesh position={[0, 4.2, 0.24]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.1} />
            </mesh>
            <mesh position={[0, 3.85, 0.24]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#00cc44" emissive="#00cc44" emissiveIntensity={0.1} />
            </mesh>
          </group>
          {/* Visière au-dessus du boîtier */}
          <mesh position={[0, 4.8, 0.22]}>
            <boxGeometry args={[0.4, 0.06, 0.28]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ═══ 3. ENTRÉE GARE SOUTERRAINE / MÉTRO ═══ */}
      {[{ x: -12, z: 28, ry: 0, name: 'MÉTRO' }, { x: 12, z: 28, ry: Math.PI, name: 'RER' }].map((metro, mi) => (
        <group key={`metro-${mi}`} position={[metro.x, 0, metro.z]} rotation={[0, metro.ry, 0]}>
          {/* Structure d'entrée — arche Art Nouveau */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[3.5, 3.0, 2.5]} />
            <meshStandardMaterial color={isNight ? '#1a2030' : '#d0d4d8'} roughness={0.3} metalness={0.3} />
          </mesh>
          {/* Ouverture / escalier descendant */}
          <mesh position={[0, 0.5, 1.3]}>
            <boxGeometry args={[2.6, 1.6, 0.08]} />
            <meshStandardMaterial color="#0a0a12" roughness={0.9} />
          </mesh>
          {/* Marches visibles */}
          {[...Array(4)].map((_, si) => (
            <mesh key={`step-${si}`} position={[0, -0.1 + si * 0.32, 0.9 - si * 0.3]}>
              <boxGeometry args={[2.4, 0.08, 0.4]} />
              <meshStandardMaterial color={isNight ? '#2a2a34' : '#b0b4b8'} roughness={0.4} metalness={0.2} />
            </mesh>
          ))}
          {/* Garde-corps de l'entrée */}
          {[-1.35, 1.35].map((rx, rxi) => (
            <mesh key={`rail-${rxi}`} position={[rx, 1.0, 0.8]}>
              <boxGeometry args={[0.08, 2.0, 1.6]} />
              <meshStandardMaterial color={isNight ? '#2a3444' : '#a0a8b0'} metalness={0.7} roughness={0.15} />
            </mesh>
          ))}
          {/* Enseigne lumineuse "M" */}
          <mesh position={[0, 3.15, 0]}>
            <boxGeometry args={[3.6, 0.5, 2.6]} />
            <meshStandardMaterial
              color={mi === 0 ? '#1a4488' : '#cc4400'}
              emissive={mi === 0 ? '#2266cc' : '#ff6622'}
              emissiveIntensity={isNight ? 2.0 : 0.4}
              roughness={0.2} metalness={0.4}
            />
          </mesh>
          {/* Globe lumineux classique */}
          <mesh position={[0, 3.65, 1.3]}>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshStandardMaterial
              color={mi === 0 ? '#ffdd44' : '#44ddff'}
              emissive={mi === 0 ? '#ffdd44' : '#44ddff'}
              emissiveIntensity={isNight ? 3.5 : 1.0}
            />
          </mesh>
          <Text position={[0, 3.15, 1.35]} fontSize={0.35} color="#ffffff" anchorX="center" fontWeight="bold">
            {metro.name}
          </Text>
        </group>
      ))}

      {/* ═══ 3 BIS. ABRIBUS PREMIUM / TOTEMS / BANCS DESIGN ═══ */}
      {[
        { x: -18, z: 34, rot: 0, label: 'TRAM A', accent: '#7ce7ff' },
        { x: 18, z: 34, rot: Math.PI, label: 'CITY BUS', accent: '#ffd76a' },
        { x: -18, z: 46, rot: 0, label: 'NORD LINK', accent: '#9df07c' },
        { x: 18, z: 46, rot: Math.PI, label: 'SUD LINK', accent: '#ff9f7c' },
      ].map((shelter, shelterIndex) => (
        <group key={`street-shelter-${shelterIndex}`} position={[shelter.x, 0, shelter.z]} rotation={[0, shelter.rot, 0]}>
          <mesh position={[0, 0.08, 0]}><boxGeometry args={[4.8, 0.16, 2.2]} /><meshStandardMaterial color={isNight ? '#2a3038' : '#dde3e8'} roughness={0.28} metalness={0.12} /></mesh>
          {[-1.9, 1.9].map((px, pi) => (
            <mesh key={`shelter-pillar-${pi}`} position={[px, 1.8, 0.9]}><boxGeometry args={[0.12, 3.6, 0.12]} /><meshStandardMaterial color={metalC} metalness={0.75} roughness={0.14} /></mesh>
          ))}
          <mesh position={[0, 3.68, 0.5]}><boxGeometry args={[4.9, 0.12, 2.4]} /><meshStandardMaterial color={isNight ? '#1d2734' : '#f7fafc'} roughness={0.12} metalness={0.34} /></mesh>
          <mesh position={[0, 2.1, 1.02]}><boxGeometry args={[4.4, 2.8, 0.08]} /><meshPhysicalMaterial color="#c8e6f8" transmission={0.6} roughness={0.03} thickness={0.1} transparent opacity={0.55} /></mesh>
          {[-1.4, 1.4].map((px, pi) => (
            <mesh key={`shelter-side-glass-${pi}`} position={[px, 1.85, 0.1]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[1.8, 2.5, 0.06]} /><meshPhysicalMaterial color="#c8e6f8" transmission={0.55} roughness={0.03} thickness={0.08} transparent opacity={0.48} /></mesh>
          ))}
          <mesh position={[0, 0.72, -0.15]}><boxGeometry args={[2.2, 0.16, 0.56]} /><meshStandardMaterial color="#d8e0e8" metalness={0.42} roughness={0.18} /></mesh>
          <mesh position={[0, 1.05, -0.38]}><boxGeometry args={[2.2, 0.7, 0.12]} /><meshStandardMaterial color="#d8e0e8" metalness={0.42} roughness={0.18} /></mesh>
          <mesh position={[2.15, 1.7, 0.65]}><boxGeometry args={[0.22, 3.2, 0.22]} /><meshStandardMaterial color="#cbd4dd" metalness={0.8} roughness={0.1} /></mesh>
          <mesh position={[2.15, 2.7, 0.82]}><boxGeometry args={[1.1, 1.2, 0.12]} /><meshStandardMaterial color="#17324f" emissive={shelter.accent} emissiveIntensity={isNight ? 1.6 : 0.16} /></mesh>
          <Text position={[2.15, 2.72, 0.96]} fontSize={0.18} color="#ffffff" anchorX="center">{shelter.label}</Text>
        </group>
      ))}

      {/* ═══ 3 TER. SCÈNES VIP / TECHNIQUES ═══ */}
      <group position={[22, 0, 34]}>
        {[-0.9, 0.9].map((x, i) => (
          <group key={`vip-post-${i}`} position={[x, 0, -1.2]}>
            <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.05, 0.06, 0.9, 8]} /><meshStandardMaterial color="#d7dee6" metalness={0.88} roughness={0.08} /></mesh>
            <mesh position={[0, 0.88, 0]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#ffd870" emissive="#ffd870" emissiveIntensity={isNight ? 1.4 : 0.14} /></mesh>
          </group>
        ))}
        <mesh position={[0, 0.12, 0]}><boxGeometry args={[1.8, 0.08, 1.1]} /><meshStandardMaterial color="#1a1f26" roughness={0.82} /></mesh>
        {[[-0.35, 0.44], [0.2, 0.36]].map(([x, y], i) => (
          <mesh key={`vip-luggage-${i}`} position={[x, y, 0.2]}><boxGeometry args={[0.24, 0.38 + i * 0.08, 0.18]} /><meshStandardMaterial color={i === 0 ? '#2b3240' : '#7a1426'} roughness={0.4} metalness={0.12} /></mesh>
        ))}
        {[[-0.5, -0.15], [0.45, -0.2]].map(([x, z], i) => (
          <group key={`vip-guest-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 0.82, 0]}><boxGeometry args={[0.18, 0.86, 0.16]} /><meshStandardMaterial color={i === 0 ? '#1a1e2a' : '#4b0f20'} roughness={0.74} /></mesh>
            <mesh position={[0, 1.42, 0]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color={i === 0 ? '#c58f68' : '#8a5b40'} roughness={0.9} /></mesh>
          </group>
        ))}
        <Text position={[0, 1.35, 0.95]} fontSize={0.18} color="#ffe08a" anchorX="center">VIP DROP</Text>
      </group>
      <group position={[-22, 0, 46]}>
        {[[-0.8, -0.6], [0, -0.6], [0.8, -0.6]].map(([x, z], i) => (
          <group key={`service-cone-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 0.18, 0]}><coneGeometry args={[0.12, 0.36, 8]} /><meshStandardMaterial color="#ff7f1f" roughness={0.4} /></mesh>
            <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.15, 0.15, 0.04, 10]} /><meshStandardMaterial color="#ffffff" roughness={0.24} /></mesh>
          </group>
        ))}
        <mesh position={[0, 0.14, 0.12]}><boxGeometry args={[1.4, 0.1, 0.9]} /><meshStandardMaterial color="#3f4752" roughness={0.6} /></mesh>
        <mesh position={[0.3, 0.28, 0.05]}><boxGeometry args={[0.36, 0.18, 0.22]} /><meshStandardMaterial color="#ffb400" metalness={0.24} roughness={0.32} /></mesh>
        <group position={[-0.42, 0, 0.15]}>
          <mesh position={[0, 0.82, 0]}><boxGeometry args={[0.18, 0.86, 0.16]} /><meshStandardMaterial color="#384452" roughness={0.74} /></mesh>
          <mesh position={[0, 1.42, 0]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color="#8a5b40" roughness={0.9} /></mesh>
        </group>
        <Text position={[0, 1.2, 0.88]} fontSize={0.16} color="#7ce7ff" anchorX="center">TECH SERVICE</Text>
      </group>

      {/* ═══ 4. BOUTIQUES DE TROTTOIR / KIOSQUES ═══ */}
      {[
        { x: -10, z: 36.5, name: 'TABAC', color: '#8B0000' },
        { x: 10, z: 36.5, name: 'JOURNAUX', color: '#1a4488' },
        { x: -10, z: 44.5, name: 'BOULANGERIE', color: '#8B6914' },
        { x: 10, z: 44.5, name: 'PIZZA', color: '#cc3300' },
      ].map((shop, si) => (
        <group key={`shop-${si}`} position={[shop.x, 0, shop.z]}>
          {/* Structure du kiosque */}
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[2.4, 2.4, 1.8]} />
            <meshStandardMaterial color={isNight ? '#1a2030' : '#e8e4e0'} roughness={0.5} />
          </mesh>
          {/* Auvent coloré */}
          <mesh position={[0, 2.5, 0.5]}>
            <boxGeometry args={[2.8, 0.12, 2.4]} />
            <meshStandardMaterial color={shop.color} roughness={0.4} />
          </mesh>
          {/* Vitrine */}
          <mesh position={[0, 1.3, 0.92]}>
            <boxGeometry args={[2.0, 1.4, 0.06]} />
            <meshPhysicalMaterial color="#a0d8ee" transmission={0.5} roughness={0.05} thickness={0.1} transparent opacity={0.4} />
          </mesh>
          {/* Enseigne */}
          <Text position={[0, 2.7, 0.95]} fontSize={0.18} color={isNight ? '#ffffff' : shop.color} anchorX="center">
            {shop.name}
          </Text>
          {/* Éclairage vitrine (nuit) */}
          <mesh position={[0, 0.15, 1.05]}>
            <boxGeometry args={[2.2, 0.04, 0.04]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={isNight ? 2.0 : 0.2} />
          </mesh>
        </group>
      ))}

      {/* ═══ 5. PASSERELLE PIÉTONNE au-dessus de la route z=32 ═══ */}
      <group position={[0, 0, 32]}>
        {/* Tablier (deck) */}
        <mesh position={[-18, 6.5, 0]}>
          <boxGeometry args={[10, 0.2, 2.2]} />
          <meshStandardMaterial color={isNight ? '#2a3444' : '#d0d8e0'} roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Garde-corps vitrés */}
        {[-1.1, 1.1].map((gz, gi) => (
          <mesh key={`ped-bridge-glass-${gi}`} position={[-18, 7.0, gz]}>
            <boxGeometry args={[10, 0.9, 0.06]} />
            <meshPhysicalMaterial color="#c8e6f8" transmission={0.6} roughness={0.04} thickness={0.1} transparent opacity={isNight ? 0.65 : 0.45} />
          </mesh>
        ))}
        {/* Main courante */}
        {[-1.1, 1.1].map((gz, gi) => (
          <mesh key={`ped-bridge-rail-${gi}`} position={[-18, 7.5, gz]}>
            <boxGeometry args={[10, 0.06, 0.08]} />
            <meshStandardMaterial color="#69ebff" emissive="#69ebff" emissiveIntensity={isNight ? 1.5 : 0.3} />
          </mesh>
        ))}
        {/* 4 piliers */}
        {[-23, -13].map((px, pi) => (
          <group key={`ped-pillar-group-${pi}`}>
            {[-1.0, 1.0].map((pz, pzi) => (
              <mesh key={`ped-pillar-${pzi}`} position={[px, 3.2, pz]}>
                <boxGeometry args={[0.3, 6.4, 0.3]} />
                <meshStandardMaterial color={metalC} metalness={0.6} roughness={0.15} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Escaliers d'accès (gauche) */}
        {[...Array(8)].map((_, si) => (
          <mesh key={`ped-stair-L-${si}`} position={[-23.5 - si * 0.5, 6.0 - si * 0.8, 0]}>
            <boxGeometry args={[0.5, 0.15, 2.0]} />
            <meshStandardMaterial color={isNight ? '#2a3444' : '#c8d0d8'} roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
        {/* Escaliers d'accès (droite) */}
        {[...Array(8)].map((_, si) => (
          <mesh key={`ped-stair-R-${si}`} position={[-12.5 + si * 0.5, 6.0 - si * 0.8, 0]}>
            <boxGeometry args={[0.5, 0.15, 2.0]} />
            <meshStandardMaterial color={isNight ? '#2a3444' : '#c8d0d8'} roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* ═══ 6. POTEAUX CATÉNAIRES le long des voies ferrées ═══ */}
      {[-48, -24, 24, 48].map((cx, ci) => (
        <group key={`catenary-${ci}`}>
          {[0, 11.5].map((cz, czi) => (
            <group key={`cat-pole-${czi}`} position={[cx, 0, cz]}>
              {/* Poteau vertical */}
              <mesh position={[0, 4.5, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 9, 6]} />
                <meshStandardMaterial color="#808890" metalness={0.7} roughness={0.2} />
              </mesh>
              {/* Bras horizontal */}
              <mesh position={[0, 9.0, czi === 0 ? 2.8 : -2.8]}>
                <boxGeometry args={[0.06, 0.06, 5.6]} />
                <meshStandardMaterial color="#808890" metalness={0.7} roughness={0.2} />
              </mesh>
              {/* Fils caténaires (simplifiés) */}
              {[1.4, 4.2, 7.0].map((fz, fi) => (
                <mesh key={`wire-${fi}`} position={[0, 8.6, czi === 0 ? fz : -fz]}>
                  <boxGeometry args={[0.02, 0.02, 0.4]} />
                  <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* ═══ 7. ÎLOTS PIÉTONS / REFUGES sur les grands carrefours ═══ */}
      {[32, 40, 50].map((iz, ii) => (
        <group key={`island-${ii}`}>
          {[-15, 15].map((ix, ixi) => (
            <group key={`isl-${ixi}`} position={[ix, 0.65, iz]}>
              {/* Îlot béton */}
              <mesh>
                <boxGeometry args={[1.8, 0.2, 3.5]} />
                <meshStandardMaterial color={sidewalkC} roughness={0.7} />
              </mesh>
              {/* Bollard lumineux */}
              <mesh position={[0, 0.55, 0]}>
                <cylinderGeometry args={[0.1, 0.12, 0.9, 8]} />
                <meshStandardMaterial color={metalC} metalness={0.6} roughness={0.2} />
              </mesh>
              <mesh position={[0, 1.02, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={isNight ? 2.5 : 0.4} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ═══ 8. PANNEAUX DE SIGNALISATION ROUTIÈRE ═══ */}
      {[
        { x: 6, z: 30, text: '30', type: 'speed' },
        { x: -6, z: 38, text: 'P', type: 'parking' },
        { x: 6, z: 48, text: '30', type: 'speed' },
        { x: -28, z: 30, text: 'STOP', type: 'stop' },
        { x: 28, z: 38, text: 'STOP', type: 'stop' },
      ].map((sign, si) => (
        <group key={`sign-${si}`} position={[sign.x, 0, sign.z]}>
          <mesh position={[0, 2.0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 4.0, 6]} />
            <meshStandardMaterial color="#808890" metalness={0.6} roughness={0.2} />
          </mesh>
          <mesh position={[0, 3.8, 0.05]} rotation={[0, 0, sign.type === 'stop' ? Math.PI / 8 : 0]}>
            <boxGeometry args={[sign.type === 'stop' ? 0.7 : 0.6, sign.type === 'stop' ? 0.7 : 0.6, 0.04]} />
            <meshStandardMaterial
              color={sign.type === 'stop' ? '#cc0000' : sign.type === 'speed' ? '#ffffff' : '#2255cc'}
              roughness={0.3}
            />
          </mesh>
          <Text position={[0, 3.8, 0.08]} fontSize={sign.type === 'stop' ? 0.14 : 0.2} color={sign.type === 'speed' ? '#cc0000' : '#ffffff'} anchorX="center">
            {sign.text}
          </Text>
        </group>
      ))}
    </group>
  );
}


// Neon Signs for shops
function NeonSigns({ isNight }) {
  const signs = [
    { x: -26, z: -12, text: 'CAFÉ', color: '#FF6B6B' },
    { x: -20, z: -12, text: 'SHOP', color: '#4ECDC4' },
    { x: -14, z: -12, text: 'BAR', color: '#FFE66D' },
    { x: 20, z: -12, text: 'HOTEL', color: '#AA96DA' },
    { x: 26, z: -12, text: 'BANK', color: '#95E1D3' }
  ];
  
  return (
    <group>
      {signs.map((sign, i) => (
        <group key={i} position={[sign.x, 3, sign.z]}>
          <Text 
            fontSize={0.4} 
            color={sign.color}
            anchorX="center"
          >
            {sign.text}
          </Text>
        </group>
      ))}
    </group>
  );
}

// ─── RAILWAY TUNNELS — Entrées/Sorties PREMIUM avec 4 voies ──────────────
function PremiumTunnelPortal({ position, rotation, side }) {
  const lightsRef = useRef([]);
  const glowRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    lightsRef.current.forEach((light, i) => {
      if (light) {
        light.material.emissiveIntensity = 2.5 + Math.sin(t * 2 + i * 0.8) * 1.2;
      }
    });
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.06 + Math.sin(t * 1.5) * 0.03;
    }
  });
  
  // toStation = direction toward station center (x=0)
  // intoMtn = direction the tunnel tube extends (away from station)
  const toStation = side === 'left' ? 1 : -1;
  const intoMtn = -toStation;
  
  const depth = 16;
  const approachLength = 6.5;
  const tW = 16;    // tunnel width (z-axis, covers all tracks)
  const tH = 7;     // tunnel height
  const halfW = tW / 2;
  const halfH = tH / 2;
  const tunnelRadius = 5.5;
  const tunnelCenterY = 4.25;
  // Entrance face x-position (facing station)
  const fX = toStation * 2.5;
  const outerTubeGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(intoMtn * depth * 0.45, 0.25, 0),
      new THREE.Vector3(intoMtn * depth, 0, 0),
    ]);

    return new THREE.TubeGeometry(curve, 42, tunnelRadius + 0.45, 28, false);
  }, [depth, intoMtn, tunnelRadius]);
  const innerTubeGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(intoMtn * depth * 0.45, 0.25, 0),
      new THREE.Vector3(intoMtn * depth, 0, 0),
    ]);

    return new THREE.TubeGeometry(curve, 42, tunnelRadius, 28, false);
  }, [depth, intoMtn, tunnelRadius]);
  
  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* ═══ URBAN CONCRETE STRUCTURE (remplace les montagnes) ═══ */}
      {/* Murs de soutènement béton autour du tunnel - déplacés hors des voies (z > 12) */}
      <mesh position={[fX + intoMtn * 3, 4, -(halfW + 5)]}>
        <boxGeometry args={[8, 8, 2.5]} />
        <meshStandardMaterial color="#606468" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[fX + intoMtn * 3, 4, (halfW + 5)]}>
        <boxGeometry args={[8, 8, 2.5]} />
        <meshStandardMaterial color="#606468" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Dalle de couverture tunnel */}
      <mesh position={[fX + intoMtn * 6, tH + 1.5, 0]}>
        <boxGeometry args={[14, 1.2, tW + 6]} />
        <meshStandardMaterial color="#707478" roughness={0.8} metalness={0.12} />
      </mesh>
      
      {/* ═══ FACADE STONE WALL (around opening) ═══ */}
      {/* Top section above tunnel */}
      <mesh position={[fX, tH + 2.5, 0]}>
        <boxGeometry args={[5, 5, tW + 8]} />
        <meshStandardMaterial color="#404050" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Left pillar - poussé hors des voies (au-delà z > 12) */}
      <mesh position={[fX, halfH, -(halfW + 5)]}>
        <boxGeometry args={[5, tH, 4]} />
        <meshStandardMaterial color="#404050" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Right pillar - poussé hors des voies (au-delà z > 12) */}
      <mesh position={[fX, halfH, (halfW + 5)]}>
        <boxGeometry args={[5, tH, 4]} />
        <meshStandardMaterial color="#404050" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* ═══ ENTRANCE ARCH FRAME (Gold Premium) ═══ */}
      <mesh position={[fX + toStation * 0.1, tH + 0.15, 0]}>
        <boxGeometry args={[0.4, 0.6, tW + 0.6]} />
        <meshStandardMaterial color="#B8860B" emissive="#B8860B" emissiveIntensity={0.4} metalness={0.85} />
      </mesh>
      {/* Cadres dorés HORS des voies - déplacés au-delà de z=10 */}
      <mesh position={[fX + toStation * 0.1, halfH, -(halfW + 2)]}>
        <boxGeometry args={[0.4, tH, 0.4]} />
        <meshStandardMaterial color="#B8860B" emissive="#B8860B" emissiveIntensity={0.4} metalness={0.85} />
      </mesh>
      <mesh position={[fX + toStation * 0.1, halfH, (halfW + 2)]}>
        <boxGeometry args={[0.4, tH, 0.4]} />
        <meshStandardMaterial color="#B8860B" emissive="#B8860B" emissiveIntensity={0.4} metalness={0.85} />
      </mesh>

      {/* ═══ APPROACH CUT / PRE-PORTAL STRUCTURE ═══ */}
      <mesh position={[fX + toStation * (approachLength / 2 + 1.4), 0.06, 0]}>
        <boxGeometry args={[approachLength, 0.12, tW + 2.2]} />
        <meshStandardMaterial color="#5f625f" roughness={0.92} />
      </mesh>
      <mesh position={[fX + toStation * (approachLength / 2 + 1.6), 0.12, 0]}>
        <boxGeometry args={[approachLength - 0.3, 0.04, tW - 0.3]} />
        <meshStandardMaterial color="#30353e" roughness={0.94} />
      </mesh>
      {/* Murs latéraux HORS des voies - z > 10 et z < -2 pour dégager le passage */}
      <mesh position={[fX + toStation * (approachLength / 2 + 1.25), 1.15, -(halfW + 2.5)]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[approachLength + 0.4, 2.5, 1.4]} />
        <meshStandardMaterial color="#555868" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[fX + toStation * (approachLength / 2 + 1.25), 1.15, (halfW + 2.5)]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[approachLength + 0.4, 2.5, 1.4]} />
        <meshStandardMaterial color="#555868" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[fX + toStation * (approachLength / 2 + 1.9), 2.7, -(halfW + 3.5)]} rotation={[0, 0, -0.34]}>
        <boxGeometry args={[approachLength - 0.4, 2.2, 1.5]} />
        <meshStandardMaterial color="#3a4637" roughness={0.95} />
      </mesh>
      <mesh position={[fX + toStation * (approachLength / 2 + 1.9), 2.7, (halfW + 3.5)]} rotation={[0, 0, 0.34]}>
        <boxGeometry args={[approachLength - 0.4, 2.2, 1.5]} />
        <meshStandardMaterial color="#3a4637" roughness={0.95} />
      </mesh>
      <mesh position={[fX + toStation * 1.4, tH - 0.15, 0]}>
        <boxGeometry args={[2.8, 0.34, tW + 1.5]} />
        <meshStandardMaterial color="#2d313a" roughness={0.54} metalness={0.18} />
      </mesh>
      {/* Piliers EXTERNES au passage des voies - déplacés hors de la zone z=0-12 */}
      <mesh position={[fX + toStation * 0.65, halfH, -(halfW + 1.5)]}>
        <boxGeometry args={[1.1, tH - 0.7, 0.55]} />
        <meshStandardMaterial color="#2a2f37" roughness={0.76} />
      </mesh>
      <mesh position={[fX + toStation * 0.65, halfH, (halfW + 1.5)]}>
        <boxGeometry args={[1.1, tH - 0.7, 0.55]} />
        <meshStandardMaterial color="#2a2f37" roughness={0.76} />
      </mesh>
      
      {/* ═══ LED STRIPS AROUND ENTRANCE ═══ */}
      <mesh ref={el => lightsRef.current[0] = el} position={[fX + toStation * 0.2, tH + 0.55, 0]}>
        <boxGeometry args={[0.08, 0.1, tW + 1]} />
        <meshStandardMaterial color="#00D2BE" emissive="#00D2BE" emissiveIntensity={3} />
      </mesh>
      {/* LED verticales déplacées hors des voies */}
      <mesh ref={el => lightsRef.current[1] = el} position={[fX + toStation * 0.2, halfH, -(halfW + 2)]}>
        <boxGeometry args={[0.08, tH + 0.6, 0.1]} />
        <meshStandardMaterial color="#00D2BE" emissive="#00D2BE" emissiveIntensity={3} />
      </mesh>
      <mesh ref={el => lightsRef.current[2] = el} position={[fX + toStation * 0.2, halfH, (halfW + 2)]}>
        <boxGeometry args={[0.08, tH + 0.6, 0.1]} />
        <meshStandardMaterial color="#00D2BE" emissive="#00D2BE" emissiveIntensity={3} />
      </mesh>
      
      {/* ═══ TUNNEL INTERIOR TUBE (VISIBLE DEPTH) ═══ */}
      <mesh geometry={outerTubeGeometry} position={[fX, tunnelCenterY, 0]}>
        <meshStandardMaterial color="#3f4652" roughness={0.86} metalness={0.12} />
      </mesh>
      <mesh geometry={innerTubeGeometry} position={[fX, tunnelCenterY, 0]}>
        <meshStandardMaterial color="#0d111a" roughness={0.92} metalness={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Floor - separate ballast bed so the tube never looks like a flat wall */}
      <mesh position={[fX + intoMtn * (depth / 2), 0.04, 0]}>
        <boxGeometry args={[depth + 0.6, 0.08, tW - 0.2]} />
        <meshStandardMaterial color="#252833" roughness={0.95} />
      </mesh>
      <mesh position={[fX + intoMtn * (depth / 2), 0.08, 0]}>
        <boxGeometry args={[depth - 0.2, 0.03, tW - 1.2]} />
        <meshStandardMaterial color="#141922" roughness={0.9} />
      </mesh>

      {/* Service conduits hugging the tube walls */}
      {[-halfW + 0.45, halfW - 0.45].map((zOffset, conduitIndex) => (
        <mesh key={`conduit-${conduitIndex}`} position={[fX + intoMtn * (depth / 2), tunnelCenterY + 1.55, zOffset]}>
          <boxGeometry args={[depth - 1.2, 0.12, 0.12]} />
          <meshStandardMaterial color="#56606f" metalness={0.45} roughness={0.42} />
        </mesh>
      ))}

      {/* Interior support ribs (arched, realistic) */}
      {[2.5, 5.5, 8.5, 11.5, 14.5].map((d, i) => (
        <mesh key={`rib-${i}`} position={[fX + intoMtn * d, tunnelCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[tunnelRadius + 0.18, tunnelRadius + 0.18, 0.28, 28, 1, true]} />
          <meshStandardMaterial color="#4c5560" roughness={0.72} metalness={0.18} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ═══ INTERIOR CEILING LIGHTS (emissive only) ═══ */}
      {[2, 4.5, 7.5, 10.5, 13.5].map((d, i) => (
        <group key={`clight-${i}`}>
          <mesh position={[fX + intoMtn * d, tunnelCenterY + tunnelRadius - 0.24, 0]}>
            <boxGeometry args={[0.55, 0.1, 0.9]} />
            <meshStandardMaterial color="#FFCC66" emissive="#FFCC66" emissiveIntensity={Math.max(0.7, 2 - i * 0.25)} />
          </mesh>
          <mesh position={[fX + intoMtn * d, 1.15, -(halfW - 0.3)]}>
            <boxGeometry args={[0.24, 0.12, 0.06]} />
            <meshStandardMaterial color="#00D2BE" emissive="#00D2BE" emissiveIntensity={1.4} />
          </mesh>
          <mesh position={[fX + intoMtn * d, 1.15, (halfW - 0.3)]}>
            <boxGeometry args={[0.24, 0.12, 0.06]} />
            <meshStandardMaterial color="#00D2BE" emissive="#00D2BE" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}

      {/* Deep tunnel end to sell disappearance */}
      <mesh position={[fX + intoMtn * depth, tunnelCenterY, 0]}>
        <circleGeometry args={[tunnelRadius - 0.45, 32]} />
        <meshBasicMaterial color="#020406" />
      </mesh>

      {/* Entrance edge lights along the trench - déplacées hors des voies */}
      {[-halfW - 3, halfW + 3].map((zEdge, edgeIndex) => (
        <group key={`edge-light-${edgeIndex}`} position={[fX + toStation * (approachLength / 2 + 1.4), 0.16, zEdge]}>
          <mesh>
            <boxGeometry args={[approachLength - 0.4, 0.05, 0.08]} />
            <meshStandardMaterial color="#ffd36a" emissive="#ffd36a" emissiveIntensity={1.3} />
          </mesh>
        </group>
      ))}
      
      {/* ═══ WARM GLOW AT ENTRANCE ═══ */}
      <mesh ref={glowRef} position={[fX, halfH, 0]} rotation={[0, toStation > 0 ? 0 : Math.PI, 0]}>
        <planeGeometry args={[tW, tH]} />
        <meshBasicMaterial color="#FFE4B5" transparent opacity={0.06} side={2} />
      </mesh>
      
      {/* ═══ SIGNAL LIGHTS PER TRACK ═══ */}
      {[-3.75, -1.25, 1.25, 3.75].map((tz, i) => (
        <group key={`sig-${i}`}>
          <mesh position={[fX + toStation * 0.3, tH + 1.2, tz]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#00FF00" : "#FF4444"} 
              emissive={i % 2 === 0 ? "#00FF00" : "#FF4444"} 
              emissiveIntensity={4} 
            />
          </mesh>
          
          {/* Track number */}
          <group position={[fX + toStation * 0.3, tH + 2.5, tz]}>
            <mesh>
              <boxGeometry args={[0.5, 0.7, 0.12]} />
              <meshStandardMaterial color="#1a1a2a" metalness={0.7} />
            </mesh>
            <Text 
              position={[side === 'left' ? 0.08 : -0.08, 0, 0]} 
              fontSize={0.45} 
              color="#FFD700" 
              anchorX="center" 
              anchorY="middle" 
              fontWeight="bold"
              rotation={[0, side === 'left' ? Math.PI/2 : -Math.PI/2, 0]}
            >
              {i + 1}
            </Text>
          </group>
          {/* Ground entry lights per track */}
          <mesh position={[fX + toStation * 0.5, 0.08, tz - 0.8]}>
            <boxGeometry args={[0.25, 0.08, 0.25]} />
            <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={3} />
          </mesh>
          <mesh position={[fX + toStation * 0.5, 0.08, tz + 0.8]}>
            <boxGeometry args={[0.25, 0.08, 0.25]} />
            <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={3} />
          </mesh>
        </group>
      ))}
      
      {/* ═══ TUNNEL NAME SIGN ═══ */}
      <group position={[fX + toStation * 0.5, tH + 4.5, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 1.5, 8]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.6} />
        </mesh>
        <Text 
          position={[toStation * 0.35, 0, 0]} 
          fontSize={0.9} 
          color="#00FFFF" 
          anchorX="center" 
          rotation={[0, side === 'left' ? Math.PI/2 : -Math.PI/2, 0]}
        >
          {side === 'left' ? 'TUNNEL OUEST' : 'TUNNEL EST'}
        </Text>
      </group>
      
      {/* ═══ ENTRANCE GLOW ═══ */}
      <mesh position={[fX + toStation * 8, 14, 0]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="#FFE4B5" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function RailwayTunnels() {
  // Track Z positions for 4 tracks
  const trackPositions = [2, 4.5, 7, 9.5];
  
  return (
    <group>
      {/* LEFT TUNNEL - pushed far away to preserve the grand station framing */}
      <PremiumTunnelPortal position={[-42, 0, 5.75]} side="left" />
      
      {/* RIGHT TUNNEL - pushed far away to preserve the grand station framing */}
      <PremiumTunnelPortal position={[42, 0, 5.75]} side="right" />
      
      {/* ═══ EXTENDED TRACKS TO TUNNELS ═══ */}
      {trackPositions.map((z, trackIdx) => (
        <group key={`extended-track-${trackIdx}`}>
          {/* Rails extending to LEFT tunnel */}
          {[-0.35, 0.35].map((offset, i) => (
            <mesh key={`left-rail-${trackIdx}-${i}`} position={[-33, 0.03, z + offset]}>
              <boxGeometry args={[20, 0.1, 0.08]} />
              <meshStandardMaterial color="#707070" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Rails extending to RIGHT tunnel */}
          {[-0.35, 0.35].map((offset, i) => (
            <mesh key={`right-rail-${trackIdx}-${i}`} position={[33, 0.03, z + offset]}>
              <boxGeometry args={[20, 0.1, 0.08]} />
              <meshStandardMaterial color="#707070" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Sleepers to LEFT tunnel — gris béton */}
          {[...Array(24)].map((_, i) => (
            <mesh key={`sleeper-left-${trackIdx}-${i}`} position={[-21 - i * 0.9, 0.01, z]}>
              <boxGeometry args={[0.25, 0.06, 1.4]} />
              <meshStandardMaterial color="#808890" roughness={0.8} />
            </mesh>
          ))}
          {/* Sleepers to RIGHT tunnel — gris béton */}
          {[...Array(24)].map((_, i) => (
            <mesh key={`sleeper-right-${trackIdx}-${i}`} position={[21 + i * 0.9, 0.01, z]}>
              <boxGeometry args={[0.25, 0.06, 1.4]} />
              <meshStandardMaterial color="#808890" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* ═══ OVERHEAD CATENARY (Electric wires) - POLES ON SIDES ═══ */}
      {[-30, 30].map((x, j) => (
        <group key={`catenary-poles-${j}`}>
          {/* Poles on the OUTSIDE of tracks - not on rails */}
          {[0, 11].map((zOffset, side) => (
            <group key={`pole-${j}-${side}`} position={[x, 0, zOffset]}>
              {/* Pole */}
              <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.1, 0.12, 8, 8]} />
                <meshStandardMaterial color="#eef4f7" metalness={0.55} roughness={0.16} />
              </mesh>
              {/* Horizontal arm spanning across tracks */}
              <mesh position={[0, 8.2, side === 0 ? 5.5 : -5.5]}>
                <boxGeometry args={[0.15, 0.15, 12]} />
                <meshStandardMaterial color="#eef4f7" roughness={0.18} metalness={0.24} />
              </mesh>
              {/* Wire support */}
              <mesh position={[0, 7.5, side === 0 ? 2 : -2]}>
                <boxGeometry args={[0.05, 1.5, 0.05]} />
                <meshStandardMaterial color="#eef4f7" roughness={0.18} metalness={0.24} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function TransitOverpassAndUnderpass({ isNight }) {
  const neonRef = useRef();
  
  useFrame(({ clock }) => {
    // Animate RGB neon color cycling
    if (neonRef.current) {
      const t = clock.getElapsedTime();
      neonRef.current.children.forEach((child, i) => {
        if (child.material && child.material.emissive) {
          const hue = ((t * 0.15 + i * 0.1) % 1);
          child.material.emissive.setHSL(hue, 1, 0.5);
          child.material.color.setHSL(hue, 1, 0.5);
          child.material.emissiveIntensity = isNight ? 4 : 1.5;
        }
      });
    }
  });

  return (
    <group>
      {/* Main aerial bridge connecting front plaza to rear park */}
      <group position={[0, 0, 4.5]}>
        <mesh position={[0, 4.2, 7.2]}>
          <boxGeometry args={[6, 0.26, 26]} />
          <meshStandardMaterial color={isNight ? "#1a2030" : "#f4f7fa"} roughness={0.22} metalness={0.1} />
        </mesh>
        {[-2.6, 2.6].map((x, i) => (
          <mesh key={`bridge-rail-${i}`} position={[x, 5.05, 7.2]}>
            <boxGeometry args={[0.12, 1.4, 26]} />
            <meshPhysicalMaterial color={isNight ? "#1a3040" : "#d8f4ff"} transmission={0.82} roughness={0.06} thickness={0.18} transparent opacity={isNight ? 0.7 : 0.56} />
          </mesh>
        ))}
        
        {/* ═══ RGB NEON STRIPS — Main Bridge ═══ */}
        <group ref={neonRef}>
          {/* Bottom edge neons — left */}
          <mesh position={[-3, 4.05, 7.2]}>
            <boxGeometry args={[0.06, 0.06, 26]} />
            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={isNight ? 4 : 1.5} />
          </mesh>
          {/* Bottom edge neons — right */}
          <mesh position={[3, 4.05, 7.2]}>
            <boxGeometry args={[0.06, 0.06, 26]} />
            <meshStandardMaterial color="#FF00FF" emissive="#FF00FF" emissiveIntensity={isNight ? 4 : 1.5} />
          </mesh>
          {/* Top rail neons — left */}
          <mesh position={[-2.6, 5.8, 7.2]}>
            <boxGeometry args={[0.06, 0.06, 26]} />
            <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={isNight ? 3 : 1} />
          </mesh>
          {/* Top rail neons — right */}
          <mesh position={[2.6, 5.8, 7.2]}>
            <boxGeometry args={[0.06, 0.06, 26]} />
            <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={isNight ? 3 : 1} />
          </mesh>
          {/* Underside center glow */}
          <mesh position={[0, 3.95, 7.2]}>
            <boxGeometry args={[5.5, 0.04, 25]} />
            <meshStandardMaterial color="#4466ff" emissive="#4466ff" emissiveIntensity={isNight ? 1.5 : 0.3} transparent opacity={isNight ? 0.4 : 0.15} />
          </mesh>
        </group>
        
        {[-1.95, 1.95].map((x, i) => (
          <mesh key={`bridge-inner-rail-${i}`} position={[x, 4.65, 7.2]}>
            <boxGeometry args={[0.06, 0.6, 24]} />
            <meshPhysicalMaterial color={isNight ? "#1a3040" : "#d8f4ff"} transmission={0.75} roughness={0.06} thickness={0.1} transparent opacity={0.35} />
          </mesh>
        ))}
        {[-2.4, 2.4].map((x, i) => (
          <mesh key={`bridge-post-${i}`} position={[x, 2.05, -4.8]}>
            <boxGeometry args={[0.18, 4.1, 0.18]} />
            <meshStandardMaterial color={isNight ? "#2a3040" : "#edf3f7"} metalness={0.34} roughness={0.16} />
          </mesh>
        ))}
        {[-2.4, 2.4].map((x, i) => (
          <mesh key={`bridge-post-rear-${i}`} position={[x, 2.05, 19.4]}>
            <boxGeometry args={[0.18, 4.1, 0.18]} />
            <meshStandardMaterial color={isNight ? "#2a3040" : "#edf3f7"} metalness={0.34} roughness={0.16} />
          </mesh>
        ))}
        {/* Stairs rear — côté SUD, loin des voies */}
        {[...Array(12)].map((_, i) => (
          <mesh key={`rear-step-${i}`} position={[0, 4.1 - i * 0.35, 19.8 - i * 0.24]}>
            <boxGeometry args={[4.4, 0.08, 0.24]} />
            <meshStandardMaterial color={isNight ? "#2a3040" : "#e6ecef"} roughness={0.36} />
          </mesh>
        ))}
        {[-2.2, 2.2].map((x, si) => (
          <mesh key={`rear-glass-side-${si}`} position={[x, 2.67, 18.48]} rotation={[0.97, 0, 0]}>
            <boxGeometry args={[0.06, 1.1, 4.7]} />
            <meshPhysicalMaterial color="#d8f4ff" transmission={0.85} roughness={0.05} thickness={0.08} transparent opacity={0.3} side={2} />
          </mesh>
        ))}
        {[-2.2, 2.2].map((x, railSide) => (
          <group key={`rear-rail-${railSide}`} position={[x, 2.3, 18.5]}>
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[0.08, 1.0, 3.0]} />
              <meshPhysicalMaterial color="#d8f4ff" transmission={0.82} roughness={0.06} thickness={0.1} transparent opacity={0.35} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === PASSERELLE LATERALE GAUCHE with RGB NEON === */}
      <group position={[-15, 0, 4.5]}>
        <mesh position={[0, 4.0, 5.5]}>
          <boxGeometry args={[4, 0.22, 16]} />
          <meshStandardMaterial color={isNight ? "#1a2030" : "#edf3f7"} roughness={0.25} metalness={0.12} />
        </mesh>
        {/* RGB Neon strips — left footbridge */}
        {[-2, 2].map((x, i) => (
          <mesh key={`left-neon-${i}`} position={[x, 3.88, 5.5]}>
            <boxGeometry args={[0.05, 0.05, 16]} />
            <meshStandardMaterial color={i === 0 ? "#FF0066" : "#00CCFF"} emissive={i === 0 ? "#FF0066" : "#00CCFF"} emissiveIntensity={isNight ? 4 : 1.5} />
          </mesh>
        ))}
        {[-2, 2].map((x, i) => (
          <mesh key={`left-neon-top-${i}`} position={[x, 4.75, 5.5]}>
            <boxGeometry args={[0.04, 0.04, 16]} />
            <meshStandardMaterial color={i === 0 ? "#AAFF00" : "#FF8800"} emissive={i === 0 ? "#AAFF00" : "#FF8800"} emissiveIntensity={isNight ? 3 : 1} />
          </mesh>
        ))}
        {/* Underside glow */}
        <mesh position={[0, 3.85, 5.5]}>
          <boxGeometry args={[3.5, 0.03, 15]} />
          <meshStandardMaterial color="#6633ff" emissive="#6633ff" emissiveIntensity={isNight ? 1.2 : 0.3} transparent opacity={isNight ? 0.35 : 0.1} />
        </mesh>
        {[-1.7, 1.7].map((x, i) => (
          <mesh key={`left-fb-rail-${i}`} position={[x, 4.7, 5.5]}>
            <boxGeometry args={[0.1, 1.2, 16]} />
            <meshPhysicalMaterial color={isNight ? "#1a3040" : "#d0eaf5"} transmission={0.75} roughness={0.08} thickness={0.15} transparent opacity={0.5} />
          </mesh>
        ))}
        {[-1.5, 1.5].map((x, pi) => 
          [-2, 6, 13].map((z, zi) => (
            <mesh key={`left-fb-pil-${pi}-${zi}`} position={[x, 1.9, z]}>
              <cylinderGeometry args={[0.12, 0.15, 3.8, 8]} />
              <meshStandardMaterial color={isNight ? "#2a3040" : "#d0d8e0"} metalness={0.4} roughness={0.2} />
            </mesh>
          ))
        )}
      </group>

      {/* === PASSERELLE LATERALE DROITE with RGB NEON === */}
      <group position={[15, 0, 4.5]}>
        <mesh position={[0, 4.0, 5.5]}>
          <boxGeometry args={[4, 0.22, 16]} />
          <meshStandardMaterial color={isNight ? "#1a2030" : "#edf3f7"} roughness={0.25} metalness={0.12} />
        </mesh>
        {/* RGB Neon strips — right footbridge */}
        {[-2, 2].map((x, i) => (
          <mesh key={`right-neon-${i}`} position={[x, 3.88, 5.5]}>
            <boxGeometry args={[0.05, 0.05, 16]} />
            <meshStandardMaterial color={i === 0 ? "#00FFAA" : "#FF44CC"} emissive={i === 0 ? "#00FFAA" : "#FF44CC"} emissiveIntensity={isNight ? 4 : 1.5} />
          </mesh>
        ))}
        {[-2, 2].map((x, i) => (
          <mesh key={`right-neon-top-${i}`} position={[x, 4.75, 5.5]}>
            <boxGeometry args={[0.04, 0.04, 16]} />
            <meshStandardMaterial color={i === 0 ? "#FFCC00" : "#00AAFF"} emissive={i === 0 ? "#FFCC00" : "#00AAFF"} emissiveIntensity={isNight ? 3 : 1} />
          </mesh>
        ))}
        {/* Underside glow */}
        <mesh position={[0, 3.85, 5.5]}>
          <boxGeometry args={[3.5, 0.03, 15]} />
          <meshStandardMaterial color="#ff3366" emissive="#ff3366" emissiveIntensity={isNight ? 1.2 : 0.3} transparent opacity={isNight ? 0.35 : 0.1} />
        </mesh>
        {[-1.7, 1.7].map((x, i) => (
          <mesh key={`right-fb-rail-${i}`} position={[x, 4.7, 5.5]}>
            <boxGeometry args={[0.1, 1.2, 16]} />
            <meshPhysicalMaterial color={isNight ? "#1a3040" : "#d0eaf5"} transmission={0.75} roughness={0.08} thickness={0.15} transparent opacity={0.5} />
          </mesh>
        ))}
        {[-1.5, 1.5].map((x, pi) =>
          [-2, 6, 13].map((z, zi) => (
            <mesh key={`right-fb-pil-${pi}-${zi}`} position={[x, 1.9, z]}>
              <cylinderGeometry args={[0.12, 0.15, 3.8, 8]} />
              <meshStandardMaterial color={isNight ? "#2a3040" : "#d0d8e0"} metalness={0.4} roughness={0.2} />
            </mesh>
          ))
        )}
      </group>

      {/* Underpass entrances */}
      {[-18, 18].map((x, i) => (
        <group key={`underpass-${i}`} position={[x, 0, 16.2]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[3.2, 0.8, 4.2]} />
            <meshStandardMaterial color="#d9e1e8" roughness={0.3} metalness={0.12} />
          </mesh>
          <mesh position={[0, 1.45, -1.6]}>
            <boxGeometry args={[2.2, 1.8, 0.14]} />
            <meshStandardMaterial color="#bde9f5" transparent opacity={0.32} metalness={0.7} roughness={0.08} />
          </mesh>
          {[-1.75, 1.75].map((offset, railSide) => (
            <mesh key={`underpass-rail-${railSide}`} position={[offset, 0.75, -0.1]}>
              <boxGeometry args={[0.08, 1.5, 3.4]} />
              <meshStandardMaterial color="#f8fbfd" roughness={0.18} metalness={0.18} />
            </mesh>
          ))}
          <Text position={[0, 0.95, 1.3]} fontSize={0.2} color="#163042" anchorX="center">PASSAGE</Text>
        </group>
      ))}
    </group>
  );
}

// ─── Boarding/Alighting Passengers at Station ──────────────
function BoardingPassengers({ trainStopped, trainPosition }) {
  const passengerRefs = useRef([]);
  const groupRef = useRef();
  const passengerStates = useMemo(() => {
    const colors = ['#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#f39c12', '#00d4aa', '#f1c40f', '#e91e63', '#ff8c00', '#00ced1'];
    const skins = ['#FDBCB4', '#DEB887', '#C68642', '#8D5524', '#F5DEB3', '#D2B48C', '#CD853F', '#E8BEAC'];
    const hairs = ['#1a1a1a', '#4a3728', '#8B4513', '#5c3317', '#FFD700', '#C0C0C0', '#2c1810', '#8B0000'];
    return [...Array(120)].map((_, i) => ({
      x: -12 + (i % 12) * 2.0,
      z: 0.8 + Math.floor(i / 12) * 0.08,
      targetX: -6 + (i % 12) * 0.95,
      boarding: i % 3 !== 0,
      color: colors[i % colors.length],
      skinTone: skins[i % skins.length],
      hair: hairs[i % hairs.length],
    }));
  }, []);
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    groupRef.current.visible = trainStopped;
    if (!trainStopped) return;

    const t = clock.getElapsedTime();
    passengerRefs.current.forEach((passengerRef, i) => {
      if (!passengerRef) return;

      const passenger = passengerStates[i];
      const phase = (t * 0.18 + i * 0.22) % 1;
      const fromX = passenger.boarding ? passenger.x : trainPosition + 0.8 - i * 0.18;
      const toX = passenger.boarding ? trainPosition - 0.8 + i * 0.2 : passenger.targetX;

      passengerRef.position.x = THREE.MathUtils.lerp(fromX, toX, phase);
      passengerRef.position.y = 0.06 + Math.abs(Math.sin(t * 5 + i)) * 0.015;
      passengerRef.position.z = passenger.z + 0.3 + Math.sin(t * 3 + i) * 0.04;
    });
  });
  
  return (
    <group ref={groupRef} visible={trainStopped}>
      {passengerStates.map((p, i) => (
        <group key={i} ref={(element) => { passengerRefs.current[i] = element; }} position={[p.x, 0.2, p.z + 0.3]}>
          <mesh position={[-0.04, 0.15, 0]}>
            <capsuleGeometry args={[0.028, 0.22, 4, 8]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.52} />
          </mesh>
          <mesh position={[0.04, 0.15, 0]}>
            <capsuleGeometry args={[0.028, 0.22, 4, 8]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.52} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <capsuleGeometry args={[0.085, 0.2, 4, 10]} />
            <meshStandardMaterial color={p.color} />
          </mesh>
          <mesh position={[0, 0.78, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={p.skinTone} />
          </mesh>
          <mesh position={[0, 0.83, -0.01]}>
            <sphereGeometry args={[0.082, 10, 10, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
            <meshStandardMaterial color={p.hair} roughness={0.6} />
          </mesh>
          <mesh position={[0.09, 0.43, 0.02]} rotation={[0.2, 0, -0.2]}>
            <capsuleGeometry args={[0.018, 0.13, 4, 8]} />
            <meshStandardMaterial color={p.skinTone} roughness={0.4} />
          </mesh>
          <mesh position={[-0.09, 0.43, 0.02]} rotation={[0.2, 0, 0.2]}>
            <capsuleGeometry args={[0.018, 0.13, 4, 8]} />
            <meshStandardMaterial color={p.skinTone} roughness={0.4} />
          </mesh>
          {/* Luggage for boarding passengers */}
          {p.boarding && (
            <mesh position={[0.15, 0.15, 0]}>
              <boxGeometry args={[0.13, 0.2, 0.09]} />
              <meshStandardMaterial color="#2a2a3a" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// ─── PREMIUM RECTANGULAR CONCRETE FOUNTAIN ──────────────
function PremiumFountain({ isNight }) {
  const waterRef = useRef();
  const jetRefs = useRef([]);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Animate water surface
    if (waterRef.current) {
      waterRef.current.position.y = 0.35 + Math.sin(t * 1.5) * 0.02;
    }
    // Animate water jets
    jetRefs.current.forEach((jet, i) => {
      if (jet) {
        const phase = t * 2 + i * 0.8;
        jet.scale.y = 0.7 + Math.sin(phase) * 0.3;
        jet.position.y = 0.5 + jet.scale.y * 0.5;
      }
    });
  });

  return (
    <group position={[0, 0, 18]}>
      {/* Concrete base — large rectangular */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[12, 0.3, 5]} />
        <meshStandardMaterial color={isNight ? "#2a2a30" : "#808080"} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Raised edge / lip */}
      {[
        [0, 0.4, 2.5, 12, 0.2, 0.25],    // front
        [0, 0.4, -2.5, 12, 0.2, 0.25],   // back
        [-6, 0.4, 0, 0.25, 0.2, 5],      // left
        [6, 0.4, 0, 0.25, 0.2, 5],       // right
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={`lip-${i}`} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={isNight ? "#3a3a40" : "#909090"} roughness={0.8} />
        </mesh>
      ))}
      {/* Water surface */}
      <mesh ref={waterRef} position={[0, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11.5, 4.5]} />
        <meshStandardMaterial 
          color={isNight ? "#1a3050" : "#3a8aaa"}
          metalness={0.3} roughness={0.15}
          emissive={isNight ? "#0a2040" : "#2a6080"}
          emissiveIntensity={isNight ? 0.4 : 0.1}
          transparent opacity={0.85}
        />
      </mesh>
      
      {/* Water jets — 5 across the center */}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <group key={`jet-${i}`}>
          <mesh ref={el => jetRefs.current[i] = el} position={[x, 0.8, 0]}>
            <cylinderGeometry args={[0.04, 0.08, 1.2, 8]} />
            <meshStandardMaterial 
              color={isNight ? "#4aa8ff" : "#80d0f0"}
              emissive={isNight ? "#3388cc" : "#60b0d0"}
              emissiveIntensity={isNight ? 1.5 : 0.3}
              transparent opacity={0.6}
            />
          </mesh>
          {/* Splash at base */}
          <mesh position={[x, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.4, 12]} />
            <meshStandardMaterial 
              color="#80d0f0"
              emissive="#80d0f0"
              emissiveIntensity={isNight ? 0.8 : 0.2}
              transparent opacity={0.3}
            />
          </mesh>
        </group>
      ))}
      
      {/* LED accent lights under the lip */}
      {[-5, -3, -1, 1, 3, 5].map((x, i) => (
        <mesh key={`fountain-led-${i}`} position={[x, 0.32, 2.3]}>
          <boxGeometry args={[0.8, 0.04, 0.04]} />
          <meshStandardMaterial 
            color={['#00FFFF', '#FF00FF', '#00FF88', '#FFCC00', '#FF4488', '#4488FF'][i]}
            emissive={['#00FFFF', '#FF00FF', '#00FF88', '#FFCC00', '#FF4488', '#4488FF'][i]}
            emissiveIntensity={isNight ? 3 : 0.8}
          />
        </mesh>
      ))}
      
      {/* Benches on each side */}
      {[[-6.5, 3.5], [-6.5, -3.5], [6.5, 3.5], [6.5, -3.5]].map(([x, z], i) => (
        <group key={`bench-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.5, 0.08, 0.5]} />
            <meshStandardMaterial color={isNight ? "#0e3d5c" : "#1a5276"} roughness={0.5} />
          </mesh>
          {[-0.6, 0.6].map((bx, bi) => (
            <mesh key={bi} position={[bx, 0.12, 0]}>
              <boxGeometry args={[0.08, 0.24, 0.4]} />
              <meshStandardMaterial color={isNight ? "#2a2a30" : "#606060"} metalness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}


// ─── Train Depots & Hangars (ends of tracks) ──────────────
function TrainDepots() {
  return (
    <group>
      {/* Left depot hangar - DÉPLACÉ HORS DES VOIES (z < 0) */}
      <group position={[-30, 0, -8]}>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[10, 5, 8]} />
          <meshStandardMaterial color="#4a4a55" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Hangar roof */}
        <mesh position={[0, 5.2, 0]}>
          <boxGeometry args={[10.5, 0.25, 8.5]} />
          <meshStandardMaterial color="#3a3a44" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Door opening facing tracks */}
        <mesh position={[5.1, 1.8, 0]}>
          <boxGeometry args={[0.1, 3.5, 6]} />
          <meshStandardMaterial color="#1a1a22" metalness={0.8} />
        </mesh>
        {/* Windows */}
        {[-2, 0, 2].map((z, i) => (
          <mesh key={i} position={[-5.1, 3, z]}>
            <planeGeometry args={[1.2, 0.8]} />
            <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.5} transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <Text position={[0, 5.8, 0]} fontSize={0.4} color="#00FFFF" anchorX="center">DÉPÔT A</Text>
      </group>

      {/* Right depot hangar - DÉPLACÉ HORS DES VOIES (z > 12) */}
      <group position={[30, 0, 18]}>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[10, 5, 8]} />
          <meshStandardMaterial color="#4a5555" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <boxGeometry args={[10.5, 0.25, 8.5]} />
          <meshStandardMaterial color="#3a4444" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Door opening */}
        <mesh position={[-5.1, 1.8, 0]}>
          <boxGeometry args={[0.1, 3.5, 6]} />
          <meshStandardMaterial color="#1a1a22" metalness={0.8} />
        </mesh>
        {/* Windows */}
        {[-2, 0, 2].map((z, i) => (
          <mesh key={i} position={[5.1, 3, z]}>
            <planeGeometry args={[1.2, 0.8]} />
            <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.5} transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <Text position={[0, 5.8, 0]} fontSize={0.4} color="#FF00FF" anchorX="center">DÉPÔT B</Text>
      </group>

      {/* Maintenance workshop in the middle */}
      <group position={[6, 0, -5]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[7, 4, 5]} />
          <meshStandardMaterial color="#555566" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[0, 4.1, 0]}>
          <boxGeometry args={[7.5, 0.2, 5.5]} />
          <meshStandardMaterial color="#444455" metalness={0.5} />
        </mesh>
        {[-2, 0, 2].map((x, i) => (
          <mesh key={i} position={[x, 2.5, -2.6]}>
            <planeGeometry args={[1.5, 1]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.4} transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <Text position={[0, 4.5, 0]} fontSize={0.3} color="#FFD700" anchorX="center">ATELIER</Text>
      </group>

      {/* Freight cargo containers */}
      {[
        { x: -18, z: -3, color: '#DC143C' },
        { x: -15, z: -3, color: '#228B22' },
        { x: -12, z: -3, color: '#1E90FF' },
        { x: 12, z: -3, color: '#FF8C00' },
        { x: 15, z: -3, color: '#8B0082' },
        { x: 18, z: -3, color: '#20B2AA' },
      ].map((c, i) => (
        <mesh key={i} position={[c.x, 0.9, c.z]}>
          <boxGeometry args={[2.5, 1.8, 1.4]} />
          <meshStandardMaterial color={c.color} roughness={0.6} metalness={0.35} />
        </mesh>
      ))}

      {/* Road alongside the tracks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, -3.5]}>
        <planeGeometry args={[50, 4]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      {/* Road markings */}
      {[-10, -5, 0, 5, 10].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.11, -3.5]}>
          <planeGeometry args={[1.5, 0.12]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
// ═══ DOUBLE RIGHT-CLICK ZOOM — zoom instantané précis via double-clic droit ═══
function DoubleRightClickZoom({ controlsRef }) {
  const { camera, gl, raycaster, scene } = useThree();
  const lastRightClick = useRef(0);

  useEffect(() => {
    raycaster.far = 2000;
    const canvas = gl.domElement;
    const handleContextMenu = (e) => { e.preventDefault(); };
    const handleMouseDown = (e) => {
      if (e.button !== 2) return;
      const now = Date.now();
      if (now - lastRightClick.current < 400) {
        const rect = canvas.getBoundingClientRect();
        const mouse = {
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
        };
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          const hit = intersects[0].point;
          // Direction horizontale caméra → point (ignore Y)
          const dx = camera.position.x - hit.x;
          const dz = camera.position.z - hit.z;
          const hDist = Math.sqrt(dx * dx + dz * dz);
          const approachDist = 4;
          // Normaliser la direction horizontale
          const nx = hDist > 0.1 ? (dx / hDist) * approachDist : 0;
          const nz = hDist > 0.1 ? (dz / hDist) * approachDist : approachDist;
          // Toujours atterrir au niveau piéton
          camera.position.set(hit.x + nx, 1.7, hit.z + nz);
          if (controlsRef.current) {
            controlsRef.current.target.set(hit.x, Math.min(hit.y, 2.5), hit.z);
            controlsRef.current.update();
          }
        }
      }
      lastRightClick.current = now;
    };
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('mousedown', handleMouseDown);
    return () => {
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [camera, gl, raycaster, scene, controlsRef]);

  return null;
}

function TrainScene({ isNight, onTrainHorn, isMobile, shouldReduceParticles, shouldDisableHeavyEffects, preferFastDesktop }) {
  const controlsRef = useRef();
  const cameraRef = useRef();
  const [firstPersonActive, setFirstPersonActive] = useState(false);
  const defaultCamera = useMemo(() => ({
    position: isMobile ? [0, 10.4, 30.4] : [0, 14.1, 35.6],
    target: [0, 3.2, 20.2],
  }), [isMobile]);
  const streetCamera = useMemo(() => ({
    position: isMobile ? [0, 3.5, 28] : [0, 3.8, 30],
    target: [0, 2.5, 8],
  }), [isMobile]);
  const aerialCamera = useMemo(() => ({
    position: isMobile ? [0, 42, 20] : [0, 52, 22],
    target: [0, 0, 8],
  }), [isMobile]);
  const platformCamera = useMemo(() => ({
    position: isMobile ? [8, 4.2, 14] : [12, 5, 16],
    target: [0, 2.8, 6],
  }), [isMobile]);
  const cityCamera = useMemo(() => ({
    position: isMobile ? [-18, 12, 38] : [-24, 15, 42],
    target: [-8, 4, 12],
  }), [isMobile]);
  const rearCamera = useMemo(() => ({
    position: isMobile ? [0, 8, -6] : [0, 10, -10],
    target: [0, 4, 10],
  }), [isMobile]);
  // NOUVELLE VUE : Vue vers le SUD (immeubles derrière la fontaine)
  const southCityCamera = useMemo(() => ({
    position: isMobile ? [0, 12, 5] : [0, 16, 0],
    target: [0, 4, 50],
  }), [isMobile]);

  const animRef = useRef(null);

  const smoothTransition = useCallback((preset) => {
    if (!controlsRef.current || !cameraRef.current) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    const startPos = { x: cam.position.x, y: cam.position.y, z: cam.position.z };
    const endPos = { x: preset.position[0], y: preset.position[1], z: preset.position[2] };
    const startTarget = { x: ctrl.target.x, y: ctrl.target.y, z: ctrl.target.z };
    const endTarget = { x: preset.target[0], y: preset.target[1], z: preset.target[2] };
    const dist = Math.sqrt(
      (endPos.x - startPos.x) ** 2 + (endPos.y - startPos.y) ** 2 + (endPos.z - startPos.z) ** 2
    );
    const speed = dist > 40 ? 0.012 : dist > 15 ? 0.018 : 0.028;
    let progress = 0;
    const animate = () => {
      progress = Math.min(progress + speed, 1);
      const e = 1 - Math.pow(1 - progress, 3);
      cam.position.x = startPos.x + (endPos.x - startPos.x) * e;
      cam.position.y = startPos.y + (endPos.y - startPos.y) * e;
      cam.position.z = startPos.z + (endPos.z - startPos.z) * e;
      ctrl.target.x = startTarget.x + (endTarget.x - startTarget.x) * e;
      ctrl.target.y = startTarget.y + (endTarget.y - startTarget.y) * e;
      ctrl.target.z = startTarget.z + (endTarget.z - startTarget.z) * e;
      ctrl.update();
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  }, []);

  const applyTrainCameraPreset = useCallback((preset) => {
    smoothTransition(preset);
  }, [smoothTransition]);

  const applyDefaultTrainCamera = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    const [cx, cy, cz] = defaultCamera.position;
    const [tx, ty, tz] = defaultCamera.target;
    cameraRef.current.position.set(cx, cy, cz);
    controlsRef.current.target.set(tx, ty, tz);
    controlsRef.current.update();
    controlsRef.current.saveState();
  }, [defaultCamera]);

  const CameraController = () => {
    const { camera } = useThree();

    useEffect(() => {
      cameraRef.current = camera;
      applyDefaultTrainCamera();
    }, [camera, applyDefaultTrainCamera]);

    return null;
  };

  // État pour la rotation intro
  const [introRotationActive, setIntroRotationActive] = useState(false);
  const introProgressRef = useRef(0);

  // Composant de rotation panoramique au démarrage
  const IntroRotation = () => {
    const { camera } = useThree();
    
    useFrame((state, delta) => {
      if (!introRotationActive || !controlsRef.current) return;
      
      introProgressRef.current += delta * 0.15; // Vitesse de rotation
      
      if (introProgressRef.current >= Math.PI * 2) {
        // Rotation complète terminée
        setIntroRotationActive(false);
        applyDefaultTrainCamera();
        return;
      }
      
      const angle = introProgressRef.current;
      const radius = 45; // Distance du centre
      const height = 18; // Hauteur de la caméra
      const centerY = 5; // Point de focus vertical
      
      // Position de la caméra en rotation circulaire
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius + 10;
      camera.position.y = height + Math.sin(angle * 2) * 3; // Légère ondulation verticale
      
      // La caméra regarde toujours le centre de la gare
      controlsRef.current.target.set(0, centerY, 10);
      controlsRef.current.update();
    });
    
    return null;
  };

  useEffect(() => {
    window.resetTrainCamera = () => {
      applyDefaultTrainCamera();
    };
    window.setTrainStreetView = () => smoothTransition(streetCamera);
    window.setTrainAerialView = () => smoothTransition(aerialCamera);
    window.setTrainPlatformView = () => smoothTransition(platformCamera);
    window.setTrainCityView = () => smoothTransition(cityCamera);
    window.setTrainRearView = () => smoothTransition(rearCamera);
    window.setTrainSouthCityView = () => smoothTransition(southCityCamera);
    window.startFirstPersonWalk = () => setFirstPersonActive(true);
    return () => {
      delete window.resetTrainCamera;
      delete window.setTrainStreetView;
      delete window.setTrainAerialView;
      delete window.setTrainPlatformView;
      delete window.setTrainCityView;
      delete window.setTrainRearView;
      delete window.setTrainSouthCityView;
      delete window.startFirstPersonWalk;
    };
  }, [applyDefaultTrainCamera, smoothTransition, streetCamera, aerialCamera, platformCamera, cityCamera, rearCamera, southCityCamera]);

  const compactScene = shouldReduceParticles || shouldDisableHeavyEffects || preferFastDesktop;

  return (
    <>
      <CameraController />
      <IntroRotation />

      {/* Enhanced Lighting */}
      <ambientLight intensity={isNight ? 0.2 : 0.6} />
      <directionalLight position={[8, 12, -5]} intensity={isNight ? 0.38 : 1.5} castShadow color={isNight ? "#8ecae6" : "#ffe8cc"} />
      <directionalLight position={[-5, 8, 5]} intensity={isNight ? 0.22 : 0.5} color="#8ecae6" />
      <hemisphereLight groundColor={isNight ? "#1a1a2a" : "#3a4a5a"} intensity={isNight ? 0.28 : 0.5} />
      {isNight && <pointLight position={[0, 9, 13]} intensity={2.4} color="#66f3ff" distance={28} decay={2} />}
      {isNight && <pointLight position={[-15, 6, 10]} intensity={1.9} color="#ff67cf" distance={18} decay={2} />}
      {isNight && <pointLight position={[15, 6, 10]} intensity={1.9} color="#7aff8f" distance={18} decay={2} />}
      {isNight && <pointLight position={[0, 4, 18.2]} intensity={1.6} color="#ffd36a" distance={20} decay={2} />}
      
      {/* Sky */}
      <SkyBackdrop isNight={isNight} />
      {isNight && <Stars radius={200} depth={80} count={compactScene ? 1200 : 2200} factor={compactScene ? 4 : 5} fade speed={0.8} />}
      <fog attach="fog" args={[isNight ? '#0a1a2e' : '#87CEEB', 80, 250]} />
      
      {/* Ground - URBAN STYLE */}
      <Ground isMobile={isMobile} />
      <PedestrianWalkwayAmenities isNight={isNight} />
      
      {/* Mountains in background */}
      <Mountains isNight={isNight} />
      
      {/* Circuit routier urbain avec tramways */}
      {!isMobile && <UrbanCircuitRoads isNight={isNight} />}
      
      {/* Centre-ville — commerces, banque, métro, espaces verts */}
      {!isMobile && <DowntownDistrict isNight={isNight} />}
      
      {/* Clouds */}
      {!isMobile && !compactScene && <Clouds isNight={isNight} />}
      
      {/* Birds flying */}
      {!isMobile && !compactScene && <Birds isNight={isNight} />}
      
      {/* ═══ RAILWAY TUNNELS - 4 TRACKS ═══ */}
      <RailwayTunnels />
      
      {/* ═══ 4 RAILWAY TRACKS ═══ */}
      <Rails zPosition={2} />      {/* Voie 1 : Maglev Express */}
      <Rails zPosition={4.5} />    {/* Voie 2 : TGV */}
      <Rails zPosition={7} />      {/* Voie 3 : ICE */}
      <Rails zPosition={9.5} />    {/* Voie 4 : Freight */}
      
      {/* Railway signals */}
      <RailwaySignals />
      {!isMobile && <TrackSafetyBarriers isNight={isNight} />}

      {/* ═══ PREMIUM TRAINS ═══ */}
      
      {/* Voie 1: MAGLEV - Ultra rapide futuriste (blanc/bleu) */}
      <MaglevTrain railZ={2} speed={14} color="#E8E8E8" startX={-78} />
      
      {/* Voie 2: TGV - Arrêt en gare + couleurs dynamiques */}
      <AnimatedTGV railZ={4.5} startX={-72} onHorn={onTrainHorn} />
      
      {/* Voie 3: ICE - Train allemand premium (blanc/rouge) - Arrêt en gare */}
      <ICETrain railZ={7} speed={7} startX={62} />
      
      {/* Voie 4: FREIGHT - Train de marchandises (direction opposée) */}
      <FreightTrain railZ={9.5} speed={-4} startX={82} />
      
      {/* Station Building */}
      <StationBuilding />
      
      {/* Platform - étendu pour 4 voies */}
      <Platform isNight={isNight} />
      {!isMobile && <TicketControlGates isNight={isNight} />}
      {/* UndergroundPassage retiré — couvercles trop larges pour les quais étroits */}
      {!isMobile && <StationAgentsPatrol isMobile={isMobile} />}
      
      {/* ═══ PREMIUM 360° CITY ELEMENTS ═══ */}
      <CityBackground isNight={isNight} />
      {!isMobile && <ParkingCars />}
      {!isMobile && <MovingCars />}
      {!isMobile && <StreetLamps isNight={isNight} />}
      {!isMobile && <UrbanFurniture isNight={isNight} />}
      {!isMobile && <BridgeMovingWalkways isNight={isNight} />}
      {!isMobile && <BridgeSimpleRamps isNight={isNight} />}
      {!isMobile && <BridgeTransitScreens isNight={isNight} />}
      {!isMobile && <SouthParkScreens isNight={isNight} />}
      {!isMobile && <PremiumTransitAmenities isNight={isNight} />}
      {!isMobile && !compactScene && <PremiumBridgeLife isMobile={isMobile} />}
      {!isMobile && !compactScene && <CityPedestrians isNight={isNight} />}
      {!isMobile && !compactScene && <EscalatorCrowds isNight={isNight} />}
      {!isMobile && !compactScene && <StreetPedestrians isNight={isNight} />}
      {!isMobile && <CityVehicles isNight={isNight} />}
      {!isMobile && !compactScene && <UrbanRealism isNight={isNight} />}
      {!isMobile && !compactScene && <NeonSigns isNight={isNight} />}
      <FirstPersonWalkthrough isNight={isNight} active={firstPersonActive} onEnd={() => setFirstPersonActive(false)} />
      
      {/* NEW: Digital Departure Board */}
      {!isMobile && !compactScene && <DepartureBoard />}
      
      {/* NEW: Steam effects from trains */}
      {!isMobile && !compactScene && <SteamEffect position={[0, 1.2, 4.5]} />}
      {!isMobile && !compactScene && <SteamEffect position={[0, 1.2, 7]} />}
      
      {/* Enhanced Passengers on platform */}
      <Passengers isMobile={isMobile} />
      {!isMobile && !compactScene && <PremiumPlazaLife isMobile={isMobile} />}
      
      {/* Enhanced Platform lights */}
      <PlatformLights isNight={isNight} />
      <NightNeonAura isNight={isNight} />
      
      {/* Train depots and hangars at track ends */}
      <TrainDepots />
      
      {/* ═══ PREMIUM RECTANGULAR CONCRETE FOUNTAIN ═══ */}
      <PremiumFountain isNight={isNight} />
      
      {/* Legacy smoke (keeping for additional ambiance) */}
      {!compactScene && <SmokeParticles />}
      
      {/* OrbitControls - Extended range for FULL city exploration */}
      <DoubleRightClickZoom controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={240}
        maxPolarAngle={Math.PI * 0.48}
        minPolarAngle={0.05}
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.03}
        target={defaultCamera.target}
        rotateSpeed={1.45}
        zoomSpeed={1.8}
        panSpeed={1.45}
        screenSpacePanning={true}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
      />
    </>
  );
}

export function TrainStationReplicaWorld({
  isNight = false,
  isMobile = false,
  compactScene = false,
  onTrainHorn = null,
  includeLocalLights = true,
  replicaLite = false,
  replicaSouthAvenue = false,
}) {
  const trainSpeedScale = replicaLite ? 0.45 : 1;

  return (
    <>
      {includeLocalLights && (
        <>
          <ambientLight intensity={isNight ? 0.12 : 0.26} />
          <directionalLight position={[8, 14, -4]} intensity={isNight ? 0.22 : 0.48} color={isNight ? '#8ecae6' : '#ffe8cc'} />
          <directionalLight position={[-10, 8, 10]} intensity={isNight ? 0.12 : 0.26} color="#9fd9ff" />
          <hemisphereLight groundColor={isNight ? '#101624' : '#dce8f4'} intensity={isNight ? 0.1 : 0.18} />
          {isNight && <pointLight position={[0, 9, 13]} intensity={1.3} color="#66f3ff" distance={32} decay={2} />}
          {isNight && <pointLight position={[-15, 6, 10]} intensity={0.95} color="#ff67cf" distance={20} decay={2} />}
          {isNight && <pointLight position={[15, 6, 10]} intensity={0.95} color="#7aff8f" distance={20} decay={2} />}
        </>
      )}

      <Ground isMobile={isMobile} />
      <PedestrianWalkwayAmenities isNight={isNight} />
      {!isMobile && <UrbanCircuitRoads isNight={isNight} />}
      {!isMobile && !replicaLite && <DowntownDistrict isNight={isNight} replicaSouthAvenue={replicaSouthAvenue} />}
      {!isMobile && replicaLite && <ReplicaWideAccessDistrict isNight={isNight} />}

      <RailwayTunnels />
      <Rails zPosition={2} />
      <Rails zPosition={4.5} />
      <Rails zPosition={7} />
      <Rails zPosition={9.5} />

      <RailwaySignals />
      {!isMobile && <TrackSafetyBarriers isNight={isNight} />}

      <MaglevTrain railZ={2} speed={14 * trainSpeedScale} color="#E8E8E8" startX={-78} />
      <AnimatedTGV railZ={4.5} startX={-72} onHorn={replicaLite ? null : onTrainHorn} />
      <ICETrain railZ={7} speed={7 * trainSpeedScale} startX={62} />
      <FreightTrain railZ={9.5} speed={-4 * trainSpeedScale} startX={82} />

      {!replicaLite && <StationBuilding />}
      {!replicaLite && <Platform isNight={isNight} />}
      {!isMobile && <TicketControlGates isNight={isNight} />}
      {!isMobile && !replicaLite && <StationAgentsPatrol isMobile={isMobile} />}

      {!replicaLite && <CityBackground isNight={isNight} />}
      {!isMobile && <ParkingCars />}
      {!isMobile && !replicaLite && <MovingCars />}
      {!isMobile && <StreetLamps isNight={isNight} />}
      {!isMobile && <UrbanFurniture isNight={isNight} />}
      {!isMobile && <BridgeMovingWalkways isNight={isNight} />}
      {!isMobile && <BridgeSimpleRamps isNight={isNight} />}
      {!isMobile && <BridgeTransitScreens isNight={isNight} />}
      {!isMobile && <SouthParkScreens isNight={isNight} />}
      {!isMobile && <PremiumTransitAmenities isNight={isNight} />}
      {!isMobile && !compactScene && !replicaLite && <PremiumBridgeLife isMobile={isMobile} />}
      {!isMobile && !compactScene && !replicaLite && <CityPedestrians isNight={isNight} />}
      {!isMobile && !compactScene && !replicaLite && <EscalatorCrowds isNight={isNight} />}
      {!isMobile && !compactScene && !replicaLite && <StreetPedestrians isNight={isNight} />}
      {!isMobile && !replicaLite && <CityVehicles isNight={isNight} />}
      {!isMobile && !compactScene && !replicaLite && <UrbanRealism isNight={isNight} />}
      {!isMobile && !compactScene && !replicaLite && <NeonSigns isNight={isNight} />}

      {!isMobile && !compactScene && !replicaLite && <DepartureBoard />}
      {!isMobile && !compactScene && !replicaLite && <SteamEffect position={[0, 1.2, 4.5]} />}
      {!isMobile && !compactScene && !replicaLite && <SteamEffect position={[0, 1.2, 7]} />}

      <Passengers isMobile={isMobile || replicaLite} />
      {!isMobile && !compactScene && !replicaLite && <PremiumPlazaLife isMobile={isMobile} />}
      <PlatformLights isNight={isNight} />
      <NightNeonAura isNight={isNight} />
      <TrainDepots />
      <PremiumFountain isNight={isNight} />
      {!compactScene && !replicaLite && <SmokeParticles />}
    </>
  );
}

// ─── Composant principal ───────────────────────────────────
const TrainStation = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const sectionRef = useRef(null);
  const fsContainerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [canvasMountReady, setCanvasMountReady] = useState(false);
  const soundEffects = useSoundEffects();
  const { playTrainHorn, playStationAnnouncement, stopAnnouncementAudio, isMuted, setIsMuted } = soundEffects;
  const { isMobile, threeDSettings, shouldReduceAnimations, shouldReduceParticles, shouldDisableHeavyEffects, preferFastDesktop } = useMobileOptimization();

  // Vérifier le support WebGL au montage
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    setIsMuted?.(true);
  }, [setIsMuted]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: isMobile ? 0.05 : 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (!isVisible) {
      setCanvasMountReady(false);
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setCanvasMountReady(Boolean(canvasContainerRef.current));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isVisible]);

  // Play announcement when trains arrive (simulated)
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const triggerAnnouncement = useCallback((type) => {
    const nextAnnouncement = getRandomTrainAnnouncement(type);
    if (!nextAnnouncement) {
      return 8000;
    }

    setCurrentAnnouncement(nextAnnouncement.text);
    setShowAnnouncement(true);
    playStationAnnouncement(type, nextAnnouncement);
    return nextAnnouncement.displayMs ?? 8000;
  }, [playStationAnnouncement]);
  
  useEffect(() => {
    if (!isVisible || isMuted) return;
    
    // Initial announcement after 3 seconds
    const initialTimeout = setTimeout(() => {
      const displayMs = triggerAnnouncement('info');
      setTimeout(() => setShowAnnouncement(false), displayMs);
    }, 3000);
    
    const announcementInterval = setInterval(() => {
      const announcementTypes = ['arrival', 'departure', 'info'];
      const randomType = announcementTypes[Math.floor(Math.random() * announcementTypes.length)];
      const displayMs = triggerAnnouncement(randomType);
      setTimeout(() => setShowAnnouncement(false), displayMs);
    }, 30000); // Every 30 seconds
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(announcementInterval);
      stopAnnouncementAudio?.();
    };
  }, [isMuted, isVisible, stopAnnouncementAudio, triggerAnnouncement]);

  return (
    <section ref={sectionRef} className="relative py-6 sm:py-16 overflow-hidden" data-testid="train-station-section">
      <div className="w-full px-0 sm:px-2">
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceAnimations ? 1 : 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceAnimations ? 0.1 : 0.3 }}
          className="relative overflow-hidden cursor-pointer group sm:rounded-[28px]"
          ref={fsContainerRef}
          style={{
            height: isMobile ? '400px' : '700px',
            background: isNight ? '#0a1a2e' : 'linear-gradient(135deg, #1a3a6e, #4a7aae)',
            border: isMobile ? 'none' : `1px solid rgba(132, 209, 255, ${isHovered ? 0.3 : 0.14})`,
            boxShadow: isHovered 
              ? '0 26px 80px rgba(4, 30, 74, 0.22), inset 0 0 30px rgba(76, 172, 255, 0.08)' 
              : '0 18px 56px rgba(4, 30, 74, 0.16), inset 0 0 18px rgba(76, 172, 255, 0.03)',
            transition: 'border-color 0.3s, box-shadow 0.3s, background 0.8s'
          }}
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
        >
          {/* Audio Controls */}
          <HubAudioControls 
            hubType="train" 
            soundEffects={soundEffects}
            position="bottom-left"
          />
          
          {/* Top Controls Column — icon-only, transparent, far right */}
          <div className="absolute top-3 right-3 z-40 flex flex-col gap-2" data-testid="train-top-controls">
            <FullscreenToggle containerRef={fsContainerRef} position="inline" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.22)' }} />
            <motion.button
              onClick={() => window.resetTrainCamera && window.resetTrainCamera()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.22)' }}
              whileHover={{ background: 'rgba(255,255,255,0.13)', scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              data-testid="train-reset-camera-btn"
              title="Reset View"
            >
              <FiRotateCw size={15} />
            </motion.button>
            <motion.button
              onClick={() => setIsNight(n => !n)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.22)' }}
              whileHover={{ background: 'rgba(255,255,255,0.13)', scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              data-testid="train-day-night-btn"
              title={isNight ? 'Mode Jour' : 'Mode Nuit'}
            >
              {isNight ? <FiSun size={15} /> : <FiMoon size={15} />}
            </motion.button>
          </div>

          <motion.button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              window.setTrainStreetView && window.setTrainStreetView();
            }}
            className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-50 pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.22)',
              zIndex: 140,
            }}
            whileHover={{ background: 'rgba(255,255,255,0.13)', scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
            data-testid="train-street-view-btn"
            title="Piéton"
          >
            🚶
          </motion.button>

          {/* Camera Views Panel */}
          <div className="absolute bottom-2 sm:bottom-4 left-14 sm:left-16 z-50 flex items-center gap-1 sm:gap-1.5" data-testid="train-camera-views">
            {[
              { label: 'Aérienne', icon: '🦅', fn: () => window.setTrainAerialView?.(), id: 'aerial' },
              { label: 'Quais', icon: '🚉', fn: () => window.setTrainPlatformView?.(), id: 'platform' },
              { label: 'Ville', icon: '🏙️', fn: () => window.setTrainCityView?.(), id: 'city' },
              { label: 'Ville Sud', icon: '🌆', fn: () => window.setTrainSouthCityView?.(), id: 'south-city' },
              { label: 'Arrière', icon: '🔄', fn: () => window.setTrainRearView?.(), id: 'rear' },
              { label: 'Balade', icon: '🚶', fn: () => window.startFirstPersonWalk?.(), id: 'first-person' },
            ].map(v => (
              <motion.button
                key={v.id}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); v.fn(); }}
                className="pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center text-white"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.13)', scale: 1.1 }}
                whileTap={{ scale: 0.88 }}
                data-testid={`train-cam-${v.id}`}
                title={v.label}
              >
                <span className="text-xs sm:text-sm">{v.icon}</span>
              </motion.button>
            ))}
          </div>

          {/* Train Announcement Display */}
          <AnimatePresence>
            {showAnnouncement && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-40 max-w-md w-[82%]"
                data-testid="train-announcement-banner"
              >
                <div className="px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(9, 33, 58, 0.88)',
                    border: '1px solid rgba(108, 202, 255, 0.35)',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.22)',
                  }}>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-300 text-[10px] font-semibold tracking-[0.18em] uppercase mt-0.5">Info gare</span>
                    <p className="text-white/88 text-[11px] sm:text-xs font-medium leading-snug" data-testid="train-announcement-text">
                      {currentAnnouncement}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isVisible && webglSupported && (
            <div ref={canvasContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1, touchAction: 'manipulation' }}
              onWheel={(e) => e.stopPropagation()}
            >
            {canvasMountReady && (
              <Canvas
                eventSource={canvasContainerRef}
                eventPrefix="client"
                shadows={threeDSettings.shadows}
                camera={{ position: isMobile ? [0, 10.2, 17.2] : [0, 11.4, 15.4], fov: isMobile ? 56 : 50, far: 420 }}
                dpr={threeDSettings.dpr}
                gl={{ 
                  antialias: threeDSettings.antialias, 
                  alpha: false,
                  powerPreference: 'high-performance',
                  failIfMajorPerformanceCaveat: false,
                  stencil: false,
                  depth: true,
                  preserveDrawingBuffer: false,
                  precision: isMobile ? 'lowp' : 'mediump',
                }}
                frameloop={threeDSettings.frameloop}
                performance={{ min: 0.6, debounce: 240 }}
                style={{ background: isNight ? '#0a1a2e' : '#87CEEB' }}
                onCreated={({ gl }) => {
                  gl.setClearColor(isNight ? '#0a1a2e' : '#87CEEB');
                }}
              >
                <TrainScene isNight={isNight} onTrainHorn={isMobile ? null : playTrainHorn} isMobile={isMobile} shouldReduceParticles={shouldReduceParticles} shouldDisableHeavyEffects={shouldDisableHeavyEffects} preferFastDesktop={preferFastDesktop} />
              </Canvas>
            )}
            </div>
          )}
          
          {/* Fallback si WebGL non disponible */}
          {isVisible && !webglSupported && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #2a3a5a 100%)' }}>
              <div className="text-center text-white/80 p-8">
                <p className="text-lg font-medium mb-2">WebGL non disponible</p>
                <p className="text-sm text-white/60">Fermez d'autres onglets ou redémarrez votre navigateur</p>
              </div>
            </div>
          )}
          
          {/* Camera interaction hint */}
          <motion.div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/55 rounded-full px-4 py-2 pointer-events-none border border-white/20 flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-cyan-400"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" strokeLinecap="round" />
            </motion.svg>
            <span className="text-white/80 text-xs font-medium">Glisser pour explorer les voies</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

TrainStation.displayName = 'TrainStation';

export default TrainStation;



