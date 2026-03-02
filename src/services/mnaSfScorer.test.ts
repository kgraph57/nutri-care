import { describe, it, expect } from "vitest";
import {
  scoreMnaSf,
  calculateBmiScore,
  calculateCalfScore,
} from "./mnaSfScorer";
import type { MnaSfData } from "../types/screening";

function makeMnaSfData(overrides: Partial<MnaSfData> = {}): MnaSfData {
  return {
    foodIntakeDecline: 2,
    weightLoss: 3,
    mobility: 2,
    psychologicalStress: 2,
    neuropsychological: 2,
    bmiOrCalf: 3,
    usedCalfCircumference: false,
    ...overrides,
  };
}

describe("scoreMnaSf", () => {
  it("should return normal for all max scores (14)", () => {
    const data = makeMnaSfData();
    const result = scoreMnaSf(data);

    expect(result.totalScore).toBe(14);
    expect(result.riskLevel).toBe("normal");
    expect(result.toolType).toBe("mna-sf");
  });

  it("should return normal at boundary score 12", () => {
    const data = makeMnaSfData({
      foodIntakeDecline: 1,
      weightLoss: 2,
      mobility: 2,
      psychologicalStress: 2,
      neuropsychological: 2,
      bmiOrCalf: 3,
    });
    const result = scoreMnaSf(data);

    expect(result.totalScore).toBe(12);
    expect(result.riskLevel).toBe("normal");
  });

  it("should return at-risk for score 11", () => {
    const data = makeMnaSfData({
      foodIntakeDecline: 1,
      weightLoss: 2,
      mobility: 2,
      psychologicalStress: 2,
      neuropsychological: 1,
      bmiOrCalf: 3,
    });
    const result = scoreMnaSf(data);

    expect(result.totalScore).toBe(11);
    expect(result.riskLevel).toBe("at-risk");
  });

  it("should return at-risk at boundary score 8", () => {
    const data = makeMnaSfData({
      foodIntakeDecline: 1,
      weightLoss: 1,
      mobility: 1,
      psychologicalStress: 2,
      neuropsychological: 1,
      bmiOrCalf: 2,
    });
    const result = scoreMnaSf(data);

    expect(result.totalScore).toBe(8);
    expect(result.riskLevel).toBe("at-risk");
  });

  it("should return malnourished at boundary score 7", () => {
    const data = makeMnaSfData({
      foodIntakeDecline: 1,
      weightLoss: 1,
      mobility: 1,
      psychologicalStress: 2,
      neuropsychological: 1,
      bmiOrCalf: 1,
    });
    const result = scoreMnaSf(data);

    expect(result.totalScore).toBe(7);
    expect(result.riskLevel).toBe("malnourished");
  });

  it("should return malnourished for all zeros (0)", () => {
    const data = makeMnaSfData({
      foodIntakeDecline: 0,
      weightLoss: 0,
      mobility: 0,
      psychologicalStress: 0,
      neuropsychological: 0,
      bmiOrCalf: 0,
    });
    const result = scoreMnaSf(data);

    expect(result.totalScore).toBe(0);
    expect(result.riskLevel).toBe("malnourished");
  });

  it("should return non-empty recommendations for all risk levels", () => {
    const normalResult = scoreMnaSf(makeMnaSfData());
    expect(normalResult.recommendations.length).toBeGreaterThan(0);

    const atRiskResult = scoreMnaSf(
      makeMnaSfData({
        foodIntakeDecline: 1,
        weightLoss: 2,
        mobility: 2,
        psychologicalStress: 2,
        neuropsychological: 1,
        bmiOrCalf: 3,
      }),
    );
    expect(atRiskResult.recommendations.length).toBeGreaterThan(0);

    const malnourishedResult = scoreMnaSf(
      makeMnaSfData({
        foodIntakeDecline: 0,
        weightLoss: 0,
        mobility: 0,
        psychologicalStress: 0,
        neuropsychological: 0,
        bmiOrCalf: 0,
      }),
    );
    expect(malnourishedResult.recommendations.length).toBeGreaterThan(0);
  });

  it("should classify mixed realistic scenario as at-risk", () => {
    const data = makeMnaSfData({
      foodIntakeDecline: 1, // moderate decline
      weightLoss: 2,       // 1-3 kg loss
      mobility: 2,         // goes out
      psychologicalStress: 0, // has stress
      neuropsychological: 2, // no problems
      bmiOrCalf: 2,        // BMI 21-23
    });
    const result = scoreMnaSf(data);

    expect(result.totalScore).toBe(9);
    expect(result.riskLevel).toBe("at-risk");
  });
});

describe("calculateBmiScore", () => {
  it("should return correct scores for BMI values", () => {
    expect(calculateBmiScore(18)).toBe(0);
    expect(calculateBmiScore(19)).toBe(1);
    expect(calculateBmiScore(20)).toBe(1);
    expect(calculateBmiScore(21)).toBe(2);
    expect(calculateBmiScore(22)).toBe(2);
    expect(calculateBmiScore(23)).toBe(3);
    expect(calculateBmiScore(30)).toBe(3);
  });
});

describe("calculateCalfScore", () => {
  it("should return correct scores for calf circumference values", () => {
    expect(calculateCalfScore(30)).toBe(0);
    expect(calculateCalfScore(31)).toBe(3);
    expect(calculateCalfScore(35)).toBe(3);
  });
});
