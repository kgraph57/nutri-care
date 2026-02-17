import type { NutritionRequirements } from "../types";

export interface ProtocolStep {
  readonly day: number;
  readonly rate: number;       // mL/hr
  readonly hours: number;      // infusion hours per day
  readonly dailyVolume: number; // mL/day
  readonly dailyEnergy: number; // kcal/day
  readonly percentOfTarget: number;
}

export interface FeedingProtocol {
  readonly steps: readonly ProtocolStep[];
  readonly targetRate: number;
  readonly targetVolume: number;
  readonly daysToTarget: number;
  readonly notes: readonly string[];
}

export interface ProtocolOptions {
  readonly targetVolume: number;      // mL/day target
  readonly energyDensity: number;     // kcal/mL of the formula
  readonly infusionHours: number;     // hours per day (e.g., 20, 24)
  readonly startPercent: number;      // starting % of target (e.g., 25)
  readonly dailyIncrease: number;     // % increase per day (e.g., 25)
  readonly maxRate?: number;          // optional max rate cap (mL/hr)
  readonly isHighRisk?: boolean;      // refeeding risk → slower ramp
}

/**
 * Generate a feeding advancement protocol.
 * Standard ICU practice: start at 25% of target, advance by 25%/day.
 * High risk (refeeding): start at 10-15 kcal/kg/day, advance 10-20%/day.
 */
export function generateFeedingProtocol(
  options: ProtocolOptions,
): FeedingProtocol {
  const {
    targetVolume,
    energyDensity,
    infusionHours,
    startPercent,
    dailyIncrease,
    maxRate,
    isHighRisk = false,
  } = options;

  const targetEnergy = targetVolume * energyDensity;
  const targetRate = Math.round((targetVolume / infusionHours) * 10) / 10;
  const effectiveMaxRate = maxRate ?? targetRate;

  const steps: ProtocolStep[] = [];
  let currentPercent = startPercent;
  let day = 1;

  while (currentPercent <= 100 && day <= 14) {
    const pct = Math.min(currentPercent, 100);
    const dailyVolume = Math.round((targetVolume * pct) / 100);
    const rate = Math.min(
      Math.round((dailyVolume / infusionHours) * 10) / 10,
      effectiveMaxRate,
    );
    const dailyEnergy = Math.round(dailyVolume * energyDensity);

    steps.push({
      day,
      rate,
      hours: infusionHours,
      dailyVolume,
      dailyEnergy,
      percentOfTarget: Math.round(pct),
    });

    if (currentPercent >= 100) break;

    currentPercent += dailyIncrease;
    day++;
  }

  const notes: string[] = [];

  if (isHighRisk) {
    notes.push("Refeeding高リスク: チアミン(VitB1) 200-300mg/日を投与開始前に補充");
    notes.push("リン・カリウム・マグネシウムを1日2回モニタリング");
    notes.push("体液バランスを厳密に管理（Na制限、輸液量に注意）");
  }

  notes.push(`目標投与量: ${targetVolume}mL/日 (${Math.round(targetEnergy)}kcal/日)`);
  notes.push(`投与速度: ${infusionHours}時間持続投与`);
  notes.push("GRV(胃残量) 500mL超で投与速度を減速、嘔吐時は一時中止");
  notes.push("下痢持続時は投与速度を半減し、止痢剤を検討");

  return {
    steps,
    targetRate,
    targetVolume,
    daysToTarget: steps.length,
    notes,
  };
}

/**
 * Create protocol options from nutrition requirements.
 */
export function createProtocolFromRequirements(
  requirements: NutritionRequirements,
  energyDensity: number,
  isHighRisk: boolean = false,
): ProtocolOptions {
  const targetVolume = Math.round(requirements.energy / energyDensity);

  return {
    targetVolume,
    energyDensity,
    infusionHours: 20,
    startPercent: isHighRisk ? 15 : 25,
    dailyIncrease: isHighRisk ? 15 : 25,
    isHighRisk,
  };
}
