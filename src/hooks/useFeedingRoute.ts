import { useState, useCallback, useEffect } from 'react'
import type { FeedingRouteEntry } from '../types/feedingRoute'
import { sampleFeedingRouteMap } from '../data/sampleFeedingRoutes'

const FEEDING_ROUTES_KEY = 'nutri-care-feeding-routes'

/**
 * Merge stored data with sample data.
 * If a patient already has user-entered data, preserve it.
 * If a patient has no data, seed with sample entries.
 */
function mergeWithSampleData(
  stored: Record<string, FeedingRouteEntry[]>,
): Record<string, FeedingRouteEntry[]> {
  const merged = { ...stored }
  for (const [patientId, sampleEntries] of Object.entries(sampleFeedingRouteMap)) {
    if (!merged[patientId] || merged[patientId].length === 0) {
      merged[patientId] = sampleEntries
    }
  }
  return merged
}

function loadFromStorage(): Record<string, FeedingRouteEntry[]> {
  try {
    const stored = localStorage.getItem(FEEDING_ROUTES_KEY)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return mergeWithSampleData(parsed as Record<string, FeedingRouteEntry[]>)
      }
    }
  } catch {
    // ignore
  }
  // Seed from sample data when localStorage is empty
  return { ...sampleFeedingRouteMap }
}

function saveToStorage(data: Record<string, FeedingRouteEntry[]>): void {
  try {
    localStorage.setItem(FEEDING_ROUTES_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function sortByDateDesc(
  entries: readonly FeedingRouteEntry[],
): FeedingRouteEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export function useFeedingRoute() {
  const [routeMap, setRouteMap] = useState<
    Record<string, FeedingRouteEntry[]>
  >(loadFromStorage)

  useEffect(() => {
    saveToStorage(routeMap)
  }, [routeMap])

  /** Get the latest feeding route entry for a patient. */
  const getCurrentRoute = useCallback(
    (patientId: string): FeedingRouteEntry | undefined => {
      const entries = routeMap[patientId]
      if (!entries || entries.length === 0) return undefined
      return sortByDateDesc(entries)[0]
    },
    [routeMap],
  )

  /** Get full feeding route history for a patient, sorted newest first. */
  const getRouteHistory = useCallback(
    (patientId: string): readonly FeedingRouteEntry[] => {
      const entries = routeMap[patientId]
      if (!entries || entries.length === 0) return []
      return sortByDateDesc(entries)
    },
    [routeMap],
  )

  /** Save (upsert) a feeding route entry. If same id exists, replace it. */
  const saveRoute = useCallback(
    (patientId: string, entry: FeedingRouteEntry): void => {
      setRouteMap((prev) => {
        const existing = prev[patientId] ?? []
        const updated = { ...entry, patientId }
        const filtered = existing.filter((e) => e.id !== entry.id)
        return {
          ...prev,
          [patientId]: [...filtered, updated],
        }
      })
    },
    [],
  )

  /** Delete a single feeding route entry by id. */
  const deleteRoute = useCallback(
    (patientId: string, entryId: string): void => {
      setRouteMap((prev) => {
        const existing = prev[patientId] ?? []
        return {
          ...prev,
          [patientId]: existing.filter((e) => e.id !== entryId),
        }
      })
    },
    [],
  )

  return {
    getCurrentRoute,
    getRouteHistory,
    saveRoute,
    deleteRoute,
  } as const
}
