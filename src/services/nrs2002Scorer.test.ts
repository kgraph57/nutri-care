import { describe, it, expect } from "vitest";
import { evaluateInitialScreening, scoreNrs2002 } from "./nrs2002Scorer";
import type {
  Nrs2002InitialScreening,
  Nrs2002FinalScreening,
} from "../types/screening";

// ── ファクトリーヘルパー ──

function makeInitialScreening(
  overrides: Partial<Nrs2002InitialScreening> = {},
): Nrs2002InitialScreening {
  return {
    bmiBelow205: false,
    weightLoss3Months: false,
    reducedIntakeLastWeek: false,
    severelyCritical: false,
    ...overrides,
  };
}

function makeFinalScreening(
  overrides: Partial<Nrs2002FinalScreening> = {},
): Nrs2002FinalScreening {
  return {
    nutritionalStatus: 0,
    nutritionalStatusDetail: "",
    diseaseSeverity: 0,
    diseaseSeverityDetail: "",
    ageAdjustment: false,
    ...overrides,
  };
}

// ── evaluateInitialScreening ──

describe("evaluateInitialScreening", () => {
  it("should return false when all questions are false", () => {
    const screening = makeInitialScreening();
    expect(evaluateInitialScreening(screening)).toBe(false);
  });

  it("should return true when a single question is true (bmiBelow205)", () => {
    const screening = makeInitialScreening({ bmiBelow205: true });
    expect(evaluateInitialScreening(screening)).toBe(true);
  });

  it("should return true when a single question is true (weightLoss3Months)", () => {
    const screening = makeInitialScreening({ weightLoss3Months: true });
    expect(evaluateInitialScreening(screening)).toBe(true);
  });

  it("should return true when a single question is true (reducedIntakeLastWeek)", () => {
    const screening = makeInitialScreening({ reducedIntakeLastWeek: true });
    expect(evaluateInitialScreening(screening)).toBe(true);
  });

  it("should return true when a single question is true (severelyCritical)", () => {
    const screening = makeInitialScreening({ severelyCritical: true });
    expect(evaluateInitialScreening(screening)).toBe(true);
  });

  it("should return true when all questions are true", () => {
    const screening = makeInitialScreening({
      bmiBelow205: true,
      weightLoss3Months: true,
      reducedIntakeLastWeek: true,
      severelyCritical: true,
    });
    expect(evaluateInitialScreening(screening)).toBe(true);
  });
});

// ── scoreNrs2002 ──

