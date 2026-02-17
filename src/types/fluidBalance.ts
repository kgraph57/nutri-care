// 水分出納（IN/OUTバランス）の型定義

export interface FluidInput {
  readonly ivFluids: number;           // 輸液 mL
  readonly enteralNutrition: number;   // 経腸栄養 mL
  readonly oralIntake: number;         // 経口摂取 mL
  readonly ivMedications: number;      // 注射薬剤水分 mL
  readonly other: number;              // その他 mL
}

export interface FluidOutput {
  readonly urine: number;       // 尿量 mL
  readonly stool: number;       // 便 mL
  readonly drains: number;      // ドレーン排液 mL
  readonly vomitOrNG: number;   // 嘔吐/NGチューブ mL
  readonly other: number;       // その他 mL
}

export interface FluidBalanceEntry {
  readonly patientId: string;
  readonly date: string;         // ISO date string (YYYY-MM-DD)
  readonly input: FluidInput;
  readonly output: FluidOutput;
}

/** Sum all fluid input fields (mL). */
export function computeTotalInput(input: FluidInput): number {
  return (
    input.ivFluids +
    input.enteralNutrition +
    input.oralIntake +
    input.ivMedications +
    input.other
  );
}

/** Sum all fluid output fields (mL). */
export function computeTotalOutput(output: FluidOutput): number {
  return (
    output.urine +
    output.stool +
    output.drains +
    output.vomitOrNG +
    output.other
  );
}

/** Compute net fluid balance: totalInput - totalOutput (mL). */
export function computeNetBalance(entry: FluidBalanceEntry): number {
  return computeTotalInput(entry.input) - computeTotalOutput(entry.output);
}

/** Compute urine rate in mL/kg/hr. Defaults to 24-hour period. */
export function computeUrineRate(
  urine: number,
  weightKg: number,
  hours: number = 24,
): number {
  if (weightKg <= 0 || hours <= 0) return 0;
  return urine / weightKg / hours;
}
