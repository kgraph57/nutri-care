import { useMemo } from "react";
import { Droplets, Plus } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";
import { Card, Button, Badge } from "../../components/ui";
import type { FluidBalanceEntry } from "../../types/fluidBalance";
import { computeTotalInput, computeTotalOutput, computeNetBalance, computeUrineRate } from "../../types/fluidBalance";
import {
  INPUT_LABELS, OUTPUT_LABELS, COLOR_BLUE, COLOR_RED,
  getNetBalanceColor, getUrineRateStatus, computeChartData,
  computeCumulativeBalance, computeBarMax, computeChartDomainMax,
  getLatestEntry,
  type ChartDayData,
} from "./fluidBalanceHelpers";
import styles from "./FluidBalancePanel.module.css";

/* ---- Props ---- */

interface FluidBalancePanelProps {
  readonly history: readonly FluidBalanceEntry[];
  readonly patientWeight: number;
  readonly onAddEntry: () => void;
}

/* ---- Sub-components ---- */

function BreakdownBar({ value, max, color, label }: {
  readonly value: number; readonly max: number;
  readonly color: string; readonly label: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={styles.breakdownRow}>
      <span className={styles.breakdownLabel}>{label}</span>
      <div className={styles.breakdownBarTrack}>
        <div className={styles.breakdownBarFill} style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className={styles.breakdownValue}>{value} mL</span>
    </div>
  );
}

function FluidTooltip({ active, payload, label }: {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload: ChartDayData }>;
  readonly label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{label}</p>
      <p className={styles.tooltipRow}>IN: {data.totalIn} mL</p>
      <p className={styles.tooltipRow}>OUT: {Math.abs(data.totalOutNeg)} mL</p>
      <p className={styles.tooltipRow}>差引: {data.net > 0 ? "+" : ""}{data.net} mL</p>
    </div>
  );
}

/* ---- Main component ---- */

export function FluidBalancePanel({ history, patientWeight, onAddEntry }: FluidBalancePanelProps) {
  const latestEntry = useMemo(() => getLatestEntry(history), [history]);
  const todayNet = useMemo(() => (latestEntry ? computeNetBalance(latestEntry) : 0), [latestEntry]);
  const todayIn = useMemo(() => (latestEntry ? computeTotalInput(latestEntry.input) : 0), [latestEntry]);
  const todayOut = useMemo(() => (latestEntry ? computeTotalOutput(latestEntry.output) : 0), [latestEntry]);
  const urineRate = useMemo(
    () => (latestEntry ? computeUrineRate(latestEntry.output.urine, patientWeight, 24) : 0),
    [latestEntry, patientWeight],
  );
  const chartData = useMemo(() => computeChartData(history), [history]);
  const cumulative = useMemo(() => computeCumulativeBalance(history), [history]);
  const barMax = useMemo(
    () => (latestEntry ? computeBarMax(latestEntry.input, latestEntry.output) : 1),
    [latestEntry],
  );
  const domainMax = useMemo(() => computeChartDomainMax(chartData), [chartData]);

  if (history.length === 0) {
    return (
      <Card>
        <div className={styles.container}>
          <div className={styles.header}>
            <Droplets size={20} className={styles.headerIcon} />
            <h3 className={styles.title}>水分出納バランス</h3>
          </div>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>水分出納データがありません</p>
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
          <Droplets size={20} className={styles.headerIcon} />
          <h3 className={styles.title}>水分出納バランス</h3>
          <Button size="sm" variant="ghost" icon={<Plus size={16} />} onClick={onAddEntry} className={styles.addButton}>
            入力
          </Button>
        </div>

        {/* Today's net balance */}
        <div className={styles.netBalanceSection}>
          <span className={styles.netBalanceValue} style={{ color: getNetBalanceColor(todayNet) }}>
            {todayNet > 0 ? "+" : ""}{todayNet}<span className={styles.netBalanceUnit}> mL</span>
          </span>
          <div className={styles.inOutRow}>
            <span className={styles.inOutItem}>IN <strong>{todayIn}</strong> mL</span>
            <span className={styles.inOutDivider}>/</span>
            <span className={styles.inOutItem}>OUT <strong>{todayOut}</strong> mL</span>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* IN/OUT breakdown */}
        {latestEntry && (
          <div className={styles.breakdownSection}>
            <div className={styles.breakdownGroup}>
              <span className={styles.breakdownGroupTitle}>IN</span>
              {INPUT_LABELS.map(([key, label]) => (
                <BreakdownBar key={key} value={latestEntry.input[key]} max={barMax} color={COLOR_BLUE} label={label} />
              ))}
            </div>
            <div className={styles.breakdownGroup}>
              <span className={styles.breakdownGroupTitle}>OUT</span>
              {OUTPUT_LABELS.map(([key, label]) => (
                <BreakdownBar key={key} value={latestEntry.output[key]} max={barMax} color={COLOR_RED} label={label} />
              ))}
            </div>
          </div>
        )}

        <hr className={styles.divider} />

        {/* Urine output monitor */}
        <div className={styles.urineSection}>
          <span className={styles.urineSectionLabel}>尿量モニター</span>
          <div className={styles.urineRow}>
            <Badge variant={getUrineRateStatus(urineRate)}>{urineRate.toFixed(2)} mL/kg/hr</Badge>
            <span className={styles.urineTarget}>目標: 0.5–1.0 mL/kg/hr</span>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Daily trend chart */}
        {chartData.length > 1 && (
          <>
            <div className={styles.chartSection}>
              <span className={styles.chartSectionLabel}>日別推移</span>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} stackOffset="sign">
                    <XAxis dataKey="dateLabel" fontSize={11} tick={{ fill: "var(--color-neutral-500)" }} />
                    <YAxis
                      domain={[-domainMax, domainMax]} fontSize={11}
                      tick={{ fill: "var(--color-neutral-500)" }}
                      label={{ value: "mL", angle: -90, position: "insideLeft", style: { fill: "var(--color-neutral-400)", fontSize: 11 } }}
                    />
                    <Tooltip content={<FluidTooltip />} />
                    <ReferenceLine y={0} stroke="var(--color-neutral-300)" />
                    <Bar dataKey="totalIn" name="IN" radius={[3, 3, 0, 0]}>
                      {chartData.map((d) => <Cell key={d.dateLabel} fill={COLOR_BLUE} />)}
                    </Bar>
                    <Bar dataKey="totalOutNeg" name="OUT" radius={[0, 0, 3, 3]}>
                      {chartData.map((d) => <Cell key={d.dateLabel} fill={COLOR_RED} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <hr className={styles.divider} />
          </>
        )}

        {/* Cumulative balance */}
        <div className={styles.cumulativeSection}>
          <span className={styles.cumulativeLabel}>累積水分バランス</span>
          <span className={styles.cumulativeValue} style={{ color: getNetBalanceColor(cumulative) }}>
            {cumulative > 0 ? "+" : ""}{cumulative}<span className={styles.cumulativeUnit}> mL</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
