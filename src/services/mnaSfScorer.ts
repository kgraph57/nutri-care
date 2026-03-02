import type {
  MnaSfData,
  MnaSfResult,
  MnaSfRiskLevel,
  MnaBmiOrCalf,
} from "../types/screening";

// ── 定数 ──

const NORMAL_MIN = 12;
const AT_RISK_MIN = 8;

// ── BMI スコア計算 ──

export function calculateBmiScore(bmi: number): MnaBmiOrCalf {
  if (bmi < 19) return 0;
  if (bmi < 21) return 1;
  if (bmi < 23) return 2;
  return 3;
}

// ── 下腿周囲長スコア計算 ──

export function calculateCalfScore(calfCircumference: number): MnaBmiOrCalf {
  if (calfCircumference < 31) return 0;
  return 3;
}

// ── リスクレベル判定 ──

function determineRiskLevel(totalScore: number): MnaSfRiskLevel {
  if (totalScore >= NORMAL_MIN) return "normal";
  if (totalScore >= AT_RISK_MIN) return "at-risk";
  return "malnourished";
}

// ── 推奨事項 ──

function buildRecommendations(riskLevel: MnaSfRiskLevel): readonly string[] {
  switch (riskLevel) {
    case "normal":
      return [
        "現在の栄養状態は良好です",
        "3ヶ月後に再スクリーニング推奨",
      ];
    case "at-risk":
      return [
        "詳細な栄養評価を推奨",
        "GLIM基準による低栄養診断を検討",
        "食事内容の見直しと栄養補助を検討",
        "1ヶ月後に再スクリーニング",
      ];
    case "malnourished":
      return [
        "直ちに栄養介入が必要",
        "GLIM基準による低栄養診断を実施",
        "NSTへの紹介を推奨",
        "栄養補助食品の導入を検討",
        "2週間後に再評価",
      ];
  }
}

// ── メイン関数 ──

export function scoreMnaSf(data: MnaSfData): MnaSfResult {
  const totalScore =
    data.foodIntakeDecline +
    data.weightLoss +
    data.mobility +
    data.psychologicalStress +
    data.neuropsychological +
    data.bmiOrCalf;

  const riskLevel = determineRiskLevel(totalScore);
  const recommendations = buildRecommendations(riskLevel);

  return {
    toolType: "mna-sf",
    data,
    totalScore,
    riskLevel,
    recommendations,
  };
}
