import { describe, it, expect } from 'vitest'
import { scoreSimulation, generateFeedback } from './simulationScorer'
import type { SimulationCase, IdealAnswer } from '../types/simulation'
import type { NutritionMenuData } from '../hooks/useNutritionMenus'
import type { Patient, NutritionRequirements } from '../types'
import type { LabData } from '../types/labData'

// ── Fixtures ──

const baseRequirements: NutritionRequirements = {
  energy: 1600,
  protein: 97,
  fat: 53,
  carbs: 200,
  sodium: 97,
  potassium: 65,
  calcium: 32,
  magnesium: 19,
  phosphorus: 52,
  chloride: 78,
  iron: 6.5,
  zinc: 3.2,
  copper: 0.65,
  manganese: 0.32,
  iodine: 97,
  selenium: 65,
}

const basePatient: Patient = {
  id: 'test-p1',
  name: 'テスト太郎',
  age: 60,
  gender: '男性',
  ward: 'ICU',
  admissionDate: '2024-01-01',
  dischargeDate: '',
  patientType: 'ICU',
  weight: 65,
  height: 165,
  diagnosis: '肺炎',
  allergies: [],
  medications: [],
  notes: '',
}

const baseLab: LabData = {
  patientId: 'test-p1',
  date: '2024-01-01',
  albumin: 3.2,
  crp: 3.5,
}

const baseIdealAnswer: IdealAnswer = {
  nutritionType: 'enteral',
  menuItems: [
    {
      productKeywords: ['ペプタメン', 'エネーボ'],
      category: '半消化態栄養剤',
      volumeRange: [1200, 1600],
      required: true,
    },
  ],
  requirements: baseRequirements,
  keyPoints: [
    'エネルギー 1500-1800kcal/day',
    '蛋白 1.2-1.5g/kg/day',
    '経腸栄養を第一選択',
  ],
  rationale: 'ICU標準的なEN管理',
  commonMistakes: [
    '蛋白量が少なすぎる（< 1.0g/kg）',
    '初日から目標量の100%を投与',
  ],
  references: ['ASPEN 2016'],
}

const baseCase: SimulationCase = {
  id: 'test-case-1',
  title: 'ICU標準EN設計',
  difficulty: 'beginner',
  category: '経腸栄養',
  patient: basePatient,
  labData: baseLab,
  clinicalContext: 'テスト用症例',
  objectives: ['標準ENの設計'],
  hints: [],
  idealAnswer: baseIdealAnswer,
}

