import { useState, useCallback, useMemo } from 'react'
import type {
  SimulationCase,
  SimulationScore,
  SimulationResult,
  SimulationProgress,
  FeedbackItem,
} from '../types/simulation'

// ── Storage ──

const PROGRESS_STORAGE_KEY = 'nutri-care-simulation-progress'

function defaultProgress(): SimulationProgress {
  return {
    completedCases: {},
    bestScores: {},
    totalAttempts: 0,
    averageScore: 0,
    weakCategories: [],
  }
}

function loadProgress(): SimulationProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') {
        return parsed as SimulationProgress
      }
    }
  } catch {
    // Storage read failed; return default
  }
  return defaultProgress()
}

function persistProgress(progress: SimulationProgress): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage write failed silently
  }
}

// ── Derived computations ──

function computeAverageScore(
  completedCases: Readonly<Record<string, SimulationResult>>,
): number {
  const results = Object.values(completedCases)
  if (results.length === 0) return 0
  const sum = results.reduce((acc, r) => acc + r.score.overall, 0)
  return Math.round(sum / results.length)
}

/**
 * Detect weak categories based on scores below threshold.
 * A category is "weak" if average score for cases in that category < 60.
 */
function detectWeakCategories(
  completedCases: Readonly<Record<string, SimulationResult>>,
  allCases: readonly SimulationCase[],
): readonly string[] {
  const caseMap = new Map(allCases.map((c) => [c.id, c]))
  const categoryScores = new Map<string, number[]>()

  for (const [caseId, result] of Object.entries(completedCases)) {
    const simCase = caseMap.get(caseId)
    if (!simCase) continue
    const category = simCase.category
    const existing = categoryScores.get(category) ?? []
    categoryScores.set(category, [...existing, result.score.overall])
  }

  const weakThreshold = 60
  const weak: string[] = []

  for (const [category, scores] of categoryScores) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (avg < weakThreshold) {
      weak.push(category)
    }
  }

  return weak
}

// ── Hook ──

export interface UseSimulationProgressReturn {
  readonly progress: SimulationProgress
  readonly completedCount: number
  readonly recordResult: (
    simCase: SimulationCase,
    score: SimulationScore,
    feedback: readonly FeedbackItem[],
    userMenu: SimulationResult['userMenu'],
    timeSpent: number,
  ) => SimulationResult
  readonly resetProgress: () => void
  readonly getCaseBestScore: (caseId: string) => number | undefined
  readonly isCaseCompleted: (caseId: string) => boolean
}

export function useSimulationProgress(
  allCases: readonly SimulationCase[],
): UseSimulationProgressReturn {
  const [progress, setProgress] = useState<SimulationProgress>(loadProgress)

  const completedCount = useMemo(
    () => Object.keys(progress.completedCases).length,
    [progress.completedCases],
  )

  const recordResult = useCallback(
    (
      simCase: SimulationCase,
      score: SimulationScore,
      feedback: readonly FeedbackItem[],
      userMenu: SimulationResult['userMenu'],
      timeSpent: number,
    ): SimulationResult => {
      const result: SimulationResult = {
        caseId: simCase.id,
        score,
        userMenu,
        feedback,
        completedAt: new Date().toISOString(),
        timeSpent,
      }

      setProgress((prev) => {
        const existingBest = prev.bestScores[simCase.id] ?? 0
        const newBest = Math.max(existingBest, score.overall)

        const updatedCompletedCases = {
          ...prev.completedCases,
          [simCase.id]: result,
        }

        const updatedBestScores = {
          ...prev.bestScores,
          [simCase.id]: newBest,
        }

        const newProgress: SimulationProgress = {
          completedCases: updatedCompletedCases,
          bestScores: updatedBestScores,
          totalAttempts: prev.totalAttempts + 1,
          averageScore: computeAverageScore(updatedCompletedCases),
          weakCategories: detectWeakCategories(updatedCompletedCases, allCases),
        }

        persistProgress(newProgress)
        return newProgress
      })

      return result
    },
    [allCases],
  )

  const resetProgress = useCallback(() => {
    const empty = defaultProgress()
    persistProgress(empty)
    setProgress(empty)
  }, [])

  const getCaseBestScore = useCallback(
    (caseId: string): number | undefined => progress.bestScores[caseId],
    [progress.bestScores],
  )

  const isCaseCompleted = useCallback(
    (caseId: string): boolean => caseId in progress.completedCases,
    [progress.completedCases],
  )

  return {
    progress,
    completedCount,
    recordResult,
    resetProgress,
    getCaseBestScore,
    isCaseCompleted,
  }
}
