import { useState, useMemo } from 'react'
import { ProgressBar } from '../../components/ui/ProgressBar'
import type { AdequacyBreakdown, NutrientDetail } from '../../services/adequacyScorer'
import styles from './NutrientAdequacyGrid.module.css'

interface NutrientAdequacyGridProps {
  readonly adequacy: AdequacyBreakdown
}

const MACRO_KEYS = ['energy', 'protein', 'fat', 'carbs'] as const
const ELECTROLYTE_KEYS = ['sodium', 'potassium', 'calcium', 'magnesium', 'phosphorus', 'chloride'] as const
const TRACE_KEYS = ['iron', 'zinc', 'copper', 'manganese', 'iodine', 'selenium'] as const
const KEY_NUTRIENTS = ['energy', 'protein', 'potassium', 'phosphorus', 'sodium'] as const

interface NutrientSection {
  readonly title: string
  readonly nutrients: readonly NutrientDetail[]
}

function isKeyNutrient(nutrient: string): boolean {
  return (KEY_NUTRIENTS as readonly string[]).includes(nutrient)
}

function groupNutrientsBySection(
  details: readonly NutrientDetail[],
): readonly NutrientSection[] {
  const detailMap = new Map<string, NutrientDetail>()
  for (const d of details) {
    detailMap.set(d.nutrient, d)
  }

  const collectByKeys = (keys: readonly string[]): readonly NutrientDetail[] =>
    keys
      .map((key) => detailMap.get(key))
      .filter((d): d is NutrientDetail => d !== undefined)

  return [
    { title: 'マクロ栄養素', nutrients: collectByKeys(MACRO_KEYS) },
    { title: '電解質', nutrients: collectByKeys(ELECTROLYTE_KEYS) },
    { title: '微量元素', nutrients: collectByKeys(TRACE_KEYS) },
  ]
}

function NutrientBar({ detail }: { readonly detail: NutrientDetail }) {
  return (
    <ProgressBar
      current={detail.current}
      max={detail.target}
      label={detail.label}
      showPercentage
    />
  )
}

function SectionGroup({ section }: { readonly section: NutrientSection }) {
  if (section.nutrients.length === 0) {
    return null
  }

  return (
    <div className={styles.sectionGroup}>
      <h4 className={styles.sectionHeader}>{section.title}</h4>
      <div className={styles.nutrientList}>
        {section.nutrients.map((detail) => (
          <NutrientBar key={detail.nutrient} detail={detail} />
        ))}
      </div>
    </div>
  )
}

function KeyNutrientSection({
  sections,
}: {
  readonly sections: readonly NutrientSection[]
}) {
  const keyNutrients = useMemo(() => {
    const all = sections.flatMap((s) => s.nutrients)
    return all.filter((d) => isKeyNutrient(d.nutrient))
  }, [sections])

  if (keyNutrients.length === 0) {
    return null
  }

  return (
    <div className={styles.sectionGroup}>
      <h4 className={styles.sectionHeader}>主要栄養素</h4>
      <div className={styles.nutrientList}>
        {keyNutrients.map((detail) => (
          <NutrientBar key={detail.nutrient} detail={detail} />
        ))}
      </div>
    </div>
  )
}

export function NutrientAdequacyGrid({ adequacy }: NutrientAdequacyGridProps) {
  const [showAll, setShowAll] = useState(false)

  const sections = useMemo(
    () => groupNutrientsBySection(adequacy.details),
    [adequacy.details],
  )

  const handleToggle = () => {
    setShowAll((prev) => !prev)
  }

  return (
    <div className={styles.grid}>
      <KeyNutrientSection sections={sections} />

      {showAll &&
        sections.map((section) => (
          <SectionGroup key={section.title} section={section} />
        ))}

      <div className={styles.toggleWrapper}>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleToggle}
        >
          {showAll ? '閉じる' : 'すべて表示'}
        </button>
      </div>
    </div>
  )
}
