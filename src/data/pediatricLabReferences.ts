// 小児検査基準値（年齢別正常範囲）
import type { LabData, LabSection } from '../types/labData';

export interface AgeRangeReference {
  readonly minAgeMonths: number;
  readonly maxAgeMonths: number;
  readonly label: string;
  readonly normalMin: number;
  readonly normalMax: number;
  readonly criticalLow?: number;
  readonly criticalHigh?: number;
}

export interface PediatricLabReference {
  readonly key: keyof Omit<LabData, 'patientId' | 'date'>;
  readonly label: string;
  readonly unit: string;
  readonly section: LabSection;
  readonly ageRanges: readonly AgeRangeReference[];
}

export const PEDIATRIC_LAB_REFERENCES: readonly PediatricLabReference[] = [
  // ── 蛋白 ──
  {
    key: 'albumin',
    label: 'Alb',
    unit: 'g/dL',
    section: '蛋白',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 2.5, normalMax: 4.5, criticalLow: 2.0 },
      { minAgeMonths: 1, maxAgeMonths: 12, label: '乳児', normalMin: 3.0, normalMax: 5.0, criticalLow: 2.0 },
      { minAgeMonths: 12, maxAgeMonths: 216, label: '小児', normalMin: 3.5, normalMax: 5.0, criticalLow: 2.5 },
    ],
  },
  {
    key: 'prealbumin',
    label: 'PreAlb',
    unit: 'mg/dL',
    section: '蛋白',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 8, normalMax: 20, criticalLow: 5 },
      { minAgeMonths: 1, maxAgeMonths: 216, label: '小児', normalMin: 15, normalMax: 35, criticalLow: 10 },
    ],
  },

  // ── 腎機能 ──
  {
    key: 'bun',
    label: 'BUN',
    unit: 'mg/dL',
    section: '腎機能',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 3, normalMax: 12, criticalHigh: 30 },
      { minAgeMonths: 1, maxAgeMonths: 12, label: '乳児', normalMin: 5, normalMax: 18, criticalHigh: 35 },
      { minAgeMonths: 12, maxAgeMonths: 216, label: '小児', normalMin: 7, normalMax: 20, criticalHigh: 40 },
    ],
  },
  {
    key: 'creatinine',
    label: 'Cr',
    unit: 'mg/dL',
    section: '腎機能',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 0.2, normalMax: 1.0, criticalHigh: 1.5 },
      { minAgeMonths: 1, maxAgeMonths: 12, label: '乳児', normalMin: 0.1, normalMax: 0.4, criticalHigh: 0.8 },
      { minAgeMonths: 12, maxAgeMonths: 72, label: '幼児', normalMin: 0.2, normalMax: 0.5, criticalHigh: 1.0 },
      { minAgeMonths: 72, maxAgeMonths: 144, label: '学童', normalMin: 0.3, normalMax: 0.7, criticalHigh: 1.5 },
      { minAgeMonths: 144, maxAgeMonths: 216, label: '思春期', normalMin: 0.4, normalMax: 1.0, criticalHigh: 2.0 },
    ],
  },

  // ── 血糖 ──
  {
    key: 'bloodSugar',
    label: 'BS',
    unit: 'mg/dL',
    section: '血糖',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 40, normalMax: 100, criticalLow: 40, criticalHigh: 200 },
      { minAgeMonths: 1, maxAgeMonths: 216, label: '乳児以降', normalMin: 60, normalMax: 100, criticalLow: 40, criticalHigh: 250 },
    ],
  },
  {
    key: 'hba1c',
    label: 'HbA1c',
    unit: '%',
    section: '血糖',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 216, label: '全年齢', normalMin: 4.0, normalMax: 5.6, criticalHigh: 8.0 },
    ],
  },

  // ── 電解質 ──
  {
    key: 'sodium',
    label: 'Na',
    unit: 'mEq/L',
    section: '電解質',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 216, label: '全年齢', normalMin: 136, normalMax: 145, criticalLow: 130, criticalHigh: 155 },
    ],
  },
  {
    key: 'potassium',
    label: 'K',
    unit: 'mEq/L',
    section: '電解質',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 3.5, normalMax: 6.0, criticalLow: 2.5, criticalHigh: 7.0 },
      { minAgeMonths: 1, maxAgeMonths: 216, label: '乳児以降', normalMin: 3.5, normalMax: 5.5, criticalLow: 2.5, criticalHigh: 7.0 },
    ],
  },
  {
    key: 'calcium',
    label: 'Ca',
    unit: 'mg/dL',
    section: '電解質',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 7.0, normalMax: 12.0, criticalLow: 6.0, criticalHigh: 13.0 },
      { minAgeMonths: 1, maxAgeMonths: 216, label: '小児', normalMin: 8.5, normalMax: 10.5, criticalLow: 7.0, criticalHigh: 12.0 },
    ],
  },
  {
    key: 'phosphorus',
    label: 'P',
    unit: 'mg/dL',
    section: '電解質',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 4.5, normalMax: 9.0, criticalLow: 2.0, criticalHigh: 10.0 },
      { minAgeMonths: 1, maxAgeMonths: 12, label: '乳児', normalMin: 4.0, normalMax: 7.0, criticalLow: 2.0, criticalHigh: 8.5 },
      { minAgeMonths: 12, maxAgeMonths: 216, label: '小児', normalMin: 3.5, normalMax: 5.5, criticalLow: 1.5, criticalHigh: 7.0 },
    ],
  },
  {
    key: 'magnesium',
    label: 'Mg',
    unit: 'mg/dL',
    section: '電解質',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 216, label: '全年齢', normalMin: 1.5, normalMax: 2.5, criticalLow: 1.0, criticalHigh: 4.0 },
    ],
  },

  // ── 炎症 ──
  {
    key: 'crp',
    label: 'CRP',
    unit: 'mg/dL',
    section: '炎症',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 216, label: '全年齢', normalMin: 0, normalMax: 0.5, criticalHigh: 10 },
    ],
  },

  // ── 肝機能 ──
  {
    key: 'ast',
    label: 'AST',
    unit: 'U/L',
    section: '肝機能',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 25, normalMax: 75, criticalHigh: 200 },
      { minAgeMonths: 1, maxAgeMonths: 12, label: '乳児', normalMin: 20, normalMax: 60, criticalHigh: 200 },
      { minAgeMonths: 12, maxAgeMonths: 216, label: '小児', normalMin: 10, normalMax: 40, criticalHigh: 200 },
    ],
  },
  {
    key: 'alt',
    label: 'ALT',
    unit: 'U/L',
    section: '肝機能',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 5, normalMax: 50, criticalHigh: 200 },
      { minAgeMonths: 1, maxAgeMonths: 12, label: '乳児', normalMin: 5, normalMax: 45, criticalHigh: 200 },
      { minAgeMonths: 12, maxAgeMonths: 216, label: '小児', normalMin: 10, normalMax: 40, criticalHigh: 200 },
    ],
  },

  // ── 脂質 ──
  {
    key: 'triglycerides',
    label: 'TG',
    unit: 'mg/dL',
    section: '脂質',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 216, label: '小児', normalMin: 30, normalMax: 150, criticalHigh: 500 },
    ],
  },

  // ── 血液 ──
  {
    key: 'hemoglobin',
    label: 'Hb',
    unit: 'g/dL',
    section: '血液',
    ageRanges: [
      { minAgeMonths: 0, maxAgeMonths: 1, label: '新生児', normalMin: 14.0, normalMax: 22.0, criticalLow: 10.0 },
      { minAgeMonths: 1, maxAgeMonths: 6, label: '乳児前期', normalMin: 9.0, normalMax: 14.0, criticalLow: 7.0 },
      { minAgeMonths: 6, maxAgeMonths: 24, label: '乳児後期', normalMin: 10.5, normalMax: 13.5, criticalLow: 7.0 },
      { minAgeMonths: 24, maxAgeMonths: 72, label: '幼児', normalMin: 11.0, normalMax: 14.0, criticalLow: 7.0 },
      { minAgeMonths: 72, maxAgeMonths: 144, label: '学童', normalMin: 11.5, normalMax: 15.5, criticalLow: 7.0 },
      { minAgeMonths: 144, maxAgeMonths: 216, label: '思春期', normalMin: 12.0, normalMax: 16.0, criticalLow: 7.0 },
    ],
  },
] as const;

/**
 * Find the matching age range for a given lab key and age in months.
 * Returns undefined when no range covers the provided age.
 */
export function findAgeRange(
  reference: PediatricLabReference,
  ageInMonths: number,
): AgeRangeReference | undefined {
  return reference.ageRanges.find(
    (range) => ageInMonths >= range.minAgeMonths && ageInMonths < range.maxAgeMonths,
  );
}
