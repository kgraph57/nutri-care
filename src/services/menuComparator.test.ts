import { describe, it, expect } from 'vitest'
import type { NutritionMenuData } from '../hooks/useNutritionMenus'
import { compareMenus } from './menuComparator'

function makeMenu(overrides: Partial<NutritionMenuData> = {}): NutritionMenuData {
  return {
    id: 'test-1',
    patientId: 'P001',
    patientName: 'テスト患者',
    nutritionType: 'enteral',
    menuName: 'テストメニュー',
    items: [],
    totalEnergy: 1500,
    totalVolume: 1500,
    requirements: null,
    currentIntake: { energy: 1500, protein: 60, fat: 45, carbs: 200 },
    notes: '',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('compareMenus — basic comparison', () => {
  it('compares two menus and returns correct structure', () => {
    const menu1 = makeMenu({ id: 'm1', totalEnergy: 1500, totalVolume: 1500 })
    const menu2 = makeMenu({ id: 'm2', totalEnergy: 1800, totalVolume: 1800 })
    const result = compareMenus([menu1, menu2])

    expect(result.menus.length).toBe(2)
    expect(result.totalEnergies).toEqual([1500, 1800])
    expect(result.totalVolumes).toEqual([1500, 1800])
    expect(result.nutrients.length).toBe(12)
  })

  it('returns item counts correctly', () => {
    const menu1 = makeMenu({
      id: 'm1',
      items: [
        { id: 'i1', productName: 'A', manufacturer: 'X', volume: 200, frequency: 3 },
      ],
    })
    const menu2 = makeMenu({
      id: 'm2',
      items: [
        { id: 'i2', productName: 'B', manufacturer: 'X', volume: 200, frequency: 3 },
        { id: 'i3', productName: 'C', manufacturer: 'Y', volume: 100, frequency: 2 },
      ],
    })
    const result = compareMenus([menu1, menu2])
    expect(result.itemCounts).toEqual([1, 2])
  })
})

describe('compareMenus — nutrient extraction', () => {
  it('extracts energy from currentIntake', () => {
    const menu1 = makeMenu({ currentIntake: { energy: 1500 } })
    const menu2 = makeMenu({ currentIntake: { energy: 2000 } })
    const result = compareMenus([menu1, menu2])
    const energyNutrient = result.nutrients.find(n => n.nutrient === 'energy')
    expect(energyNutrient?.values).toEqual([1500, 2000])
  })

  it('defaults missing nutrients to 0', () => {
    const menu1 = makeMenu({ currentIntake: { energy: 1500 } })
    const menu2 = makeMenu({ currentIntake: { energy: 2000 } })
    const result = compareMenus([menu1, menu2])
    const zincNutrient = result.nutrients.find(n => n.nutrient === 'zinc')
    expect(zincNutrient?.values).toEqual([0, 0])
  })
})

describe('compareMenus — best index selection', () => {
  it('selects higher value as best when no target', () => {
    const menu1 = makeMenu({ currentIntake: { energy: 1500, protein: 60 } })
    const menu2 = makeMenu({ currentIntake: { energy: 2000, protein: 80 } })
    const result = compareMenus([menu1, menu2])
    const energyNutrient = result.nutrients.find(n => n.nutrient === 'energy')
    expect(energyNutrient?.best).toBe(1) // menu2 has higher energy
  })
})

describe('compareMenus — 3-4 menu comparison', () => {
  it('handles 3 menus correctly', () => {
    const menus = [
      makeMenu({ id: 'm1', totalEnergy: 1000, currentIntake: { energy: 1000, protein: 40 } }),
      makeMenu({ id: 'm2', totalEnergy: 1500, currentIntake: { energy: 1500, protein: 60 } }),
      makeMenu({ id: 'm3', totalEnergy: 2000, currentIntake: { energy: 2000, protein: 80 } }),
    ]
    const result = compareMenus(menus)
    expect(result.totalEnergies).toEqual([1000, 1500, 2000])
    expect(result.nutrients[0].values.length).toBe(3)
  })

  it('handles 4 menus correctly', () => {
    const menus = Array.from({ length: 4 }, (_, i) =>
      makeMenu({
        id: `m${i}`,
        totalEnergy: (i + 1) * 500,
        currentIntake: { energy: (i + 1) * 500 },
      }),
    )
    const result = compareMenus(menus)
    expect(result.menus.length).toBe(4)
    expect(result.totalEnergies).toEqual([500, 1000, 1500, 2000])
  })
})

describe('compareMenus — clinical scenarios', () => {
  it('compares refeeding Day1 vs Day5 menus', () => {
    const day1 = makeMenu({
      id: 'rf-d1',
      menuName: 'Day1 Refeeding開始',
      totalEnergy: 300,
      totalVolume: 300,
      currentIntake: { energy: 300, protein: 12 },
    })
    const day5 = makeMenu({
      id: 'rf-d5',
      menuName: 'Day5 Refeeding漸増',
      totalEnergy: 750,
      totalVolume: 750,
      currentIntake: { energy: 750, protein: 30 },
    })
    const result = compareMenus([day1, day5])
    expect(result.totalEnergies[1]).toBeGreaterThan(result.totalEnergies[0])
    const proteinNutrient = result.nutrients.find(n => n.nutrient === 'protein')
    expect(proteinNutrient?.values[1]).toBeGreaterThan(proteinNutrient?.values[0] ?? 0)
  })

  it('compares enteral vs TPN menus', () => {
    const enteral = makeMenu({
      id: 'en',
      nutritionType: 'enteral',
      totalEnergy: 1200,
      currentIntake: { energy: 1200, protein: 48, sodium: 80 },
    })
    const parenteral = makeMenu({
      id: 'pn',
      nutritionType: 'parenteral',
      totalEnergy: 1000,
      currentIntake: { energy: 1000, protein: 40, sodium: 120 },
    })
    const result = compareMenus([enteral, parenteral])
    const naNutrient = result.nutrients.find(n => n.nutrient === 'sodium')
    expect(naNutrient?.values).toEqual([80, 120])
  })
})

describe('compareMenus — immutability', () => {
  it('does not mutate input menus', () => {
    const menu1 = makeMenu({ id: 'm1' })
    const menu2 = makeMenu({ id: 'm2' })
    const copy1 = JSON.parse(JSON.stringify(menu1))
    const copy2 = JSON.parse(JSON.stringify(menu2))
    compareMenus([menu1, menu2])
    expect(menu1).toEqual(copy1)
    expect(menu2).toEqual(copy2)
  })
})
