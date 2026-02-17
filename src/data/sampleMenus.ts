import type { NutritionMenuData } from '../hooks/useNutritionMenus'

/**
 * 多様な栄養パターンをカバーするサンプルメニュー（30メニュー）
 *
 * P001 = 田中太郎（65歳, 70kg, AMI, ワルファリン） — 経腸漸増 + TPN離脱
 * P002 = 佐藤花子（12歳, 35kg, 重症肺炎, PICU） — TPN→経腸移行
 * P003 = 鈴木一郎（72歳, 58kg, CKD4） — 腎不全用低蛋白製剤
 * P004 = 山田美咲（58歳, 62kg, 肝硬変） — BCAA強化・Na制限
 * P005 = 高橋健太（35歳, 75kg, 熱傷40%） — 超高カロリー・高蛋白
 * P006 = 小林幸子（78歳, 32kg, Refeeding高リスク） — 超低速漸増
 * P007 = 渡辺大輔（55歳, 88kg, DM+敗血症） — 糖質制限製剤
 * P009 = 伊藤正義（70歳, 65kg, CABG+心不全） — Na/水分制限
 * P011 = 木村蒼太（3歳, 14kg, 脳炎） — 小児経腸
 * P012 = 松本凛（0歳, 1.8kg, NICU） — 超早産児TPN+母乳
 * P014 = 斎藤結衣（15歳, 30kg, 神経性やせ症） — Refeeding小児
 * P015 = 清水陽向（1歳, 7.5kg, 心疾患） — 乳児高濃度製剤
 */

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

