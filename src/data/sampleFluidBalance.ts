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

// ─── P002 佐藤花子（35kg, 12歳, 重症肺炎 PICU）─── 人工呼吸器管理中、やや陽性
const P002_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P002', date: daysAgoDate(4),
    input: { ivFluids: 800, enteralNutrition: 200, oralIntake: 0, ivMedications: 120, other: 0 },
    output: { urine: 600, stool: 50, drains: 0, vomitOrNG: 50, other: 100 },
  },
  {
    patientId: 'P002', date: daysAgoDate(3),
    input: { ivFluids: 700, enteralNutrition: 300, oralIntake: 0, ivMedications: 100, other: 0 },
    output: { urine: 700, stool: 80, drains: 0, vomitOrNG: 20, other: 100 },
  },
  {
    patientId: 'P002', date: daysAgoDate(2),
    input: { ivFluids: 600, enteralNutrition: 500, oralIntake: 0, ivMedications: 100, other: 0 },
    output: { urine: 750, stool: 100, drains: 0, vomitOrNG: 0, other: 100 },
  },
  {
    patientId: 'P002', date: daysAgoDate(1),
    input: { ivFluids: 500, enteralNutrition: 700, oralIntake: 100, ivMedications: 80, other: 0 },
    output: { urine: 800, stool: 100, drains: 0, vomitOrNG: 0, other: 100 },
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

// ─── P004 山田美咲（62kg, 肝硬変）─── Na制限・腹水管理、利尿薬使用
const P004_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P004', date: daysAgoDate(3),
    input: { ivFluids: 600, enteralNutrition: 600, oralIntake: 0, ivMedications: 80, other: 0 },
    output: { urine: 800, stool: 100, drains: 300, vomitOrNG: 0, other: 100 },
  },
  {
    patientId: 'P004', date: daysAgoDate(2),
    input: { ivFluids: 600, enteralNutrition: 700, oralIntake: 0, ivMedications: 80, other: 0 },
    output: { urine: 900, stool: 80, drains: 250, vomitOrNG: 0, other: 100 },
  },
  {
    patientId: 'P004', date: daysAgoDate(1),
    input: { ivFluids: 600, enteralNutrition: 800, oralIntake: 100, ivMedications: 80, other: 0 },
    output: { urine: 1000, stool: 100, drains: 200, vomitOrNG: 0, other: 100 },
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

// ─── P008 中村あゆみ（60kg, ARDS・COVID後）─── 腹臥位管理中、陽性バランス
const P008_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P008', date: daysAgoDate(4),
    input: { ivFluids: 1200, enteralNutrition: 400, oralIntake: 0, ivMedications: 150, other: 0 },
    output: { urine: 900, stool: 50, drains: 0, vomitOrNG: 0, other: 200 },
  },
  {
    patientId: 'P008', date: daysAgoDate(3),
    input: { ivFluids: 1100, enteralNutrition: 600, oralIntake: 0, ivMedications: 130, other: 0 },
    output: { urine: 1000, stool: 80, drains: 0, vomitOrNG: 0, other: 200 },
  },
  {
    patientId: 'P008', date: daysAgoDate(2),
    input: { ivFluids: 1000, enteralNutrition: 800, oralIntake: 0, ivMedications: 120, other: 0 },
    output: { urine: 1100, stool: 100, drains: 0, vomitOrNG: 0, other: 200 },
  },
  {
    patientId: 'P008', date: daysAgoDate(1),
    input: { ivFluids: 900, enteralNutrition: 1000, oralIntake: 0, ivMedications: 100, other: 0 },
    output: { urine: 1200, stool: 100, drains: 0, vomitOrNG: 0, other: 200 },
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

// ─── P010 加藤節子（42kg, 85歳, サルコペニア）─── 一般病棟、経口摂取中
const P010_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P010', date: daysAgoDate(3),
    input: { ivFluids: 500, enteralNutrition: 0, oralIntake: 800, ivMedications: 50, other: 0 },
    output: { urine: 900, stool: 100, drains: 0, vomitOrNG: 0, other: 150 },
  },
  {
    patientId: 'P010', date: daysAgoDate(2),
    input: { ivFluids: 500, enteralNutrition: 0, oralIntake: 900, ivMedications: 50, other: 0 },
    output: { urine: 1000, stool: 100, drains: 0, vomitOrNG: 0, other: 150 },
  },
  {
    patientId: 'P010', date: daysAgoDate(1),
    input: { ivFluids: 400, enteralNutrition: 0, oralIntake: 1000, ivMedications: 50, other: 0 },
    output: { urine: 1050, stool: 100, drains: 0, vomitOrNG: 0, other: 150 },
  },
]

