import { useMemo } from "react";
import { AlertTriangle, AlertCircle, ShieldAlert } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import {
  analyzeLabData,
  getAbnormalFindings,
} from "../../services/labAnalyzer";
import { getLabReferencesForPatient } from "../../services/pediatricLabRanges";
import { assessRefeedingRisk } from "../../services/refeedingRiskAssessor";
import type { Patient } from "../../types";
import type { LabData, LabInterpretation } from "../../types/labData";
import type { NutritionMenuData } from "../../hooks/useNutritionMenus";
import type { RefeedingRiskResult } from "../../services/refeedingRiskAssessor";
import styles from "./ClinicalAlertsPanel.module.css";

interface ClinicalAlertsPanelProps {
  readonly patient: Patient;
  readonly labData: LabData | undefined;
  readonly latestMenu: NutritionMenuData | undefined;
}

interface AlertGroup {
  readonly criticalLabs: readonly LabInterpretation[];
  readonly refeedingRisk: RefeedingRiskResult;
  readonly abnormalLabs: readonly LabInterpretation[];
}

function buildAlertGroup(
  patient: Patient,
  labData: LabData | undefined,
): AlertGroup {
  const refeedingRisk = assessRefeedingRisk(patient, labData);

  if (!labData) {
    return {
      criticalLabs: [],
      refeedingRisk,
      abnormalLabs: [],
    };
  }

  const references = getLabReferencesForPatient(patient);
  const interpretations = analyzeLabData(labData, references);
  const abnormal = getAbnormalFindings(interpretations);

  const criticalLabs = abnormal.filter(
    (finding) =>
      finding.status === "critical-high" || finding.status === "critical-low",
  );

  const nonCriticalLabs = abnormal.filter(
    (finding) =>
      finding.status !== "critical-high" && finding.status !== "critical-low",
  );

  return {
    criticalLabs,
    refeedingRisk,
    abnormalLabs: nonCriticalLabs,
  };
}

function totalAlertCount(group: AlertGroup): number {
  const refeedingCount = group.refeedingRisk.riskLevel !== "none" ? 1 : 0;
  return group.criticalLabs.length + refeedingCount + group.abnormalLabs.length;
}

function CriticalLabAlert({
  finding,
}: {
  readonly finding: LabInterpretation;
}) {
  return (
    <div className={`${styles.alertItem} ${styles.critical}`}>
      <AlertCircle
        size={18}
        className={`${styles.alertIcon} ${styles.critical}`}
      />
      <div className={styles.alertContent}>
        <span className={`${styles.severityBadge} ${styles.severityCritical}`}>
          重症
        </span>
        <p className={styles.alertMessage}>{finding.message}</p>
      </div>
    </div>
  );
}

function RefeedingAlert({ result }: { readonly result: RefeedingRiskResult }) {
  const levelClass =
    result.riskLevel === "high" ? styles.high : styles.moderate;
  const badgeVariant: "danger" | "warning" =
    result.riskLevel === "high" ? "danger" : "warning";
  const levelLabel = result.riskLevel === "high" ? "高リスク" : "中リスク";

  return (
    <div className={`${styles.refeedingSection} ${levelClass}`}>
      <div className={styles.refeedingHeader}>
        <ShieldAlert
          size={18}
          className={`${styles.refeedingIcon} ${levelClass}`}
        />
        <h4 className={styles.refeedingTitle}>リフィーディング症候群</h4>
        <Badge variant={badgeVariant}>{levelLabel}</Badge>
      </div>

      <div>
        <p className={styles.refeedingSubtitle}>リスク因子</p>
        <ul className={styles.refeedingList}>
          {result.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      {result.recommendations.length > 0 && (
        <div>
          <p className={styles.refeedingSubtitle}>推奨事項</p>
          <ul className={styles.refeedingList}>
            {result.recommendations.map((rec) => (
              <li key={rec}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AbnormalLabAlert({
  finding,
}: {
  readonly finding: LabInterpretation;
}) {
  return (
    <div className={`${styles.alertItem} ${styles.warning}`}>
      <AlertTriangle
        size={16}
        className={`${styles.alertIcon} ${styles.warning}`}
      />
      <div className={styles.alertContent}>
        <span className={`${styles.severityBadge} ${styles.severityWarning}`}>
          注意
        </span>
        <p className={styles.alertMessage}>{finding.message}</p>
      </div>
    </div>
  );
}

export function ClinicalAlertsPanel({
  patient,
  labData,
}: ClinicalAlertsPanelProps) {
  const alertGroup = useMemo(
    () => buildAlertGroup(patient, labData),
    [patient, labData],
  );

  const count = useMemo(() => totalAlertCount(alertGroup), [alertGroup]);

  if (count === 0) {
    return null;
  }

  const hasRefeeding = alertGroup.refeedingRisk.riskLevel !== "none";

  return (
    <Card>
      <div className={styles.container}>
        <h3 className={styles.header}>
          <AlertTriangle size={20} className={styles.headerIcon} />
          臨床アラート
          <span className={styles.countBadge}>
            <Badge variant="danger">{count}</Badge>
          </span>
        </h3>

        <div className={styles.alertList}>
          {/* Priority 1: Critical lab values */}
          {alertGroup.criticalLabs.map((finding) => (
            <CriticalLabAlert key={finding.parameter} finding={finding} />
          ))}

          {/* Priority 2: Refeeding risk */}
          {hasRefeeding && (
            <>
              {alertGroup.criticalLabs.length > 0 && (
                <hr className={styles.divider} />
              )}
              <RefeedingAlert result={alertGroup.refeedingRisk} />
            </>
          )}

          {/* Priority 3: Non-critical abnormal labs */}
          {alertGroup.abnormalLabs.length > 0 && (
            <>
              {(alertGroup.criticalLabs.length > 0 || hasRefeeding) && (
                <hr className={styles.divider} />
              )}
              {alertGroup.abnormalLabs.map((finding) => (
                <AbnormalLabAlert key={finding.parameter} finding={finding} />
              ))}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
