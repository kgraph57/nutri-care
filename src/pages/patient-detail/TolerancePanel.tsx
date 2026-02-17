import { useMemo } from "react";
import { ShieldCheck, Plus, TrendingUp, Minus, TrendingDown } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { Card, Button, Badge } from "../../components/ui";
import type { ToleranceEntry, FeedingAdjustment, ToleranceTrend } from "../../types/toleranceData";
import {
  VOMITING_SEVERITY_LABELS,
  ABDOMINAL_DISTENSION_LABELS,
  STOOL_CONSISTENCY_LABELS,
  FEEDING_ADJUSTMENT_LABELS,
} from "../../types/toleranceData";
import { analyzeToleranceTrend } from "../../services/toleranceScorer";
import styles from "./TolerancePanel.module.css";

/* ---- Constants ---- */

const GOOD_THRESHOLD = 7;
const CAUTION_THRESHOLD = 4;
const MAX_HISTORY_DISPLAY = 5;
const MAX_SPARKLINE_ENTRIES = 7;

const BOWEL_SOUND_LABELS: Readonly<Record<ToleranceEntry["bowelSounds"], string>> = {
  present: "正常",
  reduced: "減弱",
  absent: "消失",
};

/* ---- Props ---- */

interface TolerancePanelProps {
  readonly history: readonly ToleranceEntry[];
  readonly onAddEntry: () => void;
}

/* ---- Helpers ---- */

function getScoreColorClass(score: number): string {
  if (score >= GOOD_THRESHOLD) return styles.scoreGood;
  if (score >= CAUTION_THRESHOLD) return styles.scoreCaution;
  return styles.scoreDanger;
}

function getScoreRingClass(score: number): string {
  if (score >= GOOD_THRESHOLD) return styles.scoreRingGood;
  if (score >= CAUTION_THRESHOLD) return styles.scoreRingCaution;
  return styles.scoreRingDanger;
}

function getScoreStatusLabel(score: number): string {
  if (score >= GOOD_THRESHOLD) return "良好";
  if (score >= CAUTION_THRESHOLD) return "注意";
  return "要対応";
}

function getAdjustmentVariant(adjustment: FeedingAdjustment): "success" | "warning" | "danger" | "info" {
  if (adjustment === "advance") return "success";
  if (adjustment === "maintain") return "info";
  if (adjustment === "reduce") return "warning";
  return "danger";
}

function formatDate(date: string): string {
  const parts = date.split("-");
  if (parts.length < 3) return date;
  return `${parts[1]}/${parts[2]}`;
}

function buildSparklineData(entries: readonly ToleranceEntry[]): readonly { readonly date: string; readonly score: number }[] {
  const sorted = [...entries].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    return cmp !== 0 ? cmp : a.time.localeCompare(b.time);
  });
  return sorted.slice(-MAX_SPARKLINE_ENTRIES).map((e) => ({
    date: formatDate(e.date),
    score: e.toleranceScore,
  }));
}

/* ---- Sub-components ---- */

function TrendIcon({ trend }: { readonly trend: ToleranceTrend["trend"] }) {
  if (trend === "improving") {
    return (
      <span className={`${styles.trendArrow} ${styles.trendImproving}`}>
        <TrendingUp size={16} />
      </span>
    );
  }
  if (trend === "worsening") {
    return (
      <span className={`${styles.trendArrow} ${styles.trendWorsening}`}>
        <TrendingDown size={16} />
      </span>
    );
  }
  return (
    <span className={`${styles.trendArrow} ${styles.trendStable}`}>
      <Minus size={16} />
    </span>
  );
}

function SparklineTooltip({ active, payload, label }: {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly value: number }>;
  readonly label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.adjustmentSection} style={{ padding: "4px 8px" }}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>スコア: {payload[0].value}</span>
    </div>
  );
}

/* ---- Main component ---- */

