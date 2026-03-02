import type { ConditionCategory } from "../services/diagnosisClassifier";
import type { Nrs2002DiseaseSeverity } from "../types/screening";

export const CONDITION_TO_NRS2002_SEVERITY: Readonly<
  Record<ConditionCategory, Nrs2002DiseaseSeverity>
> = {
  standard: 0,
  renal: 1,
  renal_dialysis: 1,
  hepatic: 1,
  diabetes: 1,
  respiratory: 2,
  burn: 3,
  refeeding_risk: 2,
  cardiac: 1,
  postoperative: 2,
  pediatric_standard: 0,
  pediatric_nicu: 3,
} as const;

export function suggestDiseaseSeverity(
  conditionCategory: ConditionCategory,
): Nrs2002DiseaseSeverity {
  return CONDITION_TO_NRS2002_SEVERITY[conditionCategory];
}
