import { describe, it, expect } from "vitest";
import { scoreAssessment } from "./dailyAssessmentScorer";
import type { DailyAssessment } from "../types/dailyRound";
import type { NutritionRequirements } from "../types";

function makeAssessment(
  overrides: Partial<DailyAssessment> = {},
): DailyAssessment {
  return {
    id: "test-1",
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
      enteralVolume: 1000,
      parenteralVolume: 0,
      oralVolume: 0,
      ivFluidVolume: 500,
      estimatedEnergy: 1500,
      estimatedProtein: 60,
    },
    bodyWeight: 60,
    urineOutput: 1500,
    edema: "none",
    clinicalNotes: "",
    ...overrides,
  };
}

const DEFAULT_REQUIREMENTS: NutritionRequirements = {
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

describe("scoreAssessment", () => {
  it("should return high score for healthy assessment", () => {
    const assessment = makeAssessment();
    const result = scoreAssessment(assessment, DEFAULT_REQUIREMENTS);

    expect(result.overall).toBeGreaterThanOrEqual(80);
    expect(result.riskLevel).toBe("low");
    expect(result.feedingAdjustment).toBe("advance");
    expect(result.warnings).toHaveLength(0);
  });

  it("should penalize severe vomiting and recommend hold", () => {
    const assessment = makeAssessment({
      gi: {
        gastricResidual: 600,
        gastricResidualAction: "hold",
        vomiting: "severe",
        vomitingEpisodes: 5,
        diarrhea: "none",
        abdominalDistension: "moderate",
        bowelSounds: "reduced",
        stoolCount: 0,
        stoolConsistency: "none",
        constipation: false,
      },
    });
    const result = scoreAssessment(assessment, DEFAULT_REQUIREMENTS);

    expect(result.giScore).toBeLessThan(30);
    expect(result.feedingAdjustment).toBe("hold");
    expect(result.warnings).toContain("胃残留量500mL超");
    expect(result.warnings).toContain("重度の嘔吐");
  });

  it("should penalize low energy intake", () => {
    const assessment = makeAssessment({
      actualIntake: {
        enteralVolume: 200,
        parenteralVolume: 0,
        oralVolume: 0,
        ivFluidVolume: 500,
        estimatedEnergy: 400,
        estimatedProtein: 15,
      },
    });
    const result = scoreAssessment(assessment, DEFAULT_REQUIREMENTS);

    expect(result.intakeScore).toBeLessThan(70);
    expect(result.warnings.some((w) => w.includes("エネルギー充足率"))).toBe(
      true,
    );
  });

  it("should flag critical vitals", () => {
    const assessment = makeAssessment({
      vitals: {
        temperature: 40.0,
        heartRate: 140,
        systolicBP: 80,
        diastolicBP: 40,
        respiratoryRate: 30,
        spO2: 85,
      },
      consciousness: "stupor",
    });
    const result = scoreAssessment(assessment, DEFAULT_REQUIREMENTS);

    expect(result.vitalScore).toBeLessThan(50);
    expect(result.warnings).toContain("SpO2低下(85%)");
    expect(result.warnings).toContain("高熱(40°C)");
    expect(result.warnings).toContain("昏迷状態");
  });

  it("should flag oliguria", () => {
    const assessment = makeAssessment({
      urineOutput: 300,
      bodyWeight: 60,
    });
    const result = scoreAssessment(assessment, DEFAULT_REQUIREMENTS);

    expect(result.warnings.some((w) => w.includes("乏尿"))).toBe(true);
  });

  it("should return perfect scores for null requirements", () => {
    const assessment = makeAssessment();
    const result = scoreAssessment(assessment, null);

    expect(result.intakeScore).toBe(100);
  });

  it("should flag absent bowel sounds as critical", () => {
    const assessment = makeAssessment({
      gi: {
        gastricResidual: 0,
        gastricResidualAction: "none",
        vomiting: "none",
        vomitingEpisodes: 0,
        diarrhea: "none",
        abdominalDistension: "none",
        bowelSounds: "absent",
        stoolCount: 0,
        stoolConsistency: "none",
        constipation: false,
      },
    });
    const result = scoreAssessment(assessment, DEFAULT_REQUIREMENTS);

    expect(result.warnings).toContain("腸蠕動音消失");
    expect(
      result.adjustments.some(
        (a) => a.field === "bowelSounds" && a.severity === "critical",
      ),
    ).toBe(true);
  });
});