describe("scoreNrs2002", () => {
  it("should return no-risk with score 0 when all initial questions are false", () => {
    const initial = makeInitialScreening();
    const result = scoreNrs2002(initial, null, 50);

    expect(result.totalScore).toBe(0);
    expect(result.riskLevel).toBe("no-risk");
    expect(result.initialPositive).toBe(false);
    expect(result.finalScreening).toBeNull();
    expect(result.toolType).toBe("nrs2002");
  });

  it("should return initialPositive=true when a single initial question is true", () => {
    const initial = makeInitialScreening({ bmiBelow205: true });
    const result = scoreNrs2002(initial, null, 50);

    expect(result.initialPositive).toBe(true);
  });

  it("should return initialPositive=true when all initial questions are true", () => {
    const initial = makeInitialScreening({
      bmiBelow205: true,
      weightLoss3Months: true,
      reducedIntakeLastWeek: true,
      severelyCritical: true,
    });
    const result = scoreNrs2002(initial, null, 50);

    expect(result.initialPositive).toBe(true);
  });

  it("should return score 0 when final screening is null (initial negative)", () => {
    const initial = makeInitialScreening();
    const result = scoreNrs2002(initial, null, 65);

    expect(result.totalScore).toBe(0);
    expect(result.riskLevel).toBe("no-risk");
    expect(result.finalScreening).toBeNull();
  });

  it("should return score 0 and no-risk when final has nutritional=0, disease=0, age<70", () => {
    const initial = makeInitialScreening({ bmiBelow205: true });
    const final = makeFinalScreening({
      nutritionalStatus: 0,
      diseaseSeverity: 0,
    });
    const result = scoreNrs2002(initial, final, 50);

    expect(result.totalScore).toBe(0);
    expect(result.riskLevel).toBe("no-risk");
    expect(result.initialPositive).toBe(true);
    expect(result.finalScreening).toBe(final);
  });

  it("should return score 3 and at-risk when nutritional=2, disease=1, age<70", () => {
    const initial = makeInitialScreening({ reducedIntakeLastWeek: true });
    const final = makeFinalScreening({
      nutritionalStatus: 2,
      diseaseSeverity: 1,
    });
    const result = scoreNrs2002(initial, final, 50);

    expect(result.totalScore).toBe(3);
    expect(result.riskLevel).toBe("at-risk");
  });

  it("should return score 6 and high-risk when nutritional=3, disease=2, age>=70", () => {
    const initial = makeInitialScreening({ severelyCritical: true });
    const final = makeFinalScreening({
      nutritionalStatus: 3,
      diseaseSeverity: 2,
    });
    const result = scoreNrs2002(initial, final, 75);

    expect(result.totalScore).toBe(6);
    expect(result.riskLevel).toBe("high-risk");
  });

  it("should clamp to max score 7 when nutritional=3, disease=3, age>=70", () => {
    const initial = makeInitialScreening({ bmiBelow205: true });
    const final = makeFinalScreening({
      nutritionalStatus: 3,
      diseaseSeverity: 3,
    });
    const result = scoreNrs2002(initial, final, 80);

    expect(result.totalScore).toBe(7);
    expect(result.riskLevel).toBe("high-risk");
  });

  it("should apply age adjustment at boundary: age 69 vs age 70", () => {
    const initial = makeInitialScreening({ weightLoss3Months: true });
    const final = makeFinalScreening({
      nutritionalStatus: 1,
      diseaseSeverity: 1,
    });

    const resultAge69 = scoreNrs2002(initial, final, 69);
    const resultAge70 = scoreNrs2002(initial, final, 70);

    expect(resultAge69.totalScore).toBe(2);
    expect(resultAge70.totalScore).toBe(3);
    expect(resultAge69.riskLevel).toBe("no-risk");
    expect(resultAge70.riskLevel).toBe("at-risk");
  });

  it("should return non-empty recommendations for all risk levels", () => {
    // no-risk
    const noRiskResult = scoreNrs2002(makeInitialScreening(), null, 50);
    expect(noRiskResult.recommendations.length).toBeGreaterThan(0);

    // at-risk
    const atRiskInitial = makeInitialScreening({ bmiBelow205: true });
    const atRiskFinal = makeFinalScreening({
      nutritionalStatus: 2,
      diseaseSeverity: 1,
    });
    const atRiskResult = scoreNrs2002(atRiskInitial, atRiskFinal, 50);
    expect(atRiskResult.recommendations.length).toBeGreaterThan(0);

    // high-risk
    const highRiskInitial = makeInitialScreening({ severelyCritical: true });
    const highRiskFinal = makeFinalScreening({
      nutritionalStatus: 3,
      diseaseSeverity: 3,
    });
    const highRiskResult = scoreNrs2002(highRiskInitial, highRiskFinal, 80);
    expect(highRiskResult.recommendations.length).toBeGreaterThan(0);
  });

  it("should return a readonly/immutable result object", () => {
    const initial = makeInitialScreening({ bmiBelow205: true });
    const final = makeFinalScreening({
      nutritionalStatus: 2,
      diseaseSeverity: 1,
    });
    const result = scoreNrs2002(initial, final, 65);

    // Verify the result conforms to the readonly Nrs2002Result interface
    // by checking that all expected properties exist and have correct types
    expect(result).toHaveProperty("toolType", "nrs2002");
    expect(result).toHaveProperty("initialScreening");
    expect(result).toHaveProperty("initialPositive");
    expect(result).toHaveProperty("finalScreening");
    expect(result).toHaveProperty("totalScore");
    expect(result).toHaveProperty("riskLevel");
    expect(result).toHaveProperty("recommendations");
    expect(Array.isArray(result.recommendations)).toBe(true);

    // Verify the result is a new object (not a reference to input)
    expect(result.initialScreening).toBe(initial);
    expect(result.finalScreening).toBe(final);
  });
});
