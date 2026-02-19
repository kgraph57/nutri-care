import { describe, it, expect } from 'vitest'
import type { ToleranceEntry } from '../types/toleranceData'
import {
  calculateToleranceScore,
  determineFeedingAdjustment,
  analyzeToleranceTrend,
} from './toleranceScorer'

// ── Fixtures ──

type ToleranceAssessment = Omit<
  ToleranceEntry,
  'id' | 'patientId' | 'toleranceScore' | 'feedingAdjustment'
>

function makeAssessment(
  overrides: Partial<ToleranceAssessment> = {},
): ToleranceAssessment {
  return {
    date: '2024-01-01',
    time: '08:00',
    gastricResidual: 0,
    gastricResidualAction: 'none',
    vomiting: 'none',
    vomitingEpisodes: 0,
    abdominalDistension: 'none',
    bowelSounds: 'present',
    stoolCount: 0,
    stoolConsistency: 'formed',
    notes: '',
    ...overrides,
  }
}

function makeEntry(
  overrides: Partial<ToleranceEntry> = {},
): ToleranceEntry {
  return {
    id: 'entry-1',
    patientId: 'patient-1',
    date: '2024-01-01',
    time: '08:00',
    gastricResidual: 0,
    gastricResidualAction: 'none',
    vomiting: 'none',
    vomitingEpisodes: 0,
    abdominalDistension: 'none',
    bowelSounds: 'present',
    stoolCount: 0,
    stoolConsistency: 'formed',
    toleranceScore: 10,
    feedingAdjustment: 'advance',
    notes: '',
    ...overrides,
  }
}

// ══════════════════════════════════════════════════════════
// calculateToleranceScore
// ══════════════════════════════════════════════════════════

describe('calculateToleranceScore — perfect score', () => {
  it('returns 10 when all symptoms are absent', () => {
    const score = calculateToleranceScore(makeAssessment())
    expect(score).toBe(10)
  })

  it('returns 10 with gastricResidualAction=none and residual=0', () => {
    const score = calculateToleranceScore(
      makeAssessment({ gastricResidualAction: 'none', gastricResidual: 0 }),
    )
    expect(score).toBe(10)
  })

  it('returns 10 with formed stool regardless of count', () => {
    const score = calculateToleranceScore(
      makeAssessment({ stoolConsistency: 'formed', stoolCount: 5 }),
    )
    expect(score).toBe(10)
  })
})

describe('calculateToleranceScore — gastric residual deductions', () => {
  it('deducts -4 for hold action', () => {
    const score = calculateToleranceScore(
      makeAssessment({ gastricResidualAction: 'hold', gastricResidual: 200 }),
    )
    expect(score).toBe(6)
  })

  it('deducts -2 for reduce action', () => {
    const score = calculateToleranceScore(
      makeAssessment({ gastricResidualAction: 'reduce', gastricResidual: 150 }),
    )
    expect(score).toBe(8)
  })

  it('deducts -1 for continue action with residual > 0', () => {
    const score = calculateToleranceScore(
      makeAssessment({ gastricResidualAction: 'continue', gastricResidual: 50 }),
    )
    expect(score).toBe(9)
  })

  it('deducts 0 for continue action with residual = 0', () => {
    const score = calculateToleranceScore(
      makeAssessment({ gastricResidualAction: 'continue', gastricResidual: 0 }),
    )
    expect(score).toBe(10)
  })
})

describe('calculateToleranceScore — vomiting deductions', () => {
  it('deducts -1 for mild vomiting', () => {
    const score = calculateToleranceScore(makeAssessment({ vomiting: 'mild' }))
    expect(score).toBe(9)
  })

  it('deducts -3 for moderate vomiting', () => {
    const score = calculateToleranceScore(makeAssessment({ vomiting: 'moderate' }))
    expect(score).toBe(7)
  })

  it('deducts -5 for severe vomiting', () => {
    const score = calculateToleranceScore(makeAssessment({ vomiting: 'severe' }))
    expect(score).toBe(5)
  })
})

