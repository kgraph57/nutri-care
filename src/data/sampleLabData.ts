import type { LabData } from '../types/labData'

/**
 * 各患者の検査値シミュレーション
 * 正常・軽度異常・重度異常・重篤をカバー
 *
 * 各患者に2-3日分の時系列データを持たせてトレンド確認可能に
 */

function daysAgoDate(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// ─── P001 田中太郎（AMI, ワルファリン）─── 軽度炎症、電解質ほぼ正常
const P001_LAB: LabData[] = [
  {
    patientId: 'P001', date: daysAgoDate(3),
    albumin: 3.2, prealbumin: 18,
    bun: 18, creatinine: 1.0,
    bloodSugar: 130, hba1c: 5.8,
    sodium: 140, potassium: 4.2, chloride: 102, calcium: 9.0, magnesium: 2.0, phosphorus: 3.5,
    crp: 2.5,
    ast: 45, alt: 38, totalBilirubin: 0.8,
    triglycerides: 120, hemoglobin: 12.5,
  },
  {
    patientId: 'P001', date: daysAgoDate(1),
    albumin: 3.4, prealbumin: 22,
    bun: 16, creatinine: 0.9,
    bloodSugar: 115, hba1c: 5.8,
    sodium: 141, potassium: 4.0, chloride: 103, calcium: 9.2, magnesium: 2.1, phosphorus: 3.6,
    crp: 1.2,
    ast: 35, alt: 30, totalBilirubin: 0.7,
    triglycerides: 110, hemoglobin: 12.8,
  },
]

// ─── P002 佐藤花子（12歳, 重症肺炎）─── 高CRP→改善傾向
const P002_LAB: LabData[] = [
  {
    patientId: 'P002', date: daysAgoDate(4),
    albumin: 2.8, prealbumin: 12,
    bun: 12, creatinine: 0.4,
    bloodSugar: 95,
    sodium: 137, potassium: 3.8, chloride: 100, calcium: 8.8, magnesium: 1.9, phosphorus: 4.0,
    crp: 15.2,
    ast: 30, alt: 22, totalBilirubin: 0.5,
    hemoglobin: 11.0,
  },
  {
    patientId: 'P002', date: daysAgoDate(2),
    albumin: 2.9, prealbumin: 14,
    bun: 10, creatinine: 0.4,
    bloodSugar: 100,
    sodium: 138, potassium: 4.0, chloride: 101, calcium: 9.0, magnesium: 2.0, phosphorus: 3.8,
    crp: 8.5,
    ast: 25, alt: 20, totalBilirubin: 0.4,
    hemoglobin: 11.2,
  },
]

// ─── P003 鈴木一郎（CKD4）─── 高BUN/Cr, 低Ca, 高P, 高K
const P003_LAB: LabData[] = [
  {
    patientId: 'P003', date: daysAgoDate(3),
    albumin: 3.0, prealbumin: 15,
    bun: 52, creatinine: 4.2,
    bloodSugar: 105,
    sodium: 136, potassium: 5.8, chloride: 105, calcium: 7.5, magnesium: 2.4, phosphorus: 5.5,
    crp: 0.8,
    ast: 22, alt: 18, totalBilirubin: 0.6,
    triglycerides: 180, hemoglobin: 9.5,
  },
  {
    patientId: 'P003', date: daysAgoDate(1),
    albumin: 3.1, prealbumin: 16,
    bun: 48, creatinine: 4.0,
    bloodSugar: 98,
    sodium: 137, potassium: 5.5, chloride: 104, calcium: 7.8, magnesium: 2.3, phosphorus: 5.2,
    crp: 0.6,
    ast: 20, alt: 16, totalBilirubin: 0.5,
    triglycerides: 170, hemoglobin: 9.8,
  },
]

// ─── P004 山田美咲（肝硬変 Child-Pugh C）─── 高AST/ALT/Bil, 低Alb, 高NH3
const P004_LAB: LabData[] = [
  {
    patientId: 'P004', date: daysAgoDate(3),
    albumin: 2.0, prealbumin: 8,
    bun: 25, creatinine: 1.1,
    bloodSugar: 80,
    sodium: 128, potassium: 3.2, chloride: 92, calcium: 7.8, magnesium: 1.5, phosphorus: 2.8,
    crp: 1.5,
    ast: 180, alt: 120, totalBilirubin: 4.5,
    triglycerides: 85, hemoglobin: 8.5,
  },
  {
    patientId: 'P004', date: daysAgoDate(1),
    albumin: 2.1, prealbumin: 9,
    bun: 22, creatinine: 1.0,
    bloodSugar: 85,
    sodium: 130, potassium: 3.4, chloride: 94, calcium: 8.0, magnesium: 1.6, phosphorus: 3.0,
    crp: 1.2,
    ast: 160, alt: 100, totalBilirubin: 3.8,
    triglycerides: 90, hemoglobin: 8.8,
  },
]

// ─── P005 高橋健太（熱傷40%）─── 高CRP, 低Alb, 微量元素低下
const P005_LAB: LabData[] = [
  {
    patientId: 'P005', date: daysAgoDate(4),
    albumin: 1.8, prealbumin: 6,
    bun: 30, creatinine: 1.3,
    bloodSugar: 180,
    sodium: 142, potassium: 3.5, chloride: 100, calcium: 7.2, magnesium: 1.4, phosphorus: 2.2,
    crp: 25.0,
    ast: 65, alt: 55, totalBilirubin: 1.0,
    triglycerides: 250, hemoglobin: 10.0,
  },
  {
    patientId: 'P005', date: daysAgoDate(2),
    albumin: 2.0, prealbumin: 8,
    bun: 28, creatinine: 1.2,
    bloodSugar: 160,
    sodium: 140, potassium: 3.8, chloride: 101, calcium: 7.5, magnesium: 1.6, phosphorus: 2.5,
    crp: 18.0,
    ast: 55, alt: 45, totalBilirubin: 0.9,
    triglycerides: 220, hemoglobin: 10.5,
  },
]

// ─── P006 小林幸子（Refeeding高リスク）─── 超低Alb, 低P/K/Mg → 改善
const P006_LAB: LabData[] = [
  {
    patientId: 'P006', date: daysAgoDate(4),
    albumin: 1.5, prealbumin: 5,
    bun: 8, creatinine: 0.5,
    bloodSugar: 65,
    sodium: 132, potassium: 2.8, chloride: 95, calcium: 7.0, magnesium: 1.2, phosphorus: 1.5,
    crp: 3.0,
    ast: 18, alt: 12, totalBilirubin: 0.4,
    triglycerides: 60, hemoglobin: 8.0,
  },
  {
    patientId: 'P006', date: daysAgoDate(2),
    albumin: 1.6, prealbumin: 6,
    bun: 10, creatinine: 0.5,
    bloodSugar: 75,
    sodium: 134, potassium: 3.2, chloride: 97, calcium: 7.5, magnesium: 1.5, phosphorus: 2.0,
    crp: 2.5,
    ast: 16, alt: 11, totalBilirubin: 0.4,
    triglycerides: 65, hemoglobin: 8.2,
  },
  {
    patientId: 'P006', date: daysAgoDate(0),
    albumin: 1.8, prealbumin: 8,
    bun: 12, creatinine: 0.5,
    bloodSugar: 85,
    sodium: 136, potassium: 3.5, chloride: 99, calcium: 8.0, magnesium: 1.7, phosphorus: 2.5,
    crp: 2.0,
    ast: 15, alt: 10, totalBilirubin: 0.3,
    triglycerides: 70, hemoglobin: 8.5,
  },
]

// ─── P007 渡辺大輔（DM+敗血症）─── 高血糖, 高CRP, 高WBC
const P007_LAB: LabData[] = [
  {
    patientId: 'P007', date: daysAgoDate(3),
    albumin: 2.5, prealbumin: 10,
    bun: 35, creatinine: 1.5,
    bloodSugar: 280, hba1c: 9.2,
    sodium: 138, potassium: 4.5, chloride: 100, calcium: 8.5, magnesium: 1.8, phosphorus: 3.2,
    crp: 22.0,
    ast: 50, alt: 42, totalBilirubin: 1.0,
    triglycerides: 300, hemoglobin: 11.0,
  },
  {
    patientId: 'P007', date: daysAgoDate(1),
    albumin: 2.6, prealbumin: 12,
    bun: 30, creatinine: 1.3,
    bloodSugar: 200, hba1c: 9.2,
    sodium: 139, potassium: 4.3, chloride: 101, calcium: 8.8, magnesium: 1.9, phosphorus: 3.4,
    crp: 12.0,
    ast: 40, alt: 35, totalBilirubin: 0.8,
    triglycerides: 250, hemoglobin: 11.5,
  },
]

// ─── P009 伊藤正義（CABG+心不全）─── 利尿薬→低K/Mg, Na制限中
const P009_LAB: LabData[] = [
  {
    patientId: 'P009', date: daysAgoDate(3),
    albumin: 3.0, prealbumin: 16,
    bun: 22, creatinine: 1.2,
    bloodSugar: 110,
    sodium: 133, potassium: 3.0, chloride: 96, calcium: 8.5, magnesium: 1.4, phosphorus: 3.0,
    crp: 4.0,
    ast: 28, alt: 25, totalBilirubin: 0.7,
    triglycerides: 140, hemoglobin: 10.5,
  },
  {
    patientId: 'P009', date: daysAgoDate(1),
    albumin: 3.2, prealbumin: 18,
    bun: 20, creatinine: 1.1,
    bloodSugar: 105,
    sodium: 135, potassium: 3.5, chloride: 98, calcium: 8.8, magnesium: 1.7, phosphorus: 3.2,
    crp: 2.5,
    ast: 25, alt: 22, totalBilirubin: 0.6,
    triglycerides: 130, hemoglobin: 11.0,
  },
]

// ─── P010 加藤節子（サルコペニア）─── 低Alb, 正常電解質
const P010_LAB: LabData[] = [
  {
    patientId: 'P010', date: daysAgoDate(2),
    albumin: 2.8, prealbumin: 14,
    bun: 14, creatinine: 0.7,
    bloodSugar: 90,
    sodium: 139, potassium: 4.0, chloride: 102, calcium: 8.8, magnesium: 2.0, phosphorus: 3.5,
    crp: 0.8,
    ast: 20, alt: 15, totalBilirubin: 0.5,
    triglycerides: 100, hemoglobin: 10.0,
  },
]

// ─── P011 木村蒼太（3歳 脳炎）─── 小児基準値、高CRP
const P011_LAB: LabData[] = [
  {
    patientId: 'P011', date: daysAgoDate(3),
    albumin: 3.0, prealbumin: 14,
    bun: 10, creatinine: 0.3,
    bloodSugar: 110,
    sodium: 136, potassium: 4.2, chloride: 100, calcium: 9.5, magnesium: 2.0, phosphorus: 5.0,
    crp: 8.0,
    ast: 25, alt: 18, totalBilirubin: 0.3,
    hemoglobin: 11.5,
  },
  {
    patientId: 'P011', date: daysAgoDate(1),
    albumin: 3.2, prealbumin: 16,
    bun: 8, creatinine: 0.3,
    bloodSugar: 100,
    sodium: 138, potassium: 4.0, chloride: 101, calcium: 9.8, magnesium: 2.1, phosphorus: 4.8,
    crp: 4.0,
    ast: 22, alt: 15, totalBilirubin: 0.3,
    hemoglobin: 11.8,
  },
]

// ─── P012 松本凛（NICU早産児）─── 新生児基準値
const P012_LAB: LabData[] = [
  {
    patientId: 'P012', date: daysAgoDate(4),
    albumin: 2.5,
    bun: 5, creatinine: 0.8,
    bloodSugar: 55,
    sodium: 134, potassium: 5.5, chloride: 100, calcium: 8.0, magnesium: 1.8, phosphorus: 5.5,
    crp: 0.5,
    ast: 35, alt: 10, totalBilirubin: 8.0,
    hemoglobin: 16.0,
  },
  {
    patientId: 'P012', date: daysAgoDate(1),
    albumin: 2.6,
    bun: 8, creatinine: 0.6,
    bloodSugar: 70,
    sodium: 136, potassium: 5.0, chloride: 101, calcium: 8.5, magnesium: 1.9, phosphorus: 5.2,
    crp: 0.3,
    ast: 30, alt: 8, totalBilirubin: 6.0,
    hemoglobin: 15.5,
  },
]

// ─── P014 斎藤結衣（15歳 神経性やせ症）─── 超低P, 低K/Mg, 低BS
const P014_LAB: LabData[] = [
  {
    patientId: 'P014', date: daysAgoDate(5),
    albumin: 2.2, prealbumin: 8,
    bun: 20, creatinine: 0.6,
    bloodSugar: 55,
    sodium: 130, potassium: 2.5, chloride: 90, calcium: 7.5, magnesium: 1.2, phosphorus: 1.0,
    crp: 0.3,
    ast: 60, alt: 55, totalBilirubin: 0.5,
    triglycerides: 40, hemoglobin: 9.0,
  },
  {
    patientId: 'P014', date: daysAgoDate(3),
    albumin: 2.3, prealbumin: 9,
    bun: 18, creatinine: 0.6,
    bloodSugar: 65,
    sodium: 132, potassium: 3.0, chloride: 93, calcium: 7.8, magnesium: 1.5, phosphorus: 1.8,
    crp: 0.3,
    ast: 50, alt: 45, totalBilirubin: 0.4,
    triglycerides: 45, hemoglobin: 9.2,
  },
  {
    patientId: 'P014', date: daysAgoDate(1),
    albumin: 2.4, prealbumin: 10,
    bun: 16, creatinine: 0.5,
    bloodSugar: 75,
    sodium: 134, potassium: 3.3, chloride: 96, calcium: 8.0, magnesium: 1.6, phosphorus: 2.2,
    crp: 0.2,
    ast: 42, alt: 38, totalBilirubin: 0.4,
    triglycerides: 50, hemoglobin: 9.5,
  },
]

// ─── P015 清水陽向（1歳 心疾患）─── 利尿薬による低K、低Mg
const P015_LAB: LabData[] = [
  {
    patientId: 'P015', date: daysAgoDate(2),
    albumin: 3.2,
    bun: 8, creatinine: 0.2,
    bloodSugar: 85,
    sodium: 137, potassium: 3.2, chloride: 99, calcium: 9.5, magnesium: 1.5, phosphorus: 5.0,
    crp: 2.0,
    ast: 28, alt: 15, totalBilirubin: 0.4,
    hemoglobin: 12.0,
  },
  {
    patientId: 'P015', date: daysAgoDate(0),
    albumin: 3.3,
    bun: 7, creatinine: 0.2,
    bloodSugar: 90,
    sodium: 138, potassium: 3.5, chloride: 100, calcium: 9.8, magnesium: 1.7, phosphorus: 4.8,
    crp: 1.2,
    ast: 25, alt: 12, totalBilirubin: 0.3,
    hemoglobin: 12.3,
  },
]

/**
 * 全患者の検査値データ（Record<patientId, LabData[]>）
 * useLabDataのsaveLabDataで読み込み可能
 */
export const sampleLabDataMap: Record<string, LabData[]> = {
  P001: P001_LAB,
  P002: P002_LAB,
  P003: P003_LAB,
  P004: P004_LAB,
  P005: P005_LAB,
  P006: P006_LAB,
  P007: P007_LAB,
  P009: P009_LAB,
  P010: P010_LAB,
  P011: P011_LAB,
  P012: P012_LAB,
  P014: P014_LAB,
  P015: P015_LAB,
}

/** Flat array of all lab data entries */
export const allSampleLabData: readonly LabData[] = Object.values(sampleLabDataMap).flat()
