import { z } from "zod";

export const sessionStatusSchema = z.enum(["active", "closed"]);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const chargingStationSchema = z.object({
  publicKey: z.string(),
  name: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  maxKw: z.number(),
  pricingEnergyMicrounits: z.number(),
  pricingTimeMicrounits: z.number(),
  uri: z.string().optional(),
});
export type ChargingStation = z.infer<typeof chargingStationSchema>;

export const driverProfileSchema = z.object({
  publicKey: z.string(),
  totalSessions: z.number(),
  totalEnergyWh: z.number(),
  totalPointsEarned: z.number(),
  outstandingPoints: z.number(),
});
export type DriverProfile = z.infer<typeof driverProfileSchema>;

export const chargingSessionSchema = z.object({
  publicKey: z.string(),
  station: chargingStationSchema,
  driver: driverProfileSchema.pick({ publicKey: true }),
  sessionCounter: z.number(),
  energyWh: z.number(),
  secondsElapsed: z.number(),
  status: sessionStatusSchema,
  priceMicrounits: z.number(),
  pointsEarned: z.number(),
  openedAt: z.number(),
  closedAt: z.number().nullable(),
  telemetryHash: z.string(),
});
export type ChargingSession = z.infer<typeof chargingSessionSchema>;

export const pointsMarketplaceOrderSchema = z.object({
  id: z.string(),
  driver: driverProfileSchema.pick({ publicKey: true }),
  station: chargingStationSchema.pick({ publicKey: true, name: true, city: true }),
  priceLamports: z.number(),
  pointsAvailable: z.number(),
  pointsUnitPriceMicrounits: z.number(),
  expiresAt: z.number(),
});
export type PointsMarketplaceOrder = z.infer<typeof pointsMarketplaceOrderSchema>;

export const worldPlotSchema = z.object({
  publicKey: z.string(),
  owner: z.string(),
  regionKey: z.string(),
  slotCapacity: z.number(),
  upgradeLevel: z.number(),
  lastRewardTime: z.number(),
});
export type WorldPlot = z.infer<typeof worldPlotSchema>;

export const liveEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("session.started"),
    payload: chargingSessionSchema,
  }),
  z.object({
    type: z.literal("session.updated"),
    payload: chargingSessionSchema.pick({
      publicKey: true,
      energyWh: true,
      secondsElapsed: true,
      pointsEarned: true,
      priceMicrounits: true,
      telemetryHash: true,
    }),
  }),
  z.object({
    type: z.literal("session.closed"),
    payload: chargingSessionSchema,
  }),
  z.object({
    type: z.literal("order.updated"),
    payload: pointsMarketplaceOrderSchema,
  }),
  z.object({
    type: z.literal("world.plot"),
    payload: worldPlotSchema,
  }),
]);
export type LiveEvent = z.infer<typeof liveEventSchema>;

export const telemetrySampleSchema = z.object({
  sessionId: z.string(),
  energyDeltaWh: z.number(),
  secondsDelta: z.number(),
  telemetryHash: z.string(),
  timestamp: z.number(),
});
export type TelemetrySample = z.infer<typeof telemetrySampleSchema>;

export const sessionLifecycleSchema = z.object({
  start: chargingSessionSchema,
  telemetry: z.array(telemetrySampleSchema).default([]),
  close: chargingSessionSchema.optional(),
});
export type SessionLifecycle = z.infer<typeof sessionLifecycleSchema>;

export const priceBreakdownSchema = z.object({
  energyMicrounits: z.number(),
  timeMicrounits: z.number(),
  totalMicrounits: z.number(),
});
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>;

export const platformConfigSchema = z.object({
  admin: z.string(),
  oracle: z.string(),
  pointMint: z.string(),
  pointRateMicrounits: z.number(),
  paymentTreasury: z.string(),
  worldTreasury: z.string(),
});
export type PlatformConfig = z.infer<typeof platformConfigSchema>;

export const dechargeDataSchema = z.object({
  config: platformConfigSchema,
  stations: z.array(chargingStationSchema),
  sessions: z.array(chargingSessionSchema),
  marketplace: z.array(pointsMarketplaceOrderSchema),
  plots: z.array(worldPlotSchema),
});
export type DechargeDataBundle = z.infer<typeof dechargeDataSchema>;

export const gatewayStationSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.object({
    city: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  connectors: z.array(z.string()),
  status: z.enum(["online", "offline", "maintenance"]),
  livePowerKw: z.number(),
  dailyEnergyKwh: z.number(),
  utilizationPercent: z.number(),
  carbonOffsetKg: z.number(),
  activeSessionId: z.string().optional(),
});
export type GatewayStation = z.infer<typeof gatewayStationSchema>;

export const gatewaySessionSchema = z.object({
  id: z.string(),
  stationId: z.string(),
  driver: z.string(),
  vehicleModel: z.string(),
  startedAt: z.number(),
  updatedAt: z.number(),
  endedAt: z.number().optional(),
  energyDeliveredKwh: z.number(),
  pointsEarned: z.number(),
  status: z.enum(["charging", "completed", "aborted"]),
});
export type GatewaySession = z.infer<typeof gatewaySessionSchema>;

export const gatewayMarketplaceItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(["energy", "mobility", "perks"]),
  description: z.string(),
  pointsCost: z.number(),
  cashPriceUsd: z.number(),
  savingsPercent: z.number(),
  deliveryType: z.enum(["digital", "physical", "on-chain"]),
  inventory: z.number(),
});
export type GatewayMarketplaceItem = z.infer<typeof gatewayMarketplaceItemSchema>;

export const gatewayWorldPlotSchema = z.object({
  regionKey: z.string(),
  coordinates: z.tuple([z.number(), z.number(), z.number()]),
  owner: z.string().optional(),
  powerScore: z.number(),
  vibe: z.enum(["eco", "tech", "community"]),
  boosts: z.array(z.object({ label: z.string(), magnitude: z.number() })),
});
export type GatewayWorldPlot = z.infer<typeof gatewayWorldPlotSchema>;

export const gatewayLiveEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("session_start"),
    payload: gatewaySessionSchema,
  }),
  z.object({
    type: z.literal("session_update"),
    payload: gatewaySessionSchema,
  }),
  z.object({
    type: z.literal("session_complete"),
    payload: gatewaySessionSchema,
  }),
  z.object({
    type: z.literal("station_status"),
    payload: gatewayStationSchema,
  }),
  z.object({
    type: z.literal("points_purchase"),
    payload: z.object({
      itemId: z.string(),
      wallet: z.string(),
      points: z.number(),
      timestamp: z.number(),
      remainingInventory: z.number().optional(),
    }),
  }),
  z.object({
    type: z.literal("world_plot_claim"),
    payload: gatewayWorldPlotSchema,
  }),
  z.object({
    type: z.literal("bootstrap"),
    payload: z.object({
      stations: z.array(gatewayStationSchema),
      sessions: z.array(gatewaySessionSchema),
      marketplace: z.array(gatewayMarketplaceItemSchema),
      world: z.array(gatewayWorldPlotSchema),
      recentEvents: z.array(z.unknown()).default([]),
    }),
  }),
]);
export type GatewayLiveEvent = z.infer<typeof gatewayLiveEventSchema>;

export * from "./mappers";