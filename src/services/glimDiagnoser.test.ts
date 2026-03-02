import { describe, it, expect } from "vitest";
import type {
  GlimPhenotypicCriteria,
  GlimEtiologicCriteria,
} from "../types/screening";
import {
  hasPhenotypicCriteria,
  hasEtiologicCriteria,
  determineSeverity,
  diagnoseGlim,
} from "./glimDiagnoser";

// ── ファクトリーヘルパー ──

function makePhenotypic(
  overrides: Partial<GlimPhenotypicCriteria> = {},
): GlimPhenotypicCriteria {
  return {
    unintentionalWeightLoss: false,
    weightLossPercentage: 0,
    weightLossTimeframe: "none",
    lowBmi: false,
    bmiValue: 22.0,
    reducedMuscleMass: false,
    muscleMassMethod: "",
    ...overrides,
  };
}

function makeEtiologic(
  overrides: Partial<GlimEtiologicCriteria> = {},
): GlimEtiologicCriteria {
  return {
    reducedFoodIntake: false,
    intakeReductionPercentage: 0,
    intakeReductionDuration: "",
    malabsorption: false,
    inflammation: false,
    inflammationEvidence: "",
    ...overrides,
  };
}

// ── テスト ──

describe("glimDiagnoser", () => {
  // 1. 基準を満たさない → 診断なし
  it("returns not diagnosed with severity none when no criteria met", () => {
    const result = diagnoseGlim(makePhenotypic(), makeEtiologic(), 60);

    expect(result.diagnosed).toBe(false);
    expect(result.severity).toBe("none");
    expect(result.phenotypicMet).toBe(false);
    expect(result.etiologicMet).toBe(false);
  });

  // 2. 表現型のみ（体重減少8%）→ 診断なし
  it("returns not diagnosed when only phenotypic criteria met (weight loss 8%)", () => {
    const phenotypic = makePhenotypic({
      unintentionalWeightLoss: true,
      weightLossPercentage: 8,
      weightLossTimeframe: "6months",
    });
    const result = diagnoseGlim(phenotypic, makeEtiologic(), 60);

    expect(result.phenotypicMet).toBe(true);
    expect(result.etiologicMet).toBe(false);
    expect(result.diagnosed).toBe(false);
  });

  // 3. 病因型のみ（食事摂取減少）→ 診断なし
  it("returns not diagnosed when only etiologic criteria met (reduced intake)", () => {
    const etiologic = makeEtiologic({
      reducedFoodIntake: true,
      intakeReductionPercentage: 50,
      intakeReductionDuration: "1week",
    });
    const result = diagnoseGlim(makePhenotypic(), etiologic, 60);

    expect(result.phenotypicMet).toBe(false);
    expect(result.etiologicMet).toBe(true);
    expect(result.diagnosed).toBe(false);
  });

  // 4. 両方満たす（体重減少 + 食事摂取減少）→ 診断あり
  it("returns diagnosed when both phenotypic and etiologic criteria met", () => {
    const phenotypic = makePhenotypic({
      unintentionalWeightLoss: true,
      weightLossPercentage: 6,
      weightLossTimeframe: "6months",
    });
    const etiologic = makeEtiologic({
      reducedFoodIntake: true,
      intakeReductionPercentage: 50,
      intakeReductionDuration: "1week",
    });
    const result = diagnoseGlim(phenotypic, etiologic, 60);

    expect(result.diagnosed).toBe(true);
    expect(result.phenotypicMet).toBe(true);
    expect(result.etiologicMet).toBe(true);
  });

  // 5. Stage 1: 7% 体重減少 6ヶ月以内 + 食事摂取減少
  it("assigns stage1 for 7% weight loss within 6 months with reduced intake", () => {
    const phenotypic = makePhenotypic({
      unintentionalWeightLoss: true,
      weightLossPercentage: 7,
      weightLossTimeframe: "6months",
    });
    const etiologic = makeEtiologic({
      reducedFoodIntake: true,
      intakeReductionPercentage: 50,
      intakeReductionDuration: "1week",
    });
    const result = diagnoseGlim(phenotypic, etiologic, 60);

    expect(result.diagnosed).toBe(true);
    expect(result.severity).toBe("stage1");
  });

  // 6. Stage 2: 15% 体重減少 6ヶ月以内 + 炎症
  it("assigns stage2 for 15% weight loss within 6 months with inflammation", () => {
    const phenotypic = makePhenotypic({
      unintentionalWeightLoss: true,
      weightLossPercentage: 15,
      weightLossTimeframe: "6months",
    });
    const etiologic = makeEtiologic({
      inflammation: true,
      inflammationEvidence: "CRP 12.5 mg/dL",
    });
    const result = diagnoseGlim(phenotypic, etiologic, 60);

    expect(result.diagnosed).toBe(true);
    expect(result.severity).toBe("stage2");
  });

  // 7. アジアBMI基準: 65歳, BMI 19.0 → low BMI 検出 → 表現型基準を満たす
  it("detects low BMI for age 65 with BMI 19.0 (Asian cutoff)", () => {
    const phenotypic = makePhenotypic({
      lowBmi: true,
      bmiValue: 19.0,
    });

    expect(hasPhenotypicCriteria(phenotypic)).toBe(true);

    const etiologic = makeEtiologic({
      reducedFoodIntake: true,
      intakeReductionPercentage: 50,
      intakeReductionDuration: "1week",
    });
    const result = diagnoseGlim(phenotypic, etiologic, 65);

    expect(result.diagnosed).toBe(true);
    // BMI 19.0 for age <70: stage1 (18.5 <= 19.0 < 20.0)
    expect(result.severity).toBe("stage1");
  });

  // 8. アジアBMI基準: 72歳, BMI 19.5 → 70歳以上の低BMI → 表現型基準を満たす
  it("detects low BMI for age 72 with BMI 19.5 (>=70 Asian cutoff)", () => {
    const phenotypic = makePhenotypic({
      lowBmi: true,
      bmiValue: 19.5,
    });

    expect(hasPhenotypicCriteria(phenotypic)).toBe(true);

    const etiologic = makeEtiologic({
      malabsorption: true,
    });
    const result = diagnoseGlim(phenotypic, etiologic, 72);

    expect(result.diagnosed).toBe(true);
    // BMI 19.5 for age >=70: stage2 (19.5 < 20.0)
    expect(result.severity).toBe("stage2");
  });

  // 9. アジアBMI基準: 65歳, BMI 21.0 → 低BMIではない → BMI単独では表現型基準を満たさない
  it("does not detect low BMI for age 65 with BMI 21.0", () => {
    const phenotypic = makePhenotypic({
      lowBmi: false,
      bmiValue: 21.0,
    });

    expect(hasPhenotypicCriteria(phenotypic)).toBe(false);
  });

  // 10. 6ヶ月超の体重減少: 12% → stage1, 22% → stage2
  describe("weight loss beyond 6 months", () => {
    it("assigns stage1 for 12% weight loss beyond 6 months", () => {
      const phenotypic = makePhenotypic({
        unintentionalWeightLoss: true,
        weightLossPercentage: 12,
        weightLossTimeframe: "6monthsPlus",
      });
      const etiologic = makeEtiologic({
        inflammation: true,
        inflammationEvidence: "急性疾患",
      });
      const result = diagnoseGlim(phenotypic, etiologic, 60);

      expect(result.diagnosed).toBe(true);
      expect(result.severity).toBe("stage1");
    });

    it("assigns stage2 for 22% weight loss beyond 6 months", () => {
      const phenotypic = makePhenotypic({
        unintentionalWeightLoss: true,
        weightLossPercentage: 22,
        weightLossTimeframe: "6monthsPlus",
      });
      const etiologic = makeEtiologic({
        inflammation: true,
        inflammationEvidence: "CRP高値",
      });
      const result = diagnoseGlim(phenotypic, etiologic, 60);

      expect(result.diagnosed).toBe(true);
      expect(result.severity).toBe("stage2");
    });
  });

  // 11. 筋肉量低下のみが表現型基準 → 病因型基準と合わせて診断あり
  it("diagnoses when muscle mass reduction is the only phenotypic criterion paired with etiologic", () => {
    const phenotypic = makePhenotypic({
      reducedMuscleMass: true,
      muscleMassMethod: "BIA",
    });
    const etiologic = makeEtiologic({
      reducedFoodIntake: true,
      intakeReductionPercentage: 40,
      intakeReductionDuration: "2weeks",
    });
    const result = diagnoseGlim(phenotypic, etiologic, 60);

    expect(result.diagnosed).toBe(true);
    expect(result.phenotypicMet).toBe(true);
    expect(result.severity).toBe("stage1");
  });

  // 12. 推奨事項が空でないことを確認
  describe("recommendations", () => {
    it("returns non-empty recommendations when diagnosed stage2", () => {
      const phenotypic = makePhenotypic({
        unintentionalWeightLoss: true,
        weightLossPercentage: 15,
        weightLossTimeframe: "6months",
      });
      const etiologic = makeEtiologic({ inflammation: true });
      const result = diagnoseGlim(phenotypic, etiologic, 60);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain("直ちに積極的栄養介入が必要");
    });

    it("returns non-empty recommendations when diagnosed stage1", () => {
      const phenotypic = makePhenotypic({
        unintentionalWeightLoss: true,
        weightLossPercentage: 7,
        weightLossTimeframe: "6months",
      });
      const etiologic = makeEtiologic({ reducedFoodIntake: true });
      const result = diagnoseGlim(phenotypic, etiologic, 60);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain("栄養介入の開始を推奨");
    });

    it("returns non-empty recommendations when not diagnosed", () => {
      const result = diagnoseGlim(makePhenotypic(), makeEtiologic(), 60);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain(
        "現時点では低栄養の診断基準を満たしません",
      );
    });
  });

  // 13. 不変性チェック: 入力オブジェクトが変更されないこと
  it("does not mutate input objects", () => {
    const phenotypic = makePhenotypic({
      unintentionalWeightLoss: true,
      weightLossPercentage: 8,
      weightLossTimeframe: "6months",
    });
    const etiologic = makeEtiologic({
      reducedFoodIntake: true,
      intakeReductionPercentage: 50,
      intakeReductionDuration: "1week",
    });

    const phenotypicSnapshot = JSON.stringify(phenotypic);
    const etiologicSnapshot = JSON.stringify(etiologic);

    diagnoseGlim(phenotypic, etiologic, 60);

    expect(JSON.stringify(phenotypic)).toBe(phenotypicSnapshot);
    expect(JSON.stringify(etiologic)).toBe(etiologicSnapshot);
  });
});

