import { describe, it, expect } from "vitest";
import type { Patient } from "../types";
import { checkAllergies } from "./allergyChecker";

const basePatient: Patient = {
  id: "p-1",
  name: "テスト太郎",
  age: 60,
  gender: "男性",
  ward: "ICU",
  admissionDate: "2025-01-01",
  dischargeDate: "",
  patientType: "adult",
  weight: 70,
  height: 170,
  diagnosis: "",
  allergies: [],
  medications: [],
  notes: "",
};

const milkProduct = { 製剤名: "ラコール ミルク味", カテゴリ: "経腸栄養剤" };
const soyProduct = { 製剤名: "大豆ペプチド栄養剤", カテゴリ: "経腸栄養剤" };
const plainProduct = { 製剤名: "エルネオパNF1号", カテゴリ: "輸液" };

describe("checkAllergies", () => {
  it("returns empty array when patient has no allergies", () => {
    const result = checkAllergies(basePatient, [{ product: milkProduct }]);
    expect(result).toEqual([]);
  });

  it("returns empty array when menu items are empty", () => {
    const patient = { ...basePatient, allergies: ["乳製品"] };
    expect(checkAllergies(patient, [])).toEqual([]);
  });

  it("detects milk allergy in milk-containing product", () => {
    const patient = { ...basePatient, allergies: ["乳製品"] };
    const result = checkAllergies(patient, [{ product: milkProduct }]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].allergen).toBe("乳製品");
    expect(result[0].productName).toBe("ラコール ミルク味");
  });

  it("detects soy allergy in soy product", () => {
    const patient = { ...basePatient, allergies: ["大豆"] };
    const result = checkAllergies(patient, [{ product: soyProduct }]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].allergen).toBe("大豆");
  });

  it("does not flag unrelated products", () => {
    const patient = { ...basePatient, allergies: ["乳製品"] };
    const result = checkAllergies(patient, [{ product: plainProduct }]);
    expect(result).toEqual([]);
  });

  it("checks multiple allergies against multiple products", () => {
    const patient = { ...basePatient, allergies: ["乳製品", "大豆"] };
    const result = checkAllergies(patient, [
      { product: milkProduct },
      { product: soyProduct },
      { product: plainProduct },
    ]);
    expect(result.length).toBeGreaterThanOrEqual(2);
    const allergens = result.map((w) => w.allergen);
    expect(allergens).toContain("乳製品");
    expect(allergens).toContain("大豆");
  });

  it("does not produce duplicate warnings for same product+allergen", () => {
    const patient = { ...basePatient, allergies: ["乳"] };
    const result = checkAllergies(patient, [{ product: milkProduct }]);
    const unique = new Set(
      result.map((w) => `${w.productName}-${w.allergen}`),
    );
    expect(unique.size).toBe(result.length);
  });

  it("handles products with missing fields gracefully", () => {
    const patient = { ...basePatient, allergies: ["乳製品"] };
    const emptyProduct = { 製剤名: "不明な製剤" };
    const result = checkAllergies(patient, [{ product: emptyProduct }]);
    // Should not crash
    expect(Array.isArray(result)).toBe(true);
  });

  it("assigns high severity for known allergen matches", () => {
    const patient = { ...basePatient, allergies: ["乳"] };
    const result = checkAllergies(patient, [{ product: milkProduct }]);
    expect(result.some((w) => w.severity === "high")).toBe(true);
  });
});
