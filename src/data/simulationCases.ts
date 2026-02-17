import type { SimulationCase } from '../types/simulation'

// ============================================================================
// シミュレーション症例ライブラリ
// 12症例: beginner(2), intermediate(4), advanced(6)
// ============================================================================

// ── Case 1: ICU標準EN設計（初級） ──

const case01: SimulationCase = {
  id: 'sim-case-001',
  title: 'ICU標準EN設計',
  difficulty: 'beginner',
  category: '経腸栄養',
  patient: {
    id: 'pt-sim-001',
    name: '山田 太郎',
    age: 60,
    gender: '男性',
    ward: 'ICU',
    admissionDate: '2026-02-10',
    dischargeDate: '',
    patientType: '内科',
    weight: 65,
    height: 165,
    diagnosis: '肺炎（人工呼吸器管理中）',
    allergies: [],
    medications: ['セフトリアキソン', 'アセトアミノフェン'],
    notes: '入院3日目。経鼻胃管挿入済み。腸蠕動音あり。',
  },
  labData: {
    patientId: 'pt-sim-001',
    date: '2026-02-12',
    albumin: 3.2,
    crp: 3.5,
    sodium: 140,
    potassium: 4.0,
    chloride: 102,
    calcium: 9.0,
    magnesium: 2.0,
    phosphorus: 3.5,
    bun: 15,
    creatinine: 0.9,
    bloodSugar: 120,
    hemoglobin: 13.5,
  },
  clinicalContext:
    '60歳男性。肺炎にてICU入室3日目。人工呼吸器管理中だが循環動態は安定。' +
    '経鼻胃管が留置されており、腸蠕動音は聴取可能。経腸栄養の開始を検討する。' +
    'Harris-Benedict式でエネルギー必要量を算出し、標準的な経腸栄養プランを設計してください。',
  objectives: [
    'Harris-Benedict式でBEEを計算する',
    'ストレス係数を適用して目標エネルギーを設定する',
    '蛋白質必要量を算出する（1.2-1.5g/kg/day）',
    '標準的な経腸栄養製品を選択する',
    '投与速度と増量計画を立案する',
  ],
  timeLimit: 900,
  hints: [
    {
      trigger: 'time',
      threshold: 300,
      content: 'Harris-Benedict式（男性）: BEE = 66.5 + 13.75×体重 + 5.003×身長 - 6.775×年齢',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: 'ICU患者のストレス係数は通常1.2-1.3です。初日は目標量の25-50%から開始しましょう。',
    },
    {
      trigger: 'request',
      content: '標準的なEN製品（1.0kcal/ml）を選択し、蛋白質は1.2-1.5g/kg/dayを目標にしてください。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['標準', '経腸栄養', '1.0kcal'],
        category: '経腸栄養剤',
        volumeRange: [1200, 1600],
        required: true,
      },
      {
        productKeywords: ['プロテイン', '蛋白', '補助'],
        category: '蛋白質補助食品',
        volumeRange: [100, 200],
        required: false,
      },
      {
        productKeywords: ['水分', '白湯', 'フラッシュ'],
        category: '水分補給',
        volumeRange: [200, 500],
        required: false,
      },
    ],
    requirements: {
      energy: 1655,
      protein: 97.5,
      fat: 53,
      carbs: 183,
      sodium: 97.5,
      potassium: 65,
      calcium: 32.5,
      magnesium: 19.5,
      phosphorus: 52,
      chloride: 78,
      iron: 6.5,
      zinc: 3.25,
      copper: 0.65,
      manganese: 0.325,
      iodine: 97.5,
      selenium: 65,
    },
    keyPoints: [
      'エネルギー1500-1800kcal/day',
      '蛋白質 1.2-1.5g/kg/day',
      '経腸栄養を第一選択',
      '初日は目標量の25-50%から開始し、24-48時間で増量',
      '胃残量モニタリングを行う',
    ],
    rationale:
      'ICU入室中の肺炎患者で循環動態が安定しており、腸管機能が保たれているため経腸栄養が第一選択となる。' +
      'Harris-Benedict式でBEE≈1379kcal、ストレス係数1.2を乗じて目標エネルギー≈1655kcalとする。' +
      '蛋白質はICU患者の推奨量1.2-1.5g/kg/dayに基づき97.5g/dayを目標とする。' +
      '初日は25-50%量から開始し、忍容性を確認しながら48時間以内に目標量へ増量する。',
    commonMistakes: [
      '蛋白量が少なすぎる（< 1.0g/kg）',
      '初日から目標量の100%を投与',
      'ストレス係数の適用忘れ',
      '胃残量モニタリング計画の欠如',
    ],
    references: [
      'ASPEN/SCCM 2016 ICUガイドライン',
      'ESPEN 2019 ICUガイドライン',
      '日本臨床栄養代謝学会 静脈経腸栄養ガイドライン 第3版',
    ],
  },
}

// ── Case 2: TPN基本設計（初級） ──

const case02: SimulationCase = {
  id: 'sim-case-002',
  title: 'TPN基本設計',
  difficulty: 'beginner',
  category: '静脈栄養',
  patient: {
    id: 'pt-sim-002',
    name: '佐藤 花子',
    age: 55,
    gender: '女性',
    ward: '外科ICU',
    admissionDate: '2026-02-08',
    dischargeDate: '',
    patientType: '外科',
    weight: 52,
    height: 155,
    diagnosis: '胃全摘術後（胃癌）、絶食中',
    allergies: [],
    medications: ['セファゾリン', 'ファモチジン', 'メトクロプラミド'],
    notes: '術後2日目。縫合不全なし。絶食指示あり、経口・経腸栄養は使用不可。',
  },
  labData: {
    patientId: 'pt-sim-002',
    date: '2026-02-10',
    albumin: 2.8,
    crp: 5.0,
    bloodSugar: 160,
    sodium: 138,
    potassium: 3.8,
    chloride: 100,
    calcium: 8.5,
    magnesium: 1.9,
    phosphorus: 3.2,
    bun: 18,
    creatinine: 0.7,
    hemoglobin: 11.0,
    ast: 25,
    alt: 20,
  },
  clinicalContext:
    '55歳女性。胃癌にて胃全摘術後2日目。縫合不全の所見はないが、当面経口・経腸栄養は使用できない。' +
    '中心静脈カテーテルが留置されており、TPN（中心静脈栄養）の設計が必要。' +
    'アミノ酸、糖質、脂肪のバランスに注意してTPNプランを作成してください。' +
    '血糖値がやや高めであることにも留意すること。',
  objectives: [
    'Harris-Benedict式で基礎エネルギー消費量を計算する',
    'TPN組成（アミノ酸・糖質・脂肪）を設計する',
    '糖質投与速度を5mg/kg/min以下に維持する',
    '脂肪乳剤を適切に組み込む',
    '電解質・微量元素の補充を計画する',
  ],
  timeLimit: 1200,
  hints: [
    {
      trigger: 'time',
      threshold: 400,
      content: 'Harris-Benedict式（女性）: BEE = 655.1 + 9.563×体重 + 1.850×身長 - 4.676×年齢',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: '糖質投与速度は5mg/kg/min以下に。52kg × 5mg × 1440min = 374g/dayが上限です。',
    },
    {
      trigger: 'request',
      content: '脂肪乳剤は総エネルギーの25-30%を目標に。脂肪1gあたり9kcalで計算してください。',
    },
  ],
  idealAnswer: {
    nutritionType: 'parenteral',
    menuItems: [
      {
        productKeywords: ['TPN', 'キット', '高カロリー輸液'],
        category: '高カロリー輸液',
        volumeRange: [1000, 1500],
        required: true,
      },
      {
        productKeywords: ['アミノ酸', '輸液'],
        category: 'アミノ酸製剤',
        volumeRange: [400, 600],
        required: true,
      },
      {
        productKeywords: ['脂肪', 'イントラリポス'],
        category: '脂肪乳剤',
        volumeRange: [100, 250],
        required: true,
      },
      {
        productKeywords: ['微量元素', 'ビタミン'],
        category: '微量元素・ビタミン製剤',
        volumeRange: [2, 10],
        required: true,
      },
    ],
    requirements: {
      energy: 1537,
      protein: 67.6,
      fat: 51,
      carbs: 202,
      sodium: 78,
      potassium: 52,
      calcium: 26,
      magnesium: 15.6,
      phosphorus: 41.6,
      chloride: 62.4,
      iron: 5.2,
      zinc: 2.6,
      copper: 0.52,
      manganese: 0.26,
      iodine: 78,
      selenium: 52,
    },
    keyPoints: [
      'アミノ酸1.2-1.5g/kg/day',
      '糖質投与速度 ≤5mg/kg/min',
      '脂肪は25-30%',
      '血糖管理に注意（BS 160mg/dL）',
      '微量元素・ビタミンの補充を忘れない',
    ],
    rationale:
      '胃全摘術後で経腸栄養が使用できないためTPNが必須。' +
      'BEE≈1182kcal、術後ストレス係数1.3で目標≈1537kcal。' +
      'アミノ酸は1.3g/kg=67.6g/day。糖質は投与速度5mg/kg/min以下（上限374g/day）を守り202g/dayとする。' +
      '脂肪乳剤は総エネルギーの約30%（51g/day）。血糖160mg/dLのため糖質過剰投与を避ける。' +
      'TPN施行時はビタミンB1を含む微量元素・ビタミンの補充が必須。',
    commonMistakes: [
      '糖質投与速度の超過',
      '脂肪乳剤の省略',
      '微量元素・ビタミン補充の忘れ',
      '血糖高値なのに糖質比率が高すぎる',
    ],
    references: [
      'ASPEN 2023 静脈栄養ガイドライン',
      'ESPEN 2019 手術周術期ガイドライン',
      '日本臨床栄養代謝学会 静脈経腸栄養ガイドライン 第3版',
    ],
  },
}

