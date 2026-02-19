import { describe, it, expect } from "vitest";
import type { Patient } from "../types";
import {
  isPediatricPatient,
  getAgeCategory,
  calculateSchofieldBMR,
  getEnergyRequirementPerKg,
  getProteinRequirementPerKg,
  calculatePediatricRequirements,
} from "./pediatricNutritionCalculation";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const basePatient: Patient = {
  id: "ped-1",
  name: "テスト小児",
  age: 5,
  gender: "男性",
  ward: "PICU",
  admissionDate: "2026-01-01",
  dischargeDate: "",
  patientType: "PICU",
  weight: 20,
  height: 110,
  diagnosis: "肺炎",
  allergies: [],
  medications: [],
  notes: "",
};

const adultPatient: Patient = {
  ...basePatient,
  id: "adult-1",
  name: "テスト成人",
  age: 40,
  patientType: "adult",
  weight: 70,
  height: 170,
};

// ---------------------------------------------------------------------------
// isPediatricPatient
// ---------------------------------------------------------------------------

describe("isPediatricPatient", () => {
  it("returns true when age < 18", () => {
    const patient = { ...basePatient, age: 10, patientType: "adult" };
    expect(isPediatricPatient(patient)).toBe(true);
  });

  it("returns true for age 0 (neonate)", () => {
    const patient = { ...basePatient, age: 0, patientType: "adult" };
    expect(isPediatricPatient(patient)).toBe(true);
  });

  it("returns true for age 17 (boundary just under 18)", () => {
    const patient = { ...basePatient, age: 17, patientType: "adult" };
    expect(isPediatricPatient(patient)).toBe(true);
  });

  it("returns false for age 18 with non-pediatric patientType", () => {
    const patient = { ...basePatient, age: 18, patientType: "adult" };
    expect(isPediatricPatient(patient)).toBe(false);
  });

  it("returns true for patientType PICU regardless of age", () => {
    const patient = { ...basePatient, age: 20, patientType: "PICU" };
    expect(isPediatricPatient(patient)).toBe(true);
  });

  it("returns true for patientType NICU regardless of age", () => {
    const patient = { ...basePatient, age: 20, patientType: "NICU" };
    expect(isPediatricPatient(patient)).toBe(true);
  });

  it("returns true for patientType 小児一般 regardless of age", () => {
    const patient = { ...basePatient, age: 25, patientType: "小児一般" };
    expect(isPediatricPatient(patient)).toBe(true);
  });

  it("returns false for adult patient with non-pediatric patientType", () => {
    expect(isPediatricPatient(adultPatient)).toBe(false);
  });

  it("returns false for age exactly 18 with ICU patientType (not PICU)", () => {
    const patient = { ...basePatient, age: 18, patientType: "ICU" };
    expect(isPediatricPatient(patient)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAgeCategory
// ---------------------------------------------------------------------------

describe("getAgeCategory", () => {
  describe("preterm detection via gestationalAge", () => {
    it("returns preterm when gestationalAge < 37", () => {
      const patient = { ...basePatient, gestationalAge: 34 };
      expect(getAgeCategory(patient)).toBe("preterm");
    });

    it("returns preterm for gestationalAge = 36 (boundary)", () => {
      const patient = { ...basePatient, gestationalAge: 36 };
      expect(getAgeCategory(patient)).toBe("preterm");
    });

    it("does not return preterm when gestationalAge = 37 (full-term)", () => {
      const patient = { ...basePatient, gestationalAge: 37, age: 0, ageInMonths: 0.5 };
      expect(getAgeCategory(patient)).not.toBe("preterm");
    });

    it("prioritizes gestationalAge over ageInMonths", () => {
      const patient = {
        ...basePatient,
        gestationalAge: 32,
        ageInMonths: 24,
        age: 2,
      };
      expect(getAgeCategory(patient)).toBe("preterm");
    });
  });

  describe("neonate (< 1 month)", () => {
    it("returns neonate when ageInMonths < 1", () => {
      const patient = { ...basePatient, age: 0, ageInMonths: 0.5 };
      expect(getAgeCategory(patient)).toBe("neonate");
    });

    it("returns neonate when ageInMonths is 0", () => {
      const patient = { ...basePatient, age: 0, ageInMonths: 0 };
      expect(getAgeCategory(patient)).toBe("neonate");
    });
  });

  describe("infant (1-11 months)", () => {
    it("returns infant when ageInMonths = 1", () => {
      const patient = { ...basePatient, age: 0, ageInMonths: 1 };
      expect(getAgeCategory(patient)).toBe("infant");
    });

    it("returns infant when ageInMonths = 11", () => {
      const patient = { ...basePatient, age: 0, ageInMonths: 11 };
      expect(getAgeCategory(patient)).toBe("infant");
    });

    it("does not return infant when ageInMonths = 12", () => {
      const patient = { ...basePatient, age: 1, ageInMonths: 12 };
      expect(getAgeCategory(patient)).not.toBe("infant");
    });
  });

  describe("toddler (12-35 months)", () => {
    it("returns toddler when ageInMonths = 12", () => {
      const patient = { ...basePatient, age: 1, ageInMonths: 12 };
      expect(getAgeCategory(patient)).toBe("toddler");
    });

    it("returns toddler when ageInMonths = 35", () => {
      const patient = { ...basePatient, age: 2, ageInMonths: 35 };
      expect(getAgeCategory(patient)).toBe("toddler");
    });
  });

  describe("preschool (36-71 months)", () => {
    it("returns preschool when ageInMonths = 36", () => {
      const patient = { ...basePatient, age: 3, ageInMonths: 36 };
      expect(getAgeCategory(patient)).toBe("preschool");
    });

    it("returns preschool when ageInMonths = 71", () => {
      const patient = { ...basePatient, age: 5, ageInMonths: 71 };
      expect(getAgeCategory(patient)).toBe("preschool");
    });
  });

  describe("schoolAge (72-143 months)", () => {
    it("returns schoolAge when ageInMonths = 72", () => {
      const patient = { ...basePatient, age: 6, ageInMonths: 72 };
      expect(getAgeCategory(patient)).toBe("schoolAge");
    });

    it("returns schoolAge when ageInMonths = 143", () => {
      const patient = { ...basePatient, age: 11, ageInMonths: 143 };
      expect(getAgeCategory(patient)).toBe("schoolAge");
    });
  });

  describe("adolescent (>= 144 months)", () => {
    it("returns adolescent when ageInMonths = 144", () => {
      const patient = { ...basePatient, age: 12, ageInMonths: 144 };
      expect(getAgeCategory(patient)).toBe("adolescent");
    });

    it("returns adolescent when ageInMonths = 200", () => {
      const patient = { ...basePatient, age: 16, ageInMonths: 200 };
      expect(getAgeCategory(patient)).toBe("adolescent");
    });
  });

  describe("fallback to age * 12 when ageInMonths is undefined", () => {
    it("returns neonate for age = 0 without ageInMonths", () => {
      const patient = { ...basePatient, age: 0 };
      expect(getAgeCategory(patient)).toBe("neonate");
    });

    it("returns toddler for age = 1 (12 months) without ageInMonths", () => {
      const patient = { ...basePatient, age: 1 };
      expect(getAgeCategory(patient)).toBe("toddler");
    });

    it("returns preschool for age = 3 (36 months) without ageInMonths", () => {
      const patient = { ...basePatient, age: 3 };
      expect(getAgeCategory(patient)).toBe("preschool");
    });

    it("returns schoolAge for age = 6 (72 months) without ageInMonths", () => {
      const patient = { ...basePatient, age: 6 };
      expect(getAgeCategory(patient)).toBe("schoolAge");
    });

    it("returns adolescent for age = 12 (144 months) without ageInMonths", () => {
      const patient = { ...basePatient, age: 12 };
      expect(getAgeCategory(patient)).toBe("adolescent");
    });

    it("returns adolescent for age = 15 without ageInMonths", () => {
      const patient = { ...basePatient, age: 15 };
      expect(getAgeCategory(patient)).toBe("adolescent");
    });
  });
});

// ---------------------------------------------------------------------------
// calculateSchofieldBMR
// ---------------------------------------------------------------------------

describe("calculateSchofieldBMR", () => {
  describe("male (男性), age < 3", () => {
    it("calculates BMR using male < 3 coefficients", () => {
      const weight = 10;
      const height = 75; // cm
      const age = 1;
      const heightM = height / 100;
      const expected = 0.167 * weight + 1517.4 * heightM - 617.6;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, age, "男性")).toBe(rounded);
    });
  });

  describe("female (女性), age < 3", () => {
    it("calculates BMR using female < 3 coefficients", () => {
      const weight = 9;
      const height = 70;
      const age = 2;
      const heightM = height / 100;
      const expected = 16.25 * weight + 1023.2 * heightM - 413.5;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, age, "女性")).toBe(rounded);
    });
  });

  describe("male (男性), age 3-9", () => {
    it("calculates BMR using male 3-9 coefficients", () => {
      const weight = 20;
      const height = 110;
      const age = 5;
      const heightM = height / 100;
      const expected = 19.6 * weight + 130.3 * heightM + 414.9;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, age, "男性")).toBe(rounded);
    });
  });

  describe("female (女性), age 3-9", () => {
    it("calculates BMR using female 3-9 coefficients", () => {
      const weight = 18;
      const height = 105;
      const age = 4;
      const heightM = height / 100;
      const expected = 16.97 * weight + 161.8 * heightM + 371.2;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, age, "女性")).toBe(rounded);
    });
  });

  describe("male (男性), age >= 10", () => {
    it("calculates BMR using male >= 10 coefficients", () => {
      const weight = 45;
      const height = 155;
      const age = 14;
      const heightM = height / 100;
      const expected = 16.25 * weight + 137.2 * heightM + 515.5;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, age, "男性")).toBe(rounded);
    });
  });

  describe("female (女性), age >= 10", () => {
    it("calculates BMR using female >= 10 coefficients", () => {
      const weight = 50;
      const height = 160;
      const age = 15;
      const heightM = height / 100;
      const expected = 8.365 * weight + 465.0 * heightM + 200.0;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, age, "女性")).toBe(rounded);
    });
  });

  describe("age boundary conditions", () => {
    it("uses < 3 formula for age = 2", () => {
      const weight = 12;
      const height = 85;
      const heightM = height / 100;
      const expected = 0.167 * weight + 1517.4 * heightM - 617.6;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, 2, "男性")).toBe(rounded);
    });

    it("uses 3-9 formula for age = 3 (boundary)", () => {
      const weight = 14;
      const height = 95;
      const heightM = height / 100;
      const expected = 19.6 * weight + 130.3 * heightM + 414.9;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, 3, "男性")).toBe(rounded);
    });

    it("uses 3-9 formula for age = 9", () => {
      const weight = 30;
      const height = 130;
      const heightM = height / 100;
      const expected = 19.6 * weight + 130.3 * heightM + 414.9;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, 9, "男性")).toBe(rounded);
    });

    it("uses >= 10 formula for age = 10 (boundary)", () => {
      const weight = 32;
      const height = 135;
      const heightM = height / 100;
      const expected = 16.25 * weight + 137.2 * heightM + 515.5;
      const rounded = Math.round(expected * 10) / 10;

      expect(calculateSchofieldBMR(weight, height, 10, "男性")).toBe(rounded);
    });
  });

  describe("general properties", () => {
    it("returns result rounded to one decimal place", () => {
      const result = calculateSchofieldBMR(20, 110, 5, "男性");
      const decimalDigits = result.toString().split(".")[1]?.length ?? 0;
      expect(decimalDigits).toBeLessThanOrEqual(1);
    });

    it("returns a positive value for valid inputs", () => {
      expect(calculateSchofieldBMR(20, 110, 5, "男性")).toBeGreaterThan(0);
      expect(calculateSchofieldBMR(50, 160, 15, "女性")).toBeGreaterThan(0);
    });

    it("heavier child yields higher BMR within same age and gender", () => {
      const lighter = calculateSchofieldBMR(15, 100, 5, "男性");
      const heavier = calculateSchofieldBMR(25, 100, 5, "男性");
      expect(heavier).toBeGreaterThan(lighter);
    });

    it("taller child yields higher BMR within same age and gender", () => {
      const shorter = calculateSchofieldBMR(20, 90, 5, "男性");
      const taller = calculateSchofieldBMR(20, 130, 5, "男性");
      expect(taller).toBeGreaterThan(shorter);
    });
  });
});

