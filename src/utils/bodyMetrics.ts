/**
 * Body metric calculations for clinical use.
 * All functions are pure with no side effects.
 */

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi <= 0) return "";
  if (bmi < 18.5) return "低体重";
  if (bmi < 25) return "普通体重";
  if (bmi < 30) return "肥満(1度)";
  return "肥満(2度以上)";
}

export function calculateBSA(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  // Du Bois formula
  return (
    Math.round(
      0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725) * 100,
    ) / 100
  );
}

export function calculateIBW(heightCm: number, gender: string): number {
  if (heightCm <= 0) return 0;
  // Devine formula
  const base = gender === "女性" || gender === "female" ? 45.5 : 50;
  const result = base + 0.91 * (heightCm - 152.4);
  return Math.round(result * 10) / 10;
}