// ── Case 3: CKD4の栄養設計（中級） ──

const case03: SimulationCase = {
  id: 'sim-case-003',
  title: 'CKD4の栄養設計',
  difficulty: 'intermediate',
  category: '腎疾患栄養',
  patient: {
    id: 'pt-sim-003',
    name: '田中 義男',
    age: 72,
    gender: '男性',
    ward: '腎臓内科病棟',
    admissionDate: '2026-02-05',
    dischargeDate: '',
    patientType: '内科',
    weight: 58,
    height: 162,
    diagnosis: '慢性腎臓病ステージ4（eGFR 22 mL/min/1.73m²）',
    allergies: [],
    medications: ['フロセミド 40mg', 'ARB（オルメサルタン 20mg）', '炭酸水素ナトリウム'],
    notes: 'CKD4で保存期腎不全管理中。透析導入前。経口摂取可能。食思やや低下。',
  },
  labData: {
    patientId: 'pt-sim-003',
    date: '2026-02-12',
    albumin: 3.0,
    creatinine: 4.2,
    bun: 58,
    potassium: 5.8,
    phosphorus: 5.5,
    sodium: 136,
    chloride: 100,
    calcium: 8.0,
    magnesium: 2.2,
    hemoglobin: 9.5,
    crp: 0.8,
    bloodSugar: 105,
  },
  clinicalContext:
    '72歳男性。CKD4（eGFR 22）で保存期腎不全の管理中。透析導入はまだだが、K 5.8、P 5.5と高値。' +
    '経口摂取は可能だが食思低下があり、栄養状態の維持が課題。' +
    '腎不全用の栄養製品を活用し、蛋白・K・P制限に配慮した栄養プランを設計してください。',
  objectives: [
    '保存期CKD4の蛋白制限量を設定する（0.6-0.8g/kg/day）',
    'K制限（<40mEq/day）を計画する',
    'P制限（<800mg/day）を計画する',
    '腎不全用栄養製品を選択する',
    '十分なエネルギー確保と蛋白制限の両立',
  ],
  timeLimit: 1200,
  hints: [
    {
      trigger: 'time',
      threshold: 400,
      content: 'CKD4の蛋白制限は0.6-0.8g/kg/dayです。58kgなら35-46g/dayが目標範囲。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: 'K 5.8mEq/Lは高値です。腎不全用製品はK含有量が低いものを選択してください。',
    },
    {
      trigger: 'request',
      content: 'P 5.5mg/dLも高値。腎不全用製品はP含有量に注意。エネルギーは25-30kcal/kgを確保。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['腎不全', 'リーナレン', '腎臓病'],
        category: '腎不全用経腸栄養剤',
        volumeRange: [600, 1000],
        required: true,
      },
      {
        productKeywords: ['エネルギー', '補助', 'MCT'],
        category: 'エネルギー補助食品',
        volumeRange: [50, 200],
        required: true,
      },
      {
        productKeywords: ['低蛋白', '米', 'でんぷん'],
        category: '低蛋白食品',
        volumeRange: [100, 300],
        required: false,
      },
    ],
    requirements: {
      energy: 1305,
      protein: 40.6,
      fat: 36,
      carbs: 205,
      sodium: 87,
      potassium: 29,
      calcium: 29,
      magnesium: 17.4,
      phosphorus: 23.2,
      chloride: 69.6,
      iron: 5.8,
      zinc: 2.9,
      copper: 0.58,
      manganese: 0.29,
      iodine: 87,
      selenium: 58,
    },
    keyPoints: [
      '蛋白 0.6-0.8g/kg/day (35-46g)',
      'K < 40mEq/day',
      'P < 800mg/day',
      '腎不全用製品の選択',
      'エネルギーは25-30kcal/kg確保（低蛋白でカロリー不足にならないよう注意）',
    ],
    rationale:
      'CKD4で透析未導入のため、蛋白制限（0.6-0.8g/kg=35-46g/day）が腎機能保護に重要。' +
      'K 5.8mEq/Lと高カリウム血症のためK制限が必須。P 5.5mg/dLと高リン血症のためP制限も必要。' +
      'エネルギーは25-30kcal/kgで1305kcalを確保し、蛋白制限下でも栄養状態を維持する。' +
      '腎不全用栄養製品はK・Pが低く設計されており、本症例に適している。',
    commonMistakes: [
      '蛋白制限が緩すぎる（>1.0g/kg）',
      'K含有量の確認漏れ',
      'P含有量の確認漏れ',
      '蛋白制限のみでエネルギー不足になる',
    ],
    references: [
      'KDIGO 2024 CKD栄養ガイドライン',
      '日本腎臓学会 CKD診療ガイドライン 2024',
      'ESPEN 腎疾患栄養ガイドライン 2021',
    ],
  },
}

// ── Case 4: 肝硬変Child-C（中級） ──