export function TolerancePanel({ history, onAddEntry }: TolerancePanelProps) {
  const trendAnalysis = useMemo(() => analyzeToleranceTrend(history), [history]);
  const latestEntry = useMemo(() => (history.length > 0 ? trendAnalysis.entries[0] : undefined), [history, trendAnalysis]);
  const sparklineData = useMemo(() => buildSparklineData(history), [history]);
  const recentHistory = useMemo(() => trendAnalysis.entries.slice(0, MAX_HISTORY_DISPLAY), [trendAnalysis]);

  if (history.length === 0) {
    return (
      <Card>
        <div className={styles.container}>
          <div className={styles.header}>
            <ShieldCheck size={20} className={styles.headerIcon} />
            <h3 className={styles.title}>経腸栄養耐性</h3>
          </div>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>経腸栄養耐性の評価データがありません</p>
            <Button size="sm" icon={<Plus size={16} />} onClick={onAddEntry}>入力</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <ShieldCheck size={20} className={styles.headerIcon} />
          <h3 className={styles.title}>経腸栄養耐性</h3>
          <Button size="sm" variant="ghost" icon={<Plus size={16} />} onClick={onAddEntry} className={styles.addButton}>
            入力
          </Button>
        </div>

        {/* Current score */}
        {latestEntry && (
          <div className={styles.scoreSection}>
            <div className={`${styles.scoreRing} ${getScoreRingClass(latestEntry.toleranceScore)}`}>
              <span className={`${styles.scoreValue} ${getScoreColorClass(latestEntry.toleranceScore)}`}>
                {latestEntry.toleranceScore}
              </span>
            </div>
            <div className={styles.scoreRow}>
              <span className={`${styles.scoreLabel} ${getScoreColorClass(latestEntry.toleranceScore)}`}>
                {getScoreStatusLabel(latestEntry.toleranceScore)}
              </span>
              <TrendIcon trend={trendAnalysis.trend} />
            </div>
          </div>
        )}

        <hr className={styles.divider} />

        {/* Latest entry details */}
        {latestEntry && (
          <div className={styles.detailSection}>
            <span className={styles.detailSectionLabel}>最新評価 ({formatDate(latestEntry.date)} {latestEntry.time})</span>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>残胃量 (GRV)</span>
                <span className={styles.detailValue}>{latestEntry.gastricResidual} mL</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>嘔吐</span>
                <span className={styles.detailValue}>{VOMITING_SEVERITY_LABELS[latestEntry.vomiting]}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>腹部膨満</span>
                <span className={styles.detailValue}>{ABDOMINAL_DISTENSION_LABELS[latestEntry.abdominalDistension]}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>腸蠕動音</span>
                <span className={styles.detailValue}>{BOWEL_SOUND_LABELS[latestEntry.bowelSounds]}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>排便</span>
                <span className={styles.detailValue}>
                  {STOOL_CONSISTENCY_LABELS[latestEntry.stoolConsistency]} ({latestEntry.stoolCount}回/日)
                </span>
              </div>
            </div>
          </div>
        )}

        <hr className={styles.divider} />

        {/* Feeding adjustment recommendation */}
        {latestEntry && (
          <div className={styles.adjustmentSection}>
            <span className={styles.adjustmentLabel}>栄養投与推奨</span>
            <Badge variant={getAdjustmentVariant(latestEntry.feedingAdjustment)}>
              {FEEDING_ADJUSTMENT_LABELS[latestEntry.feedingAdjustment]}
            </Badge>
          </div>
        )}

        <hr className={styles.divider} />

        {/* Mini sparkline chart */}
        {sparklineData.length > 1 && (
          <>
            <div className={styles.chartSection}>
              <span className={styles.chartSectionLabel}>スコア推移</span>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={sparklineData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" fontSize={10} tick={{ fill: "var(--color-neutral-500)" }} />
                    <YAxis domain={[0, 10]} fontSize={10} tick={{ fill: "var(--color-neutral-500)" }} width={24} />
                    <Tooltip content={<SparklineTooltip />} />
                    <ReferenceLine y={GOOD_THRESHOLD} stroke="var(--color-success-dark)" strokeDasharray="4 4" />
                    <ReferenceLine y={CAUTION_THRESHOLD} stroke="var(--color-danger-dark)" strokeDasharray="4 4" />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--color-primary-500)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "var(--color-primary-500)" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <hr className={styles.divider} />
          </>
        )}

        {/* Recent history list */}
        <div className={styles.historySection}>
          <span className={styles.historySectionLabel}>評価履歴</span>
          <div className={styles.historyList}>
            {recentHistory.map((entry) => (
              <div key={entry.id} className={styles.historyItem}>
                <span className={styles.historyDate}>{formatDate(entry.date)} {entry.time}</span>
                <span className={`${styles.historyScore} ${getScoreColorClass(entry.toleranceScore)}`}>
                  {entry.toleranceScore}/10
                </span>
                <Badge variant={getAdjustmentVariant(entry.feedingAdjustment)} className={styles.historyAdjustment}>
                  {FEEDING_ADJUSTMENT_LABELS[entry.feedingAdjustment]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
