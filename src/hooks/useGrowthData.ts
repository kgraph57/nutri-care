import { useState, useCallback, useEffect } from 'react'
import type { GrowthMeasurement } from '../types/growthData'
import { sampleGrowthDataMap } from '../data/sampleGrowthData'

const GROWTH_DATA_KEY = 'nutri-care-growth-data'

function loadFromStorage(): Record<string, GrowthMeasurement[]> {
  try {
    const stored = localStorage.getItem(GROWTH_DATA_KEY)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, GrowthMeasurement[]>
      }
    }
  } catch {
    // ignore
  }
  // Seed from sample data when localStorage is empty
  return { ...sampleGrowthDataMap }
}

function saveToStorage(data: Record<string, GrowthMeasurement[]>): void {
  try {
    localStorage.setItem(GROWTH_DATA_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function sortByDateDesc(
  entries: readonly GrowthMeasurement[],
): GrowthMeasurement[] {
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export function useGrowthData() {
  const [growthMap, setGrowthMap] = useState<
    Record<string, GrowthMeasurement[]>
  >(loadFromStorage)

  useEffect(() => {
    saveToStorage(growthMap)
  }, [growthMap])

  /** Get full growth history for a patient, sorted newest first. */
  const getGrowthHistory = useCallback(
    (patientId: string): readonly GrowthMeasurement[] => {
      const entries = growthMap[patientId]
      if (!entries || entries.length === 0) return []
      return sortByDateDesc(entries)
    },
    [growthMap],
  )

  /** Get the most recent growth measurement for a patient. */
  const getLatestMeasurement = useCallback(
    (patientId: string): GrowthMeasurement | undefined => {
      const entries = growthMap[patientId]
      if (!entries || entries.length === 0) return undefined
      return sortByDateDesc(entries)[0]
    },
    [growthMap],
  )

  /** Save a growth measurement. Upsert by id, or replace if same date exists. */
  const saveGrowthMeasurement = useCallback(
    (patientId: string, measurement: GrowthMeasurement): void => {
      setGrowthMap((prev) => {
        const existing = prev[patientId] ?? []
        const updated = { ...measurement, patientId }
        const filtered = existing.filter(
          (m) => m.id !== measurement.id && m.date !== measurement.date,
        )
        return {
          ...prev,
          [patientId]: [...filtered, updated],
        }
      })
    },
    [],
  )

  /** Delete a single growth measurement by id. */
  const deleteGrowthMeasurement = useCallback(
    (patientId: string, measurementId: string): void => {
      setGrowthMap((prev) => {
        const existing = prev[patientId] ?? []
        return {
          ...prev,
          [patientId]: existing.filter((m) => m.id !== measurementId),
        }
      })
    },
    [],
  )

  return {
    getGrowthHistory,
    getLatestMeasurement,
    saveGrowthMeasurement,
    deleteGrowthMeasurement,
  } as const
}
