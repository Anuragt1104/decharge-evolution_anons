import "dotenv/config";

import chalk from "chalk";
import fetch from "cross-fetch";
import { nanoid } from "nanoid";

const gatewayUrl = process.env.GATEWAY_URL ?? "http://localhost:8787";
const ingestUrl = new URL("/ingest", gatewayUrl).toString();

const stationIds = [
  "stat-alpha",
  "stat-bravo",
  "stat-charlie",
  "stat-delta",
  "stat-echo",
];

interface ActiveSession {
  sessionId: string;
  stationId: string;
  driver: string;
  vehicleModel: string;
  energyDelivered: number;
  pointsEarned: number;
  startedAt: number;
}

const activeSessions = new Map<string, ActiveSession>();

const drivers = [
  { name: "Alya Chen", car: "Lucid Air Pure" },
  { name: "Noah Singh", car: "Tesla Model 3 Highland" },
  { name: "Maya Okafor", car: "Rivian R1S" },
  { name: "Jonah Alvarez", car: "Hyundai Ioniq 6" },
  { name: "Selene Park", car: "Polestar 3" },
  { name: "Zara Malik", car: "Kia EV9" },
];

const worldRegions = [
  "aurora-basin",
  "solstice-grove",
  "quantum-docks",
  "pulse-avenue",
  "ionia-cradle",
  "hydra-orbit",
];

const random = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const postEvent = async (payload: Record<string, unknown>) => {
  const response = await fetch(ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "<no body>");
    throw new Error(`Gateway ingest failed (${response.status}): ${text}`);
  }

  try {
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    console.warn("[sim] Non-JSON response", error);
    return {};
  }
};

const bootstrapStations = async () => {
  await Promise.all(
    stationIds.map(async (stationId, index) => {
      const basePower = 80 + index * 12;
      const payload = {
        type: "station_status",
        stationId,
        status: "online",
        livePowerKw: basePower,
        utilizationPercent: Math.min(95, 55 + Math.random() * 30),
        carbonOffsetKg: Math.random() * 12,
        dailyEnergyKwh: basePower * (Math.random() * 4 + 8),
      };
      await postEvent(payload);
      console.log(chalk.green(`[sim] Station ${stationId} initialized`));
    }),
  );
};

const startSession = async () => {
  const stationId = random(stationIds);
  const driver = random(drivers);
  const payload = {
    type: "session_start" as const,
    stationId,
    driver: driver.name,
    vehicleModel: driver.car,
    energyDeliveredKwh: Number((Math.random() * 3).toFixed(2)),
    pointsEarned: Math.round(120 + Math.random() * 220),
  };

  const response = await postEvent(payload);
  const sessionId = typeof response.sessionId === "string" ? response.sessionId : nanoid();
  activeSessions.set(sessionId, {
    sessionId,
    stationId,
    driver: driver.name,
    vehicleModel: driver.car,
    energyDelivered: payload.energyDeliveredKwh,
    pointsEarned: payload.pointsEarned,
    startedAt: Date.now(),
  });

  console.log(
    chalk.cyan(
      `[sim] Session ${sessionId.slice(0, 6)}… started at ${stationId} (${payload.energyDeliveredKwh} kWh, ${payload.pointsEarned} pts)`,
    ),
  );
};

const updateSessions = async () => {
  const updates = Array.from(activeSessions.values());
  await Promise.all(
    updates.map(async (session) => {
      if (Math.random() < 0.25) {
        // close session
        session.energyDelivered += Number((Math.random() * 6).toFixed(2));
        session.pointsEarned += Math.round(200 + Math.random() * 180);

        await postEvent({
          type: "session_complete",
          sessionId: session.sessionId,
          stationId: session.stationId,
          energyDeliveredKwh: session.energyDelivered,
          pointsEarned: session.pointsEarned,
        });

        activeSessions.delete(session.sessionId);
        console.log(
          chalk.magenta(
            `[sim] Session ${session.sessionId.slice(0, 6)}… completed (${session.energyDelivered.toFixed(2)} kWh, ${session.pointsEarned} pts)`,
          ),
        );
        return;
      }

      session.energyDelivered += Number((Math.random() * 1.7).toFixed(2));
      session.pointsEarned += Math.round(45 + Math.random() * 60);

      await postEvent({
        type: "session_update",
        sessionId: session.sessionId,
        stationId: session.stationId,
        energyDeliveredKwh: session.energyDelivered,
        pointsEarned: session.pointsEarned,
        status: "charging",
      });
    }),
  );
};

const simulateMarketplace = async () => {
  if (Math.random() > 0.6) return;
  const itemIds = ["energy-boost", "ride-credits", "solar-upgrade", "vip-pass"] as const;
  const itemId = random(itemIds);
  const wallet = bs58SampleKey();
  const points = Math.round(200 + Math.random() * 600);
  await postEvent({
    type: "points_purchase",
    itemId,
    wallet,
    points,
  });
  console.log(chalk.yellow(`[sim] Wallet ${wallet.slice(0, 4)}… redeemed ${itemId} for ${points} pts`));
};

