import { useState, useMemo, useCallback } from "react";
import { Check } from "lucide-react";
import type { DailyRoundEntry } from "../../types/dailyRound";
import { SYMPTOM_SEVERITY_LABELS } from "../../types/dailyRound";
import { FEEDING_ADJUSTMENT_LABELS } from "../../types/toleranceData";
import {
  scoreAssessment,
  type AssessmentScoreResult,
} from "../../services/dailyAssessmentScorer";
import styles from "./RoundComparisonTable.module.css";

interface RoundComparisonTableProps {
  readonly entries: readonly DailyRoundEntry[];
}

interface ScoredEntry {
  readonly entry: DailyRoundEntry;
  readonly score: AssessmentScoreResult;
  readonly energyPercent: number;
  readonly proteinPercent: number;
}

const MAX_COMPARE = 5;

function cellClass(current: number, prev: number | undefined): string {
  if (prev === undefined) return "";
  if (current > prev) return styles.cellUp;
  if (current < prev) return styles.cellDown;
  return "";
}

function scoreColorClass(value: number): string {
  if (value >= 80) return styles.valueGood;
  if (value >= 50) return styles.valueMid;
  return styles.valueBad;
}

export function RoundComparisonTable({ entries }: RoundComparisonTableProps) {
  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries],
  );

  const [selectedIds, setSelectedIds] = useState<readonly string[]>(() =>
    sorted.slice(0, Math.min(3, sorted.length)).map((e) => e.id),
  );

  const handleToggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        }
        if (prev.length >= MAX_COMPARE) return prev;
        return [...prev, id];
      });
    },
    [],
  );

  const selectedScored: readonly ScoredEntry[] = useMemo(() => {
    const selectedEntries = sorted.filter((e) => selectedIds.includes(e.id));
    const chronological = [...selectedEntries].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    return chronological.map((entry) => {
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
      const proteinPercent =
        req.protein > 0
          ? Math.round(
              (entry.assessment.actualIntake.estimatedProtein / req.protein) *
                100,
            )
          : 0;
      return { entry, score, energyPercent, proteinPercent };
    });
  }, [sorted, selectedIds]);

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <p>比較できる回診記録がありません</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 日付セレクター */}
      <div className={styles.selector}>
        <div className={styles.selectorLabel}>
          比較する日を選択 ({selectedIds.length}/{MAX_COMPARE})
        </div>
        <div className={styles.dateChips}>
          {sorted.map((entry) => {
            const isChecked = selectedIds.includes(entry.id);
            const chipClass = [styles.chip, isChecked ? styles.chipActive : ""]
              .filter(Boolean)
              .join(" ");
            const disabled = !isChecked && selectedIds.length >= MAX_COMPARE;

            return (
              <button
                key={entry.id}
                type="button"
                className={chipClass}
                onClick={() => handleToggle(entry.id)}
                disabled={disabled}
              >
                {isChecked && <Check size={12} />}
                <span>{entry.date.slice(5)}</span>
                <span className={styles.chipTime}>
                  {entry.assessment.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 比較テーブル */}
      {selectedScored.length >= 2 ? (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.headerLabel}>項目</th>
                {selectedScored.map((s) => (
                  <th key={s.entry.id} className={styles.headerDate}>
                    {s.entry.date.slice(5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* スコア */}
              <tr className={styles.groupHeader}>
                <td colSpan={selectedScored.length + 1}>スコア</td>
              </tr>
              <tr>
                <td className={styles.rowLabel}>総合</td>
                {selectedScored.map((s, i) => (
                  <td
                    key={s.entry.id}
                    className={`${scoreColorClass(s.score.overall)} ${cellClass(s.score.overall, selectedScored[i - 1]?.score.overall)}`}
                  >
                    {s.score.overall}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>GI</td>
                {selectedScored.map((s, i) => (
                  <td
                    key={s.entry.id}
                    className={cellClass(s.score.giScore, selectedScored[i - 1]?.score.giScore)}
                  >
                    {s.score.giScore}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>バイタル</td>
                {selectedScored.map((s, i) => (
                  <td
                    key={s.entry.id}
                    className={cellClass(s.score.vitalScore, selectedScored[i - 1]?.score.vitalScore)}
                  >
                    {s.score.vitalScore}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>摂取量</td>
                {selectedScored.map((s, i) => (
                  <td
                    key={s.entry.id}
                    className={cellClass(s.score.intakeScore, selectedScored[i - 1]?.score.intakeScore)}
                  >
                    {s.score.intakeScore}
                  </td>
                ))}
              </tr>

              {/* 栄養 */}
              <tr className={styles.groupHeader}>
                <td colSpan={selectedScored.length + 1}>栄養</td>
              </tr>
              <tr>
                <td className={styles.rowLabel}>エネルギー (kcal)</td>
                {selectedScored.map((s, i) => {
                  const val = s.entry.assessment.actualIntake.estimatedEnergy;
                  return (
                    <td
                      key={s.entry.id}
                      className={cellClass(val, selectedScored[i - 1]?.entry.assessment.actualIntake.estimatedEnergy)}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className={styles.rowLabel}>タンパク質 (g)</td>
                {selectedScored.map((s, i) => {
                  const val = s.entry.assessment.actualIntake.estimatedProtein;
                  return (
                    <td
                      key={s.entry.id}
                      className={cellClass(val, selectedScored[i - 1]?.entry.assessment.actualIntake.estimatedProtein)}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className={styles.rowLabel}>E充足率 (%)</td>
                {selectedScored.map((s, i) => (
                  <td
                    key={s.entry.id}
                    className={`${s.energyPercent < 80 ? styles.valueBad : ""} ${cellClass(s.energyPercent, selectedScored[i - 1]?.energyPercent)}`}
                  >
                    {s.energyPercent}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>P充足率 (%)</td>
                {selectedScored.map((s, i) => (
                  <td
                    key={s.entry.id}
                    className={`${s.proteinPercent < 80 ? styles.valueBad : ""} ${cellClass(s.proteinPercent, selectedScored[i - 1]?.proteinPercent)}`}
                  >
                    {s.proteinPercent}
                  </td>
                ))}
              </tr>

              {/* 投与 */}
              <tr className={styles.groupHeader}>
                <td colSpan={selectedScored.length + 1}>投与</td>
              </tr>
              <tr>
                <td className={styles.rowLabel}>総投与量 (mL)</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>{s.entry.adjustedPlan.totalVolume}</td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>方針</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>
                    <span
                      className={`${styles.feedingBadge} ${styles[`feeding${capitalize(s.entry.adjustedPlan.feedingAdjustment)}`] ?? ""}`}
                    >
                      {FEEDING_ADJUSTMENT_LABELS[s.entry.adjustedPlan.feedingAdjustment]}
                    </span>
                  </td>
                ))}
              </tr>

              {/* GI */}
              <tr className={styles.groupHeader}>
                <td colSpan={selectedScored.length + 1}>消化管</td>
              </tr>
              <tr>
                <td className={styles.rowLabel}>胃残留 (mL)</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>
                    {s.entry.assessment.gi.gastricResidual}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>嘔吐</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>
                    {SYMPTOM_SEVERITY_LABELS[s.entry.assessment.gi.vomiting]}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>下痢</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>
                    {SYMPTOM_SEVERITY_LABELS[s.entry.assessment.gi.diarrhea]}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>腹部膨満</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>
                    {SYMPTOM_SEVERITY_LABELS[s.entry.assessment.gi.abdominalDistension]}
                  </td>
                ))}
              </tr>

              {/* バイタル */}
              <tr className={styles.groupHeader}>
                <td colSpan={selectedScored.length + 1}>バイタル</td>
              </tr>
              <tr>
                <td className={styles.rowLabel}>体温 (°C)</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>
                    {s.entry.assessment.vitals.temperature}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>HR (bpm)</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>
                    {s.entry.assessment.vitals.heartRate}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>BP (mmHg)</td>
                {selectedScored.map((s) => (
                  <td key={s.entry.id}>
                    {s.entry.assessment.vitals.systolicBP}/
                    {s.entry.assessment.vitals.diastolicBP}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.rowLabel}>SpO2 (%)</td>
                {selectedScored.map((s) => (
                  <td
                    key={s.entry.id}
                    className={
                      s.entry.assessment.vitals.spO2 < 90 ? styles.valueBad : ""
                    }
                  >
                    {s.entry.assessment.vitals.spO2}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.hint}>
          2つ以上の日を選択すると比較テーブルが表示されます
        </div>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
