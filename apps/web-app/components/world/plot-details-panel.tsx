"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import type { GatewayWorldPlot } from "@decharge/sdk";
import { usePlotSelection } from "@/hooks/use-plot-selection";
import { useClaimPlot } from "@/hooks/use-claim-plot";

export function PlotDetailsPanel() {
  const { selectedPlot, clearSelection } = usePlotSelection();
  const { connected } = useWallet();
  const { claimPlot, isLoading, error } = useClaimPlot();

  if (!selectedPlot) return null;

  const isOwned = !!selectedPlot.owner;
  const estimatedEarnings = selectedPlot.powerScore * 10;

  const handleClaim = async () => {
    if (!connected) {
      alert("Please connect your wallet first!");
      return;
    }
    await claimPlot(selectedPlot.regionKey);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 z-50 h-screen w-96 overflow-y-auto border-l border-white/10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-2xl backdrop-blur-xl"
      >
        {/* Close Button */}
        <button
          onClick={clearSelection}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
        >
          ✕
        </button>

        {/* Plot Header */}
        <div className="mb-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-200">
            {isOwned ? "Owned Plot" : "Available Plot"}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-white">{selectedPlot.regionKey}</h2>
          <p className="mt-1 text-sm text-white/60">
            Vibe: <span className="capitalize text-white/80">{selectedPlot.vibe}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Power Score</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{selectedPlot.powerScore.toFixed(1)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Boosts Active</p>
            <p className="mt-1 text-2xl font-bold text-sky-300">{selectedPlot.boosts.length}</p>
          </div>
        </div>

        {/* Coordinates */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Coordinates</p>
          <div className="font-mono text-sm text-white/80">
            <div>X: {selectedPlot.coordinates[0].toFixed(1)}</div>
            <div>Y: {selectedPlot.coordinates[1].toFixed(1)}</div>
            <div>Z: {selectedPlot.coordinates[2].toFixed(1)}</div>
          </div>
        </div>

        {/* Boosts */}
        {selectedPlot.boosts.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Active Boosts</h3>
            <div className="space-y-2">
              {selectedPlot.boosts.map((boost, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <span className="text-sm text-white">{boost.label}</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                    +{boost.magnitude.toFixed(1)}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Owner Info */}
        {isOwned && (
          <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-amber-200/70">Owner Address</p>
            <p className="break-all font-mono text-xs text-amber-100">{selectedPlot.owner}</p>
          </div>
        )}

        {/* Earnings Estimate */}
        {!isOwned && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-white/70">Estimated Monthly Earnings</p>
            <p className="text-3xl font-bold text-white">{estimatedEarnings.toLocaleString()} pts</p>
            <p className="mt-1 text-xs text-white/60">Based on current network activity</p>
          </div>
        )}

        {/* Action Button */}
        {!isOwned && (
          <div className="space-y-3">
            <button
              onClick={handleClaim}
              disabled={isLoading || !connected}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Claiming..." : connected ? "Claim Plot (0.01 SOL)" : "Connect Wallet to Claim"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <p className="text-center text-xs text-white/50">
              Claiming creates an on-chain NFT and grants you revenue share from all virtual charging sessions on this
              plot.
            </p>
          </div>
        )}

        {/* Owned Plot Actions */}
        {isOwned && (
          <div className="space-y-3">
            <button className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/20">
              View Earnings History
            </button>
            <button className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/20">
              Upgrade Charger
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

