import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { NutritionMenuData } from '../../hooks/useNutritionMenus'
import styles from './NutritionTrendChart.module.css'

interface NutritionTrendChartProps {
  readonly menus: readonly NutritionMenuData[]
  readonly targetEnergy?: number
}

interface DailyDataPoint {
  date: string
  dateLabel: string
  energy: number
  protein: number
}

function aggregateByDate(
  menus: readonly NutritionMenuData[]
): DailyDataPoint[] {
  const sorted = [...menus].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const grouped = new Map<string, { energy: number; protein: number }>()

  for (const menu of sorted) {
    const dateKey = new Date(menu.createdAt).toISOString().slice(0, 10)
    const existing = grouped.get(dateKey)
    if (existing) {
      grouped.set(dateKey, {
        energy: existing.energy + menu.totalEnergy,
        protein: existing.protein + (menu.currentIntake?.protein ?? 0),
      })
    } else {
      grouped.set(dateKey, {
        energy: menu.totalEnergy,
        protein: menu.currentIntake?.protein ?? 0,
      })
    }
  }

  return Array.from(grouped.entries()).map(([dateKey, totals]) => ({
    date: dateKey,
    dateLabel: new Date(dateKey).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    }),
    energy: Math.round(totals.energy),
    protein: Math.round(totals.protein),
  }))
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  readonly active?: boolean
  readonly payload?: ReadonlyArray<{
    readonly name: string
    readonly value: number
    readonly color: string
  }>
  readonly label?: string
}) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className={styles.tooltipRow}>
          <span
            className={styles.tooltipDot}
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <strong>{entry.value}</strong>
          {entry.name === 'エネルギー' ? ' kcal' : ' g'}
        </p>
      ))}
    </div>
  )
}

export function NutritionTrendChart({
  menus,
  targetEnergy,
}: NutritionTrendChartProps) {
  const data = useMemo(() => aggregateByDate(menus), [menus])

  if (data.length < 2) {
    return null
  }

  const maxEnergy = Math.max(...data.map((d) => d.energy))
  const energyDomainMax = Math.ceil(
    Math.max(maxEnergy, targetEnergy ?? 0) * 1.15 / 100
  ) * 100

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>栄養推移</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-neutral-200)"
            />
            <XAxis
              dataKey="dateLabel"
              fontSize={12}
              tick={{ fill: 'var(--color-neutral-500)' }}
            />
            <YAxis
              yAxisId="energy"
              domain={[0, energyDomainMax]}
              fontSize={12}
              tick={{ fill: 'var(--color-neutral-500)' }}
              label={{
                value: 'kcal',
                angle: -90,
                position: 'insideLeft',
                style: {
                  fill: 'var(--color-neutral-400)',
                  fontSize: 11,
                },
              }}
            />
            <YAxis
              yAxisId="protein"
              orientation="right"
              fontSize={12}
              tick={{ fill: 'var(--color-neutral-500)' }}
              label={{
                value: 'g',
                angle: 90,
                position: 'insideRight',
                style: {
                  fill: 'var(--color-neutral-400)',
                  fontSize: 11,
                },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            {targetEnergy && targetEnergy > 0 && (
              <ReferenceLine
                yAxisId="energy"
                y={targetEnergy}
                stroke="var(--color-danger)"
                strokeDasharray="6 4"
                label={{
                  value: `目標 ${targetEnergy} kcal`,
                  position: 'right',
                  style: {
                    fill: 'var(--color-danger)',
                    fontSize: 11,
                  },
                }}
              />
            )}
            <Line
              yAxisId="energy"
              type="monotone"
              dataKey="energy"
              name="エネルギー"
              stroke="var(--color-primary-500)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--color-primary-500)' }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="protein"
              type="monotone"
              dataKey="protein"
              name="蛋白質"
              stroke="var(--color-warning)"
              strokeWidth={2}
              dot={{ r: 3.5, fill: 'var(--color-warning)' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