const claimedPlots = new Map<string, { wallet: string; chargerLevel: number }>();

const simulateWorldClaim = async () => {
  if (Math.random() > 0.35) return;
  const regionKey = random(worldRegions);
  
  // Skip if already claimed
  if (claimedPlots.has(regionKey)) return;
  
  const wallet = bs58SampleKey();
  const chargerLevel = Math.floor(Math.random() * 3) + 1;
  const boosts = Array.from({ length: Math.floor(Math.random() * 3) }, (_, index) => ({
    label: [`Solar Array`, `Grid Sync`, `Community Boost`][index % 3],
    magnitude: Math.round(Math.random() * 20) / 10,
  }));
  
  claimedPlots.set(regionKey, { wallet, chargerLevel });
  
  await postEvent({
    type: "world_plot_claim",
    regionKey,
    wallet,
    boosts,
  });
  console.log(chalk.blue(`[sim] ${wallet.slice(0, 4)}… claimed virtual plot ${regionKey} with Level ${chargerLevel} charger`));
};

const simulateVirtualSession = async () => {
  // Only run if there are claimed plots
  if (claimedPlots.size === 0) return;
  if (Math.random() > 0.4) return;
  
  // Pick a random claimed plot
  const plotKeys = Array.from(claimedPlots.keys());
  const selectedPlotKey = random(plotKeys);
  const plotData = claimedPlots.get(selectedPlotKey);
  
  if (!plotData) return;
  
  const driver = random(drivers);
  const energyDelivered = Number((Math.random() * 15 + 5).toFixed(2));
  const basePoints = Math.round(energyDelivered * 80);
  
  // Calculate earnings with charger level multiplier
  const levelMultiplier = plotData.chargerLevel === 1 ? 1 : plotData.chargerLevel === 2 ? 2.5 : 5;
  const totalPoints = Math.round(basePoints * levelMultiplier);
  const ownerRevenue = Math.round(totalPoints * 0.1); // 10% revenue share
  
  await postEvent({
    type: "virtual_session_complete",
    regionKey: selectedPlotKey,
    owner: plotData.wallet,
    driver: driver.name,
    vehicleModel: driver.car,
    energyDeliveredKwh: energyDelivered,
    pointsEarned: totalPoints,
    ownerRevenue,
    chargerLevel: plotData.chargerLevel,
  });
  
  console.log(
    chalk.magenta(
      `[sim] Virtual session on ${selectedPlotKey} · ${energyDelivered} kWh · ${totalPoints} pts · Owner earns ${ownerRevenue} pts`
    )
  );
};

const bs58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58SampleKey = () =>
  Array.from({ length: 44 })
    .map(() => bs58Alphabet[Math.floor(Math.random() * bs58Alphabet.length)])
    .join("");

const tickStations = async () => {
  await Promise.all(
    stationIds.map((stationId) => {
      const payload = {
        type: "station_status",
        stationId,
        status: "online",
        livePowerKw: 60 + Math.random() * 50,
        utilizationPercent: 50 + Math.random() * 45,
        carbonOffsetKg: Math.random() * 15,
        dailyEnergyKwh: 400 + Math.random() * 250,
      };
      return postEvent(payload);
    }),
  );
};

const startSimulator = async () => {
  console.log(chalk.bold.cyan("🔌 DeCharge simulator booting up"));
  console.log(chalk.gray(`Gateway endpoint: ${ingestUrl}`));

  await bootstrapStations();

  // Kick off cycles
  setInterval(() => {
    void startSession().catch((error) => console.error(chalk.red(`[sim] Failed to start session: ${error}`)));
  }, 14_000);

  setInterval(() => {
    void updateSessions().catch((error) => console.error(chalk.red(`[sim] Failed to update session: ${error}`)));
  }, 6_000);

  setInterval(() => {
    void tickStations().catch((error) => console.error(chalk.red(`[sim] Failed to refresh stations: ${error}`)));
  }, 18_000);

  setInterval(() => {
    void simulateMarketplace().catch((error) => console.error(chalk.red(`[sim] Marketplace failure: ${error}`)));
  }, 22_000);

  setInterval(() => {
    void simulateWorldClaim().catch((error) => console.error(chalk.red(`[sim] World claim failure: ${error}`)));
  }, 28_000);

  setInterval(() => {
    void simulateVirtualSession().catch((error) => console.error(chalk.red(`[sim] Virtual session failure: ${error}`)));
  }, 12_000);

  console.log(chalk.bold.green("✅ Simulator is streaming telemetry. Leave this process running."));
};

startSimulator().catch((error) => {
  console.error(chalk.red(`[sim] Simulator failed to start: ${error instanceof Error ? error.message : error}`));
  process.exit(1);
});