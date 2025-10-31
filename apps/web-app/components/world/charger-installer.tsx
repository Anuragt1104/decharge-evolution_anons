"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUpgradeCharger } from "@/hooks/use-claim-plot";

interface ChargerInstallerProps {
  regionKey: string;
  currentLevel: number;
  onClose: () => void;
}

const chargerTypes = [
  {
    level: 1,
    name: "Basic Charger",
    description: "Entry-level charging station for urban environments",
    powerOutput: "50 kW",
    capacity: "2 vehicles",
    cost: "0.01 SOL",
    color: "emerald",
  },
  {
    level: 2,
    name: "Fast Charger",
    description: "High-speed charging for busy commercial areas",
    powerOutput: "150 kW",
    capacity: "4 vehicles",
    cost: "0.05 SOL",
    color: "sky",
  },
  {
    level: 3,
    name: "Ultra-Fast Charger",
    description: "Premium ultra-fast charging with advanced grid management",
    powerOutput: "350 kW",
    capacity: "8 vehicles",
    cost: "0.15 SOL",
    color: "purple",
  },
];

export function ChargerInstaller({ regionKey, currentLevel, onClose }: ChargerInstallerProps) {
  const [selectedLevel, setSelectedLevel] = useState<number>(currentLevel + 1 > 3 ? 3 : currentLevel + 1);
  const { upgradeCharger, isLoading } = useUpgradeCharger();

  const handleInstall = async () => {
    await upgradeCharger(regionKey, selectedLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/98 to-slate-950 shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-white">Install / Upgrade Charger</h2>
          <p className="mt-1 text-sm text-white/60">
            Region: <span className="font-medium text-white">{regionKey}</span>
            {currentLevel > 0 && (
              <>
                {" "}
                · Current Level: <span className="font-medium text-emerald-300">Level {currentLevel}</span>
              </>
            )}
          </p>
        </div>

        {/* Charger Selection Grid */}
        <div className="grid gap-4 p-6 md:grid-cols-3">
          {chargerTypes.map((charger) => (
            <button
              key={charger.level}
              onClick={() => setSelectedLevel(charger.level)}
              disabled={charger.level <= currentLevel}
              className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition ${
                selectedLevel === charger.level
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              } ${charger.level <= currentLevel ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {/* Level Badge */}
              <div
                className={`mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  charger.color === "emerald"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : charger.color === "sky"
                      ? "bg-sky-500/20 text-sky-300"
                      : "bg-purple-500/20 text-purple-300"
                }`}
              >
                LEVEL {charger.level}
                {charger.level === currentLevel && " (Current)"}
              </div>

              <h3 className="mb-2 text-lg font-bold text-white">{charger.name}</h3>
              <p className="mb-4 text-sm text-white/70">{charger.description}</p>

              {/* Stats */}
              <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Power Output</span>
                  <span className="font-medium text-white">{charger.powerOutput}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Capacity</span>
                  <span className="font-medium text-white">{charger.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Cost</span>
                  <span className="font-bold text-emerald-300">{charger.cost}</span>
                </div>
              </div>

              {/* Selected Indicator */}
              {selectedLevel === charger.level && (
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                  ✓
                </div>
              )}

              {charger.level <= currentLevel && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    Installed
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="border-t border-white/10 bg-white/5 p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
            Performance Comparison
          </h3>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="font-medium text-white/60"></div>
            <div className="text-center font-medium text-white">Level 1</div>
            <div className="text-center font-medium text-white">Level 2</div>
            <div className="text-center font-medium text-white">Level 3</div>

            <div className="col-span-4 my-1 border-t border-white/10"></div>

            <div className="text-white/60">Earning Rate</div>
            <div className="text-center text-white">1x</div>
            <div className="text-center text-emerald-300">2.5x</div>
            <div className="text-center text-purple-300">5x</div>

            <div className="text-white/60">Session Priority</div>
            <div className="text-center text-white">Normal</div>
            <div className="text-center text-emerald-300">High</div>
            <div className="text-center text-purple-300">Highest</div>

            <div className="text-white/60">Boost Multiplier</div>
            <div className="text-center text-white">+0%</div>
            <div className="text-center text-emerald-300">+25%</div>
            <div className="text-center text-purple-300">+50%</div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-white/10 p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              {currentLevel === 0
                ? "Install your first charger to start earning from virtual sessions"
                : "Upgrading increases your earning rate and session priority"}
            </p>
            <button
              onClick={handleInstall}
              disabled={isLoading || selectedLevel <= currentLevel}
              className="whitespace-nowrap rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "Processing..."
                : currentLevel === 0
                  ? `Install ${chargerTypes[selectedLevel - 1].name}`
                  : `Upgrade to Level ${selectedLevel}`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

