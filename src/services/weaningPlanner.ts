import type {
  WeaningPlan,
  WeaningPhaseConfig,
  WeaningMilestone,
  WeaningPhase,
  WeaningProgress,
} from "../types/weaningPlan";
import { WEANING_PHASE_LABELS } from "../types/weaningPlan";
import type { Patient } from "../types";
import { getAgeCategory } from "./pediatricNutritionCalculation";
import type { PediatricAgeCategory } from "./pediatricNutritionCalculation";

const PLAN_PHASES: readonly WeaningPhase[] = [
  "trophic",
  "advancing",
  "full-enteral",
  "oral-introduction",
  "oral-transition",
  "full-oral",
] as const;

type PhaseSpec = Readonly<{
  enteral: number;
  oral: number;
  parenteral: number;
  duration: number | Readonly<Partial<Record<PediatricAgeCategory, number>>>;
  advance: readonly string[];
  hold: readonly string[];
}>;

const PHASE_SPECS: Readonly<Record<string, PhaseSpec>> = {
  trophic: {
    enteral: 20,
    oral: 0,
    parenteral: 80,
    duration: { preterm: 5 },
    advance: ["GRV正常", "嘔吐なし", "腹部膨満なし"],
    hold: ["NEC疑い", "GRV持続高値", "血便"],
  },
  advancing: {
    enteral: 60,
    oral: 0,
    parenteral: 40,
    duration: { preterm: 7 },
    advance: ["耐性スコア7以上を2日連続", "体重増加"],
    hold: ["耐性スコア5未満", "嘔吐頻回"],
  },
  "full-enteral": {
    enteral: 100,
    oral: 0,
    parenteral: 0,
    duration: 3,
    advance: ["全量経腸で48時間以上安定", "体重増加持続"],
    hold: ["耐性悪化"],
  },
  "oral-introduction": {
    enteral: 70,
    oral: 30,
    parenteral: 0,
    duration: { infant: 7 },
    advance: ["嚥下機能評価クリア", "経口で必要量の30%以上摂取"],
    hold: ["誤嚥リスク", "経口拒否"],
  },
  "oral-transition": {
    enteral: 30,
    oral: 70,
    parenteral: 0,
    duration: 7,
    advance: ["経口で必要量の70%以上を3日連続", "体重維持"],
    hold: ["経口摂取量低下", "体重減少"],
  },
  "full-oral": {
    enteral: 0,
    oral: 100,
    parenteral: 0,
    duration: 3,
    advance: ["全量経口で72時間安定", "体重維持"],
    hold: ["摂取不良"],
  },
};

const DEFAULT_DURATIONS: Readonly<Record<string, number>> = {
  trophic: 3,
  advancing: 4,
  "full-enteral": 3,
  "oral-introduction": 5,
  "oral-transition": 7,
  "full-oral": 3,
};

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function resolveDuration(
  spec: PhaseSpec,
  category: PediatricAgeCategory,
  phase: string,
): number {
  if (typeof spec.duration === "number") return spec.duration;
  return (
    (spec.duration as Record<string, number>)[category] ??
    DEFAULT_DURATIONS[phase]
  );
}

function buildPhaseConfig(
  phase: WeaningPhase,
  patient: Patient,
): WeaningPhaseConfig {
  const spec = PHASE_SPECS[phase];
  if (!spec) throw new Error(`Unsupported weaning phase: ${phase}`);
  const category = getAgeCategory(patient);

  return {
    phase,
    label: WEANING_PHASE_LABELS[phase],
    enteralPercent: spec.enteral,
    oralPercent: spec.oral,
    parenteralPercent: spec.parenteral,
    durationDays: resolveDuration(spec, category, phase),
    advanceCriteria: spec.advance,
    holdCriteria: spec.hold,
  };
}

export function generateDefaultWeaningPlan(
  patient: Patient,
  startPhase: WeaningPhase = "trophic",
): WeaningPlan {
  const startIndex = PLAN_PHASES.indexOf(startPhase);
  const activePhases =
    startIndex >= 0 ? PLAN_PHASES.slice(startIndex) : [...PLAN_PHASES];

  const today = todayISO();
  const phases: readonly WeaningPhaseConfig[] = activePhases.map((p) =>
    buildPhaseConfig(p, patient),
  );

  let cumulativeDays = 0;
  const milestones: readonly WeaningMilestone[] = phases.map((cfg, idx) => {
    cumulativeDays += cfg.durationDays;
    return {
      id: `WM_${idx}_${Date.now()}`,
      phase: cfg.phase,
      description: `${cfg.label}達成`,
      targetDate: addDays(today, cumulativeDays),
      criteria: cfg.advanceCriteria,
      met: false,
    };
  });

  const totalDays = phases.reduce((sum, p) => sum + p.durationDays, 0);

  return {
    id: `WP_${Date.now()}`,
    patientId: patient.id,
    createdDate: today,
    targetCompletionDate: addDays(today, totalDays),
    currentPhase: activePhases[0],
    phases,
    milestones,
    notes: "",
    isActive: true,
  };
}

export function calculateWeaningProgress(plan: WeaningPlan): WeaningProgress {
  const today = todayISO();
  const completedPhases = plan.milestones.filter((m) => m.met).length;
  const totalPhases = plan.milestones.length;
  const daysElapsed = Math.max(0, daysBetween(plan.createdDate, today));
  const daysRemaining = Math.max(
    0,
    daysBetween(today, plan.targetCompletionDate),
  );

  const totalDuration = daysBetween(
    plan.createdDate,
    plan.targetCompletionDate,
  );
  const expectedPhases =
    totalDuration > 0
      ? Math.floor((daysElapsed / totalDuration) * totalPhases)
      : 0;

  const nextMilestone = plan.milestones.find((m) => !m.met) ?? null;

  return {
    plan,
    completedPhases,
    totalPhases,
    daysElapsed,
    daysRemaining,
    onTrack: completedPhases >= expectedPhases,
    nextMilestone,
  };
}

export function advancePlanPhase(plan: WeaningPlan): WeaningPlan {
  const currentIndex = PLAN_PHASES.indexOf(plan.currentPhase);
  const today = todayISO();

  const updatedMilestones: readonly WeaningMilestone[] = plan.milestones.map(
    (m) =>
      m.phase === plan.currentPhase && !m.met
        ? { ...m, met: true, completedDate: today }
        : m,
  );

  const nextIndex = currentIndex + 1;
  const nextPhase: WeaningPhase =
    nextIndex < PLAN_PHASES.length ? PLAN_PHASES[nextIndex] : "completed";

  return {
    ...plan,
    currentPhase: nextPhase,
    milestones: updatedMilestones,
    isActive: nextPhase !== "completed",
  };
}
