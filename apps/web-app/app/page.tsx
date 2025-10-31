"use client";

import { useMemo } from "react";

import { MetricCard } from "@/components/metric-card";
import { LiveSessionTable } from "@/components/live-session-table";
import { MarketplaceGrid } from "@/components/marketplace-grid";
import { ActivityFeed } from "@/components/activity-feed";
import { WorldSceneWrapper } from "@/components/world/world-scene-wrapper";
import { useGatewayData } from "@/components/use-gateway-data";

export default function HomePage() {
  const { dashboard, stations, sessions, marketplace, world, events } = useGatewayData();

  const metrics = useMemo(() => {
    if (!dashboard) {
      return [
        { title: "Energy delivered", value: "--", accent: "emerald" },
        { title: "Network utilization", value: "--", accent: "violet" },
        { title: "Points minted", value: "--", accent: "amber" },
      ];
    }

    return [
      {
        title: "Energy delivered",
        value: `${dashboard.network.energyDeliveredKwh.toFixed(1)} kWh`,
        trend: {
          direction: "up" as const,
          label: `${dashboard.network.carbonOffsetKg.toFixed(1)} kg CO₂ saved`,
        },
        accent: "emerald",
        description: "On-chain verified energy flowing through the DeCharge mesh since midnight UTC.",
      },
      {
        title: "Network utilization",
        value: `${dashboard.network.avgUtilizationPercent.toFixed(1)}%`,
        trend: {
          direction: "up" as const,
          label: `${dashboard.network.onlineStations}/${dashboard.network.stationCount} stations online`,
        },
        accent: "violet",
        description: "Composite demand index combining live sessions, grid constraints, and loyalty boosts.",
      },
      {
        title: "Points minted",
        value: `${dashboard.economy.totalPointsIssued.toLocaleString()} pts`,
        trend: {
          direction: "up" as const,
          label: `${dashboard.economy.marketplaceInventory} rewards available`,
        },
        accent: "amber",
        description: "Gamified incentives bridging physical charging with digital ownership.",
      },
    ];
  }, [dashboard]);

  return (
    <>
      <div className="flex flex-col gap-10 px-6 pb-16 pt-4 lg:px-12">
        <section className="grid gap-6 md:grid-cols-[1.1fr,_0.9fr]">
          <div className="space-y-6">
            <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-transparent p-8 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-emerald-200">
                  DeCharge evolution control
                </div>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">
                  Live EV charging orchestration · on-chain loyalty · immersive energyverse
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
                  Observe every watt, reward, and metaverse unlock as it streams through the Solana-powered DeCharge
                  network. The dashboard below fuses the anchor program state, real-time telemetry gateway, and 3D world
                  simulation into a single command surface.
                </p>
              </div>
            </header>
            <div className="grid gap-4 md:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </div>
            <LiveSessionTable sessions={sessions} stations={stations} />
          </div>
          <aside className="space-y-6">
            <ActivityFeed events={events} />
          </aside>
        </section>
        <section className="grid gap-6 lg:grid-cols-[0.9fr,_1.1fr]">
          <MarketplaceGrid items={marketplace} />
          <WorldSceneWrapper plots={world} />
        </section>
      </div>
    </>
  );
}