import type { NutritionRequirements } from '../types';

export interface NutrientDetail {
  readonly nutrient: string;
  readonly label: string;
  readonly current: number;
  readonly target: number;
  readonly percentage: number;
  readonly status: 'deficient' | 'low' | 'adequate' | 'excess';
}

export interface AdequacyBreakdown {
  readonly overall: number;
  readonly macroScore: number;
  readonly electrolyteScore: number;
  readonly traceElementScore: number;
  readonly details: readonly NutrientDetail[];
}

function nutrientScore(current: number, target: number): number {
  if (target <= 0) return 100;
  const pct = (current / target) * 100;
  if (pct >= 90 && pct <= 110) return 100;
  if (pct < 90) return Math.max(0, Math.round((pct / 90) * 100));
  // excess: penalize proportionally above 110%
  return Math.max(0, Math.round(100 - ((pct - 110) / 90) * 100));
}

function nutrientStatus(pct: number): NutrientDetail['status'] {
  if (pct < 50) return 'deficient';
  if (pct < 80) return 'low';
  if (pct <= 120) return 'adequate';
  return 'excess';
}

function averageScores(scores: readonly number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

const MACRO_KEYS = [
  { nutrient: 'energy', label: 'エネルギー', weight: 0.4 },
  { nutrient: 'protein', label: 'タンパク質', weight: 0.3 },
  { nutrient: 'fat', label: '脂質', weight: 0.15 },
  { nutrient: 'carbs', label: '炭水化物', weight: 0.15 },
] as const;

const ELECTROLYTE_KEYS = [
  { nutrient: 'sodium', label: 'Na' },
  { nutrient: 'potassium', label: 'K' },
  { nutrient: 'calcium', label: 'Ca' },
  { nutrient: 'magnesium', label: 'Mg' },
  { nutrient: 'phosphorus', label: 'P' },
  { nutrient: 'chloride', label: 'Cl' },
] as const;

const TRACE_KEYS = [
  { nutrient: 'iron', label: 'Fe' },
  { nutrient: 'zinc', label: 'Zn' },
  { nutrient: 'copper', label: 'Cu' },
  { nutrient: 'manganese', label: 'Mn' },
  { nutrient: 'iodine', label: 'I' },
  { nutrient: 'selenium', label: 'Se' },
] as const;

export function calculateAdequacyScore(
  requirements: NutritionRequirements,
  currentIntake: Record<string, number>,
): AdequacyBreakdown {
  const details: NutrientDetail[] = [];

  // Macro scores (weighted)
  let macroWeightedSum = 0;
  for (const m of MACRO_KEYS) {
    const current = currentIntake[m.nutrient] ?? 0;
    const target = requirements[m.nutrient as keyof NutritionRequirements];
    const pct = target > 0 ? (current / target) * 100 : 0;
    const score = nutrientScore(current, target);
    macroWeightedSum += score * m.weight;
    details.push({
      nutrient: m.nutrient,
      label: m.label,
      current: Math.round(current * 10) / 10,
      target,
      percentage: Math.round(pct),
      status: nutrientStatus(pct),
    });
  }
  const macroScore = Math.round(macroWeightedSum);

  // Electrolyte scores (simple average)
  const electrolyteScores: number[] = [];
  for (const e of ELECTROLYTE_KEYS) {
    const current = currentIntake[e.nutrient] ?? 0;
    const target = requirements[e.nutrient as keyof NutritionRequirements];
    const pct = target > 0 ? (current / target) * 100 : 0;
    const score = nutrientScore(current, target);
    electrolyteScores.push(score);
    details.push({
      nutrient: e.nutrient,
      label: e.label,
      current: Math.round(current * 10) / 10,
      target,
      percentage: Math.round(pct),
      status: nutrientStatus(pct),
    });
  }
  const electrolyteScore = averageScores(electrolyteScores);

  // Trace element scores (simple average)
  const traceScores: number[] = [];
  for (const t of TRACE_KEYS) {
    const current = currentIntake[t.nutrient] ?? 0;
    const target = requirements[t.nutrient as keyof NutritionRequirements];
    const pct = target > 0 ? (current / target) * 100 : 0;
    const score = nutrientScore(current, target);
    traceScores.push(score);
    details.push({
      nutrient: t.nutrient,
      label: t.label,
      current: Math.round(current * 100) / 100,
      target,
      percentage: Math.round(pct),
      status: nutrientStatus(pct),
    });
  }
  const traceElementScore = averageScores(traceScores);

  // Overall: macro 50% + electrolyte 30% + trace 20%
  const overall = Math.round(
    macroScore * 0.5 + electrolyteScore * 0.3 + traceElementScore * 0.2,
  );

  return { overall, macroScore, electrolyteScore, traceElementScore, details };
}
