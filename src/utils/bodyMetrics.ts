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

/* ---- Pediatric-specific utilities ---- */

/**
 * Pediatric BMI category based on CDC/WHO percentile-based classification.
 * For children, BMI must be interpreted relative to age/gender percentiles.
 */
export function pediatricBmiCategory(percentile: number): string {
  if (percentile < 3) return "低体重(3%tile未満)";
  if (percentile < 15) return "やせ傾向";
  if (percentile < 85) return "普通体重";
  if (percentile < 95) return "過体重";
  return "肥満";
}

/**
 * Compute corrected age in months for preterm infants.
 * Correction applies until 24 months of chronological age.
 */
export function computeCorrectedAgeMonths(
  chronologicalAgeMonths: number,
  gestationalAgeWeeks: number,
): number {
  if (chronologicalAgeMonths > 24) return chronologicalAgeMonths;
  const pretermWeeks = 40 - gestationalAgeWeeks;
  const correctionMonths = pretermWeeks / 4.33;
  return Math.max(
    0,
    Math.round((chronologicalAgeMonths - correctionMonths) * 10) / 10,
  );
}

/**
 * Calculate age in months from birth date.
 */
export function ageInMonthsFromBirthDate(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  return Math.max(0, months);
}

/**
 * Weight velocity in g/day (for monitoring infant growth).
 */
export function weightVelocity(
  weight1Kg: number,
  weight2Kg: number,
  daysBetween: number,
): number {
  if (daysBetween <= 0) return 0;
  return Math.round((((weight2Kg - weight1Kg) * 1000) / daysBetween) * 10) / 10;
}
