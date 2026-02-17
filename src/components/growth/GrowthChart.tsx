import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  CartesianGrid,
} from 'recharts'
import { generateReferenceCurve, computeGrowthPercentile } from '../../services/growthPercentile'
import type { Patient } from '../../types'
import type { GrowthMeasurement } from '../../types/growthData'
import styles from './GrowthChart.module.css'

/* ---- Types ---- */

type MeasureType = 'weight' | 'height' | 'headCircumference'
type GenderLabel = '男性' | '女性'

interface GrowthChartProps {
  readonly patient: Patient
  readonly measurements: readonly GrowthMeasurement[]
  readonly measureType: MeasureType
  readonly gender: GenderLabel
}

interface ChartDataPoint {
  readonly ageMonths: number
  readonly p3?: number
  readonly p10?: number
  readonly p25?: number
  readonly p50?: number
  readonly p75?: number
  readonly p90?: number
  readonly p97?: number
  readonly patientValue?: number
  readonly patientDate?: string
  readonly patientPercentile?: number
}

/* ---- Constants ---- */

const MEASURE_LABELS: Record<MeasureType, string> = {
  weight: '体重 (kg)',
  height: '身長 (cm)',
  headCircumference: '頭囲 (cm)',
}

const MEASURE_TITLES: Record<MeasureType, string> = {
  weight: '体重別年齢曲線',
  height: '身長別年齢曲線',
  headCircumference: '頭囲別年齢曲線',
}

const PERCENTILE_KEYS = [3, 10, 25, 50, 75, 90, 97] as const

const PERCENTILE_LINE_CONFIG: Record<
  number,
  { readonly strokeWidth: number; readonly strokeDasharray?: string; readonly opacity: number }
> = {
  3: { strokeWidth: 1, strokeDasharray: '4 3', opacity: 0.5 },
  10: { strokeWidth: 1, strokeDasharray: '6 3', opacity: 0.6 },
  25: { strokeWidth: 1, opacity: 0.7 },
  50: { strokeWidth: 2, opacity: 1 },
  75: { strokeWidth: 1, opacity: 0.7 },
  90: { strokeWidth: 1, strokeDasharray: '6 3', opacity: 0.6 },
  97: { strokeWidth: 1, strokeDasharray: '4 3', opacity: 0.5 },
}

/* ---- Helpers ---- */

function resolveGender(label: GenderLabel): 'male' | 'female' {
  return label === '女性' ? 'female' : 'male'
}

function getGenderColor(label: GenderLabel): string {
  return label === '女性' ? '#e91e8c' : '#2563eb'
}

function getReferenceColor(label: GenderLabel): string {
  return label === '女性' ? '#f9a8d4' : '#93c5fd'
}

function getPatientAgeMonths(
  patient: Patient,
  measurementDate: string,
): number {
  if (patient.birthDate) {
    const birth = new Date(patient.birthDate)
    const measure = new Date(measurementDate)
    const diffMs = measure.getTime() - birth.getTime()
    const months = diffMs / (1000 * 60 * 60 * 24 * 30.4375)
    return Math.round(months * 10) / 10
  }

  return patient.ageInMonths ?? patient.age * 12
}

function getMeasurementValue(
  m: GrowthMeasurement,
  measureType: MeasureType,
): number | undefined {
  switch (measureType) {
    case 'weight':
      return m.weight
    case 'height':
      return m.height
    case 'headCircumference':
      return m.headCircumference
  }
}

function computeMaxAge(
  measurements: readonly GrowthMeasurement[],
  patient: Patient,
  measureType: MeasureType,
): number {
  if (measurements.length === 0) {
    const baseAge = patient.ageInMonths ?? patient.age * 12
    return Math.max(24, Math.ceil(baseAge / 12) * 12 + 6)
  }

  const ages = measurements
    .filter((m) => getMeasurementValue(m, measureType) !== undefined)
    .map((m) => getPatientAgeMonths(patient, m.date))

  const maxPatientAge = Math.max(...ages, 0)
  const ceilToYear = Math.ceil(maxPatientAge / 12) * 12

  if (measureType === 'headCircumference') {
    return Math.min(60, Math.max(24, ceilToYear + 6))
  }

  return Math.max(24, ceilToYear + 6)
}