function makeMenu(overrides: Partial<NutritionMenuData> = {}): NutritionMenuData {
  return {
    id: 'test-menu-1',
    patientId: 'test-p1',
    patientName: 'テスト太郎',
    nutritionType: 'enteral',
    menuName: 'テストメニュー',
    items: [
      { id: 'i1', productName: 'ペプタメンAF', manufacturer: 'ネスレ', volume: 1500, frequency: 3 },
    ],
    totalEnergy: 1600,
    totalVolume: 1500,
    requirements: baseRequirements,
    currentIntake: {
      energy: 1600,
      protein: 97,
      fat: 53,
      carbs: 200,
      sodium: 97,
      potassium: 65,
      calcium: 32,
      magnesium: 19,
      phosphorus: 52,
      chloride: 78,
      iron: 6.5,
      zinc: 3.2,
      copper: 0.65,
      manganese: 0.32,
      iodine: 97,
      selenium: 65,
    },
    notes: '',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// ── scoreSimulation ──

describe('scoreSimulation — perfect answer', () => {
  it('returns high overall score for a perfect menu', () => {
    const menu = makeMenu()
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    expect(score.overall).toBeGreaterThanOrEqual(70)
    expect(score.macroScore).toBe(100)
    expect(score.safetyScore).toBe(100)
  })

  it('returns all score components between 0-100', () => {
    const menu = makeMenu()
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    expect(score.overall).toBeGreaterThanOrEqual(0)
    expect(score.overall).toBeLessThanOrEqual(100)
    expect(score.macroScore).toBeGreaterThanOrEqual(0)
    expect(score.macroScore).toBeLessThanOrEqual(100)
    expect(score.constraintScore).toBeGreaterThanOrEqual(0)
    expect(score.constraintScore).toBeLessThanOrEqual(100)
    expect(score.safetyScore).toBeGreaterThanOrEqual(0)
    expect(score.safetyScore).toBeLessThanOrEqual(100)
    expect(score.efficiencyScore).toBeGreaterThanOrEqual(0)
    expect(score.efficiencyScore).toBeLessThanOrEqual(100)
  })
})

describe('scoreSimulation — deficient menu', () => {
  it('returns low macroScore for zero intake', () => {
    const menu = makeMenu({
      currentIntake: {},
      items: [],
    })
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    expect(score.macroScore).toBe(0)
    expect(score.overall).toBeLessThan(30)
  })

  it('returns low macroScore for 50% intake', () => {
    const menu = makeMenu({
      currentIntake: {
        energy: 800,
        protein: 48,
        fat: 26,
        carbs: 100,
        sodium: 48,
        potassium: 32,
      },
    })
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    expect(score.macroScore).toBeLessThan(70)
  })
})

describe('scoreSimulation — safety violations', () => {
  it('penalizes for drug-nutrient interactions (warfarin + VitK)', () => {
    const caseWithWarfarin: SimulationCase = {
      ...baseCase,
      patient: {
        ...basePatient,
        medications: ['ワルファリン'],
      },
    }
    const menu = makeMenu({
      items: [
        { id: 'i1', productName: 'VitK配合ミルク', manufacturer: 'X', volume: 500, frequency: 3 },
      ],
    })
    const score = scoreSimulation(menu, baseIdealAnswer, caseWithWarfarin)
    expect(score.safetyScore).toBeLessThan(100)
  })

  it('penalizes for allergy violations', () => {
    const caseWithAllergy: SimulationCase = {
      ...baseCase,
      patient: {
        ...basePatient,
        allergies: ['乳'],
      },
    }
    const menu = makeMenu({
      items: [
        { id: 'i1', productName: '牛乳配合製品', manufacturer: 'X', volume: 500, frequency: 3 },
      ],
    })
    const score = scoreSimulation(menu, baseIdealAnswer, caseWithAllergy)
    expect(score.safetyScore).toBeLessThan(100)
  })

  it('returns 100 safety for no violations', () => {
    const menu = makeMenu()
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    expect(score.safetyScore).toBe(100)
  })
})

describe('scoreSimulation — efficiency', () => {
  it('penalizes excessive items', () => {
    const menu = makeMenu({
      items: [
        { id: 'i1', productName: 'ペプタメンAF', manufacturer: 'X', volume: 200, frequency: 1 },
        { id: 'i2', productName: '製品B', manufacturer: 'Y', volume: 200, frequency: 1 },
        { id: 'i3', productName: '製品C', manufacturer: 'Z', volume: 200, frequency: 1 },
        { id: 'i4', productName: '製品D', manufacturer: 'W', volume: 200, frequency: 1 },
        { id: 'i5', productName: '製品E', manufacturer: 'V', volume: 200, frequency: 1 },
      ],
    })
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    expect(score.efficiencyScore).toBeLessThan(80)
  })

  it('returns 0 efficiency for empty menu', () => {
    const menu = makeMenu({ items: [] })
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    expect(score.efficiencyScore).toBe(0)
  })
})

describe('scoreSimulation — weighting', () => {
  it('overall = macro*0.4 + constraint*0.3 + safety*0.2 + efficiency*0.1', () => {
    const menu = makeMenu()
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    const expected = Math.round(
      score.macroScore * 0.4 +
        score.constraintScore * 0.3 +
        score.safetyScore * 0.2 +
        score.efficiencyScore * 0.1,
    )
    expect(score.overall).toBe(expected)
  })
})

// ── generateFeedback ──

describe('generateFeedback', () => {
  it('returns correct feedback for perfect menu', () => {
    const menu = makeMenu()
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    const feedback = generateFeedback(menu, baseIdealAnswer, baseCase, score)
    expect(feedback.some((f) => f.type === 'correct')).toBe(true)
    expect(feedback.some((f) => f.category === '栄養充足度')).toBe(true)
  })

  it('returns error feedback for zero intake', () => {
    const menu = makeMenu({ currentIntake: {}, items: [] })
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    const feedback = generateFeedback(menu, baseIdealAnswer, baseCase, score)
    expect(feedback.some((f) => f.type === 'error')).toBe(true)
  })

  it('includes common mistakes as tips', () => {
    const menu = makeMenu()
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    const feedback = generateFeedback(menu, baseIdealAnswer, baseCase, score)
    const tips = feedback.filter((f) => f.type === 'tip')
    expect(tips.length).toBe(baseIdealAnswer.commonMistakes.length)
  })

  it('flags drug interactions in feedback', () => {
    const caseWithWarfarin: SimulationCase = {
      ...baseCase,
      patient: {
        ...basePatient,
        medications: ['ワルファリン'],
      },
    }
    const menu = makeMenu({
      items: [
        { id: 'i1', productName: 'VitK配合', manufacturer: 'X', volume: 500, frequency: 3 },
      ],
    })
    const score = scoreSimulation(menu, baseIdealAnswer, caseWithWarfarin)
    const feedback = generateFeedback(menu, baseIdealAnswer, caseWithWarfarin, score)
    expect(feedback.some((f) => f.category === '薬剤-栄養相互作用')).toBe(true)
  })

  it('does not mutate inputs', () => {
    const menu = makeMenu()
    const menuCopy = JSON.parse(JSON.stringify(menu))
    const caseCopy = JSON.parse(JSON.stringify(baseCase))
    const score = scoreSimulation(menu, baseIdealAnswer, baseCase)
    generateFeedback(menu, baseIdealAnswer, baseCase, score)
    expect(menu).toEqual(menuCopy)
    expect(baseCase).toEqual(caseCopy)
  })
})
