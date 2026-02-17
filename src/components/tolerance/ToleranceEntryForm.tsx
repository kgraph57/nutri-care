import { useState, useMemo, useCallback } from "react";
import { Button, Badge } from "../../components/ui";
import type {
  ToleranceEntry,
  VomitingSeverity,
  AbdominalDistension,
  StoolConsistency,
  FeedingAdjustment,
} from "../../types/toleranceData";
import {
  VOMITING_SEVERITY_LABELS,
  ABDOMINAL_DISTENSION_LABELS,
  STOOL_CONSISTENCY_LABELS,
  FEEDING_ADJUSTMENT_LABELS,
} from "../../types/toleranceData";
import { calculateToleranceScore, determineFeedingAdjustment } from "../../services/toleranceScorer";
import styles from "./ToleranceEntryForm.module.css";

/* ---- Constants ---- */

const GOOD_THRESHOLD = 7;
const CAUTION_THRESHOLD = 4;

const BOWEL_SOUNDS_OPTIONS: readonly { readonly value: ToleranceEntry["bowelSounds"]; readonly label: string }[] = [
  { value: "present", label: "正常" },
  { value: "reduced", label: "減弱" },
  { value: "absent", label: "消失" },
] as const;

const GRV_ACTION_OPTIONS: readonly { readonly value: ToleranceEntry["gastricResidualAction"]; readonly label: string }[] = [
  { value: "none", label: "なし" },
  { value: "continue", label: "継続" },
  { value: "reduce", label: "減量" },
  { value: "hold", label: "中止" },
] as const;

/* ---- Props ---- */

interface ToleranceEntryFormProps {
  readonly patientId: string;
  readonly initialData?: ToleranceEntry;
  readonly onSave: (entry: ToleranceEntry) => void;
  readonly onCancel: () => void;
}

/* ---- Helpers ---- */

function nowDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeString(): string {
  return new Date().toTimeString().slice(0, 5);
}

