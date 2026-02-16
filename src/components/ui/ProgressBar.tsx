import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  readonly current: number
  readonly max: number
  readonly label?: string
  readonly unit?: string
  readonly showPercentage?: boolean
}

function getColorClass(percentage: number): {
  fill: string
  text: string
} {
  if (percentage < 50) {
    return { fill: styles.fillDanger, text: styles.percentageDanger }
  }
  if (percentage < 90) {
    return { fill: styles.fillWarning, text: styles.percentageWarning }
  }
  if (percentage <= 110) {
    return { fill: styles.fillSuccess, text: styles.percentageSuccess }
  }
  return { fill: styles.fillDanger, text: styles.percentageDanger }
}

export function ProgressBar({
  current,
  max,
  label,
  unit,
  showPercentage = true,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1
  const percentage = Math.round((current / safeMax) * 100)
  const clampedWidth = Math.min(Math.max(percentage, 0), 100)
  const colorClass = getColorClass(percentage)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {label && <span className={styles.label}>{label}</span>}
        <div className={styles.values}>
          <span>
            {current}
            {unit ? ` ${unit}` : ''} / {max}
            {unit ? ` ${unit}` : ''}
          </span>
          {showPercentage && (
            <span className={`${styles.percentage} ${colorClass.text}`}>
              {' '}
              ({percentage}%)
            </span>
          )}
        </div>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${colorClass.fill}`}
          style={{ width: `${clampedWidth}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  )
}
