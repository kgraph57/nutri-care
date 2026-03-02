// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 栄養スクリーニング・低栄養診断 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ScreeningToolType = "nrs2002" | "mna-sf" | "glim";

// ── NRS-2002 (Nutritional Risk Screening 2002) ──

export interface Nrs2002InitialScreening {
  readonly bmiBelow205: boolean;
  readonly weightLoss3Months: boolean;
  readonly reducedIntakeLastWeek: boolean;
  readonly severelyCritical: boolean;
}

export type Nrs2002NutritionalStatus = 0 | 1 | 2 | 3;
export type Nrs2002DiseaseSeverity = 0 | 1 | 2 | 3;

export interface Nrs2002FinalScreening {
  readonly nutritionalStatus: Nrs2002NutritionalStatus;
  readonly nutritionalStatusDetail: string;
  readonly diseaseSeverity: Nrs2002DiseaseSeverity;
  readonly diseaseSeverityDetail: string;
  readonly ageAdjustment: boolean;
}

export type Nrs2002RiskLevel = "no-risk" | "at-risk" | "high-risk";

export interface Nrs2002Result {
  readonly toolType: "nrs2002";
  readonly initialScreening: Nrs2002InitialScreening;
  readonly initialPositive: boolean;
  readonly finalScreening: Nrs2002FinalScreening | null;
  readonly totalScore: number;
  readonly riskLevel: Nrs2002RiskLevel;
  readonly recommendations: readonly string[];
}

// ── MNA-SF (Mini Nutritional Assessment - Short Form) ──

export type MnaFoodIntakeDecline = 0 | 1 | 2;
export type MnaWeightLoss = 0 | 1 | 2 | 3;
export type MnaMobility = 0 | 1 | 2;
export type MnaPsychologicalStress = 0 | 2;
export type MnaNeuropsychological = 0 | 1 | 2;
export type MnaBmiOrCalf = 0 | 1 | 2 | 3;

export interface MnaSfData {
  readonly foodIntakeDecline: MnaFoodIntakeDecline;
  readonly weightLoss: MnaWeightLoss;
  readonly mobility: MnaMobility;
  readonly psychologicalStress: MnaPsychologicalStress;
  readonly neuropsychological: MnaNeuropsychological;
  readonly bmiOrCalf: MnaBmiOrCalf;
  readonly usedCalfCircumference: boolean;
}

export type MnaSfRiskLevel = "normal" | "at-risk" | "malnourished";

export interface MnaSfResult {
  readonly toolType: "mna-sf";
  readonly data: MnaSfData;
  readonly totalScore: number;
  readonly riskLevel: MnaSfRiskLevel;
  readonly recommendations: readonly string[];
}

// ── GLIM Criteria ──

export type GlimWeightLossTimeframe = "6months" | "6monthsPlus" | "none";

export interface GlimPhenotypicCriteria {
  readonly unintentionalWeightLoss: boolean;
  readonly weightLossPercentage: number;
  readonly weightLossTimeframe: GlimWeightLossTimeframe;
  readonly lowBmi: boolean;
  readonly bmiValue: number;
  readonly reducedMuscleMass: boolean;
  readonly muscleMassMethod: string;
}

export interface GlimEtiologicCriteria {
  readonly reducedFoodIntake: boolean;
  readonly intakeReductionPercentage: number;
  readonly intakeReductionDuration: string;
  readonly malabsorption: boolean;
  readonly inflammation: boolean;
  readonly inflammationEvidence: string;
}

export type GlimSeverity = "none" | "stage1" | "stage2";

export interface GlimResult {
  readonly toolType: "glim";
  readonly phenotypic: GlimPhenotypicCriteria;
  readonly etiologic: GlimEtiologicCriteria;
  readonly phenotypicMet: boolean;
  readonly etiologicMet: boolean;
  readonly diagnosed: boolean;
  readonly severity: GlimSeverity;
  readonly recommendations: readonly string[];
}

// ── 統一スクリーニングエントリー ──

export interface ScreeningEntry {
  readonly id: string;
  readonly patientId: string;
  readonly date: string;
  readonly time: string;
  readonly result: Nrs2002Result | MnaSfResult | GlimResult;
  readonly notes: string;
  readonly createdAt: string;
}

// ── スクリーニングステータス（ダッシュボード用） ──

export type ScreeningStatus =
  | "not-screened"
  | "screening-due"
  | "normal"
  | "at-risk"
  | "malnourished";

// ── ラベルマップ ──

export const SCREENING_TOOL_LABELS: Readonly<
  Record<ScreeningToolType, string>
> = {
  nrs2002: "NRS-2002",
  "mna-sf": "MNA-SF",
  glim: "GLIM",
} as const;

export const NRS2002_RISK_LABELS: Readonly<
  Record<Nrs2002RiskLevel, string>
> = {
  "no-risk": "リスクなし",
  "at-risk": "栄養リスクあり",
  "high-risk": "高リスク",
} as const;

export const MNASF_RISK_LABELS: Readonly<Record<MnaSfRiskLevel, string>> = {
  normal: "栄養状態良好",
  "at-risk": "低栄養のおそれあり",
  malnourished: "低栄養",
} as const;

export const GLIM_SEVERITY_LABELS: Readonly<Record<GlimSeverity, string>> = {
  none: "低栄養なし",
  stage1: "Stage 1（中等度）",
  stage2: "Stage 2（重度）",
} as const;

export const NRS2002_NUTRITIONAL_STATUS_OPTIONS: readonly {
  readonly value: Nrs2002NutritionalStatus;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    value: 0,
    label: "正常",
    description: "栄養状態に問題なし",
  },
  {
    value: 1,
    label: "軽度",
    description:
      "3ヶ月間で5%以上の体重減少、または前週の食事摂取量が必要量の50-75%",
  },
  {
    value: 2,
    label: "中等度",
    description:
      "2ヶ月間で5%以上の体重減少、またはBMI 18.5-20.5+全身状態不良、または前週の食事摂取量が25-60%",
  },
  {
    value: 3,
    label: "重度",
    description:
      "1ヶ月間で5%以上の体重減少（3ヶ月で15%超）、またはBMI<18.5+全身状態不良、または前週の食事摂取量が0-25%",
  },
] as const;

export const NRS2002_DISEASE_SEVERITY_OPTIONS: readonly {
  readonly value: Nrs2002DiseaseSeverity;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    value: 0,
    label: "正常",
    description: "通常の栄養必要量",
  },
  {
    value: 1,
    label: "軽度",
    description:
      "大腿骨骨折、慢性疾患の急性増悪（肝硬変、COPD、血液透析、糖尿病、悪性腫瘍）",
  },
  {
    value: 2,
    label: "中等度",
    description: "大きな腹部手術、脳卒中、重症肺炎、血液悪性腫瘍",
  },
  {
    value: 3,
    label: "重度",
    description: "頭部外傷、骨髄移植、集中治療患者（APACHE>10）",
  },
] as const;
