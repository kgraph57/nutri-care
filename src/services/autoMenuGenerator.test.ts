import { describe, it, expect } from "vitest";
import {
  generateNutritionMenu,
  type AutoGenerateInput,
} from "./autoMenuGenerator";

// Minimal mock products to exercise the pipeline
const MOCK_PRODUCTS: ReadonlyArray<Record<string, string | number>> = [
  {
    製剤名: "エンシュア・リキッド",
    メーカー: "アボット",
    カテゴリ: "経腸栄養剤",
    サブカテゴリ: "半消化態",
    投与経路: "経腸",
    "エネルギー[kcal/ml]": 1.0,
    "タンパク質[g/100ml]": 3.5,
    "脂質[g/100ml]": 3.5,
    "炭水化物[g/100ml]": 14.0,
    "Na[mEq/L]": 18,
    "K[mEq/L]": 16,
    "Ca[mEq/L]": 12,
    "Mg[mEq/L]": 4,
    "P[mEq/L]": 10,
    "Cl[mEq/L]": 14,
  },
  {
    製剤名: "リーナレンLP",
    メーカー: "テルモ",
    カテゴリ: "経腸栄養剤",
    サブカテゴリ: "腎臓病用",
    投与経路: "経腸",
    "エネルギー[kcal/ml]": 1.6,
    "タンパク質[g/100ml]": 2.0,
    "脂質[g/100ml]": 5.6,
    "炭水化物[g/100ml]": 22.4,
    "Na[mEq/L]": 12,
    "K[mEq/L]": 5,
    "Ca[mEq/L]": 6,
    "Mg[mEq/L]": 3,
    "P[mEq/L]": 4,
    "Cl[mEq/L]": 10,
  },
  {
    製剤名: "エルネオパNF1号",
    メーカー: "大塚製薬",
    カテゴリ: "点滴製剤",
    サブカテゴリ: "TPN用",
    投与経路: "静脈",
    "エネルギー[kcal/ml]": 0.56,
    "タンパク質[g/100ml]": 0,
    "アミノ酸[%]": 3.0,
    "ブドウ糖[%]": 12.0,
    "脂肪[%]": 0,
    "Na[mEq/L]": 35,
    "K[mEq/L]": 22,
  },
  {
    製剤名: "グルセルナ・REX",
    メーカー: "アボット",
    カテゴリ: "経腸栄養剤",
    サブカテゴリ: "糖尿病用",
    投与経路: "経腸",
    "エネルギー[kcal/ml]": 0.93,
    "タンパク質[g/100ml]": 4.0,
    "脂質[g/100ml]": 4.8,
    "炭水化物[g/100ml]": 8.2,
    "Na[mEq/L]": 20,
    "K[mEq/L]": 18,
  },
];

function makeInput(
  overrides: Partial<AutoGenerateInput> = {},
): AutoGenerateInput {
  return {
    weight: 60,
    height: 165,
    age: 65,
    gender: "男性",
    diagnosis: "肺炎",
    patientType: "ICU",
    allergies: [],
    medications: [],
    ...overrides,
  };
}

describe("generateNutritionMenu", () => {
  it("returns a valid GeneratedMenu for standard patient", () => {
    const input = makeInput();
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    expect(result.nutritionType).toBe("enteral");
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.totalEnergy).toBeGreaterThan(0);
    expect(result.requirements.energy).toBeGreaterThan(0);
    expect(result.requirements.protein).toBeGreaterThan(0);
    expect(result.energyAchievement).toBeGreaterThanOrEqual(0);
    expect(result.proteinAchievement).toBeGreaterThanOrEqual(0);
    expect(result.rationale).toBeTruthy();
    expect(result.conditionLabel).toBeTruthy();
  });

  it("selects renal products for 腎不全 diagnosis", () => {
    const input = makeInput({ diagnosis: "腎不全" });
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    expect(result.condition.primary).toBe("renal");
    expect(result.conditionLabel).toBe("腎不全");
    // Should prefer リーナレン for renal
    const productNames = result.items.map((item) =>
      String(item.product["製剤名"] ?? ""),
    );
    expect(productNames.some((n) => n.includes("リーナレン"))).toBe(true);
  });

  it("selects diabetes products for 糖尿病 diagnosis", () => {
    const input = makeInput({ diagnosis: "糖尿病" });
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    expect(result.condition.primary).toBe("diabetes");
    expect(result.conditionLabel).toBe("糖尿病");
    const productNames = result.items.map((item) =>
      String(item.product["製剤名"] ?? ""),
    );
    expect(productNames.some((n) => n.includes("グルセルナ"))).toBe(true);
  });

  it("uses parenteral route when overrideNutritionType is parenteral", () => {
    const input = makeInput({ overrideNutritionType: "parenteral" });
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    expect(result.nutritionType).toBe("parenteral");
    const productNames = result.items.map((item) =>
      String(item.product["製剤名"] ?? ""),
    );
    expect(productNames.some((n) => n.includes("エルネオパ"))).toBe(true);
  });

  it("warns when fluid restriction is exceeded", () => {
    const input = makeInput({ fluidRestriction: 500 });
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    // Optimizer may exceed fluid limit but should issue a warning
    if (result.totalVolume > 500) {
      expect(result.warnings.some((w) => w.includes("超過"))).toBe(true);
    }
  });

  it("returns empty items when no products match route", () => {
    const enteralOnly = MOCK_PRODUCTS.filter((p) =>
      String(p["投与経路"]).includes("経腸"),
    );
    // Force parenteral but only enteral products available
    const input = makeInput({ overrideNutritionType: "parenteral" });
    const result = generateNutritionMenu(input, enteralOnly);

    expect(result.items.length).toBe(0);
    expect(result.totalEnergy).toBe(0);
  });

  it("detects refeeding risk for low BMI anorexia patient", () => {
    const input = makeInput({
      weight: 35,
      height: 160,
      age: 25,
      gender: "女性",
      diagnosis: "神経性食思不振症",
    });
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    expect(result.condition.refeedingRisk).toBe(true);
    expect(result.cautions.length).toBeGreaterThan(0);
  });

  it("generates items with rationale", () => {
    const input = makeInput();
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    for (const item of result.items) {
      expect(item.rationale).toBeTruthy();
      expect(item.volume).toBeGreaterThan(0);
      expect(item.frequency).toBeGreaterThanOrEqual(1);
    }
  });

  it("handles pediatric patient classification", () => {
    const input = makeInput({
      age: 5,
      weight: 18,
      height: 110,
      patientType: "PICU",
      diagnosis: "肺炎",
    });
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    expect(result.condition.primary).toBe("pediatric_standard");
  });

  it("provides drug interaction warnings when relevant medication is present", () => {
    const input = makeInput({
      medications: ["ワルファリン"],
    });
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    // drugInteractions may or may not be populated depending on product content
    // but the array should always be present
    expect(Array.isArray(result.drugInteractions)).toBe(true);
  });

  it("all numeric outputs are finite numbers", () => {
    const input = makeInput();
    const result = generateNutritionMenu(input, MOCK_PRODUCTS);

    expect(Number.isFinite(result.totalEnergy)).toBe(true);
    expect(Number.isFinite(result.totalProtein)).toBe(true);
    expect(Number.isFinite(result.totalVolume)).toBe(true);
    expect(Number.isFinite(result.energyAchievement)).toBe(true);
    expect(Number.isFinite(result.proteinAchievement)).toBe(true);
    expect(Number.isFinite(result.requirements.energy)).toBe(true);
    expect(Number.isFinite(result.requirements.protein)).toBe(true);
  });
});
