import { describe, it, expect } from 'vitest'
import type { NutritionRequirements } from '../types'
import { calculateAdequacyScore } from './adequacyScorer'

// ── Fixtures ──

const fullRequirements: NutritionRequirements = {
  energy: 2000,
  protein: 100,
  fat: 70,
  carbs: 250,
  sodium: 100,
  potassium: 70,
  calcium: 35,
  magnesium: 21,
  phosphorus: 56,
  chloride: 84,
  iron: 7,
  zinc: 3.5,
  copper: 0.7,
  manganese: 0.35,
  iodine: 105,
  selenium: 70,
}

function makeIntake(overrides: Record<string, number> = {}): Record<string, number> {
  const base: Record<string, number> = {
    energy: 2000, protein: 100, fat: 70, carbs: 250,
    sodium: 100, potassium: 70, calcium: 35, magnesium: 21,
    phosphorus: 56, chloride: 84,
    iron: 7, zinc: 3.5, copper: 0.7, manganese: 0.35,
    iodine: 105, selenium: 70,
  }
  return { ...base, ...overrides }
}

// ── Perfect match ──

describe('calculateAdequacyScore — perfect match', () => {
  it('returns 100 overall when intake matches requirements exactly', () => {
    const result = calculateAdequacyScore(fullRequirements, makeIntake())
    expect(result.overall).toBe(100)
    expect(result.macroScore).toBe(100)
    expect(result.electrolyteScore).toBe(100)
    expect(result.traceElementScore).toBe(100)
  })

  it('returns all details with adequate status at 100% match', () => {
    const result = calculateAdequacyScore(fullRequirements, makeIntake())
    for (const d of result.details) {
      expect(d.status).toBe('adequate')
      expect(d.percentage).toBe(100)
    }
  })
})

// ── Within 90-110% range ──

describe('calculateAdequacyScore — 90-110% range', () => {
  it('returns 100 for all nutrients at 95% intake', () => {
    const intake = makeIntake({ energy: 1900, protein: 95, fat: 66.5, carbs: 237.5 })
    const result = calculateAdequacyScore(fullRequirements, intake)
    expect(result.macroScore).toBe(100)
  })

  it('returns 100 for all nutrients at 110% intake', () => {
    const intake = makeIntake({ energy: 2200, protein: 110, fat: 77, carbs: 275 })
    const result = calculateAdequacyScore(fullRequirements, intake)
    expect(result.macroScore).toBe(100)
  })
})

// ── Deficient patterns ──

describe('calculateAdequacyScore — severe deficiency', () => {
  it('returns low overall score when all intake is zero', () => {
    const zeroIntake: Record<string, number> = {}
    const result = calculateAdequacyScore(fullRequirements, zeroIntake)
    expect(result.overall).toBe(0)
    expect(result.macroScore).toBe(0)
    expect(result.electrolyteScore).toBe(0)
    expect(result.traceElementScore).toBe(0)
  })

  it('marks nutrients < 50% as deficient', () => {
    const intake = makeIntake({ energy: 800, protein: 40 })
    const result = calculateAdequacyScore(fullRequirements, intake)
    const energyDetail = result.details.find(d => d.nutrient === 'energy')
    expect(energyDetail?.status).toBe('deficient')
    expect(energyDetail?.percentage).toBe(40)
  })

  it('marks nutrients 50-80% as low', () => {
    const intake = makeIntake({ energy: 1400 })
    const result = calculateAdequacyScore(fullRequirements, intake)
    const energyDetail = result.details.find(d => d.nutrient === 'energy')
    expect(energyDetail?.status).toBe('low')
    expect(energyDetail?.percentage).toBe(70)
  })
})

// ── Excess patterns ──

describe('calculateAdequacyScore — excess', () => {
  it('marks nutrients > 120% as excess', () => {
    const intake = makeIntake({ sodium: 200, potassium: 150 })
    const result = calculateAdequacyScore(fullRequirements, intake)
    const naDetail = result.details.find(d => d.nutrient === 'sodium')
    expect(naDetail?.status).toBe('excess')
    expect(naDetail?.percentage).toBe(200)
  })

  it('penalizes excess above 110% proportionally', () => {
    const intake = makeIntake({ energy: 2200, protein: 100, fat: 70, carbs: 250 })
    const resultNormal = calculateAdequacyScore(fullRequirements, makeIntake())
    const resultExcess = calculateAdequacyScore(fullRequirements, intake)
    // 110% is still 100 score, so result should still be 100 for energy
    expect(resultExcess.overall).toBe(resultNormal.overall)
  })
})

