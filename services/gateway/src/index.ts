import fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import type { SocketStream } from "@fastify/websocket";
import cors from "@fastify/cors";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  GatewayLiveEvent,
  GatewayMarketplaceItem,
  GatewaySession,
  GatewayStation,
  GatewayWorldPlot,
} from "@decharge/types";

type PointsPurchasePayload = Extract<
  GatewayLiveEvent,
  { type: "points_purchase" }
>["payload"];

interface GatewayState {
  stations: Map<string, GatewayStation>;
  sessions: Map<string, GatewaySession>;
  marketplace: GatewayMarketplaceItem[];
  world: Map<string, GatewayWorldPlot>;
  recentEvents: GatewayLiveEvent[];
}

const ingestionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("session_start"),
    stationId: z.string(),
    driver: z.string(),
    vehicleModel: z.string(),
    pointsEarned: z.number().nonnegative().default(0),
    energyDeliveredKwh: z.number().nonnegative().default(0),
    timestamp: z.number().default(() => Date.now()),
  }),
  z.object({
    type: z.literal("session_update"),
    sessionId: z.string(),
    stationId: z.string(),
    energyDeliveredKwh: z.number().nonnegative(),
    pointsEarned: z.number().nonnegative(),
    status: z.enum(["charging", "completed", "aborted"]).default("charging"),
    timestamp: z.number().default(() => Date.now()),
  }),
  z.object({
    type: z.literal("session_complete"),
    sessionId: z.string(),
    stationId: z.string(),
    energyDeliveredKwh: z.number().nonnegative(),
    pointsEarned: z.number().nonnegative(),
    timestamp: z.number().default(() => Date.now()),
  }),
  z.object({
    type: z.literal("station_status"),
    stationId: z.string(),
    status: z.enum(["online", "offline", "maintenance"]),
    livePowerKw: z.number().nonnegative(),
    utilizationPercent: z.number().min(0).max(100),
    carbonOffsetKg: z.number().nonnegative(),
    dailyEnergyKwh: z.number().nonnegative(),
    timestamp: z.number().default(() => Date.now()),
  }),
  z.object({
    type: z.literal("points_purchase"),
    itemId: z.string(),
    wallet: z.string(),
    points: z.number().positive(),
    timestamp: z.number().default(() => Date.now()),
  }),
  z.object({
    type: z.literal("world_plot_claim"),
    regionKey: z.string(),
    wallet: z.string(),
    boosts: z.array(z.object({ label: z.string(), magnitude: z.number() })).default([]),
    timestamp: z.number().default(() => Date.now()),
  }),
]);

const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
  },
});

void app.register(cors, {
  origin: true,
});

void app.register(websocketPlugin);

const state: GatewayState = {
  stations: new Map<string, GatewayStation>(),
  sessions: new Map<string, GatewaySession>(),
  marketplace: [
    {
      id: "energy-boost",
      title: "Ultra-fast Charge Booster",
      category: "energy",
      description: "Deploy 15-minute boost for any partner station during peak hours.",
      pointsCost: 480,
      cashPriceUsd: 65,
      savingsPercent: 32,
      deliveryType: "digital",
      inventory: 250,
    },
    {
      id: "ride-credits",
      title: "Heliox Mobility Ride Pack",
      category: "mobility",
      description: "5 ride credits across participating EV ride-hailing partners.",
      pointsCost: 320,
      cashPriceUsd: 48,
      savingsPercent: 40,
      deliveryType: "on-chain",
      inventory: 400,
    },
    {
      id: "solar-upgrade",
      title: "Solar Canopy Upgrade",
      category: "energy",
      description: "Unlock solar canopy upgrade for your favorite station in the metaverse world.",
      pointsCost: 1200,
      cashPriceUsd: 210,
      savingsPercent: 25,
      deliveryType: "physical",
      inventory: 25,
    },
    {
      id: "vip-pass",
      title: "DeCharge VIP Pass",
      category: "perks",
      description: "Priority queuing, merch drops, and beta access to new experiences.",
      pointsCost: 950,
      cashPriceUsd: 130,
      savingsPercent: 41,
      deliveryType: "digital",
      inventory: 150,
    },
  ],
  world: new Map<string, GatewayWorldPlot>(),
  recentEvents: [],
};

