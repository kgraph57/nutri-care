import { useMemo } from 'react'
import type { WeaningProgress } from '../../types/weaningPlan'
import styles from './WeaningProgressCard.module.css'

/* ---- Props ---- */

interface WeaningProgressCardProps {
  readonly progress: WeaningProgress
  readonly currentPhaseLabel: string
}

/* ---- Constants ---- */

const RING_SIZE = 96
const RING_STROKE = 8
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/* ---- Helpers ---- */

function getProgressPercent(progress: WeaningProgress): number {
  const { completedPhases, totalPhases } = progress
  if (totalPhases <= 0) return 0
  return Math.round((completedPhases / totalPhases) * 100)
}

function getColorClass(percent: number): string {
  if (percent >= 75) return styles.colorGreen
  if (percent >= 50) return styles.colorYellow
  if (percent >= 25) return styles.colorBlue
  return styles.colorGrey
}

function computeStrokeDashoffset(percent: number): number {
  const clamped = Math.min(Math.max(percent, 0), 100)
  return RING_CIRCUMFERENCE * (1 - clamped / 100)
}

/* ---- Component ---- */

export function WeaningProgressCard({
  progress,
  currentPhaseLabel,
}: WeaningProgressCardProps) {
  const percent = useMemo(() => getProgressPercent(progress), [progress])
  const dashOffset = useMemo(() => computeStrokeDashoffset(percent), [percent])
  const colorClass = useMemo(() => getColorClass(percent), [percent])

  const totalDays = progress.daysElapsed + progress.daysRemaining

  return (
    <div className={styles.container}>
      {/* Circular progress ring */}
      <div className={styles.progressRing}>
        <svg
          className={styles.progressRingSvg}
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          aria-hidden="true"
        >
          <circle
            className={styles.trackCircle}
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
          />
          <circle
            className={`${styles.fillCircle} ${colorClass}`}
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className={styles.centerLabel}>
          <span className={styles.percentValue}>
            {percent}
            <span className={styles.percentSymbol}>%</span>
          </span>
        </div>
      </div>

      {/* Phase name */}
      <span className={styles.phaseLabel}>{currentPhaseLabel}</span>

      {/* Days elapsed / total */}
      <div className={styles.daysRow}>
        <span className={styles.daysElapsed}>{progress.daysElapsed}日目</span>
        <span className={styles.daysSeparator}>/</span>
        <span>全{totalDays}日</span>
      </div>
    </div>
  )
}
