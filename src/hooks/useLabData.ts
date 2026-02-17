import { useState, useCallback, useEffect } from "react";
import type { LabData } from "../types/labData";
import { sampleLabDataMap } from "../data/sampleLabData";

const STORAGE_KEY = "nutri-care-lab-data";
const HISTORY_KEY = "nutri-care-lab-history";

/**
 * Migrate old single-record format to array-based history format.
 * Old: Record<string, LabData>
 * New: Record<string, LabData[]>
 */
function loadHistoryFromStorage(): Record<string, LabData[]> {
  try {
    // Try new history format first
    const historyStored = localStorage.getItem(HISTORY_KEY);
    if (historyStored) {
      const parsed: unknown = JSON.parse(historyStored);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as Record<string, LabData[]>;
      }
    }

    // Fall back to old single-record format and migrate
    const oldStored = localStorage.getItem(STORAGE_KEY);
    if (oldStored) {
      const parsed: unknown = JSON.parse(oldStored);
      if (typeof parsed === "object" && parsed !== null) {
        const old = parsed as Record<string, LabData>;
        const migrated: Record<string, LabData[]> = {};
        for (const [key, value] of Object.entries(old)) {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            migrated[key] = [value];
          }
        }
        return migrated;
      }
    }
  } catch {
    // ignore
  }
  // Seed from sample data when localStorage is empty
  return { ...sampleLabDataMap };
}

function saveHistoryToStorage(data: Record<string, LabData[]>): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function sortByDateDesc(entries: readonly LabData[]): LabData[] {
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function useLabData() {
  const [historyMap, setHistoryMap] = useState<Record<string, LabData[]>>(
    loadHistoryFromStorage,
  );

  useEffect(() => {
    saveHistoryToStorage(historyMap);
  }, [historyMap]);

  /** Get the latest lab data for a patient (backward-compatible). */
  const getLabData = useCallback(
    (patientId: string): LabData | undefined => {
      const entries = historyMap[patientId];
      if (!entries || entries.length === 0) return undefined;
      return sortByDateDesc(entries)[0];
    },
    [historyMap],
  );

  /** Get full lab data history for a patient, sorted newest first. */
  const getLabHistory = useCallback(
    (patientId: string): readonly LabData[] => {
      const entries = historyMap[patientId];
      if (!entries || entries.length === 0) return [];
      return sortByDateDesc(entries);
    },
    [historyMap],
  );

  /** Save (append) lab data. If same date exists, replace it. */
  const saveLabData = useCallback(
    (patientId: string, labData: LabData): void => {
      setHistoryMap((prev) => {
        const existing = prev[patientId] ?? [];
        const entry = { ...labData, patientId };
        const filtered = existing.filter((e) => e.date !== labData.date);
        return {
          ...prev,
          [patientId]: [...filtered, entry],
        };
      });
    },
    [],
  );

  /** Delete all lab data for a patient. */
  const deleteLabData = useCallback((patientId: string): void => {
    setHistoryMap((prev) => {
      const { [patientId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /** Delete a single lab entry by date. */
  const deleteLabEntry = useCallback(
    (patientId: string, date: string): void => {
      setHistoryMap((prev) => {
        const existing = prev[patientId] ?? [];
        return {
          ...prev,
          [patientId]: existing.filter((e) => e.date !== date),
        };
      });
    },
    [],
  );

  return {
    getLabData,
    getLabHistory,
    saveLabData,
    deleteLabData,
    deleteLabEntry,
  } as const;
}
