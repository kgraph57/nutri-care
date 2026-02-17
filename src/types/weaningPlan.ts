export type WeaningPhase =
  | 'assessment' | 'trophic' | 'advancing' | 'full-enteral'
  | 'oral-introduction' | 'oral-transition' | 'full-oral' | 'completed'

export interface WeaningMilestone {
  readonly id: string
  readonly phase: WeaningPhase
  readonly description: string
  readonly targetDate: string
  readonly completedDate?: string
  readonly criteria: readonly string[]
  readonly met: boolean
}

export interface WeaningPhaseConfig {
  readonly phase: WeaningPhase
  readonly label: string
  readonly enteralPercent: number
  readonly oralPercent: number
  readonly parenteralPercent: number
  readonly durationDays: number
  readonly advanceCriteria: readonly string[]
  readonly holdCriteria: readonly string[]
}

export interface WeaningPlan {
  readonly id: string
  readonly patientId: string
  readonly createdDate: string
  readonly targetCompletionDate: string
  readonly currentPhase: WeaningPhase
  readonly phases: readonly WeaningPhaseConfig[]
  readonly milestones: readonly WeaningMilestone[]
  readonly notes: string
  readonly isActive: boolean
}

export interface WeaningProgress {
  readonly plan: WeaningPlan
  readonly completedPhases: number
  readonly totalPhases: number
  readonly daysElapsed: number
  readonly daysRemaining: number
  readonly onTrack: boolean
  readonly nextMilestone: WeaningMilestone | null
}

export const WEANING_PHASE_LABELS: Record<WeaningPhase, string> = {
  'assessment': '評価段階',
  'trophic': '少量経腸栄養(トロフィック)',
  'advancing': '増量段階',
  'full-enteral': '全量経腸栄養',
  'oral-introduction': '経口摂取導入',
  'oral-transition': '経口移行段階',
  'full-oral': '完全経口摂取',
  'completed': '離脱完了',
} as const
