import { useMemo } from "react";
import { FlaskConical } from "lucide-react";
import { Card, Button } from "../../components/ui";
import { LAB_REFERENCES } from "../../types/labData";
import type { LabData, LabSection, LabReference } from "../../types/labData";
import { getLabTrendArrow } from "../../utils/labTrend";
import styles from "./LabOverviewGrid.module.css";

interface LabOverviewGridProps {
  readonly labData: LabData | undefined;
  readonly labHistory: readonly LabData[];
  readonly onEditLabs: () => void;
}

type ParamStatus = "normal" | "abnormal" | "critical";

function getParamStatus(value: number, ref: LabReference): ParamStatus {
  if (ref.criticalLow !== undefined && value < ref.criticalLow) return "critical";
  if (ref.criticalHigh !== undefined && value > ref.criticalHigh) return "critical";
  if (value < ref.normalMin || value > ref.normalMax) return "abnormal";
  return "normal";
}

function getValueClassName(status: ParamStatus): string {
  switch (status) {
    case "critical":
      return `${styles.value} ${styles.valueCritical}`;
    case "abnormal":
      return `${styles.value} ${styles.valueAbnormal}`;
    default:
      return `${styles.value} ${styles.valueNormal}`;
  }
}

function getTrendClassName(arrow: "↑" | "↓" | "→"): string {
  switch (arrow) {
    case "↑":
      return styles.trendUp;
    case "↓":
      return styles.trendDown;
    default:
      return styles.trendFlat;
  }
}

interface ParameterCellProps {
  readonly ref_: LabReference;
  readonly labData: LabData;
  readonly labHistory: readonly LabData[];
}

function ParameterCell({ ref_, labData, labHistory }: ParameterCellProps) {
  const rawValue = labData[ref_.key];
  const trend = getLabTrendArrow(ref_.key, labHistory);

  if (rawValue === undefined || rawValue === null) {
    return (
      <div className={styles.paramRow}>
        <span className={styles.paramLabel}>{ref_.label}</span>
        <div className={styles.valueContainer}>
          <span className={`${styles.value} ${styles.valueMissing}`}>&mdash;</span>
        </div>
      </div>
    );
  }

  const status = getParamStatus(rawValue, ref_);

  return (
    <div className={styles.paramRow}>
      <span className={styles.paramLabel}>{ref_.label}</span>
      <div className={styles.valueContainer}>
        <div className={styles.valueRow}>
          <span className={getValueClassName(status)}>{rawValue}</span>
          <div className={styles.rightSide}>
            <span className={styles.unit}>{ref_.unit}</span>
            {trend !== null && (
              <span className={getTrendClassName(trend)}>{trend}</span>
            )}
          </div>
        </div>
        <span className={styles.normalRange}>
          {ref_.normalMin}-{ref_.normalMax}
        </span>
      </div>
    </div>
  );
}

export function LabOverviewGrid({
  labData,
  labHistory,
  onEditLabs,
}: LabOverviewGridProps) {
  const sectionGroups = useMemo(() => {
    const groups = new Map<LabSection, typeof LAB_REFERENCES[number][]>();
    for (const ref of LAB_REFERENCES) {
      const existing = groups.get(ref.section);
      if (existing) {
        groups.set(ref.section, [...existing, ref]);
      } else {
        groups.set(ref.section, [ref]);
      }
    }
    return groups;
  }, []);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FlaskConical size={20} className={styles.headerIcon} />
          <h3 className={styles.title}>検査値データ</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onEditLabs}>
          編集
        </Button>
      </div>

      {labData === undefined ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>検査値が未入力です</p>
          <Button variant="primary" size="sm" onClick={onEditLabs}>
            検査値を入力
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {Array.from(sectionGroups.entries()).map(([section, refs]) => (
            <div key={section} className={styles.sectionGroup}>
              <h4 className={styles.sectionHeader}>{section}</h4>
              {refs.map((ref) => (
                <ParameterCell
                  key={ref.key}
                  ref_={ref}
                  labData={labData}
                  labHistory={labHistory}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
