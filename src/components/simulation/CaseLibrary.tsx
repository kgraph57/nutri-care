import { useState, useMemo } from 'react'
import { CheckCircle, Target, Filter, Trophy } from 'lucide-react'
import { Card } from '../ui'
import type { SimulationCase, Difficulty, SimulationProgress } from '../../types/simulation'
import styles from './CaseLibrary.module.css'

interface CaseLibraryProps {
  readonly cases: readonly SimulationCase[]
  readonly progress: SimulationProgress
  readonly onSelectCase: (caseItem: SimulationCase) => void
}

type DifficultyFilter = 'all' | Difficulty

const DIFFICULTY_LABELS: Readonly<Record<DifficultyFilter, string>> = {
  all: '全て',
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
}

const DIFFICULTY_BADGE_STYLES: Readonly<Record<Difficulty, string>> = {
  beginner: styles.badgeBeginner,
  intermediate: styles.badgeIntermediate,
  advanced: styles.badgeAdvanced,
}

function extractCategories(cases: readonly SimulationCase[]): readonly string[] {
  const categories = new Set(cases.map((c) => c.category))
  return Array.from(categories).sort()
}

export function CaseLibrary({ cases, progress, onSelectCase }: CaseLibraryProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = useMemo(() => extractCategories(cases), [cases])

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesDifficulty = difficultyFilter === 'all' || c.difficulty === difficultyFilter
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter
      return matchesDifficulty && matchesCategory
    })
  }, [cases, difficultyFilter, categoryFilter])

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.difficultyTabs}>
          {(Object.keys(DIFFICULTY_LABELS) as DifficultyFilter[]).map((key) => (
            <button
              key={key}
              className={[
                styles.difficultyTab,
                difficultyFilter === key ? styles.difficultyTabActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setDifficultyFilter(key)}
              type="button"
            >
              {DIFFICULTY_LABELS[key]}
            </button>
          ))}
        </div>

        <select
          className={styles.categorySelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">
            <Filter size={14} />
            全カテゴリ
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filteredCases.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Filter size={40} />
          </div>
          <h3 className={styles.emptyTitle}>該当する症例がありません</h3>
          <p className={styles.emptyText}>フィルターを変更してください</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCases.map((caseItem) => {
            const isCompleted = Boolean(progress.completedCases[caseItem.id])
            const bestScore = progress.bestScores[caseItem.id]

            return (
              <Card
                key={caseItem.id}
                className={styles.caseCard}
                onClick={() => onSelectCase(caseItem)}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{caseItem.title}</h3>
                  {isCompleted && (
                    <CheckCircle size={20} className={styles.completedIcon} />
                  )}
                </div>

                <div className={styles.badgeRow}>
                  <span
                    className={`${styles.difficultyBadge} ${DIFFICULTY_BADGE_STYLES[caseItem.difficulty]}`}
                  >
                    {DIFFICULTY_LABELS[caseItem.difficulty]}
                  </span>
                  <span className={styles.categoryBadge}>{caseItem.category}</span>
                </div>

                <p className={styles.patientSummary}>
                  {caseItem.patient.age}歳 {caseItem.patient.gender}
                  {' '}
                  {caseItem.patient.weight}kg
                  {' - '}
                  {caseItem.patient.diagnosis.length > 30
                    ? `${caseItem.patient.diagnosis.slice(0, 30)}...`
                    : caseItem.patient.diagnosis}
                </p>

                <div className={styles.objectiveCount}>
                  <Target size={14} />
                  <span>学習目標: {caseItem.objectives.length}項目</span>
                </div>

                {bestScore !== undefined && bestScore > 0 && (
                  <div className={styles.bestScore}>
                    <Trophy size={14} />
                    <span>最高スコア: {bestScore}点</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
