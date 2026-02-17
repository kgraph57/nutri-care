import { useState, useCallback } from 'react'
import { Button } from '../ui'
import type { GrowthMeasurement } from '../../types/growthData'
import styles from './GrowthEntryForm.module.css'

interface GrowthEntryFormProps {
  readonly patientId: string
  readonly initialData?: GrowthMeasurement
  readonly onSave: (m: GrowthMeasurement) => void
  readonly onCancel: () => void
}

interface FormState {
  readonly date: string
  readonly weight: string
  readonly height: string
  readonly headCircumference: string
  readonly notes: string
}

interface ValidationErrors {
  readonly weight?: string
  readonly height?: string
  readonly headCircumference?: string
  readonly date?: string
}

function createInitialState(
  initialData?: GrowthMeasurement,
): FormState {
  if (initialData) {
    return {
      date: initialData.date,
      weight: String(initialData.weight),
      height: initialData.height !== undefined ? String(initialData.height) : '',
      headCircumference:
        initialData.headCircumference !== undefined
          ? String(initialData.headCircumference)
          : '',
      notes: initialData.notes ?? '',
    }
  }

  return {
    date: new Date().toISOString().slice(0, 10),
    weight: '',
    height: '',
    headCircumference: '',
    notes: '',
  }
}

function parseNumericValue(raw: string): number {
  const parsed = parseFloat(raw)
  return Number.isNaN(parsed) ? 0 : parsed
}

function generateId(): string {
  return `growth-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function validateForm(state: FormState): ValidationErrors {
  const errors: Record<string, string> = {}

  if (!state.date) {
    errors.date = '日付を入力してください'
  }

  const weight = parseNumericValue(state.weight)
  if (!state.weight || weight <= 0) {
    errors.weight = '体重を入力してください (0より大きい値)'
  } else if (weight > 300) {
    errors.weight = '体重の値が大きすぎます'
  }

  if (state.height) {
    const height = parseNumericValue(state.height)
    if (height <= 0) {
      errors.height = '身長は0より大きい値を入力してください'
    } else if (height > 250) {
      errors.height = '身長の値が大きすぎます'
    }
  }

  if (state.headCircumference) {
    const hc = parseNumericValue(state.headCircumference)
    if (hc <= 0) {
      errors.headCircumference = '頭囲は0より大きい値を入力してください'
    } else if (hc > 80) {
      errors.headCircumference = '頭囲の値が大きすぎます'
    }
  }

  return errors
}

function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

export function GrowthEntryForm({
  patientId,
  initialData,
  onSave,
  onCancel,
}: GrowthEntryFormProps) {
  const [formState, setFormState] = useState<FormState>(
    () => createInitialState(initialData),
  )
  const [errors, setErrors] = useState<ValidationErrors>({})

  const updateField = useCallback(
    (field: keyof FormState, value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev as Record<string, string>
        return rest
      })
    },
    [],
  )

  const handleSave = useCallback(() => {
    const validationErrors = validateForm(formState)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    const weight = parseNumericValue(formState.weight)
    const height = formState.height
      ? parseNumericValue(formState.height)
      : undefined
    const headCircumference = formState.headCircumference
      ? parseNumericValue(formState.headCircumference)
      : undefined

    const measurement: GrowthMeasurement = {
      id: initialData?.id ?? generateId(),
      patientId,
      date: formState.date,
      weight,
      height: height !== undefined && height > 0 ? height : undefined,
      headCircumference:
        headCircumference !== undefined && headCircumference > 0
          ? headCircumference
          : undefined,
      notes: formState.notes.trim() || undefined,
    }

    onSave(measurement)
  }, [formState, patientId, initialData, onSave])

  return (
    <div className={styles.form}>
      <h3 className={styles.formTitle}>
        {initialData ? '成長記録を編集' : '成長記録を追加'}
      </h3>

      {/* Date */}
      <div className={styles.dateRow}>
        <label className={styles.label} htmlFor="growth-date">
          測定日
        </label>
        <input
          id="growth-date"
          type="date"
          value={formState.date}
          onChange={(e) => updateField('date', e.target.value)}
          className={[
            styles.dateInput,
            errors.date ? styles.inputError : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {errors.date && (
          <span className={styles.errorText}>{errors.date}</span>
        )}
      </div>

      {/* Measurement fields */}
      <div className={styles.fieldsGrid}>
        {/* Weight - required */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="growth-weight">
            体重
            <span className={styles.required}>*</span>
            <span className={styles.unit}>(kg)</span>
          </label>
          <input
            id="growth-weight"
            type="number"
            min="0"
            step="0.01"
            placeholder="例: 3.25"
            value={formState.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            className={[
              styles.input,
              errors.weight ? styles.inputError : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          {errors.weight && (
            <span className={styles.errorText}>{errors.weight}</span>
          )}
        </div>

        {/* Height - required */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="growth-height">
            身長 / 体長
            <span className={styles.unit}>(cm)</span>
          </label>
          <input
            id="growth-height"
            type="number"
            min="0"
            step="0.1"
            placeholder="例: 50.0"
            value={formState.height}
            onChange={(e) => updateField('height', e.target.value)}
            className={[
              styles.input,
              errors.height ? styles.inputError : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          {errors.height && (
            <span className={styles.errorText}>{errors.height}</span>
          )}
        </div>

        {/* Head circumference - optional */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="growth-hc">
            頭囲
            <span className={styles.unit}>(cm)</span>
            <span className={styles.optional}>乳幼児</span>
          </label>
          <input
            id="growth-hc"
            type="number"
            min="0"
            step="0.1"
            placeholder="例: 34.5"
            value={formState.headCircumference}
            onChange={(e) =>
              updateField('headCircumference', e.target.value)
            }
            className={[
              styles.input,
              errors.headCircumference ? styles.inputError : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          {errors.headCircumference && (
            <span className={styles.errorText}>
              {errors.headCircumference}
            </span>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="growth-notes">
          メモ
        </label>
        <textarea
          id="growth-notes"
          rows={3}
          placeholder="特記事項があれば入力してください"
          value={formState.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          className={styles.textarea}
        />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  )
}
