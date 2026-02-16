import { describe, it, expect } from 'vitest'
import { getEnteralProducts, getParenteralProducts } from './nutritionDataLoader'

// ---- Test fixtures ----

const enteralProduct = {
  製剤名: 'エンシュア',
  メーカー: 'アボット',
  カテゴリ: '経腸栄養剤',
  サブカテゴリ: '標準経腸栄養剤',
  投与経路: '経腸',
}

const parenteralProduct = {
  製剤名: 'エルネオパNF1号',
  メーカー: '大塚製薬',
  カテゴリ: '輸液',
  サブカテゴリ: '中心静脈栄養',
  投与経路: '静脈',
}

const ivDripProduct = {
  製剤名: 'ソリタT3号',
  メーカー: 'テルモ',
  カテゴリ: '点滴',
  サブカテゴリ: '維持輸液',
  投与経路: '',
}

const ambiguousProduct = {
  製剤名: 'ビタミン剤',
  メーカー: 'テスト',
  カテゴリ: '栄養剤',
  サブカテゴリ: '',
  投与経路: '',
}

const products = [
  enteralProduct,
  parenteralProduct,
  ivDripProduct,
  ambiguousProduct,
]

// ---- getEnteralProducts ----

describe('getEnteralProducts', () => {
  it('includes products with 経腸 route', () => {
    const result = getEnteralProducts(products)
    expect(result).toContainEqual(enteralProduct)
  })

  it('includes products with 栄養剤 category (ambiguous → enteral)', () => {
    const result = getEnteralProducts(products)
    expect(result).toContainEqual(ambiguousProduct)
  })

  it('excludes products with 静脈 route', () => {
    const result = getEnteralProducts(products)
    expect(result).not.toContainEqual(parenteralProduct)
  })

  it('excludes products with 点滴 category', () => {
    const result = getEnteralProducts(products)
    expect(result).not.toContainEqual(ivDripProduct)
  })

  it('returns empty array for empty input', () => {
    expect(getEnteralProducts([])).toEqual([])
  })

  it('handles products with missing fields', () => {
    const incomplete = [{ 製剤名: 'テスト' }]
    const result = getEnteralProducts(incomplete)
    // No crash; product without route/category treated as enteral
    expect(result.length).toBe(1)
  })
})

// ---- getParenteralProducts ----

describe('getParenteralProducts', () => {
  it('includes products with 静脈 route', () => {
    const result = getParenteralProducts(products)
    expect(result).toContainEqual(parenteralProduct)
  })

  it('includes products with 点滴 category', () => {
    const result = getParenteralProducts(products)
    expect(result).toContainEqual(ivDripProduct)
  })

  it('excludes purely enteral products', () => {
    const result = getParenteralProducts(products)
    expect(result).not.toContainEqual(enteralProduct)
  })

  it('excludes ambiguous products without IV markers', () => {
    const result = getParenteralProducts(products)
    expect(result).not.toContainEqual(ambiguousProduct)
  })

  it('returns empty array for empty input', () => {
    expect(getParenteralProducts([])).toEqual([])
  })

  it('includes products with 輸液 category', () => {
    const fluid = { 製剤名: '維持液', カテゴリ: '輸液', サブカテゴリ: '', 投与経路: '' }
    expect(getParenteralProducts([fluid])).toContainEqual(fluid)
  })

  it('includes products with 注射 category', () => {
    const injection = { 製剤名: '注射薬', カテゴリ: '注射', サブカテゴリ: '', 投与経路: '' }
    expect(getParenteralProducts([injection])).toContainEqual(injection)
  })

  it('includes products with 静脈 subcategory', () => {
    const iv = { 製剤名: 'TPN製剤', カテゴリ: '栄養', サブカテゴリ: '中心静脈栄養', 投与経路: '' }
    expect(getParenteralProducts([iv])).toContainEqual(iv)
  })
})
