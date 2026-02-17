import { ChevronLeft } from 'lucide-react'
import { Card } from '../ui'
import type { SimulationCase, Difficulty } from '../../types/simulation'
import type { LabData } from '../../types/labData'
import { LAB_REFERENCES } from '../../types/labData'
import styles from './CaseDetail.module.css'

interface CaseDetailProps {
  readonly caseData: SimulationCase
  readonly onBack: () => void
  readonly onStart: () => void
}

const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
}

const DIFFICULTY_STYLES: Readonly<Record<Difficulty, string>> = {
  beginner: styles.badgeBeginner,
  intermediate: styles.badgeIntermediate,
  advanced: styles.badgeAdvanced,
}

function getLabStatus(
  key: keyof Omit<LabData, 'patientId' | 'date'>,
  value: number,
): string {
  const ref = LAB_REFERENCES.find((r) => r.key === key)
  if (!ref) return styles.labNormal

  if (ref.criticalLow !== undefined && value <= ref.criticalLow) return styles.labCritical
  if (ref.criticalHigh !== undefined && value >= ref.criticalHigh) return styles.labCritical
  if (value < ref.normalMin) return styles.labLow
  if (value > ref.normalMax) return styles.labHigh
  return styles.labNormal
}

function getStatusArrow(
  key: keyof Omit<LabData, 'patientId' | 'date'>,
  value: number,
): string {
  const ref = LAB_REFERENCES.find((r) => r.key === key)
  if (!ref) return ''
  if (value < ref.normalMin) return ' \u2193'
  if (value > ref.normalMax) return ' \u2191'
  return ''
}

export function CaseDetail({ caseData, onBack, onStart }: CaseDetailProps) {
  const { patient, labData } = caseData

  const labEntries = LAB_REFERENCES.filter((ref) => {
    const value = labData[ref.key]
    return value !== undefined && value !== null
  }).map((ref) => ({
    ...ref,
    value: labData[ref.key] as number,
  }))

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={onBack} type="button">
          <ChevronLeft size={16} />
          戻る
        </button>
      </div>

      <div className={styles.titleArea}>
        <h1 className={styles.caseTitle}>{caseData.title}</h1>
        <div className={styles.badgeRow}>
          <span
            className={`${styles.difficultyBadge} ${DIFFICULTY_STYLES[caseData.difficulty]}`}
          >
            {DIFFICULTY_LABELS[caseData.difficulty]}
          </span>
          <span className={styles.categoryBadge}>{caseData.category}</span>
        </div>
      </div>

      <div className={styles.twoColumn}>
        <div>
          <h2 className={styles.sectionTitle}>患者情報</h2>
          <Card className={styles.patientCard}>
            <div className={styles.patientGrid}>
              <div className={styles.patientField}>
                <span className={styles.fieldLabel}>氏名</span>
                <span className={styles.fieldValue}>{patient.name}</span>
              </div>
              <div className={styles.patientField}>
                <span className={styles.fieldLabel}>年齢・性別</span>
                <span className={styles.fieldValue}>
                  {patient.age}歳 {patient.gender}
                </span>
              </div>
              <div className={styles.patientField}>
                <span className={styles.fieldLabel}>体重</span>
                <span className={styles.fieldValue}>{patient.weight} kg</span>
              </div>
              <div className={styles.patientField}>
                <span className={styles.fieldLabel}>身長</span>
                <span className={styles.fieldValue}>{patient.height} cm</span>
              </div>
              <div className={`${styles.patientField} ${styles.patientFieldFull}`}>
                <span className={styles.fieldLabel}>診断</span>
                <span className={styles.fieldValue}>{patient.diagnosis}</span>
              </div>
              <div className={styles.patientField}>
                <span className={styles.fieldLabel}>病棟</span>
                <span className={styles.fieldValue}>{patient.ward}</span>
              </div>
              <div className={styles.patientField}>
                <span className={styles.fieldLabel}>入院日</span>
                <span className={styles.fieldValue}>{patient.admissionDate}</span>
              </div>
              {patient.allergies.length > 0 && (
                <div className={`${styles.patientField} ${styles.patientFieldFull}`}>
                  <span className={styles.fieldLabel}>アレルギー</span>
                  <span className={styles.fieldValue}>
                    {patient.allergies.join('、')}
                  </span>
                </div>
              )}
              {patient.medications.length > 0 && (
                <div className={`${styles.patientField} ${styles.patientFieldFull}`}>
                  <span className={styles.fieldLabel}>服用薬</span>
                  <span className={styles.fieldValue}>
                    {patient.medications.join('、')}
                  </span>
                </div>
              )}
              {patient.notes && (
                <div className={`${styles.patientField} ${styles.patientFieldFull}`}>
                  <span className={styles.fieldLabel}>備考</span>
                  <span className={styles.fieldValue}>{patient.notes}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <h2 className={styles.sectionTitle}>検査データ</h2>
          <Card className={styles.patientCard}>
            <table className={styles.labTable}>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>値</th>
                  <th>単位</th>
                  <th>基準値</th>
                </tr>
              </thead>
              <tbody>
                {labEntries.map((entry) => (
                  <tr key={entry.key}>
                    <td>{entry.label}</td>
                    <td className={getLabStatus(entry.key, entry.value)}>
                      {entry.value}
                      {getStatusArrow(entry.key, entry.value)}
                    </td>
                    <td>{entry.unit}</td>
                    <td>
                      {entry.normalMin} - {entry.normalMax}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>臨床コンテキスト</h2>
        <Card className={styles.contextCard}>
          <p className={styles.contextText}>{caseData.clinicalContext}</p>
        </Card>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>学習目標</h2>
        <ul className={styles.objectivesList}>
          {caseData.objectives.map((objective, index) => (
            <li key={index} className={styles.objectiveItem}>
              <span className={styles.objectiveNumber}>{index + 1}</span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={onBack} type="button">
          <ChevronLeft size={16} />
          ケース一覧に戻る
        </button>
        <button className={styles.startButton} onClick={onStart} type="button">
          開始する
        </button>
      </div>
    </div>
  )
}
