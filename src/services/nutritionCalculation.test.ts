import { describe, it, expect } from "vitest";
import type { Patient, NutritionRequirements } from "../types";
import {
  calculateBasalMetabolicRate,
  calculateTotalEnergyRequirement,
  calculateNutritionRequirements,
  adjustRequirementsForCondition,
} from "./nutritionCalculation";

// ---- Test fixtures ----

const malePatient: Patient = {
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
  diagnosis: "敗血症",
  allergies: [],
  medications: [],
  notes: "",
};

const femalePatient: Patient = {
  ...malePatient,
  id: "p-2",
  name: "テスト花子",
  gender: "女性",
  age: 50,
  weight: 55,
  height: 158,
};

// ---- BMR calculation ----

describe("calculateBasalMetabolicRate", () => {
  it("calculates BMR for male patient using Harris-Benedict equation", () => {
    // 66.5 + (13.75 * 70) + (5.003 * 170) - (6.775 * 60)
    const expected = 66.5 + 13.75 * 70 + 5.003 * 170 - 6.775 * 60;
    const bmr = calculateBasalMetabolicRate(malePatient);
    expect(bmr).toBeCloseTo(expected, 5);
  });

  it("calculates BMR for female patient using Harris-Benedict equation", () => {
    // 655.1 + (9.563 * 55) + (1.850 * 158) - (4.676 * 50)
    const expected = 655.1 + 9.563 * 55 + 1.85 * 158 - 4.676 * 50;
    const bmr = calculateBasalMetabolicRate(femalePatient);
    expect(bmr).toBeCloseTo(expected, 5);
  });

  it("returns higher BMR for heavier patients of same demographics", () => {
    const heavy = { ...malePatient, weight: 100 };
    const light = { ...malePatient, weight: 50 };
    expect(calculateBasalMetabolicRate(heavy)).toBeGreaterThan(
      calculateBasalMetabolicRate(light),
    );
  });

  it("returns lower BMR for older patients of same demographics", () => {
    const young = { ...malePatient, age: 30 };
    const old = { ...malePatient, age: 80 };
    expect(calculateBasalMetabolicRate(young)).toBeGreaterThan(
      calculateBasalMetabolicRate(old),
    );
  });

  it("returns higher BMR for taller patients of same demographics", () => {
    const tall = { ...malePatient, height: 190 };
    const short = { ...malePatient, height: 150 };
    expect(calculateBasalMetabolicRate(tall)).toBeGreaterThan(
      calculateBasalMetabolicRate(short),
    );
  });
});

// ---- Total energy requirement ----

describe("calculateTotalEnergyRequirement", () => {
  it("returns BMR * 1.0 * 1.2 for bedrest + moderate stress (defaults)", () => {
    const bmr = calculateBasalMetabolicRate(malePatient);
    const ter = calculateTotalEnergyRequirement(malePatient);
    expect(ter).toBeCloseTo(bmr * 1.0 * 1.2, 1);
  });

  it("applies sedentary activity factor of 1.2", () => {
    const bmr = calculateBasalMetabolicRate(malePatient);
    const ter = calculateTotalEnergyRequirement(
      malePatient,
      "sedentary",
      "moderate",
    );
    expect(ter).toBeCloseTo(bmr * 1.2 * 1.2, 1);
  });

  it("applies severe stress factor of 1.4", () => {
    const bmr = calculateBasalMetabolicRate(malePatient);
    const ter = calculateTotalEnergyRequirement(
      malePatient,
      "bedrest",
      "severe",
    );
    expect(ter).toBeCloseTo(bmr * 1.0 * 1.4, 1);
  });

  it("applies critical stress factor of 1.6", () => {
    const bmr = calculateBasalMetabolicRate(malePatient);
    const ter = calculateTotalEnergyRequirement(
      malePatient,
      "bedrest",
      "critical",
    );
    expect(ter).toBeCloseTo(bmr * 1.0 * 1.6, 1);
  });

  it("falls back to defaults for unknown activity/stress levels", () => {
    const bmr = calculateBasalMetabolicRate(malePatient);
    const ter = calculateTotalEnergyRequirement(
      malePatient,
      "unknown",
      "unknown",
    );
    // Unknown activity → 1.0, unknown stress → 1.2
    expect(ter).toBeCloseTo(bmr * 1.0 * 1.2, 1);
  });

  it("higher activity level yields higher energy requirement", () => {
    const bedrest = calculateTotalEnergyRequirement(
      malePatient,
      "bedrest",
      "moderate",
    );
    const active = calculateTotalEnergyRequirement(
      malePatient,
      "active",
      "moderate",
    );
    expect(active).toBeGreaterThan(bedrest);
  });

  it("higher stress level yields higher energy requirement", () => {
    const mild = calculateTotalEnergyRequirement(
      malePatient,
      "bedrest",
      "mild",
    );
    const critical = calculateTotalEnergyRequirement(
      malePatient,
      "bedrest",
      "critical",
    );
    expect(critical).toBeGreaterThan(mild);
  });
});

