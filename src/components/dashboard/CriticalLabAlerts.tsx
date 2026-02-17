import { AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "../ui";
import type { Patient } from "../../types";
import type { LabData } from "../../types/labData";
import { LAB_REFERENCES } from "../../types/labData";
import styles from "./CriticalLabAlerts.module.css";

interface CriticalLabAlertsProps {
  readonly patients: readonly Patient[];
  readonly getLabData: (patientId: string) => LabData | undefined;
}

interface LabAlert {
  readonly patientId: string;
  readonly patientName: string;
  readonly param: string;
  readonly value: number;
  readonly unit: string;
  readonly normalRange: string;
  readonly isCritical: boolean;
  readonly date: string;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

function collectAlerts(
  patients: readonly Patient[],
  getLabData: (id: string) => LabData | undefined,
): readonly LabAlert[] {
  const alerts: LabAlert[] = [];

  for (const patient of patients) {
    const lab = getLabData(patient.id);
    if (!lab) continue;

    for (const ref of LAB_REFERENCES) {
      const value = lab[ref.key];
      if (value === undefined || value === null) continue;

      const isCritical =
        (ref.criticalLow !== undefined && value < ref.criticalLow) ||
        (ref.criticalHigh !== undefined && value > ref.criticalHigh);

      const isOutOfRange = value < ref.normalMin || value > ref.normalMax;

      if (isCritical || isOutOfRange) {
        alerts.push({
          patientId: patient.id,
          patientName: patient.name,
          param: ref.label,
          value,
          unit: ref.unit,
          normalRange: `${ref.normalMin}–${ref.normalMax}`,
          isCritical,
          date: lab.date,
        });
      }
    }
  }

  return alerts
    .sort((a, b) => {
      if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 10);
}

export function CriticalLabAlerts({
  patients,
  getLabData,
}: CriticalLabAlertsProps) {
  const alerts = collectAlerts(patients, getLabData);

  if (alerts.length === 0) {
    return (
      <div className={styles.empty}>
        <CheckCircle size={18} />
        <span>異常検査値はありません</span>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {alerts.map((alert) => (
        <Card
          key={`${alert.patientId}-${alert.param}`}
          className={styles.alertCard}
        >
          <div
            className={`${styles.alertIcon} ${alert.isCritical ? styles.alertIconCritical : styles.alertIconWarning}`}
          >
            <AlertTriangle size={18} />
          </div>
          <div className={styles.alertBody}>
            <div className={styles.alertHeader}>
              <span className={styles.alertPatient}>{alert.patientName}</span>
              <span className={styles.alertParam}>
                {alert.param} ({alert.normalRange} {alert.unit})
              </span>
            </div>
            <span
              className={`${styles.alertValue} ${alert.isCritical ? styles.valueCritical : styles.valueWarning}`}
            >
              {alert.value} {alert.unit}
            </span>
          </div>
          <span className={styles.alertDate}>{formatDate(alert.date)}</span>
        </Card>
      ))}
    </div>
  );
}
