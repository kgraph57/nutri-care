import type { Patient, NutritionRequirements, NutritionType } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PediatricAgeCategory =
  | 'preterm'
  | 'neonate'
  | 'infant'
  | 'toddler'
  | 'preschool'
  | 'schoolAge'
  | 'adolescent';

interface RequirementRange {
  readonly min: number;
  readonly max: number;
  readonly target: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PEDIATRIC_PATIENT_TYPES: ReadonlyArray<string> = [
  'PICU',
  'NICU',
  '小児一般',
];

const PEDIATRIC_STRESS_FACTORS: Readonly<Record<string, number>> = {
  mild: 1.0,
  moderate: 1.1,
  severe: 1.3,
  critical: 1.5,
};

const ENERGY_REQUIREMENTS: Readonly<Record<PediatricAgeCategory, RequirementRange>> = {
  preterm:    { min: 110, max: 150, target: 120 },
  neonate:    { min: 100, max: 130, target: 110 },
  infant:     { min: 90,  max: 120, target: 100 },
  toddler:    { min: 75,  max: 100, target: 85 },
  preschool:  { min: 65,  max: 85,  target: 75 },
  schoolAge:  { min: 55,  max: 75,  target: 65 },
  adolescent: { min: 30,  max: 55,  target: 45 },
};

const PROTEIN_REQUIREMENTS: Readonly<Record<PediatricAgeCategory, RequirementRange>> = {
  preterm:    { min: 3.5, max: 4.5, target: 4.0 },
  neonate:    { min: 2.5, max: 3.5, target: 3.0 },
  infant:     { min: 2.0, max: 3.0, target: 2.5 },
  toddler:    { min: 1.5, max: 2.0, target: 1.5 },
  preschool:  { min: 1.2, max: 1.5, target: 1.2 },
  schoolAge:  { min: 1.0, max: 1.5, target: 1.2 },
  adolescent: { min: 0.8, max: 1.5, target: 1.0 },
};

const ELECTROLYTE_PER_KG: Readonly<Record<string, number>> = {
  sodium: 2.0,
  potassium: 2.0,
  calcium: 1.0,
  magnesium: 0.4,
  phosphorus: 1.0,
  chloride: 2.0,
};

const TRACE_ELEMENT_PER_KG: Readonly<Record<string, number>> = {
  iron: 0.2,
  zinc: 0.1,
  copper: 0.02,
  manganese: 0.01,
  iodine: 2.0,
  selenium: 1.5,
};

export const AGE_CATEGORY_LABELS: Readonly<Record<PediatricAgeCategory, string>> = {
  preterm:    '早産児',
  neonate:    '新生児',
  infant:     '乳児',
  toddler:    '幼児',
  preschool:  '学童前期',
  schoolAge:  '学童',
  adolescent: '思春期',
};

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/**
 * Determine if the patient should use pediatric formulas.
 * Returns true when age < 18 or patientType matches a pediatric ward.
 */
export function isPediatricPatient(patient: Patient): boolean {
  if (patient.age < 18) {
    return true;
  }
  return PEDIATRIC_PATIENT_TYPES.includes(patient.patientType);
}

/**
 * Determine the age category from patient data.
 * Priority: gestationalAge -> ageInMonths -> age (years).
 */
export function getAgeCategory(patient: Patient): PediatricAgeCategory {
  if (
    patient.gestationalAge !== undefined &&
    patient.gestationalAge < 37
  ) {
    return 'preterm';
  }

  const months = patient.ageInMonths ?? patient.age * 12;

  if (months < 1) {
    return 'neonate';
  }
  if (months < 12) {
    return 'infant';
  }
  if (months < 36) {
    return 'toddler';
  }
  if (months < 72) {
    return 'preschool';
  }
  if (months < 144) {
    return 'schoolAge';
  }
  return 'adolescent';
}

/**
 * Schofield equation for basal metabolic rate (WHO recommended, 0-18 y).
 * Uses weight (kg) and height (cm). Gender: '男性' = male.
 */
export function calculateSchofieldBMR(
  weight: number,
  height: number,
  age: number,
  gender: string,
): number {
  const isMale = gender === '男性';
  const heightM = height / 100;

  let bmr: number;

  if (age < 3) {
    bmr = isMale
      ? 0.167 * weight + 1517.4 * heightM - 617.6
      : 16.25 * weight + 1023.2 * heightM - 413.5;
  } else if (age < 10) {
    bmr = isMale
      ? 19.6 * weight + 130.3 * heightM + 414.9
      : 16.97 * weight + 161.8 * heightM + 371.2;
  } else {
    bmr = isMale
      ? 16.25 * weight + 137.2 * heightM + 515.5
      : 8.365 * weight + 465.0 * heightM + 200.0;
  }

  return Math.round(bmr * 10) / 10;
}

/**
 * Age-specific energy requirements (kcal/kg/day).
 */
export function getEnergyRequirementPerKg(
  category: PediatricAgeCategory,
): RequirementRange {
  return ENERGY_REQUIREMENTS[category];
}

/**
 * Age-specific protein requirements (g/kg/day).
 */
export function getProteinRequirementPerKg(
  category: PediatricAgeCategory,
): RequirementRange {
  return PROTEIN_REQUIREMENTS[category];
}

/**
 * Calculate full pediatric nutrition requirements.
 *
 * Energy and protein are derived from age-stratified per-kg targets,
 * adjusted by a stress factor. Fat accounts for 30 % of total energy,
 * carbohydrates fill the remainder.
 */
export function calculatePediatricRequirements(
  patient: Patient,
  nutritionType: NutritionType,
  stressLevel: string,
): NutritionRequirements {
  const category = getAgeCategory(patient);
  const stressFactor =
    PEDIATRIC_STRESS_FACTORS[stressLevel] ?? PEDIATRIC_STRESS_FACTORS.moderate;

  const energyPerKg = getEnergyRequirementPerKg(category);
  const proteinPerKg = getProteinRequirementPerKg(category);

  const totalEnergy = energyPerKg.target * patient.weight * stressFactor;
  const protein = proteinPerKg.target * patient.weight * stressFactor;
  const fat = (totalEnergy * 0.3) / 9;
  const carbs = (totalEnergy - protein * 4 - fat * 9) / 4;

  const w = patient.weight;

  return {
    energy:      Math.round(totalEnergy),
    protein:     Math.round(protein * 10) / 10,
    fat:         Math.round(fat * 10) / 10,
    carbs:       Math.round(carbs * 10) / 10,
    sodium:      Math.round(w * ELECTROLYTE_PER_KG.sodium * 10) / 10,
    potassium:   Math.round(w * ELECTROLYTE_PER_KG.potassium * 10) / 10,
    calcium:     Math.round(w * ELECTROLYTE_PER_KG.calcium * 10) / 10,
    magnesium:   Math.round(w * ELECTROLYTE_PER_KG.magnesium * 10) / 10,
    phosphorus:  Math.round(w * ELECTROLYTE_PER_KG.phosphorus * 10) / 10,
    chloride:    Math.round(w * ELECTROLYTE_PER_KG.chloride * 10) / 10,
    iron:        Math.round(w * TRACE_ELEMENT_PER_KG.iron * 100) / 100,
    zinc:        Math.round(w * TRACE_ELEMENT_PER_KG.zinc * 100) / 100,
    copper:      Math.round(w * TRACE_ELEMENT_PER_KG.copper * 100) / 100,
    manganese:   Math.round(w * TRACE_ELEMENT_PER_KG.manganese * 100) / 100,
    iodine:      Math.round(w * TRACE_ELEMENT_PER_KG.iodine * 10) / 10,
    selenium:    Math.round(w * TRACE_ELEMENT_PER_KG.selenium * 10) / 10,
  };
}
