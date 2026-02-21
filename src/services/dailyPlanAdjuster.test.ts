import { describe, it, expect } from "vitest";
import { generateAdjustedPlan } from "./dailyPlanAdjuster";
import type {
  DailyAssessment,
  AdjustedPlan,
} from "../types/dailyRound";
import type { NutritionRequirements } from "../types";

function makeAssessment(
  overrides: Partial<DailyAssessment> = {},
): DailyAssessment {
  return {
    id: "a-1",
    patientId: "p-1",
    date: "2026-02-22",
    time: "09:00",
    vitals: {
      temperature: 36.5,
      heartRate: 80,
      systolicBP: 120,
      diastolicBP: 70,
      respiratoryRate: 16,
      spO2: 98,
    },
    consciousness: "alert",
    respiratoryStatus: "room-air",
    gi: {
      gastricResidual: 0,
      gastricResidualAction: "none",
      vomiting: "none",
      vomitingEpisodes: 0,
      diarrhea: "none",
      abdominalDistension: "none",
      bowelSounds: "present",
      stoolCount: 1,
      stoolConsistency: "formed",
      constipation: false,
    },
    actualIntake: {
      enteralVolume: 800,
      parenteralVolume: 0,
      oralVolume: 0,
      ivFluidVolume: 500,
      estimatedEnergy: 1000,
      estimatedProtein: 40,
    },
    bodyWeight: 60,
    urineOutput: 1500,
    edema: "none",
    clinicalNotes: "",
    ...overrides,
  };
}

const REQUIREMENTS: NutritionRequirements = {
  energy: 1600,
  protein: 72,
  fat: 53,
  carbs: 200,
  sodium: 80,
  potassium: 60,
  calcium: 10,
  magnesium: 10,
  phosphorus: 15,
  chloride: 80,
  iron: 10,
  zinc: 10,
  copper: 1,
  manganese: 3,
  iodine: 130,
  selenium: 50,
};

const PREVIOUS_PLAN: AdjustedPlan = {
  nutritionType: "enteral",
  items: [
    {
      productName: "エンシュアH",
      productKey: "ensure-h",
      volume: 250,
      frequency: 3,
      rationale: "標準経腸栄養",
    },
  ],
  totalEnergy: 1000,
  totalProtein: 40,
  totalVolume: 750,
  requirements: REQUIREMENTS,
  feedingAdjustment: "maintain",
  adjustments: [],
  overallRationale: "",
  warnings: [],
};

describe("generateAdjustedPlan", () => {
  it("should generate a plan with score when no previous plan", () => {
    const assessment = makeAssessment();
    const { plan, score } = generateAdjustedPlan(
      assessment,
      null,
      REQUIREMENTS,
    );

    expect(plan.nutritionType).toBe("enteral");
    expect(plan.totalEnergy).toBeGreaterThan(0);
    expect(plan.requirements).toBe(REQUIREMENTS);
    expect(score.overall).toBeGreaterThan(0);
  });

  it("should scale up when tolerance is good and intake is low", () => {
    const assessment = makeAssessment();
    const { plan } = generateAdjustedPlan(
      assessment,
      PREVIOUS_PLAN,
      REQUIREMENTS,
    );

    // Tolerance is good (GI is perfect), energy ratio is 1000/1600 = 62.5%
    // Should recommend advance and increase
    expect(plan.feedingAdjustment).toBe("advance");
    expect(plan.totalEnergy).toBeGreaterThan(PREVIOUS_PLAN.totalEnergy);
  });

  it("should scale down when GI tolerance is poor", () => {
    const assessment = makeAssessment({
      gi: {
        gastricResidual: 600,
        gastricResidualAction: "hold",
        vomiting: "severe",
        vomitingEpisodes: 3,
        diarrhea: "moderate",
        abdominalDistension: "severe",
        bowelSounds: "absent",
        stoolCount: 0,
        stoolConsistency: "none",
        constipation: false,
      },
    });
    const { plan } = generateAdjustedPlan(
      assessment,
      PREVIOUS_PLAN,
      REQUIREMENTS,
    );

    expect(plan.feedingAdjustment).toBe("hold");
    expect(plan.totalEnergy).toBe(0);
    expect(plan.totalVolume).toBe(0);
  });

  it("should preserve nutritionType from previous plan", () => {
    const prevParenteral: AdjustedPlan = {
      ...PREVIOUS_PLAN,
      nutritionType: "parenteral",
    };
    const assessment = makeAssessment();
    const { plan } = generateAdjustedPlan(
      assessment,
      prevParenteral,
      REQUIREMENTS,
    );

    expect(plan.nutritionType).toBe("parenteral");
  });

  it("should include warnings from scorer", () => {
    const assessment = makeAssessment({
      vitals: {
        temperature: 36.5,
        heartRate: 80,
        systolicBP: 120,
        diastolicBP: 70,
        respiratoryRate: 16,
        spO2: 88,
      },
    });
    const { plan } = generateAdjustedPlan(
      assessment,
      PREVIOUS_PLAN,
      REQUIREMENTS,
    );

    expect(plan.warnings.some((w) => w.includes("SpO2"))).toBe(true);
  });

  it("should not exceed 110% of energy requirement", () => {
    const highIntake = makeAssessment({
      actualIntake: {
        enteralVolume: 2000,
        parenteralVolume: 0,
        oralVolume: 0,
        ivFluidVolume: 500,
        estimatedEnergy: 1800,
        estimatedProtein: 80,
      },
    });
    const highPrev: AdjustedPlan = {
      ...PREVIOUS_PLAN,
      totalEnergy: 2000,
      totalProtein: 90,
    };
    const { plan } = generateAdjustedPlan(
      highIntake,
      highPrev,
      REQUIREMENTS,
    );

    expect(plan.totalEnergy).toBeLessThanOrEqual(
      Math.round(REQUIREMENTS.energy * 1.1),
    );
  });
});