function formatAgeLabel(ageMonths: number): string {
  if (ageMonths < 24) return `${ageMonths}ヶ月`
  const years = Math.floor(ageMonths / 12)
  const remainder = ageMonths % 12
  return remainder === 0 ? `${years}歳` : `${years}歳${remainder}ヶ月`
}

function safeComputePercentile(
  measureType: MeasureType,
  value: number,
  ageMonths: number,
  gender: 'male' | 'female',
): number | undefined {
  try {
    return computeGrowthPercentile(measureType, value, ageMonths, gender)
      .percentile
  } catch {
    return undefined
  }
}

function buildChartData(
  referenceCurves: Record<
    number,
    readonly { readonly ageMonths: number; readonly value: number }[]
  >,
  patientPoints: readonly {
    readonly ageMonths: number
    readonly value: number
    readonly date: string
    readonly percentile?: number
  }[],
  maxAge: number,
): readonly ChartDataPoint[] {
  const ageMap = new Map<number, ChartDataPoint>()

  for (const p of PERCENTILE_KEYS) {
    const curve = referenceCurves[p] ?? []
    for (const point of curve) {
      if (point.ageMonths > maxAge) continue
      const existing = ageMap.get(point.ageMonths)
      const updated: ChartDataPoint = {
        ...(existing ?? { ageMonths: point.ageMonths }),
        [`p${p}`]: point.value,
      }
      ageMap.set(point.ageMonths, updated)
    }
  }

  for (const pp of patientPoints) {
    const roundedAge = Math.round(pp.ageMonths)
    const existing = ageMap.get(roundedAge)
    const updated: ChartDataPoint = {
      ...(existing ?? { ageMonths: roundedAge }),
      patientValue: pp.value,
      patientDate: pp.date,
      patientPercentile: pp.percentile,
    }
    ageMap.set(roundedAge, updated)
  }

  return Array.from(ageMap.values()).sort(
    (a, b) => a.ageMonths - b.ageMonths,
  )
}

/* ---- Tooltip ---- */

function GrowthChartTooltip({
  active,
  payload,
}: {
  readonly active?: boolean
  readonly payload?: ReadonlyArray<{
    readonly name: string
    readonly value: number
    readonly payload: ChartDataPoint
  }>
}) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  const hasPatient = data.patientValue !== undefined

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipAge}>
        {formatAgeLabel(data.ageMonths)}
      </p>
      {hasPatient && (
        <>
          {data.patientDate && (
            <p className={styles.tooltipRow}>
              日付: {new Date(data.patientDate).toLocaleDateString('ja-JP')}
            </p>
          )}
          <p className={styles.tooltipRow}>
            実測値: <strong>{data.patientValue}</strong>
          </p>
          {data.patientPercentile !== undefined && (
            <p className={styles.tooltipRow}>
              パーセンタイル: <strong>{data.patientPercentile}%ile</strong>
            </p>
          )}
        </>
      )}
      {data.p50 !== undefined && (
        <p className={styles.tooltipRow}>
          50th (中央値): {data.p50}
        </p>
      )}
    </div>
  )
}

/* ---- Main Component ---- */

