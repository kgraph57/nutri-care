/**
 * Growth percentile calculation service using the LMS method.
 *
 * Implements WHO Child Growth Standards for computing Z-scores,
 * percentiles, and reference curves for pediatric growth monitoring.
 *
 * All functions are pure and use immutable data structures.
 */

import type {
  LMSParams,
  GrowthPercentile,
  GrowthStandard,
} from '../types/growthData';
import * as standards from '../data/growthStandards';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PERCENTILE_ROUNDING = 1;
const Z_SCORE_ROUNDING = 2;
const STANDARD_PERCENTILES = [3, 10, 25, 50, 75, 90, 97] as const;
const MAX_Z_SCORE = 3.5;
const MIN_Z_SCORE = -3.5;

// ---------------------------------------------------------------------------
// Core LMS Calculations
// ---------------------------------------------------------------------------

/**
 * Calculate Z-score from LMS parameters.
 * When L != 0: Z = ((value/M)^L - 1) / (L * S)
 * When L == 0: Z = ln(value/M) / S
 */
export function calculateZScore(value: number, lms: LMSParams): number {
  if (value <= 0 || lms.M <= 0 || lms.S <= 0) {
    throw new Error(
      `Invalid input: value=${value}, M=${lms.M}, S=${lms.S}. All must be positive.`,
    );
  }

  const ratio = value / lms.M;

  const rawZ =
    Math.abs(lms.L) < 1e-10
      ? Math.log(ratio) / lms.S
      : (Math.pow(ratio, lms.L) - 1) / (lms.L * lms.S);

  const clampedZ = Math.max(MIN_Z_SCORE, Math.min(MAX_Z_SCORE, rawZ));

  return Math.round(clampedZ * Math.pow(10, Z_SCORE_ROUNDING)) /
    Math.pow(10, Z_SCORE_ROUNDING);
}

/**
 * Convert Z-score to percentile using the standard normal CDF.
 * Uses the Abramowitz and Stegun rational approximation (formula 26.2.17).
 * Returns 0-100 rounded to 1 decimal place.
 */
export function zScoreToPercentile(z: number): number {
  const cdf = normalCDF(z);
  const percentile = cdf * 100;

  return Math.round(percentile * Math.pow(10, PERCENTILE_ROUNDING)) /
    Math.pow(10, PERCENTILE_ROUNDING);
}

/**
 * Standard normal CDF approximation.
 * Abramowitz and Stegun, formula 26.2.17.
 * Maximum error: 7.5e-8.
 */
function normalCDF(z: number): number {
  if (z < -8) return 0;
  if (z > 8) return 1;

  const isNegative = z < 0;
  const absZ = Math.abs(z);

  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;

  const t = 1.0 / (1.0 + p * absZ);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;

  const pdf = Math.exp(-0.5 * absZ * absZ) / Math.sqrt(2 * Math.PI);
  const cdf = 1.0 - pdf * (b1 * t + b2 * t2 + b3 * t3 + b4 * t4 + b5 * t5);

  return isNegative ? 1.0 - cdf : cdf;
}

/**
 * Convert a percentile (0-100) to a Z-score using the rational approximation
 * of the inverse standard normal CDF (Abramowitz and Stegun 26.2.23).
 */
function percentileToZScore(percentile: number): number {
  if (percentile <= 0 || percentile >= 100) {
    throw new Error(`Percentile must be between 0 and 100 exclusive: ${percentile}`);
  }

  const p = percentile / 100;

  if (p === 0.5) return 0;

  const isLower = p < 0.5;
  const pAdj = isLower ? p : 1 - p;

  const t = Math.sqrt(-2.0 * Math.log(pAdj));

  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  const z = t - (c0 + c1 * t + c2 * t * t) /
    (1 + d1 * t + d2 * t * t + d3 * t * t * t);

  return isLower ? -z : z;
}

// ---------------------------------------------------------------------------
// LMS Interpolation
// ---------------------------------------------------------------------------

/**
 * Get LMS parameters for a given age by linear interpolation between
 * the two nearest data points. If the age falls outside the data range,
 * the nearest endpoint is returned.
 */
export function getLMSForAge(
  ageMonths: number,
  data: readonly LMSParams[],
): LMSParams {
  if (data.length === 0) {
    throw new Error('LMS data array must not be empty');
  }

  if (ageMonths <= data[0].age) {
    return data[0];
  }

  const lastIndex = data.length - 1;
  if (ageMonths >= data[lastIndex].age) {
    return data[lastIndex];
  }

  let lowerIndex = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].age <= ageMonths && data[i + 1].age > ageMonths) {
      lowerIndex = i;
      break;
    }
  }

  const lower = data[lowerIndex];
  const upper = data[lowerIndex + 1];
  const fraction = (ageMonths - lower.age) / (upper.age - lower.age);

  return {
    age: ageMonths,
    L: lower.L + fraction * (upper.L - lower.L),
    M: lower.M + fraction * (upper.M - lower.M),
    S: lower.S + fraction * (upper.S - lower.S),
  };
}

