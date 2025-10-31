import { AnchorProvider, BN, Program, setProvider, type Idl } from "@coral-xyz/anchor";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { z } from "zod";

import {
  GatewayLiveEvent,
  GatewayMarketplaceItem,
  GatewaySession,
  GatewayStation,
  GatewayWorldPlot,
  gatewayLiveEventSchema,
  gatewayMarketplaceItemSchema,
  gatewaySessionSchema,
  gatewayStationSchema,
  gatewayWorldPlotSchema,
} from "@decharge/types";

export interface GatewayClientOptions {
  baseUrl?: string;
  websocketUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface SubscribeOptions {
  onEvent: (event: GatewayLiveEvent) => void;
  onError?: (error: unknown) => void;
  autoReconnect?: boolean;
}

const dashboardSchema = z.object({
  network: z.object({
    stationCount: z.number(),
    onlineStations: z.number(),
    energyDeliveredKwh: z.number(),
    carbonOffsetKg: z.number(),
    avgUtilizationPercent: z.number(),
  }),
  sessions: z.object({
    active: z.number(),
    recent: z.array(
      z.object({
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
      }),
    ),
  }),
  economy: z.object({
    totalPointsIssued: z.number(),
    marketplaceInventory: z.number(),
  }),
  world: z.object({
    plotsClaimed: z.number(),
  }),
});

export type GatewayDashboard = z.infer<typeof dashboardSchema>;

export class DechargeGatewayClient {
  readonly baseUrl: string;
  readonly websocketUrl: string;
  readonly fetchImpl: typeof fetch;

  constructor(options: GatewayClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_DECHARGE_GATEWAY ?? "http://localhost:8787";
    this.websocketUrl =
      options.websocketUrl ??
      process.env.NEXT_PUBLIC_DECHARGE_GATEWAY_WS ??
      this.baseUrl.replace(/^http/, "ws") + "/stream";
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    const response = await this.fetchImpl(new URL(path, this.baseUrl));
    if (!response.ok) {
      throw new Error(`Gateway request failed: ${response.status}`);
    }
    const data = await response.json();
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }
    return parsed.data;
  }

  async dashboard(): Promise<GatewayDashboard> {
    return this.get("/api/dashboard", dashboardSchema);
  }

  async stations(): Promise<GatewayStation[]> {
    const schema = z.object({ stations: z.array(z.unknown()) });
    const data = await this.get("/api/stations", schema);
    return data.stations.map((entry) => gatewayStationSchema.parse(entry));
  }

  async sessions(limit = 50): Promise<GatewaySession[]> {
    const schema = z.object({ sessions: z.array(z.unknown()) });
    const data = await this.get(`/api/sessions?limit=${limit}`, schema);
    return data.sessions.map((entry) => gatewaySessionSchema.parse(entry));
  }

  async marketplace(): Promise<GatewayMarketplaceItem[]> {
    const schema = z.object({ items: z.array(z.unknown()) });
    const data = await this.get("/api/marketplace", schema);
    return data.items.map((entry) => gatewayMarketplaceItemSchema.parse(entry));
  }

  async world(): Promise<GatewayWorldPlot[]> {
    const schema = z.object({ plots: z.array(z.unknown()) });
    const data = await this.get("/api/world", schema);
    return data.plots.map((entry) => gatewayWorldPlotSchema.parse(entry));
  }

  async events(): Promise<GatewayLiveEvent[]> {
    const schema = z.object({ events: z.array(z.unknown()) });
    const data = await this.get("/api/events", schema);
    return data.events
      .map((entry) => gatewayLiveEventSchema.safeParse(entry))
      .filter((result): result is { success: true; data: GatewayLiveEvent } => result.success)
      .map((result) => result.data);
  }

  subscribe(options: SubscribeOptions): () => void {
    let closed = false;
    let socket: WebSocket | undefined;

    const connect = () => {
      if (closed) return;
      socket = new WebSocket(this.websocketUrl);

      socket.onmessage = (event) => {
        try {
          const parsed = gatewayLiveEventSchema.parse(JSON.parse(event.data as string));
          options.onEvent(parsed);
        } catch (error) {
          options.onError?.(error);
        }
      };

      socket.onerror = (error) => {
        options.onError?.(error);
      };

      socket.onclose = () => {
        if (!closed && options.autoReconnect !== false) {
          setTimeout(connect, 1500);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      socket?.close();
    };
  }
}

export interface AnchorClientOptions {
  connection?: Connection;
  commitment?: "processed" | "confirmed" | "finalized";
  wallet?: AnchorProvider["wallet"];
}

export const DECHARGE_PROGRAM_ID = new PublicKey("DeChrg11111111111111111111111111111111111111");

export type DechargeIdl = Idl;

export type DechargeProgram = Program<DechargeIdl>;

let cachedIdl: DechargeIdl | null = null;

export const setDechargeIdl = (idl: DechargeIdl) => {
  cachedIdl = idl;
};

const resolveIdl = (idl?: DechargeIdl): DechargeIdl => {
  if (idl) {
    return idl;
  }
  if (cachedIdl) {
    return cachedIdl;
  }
  throw new Error(
    "Decharge IDL is not set. Call setDechargeIdl(idl) or supply an IDL to getDechargeProgram().",
  );
};

export const buildAnchorProvider = ({
  connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com"),
  commitment = "confirmed",
  wallet,
}: AnchorClientOptions = {}) => {
  if (!wallet) {
    throw new WalletNotConnectedError();
  }
  const provider = new AnchorProvider(connection, wallet, { commitment });
  setProvider(provider);
  return provider;
};

export const getDechargeProgram = (
  provider: AnchorProvider,
  idl?: DechargeIdl,
): DechargeProgram => {
  const resolvedIdl = resolveIdl(idl);
  return new Program<DechargeIdl>(resolvedIdl, provider);
};

export const loadDechargeIdlFromUrl = async (
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DechargeIdl> => {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Failed to load Decharge IDL from ${url} (status ${response.status})`);
  }
  return (await response.json()) as DechargeIdl;
};

export interface SessionPerformance {
  pointsPerKwh: number;
  energyPerMinute: number;
}

export const calculateSessionPerformance = (session: GatewaySession): SessionPerformance => {
  const durationMinutes = Math.max(1, (session.updatedAt - session.startedAt) / (1000 * 60));
  return {
    pointsPerKwh: session.pointsEarned / Math.max(0.25, session.energyDeliveredKwh),
    energyPerMinute: session.energyDeliveredKwh / durationMinutes,
  };
};

export const decodeBase58 = (value: string) => bs58.decode(value);

export const encodeBase58 = (bytes: Uint8Array) => bs58.encode(bytes);

export { BN };

// Re-export gateway types for convenience
export type {
  GatewayStation,
  GatewaySession,
  GatewayMarketplaceItem,
  GatewayWorldPlot,
  GatewayLiveEvent,
} from "@decharge/types";