import type { Patient, NutritionType, NutritionRequirements } from '../types'
import type { LabData } from '../types/labData'
import type { NutritionMenuData } from '../hooks/useNutritionMenus'
import type { SimulationCase, IdealAnswer, SimulationScore } from '../types/simulation'
import { analyzeLabData, getAbnormalFindings } from './labAnalyzer'
import { generateRecommendations, generateStrategySummary } from './nutritionAdvisor'
import { calculateAdequacyScore } from './adequacyScorer'
import { checkDrugNutrientInteractions } from './drugNutrientChecker'
import { generateFeedingProtocol } from './feedingProtocol'

// ── Types ──

export interface NutritionContext {
  readonly patientSummary: string
  readonly labSummary: string
  readonly menuSummary: string
  readonly ruleBasedAnalysis: string
  readonly protocolSummary: string
}

export interface EducationContext {
  readonly caseSummary: string
  readonly objectives: string
  readonly hiddenKeyPoints: string
  readonly userPerformance: string
}

type Product = Record<string, string | number>

// ── Clinical Mode Context ──

function buildPatientSummary(patient: Patient): string {
  const lines = [
    `患者: ${patient.name}`,
    `年齢: ${patient.age}歳 / 性別: ${patient.gender}`,
    `身長: ${patient.height}cm / 体重: ${patient.weight}kg`,
    `BMI: ${((patient.weight / (patient.height / 100) ** 2)).toFixed(1)}`,
    `診断: ${patient.diagnosis}`,
    `病棟: ${patient.ward} / 患者タイプ: ${patient.patientType}`,
  ]
  if (patient.allergies.length > 0) {
    lines.push(`アレルギー: ${patient.allergies.join(', ')}`)
  }
  if (patient.medications.length > 0) {
    lines.push(`併用薬: ${patient.medications.join(', ')}`)
  }
  if (patient.notes) {
    lines.push(`備考: ${patient.notes}`)
  }
  return lines.join('\n')
}

function buildLabSummary(labData: LabData): string {
  const interpretations = analyzeLabData(labData)
  const abnormal = getAbnormalFindings(interpretations)
  const strategy = generateStrategySummary(labData)

  const lines = ['【検査値サマリー】']

  if (abnormal.length > 0) {
    lines.push('異常所見:')
    for (const item of abnormal) {
      lines.push(`  - ${item.parameter}: ${item.message} (${item.status})`)
    }
  } else {
    lines.push('異常所見: なし')
  }

  if (strategy) {
    lines.push(`\n戦略: ${strategy}`)
  }

  return lines.join('\n')
}

function buildMenuSummary(
  menu: NutritionMenuData,
  requirements: NutritionRequirements,
): string {
  const intake = menu.currentIntake ?? {}
  const adequacy = calculateAdequacyScore(requirements, intake)

  const lines = [
    `【メニュー: ${menu.menuName}】`,
    `栄養タイプ: ${menu.nutritionType === 'enteral' ? '経腸栄養' : '静脈栄養'}`,
    `総エネルギー: ${menu.totalEnergy} kcal / 総量: ${menu.totalVolume} mL`,
    '',
    '製品:',
  ]

  for (const item of menu.items) {
    lines.push(`  - ${item.productName} ${item.volume}mL × ${item.frequency}回/日`)
  }

  lines.push('')
  lines.push('充足度スコア:')
  lines.push(`  総合: ${adequacy.overall}/100`)
  lines.push(`  マクロ: ${adequacy.macroScore}/100 (エネルギー+三大栄養素)`)
  lines.push(`  電解質: ${adequacy.electrolyteScore}/100`)
  lines.push(`  微量元素: ${adequacy.traceElementScore}/100`)

  const deficient = adequacy.details.filter((d) => d.status === 'deficient' || d.status === 'low')
  if (deficient.length > 0) {
    lines.push('')
    lines.push('不足栄養素:')
    for (const d of deficient) {
      lines.push(`  - ${d.label}: ${d.current}/${d.target} (${d.percentage}%)`)
    }
  }

  const excess = adequacy.details.filter((d) => d.status === 'excess')
  if (excess.length > 0) {
    lines.push('')
    lines.push('過剰栄養素:')
    for (const e of excess) {
      lines.push(`  - ${e.label}: ${e.current}/${e.target} (${e.percentage}%)`)
    }
  }

  return lines.join('\n')
}

function buildRuleBasedAnalysis(
  patient: Patient,
  labData: LabData,
  nutritionType: NutritionType,
  products: readonly Product[],
): string {
  const recommendations = generateRecommendations(patient, labData, nutritionType, products)
  const interactions = checkDrugNutrientInteractions(patient.medications)

  const lines = ['【ルールベース分析】']

  if (recommendations.length > 0) {
    lines.push('推奨:')
    for (const rec of recommendations) {
      lines.push(`  [${rec.priority}] ${rec.category}: ${rec.reasoning}`)
      for (const p of rec.products.slice(0, 3)) {
        lines.push(`    → ${String(p.product['製剤名'] ?? '不明')}: ${p.rationale}`)
      }
    }
  }

  if (interactions.length > 0) {
    lines.push('')
    lines.push('薬剤-栄養相互作用:')
    for (const inter of interactions) {
      lines.push(`  [${inter.severity}] ${inter.drug} ↔ ${inter.nutrient}: ${inter.recommendation}`)
    }
  }

  return lines.join('\n')
}

