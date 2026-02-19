import { describe, it, expect } from "vitest";
import type { LMSParams } from "../types/growthData";
import {
  calculateZScore,
  zScoreToPercentile,
  getLMSForAge,
  computeGrowthPercentile,
  generateReferenceCurve,
  selectDataSet,
} from "./growthPercentile";

// ---- Test fixtures ----

const standardLMS: LMSParams = {
  age: 12,
  L: 0.0220,
  M: 9.8710,
  S: 0.10376,
};

const lmsWithLZero: LMSParams = {
  age: 6,
  L: 0,
  M: 67.6236,
  S: 0.03168,
};

const lmsWithLNearZero: LMSParams = {
  age: 6,
  L: 1e-12,
  M: 67.6236,
  S: 0.03168,
};

const sampleLMSData: readonly LMSParams[] = [
  { age: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { age: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { age: 6, L: 0.1195, M: 7.9340, S: 0.10876 },
  { age: 12, L: 0.0220, M: 9.8710, S: 0.10376 },
  { age: 24, L: -0.1070, M: 12.1515, S: 0.10415 },
] as const;

// ---- calculateZScore ----

describe("calculateZScore", () => {
  it("returns 0 when value equals the median (M)", () => {
    // When value = M, ratio = 1, so (1^L - 1) / (L*S) = 0
    const z = calculateZScore(standardLMS.M, standardLMS);
    expect(z).toBeCloseTo(0, 2);
  });

  it("returns a positive Z-score for value above the median", () => {
    const z = calculateZScore(12.0, standardLMS);
    expect(z).toBeGreaterThan(0);
  });

  it("returns a negative Z-score for value below the median", () => {
    const z = calculateZScore(8.0, standardLMS);
    expect(z).toBeLessThan(0);
  });

  it("calculates correct Z-score with known LMS values (L != 0)", () => {
    // Manual calculation: value=11, M=9.871, L=0.022, S=0.10376
    // ratio = 11 / 9.871 = 1.11437...
    // Z = (ratio^L - 1) / (L * S) = (1.11437^0.022 - 1) / (0.022 * 0.10376)
    const value = 11;
    const ratio = value / standardLMS.M;
    const expected =
      (Math.pow(ratio, standardLMS.L) - 1) / (standardLMS.L * standardLMS.S);
    const z = calculateZScore(value, standardLMS);
    expect(z).toBeCloseTo(expected, 2);
  });

  it("uses ln formula when L is exactly 0", () => {
    // When L == 0: Z = ln(value/M) / S
    const value = 70.0;
    const expected = Math.log(value / lmsWithLZero.M) / lmsWithLZero.S;
    const z = calculateZScore(value, lmsWithLZero);
    expect(z).toBeCloseTo(expected, 2);
  });

  it("uses ln formula when L is near zero (within 1e-10)", () => {
    const value = 70.0;
    const expected = Math.log(value / lmsWithLNearZero.M) / lmsWithLNearZero.S;
    const z = calculateZScore(value, lmsWithLNearZero);
    expect(z).toBeCloseTo(expected, 2);
  });

  it("clamps Z-score to 3.5 for extremely high values", () => {
    // A very large value should produce a raw Z > 3.5, which is clamped
    const extremeValue = 30;
    const z = calculateZScore(extremeValue, standardLMS);
    expect(z).toBeLessThanOrEqual(3.5);
  });

  it("clamps Z-score to -3.5 for extremely low values", () => {
    // A very small value should produce a raw Z < -3.5, which is clamped
    const extremeValue = 3;
    const z = calculateZScore(extremeValue, standardLMS);
    expect(z).toBeGreaterThanOrEqual(-3.5);
  });

  it("returns exactly 3.5 when clamped at upper bound", () => {
    // Force a raw Z > 3.5 with a very large value relative to M
    const veryLargeValue = 50;
    const z = calculateZScore(veryLargeValue, standardLMS);
    expect(z).toBe(3.5);
  });

  it("returns exactly -3.5 when clamped at lower bound", () => {
    // Force a raw Z < -3.5 with a very small value relative to M
    const verySmallValue = 2;
    const z = calculateZScore(verySmallValue, standardLMS);
    expect(z).toBe(-3.5);
  });

  it("rounds Z-score to 2 decimal places", () => {
    const z = calculateZScore(10.5, standardLMS);
    const decimalPlaces = z.toString().split(".")[1]?.length ?? 0;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it("throws for value <= 0", () => {
    expect(() => calculateZScore(0, standardLMS)).toThrow("Invalid input");
    expect(() => calculateZScore(-1, standardLMS)).toThrow("Invalid input");
  });

  it("throws for M <= 0", () => {
    const badLMS: LMSParams = { age: 0, L: 1, M: 0, S: 0.1 };
    expect(() => calculateZScore(5, badLMS)).toThrow("Invalid input");
  });

  it("throws for S <= 0", () => {
    const badLMS: LMSParams = { age: 0, L: 1, M: 10, S: 0 };
    expect(() => calculateZScore(5, badLMS)).toThrow("Invalid input");
    const negativeSLMS: LMSParams = { age: 0, L: 1, M: 10, S: -0.1 };
    expect(() => calculateZScore(5, negativeSLMS)).toThrow("Invalid input");
  });

  it("handles negative L values correctly", () => {
    const negativeLLMS: LMSParams = { age: 24, L: -0.107, M: 12.1515, S: 0.10415 };
    const z = calculateZScore(12.1515, negativeLLMS);
    expect(z).toBeCloseTo(0, 2);
  });
});

// ---- zScoreToPercentile ----

describe("zScoreToPercentile", () => {
  it("returns 50 for Z-score of 0 (50th percentile)", () => {
    const p = zScoreToPercentile(0);
    expect(p).toBe(50);
  });

  it("returns approximately 2.5 for Z-score of -1.96", () => {
    const p = zScoreToPercentile(-1.96);
    expect(p).toBeCloseTo(2.5, 0);
  });

  it("returns approximately 97.5 for Z-score of 1.96", () => {
    const p = zScoreToPercentile(1.96);
    expect(p).toBeCloseTo(97.5, 0);
  });

  it("returns approximately 84.1 for Z-score of 1.0", () => {
    const p = zScoreToPercentile(1.0);
    expect(p).toBeCloseTo(84.1, 0);
  });

  it("returns approximately 15.9 for Z-score of -1.0", () => {
    const p = zScoreToPercentile(-1.0);
    expect(p).toBeCloseTo(15.9, 0);
  });

  it("returns approximately 0.1 for Z-score of -3.0", () => {
    const p = zScoreToPercentile(-3.0);
    expect(p).toBeCloseTo(0.1, 0);
  });

  it("returns approximately 99.9 for Z-score of 3.0", () => {
    const p = zScoreToPercentile(3.0);
    expect(p).toBeCloseTo(99.9, 0);
  });

  it("is symmetric: P(z) + P(-z) = 100", () => {
    const z = 1.5;
    const upper = zScoreToPercentile(z);
    const lower = zScoreToPercentile(-z);
    expect(upper + lower).toBeCloseTo(100, 0);
  });

  it("returns near 0 for very negative Z-scores", () => {
    const p = zScoreToPercentile(-3.5);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThan(1);
  });

  it("returns near 100 for very positive Z-scores", () => {
    const p = zScoreToPercentile(3.5);
    expect(p).toBeLessThanOrEqual(100);
    expect(p).toBeGreaterThan(99);
  });

  it("rounds to 1 decimal place", () => {
    const p = zScoreToPercentile(0.5);
    const decimalPlaces = p.toString().split(".")[1]?.length ?? 0;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });

  it("is monotonically increasing", () => {
    const zValues = [-3, -2, -1, 0, 1, 2, 3];
    const percentiles = zValues.map(zScoreToPercentile);
    for (let i = 1; i < percentiles.length; i++) {
      expect(percentiles[i]).toBeGreaterThan(percentiles[i - 1]);
    }
  });
});

// ---- getLMSForAge ----

describe("getLMSForAge", () => {
  it("returns exact data point when age matches", () => {
    const result = getLMSForAge(6, sampleLMSData);
    expect(result.L).toBe(0.1195);
    expect(result.M).toBe(7.9340);
    expect(result.S).toBe(0.10876);
  });

  it("interpolates between two data points", () => {
    // Age 1.5 is halfway between age 0 (L=0.3487, M=3.3464, S=0.14602)
    // and age 3 (L=0.1738, M=6.3762, S=0.11727)
    const result = getLMSForAge(1.5, sampleLMSData);
    const fraction = 1.5 / 3;
    const expectedL = 0.3487 + fraction * (0.1738 - 0.3487);
    const expectedM = 3.3464 + fraction * (6.3762 - 3.3464);
    const expectedS = 0.14602 + fraction * (0.11727 - 0.14602);

    expect(result.age).toBe(1.5);
    expect(result.L).toBeCloseTo(expectedL, 6);
    expect(result.M).toBeCloseTo(expectedM, 6);
    expect(result.S).toBeCloseTo(expectedS, 6);
  });

  it("interpolates at a non-trivial fraction between points", () => {
    // Age 4 is between age 3 and age 6, fraction = (4 - 3) / (6 - 3) = 1/3
    const result = getLMSForAge(4, sampleLMSData);
    const fraction = 1 / 3;
    const expectedL = 0.1738 + fraction * (0.1195 - 0.1738);
    const expectedM = 6.3762 + fraction * (7.9340 - 6.3762);
    const expectedS = 0.11727 + fraction * (0.10876 - 0.11727);

    expect(result.age).toBe(4);
    expect(result.L).toBeCloseTo(expectedL, 6);
    expect(result.M).toBeCloseTo(expectedM, 6);
    expect(result.S).toBeCloseTo(expectedS, 6);
  });

  it("clamps to first data point for age below range", () => {
    const result = getLMSForAge(-1, sampleLMSData);
    expect(result).toEqual(sampleLMSData[0]);
  });

  it("returns first data point when age equals minimum", () => {
    const result = getLMSForAge(0, sampleLMSData);
    expect(result).toEqual(sampleLMSData[0]);
  });

  it("clamps to last data point for age above range", () => {
    const result = getLMSForAge(36, sampleLMSData);
    expect(result).toEqual(sampleLMSData[sampleLMSData.length - 1]);
  });

  it("returns last data point when age equals maximum", () => {
    const result = getLMSForAge(24, sampleLMSData);
    expect(result).toEqual(sampleLMSData[sampleLMSData.length - 1]);
  });

  it("throws for empty data array", () => {
    expect(() => getLMSForAge(5, [])).toThrow("must not be empty");
  });

  it("returns the single element for single-element data", () => {
    const singleData: readonly LMSParams[] = [
      { age: 10, L: 1, M: 50, S: 0.05 },
    ];
    const result = getLMSForAge(5, singleData);
    expect(result).toEqual(singleData[0]);

    const result2 = getLMSForAge(15, singleData);
    expect(result2).toEqual(singleData[0]);
  });

  it("does not mutate the original data", () => {
    const data: LMSParams[] = [
      { age: 0, L: 1, M: 50, S: 0.05 },
      { age: 12, L: 1, M: 75, S: 0.04 },
    ];
    const originalData = data.map((d) => ({ ...d }));
    getLMSForAge(6, data);
    expect(data).toEqual(originalData);
  });
});

// ---- selectDataSet ----

describe("selectDataSet", () => {
  it("returns weight data for male, WHO standard", () => {
    const data = selectDataSet("weight", "male", "who");
    expect(data.length).toBeGreaterThan(0);
    // Should combine 0-60 and 5-18 datasets
    expect(data[0].age).toBe(0);
    expect(data[data.length - 1].age).toBe(216);
  });

  it("returns weight data for female, WHO standard", () => {
    const data = selectDataSet("weight", "female", "who");
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].age).toBe(0);
  });

  it("returns height data for male, WHO standard", () => {
    const data = selectDataSet("height", "male", "who");
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].age).toBe(0);
    expect(data[data.length - 1].age).toBe(216);
  });

  it("returns height data for female, WHO standard", () => {
    const data = selectDataSet("height", "female", "who");
    expect(data.length).toBeGreaterThan(0);
  });

  it("returns head circumference data for male, WHO standard", () => {
    const data = selectDataSet("headCircumference", "male", "who");
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].age).toBe(0);
    expect(data[data.length - 1].age).toBe(60);
  });

  it("returns head circumference data for female, WHO standard", () => {
    const data = selectDataSet("headCircumference", "female", "who");
    expect(data.length).toBeGreaterThan(0);
    expect(data[data.length - 1].age).toBe(60);
  });

  it("throws for BMI measurement (not yet supported)", () => {
    expect(() => selectDataSet("bmi", "male", "who")).toThrow("BMI");
  });

  it("throws for unsupported growth standard", () => {
    expect(() => selectDataSet("weight", "male", "japanese")).toThrow(
      "not yet supported",
    );
  });
});

