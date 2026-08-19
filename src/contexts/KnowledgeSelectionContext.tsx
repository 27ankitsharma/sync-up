import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { TopicWithContext } from "@/types/syllabus";

export type KnowledgeObjectType = "track" | "subject" | "module" | "topic" | "radar" | "gap";

export interface KnowledgeObject {
  type: KnowledgeObjectType;
  id: string;
  title: string;
  subtitle?: string;
  topic?: TopicWithContext;
  meta?: Record<string, string | number | boolean | null | undefined>;
}

interface KnowledgeSelectionContextValue {
  selectedObject: KnowledgeObject | null;
  setSelectedObject: (object: KnowledgeObject | null) => void;
}

const KnowledgeSelectionContext = createContext<KnowledgeSelectionContextValue | null>(null);
const STORAGE_KEY = "syncradar:lastKnowledgeSelection";

export function KnowledgeSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedObject, setSelectedObjectState] = useState<KnowledgeObject | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as KnowledgeObject) : null;
    } catch {
      return null;
    }
  });

  const setSelectedObject = useCallback((object: KnowledgeObject | null) => {
    setSelectedObjectState(object);

    if (typeof window === "undefined") return;

    try {
      if (object) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(object));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage failures; selection should still work for this session.
    }
  }, []);

  const value = useMemo(() => ({ selectedObject, setSelectedObject }), [selectedObject]);

  return (
    <KnowledgeSelectionContext.Provider value={value}>
      {children}
    </KnowledgeSelectionContext.Provider>
  );
}

export function useKnowledgeSelection() {
  const context = useContext(KnowledgeSelectionContext);
  if (!context) {
    throw new Error("useKnowledgeSelection must be used within KnowledgeSelectionProvider");
  }

  return context;
}