const case04: SimulationCase = {
  id: 'sim-case-004',
  title: '肝硬変Child-Cの栄養設計',
  difficulty: 'intermediate',
  category: '肝疾患栄養',
  patient: {
    id: 'pt-sim-004',
    name: '鈴木 美智子',
    age: 58,
    gender: '女性',
    ward: '消化器内科病棟',
    admissionDate: '2026-02-01',
    dischargeDate: '',
    patientType: '内科',
    weight: 62,
    height: 155,
    diagnosis: '肝硬変 Child-Pugh分類C（アルコール性）',
    allergies: [],
    medications: ['ラクツロース', 'スピロノラクトン 50mg', 'リファキシミン'],
    notes: '腹水あり。軽度肝性脳症（Grade I）。経口摂取可能だが食思低下著明。乾燥体重推定55kg。',
  },
  labData: {
    patientId: 'pt-sim-004',
    date: '2026-02-12',
    albumin: 2.2,
    ast: 85,
    alt: 92,
    totalBilirubin: 3.5,
    sodium: 130,
    potassium: 3.5,
    chloride: 95,
    calcium: 8.0,
    magnesium: 1.6,
    phosphorus: 2.8,
    crp: 1.2,
    hemoglobin: 10.0,
    bun: 12,
    creatinine: 0.8,
    bloodSugar: 95,
    triglycerides: 80,
  },
  clinicalContext:
    '58歳女性。アルコール性肝硬変Child-Pugh C。腹水貯留あり、軽度の肝性脳症（Grade I）を認める。' +
    '経口摂取は可能だが食思低下が著しい。乾燥体重は推定55kg。' +
    'BCAA製品の活用、Na制限、遅延夕食（LES）を考慮した栄養プランを設計してください。',
  objectives: [
    'BCAA強化製品を選択する',
    'Na制限（<80mEq/day）を設定する',
    '遅延夕食（LES）を組み込む',
    '適切な蛋白量を設定する（1.0-1.2g/kg）',
    '肝性脳症に配慮した栄養組成を設計する',
  ],
  timeLimit: 1200,
  hints: [
    {
      trigger: 'time',
      threshold: 400,
      content: '肝硬変ではBCAA（分岐鎖アミノ酸）製品が肝性脳症の予防・改善に有効です。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: 'Na 130mEq/Lで低Na血症傾向。腹水管理のためNa制限が必要ですが、過度な制限は避けましょう。',
    },
    {
      trigger: 'request',
      content: '遅延夕食（LES）は就寝前に200kcal程度の軽食を摂取し、夜間の飢餓を防ぐ方法です。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['BCAA', 'アミノレバン', 'ヘパン', '肝不全用'],
        category: '肝不全用経腸栄養剤',
        volumeRange: [400, 800],
        required: true,
      },
      {
        productKeywords: ['BCAA', '顆粒', 'リーバクト'],
        category: 'BCAA製剤',
        volumeRange: [3, 12],
        required: true,
      },
      {
        productKeywords: ['LES', '夕食', '補食'],
        category: '遅延夕食用補食',
        volumeRange: [150, 250],
        required: true,
      },
    ],
    requirements: {
      energy: 1516,
      protein: 68.2,
      fat: 42,
      carbs: 216,
      sodium: 46.5,
      potassium: 62,
      calcium: 31,
      magnesium: 18.6,
      phosphorus: 49.6,
      chloride: 74.4,
      iron: 6.2,
      zinc: 3.1,
      copper: 0.62,
      manganese: 0.31,
      iodine: 93,
      selenium: 62,
    },
    keyPoints: [
      'BCAA製品の選択',
      'Na制限（< 80mEq/day）',
      '遅延夕食（LES）',
      '蛋白 1.0-1.2g/kg',
      '乾燥体重（55kg）を基準に計算',
      '亜鉛欠乏に注意',
    ],
    rationale:
      '肝硬変Child-Cでは蛋白エネルギー栄養障害が高頻度。旧来の蛋白制限は推奨されず、1.0-1.2g/kg/dayを確保する。' +
      'BCAA製品は肝性脳症の予防・改善とアルブミン合成促進に有効。' +
      '腹水管理のためNa制限（<80mEq/day）が必要。遅延夕食（LES）は夜間の異化亢進を抑制する。' +
      '乾燥体重55kgを基準にエネルギー計算を行う。Mg低値・Zn欠乏にも注意。',
    commonMistakes: [
      '蛋白制限しすぎる（旧来の指導）',
      'Na含有量の確認漏れ',
      '腹水による体重を使ってエネルギー計算する',
      '遅延夕食（LES）の未実施',
      '亜鉛補充の見落とし',
    ],
    references: [
      'EASL 肝硬変栄養ガイドライン 2019',
      'ESPEN 肝疾患栄養ガイドライン 2019',
      '日本消化器病学会 肝硬変診療ガイドライン 2020',
    ],
  },
}

// ── Case 5: ワルファリン+栄養（中級） ──

const case05: SimulationCase = {
  id: 'sim-case-005',
  title: 'ワルファリン服用患者の栄養設計',
  difficulty: 'intermediate',
  category: '薬物相互作用',
  patient: {
    id: 'pt-sim-005',
    name: '高橋 健一',
    age: 65,
    gender: '男性',
    ward: '循環器内科病棟',
    admissionDate: '2026-02-07',
    dischargeDate: '',
    patientType: '内科',
    weight: 70,
    height: 170,
    diagnosis: '急性心筋梗塞後、機械弁置換術後',
    allergies: [],
    medications: ['ワルファリン 4mg', 'アスピリン 100mg', 'エナラプリル 5mg', 'アトルバスタチン 10mg'],
    notes: '機械弁置換術後でワルファリン継続必須。PT-INR管理中。ACE阻害薬内服中。経口摂取再開予定。',
  },
  labData: {
    patientId: 'pt-sim-005',
    date: '2026-02-12',
    albumin: 3.5,
    sodium: 139,
    potassium: 4.8,
    chloride: 103,
    calcium: 9.2,
    magnesium: 2.1,
    phosphorus: 3.8,
    bun: 16,
    creatinine: 1.0,
    bloodSugar: 110,
    hemoglobin: 12.5,
    crp: 1.0,
    ast: 30,
    alt: 28,
    triglycerides: 130,
  },
  clinicalContext:
    '65歳男性。急性心筋梗塞後の機械弁置換術を受け、ワルファリン継続が必須。PT-INR 2.3で管理中。' +
    'ACE阻害薬（エナラプリル）も内服しておりK上昇リスクあり（K 4.8mEq/L）。' +
    '経口摂取再開にあたり、ビタミンK含有量を一定に保つ栄養プランを設計してください。',
  objectives: [
    'ワルファリンとビタミンKの相互作用を理解する',
    'ビタミンK含有量が一定になるよう栄養製品を選択する',
    'ACE阻害薬によるK上昇を考慮する',
    'PT-INR安定化のための栄養管理方針を立てる',
    '適切なエネルギー・蛋白質量を設定する',
  ],
  timeLimit: 1200,
  hints: [
    {
      trigger: 'time',
      threshold: 400,
      content: 'ワルファリンはビタミンK拮抗薬です。VitK摂取量の「変動」がINR不安定化の原因になります。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: 'ACE阻害薬はK排泄を抑制します。K 4.8mEq/Lはやや高め。K含有量にも注意。',
    },
    {
      trigger: 'request',
      content: 'VitKを完全除去するのではなく、毎日一定量を摂取することがINR安定化の鍵です。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['経腸栄養', 'VitK含有量明記', '標準'],
        category: '経腸栄養剤',
        volumeRange: [1000, 1500],
        required: true,
      },
      {
        productKeywords: ['蛋白', '補助'],
        category: '蛋白質補助食品',
        volumeRange: [50, 150],
        required: false,
      },
    ],
    requirements: {
      energy: 1727,
      protein: 84,
      fat: 58,
      carbs: 217,
      sodium: 105,
      potassium: 70,
      calcium: 35,
      magnesium: 21,
      phosphorus: 56,
      chloride: 84,
      iron: 7.0,
      zinc: 3.5,
      copper: 0.7,
      manganese: 0.35,
      iodine: 105,
      selenium: 70,
    },
    keyPoints: [
      'VitK含有量を一定に保つ',
      'VitK含有製品の特定',
      'ACE阻害薬→K注意',
      'PT-INR管理',
      '経腸栄養剤のVitK含有量を薬剤師と共有',
    ],
    rationale:
      'ワルファリン服用中はVitK摂取量の「変動」がINR不安定化の最大原因。VitKを完全除去するのではなく、' +
      '毎日一定量（経腸栄養剤由来）を摂取し安定させる。経腸栄養剤変更時はVitK含有量の確認が必須。' +
      'ACE阻害薬（エナラプリル）はK排泄抑制作用があり、K 4.8mEq/Lとやや高めのため、' +
      'K含有量にも配慮が必要。PT-INRは定期的にモニタリングし、栄養プラン変更時は頻回に測定する。',
    commonMistakes: [
      'VitK完全除去（逆に不安定化）',
      'ACE阻害薬のK上昇作用を見落とす',
      '経腸栄養剤変更時のVitK量チェック忘れ',
      'PT-INRモニタリング計画の欠如',
    ],
    references: [
      '日本循環器学会 抗凝固療法ガイドライン 2020',
      'AHA/ACC ワルファリン管理ガイドライン',
      '日本臨床栄養代謝学会 薬物-栄養相互作用ハンドブック',
    ],
  },
}

