import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import type { ToleranceEntry } from "../../types/toleranceData";
import { FEEDING_ADJUSTMENT_LABELS } from "../../types/toleranceData";
import styles from "./ToleranceTrendChart.module.css";

/* ---- Constants ---- */

const GOOD_THRESHOLD = 7;
const DANGER_THRESHOLD = 4;
const Y_DOMAIN_MIN = 0;
const Y_DOMAIN_MAX = 10;

/* ---- Props ---- */

interface ToleranceTrendChartProps {
  readonly history: readonly ToleranceEntry[];
}

/* ---- Helpers ---- */

interface ChartDataPoint {
  readonly date: string;
  readonly score: number;
  readonly adjustment: string;
  readonly time: string;
}

function formatDateLabel(date: string): string {
  const parts = date.split("-");
  if (parts.length < 3) return date;
  return `${parts[1]}/${parts[2]}`;
}

function buildChartData(
  entries: readonly ToleranceEntry[],
): readonly ChartDataPoint[] {
  const sorted = [...entries].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    return cmp !== 0 ? cmp : a.time.localeCompare(b.time);
  });

  return sorted.map((entry) => ({
    date: formatDateLabel(entry.date),
    score: entry.toleranceScore,
    adjustment: FEEDING_ADJUSTMENT_LABELS[entry.feedingAdjustment],
    time: entry.time,
  }));
}

/* ---- Tooltip ---- */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload: ChartDataPoint }>;
  readonly label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>
        {label} {data.time}
      </p>
      <p className={styles.tooltipRow}>スコア: {data.score} / 10</p>
      <p className={styles.tooltipRow}>推奨: {data.adjustment}</p>
    </div>
  );
}

/* ---- Dot renderer ---- */

function renderDot(props: {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: ChartDataPoint;
  readonly index?: number;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;

  let fill = "var(--color-danger-dark)";
  if (payload.score >= GOOD_THRESHOLD) {
    fill = "var(--color-success-dark)";
  } else if (payload.score >= DANGER_THRESHOLD) {
    fill = "var(--color-warning-dark)";
  }
  return (
    <circle
      key={`dot-${payload.date}-${payload.time}`}
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke="#fff"
      strokeWidth={1.5}
    />
  );
}

/* ---- Main component ---- */

export function ToleranceTrendChart({ history }: ToleranceTrendChartProps) {
  const chartData = useMemo(() => buildChartData(history), [history]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>耐性スコア推移</span>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: "var(--color-success-dark)" }}
            />
            良好 (7-10)
          </span>
          <span className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: "var(--color-warning-dark)" }}
            />
            注意 (4-6)
          </span>
          <span className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: "var(--color-danger-dark)" }}
            />
            要対応 (0-3)
          </span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
          >
            {/* Zone fills */}
            <ReferenceArea
              y1={GOOD_THRESHOLD}
              y2={Y_DOMAIN_MAX}
              fill="var(--color-success-dark)"
              fillOpacity={0.06}
            />
            <ReferenceArea
              y1={DANGER_THRESHOLD}
              y2={GOOD_THRESHOLD}
              fill="var(--color-warning-dark)"
              fillOpacity={0.06}
            />
            <ReferenceArea
              y1={Y_DOMAIN_MIN}
              y2={DANGER_THRESHOLD}
              fill="var(--color-danger-dark)"
              fillOpacity={0.06}
            />

            <XAxis
              dataKey="date"
              fontSize={11}
              tick={{ fill: "var(--color-neutral-500)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-neutral-200)" }}
            />
            <YAxis
              domain={[Y_DOMAIN_MIN, Y_DOMAIN_MAX]}
              fontSize={11}
              tick={{ fill: "var(--color-neutral-500)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-neutral-200)" }}
              width={28}
              ticks={[0, 2, 4, 6, 8, 10]}
            />

            <Tooltip content={<ChartTooltip />} />

            {/* Threshold lines */}
            <ReferenceLine
              y={GOOD_THRESHOLD}
              stroke="var(--color-success-dark)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
            <ReferenceLine
              y={DANGER_THRESHOLD}
              stroke="var(--color-danger-dark)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-primary-500)"
              strokeWidth={2}
              dot={renderDot}
              activeDot={{
                r: 6,
                stroke: "var(--color-primary-500)",
                strokeWidth: 2,
                fill: "#fff",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
