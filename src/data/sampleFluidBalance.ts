import type { FluidBalanceEntry } from '../types/fluidBalance'

/**
 * ICU患者の水分出納サンプルデータ
 * 各患者に3-5日分の時系列データを持たせてトレンド確認可能に
 */

function daysAgoDate(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// ─── P001 田中太郎（70kg, AMI, ワルファリン）─── やや陽性バランス
const P001_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P001', date: daysAgoDate(3),
    input: { ivFluids: 1500, enteralNutrition: 600, oralIntake: 0, ivMedications: 100, other: 0 },
    output: { urine: 1200, stool: 100, drains: 0, vomitOrNG: 0, other: 200 },
  },
  {
    patientId: 'P001', date: daysAgoDate(2),
    input: { ivFluids: 1400, enteralNutrition: 700, oralIntake: 100, ivMedications: 100, other: 0 },
    output: { urine: 1400, stool: 150, drains: 0, vomitOrNG: 0, other: 200 },
  },
  {
    patientId: 'P001', date: daysAgoDate(1),
    input: { ivFluids: 1300, enteralNutrition: 800, oralIntake: 200, ivMedications: 80, other: 0 },
    output: { urine: 1600, stool: 100, drains: 0, vomitOrNG: 0, other: 200 },
  },
]

// ─── P003 鈴木一郎（58kg, CKD4）─── 水分制限中、乏尿で陽性バランス（問題あり）
const P003_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P003', date: daysAgoDate(3),
    input: { ivFluids: 500, enteralNutrition: 800, oralIntake: 0, ivMedications: 50, other: 0 },
    output: { urine: 400, stool: 50, drains: 0, vomitOrNG: 0, other: 150 },
  },
  {
    patientId: 'P003', date: daysAgoDate(2),
    input: { ivFluids: 500, enteralNutrition: 800, oralIntake: 0, ivMedications: 50, other: 0 },
    output: { urine: 450, stool: 80, drains: 0, vomitOrNG: 0, other: 150 },
  },
  {
    patientId: 'P003', date: daysAgoDate(1),
    input: { ivFluids: 500, enteralNutrition: 800, oralIntake: 0, ivMedications: 50, other: 0 },
    output: { urine: 600, stool: 50, drains: 0, vomitOrNG: 0, other: 150 },
  },
]

// ─── P005 高橋健太（75kg, 熱傷40%）─── 大量輸液蘇生、高度陽性バランス
const P005_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P005', date: daysAgoDate(4),
    input: { ivFluids: 4000, enteralNutrition: 500, oralIntake: 0, ivMedications: 300, other: 200 },
    output: { urine: 1800, stool: 0, drains: 500, vomitOrNG: 0, other: 400 },
  },
  {
    patientId: 'P005', date: daysAgoDate(3),
    input: { ivFluids: 3500, enteralNutrition: 1000, oralIntake: 0, ivMedications: 250, other: 200 },
    output: { urine: 2000, stool: 50, drains: 500, vomitOrNG: 0, other: 400 },
  },
  {
    patientId: 'P005', date: daysAgoDate(2),
    input: { ivFluids: 3000, enteralNutrition: 1200, oralIntake: 0, ivMedications: 200, other: 150 },
    output: { urine: 2000, stool: 100, drains: 450, vomitOrNG: 0, other: 350 },
  },
  {
    patientId: 'P005', date: daysAgoDate(1),
    input: { ivFluids: 3000, enteralNutrition: 1500, oralIntake: 0, ivMedications: 200, other: 100 },
    output: { urine: 2200, stool: 100, drains: 400, vomitOrNG: 0, other: 350 },
  },
]

// ─── P006 小林幸子（32kg, Refeeding高リスク）─── 慎重投与、やや陰性バランス
const P006_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P006', date: daysAgoDate(4),
    input: { ivFluids: 500, enteralNutrition: 100, oralIntake: 0, ivMedications: 30, other: 0 },
    output: { urine: 500, stool: 50, drains: 0, vomitOrNG: 0, other: 100 },
  },
  {
    patientId: 'P006', date: daysAgoDate(3),
    input: { ivFluids: 500, enteralNutrition: 150, oralIntake: 0, ivMedications: 30, other: 0 },
    output: { urine: 550, stool: 50, drains: 0, vomitOrNG: 0, other: 100 },
  },
  {
    patientId: 'P006', date: daysAgoDate(2),
    input: { ivFluids: 500, enteralNutrition: 200, oralIntake: 50, ivMedications: 30, other: 0 },
    output: { urine: 600, stool: 80, drains: 0, vomitOrNG: 0, other: 100 },
  },
  {
    patientId: 'P006', date: daysAgoDate(1),
    input: { ivFluids: 450, enteralNutrition: 250, oralIntake: 100, ivMedications: 30, other: 0 },
    output: { urine: 650, stool: 80, drains: 0, vomitOrNG: 50, other: 100 },
  },
]

// ─── P007 渡辺大輔（88kg, DM+敗血症）─── 積極的輸液蘇生、陽性バランス
const P007_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P007', date: daysAgoDate(3),
    input: { ivFluids: 2500, enteralNutrition: 600, oralIntake: 0, ivMedications: 200, other: 100 },
    output: { urine: 1200, stool: 100, drains: 0, vomitOrNG: 0, other: 300 },
  },
  {
    patientId: 'P007', date: daysAgoDate(2),
    input: { ivFluids: 2500, enteralNutrition: 800, oralIntake: 0, ivMedications: 200, other: 50 },
    output: { urine: 1500, stool: 150, drains: 0, vomitOrNG: 0, other: 300 },
  },
  {
    patientId: 'P007', date: daysAgoDate(1),
    input: { ivFluids: 2200, enteralNutrition: 800, oralIntake: 0, ivMedications: 200, other: 50 },
    output: { urine: 1500, stool: 100, drains: 0, vomitOrNG: 100, other: 300 },
  },
]

// ─── P009 伊藤正義（65kg, CABG+心不全）─── 水分制限、利尿薬で陰性バランス目標
const P009_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P009', date: daysAgoDate(3),
    input: { ivFluids: 800, enteralNutrition: 600, oralIntake: 0, ivMedications: 100, other: 0 },
    output: { urine: 1200, stool: 100, drains: 200, vomitOrNG: 0, other: 200 },
  },
  {
    patientId: 'P009', date: daysAgoDate(2),
    input: { ivFluids: 800, enteralNutrition: 600, oralIntake: 100, ivMedications: 80, other: 0 },
    output: { urine: 1300, stool: 100, drains: 150, vomitOrNG: 0, other: 200 },
  },
  {
    patientId: 'P009', date: daysAgoDate(1),
    input: { ivFluids: 800, enteralNutrition: 600, oralIntake: 100, ivMedications: 80, other: 0 },
    output: { urine: 1400, stool: 80, drains: 100, vomitOrNG: 0, other: 200 },
  },
]

/**
 * 全患者の水分出納データ（Record<patientId, FluidBalanceEntry[]>）
 * useFluidBalanceのseedデータとして使用
 */
export const sampleFluidBalanceMap: Record<string, FluidBalanceEntry[]> = {
  P001: P001_FLUID,
  P003: P003_FLUID,
  P005: P005_FLUID,
  P006: P006_FLUID,
  P007: P007_FLUID,
  P009: P009_FLUID,
}

/** Flat array of all fluid balance entries */
export const allSampleFluidBalance: readonly FluidBalanceEntry[] = Object.values(
  sampleFluidBalanceMap,
).flat()
