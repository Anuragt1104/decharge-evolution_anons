"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import type { GatewayWorldPlot } from "@decharge/sdk";
import * as THREE from "three";

interface InteractivePlotProps {
  plot: GatewayWorldPlot;
  isSelected: boolean;
  onSelect: () => void;
  hasActiveSession?: boolean;
}

const colorMap: Record<GatewayWorldPlot["vibe"], string> = {
  eco: "#4ade80",
  tech: "#60a5fa",
  community: "#f472b6",
};

export function InteractivePlot({ plot, isSelected, onSelect, hasActiveSession = false }: InteractivePlotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const baseColor = colorMap[plot.vibe];
  const size = Math.max(8, Math.min(18, plot.powerScore / 2));
  const height = 4 + plot.boosts.length * 1.5;

  // Animated spring for hover and selection states
  const { scale, emissiveIntensity } = useSpring({
    scale: isSelected ? 1.15 : hovered ? 1.08 : 1,
    emissiveIntensity: isSelected ? 0.6 : hovered ? 0.45 : 0.3,
    config: { tension: 300, friction: 20 },
  });

  // Pulsing animation for active charging sessions
  useFrame((state) => {
    if (meshRef.current && hasActiveSession) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      meshRef.current.scale.y = pulse;
    }
  });

  // Breathing animation for owned plots
  useFrame((state) => {
    if (meshRef.current && plot.owner && !hasActiveSession) {
      const breath = Math.sin(state.clock.elapsedTime * 0.8) * 0.03 + 1;
      meshRef.current.scale.setScalar(breath);
    }
  });

  return (
    <group position={plot.coordinates}>
      <animated.mesh
        ref={meshRef}
        castShadow
        receiveShadow
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[size, height, size]} />
        <animated.meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.6}
          roughness={0.2}
          transparent={!plot.owner}
          opacity={plot.owner ? 1 : 0.7}
        />
      </animated.mesh>

      {/* Selection indicator ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[size * 0.6, size * 0.7, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Owner indicator badge */}
      {plot.owner && (
        <mesh position={[0, height / 2 + 2, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Active session indicator */}
      {hasActiveSession && (
        <pointLight position={[0, height / 2 + 4, 0]} color="#10b981" intensity={2} distance={30} />
      )}
    </group>
  );
}

