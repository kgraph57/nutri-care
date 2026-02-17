import { useMemo } from "react";
import { TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "../../components/ui";
import type { NutritionMenuData } from "../../hooks/useNutritionMenus";
import styles from "./CaloricDebtTracker.module.css";

/* ---- Types ---- */

interface CaloricDebtTrackerProps {
  readonly menus: readonly NutritionMenuData[];
  readonly targetEnergy: number | null;
  readonly targetProtein: number | null;
  readonly daysAdmitted: number;
}

interface DailyData {
  readonly date: string;
  readonly dateLabel: string;
  readonly actualEnergy: number;
  readonly actualProtein: number;
  readonly deficit: number;
  readonly cumulativeDebt: number;
  readonly adequacyPercent: number;
}

/* ---- Constants ---- */

const MAX_CHART_DAYS = 7;
const ADEQUACY_HIGH = 80;
const ADEQUACY_MID = 60;
const COLOR_GREEN = "var(--color-success, #22c55e)";
const COLOR_AMBER = "var(--color-warning, #f59e0b)";
const COLOR_RED = "var(--color-danger, #ef4444)";

/* ---- Pure computation ---- */

function computeDailyData(
  menus: readonly NutritionMenuData[],
  targetEnergy: number,
  targetProtein: number | null
): readonly DailyData[] {
  const sorted = [...menus].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const grouped = new Map<
    string,
    { energy: number; protein: number }
  >();

  for (const menu of sorted) {
    const dateKey = new Date(menu.createdAt).toISOString().slice(0, 10);
    const existing = grouped.get(dateKey);
    const menuProtein = menu.currentIntake?.protein ?? 0;

    if (existing) {
      grouped.set(dateKey, {
        energy: existing.energy + menu.totalEnergy,
        protein: existing.protein + menuProtein,
      });
    } else {
      grouped.set(dateKey, {
        energy: menu.totalEnergy,
        protein: menuProtein,
      });
    }
  }

  let cumulativeDebt = 0;

  return Array.from(grouped.entries()).map(([dateKey, totals]) => {
    const actualEnergy = Math.round(totals.energy);
    const actualProtein = Math.round(totals.protein);
    const deficit = actualEnergy - targetEnergy;
    cumulativeDebt = cumulativeDebt + deficit;
    const adequacyPercent =
      targetEnergy > 0
        ? Math.round((actualEnergy / targetEnergy) * 100)
        : 0;

    return {
      date: dateKey,
      dateLabel: new Date(dateKey).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
      actualEnergy,
      actualProtein,
      deficit,
      cumulativeDebt,
      adequacyPercent,
    };
  });
}

function getBarColor(adequacyPercent: number): string {
  if (adequacyPercent >= ADEQUACY_HIGH) return COLOR_GREEN;
  if (adequacyPercent >= ADEQUACY_MID) return COLOR_AMBER;
  return COLOR_RED;
}

function computeCumulativeProteinDebt(
  dailyData: readonly DailyData[],
  targetProtein: number | null
): number | null {
  if (targetProtein === null || targetProtein <= 0) return null;

  return dailyData.reduce(
    (acc, day) => acc + (day.actualProtein - targetProtein),
    0
  );
}

function computeAverageAdequacy(dailyData: readonly DailyData[]): number {
  if (dailyData.length === 0) return 0;

  const totalAdequacy = dailyData.reduce(
    (acc, day) => acc + day.adequacyPercent,
    0
  );

  return Math.round(totalAdequacy / dailyData.length);
}

/* ---- Sub-components ---- */

interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly isNegative?: boolean;
}

function StatCard({ label, value, unit, isNegative }: StatCardProps) {
  const valueClassName = isNegative === undefined
    ? styles.statValue
    : `${styles.statValue} ${isNegative ? styles.debtNegative : styles.debtPositive}`;

  return (
    <div className={styles.statItem}>
      <span className={styles.statLabel}>{label}</span>
      <span className={valueClassName}>
        {value}
        <span className={styles.statUnit}> {unit}</span>
      </span>
    </div>
  );
}

interface ChartTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly payload: DailyData;
  }>;
  readonly label?: string;
  readonly targetEnergy: number;
}

