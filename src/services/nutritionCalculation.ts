import { Patient, NutritionRequirements, NutritionType } from "../types";
import {
  isPediatricPatient,
  calculatePediatricRequirements,
} from "./pediatricNutritionCalculation";

// Harris-Benedict式による基礎代謝量計算
export const calculateBasalMetabolicRate = (patient: Patient): number => {
  let bmr: number;

  if (patient.gender === "男性") {
    bmr =
      66.5 +
      13.75 * patient.weight +
      5.003 * patient.height -
      6.775 * patient.age;
  } else {
    bmr =
      655.1 +
      9.563 * patient.weight +
      1.85 * patient.height -
      4.676 * patient.age;
  }

  return bmr;
};

// 活動係数
const ACTIVITY_FACTORS = {
  bedrest: 1.0, // 安静臥床
  sedentary: 1.2, // 座位・軽い活動
  light: 1.375, // 軽い運動
  moderate: 1.55, // 中程度の運動
  active: 1.725, // 激しい運動
  veryActive: 1.9, // 非常に激しい運動
};

// ストレス係数（ICU患者用）
const STRESS_FACTORS = {
  mild: 1.0, // 軽度ストレス
  moderate: 1.2, // 中等度ストレス
  severe: 1.4, // 重度ストレス
  critical: 1.6, // 極重度ストレス
};

// 総エネルギー必要量を計算
export const calculateTotalEnergyRequirement = (
  patient: Patient,
  activityLevel: string = "bedrest",
  stressLevel: string = "moderate",
): number => {
  const bmr = calculateBasalMetabolicRate(patient);
  const activityFactor =
    ACTIVITY_FACTORS[activityLevel as keyof typeof ACTIVITY_FACTORS] || 1.0;
  const stressFactor =
    STRESS_FACTORS[stressLevel as keyof typeof STRESS_FACTORS] || 1.2;

  return bmr * activityFactor * stressFactor;
};

// 栄養要件を計算
export const calculateNutritionRequirements = (
  patient: Patient,
  nutritionType: NutritionType,
  activityLevel: string = "bedrest",
  stressLevel: string = "moderate",
): NutritionRequirements => {
  // 小児患者の場合は小児専用の計算ロジックを使用
  if (isPediatricPatient(patient)) {
    return calculatePediatricRequirements(patient, nutritionType, stressLevel);
  }

  const totalEnergy = calculateTotalEnergyRequirement(
    patient,
    activityLevel,
    stressLevel,
  );

  // 基本栄養素の計算
  let protein: number;
  let fat: number;
  let carbs: number;

  if (nutritionType === "enteral") {
    // 経腸栄養の場合
    protein = patient.weight * 1.5; // 1.5g/kg/day
    fat = (totalEnergy * 0.3) / 9; // 30% of energy from fat
    carbs = (totalEnergy - protein * 4 - fat * 9) / 4;
  } else {
    // 中心静脈栄養の場合
    protein = patient.weight * 1.2; // 1.2g/kg/day
    fat = (totalEnergy * 0.25) / 9; // 25% of energy from fat
    carbs = (totalEnergy - protein * 4 - fat * 9) / 4;
  }

  // 電解質の計算（体重ベース）
  const sodium = patient.weight * 1.5; // mEq/day
  const potassium = patient.weight * 1.0; // mEq/day
  const calcium = patient.weight * 0.5; // mEq/day
  const magnesium = patient.weight * 0.3; // mEq/day
  const phosphorus = patient.weight * 0.8; // mEq/day
  const chloride = patient.weight * 1.2; // mEq/day

  // 微量元素の計算
  const iron = patient.weight * 0.1; // mg/day
  const zinc = patient.weight * 0.05; // mg/day
  const copper = patient.weight * 0.01; // mg/day
  const manganese = patient.weight * 0.005; // mg/day
  const iodine = patient.weight * 1.5; // μg/day
  const selenium = patient.weight * 1.0; // μg/day

  return {
    energy: Math.round(totalEnergy),
    protein: Math.round(protein * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    sodium: Math.round(sodium * 10) / 10,
    potassium: Math.round(potassium * 10) / 10,
    calcium: Math.round(calcium * 10) / 10,
    magnesium: Math.round(magnesium * 10) / 10,
    phosphorus: Math.round(phosphorus * 10) / 10,
    chloride: Math.round(chloride * 10) / 10,
    iron: Math.round(iron * 100) / 100,
    zinc: Math.round(zinc * 100) / 100,
    copper: Math.round(copper * 100) / 100,
    manganese: Math.round(manganese * 100) / 100,
    iodine: Math.round(iodine * 10) / 10,
    selenium: Math.round(selenium * 10) / 10,
  };
};

// 栄養要件の調整（病態別）
export const adjustRequirementsForCondition = (
  requirements: NutritionRequirements,
  condition: string,
): NutritionRequirements => {
  const adjusted = { ...requirements };

  switch (condition) {
    case "腎不全":
      adjusted.protein *= 0.8; // 蛋白制限
      adjusted.potassium *= 0.5; // カリウム制限
      adjusted.phosphorus *= 0.5; // リン制限
      break;
    case "肝不全":
      adjusted.protein *= 0.8; // 蛋白制限
      adjusted.sodium *= 0.5; // ナトリウム制限
      break;
    case "心不全":
      adjusted.sodium *= 0.5; // ナトリウム制限
      adjusted.energy *= 0.9; // エネルギー制限
      break;
    case "糖尿病":
      adjusted.carbs *= 0.8; // 炭水化物制限
      adjusted.fat *= 1.1; // 脂質増量
      break;
    case "炎症性腸疾患":
      adjusted.protein *= 1.2; // 蛋白増量
      adjusted.energy *= 1.1; // エネルギー増量
      break;
    case "外傷・手術":
      adjusted.protein *= 1.3; // 蛋白増量
      adjusted.energy *= 1.2; // エネルギー増量
      break;
  }

  return adjusted;
};
