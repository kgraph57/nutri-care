import type { NutritionMenuData } from '../hooks/useNutritionMenus'
import type {
  SimulationCase,
  SimulationScore,
  FeedbackItem,
  IdealAnswer,
} from '../types/simulation'
import { calculateAdequacyScore } from './adequacyScorer'
import { checkDrugNutrientInteractions } from './drugNutrientChecker'
import { checkAllergies } from './allergyChecker'

// ── 定数 ──

const WEIGHT_MACRO = 0.4
const WEIGHT_CONSTRAINT = 0.3
const WEIGHT_SAFETY = 0.2
const WEIGHT_EFFICIENCY = 0.1

const SAFETY_PENALTY_PER_VIOLATION = 20

// ── macroScore: 充足スコアを再利用 ──

function calcMacroScore(
  userMenu: NutritionMenuData,
  idealAnswer: IdealAnswer,
): number {
  const intake = userMenu.currentIntake ?? {}
  const breakdown = calculateAdequacyScore(idealAnswer.requirements, intake)
  return breakdown.overall
}

// ── constraintScore: keyPointsへの適合度 ──

function extractNumericConstraint(
  keyPoint: string,
): { nutrient: string; op: 'lt' | 'gt' | 'range'; low: number; high: number } | null {
  // "蛋白 0.6-0.8g/kg/day" → range
  const rangeMatch = keyPoint.match(
    /(エネルギー|蛋白|蛋白質|タンパク|脂質|炭水化物|糖質|Na|K|Ca|Mg|P|Fe|Zn|Cu|水分)[質]?\s*[：:]?\s*([\d.]+)\s*[-~～]\s*([\d.]+)/,
  )
  if (rangeMatch) {
    return {
      nutrient: rangeMatch[1],
      op: 'range',
      low: parseFloat(rangeMatch[2]),
      high: parseFloat(rangeMatch[3]),
    }
  }

  // "K < 40mEq" → lt
  const ltMatch = keyPoint.match(
    /(エネルギー|蛋白|Na|K|Ca|Mg|P|水分)\s*[<＜≤≦]\s*([\d.]+)/,
  )
  if (ltMatch) {
    return { nutrient: ltMatch[1], op: 'lt', low: 0, high: parseFloat(ltMatch[2]) }
  }

  // "蛋白 > 1.5g/kg" → gt
  const gtMatch = keyPoint.match(
    /(エネルギー|蛋白|Na|K|Ca|Mg|P)\s*[>＞≥≧]\s*([\d.]+)/,
  )
  if (gtMatch) {
    return { nutrient: gtMatch[1], op: 'gt', low: parseFloat(gtMatch[2]), high: Infinity }
  }

  return null
}