function ChartTooltip({
  active,
  payload,
  label,
  targetEnergy,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{label}</p>
      <p className={styles.tooltipRow}>
        実績: {data.actualEnergy} kcal
      </p>
      <p className={styles.tooltipRow}>
        目標: {targetEnergy} kcal
      </p>
      <p className={styles.tooltipRow}>
        差分: {data.deficit > 0 ? "+" : ""}{data.deficit} kcal
      </p>
      <p className={styles.tooltipRow}>
        充足率: {data.adequacyPercent}%
      </p>
    </div>
  );
}

/* ---- Main component ---- */

export function CaloricDebtTracker({
  menus,
  targetEnergy,
  targetProtein,
}: CaloricDebtTrackerProps) {
  const allDailyData = useMemo(() => {
    if (!targetEnergy || targetEnergy <= 0 || menus.length === 0) {
      return [];
    }
    return computeDailyData(menus, targetEnergy, targetProtein);
  }, [menus, targetEnergy, targetProtein]);

  const chartData = useMemo(
    () => allDailyData.slice(-MAX_CHART_DAYS),
    [allDailyData]
  );

  const cumulativeEnergyDebt = useMemo(() => {
    if (allDailyData.length === 0) return 0;
    return allDailyData[allDailyData.length - 1].cumulativeDebt;
  }, [allDailyData]);

  const averageAdequacy = useMemo(
    () => computeAverageAdequacy(allDailyData),
    [allDailyData]
  );

  const cumulativeProteinDebt = useMemo(
    () => computeCumulativeProteinDebt(allDailyData, targetProtein),
    [allDailyData, targetProtein]
  );

  const energyDomainMax = useMemo(() => {
    if (chartData.length === 0) return 0;
    const maxActual = Math.max(...chartData.map((d) => d.actualEnergy));
    return (
      Math.ceil((Math.max(maxActual, targetEnergy ?? 0) * 1.15) / 100) * 100
    );
  }, [chartData, targetEnergy]);

  const hasData = targetEnergy !== null && targetEnergy > 0 && menus.length > 0;

  return (
    <Card>
      <div className={styles.container}>
        <div className={styles.header}>
          <TrendingDown size={20} className={styles.headerIcon} />
          <h3 className={styles.title}>カロリー債務トラッカー</h3>
        </div>

        {!hasData ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              目標エネルギーが未設定です
            </p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className={styles.statsRow}>
              <StatCard
                label="累積エネルギー債務"
                value={`${cumulativeEnergyDebt > 0 ? "+" : ""}${cumulativeEnergyDebt}`}
                unit="kcal"
                isNegative={cumulativeEnergyDebt < 0}
              />
              <StatCard
                label="平均充足率"
                value={String(averageAdequacy)}
                unit="%"
              />
              {cumulativeProteinDebt !== null && (
                <StatCard
                  label="累積蛋白債務"
                  value={`${cumulativeProteinDebt > 0 ? "+" : ""}${cumulativeProteinDebt}`}
                  unit="g"
                  isNegative={cumulativeProteinDebt < 0}
                />
              )}
            </div>

            {/* Bar chart */}
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="dateLabel"
                    fontSize={12}
                    tick={{ fill: "var(--color-neutral-500)" }}
                  />
                  <YAxis
                    domain={[0, energyDomainMax]}
                    fontSize={12}
                    tick={{ fill: "var(--color-neutral-500)" }}
                    label={{
                      value: "kcal",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fill: "var(--color-neutral-400)",
                        fontSize: 11,
                      },
                    }}
                  />
                  <Tooltip
                    content={<ChartTooltip targetEnergy={targetEnergy} />}
                  />
                  <ReferenceLine
                    y={targetEnergy}
                    stroke="var(--color-danger)"
                    strokeDasharray="6 4"
                    label={{
                      value: `目標 ${targetEnergy} kcal`,
                      position: "right",
                      style: {
                        fill: "var(--color-danger)",
                        fontSize: 11,
                      },
                    }}
                  />
                  <Bar dataKey="actualEnergy" name="実績エネルギー" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.date}
                        fill={getBarColor(entry.adequacyPercent)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
