import { formatDistanceStrict } from "date-fns";

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const MICROS_PER_POINT = 1_000_000;

export function formatMicrounits(value: number, unit: string): string {
  const normalized = value / 1_000_000;
  return `${normalized.toFixed(2)} ${unit}`;
}

export function formatEnergy(wh: number): string {
  if (wh < 1_000) {
    return `${wh.toFixed(0)} Wh`;
  }
  const kwh = wh / 1_000;
  return `${kwh.toFixed(2)} kWh`;
}

export function formatDuration(seconds: number): string {
  const now = new Date(0);
  const target = new Date(seconds * 1_000);
  return formatDistanceStrict(target, now, { addSuffix: false });
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function pointsToMicrounits(points: number): number {
  return Math.round(points * MICROS_PER_POINT);
}

export function microunitsToPoints(micros: number): number {
  return micros / MICROS_PER_POINT;
}

export function computeSessionPrice(
  energyWh: number,
  seconds: number,
  energyPriceMicros: number,
  timePriceMicros: number,
): { energyMicrounits: number; timeMicrounits: number; totalMicrounits: number } {
  const energyMicrounits = Math.round(energyWh * energyPriceMicros);
  const timeMicrounits = Math.round(seconds * timePriceMicros);
  return {
    energyMicrounits,
    timeMicrounits,
    totalMicrounits: energyMicrounits + timeMicrounits,
  };
}

const regionCoordinates: Record<string, { latitude: number; longitude: number }> = {
  "Solana Valley": { latitude: 37.7749, longitude: -122.4194 },
  "Aurora Heights": { latitude: 34.0522, longitude: -118.2437 },
  "Helius Harbor": { latitude: 40.7128, longitude: -74.006 },
  "Triton Fields": { latitude: 47.6062, longitude: -122.3321 },
  "Anchor Alley": { latitude: 51.5074, longitude: -0.1278 },
};

export function regionToCoordinates(regionKey: string): { latitude: number; longitude: number } {
  return regionCoordinates[regionKey] ?? { latitude: 0, longitude: 0 };
}

export function telemetryHashFromInputs(...values: (string | number)[]): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(values.join(":"));
  let hash = 0;
  for (let i = 0; i < data.length; i += 1) {
    hash = (hash << 5) - hash + data[i];
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}