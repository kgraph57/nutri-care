import type {
  GlimPhenotypicCriteria,
  GlimEtiologicCriteria,
  GlimSeverity,
  GlimResult,
} from "../types/screening";

// ── 表現型基準の評価 ──

export function hasPhenotypicCriteria(
  criteria: GlimPhenotypicCriteria,
): boolean {
  return (
    criteria.unintentionalWeightLoss ||
    criteria.lowBmi ||
    criteria.reducedMuscleMass
  );
}

// ── 病因型基準の評価 ──

export function hasEtiologicCriteria(
  criteria: GlimEtiologicCriteria,
): boolean {
  return (
    criteria.reducedFoodIntake ||
    criteria.malabsorption ||
    criteria.inflammation
  );
}

// ── 体重減少による重症度判定 ──

function severityFromWeightLoss(
  percentage: number,
  timeframe: GlimPhenotypicCriteria["weightLossTimeframe"],
): GlimSeverity {
  if (timeframe === "none" || percentage <= 0) {
    return "none";
  }

  if (timeframe === "6months") {
    if (percentage > 10) return "stage2";
    if (percentage >= 5) return "stage1";
    return "none";
  }

  // 6monthsPlus
  if (percentage > 20) return "stage2";
  if (percentage >= 10) return "stage1";
  return "none";
}

// ── BMI によるアジア基準の重症度判定 ──

function severityFromBmi(bmi: number, age: number): GlimSeverity {
  if (age >= 70) {
    if (bmi < 20.0) return "stage2";
    if (bmi < 22.0) return "stage1";
    return "none";
  }

  // age < 70
  if (bmi < 18.5) return "stage2";
  if (bmi < 20.0) return "stage1";
  return "none";
}

// ── 重症度の比較 ──

function maxSeverity(a: GlimSeverity, b: GlimSeverity): GlimSeverity {
  const order: Record<GlimSeverity, number> = {
    none: 0,
    stage1: 1,
    stage2: 2,
  };
  return order[a] >= order[b] ? a : b;
}

// ── 総合的な重症度判定 ──

export function determineSeverity(
  phenotypic: GlimPhenotypicCriteria,
  patientAge: number,
): GlimSeverity {
  let severity: GlimSeverity = "none";

  if (phenotypic.unintentionalWeightLoss) {
    severity = maxSeverity(
      severity,
      severityFromWeightLoss(
        phenotypic.weightLossPercentage,
        phenotypic.weightLossTimeframe,
      ),
    );
  }

  if (phenotypic.lowBmi) {
    severity = maxSeverity(
      severity,
      severityFromBmi(phenotypic.bmiValue, patientAge),
    );
  }

  // 筋肉量低下のみの場合は stage1 とする
  if (phenotypic.reducedMuscleMass && severity === "none") {
    severity = "stage1";
  }

  return severity;
}

// ── 推奨事項 ──

function getRecommendations(
  diagnosed: boolean,
  severity: GlimSeverity,
): readonly string[] {
  if (!diagnosed) {
    return [
      "現時点では低栄養の診断基準を満たしません",
      "定期的なスクリーニングを継続してください",
    ];
  }

  if (severity === "stage2") {
    return [
      "直ちに積極的栄養介入が必要",
      "経腸栄養または静脈栄養を検討",
      "NSTによる集中的栄養管理",
      "原因疾患の治療と並行した栄養改善",
      "1週間ごとの再評価",
    ];
  }

  // stage1
  return [
    "栄養介入の開始を推奨",
    "経口栄養補助(ONS)の導入を検討",
    "食事摂取量と体重の定期的モニタリング",
    "2週間後に再評価",
  ];
}

// ── メイン診断関数 ──

export function diagnoseGlim(
  phenotypic: GlimPhenotypicCriteria,
  etiologic: GlimEtiologicCriteria,
  patientAge: number,
): GlimResult {
  const phenotypicMet = hasPhenotypicCriteria(phenotypic);
  const etiologicMet = hasEtiologicCriteria(etiologic);
  const diagnosed = phenotypicMet && etiologicMet;
  const severity = diagnosed
    ? determineSeverity(phenotypic, patientAge)
    : "none";

  return {
    toolType: "glim",
    phenotypic,
    etiologic,
    phenotypicMet,
    etiologicMet,
    diagnosed,
    severity,
    recommendations: getRecommendations(diagnosed, severity),
  };
}
