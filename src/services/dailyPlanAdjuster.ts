import type {
  DailyAssessment,
  AdjustedPlan,
  AdjustedPlanItem,
  PlanAdjustment,
} from "../types/dailyRound";
import type { NutritionRequirements } from "../types";
import type { FeedingAdjustment } from "../types/toleranceData";
import {
  scoreAssessment,
  type AssessmentScoreResult,
} from "./dailyAssessmentScorer";

// ── ヘルパー ──

function scaleItems(
  items: readonly AdjustedPlanItem[],
  factor: number,
): AdjustedPlanItem[] {
  return items.map((item) => ({
    ...item,
    volume: Math.round(item.volume * factor),
  }));
}

function totalFromItems(items: readonly AdjustedPlanItem[]): {
  energy: number;
  protein: number;
  volume: number;
} {
  const volume = items.reduce((s, i) => s + i.volume * i.frequency, 0);
  return { energy: 0, protein: 0, volume };
}

// ── 投与量調整ロジック ──

function adjustVolumes(
  previousPlan: AdjustedPlan | null,
  score: AssessmentScoreResult,
  assessment: DailyAssessment,
  requirements: NutritionRequirements,
): {
  items: AdjustedPlanItem[];
  totalEnergy: number;
  totalProtein: number;
  totalVolume: number;
} {
  if (!previousPlan) {
    return {
      items: [],
      totalEnergy: assessment.actualIntake.estimatedEnergy,
      totalProtein: assessment.actualIntake.estimatedProtein,
      totalVolume:
        assessment.actualIntake.enteralVolume +
        assessment.actualIntake.parenteralVolume,
    };
  }

  const { feedingAdjustment } = score;
  let factor = 1.0;

  if (feedingAdjustment === "hold") {
    factor = 0;
  } else if (feedingAdjustment === "reduce") {
    factor = 0.75;
  } else if (feedingAdjustment === "advance") {
    const energyRatio =
      requirements.energy > 0
        ? assessment.actualIntake.estimatedEnergy / requirements.energy
        : 1;
    if (energyRatio < 0.8) {
      factor = Math.min(1.25, 1 + (1 - energyRatio) * 0.5);
    }
  }

  const adjustedItems = scaleItems(previousPlan.items, factor);

  // エネルギー・タンパク質を比例計算
  const totalEnergy = Math.round(previousPlan.totalEnergy * factor);
  const totalProtein = Math.round(previousPlan.totalProtein * factor);
  const totalVolume = Math.round(previousPlan.totalVolume * factor);

  // 目標を大幅に超えない (110%)
  const cappedEnergy = Math.min(
    totalEnergy,
    Math.round(requirements.energy * 1.1),
  );
  const cappedProtein = Math.min(
    totalProtein,
    Math.round(requirements.protein * 1.1),
  );

  return {
    items: adjustedItems,
    totalEnergy: cappedEnergy,
    totalProtein: cappedProtein,
    totalVolume,
  };
}

// ── overallRationale 生成 ──

function buildRationale(
  score: AssessmentScoreResult,
  feedingAdj: FeedingAdjustment,
): string {
  const parts: string[] = [];

  parts.push(`総合スコア: ${score.overall}/100 (リスク: ${score.riskLevel})`);
  parts.push(
    `GI: ${score.giScore} / バイタル: ${score.vitalScore} / 摂取量: ${score.intakeScore}`,
  );

  if (feedingAdj === "hold") {
    parts.push("消化管耐性不良のため投与中止を推奨。4-6時間後に再評価。");
  } else if (feedingAdj === "reduce") {
    parts.push(
      "消化管耐性やや不良のため投与量を75%に減量し、6-12時間後に再評価。",
    );
  } else if (feedingAdj === "advance") {
    parts.push("消化管耐性良好。段階的増量を推奨。");
  } else {
    parts.push("現行投与量を維持。");
  }

  return parts.join(" ");
}

// ── メイン関数 ──

export function generateAdjustedPlan(
  assessment: DailyAssessment,
  previousPlan: AdjustedPlan | null,
  requirements: NutritionRequirements,
): { plan: AdjustedPlan; score: AssessmentScoreResult } {
  const score = scoreAssessment(assessment, requirements);

  const { items, totalEnergy, totalProtein, totalVolume } = adjustVolumes(
    previousPlan,
    score,
    assessment,
    requirements,
  );

  const nutritionType = previousPlan?.nutritionType ?? "enteral";
  const rationale = buildRationale(score, score.feedingAdjustment);

  const plan: AdjustedPlan = {
    nutritionType,
    items,
    totalEnergy,
    totalProtein,
    totalVolume,
    requirements,
    feedingAdjustment: score.feedingAdjustment,
    adjustments: score.adjustments,
    overallRationale: rationale,
    warnings: score.warnings,
  };

  return { plan, score };
}
