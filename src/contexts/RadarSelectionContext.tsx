import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { RadarDiscovery } from "@/types/radarDiscovery";

interface RadarSelectionContextValue {
  selectedDiscovery: RadarDiscovery | null;
  selectDiscovery: (discovery: RadarDiscovery) => void;
  clearSelection: () => void;
  reviewCandidate: (discovery: RadarDiscovery) => void;
  registerReviewHandler: (handler: ((discovery: RadarDiscovery) => void) | null) => void;
}

const RadarSelectionContext = createContext<RadarSelectionContextValue | null>(null);

export function RadarSelectionProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [selectedDiscovery, setSelectedDiscovery] = useState<RadarDiscovery | null>(null);
  const [reviewHandler, setReviewHandler] = useState<((discovery: RadarDiscovery) => void) | null>(null);

  useEffect(() => {
    if (pathname !== "/radar") {
      setSelectedDiscovery(null);
    }
  }, [pathname]);

  const selectDiscovery = useCallback((discovery: RadarDiscovery) => {
    setSelectedDiscovery(discovery);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDiscovery(null);
  }, []);

  const reviewCandidate = useCallback(
    (discovery: RadarDiscovery) => {
      setSelectedDiscovery(discovery);
      reviewHandler?.(discovery);
    },
    [reviewHandler],
  );

  const registerReviewHandler = useCallback((handler: ((discovery: RadarDiscovery) => void) | null) => {
    setReviewHandler(() => handler);
  }, []);

  const value = useMemo(
    () => ({
      selectedDiscovery,
      selectDiscovery,
      clearSelection,
      reviewCandidate,
      registerReviewHandler,
    }),
    [selectedDiscovery, selectDiscovery, clearSelection, reviewCandidate, registerReviewHandler],
  );

  return <RadarSelectionContext.Provider value={value}>{children}</RadarSelectionContext.Provider>;
}

export function useRadarSelection() {
  const context = useContext(RadarSelectionContext);
  if (!context) {
    throw new Error("useRadarSelection must be used within RadarSelectionProvider");
  }
  return context;
}
