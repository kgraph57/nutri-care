import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "../../components/ui";
import {
  calculateBMI,
  computeCorrectedAgeMonths,
} from "../../utils/bodyMetrics";
import { isPediatricPatient } from "../../services/pediatricNutritionCalculation";
import type { Patient } from "../../types";
import styles from "./PatientProfileCard.module.css";

interface PatientProfileCardProps {
  readonly patient: Patient;
  readonly daysAdmitted: number;
}

interface CompactMetrics {
  readonly bmi: number;
  readonly hasValidInputs: boolean;
  readonly isPediatric: boolean;
  readonly correctedAgeMonths: number | null;
}

function computeCompactMetrics(patient: Patient): CompactMetrics {
  const hasValidInputs = patient.weight > 0 && patient.height > 0;
  const bmi = hasValidInputs
    ? calculateBMI(patient.weight, patient.height)
    : 0;
  const isPediatric_ = isPediatricPatient(patient);

  const correctedAgeMonths =
    isPediatric_ &&
    patient.ageInMonths !== undefined &&
    patient.gestationalAge !== undefined &&
    patient.gestationalAge < 37
      ? computeCorrectedAgeMonths(patient.ageInMonths, patient.gestationalAge)
      : null;

  return {
    bmi,
    hasValidInputs,
    isPediatric: isPediatric_,
    correctedAgeMonths,
  };
}

function formatAge(patient: Patient): string {
  if (patient.ageInMonths !== undefined && patient.ageInMonths < 36) {
    return `${patient.age}歳（${patient.ageInMonths}ヶ月）`;
  }
  return `${patient.age}歳`;
}

/* ---- Main component ---- */

export function PatientProfileCard({
  patient,
  daysAdmitted,
}: PatientProfileCardProps) {
  const metrics = useMemo(() => computeCompactMetrics(patient), [patient]);

  const ageLabel = useMemo(() => formatAge(patient), [patient]);

  const correctedAgeLabel =
    metrics.correctedAgeMonths !== null
      ? `修正${metrics.correctedAgeMonths}ヶ月`
      : null;

  return (
    <div className={styles.card}>
      {/* 患者名 + 年齢 + 性別 */}
      <span className={styles.name}>
        {patient.name}（{ageLabel}・{patient.gender}）
        {correctedAgeLabel && (
          <span className={styles.correctedAge}> {correctedAgeLabel}</span>
        )}
      </span>

      <div className={styles.divider} aria-hidden="true" />

      {/* 体重 / 身長 */}
      <div className={styles.metric}>
        <span className={styles.metricValue}>
          {patient.weight > 0 ? `${patient.weight} kg` : "—"}&nbsp;/&nbsp;
          {patient.height > 0 ? `${patient.height} cm` : "—"}
        </span>
        <span className={styles.metricLabel}>体重 / 身長</span>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* BMI */}
      <div className={styles.metric}>
        <span className={styles.metricValue}>
          {metrics.hasValidInputs ? metrics.bmi.toFixed(1) : "—"}
        </span>
        <span className={styles.metricLabel}>BMI</span>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* 入院日数 */}
      <div className={styles.metric}>
        <span className={styles.metricValue}>Day {daysAdmitted}</span>
        <span className={styles.metricLabel}>ICU 入院</span>
      </div>

      {/* バッジ + アレルギー警告 */}
      <div className={styles.badges}>
        <Badge variant="info">{patient.ward}</Badge>
        <Badge variant="neutral">{patient.patientType}</Badge>
        {patient.allergies.length > 0 && (
          <AlertTriangle
            size={16}
            className={styles.allergyIcon}
            aria-label={`アレルギーあり: ${patient.allergies.join(", ")}`}
          />
        )}
      </div>
    </div>
  );
}
