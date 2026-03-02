import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
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
import { Button } from "../ui";
import styles from "./ScreeningResultCard.module.css";

interface ScreeningResultCardProps {
  readonly entry: ScreeningEntry;
  readonly onProceedToGlim?: () => void;
}

function getScoreInfo(result: ScreeningEntry["result"]): {
  score: number;
  maxScore: number;
  label: string;
  color: string;
} {
  switch (result.toolType) {
    case "nrs2002": {
      const r = result as Nrs2002Result;
      return {
        score: r.totalScore,
        maxScore: 7,
        label: NRS2002_RISK_LABELS[r.riskLevel],
        color: getNrs2002Color(r.riskLevel),
      };
    }
    case "mna-sf": {
      const r = result as MnaSfResult;
      return {
        score: r.totalScore,
        maxScore: 14,
        label: MNASF_RISK_LABELS[r.riskLevel],
        color: getMnaSfColor(r.riskLevel),
      };
    }
    case "glim": {
      const r = result as GlimResult;
      return {
        score: r.diagnosed ? (r.severity === "stage2" ? 2 : 1) : 0,
        maxScore: 2,
        label: GLIM_SEVERITY_LABELS[r.severity],
        color: getGlimColor(r.severity),
      };
    }
  }
}

function getNrs2002Color(riskLevel: Nrs2002Result["riskLevel"]): string {
  switch (riskLevel) {
    case "no-risk":
      return "var(--color-success)";
    case "at-risk":
      return "var(--color-warning)";
    case "high-risk":
      return "var(--color-danger)";
  }
}

function getMnaSfColor(riskLevel: MnaSfResult["riskLevel"]): string {
  switch (riskLevel) {
    case "normal":
      return "var(--color-success)";
    case "at-risk":
      return "var(--color-warning)";
    case "malnourished":
      return "var(--color-danger)";
  }
}

function getGlimColor(severity: GlimResult["severity"]): string {
  switch (severity) {
    case "none":
      return "var(--color-success)";
    case "stage1":
      return "var(--color-warning)";
    case "stage2":
      return "var(--color-danger)";
  }
}

function hasRisk(result: ScreeningEntry["result"]): boolean {
  switch (result.toolType) {
    case "nrs2002":
      return (result as Nrs2002Result).riskLevel !== "no-risk";
    case "mna-sf":
      return (result as MnaSfResult).riskLevel !== "normal";
    case "glim":
      return false;
  }
}

function formatDateTime(date: string, time: string): string {
  const d = new Date(`${date}T${time}`);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

export function ScreeningResultCard({
  entry,
  onProceedToGlim,
}: ScreeningResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const { score, maxScore, label, color } = getScoreInfo(entry.result);
  const showGlimButton =
    onProceedToGlim &&
    entry.result.toolType !== "glim" &&
    hasRisk(entry.result);

  const circumference = 2 * Math.PI * 28;
  const scoreRatio = maxScore > 0 ? score / maxScore : 0;
  const offset = circumference - scoreRatio * circumference;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {/* スコアバッジ（円形） */}
        <div className={styles.scoreBadge}>
          <svg
            width={64}
            height={64}
            viewBox="0 0 64 64"
            className={styles.scoreRing}
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--color-neutral-200)"
              strokeWidth="3"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              className={styles.scoreProgress}
            />
            <text
              x="32"
              y="32"
              textAnchor="middle"
              dominantBaseline="central"
              className={styles.scoreText}
              fill="var(--color-neutral-800)"
            >
              {score}
            </text>
          </svg>
        </div>

        {/* ツール名 + 日時 + リスクレベル */}
        <div className={styles.cardInfo}>
          <div className={styles.toolRow}>
            <span className={styles.toolName}>
              {SCREENING_TOOL_LABELS[entry.result.toolType]}
            </span>
            <span className={styles.dateTime}>
              {formatDateTime(entry.date, entry.time)}
            </span>
          </div>
          <span className={styles.riskLabel} style={{ color }}>
            {label}
          </span>
        </div>

        {/* 展開ボタン */}
        <button
          type="button"
          className={styles.expandButton}
          onClick={toggleExpand}
          aria-expanded={expanded}
          aria-label={expanded ? "推奨事項を閉じる" : "推奨事項を表示"}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* 推奨事項リスト */}
      {expanded && (
        <div className={styles.recommendations}>
          <h5 className={styles.recTitle}>推奨事項</h5>
          <ul className={styles.recList}>
            {entry.result.recommendations.map((rec, index) => (
              <li key={index} className={styles.recItem}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* GLIM診断ボタン */}
      {showGlimButton && (
        <div className={styles.glimAction}>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRight size={14} />}
            onClick={onProceedToGlim}
          >
            GLIM診断へ進む
          </Button>
        </div>
      )}
    </div>
  );
}