// ── Case 6: DM+敗血症（中級） ──

const case06: SimulationCase = {
  id: 'sim-case-006',
  title: '糖尿病合併敗血症の栄養設計',
  difficulty: 'intermediate',
  category: '糖尿病栄養',
  patient: {
    id: 'pt-sim-006',
    name: '渡辺 正雄',
    age: 55,
    gender: '男性',
    ward: 'ICU',
    admissionDate: '2026-02-09',
    dischargeDate: '',
    patientType: '内科',
    weight: 88,
    height: 172,
    diagnosis: '2型糖尿病 + 敗血症（尿路感染症由来）',
    allergies: [],
    medications: ['インスリン持続静注', 'メロペネム', 'ノルアドレナリン微量'],
    notes: 'DM歴15年。敗血症で循環動態がやや不安定だったが改善傾向。経腸栄養開始を検討。',
  },
  labData: {
    patientId: 'pt-sim-006',
    date: '2026-02-12',
    bloodSugar: 280,
    hba1c: 8.5,
    albumin: 2.5,
    crp: 22,
    sodium: 137,
    potassium: 4.5,
    chloride: 101,
    calcium: 8.8,
    magnesium: 1.8,
    phosphorus: 3.0,
    bun: 25,
    creatinine: 1.3,
    hemoglobin: 11.5,
    triglycerides: 220,
  },
  clinicalContext:
    '55歳男性。2型糖尿病歴15年。尿路感染症由来の敗血症でICU入室中。' +
    '循環動態は改善傾向にあり、インスリン持続静注で血糖管理中（目標140-180mg/dL）。' +
    '血糖280mg/dL、HbA1c 8.5%と血糖コントロール不良。' +
    '糖尿病対応の低炭水化物ENを選択し、インスリンとの同期管理を含めた栄養プランを設計してください。',
  objectives: [
    '低炭水化物EN（糖質比33-40%）を選択する',
    '糖尿病対応製品を特定する',
    'インスリンとEN投与の同期管理を計画する',
    '高蛋白（1.2-1.5g/kg/day）を確保する',
    '血糖モニタリング計画を立案する',
  ],
  timeLimit: 1200,
  hints: [
    {
      trigger: 'time',
      threshold: 400,
      content: '糖尿病対応EN製品は糖質比33-40%で、標準EN（55%）より低炭水化物に設計されています。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: 'EN中断時はインスリン投与量の調整が必要です。低血糖リスクに注意してください。',
    },
    {
      trigger: 'request',
      content: '目標血糖は140-180mg/dL。EN開始後は4-6時間毎の血糖測定を計画しましょう。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['糖尿病', '低炭水化物', 'グルセルナ', 'ディムス'],
        category: '糖尿病対応経腸栄養剤',
        volumeRange: [1000, 1600],
        required: true,
      },
      {
        productKeywords: ['蛋白', '補助', 'プロテイン'],
        category: '蛋白質補助食品',
        volumeRange: [100, 300],
        required: true,
      },
      {
        productKeywords: ['水分', 'フラッシュ'],
        category: '水分補給',
        volumeRange: [200, 500],
        required: false,
      },
    ],
    requirements: {
      energy: 2294,
      protein: 114.4,
      fat: 115,
      carbs: 201,
      sodium: 132,
      potassium: 88,
      calcium: 44,
      magnesium: 26.4,
      phosphorus: 70.4,
      chloride: 105.6,
      iron: 8.8,
      zinc: 4.4,
      copper: 0.88,
      manganese: 0.44,
      iodine: 132,
      selenium: 88,
    },
    keyPoints: [
      '低炭水化物EN（糖質比 33-40%）',
      '糖尿病対応製品',
      'インスリンとEN同期',
      '高蛋白（1.2-1.5g/kg）',
      '血糖モニタリング4-6時間毎',
      'EN中断時のインスリン減量プロトコル',
    ],
    rationale:
      '2型糖尿病+敗血症の重症患者。HbA1c 8.5%と慢性的な血糖コントロール不良に加え、' +
      '敗血症によるストレス性高血糖（BS 280）が重畳。糖尿病対応EN（糖質比33-40%）を使用し、' +
      'インスリン持続静注と同期管理する。蛋白質は敗血症の異化亢進を考慮し1.3g/kg=114.4g/dayを目標。' +
      'EN中断時のインスリン減量プロトコルを事前に設定し、低血糖を予防する。',
    commonMistakes: [
      '標準ENの使用（炭水化物比55%）',
      'EN中断時のインスリン調整漏れ',
      '血糖モニタリング頻度不足',
      '肥満体型（88kg）に対するエネルギー過剰投与',
    ],
    references: [
      'ASPEN/SCCM 2016 ICUガイドライン',
      'ADA 入院患者血糖管理ガイドライン 2023',
      'ESPEN 糖尿病栄養ガイドライン 2023',
    ],
  },
}

// ── Case 7: 重症熱傷40%TBSA（上級） ──

