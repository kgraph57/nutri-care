import { useMemo } from "react";
import { ChevronRight, Target, Clock, Zap } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import { WeaningPhaseTimeline } from "../../components/weaning/WeaningPhaseTimeline";
import type { Patient } from "../../types";
import type { WeaningPlan } from "../../types/weaningPlan";
import { WEANING_PHASE_LABELS } from "../../types/weaningPlan";
import { calculateWeaningProgress } from "../../services/weaningPlanner";
import styles from "./NutritionPhaseContextCard.module.css";

interface NutritionPhaseContextCardProps {
  readonly patient: Patient;
  readonly daysAdmitted: number;
  readonly weaningPlan?: WeaningPlan;
}

/* ---- ICU general phase (no formal plan) ---- */

interface IcuPhase {
  readonly name: string;
  readonly variant: "danger" | "warning" | "success";
  readonly energyTarget: string;
  readonly proteinTarget: string;
  readonly focus: string;
  readonly note: string;
}

function getIcuPhase(daysAdmitted: number, weight: number): IcuPhase {
  const minEnergy20 = Math.round(weight * 20);
  const maxEnergy25 = Math.round(weight * 25);
  const maxEnergy30 = Math.round(weight * 30);
  const maxEnergy35 = Math.round(weight * 35);

  if (daysAdmitted <= 2) {
    return {
      name: "急性期",
      variant: "danger",
      energyTarget: `${minEnergy20}〜${maxEnergy25} kcal/日`,
      proteinTarget: `${(weight * 1.0).toFixed(0)}〜${(weight * 1.2).toFixed(0)} g/日`,
      focus: "低カロリーから開始・Refeeding予防・血糖管理",
      note: "過剰投与を避け、電解質（P・K・Mg）を毎日確認",
    };
  }
  if (daysAdmitted <= 7) {
    return {
      name: "安定期",
      variant: "warning",
      energyTarget: `${maxEnergy25}〜${maxEnergy30} kcal/日`,
      proteinTarget: `${(weight * 1.2).toFixed(0)}〜${(weight * 1.5).toFixed(0)} g/日`,
      focus: "目標カロリーへ段階的に増量・経腸栄養を継続",
      note: "GRV・耐性を確認しながら増量。タンパク質充足を優先",
    };
  }
  return {
    name: "回復期",
    variant: "success",
    energyTarget: `${maxEnergy25}〜${maxEnergy35} kcal/日`,
    proteinTarget: `${(weight * 1.5).toFixed(0)}〜${(weight * 2.0).toFixed(0)} g/日`,
    focus: "目標達成・リハビリ対応栄養・経口移行の検討",
    note: "嚥下評価を行い経口摂取への移行を計画",
  };
}

/* ---- Component for patients with a formal WeaningPlan ---- */

function FormalPlanView({ plan }: { readonly plan: WeaningPlan }) {
  const progress = useMemo(() => calculateWeaningProgress(plan), [plan]);
  const currentConfig = useMemo(
    () => plan.phases.find((p) => p.phase === plan.currentPhase),
    [plan],
  );

  const isCompleted = plan.currentPhase === "completed";
  const phaseName = WEANING_PHASE_LABELS[plan.currentPhase];

  return (
    <div className={styles.formalPlan}>
      {/* Phase timeline */}
      <WeaningPhaseTimeline
        phases={plan.phases}
        currentPhase={plan.currentPhase}
        progress={progress}
      />

      <hr className={styles.divider} />

      {/* Current phase summary */}
      <div className={styles.phaseRow}>
        <div className={styles.phaseLeft}>
          <span className={styles.phaseLabel}>現在のフェーズ</span>
          <span className={styles.phaseName}>{phaseName}</span>
        </div>
        <div className={styles.phaseRight}>
          {isCompleted ? (
            <Badge variant="success">離脱完了</Badge>
          ) : (
            <Badge variant={progress.onTrack ? "success" : "warning"}>
              {progress.onTrack ? "順調" : "遅延あり"}
            </Badge>
          )}
        </div>
      </div>

      {currentConfig && !isCompleted && (
        <div className={styles.targetGrid}>
          <div className={styles.targetItem}>
            <span className={styles.targetLabel}>
              <Zap size={12} />
              栄養配分
            </span>
            <span className={styles.targetValue}>
              {currentConfig.enteralPercent > 0 && `経腸 ${currentConfig.enteralPercent}%`}
              {currentConfig.oralPercent > 0 && ` 経口 ${currentConfig.oralPercent}%`}
              {currentConfig.parenteralPercent > 0 && ` 静脈 ${currentConfig.parenteralPercent}%`}
            </span>
          </div>
          <div className={styles.targetItem}>
            <span className={styles.targetLabel}>
              <Clock size={12} />
              フェーズ期間
            </span>
            <span className={styles.targetValue}>
              {progress.daysElapsed}日経過 / {currentConfig.durationDays}日間
            </span>
          </div>
          {currentConfig.advanceCriteria.length > 0 && (
            <div className={styles.targetItemFull}>
              <span className={styles.targetLabel}>
                <ChevronRight size={12} />
                次フェーズへの基準
              </span>
              <span className={styles.criteriaText}>
                {currentConfig.advanceCriteria.join("・")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Component for general ICU phase (no formal plan) ---- */

function GeneralPhaseView({
  phase,
  daysAdmitted,
}: {
  readonly phase: IcuPhase;
  readonly daysAdmitted: number;
}) {
  return (
    <div className={styles.generalPlan}>
      <div className={styles.phaseRow}>
        <div className={styles.phaseLeft}>
          <span className={styles.phaseLabel}>ICU栄養フェーズ（入院{daysAdmitted}日目）</span>
          <span className={styles.phaseName}>{phase.name}</span>
        </div>
        <Badge variant={phase.variant}>{phase.name}</Badge>
      </div>

      <div className={styles.targetGrid}>
        <div className={styles.targetItem}>
          <span className={styles.targetLabel}>
            <Target size={12} />
            エネルギー目標
          </span>
          <span className={styles.targetValue}>{phase.energyTarget}</span>
        </div>
        <div className={styles.targetItem}>
          <span className={styles.targetLabel}>
            <Target size={12} />
            タンパク質目標
          </span>
          <span className={styles.targetValue}>{phase.proteinTarget}</span>
        </div>
        <div className={styles.targetItemFull}>
          <span className={styles.targetLabel}>
            <Zap size={12} />
            このフェーズのポイント
          </span>
          <span className={styles.focusText}>{phase.focus}</span>
        </div>
        <div className={styles.targetItemFull}>
          <span className={styles.noteText}>{phase.note}</span>
        </div>
      </div>
    </div>
  );
}

/* ---- Main ---- */

export function NutritionPhaseContextCard({
  patient,
  daysAdmitted,
  weaningPlan,
}: NutritionPhaseContextCardProps) {
  const generalPhase = useMemo(
    () => getIcuPhase(daysAdmitted, patient.weight),
    [daysAdmitted, patient.weight],
  );

  const hasFormalPlan = weaningPlan !== undefined;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Target size={18} className={styles.headerIcon} />
        <h3 className={styles.title}>栄養フェーズ・今日の目標</h3>
      </div>

      {hasFormalPlan ? (
        <FormalPlanView plan={weaningPlan} />
      ) : (
        <GeneralPhaseView phase={generalPhase} daysAdmitted={daysAdmitted} />
      )}
    </Card>
  );
}
