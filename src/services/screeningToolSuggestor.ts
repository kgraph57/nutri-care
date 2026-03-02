import type { Patient } from "../types";
import type {
  ScreeningToolType,
  ScreeningEntry,
} from "../types/screening";

export interface ToolSuggestion {
  readonly recommended: ScreeningToolType;
  readonly reason: string;
  readonly alternatives: readonly ScreeningToolType[];
}

const RESCREEN_INTERVAL_DAYS = 7;

export function suggestScreeningTool(
  patient: Patient,
  previousScreenings: readonly ScreeningEntry[],
): ToolSuggestion {
  const hasRiskResult = previousScreenings.some((s) => {
    if (s.result.toolType === "nrs2002") {
      return s.result.riskLevel !== "no-risk";
    }
    if (s.result.toolType === "mna-sf") {
      return s.result.riskLevel !== "normal";
    }
    return false;
  });

  if (hasRiskResult) {
    return {
      recommended: "glim",
      reason: "過去のスクリーニングで栄養リスクが検出されました。GLIM基準による低栄養診断を推奨します。",
      alternatives: [patient.age >= 65 ? "mna-sf" : "nrs2002"],
    };
  }

  if (patient.age >= 65) {
    return {
      recommended: "mna-sf",
      reason: `患者は${patient.age}歳です。高齢者にはMNA-SFが推奨されます。`,
      alternatives: ["nrs2002"],
    };
  }

  return {
    recommended: "nrs2002",
    reason: "入院患者の標準スクリーニングツールとしてNRS-2002を推奨します（ESPEN推奨）。",
    alternatives: ["mna-sf"],
  };
}

export function isScreeningDue(
  latestScreening: ScreeningEntry | undefined,
  today: string,
): boolean {
  if (!latestScreening) return true;

  const lastDate = new Date(latestScreening.date);
  const todayDate = new Date(today);
  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  return diffDays >= RESCREEN_INTERVAL_DAYS;
}

export function getScreeningStatusLabel(
  latestScreening: ScreeningEntry | undefined,
  today: string,
): string {
  if (!latestScreening) return "未実施";
  if (isScreeningDue(latestScreening, today)) return "再スクリーニング必要";

  const { result } = latestScreening;
  if (result.toolType === "nrs2002") {
    if (result.riskLevel === "high-risk") return "高リスク";
    if (result.riskLevel === "at-risk") return "リスクあり";
    return "リスクなし";
  }
  if (result.toolType === "mna-sf") {
    if (result.riskLevel === "malnourished") return "低栄養";
    if (result.riskLevel === "at-risk") return "リスクあり";
    return "良好";
  }
  if (result.toolType === "glim") {
    if (result.severity === "stage2") return "Stage 2";
    if (result.severity === "stage1") return "Stage 1";
    return "低栄養なし";
  }
  return "不明";
}