describe('calculateToleranceScore — abdominal distension deductions', () => {
  it('deducts -1 for mild distension', () => {
    const score = calculateToleranceScore(makeAssessment({ abdominalDistension: 'mild' }))
    expect(score).toBe(9)
  })

  it('deducts -2 for moderate distension', () => {
    const score = calculateToleranceScore(makeAssessment({ abdominalDistension: 'moderate' }))
    expect(score).toBe(8)
  })

  it('deducts -4 for severe distension', () => {
    const score = calculateToleranceScore(makeAssessment({ abdominalDistension: 'severe' }))
    expect(score).toBe(6)
  })
})

describe('calculateToleranceScore — bowel sounds deductions', () => {
  it('deducts -1 for reduced bowel sounds', () => {
    const score = calculateToleranceScore(makeAssessment({ bowelSounds: 'reduced' }))
    expect(score).toBe(9)
  })

  it('deducts -2 for absent bowel sounds', () => {
    const score = calculateToleranceScore(makeAssessment({ bowelSounds: 'absent' }))
    expect(score).toBe(8)
  })
})

describe('calculateToleranceScore — stool deductions', () => {
  it('deducts -1 for watery stool with count <= 3', () => {
    const score = calculateToleranceScore(
      makeAssessment({ stoolConsistency: 'watery', stoolCount: 2 }),
    )
    expect(score).toBe(9)
  })

  it('deducts -2 for watery stool with count > 3', () => {
    const score = calculateToleranceScore(
      makeAssessment({ stoolConsistency: 'watery', stoolCount: 4 }),
    )
    expect(score).toBe(8)
  })

  it('deducts 0 for non-watery stool regardless of count', () => {
    const score = calculateToleranceScore(
      makeAssessment({ stoolConsistency: 'soft', stoolCount: 10 }),
    )
    expect(score).toBe(10)
  })

  it('deducts 0 for loose stool', () => {
    const score = calculateToleranceScore(
      makeAssessment({ stoolConsistency: 'loose', stoolCount: 5 }),
    )
    expect(score).toBe(10)
  })

  it('deducts 0 for hard stool', () => {
    const score = calculateToleranceScore(
      makeAssessment({ stoolConsistency: 'hard', stoolCount: 3 }),
    )
    expect(score).toBe(10)
  })
})

describe('calculateToleranceScore — combined deductions', () => {
  it('accumulates deductions from multiple symptoms', () => {
    // mild vomiting(-1) + moderate distension(-2) + reduced bowel(-1) = -4
    const score = calculateToleranceScore(
      makeAssessment({
        vomiting: 'mild',
        abdominalDistension: 'moderate',
        bowelSounds: 'reduced',
      }),
    )
    expect(score).toBe(6)
  })

  it('reduces to correct score with gastric + vomiting + stool', () => {
    // hold(-4) + moderate vomiting(-3) + watery >3(-2) = -9
    const score = calculateToleranceScore(
      makeAssessment({
        gastricResidualAction: 'hold',
        gastricResidual: 300,
        vomiting: 'moderate',
        stoolConsistency: 'watery',
        stoolCount: 5,
      }),
    )
    expect(score).toBe(1)
  })
})

describe('calculateToleranceScore — minimum score (0)', () => {
  it('clamps to 0 when total deductions exceed 10', () => {
    // severe vomiting(-5) + severe distension(-4) + absent bowel(-2) = -11
    const score = calculateToleranceScore(
      makeAssessment({
        vomiting: 'severe',
        abdominalDistension: 'severe',
        bowelSounds: 'absent',
      }),
    )
    expect(score).toBe(0)
  })

  it('clamps to 0 for worst-case scenario', () => {
    // hold(-4) + severe vomiting(-5) + severe distension(-4) + absent bowel(-2) + watery>3(-2) = -17
    const score = calculateToleranceScore(
      makeAssessment({
        gastricResidualAction: 'hold',
        gastricResidual: 500,
        vomiting: 'severe',
        abdominalDistension: 'severe',
        bowelSounds: 'absent',
        stoolConsistency: 'watery',
        stoolCount: 10,
      }),
    )
    expect(score).toBe(0)
  })
})

