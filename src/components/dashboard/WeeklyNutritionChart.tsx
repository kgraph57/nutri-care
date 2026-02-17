import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { NutritionMenuData } from "../../hooks/useNutritionMenus";
import styles from "./WeeklyNutritionChart.module.css";

interface WeeklyNutritionChartProps {
  readonly menus: readonly NutritionMenuData[];
}

interface DayData {
  readonly day: string;
  readonly energy: number;
  readonly menuCount: number;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

export function WeeklyNutritionChart({ menus }: WeeklyNutritionChartProps) {
  const data = useMemo((): DayData[] => {
    const last7 = getLast7Days();
    const menusByDay = new Map<string, NutritionMenuData[]>();

    for (const menu of menus) {
      const day = menu.createdAt.slice(0, 10);
      if (!menusByDay.has(day)) {
        menusByDay.set(day, []);
      }
      menusByDay.get(day)!.push(menu);
    }

    return last7.map((day) => {
      const dayMenus = menusByDay.get(day) ?? [];
      const totalEnergy = dayMenus.reduce((sum, m) => sum + m.totalEnergy, 0);
      return {
        day: formatDayLabel(day),
        energy: Math.round(totalEnergy),
        menuCount: dayMenus.length,
      };
    });
  }, [menus]);

  const hasData = data.some((d) => d.energy > 0);

  if (!hasData) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          直近7日間のメニュー作成データがありません
        </div>
      </div>
    );
  }

  const avgEnergy = Math.round(
    data.reduce((s, d) => s + d.energy, 0) /
      Math.max(data.filter((d) => d.energy > 0).length, 1),
  );

  return (
    <div className={styles.container}>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "var(--color-neutral-500)" }}
              axisLine={{ stroke: "var(--color-neutral-300)" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-neutral-500)" }}
              axisLine={{ stroke: "var(--color-neutral-300)" }}
              unit=" kcal"
            />
            <Tooltip
              formatter={(value: number) => [`${value} kcal`, "エネルギー"]}
              labelStyle={{ color: "var(--color-neutral-700)" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--color-neutral-200)",
                fontSize: 13,
              }}
            />
            <ReferenceLine
              y={avgEnergy}
              stroke="var(--color-primary-400)"
              strokeDasharray="4 4"
              label={{
                value: `平均 ${avgEnergy} kcal`,
                position: "insideTopRight",
                fill: "var(--color-primary-500)",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="energy"
              fill="var(--color-primary-500)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ background: "var(--color-primary-500)" }}
          />
          <span>日別合計エネルギー</span>
        </div>
        <div className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{
              background: "var(--color-primary-400)",
              borderRadius: 0,
              height: 2,
              width: 14,
            }}
          />
          <span>平均値</span>
        </div>
      </div>
    </div>
  );
}
