import { Settings } from 'lucide-react'
import { Card } from '../../components/ui'
import styles from './RequirementsConfig.module.css'

interface RequirementsConfigProps {
  readonly activityLevel: string
  readonly stressLevel: string
  readonly medicalCondition: string
  readonly onActivityChange: (value: string) => void
  readonly onStressChange: (value: string) => void
  readonly onConditionChange: (value: string) => void
}

const ACTIVITY_OPTIONS = [
  { value: 'bedrest', label: '安静臥床' },
  { value: 'sedentary', label: '座位・軽い活動' },
  { value: 'light', label: '軽い運動' },
  { value: 'moderate', label: '中程度の運動' },
  { value: 'active', label: '激しい運動' },
] as const

const STRESS_OPTIONS = [
  { value: 'mild', label: '軽度ストレス' },
  { value: 'moderate', label: '中等度ストレス' },
  { value: 'severe', label: '重度ストレス' },
  { value: 'critical', label: '極重度ストレス' },
] as const

const CONDITION_OPTIONS = [
  { value: '', label: 'なし' },
  { value: '腎不全', label: '腎不全' },
  { value: '肝不全', label: '肝不全' },
  { value: '心不全', label: '心不全' },
  { value: '糖尿病', label: '糖尿病' },
  { value: '炎症性腸疾患', label: '炎症性腸疾患' },
  { value: '外傷・手術', label: '外傷・手術' },
] as const

export function RequirementsConfig({
  activityLevel,
  stressLevel,
  medicalCondition,
  onActivityChange,
  onStressChange,
  onConditionChange,
}: RequirementsConfigProps) {
  return (
    <Card className={styles.card}>
      <h3 className={styles.heading}>
        <Settings size={18} />
        患者設定
      </h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="activity-level">
            活動レベル
          </label>
          <select
            id="activity-level"
            className={styles.select}
            value={activityLevel}
            onChange={(e) => onActivityChange(e.target.value)}
          >
            {ACTIVITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="stress-level">
            ストレスレベル
          </label>
          <select
            id="stress-level"
            className={styles.select}
            value={stressLevel}
            onChange={(e) => onStressChange(e.target.value)}
          >
            {STRESS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.conditionField}>
          <label className={styles.label} htmlFor="medical-condition">
            病態（任意）
          </label>
          <select
            id="medical-condition"
            className={styles.select}
            value={medicalCondition}
            onChange={(e) => onConditionChange(e.target.value)}
          >
            {CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  )
}