describe('calculateToleranceScore — return type', () => {
  it('always returns an integer between 0 and 10', () => {
    const scenarios = [
      makeAssessment(),
      makeAssessment({ vomiting: 'mild' }),
      makeAssessment({ vomiting: 'severe', abdominalDistension: 'severe' }),
      makeAssessment({ gastricResidualAction: 'hold', gastricResidual: 100 }),
    ]
    for (const entry of scenarios) {
      const score = calculateToleranceScore(entry)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(10)
      expect(Number.isInteger(score)).toBe(true)
    }
  })
})

// ══════════════════════════════════════════════════════════
// determineFeedingAdjustment
// ══════════════════════════════════════════════════════════

describe('determineFeedingAdjustment — advance (>= 8)', () => {
  it('returns advance for score 10', () => {
    expect(determineFeedingAdjustment(10)).toBe('advance')
  })

  it('returns advance for score 9', () => {
    expect(determineFeedingAdjustment(9)).toBe('advance')
  })

  it('returns advance for score 8', () => {
    expect(determineFeedingAdjustment(8)).toBe('advance')
  })
})

describe('determineFeedingAdjustment — maintain (5-7)', () => {
  it('returns maintain for score 7', () => {
    expect(determineFeedingAdjustment(7)).toBe('maintain')
  })

  it('returns maintain for score 6', () => {
    expect(determineFeedingAdjustment(6)).toBe('maintain')
  })

  it('returns maintain for score 5', () => {
    expect(determineFeedingAdjustment(5)).toBe('maintain')
  })
})

describe('determineFeedingAdjustment — reduce (3-4)', () => {
  it('returns reduce for score 4', () => {
    expect(determineFeedingAdjustment(4)).toBe('reduce')
  })

  it('returns reduce for score 3', () => {
    expect(determineFeedingAdjustment(3)).toBe('reduce')
  })
})

describe('determineFeedingAdjustment — hold (< 3)', () => {
  it('returns hold for score 2', () => {
    expect(determineFeedingAdjustment(2)).toBe('hold')
  })

  it('returns hold for score 1', () => {
    expect(determineFeedingAdjustment(1)).toBe('hold')
  })

  it('returns hold for score 0', () => {
    expect(determineFeedingAdjustment(0)).toBe('hold')
  })
})

describe('determineFeedingAdjustment — boundary values', () => {
  it('transitions from maintain to advance at 8', () => {
    expect(determineFeedingAdjustment(7)).toBe('maintain')
    expect(determineFeedingAdjustment(8)).toBe('advance')
  })

  it('transitions from reduce to maintain at 5', () => {
    expect(determineFeedingAdjustment(4)).toBe('reduce')
    expect(determineFeedingAdjustment(5)).toBe('maintain')
  })

  it('transitions from hold to reduce at 3', () => {
    expect(determineFeedingAdjustment(2)).toBe('hold')
    expect(determineFeedingAdjustment(3)).toBe('reduce')
  })
})

// ══════════════════════════════════════════════════════════
// analyzeToleranceTrend
// ══════════════════════════════════════════════════════════

describe('analyzeToleranceTrend — empty entries', () => {
  it('returns defaults for empty array', () => {
    const result = analyzeToleranceTrend([])
    expect(result.entries).toEqual([])
    expect(result.averageScore).toBe(0)
    expect(result.trend).toBe('stable')
    expect(result.consecutiveGoodDays).toBe(0)
    expect(result.readyToAdvance).toBe(false)
  })
})

describe('analyzeToleranceTrend — fewer than 3 entries', () => {
  it('returns stable trend for 1 entry', () => {
    const entries = [makeEntry({ toleranceScore: 8, date: '2024-01-01' })]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('stable')
    expect(result.averageScore).toBe(8)
    expect(result.consecutiveGoodDays).toBe(1)
  })

  it('returns stable trend for 2 entries', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 3, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 9, date: '2024-01-02' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('stable')
  })
})

