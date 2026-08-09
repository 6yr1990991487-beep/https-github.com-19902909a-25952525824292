import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// ---------------------------------------------------------
// 1. LOVA-BOT (Friendly, Nature/Plaza)
// ---------------------------------------------------------
export const LovaBotEnv = () => {
  return (
    <group position={[0, -2, 0]}>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#a7f3d0" roughness={1} />
      </mesh>
      
      {/* Fountain Base */}
      <mesh receiveShadow castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2, 2.2, 0.4, 32]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* Water */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 0.1, 32]} />
        <meshPhysicalMaterial color="#38bdf8" transmission={0.9} opacity={1} transparent roughness={0.1} />
      </mesh>

      {/* Trees */}
      {[-3, 3].map((x, i) => (
        <group key={i} position={[x, 0, -3]}>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 2]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[1.5, 3, 16]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const LovaBot = ({ isSpeaking }) => {
  const headRef = useRef(null);
  const leftArmRef = useRef(null);
  const rightArmRef = useRef(null);
  const bodyRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 2) * 0.2;
      headRef.current.position.y = 1.2 + (isSpeaking ? Math.abs(Math.sin(t * 10)) * 0.05 : 0);
    }
    // Arm swinging (walking motion)
    if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 4) * 0.5;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 4) * 0.5;
    // Body bouncing
    if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.1;
  });

  return (
    <group ref={bodyRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1.2, 0.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.5, 0.41]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      
      {/* Arms */}
      <group ref={leftArmRef} position={[-0.6, 0.8, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.6, 0.8, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, 1.2, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.2, 0.1, 0.55]}>
          <circleGeometry args={[0.1]} />
          <meshBasicMaterial color={isSpeaking ? "#fbbf24" : "#10b981"} />
        </mesh>
        <mesh position={[0.2, 0.1, 0.55]}>
          <circleGeometry args={[0.1]} />
          <meshBasicMaterial color={isSpeaking ? "#fbbf24" : "#10b981"} />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------
// 2. LOVA-AI (Advanced, Sleek, Glowing Nature)
// ---------------------------------------------------------
export const LovaAIEnv = () => {
  return (
    <group position={[0, -2, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      
      {/* Glowing Fountain */}
      <mesh receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2.5, 3, 0.4, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.1, 6]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* Crystal Trees */}
      {[-4, 4].map((x, i) => (
        <group key={i} position={[x, 1.5, -4]}>
          <mesh castShadow>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={1} opacity={0.8} transparent metalness={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const LovaAI = ({ isSpeaking }) => {
  const ringRef = useRef(null);
  const coreRef = useRef(null);
  const bodyRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 1.5;
      ringRef.current.rotation.y = t * 0.8;
      ringRef.current.rotation.z = t * 0.5;
    }
    // Hovering up and down smoothly
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.5 + Math.sin(t * 1.5) * 0.3;
    }
    // Pulsing core effect when speaking
    if (coreRef.current && isSpeaking) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 15) * 0.1);
    }
  });

  return (
    <group ref={bodyRef} position={[0, 0.5, 0]}>
      {/* Sleek Body */}
      <mesh ref={coreRef} position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Glowing Visor */}
      <mesh position={[0, 0.6, 0.45]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 16]} />
        <meshBasicMaterial color={isSpeaking ? "#22d3ee" : "#3b82f6"} />
      </mesh>
      {/* Floating Rings */}
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[1.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#0ea5e9" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------
// 3. LOVA KING AI (Majestic, Fortress, Powerful)
// ---------------------------------------------------------
export const LovaKingEnv = () => {
  return (
    <group position={[0, -2, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Fortress Pedestal */}
      <mesh receiveShadow castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1, 4]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Neon border */}
      <mesh position={[0, 1.01, 0]}>
        <boxGeometry args={[3.8, 0.05, 3.8]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {/* Monolithic Pillars */}
      {[-4, 4].map((x, i) => (
        <group key={i} position={[x, 4, -4]}>
          <mesh castShadow>
            <boxGeometry args={[1, 8, 1]} />
            <meshStandardMaterial color="#171717" metalness={1} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.51]}>
            <planeGeometry args={[0.2, 6]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const LovaKingAI = ({ isSpeaking }) => {
  const headRef = useRef(null);
  const shouldersRef = useRef(null);
  const staffRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (headRef.current) {
      // Majestic slow nod and breathing
      headRef.current.position.y = 2.5 + Math.sin(t * 1.5) * 0.05;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.3; // Look around
      if (isSpeaking) headRef.current.rotation.x = Math.sin(t * 8) * 0.05;
    }
    // Powerful chest breathing
    if (shouldersRef.current) {
      const breath = 1 + Math.sin(t * 1.5) * 0.03;
      shouldersRef.current.scale.set(breath, 1, breath);
    }
    // Hovering mystical orb/staff
    if (staffRef.current) {
      staffRef.current.position.y = 1 + Math.sin(t * 2) * 0.3;
      staffRef.current.rotation.y += 0.02;
      staffRef.current.rotation.x = Math.sin(t) * 0.2;
    }
  });

  return (
    <group position={[0, 1, 0]}>
      {/* Massive Body */}
      <group ref={shouldersRef}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.8, 1.2, 2, 8]} />
          <meshStandardMaterial color="#09090b" metalness={1} roughness={0.2} />
        </mesh>
        {/* Armor Plates */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.9, 1.3, 1.8, 4]} />
          <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.3} wireframe />
        </mesh>
      </group>

      {/* Floating Power Orb */}
      <mesh ref={staffRef} position={[1.5, 1, 0.5]} castShadow>
        <octahedronGeometry args={[0.3, 0]} />
        <meshPhysicalMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} transmission={0.9} roughness={0.1} />
      </mesh>
      
      {/* Majestic Head */}
      <group ref={headRef} position={[0, 2.5, 0]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial color="#262626" metalness={0.8} />
        </mesh>
        {/* Crown */}
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.8, 0.5, 4]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        {/* Piercing Eye */}
        <mesh position={[0, 0, 0.55]}>
          <planeGeometry args={[0.4, 0.1]} />
          <meshBasicMaterial color={isSpeaking ? "#ef4444" : "#b91c1c"} />
        </mesh>
      </group>
    </group>
  );
};