const websocketClients = new Set<SocketStream["socket"]>();

interface BroadcastOptions {
  persist?: boolean;
}

const broadcast = (event: GatewayLiveEvent, options: BroadcastOptions = {}) => {
  if (options.persist ?? true) {
    state.recentEvents.push(event);
    if (state.recentEvents.length > 200) {
      state.recentEvents.splice(0, state.recentEvents.length - 200);
    }
  }

  for (const client of websocketClients) {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(event));
    }
  }
};

const persistSession = (session: GatewaySession) => {
  state.sessions.set(session.id, session);
  const station = state.stations.get(session.stationId);
  if (station) {
    station.activeSessionId = session.status === "charging" ? session.id : undefined;
  }
};

const ensureStation = (stationId: string): GatewayStation => {
  const existing = state.stations.get(stationId);
  if (existing) return existing;

  const placeholder: GatewayStation = {
    id: stationId,
    name: `Station ${stationId.slice(0, 4).toUpperCase()}`,
    location: {
      city: "Neo Cascadia",
      latitude: 47.6062,
      longitude: -122.3321,
    },
    connectors: ["CCS", "CHAdeMO"],
    status: "online",
    livePowerKw: 0,
    dailyEnergyKwh: 0,
    utilizationPercent: 0,
    carbonOffsetKg: 0,
  };

  state.stations.set(stationId, placeholder);
  return placeholder;
};

app.register(async (instance) => {
  instance.get("/stream", { websocket: true }, (connection) => {
    const { socket } = connection;
    websocketClients.add(socket);
    socket.send(
      JSON.stringify({
        type: "bootstrap",
        payload: {
          stations: Array.from(state.stations.values()),
          sessions: Array.from(state.sessions.values()),
          marketplace: state.marketplace,
          world: Array.from(state.world.values()),
          recentEvents: state.recentEvents,
        },
      }),
    );

    socket.on("close", () => {
      websocketClients.delete(socket);
    });
  });
});

app.get("/api/health", async () => {
  return { status: "ok", time: Date.now() };
});

app.get("/api/dashboard", async () => {
  const stations = Array.from(state.stations.values());
  const sessions = Array.from(state.sessions.values());
  const activeSessions = sessions.filter((session) => session.status === "charging");
  const totalEnergy = sessions.reduce((acc, session) => acc + session.energyDeliveredKwh, 0);
  const totalPoints = sessions.reduce((acc, session) => acc + session.pointsEarned, 0);
  const avgUtilization =
    stations.length === 0
      ? 0
      : stations.reduce((acc, station) => acc + station.utilizationPercent, 0) /
        stations.length;

  return {
    network: {
      stationCount: stations.length,
      onlineStations: stations.filter((station) => station.status === "online").length,
      energyDeliveredKwh: totalEnergy,
      carbonOffsetKg: stations.reduce((acc, station) => acc + station.carbonOffsetKg, 0),
      avgUtilizationPercent: Number(avgUtilization.toFixed(1)),
    },
    sessions: {
      active: activeSessions.length,
      recent: sessions
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 10),
    },
    economy: {
      totalPointsIssued: totalPoints,
      marketplaceInventory: state.marketplace.reduce(
        (acc, item) => acc + item.inventory,
        0,
      ),
    },
    world: {
      plotsClaimed: state.world.size,
    },
  };
});

app.get("/api/stations", async () => {
  return { stations: Array.from(state.stations.values()) };
});

app.get("/api/sessions", async (request) => {
  const querySchema = z.object({
    limit: z
      .string()
      .transform((value) => Number.parseInt(value, 10))
      .refine((value) => Number.isFinite(value) && value > 0 && value <= 200, {
        message: "limit must be between 1 and 200",
      })
      .optional(),
  });

  const parsed = querySchema.safeParse(request.query);
  if (!parsed.success) {
    return {
      error: "invalid_query",
      details: parsed.error.flatten(),
    };
  }

  const limit = parsed.data.limit ?? 50;
  const sessions = Array.from(state.sessions.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);

  return { sessions };
});