// ---------------------------------------------------------------------------
// getEnergyRequirementPerKg / getProteinRequirementPerKg
// ---------------------------------------------------------------------------

describe("getEnergyRequirementPerKg", () => {
  it("returns correct range for preterm", () => {
    const range = getEnergyRequirementPerKg("preterm");
    expect(range).toEqual({ min: 110, max: 150, target: 120 });
  });

  it("returns correct range for neonate", () => {
    const range = getEnergyRequirementPerKg("neonate");
    expect(range).toEqual({ min: 100, max: 130, target: 110 });
  });

  it("returns correct range for infant", () => {
    const range = getEnergyRequirementPerKg("infant");
    expect(range).toEqual({ min: 90, max: 120, target: 100 });
  });

  it("returns correct range for toddler", () => {
    const range = getEnergyRequirementPerKg("toddler");
    expect(range).toEqual({ min: 75, max: 100, target: 85 });
  });

  it("returns correct range for preschool", () => {
    const range = getEnergyRequirementPerKg("preschool");
    expect(range).toEqual({ min: 65, max: 85, target: 75 });
  });

  it("returns correct range for schoolAge", () => {
    const range = getEnergyRequirementPerKg("schoolAge");
    expect(range).toEqual({ min: 55, max: 75, target: 65 });
  });

  it("returns correct range for adolescent", () => {
    const range = getEnergyRequirementPerKg("adolescent");
    expect(range).toEqual({ min: 30, max: 55, target: 45 });
  });

  it("energy target decreases with increasing age category", () => {
    const categories = [
      "preterm",
      "neonate",
      "infant",
      "toddler",
      "preschool",
      "schoolAge",
      "adolescent",
    ] as const;

    for (let i = 1; i < categories.length; i++) {
      const current = getEnergyRequirementPerKg(categories[i]);
      const previous = getEnergyRequirementPerKg(categories[i - 1]);
      expect(current.target).toBeLessThanOrEqual(previous.target);
    }
  });
});

