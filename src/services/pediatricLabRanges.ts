// 患者年齢に応じた検査基準値の解決
import type { LabReference } from "../types/labData";
import type { Patient } from "../types";
import {
  PEDIATRIC_LAB_REFERENCES,
  findAgeRange,
} from "../data/pediatricLabReferences";
import { LAB_REFERENCES } from "../types/labData";

const PEDIATRIC_PATIENT_TYPES: ReadonlyArray<string> = [
  "PICU",
  "NICU",
  "小児一般",
];

/**
 * Resolve the patient's age in months.
 * Prefers ageInMonths when available, otherwise derives from age (years).
 */
function resolveAgeInMonths(patient: Patient): number {
  if (patient.ageInMonths !== undefined) {
    return patient.ageInMonths;
  }
  return patient.age * 12;
}

/**
 * Determine whether a patient should use pediatric reference ranges.
 * True when age < 18 years OR patientType is a pediatric ward.
 */
function shouldUsePediatricRanges(patient: Patient): boolean {
  if (patient.age < 18) {
    return true;
  }
  return PEDIATRIC_PATIENT_TYPES.includes(patient.patientType);
}

/** Convert a pediatric age range into the standard LabReference shape. */
function toLabReference(
  ref: (typeof PEDIATRIC_LAB_REFERENCES)[number],
  range: {
    normalMin: number;
    normalMax: number;
    criticalLow?: number;
    criticalHigh?: number;
  },
): LabReference {
  return {
    key: ref.key,
    label: ref.label,
    unit: ref.unit,
    section: ref.section,
    normalMin: range.normalMin,
    normalMax: range.normalMax,
    ...(range.criticalLow !== undefined
      ? { criticalLow: range.criticalLow }
      : {}),
    ...(range.criticalHigh !== undefined
      ? { criticalHigh: range.criticalHigh }
      : {}),
  };
}

/**
 * Get age-appropriate lab references for a patient.
 *
 * For pediatric patients (age < 18 or PICU/NICU/小児一般), resolve age-specific
 * normal ranges from PEDIATRIC_LAB_REFERENCES. For adult patients, return the
 * standard LAB_REFERENCES unchanged.
 *
 * If no pediatric range covers the patient's age for a given lab, the
 * corresponding adult reference from LAB_REFERENCES is used as fallback.
 */
export function getLabReferencesForPatient(
  patient: Patient,
): readonly LabReference[] {
  if (!shouldUsePediatricRanges(patient)) {
    return LAB_REFERENCES;
  }

  const ageMonths = resolveAgeInMonths(patient);

  // Build a map of pediatric overrides keyed by lab field name
  const pediatricMap = new Map<string, LabReference>();

  for (const pedRef of PEDIATRIC_LAB_REFERENCES) {
    const ageRange = findAgeRange(pedRef, ageMonths);
    if (ageRange === undefined) {
      continue;
    }
    pediatricMap.set(pedRef.key, toLabReference(pedRef, ageRange));
  }

  // Merge: prefer pediatric range when available, fall back to adult range
  return LAB_REFERENCES.map((adultRef) => {
    const override = pediatricMap.get(adultRef.key);
    return override ?? adultRef;
  });
}
