import { Calculator, Droplets, Atom } from 'lucide-react'
import { Card, ProgressBar } from '../../components/ui'
import type { NutritionRequirements } from '../../types'
import styles from './NutritionAnalysisPanel.module.css'

interface NutritionAnalysisPanelProps {
  readonly requirements: NutritionRequirements | null
  readonly currentIntake: Record<string, number>
  readonly totalVolume: number
}

function roundValue(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

function MacroNutrients({
  requirements,
  intake,
}: {
  readonly requirements: NutritionRequirements
  readonly intake: Record<string, number>
}) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>主要栄養素</h4>
      <div className={styles.progressList}>
        <ProgressBar
          current={roundValue(intake['energy'] ?? 0, 0)}
          max={requirements.energy}
          label="エネルギー"
          unit="kcal/日"
          showPercentage
        />
        <ProgressBar
          current={roundValue(intake['protein'] ?? 0)}
          max={requirements.protein}
          label="タンパク質"
          unit="g/日"
          showPercentage
        />
        <ProgressBar
          current={roundValue(intake['fat'] ?? 0)}
          max={requirements.fat}
          label="脂質"
          unit="g/日"
          showPercentage
        />
        <ProgressBar
          current={roundValue(intake['carbs'] ?? 0)}
          max={requirements.carbs}
          label="炭水化物"
          unit="g/日"
          showPercentage
        />
      </div>
    </div>
  )
}

function Electrolytes({
  requirements,
  intake,
}: {
  readonly requirements: NutritionRequirements
  readonly intake: Record<string, number>
}) {
  const electrolytes = [
    { key: 'sodium', label: 'Na', unit: 'mEq/日', reqKey: 'sodium' as const },
    { key: 'potassium', label: 'K', unit: 'mEq/日', reqKey: 'potassium' as const },
    { key: 'calcium', label: 'Ca', unit: 'mEq/日', reqKey: 'calcium' as const },
    { key: 'magnesium', label: 'Mg', unit: 'mEq/日', reqKey: 'magnesium' as const },
    { key: 'phosphorus', label: 'P', unit: 'mEq/日', reqKey: 'phosphorus' as const },
    { key: 'chloride', label: 'Cl', unit: 'mEq/日', reqKey: 'chloride' as const },
  ] as const

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>
        <Droplets size={14} />
        電解質
      </h4>
      <div className={styles.progressList}>
        {electrolytes.map((item) => (
          <ProgressBar
            key={item.key}
            current={roundValue(intake[item.key] ?? 0)}
            max={requirements[item.reqKey]}
            label={item.label}
            unit={item.unit}
            showPercentage
          />
        ))}
      </div>
    </div>
  )
}

function TraceElements({
  requirements,
  intake,
}: {
  readonly requirements: NutritionRequirements
  readonly intake: Record<string, number>
}) {
  const traceElements = [
    { key: 'iron', label: 'Fe', unit: 'mg/日', reqKey: 'iron' as const },
    { key: 'zinc', label: 'Zn', unit: 'mg/日', reqKey: 'zinc' as const },
    { key: 'copper', label: 'Cu', unit: 'mg/日', reqKey: 'copper' as const },
    { key: 'manganese', label: 'Mn', unit: 'mg/日', reqKey: 'manganese' as const },
    { key: 'iodine', label: 'I', unit: 'μg/日', reqKey: 'iodine' as const },
    { key: 'selenium', label: 'Se', unit: 'μg/日', reqKey: 'selenium' as const },
  ] as const

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>
        <Atom size={14} />
        微量元素
      </h4>
      <div className={styles.traceGrid}>
        {traceElements.map((item) => (
          <ProgressBar
            key={item.key}
            current={roundValue(intake[item.key] ?? 0, 2)}
            max={requirements[item.reqKey]}
            label={item.label}
            unit={item.unit}
            showPercentage
          />
        ))}
      </div>
    </div>
  )
}

export function NutritionAnalysisPanel({
  requirements,
  currentIntake,
  totalVolume,
}: NutritionAnalysisPanelProps) {
  if (!requirements) {
    return (
      <Card className={styles.card}>
        <h3 className={styles.heading}>
          <Calculator size={18} />
          リアルタイム栄養分析
        </h3>
        <p className={styles.placeholder}>
          患者を選択してください
        </p>
      </Card>
    )
  }

  return (
    <Card className={styles.card}>
      <h3 className={styles.heading}>
        <Calculator size={18} />
        リアルタイム栄養分析
      </h3>

      <MacroNutrients requirements={requirements} intake={currentIntake} />
      <Electrolytes requirements={requirements} intake={currentIntake} />
      <TraceElements requirements={requirements} intake={currentIntake} />

      <div className={styles.volumeSummary}>
        総容量: {Math.round(totalVolume)} ml/日
      </div>
    </Card>
  )
}