export function GrowthChart({
  patient,
  measurements,
  measureType,
  gender,
}: GrowthChartProps) {
  const resolvedGender = resolveGender(gender)
  const genderColor = getGenderColor(gender)
  const refColor = getReferenceColor(gender)

  const maxAge = useMemo(
    () => computeMaxAge(measurements, patient, measureType),
    [measurements, patient, measureType],
  )

  const referenceCurves = useMemo(
    () => generateReferenceCurve(measureType, resolvedGender, 'who', maxAge),
    [measureType, resolvedGender, maxAge],
  )

  const patientPoints = useMemo(() => {
    return measurements
      .map((m) => {
        const value = getMeasurementValue(m, measureType)
        if (value === undefined || value <= 0) return undefined

        const ageMonths = getPatientAgeMonths(patient, m.date)
        const percentile = safeComputePercentile(
          measureType,
          value,
          ageMonths,
          resolvedGender,
        )

        return {
          ageMonths,
          value,
          date: m.date,
          percentile,
        } as const
      })
      .filter(
        (p): p is NonNullable<typeof p> => p !== undefined,
      )
      .sort((a, b) => a.ageMonths - b.ageMonths)
  }, [measurements, measureType, patient, resolvedGender])

  const chartData = useMemo(
    () => buildChartData(referenceCurves, patientPoints, maxAge),
    [referenceCurves, patientPoints, maxAge],
  )

  const yDomain = useMemo(() => {
    const allValues: number[] = []

    for (const point of chartData) {
      if (point.p3 !== undefined) allValues.push(point.p3)
      if (point.p97 !== undefined) allValues.push(point.p97)
      if (point.patientValue !== undefined)
        allValues.push(point.patientValue)
    }

    if (allValues.length === 0) return [0, 100] as const

    const min = Math.floor(Math.min(...allValues) * 0.9)
    const max = Math.ceil(Math.max(...allValues) * 1.05)
    return [Math.max(0, min), max] as const
  }, [chartData])

  const xTickInterval = useMemo(() => {
    if (maxAge <= 24) return 3
    if (maxAge <= 60) return 6
    return 12
  }, [maxAge])

  const xTicks = useMemo(() => {
    const ticks: number[] = []
    for (let i = 0; i <= maxAge; i += xTickInterval) {
      ticks.push(i)
    }
    return ticks
  }, [maxAge, xTickInterval])

  if (patientPoints.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{MEASURE_TITLES[measureType]}</h3>
        <p className={styles.emptyText}>
          {measureType === 'headCircumference'
            ? '頭囲データがありません'
            : measureType === 'height'
              ? '身長データがありません'
              : '体重データがありません'}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>{MEASURE_TITLES[measureType]}</h3>
        <span
          className={styles.genderBadge}
          style={{ color: genderColor }}
        >
          {gender === '女性' ? '女児' : '男児'}
        </span>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={chartData as ChartDataPoint[]}
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-neutral-200)"
            />

            <XAxis
              dataKey="ageMonths"
              type="number"
              domain={[0, maxAge]}
              ticks={xTicks}
              tickFormatter={(v: number) =>
                v < 24 ? `${v}m` : `${Math.floor(v / 12)}y`
              }
              fontSize={11}
              tick={{ fill: 'var(--color-neutral-500)' }}
              label={{
                value: '月齢',
                position: 'insideBottomRight',
                offset: -4,
                style: {
                  fill: 'var(--color-neutral-400)',
                  fontSize: 11,
                },
              }}
            />

            <YAxis
              domain={yDomain as [number, number]}
              fontSize={11}
              tick={{ fill: 'var(--color-neutral-500)' }}
              label={{
                value: MEASURE_LABELS[measureType],
                angle: -90,
                position: 'insideLeft',
                style: {
                  fill: 'var(--color-neutral-400)',
                  fontSize: 11,
                },
              }}
            />

            <Tooltip content={<GrowthChartTooltip />} />

            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />

            {/* Shaded band between p3 and p97 */}
            <Area
              dataKey="p97"
              stroke="none"
              fill={refColor}
              fillOpacity={0.1}
              name="3rd-97th 範囲"
              legendType="none"
              isAnimationActive={false}
            />

            {/* Reference percentile lines */}
            {PERCENTILE_KEYS.map((p) => {
              const config = PERCENTILE_LINE_CONFIG[p]
              return (
                <Line
                  key={`p${p}`}
                  dataKey={`p${p}`}
                  name={`${p}th`}
                  type="monotone"
                  stroke={refColor}
                  strokeWidth={config.strokeWidth}
                  strokeDasharray={config.strokeDasharray}
                  strokeOpacity={config.opacity}
                  dot={false}
                  activeDot={false}
                  connectNulls
                  legendType={p === 50 ? 'line' : 'none'}
                  isAnimationActive={false}
                />
              )
            })}

            {/* Patient data */}
            <Line
              dataKey="patientValue"
              name="患者データ"
              type="monotone"
              stroke={genderColor}
              strokeWidth={2.5}
              dot={{
                r: 5,
                fill: genderColor,
                stroke: '#fff',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: genderColor,
                stroke: '#fff',
                strokeWidth: 2,
              }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legendFooter}>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ backgroundColor: refColor }}
          />
          WHO基準曲線 (3rd-97th)
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ backgroundColor: genderColor }}
          />
          患者データ
        </span>
      </div>
    </div>
  )
}
