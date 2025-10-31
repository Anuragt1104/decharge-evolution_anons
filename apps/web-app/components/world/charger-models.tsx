"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ChargerModelProps {
  level: 1 | 2 | 3;
  position?: [number, number, number];
  isActive?: boolean;
}

export function BasicCharger({ position = [0, 0, 0], isActive = false }: Omit<ChargerModelProps, "level">) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#4ade80" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
        <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Connector Head */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color="#34d399"
          emissive={isActive ? "#10b981" : "#000000"}
          emissiveIntensity={isActive ? 0.8 : 0}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Active glow */}
      {isActive && <pointLight position={[0, 4.5, 0]} color="#10b981" intensity={3} distance={15} />}
    </group>
  );
}

export function FastCharger({ position = [0, 0, 0], isActive = false }: Omit<ChargerModelProps, "level">) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.7;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Larger Base */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[2.5, 1.6, 2.5]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Dual Poles */}
      <mesh position={[-0.6, 3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 4.4, 16]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.15} />
      </mesh>
      <mesh position={[0.6, 3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 4.4, 16]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.15} />
      </mesh>

      {/* Top Assembly */}
      <mesh position={[0, 5.2, 0]} castShadow>
        <boxGeometry args={[1.8, 0.8, 1.8]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive={isActive ? "#3b82f6" : "#000000"}
          emissiveIntensity={isActive ? 0.9 : 0}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Connector Heads */}
      <mesh position={[-0.6, 6, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive={isActive ? "#60a5fa" : "#000000"}
          emissiveIntensity={isActive ? 1 : 0}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>
      <mesh position={[0.6, 6, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive={isActive ? "#60a5fa" : "#000000"}
          emissiveIntensity={isActive ? 1 : 0}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>

      {/* Active glows */}
      {isActive && (
        <>
          <pointLight position={[-0.6, 6, 0]} color="#60a5fa" intensity={4} distance={20} />
          <pointLight position={[0.6, 6, 0]} color="#60a5fa" intensity={4} distance={20} />
        </>
      )}
    </group>
  );
}

export function UltraFastCharger({ position = [0, 0, 0], isActive = false }: Omit<ChargerModelProps, "level">) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.9;
    }
    if (coreRef.current && isActive) {
      coreRef.current.rotation.x = state.clock.elapsedTime * 2;
      coreRef.current.rotation.z = state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Large Hexagonal Base */}
      <mesh position={[0, 1, 0]} castShadow rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[3, 3, 2, 6]} />
        <meshStandardMaterial color="#a855f7" metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Main Column */}
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1, 6, 8]} />
        <meshStandardMaterial
          color="#9333ea"
          emissive={isActive ? "#7c3aed" : "#000000"}
          emissiveIntensity={isActive ? 0.5 : 0}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>

      {/* Energy Core */}
      <mesh ref={coreRef} position={[0, 7, 0]} castShadow>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive={isActive ? "#a855f7" : "#000000"}
          emissiveIntensity={isActive ? 1.5 : 0}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Connector Array */}
      {[-1.5, -0.5, 0.5, 1.5].map((offset, i) => (
        <mesh key={i} position={[offset, 8, 0]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color="#e9d5ff"
            emissive={isActive ? "#c084fc" : "#000000"}
            emissiveIntensity={isActive ? 1.2 : 0}
            metalness={0.95}
            roughness={0.02}
          />
        </mesh>
      ))}

      {/* Energy Rings */}
      {[5, 6, 7].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5 + i * 0.3, 0.05, 16, 64]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive={isActive ? "#9333ea" : "#000000"}
            emissiveIntensity={isActive ? 1 : 0}
            metalness={1}
            roughness={0}
          />
        </mesh>
      ))}

      {/* Ultra Active glows */}
      {isActive && (
        <>
          <pointLight position={[0, 7, 0]} color="#a855f7" intensity={8} distance={40} />
          <pointLight position={[0, 8, 0]} color="#c084fc" intensity={6} distance={30} />
        </>
      )}
    </group>
  );
}

export function ChargerModel({ level, position, isActive = false }: ChargerModelProps) {
  switch (level) {
    case 1:
      return <BasicCharger position={position} isActive={isActive} />;
    case 2:
      return <FastCharger position={position} isActive={isActive} />;
    case 3:
      return <UltraFastCharger position={position} isActive={isActive} />;
    default:
      return <BasicCharger position={position} isActive={isActive} />;
  }
}

