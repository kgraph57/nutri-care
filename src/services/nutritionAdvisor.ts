import type { Patient, NutritionType } from '../types';
import type { LabData, NutritionRecommendation, RecommendedProduct } from '../types/labData';
import { analyzeLabData, getAbnormalFindings } from './labAnalyzer';
import { checkAllergies } from './allergyChecker';

type Product = Record<string, string | number>;

function safeNum(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function productName(p: Product): string {
  return String(p['製剤名'] ?? '不明');
}

function filterByRoute(products: readonly Product[], nutritionType: NutritionType): readonly Product[] {
  const routeKey = nutritionType === 'enteral' ? '経腸' : '静脈';
  return products.filter((p) => {
    const route = String(p['投与経路'] ?? '');
    const category = String(p['カテゴリ'] ?? '');
    const sub = String(p['サブカテゴリ'] ?? '');
    return route.includes(routeKey) || category.includes(routeKey) || sub.includes(routeKey);
  });
}

function excludeAllergens(
  products: readonly Product[],
  patient: Patient
): readonly Product[] {
  if (patient.allergies.length === 0) return products;
  return products.filter((p) => {
    const warnings = checkAllergies(patient, [{ product: p }]);
    return warnings.length === 0;
  });
}

function toRecommended(p: Product, rationale: string): RecommendedProduct {
  return { product: p, rationale };
}

// ────────────────────────────
// Rule 1: 蛋白補給
// ────────────────────────────
function proteinRule(
  labData: LabData,
  products: readonly Product[]
): NutritionRecommendation | null {
  const alb = labData.albumin;
  const preAlb = labData.prealbumin;
  if (alb === undefined && preAlb === undefined) return null;

  const albLow = alb !== undefined && alb < 3.5;
  const albCritical = alb !== undefined && alb < 2.5;
  const preAlbLow = preAlb !== undefined && preAlb < 20;

  if (!albLow && !preAlbLow) return null;

  const priority = albCritical ? 'high' : 'medium';
  const reasoning = albCritical
    ? `Alb ${alb} g/dL: 重度低アルブミン血症。高タンパク製品での積極的な蛋白補給を推奨します`
    : `Alb ${alb ?? '?'} g/dL${preAlbLow ? `, PreAlb ${preAlb} mg/dL` : ''}: 蛋白栄養状態の改善が必要です`;

  const matched = products
    .filter((p) => safeNum(p['タンパク質[g/100ml]']) > 3.5)
    .sort((a, b) => safeNum(b['タンパク質[g/100ml]']) - safeNum(a['タンパク質[g/100ml]']))
    .slice(0, 5)
    .map((p) =>
      toRecommended(p, `タンパク質 ${safeNum(p['タンパク質[g/100ml]'])} g/100ml`)
    );

  if (matched.length === 0) return null;

  return { priority, category: '蛋白補給', reasoning, products: matched };
}

// ────────────────────────────
// Rule 2: 腎保護
// ────────────────────────────
function renalRule(
  labData: LabData,
  products: readonly Product[]
): NutritionRecommendation | null {
  const cr = labData.creatinine;
  const bun = labData.bun;
  if (cr === undefined && bun === undefined) return null;

  const crHigh = cr !== undefined && cr > 1.2;
  const bunHigh = bun !== undefined && bun > 20;
  if (!crHigh && !bunHigh) return null;

  const critical = (cr !== undefined && cr > 3.0) || (bun !== undefined && bun > 40);
  const priority = critical ? 'high' : 'medium';
  const reasoning = `Cr ${cr ?? '?'} mg/dL, BUN ${bun ?? '?'} mg/dL: 腎機能低下。低カリウム・低リン・蛋白調整製品を推奨します`;

  const matched = products
    .filter((p) => {
      const k = safeNum(p['K[mEq/L]']);
      const phos = safeNum(p['P[mEq/L]']);
      return k < 30 || phos < 15;
    })
    .slice(0, 5)
    .map((p) =>
      toRecommended(p, `K ${safeNum(p['K[mEq/L]'])} mEq/L, P ${safeNum(p['P[mEq/L]'])} mEq/L`)
    );

  if (matched.length === 0) return null;

  return { priority, category: '腎保護', reasoning, products: matched };
}

// ────────────────────────────
// Rule 3: 血糖管理
// ────────────────────────────
function glucoseRule(
  labData: LabData,
  products: readonly Product[]
): NutritionRecommendation | null {
  const bs = labData.bloodSugar;
  const hba1c = labData.hba1c;
  if (bs === undefined && hba1c === undefined) return null;

  const bsHigh = bs !== undefined && bs > 140;
  const hba1cHigh = hba1c !== undefined && hba1c > 6.0;
  if (!bsHigh && !hba1cHigh) return null;

  const critical = (bs !== undefined && bs > 250) || (hba1c !== undefined && hba1c > 8.0);
  const priority = critical ? 'high' : 'medium';
  const reasoning = `BS ${bs ?? '?'} mg/dL${hba1c !== undefined ? `, HbA1c ${hba1c}%` : ''}: 高血糖。低炭水化物・糖尿病対応製品を推奨します`;

  const matched = products
    .filter((p) => safeNum(p['炭水化物[g/100ml]']) < 15 && safeNum(p['炭水化物[g/100ml]']) > 0)
    .sort((a, b) => safeNum(a['炭水化物[g/100ml]']) - safeNum(b['炭水化物[g/100ml]']))
    .slice(0, 5)
    .map((p) =>
      toRecommended(p, `炭水化物 ${safeNum(p['炭水化物[g/100ml]'])} g/100ml`)
    );

  if (matched.length === 0) return null;

  return { priority, category: '血糖管理', reasoning, products: matched };
}

// ────────────────────────────
// Rule 4: 肝保護（BCAA）
// ────────────────────────────
function liverRule(
  labData: LabData,
  products: readonly Product[]
): NutritionRecommendation | null {
  const ast = labData.ast;
  const alt = labData.alt;
  const tbil = labData.totalBilirubin;
  if (ast === undefined && alt === undefined && tbil === undefined) return null;

  const astHigh = ast !== undefined && ast > 40;
  const altHigh = alt !== undefined && alt > 45;
  const tbilHigh = tbil !== undefined && tbil > 1.2;
  if (!astHigh && !altHigh && !tbilHigh) return null;

  const critical = (ast !== undefined && ast > 200) || (alt !== undefined && alt > 200) || (tbil !== undefined && tbil > 3.0);
  const priority = critical ? 'high' : 'medium';
  const reasoning = `AST ${ast ?? '?'}, ALT ${alt ?? '?'}, T-Bil ${tbil ?? '?'}: 肝機能障害。BCAA製品・肝不全用製品を推奨します`;

  const bcaaTerms = ['BCAA', 'bcaa', '分岐鎖', 'アミノレバン', 'ヘパン', '肝不全'];
  const matched = products
    .filter((p) => {
      const name = String(p['製剤名'] ?? '');
      const sub = String(p['サブカテゴリ'] ?? '');
      const notes = String(p['特記事項'] ?? '');
      const indication = String(p['適応'] ?? '');
      const text = `${name}${sub}${notes}${indication}`;
      return bcaaTerms.some((t) => text.includes(t));
    })
    .slice(0, 5)
    .map((p) => toRecommended(p, 'BCAA製品 / 肝不全用'));

  if (matched.length === 0) return null;

  return { priority, category: '肝保護（BCAA）', reasoning, products: matched };
}

// ────────────────────────────
// Rule 5: 電解質補正
// ────────────────────────────
function electrolyteRule(
  labData: LabData,
  products: readonly Product[]
): NutritionRecommendation | null {
  const issues: string[] = [];

  if (labData.potassium !== undefined && labData.potassium < 3.5) {
    issues.push(`K ${labData.potassium} mEq/L 低値`);
  }
  if (labData.potassium !== undefined && labData.potassium > 5.0) {
    issues.push(`K ${labData.potassium} mEq/L 高値`);
  }
  if (labData.sodium !== undefined && labData.sodium < 135) {
    issues.push(`Na ${labData.sodium} mEq/L 低値`);
  }
  if (labData.calcium !== undefined && labData.calcium < 8.5) {
    issues.push(`Ca ${labData.calcium} mg/dL 低値`);
  }
  if (labData.magnesium !== undefined && labData.magnesium < 1.8) {
    issues.push(`Mg ${labData.magnesium} mg/dL 低値`);
  }
  if (labData.phosphorus !== undefined && labData.phosphorus < 2.5) {
    issues.push(`P ${labData.phosphorus} mg/dL 低値`);
  }

  if (issues.length === 0) return null;

  const hasCritical = (labData.potassium !== undefined && (labData.potassium < 2.5 || labData.potassium > 6.5)) ||
    (labData.sodium !== undefined && (labData.sodium < 125 || labData.sodium > 155));
  const priority = hasCritical ? 'high' : 'medium';
  const reasoning = `電解質異常: ${issues.join('、')}。補正製品の追加を検討してください`;

  const matched = products
    .filter((p) => {
      const cat = String(p['カテゴリ'] ?? '');
      const sub = String(p['サブカテゴリ'] ?? '');
      const name = String(p['製剤名'] ?? '');
      return cat.includes('電解質') || sub.includes('電解質') || name.includes('電解質');
    })
    .slice(0, 5)
    .map((p) => toRecommended(p, '電解質補正'));

  if (matched.length === 0) return null;

  return { priority, category: '電解質補正', reasoning, products: matched };
}

// ────────────────────────────
// Rule 6: 炎症対応
// ────────────────────────────
function inflammationRule(
  labData: LabData,
  products: readonly Product[]
): NutritionRecommendation | null {
  const crp = labData.crp;
  if (crp === undefined || crp <= 0.5) return null;

  const critical = crp > 10;
  const priority = critical ? 'high' : 'low';
  const reasoning = `CRP ${crp} mg/dL: ${critical ? '強い炎症反応' : '炎症反応あり'}。高エネルギー・免疫栄養を推奨します`;

  const matched = products
    .filter((p) => safeNum(p['エネルギー[kcal/ml]']) >= 1.2)
    .sort((a, b) => safeNum(b['エネルギー[kcal/ml]']) - safeNum(a['エネルギー[kcal/ml]']))
    .slice(0, 5)
    .map((p) =>
      toRecommended(p, `${safeNum(p['エネルギー[kcal/ml]'])} kcal/ml 高エネルギー`)
    );

  if (matched.length === 0) return null;

  return { priority, category: '炎症対応', reasoning, products: matched };
}

// ────────────────────────────
// Rule 7: 貧血対応
// ────────────────────────────
function anemiaRule(
  labData: LabData,
  products: readonly Product[]
): NutritionRecommendation | null {
  const hb = labData.hemoglobin;
  if (hb === undefined || hb >= 12) return null;

  const critical = hb < 7;
  const priority = critical ? 'high' : 'low';
  const reasoning = `Hb ${hb} g/dL: ${critical ? '重度貧血' : '貧血'}。鉄分を含む製品を推奨します`;

  const matched = products
    .filter((p) => safeNum(p['Fe[mg/100ml]']) > 0)
    .sort((a, b) => safeNum(b['Fe[mg/100ml]']) - safeNum(a['Fe[mg/100ml]']))
    .slice(0, 5)
    .map((p) =>
      toRecommended(p, `Fe ${safeNum(p['Fe[mg/100ml]'])} mg/100ml`)
    );

  if (matched.length === 0) return null;

  return { priority, category: '貧血対応', reasoning, products: matched };
}

// ────────────────────────────
// Rule 8: 脂質管理
// ────────────────────────────
function lipidRule(
  labData: LabData,
  products: readonly Product[]
): NutritionRecommendation | null {
  const tg = labData.triglycerides;
  if (tg === undefined || tg <= 150) return null;

  const critical = tg > 500;
  const priority = critical ? 'high' : 'low';
  const reasoning = `TG ${tg} mg/dL: ${critical ? '重症高TG血症。脂肪投与禁忌の可能性' : '高TG血症'}。低脂肪・MCT製品を推奨します`;

  const matched = products
    .filter((p) => {
      const fat = safeNum(p['脂質[g/100ml]']);
      const mct = safeNum(p['MCT[g/100ml]']);
      return fat < 3.0 || mct > 0;
    })
    .sort((a, b) => safeNum(a['脂質[g/100ml]']) - safeNum(b['脂質[g/100ml]']))
    .slice(0, 5)
    .map((p) =>
      toRecommended(p, `脂質 ${safeNum(p['脂質[g/100ml]'])} g/100ml${safeNum(p['MCT[g/100ml]']) > 0 ? ' (MCT含有)' : ''}`)
    );

  if (matched.length === 0) return null;

  return { priority, category: '脂質管理', reasoning, products: matched };
}

// ────────────────────────────
// Main entry point
// ────────────────────────────
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function generateRecommendations(
  patient: Patient,
  labData: LabData,
  nutritionType: NutritionType,
  allProducts: readonly Product[]
): readonly NutritionRecommendation[] {
  const filtered = excludeAllergens(filterByRoute(allProducts, nutritionType), patient);

  const rules = [
    proteinRule,
    renalRule,
    glucoseRule,
    liverRule,
    electrolyteRule,
    inflammationRule,
    anemiaRule,
    lipidRule,
  ];

  const recommendations = rules
    .map((rule) => rule(labData, filtered))
    .filter((r): r is NutritionRecommendation => r !== null);

  return [...recommendations].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}

export function generateStrategySummary(
  labData: LabData
): string {
  const interpretations = analyzeLabData(labData);
  const abnormal = getAbnormalFindings(interpretations);

  if (abnormal.length === 0) {
    return '検査値は概ね正常範囲内です。標準的な栄養管理を継続してください。';
  }

  const parts: string[] = [];

  if (labData.albumin !== undefined && labData.albumin < 3.5) {
    parts.push('蛋白補給の強化');
  }
  if (labData.creatinine !== undefined && labData.creatinine > 1.2) {
    parts.push('腎保護を考慮した栄養設計');
  }
  if ((labData.bloodSugar !== undefined && labData.bloodSugar > 140) ||
      (labData.hba1c !== undefined && labData.hba1c > 6.0)) {
    parts.push('血糖コントロール重視');
  }
  if ((labData.ast !== undefined && labData.ast > 40) ||
      (labData.alt !== undefined && labData.alt > 45)) {
    parts.push('肝保護・BCAA補充');
  }
  if (labData.crp !== undefined && labData.crp > 0.5) {
    parts.push('炎症対応の栄養強化');
  }
  if (labData.hemoglobin !== undefined && labData.hemoglobin < 12) {
    parts.push('鉄分補給');
  }
  if (labData.triglycerides !== undefined && labData.triglycerides > 150) {
    parts.push('脂質制限');
  }

  if (parts.length === 0) {
    return `${abnormal.length}件の異常値があります。個別の推奨をご確認ください。`;
  }

  return `推奨方針: ${parts.join('、')}`;
}
