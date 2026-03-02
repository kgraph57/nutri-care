import { Link } from "react-router-dom";
import { AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";
import { useScreeningData } from "../../hooks/useScreeningData";
import {
  isScreeningDue,
  getScreeningStatusLabel,
} from "../../services/screeningToolSuggestor";
import type { Patient } from "../../types";
import type { ScreeningEntry } from "../../types/screening";
import styles from "./ScreeningStatusWidget.module.css";

interface ScreeningStatusWidgetProps {
  readonly patients: readonly Patient[];
}

type AttentionCategory = "needs-screening" | "at-risk" | "normal";

interface PatientAttention {
  readonly patient: Patient;
  readonly label: string;
  readonly category: AttentionCategory;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function categorizePatient(
  patient: Patient,
  latestScreening: ScreeningEntry | undefined,
  today: string,
): PatientAttention {
  const label = getScreeningStatusLabel(latestScreening, today);

  if (!latestScreening || isScreeningDue(latestScreening, today)) {
    return { patient, label, category: "needs-screening" };
  }

  const { result } = latestScreening;
  if (result.toolType === "nrs2002") {
    if (result.riskLevel === "at-risk" || result.riskLevel === "high-risk") {
      return { patient, label, category: "at-risk" };
    }
  }
  if (result.toolType === "mna-sf") {
    if (result.riskLevel === "at-risk" || result.riskLevel === "malnourished") {
      return { patient, label, category: "at-risk" };
    }
  }
  if (result.toolType === "glim") {
    if (result.severity === "stage1" || result.severity === "stage2") {
      return { patient, label, category: "at-risk" };
    }
  }

  return { patient, label, category: "normal" };
}

function getBadgeClass(category: AttentionCategory): string {
  if (category === "needs-screening") return styles.badgeDanger;
  if (category === "at-risk") return styles.badgeWarning;
  return styles.badgeSuccess;
}

export function ScreeningStatusWidget({
  patients,
}: ScreeningStatusWidgetProps) {
  const { getLatestScreening } = useScreeningData();
  const today = getToday();

  const categorized: readonly PatientAttention[] = patients.map((patient) => {
    const latest = getLatestScreening(patient.id);
    return categorizePatient(patient, latest, today);
  });

  const needsScreeningCount = categorized.filter(
    (c) => c.category === "needs-screening",
  ).length;

  const atRiskCount = categorized.filter(
    (c) => c.category === "at-risk",
  ).length;

  const normalCount = categorized.filter(
    (c) => c.category === "normal",
  ).length;

  const attentionNeeded = categorized.filter(
    (c) => c.category !== "normal",
  );

  return (
    <div className={styles.widget}>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardDanger}`}>
          <div className={`${styles.statIcon} ${styles.statIconDanger}`}>
            <AlertTriangle size={20} />
          </div>
          <span className={styles.statNumber}>{needsScreeningCount}</span>
          <span className={styles.statLabel}>要スクリーニング</span>
        </div>

        <div className={`${styles.statCard} ${styles.statCardWarning}`}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
            <ShieldAlert size={20} />
          </div>
          <span className={styles.statNumber}>{atRiskCount}</span>
          <span className={styles.statLabel}>栄養リスクあり</span>
        </div>

        <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <CheckCircle size={20} />
          </div>
          <span className={styles.statNumber}>{normalCount}</span>
          <span className={styles.statLabel}>スクリーニング済</span>
        </div>
      </div>

      {attentionNeeded.length > 0 ? (
        <div className={styles.patientList}>
          {attentionNeeded.map(({ patient, label, category }) => (
            <Link
              key={patient.id}
              to="/screening"
              className={styles.patientRow}
            >
              <div className={styles.patientInfo}>
                <span className={styles.patientName}>{patient.name}</span>
                <span className={styles.patientMeta}>
                  {patient.age}歳 / {patient.ward}
                </span>
              </div>
              <span className={getBadgeClass(category)}>{label}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.allClear}>
          <CheckCircle size={18} />
          全患者スクリーニング済み
        </div>
      )}
    </div>
  );
}
