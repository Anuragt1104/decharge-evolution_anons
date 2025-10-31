"use client";

import { create } from "zustand";

import type {
  GatewayDashboard,
  GatewayLiveEvent,
  GatewayMarketplaceItem,
  GatewaySession,
  GatewayStation,
  GatewayWorldPlot,
} from "@decharge/sdk";

interface GatewayStoreState {
  hydrated: boolean;
  stations: Record<string, GatewayStation>;
  sessions: Record<string, GatewaySession>;
  marketplace: GatewayMarketplaceItem[];
  world: Record<string, GatewayWorldPlot>;
  events: GatewayLiveEvent[];
  dashboard?: GatewayDashboard;
  hydrate(payload: {
    stations: GatewayStation[];
    sessions: GatewaySession[];
    marketplace: GatewayMarketplaceItem[];
    world: GatewayWorldPlot[];
    events: GatewayLiveEvent[];
    dashboard?: GatewayDashboard;
  }): void;
  upsertStation(station: GatewayStation): void;
  upsertSession(session: GatewaySession): void;
  updateMarketplace(items: GatewayMarketplaceItem[]): void;
  upsertWorldPlot(plot: GatewayWorldPlot): void;
  addEvent(event: GatewayLiveEvent): void;
  setDashboard(dashboard: GatewayDashboard): void;
}

export const useGatewayStore = create<GatewayStoreState>((set) => ({
  hydrated: false,
  stations: {},
  sessions: {},
  marketplace: [],
  world: {},
  events: [],
  dashboard: undefined,
  hydrate: ({ stations, sessions, marketplace, world, events, dashboard }) =>
    set(() => ({
      hydrated: true,
      stations: Object.fromEntries(stations.map((station) => [station.id, station])),
      sessions: Object.fromEntries(sessions.map((session) => [session.id, session])),
      marketplace: marketplace.slice(),
      world: Object.fromEntries(world.map((plot) => [plot.regionKey, plot])),
      events: events.slice(-200),
      dashboard,
    })),
  upsertStation: (station) =>
    set((state) => ({
      stations: {
        ...state.stations,
        [station.id]: station,
      },
    })),
  upsertSession: (session) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        [session.id]: session,
      },
    })),
  updateMarketplace: (items) =>
    set(() => ({
      marketplace: items,
    })),
  upsertWorldPlot: (plot) =>
    set((state) => ({
      world: {
        ...state.world,
        [plot.regionKey]: plot,
      },
    })),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events.slice(-199), event],
    })),
  setDashboard: (dashboard) =>
    set(() => ({
      dashboard,
    })),
}));

export const selectStations = (state: GatewayStoreState) => Object.values(state.stations);
export const selectSessions = (state: GatewayStoreState) =>
  Object.values(state.sessions).sort((a, b) => b.updatedAt - a.updatedAt);
export const selectMarketplace = (state: GatewayStoreState) => state.marketplace;
export const selectWorld = (state: GatewayStoreState) => Object.values(state.world);
export const selectEvents = (state: GatewayStoreState) => state.events;
export const selectDashboard = (state: GatewayStoreState) => state.dashboard;
export const selectHydrated = (state: GatewayStoreState) => state.hydrated;