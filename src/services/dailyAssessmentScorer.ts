import type {
  DailyAssessment,
  AdjustedPlan,
  PlanAdjustment,
  AdjustmentType,
} from "../types/dailyRound";
import type { FeedingAdjustment } from "../types/toleranceData";
import type { NutritionRequirements } from "../types";

// ── スコアリング結果 ──

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface AssessmentScoreResult {
  readonly overall: number; // 0–100
  readonly giScore: number; // 0–100
  readonly vitalScore: number; // 0–100
  readonly intakeScore: number; // 0–100
  readonly riskLevel: RiskLevel;
  readonly warnings: readonly string[];
  readonly feedingAdjustment: FeedingAdjustment;
  readonly adjustments: readonly PlanAdjustment[];
}

// ── 定数 ──

const MAX = 100;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// ── GI スコア (0–100) ──

function scoreGI(gi: DailyAssessment["gi"]): {
  score: number;
  warnings: string[];
  adjustments: PlanAdjustment[];
} {
  const warnings: string[] = [];
  const adjustments: PlanAdjustment[] = [];
  let score = MAX;

  // 胃残留量
  if (gi.gastricResidual > 500) {
    score -= 40;
    warnings.push("胃残留量500mL超");
    adjustments.push({
      type: "hold",
      reason: "胃残留量500mL超のため投与中止を推奨",
      field: "gastricResidual",
      severity: "critical",
    });
  } else if (gi.gastricResidual > 300) {
    score -= 25;
    warnings.push("胃残留量300mL超");
    adjustments.push({
      type: "reduce",
      reason: "胃残留量300mL超のため減量を推奨",
      field: "gastricResidual",
      severity: "warning",
    });
  } else if (gi.gastricResidual > 200) {
    score -= 10;
  }

  // 嘔吐
  if (gi.vomiting === "severe") {
    score -= 30;
    warnings.push("重度の嘔吐");
    adjustments.push({
      type: "hold",
      reason: "重度嘔吐のため投与中止を推奨",
      field: "vomiting",
      severity: "critical",
    });
  } else if (gi.vomiting === "moderate") {
    score -= 15;
    adjustments.push({
      type: "reduce",
      reason: "中等度嘔吐のため減量を推奨",
      field: "vomiting",
      severity: "warning",
    });
  } else if (gi.vomiting === "mild") {
    score -= 5;
  }

  // 腹部膨満
  if (gi.abdominalDistension === "severe") {
    score -= 25;
    warnings.push("重度の腹部膨満");
  } else if (gi.abdominalDistension === "moderate") {
    score -= 10;
  }

  // 下痢
  if (gi.diarrhea === "severe") {
    score -= 20;
    warnings.push("重度の下痢");
    adjustments.push({
      type: "switch",
      reason: "重度下痢のため栄養剤変更を推奨(半消化態→消化態)",
      field: "diarrhea",
      severity: "warning",
    });
  } else if (gi.diarrhea === "moderate") {
    score -= 10;
  }

  // 腸蠕動音
  if (gi.bowelSounds === "absent") {
    score -= 20;
    warnings.push("腸蠕動音消失");
    adjustments.push({
      type: "hold",
      reason: "腸蠕動音消失のため経腸栄養中止を推奨",
      field: "bowelSounds",
      severity: "critical",
    });
  } else if (gi.bowelSounds === "reduced") {
    score -= 5;
  }

  // 水様便
  if (gi.stoolConsistency === "watery" && gi.stoolCount > 3) {
    score -= 15;
    warnings.push("水様性下痢(3回超)");
  }

  // 便秘
  if (gi.constipation) {
    score -= 5;
    warnings.push("便秘あり");
  }

  return { score: clamp(score, 0, MAX), warnings, adjustments };
}

// ── バイタルスコア (0–100) ──

