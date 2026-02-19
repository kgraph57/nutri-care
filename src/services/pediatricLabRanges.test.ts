import { describe, it, expect } from "vitest";
import type { Patient } from "../types";
import type { LabReference } from "../types/labData";
import { LAB_REFERENCES } from "../types/labData";
import { PEDIATRIC_LAB_REFERENCES } from "../data/pediatricLabReferences";
import { getLabReferencesForPatient } from "./pediatricLabRanges";

// ---------------------------------------------------------------------------
// Helper: base patient factories
// ---------------------------------------------------------------------------

const baseAdultPatient: Patient = {
  id: "adult-1",
  name: "成人太郎",
  age: 45,
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

const basePediatricPatient: Patient = {
  id: "ped-1",
  name: "小児花子",
  age: 5,
  gender: "女性",
  ward: "PICU",
  admissionDate: "2025-06-01",
  dischargeDate: "",
  patientType: "PICU",
  weight: 18,
  height: 110,
  diagnosis: "",
  allergies: [],
  medications: [],
  notes: "",
};

/** Helper to find a reference by key in an array of LabReference. */
function findRef(
  refs: readonly LabReference[],
  key: string,
): LabReference | undefined {
  return refs.find((r) => r.key === key);
}

// ---------------------------------------------------------------------------
// 1. Adult patients return standard LAB_REFERENCES
// ---------------------------------------------------------------------------

describe("getLabReferencesForPatient — adult patients", () => {
  it("returns standard LAB_REFERENCES for an adult patient (age >= 18, non-pediatric ward)", () => {
    const result = getLabReferencesForPatient(baseAdultPatient);
    expect(result).toBe(LAB_REFERENCES);
  });

  it("returns standard LAB_REFERENCES for exactly age 18 with non-pediatric type", () => {
    const patient: Patient = { ...baseAdultPatient, age: 18, patientType: "adult" };
    const result = getLabReferencesForPatient(patient);
    expect(result).toBe(LAB_REFERENCES);
  });

  it("returns standard LAB_REFERENCES for elderly adult", () => {
    const patient: Patient = { ...baseAdultPatient, age: 85 };
    const result = getLabReferencesForPatient(patient);
    expect(result).toBe(LAB_REFERENCES);
  });
});

// ---------------------------------------------------------------------------
// 2. Pediatric patients get pediatric overrides
// ---------------------------------------------------------------------------

describe("getLabReferencesForPatient — pediatric patients", () => {
  it("returns pediatric overrides for a child under 18", () => {
    const result = getLabReferencesForPatient(basePediatricPatient);
    // Should not be the exact same reference object as LAB_REFERENCES
    expect(result).not.toBe(LAB_REFERENCES);
  });

  it("returns the same number of references as LAB_REFERENCES", () => {
    const result = getLabReferencesForPatient(basePediatricPatient);
    expect(result).toHaveLength(LAB_REFERENCES.length);
  });

  it("overrides albumin ranges for a 5-year-old (60 months -> 小児 range)", () => {
    const patient: Patient = { ...basePediatricPatient, age: 5 };
    const result = getLabReferencesForPatient(patient);
    const albumin = findRef(result, "albumin");

    expect(albumin).toBeDefined();
    // Pediatric 小児 range: normalMin 3.5, normalMax 5.0, criticalLow 2.5
    expect(albumin!.normalMin).toBe(3.5);
    expect(albumin!.normalMax).toBe(5.0);
    expect(albumin!.criticalLow).toBe(2.5);
  });

  it("overrides creatinine ranges for a 5-year-old (60 months -> 幼児 range)", () => {
    const patient: Patient = { ...basePediatricPatient, age: 5 };
    const result = getLabReferencesForPatient(patient);
    const cr = findRef(result, "creatinine");

    expect(cr).toBeDefined();
    // Pediatric 幼児 range (12-72 months): normalMin 0.2, normalMax 0.5, criticalHigh 1.0
    expect(cr!.normalMin).toBe(0.2);
    expect(cr!.normalMax).toBe(0.5);
    expect(cr!.criticalHigh).toBe(1.0);
  });

  it("preserves section, label, and unit from pediatric definitions", () => {
    const patient: Patient = { ...basePediatricPatient, age: 5 };
    const result = getLabReferencesForPatient(patient);
    const hemoglobin = findRef(result, "hemoglobin");

    expect(hemoglobin).toBeDefined();
    expect(hemoglobin!.label).toBe("Hb");
    expect(hemoglobin!.unit).toBe("g/dL");
    expect(hemoglobin!.section).toBe("血液");
  });
});

// ---------------------------------------------------------------------------
// 3. Age-stratified ranges: neonate vs infant vs child
// ---------------------------------------------------------------------------

describe("getLabReferencesForPatient — age stratification", () => {
  it("selects neonate range for a 0-month-old (newborn)", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 0,
      ageInMonths: 0,
      patientType: "NICU",
    };
    const result = getLabReferencesForPatient(patient);
    const albumin = findRef(result, "albumin");

    // Neonate (0-1 month): normalMin 2.5, normalMax 4.5, criticalLow 2.0
    expect(albumin).toBeDefined();
    expect(albumin!.normalMin).toBe(2.5);
    expect(albumin!.normalMax).toBe(4.5);
    expect(albumin!.criticalLow).toBe(2.0);
  });

  it("selects neonate range for a half-month-old", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 0,
      ageInMonths: 0.5,
      patientType: "NICU",
    };
    const result = getLabReferencesForPatient(patient);
    const hb = findRef(result, "hemoglobin");

    // Neonate hemoglobin (0-1 month): normalMin 14.0, normalMax 22.0
    expect(hb).toBeDefined();
    expect(hb!.normalMin).toBe(14.0);
    expect(hb!.normalMax).toBe(22.0);
    expect(hb!.criticalLow).toBe(10.0);
  });

  it("selects infant range for a 6-month-old", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 0,
      ageInMonths: 6,
      patientType: "PICU",
    };
    const result = getLabReferencesForPatient(patient);

    // Albumin infant (1-12 months): normalMin 3.0, normalMax 5.0
    const albumin = findRef(result, "albumin");
    expect(albumin).toBeDefined();
    expect(albumin!.normalMin).toBe(3.0);
    expect(albumin!.normalMax).toBe(5.0);

    // Creatinine infant (1-12 months): normalMin 0.1, normalMax 0.4
    const cr = findRef(result, "creatinine");
    expect(cr).toBeDefined();
    expect(cr!.normalMin).toBe(0.1);
    expect(cr!.normalMax).toBe(0.4);

    // Hemoglobin 乳児前期 (1-6 months): NOT matched at exactly 6,
    // 乳児後期 (6-24 months): normalMin 10.5, normalMax 13.5
    const hb = findRef(result, "hemoglobin");
    expect(hb).toBeDefined();
    expect(hb!.normalMin).toBe(10.5);
    expect(hb!.normalMax).toBe(13.5);
  });

  it("selects child range for a 10-year-old (120 months)", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 10,
      patientType: "PICU",
    };
    const result = getLabReferencesForPatient(patient);

    // BUN 小児 (12-216 months): normalMin 7, normalMax 20
    const bun = findRef(result, "bun");
    expect(bun).toBeDefined();
    expect(bun!.normalMin).toBe(7);
    expect(bun!.normalMax).toBe(20);
    expect(bun!.criticalHigh).toBe(40);

    // Creatinine 学童 (72-144 months): normalMin 0.3, normalMax 0.7
    const cr = findRef(result, "creatinine");
    expect(cr).toBeDefined();
    expect(cr!.normalMin).toBe(0.3);
    expect(cr!.normalMax).toBe(0.7);

    // Hemoglobin 学童 (72-144 months): normalMin 11.5, normalMax 15.5
    const hb = findRef(result, "hemoglobin");
    expect(hb).toBeDefined();
    expect(hb!.normalMin).toBe(11.5);
    expect(hb!.normalMax).toBe(15.5);
  });

  it("selects adolescent range for a 15-year-old (180 months)", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 15,
      patientType: "PICU",
    };
    const result = getLabReferencesForPatient(patient);

    // Creatinine 思春期 (144-216 months): normalMin 0.4, normalMax 1.0
    const cr = findRef(result, "creatinine");
    expect(cr).toBeDefined();
    expect(cr!.normalMin).toBe(0.4);
    expect(cr!.normalMax).toBe(1.0);
    expect(cr!.criticalHigh).toBe(2.0);

    // Hemoglobin 思春期 (144-216 months): normalMin 12.0, normalMax 16.0
    const hb = findRef(result, "hemoglobin");
    expect(hb).toBeDefined();
    expect(hb!.normalMin).toBe(12.0);
    expect(hb!.normalMax).toBe(16.0);
  });

  it("correctly handles boundary at exactly 1 month (exclusive upper bound)", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 0,
      ageInMonths: 1,
      patientType: "NICU",
    };
    const result = getLabReferencesForPatient(patient);

    // ageInMonths = 1: neonate range is [0, 1), so 1 is NOT a neonate
    // Should fall into infant (1-12 months) for albumin
    const albumin = findRef(result, "albumin");
    expect(albumin).toBeDefined();
    expect(albumin!.normalMin).toBe(3.0); // infant range, not neonate 2.5
    expect(albumin!.normalMax).toBe(5.0);
  });

  it("correctly handles boundary at exactly 12 months", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 1,
      ageInMonths: 12,
      patientType: "PICU",
    };
    const result = getLabReferencesForPatient(patient);

    // ageInMonths = 12: infant range is [1, 12), so 12 falls into 小児 (12-216)
    const albumin = findRef(result, "albumin");
    expect(albumin).toBeDefined();
    expect(albumin!.normalMin).toBe(3.5); // 小児 range, not infant 3.0
    expect(albumin!.normalMax).toBe(5.0);
    expect(albumin!.criticalLow).toBe(2.5); // 小児 criticalLow
  });
});

