type Product = Record<string, string | number>;

function safeNum(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

export interface OptimizationInput {
  readonly products: readonly Product[];
  readonly targetEnergy: number;
  readonly targetProtein: number;
  readonly maxTotalVolume: number;
  readonly isParenteral: boolean;
}

export interface OptimizedItem {
  readonly product: Product;
  readonly volume: number;
  readonly frequency: number;
  readonly dailyVolume: number;
  readonly energyContribution: number;
  readonly proteinContribution: number;
}

export interface OptimizationResult {
  readonly items: readonly OptimizedItem[];
  readonly totalEnergy: number;
  readonly totalProtein: number;
  readonly totalVolume: number;
  readonly energyAchievement: number;
  readonly proteinAchievement: number;
  readonly warnings: readonly string[];
}

function roundEnteral(volume: number): number {
  return Math.round(volume / 25) * 25;
}

function roundParenteral(volume: number): number {
  return Math.round(volume / 50) * 50;
}

function chooseFrequency(dailyVolume: number, isParenteral: boolean): { volume: number; frequency: number } {
  if (isParenteral) {
    if (dailyVolume <= 500) return { volume: dailyVolume, frequency: 1 };
    if (dailyVolume <= 1500) return { volume: dailyVolume, frequency: 1 };
    return { volume: Math.round(dailyVolume / 2), frequency: 2 };
  }

  if (dailyVolume <= 300) return { volume: dailyVolume, frequency: 3 };
  if (dailyVolume <= 600) return { volume: Math.round(dailyVolume / 3), frequency: 3 };
  if (dailyVolume <= 1000) return { volume: Math.round(dailyVolume / 4), frequency: 4 };
  if (dailyVolume <= 1500) return { volume: Math.round(dailyVolume / 5), frequency: 5 };
  return { volume: Math.round(dailyVolume / 6), frequency: 6 };
}

function getEnergyDensity(product: Product): number {
  return safeNum(product['エネルギー[kcal/ml]']);
}

function getProteinDensity(product: Product): number {
  return safeNum(product['タンパク質[g/100ml]']) / 100;
}

function buildItem(product: Product, dailyVolume: number, isParenteral: boolean): OptimizedItem {
  const roundFn = isParenteral ? roundParenteral : roundEnteral;
  const { volume, frequency } = chooseFrequency(dailyVolume, isParenteral);
  const roundedVolume = roundFn(volume);
  const actualDaily = roundedVolume * frequency;

  return {
    product,
    volume: Math.max(roundedVolume, isParenteral ? 50 : 25),
    frequency,
    dailyVolume: actualDaily,
    energyContribution: getEnergyDensity(product) * actualDaily,
    proteinContribution: getProteinDensity(product) * actualDaily,
  };
}

function optimizeSingle(
  product: Product,
  targetEnergy: number,
  maxVolume: number,
  isParenteral: boolean,
): OptimizedItem {
  const energyDensity = getEnergyDensity(product);
  if (energyDensity <= 0) {
    return buildItem(product, isParenteral ? 500 : 300, isParenteral);
  }
  const idealVolume = targetEnergy / energyDensity;
  const clampedVolume = Math.min(idealVolume, maxVolume);
  return buildItem(product, clampedVolume, isParenteral);
}

function optimizeDual(
  products: readonly Product[],
  targetEnergy: number,
  maxVolume: number,
  isParenteral: boolean,
): readonly OptimizedItem[] {
  const [primary, secondary] = products;
  const primaryDensity = getEnergyDensity(primary);
  const secondaryDensity = getEnergyDensity(secondary);

  const primaryTarget = targetEnergy * 0.65;
  const secondaryTarget = targetEnergy * 0.35;

  const primaryVolume = primaryDensity > 0
    ? Math.min(primaryTarget / primaryDensity, maxVolume * 0.7)
    : maxVolume * 0.5;

  const remainingVolume = maxVolume - primaryVolume;
  const secondaryVolume = secondaryDensity > 0
    ? Math.min(secondaryTarget / secondaryDensity, remainingVolume)
    : remainingVolume * 0.5;

  return [
    buildItem(primary, primaryVolume, isParenteral),
    buildItem(secondary, secondaryVolume, isParenteral),
  ];
}

export function optimizeVolumes(input: OptimizationInput): OptimizationResult {
  const { products, targetEnergy, targetProtein, maxTotalVolume, isParenteral } = input;
  const warnings: string[] = [];

  if (products.length === 0) {
    return {
      items: [],
      totalEnergy: 0,
      totalProtein: 0,
      totalVolume: 0,
      energyAchievement: 0,
      proteinAchievement: 0,
      warnings: ['適合する製品が見つかりませんでした'],
    };
  }

  let items: readonly OptimizedItem[];

  if (products.length === 1) {
    items = [optimizeSingle(products[0], targetEnergy, maxTotalVolume, isParenteral)];
  } else if (products.length === 2) {
    items = optimizeDual(products, targetEnergy, maxTotalVolume, isParenteral);
  } else {
    const primaryTarget = targetEnergy * 0.5;
    const perSecondary = (targetEnergy * 0.5) / (products.length - 1);
    const volumePerProduct = maxTotalVolume / products.length;

    items = products.map((p, i) => {
      const target = i === 0 ? primaryTarget : perSecondary;
      return optimizeSingle(p, target, volumePerProduct, isParenteral);
    });
  }

  const totalEnergy = items.reduce((sum, item) => sum + item.energyContribution, 0);
  const totalProtein = items.reduce((sum, item) => sum + item.proteinContribution, 0);
  const totalVolume = items.reduce((sum, item) => sum + item.dailyVolume, 0);

  const energyAchievement = targetEnergy > 0 ? Math.round((totalEnergy / targetEnergy) * 100) : 0;
  const proteinAchievement = targetProtein > 0 ? Math.round((totalProtein / targetProtein) * 100) : 0;

  if (energyAchievement < 80) {
    warnings.push(`目標エネルギーの${energyAchievement}%しか達成できません。水分制限が厳しい可能性があります`);
  }
  if (totalVolume > maxTotalVolume) {
    warnings.push(`総投与量${Math.round(totalVolume)}mLが水分制限${maxTotalVolume}mLを超過しています`);
  }
  if (proteinAchievement < 70) {
    warnings.push(`蛋白質が目標の${proteinAchievement}%です。蛋白補助製品の追加を検討してください`);
  }

  return {
    items,
    totalEnergy: Math.round(totalEnergy),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalVolume: Math.round(totalVolume),
    energyAchievement,
    proteinAchievement,
    warnings,
  };
}