describe("getProteinRequirementPerKg", () => {
  it("returns correct range for preterm", () => {
    const range = getProteinRequirementPerKg("preterm");
    expect(range).toEqual({ min: 3.5, max: 4.5, target: 4.0 });
  });

  it("returns correct range for neonate", () => {
    const range = getProteinRequirementPerKg("neonate");
    expect(range).toEqual({ min: 2.5, max: 3.5, target: 3.0 });
  });

  it("returns correct range for infant", () => {
    const range = getProteinRequirementPerKg("infant");
    expect(range).toEqual({ min: 2.0, max: 3.0, target: 2.5 });
  });

  it("returns correct range for toddler", () => {
    const range = getProteinRequirementPerKg("toddler");
    expect(range).toEqual({ min: 1.5, max: 2.0, target: 1.5 });
  });

  it("returns correct range for adolescent", () => {
    const range = getProteinRequirementPerKg("adolescent");
    expect(range).toEqual({ min: 0.8, max: 1.5, target: 1.0 });
  });

  it("protein target decreases with increasing age category", () => {
    const categories = [
      "preterm",
      "neonate",
      "infant",
      "toddler",
      "preschool",
      "schoolAge",
      "adolescent",
    ] as const;

    for (let i = 1; i < categories.length; i++) {
      const current = getProteinRequirementPerKg(categories[i]);
      const previous = getProteinRequirementPerKg(categories[i - 1]);
      expect(current.target).toBeLessThanOrEqual(previous.target);
    }
  });
});

