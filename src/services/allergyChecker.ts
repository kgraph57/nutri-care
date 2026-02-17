import type { Patient } from "../types";
import { normalizeText } from "../utils/textNormalizer";

export interface AllergyWarning {
  productName: string;
  allergen: string;
  severity: "high" | "medium";
  message: string;
}

/**
 * Common allergen keywords mapped to related product/ingredient terms.
 * Keys: patient allergy keywords
 * Values: terms that appear in product names, categories, or ingredients
 */
const ALLERGEN_PRODUCT_MAP: ReadonlyMap<string, readonly string[]> = new Map([
  // Milk / dairy
  ["乳", ["乳", "ミルク", "カゼイン", "ホエイ", "ラクト"]],
  ["牛乳", ["乳", "ミルク", "カゼイン", "ホエイ", "ラクト"]],
  ["ミルク", ["乳", "ミルク", "カゼイン", "ホエイ", "ラクト"]],
  ["乳製品", ["乳", "ミルク", "カゼイン", "ホエイ", "ラクト"]],
  ["乳糖", ["乳糖", "ラクトース", "乳"]],

  // Soy
  ["大豆", ["大豆", "ソイ", "ソヤ", "レシチン"]],
  ["ソイ", ["大豆", "ソイ", "ソヤ", "レシチン"]],

  // Egg
  ["卵", ["卵", "エッグ", "オボ", "リゾチーム"]],
  ["鶏卵", ["卵", "エッグ", "オボ", "リゾチーム"]],

  // Fish
  ["魚", ["魚", "フィッシュ", "EPA", "DHA", "魚油"]],
  ["魚油", ["魚油", "EPA", "DHA"]],

  // Wheat / gluten
  ["小麦", ["小麦", "グルテン", "ウィート"]],
  ["グルテン", ["グルテン", "小麦", "ウィート"]],

  // Peanut / tree nuts
  ["ピーナッツ", ["ピーナッツ", "落花生"]],
  ["落花生", ["ピーナッツ", "落花生"]],
  ["ナッツ", ["ナッツ", "アーモンド", "クルミ"]],

  // Corn
  ["トウモロコシ", ["トウモロコシ", "コーン", "マルトデキストリン"]],
  ["コーン", ["コーン", "トウモロコシ", "マルトデキストリン"]],
]);

function productMatchesAllergen(
  product: Record<string, string | number>,
  relatedTerms: readonly string[],
): boolean {
  const name = normalizeText(String(product["製剤名"] ?? ""));
  const category = normalizeText(String(product["カテゴリ"] ?? ""));
  const subCategory = normalizeText(String(product["サブカテゴリ"] ?? ""));
  const notes = normalizeText(String(product["備考"] ?? ""));
  const ingredients = normalizeText(String(product["原材料"] ?? ""));

  const searchable = `${name}|${category}|${subCategory}|${notes}|${ingredients}`;

  return relatedTerms.some((term) => searchable.includes(normalizeText(term)));
}

/**
 * Check menu items against patient allergies and return warnings.
 */
export function checkAllergies(
  patient: Patient,
  menuItems: ReadonlyArray<{
    product: Record<string, string | number>;
  }>,
): AllergyWarning[] {
  if (patient.allergies.length === 0 || menuItems.length === 0) {
    return [];
  }

  const warnings: AllergyWarning[] = [];

  for (const allergy of patient.allergies) {
    const normalizedAllergy = normalizeText(allergy);

    for (const item of menuItems) {
      const productName = String(item.product["製剤名"] ?? "不明");

      // Check against the known allergen-product map
      for (const [allergenKey, relatedTerms] of ALLERGEN_PRODUCT_MAP) {
        if (!normalizedAllergy.includes(normalizeText(allergenKey))) {
          continue;
        }
        if (productMatchesAllergen(item.product, relatedTerms)) {
          warnings.push({
            productName,
            allergen: allergy,
            severity: "high",
            message: `${productName} は ${allergy} 関連成分を含む可能性があります`,
          });
        }
      }

      // Direct name match as fallback
      const normalizedProductName = normalizeText(
        String(item.product["製剤名"] ?? ""),
      );
      if (
        normalizedProductName.includes(normalizedAllergy) ||
        normalizedAllergy.includes(normalizedProductName)
      ) {
        const alreadyWarned = warnings.some(
          (w) => w.productName === productName && w.allergen === allergy,
        );
        if (!alreadyWarned) {
          warnings.push({
            productName,
            allergen: allergy,
            severity: "medium",
            message: `${productName} が ${allergy} アレルギーに該当する可能性があります`,
          });
        }
      }
    }
  }

  return warnings;
}