export const sampleMenus: NutritionMenuData[] = [
  // ==========================================
  //  P001 田中太郎 — AMI後 経腸漸増 + TPN離脱
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
  //  P002 佐藤花子（12歳 PICU） — TPN→経腸移行
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

  // ==========================================
  //  P003 鈴木一郎（CKD4） — 腎不全用低蛋白
  // ==========================================
  {
    id: 'sample-013',
    patientId: 'P003',
    patientName: '鈴木 一郎',
    nutritionType: 'enteral',
    menuName: '腎不全用 経腸（低蛋白・低K）',
    items: [
      { id: 'i-019', productName: 'レナウェル3', manufacturer: '明治', volume: 400, frequency: 3 },
    ],
    totalEnergy: 1200,
    totalVolume: 1200,
    requirements: null,
    currentIntake: { energy: 1200, protein: 28, potassium: 18, phosphorus: 12 },
    notes: '蛋白0.48g/kg。K制限達成。P制限達成。',
    activityLevel: 'minimal',
    stressLevel: 'low',
    medicalCondition: 'CKD stage 4',
    createdAt: daysAgo(3),
  },
  {
    id: 'sample-014',
    patientId: 'P003',
    patientName: '鈴木 一郎',
    nutritionType: 'enteral',
    menuName: '腎不全用 経腸（エネルギー強化）',
    items: [
      { id: 'i-020', productName: 'レナウェル3', manufacturer: '明治', volume: 400, frequency: 3 },
      { id: 'i-021', productName: 'MCTオイル', manufacturer: '日清', volume: 30, frequency: 3 },
    ],
    totalEnergy: 1470,
    totalVolume: 1290,
    requirements: null,
    currentIntake: { energy: 1470, protein: 28, potassium: 18, phosphorus: 12 },
    notes: 'MCT追加でエネルギーUP、蛋白増加なし',
    activityLevel: 'minimal',
    stressLevel: 'low',
    medicalCondition: 'CKD stage 4',
    createdAt: daysAgo(1),
  },

  // ==========================================
  //  P004 山田美咲（肝硬変） — BCAA・Na制限
  // ==========================================
  {
    id: 'sample-015',
    patientId: 'P004',
    patientName: '山田 美咲',
    nutritionType: 'enteral',
    menuName: '肝不全用 BCAA強化',
    items: [
      { id: 'i-022', productName: 'ヘパンED', manufacturer: '味の素', volume: 250, frequency: 3 },
      { id: 'i-023', productName: 'アミノレバンEN', manufacturer: '大塚製薬', volume: 50, frequency: 3 },
    ],
    totalEnergy: 900,
    totalVolume: 900,
    requirements: null,
    currentIntake: { energy: 900, protein: 40, sodium: 30 },
    notes: 'BCAA/AAA比改善目的。Na制限5g/日以下。夜食(LES)追加予定。',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: '肝硬変 Child-Pugh C',
    createdAt: daysAgo(2),
  },

  // ==========================================
  //  P005 高橋健太（熱傷40%） — 超高カロリー
  // ==========================================
  {
    id: 'sample-016',
    patientId: 'P005',
    patientName: '高橋 健太',
    nutritionType: 'enteral',
    menuName: '熱傷 高カロリー経腸',
    items: [
      { id: 'i-024', productName: 'ペプタメン AF', manufacturer: 'ネスレ', volume: 400, frequency: 4 },
      { id: 'i-025', productName: 'プロテインパウダー', manufacturer: 'クリニコ', volume: 100, frequency: 4 },
    ],
    totalEnergy: 2400,
    totalVolume: 2000,
    requirements: null,
    currentIntake: { energy: 2400, protein: 130 },
    notes: '目標3475kcalの69%。さらに増量予定。Zn/Cu/Se補充必須。',
    activityLevel: 'bed_rest',
    stressLevel: 'critical',
    medicalCondition: '重症熱傷 40%TBSA',
    createdAt: daysAgo(3),
  },
  {
    id: 'sample-017',
    patientId: 'P005',
    patientName: '高橋 健太',
    nutritionType: 'parenteral',
    menuName: '熱傷 補助TPN',
    items: [
      { id: 'i-026', productName: 'エルネオパNF2号', manufacturer: '大塚製薬', volume: 2000, frequency: 1 },
      { id: 'i-027', productName: 'イントラリポス20%', manufacturer: '大塚製薬', volume: 250, frequency: 1 },
    ],
    totalEnergy: 2140,
    totalVolume: 2250,
    requirements: null,
    currentIntake: { energy: 2140, protein: 60 },
    notes: '経腸不足分を静脈栄養で補填。微量元素製剤追加。',
    activityLevel: 'bed_rest',
    stressLevel: 'critical',
    medicalCondition: '重症熱傷 40%TBSA',
    createdAt: daysAgo(3),
  },

  // ==========================================
  //  P006 小林幸子（Refeeding高リスク） — 超低速漸増
  // ==========================================
  {
    id: 'sample-018',
    patientId: 'P006',
    patientName: '小林 幸子',
    nutritionType: 'enteral',
    menuName: 'Day1 Refeeding開始（10kcal/kg）',
    items: [
      { id: 'i-028', productName: 'ペプタメン スタンダード', manufacturer: 'ネスレ', volume: 100, frequency: 3 },
    ],
    totalEnergy: 300,
    totalVolume: 300,
    requirements: null,
    currentIntake: { energy: 300, protein: 12 },
    notes: '10kcal/kg/日=320kcal目標。チアミン200mg先行投与済。P/K/Mg 12h毎モニタ。',
    activityLevel: 'bed_rest',
    stressLevel: 'low',
    medicalCondition: 'Refeeding高リスク・重度低栄養',
    createdAt: daysAgo(4),
  },
  {
    id: 'sample-019',
    patientId: 'P006',
    patientName: '小林 幸子',
    nutritionType: 'enteral',
    menuName: 'Day3 Refeeding漸増（15kcal/kg）',
    items: [
      { id: 'i-029', productName: 'ペプタメン スタンダード', manufacturer: 'ネスレ', volume: 150, frequency: 3 },
    ],
    totalEnergy: 450,
    totalVolume: 450,
    requirements: null,
    currentIntake: { energy: 450, protein: 18 },
    notes: '電解質安定。P 2.8→3.2mg/dL改善。5kcal/kg/日ずつ増量中。',
    activityLevel: 'bed_rest',
    stressLevel: 'low',
    medicalCondition: 'Refeeding高リスク・重度低栄養',
    createdAt: daysAgo(2),
  },

  // ==========================================
  //  P007 渡辺大輔（DM+敗血症） — 糖質制限
  // ==========================================
  {
    id: 'sample-020',
    patientId: 'P007',
    patientName: '渡辺 大輔',
    nutritionType: 'enteral',
    menuName: 'DM用 糖質制限経腸',
    items: [
      { id: 'i-030', productName: 'グルセルナ-REX', manufacturer: 'アボット', volume: 300, frequency: 4 },
    ],
    totalEnergy: 1200,
    totalVolume: 1200,
    requirements: null,
    currentIntake: { energy: 1200, protein: 56, carbs: 100 },
    notes: '糖質33%の低糖質製剤。血糖140-180mg/dL目標。インスリン同期投与。',
    activityLevel: 'bed_rest',
    stressLevel: 'severe',
    medicalCondition: 'DM + 敗血症',
    createdAt: daysAgo(2),
  },
  {
    id: 'sample-021',
    patientId: 'P007',
    patientName: '渡辺 大輔',
    nutritionType: 'parenteral',
    menuName: 'DM用 補助末梢静脈',
    items: [
      { id: 'i-031', productName: 'ビーフリード', manufacturer: '大塚製薬', volume: 500, frequency: 2 },
    ],
    totalEnergy: 420,
    totalVolume: 1000,
    requirements: null,
    currentIntake: { energy: 420, protein: 15 },
    notes: '末梢ルートから。敗血症改善後に経腸のみへ移行予定。',
    activityLevel: 'bed_rest',
    stressLevel: 'severe',
    medicalCondition: 'DM + 敗血症',
    createdAt: daysAgo(2),
  },

  // ==========================================
  //  P009 伊藤正義（CABG+心不全） — Na/水分制限
  // ==========================================
  {
    id: 'sample-022',
    patientId: 'P009',
    patientName: '伊藤 正義',
    nutritionType: 'enteral',
    menuName: '心不全用 Na制限経腸',
    items: [
      { id: 'i-032', productName: 'メイバランスMini', manufacturer: '明治', volume: 125, frequency: 6 },
    ],
    totalEnergy: 1200,
    totalVolume: 750,
    requirements: null,
    currentIntake: { energy: 1200, protein: 48, sodium: 35 },
    notes: '水分制限1500mL/日。高濃度少量製剤で対応。Na制限達成。',
    activityLevel: 'minimal',
    stressLevel: 'moderate',
    medicalCondition: 'CABG後・心不全',
    createdAt: daysAgo(2),
  },

  // ==========================================
  //  P011 木村蒼太（3歳 脳炎） — 小児経腸
  // ==========================================
  {
    id: 'sample-023',
    patientId: 'P011',
    patientName: '木村 蒼太',
    nutritionType: 'parenteral',
    menuName: '小児TPN（痙攣管理中）',
    items: [
      { id: 'i-033', productName: 'フルカリック1号', manufacturer: 'テルモ', volume: 500, frequency: 1 },
    ],
    totalEnergy: 310,
    totalVolume: 500,
    requirements: null,
    currentIntake: { energy: 310, protein: 11 },
    notes: '痙攣コントロール中、経腸開始待ち。フェニトイン投与中→経腸時注意。',
    activityLevel: 'bed_rest',
    stressLevel: 'high',
    medicalCondition: '急性脳炎',
    createdAt: daysAgo(3),
  },
  {
    id: 'sample-024',
    patientId: 'P011',
    patientName: '木村 蒼太',
    nutritionType: 'enteral',
    menuName: '小児経腸（乳糖フリー）',
    items: [
      { id: 'i-034', productName: 'エレンタールP', manufacturer: '味の素', volume: 150, frequency: 4 },
    ],
    totalEnergy: 600,
    totalVolume: 600,
    requirements: null,
    currentIntake: { energy: 600, protein: 24 },
    notes: '乳糖フリー消化態。フェニトイン投与前後2h経腸中断。',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: '急性脳炎',
    createdAt: daysAgo(1),
  },

  // ==========================================
  //  P012 松本凛（NICU早産児） — 母乳+TPN
  // ==========================================
  {
    id: 'sample-025',
    patientId: 'P012',
    patientName: '松本 凛',
    nutritionType: 'parenteral',
    menuName: 'NICU TPN（生後2日）',
    items: [
      { id: 'i-035', productName: 'ネオパレン1号', manufacturer: '大塚製薬', volume: 100, frequency: 1 },
      { id: 'i-036', productName: 'イントラリポス10%', manufacturer: '大塚製薬', volume: 10, frequency: 1 },
    ],
    totalEnergy: 80,
    totalVolume: 110,
    requirements: null,
    currentIntake: { energy: 80, protein: 3 },
    notes: '60mL/kg/日。アミノ酸2g/kg/日開始。脂肪乳剤0.5g/kg/日。',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: '早産児 32週',
    createdAt: daysAgo(5),
  },
  {
    id: 'sample-026',
    patientId: 'P012',
    patientName: '松本 凛',
    nutritionType: 'enteral',
    menuName: 'NICU 母乳+強化（生後7日）',
    items: [
      { id: 'i-037', productName: '母乳', manufacturer: '-', volume: 30, frequency: 8 },
      { id: 'i-038', productName: 'HMS-2（母乳強化）', manufacturer: '森永', volume: 2, frequency: 8 },
    ],
    totalEnergy: 200,
    totalVolume: 256,
    requirements: null,
    currentIntake: { energy: 200, protein: 8 },
    notes: '120mL/kg/日到達。母乳強化パウダー追加。TPN漸減中。',
    activityLevel: 'bed_rest',
    stressLevel: 'low',
    medicalCondition: '早産児 32週',
    createdAt: daysAgo(1),
  },

  // ==========================================
  //  P014 斎藤結衣（15歳 神経性やせ症） — Refeeding
  // ==========================================
  {
    id: 'sample-027',
    patientId: 'P014',
    patientName: '斎藤 結衣',
    nutritionType: 'enteral',
    menuName: 'Day1 Refeeding開始（5kcal/kg）',
    items: [
      { id: 'i-039', productName: 'エンシュア・リキッド', manufacturer: 'アボット', volume: 60, frequency: 3 },
    ],
    totalEnergy: 180,
    totalVolume: 180,
    requirements: null,
    currentIntake: { energy: 180, protein: 6 },
    notes: '5kcal/kg/日=150kcal開始。チアミン300mg/日先行。リン4mmol/kgを経静脈補充。',
    activityLevel: 'bed_rest',
    stressLevel: 'low',
    medicalCondition: '神経性やせ症・Refeeding高リスク',
    createdAt: daysAgo(5),
  },
  {
    id: 'sample-028',
    patientId: 'P014',
    patientName: '斎藤 結衣',
    nutritionType: 'enteral',
    menuName: 'Day5 Refeeding漸増（10kcal/kg）',
    items: [
      { id: 'i-040', productName: 'エンシュア・リキッド', manufacturer: 'アボット', volume: 100, frequency: 3 },
    ],
    totalEnergy: 300,
    totalVolume: 300,
    requirements: null,
    currentIntake: { energy: 300, protein: 12 },
    notes: '電解質安定。心電図QTc正常化。200kcal/日ずつ増量方針。',
    activityLevel: 'bed_rest',
    stressLevel: 'low',
    medicalCondition: '神経性やせ症・Refeeding高リスク',
    createdAt: daysAgo(1),
  },

  // ==========================================
  //  P015 清水陽向（1歳 心疾患） — 乳児高濃度
  // ==========================================
  {
    id: 'sample-029',
    patientId: 'P015',
    patientName: '清水 陽向',
    nutritionType: 'enteral',
    menuName: '乳児 高濃度経腸（水分制限）',
    items: [
      { id: 'i-041', productName: 'インファトリニ', manufacturer: 'ニュートリシア', volume: 75, frequency: 6 },
    ],
    totalEnergy: 450,
    totalVolume: 450,
    requirements: null,
    currentIntake: { energy: 450, protein: 12 },
    notes: '1kcal/mL高濃度。水分制限100mL/kg/日=750mL以下。60kcal/kg/日。',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: 'ファロー四徴症術後',
    createdAt: daysAgo(2),
  },
  {
    id: 'sample-030',
    patientId: 'P015',
    patientName: '清水 陽向',
    nutritionType: 'parenteral',
    menuName: '乳児 補助末梢点滴',
    items: [
      { id: 'i-042', productName: 'ソリタT3号', manufacturer: '味の素', volume: 200, frequency: 1 },
    ],
    totalEnergy: 60,
    totalVolume: 200,
    requirements: null,
    currentIntake: { energy: 60, protein: 0 },
    notes: '水分維持目的。経腸増量に合わせて漸減予定。',
    activityLevel: 'bed_rest',
    stressLevel: 'moderate',
    medicalCondition: 'ファロー四徴症術後',
    createdAt: daysAgo(2),
  },
]
