import type { GatewayLiveEvent } from "@decharge/sdk";

interface ActivityFeedProps {
  events: GatewayLiveEvent[];
}

const iconMap: Record<GatewayLiveEvent["type"], string> = {
  bootstrap: "⚡",
  session_start: "🚗",
  session_update: "🔄",
  session_complete: "✅",
  station_status: "🛰️",
  points_purchase: "🎁",
  world_plot_claim: "🌐",
};

const formatEvent = (event: GatewayLiveEvent) => {
  switch (event.type) {
    case "session_start":
      return {
        title: `Session started @ ${event.payload.stationId.slice(0, 4).toUpperCase()}`,
        subtitle: `${event.payload.driver} · ${event.payload.vehicleModel}`,
        emphasis: `${event.payload.energyDeliveredKwh.toFixed(2)} kWh / ${event.payload.pointsEarned.toLocaleString()} pts`,
        timestamp: event.payload.startedAt,
      };
    case "session_update":
      return {
        title: `Session update @ ${event.payload.stationId.slice(0, 4).toUpperCase()}`,
        subtitle: `${event.payload.energyDeliveredKwh.toFixed(2)} kWh delivered`,
        emphasis: `${event.payload.pointsEarned.toLocaleString()} pts earned so far`,
        timestamp: event.payload.updatedAt,
      };
    case "session_complete":
      return {
        title: `Session complete @ ${event.payload.stationId.slice(0, 4).toUpperCase()}`,
        subtitle: `${event.payload.energyDeliveredKwh.toFixed(2)} kWh delivered`,
        emphasis: `+${event.payload.pointsEarned.toLocaleString()} pts minted`,
        timestamp: event.payload.endedAt ?? event.payload.updatedAt,
      };
    case "station_status":
      return {
        title: `Station ${event.payload.name} is ${event.payload.status}`,
        subtitle: `${event.payload.livePowerKw.toFixed(1)} kW live · ${event.payload.utilizationPercent.toFixed(1)}% utilized`,
        emphasis: `${event.payload.dailyEnergyKwh.toFixed(1)} kWh today`,
        timestamp: Date.now(),
      };
    case "points_purchase":
      return {
        title: "Marketplace redemption",
        subtitle: `${event.payload.wallet.slice(0, 4)}…${event.payload.wallet.slice(-4)} grabbed ${event.payload.itemId}`,
        emphasis: `Spent ${event.payload.points.toLocaleString()} pts`,
        timestamp: event.payload.timestamp,
      };
    case "world_plot_claim":
      return {
        title: `World plot claimed in region ${event.payload.regionKey}`,
        subtitle: `${event.payload.owner?.slice(0, 4) ?? "anon"} now owns this zone`,
        emphasis: `${event.payload.powerScore.toFixed(1)} power score · vibe ${event.payload.vibe}`,
        timestamp: Date.now(),
      };
    case "bootstrap":
    default:
      return {
        title: "Network synced",
        subtitle: "All systems updated from gateway",
        emphasis: `${event.payload.stations?.length ?? 0} stations in scope`,
        timestamp: Date.now(),
      };
  }
};

const timeAgo = (timestamp: number) => {
  const diffInSeconds = Math.round((timestamp - Date.now()) / 1000);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(diffInSeconds, "second");
};

export function ActivityFeed({ events }: ActivityFeedProps) {
  const latest = events.slice(-12).reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Live activity</h3>
          <p className="text-sm text-white/60">Streaming direct from the gateway orchestration layer.</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
          {latest.length} events
        </span>
      </div>
      <ul className="space-y-3">
        {latest.map((event, index) => {
          const meta = formatEvent(event);
          return (
            <li
              key={`${event.type}-${index}-${meta.timestamp}`}
              className="group flex items-start gap-4 rounded-3xl border border-white/5 bg-black/40 p-4 transition hover:border-white/10"
            >
              <span className="rounded-2xl bg-white/10 p-3 text-lg text-white/80">{iconMap[event.type]}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{meta.title}</p>
                  <span className="text-xs text-white/40">{timeAgo(meta.timestamp)}</span>
                </div>
                <p className="mt-1 text-xs text-white/60">{meta.subtitle}</p>
                <p className="mt-2 text-sm font-medium text-emerald-200">{meta.emphasis}</p>
              </div>
            </li>
          );
        })}
        {latest.length === 0 ? (
          <li className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50">
            Waiting for the first gateway event… start the simulator or connect live hardware to witness the flow.
          </li>
        ) : null}
      </ul>
    </div>
  );
}