function buildProtocolSummary(
  patient: Patient,
  nutritionType: NutritionType,
  requirements: NutritionRequirements,
): string {
  const protocol = generateFeedingProtocol(patient, nutritionType, {
    targetEnergy: requirements.energy,
    targetProtein: requirements.protein,
  })

  const lines = [
    '【投与プロトコル】',
    `初期速度: ${protocol.initialRate} mL/h`,
    `目標速度: ${protocol.targetRate} mL/h`,
    `増量: ${protocol.incrementRate} mL/h ごと ${protocol.incrementInterval}h 間隔`,
    '',
    'ステップ:',
  ]

  for (const step of protocol.steps.slice(0, 5)) {
    lines.push(`  Day${step.day}: ${step.rate}mL/h (${step.volume}mL/day) - ${step.notes}`)
  }

  return lines.join('\n')
}

export function buildNutritionContext(
  patient: Patient,
  labData: LabData,
  menu: NutritionMenuData,
  products: readonly Product[],
  nutritionType: NutritionType,
): NutritionContext {
  return {
    patientSummary: buildPatientSummary(patient),
    labSummary: buildLabSummary(labData),
    menuSummary: buildMenuSummary(menu, menu.requirements),
    ruleBasedAnalysis: buildRuleBasedAnalysis(patient, labData, nutritionType, products),
    protocolSummary: buildProtocolSummary(patient, nutritionType, menu.requirements),
  }
}

// ── Education Mode Context ──

function buildCaseSummary(simCase: SimulationCase): string {
  const lines = [
    `【症例】${simCase.title}`,
    `難易度: ${simCase.difficulty}`,
    `カテゴリ: ${simCase.category}`,
    '',
    buildPatientSummary(simCase.patient),
    '',
    `臨床背景: ${simCase.clinicalContext}`,
  ]
  return lines.join('\n')
}

function buildObjectives(objectives: readonly string[]): string {
  const lines = ['【学習目標】']
  for (const obj of objectives) {
    lines.push(`  - ${obj}`)
  }
  return lines.join('\n')
}

function buildHiddenKeyPoints(idealAnswer: IdealAnswer): string {
  const lines = [
    '【模範ポイント（ユーザーには非公開）】',
    `栄養タイプ: ${idealAnswer.nutritionType === 'enteral' ? '経腸栄養' : '静脈栄養'}`,
    '',
    '重要ポイント:',
  ]
  for (const kp of idealAnswer.keyPoints) {
    lines.push(`  - ${kp}`)
  }
  lines.push('')
  lines.push('よくある間違い:')
  for (const cm of idealAnswer.commonMistakes) {
    lines.push(`  - ${cm}`)
  }
  lines.push('')
  lines.push(`根拠: ${idealAnswer.rationale}`)
  lines.push(`参考文献: ${idealAnswer.references.join(', ')}`)
  return lines.join('\n')
}

function buildUserPerformance(
  menu: NutritionMenuData | null,
  score: SimulationScore | null,
): string {
  if (!menu || !score) {
    return '【ユーザー回答】まだ未提出'
  }

  const lines = [
    '【ユーザー回答】',
    `総合スコア: ${score.overall}/100`,
    `  マクロ充足: ${score.macroScore}/100`,
    `  制約適合: ${score.constraintScore}/100`,
    `  安全性: ${score.safetyScore}/100`,
    `  効率性: ${score.efficiencyScore}/100`,
    '',
    `総エネルギー: ${menu.totalEnergy} kcal`,
    '選択製品:',
  ]
  for (const item of menu.items) {
    lines.push(`  - ${item.productName} ${item.volume}mL × ${item.frequency}回`)
  }
  return lines.join('\n')
}

export function buildEducationContext(
  simCase: SimulationCase,
  userMenu: NutritionMenuData | null,
  userScore: SimulationScore | null,
): EducationContext {
  return {
    caseSummary: buildCaseSummary(simCase),
    objectives: buildObjectives(simCase.objectives),
    hiddenKeyPoints: buildHiddenKeyPoints(simCase.idealAnswer),
    userPerformance: buildUserPerformance(userMenu, userScore),
  }
}

// ── System Prompts ──

export function buildClinicalSystemPrompt(context: NutritionContext): string {
  return `あなたはICU/PICU栄養管理の専門AIアシスタントです。

以下の患者情報とルールベース分析結果に基づいて、栄養管理に関する質問に回答してください。

## ルール
- 回答は日本語で行ってください
- ASPEN, ESPENなどのガイドラインを引用して根拠を示してください
- 不確実な場合は「確定的ではありませんが」と前置きしてください
- ルールベース分析と矛盾する場合は、その旨を明示してください
- 患者の安全に関わる場合は必ず警告してください
- 簡潔かつ臨床的に有用な回答を心がけてください

## 患者情報
${context.patientSummary}

## 検査値
${context.labSummary}

## 現在のメニュー
${context.menuSummary}

## ルールベース分析
${context.ruleBasedAnalysis}

## 投与プロトコル
${context.protocolSummary}`
}

export function buildEducationSystemPrompt(context: EducationContext): string {
  return `あなたは栄養管理教育のAIチューターです。

以下の症例について、学習者が自分で考えて答えにたどり着けるようソクラテス式で導いてください。

## ルール
- 回答は日本語で行ってください
- 答えを直接教えないでください。質問で思考を促してください
- 学習者が重要なポイントを見逃している場合はヒントを出してください
- よくある間違いを犯しそうな場合は「それで大丈夫ですか？」と確認してください
- ガイドラインの参照は促しますが、具体的な数値は学習者に考えさせてください
- 正解に近づいたら積極的に褒めてください

## 症例情報
${context.caseSummary}

## 学習目標
${context.objectives}

## 教師用参考情報（絶対にユーザーに直接開示しないこと）
${context.hiddenKeyPoints}

## ユーザーの現状
${context.userPerformance}`
}