function calcConstraintScore(
  userMenu: NutritionMenuData,
  idealAnswer: IdealAnswer,
  simCase: SimulationCase,
): number {
  const keyPoints = idealAnswer.keyPoints
  if (keyPoints.length === 0) return 100

  let matchedPoints = 0

  for (const kp of keyPoints) {
    const constraint = extractNumericConstraint(kp)
    if (constraint) {
      // numeric constraint check against intake or calculated values
      const intake = userMenu.currentIntake ?? {}
      const weight = simCase.patient.weight

      let actualValue = 0
      switch (constraint.nutrient) {
        case 'エネルギー':
          actualValue = intake.energy ?? 0
          break
        case '蛋白':
        case '蛋白質':
        case 'タンパク':
          actualValue = (intake.protein ?? 0) / weight // g/kg/day
          break
        case 'Na':
          actualValue = intake.sodium ?? 0
          break
        case 'K':
          actualValue = intake.potassium ?? 0
          break
        case 'Ca':
          actualValue = intake.calcium ?? 0
          break
        case 'Mg':
          actualValue = intake.magnesium ?? 0
          break
        case 'P':
          actualValue = intake.phosphorus ?? 0
          break
        case '水分':
          actualValue = userMenu.totalVolume ?? 0
          break
        default:
          matchedPoints += 0.5
          continue
      }

      if (constraint.op === 'range' && actualValue >= constraint.low && actualValue <= constraint.high) {
        matchedPoints += 1
      } else if (constraint.op === 'lt' && actualValue <= constraint.high) {
        matchedPoints += 1
      } else if (constraint.op === 'gt' && actualValue >= constraint.low) {
        matchedPoints += 1
      }
    } else {
      // non-numeric keypoint: check for product category keywords
      const kpLower = kp.toLowerCase()
      const menuText = userMenu.items
        .map((item) => item.productName)
        .join(' ')
        .toLowerCase()

      const productKeywords = [
        'bcaa', 'アミノレバン', 'ヘパン', '腎', 'レナ', 'グルセルナ',
        '糖尿', '母乳', '強化', 'チアミン', 'フェニトイン', 'mct',
      ]

      const hasRelevantKeyword = productKeywords.some(
        (kw) => kpLower.includes(kw) && menuText.includes(kw),
      )

      if (hasRelevantKeyword) {
        matchedPoints += 1
      } else {
        // give partial credit for non-verifiable keypoints
        matchedPoints += 0.5
      }
    }
  }

  return Math.min(100, Math.round((matchedPoints / keyPoints.length) * 100))
}

// ── safetyScore: 薬剤相互作用 + アレルギー ──

type Product = Record<string, string | number>

function buildProductsFromMenu(
  userMenu: NutritionMenuData,
): Array<{ product: Product }> {
  return userMenu.items.map((item) => ({
    product: {
      製剤名: item.productName,
      カテゴリ: '',
      サブカテゴリ: '',
    },
  }))
}

function calcSafetyScore(
  userMenu: NutritionMenuData,
  simCase: SimulationCase,
): number {
  const menuProducts = buildProductsFromMenu(userMenu)
  const { patient } = simCase

  const drugInteractions = checkDrugNutrientInteractions(
    patient.medications,
    menuProducts,
    userMenu.nutritionType,
  )

  const allergyWarnings = checkAllergies(patient, menuProducts)

  const highSeverityCount = drugInteractions.filter(
    (d) => d.severity === 'high',
  ).length
  const medSeverityCount = drugInteractions.filter(
    (d) => d.severity === 'medium',
  ).length

  const allergyCount = allergyWarnings.length

  const totalPenalty =
    highSeverityCount * SAFETY_PENALTY_PER_VIOLATION +
    medSeverityCount * (SAFETY_PENALTY_PER_VIOLATION / 2) +
    allergyCount * SAFETY_PENALTY_PER_VIOLATION

  return Math.max(0, 100 - totalPenalty)
}

// ── efficiencyScore: 製品選択の適切さ ──

function calcEfficiencyScore(
  userMenu: NutritionMenuData,
  idealAnswer: IdealAnswer,
): number {
  const userItemCount = userMenu.items.length
  const idealItemCount = idealAnswer.menuItems.length

  if (userItemCount === 0) return 0

  // Check required categories present
  const requiredItems = idealAnswer.menuItems.filter((m) => m.required)
  let requiredMatched = 0

  for (const req of requiredItems) {
    const found = userMenu.items.some((userItem) =>
      req.productKeywords.some((kw) =>
        userItem.productName.toLowerCase().includes(kw.toLowerCase()),
      ),
    )
    if (found) requiredMatched += 1
  }

  const requiredScore =
    requiredItems.length > 0
      ? (requiredMatched / requiredItems.length) * 60
      : 60

  // Penalize excessive items
  const itemCountDiff = Math.abs(userItemCount - idealItemCount)
  const countPenalty = Math.min(40, itemCountDiff * 10)
  const countScore = 40 - countPenalty

  return Math.max(0, Math.min(100, Math.round(requiredScore + countScore)))
}

