import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import type { LabData, LabReference } from "../../types/labData";
import { LAB_REFERENCES } from "../../types/labData";
import styles from "./LabHistoryTable.module.css";

interface LabHistoryTableProps {
  readonly history: readonly LabData[];
  readonly onDelete?: (date: string) => void;
}

const DISPLAY_PARAMS: readonly LabReference["key"][] = [
  "albumin",
  "prealbumin",
  "bun",
  "creatinine",
  "bloodSugar",
  "sodium",
  "potassium",
  "calcium",
  "magnesium",
  "phosphorus",
  "crp",
  "hemoglobin",
];

function getCellStatus(
  value: number | undefined,
  ref: LabReference,
): "normal" | "low" | "high" | "critical" {
  if (value === undefined) return "normal";
  if (ref.criticalLow !== undefined && value < ref.criticalLow) return "critical";
  if (ref.criticalHigh !== undefined && value > ref.criticalHigh) return "critical";
  if (value < ref.normalMin) return "low";
  if (value > ref.normalMax) return "high";
  return "normal";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export function LabHistoryTable({ history, onDelete }: LabHistoryTableProps) {
  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [history],
  );

  const refs = useMemo(
    () =>
      DISPLAY_PARAMS.map((key) => LAB_REFERENCES.find((r) => r.key === key)).filter(
        (r): r is LabReference => r !== undefined,
      ),
    [],
  );

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>検査値履歴</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.headerCell}>項目</th>
              {sortedHistory.map((entry) => (
                <th key={entry.date} className={styles.dateHeader}>
                  <span>{formatDate(entry.date)}</span>
                  {onDelete && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => onDelete(entry.date)}
                      title="この日の検査値を削除"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {refs.map((ref) => (
              <tr key={ref.key}>
                <td className={styles.labelCell}>
                  <span className={styles.paramLabel}>{ref.label}</span>
                  <span className={styles.paramUnit}>{ref.unit}</span>
                </td>
                {sortedHistory.map((entry) => {
                  const value = entry[ref.key];
                  const status = getCellStatus(value, ref);
                  const cellClass =
                    status === "critical"
                      ? styles.cellCritical
                      : status === "low"
                        ? styles.cellLow
                        : status === "high"
                          ? styles.cellHigh
                          : styles.cellNormal;

                  return (
                    <td
                      key={entry.date}
                      className={`${styles.valueCell} ${cellClass}`}
                    >
                      {value !== undefined ? value : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
