// 検査値の型定義

export interface LabValue {
  readonly value: number;
  readonly date: string; // ISO date string
}

export interface LabData {
  readonly patientId: string;
  readonly date: string;
  // 蛋白
  readonly albumin?: number;       // Alb (g/dL)
  readonly prealbumin?: number;    // PreAlb (mg/dL)
  // 腎機能
  readonly bun?: number;           // BUN (mg/dL)
  readonly creatinine?: number;    // Cr (mg/dL)
  // 血糖
  readonly bloodSugar?: number;    // BS (mg/dL)
  readonly hba1c?: number;         // HbA1c (%)
  // 電解質
  readonly sodium?: number;        // Na (mEq/L)
  readonly potassium?: number;     // K (mEq/L)
  readonly chloride?: number;      // Cl (mEq/L)
  readonly calcium?: number;       // Ca (mg/dL)
  readonly magnesium?: number;     // Mg (mg/dL)
  readonly phosphorus?: number;    // P (mg/dL)
  // 炎症
  readonly crp?: number;           // CRP (mg/dL)
  // 肝機能
  readonly ast?: number;           // AST (U/L)
  readonly alt?: number;           // ALT (U/L)
  readonly totalBilirubin?: number; // T-Bil (mg/dL)
  // 脂質
  readonly triglycerides?: number; // TG (mg/dL)
  // 血液
  readonly hemoglobin?: number;    // Hb (g/dL)
}

export type LabStatus = 'normal' | 'high' | 'low' | 'critical-high' | 'critical-low';

export interface LabInterpretation {
  readonly parameter: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly status: LabStatus;
  readonly message: string;
  readonly normalRange: string;
}

export interface LabReference {
  readonly key: keyof Omit<LabData, 'patientId' | 'date'>;
  readonly label: string;
  readonly unit: string;
  readonly normalMin: number;
  readonly normalMax: number;
  readonly criticalLow?: number;
  readonly criticalHigh?: number;
  readonly section: LabSection;
}

export type LabSection = '蛋白' | '腎機能' | '血糖' | '電解質' | '炎症' | '肝機能' | '脂質' | '血液';

export interface RecommendedProduct {
  readonly product: Record<string, string | number>;
  readonly rationale: string;
  readonly suggestedVolume?: string;
}

export interface NutritionRecommendation {
  readonly priority: 'high' | 'medium' | 'low';
  readonly category: string;
  readonly reasoning: string;
  readonly products: readonly RecommendedProduct[];
}

export const LAB_REFERENCES: readonly LabReference[] = [
  // 蛋白
  { key: 'albumin', label: 'Alb', unit: 'g/dL', normalMin: 3.5, normalMax: 5.0, criticalLow: 2.5, section: '蛋白' },
  { key: 'prealbumin', label: 'PreAlb', unit: 'mg/dL', normalMin: 20, normalMax: 40, criticalLow: 10, section: '蛋白' },
  // 腎機能
  { key: 'bun', label: 'BUN', unit: 'mg/dL', normalMin: 8, normalMax: 20, criticalHigh: 40, section: '腎機能' },
  { key: 'creatinine', label: 'Cr', unit: 'mg/dL', normalMin: 0.6, normalMax: 1.2, criticalHigh: 3.0, section: '腎機能' },
  // 血糖
  { key: 'bloodSugar', label: 'BS', unit: 'mg/dL', normalMin: 70, normalMax: 140, criticalLow: 50, criticalHigh: 250, section: '血糖' },
  { key: 'hba1c', label: 'HbA1c', unit: '%', normalMin: 4.0, normalMax: 6.0, criticalHigh: 8.0, section: '血糖' },
  // 電解質
  { key: 'sodium', label: 'Na', unit: 'mEq/L', normalMin: 135, normalMax: 145, criticalLow: 125, criticalHigh: 155, section: '電解質' },
  { key: 'potassium', label: 'K', unit: 'mEq/L', normalMin: 3.5, normalMax: 5.0, criticalLow: 2.5, criticalHigh: 6.5, section: '電解質' },
  { key: 'chloride', label: 'Cl', unit: 'mEq/L', normalMin: 98, normalMax: 108, criticalLow: 85, criticalHigh: 115, section: '電解質' },
  { key: 'calcium', label: 'Ca', unit: 'mg/dL', normalMin: 8.5, normalMax: 10.5, criticalLow: 7.0, criticalHigh: 12.0, section: '電解質' },
  { key: 'magnesium', label: 'Mg', unit: 'mg/dL', normalMin: 1.8, normalMax: 2.5, criticalLow: 1.2, criticalHigh: 4.0, section: '電解質' },
  { key: 'phosphorus', label: 'P', unit: 'mg/dL', normalMin: 2.5, normalMax: 4.5, criticalLow: 1.5, criticalHigh: 6.0, section: '電解質' },
  // 炎症
  { key: 'crp', label: 'CRP', unit: 'mg/dL', normalMin: 0, normalMax: 0.5, criticalHigh: 10, section: '炎症' },
  // 肝機能
  { key: 'ast', label: 'AST', unit: 'U/L', normalMin: 10, normalMax: 40, criticalHigh: 200, section: '肝機能' },
  { key: 'alt', label: 'ALT', unit: 'U/L', normalMin: 5, normalMax: 45, criticalHigh: 200, section: '肝機能' },
  { key: 'totalBilirubin', label: 'T-Bil', unit: 'mg/dL', normalMin: 0.2, normalMax: 1.2, criticalHigh: 3.0, section: '肝機能' },
  // 脂質
  { key: 'triglycerides', label: 'TG', unit: 'mg/dL', normalMin: 50, normalMax: 150, criticalHigh: 500, section: '脂質' },
  // 血液
  { key: 'hemoglobin', label: 'Hb', unit: 'g/dL', normalMin: 12, normalMax: 17, criticalLow: 7.0, section: '血液' },
] as const;
