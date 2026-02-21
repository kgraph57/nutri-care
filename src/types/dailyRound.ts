import type { NutritionType, NutritionRequirements } from './index';
import type { FeedingAdjustment } from './toleranceData';

export type SymptomSeverity = 'none' | 'mild' | 'moderate' | 'severe';
export type ConsciousnessLevel = 'alert' | 'drowsy' | 'stupor' | 'coma';
export type RespiratoryStatus = 'room-air' | 'nasal' | 'mask' | 'ventilator';

export interface VitalSigns {
  readonly temperature: number;
  readonly heartRate: number;
  readonly systolicBP: number;
  readonly diastolicBP: number;
  readonly respiratoryRate: number;
  readonly spO2: number;
}

export interface GIAssessment {
  readonly gastricResidual: number;
  readonly gastricResidualAction: 'continue' | 'reduce' | 'hold' | 'none';
  readonly vomiting: SymptomSeverity;
  readonly vomitingEpisodes: number;
  readonly diarrhea: SymptomSeverity;
  readonly abdominalDistension: SymptomSeverity;
  readonly bowelSounds: 'present' | 'reduced' | 'absent';
  readonly stoolCount: number;
  readonly stoolConsistency: 'hard' | 'formed' | 'soft' | 'loose' | 'watery' | 'none';
  readonly constipation: boolean;
}

export interface ActualIntake {
  readonly enteralVolume: number;
  readonly parenteralVolume: number;
  readonly oralVolume: number;
  readonly ivFluidVolume: number;
  readonly estimatedEnergy: number;
  readonly estimatedProtein: number;
}

export interface DailyAssessment {
  readonly id: string;
  readonly patientId: string;
  readonly date: string;
  readonly time: string;
  readonly vitals: VitalSigns;
  readonly consciousness: ConsciousnessLevel;
  readonly respiratoryStatus: RespiratoryStatus;
  readonly gi: GIAssessment;
  readonly actualIntake: ActualIntake;
  readonly bodyWeight: number;
  readonly urineOutput: number;
  readonly edema: SymptomSeverity;
  readonly clinicalNotes: string;
}

export interface AdjustedPlanItem {
  readonly productName: string;
  readonly productKey: string;
  readonly volume: number;
  readonly frequency: number;
  readonly rationale: string;
}

export type AdjustmentType = 'advance' | 'maintain' | 'reduce' | 'hold' | 'switch';

export interface PlanAdjustment {
  readonly type: AdjustmentType;
  readonly reason: string;
  readonly field: string;
  readonly severity: 'info' | 'warning' | 'critical';
}

export interface AdjustedPlan {
  readonly nutritionType: NutritionType;
  readonly items: readonly AdjustedPlanItem[];
  readonly totalEnergy: number;
  readonly totalProtein: number;
  readonly totalVolume: number;
  readonly requirements: NutritionRequirements;
  readonly feedingAdjustment: FeedingAdjustment;
  readonly adjustments: readonly PlanAdjustment[];
  readonly overallRationale: string;
  readonly warnings: readonly string[];
}

export interface DailyRoundEntry {
  readonly id: string;
  readonly patientId: string;
  readonly date: string;
  readonly assessment: DailyAssessment;
  readonly previousPlan: AdjustedPlan | null;
  readonly adjustedPlan: AdjustedPlan;
  readonly manualOverrides: readonly PlanAdjustment[];
  readonly approvedBy: string;
  readonly createdAt: string;
}

export const SYMPTOM_SEVERITY_LABELS: Readonly<Record<SymptomSeverity, string>> = {
  none: 'なし', mild: '軽度', moderate: '中等度', severe: '重度',
} as const;

export const CONSCIOUSNESS_LABELS: Readonly<Record<ConsciousnessLevel, string>> = {
  alert: '清明', drowsy: '傾眠', stupor: '昏迷', coma: '昏睡',
} as const;

export const RESPIRATORY_LABELS: Readonly<Record<RespiratoryStatus, string>> = {
  'room-air': '室内気', nasal: '経鼻カニューレ', mask: 'マスク', ventilator: '人工呼吸器',
} as const;

export const ADJUSTMENT_TYPE_LABELS: Readonly<Record<AdjustmentType, string>> = {
  advance: '増量', maintain: '維持', reduce: '減量', hold: '中止', switch: '変更',
} as const;

export const BOWEL_SOUNDS_LABELS: Readonly<Record<GIAssessment['bowelSounds'], string>> = {
  present: '聴取可', reduced: '減弱', absent: '消失',
} as const;

export const GI_RESIDUAL_ACTION_LABELS: Readonly<Record<GIAssessment['gastricResidualAction'], string>> = {
  continue: '継続', reduce: '減量', hold: '中止', none: '該当なし',
} as const;
