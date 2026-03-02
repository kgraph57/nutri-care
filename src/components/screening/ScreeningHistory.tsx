import { useCallback, useMemo } from "react";
import { ClipboardList } from "lucide-react";
import type {
  ScreeningEntry,
  Nrs2002Result,
  MnaSfResult,
  GlimResult,
} from "../../types/screening";
import {
  SCREENING_TOOL_LABELS,
  NRS2002_RISK_LABELS,
  MNASF_RISK_LABELS,
  GLIM_SEVERITY_LABELS,
} from "../../types/screening";
import styles from "./ScreeningHistory.module.css";

interface ScreeningHistoryProps {
  readonly entries: readonly ScreeningEntry[];
  readonly onSelectEntry?: (entry: ScreeningEntry) => void;
}

function getRiskInfo(result: ScreeningEntry["result"]): {
  label: string;
  colorClass: string;
  score: string;
} {
  switch (result.toolType) {
    case "nrs2002": {
      const r = result as Nrs2002Result;
      return {
        label: NRS2002_RISK_LABELS[r.riskLevel],
        colorClass: getNrs2002ColorClass(r.riskLevel),
        score: `${r.totalScore}/7`,
      };
    }
    case "mna-sf": {
      const r = result as MnaSfResult;
      return {
        label: MNASF_RISK_LABELS[r.riskLevel],
        colorClass: getMnaSfColorClass(r.riskLevel),
        score: `${r.totalScore}/14`,
      };
    }
    case "glim": {
      const r = result as GlimResult;
      return {
        label: GLIM_SEVERITY_LABELS[r.severity],
        colorClass: getGlimColorClass(r.severity),
        score: r.diagnosed ? "該当" : "非該当",
      };
    }
  }
}

function getNrs2002ColorClass(
  riskLevel: Nrs2002Result["riskLevel"],
): string {
  switch (riskLevel) {
    case "no-risk":
      return "green";
    case "at-risk":
      return "yellow";
    case "high-risk":
      return "red";
  }
}

function getMnaSfColorClass(riskLevel: MnaSfResult["riskLevel"]): string {
  switch (riskLevel) {
    case "normal":
      return "green";
    case "at-risk":
      return "yellow";
    case "malnourished":
      return "red";
  }
}

function getGlimColorClass(severity: GlimResult["severity"]): string {
  switch (severity) {
    case "none":
      return "green";
    case "stage1":
      return "yellow";
    case "stage2":
      return "red";
  }
}

function getToolBadgeClass(toolType: ScreeningEntry["result"]["toolType"]): string {
  switch (toolType) {
    case "nrs2002":
      return styles.toolNrs;
    case "mna-sf":
      return styles.toolMna;
    case "glim":
      return styles.toolGlim;
  }
}

function getRiskBadgeClass(colorClass: string): string {
  switch (colorClass) {
    case "green":
      return styles.riskGreen;
    case "yellow":
      return styles.riskYellow;
    case "red":
      return styles.riskRed;
    default:
      return styles.riskGreen;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${month}/${day}`;
}

export function ScreeningHistory({
  entries,
  onSelectEntry,
}: ScreeningHistoryProps) {
  const sortedEntries = useMemo(() => {
    const copy = [...entries];
    copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return copy;
  }, [entries]);

  const handleClick = useCallback(
    (entry: ScreeningEntry) => {
      if (onSelectEntry) {
        onSelectEntry(entry);
      }
    },
    [onSelectEntry],
  );

  if (sortedEntries.length === 0) {
    return (
      <div className={styles.empty}>
        <ClipboardList size={32} className={styles.emptyIcon} />
        <p className={styles.emptyText}>スクリーニング履歴がありません</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <h4 className={styles.title}>スクリーニング履歴</h4>
      <div className={styles.entries}>
        {sortedEntries.map((entry) => {
          const { label, colorClass, score } = getRiskInfo(entry.result);
          const isClickable = Boolean(onSelectEntry);

          return (
            <button
              key={entry.id}
              type="button"
              className={`${styles.entry} ${isClickable ? styles.entryClickable : ""}`}
              onClick={() => handleClick(entry)}
              disabled={!isClickable}
            >
              {/* 日付 */}
              <span className={styles.date}>{formatDate(entry.date)}</span>

              {/* ツールバッジ */}
              <span
                className={`${styles.toolBadge} ${getToolBadgeClass(entry.result.toolType)}`}
              >
                {SCREENING_TOOL_LABELS[entry.result.toolType]}
              </span>

              {/* スコア */}
              <span className={styles.score}>{score}</span>

              {/* リスクレベルバッジ */}
              <span
                className={`${styles.riskBadge} ${getRiskBadgeClass(colorClass)}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
