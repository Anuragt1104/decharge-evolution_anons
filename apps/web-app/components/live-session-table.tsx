import type { GatewaySession, GatewayStation } from "@decharge/sdk";

interface LiveSessionTableProps {
  sessions: GatewaySession[];
  stations: GatewayStation[];
}

const statusBadge: Record<GatewaySession["status"], string> = {
  charging: "bg-emerald-500/20 text-emerald-200",
  completed: "bg-sky-500/20 text-sky-200",
  aborted: "bg-rose-500/20 text-rose-200",
};

export function LiveSessionTable({ sessions, stations }: LiveSessionTableProps) {
  const stationMap = new Map(stations.map((station) => [station.id, station]));
  const topSessions = sessions.slice(0, 6);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/5 bg-black/40">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Live charging sessions</h3>
          <p className="text-sm text-white/60">Telemetry updates every 5 seconds</p>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-4 py-1 text-xs font-medium uppercase tracking-wide text-emerald-200">
          {topSessions.length} active
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-white/50">
              <th className="px-6 py-3">Driver</th>
              <th className="px-4 py-3">Station</th>
              <th className="px-4 py-3">Energy</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {topSessions.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-white/50" colSpan={6}>
                  No live sessions yet. The simulator will light up activity shortly.
                </td>
              </tr>
            ) : null}
            {topSessions.map((session) => {
              const station = stationMap.get(session.stationId);
              return (
                <tr key={session.id} className="text-white/80">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{session.driver}</span>
                      <span className="text-xs text-white/50">{session.vehicleModel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span>{station?.name ?? "Unknown"}</span>
                      <span className="text-xs text-white/50">{station?.location.city ?? "Metaverse"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">
                        {session.energyDeliveredKwh.toFixed(2)} kWh
                      </span>
                      <span className="text-xs text-white/50">
                        {(session.energyDeliveredKwh / Math.max(1, (Date.now() - session.startedAt) / 1000 / 60)).toFixed(2)} kWh/min
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-white">{session.pointsEarned.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[session.status]}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-white/50">
                    {new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                      Math.round((session.updatedAt - Date.now()) / 1000),
                      "second",
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}