const case07: SimulationCase = {
  id: 'sim-case-007',
  title: '重症熱傷40%TBSAの栄養設計',
  difficulty: 'advanced',
  category: '熱傷栄養',
  patient: {
    id: 'pt-sim-007',
    name: '中村 大輔',
    age: 35,
    gender: '男性',
    ward: '熱傷ICU',
    admissionDate: '2026-02-10',
    dischargeDate: '',
    patientType: '外科',
    weight: 75,
    height: 178,
    diagnosis: '重症熱傷（40% TBSA、II度-III度）',
    allergies: [],
    medications: ['モルヒネ持続', 'セフェピム', 'オメプラゾール', '破傷風トキソイド'],
    notes: '工場火災による熱傷。40%TBSA（顔面・両上肢・体幹）。気管挿管中。受傷後48時間経過。',
  },
  labData: {
    patientId: 'pt-sim-007',
    date: '2026-02-12',
    albumin: 1.8,
    crp: 25,
    hemoglobin: 10.5,
    sodium: 142,
    potassium: 4.2,
    chloride: 105,
    calcium: 7.5,
    magnesium: 1.5,
    phosphorus: 2.5,
    bun: 20,
    creatinine: 0.9,
    bloodSugar: 180,
    ast: 45,
    alt: 38,
    triglycerides: 160,
  },
  clinicalContext:
    '35歳男性。工場火災で40% TBSAの重症熱傷（II度-III度）。受傷後48時間が経過し、' +
    '蘇生輸液相から栄養管理相に移行。気管挿管中で経鼻胃管留置済み。' +
    'Curreri式でエネルギー必要量を算出し、高蛋白・微量元素補充を含む包括的な栄養プランを設計してください。' +
    'EN単独で不足する場合はTPN併用も検討すること。',
  objectives: [
    'Curreri式でエネルギー必要量を算出する',
    '高蛋白（2.0g/kg/day）を計画する',
    '微量元素（Zn, Cu, Se）の補充を含める',
    'EN+TPN併用の検討',
    '創傷治癒に必要なビタミン（A, C）の補充',
  ],
  timeLimit: 1500,
  hints: [
    {
      trigger: 'time',
      threshold: 500,
      content: 'Curreri式: 25kcal × 体重(kg) + 40kcal × 熱傷面積(%) = 25×75 + 40×40 = 3475kcal',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: '熱傷患者は微量元素（特にZn, Cu, Se）の喪失が著しい。通常量の2-3倍の補充が必要です。',
    },
    {
      trigger: 'request',
      content: '蛋白質は2.0g/kg/day=150g。EN単独では到達困難な場合、TPN併用で蛋白補充を。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['高蛋白', '高エネルギー', '1.5kcal'],
        category: '高エネルギー経腸栄養剤',
        volumeRange: [1500, 2000],
        required: true,
      },
      {
        productKeywords: ['蛋白', '補助', 'プロテイン'],
        category: '蛋白質補助食品',
        volumeRange: [200, 400],
        required: true,
      },
      {
        productKeywords: ['微量元素', 'Zn', 'Se', 'Cu'],
        category: '微量元素補充',
        volumeRange: [1, 10],
        required: true,
      },
      {
        productKeywords: ['ビタミン', 'A', 'C'],
        category: 'ビタミン製剤',
        volumeRange: [1, 5],
        required: true,
      },
    ],
    requirements: {
      energy: 3475,
      protein: 150,
      fat: 116,
      carbs: 458,
      sodium: 112.5,
      potassium: 75,
      calcium: 37.5,
      magnesium: 22.5,
      phosphorus: 60,
      chloride: 90,
      iron: 7.5,
      zinc: 11.25,
      copper: 2.25,
      manganese: 0.375,
      iodine: 112.5,
      selenium: 225,
    },
    keyPoints: [
      'Curreri式: 25kcal×75 + 40kcal×40% = 3475kcal',
      '蛋白2.0g/kg/day',
      '微量元素（Zn, Cu, Se）補充',
      'EN+TPN併用も検討',
      'ビタミンA・C補充（創傷治癒促進）',
      '受傷後48時間以内にEN開始が望ましい',
    ],
    rationale:
      '40%TBSAの重症熱傷は最も代謝亢進が著しい病態の一つ。Curreri式で3475kcal/dayのエネルギーが必要。' +
      '蛋白質は創傷治癒と免疫維持のため2.0g/kg=150g/dayが目標。' +
      '熱傷では皮膚からの浸出液を通じて微量元素（特にZn, Cu, Se）が大量に喪失するため、' +
      '通常量の2-3倍の補充が必要。ビタミンA（上皮再生）とC（コラーゲン合成）も高用量補充する。' +
      'EN単独で目標到達が困難な場合はTPN併用を躊躇しない。',
    commonMistakes: [
      'エネルギー量の過小見積もり',
      '微量元素補充の欠如',
      '蛋白量の不足（<1.5g/kg）',
      'ビタミンA・C補充の欠如',
      'EN単独へのこだわり（TPN併用を考慮しない）',
    ],
    references: [
      'ISBI 熱傷栄養ガイドライン 2023',
      'ASPEN 熱傷患者栄養ガイドライン',
      'ESPEN 外傷・熱傷栄養ガイドライン 2019',
    ],
  },
}

// ── Case 8: Refeeding高リスク（上級） ──

const case08: SimulationCase = {
  id: 'sim-case-008',
  title: 'Refeeding症候群高リスクの栄養設計',
  difficulty: 'advanced',
  category: 'Refeeding管理',
  patient: {
    id: 'pt-sim-008',
    name: '小林 ヨシ',
    age: 78,
    gender: '女性',
    ward: '内科病棟',
    admissionDate: '2026-02-06',
    dischargeDate: '',
    patientType: '内科',
    weight: 32,
    height: 148,
    diagnosis: '高度低栄養（BMI 14.6）、廃用症候群',
    allergies: [],
    medications: ['チアミン 200mg', '電解質補正（リン酸Na、KCl、硫酸Mg）'],
    notes: '独居高齢者。2週間以上ほぼ絶食状態で発見。BMI 14.6。Refeeding症候群の最高リスク。',
  },
  labData: {
    patientId: 'pt-sim-008',
    date: '2026-02-12',
    phosphorus: 1.5,
    potassium: 2.8,
    magnesium: 1.2,
    albumin: 1.9,
    sodium: 133,
    chloride: 96,
    calcium: 7.8,
    bloodSugar: 65,
    hemoglobin: 9.0,
    crp: 0.5,
    bun: 8,
    creatinine: 0.5,
  },
  clinicalContext:
    '78歳女性。独居高齢者で2週間以上ほぼ絶食状態で発見された。BMI 14.6と高度低栄養。' +
    'P 1.5、K 2.8、Mg 1.2と電解質異常あり。Refeeding症候群の最高リスク群に該当する。' +
    '「Start low, go slow」の原則に従い、チアミン投与・電解質補正を行いながら' +
    '慎重な栄養再開プランを設計してください。',
  objectives: [
    '初日投与量を10kcal/kg/dayに制限する',
    '増量速度を5kcal/kg/dayに設定する',
    'チアミン200-300mgの栄養開始前投与を確認する',
    'P/K/Mgの12時間毎モニタリングを計画する',
    '目標到達までのスケジュールを立案する',
  ],
  timeLimit: 1500,
  hints: [
    {
      trigger: 'time',
      threshold: 500,
      content: 'Refeeding高リスクの初日投与量は10kcal/kg/day以下。32kgなら320kcal/day以下です。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: 'チアミンは栄養開始「前」に200-300mg投与必須。糖質代謝にチアミンが消費されWernicke脳症リスク。',
    },
    {
      trigger: 'request',
      content: '電解質（P/K/Mg）は栄養再開後12時間毎にモニタリング。補正は継続。増量は5kcal/kg/dayずつ。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['標準', '経腸栄養', '1.0kcal'],
        category: '経腸栄養剤',
        volumeRange: [200, 400],
        required: true,
      },
      {
        productKeywords: ['チアミン', 'ビタミンB1'],
        category: 'ビタミン製剤',
        volumeRange: [1, 3],
        required: true,
      },
      {
        productKeywords: ['電解質', 'リン', 'カリウム'],
        category: '電解質補正製剤',
        volumeRange: [1, 10],
        required: true,
      },
    ],
    requirements: {
      energy: 320,
      protein: 25.6,
      fat: 9,
      carbs: 34,
      sodium: 48,
      potassium: 32,
      calcium: 16,
      magnesium: 9.6,
      phosphorus: 25.6,
      chloride: 38.4,
      iron: 3.2,
      zinc: 1.6,
      copper: 0.32,
      manganese: 0.16,
      iodine: 48,
      selenium: 32,
    },
    keyPoints: [
      '初日 10kcal/kg/day = 320kcal',
      '増量 5kcal/kg/day ずつ',
      'チアミン200-300mg投与開始前',
      'P/K/Mg 12時間毎モニタリング',
      '目標到達まで4-7日かけて漸増',
      '心電図モニタリング（低K・低Mg→不整脈リスク）',
    ],
    rationale:
      'BMI 14.6、2週間以上の絶食はRefeeding症候群の最高リスク。栄養再開により細胞内へP/K/Mgが' +
      '急速にシフトし、致死的な低リン血症・不整脈を引き起こしうる。' +
      'チアミンは栄養開始前に200-300mg投与し、Wernicke脳症を予防。' +
      '初日10kcal/kg（320kcal）から開始し、5kcal/kgずつ漸増。電解質は12時間毎にモニタリングし、' +
      '異常があれば増量を中止して補正する。目標エネルギー到達まで4-7日をかける。',
    commonMistakes: [
      '初日投与量が多すぎる（>15kcal/kg）',
      'チアミン投与の忘れ',
      '電解質モニタリング頻度不足',
      '増量速度が速すぎる',
      '心電図モニタリングの欠如',
    ],
    references: [
      'NICE Refeeding症候群ガイドライン 2017（改訂2023）',
      'ASPEN Refeeding管理ポジションペーパー 2020',
      'ESPEN 低栄養ガイドライン 2021',
    ],
  },
}