// ---- Nutrition requirements ----

describe("calculateNutritionRequirements", () => {
  it("returns enteral protein at 1.5 g/kg/day", () => {
    const req = calculateNutritionRequirements(malePatient, "enteral");
    expect(req.protein).toBeCloseTo(70 * 1.5, 0);
  });

  it("returns parenteral protein at 1.2 g/kg/day", () => {
    const req = calculateNutritionRequirements(malePatient, "parenteral");
    expect(req.protein).toBeCloseTo(70 * 1.2, 0);
  });

  it("enteral fat is 30% of total energy / 9", () => {
    const ter = calculateTotalEnergyRequirement(malePatient);
    const req = calculateNutritionRequirements(malePatient, "enteral");
    expect(req.fat).toBeCloseTo(Math.round(((ter * 0.3) / 9) * 10) / 10, 0);
  });

  it("parenteral fat is 25% of total energy / 9", () => {
    const ter = calculateTotalEnergyRequirement(malePatient);
    const req = calculateNutritionRequirements(malePatient, "parenteral");
    expect(req.fat).toBeCloseTo(Math.round(((ter * 0.25) / 9) * 10) / 10, 0);
  });

  it("carbs fill remaining energy after protein and fat", () => {
    const req = calculateNutritionRequirements(malePatient, "enteral");
    const ter = calculateTotalEnergyRequirement(malePatient);
    const protein = 70 * 1.5;
    const fat = (ter * 0.3) / 9;
    const expectedCarbs = (ter - protein * 4 - fat * 9) / 4;
    expect(req.carbs).toBeCloseTo(Math.round(expectedCarbs * 10) / 10, 0);
  });

  it("calculates electrolytes based on weight", () => {
    const req = calculateNutritionRequirements(malePatient, "enteral");
    expect(req.sodium).toBeCloseTo(70 * 1.5, 0);
    expect(req.potassium).toBeCloseTo(70 * 1.0, 0);
    expect(req.calcium).toBeCloseTo(70 * 0.5, 0);
    expect(req.magnesium).toBeCloseTo(70 * 0.3, 0);
    expect(req.phosphorus).toBeCloseTo(70 * 0.8, 0);
    expect(req.chloride).toBeCloseTo(70 * 1.2, 0);
  });

  it("calculates trace elements based on weight", () => {
    const req = calculateNutritionRequirements(malePatient, "enteral");
    expect(req.iron).toBeCloseTo(70 * 0.1, 1);
    expect(req.zinc).toBeCloseTo(70 * 0.05, 1);
    expect(req.copper).toBeCloseTo(70 * 0.01, 2);
    expect(req.manganese).toBeCloseTo(70 * 0.005, 2);
    expect(req.iodine).toBeCloseTo(70 * 1.5, 0);
    expect(req.selenium).toBeCloseTo(70 * 1.0, 0);
  });

  it("returns integer energy value", () => {
    const req = calculateNutritionRequirements(malePatient, "enteral");
    expect(Number.isInteger(req.energy)).toBe(true);
  });

  it("all values are positive", () => {
    const req = calculateNutritionRequirements(malePatient, "enteral");
    for (const [, value] of Object.entries(req)) {
      expect(value).toBeGreaterThan(0);
    }
  });

  it("respects custom activity and stress levels", () => {
    const base = calculateNutritionRequirements(
      malePatient,
      "enteral",
      "bedrest",
      "mild",
    );
    const stressed = calculateNutritionRequirements(
      malePatient,
      "enteral",
      "active",
      "critical",
    );
    expect(stressed.energy).toBeGreaterThan(base.energy);
  });
});

