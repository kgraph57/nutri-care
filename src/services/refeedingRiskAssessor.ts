import type { Patient } from '../types';
import type { LabData } from '../types/labData';
import { calculateBMI } from '../utils/bodyMetrics';

export interface RefeedingRiskResult {
  readonly riskLevel: 'high' | 'moderate' | 'low' | 'none';
  readonly reasons: readonly string[];
  readonly recommendations: readonly string[];
}

const HIGH_RECOMMENDATIONS: readonly string[] = [
  '10kcal/kg/日から開始',
  'チアミン(VB1)投与推奨',
  'P/K/Mg補正後に開始',
  '心電図モニタリング推奨',
];

const MODERATE_RECOMMENDATIONS: readonly string[] = [
  '15-20kcal/kg/日から開始',
  '電解質を頻回にモニタリング',
  'チアミン投与を検討',
];

const LOW_RECOMMENDATIONS: readonly string[] = [
  '通常速度で栄養開始可能',
];

function collectRiskFlags(
  patient: Patient,
  labData: LabData | undefined,
): readonly string[] {
  const flags: string[] = [];
  const bmi = calculateBMI(patient.weight, patient.height);

  if (bmi > 0 && bmi < 16) {
    flags.push('BMI < 16 (重度低体重)');
  } else if (bmi >= 16 && bmi < 18.5) {
    flags.push('BMI 16-18.5 (低体重)');
  }

  if (patient.age >= 18 && patient.weight < 40) {
    flags.push('体重 < 40kg');
  }

  if (labData?.phosphorus !== undefined && labData.phosphorus < 2.5) {
    flags.push('低リン血症 (P < 2.5)');
  }

  if (labData?.potassium !== undefined && labData.potassium < 3.5) {
    flags.push('低カリウム血症 (K < 3.5)');
  }

  if (labData?.magnesium !== undefined && labData.magnesium < 1.8) {
    flags.push('低マグネシウム血症 (Mg < 1.8)');
  }

  return flags;
}

function determineRiskLevel(
  flags: readonly string[],
): 'high' | 'moderate' | 'low' | 'none' {
  if (flags.length >= 2) return 'high';
  if (flags.length === 1) return 'moderate';
  return 'none';
}

function getRecommendations(
  riskLevel: 'high' | 'moderate' | 'low' | 'none',
): readonly string[] {
  switch (riskLevel) {
    case 'high':
      return HIGH_RECOMMENDATIONS;
    case 'moderate':
      return MODERATE_RECOMMENDATIONS;
    case 'low':
      return LOW_RECOMMENDATIONS;
    case 'none':
      return [];
  }
}

export function assessRefeedingRisk(
  patient: Patient,
  labData: LabData | undefined,
): RefeedingRiskResult {
  const reasons = collectRiskFlags(patient, labData);
  const riskLevel = determineRiskLevel(reasons);
  const recommendations = getRecommendations(riskLevel);

  return {
    riskLevel,
    reasons,
    recommendations,
  };
}