function scoreVitals(
  assessment: DailyAssessment,
): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = MAX;
  const vs = assessment.vitals;

  // 体温
  if (vs.temperature > 39.0) {
    score -= 15;
    warnings.push(`高熱(${vs.temperature}°C)`);
  } else if (vs.temperature > 38.0) {
    score -= 5;
  } else if (vs.temperature < 35.0) {
    score -= 15;
    warnings.push(`低体温(${vs.temperature}°C)`);
  }

  // 心拍数
  if (vs.heartRate > 130 || vs.heartRate < 40) {
    score -= 15;
    warnings.push(`心拍数異常(${vs.heartRate}bpm)`);
  } else if (vs.heartRate > 110) {
    score -= 5;
  }

  // SpO2
  if (vs.spO2 < 90) {
    score -= 20;
    warnings.push(`SpO2低下(${vs.spO2}%)`);
  } else if (vs.spO2 < 94) {
    score -= 5;
  }

  // 意識レベル
  if (assessment.consciousness === "coma") {
    score -= 25;
    warnings.push("昏睡状態");
  } else if (assessment.consciousness === "stupor") {
    score -= 15;
    warnings.push("昏迷状態");
  } else if (assessment.consciousness === "drowsy") {
    score -= 5;
  }

  // 呼吸
  if (assessment.respiratoryStatus === "ventilator") {
    score -= 10;
  }

  // 浮腫
  if (assessment.edema === "severe") {
    score -= 10;
    warnings.push("重度浮腫");
  } else if (assessment.edema === "moderate") {
    score -= 5;
  }

  // 尿量 (乏尿: <0.5 mL/kg/hr → 24h で <12 mL/kg)
  if (assessment.bodyWeight > 0) {
    const urineRate = assessment.urineOutput / assessment.bodyWeight / 24;
    if (urineRate < 0.5) {
      score -= 15;
      warnings.push(
        `乏尿(${urineRate.toFixed(1)}mL/kg/hr)`,
      );
    }
  }

  return { score: clamp(score, 0, MAX), warnings };
}

// ── 摂取量スコア (0–100) ──

function scoreIntake(
  intake: DailyAssessment["actualIntake"],
  requirements: NutritionRequirements | null,
): { score: number; warnings: string[]; adjustments: PlanAdjustment[] } {
  const warnings: string[] = [];
  const adjustments: PlanAdjustment[] = [];
  let score = MAX;

  if (!requirements) {
    return { score, warnings, adjustments };
  }

  const energyRatio =
    requirements.energy > 0 ? intake.estimatedEnergy / requirements.energy : 1;
  const proteinRatio =
    requirements.protein > 0
      ? intake.estimatedProtein / requirements.protein
      : 1;

  if (energyRatio < 0.5) {
    score -= 40;
    warnings.push(`エネルギー充足率${Math.round(energyRatio * 100)}%`);
    adjustments.push({
      type: "advance",
      reason: `エネルギー充足率${Math.round(energyRatio * 100)}% — 増量推奨`,
      field: "energy",
      severity: "warning",
    });
  } else if (energyRatio < 0.8) {
    score -= 20;
    warnings.push(`エネルギー充足率${Math.round(energyRatio * 100)}%`);
    adjustments.push({
      type: "advance",
      reason: `エネルギー充足率${Math.round(energyRatio * 100)}% — 段階的増量推奨`,
      field: "energy",
      severity: "info",
    });
  } else if (energyRatio > 1.2) {
    score -= 15;
    warnings.push("エネルギー過剰投与(120%超)");
    adjustments.push({
      type: "reduce",
      reason: "エネルギー過剰投与 — 減量推奨",
      field: "energy",
      severity: "warning",
    });
  }

  if (proteinRatio < 0.5) {
    score -= 30;
    warnings.push(`タンパク質充足率${Math.round(proteinRatio * 100)}%`);
  } else if (proteinRatio < 0.8) {
    score -= 15;
    warnings.push(`タンパク質充足率${Math.round(proteinRatio * 100)}%`);
  }

  return { score: clamp(score, 0, MAX), warnings, adjustments };
}

// ── リスクレベル判定 ──

function determineRiskLevel(overall: number): RiskLevel {
  if (overall >= 80) return "low";
  if (overall >= 60) return "moderate";
  if (overall >= 40) return "high";
  return "critical";
}

// ── FeedingAdjustment 判定 ──

function determineFeedingAdjustment(giScore: number): FeedingAdjustment {
  if (giScore >= 80) return "advance";
  if (giScore >= 50) return "maintain";
  if (giScore >= 30) return "reduce";
  return "hold";
}

// ── メイン関数 ──

export function scoreAssessment(
  assessment: DailyAssessment,
  requirements: NutritionRequirements | null,
): AssessmentScoreResult {
  const giResult = scoreGI(assessment.gi);
  const vitalResult = scoreVitals(assessment);
  const intakeResult = scoreIntake(assessment.actualIntake, requirements);

  const allWarnings = [
    ...giResult.warnings,
    ...vitalResult.warnings,
    ...intakeResult.warnings,
  ];

  const allAdjustments = [...giResult.adjustments, ...intakeResult.adjustments];

  // 重み: GI 40% + バイタル 30% + 摂取量 30%
  const overall = Math.round(
    giResult.score * 0.4 + vitalResult.score * 0.3 + intakeResult.score * 0.3,
  );

  return {
    overall,
    giScore: giResult.score,
    vitalScore: vitalResult.score,
    intakeScore: intakeResult.score,
    riskLevel: determineRiskLevel(overall),
    warnings: allWarnings,
    feedingAdjustment: determineFeedingAdjustment(giResult.score),
    adjustments: allAdjustments,
  };
}
