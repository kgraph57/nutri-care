import { Patient, Food } from "../types";

// ============================================================
// サンプル患者データ — 15名（成人10名 + 小児5名）
// 多様な病態・年齢・性別・栄養リスクをカバー
// ============================================================
export const samplePatients: Patient[] = [
  // ─────────── 成人患者 ───────────

  // P001: ICU心筋梗塞（ワルファリン→薬剤相互作用テスト用）
  {
    id: "P001",
    name: "田中 太郎",
    age: 65,
    gender: "男性",
    ward: "ICU-1",
    admissionDate: "2024-01-15",
    dischargeDate: "",
    patientType: "ICU",
    weight: 70,
    height: 170,
    diagnosis: "急性心筋梗塞",
    allergies: ["ペニシリン", "乳製品"],
    medications: ["ワルファリン", "アスピリン", "スタチン", "ACE阻害薬"],
    notes: "PCI後、抗凝固療法中。VitK含有量に注意。",
  },

  // P003: CKD stage 4（腎不全の栄養制限テスト）
  {
    id: "P003",
    name: "鈴木 一郎",
    age: 72,
    gender: "男性",
    ward: "ICU-2",
    admissionDate: "2024-01-17",
    dischargeDate: "",
    patientType: "ICU",
    weight: 58,
    height: 162,
    diagnosis: "慢性腎臓病 stage 4（eGFR 22）",
    allergies: [],
    medications: ["フロセミド", "炭酸水素ナトリウム", "エリスロポエチン", "ARB"],
    notes: "蛋白制限 0.6-0.8g/kg、K制限、P制限。透析導入検討中。",
  },

  // P004: 肝硬変 Child-Pugh C（肝不全テスト）
  {
    id: "P004",
    name: "山田 美咲",
    age: 58,
    gender: "女性",
    ward: "ICU-3",
    admissionDate: "2024-01-18",
    dischargeDate: "",
    patientType: "ICU",
    weight: 62,
    height: 155,
    diagnosis: "肝硬変 Child-Pugh C（食道静脈瘤出血後）",
    allergies: ["セフェム系"],
    medications: ["ラクツロース", "リファキシミン", "スピロノラクトン", "PPI"],
    notes: "肝性脳症Grade II。BCAA製剤優先。Na制限。腹水あり。",
  },

  // P005: 重症熱傷40% TBSA（超高カロリー要求テスト）
  {
    id: "P005",
    name: "高橋 健太",
    age: 35,
    gender: "男性",
    ward: "ICU-4",
    admissionDate: "2024-01-19",
    dischargeDate: "",
    patientType: "ICU",
    weight: 75,
    height: 178,
    diagnosis: "重症熱傷 40%TBSA（II度-III度）",
    allergies: [],
    medications: ["フェンタニル", "ミダゾラム", "バンコマイシン", "メロペネム"],
    notes: "Curreri式: 25kcal/kg + 40kcal/%TBSA = 3475kcal。蛋白2g/kg。微量元素大量喪失。",
  },

  // P006: 重度低栄養・Refeeding高リスク
  {
    id: "P006",
    name: "小林 幸子",
    age: 78,
    gender: "女性",
    ward: "ICU-5",
    admissionDate: "2024-01-20",
    dischargeDate: "",
    patientType: "ICU",
    weight: 32,
    height: 148,
    diagnosis: "重度低栄養（BMI 14.6）、誤嚥性肺炎",
    allergies: ["卵"],
    medications: ["抗生物質", "チアミン(VitB1)"],
    notes: "BMI<16 & 10日以上経口摂取不良。Refeeding最高リスク。10kcal/kg/日から開始。チアミン先行投与。",
  },

  // P007: DM + 敗血症（インスリン-栄養相互作用テスト）
  {
    id: "P007",
    name: "渡辺 大輔",
    age: 55,
    gender: "男性",
    ward: "ICU-6",
    admissionDate: "2024-01-21",
    dischargeDate: "",
    patientType: "ICU",
    weight: 88,
    height: 172,
    diagnosis: "2型糖尿病 + 敗血症（尿路感染由来）",
    allergies: [],
    medications: ["インスリン（持効型+速効型）", "メロペネム", "ノルアドレナリン", "ヒドロコルチゾン"],
    notes: "血糖変動大。糖質制限製剤。インスリン-栄養投与同期必須。ステロイド使用中。",
  },

  // P008: ARDS（高蛋白・脂質調整テスト）
  {
    id: "P008",
    name: "中村 あゆみ",
    age: 48,
    gender: "女性",
    ward: "ICU-7",
    admissionDate: "2024-01-22",
    dischargeDate: "",
    patientType: "ICU",
    weight: 60,
    height: 160,
    diagnosis: "ARDS（COVID-19後）",
    allergies: ["魚介類"],
    medications: ["デキサメタゾン", "ヘパリン", "筋弛緩薬"],
    notes: "腹臥位管理中。高蛋白(1.5-2g/kg)。ω3脂肪酸含有製剤推奨。permissive underfeeding検討。",
  },

  // P009: CABG後ワルファリン（薬剤相互作用 + 心不全テスト）
  {
    id: "P009",
    name: "伊藤 正義",
    age: 70,
    gender: "男性",
    ward: "ICU-8",
    admissionDate: "2024-01-23",
    dischargeDate: "",
    patientType: "ICU",
    weight: 65,
    height: 168,
    diagnosis: "CABG術後、心不全（EF 30%）",
    allergies: [],
    medications: ["ワルファリン", "フロセミド", "カルベジロール", "エナラプリル"],
    notes: "Na制限 < 6g/日、水分制限 1500mL/日。ワルファリン-VitK、利尿薬-K/Mg相互作用に注意。",
  },

  // P010: サルコペニア（高齢者栄養テスト）
  {
    id: "P010",
    name: "加藤 節子",
    age: 85,
    gender: "女性",
    ward: "一般-1",
    admissionDate: "2024-01-24",
    dischargeDate: "",
    patientType: "一般病棟",
    weight: 42,
    height: 150,
    diagnosis: "サルコペニア、大腿骨頸部骨折術後",
    allergies: [],
    medications: ["カルシウム製剤", "ビタミンD", "PPI"],
    notes: "リハビリ栄養。蛋白1.2-1.5g/kg。エネルギー30kcal/kg。VitD/Ca補充。",
  },

  // ─────────── 小児患者 ───────────

  // P002: 12歳 重症肺炎（PICU）
  {
    id: "P002",
    name: "佐藤 花子",
    age: 12,
    gender: "女性",
    ward: "PICU-1",
    admissionDate: "2024-01-16",
    dischargeDate: "",
    patientType: "PICU",
    weight: 35,
    height: 145,
    diagnosis: "重症肺炎（人工呼吸器管理）",
    allergies: [],
    medications: ["抗生物質", "デキサメタゾン"],
    notes: "Schofield計算対象。学童期。呼吸器離脱後の栄養アップに注意。",
  },

  // P011: 3歳 急性脳炎（PICU幼児）
  {
    id: "P011",
    name: "木村 蒼太",
    age: 3,
    gender: "男性",
    ward: "PICU-2",
    admissionDate: "2024-01-25",
    dischargeDate: "",
    patientType: "PICU",
    weight: 14,
    height: 95,
    diagnosis: "急性脳炎（痙攣重積後）",
    allergies: ["牛乳"],
    medications: ["フェニトイン", "ミダゾラム", "グリセロール"],
    notes: "フェニトイン-経腸栄養相互作用あり（投与前後2h中断）。乳糖フリー製品選択。",
  },

  // P012: 早産児 NICU（超低出生体重児）
  {
    id: "P012",
    name: "松本 凛",
    age: 0,
    gender: "女性",
    ward: "NICU-1",
    admissionDate: "2024-01-26",
    dischargeDate: "",
    patientType: "NICU",
    weight: 1.8,
    height: 42,
    diagnosis: "早産児（在胎32週）、呼吸窮迫症候群",
    allergies: [],
    medications: ["カフェイン", "サーファクタント"],
    notes: "出生体重1.8kg。母乳 + 母乳強化パウダー。120-150kcal/kg/日目標。蛋白3.5-4g/kg/日。",
  },

  // P013: 8歳 虫垂炎術後（一般小児外科）
  {
    id: "P013",
    name: "井上 大翔",
    age: 8,
    gender: "男性",
    ward: "小児外科-1",
    admissionDate: "2024-01-27",
    dischargeDate: "",
    patientType: "小児一般",
    weight: 28,
    height: 130,
    diagnosis: "穿孔性虫垂炎術後（腹腔ドレナージ中）",
    allergies: [],
    medications: ["セフメタゾール", "メトロニダゾール", "アセトアミノフェン"],
    notes: "術後3日目から経腸開始予定。消化態製剤から段階的に。",
  },

  // P014: 15歳 神経性やせ症（Refeeding高リスク小児）
  {
    id: "P014",
    name: "斎藤 結衣",
    age: 15,
    gender: "女性",
    ward: "小児内科-1",
    admissionDate: "2024-01-28",
    dischargeDate: "",
    patientType: "小児一般",
    weight: 30,
    height: 158,
    diagnosis: "神経性やせ症（BMI 12.0）、徐脈・低血圧",
    allergies: [],
    medications: ["チアミン(VitB1)", "リン酸Na補充"],
    notes: "BMI<13、P低値。Refeeding最高リスク。5-10kcal/kg/日から開始。電解質1日2回モニタ。チアミン先行。",
  },

  // P015: 1歳 先天性心疾患（乳児ICU）
  {
    id: "P015",
    name: "清水 陽向",
    age: 1,
    gender: "男性",
    ward: "PICU-3",
    admissionDate: "2024-01-29",
    dischargeDate: "",
    patientType: "PICU",
    weight: 7.5,
    height: 72,
    diagnosis: "ファロー四徴症術後",
    allergies: [],
    medications: ["フロセミド", "ジゴキシン", "カプトプリル"],
    notes: "心不全あり。水分制限 100mL/kg/日。高カロリー密度製剤。利尿薬使用中→K/Mg注意。",
  },
];

// サンプル食品データ
export const sampleFoods: Food[] = [
  {
    id: "F001",
    name: "白米",
    category: "穀類",
    energy: 168,
    protein: 2.5,
    fat: 0.3,
    carbs: 37.1,
  },
  {
    id: "F002",
    name: "鶏胸肉",
    category: "肉類",
    energy: 165,
    protein: 22.3,
    fat: 7.2,
    carbs: 0,
  },
  {
    id: "F003",
    name: "ブロッコリー",
    category: "野菜",
    energy: 33,
    protein: 4.3,
    fat: 0.3,
    carbs: 5.2,
  },
];
