import { useState, useMemo, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import type { DailyRoundEntry } from "../../types/dailyRound";
import { FEEDING_ADJUSTMENT_LABELS } from "../../types/toleranceData";
import {
  scoreAssessment,
  type AssessmentScoreResult,
} from "../../services/dailyAssessmentScorer";
import { AdjustedPlanPanel } from "./AdjustedPlanPanel";
import styles from "./NutritionFlowChart.module.css";

interface NutritionFlowChartProps {
  readonly entries: readonly DailyRoundEntry[];
}

interface ScoredEntry {
  readonly entry: DailyRoundEntry;
  readonly score: AssessmentScoreResult;
  readonly energyPercent: number;
}

function scoreColor(value: number): string {
  if (value >= 80) return "var(--color-success)";
  if (value >= 50) return "var(--color-warning-dark)";
  return "var(--color-danger)";
}

function feedingBadgeClass(adj: string): string {
  const map: Record<string, string> = {
    advance: styles.badgeAdvance,
    maintain: styles.badgeMaintain,
    reduce: styles.badgeReduce,
    hold: styles.badgeHold,
  };
  return map[adj] ?? styles.badgeMaintain;
}

function energyBarColor(percent: number): string {
  if (percent >= 80) return "var(--color-success)";
  if (percent >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function NutritionFlowChart({ entries }: NutritionFlowChartProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scored: readonly ScoredEntry[] = useMemo(() => {
    const sorted = [...entries].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    return sorted.map((entry) => {
      const score = scoreAssessment(
        entry.assessment,
        entry.adjustedPlan.requirements,
      );
      const req = entry.adjustedPlan.requirements;
      const energyPercent =
        req.energy > 0
          ? Math.round(
              (entry.assessment.actualIntake.estimatedEnergy / req.energy) * 100,
            )
          : 0;
      return { entry, score, energyPercent };
    });
  }, [entries]);

  const selected = useMemo(
    () => scored.find((s) => s.entry.id === selectedId) ?? null,
    [scored, selectedId],
  );

  const handleNodeClick = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? null : id));
    },
    [],
  );

  if (scored.length === 0) {
    return (
      <div className={styles.empty}>
        <p>回診記録がありません</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 横スクロールのフローチャート */}
      <div className={styles.flowScroll}>
        <div className={styles.flowTrack}>
          {scored.map((item, index) => {
            const isSelected = selectedId === item.entry.id;
            const nodeClass = [styles.node, isSelected ? styles.nodeSelected : ""]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={item.entry.id} className={styles.nodeGroup}>
                {index > 0 && (
                  <div className={styles.connector}>
                    <ChevronRight size={16} />
                  </div>
                )}
                <button
                  type="button"
                  className={nodeClass}
                  onClick={() => handleNodeClick(item.entry.id)}
                  aria-pressed={isSelected}
                >
                  <div className={styles.nodeDate}>
                    {item.entry.date.slice(5)}
                  </div>
                  <div
                    className={styles.nodeScore}
                    style={{ color: scoreColor(item.score.overall) }}
                  >
                    {item.score.overall}
                  </div>
                  <div className={styles.energyBar}>
                    <div
                      className={styles.energyFill}
                      style={{
                        width: `${Math.min(item.energyPercent, 100)}%`,
                        background: energyBarColor(item.energyPercent),
                      }}
                    />
                  </div>
                  <div className={styles.energyLabel}>
                    {item.energyPercent}%
                  </div>
                  <span
                    className={`${styles.feedingBadge} ${feedingBadgeClass(item.entry.adjustedPlan.feedingAdjustment)}`}
                  >
                    {FEEDING_ADJUSTMENT_LABELS[item.entry.adjustedPlan.feedingAdjustment]}
                  </span>
                  {item.score.warnings.length > 0 && (
                    <div className={styles.warningDot} title={item.score.warnings.join(", ")} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* インライン展開パネル */}
      {selected && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <span className={styles.detailDate}>
              {selected.entry.date} {selected.entry.assessment.time}
            </span>
            <button
              type="button"
              className={styles.detailClose}
              onClick={() => setSelectedId(null)}
            >
              閉じる
            </button>
          </div>
          <AdjustedPlanPanel
            plan={selected.entry.adjustedPlan}
            score={selected.score}
          />
        </div>
      )}
    </div>
  );
}
