"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import type { GatewayWorldPlot } from "@decharge/sdk";
import { InteractivePlot } from "./world/interactive-plot";
import { AnimatedGroundGrid, EnergyParticles } from "./world/world-effects";
import { usePlotSelection } from "@/hooks/use-plot-selection";

interface WorldViewportProps {
  plots: GatewayWorldPlot[];
}

export function WorldViewport({ plots }: WorldViewportProps) {
  const { selectedPlot, selectPlot, isPlotSelected } = usePlotSelection();
  const content = useMemo(() => plots.slice(0, 60), [plots]);

  // Determine which plots have active sessions (for demo, mark some randomly)
  const activePlotKeys = useMemo(() => {
    return new Set(
      content
        .filter(() => Math.random() > 0.7)
        .map((p) => p.regionKey)
        .slice(0, 5)
    );
  }, [content]);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-3xl border border-white/5 bg-black/60 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10" />
      <Canvas
        shadows
        camera={{ position: [80, 70, 80], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[40, 80, 40]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={200}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />
          <pointLight position={[-40, 30, -40]} intensity={0.5} color="#60a5fa" />
          <spotLight position={[0, 50, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#10b981" />

          {/* Atmospheric Elements */}
          <Stars radius={300} depth={60} factor={5} fade speed={1.5} />
          <Environment preset="night" />
          <fog attach="fog" args={["#0f172a", 100, 300]} />

          {/* Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.1, 0]}>
            <planeGeometry args={[600, 600]} />
            <meshStandardMaterial color="#0a0f1a" roughness={0.9} metalness={0.1} />
          </mesh>

          {/* Animated Ground Grid */}
          <AnimatedGroundGrid size={600} divisions={60} />

          {/* Interactive Plots */}
          {content.map((plot) => (
            <InteractivePlot
              key={plot.regionKey}
              plot={plot}
              isSelected={isPlotSelected(plot)}
              onSelect={() => selectPlot(plot)}
              hasActiveSession={activePlotKeys.has(plot.regionKey)}
            />
          ))}

          {/* Energy Particles for Active Plots */}
          {content
            .filter((plot) => activePlotKeys.has(plot.regionKey))
            .map((plot) => (
              <EnergyParticles key={`particles-${plot.regionKey}`} position={plot.coordinates} active />
            ))}

          {/* Post-Processing Effects */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={1.2} />
          </EffectComposer>
        </Suspense>

        <OrbitControls
          enablePan={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.3}
          minDistance={30}
          maxDistance={200}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-white">
        <h3 className="text-xl font-bold">Virtual DeCharge Energy Grid</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          {selectedPlot ? (
            <>
              <span className="font-semibold text-emerald-300">{selectedPlot.regionKey}</span> selected ·{" "}
              {selectedPlot.owner ? (
                <>
                  Owned by <span className="font-mono text-xs">{selectedPlot.owner.slice(0, 8)}...</span>
                </>
              ) : (
                <span className="text-amber-300">Available for claim</span>
              )}{" "}
              · Power Score: {selectedPlot.powerScore.toFixed(1)} · {selectedPlot.boosts.length} boost
              {selectedPlot.boosts.length !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              {content.length} energy plots rendered · Click any plot to select · Drag to orbit · Scroll to zoom
            </>
          )}
        </p>
      </div>
    </div>
  );
}