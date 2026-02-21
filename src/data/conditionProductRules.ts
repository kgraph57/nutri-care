import type { ConditionCategory } from '../services/diagnosisClassifier';
import type { NutritionType } from '../types';

export interface NutrientFilter {
  readonly field: string;
  readonly operator: 'gt' | 'lt' | 'gte' | 'lte';
  readonly value: number;
}

export interface ProductCriteria {
  readonly nameKeywords: readonly string[];
  readonly nutrientFilters: readonly NutrientFilter[];
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
}

export interface ConditionProductRule {
  readonly condition: ConditionCategory;
  readonly preferredNutritionType: NutritionType | 'either';
  readonly enteralCriteria: ProductCriteria;
  readonly parenteralCriteria: ProductCriteria;
  readonly maxProducts: number;
  readonly energyMultiplier: number;
  readonly proteinMultiplier: number;
  readonly cautions: readonly string[];
  readonly conditionLabel: string;
}

export const CONDITION_PRODUCT_RULES: readonly ConditionProductRule[] = [
  {
    condition: 'standard',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['エンシュア', 'エネーボ', 'アイソカル', 'CZ-Hi', 'メイバランス'],
      nutrientFilters: [{ field: 'エネルギー[kcal/ml]', operator: 'gte', value: 1.0 }],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    parenteralCriteria: {
      nameKeywords: ['エルネオパ', 'フルカリック'],
      nutrientFilters: [{ field: 'エネルギー[kcal/ml]', operator: 'gt', value: 0 }],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    maxProducts: 2,
    energyMultiplier: 1.0,
    proteinMultiplier: 1.0,
    cautions: [],
    conditionLabel: '標準',
  },
  {
    condition: 'renal',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['リーナレン'],
      nutrientFilters: [
        { field: 'K[mEq/L]', operator: 'lt', value: 30 },
        { field: 'P[mEq/L]', operator: 'lt', value: 15 },
      ],
      sortBy: 'K[mEq/L]',
      sortOrder: 'asc',
    },
    parenteralCriteria: {
      nameKeywords: ['ネオアミユー', 'キドミン'],
      nutrientFilters: [{ field: 'K[mEq/L]', operator: 'lt', value: 30 }],
      sortBy: 'K[mEq/L]',
      sortOrder: 'asc',
    },
    maxProducts: 2,
    energyMultiplier: 1.0,
    proteinMultiplier: 0.8,
    cautions: [
      '電解質（K・P・Na）を定期モニタリングのこと',
      '蛋白過剰投与は腎機能悪化リスクあり',
    ],
    conditionLabel: '腎不全',
  },
  {
    condition: 'renal_dialysis',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['リーナレン', 'プロシュア', 'ペプタメン'],
      nutrientFilters: [],
      sortBy: 'タンパク質[g/100ml]',
      sortOrder: 'desc',
    },
    parenteralCriteria: {
      nameKeywords: ['ネオアミユー', 'エルネオパ'],
      nutrientFilters: [],
      sortBy: 'アミノ酸[%]',
      sortOrder: 'desc',
    },
    maxProducts: 2,
    energyMultiplier: 1.0,
    proteinMultiplier: 1.2,
    cautions: [
      '透析施行日/非施行日でK・P摂取量を調整',
      '透析中の蛋白喪失（約10g/回）を補うため保存期より蛋白量を増やす',
    ],
    conditionLabel: '透析',
  },
  {
    condition: 'hepatic',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['アミノレバン', 'ヘパン', 'BCAA'],
      nutrientFilters: [],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    parenteralCriteria: {
      nameKeywords: ['モリヘパミン', 'アミノレバン', 'テルフィス'],
      nutrientFilters: [],
      sortBy: 'アミノ酸[%]',
      sortOrder: 'desc',
    },
    maxProducts: 2,
    energyMultiplier: 1.0,
    proteinMultiplier: 0.8,
    cautions: [
      '血中アンモニア値を定期確認',
      '肝性脳症増悪時は蛋白制限を再検討',
      '就寝前200kcal程度の軽食（LES）が有効',
    ],
    conditionLabel: '肝不全',
  },
  {
    condition: 'diabetes',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['グルセルナ', 'インスロー'],
      nutrientFilters: [{ field: '炭水化物[g/100ml]', operator: 'lt', value: 15 }],
      sortBy: '炭水化物[g/100ml]',
      sortOrder: 'asc',
    },
    parenteralCriteria: {
      nameKeywords: ['ネオアミユー', 'ヴィーンF'],
      nutrientFilters: [{ field: 'ブドウ糖[%]', operator: 'lt', value: 10 }],
      sortBy: 'ブドウ糖[%]',
      sortOrder: 'asc',
    },
    maxProducts: 2,
    energyMultiplier: 1.0,
    proteinMultiplier: 1.0,
    cautions: [
      '血糖140-180 mg/dLを目標にインスリンで管理',
      '低血糖（<70 mg/dL）にも注意',
    ],
    conditionLabel: '糖尿病',
  },
  {
    condition: 'respiratory',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['プルモケア', 'オキシーパ'],
      nutrientFilters: [{ field: '脂質[g/100ml]', operator: 'gt', value: 4 }],
      sortBy: '脂質[g/100ml]',
      sortOrder: 'desc',
    },
    parenteralCriteria: {
      nameKeywords: ['イントラリポス', 'エルネオパ'],
      nutrientFilters: [],
      sortBy: '脂肪[%]',
      sortOrder: 'desc',
    },
    maxProducts: 2,
    energyMultiplier: 1.0,
    proteinMultiplier: 1.0,
    cautions: [
      '過剰カロリーはCO2産生増加を招く',
      '間接熱量測定によるRQ管理が望ましい',
    ],
    conditionLabel: '呼吸不全',
  },
  {
    condition: 'burn',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['ペプタメン', 'プロシュア', 'インパクト'],
      nutrientFilters: [{ field: 'タンパク質[g/100ml]', operator: 'gt', value: 3.0 }],
      sortBy: 'タンパク質[g/100ml]',
      sortOrder: 'desc',
    },
    parenteralCriteria: {
      nameKeywords: ['エルネオパ', 'ネオアミユー', 'イントラリポス'],
      nutrientFilters: [],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    maxProducts: 3,
    energyMultiplier: 1.5,
    proteinMultiplier: 1.5,
    cautions: [
      'Curreri式または間接熱量測定でカロリー目標を個別設定',
      '電解質・血糖を頻回モニタリング',
    ],
    conditionLabel: '熱傷',
  },
  {
    condition: 'refeeding_risk',
    preferredNutritionType: 'parenteral',
    enteralCriteria: {
      nameKeywords: ['エンシュア', 'ペプタメン'],
      nutrientFilters: [{ field: 'エネルギー[kcal/ml]', operator: 'lte', value: 1.0 }],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'asc',
    },
    parenteralCriteria: {
      nameKeywords: ['ヴィーンF', 'ビカーボン', 'ソルデム'],
      nutrientFilters: [],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'asc',
    },
    maxProducts: 1,
    energyMultiplier: 0.4,
    proteinMultiplier: 0.5,
    cautions: [
      '開始時は10 kcal/kg/日以下から',
      'P・K・Mgを毎日測定し低下時は補充',
      'チアミン（Vit B1）を開始前に必ず投与',
      '3-5日かけて目標カロリーまで漸増',
    ],
    conditionLabel: 'Refeeding症候群リスク',
  },
  {
    condition: 'cardiac',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['イノラス', 'テルミール2.0', 'アクトスルー', 'サンエット-2.0'],
      nutrientFilters: [{ field: 'エネルギー[kcal/ml]', operator: 'gte', value: 1.5 }],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    parenteralCriteria: {
      nameKeywords: ['エルネオパ'],
      nutrientFilters: [],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    maxProducts: 1,
    energyMultiplier: 0.9,
    proteinMultiplier: 1.0,
    cautions: [
      '1日総水分量（静注・内服・栄養剤）を合算して制限内に',
      '体重・浮腫・尿量を毎日確認',
      'Na制限（<2g/日）も並行管理',
    ],
    conditionLabel: '心不全',
  },
  {
    condition: 'postoperative',
    preferredNutritionType: 'either',
    enteralCriteria: {
      nameKeywords: ['ペプタメン', 'エレンタール', 'インパクト'],
      nutrientFilters: [{ field: 'タンパク質[g/100ml]', operator: 'gt', value: 3.0 }],
      sortBy: 'タンパク質[g/100ml]',
      sortOrder: 'desc',
    },
    parenteralCriteria: {
      nameKeywords: ['エルネオパ', 'モリヘパミン'],
      nutrientFilters: [],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    maxProducts: 2,
    energyMultiplier: 1.2,
    proteinMultiplier: 1.3,
    cautions: [
      '経腸栄養が可能になり次第、早期に移行すること',
      '感染リスク低減のため中心静脈カテーテル管理に留意',
    ],
    conditionLabel: '術後・外傷',
  },
  {
    condition: 'pediatric_standard',
    preferredNutritionType: 'enteral',
    enteralCriteria: {
      nameKeywords: ['エンシュア', 'アイソカル1.0ジュニア', 'エレンタールP'],
      nutrientFilters: [{ field: 'エネルギー[kcal/ml]', operator: 'gte', value: 1.0 }],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    parenteralCriteria: {
      nameKeywords: ['ネオアミユー', 'イントラリポス'],
      nutrientFilters: [],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'desc',
    },
    maxProducts: 2,
    energyMultiplier: 1.0,
    proteinMultiplier: 1.0,
    cautions: [
      '年齢・体重による目標エネルギーを個別設定',
      '消化管耐性を確認しながら増量',
    ],
    conditionLabel: '小児',
  },
  {
    condition: 'pediatric_nicu',
    preferredNutritionType: 'parenteral',
    enteralCriteria: {
      nameKeywords: ['エレンタールP', 'アイソカル1.0ジュニア'],
      nutrientFilters: [],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'asc',
    },
    parenteralCriteria: {
      nameKeywords: ['ネオアミユー', 'イントラリポス', 'ビカーボン'],
      nutrientFilters: [],
      sortBy: 'エネルギー[kcal/ml]',
      sortOrder: 'asc',
    },
    maxProducts: 3,
    energyMultiplier: 1.0,
    proteinMultiplier: 1.0,
    cautions: [
      'エネルギー目標110-120 kcal/kg/日を体重換算で設定',
      '蛋白3.5-4.5 g/kg/日',
      '脂質は0.5 g/kg/日から開始し漸増',
      '高血糖・電解質異常を毎日確認',
    ],
    conditionLabel: 'NICU',
  },
];

export function getRuleForCondition(condition: ConditionCategory): ConditionProductRule {
  return CONDITION_PRODUCT_RULES.find((r) => r.condition === condition)
    ?? CONDITION_PRODUCT_RULES[0];
}