function generateId(): string {
  return `tol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseNumericValue(raw: string): number {
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getScoreColorClass(score: number): string {
  if (score >= GOOD_THRESHOLD) return styles.scoreGood;
  if (score >= CAUTION_THRESHOLD) return styles.scoreCaution;
  return styles.scoreDanger;
}

function getAdjustmentVariant(adjustment: FeedingAdjustment): "success" | "warning" | "danger" | "info" {
  if (adjustment === "advance") return "success";
  if (adjustment === "maintain") return "info";
  if (adjustment === "reduce") return "warning";
  return "danger";
}

function buildSelectOptions<T extends string>(
  labels: Readonly<Record<T, string>>,
): readonly { readonly value: T; readonly label: string }[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

/* ---- Form state interface ---- */

interface FormState {
  readonly date: string;
  readonly time: string;
  readonly gastricResidual: number;
  readonly gastricResidualAction: ToleranceEntry["gastricResidualAction"];
  readonly vomiting: VomitingSeverity;
  readonly vomitingEpisodes: number;
  readonly abdominalDistension: AbdominalDistension;
  readonly bowelSounds: ToleranceEntry["bowelSounds"];
  readonly stoolCount: number;
  readonly stoolConsistency: StoolConsistency;
  readonly notes: string;
}

function buildInitialState(initialData?: ToleranceEntry): FormState {
  if (initialData) {
    return {
      date: initialData.date,
      time: initialData.time,
      gastricResidual: initialData.gastricResidual,
      gastricResidualAction: initialData.gastricResidualAction,
      vomiting: initialData.vomiting,
      vomitingEpisodes: initialData.vomitingEpisodes,
      abdominalDistension: initialData.abdominalDistension,
      bowelSounds: initialData.bowelSounds,
      stoolCount: initialData.stoolCount,
      stoolConsistency: initialData.stoolConsistency,
      notes: initialData.notes,
    };
  }
  return {
    date: nowDateString(),
    time: nowTimeString(),
    gastricResidual: 0,
    gastricResidualAction: "none",
    vomiting: "none",
    vomitingEpisodes: 0,
    abdominalDistension: "none",
    bowelSounds: "present",
    stoolCount: 0,
    stoolConsistency: "formed",
    notes: "",
  };
}

/* ---- Main component ---- */

export function ToleranceEntryForm({
  patientId,
  initialData,
  onSave,
  onCancel,
}: ToleranceEntryFormProps) {
  const [formState, setFormState] = useState<FormState>(() => buildInitialState(initialData));

  const vomitingOptions = useMemo(() => buildSelectOptions(VOMITING_SEVERITY_LABELS), []);
  const distensionOptions = useMemo(() => buildSelectOptions(ABDOMINAL_DISTENSION_LABELS), []);
  const stoolOptions = useMemo(() => buildSelectOptions(STOOL_CONSISTENCY_LABELS), []);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const calculatedScore = useMemo(
    () =>
      calculateToleranceScore({
        date: formState.date,
        time: formState.time,
        gastricResidual: formState.gastricResidual,
        gastricResidualAction: formState.gastricResidualAction,
        vomiting: formState.vomiting,
        vomitingEpisodes: formState.vomitingEpisodes,
        abdominalDistension: formState.abdominalDistension,
        bowelSounds: formState.bowelSounds,
        stoolCount: formState.stoolCount,
        stoolConsistency: formState.stoolConsistency,
        notes: formState.notes,
      }),
    [formState],
  );

  const feedingAdjustment = useMemo(
    () => determineFeedingAdjustment(calculatedScore),
    [calculatedScore],
  );

  const handleSave = useCallback(() => {
    const entry: ToleranceEntry = {
      id: initialData?.id ?? generateId(),
      patientId,
      date: formState.date,
      time: formState.time,
      gastricResidual: formState.gastricResidual,
      gastricResidualAction: formState.gastricResidualAction,
      vomiting: formState.vomiting,
      vomitingEpisodes: formState.vomitingEpisodes,
      abdominalDistension: formState.abdominalDistension,
      bowelSounds: formState.bowelSounds,
      stoolCount: formState.stoolCount,
      stoolConsistency: formState.stoolConsistency,
      toleranceScore: calculatedScore,
      feedingAdjustment,
      notes: formState.notes,
    };
    onSave(entry);
  }, [patientId, initialData, formState, calculatedScore, feedingAdjustment, onSave]);

  return (
    <div className={styles.form}>
      {/* Date and time */}
      <div className={styles.dateTimeRow}>
        <div className={styles.dateTimeField}>
          <span className={styles.fieldLabel}>記録日:</span>
          <input
            type="date"
            value={formState.date}
            onChange={(e) => updateField("date", e.target.value)}
            className={styles.dateInput}
          />
        </div>
        <div className={styles.dateTimeField}>
          <span className={styles.fieldLabel}>時刻:</span>
          <input
            type="time"
            value={formState.time}
            onChange={(e) => updateField("time", e.target.value)}
            className={styles.timeInput}
          />
        </div>
      </div>

      {/* Assessment fields */}
      <div className={styles.assessmentGrid}>
        {/* GRV */}
        <div className={styles.field}>
          <label className={styles.label}>
            残胃量 (GRV)
            <span className={styles.unit}>(mL)</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={formState.gastricResidual}
            onChange={(e) => updateField("gastricResidual", parseNumericValue(e.target.value))}
            className={styles.input}
          />
        </div>

        {/* GRV action */}
        <div className={styles.field}>
          <label className={styles.label}>GRV対応</label>
          <select
            value={formState.gastricResidualAction}
            onChange={(e) => updateField("gastricResidualAction", e.target.value as ToleranceEntry["gastricResidualAction"])}
            className={styles.select}
          >
            {GRV_ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Vomiting */}
        <div className={styles.field}>
          <label className={styles.label}>嘔吐</label>
          <select
            value={formState.vomiting}
            onChange={(e) => updateField("vomiting", e.target.value as VomitingSeverity)}
            className={styles.select}
          >
            {vomitingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Vomiting episodes */}
        <div className={styles.field}>
          <label className={styles.label}>
            嘔吐回数
            <span className={styles.unit}>(回)</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formState.vomitingEpisodes}
            onChange={(e) => updateField("vomitingEpisodes", parseNumericValue(e.target.value))}
            className={styles.input}
          />
        </div>

        {/* Abdominal distension */}
        <div className={styles.field}>
          <label className={styles.label}>腹部膨満</label>
          <select
            value={formState.abdominalDistension}
            onChange={(e) => updateField("abdominalDistension", e.target.value as AbdominalDistension)}
            className={styles.select}
          >
            {distensionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Bowel sounds */}
        <div className={styles.field}>
          <label className={styles.label}>腸蠕動音</label>
          <select
            value={formState.bowelSounds}
            onChange={(e) => updateField("bowelSounds", e.target.value as ToleranceEntry["bowelSounds"])}
            className={styles.select}
          >
            {BOWEL_SOUNDS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Stool consistency */}
        <div className={styles.field}>
          <label className={styles.label}>排便性状</label>
          <select
            value={formState.stoolConsistency}
            onChange={(e) => updateField("stoolConsistency", e.target.value as StoolConsistency)}
            className={styles.select}
          >
            {stoolOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Stool frequency */}
        <div className={styles.field}>
          <label className={styles.label}>
            排便回数
            <span className={styles.unit}>(回/日)</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formState.stoolCount}
            onChange={(e) => updateField("stoolCount", parseNumericValue(e.target.value))}
            className={styles.input}
          />
        </div>
      </div>

      {/* Auto-calculated score */}
      <div className={styles.scoreDisplay}>
        <div className={styles.scoreInfo}>
          <span className={styles.scoreMainLabel}>耐性スコア</span>
          <span className={`${styles.scoreValueLarge} ${getScoreColorClass(calculatedScore)}`}>
            {calculatedScore}<span className={styles.scoreUnit}> / 10</span>
          </span>
        </div>
        <Badge variant={getAdjustmentVariant(feedingAdjustment)}>
          推奨: {FEEDING_ADJUSTMENT_LABELS[feedingAdjustment]}
        </Badge>
      </div>

      {/* Notes */}
      <div className={styles.field}>
        <label className={styles.label}>メモ</label>
        <textarea
          value={formState.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          className={styles.textarea}
          placeholder="特記事項があれば入力..."
        />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  );
}