// ---------------------------------------------------------------------------
// 4. Labs without pediatric data fall back to adult ranges
// ---------------------------------------------------------------------------

describe("getLabReferencesForPatient — fallback to adult ranges", () => {
  it("falls back to adult chloride range (no pediatric override)", () => {
    const result = getLabReferencesForPatient(basePediatricPatient);
    const chloride = findRef(result, "chloride");
    const adultChloride = findRef(LAB_REFERENCES, "chloride");

    expect(chloride).toBeDefined();
    expect(adultChloride).toBeDefined();
    expect(chloride).toEqual(adultChloride);
  });

  it("falls back to adult totalBilirubin range (no pediatric override)", () => {
    const result = getLabReferencesForPatient(basePediatricPatient);
    const tbil = findRef(result, "totalBilirubin");
    const adultTbil = findRef(LAB_REFERENCES, "totalBilirubin");

    expect(tbil).toBeDefined();
    expect(adultTbil).toBeDefined();
    expect(tbil).toEqual(adultTbil);
  });

  it("overrides labs that have pediatric data while keeping fallback for others", () => {
    const result = getLabReferencesForPatient(basePediatricPatient);

    // These keys exist in PEDIATRIC_LAB_REFERENCES
    const pediatricKeys = PEDIATRIC_LAB_REFERENCES.map((r) => r.key);

    // Labs not in pediatric data should exactly match adult
    for (const adultRef of LAB_REFERENCES) {
      if (!pediatricKeys.includes(adultRef.key)) {
        const resolved = findRef(result, adultRef.key);
        expect(resolved).toEqual(adultRef);
      }
    }
  });

  it("all keys from LAB_REFERENCES are present in the result", () => {
    const result = getLabReferencesForPatient(basePediatricPatient);
    const resultKeys = result.map((r) => r.key);
    const adultKeys = LAB_REFERENCES.map((r) => r.key);

    for (const key of adultKeys) {
      expect(resultKeys).toContain(key);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Edge cases
// ---------------------------------------------------------------------------

describe("getLabReferencesForPatient — edge cases", () => {
  it("uses pediatric ranges for PICU patient with age >= 18", () => {
    const patient: Patient = {
      ...baseAdultPatient,
      age: 20,
      patientType: "PICU",
    };
    const result = getLabReferencesForPatient(patient);
    // age >= 18 but patientType is PICU, so should use pediatric ranges
    expect(result).not.toBe(LAB_REFERENCES);

    // age 20 => 240 months. Pediatric ranges max out at 216.
    // No pediatric range covers 240 months, so all labs should fall back to adult.
    const albumin = findRef(result, "albumin");
    const adultAlbumin = findRef(LAB_REFERENCES, "albumin");
    expect(albumin).toEqual(adultAlbumin);
  });

  it("uses pediatric ranges for NICU patient with age >= 18", () => {
    const patient: Patient = {
      ...baseAdultPatient,
      age: 18,
      patientType: "NICU",
    };
    const result = getLabReferencesForPatient(patient);
    // patientType is NICU so should use pediatric path
    expect(result).not.toBe(LAB_REFERENCES);
  });

  it("uses pediatric ranges for 小児一般 patient type", () => {
    const patient: Patient = {
      ...baseAdultPatient,
      age: 19,
      patientType: "小児一般",
    };
    const result = getLabReferencesForPatient(patient);
    expect(result).not.toBe(LAB_REFERENCES);
  });

  it("prefers ageInMonths over age * 12 when both are available", () => {
    // age = 2 would be 24 months, but ageInMonths = 6 (infant)
    const patient: Patient = {
      ...basePediatricPatient,
      age: 2,
      ageInMonths: 6,
    };
    const result = getLabReferencesForPatient(patient);

    // If ageInMonths is used (6 months), albumin should be infant range (3.0-5.0)
    // If age*12 is used (24 months), albumin should be 小児 range (3.5-5.0)
    const albumin = findRef(result, "albumin");
    expect(albumin).toBeDefined();
    expect(albumin!.normalMin).toBe(3.0); // infant range
  });

  it("derives ageInMonths from age * 12 when ageInMonths is not set", () => {
    // age = 1, no ageInMonths => 12 months => 小児 range for albumin
    const patient: Patient = {
      ...basePediatricPatient,
      age: 1,
      ageInMonths: undefined,
    };
    const result = getLabReferencesForPatient(patient);

    const albumin = findRef(result, "albumin");
    expect(albumin).toBeDefined();
    // age * 12 = 12 months => 小児 range [12, 216): normalMin 3.5
    expect(albumin!.normalMin).toBe(3.5);
  });

  it("handles age = 0 with no ageInMonths (derives 0 months)", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 0,
      ageInMonths: undefined,
      patientType: "NICU",
    };
    const result = getLabReferencesForPatient(patient);

    // 0 * 12 = 0 months => neonate range
    const albumin = findRef(result, "albumin");
    expect(albumin).toBeDefined();
    expect(albumin!.normalMin).toBe(2.5); // neonate
  });

  it("returns result with correct structure (every entry is a valid LabReference)", () => {
    const result = getLabReferencesForPatient(basePediatricPatient);

    for (const ref of result) {
      expect(ref).toHaveProperty("key");
      expect(ref).toHaveProperty("label");
      expect(ref).toHaveProperty("unit");
      expect(ref).toHaveProperty("normalMin");
      expect(ref).toHaveProperty("normalMax");
      expect(ref).toHaveProperty("section");
      expect(typeof ref.normalMin).toBe("number");
      expect(typeof ref.normalMax).toBe("number");
      expect(ref.normalMin).toBeLessThanOrEqual(ref.normalMax);
    }
  });

  it("does not mutate the original LAB_REFERENCES", () => {
    const originalCopy = LAB_REFERENCES.map((r) => ({ ...r }));
    getLabReferencesForPatient(basePediatricPatient);

    for (let i = 0; i < LAB_REFERENCES.length; i++) {
      expect(LAB_REFERENCES[i]).toEqual(originalCopy[i]);
    }
  });

  it("does not mutate the original PEDIATRIC_LAB_REFERENCES", () => {
    const originalKeys = PEDIATRIC_LAB_REFERENCES.map((r) => r.key);
    getLabReferencesForPatient(basePediatricPatient);

    const afterKeys = PEDIATRIC_LAB_REFERENCES.map((r) => r.key);
    expect(afterKeys).toEqual(originalKeys);
  });

  it("handles age just below 18 as pediatric", () => {
    const patient: Patient = {
      ...baseAdultPatient,
      age: 17,
      patientType: "adult",
    };
    const result = getLabReferencesForPatient(patient);
    // age < 18 so should use pediatric path regardless of patientType
    expect(result).not.toBe(LAB_REFERENCES);
  });

  it("handles all pediatric labs for a neonate with correct critical values", () => {
    const patient: Patient = {
      ...basePediatricPatient,
      age: 0,
      ageInMonths: 0,
      patientType: "NICU",
    };
    const result = getLabReferencesForPatient(patient);

    // Verify specific critical values for neonates
    const potassium = findRef(result, "potassium");
    expect(potassium).toBeDefined();
    expect(potassium!.normalMin).toBe(3.5);
    expect(potassium!.normalMax).toBe(6.0);
    expect(potassium!.criticalLow).toBe(2.5);
    expect(potassium!.criticalHigh).toBe(7.0);

    const calcium = findRef(result, "calcium");
    expect(calcium).toBeDefined();
    expect(calcium!.normalMin).toBe(7.0);
    expect(calcium!.normalMax).toBe(12.0);

    const ast = findRef(result, "ast");
    expect(ast).toBeDefined();
    expect(ast!.normalMin).toBe(25);
    expect(ast!.normalMax).toBe(75);

    const bloodSugar = findRef(result, "bloodSugar");
    expect(bloodSugar).toBeDefined();
    expect(bloodSugar!.normalMin).toBe(40);
    expect(bloodSugar!.normalMax).toBe(100);
    expect(bloodSugar!.criticalLow).toBe(40);
    expect(bloodSugar!.criticalHigh).toBe(200);
  });

  it("optional criticalLow/criticalHigh are omitted when not defined in pediatric range", () => {
    // Neonate albumin has criticalLow but no criticalHigh
    const patient: Patient = {
      ...basePediatricPatient,
      age: 0,
      ageInMonths: 0,
      patientType: "NICU",
    };
    const result = getLabReferencesForPatient(patient);
    const albumin = findRef(result, "albumin");
    expect(albumin).toBeDefined();
    expect(albumin!.criticalLow).toBe(2.0);
    expect(albumin!.criticalHigh).toBeUndefined();
  });
});