describe('analyzeToleranceTrend — improving trend', () => {
  it('detects improving trend when newer scores are higher', () => {
    // Sorted desc by date: day4=9, day3=8, day2=4, day1=3
    // newer half: [9,8] avg=8.5, older half: [4,3] avg=3.5 => diff=5 > 1 => improving
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 3, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 4, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 8, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 9, date: '2024-01-04' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('improving')
  })

  it('detects improving with 3 entries where diff > 1', () => {
    // Sorted desc: day3=9, day2=5, day1=3
    // midpoint=1: newer=[9] avg=9, older=[5,3] avg=4 => diff=5 > 1 => improving
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 3, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 5, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 9, date: '2024-01-03' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('improving')
  })
})

describe('analyzeToleranceTrend — stable trend', () => {
  it('detects stable trend when scores are consistent', () => {
    // Sorted desc: day4=8, day3=7, day2=8, day1=7
    // newer=[8,7] avg=7.5, older=[8,7] avg=7.5 => diff=0 => stable
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 7, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 8, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 7, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 8, date: '2024-01-04' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('stable')
  })

  it('detects stable when diff is exactly at the threshold', () => {
    // Sorted desc: day4=8, day3=7, day2=7, day1=6
    // newer=[8,7] avg=7.5, older=[7,6] avg=6.5 => diff=1 => stable (not > 1)
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 6, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 7, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 7, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 8, date: '2024-01-04' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('stable')
  })
})

describe('analyzeToleranceTrend — worsening trend', () => {
  it('detects worsening trend when newer scores are lower', () => {
    // Sorted desc: day4=3, day3=4, day2=8, day1=9
    // newer=[3,4] avg=3.5, older=[8,9] avg=8.5 => diff=-5 < -1 => worsening
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 9, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 8, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 4, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 3, date: '2024-01-04' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('worsening')
  })

  it('detects worsening with 3 entries where diff < -1', () => {
    // Sorted desc: day3=2, day2=5, day1=9
    // newer=[2] avg=2, older=[5,9] avg=7 => diff=-5 < -1 => worsening
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 9, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 5, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 2, date: '2024-01-03' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('worsening')
  })
})

describe('analyzeToleranceTrend — consecutiveGoodDays', () => {
  it('counts consecutive days with score >= 7 from most recent', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 5, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 8, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 9, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 7, date: '2024-01-04' }),
    ]
    const result = analyzeToleranceTrend(entries)
    // Sorted desc: day4(7), day3(9), day2(8), day1(5)
    // All >= 7 until day1 => 3 consecutive
    expect(result.consecutiveGoodDays).toBe(3)
  })

  it('returns 0 when most recent score is below 7', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 8, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 9, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 6, date: '2024-01-03' }),
    ]
    const result = analyzeToleranceTrend(entries)
    // Sorted desc: day3(6), day2(9), day1(8) => first entry is 6 < 7 => 0
    expect(result.consecutiveGoodDays).toBe(0)
  })

  it('counts all entries when all scores >= 7', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 10, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 8, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 9, date: '2024-01-03' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.consecutiveGoodDays).toBe(3)
  })
})

describe('analyzeToleranceTrend — averageScore', () => {
  it('rounds average to 1 decimal place', () => {
    // Scores: 7, 8, 9 => avg = 8.0
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 7, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 8, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 9, date: '2024-01-03' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.averageScore).toBe(8)
  })

  it('rounds correctly for non-integer averages', () => {
    // Scores: 7, 8, 8 => avg = 7.666... => 7.7
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 7, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 8, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 8, date: '2024-01-03' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.averageScore).toBe(7.7)
  })

  it('calculates average for single entry', () => {
    const entries = [makeEntry({ toleranceScore: 5 })]
    const result = analyzeToleranceTrend(entries)
    expect(result.averageScore).toBe(5)
  })
})

