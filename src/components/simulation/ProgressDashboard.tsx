import type { SimulationCase, SimulationProgress } from '../../types/simulation'
import styles from './ProgressDashboard.module.css'

interface ProgressDashboardProps {
  readonly cases: readonly SimulationCase[]
  readonly progress: SimulationProgress
}

function countByDifficulty(
  cases: readonly SimulationCase[],
  difficulty: string,
): number {
  return cases.filter((c) => c.difficulty === difficulty).length
}

function countCompletedByDifficulty(
  cases: readonly SimulationCase[],
  progress: SimulationProgress,
  difficulty: string,
): number {
  return cases.filter(
    (c) => c.difficulty === difficulty && progress.completedCases[c.id],
  ).length
}

export function ProgressDashboard({ cases, progress }: ProgressDashboardProps) {
  const totalCompleted = Object.keys(progress.completedCases).length
  const totalCases = cases.length

  const difficultyLevels = [
    { key: 'beginner', label: '初級', cssClass: styles.progressFillBeginner },
    { key: 'intermediate', label: '中級', cssClass: styles.progressFillIntermediate },
    { key: 'advanced', label: '上級', cssClass: styles.progressFillAdvanced },
  ] as const

  return (
    <div className={styles.dashboard}>
      <div className={styles.statItem}>
        <span className={styles.statValue}>
          {totalCompleted}/{totalCases}
        </span>
        <span className={styles.statLabel}>完了ケース</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.statItem}>
        <span className={styles.statValue}>
          {progress.averageScore > 0 ? Math.round(progress.averageScore) : '-'}
        </span>
        <span className={styles.statLabel}>平均スコア</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.progressBars}>
        {difficultyLevels.map((level) => {
          const total = countByDifficulty(cases, level.key)
          const completed = countCompletedByDifficulty(cases, progress, level.key)
          const percentage = total > 0 ? (completed / total) * 100 : 0

          return (
            <div key={level.key} className={styles.progressRow}>
              <span className={styles.progressLabel}>{level.label}</span>
              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${level.cssClass}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={styles.progressCount}>
                {completed}/{total}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