// ─── P011 木村蒼太（14kg, 3歳, 急性脳炎）─── 小児体重ベース水分管理
const P011_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P011', date: daysAgoDate(3),
    input: { ivFluids: 400, enteralNutrition: 200, oralIntake: 0, ivMedications: 60, other: 0 },
    output: { urine: 350, stool: 30, drains: 0, vomitOrNG: 30, other: 80 },
  },
  {
    patientId: 'P011', date: daysAgoDate(2),
    input: { ivFluids: 380, enteralNutrition: 280, oralIntake: 0, ivMedications: 50, other: 0 },
    output: { urine: 400, stool: 50, drains: 0, vomitOrNG: 0, other: 80 },
  },
  {
    patientId: 'P011', date: daysAgoDate(1),
    input: { ivFluids: 350, enteralNutrition: 350, oralIntake: 50, ivMedications: 50, other: 0 },
    output: { urine: 450, stool: 50, drains: 0, vomitOrNG: 0, other: 80 },
  },
]

// ─── P012 松本凛（1.8kg, 早産児32週 NICU）─── 超微量管理、mL/kg/日
const P012_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P012', date: daysAgoDate(4),
    input: { ivFluids: 80, enteralNutrition: 30, oralIntake: 0, ivMedications: 5, other: 0 },
    output: { urine: 60, stool: 5, drains: 0, vomitOrNG: 3, other: 10 },
  },
  {
    patientId: 'P012', date: daysAgoDate(3),
    input: { ivFluids: 75, enteralNutrition: 45, oralIntake: 0, ivMedications: 5, other: 0 },
    output: { urine: 70, stool: 8, drains: 0, vomitOrNG: 2, other: 10 },
  },
  {
    patientId: 'P012', date: daysAgoDate(2),
    input: { ivFluids: 70, enteralNutrition: 60, oralIntake: 0, ivMedications: 5, other: 0 },
    output: { urine: 75, stool: 10, drains: 0, vomitOrNG: 0, other: 10 },
  },
  {
    patientId: 'P012', date: daysAgoDate(1),
    input: { ivFluids: 60, enteralNutrition: 80, oralIntake: 0, ivMedications: 5, other: 0 },
    output: { urine: 80, stool: 12, drains: 0, vomitOrNG: 0, other: 10 },
  },
]

// ─── P013 井上大翔（28kg, 8歳, 虫垂炎術後）─── 術後輸液漸減、経腸開始
const P013_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P013', date: daysAgoDate(4),
    input: { ivFluids: 1000, enteralNutrition: 0, oralIntake: 0, ivMedications: 80, other: 0 },
    output: { urine: 700, stool: 0, drains: 150, vomitOrNG: 0, other: 150 },
  },
  {
    patientId: 'P013', date: daysAgoDate(3),
    input: { ivFluids: 800, enteralNutrition: 200, oralIntake: 0, ivMedications: 70, other: 0 },
    output: { urine: 750, stool: 50, drains: 100, vomitOrNG: 0, other: 150 },
  },
  {
    patientId: 'P013', date: daysAgoDate(2),
    input: { ivFluids: 600, enteralNutrition: 400, oralIntake: 0, ivMedications: 60, other: 0 },
    output: { urine: 700, stool: 80, drains: 50, vomitOrNG: 0, other: 120 },
  },
  {
    patientId: 'P013', date: daysAgoDate(1),
    input: { ivFluids: 400, enteralNutrition: 500, oralIntake: 100, ivMedications: 50, other: 0 },
    output: { urine: 750, stool: 100, drains: 30, vomitOrNG: 0, other: 100 },
  },
]

