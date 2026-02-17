import { useState, useCallback, useEffect } from 'react'
import type { ToleranceEntry } from '../types/toleranceData'
import { sampleToleranceDataMap } from '../data/sampleToleranceData'

const TOLERANCE_DATA_KEY = 'nutri-care-tolerance-data'

function loadFromStorage(): Record<string, ToleranceEntry[]> {
  try {
    const stored = localStorage.getItem(TOLERANCE_DATA_KEY)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, ToleranceEntry[]>
      }
    }
  } catch {
    // ignore
  }
  // Seed from sample data when localStorage is empty
  return { ...sampleToleranceDataMap }
}

function saveToStorage(data: Record<string, ToleranceEntry[]>): void {
  try {
    localStorage.setItem(TOLERANCE_DATA_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function sortByDateTimeDesc(
  entries: readonly ToleranceEntry[],
): ToleranceEntry[] {
  return [...entries].sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time}`
    const dateTimeB = `${b.date}T${b.time}`
    return dateTimeB.localeCompare(dateTimeA)
  })
}

export function useToleranceData() {
  const [toleranceMap, setToleranceMap] = useState<
    Record<string, ToleranceEntry[]>
  >(loadFromStorage)

  useEffect(() => {
    saveToStorage(toleranceMap)
  }, [toleranceMap])

  /** Get full tolerance history for a patient, sorted newest first by date+time. */
  const getToleranceHistory = useCallback(
    (patientId: string): readonly ToleranceEntry[] => {
      const entries = toleranceMap[patientId]
      if (!entries || entries.length === 0) return []
      return sortByDateTimeDesc(entries)
    },
    [toleranceMap],
  )

  /** Get the latest tolerance entry for a patient. */
  const getLatestEntry = useCallback(
    (patientId: string): ToleranceEntry | undefined => {
      const entries = toleranceMap[patientId]
      if (!entries || entries.length === 0) return undefined
      return sortByDateTimeDesc(entries)[0]
    },
    [toleranceMap],
  )

  /** Save a tolerance entry. If an entry with the same id exists, replace it (upsert). */
  const saveToleranceEntry = useCallback(
    (patientId: string, entry: ToleranceEntry): void => {
      setToleranceMap((prev) => {
        const existing = prev[patientId] ?? []
        const updated: ToleranceEntry = { ...entry, patientId }
        const filtered = existing.filter((e) => e.id !== entry.id)
        return {
          ...prev,
          [patientId]: [...filtered, updated],
        }
      })
    },
    [],
  )

  /** Delete a single tolerance entry by id. */
  const deleteToleranceEntry = useCallback(
    (patientId: string, entryId: string): void => {
      setToleranceMap((prev) => {
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
    getToleranceHistory,
    getLatestEntry,
    saveToleranceEntry,
    deleteToleranceEntry,
  } as const
}
