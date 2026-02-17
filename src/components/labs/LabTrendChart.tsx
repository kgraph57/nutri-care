import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { LabData, LabReference } from "../../types/labData";
import { LAB_REFERENCES } from "../../types/labData";
import styles from "./LabTrendChart.module.css";

interface LabTrendChartProps {
  readonly history: readonly LabData[];
}

type LabKey = LabReference["key"];

const CHART_COLORS = [
  "var(--color-primary-500)",
  "var(--color-danger)",
  "var(--color-warning)",
  "var(--color-info-dark)",
  "var(--color-success)",
  "var(--color-primary-300)",
];

const QUICK_PARAMS: readonly { key: LabKey; label: string }[] = [
  { key: "albumin", label: "Alb" },
  { key: "crp", label: "CRP" },
  { key: "potassium", label: "K" },
  { key: "sodium", label: "Na" },
  { key: "phosphorus", label: "P" },
  { key: "bloodSugar", label: "BS" },
  { key: "creatinine", label: "Cr" },
  { key: "hemoglobin", label: "Hb" },
];

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export function LabTrendChart({ history }: LabTrendChartProps) {
  const [selectedParams, setSelectedParams] = useState<LabKey[]>(["albumin", "crp"]);

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [history],
  );

  const chartData = useMemo(
    () =>
      sortedHistory.map((entry) => {
        const point: Record<string, string | number | undefined> = {
          date: entry.date,
          dateLabel: formatDateLabel(entry.date),
        };
        for (const param of selectedParams) {
          point[param] = entry[param];
        }
        return point;
      }),
    [sortedHistory, selectedParams],
  );

  const toggleParam = (key: LabKey) => {
    setSelectedParams((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : prev.length < 4
          ? [...prev, key]
          : prev,
    );
  };

  if (history.length < 2) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>検査値トレンド</h3>

      <div className={styles.paramButtons}>
        {QUICK_PARAMS.map((param) => {
          const active = selectedParams.includes(param.key);
          return (
            <button
              key={param.key}
              className={`${styles.paramButton} ${active ? styles.paramButtonActive : ""}`}
              onClick={() => toggleParam(param.key)}
            >
              {param.label}
            </button>
          );
        })}
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-neutral-200)"
            />
            <XAxis
              dataKey="dateLabel"
              fontSize={11}
              tick={{ fill: "var(--color-neutral-500)" }}
            />
            {selectedParams.map((paramKey, idx) => {
              const ref = LAB_REFERENCES.find((r) => r.key === paramKey);
              return (
                <YAxis
                  key={paramKey}
                  yAxisId={paramKey}
                  orientation={idx === 0 ? "left" : "right"}
                  fontSize={11}
                  tick={{ fill: "var(--color-neutral-500)" }}
                  hide={idx > 1}
                  label={
                    idx <= 1
                      ? {
                          value: ref?.unit ?? "",
                          angle: idx === 0 ? -90 : 90,
                          position: idx === 0 ? "insideLeft" : "insideRight",
                          style: {
                            fill: "var(--color-neutral-400)",
                            fontSize: 10,
                          },
                        }
                      : undefined
                  }
                />
              );
            })}
            <Tooltip
              contentStyle={{
                fontSize: 12,
                backgroundColor: "var(--color-neutral-50)",
                border: "1px solid var(--color-neutral-200)",
                borderRadius: "var(--radius-sm)",
              }}
            />
            {selectedParams.map((paramKey, idx) => {
              const ref = LAB_REFERENCES.find((r) => r.key === paramKey);
              const color = CHART_COLORS[idx % CHART_COLORS.length];
              return (
                <Line
                  key={paramKey}
                  yAxisId={paramKey}
                  type="monotone"
                  dataKey={paramKey}
                  name={ref?.label ?? paramKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: color }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              );
            })}
            {selectedParams.map((paramKey, idx) => {
              const ref = LAB_REFERENCES.find((r) => r.key === paramKey);
              if (!ref) return null;
              const color = CHART_COLORS[idx % CHART_COLORS.length];
              return [
                <ReferenceLine
                  key={`${paramKey}-min`}
                  yAxisId={paramKey}
                  y={ref.normalMin}
                  stroke={color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />,
                <ReferenceLine
                  key={`${paramKey}-max`}
                  yAxisId={paramKey}
                  y={ref.normalMax}
                  stroke={color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />,
              ];
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        {selectedParams.map((paramKey, idx) => {
          const ref = LAB_REFERENCES.find((r) => r.key === paramKey);
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          return (
            <span key={paramKey} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: color }}
              />
              {ref?.label ?? paramKey} ({ref?.unit})
              <span className={styles.legendRange}>
                基準: {ref?.normalMin}–{ref?.normalMax}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
