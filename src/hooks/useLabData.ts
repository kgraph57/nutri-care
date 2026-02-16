import { useState, useCallback, useEffect } from 'react';
import type { LabData } from '../types/labData';

const STORAGE_KEY = 'nutri-care-lab-data';

function loadFromStorage(): Record<string, LabData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, LabData>;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

function saveToStorage(data: Record<string, LabData>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useLabData() {
  const [labDataMap, setLabDataMap] = useState<Record<string, LabData>>(loadFromStorage);

  useEffect(() => {
    saveToStorage(labDataMap);
  }, [labDataMap]);

  const getLabData = useCallback(
    (patientId: string): LabData | undefined => {
      return labDataMap[patientId];
    },
    [labDataMap]
  );

  const saveLabData = useCallback(
    (patientId: string, labData: LabData): void => {
      setLabDataMap((prev) => ({
        ...prev,
        [patientId]: { ...labData, patientId },
      }));
    },
    []
  );

  const deleteLabData = useCallback(
    (patientId: string): void => {
      setLabDataMap((prev) => {
        const { [patientId]: _, ...rest } = prev;
        return rest;
      });
    },
    []
  );

  return { getLabData, saveLabData, deleteLabData } as const;
}
