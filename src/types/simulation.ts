import type { Patient, NutritionType, NutritionRequirements } from './index'
import type { LabData } from './labData'
import type { NutritionMenuData } from '../hooks/useNutritionMenus'

// ── 難易度 ──

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

// ── ヒント ──

export interface SimulationHint {
  readonly trigger: 'time' | 'score' | 'request'
  readonly threshold?: number
  readonly content: string
}

// ── 模範解答の製品 ──

export interface IdealMenuItem {
  readonly productKeywords: readonly string[]
  readonly category: string
  readonly volumeRange: readonly [number, number]
  readonly required: boolean
}

// ── 模範解答 ──

export interface IdealAnswer {
  readonly nutritionType: NutritionType
  readonly menuItems: readonly IdealMenuItem[]
  readonly requirements: NutritionRequirements
  readonly keyPoints: readonly string[]
  readonly rationale: string
  readonly commonMistakes: readonly string[]
  readonly references: readonly string[]
}

// ── 症例ケース ──

export interface SimulationCase {
  readonly id: string
  readonly title: string
  readonly difficulty: Difficulty
  readonly category: string
  readonly patient: Patient
  readonly labData: LabData
  readonly clinicalContext: string
  readonly objectives: readonly string[]
  readonly timeLimit?: number
  readonly hints: readonly SimulationHint[]
  readonly idealAnswer: IdealAnswer
}

// ── 採点結果 ──

export interface SimulationScore {
  readonly overall: number
  readonly macroScore: number
  readonly constraintScore: number
  readonly safetyScore: number
  readonly efficiencyScore: number
}

// ── フィードバック ──

export type FeedbackType = 'correct' | 'warning' | 'error' | 'tip'

export interface FeedbackItem {
  readonly type: FeedbackType
  readonly category: string
  readonly message: string
  readonly detail?: string
}

// ── シミュレーション結果 ──

export interface SimulationResult {
  readonly caseId: string
  readonly score: SimulationScore
  readonly userMenu: NutritionMenuData
  readonly feedback: readonly FeedbackItem[]
  readonly completedAt: string
  readonly timeSpent: number
}

// ── 進捗管理 ──

export interface SimulationProgress {
  readonly completedCases: Readonly<Record<string, SimulationResult>>
  readonly bestScores: Readonly<Record<string, number>>
  readonly totalAttempts: number
  readonly averageScore: number
  readonly weakCategories: readonly string[]
}
