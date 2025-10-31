"use client";

import { WorldViewport } from "../world-viewport";
import { PlotDetailsPanel } from "./plot-details-panel";
import type { GatewayWorldPlot } from "@decharge/sdk";

interface WorldSceneWrapperProps {
  plots: GatewayWorldPlot[];
}

export function WorldSceneWrapper({ plots }: WorldSceneWrapperProps) {
  return (
    <div className="relative">
      <WorldViewport plots={plots} />
      <PlotDetailsPanel />
    </div>
  );
}

