"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface EarningsData {
  totalEarned: number;
  todayEarned: number;
  activeSessionsCount: number;
  averagePerSession: number;
}

interface EarningsTrackerProps {
  regionKey: string;
  powerScore: number;
}

export function EarningsTracker({ regionKey, powerScore }: EarningsTrackerProps) {
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarned: Math.floor(powerScore * 100 + Math.random() * 500),
    todayEarned: Math.floor(powerScore * 10 + Math.random() * 50),
    activeSessionsCount: Math.floor(Math.random() * 5),
    averagePerSession: Math.floor(50 + Math.random() * 100),
  });

  // Simulate real-time earnings updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings((prev) => {
        const sessionIncrease = Math.random() > 0.7 ? Math.floor(Math.random() * 80 + 20) : 0;
        return {
          ...prev,
          totalEarned: prev.totalEarned + sessionIncrease,
          todayEarned: prev.todayEarned + sessionIncrease,
          activeSessionsCount: Math.max(0, prev.activeSessionsCount + (Math.random() > 0.6 ? 1 : -1)),
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Revenue Tracking</h3>
        <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-300">Live</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          key={earnings.totalEarned}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 p-4"
        >
          <p className="text-xs uppercase tracking-wide text-emerald-200/70">Total Earned</p>
          <p className="mt-1 text-3xl font-bold text-emerald-100">
            {earnings.totalEarned.toLocaleString()}
            <span className="ml-1 text-sm text-emerald-200/60">pts</span>
          </p>
        </motion.div>

        <motion.div
          key={earnings.todayEarned}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/20 to-sky-500/10 p-4"
        >
          <p className="text-xs uppercase tracking-wide text-sky-200/70">Today</p>
          <p className="mt-1 text-3xl font-bold text-sky-100">
            {earnings.todayEarned.toLocaleString()}
            <span className="ml-1 text-sm text-sky-200/60">pts</span>
          </p>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/60">Active Sessions</p>
          <p className="mt-1 text-xl font-semibold text-white">{earnings.activeSessionsCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/60">Avg / Session</p>
          <p className="mt-1 text-xl font-semibold text-white">{earnings.averagePerSession} pts</p>
        </div>
      </div>

      {/* Earnings Chart Placeholder */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/60">Last 7 Days</p>
        <div className="flex h-20 items-end justify-between gap-1">
          {[...Array(7)].map((_, i) => {
            const height = Math.random() * 80 + 20;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-sky-500"
                title={`Day ${i + 1}: ${Math.floor(height * 5)} pts`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-white/40">
          <span>Mon</span>
          <span>Today</span>
        </div>
      </div>

      {/* Revenue Share Info */}
      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-100">10% Revenue Share</p>
            <p className="text-xs text-amber-200/70">
              You earn 10% of all points from virtual charging sessions on this plot
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
          Withdraw
        </button>
        <button className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
          History
        </button>
      </div>
    </div>
  );
}