// ── Case 9: 小児急性脳炎 3歳（上級） ──

const case09: SimulationCase = {
  id: 'sim-case-009',
  title: '小児急性脳炎の栄養設計（3歳）',
  difficulty: 'advanced',
  category: '小児栄養',
  patient: {
    id: 'pt-sim-009',
    name: '伊藤 ゆうた',
    age: 3,
    gender: '男性',
    ward: 'PICU',
    admissionDate: '2026-02-11',
    dischargeDate: '',
    patientType: '小児科',
    weight: 14,
    height: 95,
    diagnosis: '急性脳炎（けいれん重積後）、気管挿管中',
    allergies: ['卵'],
    medications: ['フェニトイン', 'デキサメタゾン', 'アシクロビル'],
    notes: '3歳男児。急性脳炎でPICU入室。けいれん重積後。フェニトイン持続静注中。経鼻胃管留置済み。',
  },
  labData: {
    patientId: 'pt-sim-009',
    date: '2026-02-12',
    crp: 8,
    sodium: 132,
    potassium: 4.0,
    chloride: 100,
    albumin: 3.0,
    calcium: 9.0,
    magnesium: 2.0,
    phosphorus: 4.5,
    bloodSugar: 130,
    hemoglobin: 11.5,
    bun: 12,
    creatinine: 0.3,
  },
  clinicalContext:
    '3歳男児。急性脳炎でけいれん重積後、PICU管理中。フェニトイン持続静注で抗けいれん管理。' +
    'デキサメタゾンで脳浮腫治療中。経鼻胃管が留置されており経腸栄養開始を検討。' +
    'Schofield式で小児のエネルギー必要量を算出し、フェニトインと経腸栄養の相互作用に注意した' +
    '栄養プランを設計してください。卵アレルギーあり。',
  objectives: [
    'Schofield式で小児のエネルギー必要量を計算する',
    'フェニトインとENの相互作用を考慮する（前後2時間中断）',
    '小児用栄養製品を選択する',
    '蛋白質1.5-2.0g/kg/dayを確保する',
    '卵アレルギーに対応した製品を選ぶ',
  ],
  timeLimit: 1500,
  hints: [
    {
      trigger: 'time',
      threshold: 500,
      content: 'Schofield式（1-3歳男児）: BEE = 59.48 × 体重(kg) - 30.33。14kgなら≈803kcal。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: 'フェニトインは経腸栄養と同時投与で吸収が低下。EN投与の前後2時間は中断が必要です。',
    },
    {
      trigger: 'request',
      content: '小児用製品はエネルギー密度・浸透圧が小児向けに調整されています。成人用は適さない場合があります。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['小児', '小児用', 'ペディア'],
        category: '小児用経腸栄養剤',
        volumeRange: [600, 900],
        required: true,
      },
      {
        productKeywords: ['蛋白', '補助', '小児'],
        category: '蛋白質補助食品',
        volumeRange: [50, 100],
        required: false,
      },
      {
        productKeywords: ['ビタミンD', 'Ca'],
        category: 'ビタミン・ミネラル補充',
        volumeRange: [1, 5],
        required: false,
      },
    ],
    requirements: {
      energy: 1043,
      protein: 21,
      fat: 35,
      carbs: 161,
      sodium: 21,
      potassium: 14,
      calcium: 7,
      magnesium: 4.2,
      phosphorus: 11.2,
      chloride: 16.8,
      iron: 1.4,
      zinc: 0.7,
      copper: 0.14,
      manganese: 0.07,
      iodine: 21,
      selenium: 14,
    },
    keyPoints: [
      'Schofield式でエネルギー計算',
      'フェニトイン-経腸 2h前後中断',
      '蛋白 1.5-2.0g/kg/day',
      '小児用製品の選択',
      '卵アレルギー対応製品の確認',
      'デキサメタゾンによる血糖上昇に注意',
    ],
    rationale:
      '3歳男児の急性脳炎。Schofield式でBEE≈803kcal、ストレス係数1.3で目標≈1043kcal。' +
      'フェニトイン持続静注中のため、経腸栄養の同時投与はフェニトイン吸収を30-40%低下させる。' +
      'EN投与の前後2時間はフェニトインの投与を避けるか、EN中断して経管投与する。' +
      '蛋白質は小児重症患者の推奨1.5-2.0g/kg=21-28g/day。小児用製品は浸透圧・電解質が小児に最適化。' +
      '卵アレルギーがあるため、卵由来成分（卵黄レシチン等）を含む製品を避ける。',
    commonMistakes: [
      '成人式（Harris-Benedict）の使用',
      'フェニトイン相互作用の見落とし',
      '成人用製品の使用',
      '卵アレルギーの確認漏れ',
      'デキサメタゾンの血糖影響の見落とし',
    ],
    references: [
      'ESPGHAN 小児ICU栄養ガイドライン 2020',
      'ASPEN 小児栄養ガイドライン 2017',
      'Schofield WN. Hum Nutr Clin Nutr 1985; 39C:5-41',
    ],
  },
}

// ── Case 10: NICU極低出生体重（上級） ──