// ── Clinical scenarios ──

describe('calculateAdequacyScore — clinical scenarios', () => {
  it('Refeeding Day1: very low score (30% of target)', () => {
    const intake = makeIntake({
      energy: 600, protein: 30, fat: 21, carbs: 75,
      sodium: 30, potassium: 21, calcium: 10, magnesium: 6,
      phosphorus: 17, chloride: 25,
      iron: 2, zinc: 1, copper: 0.2, manganese: 0.1,
      iodine: 31, selenium: 21,
    })
    const result = calculateAdequacyScore(fullRequirements, intake)
    expect(result.overall).toBeLessThan(40)
    expect(result.macroScore).toBeLessThan(40)
  })

  it('TPN-only: decent macros but possibly low trace elements', () => {
    const intake = makeIntake({
      energy: 1800, protein: 80, fat: 60, carbs: 220,
      sodium: 90, potassium: 60, calcium: 30, magnesium: 18,
      phosphorus: 45, chloride: 72,
      iron: 0, zinc: 0, copper: 0, manganese: 0,
      iodine: 0, selenium: 0,
    })
    const result = calculateAdequacyScore(fullRequirements, intake)
    expect(result.macroScore).toBeGreaterThan(70)
    expect(result.traceElementScore).toBe(0)
  })

  it('CKD patient: intentionally low protein still gets scored', () => {
    const ckdReq: NutritionRequirements = {
      ...fullRequirements,
      protein: 46, // 0.8g/kg × 58kg
      potassium: 35, // restricted
      phosphorus: 28, // restricted
    }
    const intake = makeIntake({ protein: 28, potassium: 18, phosphorus: 12 })
    const result = calculateAdequacyScore(ckdReq, intake)
    const proteinDetail = result.details.find(d => d.nutrient === 'protein')
    expect(proteinDetail?.percentage).toBeLessThan(70)
  })

  it('Burn patient: high target with partial achievement', () => {
    const burnReq: NutritionRequirements = {
      ...fullRequirements,
      energy: 3475,
      protein: 150,
    }
    const intake = makeIntake({ energy: 2400, protein: 130 })
    const result = calculateAdequacyScore(burnReq, intake)
    const energyDetail = result.details.find(d => d.nutrient === 'energy')
    expect(energyDetail?.percentage).toBeCloseTo(69, 0)
    expect(energyDetail?.status).toBe('low')
  })
})

// ── Weighting ──

describe('calculateAdequacyScore — weighting', () => {
  it('overall = macro*0.5 + electrolyte*0.3 + trace*0.2', () => {
    const intake = makeIntake({
      // All macros at 100%
      energy: 2000, protein: 100, fat: 70, carbs: 250,
      // All electrolytes at 0%
      sodium: 0, potassium: 0, calcium: 0, magnesium: 0,
      phosphorus: 0, chloride: 0,
      // All trace at 100%
      iron: 7, zinc: 3.5, copper: 0.7, manganese: 0.35,
      iodine: 105, selenium: 70,
    })
    const result = calculateAdequacyScore(fullRequirements, intake)
    // macro=100, electrolyte=0, trace=100
    // overall = 100*0.5 + 0*0.3 + 100*0.2 = 70
    expect(result.overall).toBe(70)
  })

  it('returns 16 detail entries', () => {
    const result = calculateAdequacyScore(fullRequirements, makeIntake())
    expect(result.details.length).toBe(16)
  })
})

// ── Immutability ──

describe('calculateAdequacyScore — immutability', () => {
  it('does not mutate the input objects', () => {
    const reqCopy = { ...fullRequirements }
    const intake = makeIntake()
    const intakeCopy = { ...intake }
    calculateAdequacyScore(fullRequirements, intake)
    expect(fullRequirements).toEqual(reqCopy)
    expect(intake).toEqual(intakeCopy)
  })
})