// ── メイン採点関数 ──

export function scoreSimulation(
  userMenu: NutritionMenuData,
  idealAnswer: IdealAnswer,
  simCase: SimulationCase,
): SimulationScore {
  const macroScore = calcMacroScore(userMenu, idealAnswer)
  const constraintScore = calcConstraintScore(userMenu, idealAnswer, simCase)
  const safetyScore = calcSafetyScore(userMenu, simCase)
  const efficiencyScore = calcEfficiencyScore(userMenu, idealAnswer)

  const overall = Math.round(
    macroScore * WEIGHT_MACRO +
      constraintScore * WEIGHT_CONSTRAINT +
      safetyScore * WEIGHT_SAFETY +
      efficiencyScore * WEIGHT_EFFICIENCY,
  )

  return {
    overall,
    macroScore,
    constraintScore,
    safetyScore,
    efficiencyScore,
  }
}

// ── フィードバック生成 ──

export function generateFeedback(
  userMenu: NutritionMenuData,
  idealAnswer: IdealAnswer,
  simCase: SimulationCase,
  score: SimulationScore,
): readonly FeedbackItem[] {
  const feedback: FeedbackItem[] = []

  // Macro feedback
  if (score.macroScore >= 80) {
    feedback.push({
      type: 'correct',
      category: '栄養充足度',
      message: `栄養充足スコア ${score.macroScore}点: 目標に対して適切な栄養量です`,
    })
  } else if (score.macroScore >= 50) {
    feedback.push({
      type: 'warning',
      category: '栄養充足度',
      message: `栄養充足スコア ${score.macroScore}点: 一部の栄養素が目標に達していません`,
      detail: '充足スコアの詳細を確認し、不足している栄養素を補ってください',
    })
  } else {
    feedback.push({
      type: 'error',
      category: '栄養充足度',
      message: `栄養充足スコア ${score.macroScore}点: 大幅な栄養不足があります`,
      detail: 'エネルギーと蛋白質を中心に、投与量の再検討が必要です',
    })
  }

  // Constraint feedback
  if (score.constraintScore < 70) {
    const missed = idealAnswer.keyPoints.slice(0, 3).join('、')
    feedback.push({
      type: 'error',
      category: '疾患固有制限',
      message: '重要な制限事項が遵守されていません',
      detail: `確認すべきポイント: ${missed}`,
    })
  } else if (score.constraintScore < 90) {
    feedback.push({
      type: 'warning',
      category: '疾患固有制限',
      message: '一部の制限事項に改善の余地があります',
    })
  }

  // Safety feedback
  const menuProducts = buildProductsFromMenu(userMenu)
  const drugInteractions = checkDrugNutrientInteractions(
    simCase.patient.medications,
    menuProducts,
    userMenu.nutritionType,
  )

  for (const interaction of drugInteractions) {
    feedback.push({
      type: interaction.severity === 'high' ? 'error' : 'warning',
      category: '薬剤-栄養相互作用',
      message: interaction.message,
      detail: interaction.recommendation,
    })
  }

  const allergyWarnings = checkAllergies(simCase.patient, menuProducts)
  for (const warning of allergyWarnings) {
    feedback.push({
      type: 'error',
      category: 'アレルギー',
      message: warning.message,
    })
  }

  // Efficiency feedback
  if (score.efficiencyScore < 50) {
    feedback.push({
      type: 'warning',
      category: '製品選択',
      message: '推奨される製品カテゴリが不足しています',
      detail: idealAnswer.menuItems
        .filter((m) => m.required)
        .map((m) => m.category)
        .join('、') + 'の製品を検討してください',
    })
  }

  // Common mistakes tips
  for (const mistake of idealAnswer.commonMistakes) {
    feedback.push({
      type: 'tip',
      category: 'よくある間違い',
      message: mistake,
    })
  }

  return feedback
}