app.get("/api/marketplace", async () => {
  return { items: state.marketplace };
});

app.get("/api/world", async () => {
  return { plots: Array.from(state.world.values()) };
});

app.get("/api/events", async () => {
  return { events: state.recentEvents.slice(-100) };
});

app.post("/ingest", async (request, reply) => {
  const parsed = ingestionSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.status(400);
    return {
      error: "invalid_payload",
      details: parsed.error.flatten(),
    } as const;
  }

  const event = parsed.data;

  switch (event.type) {
    case "session_start": {
      const station = ensureStation(event.stationId);
      const sessionId = randomUUID();
      const session: GatewaySession = {
        id: sessionId,
        stationId: station.id,
        driver: event.driver,
        vehicleModel: event.vehicleModel,
        startedAt: event.timestamp,
        updatedAt: event.timestamp,
        energyDeliveredKwh: event.energyDeliveredKwh,
        pointsEarned: event.pointsEarned,
        status: "charging",
      };
      persistSession(session);
      station.activeSessionId = session.id;
      broadcast({ type: "session_start", payload: session });
      return { ok: true, sessionId } as const;
    }
    case "session_update": {
      const existing = state.sessions.get(event.sessionId);
      if (!existing) {
        reply.status(404);
        return { error: "session_not_found" } as const;
      }
      existing.energyDeliveredKwh = event.energyDeliveredKwh;
      existing.pointsEarned = event.pointsEarned;
      existing.status = event.status;
      existing.updatedAt = event.timestamp;
      persistSession(existing);
      broadcast({ type: "session_update", payload: existing });
      return { ok: true } as const;
    }
    case "session_complete": {
      const existing = state.sessions.get(event.sessionId);
      if (!existing) {
        reply.status(404);
        return { error: "session_not_found" } as const;
      }
      existing.energyDeliveredKwh = event.energyDeliveredKwh;
      existing.pointsEarned = event.pointsEarned;
      existing.status = "completed";
      existing.endedAt = event.timestamp;
      existing.updatedAt = event.timestamp;
      persistSession(existing);
      broadcast({ type: "session_complete", payload: existing });
      return { ok: true } as const;
    }
    case "station_status": {
      const station = ensureStation(event.stationId);
      station.status = event.status;
      station.livePowerKw = event.livePowerKw;
      station.utilizationPercent = event.utilizationPercent;
      station.dailyEnergyKwh = event.dailyEnergyKwh;
      station.carbonOffsetKg = event.carbonOffsetKg;
      broadcast({ type: "station_status", payload: station });
      return { ok: true } as const;
    }
    case "points_purchase": {
      const item = state.marketplace.find((entry) => entry.id === event.itemId);
      if (!item) {
        reply.status(404);
        return { error: "item_not_found" } as const;
      }
      if (item.inventory > 0) {
        item.inventory -= 1;
      }
      const payload: PointsPurchasePayload = {
        itemId: item.id,
        wallet: event.wallet,
        points: event.points,
        timestamp: event.timestamp,
        remainingInventory: item.inventory,
      };
      broadcast({ type: "points_purchase", payload });
      return { ok: true } as const;
    }
    case "world_plot_claim": {
      const plot: GatewayWorldPlot = {
        regionKey: event.regionKey,
        coordinates: [Math.random() * 200 - 100, 0, Math.random() * 200 - 100],
        owner: event.wallet,
        powerScore: Math.round(Math.random() * 1000) / 10,
        vibe: ["eco", "tech", "community"][
          Math.floor(Math.random() * 3)
        ] as GatewayWorldPlot["vibe"],
        boosts: event.boosts,
      };
      state.world.set(plot.regionKey, plot);
      broadcast({ type: "world_plot_claim", payload: plot });
      return { ok: true } as const;
    }
    default:
      return { ok: true } as const;
  }
});

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const host = process.env.HOST ?? "0.0.0.0";

app.listen({ port, host })
  .then(() => {
    app.log.info(`Gateway running on http://${host}:${port}`);
  })
  .catch((error) => {
    app.log.error(error, "Failed to start gateway");
    process.exit(1);
  });