// ---- computeGrowthPercentile ----

describe("computeGrowthPercentile", () => {
  it("returns approximately 50th percentile for median weight at birth (boys)", () => {
    // WHO median weight at birth for boys: 3.3464 kg
    const result = computeGrowthPercentile("weight", 3.3464, 0, "male");
    expect(result.percentile).toBeCloseTo(50, 0);
    expect(result.zScore).toBeCloseTo(0, 1);
  });

  it("returns approximately 50th percentile for median weight at birth (girls)", () => {
    // WHO median weight at birth for girls: 3.2322 kg
    const result = computeGrowthPercentile("weight", 3.2322, 0, "female");
    expect(result.percentile).toBeCloseTo(50, 0);
    expect(result.zScore).toBeCloseTo(0, 1);
  });

  it("returns approximately 50th percentile for median height at age 12m (boys)", () => {
    // WHO median height at 12 months for boys: 75.7488 cm
    const result = computeGrowthPercentile("height", 75.7488, 12, "male");
    expect(result.percentile).toBeCloseTo(50, 0);
    expect(result.zScore).toBeCloseTo(0, 1);
  });

  it("returns correct result shape with all required fields", () => {
    const result = computeGrowthPercentile("weight", 5.0, 2, "male");
    expect(result).toHaveProperty("measurement", "weight");
    expect(result).toHaveProperty("value", 5.0);
    expect(result).toHaveProperty("percentile");
    expect(result).toHaveProperty("zScore");
    expect(result).toHaveProperty("ageInMonths", 2);
    expect(result).toHaveProperty("gender", "male");
    expect(result).toHaveProperty("standard", "who");
  });

  it("defaults to WHO standard when not specified", () => {
    const result = computeGrowthPercentile("weight", 5.0, 2, "male");
    expect(result.standard).toBe("who");
  });

  it("returns higher percentile for heavier child at same age", () => {
    const lighter = computeGrowthPercentile("weight", 4.0, 2, "male");
    const heavier = computeGrowthPercentile("weight", 7.0, 2, "male");
    expect(heavier.percentile).toBeGreaterThan(lighter.percentile);
    expect(heavier.zScore).toBeGreaterThan(lighter.zScore);
  });

  it("returns higher percentile for taller child at same age", () => {
    const shorter = computeGrowthPercentile("height", 55.0, 2, "male");
    const taller = computeGrowthPercentile("height", 62.0, 2, "male");
    expect(taller.percentile).toBeGreaterThan(shorter.percentile);
  });

  it("computes head circumference percentile", () => {
    // WHO median HC at birth for boys: 34.4618 cm
    const result = computeGrowthPercentile(
      "headCircumference",
      34.4618,
      0,
      "male",
    );
    expect(result.percentile).toBeCloseTo(50, 0);
    expect(result.measurement).toBe("headCircumference");
  });

  it("works with interpolated age (non-data-point age)", () => {
    // Age 4 months is between 3 and 6 in the data
    const result = computeGrowthPercentile("weight", 7.0, 4, "male");
    expect(result.percentile).toBeGreaterThan(0);
    expect(result.percentile).toBeLessThan(100);
    expect(result.ageInMonths).toBe(4);
  });

  it("throws for negative measurement value", () => {
    expect(() =>
      computeGrowthPercentile("weight", -1, 12, "male"),
    ).toThrow("must be positive");
  });

  it("throws for zero measurement value", () => {
    expect(() =>
      computeGrowthPercentile("weight", 0, 12, "male"),
    ).toThrow("must be positive");
  });

  it("throws for negative age", () => {
    expect(() =>
      computeGrowthPercentile("weight", 5, -1, "male"),
    ).toThrow("non-negative");
  });

  it("works with age 0 (birth)", () => {
    const result = computeGrowthPercentile("weight", 3.3, 0, "male");
    expect(result.ageInMonths).toBe(0);
    expect(result.percentile).toBeGreaterThan(0);
    expect(result.percentile).toBeLessThan(100);
  });

  it("percentile is between 0 and 100", () => {
    const result = computeGrowthPercentile("weight", 5.0, 2, "male");
    expect(result.percentile).toBeGreaterThanOrEqual(0);
    expect(result.percentile).toBeLessThanOrEqual(100);
  });

  it("z-score is between -3.5 and 3.5", () => {
    const result = computeGrowthPercentile("weight", 5.0, 2, "male");
    expect(result.zScore).toBeGreaterThanOrEqual(-3.5);
    expect(result.zScore).toBeLessThanOrEqual(3.5);
  });
});

