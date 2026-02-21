import type { Patient, NutritionType, NutritionRequirements } from '../types';
import type { LabData } from '../types/labData';
import type { AllergyWarning } from './allergyChecker';
import type { DrugNutrientInteraction } from './drugNutrientChecker';
import {
  classifyDiagnosis,
  conditionToJapanese,
  type ClassifiedCondition,
  type ConditionCategory,
} from './diagnosisClassifier';
import { getRuleForCondition, type NutrientFilter } from '../data/conditionProductRules';
import { optimizeVolumes, type OptimizedItem } from './volumeOptimizer';
import {
  calculateNutritionRequirements,
  adjustRequirementsForCondition,
} from './nutritionCalculation';
import { checkAllergies } from './allergyChecker';
import { checkDrugNutrientInteractions } from './drugNutrientChecker';

type Product = Record<string, string | number>;

export interface AutoGenerateInput {
  readonly weight: number;
  readonly height: number;
  readonly age: number;
  readonly gender: string;
  readonly diagnosis: string;
  readonly patientType: string;
  readonly allergies: readonly string[];
  readonly medications: readonly string[];
  readonly fluidRestriction?: number;
  readonly stressLevel?: string;
  readonly activityLevel?: string;
  readonly overrideNutritionType?: NutritionType;
}

export interface GeneratedMenuItem {
  readonly product: Product;
  readonly volume: number;
  readonly frequency: number;
  readonly rationale: string;
}

export interface GeneratedMenu {
  readonly items: readonly GeneratedMenuItem[];
  readonly nutritionType: NutritionType;
  readonly totalEnergy: number;
  readonly totalProtein: number;
  readonly totalVolume: number;
  readonly energyAchievement: number;
  readonly proteinAchievement: number;
  readonly requirements: NutritionRequirements;
  readonly condition: ClassifiedCondition;
  readonly conditionLabel: string;
  readonly rationale: string;
  readonly cautions: readonly string[];
  readonly allergyWarnings: readonly AllergyWarning[];
  readonly drugInteractions: readonly DrugNutrientInteraction[];
  readonly warnings: readonly string[];
}

