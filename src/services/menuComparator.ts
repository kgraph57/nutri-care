import type { NutritionMenuData } from "../hooks/useNutritionMenus";

export interface NutrientComparison {
  readonly nutrient: string;
  readonly label: string;
  readonly unit: string;
  readonly values: readonly number[];
  readonly best: number; // index of best value
}

export interface MenuComparisonResult {
  readonly menus: readonly NutritionMenuData[];
  readonly nutrients: readonly NutrientComparison[];
  readonly totalEnergies: readonly number[];
  readonly totalVolumes: readonly number[];
  readonly itemCounts: readonly number[];
}

const NUTRIENT_DEFS = [
  { key: "energy", label: "エネルギー", unit: "kcal" },
  { key: "protein", label: "タンパク質", unit: "g" },
  { key: "fat", label: "脂質", unit: "g" },
  { key: "carbs", label: "炭水化物", unit: "g" },
  { key: "sodium", label: "Na", unit: "mEq" },
  { key: "potassium", label: "K", unit: "mEq" },
  { key: "calcium", label: "Ca", unit: "mEq" },
  { key: "magnesium", label: "Mg", unit: "mEq" },
  { key: "phosphorus", label: "P", unit: "mEq" },
  { key: "chloride", label: "Cl", unit: "mEq" },
  { key: "iron", label: "Fe", unit: "mg" },
  { key: "zinc", label: "Zn", unit: "mg" },
] as const;

function findBestIndex(values: readonly number[], target?: number): number {
  if (values.length === 0) return 0;
  if (target !== undefined) {
    let bestIdx = 0;
    let bestDiff = Math.abs(values[0] - target);
    for (let i = 1; i < values.length; i++) {
      const diff = Math.abs(values[i] - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    }
    return bestIdx;
  }
  return values.indexOf(Math.max(...values));
}

export function compareMenus(
  menus: readonly NutritionMenuData[],
): MenuComparisonResult {
  const nutrients: NutrientComparison[] = NUTRIENT_DEFS.map((def) => {
    const values = menus.map((menu) => {
      const val = menu.currentIntake?.[def.key] ?? 0;
      return Math.round(val * 100) / 100;
    });

    const targets = menus
      .map((m) =>
        m.requirements
          ? (m.requirements as Record<string, number>)[def.key]
          : undefined,
      )
      .filter((t): t is number => t !== undefined);
    const avgTarget = targets.length > 0
      ? targets.reduce((a, b) => a + b, 0) / targets.length
      : undefined;

    return {
      nutrient: def.key,
      label: def.label,
      unit: def.unit,
      values,
      best: findBestIndex(values, avgTarget),
    };
  });

  return {
    menus,
    nutrients,
    totalEnergies: menus.map((m) => Math.round(m.totalEnergy)),
    totalVolumes: menus.map((m) => Math.round(m.totalVolume)),
    itemCounts: menus.map((m) => m.items.length),
  };
}