// ---- Condition adjustments ----

describe("adjustRequirementsForCondition", () => {
  const baseReq: NutritionRequirements = {
    energy: 2000,
    protein: 100,
    fat: 80,
    carbs: 250,
    sodium: 100,
    potassium: 70,
    calcium: 35,
    magnesium: 21,
    phosphorus: 56,
    chloride: 84,
    iron: 7,
    zinc: 3.5,
    copper: 0.7,
    manganese: 0.35,
    iodine: 105,
    selenium: 70,
  };

  it("reduces protein, potassium, phosphorus for 腎不全", () => {
    const adj = adjustRequirementsForCondition(baseReq, "腎不全");
    expect(adj.protein).toBeCloseTo(100 * 0.8, 1);
    expect(adj.potassium).toBeCloseTo(70 * 0.5, 1);
    expect(adj.phosphorus).toBeCloseTo(56 * 0.5, 1);
    // Other values unchanged
    expect(adj.energy).toBe(2000);
    expect(adj.fat).toBe(80);
  });

  it("reduces protein and sodium for 肝不全", () => {
    const adj = adjustRequirementsForCondition(baseReq, "肝不全");
    expect(adj.protein).toBeCloseTo(100 * 0.8, 1);
    expect(adj.sodium).toBeCloseTo(100 * 0.5, 1);
    expect(adj.energy).toBe(2000);
  });

  it("reduces sodium and energy for 心不全", () => {
    const adj = adjustRequirementsForCondition(baseReq, "心不全");
    expect(adj.sodium).toBeCloseTo(100 * 0.5, 1);
    expect(adj.energy).toBeCloseTo(2000 * 0.9, 1);
    expect(adj.protein).toBe(100);
  });

  it("reduces carbs and increases fat for 糖尿病", () => {
    const adj = adjustRequirementsForCondition(baseReq, "糖尿病");
    expect(adj.carbs).toBeCloseTo(250 * 0.8, 1);
    expect(adj.fat).toBeCloseTo(80 * 1.1, 1);
    expect(adj.energy).toBe(2000);
  });

  it("increases protein and energy for 炎症性腸疾患", () => {
    const adj = adjustRequirementsForCondition(baseReq, "炎症性腸疾患");
    expect(adj.protein).toBeCloseTo(100 * 1.2, 1);
    expect(adj.energy).toBeCloseTo(2000 * 1.1, 1);
  });

  it("increases protein and energy for 外傷・手術", () => {
    const adj = adjustRequirementsForCondition(baseReq, "外傷・手術");
    expect(adj.protein).toBeCloseTo(100 * 1.3, 1);
    expect(adj.energy).toBeCloseTo(2000 * 1.2, 1);
  });

  it("returns unchanged requirements for unknown condition", () => {
    const adj = adjustRequirementsForCondition(baseReq, "unknown");
    expect(adj).toEqual(baseReq);
  });

  it("does not mutate the original requirements object", () => {
    const original = { ...baseReq };
    adjustRequirementsForCondition(baseReq, "腎不全");
    expect(baseReq).toEqual(original);
  });
});