const case10: SimulationCase = {
  id: 'sim-case-010',
  title: 'NICU極低出生体重児の栄養設計',
  difficulty: 'advanced',
  category: '新生児栄養',
  patient: {
    id: 'pt-sim-010',
    name: '木村 あおい',
    age: 0,
    gender: '女性',
    ward: 'NICU',
    admissionDate: '2026-02-10',
    dischargeDate: '',
    patientType: '新生児科',
    weight: 1.8,
    height: 42,
    diagnosis: '早産児（在胎32週）、極低出生体重児',
    allergies: [],
    medications: ['カフェイン（無呼吸予防）', 'ビタミンK 1mg'],
    notes: '在胎32週、出生体重1,800g。生後2日目。呼吸はCPAP管理。経腸栄養開始を検討。母乳あり。',
  },
  labData: {
    patientId: 'pt-sim-010',
    date: '2026-02-12',
    totalBilirubin: 8.0,
    potassium: 5.5,
    sodium: 134,
    chloride: 102,
    calcium: 8.5,
    phosphorus: 5.0,
    magnesium: 2.0,
    albumin: 2.8,
    bloodSugar: 55,
    hemoglobin: 16.0,
    crp: 0.2,
  },
  clinicalContext:
    '在胎32週、出生体重1,800gの極低出生体重女児。生後2日目。CPAP管理で呼吸は安定。' +
    '母乳が利用可能。T-Bil 8.0（生理的黄疸の範囲）、K 5.5（新生児の生理的高K）。' +
    '母乳+強化剤（HMS-2等）を第一選択とし、TPNとの併用も含めた栄養プランを設計してください。' +
    '新生児の検査基準値は成人と異なることに注意。',
  objectives: [
    '母乳+強化剤が第一選択であることを理解する',
    'TPNとの併用計画を立案する',
    'エネルギー110-130kcal/kg/dayの目標を設定する',
    '新生児の生理的検査値を正しく判断する',
    '微量経腸栄養（trophic feeding）から開始する',
  ],
  timeLimit: 1500,
  hints: [
    {
      trigger: 'time',
      threshold: 500,
      content: '極低出生体重児のエネルギー目標は110-130kcal/kg/day。1.8kgなら198-234kcal/day。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: '母乳強化剤（HMS-2等）は母乳のエネルギー・蛋白を補強します。極低出生体重児には必須。',
    },
    {
      trigger: 'request',
      content: 'T-Bil 8.0は生後2日目なら生理的黄疸。K 5.5は新生児の生理的範囲。成人基準で判断しないこと。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['母乳', '搾母乳'],
        category: '母乳',
        volumeRange: [20, 150],
        required: true,
      },
      {
        productKeywords: ['母乳強化', 'HMS', 'HMF'],
        category: '母乳強化剤',
        volumeRange: [1, 10],
        required: true,
      },
      {
        productKeywords: ['TPN', 'アミノ酸', '新生児用'],
        category: '新生児用TPN',
        volumeRange: [100, 200],
        required: true,
      },
    ],
    requirements: {
      energy: 216,
      protein: 5.4,
      fat: 9.6,
      carbs: 27,
      sodium: 2.7,
      potassium: 1.8,
      calcium: 0.9,
      magnesium: 0.54,
      phosphorus: 1.44,
      chloride: 2.16,
      iron: 0.18,
      zinc: 0.09,
      copper: 0.018,
      manganese: 0.009,
      iodine: 2.7,
      selenium: 1.8,
    },
    keyPoints: [
      '母乳+強化剤(HMS-2)が第一選択',
      'TPN: アミノ酸2.0-3.5g/kg/day',
      'エネルギー110-130kcal/kg/day',
      '生理的高K/高Bilに注意',
      'trophic feedingから開始（10-20ml/kg/day）',
      'EN増量は20-30ml/kg/dayずつ',
    ],
    rationale:
      '在胎32週・1,800gの極低出生体重児。母乳は壊死性腸炎（NEC）予防の観点から第一選択。' +
      'ただし母乳単独ではエネルギー・蛋白が不足するため、母乳強化剤（HMS-2等）の添加が必須。' +
      'EN確立まではTPNを併用し、アミノ酸2.0-3.5g/kg/dayを投与。' +
      'trophic feeding（10-20ml/kg/day）から開始し、20-30ml/kg/dayずつ増量。' +
      'T-Bil 8.0は生後2日目の生理的黄疸範囲、K 5.5は新生児の生理的範囲であり、成人基準で判断しない。',
    commonMistakes: [
      '成人基準値での検査値判定',
      '母乳強化剤の忘れ',
      '初日から大量のEN投与（NEC リスク）',
      'TPN併用の省略',
      '低血糖（BS 55）の見落とし',
    ],
    references: [
      'AAP 早産児栄養ガイドライン 2022',
      'ESPGHAN 早産児栄養ガイドライン 2022',
      '日本新生児成育医学会 新生児栄養ガイドライン',
    ],
  },
}

// ── Case 11: 思春期食思不振症 15歳（上級） ──

const case11: SimulationCase = {
  id: 'sim-case-011',
  title: '思春期食思不振症の栄養設計（15歳）',
  difficulty: 'advanced',
  category: '摂食障害栄養',
  patient: {
    id: 'pt-sim-011',
    name: '山本 さくら',
    age: 15,
    gender: '女性',
    ward: '小児科病棟',
    admissionDate: '2026-02-05',
    dischargeDate: '',
    patientType: '小児科',
    weight: 30,
    height: 158,
    diagnosis: '神経性やせ症（制限型）、BMI 12.0',
    allergies: [],
    medications: ['チアミン 300mg', '電解質補正（リン酸Na、KCl、硫酸Mg）'],
    notes: '15歳女子高校生。6ヶ月で20kg減少。BMI 12.0。Refeeding最高リスク。心理的配慮必要。',
  },
  labData: {
    patientId: 'pt-sim-011',
    date: '2026-02-12',
    phosphorus: 1.0,
    potassium: 2.5,
    magnesium: 1.0,
    albumin: 2.5,
    sodium: 135,
    chloride: 98,
    calcium: 8.0,
    bloodSugar: 55,
    hemoglobin: 10.0,
    crp: 0.1,
    bun: 6,
    creatinine: 0.4,
    ast: 55,
    alt: 48,
  },
  clinicalContext:
    '15歳女子高校生。6ヶ月間で体重が50kgから30kgに減少。BMI 12.0と極度の低体重。' +
    'P 1.0、K 2.5、Mg 1.0と著しい電解質異常あり。Refeeding症候群の最高リスク群。' +
    'BS 55mg/dLと低血糖も認める。' +
    '栄養再開は極めて慎重に行う必要がある。心理的配慮として経口栄養を優先し、' +
    '電解質補正とモニタリングを含む包括的な栄養プランを設計してください。',
  objectives: [
    '初日5-10kcal/kg/dayの投与量設定',
    'Refeeding最高リスクの管理プロトコル',
    'P/K/Mg補充の必須性を理解する',
    '心理的配慮（経口優先）を含む栄養アプローチ',
    '低血糖管理を並行する',
  ],
  timeLimit: 1500,
  hints: [
    {
      trigger: 'time',
      threshold: 500,
      content: 'BMI 12.0は最高リスク。初日5-10kcal/kg=150-300kcal。P 1.0は致死的低値、補正必須。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: '食思不振症では心理的配慮が極めて重要。経口摂取を優先し、経管栄養は最終手段。',
    },
    {
      trigger: 'request',
      content: '低血糖（BS 55）には10%ブドウ糖液の持続点滴も検討。チアミンは栄養開始前に必ず投与。',
    },
  ],
  idealAnswer: {
    nutritionType: 'enteral',
    menuItems: [
      {
        productKeywords: ['経口', '栄養補助', '少量高カロリー'],
        category: '経口栄養補助食品',
        volumeRange: [100, 300],
        required: true,
      },
      {
        productKeywords: ['チアミン', 'ビタミンB1'],
        category: 'ビタミン製剤',
        volumeRange: [1, 3],
        required: true,
      },
      {
        productKeywords: ['電解質', 'リン', 'カリウム', 'マグネシウム'],
        category: '電解質補正製剤',
        volumeRange: [1, 10],
        required: true,
      },
      {
        productKeywords: ['ブドウ糖', '10%', '点滴'],
        category: '低血糖補正',
        volumeRange: [200, 500],
        required: true,
      },
    ],
    requirements: {
      energy: 240,
      protein: 24,
      fat: 7,
      carbs: 20,
      sodium: 45,
      potassium: 30,
      calcium: 15,
      magnesium: 9,
      phosphorus: 24,
      chloride: 36,
      iron: 3.0,
      zinc: 1.5,
      copper: 0.3,
      manganese: 0.15,
      iodine: 45,
      selenium: 30,
    },
    keyPoints: [
      '初日 5-10kcal/kg/day = 150-300kcal',
      'Refeeding最高リスク',
      'P/K/Mg補充必須',
      '心理的配慮（経口優先）',
      'チアミン300mg栄養開始前投与',
      '低血糖管理の並行実施',
      '心電図持続モニタリング（QT延長リスク）',
    ],
    rationale:
      'BMI 12.0の神経性やせ症はRefeeding症候群の最高リスク。P 1.0は致死的レベルで心停止リスクあり。' +
      'K 2.5は重症低K血症で不整脈リスク。栄養開始前にチアミン300mg投与とP/K/Mg補正を開始する。' +
      '初日5-10kcal/kg（150-300kcal）から極めて慎重に開始し、3-5kcal/kgずつ漸増。' +
      '食思不振症では心理的配慮が治療の根幹であり、経口摂取を優先する。' +
      '経管栄養は経口不能な場合の最終手段とする。BS 55の低血糖には10%ブドウ糖液で並行管理。',
    commonMistakes: [
      '投与量の急速増量',
      '電解質補正なしの栄養開始',
      '心理的配慮の欠如（安易な経管栄養）',
      'チアミン投与忘れ',
      '低血糖の見落とし',
      '心電図モニタリングの欠如',
    ],
    references: [
      'NICE 摂食障害ガイドライン 2020（改訂2023）',
      'APA 摂食障害治療ガイドライン 2023',
      'MARSIPAN（Management of Really Sick Patients with Anorexia Nervosa）2nd ed.',
    ],
  },
}

