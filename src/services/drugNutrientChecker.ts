import { normalizeText } from "../utils/textNormalizer";
import {
  DRUG_NUTRIENT_RULES,
  type DrugNutrientRule,
  type InteractionSeverity,
} from "../data/drugNutrientRules";

export interface DrugNutrientInteraction {
  readonly ruleId: string;
  readonly drug: string;
  readonly severity: InteractionSeverity;
  readonly interaction: string;
  readonly recommendation: string;
}

function medicationMatchesRule(
  medication: string,
  rule: DrugNutrientRule,
): boolean {
  const normalized = normalizeText(medication);
  return rule.drugKeywords.some((keyword) =>
    normalized.includes(normalizeText(keyword)),
  );
}

function menuContainsNutrient(
  menuItems: ReadonlyArray<{ product: Record<string, string | number> }>,
  nutrientKeywords: readonly string[],
  nutritionType: string,
): boolean {
  // Check nutrition type keywords (e.g. "経腸", "enteral")
  for (const keyword of nutrientKeywords) {
    const nk = normalizeText(keyword);
    if (
      (nk === "経腸" || nk === "enteral" || nk === "チューブ" || nk === "経管") &&
      nutritionType === "enteral"
    ) {
      return true;
    }
  }

  // Check product names and categories for nutrient keywords
  for (const item of menuItems) {
    const name = normalizeText(String(item.product["製剤名"] ?? ""));
    const category = normalizeText(String(item.product["カテゴリ"] ?? ""));
    const subCategory = normalizeText(String(item.product["サブカテゴリ"] ?? ""));

    const searchable = `${name}|${category}|${subCategory}`;

    for (const keyword of nutrientKeywords) {
      if (searchable.includes(normalizeText(keyword))) {
        return true;
      }
    }

    // Check numeric nutrient fields for presence of relevant nutrients
    for (const keyword of nutrientKeywords) {
      const nk = normalizeText(keyword);
      if (
        (nk === "k" || nk === "カリウム" || nk === "potassium") &&
        parseFloat(String(item.product["K[mEq/L]"] ?? "0")) > 0
      ) {
        return true;
      }
      if (
        (nk === "mg" || nk === "マグネシウム" || nk === "magnesium") &&
        parseFloat(String(item.product["Mg[mEq/L]"] ?? "0")) > 0
      ) {
        return true;
      }
      if (
        (nk === "ca" || nk === "カルシウム" || nk === "calcium") &&
        parseFloat(String(item.product["Ca[mEq/L]"] ?? "0")) > 0
      ) {
        return true;
      }
      if (
        (nk === "fe" || nk === "鉄") &&
        parseFloat(String(item.product["Fe[mg/100ml]"] ?? "0")) > 0
      ) {
        return true;
      }
      if (
        (nk === "炭水化物" || nk === "糖" || nk === "ブドウ糖" || nk === "グルコース" || nk === "glucose" || nk === "carbs") &&
        parseFloat(String(item.product["炭水化物[g/100ml]"] ?? "0")) > 0
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check for drug-nutrient interactions between patient medications and menu items.
 */
export function checkDrugNutrientInteractions(
  medications: readonly string[],
  menuItems: ReadonlyArray<{ product: Record<string, string | number> }>,
  nutritionType: string,
): readonly DrugNutrientInteraction[] {
  if (medications.length === 0 || menuItems.length === 0) {
    return [];
  }

  const interactions: DrugNutrientInteraction[] = [];
  const seen = new Set<string>();

  for (const medication of medications) {
    for (const rule of DRUG_NUTRIENT_RULES) {
      if (!medicationMatchesRule(medication, rule)) {
        continue;
      }
      if (!menuContainsNutrient(menuItems, rule.nutrientKeywords, nutritionType)) {
        continue;
      }

      const key = `${rule.id}:${medication}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      interactions.push({
        ruleId: rule.id,
        drug: medication,
        severity: rule.severity,
        interaction: rule.interaction,
        recommendation: rule.recommendation,
      });
    }
  }

  // Sort by severity: high > medium > low
  const severityOrder: Record<InteractionSeverity, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  return [...interactions].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );
}
