import type { NutritionMenuData } from '../hooks/useNutritionMenus'

/**
 * ICU入室後の栄養漸増を反映したサンプルデータ。
 * Day1: 経腸少量開始 + TPN
 * Day2: 経腸増量 + TPN減量
 * Day3: 経腸さらに増量、TPN終了
 * Day4: 経腸のみで目標到達
 * Day5: メニュー微調整
 *
 * P001 = 田中太郎（65歳, 70kg, 急性心筋梗塞, ICU-1）
 * P002 = 佐藤花子（45歳, 25kg, 重症肺炎, PICU-1）
 */

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

export const sampleMenus: NutritionMenuData[] = [
  // ==========================================
  //  P001 田中太郎  Day1（5日前）
  // ==========================================
  {
    id: 'sample-001',
    patientId: 'P001',
    patientName: '田中 太郎',
    nutritionType: 'enteral',
    menuName: 'Day1 経腸栄養（開始）',
    items: [
      { id: 'i-001', productName: 'ペプタメン スタンダード', manufacturer: 'ネスレ', volume: 200, frequency: 3 },
    ],
    totalEnergy: 600,
    totalVolume: 600,
    requirements: null,
    currentIntake: { energy: 600, protein: 24 },
    notes: '10mL/hから開始、腹部膨満なし',
    activityLevel: 'bed_rest',
    stressLevel: 'high',
    medicalCondition: 'AMI post-PCI',
    createdAt: daysAgo(5),
  },
  {
    id: 'sample-002',
    patientId: 'P001',
    patientName: '田中 太郎',
    nutritionType: 'parenteral',
    menuName: 'Day1 TPN',
    items: [
      { id: 'i-002', productName: 'エルネオパNF2号', manufacturer: '大塚製薬', volume: 1000, frequency: 1 },
      { id: 'i-003', productName: 'イントラリポス20%', manufacturer: '大塚製薬', volume: 100, frequency: 1 },
    ],
    totalEnergy: 820,
    totalVolume: 1100,
    requirements: null,
    currentIntake: { energy: 820, protein: 30 },
    notes: 'CV右内頸、刺入部清潔',
    activityLevel: 'bed_rest',
    stressLevel: 'high',
    medicalCondition: 'AMI post-PCI',
    createdAt: daysAgo(5),
  },

  // ==========================================
  //  P001 田中太郎  Day2（4日前）
  // ==========================================
  {
    id: 'sample-003',
    patientId: 'P001',
    patientName: '田中 太郎',
    nutritionType: 'enteral',
    menuName: 'Day2 経腸栄養（増量）',
    items: [
      { id: 'i-004', productName: 'ペプタメン スタンダード', manufacturer: 'ネスレ', volume: 300, frequency: 3 },
    ],
    totalEnergy: 900,
    totalVolume: 900,
    requirements: null,
    currentIntake: { energy: 900, protein: 36 },
    notes: '20mL/hへ増量、GRV<200mL',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: 'AMI post-PCI',
    createdAt: daysAgo(4),
  },
  {
    id: 'sample-004',
    patientId: 'P001',
    patientName: '田中 太郎',
    nutritionType: 'parenteral',
    menuName: 'Day2 TPN減量',
    items: [
      { id: 'i-005', productName: 'エルネオパNF1号', manufacturer: '大塚製薬', volume: 1000, frequency: 1 },
    ],
    totalEnergy: 560,
    totalVolume: 1000,
    requirements: null,
    currentIntake: { energy: 560, protein: 20 },
    notes: 'TPN減量開始',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: 'AMI post-PCI',
    createdAt: daysAgo(4),
  },

  // ==========================================
  //  P001 田中太郎  Day3（3日前）
  // ==========================================
  {
    id: 'sample-005',
    patientId: 'P001',
    patientName: '田中 太郎',
    nutritionType: 'enteral',
    menuName: 'Day3 経腸栄養（目標接近）',
    items: [
      { id: 'i-006', productName: 'ペプタメン スタンダード', manufacturer: 'ネスレ', volume: 400, frequency: 3 },
      { id: 'i-007', productName: 'REF-P1', manufacturer: 'クリニコ', volume: 100, frequency: 2 },
    ],
    totalEnergy: 1400,
    totalVolume: 1400,
    requirements: null,
    currentIntake: { energy: 1400, protein: 62 },
    notes: 'TPN終了、経腸のみへ移行。蛋白強化追加',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: 'AMI post-PCI',
    createdAt: daysAgo(3),
  },

  // ==========================================
  //  P001 田中太郎  Day4（2日前）
  // ==========================================
  {
    id: 'sample-006',
    patientId: 'P001',
    patientName: '田中 太郎',
    nutritionType: 'enteral',
    menuName: 'Day4 経腸栄養（目標到達）',
    items: [
      { id: 'i-008', productName: 'ペプタメン スタンダード', manufacturer: 'ネスレ', volume: 400, frequency: 4 },
      { id: 'i-009', productName: 'REF-P1', manufacturer: 'クリニコ', volume: 100, frequency: 2 },
    ],
    totalEnergy: 1760,
    totalVolume: 1800,
    requirements: null,
    currentIntake: { energy: 1760, protein: 78 },
    notes: '目標エネルギー1750kcal到達。排便あり',
    activityLevel: 'minimal',
    stressLevel: 'low',
    medicalCondition: 'AMI post-PCI',
    createdAt: daysAgo(2),
  },

  // ==========================================
  //  P001 田中太郎  Day5（1日前）
  // ==========================================
  {
    id: 'sample-007',
    patientId: 'P001',
    patientName: '田中 太郎',
    nutritionType: 'enteral',
    menuName: 'Day5 経腸栄養（維持）',
    items: [
      { id: 'i-010', productName: 'ペプタメン スタンダード', manufacturer: 'ネスレ', volume: 400, frequency: 4 },
      { id: 'i-011', productName: 'REF-P1', manufacturer: 'クリニコ', volume: 100, frequency: 2 },
      { id: 'i-012', productName: 'OS-1ゼリー', manufacturer: '大塚製薬', volume: 200, frequency: 1 },
    ],
    totalEnergy: 1820,
    totalVolume: 2000,
    requirements: null,
    currentIntake: { energy: 1820, protein: 80 },
    notes: '水分バランス調整のためOS-1追加',
    activityLevel: 'minimal',
    stressLevel: 'low',
    medicalCondition: 'AMI post-PCI',
    createdAt: daysAgo(1),
  },

  // ==========================================
  //  P002 佐藤花子  Day1（4日前）
  // ==========================================
  {
    id: 'sample-008',
    patientId: 'P002',
    patientName: '佐藤 花子',
    nutritionType: 'parenteral',
    menuName: 'Day1 TPN',
    items: [
      { id: 'i-013', productName: 'フルカリック1号', manufacturer: 'テルモ', volume: 903, frequency: 1 },
    ],
    totalEnergy: 560,
    totalVolume: 903,
    requirements: null,
    currentIntake: { energy: 560, protein: 20 },
    notes: '経腸不耐のためTPN先行',
    activityLevel: 'bed_rest',
    stressLevel: 'high',
    medicalCondition: '重症肺炎・人工呼吸器管理',
    createdAt: daysAgo(4),
  },

  // ==========================================
  //  P002 佐藤花子  Day2（3日前）
  // ==========================================
  {
    id: 'sample-009',
    patientId: 'P002',
    patientName: '佐藤 花子',
    nutritionType: 'enteral',
    menuName: 'Day2 経腸少量開始',
    items: [
      { id: 'i-014', productName: 'エネーボ', manufacturer: 'アボット', volume: 100, frequency: 3 },
    ],
    totalEnergy: 300,
    totalVolume: 300,
    requirements: null,
    currentIntake: { energy: 300, protein: 12 },
    notes: 'トロフィックフィーディング開始 10mL/h',
    activityLevel: 'bed_rest',
    stressLevel: 'high',
    medicalCondition: '重症肺炎・人工呼吸器管理',
    createdAt: daysAgo(3),
  },
  {
    id: 'sample-010',
    patientId: 'P002',
    patientName: '佐藤 花子',
    nutritionType: 'parenteral',
    menuName: 'Day2 TPN維持',
    items: [
      { id: 'i-015', productName: 'フルカリック1号', manufacturer: 'テルモ', volume: 903, frequency: 1 },
    ],
    totalEnergy: 560,
    totalVolume: 903,
    requirements: null,
    currentIntake: { energy: 560, protein: 20 },
    notes: '経腸と併用継続',
    activityLevel: 'bed_rest',
    stressLevel: 'high',
    medicalCondition: '重症肺炎・人工呼吸器管理',
    createdAt: daysAgo(3),
  },

  // ==========================================
  //  P002 佐藤花子  Day3（2日前）
  // ==========================================
  {
    id: 'sample-011',
    patientId: 'P002',
    patientName: '佐藤 花子',
    nutritionType: 'enteral',
    menuName: 'Day3 経腸増量',
    items: [
      { id: 'i-016', productName: 'エネーボ', manufacturer: 'アボット', volume: 200, frequency: 3 },
    ],
    totalEnergy: 600,
    totalVolume: 600,
    requirements: null,
    currentIntake: { energy: 600, protein: 24 },
    notes: '20mL/hへ増量、嘔吐なし',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: '重症肺炎・人工呼吸器管理',
    createdAt: daysAgo(2),
  },

  // ==========================================
  //  P002 佐藤花子  Day4（1日前）
  // ==========================================
  {
    id: 'sample-012',
    patientId: 'P002',
    patientName: '佐藤 花子',
    nutritionType: 'enteral',
    menuName: 'Day4 経腸栄養（目標80%）',
    items: [
      { id: 'i-017', productName: 'エネーボ', manufacturer: 'アボット', volume: 250, frequency: 4 },
      { id: 'i-018', productName: 'プロテインパウダー', manufacturer: 'クリニコ', volume: 50, frequency: 2 },
    ],
    totalEnergy: 1080,
    totalVolume: 1100,
    requirements: null,
    currentIntake: { energy: 1080, protein: 52 },
    notes: '目標の約80%。明日さらに増量予定',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: '重症肺炎・人工呼吸器管理',
    createdAt: daysAgo(1),
  },
]