// ---------------------------------------------------------------------------
// Data Set Selection
// ---------------------------------------------------------------------------

/**
 * Select the correct WHO data set based on measurement type, gender, and standard.
 * For 'who' standard, uses 0-60 data for ages <= 60 months and 5-18 data for > 60.
 * For weight and height, combines both ranges into a single array.
 * Head circumference is only available for 0-60 months.
 * BMI is not yet supported (throws an error).
 */
export function selectDataSet(
  measurement: 'weight' | 'height' | 'headCircumference' | 'bmi',
  gender: 'male' | 'female',
  standard: GrowthStandard,
): readonly LMSParams[] {
  if (standard !== 'who') {
    throw new Error(`Growth standard "${standard}" is not yet supported. Only "who" is available.`);
  }

  if (measurement === 'bmi') {
    throw new Error('BMI-for-age data is not yet available in this implementation.');
  }

  if (measurement === 'headCircumference') {
    return gender === 'male'
      ? standards.WHO_HC_BOYS_0_60
      : standards.WHO_HC_GIRLS_0_60;
  }

  if (measurement === 'weight') {
    const under5 = gender === 'male'
      ? standards.WHO_WEIGHT_BOYS_0_60
      : standards.WHO_WEIGHT_GIRLS_0_60;
    const over5 = gender === 'male'
      ? standards.WHO_WEIGHT_BOYS_5_18
      : standards.WHO_WEIGHT_GIRLS_5_18;
    return [...under5, ...over5];
  }

  // height
  const under5 = gender === 'male'
    ? standards.WHO_HEIGHT_BOYS_0_60
    : standards.WHO_HEIGHT_GIRLS_0_60;
  const over5 = gender === 'male'
    ? standards.WHO_HEIGHT_BOYS_5_18
    : standards.WHO_HEIGHT_GIRLS_5_18;
  return [...under5, ...over5];
}

// ---------------------------------------------------------------------------
// Growth Percentile Computation
// ---------------------------------------------------------------------------

/**
 * Compute growth percentile for a single measurement.
 * Supports Japanese gender labels: '男性' maps to 'male', '女性' maps to 'female'.
 */
export function computeGrowthPercentile(
  measurement: 'weight' | 'height' | 'headCircumference' | 'bmi',
  value: number,
  ageMonths: number,
  gender: 'male' | 'female',
  standard: GrowthStandard = 'who',
): GrowthPercentile {
  if (value <= 0) {
    throw new Error(`Measurement value must be positive: ${value}`);
  }
  if (ageMonths < 0) {
    throw new Error(`Age in months must be non-negative: ${ageMonths}`);
  }

  const data = selectDataSet(measurement, gender, standard);
  const lms = getLMSForAge(ageMonths, data);
  const zScore = calculateZScore(value, lms);
  const percentile = zScoreToPercentile(zScore);

  return {
    measurement,
    value,
    percentile,
    zScore,
    ageInMonths: ageMonths,
    gender,
    standard,
  };
}

// ---------------------------------------------------------------------------
// Reference Curve Generation
// ---------------------------------------------------------------------------

/**
 * Solve for the measurement value from LMS parameters and Z-score.
 * When L != 0: value = M * (1 + L * S * Z) ^ (1/L)
 * When L == 0: value = M * exp(S * Z)
 */
function valueFromZScore(z: number, lms: LMSParams): number {
  if (Math.abs(lms.L) < 1e-10) {
    return lms.M * Math.exp(lms.S * z);
  }

  const inner = 1 + lms.L * lms.S * z;
  if (inner <= 0) {
    return 0;
  }
  return lms.M * Math.pow(inner, 1 / lms.L);
}

/**
 * Generate reference curve data for chart rendering.
 * Returns a map from percentile number (3, 10, 25, 50, 75, 90, 97)
 * to an array of { ageMonths, value } points.
 *
 * Points are generated at each month from 0 to maxAgeMonths.
 */
export function generateReferenceCurve(
  measurement: 'weight' | 'height' | 'headCircumference',
  gender: 'male' | 'female',
  standard: GrowthStandard,
  maxAgeMonths: number,
): Record<number, readonly { readonly ageMonths: number; readonly value: number }[]> {
  const data = selectDataSet(measurement, gender, standard);

  const minAge = data[0].age;
  const maxAge = Math.min(maxAgeMonths, data[data.length - 1].age);

  const result: Record<number, { readonly ageMonths: number; readonly value: number }[]> = {};

  for (const p of STANDARD_PERCENTILES) {
    result[p] = [];
  }

  const zScores = STANDARD_PERCENTILES.map((p) => percentileToZScore(p));

  for (let age = minAge; age <= maxAge; age++) {
    const lms = getLMSForAge(age, data);

    for (let i = 0; i < STANDARD_PERCENTILES.length; i++) {
      const p = STANDARD_PERCENTILES[i];
      const z = zScores[i];
      const value = Math.round(valueFromZScore(z, lms) * 100) / 100;

      result[p] = [
        ...result[p],
        { ageMonths: age, value },
      ];
    }
  }

  return result;
}
