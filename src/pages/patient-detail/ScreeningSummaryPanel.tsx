import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";
import type { Patient } from "../../types";
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
import {
  isScreeningDue,
  getScreeningStatusLabel,
} from "../../services/screeningToolSuggestor";
import { Card, Button } from "../../components/ui";
import styles from "./ScreeningSummaryPanel.module.css";

/* ---- Constants ---- */

const MAX_HISTORY_DISPLAY = 3;

/* ---- Props ---- */

interface ScreeningSummaryPanelProps {
  readonly patient: Patient;
  readonly screeningHistory: readonly ScreeningEntry[];
}

/* ---- Helpers ---- */

function getRiskInfo(result: ScreeningEntry["result"]): {
  label: string;
  colorClass: string;
  score: string;
  color: string;
} {
  switch (result.toolType) {
    case "nrs2002": {
      const r = result as Nrs2002Result;
      return {
        label: NRS2002_RISK_LABELS[r.riskLevel],
        colorClass: r.riskLevel === "no-risk" ? "green" : r.riskLevel === "at-risk" ? "yellow" : "red",
        score: `${r.totalScore}/7`,
        color: r.riskLevel === "no-risk" ? "var(--color-success)" : r.riskLevel === "at-risk" ? "var(--color-warning)" : "var(--color-danger)",
      };
    }
    case "mna-sf": {
      const r = result as MnaSfResult;
      return {
        label: MNASF_RISK_LABELS[r.riskLevel],
        colorClass: r.riskLevel === "normal" ? "green" : r.riskLevel === "at-risk" ? "yellow" : "red",
        score: `${r.totalScore}/14`,
        color: r.riskLevel === "normal" ? "var(--color-success)" : r.riskLevel === "at-risk" ? "var(--color-warning)" : "var(--color-danger)",
      };
    }
    case "glim": {
      const r = result as GlimResult;
      return {
        label: GLIM_SEVERITY_LABELS[r.severity],
        colorClass: r.severity === "none" ? "green" : r.severity === "stage1" ? "yellow" : "red",
        score: r.diagnosed ? "該当" : "非該当",
        color: r.severity === "none" ? "var(--color-success)" : r.severity === "stage1" ? "var(--color-warning)" : "var(--color-danger)",
      };
    }
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
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  return `${parts[1]}/${parts[2]}`;
}

function getScoreNumber(result: ScreeningEntry["result"]): { score: number; maxScore: number } {
  switch (result.toolType) {
    case "nrs2002":
      return { score: (result as Nrs2002Result).totalScore, maxScore: 7 };
    case "mna-sf":
      return { score: (result as MnaSfResult).totalScore, maxScore: 14 };
    case "glim": {
      const r = result as GlimResult;
      return { score: r.diagnosed ? (r.severity === "stage2" ? 2 : 1) : 0, maxScore: 2 };
    }
  }
}

/* ---- Component ---- */

export function ScreeningSummaryPanel({
  patient,
  screeningHistory,
}: ScreeningSummaryPanelProps) {
  const navigate = useNavigate();

  const sortedHistory = useMemo(() => {
    const copy = [...screeningHistory];
    copy.sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time}`;
      const dateTimeB = `${b.date}T${b.time}`;
      return dateTimeB.localeCompare(dateTimeA);
    });
    return copy;
  }, [screeningHistory]);

  const latestEntry = sortedHistory[0] as ScreeningEntry | undefined;

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const isDue = isScreeningDue(latestEntry, todayStr);
  const statusLabel = getScreeningStatusLabel(latestEntry, todayStr);

  const recentHistory = sortedHistory.slice(0, MAX_HISTORY_DISPLAY);

  const handleGoToScreening = () => {
    navigate("/screening");
  };

  if (screeningHistory.length === 0) {
    return (
      <Card>
        <div className={styles.container}>
          <div className={styles.header}>
            <ShieldCheck size={20} className={styles.headerIcon} />
            <h3 className={styles.title}>栄養スクリーニング</h3>
          </div>
          <div className={`${styles.statusBanner} ${styles.statusNotDone}`}>
            <AlertCircle size={16} />
            未実施 — 入院48時間以内のスクリーニングを推奨
          </div>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              {patient.age >= 65 ? "MNA-SF" : "NRS-2002"}
              によるスクリーニングを推奨します
            </p>
            <Button
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={handleGoToScreening}
            >
              スクリーニングへ
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const latestRisk = latestEntry ? getRiskInfo(latestEntry.result) : undefined;
  const latestScore = latestEntry ? getScoreNumber(latestEntry.result) : undefined;

  const circumference = 2 * Math.PI * 20;
  const scoreRatio = latestScore && latestScore.maxScore > 0
    ? latestScore.score / latestScore.maxScore
    : 0;
  const offset = circumference - scoreRatio * circumference;

  return (
    <Card>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <ShieldCheck size={20} className={styles.headerIcon} />
          <h3 className={styles.title}>栄養スクリーニング</h3>
          <Button
            size="sm"
            variant="ghost"
            icon={<ArrowRight size={14} />}
            onClick={handleGoToScreening}
            className={styles.linkButton}
          >
            詳細
          </Button>
        </div>

        {/* Status banner */}
        {isDue ? (
          <div className={`${styles.statusBanner} ${styles.statusDue}`}>
            <AlertCircle size={16} />
            {statusLabel}
          </div>
        ) : (
          <div className={`${styles.statusBanner} ${styles.statusOk}`}>
            <CheckCircle size={16} />
            {statusLabel}
          </div>
        )}

        {/* Latest result */}
        {latestEntry && latestRisk && latestScore && (
          <div className={styles.latestResult}>
            <div className={styles.scoreBadge}>
              <svg
                width={48}
                height={48}
                viewBox="0 0 48 48"
                className={styles.scoreRing}
              >
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="var(--color-neutral-200)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={latestRisk.color}
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                  className={styles.scoreProgress}
                />
                <text
                  x="24"
                  y="24"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={styles.scoreText}
                  fill="var(--color-neutral-800)"
                >
                  {latestScore.score}
                </text>
              </svg>
            </div>
            <div className={styles.resultInfo}>
              <span className={styles.toolName}>
                {SCREENING_TOOL_LABELS[latestEntry.result.toolType]}
              </span>
              <span className={styles.riskLabel} style={{ color: latestRisk.color }}>
                {latestRisk.label}
              </span>
              <span className={styles.resultDate}>
                {formatDate(latestEntry.date)} {latestEntry.time}
              </span>
            </div>
          </div>
        )}

        {/* History (compact) */}
        {recentHistory.length > 1 && (
          <>
            <hr className={styles.divider} />
            <div className={styles.historySection}>
              <span className={styles.historyLabel}>履歴</span>
              <div className={styles.historyList}>
                {recentHistory.slice(1).map((entry) => {
                  const info = getRiskInfo(entry.result);
                  return (
                    <div key={entry.id} className={styles.historyItem}>
                      <span className={styles.historyDate}>
                        {formatDate(entry.date)}
                      </span>
                      <span className={styles.historyToolBadge}>
                        {SCREENING_TOOL_LABELS[entry.result.toolType]}
                      </span>
                      <span className={styles.historyScore}>{info.score}</span>
                      <span
                        className={`${styles.historyRiskBadge} ${getRiskBadgeClass(info.colorClass)}`}
                      >
                        {info.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