// ── Case 12: 多臓器不全（上級） ──

const case12: SimulationCase = {
  id: 'sim-case-012',
  title: '多臓器不全の栄養設計',
  difficulty: 'advanced',
  category: '多臓器不全栄養',
  patient: {
    id: 'pt-sim-012',
    name: '加藤 昭夫',
    age: 68,
    gender: '男性',
    ward: 'ICU',
    admissionDate: '2026-02-03',
    dischargeDate: '',
    patientType: '内科',
    weight: 72,
    height: 168,
    diagnosis: '多臓器不全（腎不全+肝不全+心不全）',
    allergies: [],
    medications: [
      'フロセミド 80mg',
      'ノルアドレナリン 0.1γ',
      'ドブタミン 3γ',
      'CHDF（持続血液濾過透析）',
    ],
    notes:
      '敗血症性ショックから多臓器不全に進展。腎不全（CHDF施行中）、肝不全、心不全を合併。' +
      '水分制限・Na制限・K制限が必要。BNP高値。各臓器の制限を統合した栄養設計が求められる。',
  },
  labData: {
    patientId: 'pt-sim-012',
    date: '2026-02-12',
    creatinine: 3.5,
    bun: 65,
    ast: 180,
    alt: 150,
    totalBilirubin: 2.8,
    sodium: 128,
    potassium: 5.2,
    chloride: 92,
    calcium: 7.8,
    magnesium: 1.6,
    phosphorus: 4.8,
    albumin: 2.0,
    crp: 18,
    hemoglobin: 8.5,
    bloodSugar: 165,
    triglycerides: 250,
  },
  clinicalContext:
    '68歳男性。敗血症性ショックから多臓器不全に進展。腎不全でCHDF施行中、肝不全（AST 180, T-Bil 2.8）、' +
    '心不全（BNP高値、フロセミド+ドブタミン使用中）を合併。' +
    'Na 128と低Na血症、K 5.2と高K血症を認め、水分制限も必要。' +
    '腎保護の蛋白制限 vs 肝不全のBCAA補充 vs 心不全のNa・水分制限を統合した' +
    '極めて複雑な栄養プランの設計が求められる。各臓器障害の制限を優先順位付けして管理すること。',
  objectives: [
    '蛋白量のバランス設定（腎保護 vs 肝BCAA: 0.8-1.0g/kg）',
    'Na制限（<60mEq/day、心不全管理）',
    '水分制限（<1500ml/day）',
    'K制限（腎不全+利尿薬の影響を考慮）',
    'エネルギー20-25kcal/kgの目標設定',
    '各制限の優先順位付け',
  ],
  timeLimit: 1800,
  hints: [
    {
      trigger: 'time',
      threshold: 600,
      content: '多臓器不全では各臓器の制限が競合します。Na<60mEq（心不全）、K制限（腎不全）が最優先。',
    },
    {
      trigger: 'score',
      threshold: 40,
      content: 'CHDF施行中はアミノ酸・微量元素が除去されます。補充量を増やす必要があります。',
    },
    {
      trigger: 'request',
      content: '蛋白は0.8-1.0g/kg（腎保護寄り）とし、BCAA製剤で質を担保。水分量は全輸液を含めて計算。',
    },
  ],
  idealAnswer: {
    nutritionType: 'parenteral',
    menuItems: [
      {
        productKeywords: ['TPN', '高カロリー', '低Na'],
        category: '高カロリー輸液',
        volumeRange: [800, 1200],
        required: true,
      },
      {
        productKeywords: ['BCAA', 'アミノ酸', '肝不全用'],
        category: '肝不全用アミノ酸製剤',
        volumeRange: [200, 400],
        required: true,
      },
      {
        productKeywords: ['脂肪', 'イントラリポス'],
        category: '脂肪乳剤',
        volumeRange: [100, 200],
        required: true,
      },
      {
        productKeywords: ['微量元素', 'ビタミン'],
        category: '微量元素・ビタミン製剤',
        volumeRange: [2, 10],
        required: true,
      },
    ],
    requirements: {
      energy: 1584,
      protein: 57.6,
      fat: 44,
      carbs: 238,
      sodium: 54,
      potassium: 36,
      calcium: 36,
      magnesium: 21.6,
      phosphorus: 28.8,
      chloride: 86.4,
      iron: 7.2,
      zinc: 3.6,
      copper: 0.72,
      manganese: 0.36,
      iodine: 108,
      selenium: 72,
    },
    keyPoints: [
      '蛋白 0.8-1.0g/kg（腎保護 vs 肝BCAA）',
      'Na < 60mEq/day（心不全）',
      '水分制限 < 1500ml',
      'K制限（腎+利尿薬考慮）',
      'エネルギー20-25kcal/kg',
      'CHDF中のアミノ酸・微量元素喪失を補充',
      '脂肪乳剤はTG値をモニタリングしながら投与',
    ],
    rationale:
      '多臓器不全は栄養管理上最も複雑な病態。腎不全では蛋白制限が必要だが、肝不全ではBCAAによる' +
      '蛋白合成支援が必要で、両者のバランスとして0.8-1.0g/kg=57.6-72g/dayを設定。' +
      'BCAA製剤を使用して蛋白の「質」を担保する。' +
      '心不全ではNa<60mEq/dayと水分<1500mlが最優先制限。Na 128の低Na血症は希釈性であり、' +
      '水分制限が治療の本態。K 5.2は腎不全由来だが、フロセミドのK排泄作用もあるためモニタリングが重要。' +
      'CHDF施行中はアミノ酸・水溶性ビタミン・微量元素が除去されるため、補充量を1.5倍に増量する。' +
      'TG 250mg/dLのため脂肪乳剤は慎重投与とし、TGモニタリングを行う。',
    commonMistakes: [
      '単一臓器のみの制限',
      '水分量の過剰',
      '制限の優先順位付け失敗',
      'CHDF中の栄養素喪失の見落とし',
      'TG高値での脂肪乳剤過剰投与',
      'Na制限とK制限の相反する管理の失敗',
    ],
    references: [
      'ASPEN/SCCM 2016 ICUガイドライン',
      'ESPEN 2019 ICU栄養ガイドライン',
      'KDIGO AKI栄養管理ガイドライン 2012',
      'ESC 心不全ガイドライン 2023',
    ],
  },
}

// ============================================================================
// エクスポート
// ============================================================================

export const SIMULATION_CASES: readonly SimulationCase[] = [
  case01,
  case02,
  case03,
  case04,
  case05,
  case06,
  case07,
  case08,
  case09,
  case10,
  case11,
  case12,
] as const
