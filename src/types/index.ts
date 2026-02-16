import type { LabData } from "./labData";

// 患者データの型定義
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  ward: string;
  admissionDate: string;
  dischargeDate: string;
  patientType: string;
  weight: number;
  height: number;
  diagnosis: string;
  allergies: string[];
  medications: string[];
  notes: string;
  labData?: LabData;
}

// 食品データの型定義
export interface Food {
  id: string;
  name: string;
  category: string;
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
}

// 栄養計算結果の型定義
export interface NutritionCalculation {
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
}

// 栄養タイプ
export type NutritionType = "enteral" | "parenteral";

// 栄養製品
export interface NutritionProduct {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  subCategory: string;
  volume: number; // ml
  energy: number; // kcal/ml
  protein: number; // g/100ml
  fat: number; // g/100ml
  carbs: number; // g/100ml
  glucose: number; // %
  aminoAcids: number; // %
  lipids: number; // %
  fiber: number; // g/100ml
  sodium: number; // mEq/L
  potassium: number; // mEq/L
  calcium: number; // mEq/L
  magnesium: number; // mEq/L
  phosphorus: number; // mEq/L
  chloride: number; // mEq/L
  iron: number; // mg/100ml
  zinc: number; // mg/100ml
  copper: number; // mg/100ml
  manganese: number; // mg/100ml
  iodine: number; // μg/100ml
  selenium: number; // μg/100ml
  administrationRoute: string;
  nutritionType: NutritionType;
}

// 栄養メニューアイテム
export interface NutritionMenuItem {
  product: NutritionProduct;
  volume: number; // ml
  frequency: number; // 回/日
}

// 栄養メニュー
export interface NutritionMenu {
  id: string;
  patientId: string;
  menuName: string;
  nutritionType: NutritionType;
  items: NutritionMenuItem[];
  totalEnergy: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalVolume: number;
  createdAt: string;
  notes?: string;
}

// 栄養要件
export interface NutritionRequirements {
  energy: number; // kcal/day
  protein: number; // g/day
  fat: number; // g/day
  carbs: number; // g/day
  sodium: number; // mEq/day
  potassium: number; // mEq/day
  calcium: number; // mEq/day
  magnesium: number; // mEq/day
  phosphorus: number; // mEq/day
  chloride: number; // mEq/day
  iron: number; // mg/day
  zinc: number; // mg/day
  copper: number; // mg/day
  manganese: number; // mg/day
  iodine: number; // μg/day
  selenium: number; // μg/day
}

// 栄養分析結果
export interface NutritionAnalysis {
  requirements: NutritionRequirements;
  currentIntake: NutritionRequirements;
  deficiencies: {
    energy: number;
    protein: number;
    fat: number;
    carbs: number;
    sodium: number;
    potassium: number;
    calcium: number;
    magnesium: number;
    phosphorus: number;
    chloride: number;
    iron: number;
    zinc: number;
    copper: number;
    manganese: number;
    iodine: number;
    selenium: number;
  };
  recommendations: string[];
  riskFactors: string[];
}
