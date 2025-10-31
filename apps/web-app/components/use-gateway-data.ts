"use client";

import { useEffect, useMemo } from "react";

import {
  DechargeGatewayClient,
  type GatewayDashboard,
  type GatewayLiveEvent,
} from "@decharge/sdk";

import {
  selectDashboard,
  selectEvents,
  selectHydrated,
  selectMarketplace,
  selectSessions,
  selectStations,
  selectWorld,
  useGatewayStore,
} from "@/lib/gateway-store";

const isBootstrapEvent = (event: GatewayLiveEvent): event is Extract<GatewayLiveEvent, { type: "bootstrap" }> =>
  event.type === "bootstrap";

const handleEvent = (event: GatewayLiveEvent) => {
  const store = useGatewayStore.getState();
  if (isBootstrapEvent(event)) {
    store.hydrate({
      stations: event.payload.stations,
      sessions: event.payload.sessions,
      marketplace: event.payload.marketplace,
      world: event.payload.world,
      events: event.payload.recentEvents as GatewayLiveEvent[],
    });
    return;
  }

  switch (event.type) {
    case "station_status":
      store.upsertStation(event.payload);
      break;
    case "session_start":
    case "session_update":
    case "session_complete":
      store.upsertSession(event.payload);
      break;
    case "points_purchase": {
      const items = store.marketplace.map((item) =>
        item.id === event.payload.itemId && item.inventory > 0
          ? {
              ...item,
              inventory:
                typeof event.payload.remainingInventory === "number"
                  ? event.payload.remainingInventory
                  : Math.max(item.inventory - 1, 0),
            }
          : item,
      );
      store.updateMarketplace(items);
      break;
    }
    case "world_plot_claim":
      store.upsertWorldPlot(event.payload);
      break;
  }

  store.addEvent(event);
};

export const useGatewayData = () => {
  const hydrate = useGatewayStore((state) => state.hydrate);
  const hydrated = useGatewayStore(selectHydrated);
  const setDashboard = useGatewayStore((state) => state.setDashboard);

  const stations = useGatewayStore(selectStations);
  const sessions = useGatewayStore(selectSessions);
  const marketplace = useGatewayStore(selectMarketplace);
  const world = useGatewayStore(selectWorld);
  const events = useGatewayStore(selectEvents);
  const dashboard = useGatewayStore(selectDashboard);

  const client = useMemo(() => new DechargeGatewayClient(), []);

  useEffect(() => {
    if (hydrated) return;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const [dashboardPayload, stationsPayload, sessionsPayload, marketplacePayload, worldPayload, eventsPayload] =
          await Promise.all([
            client.dashboard(),
            client.stations(),
            client.sessions(100),
            client.marketplace(),
            client.world(),
            client.events(),
          ]);

        if (cancelled) return;

        hydrate({
          stations: stationsPayload,
          sessions: sessionsPayload,
          marketplace: marketplacePayload,
          world: worldPayload,
          events: eventsPayload,
          dashboard: dashboardPayload,
        });
      } catch (error) {
        console.error("Failed to bootstrap gateway data", error);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [client, hydrate, hydrated]);

  useEffect(() => {
    const unsubscribe = client.subscribe({
      onEvent: (event) => {
        handleEvent(event);
      },
      onError: (error) => {
        console.error("Gateway stream error", error);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (dashboard) return;

    let cancelled = false;

    const syncDashboard = async () => {
      try {
        const payload: GatewayDashboard = await client.dashboard();
        if (!cancelled) {
          setDashboard(payload);
        }
      } catch (error) {
        console.error("Failed to refresh dashboard", error);
      }
    };

    void syncDashboard();

    const interval = setInterval(syncDashboard, 20_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [client, dashboard, setDashboard]);

  return {
    stations,
    sessions,
    marketplace,
    world,
    events,
    dashboard,
    hydrated,
  };
};