describe('analyzeToleranceTrend — readyToAdvance', () => {
  it('returns true when 2+ consecutive good days and avg >= 7', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 8, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 9, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 8, date: '2024-01-03' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.readyToAdvance).toBe(true)
    expect(result.consecutiveGoodDays).toBeGreaterThanOrEqual(2)
    expect(result.averageScore).toBeGreaterThanOrEqual(7)
  })

  it('returns false when consecutive good days < 2', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 3, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 3, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 8, date: '2024-01-03' }),
    ]
    const result = analyzeToleranceTrend(entries)
    // Sorted desc: 8, 3, 3 => 1 consecutive good day
    expect(result.consecutiveGoodDays).toBe(1)
    expect(result.readyToAdvance).toBe(false)
  })

  it('returns false when avg < 7 even with 2 consecutive good days', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 1, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 2, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 8, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 9, date: '2024-01-04' }),
    ]
    const result = analyzeToleranceTrend(entries)
    // Sorted desc: 9, 8, 2, 1 => 2 consecutive good days, avg = 5.0
    expect(result.consecutiveGoodDays).toBe(2)
    expect(result.averageScore).toBe(5)
    expect(result.readyToAdvance).toBe(false)
  })

  it('returns false for empty entries', () => {
    const result = analyzeToleranceTrend([])
    expect(result.readyToAdvance).toBe(false)
  })
})

describe('analyzeToleranceTrend — sorting', () => {
  it('sorts entries by date descending', () => {
    const entries = [
      makeEntry({ id: 'e3', toleranceScore: 10, date: '2024-01-03', time: '08:00' }),
      makeEntry({ id: 'e1', toleranceScore: 5, date: '2024-01-01', time: '08:00' }),
      makeEntry({ id: 'e2', toleranceScore: 7, date: '2024-01-02', time: '08:00' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.entries[0].id).toBe('e3')
    expect(result.entries[1].id).toBe('e2')
    expect(result.entries[2].id).toBe('e1')
  })

  it('sorts by time when dates are equal', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 5, date: '2024-01-01', time: '08:00' }),
      makeEntry({ id: 'e2', toleranceScore: 7, date: '2024-01-01', time: '14:00' }),
      makeEntry({ id: 'e3', toleranceScore: 9, date: '2024-01-01', time: '20:00' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.entries[0].id).toBe('e3')
    expect(result.entries[1].id).toBe('e2')
    expect(result.entries[2].id).toBe('e1')
  })
})

describe('analyzeToleranceTrend — immutability', () => {
  it('does not mutate the input array', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 5, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 8, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 9, date: '2024-01-03' }),
    ]
    const original = [...entries]
    analyzeToleranceTrend(entries)
    expect(entries).toEqual(original)
  })

  it('returns a new sorted array, not a reference to input', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 5, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 8, date: '2024-01-02' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.entries).not.toBe(entries)
  })
})

// ── Clinical scenarios ──

describe('analyzeToleranceTrend — clinical scenarios', () => {
  it('ICU patient recovering: worsening to improving over 5 days', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 2, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 3, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 5, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 7, date: '2024-01-04' }),
      makeEntry({ id: 'e5', toleranceScore: 9, date: '2024-01-05' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('improving')
    expect(result.consecutiveGoodDays).toBe(2)
    expect(result.averageScore).toBe(5.2)
  })

  it('critically ill patient: consistently poor tolerance', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 1, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 2, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 1, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 2, date: '2024-01-04' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('stable')
    expect(result.consecutiveGoodDays).toBe(0)
    expect(result.readyToAdvance).toBe(false)
  })

  it('stable well-tolerating patient ready to advance', () => {
    const entries = [
      makeEntry({ id: 'e1', toleranceScore: 9, date: '2024-01-01' }),
      makeEntry({ id: 'e2', toleranceScore: 10, date: '2024-01-02' }),
      makeEntry({ id: 'e3', toleranceScore: 9, date: '2024-01-03' }),
      makeEntry({ id: 'e4', toleranceScore: 10, date: '2024-01-04' }),
    ]
    const result = analyzeToleranceTrend(entries)
    expect(result.trend).toBe('stable')
    expect(result.consecutiveGoodDays).toBe(4)
    expect(result.readyToAdvance).toBe(true)
    expect(result.averageScore).toBe(9.5)
  })
})
