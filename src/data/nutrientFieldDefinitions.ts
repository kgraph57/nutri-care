export interface NutrientField {
  readonly key: string;
  readonly label: string;
  readonly unit: string;
}

export interface NutrientSection {
  readonly id: string;
  readonly label: string;
  readonly fields: readonly NutrientField[];
}

export const NUTRIENT_SECTIONS: readonly NutrientSection[] = [
  {
    id: 'basic',
    label: '基本情報',
    fields: [
      { key: '規格[ml]', label: '規格', unit: 'mL' },
      { key: '注射量[ml]', label: '注射量', unit: 'mL' },
      { key: '投与経路', label: '投与経路', unit: '' },
      { key: '浸透圧比', label: '浸透圧比', unit: '' },
      { key: '浸透圧[mOsm/L]', label: '浸透圧', unit: 'mOsm/L' },
      { key: 'pH', label: 'pH', unit: '' },
      { key: '比重', label: '比重', unit: '' },
    ],
  },
  {
    id: 'macro',
    label: '主要栄養素',
    fields: [
      { key: 'エネルギー[kcal/ml]', label: 'エネルギー', unit: 'kcal/mL' },
      { key: 'エネルギー[kcal/100ml]', label: 'エネルギー', unit: 'kcal/100mL' },
      { key: 'タンパク質[g/100ml]', label: 'タンパク質', unit: 'g/100mL' },
      { key: '脂質[g/100ml]', label: '脂質', unit: 'g/100mL' },
      { key: '炭水化物[g/100ml]', label: '炭水化物', unit: 'g/100mL' },
      { key: 'ブドウ糖[%]', label: 'ブドウ糖', unit: '%' },
      { key: 'アミノ酸[%]', label: 'アミノ酸', unit: '%' },
      { key: '脂肪[%]', label: '脂肪', unit: '%' },
      { key: '食物繊維[g/100ml]', label: '食物繊維', unit: 'g/100mL' },
      { key: '食塩相当量[g/100ml]', label: '食塩相当量', unit: 'g/100mL' },
    ],
  },
  {
    id: 'electrolyte',
    label: '電解質',
    fields: [
      { key: 'Na[mEq/L]', label: 'Na', unit: 'mEq/L' },
      { key: 'K[mEq/L]', label: 'K', unit: 'mEq/L' },
      { key: 'Ca[mEq/L]', label: 'Ca', unit: 'mEq/L' },
      { key: 'Mg[mEq/L]', label: 'Mg', unit: 'mEq/L' },
      { key: 'P[mEq/L]', label: 'P', unit: 'mEq/L' },
      { key: 'Cl[mEq/L]', label: 'Cl', unit: 'mEq/L' },
      { key: 'SO4[mEq/L]', label: 'SO4', unit: 'mEq/L' },
      { key: 'Acetate[mEq/L]', label: 'Acetate', unit: 'mEq/L' },
      { key: 'Na[mEq/100ml]', label: 'Na', unit: 'mEq/100mL' },
      { key: 'K[mEq/100ml]', label: 'K', unit: 'mEq/100mL' },
      { key: 'Ca[mEq/100ml]', label: 'Ca', unit: 'mEq/100mL' },
      { key: 'Mg[mEq/100ml]', label: 'Mg', unit: 'mEq/100mL' },
      { key: 'P[mEq/100ml]', label: 'P', unit: 'mEq/100mL' },
      { key: 'Cl[mEq/100ml]', label: 'Cl', unit: 'mEq/100mL' },
      { key: 'SO4[mEq/100ml]', label: 'SO4', unit: 'mEq/100mL' },
      { key: 'Acetate[mEq/100ml]', label: 'Acetate', unit: 'mEq/100mL' },
    ],
  },
  {
    id: 'trace',
    label: '微量元素',
    fields: [
      { key: 'Fe[mg/100ml]', label: 'Fe', unit: 'mg/100mL' },
      { key: 'Zn[mg/100ml]', label: 'Zn', unit: 'mg/100mL' },
      { key: 'Cu[mg/100ml]', label: 'Cu', unit: 'mg/100mL' },
      { key: 'Mn[mg/100ml]', label: 'Mn', unit: 'mg/100mL' },
      { key: 'I[μg/100ml]', label: 'I', unit: 'μg/100mL' },
      { key: 'Se[μg/100ml]', label: 'Se', unit: 'μg/100mL' },
      { key: 'Cr[μg/100ml]', label: 'Cr', unit: 'μg/100mL' },
      { key: 'Mo[μg/100ml]', label: 'Mo', unit: 'μg/100mL' },
    ],
  },
  {
    id: 'vitamin',
    label: 'ビタミン',
    fields: [
      { key: 'ビタミンA[μg/100ml]', label: 'ビタミンA', unit: 'μg/100mL' },
      { key: 'ビタミンD[μg/100ml]', label: 'ビタミンD', unit: 'μg/100mL' },
      { key: 'ビタミンE[mg/100ml]', label: 'ビタミンE', unit: 'mg/100mL' },
      { key: 'ビタミンK[μg/100ml]', label: 'ビタミンK', unit: 'μg/100mL' },
      { key: 'ビタミンB1[mg/100ml]', label: 'ビタミンB1', unit: 'mg/100mL' },
      { key: 'ビタミンB2[mg/100ml]', label: 'ビタミンB2', unit: 'mg/100mL' },
      { key: 'ビタミンB6[mg/100ml]', label: 'ビタミンB6', unit: 'mg/100mL' },
      { key: 'ビタミンB12[μg/100ml]', label: 'ビタミンB12', unit: 'μg/100mL' },
      { key: 'ナイアシン[mg/100ml]', label: 'ナイアシン', unit: 'mg/100mL' },
      { key: 'パントテン酸[mg/100ml]', label: 'パントテン酸', unit: 'mg/100mL' },
      { key: '葉酸[μg/100ml]', label: '葉酸', unit: 'μg/100mL' },
      { key: 'ビオチン[μg/100ml]', label: 'ビオチン', unit: 'μg/100mL' },
      { key: 'ビタミンC[mg/100ml]', label: 'ビタミンC', unit: 'mg/100mL' },
    ],
  },
  {
    id: 'amino',
    label: 'アミノ酸',
    fields: [
      { key: 'イソロイシン[mg/100ml]', label: 'イソロイシン', unit: 'mg/100mL' },
      { key: 'ロイシン[mg/100ml]', label: 'ロイシン', unit: 'mg/100mL' },
      { key: 'リジン[mg/100ml]', label: 'リジン', unit: 'mg/100mL' },
      { key: 'メチオニン[mg/100ml]', label: 'メチオニン', unit: 'mg/100mL' },
      { key: 'フェニルアラニン[mg/100ml]', label: 'フェニルアラニン', unit: 'mg/100mL' },
      { key: 'スレオニン[mg/100ml]', label: 'スレオニン', unit: 'mg/100mL' },
      { key: 'トリプトファン[mg/100ml]', label: 'トリプトファン', unit: 'mg/100mL' },
      { key: 'バリン[mg/100ml]', label: 'バリン', unit: 'mg/100mL' },
      { key: 'ヒスチジン[mg/100ml]', label: 'ヒスチジン', unit: 'mg/100mL' },
      { key: 'アルギニン[mg/100ml]', label: 'アルギニン', unit: 'mg/100mL' },
      { key: 'アラニン[mg/100ml]', label: 'アラニン', unit: 'mg/100mL' },
      { key: 'アスパラギン酸[mg/100ml]', label: 'アスパラギン酸', unit: 'mg/100mL' },
      { key: 'システイン[mg/100ml]', label: 'システイン', unit: 'mg/100mL' },
      { key: 'グルタミン酸[mg/100ml]', label: 'グルタミン酸', unit: 'mg/100mL' },
      { key: 'グリシン[mg/100ml]', label: 'グリシン', unit: 'mg/100mL' },
      { key: 'プロリン[mg/100ml]', label: 'プロリン', unit: 'mg/100mL' },
      { key: 'セリン[mg/100ml]', label: 'セリン', unit: 'mg/100mL' },
      { key: 'チロシン[mg/100ml]', label: 'チロシン', unit: 'mg/100mL' },
      { key: 'タウリン[mg/100ml]', label: 'タウリン', unit: 'mg/100mL' },
      { key: 'カルニチン[mg/100ml]', label: 'カルニチン', unit: 'mg/100mL' },
      { key: 'グルタミン[mg/100ml]', label: 'グルタミン', unit: 'mg/100mL' },
    ],
  },
  {
    id: 'lipid',
    label: '脂肪酸',
    fields: [
      { key: '飽和脂肪酸[g/100ml]', label: '飽和脂肪酸', unit: 'g/100mL' },
      { key: '一価不飽和脂肪酸[g/100ml]', label: '一価不飽和脂肪酸', unit: 'g/100mL' },
      { key: '多価不飽和脂肪酸[g/100ml]', label: '多価不飽和脂肪酸', unit: 'g/100mL' },
      { key: 'リノール酸[g/100ml]', label: 'リノール酸', unit: 'g/100mL' },
      { key: 'α-リノレン酸[g/100ml]', label: 'α-リノレン酸', unit: 'g/100mL' },
      { key: 'アラキドン酸[g/100ml]', label: 'アラキドン酸', unit: 'g/100mL' },
      { key: 'EPA[g/100ml]', label: 'EPA', unit: 'g/100mL' },
      { key: 'DHA[g/100ml]', label: 'DHA', unit: 'g/100mL' },
      { key: 'MCT[g/100ml]', label: 'MCT', unit: 'g/100mL' },
    ],
  },
  {
    id: 'pharma',
    label: '薬事情報',
    fields: [
      { key: '適応', label: '適応', unit: '' },
      { key: '禁忌', label: '禁忌', unit: '' },
      { key: '特記事項', label: '特記事項', unit: '' },
      { key: '保存方法', label: '保存方法', unit: '' },
      { key: '有効期限', label: '有効期限', unit: '' },
      { key: '薬価[円/ml]', label: '薬価', unit: '円/mL' },
      { key: '包装単位', label: '包装単位', unit: '' },
      { key: '備考', label: '備考', unit: '' },
    ],
  },
] as const;
