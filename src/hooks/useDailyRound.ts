import { useState, useCallback, useEffect } from "react";
import type { DailyRoundEntry } from "../types/dailyRound";

const STORAGE_KEY = "nutri-care-daily-rounds";

function loadFromStorage(): Record<string, DailyRoundEntry[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as Record<string, DailyRoundEntry[]>;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

function saveToStorage(data: Record<string, DailyRoundEntry[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function sortByDateDesc(
  entries: readonly DailyRoundEntry[],
): DailyRoundEntry[] {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function useDailyRound() {
  const [roundMap, setRoundMap] =
    useState<Record<string, DailyRoundEntry[]>>(loadFromStorage);

  useEffect(() => {
    saveToStorage(roundMap);
  }, [roundMap]);

  const getRoundHistory = useCallback(
    (patientId: string): readonly DailyRoundEntry[] => {
      const entries = roundMap[patientId];
      if (!entries || entries.length === 0) return [];
      return sortByDateDesc(entries);
    },
    [roundMap],
  );

  const getLatestRound = useCallback(
    (patientId: string): DailyRoundEntry | undefined => {
      const entries = roundMap[patientId];
      if (!entries || entries.length === 0) return undefined;
      return sortByDateDesc(entries)[0];
    },
    [roundMap],
  );

  const getRoundsByDate = useCallback(
    (patientId: string, date: string): readonly DailyRoundEntry[] => {
      const entries = roundMap[patientId];
      if (!entries || entries.length === 0) return [];
      return entries.filter((e) => e.date === date);
    },
    [roundMap],
  );

  const saveRound = useCallback(
    (patientId: string, entry: DailyRoundEntry): void => {
      setRoundMap((prev) => {
        const existing = prev[patientId] ?? [];
        const updated: DailyRoundEntry = { ...entry, patientId };
        const filtered = existing.filter((e) => e.id !== entry.id);
        return {
          ...prev,
          [patientId]: [...filtered, updated],
        };
      });
    },
    [],
  );

  const deleteRound = useCallback(
    (patientId: string, entryId: string): void => {
      setRoundMap((prev) => {
        const existing = prev[patientId] ?? [];
        return {
          ...prev,
          [patientId]: existing.filter((e) => e.id !== entryId),
        };
      });
    },
    [],
  );

  const getRoundCount = useCallback(
    (patientId: string): number => {
      return roundMap[patientId]?.length ?? 0;
    },
    [roundMap],
  );

  return {
    getRoundHistory,
    getLatestRound,
    getRoundsByDate,
    saveRound,
    deleteRound,
    getRoundCount,
  } as const;
}
