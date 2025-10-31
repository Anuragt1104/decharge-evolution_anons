"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EnergyParticlesProps {
  position: [number, number, number];
  active?: boolean;
  color?: string;
}

export function EnergyParticles({ position, active = true, color = "#10b981" }: EnergyParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 50;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.random() * -5;
      positions[i3 + 2] = Math.sin(angle) * radius;

      velocities[i] = 0.05 + Math.random() * 0.1;
    }

    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (!particlesRef.current || !active) return;

    const positionArray = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positionArray[i3 + 1] += velocities[i];

      if (positionArray[i3 + 1] > 15) {
        const radius = Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        positionArray[i3] = Math.cos(angle) * radius;
        positionArray[i3 + 1] = 0;
        positionArray[i3 + 2] = Math.sin(angle) * radius;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface AnimatedGroundGridProps {
  size?: number;
  divisions?: number;
}

export function AnimatedGroundGrid({ size = 600, divisions = 60 }: AnimatedGroundGridProps) {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    const material = gridRef.current.material as THREE.Material;
    if (material) {
      (material as THREE.LineBasicMaterial).opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[size, divisions, "#10b981", "#0f766e"]}
      position={[0, 0.1, 0]}
      material-transparent
      material-opacity={0.1}
    />
  );
}