// ---------------------------------------------------------------------------
// calculatePediatricRequirements
// ---------------------------------------------------------------------------

describe("calculatePediatricRequirements", () => {
  describe("energy calculation", () => {
    it("returns correct energy for toddler with moderate stress", () => {
      const patient = { ...basePatient, age: 2, ageInMonths: 24, weight: 12 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      // toddler target: 85 kcal/kg, moderate stress: 1.1
      const expected = Math.round(85 * 12 * 1.1);
      expect(result.energy).toBe(expected);
    });

    it("returns correct energy for infant with mild stress", () => {
      const patient = { ...basePatient, age: 0, ageInMonths: 6, weight: 7 };
      const result = calculatePediatricRequirements(patient, "enteral", "mild");
      // infant target: 100 kcal/kg, mild stress: 1.0
      const expected = Math.round(100 * 7 * 1.0);
      expect(result.energy).toBe(expected);
    });

    it("returns correct energy for adolescent with severe stress", () => {
      const patient = { ...basePatient, age: 15, ageInMonths: 180, weight: 55 };
      const result = calculatePediatricRequirements(patient, "enteral", "severe");
      // adolescent target: 45 kcal/kg, severe stress: 1.3
      const expected = Math.round(45 * 55 * 1.3);
      expect(result.energy).toBe(expected);
    });

    it("returns correct energy for preterm with critical stress", () => {
      const patient = {
        ...basePatient,
        age: 0,
        ageInMonths: 0,
        weight: 1.5,
        gestationalAge: 30,
      };
      const result = calculatePediatricRequirements(patient, "enteral", "critical");
      // preterm target: 120 kcal/kg, critical stress: 1.5
      const expected = Math.round(120 * 1.5 * 1.5);
      expect(result.energy).toBe(expected);
    });

    it("returns integer energy value", () => {
      const result = calculatePediatricRequirements(basePatient, "enteral", "moderate");
      expect(Number.isInteger(result.energy)).toBe(true);
    });
  });

  describe("protein calculation", () => {
    it("returns correct protein for toddler with moderate stress", () => {
      const patient = { ...basePatient, age: 2, ageInMonths: 24, weight: 12 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      // toddler protein target: 1.5 g/kg, moderate stress: 1.1
      const expected = Math.round(1.5 * 12 * 1.1 * 10) / 10;
      expect(result.protein).toBe(expected);
    });

    it("returns correct protein for preterm with mild stress", () => {
      const patient = {
        ...basePatient,
        age: 0,
        weight: 1.2,
        gestationalAge: 28,
      };
      const result = calculatePediatricRequirements(patient, "enteral", "mild");
      // preterm protein target: 4.0 g/kg, mild stress: 1.0
      const expected = Math.round(4.0 * 1.2 * 1.0 * 10) / 10;
      expect(result.protein).toBe(expected);
    });
  });

  describe("fat calculation", () => {
    it("fat is 30% of total energy / 9", () => {
      const patient = { ...basePatient, age: 2, ageInMonths: 24, weight: 12 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      const totalEnergy = 85 * 12 * 1.1;
      const expectedFat = Math.round(((totalEnergy * 0.3) / 9) * 10) / 10;
      expect(result.fat).toBe(expectedFat);
    });
  });

  describe("carbs calculation", () => {
    it("carbs fill remaining energy after protein and fat", () => {
      const patient = { ...basePatient, age: 2, ageInMonths: 24, weight: 12 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      const stressFactor = 1.1;
      const totalEnergy = 85 * 12 * stressFactor;
      const protein = 1.5 * 12 * stressFactor;
      const fat = (totalEnergy * 0.3) / 9;
      const expectedCarbs = Math.round(((totalEnergy - protein * 4 - fat * 9) / 4) * 10) / 10;
      expect(result.carbs).toBe(expectedCarbs);
    });
  });

  describe("stress factor handling", () => {
    it("applies mild stress factor (1.0)", () => {
      const patient = { ...basePatient, age: 5, weight: 20 };
      const mild = calculatePediatricRequirements(patient, "enteral", "mild");
      const moderate = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(mild.energy).toBeLessThan(moderate.energy);
    });

    it("applies severe stress factor (1.3)", () => {
      const patient = { ...basePatient, age: 5, weight: 20 };
      const moderate = calculatePediatricRequirements(patient, "enteral", "moderate");
      const severe = calculatePediatricRequirements(patient, "enteral", "severe");
      expect(severe.energy).toBeGreaterThan(moderate.energy);
    });

    it("applies critical stress factor (1.5)", () => {
      const patient = { ...basePatient, age: 5, weight: 20 };
      const severe = calculatePediatricRequirements(patient, "enteral", "severe");
      const critical = calculatePediatricRequirements(patient, "enteral", "critical");
      expect(critical.energy).toBeGreaterThan(severe.energy);
    });

    it("falls back to moderate (1.1) for unknown stress level", () => {
      const patient = { ...basePatient, age: 5, weight: 20 };
      const unknown = calculatePediatricRequirements(patient, "enteral", "unknown");
      const moderate = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(unknown.energy).toBe(moderate.energy);
      expect(unknown.protein).toBe(moderate.protein);
    });
  });

  describe("electrolytes based on weight", () => {
    it("calculates sodium at 2.0 mEq/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.sodium).toBe(Math.round(20 * 2.0 * 10) / 10);
    });

    it("calculates potassium at 2.0 mEq/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.potassium).toBe(Math.round(20 * 2.0 * 10) / 10);
    });

    it("calculates calcium at 1.0 mEq/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.calcium).toBe(Math.round(20 * 1.0 * 10) / 10);
    });

    it("calculates magnesium at 0.4 mEq/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.magnesium).toBe(Math.round(20 * 0.4 * 10) / 10);
    });

    it("calculates phosphorus at 1.0 mEq/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.phosphorus).toBe(Math.round(20 * 1.0 * 10) / 10);
    });

    it("calculates chloride at 2.0 mEq/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.chloride).toBe(Math.round(20 * 2.0 * 10) / 10);
    });
  });

  describe("trace elements based on weight", () => {
    it("calculates iron at 0.2 mg/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.iron).toBe(Math.round(20 * 0.2 * 100) / 100);
    });

    it("calculates zinc at 0.1 mg/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.zinc).toBe(Math.round(20 * 0.1 * 100) / 100);
    });

    it("calculates copper at 0.02 mg/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.copper).toBe(Math.round(20 * 0.02 * 100) / 100);
    });

    it("calculates manganese at 0.01 mg/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.manganese).toBe(Math.round(20 * 0.01 * 100) / 100);
    });

    it("calculates iodine at 2.0 ug/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.iodine).toBe(Math.round(20 * 2.0 * 10) / 10);
    });

    it("calculates selenium at 1.5 ug/kg", () => {
      const patient = { ...basePatient, weight: 20 };
      const result = calculatePediatricRequirements(patient, "enteral", "moderate");
      expect(result.selenium).toBe(Math.round(20 * 1.5 * 10) / 10);
    });
  });

  describe("all values are positive", () => {
    it("returns all positive values for a typical pediatric patient", () => {
      const result = calculatePediatricRequirements(basePatient, "enteral", "moderate");
      for (const [key, value] of Object.entries(result)) {
        expect(value, `${key} should be positive`).toBeGreaterThan(0);
      }
    });
  });

  describe("different age categories produce different requirements", () => {
    it("preterm has higher kcal/kg than adolescent", () => {
      const preterm = {
        ...basePatient,
        age: 0,
        weight: 1.5,
        gestationalAge: 30,
      };
      const adolescent = {
        ...basePatient,
        age: 15,
        ageInMonths: 180,
        weight: 1.5, // same weight to compare per-kg
      };
      const pretermReq = calculatePediatricRequirements(preterm, "enteral", "mild");
      const adolescentReq = calculatePediatricRequirements(adolescent, "enteral", "mild");

      // preterm target 120 vs adolescent target 45
      expect(pretermReq.energy).toBeGreaterThan(adolescentReq.energy);
    });

    it("preterm has higher protein/kg than adolescent", () => {
      const preterm = {
        ...basePatient,
        age: 0,
        weight: 1.5,
        gestationalAge: 30,
      };
      const adolescent = {
        ...basePatient,
        age: 15,
        ageInMonths: 180,
        weight: 1.5,
      };
      const pretermReq = calculatePediatricRequirements(preterm, "enteral", "mild");
      const adolescentReq = calculatePediatricRequirements(adolescent, "enteral", "mild");

      // preterm protein target 4.0 vs adolescent target 1.0
      expect(pretermReq.protein).toBeGreaterThan(adolescentReq.protein);
    });
  });

  describe("electrolytes are independent of stress factor", () => {
    it("sodium is the same regardless of stress level", () => {
      const patient = { ...basePatient, weight: 20 };
      const mild = calculatePediatricRequirements(patient, "enteral", "mild");
      const critical = calculatePediatricRequirements(patient, "enteral", "critical");
      expect(mild.sodium).toBe(critical.sodium);
    });

    it("potassium is the same regardless of stress level", () => {
      const patient = { ...basePatient, weight: 20 };
      const mild = calculatePediatricRequirements(patient, "enteral", "mild");
      const critical = calculatePediatricRequirements(patient, "enteral", "critical");
      expect(mild.potassium).toBe(critical.potassium);
    });
  });

  describe("electrolytes scale linearly with weight", () => {
    it("doubling weight doubles electrolyte values", () => {
      const light = { ...basePatient, weight: 10 };
      const heavy = { ...basePatient, weight: 20 };
      const lightReq = calculatePediatricRequirements(light, "enteral", "moderate");
      const heavyReq = calculatePediatricRequirements(heavy, "enteral", "moderate");

      expect(heavyReq.sodium).toBe(lightReq.sodium * 2);
      expect(heavyReq.potassium).toBe(lightReq.potassium * 2);
      expect(heavyReq.calcium).toBe(lightReq.calcium * 2);
    });
  });
});