// ---- generateReferenceCurve ----

describe("generateReferenceCurve", () => {
  it("returns curves for all 7 standard percentiles", () => {
    const curves = generateReferenceCurve("weight", "male", "who", 60);
    const keys = Object.keys(curves).map(Number);
    expect(keys).toEqual(expect.arrayContaining([3, 10, 25, 50, 75, 90, 97]));
    expect(keys).toHaveLength(7);
  });

  it("each percentile curve has the same number of points", () => {
    const curves = generateReferenceCurve("weight", "male", "who", 24);
    const lengths = Object.values(curves).map((arr) => arr.length);
    const uniqueLengths = [...new Set(lengths)];
    expect(uniqueLengths).toHaveLength(1);
  });

  it("points have ageMonths and value properties", () => {
    const curves = generateReferenceCurve("weight", "male", "who", 12);
    const firstPoint = curves[50][0];
    expect(firstPoint).toHaveProperty("ageMonths");
    expect(firstPoint).toHaveProperty("value");
    expect(typeof firstPoint.ageMonths).toBe("number");
    expect(typeof firstPoint.value).toBe("number");
  });

  it("50th percentile values increase with age for weight", () => {
    const curves = generateReferenceCurve("weight", "male", "who", 24);
    const medianCurve = curves[50];
    for (let i = 1; i < medianCurve.length; i++) {
      expect(medianCurve[i].value).toBeGreaterThanOrEqual(
        medianCurve[i - 1].value,
      );
    }
  });

  it("higher percentiles have higher values at same age", () => {
    const curves = generateReferenceCurve("weight", "male", "who", 12);
    const percentiles = [3, 10, 25, 50, 75, 90, 97] as const;

    // Check at multiple age indices
    for (let idx = 0; idx < curves[50].length; idx++) {
      for (let p = 1; p < percentiles.length; p++) {
        const lower = curves[percentiles[p - 1]][idx].value;
        const upper = curves[percentiles[p]][idx].value;
        expect(upper).toBeGreaterThanOrEqual(lower);
      }
    }
  });

  it("respects maxAgeMonths parameter", () => {
    const curves12 = generateReferenceCurve("weight", "male", "who", 12);
    const curves24 = generateReferenceCurve("weight", "male", "who", 24);
    expect(curves24[50].length).toBeGreaterThan(curves12[50].length);
  });

  it("generates curves for height measurement", () => {
    const curves = generateReferenceCurve("height", "male", "who", 24);
    expect(Object.keys(curves)).toHaveLength(7);
    expect(curves[50].length).toBeGreaterThan(0);
  });

  it("generates curves for head circumference measurement", () => {
    const curves = generateReferenceCurve(
      "headCircumference",
      "female",
      "who",
      36,
    );
    expect(Object.keys(curves)).toHaveLength(7);
    expect(curves[50].length).toBeGreaterThan(0);
  });

  it("generates curves for female gender", () => {
    const curves = generateReferenceCurve("weight", "female", "who", 12);
    expect(Object.keys(curves)).toHaveLength(7);
    expect(curves[50].length).toBeGreaterThan(0);
  });

  it("does not exceed maxAgeMonths in generated points", () => {
    const maxAge = 24;
    const curves = generateReferenceCurve("weight", "male", "who", maxAge);
    for (const points of Object.values(curves)) {
      for (const point of points) {
        expect(point.ageMonths).toBeLessThanOrEqual(maxAge);
      }
    }
  });

  it("values are rounded to 2 decimal places", () => {
    const curves = generateReferenceCurve("weight", "male", "who", 12);
    for (const points of Object.values(curves)) {
      for (const point of points) {
        const rounded = Math.round(point.value * 100) / 100;
        expect(point.value).toBe(rounded);
      }
    }
  });

  it("all values are positive", () => {
    const curves = generateReferenceCurve("weight", "male", "who", 60);
    for (const points of Object.values(curves)) {
      for (const point of points) {
        expect(point.value).toBeGreaterThan(0);
      }
    }
  });

  it("50th percentile median at birth matches WHO data for boys weight", () => {
    const curves = generateReferenceCurve("weight", "male", "who", 12);
    // The 50th percentile at age 0 should be close to the WHO median (3.3464)
    const birthPoint = curves[50].find((p) => p.ageMonths === 0);
    expect(birthPoint).toBeDefined();
    expect(birthPoint!.value).toBeCloseTo(3.35, 0);
  });
});
