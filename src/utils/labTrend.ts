import type { LabData } from "../types/labData";

type LabParamKey = keyof Omit<LabData, "patientId" | "date">;

/**
 * Determine trend direction from lab history for a given parameter.
 * Compares the two most recent values.
 * Returns null if fewer than 2 data points have a value for the parameter.
 */
export function getLabTrendArrow(
  paramKey: LabParamKey,
  history: readonly LabData[],
): "\u2191" | "\u2193" | "\u2192" | null {
  const values: number[] = [];
  for (const entry of history) {
    const v = entry[paramKey];
    if (v !== undefined && v !== null) {
      values.push(v);
      if (values.length === 2) break;
    }
  }
  if (values.length < 2) return null;

  const [latest, previous] = values;
  const diff = latest - previous;
  const threshold = Math.abs(previous) * 0.05;

  if (diff > threshold) return "\u2191";
  if (diff < -threshold) return "\u2193";
  return "\u2192";
}
