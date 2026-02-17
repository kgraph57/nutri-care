// 栄養耐性（フィーディングトレランス）の型定義

export type StoolConsistency = 'hard' | 'formed' | 'soft' | 'loose' | 'watery' | 'none';
export type AbdominalDistension = 'none' | 'mild' | 'moderate' | 'severe';
export type VomitingSeverity = 'none' | 'mild' | 'moderate' | 'severe';
export type FeedingAdjustment = 'advance' | 'maintain' | 'reduce' | 'hold';

export interface ToleranceEntry {
  readonly id: string;
  readonly patientId: string;
  readonly date: string;                    // ISO date (YYYY-MM-DD)
  readonly time: string;                    // HH:mm
  readonly gastricResidual: number;         // mL
  readonly gastricResidualAction: 'continue' | 'reduce' | 'hold' | 'none';
  readonly vomiting: VomitingSeverity;
  readonly vomitingEpisodes: number;
  readonly abdominalDistension: AbdominalDistension;
  readonly bowelSounds: 'present' | 'reduced' | 'absent';
  readonly stoolCount: number;
  readonly stoolConsistency: StoolConsistency;
  readonly toleranceScore: number;          // 0–10
  readonly feedingAdjustment: FeedingAdjustment;
  readonly notes: string;
}

export interface ToleranceTrend {
  readonly entries: readonly ToleranceEntry[];
  readonly averageScore: number;
  readonly trend: 'improving' | 'stable' | 'worsening';
  readonly consecutiveGoodDays: number;     // score >= 7
  readonly readyToAdvance: boolean;
}

// ラベルマップ（日本語）

export const STOOL_CONSISTENCY_LABELS: Readonly<Record<StoolConsistency, string>> = {
  hard: '硬便',
  formed: '有形便',
  soft: '軟便',
  loose: '泥状便',
  watery: '水様便',
  none: 'なし',
} as const;

export const ABDOMINAL_DISTENSION_LABELS: Readonly<Record<AbdominalDistension, string>> = {
  none: 'なし',
  mild: '軽度',
  moderate: '中等度',
  severe: '重度',
} as const;

export const VOMITING_SEVERITY_LABELS: Readonly<Record<VomitingSeverity, string>> = {
  none: 'なし',
  mild: '軽度',
  moderate: '中等度',
  severe: '重度',
} as const;

export const FEEDING_ADJUSTMENT_LABELS: Readonly<Record<FeedingAdjustment, string>> = {
  advance: '増量',
  maintain: '維持',
  reduce: '減量',
  hold: '中止',
} as const;
