import type { Patient, NutritionType } from '../types'
import type { LabData } from '../types/labData'
import type { ConditionCategory } from './diagnosisClassifier'
import { classifyDiagnosis } from './diagnosisClassifier'
import { getRuleForCondition } from '../data/conditionProductRules'
import { checkAllergies } from './allergyChecker'

// ── Types ──

type Product = Record<string, string | number>

export interface CompressedProduct {
  readonly name: string
  readonly kcal_ml: number
  readonly protein_100ml: number
  readonly subcategory: string
  readonly key_features: string
}

export interface CompressedContext {
  readonly candidates: readonly CompressedProduct[]
  readonly patient_summary: string
  readonly condition: string
  readonly nutrition_type_label: string
}

// ── Helpers ──

function safeNum(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val
  if (typeof val === 'string') {
    const parsed = parseFloat(val)
    if (!Number.isNaN(parsed)) return parsed
  }
  return 0
}

function filterByRoute(
  products: readonly Product[],
  nutritionType: NutritionType,
): readonly Product[] {
  const routeKey = nutritionType === 'enteral' ? '経腸' : '静脈'
  return products.filter((p) => {
    const route = String(p['投与経路'] ?? '')
    const category = String(p['カテゴリ'] ?? '')
    const sub = String(p['サブカテゴリ'] ?? '')
    return (
      route.includes(routeKey) ||
      category.includes(routeKey) ||
      sub.includes(routeKey)
    )
  })
}

function excludeAllergens(
  products: readonly Product[],
  allergies: readonly string[],
): readonly Product[] {
  if (allergies.length === 0) return products
  const patient = { allergies: [...allergies] } as Patient
  return products.filter((p) => {
    const warnings = checkAllergies(patient, [{ product: p }])
    return warnings.length === 0
  })
}

function scoreForCondition(
  product: Product,
  condition: ConditionCategory,
  nutritionType: NutritionType,
): number {
  const rule = getRuleForCondition(condition)
  const criteria =
    nutritionType === 'enteral'
      ? rule.enteralCriteria
      : rule.parenteralCriteria

  let score = 0
  const name = String(product['製剤名'] ?? '').toLowerCase()
  const sub = String(product['サブカテゴリ'] ?? '').toLowerCase()

  for (const kw of criteria.nameKeywords) {
    if (name.includes(kw.toLowerCase()) || sub.includes(kw.toLowerCase())) {
      score += 10
    }
  }

  const energy = safeNum(product['エネルギー[kcal/ml]'])
  if (energy > 0) score += 1

  return score
}

function compressProduct(product: Product): CompressedProduct {
  const energy = safeNum(product['エネルギー[kcal/ml]'])
  const protein = safeNum(product['タンパク質[g/100ml]'])
  const fat = safeNum(product['脂質[g/100ml]'])
  const na = safeNum(product['Na[mEq/L]'])
  const k = safeNum(product['K[mEq/L]'])

  const features: string[] = []
  if (energy >= 1.5) features.push('高濃度')
  if (protein >= 5) features.push('高蛋白')
  if (fat === 0) features.push('脂肪なし')
  if (na > 0 || k > 0) features.push(`Na${na}/K${k}mEq`)

  return {
    name: String(product['製剤名'] ?? ''),
    kcal_ml: energy,
    protein_100ml: protein,
    subcategory: String(product['サブカテゴリ'] ?? ''),
    key_features: features.join(', ') || '標準',
  }
}

function buildPatientSummaryForAI(patient: Patient, labData?: LabData): string {
  const bmi = patient.weight / (patient.height / 100) ** 2
  const lines = [
    `${patient.age}歳 ${patient.gender} BMI${bmi.toFixed(1)}`,
    `診断: ${patient.diagnosis}`,
  ]

  if (patient.allergies.length > 0) {
    lines.push(`アレルギー: ${patient.allergies.join(',')}`)
  }
  if (patient.medications.length > 0) {
    lines.push(`併用薬: ${patient.medications.join(',')}`)
  }

  if (labData) {
    const abnormals: string[] = []
    if (labData.albumin !== undefined && labData.albumin < 3.0)
      abnormals.push(`Alb${labData.albumin}`)
    if (labData.creatinine !== undefined && labData.creatinine > 1.2)
      abnormals.push(`Cr${labData.creatinine}`)
    if (labData.potassium !== undefined && labData.potassium > 5.0)
      abnormals.push(`K${labData.potassium}`)
    if (labData.sodium !== undefined && labData.sodium < 135)
      abnormals.push(`Na${labData.sodium}`)
    if (abnormals.length > 0) {
      lines.push(`異常値: ${abnormals.join(', ')}`)
    }
  }

  return lines.join(' / ')
}

// ── Main export ──

export function compressForAI(
  products: readonly Product[],
  patient: Patient,
  nutritionType: NutritionType,
  labData?: LabData,
  maxCandidates = 20,
): CompressedContext {
  const condition = classifyDiagnosis(
    patient.diagnosis,
    patient.patientType,
    patient.age,
  )

  let candidates = filterByRoute(products, nutritionType)
  candidates = excludeAllergens(candidates, patient.allergies)

  const scored = candidates.map((p) => ({
    product: p,
    score: scoreForCondition(p, condition.primary, nutritionType),
  }))

  scored.sort((a, b) => b.score - a.score)

  const uniqueNames = new Set<string>()
  const topCandidates: CompressedProduct[] = []

  for (const { product } of scored) {
    const name = String(product['製剤名'] ?? '')
    if (uniqueNames.has(name)) continue
    uniqueNames.add(name)
    topCandidates.push(compressProduct(product))
    if (topCandidates.length >= maxCandidates) break
  }

  const typeLabel = nutritionType === 'enteral' ? '経腸栄養' : '静脈栄養'
  const rule = getRuleForCondition(condition.primary)

  return {
    candidates: topCandidates,
    patient_summary: buildPatientSummaryForAI(patient, labData),
    condition: rule.conditionLabel,
    nutrition_type_label: typeLabel,
  }
}

/**
 * Finds the original Product record by name from the compressed candidate name.
 */
export function findProductByName(
  products: readonly Product[],
  name: string,
): Product | undefined {
  return products.find(
    (p) => String(p['製剤名'] ?? '') === name,
  )
}
