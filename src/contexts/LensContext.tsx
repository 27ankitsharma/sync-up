import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSyllabus } from "@/hooks/useSyllabus";
import { useUserProfile } from "@/hooks/useUser";
import { availableLenses, DEFAULT_LENS, resolveLens } from "@/lib/syllabusMetrics";

interface LensContextValue {
  selectedLens: string;
  lenses: string[];
  setSelectedLens: (lens: string) => void;
}

const LensContext = createContext<LensContextValue | null>(null);
const STORAGE_KEY = "syncradar:selectedLens";

function readStoredLens() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredLens(lens: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, lens);
  } catch {
    // Ignore storage failures; the lens should still apply for this session.
  }
}

export function LensProvider({ children }: { children: React.ReactNode }) {
  const { data: syllabus } = useSyllabus();
  const { data: profile } = useUserProfile();
  const lenses = useMemo(() => availableLenses(syllabus), [syllabus]);
  const [selectedLens, setSelectedLensState] = useState(() => readStoredLens() || DEFAULT_LENS);

  useEffect(() => {
    setSelectedLensState(
      resolveLens({
        stored: readStoredLens(),
        profileRole: profile?.role,
        lenses,
      }),
    );
  }, [lenses, profile?.role]);

  const setSelectedLens = useCallback((lens: string) => {
    setSelectedLensState(lens);
    writeStoredLens(lens);
  }, []);

  const value = useMemo(
    () => ({ selectedLens, lenses: lenses.length > 0 ? lenses : [selectedLens], setSelectedLens }),
    [lenses, selectedLens, setSelectedLens],
  );

  return <LensContext.Provider value={value}>{children}</LensContext.Provider>;
}

export function useLens() {
  const context = useContext(LensContext);
  if (!context) {
    throw new Error("useLens must be used within LensProvider");
  }

  return context;
}
