import { useState, useCallback, useEffect } from 'react'
import type { FluidBalanceEntry } from '../types/fluidBalance'
import { sampleFluidBalanceMap } from '../data/sampleFluidBalance'

const FLUID_BALANCE_KEY = 'nutri-care-fluid-balance'

function loadFromStorage(): Record<string, FluidBalanceEntry[]> {
  try {
    const stored = localStorage.getItem(FLUID_BALANCE_KEY)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, FluidBalanceEntry[]>
      }
    }
  } catch {
    // ignore
  }
  // Seed from sample data when localStorage is empty
  return { ...sampleFluidBalanceMap }
}

function saveToStorage(data: Record<string, FluidBalanceEntry[]>): void {
  try {
    localStorage.setItem(FLUID_BALANCE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function sortByDateDesc(
  entries: readonly FluidBalanceEntry[],
): FluidBalanceEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export function useFluidBalance() {
  const [balanceMap, setBalanceMap] = useState<
    Record<string, FluidBalanceEntry[]>
  >(loadFromStorage)

  useEffect(() => {
    saveToStorage(balanceMap)
  }, [balanceMap])

  /** Get the latest fluid balance entry for a patient. */
  const getFluidBalance = useCallback(
    (patientId: string): FluidBalanceEntry | undefined => {
      const entries = balanceMap[patientId]
      if (!entries || entries.length === 0) return undefined
      return sortByDateDesc(entries)[0]
    },
    [balanceMap],
  )

  /** Get full fluid balance history for a patient, sorted newest first. */
  const getFluidHistory = useCallback(
    (patientId: string): readonly FluidBalanceEntry[] => {
      const entries = balanceMap[patientId]
      if (!entries || entries.length === 0) return []
      return sortByDateDesc(entries)
    },
    [balanceMap],
  )

  /** Save (append) a fluid balance entry. If same date exists, replace it. */
  const saveFluidBalance = useCallback(
    (patientId: string, entry: FluidBalanceEntry): void => {
      setBalanceMap((prev) => {
        const existing = prev[patientId] ?? []
        const updated = { ...entry, patientId }
        const filtered = existing.filter((e) => e.date !== entry.date)
        return {
          ...prev,
          [patientId]: [...filtered, updated],
        }
      })
    },
    [],
  )

  /** Delete a single fluid balance entry by date. */
  const deleteFluidEntry = useCallback(
    (patientId: string, date: string): void => {
      setBalanceMap((prev) => {
        const existing = prev[patientId] ?? []
        return {
          ...prev,
          [patientId]: existing.filter((e) => e.date !== date),
        }
      })
    },
    [],
  )

  return {
    getFluidBalance,
    getFluidHistory,
    saveFluidBalance,
    deleteFluidEntry,
  } as const
}