// ─── P014 斎藤結衣（30kg, 15歳, 神経性やせ症）─── 慎重Refeeding、水分バランス注意
const P014_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P014', date: daysAgoDate(5),
    input: { ivFluids: 300, enteralNutrition: 100, oralIntake: 0, ivMedications: 50, other: 0 },
    output: { urine: 350, stool: 30, drains: 0, vomitOrNG: 0, other: 80 },
  },
  {
    patientId: 'P014', date: daysAgoDate(4),
    input: { ivFluids: 300, enteralNutrition: 150, oralIntake: 50, ivMedications: 50, other: 0 },
    output: { urine: 400, stool: 50, drains: 0, vomitOrNG: 0, other: 80 },
  },
  {
    patientId: 'P014', date: daysAgoDate(3),
    input: { ivFluids: 280, enteralNutrition: 200, oralIntake: 100, ivMedications: 50, other: 0 },
    output: { urine: 420, stool: 50, drains: 0, vomitOrNG: 0, other: 80 },
  },
  {
    patientId: 'P014', date: daysAgoDate(2),
    input: { ivFluids: 250, enteralNutrition: 250, oralIntake: 150, ivMedications: 50, other: 0 },
    output: { urine: 450, stool: 80, drains: 0, vomitOrNG: 0, other: 80 },
  },
  {
    patientId: 'P014', date: daysAgoDate(1),
    input: { ivFluids: 200, enteralNutrition: 300, oralIntake: 200, ivMedications: 50, other: 0 },
    output: { urine: 500, stool: 80, drains: 0, vomitOrNG: 0, other: 80 },
  },
]

// ─── P015 清水陽向（7.5kg, 1歳, ファロー四徴症術後）─── 心不全・水分制限
const P015_FLUID: FluidBalanceEntry[] = [
  {
    patientId: 'P015', date: daysAgoDate(3),
    input: { ivFluids: 200, enteralNutrition: 300, oralIntake: 0, ivMedications: 40, other: 0 },
    output: { urine: 300, stool: 30, drains: 50, vomitOrNG: 0, other: 60 },
  },
  {
    patientId: 'P015', date: daysAgoDate(2),
    input: { ivFluids: 180, enteralNutrition: 350, oralIntake: 0, ivMedications: 40, other: 0 },
    output: { urine: 330, stool: 40, drains: 30, vomitOrNG: 0, other: 60 },
  },
  {
    patientId: 'P015', date: daysAgoDate(1),
    input: { ivFluids: 150, enteralNutrition: 400, oralIntake: 50, ivMedications: 40, other: 0 },
    output: { urine: 360, stool: 40, drains: 20, vomitOrNG: 0, other: 60 },
  },
]

/**
 * 全患者の水分出納データ（Record<patientId, FluidBalanceEntry[]>）
 * useFluidBalanceのseedデータとして使用
 */
export const sampleFluidBalanceMap: Record<string, FluidBalanceEntry[]> = {
  P001: P001_FLUID,
  P002: P002_FLUID,
  P003: P003_FLUID,
  P004: P004_FLUID,
  P005: P005_FLUID,
  P006: P006_FLUID,
  P007: P007_FLUID,
  P008: P008_FLUID,
  P009: P009_FLUID,
  P010: P010_FLUID,
  P011: P011_FLUID,
  P012: P012_FLUID,
  P013: P013_FLUID,
  P014: P014_FLUID,
  P015: P015_FLUID,
}

/** Flat array of all fluid balance entries */
export const allSampleFluidBalance: readonly FluidBalanceEntry[] = Object.values(
  sampleFluidBalanceMap,
).flat()