function safeNum(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
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

function excludeAllergens(products: readonly Product[], allergies: readonly string[]): readonly Product[] {
  if (allergies.length === 0) return products;
  const patient = { allergies: [...allergies] } as Patient;
  return products.filter((p) => {
    const warnings = checkAllergies(patient, [{ product: p }]);
    return warnings.length === 0;
  });
}

function passesFilter(product: Product, filter: NutrientFilter): boolean {
  const value = safeNum(product[filter.field]);
  if (value === 0 && filter.operator !== 'lte') return true;
  switch (filter.operator) {
    case 'gt': return value > filter.value;
    case 'lt': return value < filter.value;
    case 'gte': return value >= filter.value;
    case 'lte': return value <= filter.value;
  }
}

function matchesKeyword(product: Product, keyword: string): boolean {
  const name = String(product['製剤名'] ?? '').toLowerCase();
  const sub = String(product['サブカテゴリ'] ?? '').toLowerCase();
  return name.includes(keyword.toLowerCase()) || sub.includes(keyword.toLowerCase());
}

function scoreProduct(product: Product, nameKeywords: readonly string[], filters: readonly NutrientFilter[]): number {
  let score = 0;
  for (const kw of nameKeywords) {
    if (matchesKeyword(product, kw)) score += 10;
  }
  for (const filter of filters) {
    if (passesFilter(product, filter)) score += 3;
  }
  const energy = safeNum(product['エネルギー[kcal/ml]']);
  if (energy > 0) score += 1;
  return score;
}

function selectProducts(
  allProducts: readonly Product[],
  nutritionType: NutritionType,
  condition: ConditionCategory,
  allergies: readonly string[],
  maxProducts: number,
): readonly Product[] {
  const rule = getRuleForCondition(condition);
  const criteria = nutritionType === 'enteral' ? rule.enteralCriteria : rule.parenteralCriteria;

  let candidates = filterByRoute(allProducts, nutritionType);
  candidates = excludeAllergens(candidates, allergies);

  if (candidates.length === 0) return [];

  const scored = candidates.map((p) => ({
    product: p,
    score: scoreProduct(p, criteria.nameKeywords, criteria.nutrientFilters),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const sortField = criteria.sortBy;
    const aVal = safeNum(a.product[sortField]);
    const bVal = safeNum(b.product[sortField]);
    return criteria.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const uniqueNames = new Set<string>();
  const selected: Product[] = [];

  for (const { product } of scored) {
    const name = String(product['製剤名'] ?? '');
    if (uniqueNames.has(name)) continue;
    uniqueNames.add(name);
    selected.push(product);
    if (selected.length >= maxProducts) break;
  }

  return selected;
}

function determineNutritionType(
  condition: ConditionCategory,
  override?: NutritionType,
): NutritionType {
  if (override) return override;
  const rule = getRuleForCondition(condition);
  if (rule.preferredNutritionType === 'either') return 'enteral';
  return rule.preferredNutritionType;
}

function buildRationale(
  condition: ClassifiedCondition,
  nutritionType: NutritionType,
  products: readonly Product[],
  requirements: NutritionRequirements,
): string {
  const condLabel = conditionToJapanese(condition.primary);
  const typeLabel = nutritionType === 'enteral' ? '経腸栄養' : '中心静脈栄養';
  const productNames = products.map((p) => String(p['製剤名'] ?? '')).join('、');

  const parts = [
    `【${condLabel}】${typeLabel}プランを自動生成しました。`,
    `目標エネルギー: ${requirements.energy} kcal/日、目標蛋白: ${requirements.protein} g/日。`,
    `選択製品: ${productNames}。`,
  ];

  if (condition.secondary.length > 0) {
    const secondaryLabels = condition.secondary.map(conditionToJapanese).join('、');
    parts.push(`併存疾患（${secondaryLabels}）も考慮しています。`);
  }

  if (condition.fluidRestriction) {
    parts.push(`水分制限: ${condition.fluidRestriction} mL/日。`);
  }

  if (condition.refeedingRisk) {
    parts.push('Refeeding症候群のリスクがあるため、低カロリーから開始します。');
  }

  return parts.join(' ');
}

function buildItemRationale(product: Product, condition: ConditionCategory): string {
  const name = String(product['製剤名'] ?? '');
  const energy = safeNum(product['エネルギー[kcal/ml]']);
  const protein = safeNum(product['タンパク質[g/100ml]']);

  const base = `${name} (${energy} kcal/mL, 蛋白 ${protein} g/100mL)`;
  const rule = getRuleForCondition(condition);

  for (const kw of rule.enteralCriteria.nameKeywords.concat(
    ...rule.parenteralCriteria.nameKeywords,
  )) {
    if (matchesKeyword(product, kw)) {
      return `${base} — ${rule.conditionLabel}に推奨`;
    }
  }

  return base;
}

export function generateNutritionMenu(
  input: AutoGenerateInput,
  allProducts: readonly Product[],
): GeneratedMenu {
  const condition = classifyDiagnosis(input.diagnosis, input.patientType, input.age);
  const nutritionType = determineNutritionType(condition.primary, input.overrideNutritionType);
  const rule = getRuleForCondition(condition.primary);

  const patient: Patient = {
    id: 'auto-gen',
    name: '自動生成',
    age: input.age,
    gender: input.gender,
    ward: '',
    admissionDate: new Date().toISOString().slice(0, 10),
    dischargeDate: '',
    patientType: input.patientType,
    weight: input.weight,
    height: input.height,
    diagnosis: input.diagnosis,
    allergies: [...input.allergies],
    medications: [...input.medications],
    notes: '',
  };

  const baseRequirements = calculateNutritionRequirements(
    patient,
    nutritionType,
    input.activityLevel ?? 'bedrest',
    input.stressLevel ?? 'moderate',
  );

  const conditionForAdjust = conditionToJapanese(condition.primary);
  const adjustedRequirements = adjustRequirementsForCondition(baseRequirements, conditionForAdjust);

  const requirements: NutritionRequirements = {
    ...adjustedRequirements,
    energy: Math.round(adjustedRequirements.energy * rule.energyMultiplier),
    protein: Math.round(adjustedRequirements.protein * rule.proteinMultiplier * 10) / 10,
  };

  const products = selectProducts(
    allProducts,
    nutritionType,
    condition.primary,
    input.allergies,
    rule.maxProducts,
  );

  const fluidLimit = input.fluidRestriction ?? condition.fluidRestriction ?? 2500;

  const optimized = optimizeVolumes({
    products,
    targetEnergy: requirements.energy,
    targetProtein: requirements.protein,
    maxTotalVolume: fluidLimit,
    isParenteral: nutritionType === 'parenteral',
  });

  const items: GeneratedMenuItem[] = optimized.items.map((item: OptimizedItem) => ({
    product: item.product,
    volume: item.volume,
    frequency: item.frequency,
    rationale: buildItemRationale(item.product, condition.primary),
  }));

  const menuItems = items.map((item) => ({ product: item.product }));
  const allergyWarnings = checkAllergies(patient, menuItems);
  const drugInteractions = checkDrugNutrientInteractions(
    patient.medications,
    menuItems,
    nutritionType,
  );

  const rationale = buildRationale(condition, nutritionType, products, requirements);

  return {
    items,
    nutritionType,
    totalEnergy: optimized.totalEnergy,
    totalProtein: optimized.totalProtein,
    totalVolume: optimized.totalVolume,
    energyAchievement: optimized.energyAchievement,
    proteinAchievement: optimized.proteinAchievement,
    requirements,
    condition,
    conditionLabel: rule.conditionLabel,
    rationale,
    cautions: [...rule.cautions],
    allergyWarnings,
    drugInteractions,
    warnings: [...optimized.warnings],
  };
}
