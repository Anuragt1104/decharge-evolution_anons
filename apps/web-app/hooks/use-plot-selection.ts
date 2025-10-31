"use client";

import { create } from "zustand";
import type { GatewayWorldPlot } from "@decharge/sdk";

interface PlotSelectionState {
  selectedPlot: GatewayWorldPlot | null;
  selectPlot: (plot: GatewayWorldPlot | null) => void;
  clearSelection: () => void;
}

export const usePlotSelectionStore = create<PlotSelectionState>((set) => ({
  selectedPlot: null,
  selectPlot: (plot) => set({ selectedPlot: plot }),
  clearSelection: () => set({ selectedPlot: null }),
}));

export const usePlotSelection = () => {
  const selectedPlot = usePlotSelectionStore((state) => state.selectedPlot);
  const selectPlot = usePlotSelectionStore((state) => state.selectPlot);
  const clearSelection = usePlotSelectionStore((state) => state.clearSelection);

  return {
    selectedPlot,
    selectPlot,
    clearSelection,
    isPlotSelected: (plot: GatewayWorldPlot) => selectedPlot?.regionKey === plot.regionKey,
  };
};

