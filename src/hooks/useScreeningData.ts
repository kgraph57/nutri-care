import { useState, useCallback, useEffect } from "react";
import type { ScreeningEntry, ScreeningToolType } from "../types/screening";
import { sampleScreeningDataMap } from "../data/sampleScreeningData";

const STORAGE_KEY = "nutri-care-screening-data";

/**
 * Merge stored data with sample data.
 * If a patient already has user-entered data, preserve it.
 * If a patient has no data, seed with sample entries.
 */
function mergeWithSampleData(
  stored: Record<string, ScreeningEntry[]>,
): Record<string, ScreeningEntry[]> {
  const merged = { ...stored };
  for (const [patientId, sampleEntries] of Object.entries(
    sampleScreeningDataMap,
  )) {
    if (!merged[patientId] || merged[patientId].length === 0) {
      merged[patientId] = sampleEntries;
    }
  }
  return merged;
}

function loadFromStorage(): Record<string, ScreeningEntry[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === "object" && parsed !== null) {
        return mergeWithSampleData(
          parsed as Record<string, ScreeningEntry[]>,
        );
      }
    }
  } catch {
    // ignore
  }
  // Seed from sample data when localStorage is empty
  return { ...sampleScreeningDataMap };
}

function saveToStorage(data: Record<string, ScreeningEntry[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function sortByDateTimeDesc(
  entries: readonly ScreeningEntry[],
): ScreeningEntry[] {
  return [...entries].sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time}`;
    const dateTimeB = `${b.date}T${b.time}`;
    return dateTimeB.localeCompare(dateTimeA);
  });
}

export function useScreeningData() {
  const [screeningMap, setScreeningMap] =
    useState<Record<string, ScreeningEntry[]>>(loadFromStorage);

  useEffect(() => {
    saveToStorage(screeningMap);
  }, [screeningMap]);

  /** Get full screening history for a patient, sorted newest first by date+time. */
  const getScreeningHistory = useCallback(
    (patientId: string): readonly ScreeningEntry[] => {
      const entries = screeningMap[patientId];
      if (!entries || entries.length === 0) return [];
      return sortByDateTimeDesc(entries);
    },
    [screeningMap],
  );

  /** Get the latest screening entry for a patient. */
  const getLatestScreening = useCallback(
    (patientId: string): ScreeningEntry | undefined => {
      const entries = screeningMap[patientId];
      if (!entries || entries.length === 0) return undefined;
      return sortByDateTimeDesc(entries)[0];
    },
    [screeningMap],
  );

  /** Get the latest screening entry for a patient filtered by tool type. */
  const getLatestByTool = useCallback(
    (
      patientId: string,
      toolType: ScreeningToolType,
    ): ScreeningEntry | undefined => {
      const entries = screeningMap[patientId];
      if (!entries || entries.length === 0) return undefined;
      const filtered = entries.filter(
        (e) => e.result.toolType === toolType,
      );
      if (filtered.length === 0) return undefined;
      return sortByDateTimeDesc(filtered)[0];
    },
    [screeningMap],
  );

  /** Save a screening entry. If an entry with the same id exists, replace it (upsert). */
  const saveScreeningEntry = useCallback(
    (patientId: string, entry: ScreeningEntry): void => {
      setScreeningMap((prev) => {
        const existing = prev[patientId] ?? [];
        const updated: ScreeningEntry = { ...entry, patientId };
        const filtered = existing.filter((e) => e.id !== entry.id);
        return {
          ...prev,
          [patientId]: [...filtered, updated],
        };
      });
    },
    [],
  );

  /** Delete a single screening entry by id. */
  const deleteScreeningEntry = useCallback(
    (patientId: string, entryId: string): void => {
      setScreeningMap((prev) => {
        const existing = prev[patientId] ?? [];
        return {
          ...prev,
          [patientId]: existing.filter((e) => e.id !== entryId),
        };
      });
    },
    [],
  );

  /** Get the latest screening for every patient that has data. */
  const getAllLatestScreenings = useCallback(
    (): Record<string, ScreeningEntry | undefined> => {
      const result: Record<string, ScreeningEntry | undefined> = {};
      for (const patientId of Object.keys(screeningMap)) {
        const entries = screeningMap[patientId];
        if (!entries || entries.length === 0) {
          result[patientId] = undefined;
        } else {
          result[patientId] = sortByDateTimeDesc(entries)[0];
        }
      }
      return result;
    },
    [screeningMap],
  );

  return {
    getScreeningHistory,
    getLatestScreening,
    getLatestByTool,
    saveScreeningEntry,
    deleteScreeningEntry,
    getAllLatestScreenings,
  } as const;
}
