import { useMemo } from 'react'
import { TrendingUp, Ruler, Weight, CircleDot } from 'lucide-react'
import { Card, EmptyState } from '../../components/ui'
import { PercentileBadge } from '../../components/growth/PercentileBadge'
import { computeGrowthPercentile } from '../../services/growthPercentile'
import type { Patient } from '../../types'
import type { GrowthMeasurement } from '../../types/growthData'
import styles from './GrowthSummaryCard.module.css'

interface GrowthSummaryCardProps {
  readonly patient: Patient
  readonly measurements: readonly GrowthMeasurement[]
}

interface MeasurementDisplay {
  readonly label: string
  readonly value: string
  readonly unit: string
  readonly percentile: number | undefined
  readonly icon: React.ReactNode
}

function resolveGender(
  gender: string,
): 'male' | 'female' {
  if (gender === '女性' || gender === 'female') return 'female'
  return 'male'
}

function computeWeightVelocity(
  measurements: readonly GrowthMeasurement[],
): { readonly value: number; readonly unit: string } | undefined {
  if (measurements.length < 2) return undefined

  const sorted = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const latest = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]

  const daysDiff =
    (new Date(latest.date).getTime() - new Date(previous.date).getTime()) /
    (1000 * 60 * 60 * 24)

  if (daysDiff <= 0) return undefined

  const weightDiffG = (latest.weight - previous.weight) * 1000
  const gPerDay = Math.round((weightDiffG / daysDiff) * 10) / 10

  if (previous.weight > 0 && previous.weight < 10) {
    const gPerKgPerDay =
      Math.round((weightDiffG / daysDiff / previous.weight) * 10) / 10
    return { value: gPerKgPerDay, unit: 'g/kg/日' }
  }

  return { value: gPerDay, unit: 'g/日' }
}

function isInfant(patient: Patient): boolean {
  const ageMonths = patient.ageInMonths ?? patient.age * 12
  return ageMonths < 24
}

function buildMeasurementDisplays(
  latest: GrowthMeasurement,
  patient: Patient,
): readonly MeasurementDisplay[] {
  const gender = resolveGender(patient.gender)
  const ageMonths = patient.ageInMonths ?? patient.age * 12

  const displays: MeasurementDisplay[] = []

  // Weight
  const weightPercentile = safeComputePercentile(
    'weight',
    latest.weight,
    ageMonths,
    gender,
  )
  displays.push({
    label: '体重',
    value: latest.weight.toFixed(2),
    unit: 'kg',
    percentile: weightPercentile,
    icon: <Weight size={16} />,
  })

  // Height
  if (latest.height !== undefined && latest.height > 0) {
    const heightPercentile = safeComputePercentile(
      'height',
      latest.height,
      ageMonths,
      gender,
    )
    displays.push({
      label: '身長',
      value: latest.height.toFixed(1),
      unit: 'cm',
      percentile: heightPercentile,
      icon: <Ruler size={16} />,
    })
  }

  // Head circumference (infants only)
  if (
    isInfant(patient) &&
    latest.headCircumference !== undefined &&
    latest.headCircumference > 0
  ) {
    const hcPercentile = safeComputePercentile(
      'headCircumference',
      latest.headCircumference,
      ageMonths,
      gender,
    )
    displays.push({
      label: '頭囲',
      value: latest.headCircumference.toFixed(1),
      unit: 'cm',
      percentile: hcPercentile,
      icon: <CircleDot size={16} />,
    })
  }

  return displays
}

function safeComputePercentile(
  measurement: 'weight' | 'height' | 'headCircumference',
  value: number,
  ageMonths: number,
  gender: 'male' | 'female',
): number | undefined {
  try {
    const result = computeGrowthPercentile(
      measurement,
      value,
      ageMonths,
      gender,
    )
    return result.percentile
  } catch {
    return undefined
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function GrowthSummaryCard({
  patient,
  measurements,
}: GrowthSummaryCardProps) {
  const sorted = useMemo(
    () =>
      [...measurements].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [measurements],
  )

  const latest = sorted[0] as GrowthMeasurement | undefined

  const displays = useMemo(
    () => (latest ? buildMeasurementDisplays(latest, patient) : []),
    [latest, patient],
  )

  const velocity = useMemo(
    () => computeWeightVelocity(measurements),
    [measurements],
  )

  if (!latest) {
    return (
      <Card>
        <div className={styles.container}>
          <div className={styles.header}>
            <TrendingUp size={20} className={styles.headerIcon} />
            <h3 className={styles.title}>成長モニタリング</h3>
          </div>
          <EmptyState
            icon={<TrendingUp size={32} />}
            title="成長データがありません"
            description="成長記録を追加して、成長曲線を確認しましょう"
          />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className={styles.container}>
        <div className={styles.header}>
          <TrendingUp size={20} className={styles.headerIcon} />
          <h3 className={styles.title}>成長モニタリング</h3>
          <a href={`/patients/${patient.id}/growth`} className={styles.detailLink}>
            詳細
          </a>
        </div>

        <span className={styles.dateLabel}>
          最終測定日: {formatDate(latest.date)}
        </span>

        <div className={styles.measurementGrid}>
          {displays.map((item) => (
            <div key={item.label} className={styles.measurementItem}>
              <div className={styles.measurementHeader}>
                <span className={styles.measurementIcon}>{item.icon}</span>
                <span className={styles.measurementLabel}>{item.label}</span>
              </div>
              <div className={styles.measurementValueRow}>
                <span className={styles.measurementValue}>
                  {item.value}
                  <span className={styles.measurementUnit}> {item.unit}</span>
                </span>
                {item.percentile !== undefined && (
                  <PercentileBadge value={item.percentile} />
                )}
              </div>
            </div>
          ))}
        </div>

        {velocity && (
          <>
            <hr className={styles.divider} />
            <div className={styles.velocitySection}>
              <span className={styles.velocityLabel}>体重増加速度</span>
              <span
                className={[
                  styles.velocityValue,
                  velocity.value >= 0
                    ? styles.velocityPositive
                    : styles.velocityNegative,
                ].join(' ')}
              >
                {velocity.value > 0 ? '+' : ''}
                {velocity.value} {velocity.unit}
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
