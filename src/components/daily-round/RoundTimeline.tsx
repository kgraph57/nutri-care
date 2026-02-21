import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, ClipboardList } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyRoundEntry } from "../../types/dailyRound";
import { ADJUSTMENT_TYPE_LABELS } from "../../types/dailyRound";
import { FEEDING_ADJUSTMENT_LABELS } from "../../types/toleranceData";
import { scoreAssessment } from "../../services/dailyAssessmentScorer";
import {
  analyzeRoundTrend,
  toChartData,
  type TrendDirection,
} from "../../services/dailyRoundSummary";
import styles from "./RoundTimeline.module.css";

// ── Timeline ──

interface RoundTimelineProps {
  readonly entries: readonly DailyRoundEntry[];
  readonly onSelect?: (entry: DailyRoundEntry) => void;
}

function dotClass(riskLevel: string): string {
  const map: Record<string, string> = {
    low: styles.dotLow,
    moderate: styles.dotModerate,
    high: styles.dotHigh,
    critical: styles.dotCritical,
  };
  return map[riskLevel] ?? styles.dotModerate;
}

function scoreColor(value: number): string {
  if (value >= 80) return "var(--color-success)";
  if (value >= 50) return "var(--color-warning-dark)";
  return "var(--color-danger)";
}

function feedingBadgeStyle(adj: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    advance: { bg: "var(--color-success-light)", fg: "var(--color-success-dark)" },
    maintain: { bg: "var(--color-info-light)", fg: "var(--color-info-dark)" },
    reduce: { bg: "var(--color-warning-light)", fg: "var(--color-warning-dark)" },
    hold: { bg: "var(--color-danger-light)", fg: "var(--color-danger-dark)" },
  };
  const c = colors[adj] ?? colors.maintain;
  return { background: c.bg, color: c.fg };
}

export function RoundTimeline({ entries, onSelect }: RoundTimelineProps) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries],
  );

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <ClipboardList size={32} />
        <p>回診記録がありません</p>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {sorted.map((entry) => {
        const score = scoreAssessment(
          entry.assessment,
          entry.adjustedPlan.requirements,
        );
        const adj = entry.adjustedPlan.feedingAdjustment;

        return (
          <div
            key={entry.id}
            className={styles.timelineItem}
            onClick={() => onSelect?.(entry)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSelect?.(entry);
            }}
          >
            <div className={styles.timelineDate}>
              <div className={styles.timelineDateDay}>{entry.date.slice(5)}</div>
              <div className={styles.timelineDateTime}>
                {entry.assessment.time}
              </div>
            </div>
            <div className={`${styles.timelineDot} ${dotClass(score.riskLevel)}`} />
            <div className={styles.timelineContent}>
              <div className={styles.timelineHeader}>
                <span
                  className={styles.timelineScore}
                  style={{ color: scoreColor(score.overall) }}
                >
                  {score.overall}
                </span>
                <span
                  className={styles.timelineFeedingBadge}
                  style={feedingBadgeStyle(adj)}
                >
                  {FEEDING_ADJUSTMENT_LABELS[adj]}
                </span>
              </div>
              <div className={styles.timelineMetrics}>
                <span>
                  E: {entry.assessment.actualIntake.estimatedEnergy}kcal
                </span>
                <span>
                  P: {entry.assessment.actualIntake.estimatedProtein}g
                </span>
                <span>GI: {score.giScore}</span>
              </div>
              {score.warnings.length > 0 && (
                <div className={styles.timelineWarnings}>
                  {score.warnings.slice(0, 3).map((w, i) => (
                    <span key={i} className={styles.timelineWarningTag}>
                      {w}
                    </span>
                  ))}
                  {score.warnings.length > 3 && (
                    <span className={styles.timelineWarningTag}>
                      +{score.warnings.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Trend Card ──

interface TrendCardProps {
  readonly entries: readonly DailyRoundEntry[];
}

function trendIcon(direction: TrendDirection) {
  if (direction === "improving") return <TrendingUp size={14} />;
  if (direction === "worsening") return <TrendingDown size={14} />;
  return <Minus size={14} />;
}

function trendClass(direction: TrendDirection): string {
  if (direction === "improving") return styles.trendImproving;
  if (direction === "worsening") return styles.trendWorsening;
  return styles.trendStable;
}

const TREND_LABELS: Record<TrendDirection, string> = {
  improving: "改善",
  stable: "安定",
  worsening: "悪化",
};

export function TrendCard({ entries }: TrendCardProps) {
  const trend = useMemo(() => analyzeRoundTrend(entries), [entries]);
  const chartData = useMemo(() => toChartData(entries), [entries]);

  return (
    <div className={styles.trendCard}>
      <div className={styles.trendHeader}>
        <span className={styles.trendTitle}>回診トレンド</span>
        <span className={styles.trendDays}>{trend.daysTracked}日間</span>
      </div>

      <div className={styles.trendGrid}>
        <div className={styles.trendItem}>
          <div className={styles.trendLabel}>総合</div>
          <div className={`${styles.trendValue} ${trendClass(trend.overallTrend)}`}>
            {trendIcon(trend.overallTrend)}
            {TREND_LABELS[trend.overallTrend]}
          </div>
        </div>
        <div className={styles.trendItem}>
          <div className={styles.trendLabel}>消化管</div>
          <div className={`${styles.trendValue} ${trendClass(trend.giTrend)}`}>
            {trendIcon(trend.giTrend)}
            {TREND_LABELS[trend.giTrend]}
          </div>
        </div>
        <div className={styles.trendItem}>
          <div className={styles.trendLabel}>摂取量</div>
          <div className={`${styles.trendValue} ${trendClass(trend.intakeTrend)}`}>
            {trendIcon(trend.intakeTrend)}
            {TREND_LABELS[trend.intakeTrend]}
          </div>
        </div>
      </div>

      {chartData.length >= 2 && (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData as ChartDataPoint[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="overall"
                name="総合"
                stroke="var(--color-primary-500)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="gi"
                name="GI"
                stroke="var(--color-success)"
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="energyPercent"
                name="E充足%"
                stroke="var(--color-warning)"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

type ChartDataPoint = ReturnType<typeof toChartData>[number];