describe("hasPhenotypicCriteria", () => {
  it("returns false when no phenotypic criteria set", () => {
    expect(hasPhenotypicCriteria(makePhenotypic())).toBe(false);
  });

  it("returns true for weight loss alone", () => {
    expect(
      hasPhenotypicCriteria(
        makePhenotypic({ unintentionalWeightLoss: true }),
      ),
    ).toBe(true);
  });

  it("returns true for low BMI alone", () => {
    expect(
      hasPhenotypicCriteria(makePhenotypic({ lowBmi: true })),
    ).toBe(true);
  });

  it("returns true for reduced muscle mass alone", () => {
    expect(
      hasPhenotypicCriteria(makePhenotypic({ reducedMuscleMass: true })),
    ).toBe(true);
  });
});

describe("hasEtiologicCriteria", () => {
  it("returns false when no etiologic criteria set", () => {
    expect(hasEtiologicCriteria(makeEtiologic())).toBe(false);
  });

  it("returns true for reduced food intake", () => {
    expect(
      hasEtiologicCriteria(makeEtiologic({ reducedFoodIntake: true })),
    ).toBe(true);
  });

  it("returns true for malabsorption", () => {
    expect(
      hasEtiologicCriteria(makeEtiologic({ malabsorption: true })),
    ).toBe(true);
  });

  it("returns true for inflammation", () => {
    expect(
      hasEtiologicCriteria(makeEtiologic({ inflammation: true })),
    ).toBe(true);
  });
});

describe("determineSeverity", () => {
  it("returns none when no phenotypic criteria active", () => {
    expect(determineSeverity(makePhenotypic(), 60)).toBe("none");
  });

  it("returns stage1 for 5% weight loss in 6 months", () => {
    const p = makePhenotypic({
      unintentionalWeightLoss: true,
      weightLossPercentage: 5,
      weightLossTimeframe: "6months",
    });
    expect(determineSeverity(p, 60)).toBe("stage1");
  });

  it("returns stage2 for BMI 17.5 at age 60", () => {
    const p = makePhenotypic({
      lowBmi: true,
      bmiValue: 17.5,
    });
    expect(determineSeverity(p, 60)).toBe("stage2");
  });

  it("returns the higher severity when multiple phenotypic criteria present", () => {
    const p = makePhenotypic({
      unintentionalWeightLoss: true,
      weightLossPercentage: 6, // stage1 by weight loss
      weightLossTimeframe: "6months",
      lowBmi: true,
      bmiValue: 17.0, // stage2 by BMI (<18.5 for <70)
    });
    expect(determineSeverity(p, 60)).toBe("stage2");
  });
});
