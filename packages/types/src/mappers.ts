import type { IdlAccountItem } from "@coral-xyz/anchor/dist/cjs/idl";
import type { AccountInfo } from "@solana/web3.js";

import type {
  ChargingSession,
  ChargingStation,
  DriverProfile,
  WorldPlot,
} from "./index";

const textDecoder = new TextDecoder();

function trimNulls(value: Uint8Array): string {
  return textDecoder.decode(value).replace(/\u0000+$/, "").trim();
}

export interface AccountDecoder<T> {
  (account: AccountInfo<Buffer>, item: IdlAccountItem): T;
}

export interface AnchorCoder<T> {
  encode(data: T): Buffer;
  decode(buffer: Buffer): T;
}

export function mapStationAccount(account: any): ChargingStation {
  return {
    publicKey: account.publicKey.toBase58(),
    name: trimNulls(account.account.name),
    city: trimNulls(account.account.city),
    latitude: account.account.latitude_micro / 1_000_000,
    longitude: account.account.longitude_micro / 1_000_000,
    maxKw: account.account.max_kw,
    pricingEnergyMicrounits: Number(account.account.pricing_energy_microunits),
    pricingTimeMicrounits: Number(account.account.pricing_time_microunits),
    uri: trimNulls(account.account.uri),
  };
}

export function mapDriverProfile(account: any): DriverProfile {
  return {
    publicKey: account.publicKey.toBase58(),
    totalSessions: Number(account.account.total_sessions),
    totalEnergyWh: Number(account.account.total_energy_wh),
    totalPointsEarned: Number(account.account.total_points_earned),
    outstandingPoints: Number(account.account.outstanding_points),
  };
}

export function mapSessionAccount(account: any, station: ChargingStation): ChargingSession {
  const status: "active" | "closed" = account.account.status.closed ? "closed" : "active";
  return {
    publicKey: account.publicKey.toBase58(),
    station,
    driver: { publicKey: account.account.driver.toBase58() },
    sessionCounter: Number(account.account.session_counter),
    energyWh: Number(account.account.energy_wh),
    secondsElapsed: Number(account.account.seconds_elapsed),
    status,
    priceMicrounits: Number(account.account.price_microunits),
    pointsEarned: Number(account.account.points_earned),
    openedAt: Number(account.account.opened_at),
    closedAt: account.account.closed_at ? Number(account.account.closed_at) : null,
    telemetryHash: Buffer.from(account.account.telemetry_hash).toString("hex"),
  };
}

export function mapWorldPlotAccount(account: any): WorldPlot {
  return {
    publicKey: account.publicKey.toBase58(),
    owner: account.account.owner.toBase58(),
    regionKey: trimNulls(account.account.region_key),
    slotCapacity: Number(account.account.slot_capacity),
    upgradeLevel: Number(account.account.upgrade_level),
    lastRewardTime: Number(account.account.last_reward_time),
  };
}