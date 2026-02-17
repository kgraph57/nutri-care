import type { FluidBalanceEntry, FluidInput, FluidOutput } from "../../types/fluidBalance";
import {
  computeTotalInput,
  computeTotalOutput,
  computeNetBalance,
} from "../../types/fluidBalance";

/* ---- Constants ---- */

export const MAX_CHART_DAYS = 7;
export const COLOR_BLUE = "var(--color-primary-500, #3b82f6)";
export const COLOR_RED = "var(--color-danger, #ef4444)";
export const COLOR_GREEN = "var(--color-success, #22c55e)";

export const INPUT_LABELS: readonly (readonly [keyof FluidInput, string])[] = [
  ["ivFluids", "輸液"],
  ["enteralNutrition", "経腸栄養"],
  ["oralIntake", "経口摂取"],
  ["ivMedications", "注射薬剤"],
  ["other", "その他"],
] as const;

export const OUTPUT_LABELS: readonly (readonly [keyof FluidOutput, string])[] = [
  ["urine", "尿量"],
  ["stool", "便"],
  ["drains", "ドレーン"],
  ["vomitOrNG", "嘔吐/NG"],
  ["other", "その他"],
] as const;

/* ---- Chart data type ---- */

export interface ChartDayData {
  readonly dateLabel: string;
  readonly totalIn: number;
  readonly totalOutNeg: number;
  readonly net: number;
}

/* ---- Pure helpers ---- */

export function formatDateLabel(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export function getNetBalanceColor(net: number): string {
  return net >= 0 ? COLOR_GREEN : COLOR_RED;
}

export function getUrineRateStatus(
  rate: number
): "success" | "warning" | "danger" {
  if (rate >= 0.5 && rate <= 1.0) return "success";
  if ((rate >= 0.3 && rate < 0.5) || (rate > 1.0 && rate <= 2.0))
    return "warning";
  return "danger";
}

export function computeChartData(
  history: readonly FluidBalanceEntry[]
): readonly ChartDayData[] {
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return sorted.slice(-MAX_CHART_DAYS).map((entry) => ({
    dateLabel: formatDateLabel(entry.date),
    totalIn: computeTotalInput(entry.input),
    totalOutNeg: -computeTotalOutput(entry.output),
    net: computeNetBalance(entry),
  }));
}

export function computeCumulativeBalance(
  history: readonly FluidBalanceEntry[]
): number {
  return history.reduce((acc, entry) => acc + computeNetBalance(entry), 0);
}

export function computeBarMax(
  input: FluidInput,
  output: FluidOutput
): number {
  return Math.max(computeTotalInput(input), computeTotalOutput(output), 1);
}

export function computeChartDomainMax(
  chartData: readonly ChartDayData[]
): number {
  if (chartData.length === 0) return 1000;
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.totalIn, Math.abs(d.totalOutNeg)))
  );
  return Math.ceil((maxVal * 1.15) / 100) * 100;
}

export function getLatestEntry(
  history: readonly FluidBalanceEntry[]
): FluidBalanceEntry | null {
  if (history.length === 0) return null;
  return [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}
