import type {
  Nrs2002InitialScreening,
  Nrs2002FinalScreening,
  Nrs2002Result,
  Nrs2002RiskLevel,
} from "../types/screening";

// ── ユーティリティ ──

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// ── 推奨事項 ──

function getRecommendations(riskLevel: Nrs2002RiskLevel): readonly string[] {
  switch (riskLevel) {
    case "high-risk":
      return [
        "直ちに栄養介入を開始",
        "NSTへの紹介推奨",
        "GLIM基準による低栄養診断を実施",
        "栄養ケアプラン作成",
        "1週間後に再評価",
      ];
    case "at-risk":
      return [
        "栄養ケアプラン作成を検討",
        "GLIM基準による低栄養診断を推奨",
        "1週間後に再スクリーニング",
        "食事摂取量モニタリング",
      ];
    case "no-risk":
      return [
        "1週間後に再スクリーニング",
        "入院中は毎週実施",
      ];
  }
}

// ── 初回スクリーニング評価 ──

export function evaluateInitialScreening(
  screening: Nrs2002InitialScreening,
): boolean {
  return (
    screening.bmiBelow205 ||
    screening.weightLoss3Months ||
    screening.reducedIntakeLastWeek ||
    screening.severelyCritical
  );
}

// ── リスクレベル判定 ──

function determineRiskLevel(totalScore: number): Nrs2002RiskLevel {
  if (totalScore >= 5) return "high-risk";
  if (totalScore >= 3) return "at-risk";
  return "no-risk";
}

// ── メインスコアリング関数 ──

export function scoreNrs2002(
  initialScreening: Nrs2002InitialScreening,
  finalScreening: Nrs2002FinalScreening | null,
  patientAge: number,
): Nrs2002Result {
  const initialPositive = evaluateInitialScreening(initialScreening);

  // 初回スクリーニングが全て陰性の場合
  if (!initialPositive) {
    return {
      toolType: "nrs2002",
      initialScreening,
      initialPositive: false,
      finalScreening: null,
      totalScore: 0,
      riskLevel: "no-risk",
      recommendations: getRecommendations("no-risk"),
    };
  }

  // 初回スクリーニング陽性だが最終スクリーニングが未実施の場合
  if (finalScreening === null) {
    return {
      toolType: "nrs2002",
      initialScreening,
      initialPositive: true,
      finalScreening: null,
      totalScore: 0,
      riskLevel: "no-risk",
      recommendations: getRecommendations("no-risk"),
    };
  }

  // 最終スクリーニングスコア計算
  const ageAdjustment = patientAge >= 70 ? 1 : 0;
  const rawScore =
    finalScreening.nutritionalStatus +
    finalScreening.diseaseSeverity +
    ageAdjustment;
  const totalScore = clamp(rawScore, 0, 7);
  const riskLevel = determineRiskLevel(totalScore);

  return {
    toolType: "nrs2002",
    initialScreening,
    initialPositive: true,
    finalScreening,
    totalScore,
    riskLevel,
    recommendations: getRecommendations(riskLevel),
  };
}
