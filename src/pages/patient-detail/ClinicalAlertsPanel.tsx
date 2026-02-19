import { useMemo, useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

function CriticalLabChip({
  finding,
}: {
  readonly finding: LabInterpretation;
}) {
  return (
    <span className={`${styles.chip} ${styles.chipCritical}`}>
      <AlertCircle size={12} />
      {finding.parameter}: {finding.value}
      {finding.unit ? ` ${finding.unit}` : ""}
    </span>
  );
}

function AbnormalLabChip({
  finding,
}: {
  readonly finding: LabInterpretation;
}) {
  return (
    <span className={`${styles.chip} ${styles.chipWarning}`}>
      {finding.parameter}: {finding.value}
      {finding.unit ? ` ${finding.unit}` : ""}
    </span>
  );
}

function RefeedingChip({ result }: { readonly result: RefeedingRiskResult }) {
  const isHigh = result.riskLevel === "high";
  return (
    <span
      className={`${styles.chip} ${isHigh ? styles.chipCritical : styles.chipWarning}`}
    >
      <ShieldAlert size={12} />
      Refeeding {isHigh ? "高" : "中"}リスク
    </span>
  );
}

function RefeedingDetail({
  result,
}: {
  readonly result: RefeedingRiskResult;
}) {
  const isHigh = result.riskLevel === "high";
  return (
    <div
      className={`${styles.refeedingDetail} ${isHigh ? styles.refeedingHigh : styles.refeedingModerate}`}
    >
      <div className={styles.refeedingRow}>
        <ShieldAlert
          size={14}
          className={isHigh ? styles.iconDanger : styles.iconWarning}
        />
        <span className={styles.refeedingLabel}>
          リフィーディング症候群
        </span>
        <Badge variant={isHigh ? "danger" : "warning"}>
          {isHigh ? "高リスク" : "中リスク"}
        </Badge>
      </div>
      <div className={styles.refeedingColumns}>
        <div>
          <p className={styles.detailSubtitle}>因子</p>
          <ul className={styles.detailList}>
            {result.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        {result.recommendations.length > 0 && (
          <div>
            <p className={styles.detailSubtitle}>推奨</p>
            <ul className={styles.detailList}>
              {result.recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertDetail({
  finding,
  variant,
}: {
  readonly finding: LabInterpretation;
  readonly variant: "critical" | "warning";
}) {
  return (
    <div className={`${styles.detailRow} ${styles[variant]}`}>
      {variant === "critical" ? (
        <AlertCircle size={14} className={styles.iconDanger} />
      ) : (
        <AlertTriangle size={14} className={styles.iconWarning} />
      )}
      <span className={styles.detailParam}>{finding.parameter}</span>
      <span className={styles.detailMessage}>{finding.message}</span>
    </div>
  );
}

export function ClinicalAlertsPanel({
  patient,
  labData,
}: ClinicalAlertsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const alertGroup = useMemo(
    () => buildAlertGroup(patient, labData),
    [patient, labData],
  );

  const count = useMemo(() => totalAlertCount(alertGroup), [alertGroup]);

  if (count === 0) {
    return null;
  }

  const hasRefeeding = alertGroup.refeedingRisk.riskLevel !== "none";
  const hasCritical = alertGroup.criticalLabs.length > 0;

  return (
    <Card>
      <div className={styles.container}>
        {/* Compact summary bar — always visible */}
        <button
          type="button"
          className={styles.summaryBar}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          <AlertTriangle
            size={16}
            className={
              hasCritical ? styles.iconDanger : styles.iconWarning
            }
          />
          <span className={styles.summaryTitle}>臨床アラート</span>
          <div className={styles.chipRow}>
            {alertGroup.criticalLabs.map((f) => (
              <CriticalLabChip key={f.parameter} finding={f} />
            ))}
            {hasRefeeding && (
              <RefeedingChip result={alertGroup.refeedingRisk} />
            )}
            {alertGroup.abnormalLabs.map((f) => (
              <AbnormalLabChip key={f.parameter} finding={f} />
            ))}
          </div>
          <Badge variant={hasCritical ? "danger" : "warning"}>{count}</Badge>
          {expanded ? (
            <ChevronUp size={16} className={styles.chevron} />
          ) : (
            <ChevronDown size={16} className={styles.chevron} />
          )}
        </button>

        {/* Expandable detail section */}
        {expanded && (
          <div className={styles.detailSection}>
            {alertGroup.criticalLabs.map((f) => (
              <AlertDetail
                key={f.parameter}
                finding={f}
                variant="critical"
              />
            ))}
            {hasRefeeding && (
              <RefeedingDetail result={alertGroup.refeedingRisk} />
            )}
            {alertGroup.abnormalLabs.map((f) => (
              <AlertDetail
                key={f.parameter}
                finding={f}
                variant="warning"
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
