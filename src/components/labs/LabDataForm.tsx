import { useState, useCallback } from 'react';
import type { LabData, LabReference, LabSection } from '../../types/labData';
import { LAB_REFERENCES } from '../../types/labData';
import { Button } from '../ui';
import styles from './LabDataForm.module.css';

interface LabDataFormProps {
  readonly patientId: string;
  readonly initialData?: LabData;
  readonly onSave: (data: LabData) => void;
  readonly onCancel: () => void;
}

function groupBySection(refs: readonly LabReference[]): Map<LabSection, readonly LabReference[]> {
  const groups = new Map<LabSection, LabReference[]>();
  for (const ref of refs) {
    const existing = groups.get(ref.section);
    if (existing) {
      groups.set(ref.section, [...existing, ref]);
    } else {
      groups.set(ref.section, [ref]);
    }
  }
  return groups;
}

function getInputClass(
  value: string,
  ref: LabReference
): string {
  if (!value) return styles.input;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return styles.input;

  if (ref.criticalLow !== undefined && num < ref.criticalLow) return `${styles.input} ${styles.inputCritical}`;
  if (ref.criticalHigh !== undefined && num > ref.criticalHigh) return `${styles.input} ${styles.inputCritical}`;
  if (num < ref.normalMin) return `${styles.input} ${styles.inputLow}`;
  if (num > ref.normalMax) return `${styles.input} ${styles.inputHigh}`;
  return styles.input;
}

const SECTION_ORDER: readonly LabSection[] = ['蛋白', '腎機能', '血糖', '電解質', '炎症', '肝機能', '脂質', '血液'];

export function LabDataForm({ patientId, initialData, onSave, onCancel }: LabDataFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!initialData) return {};
    const result: Record<string, string> = {};
    for (const ref of LAB_REFERENCES) {
      const val = initialData[ref.key];
      if (val !== undefined && val !== null) {
        result[ref.key] = String(val);
      }
    }
    return result;
  });

  const [date, setDate] = useState(
    initialData?.date ?? new Date().toISOString().slice(0, 10)
  );

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    const labData: Record<string, unknown> = { patientId, date };
    for (const ref of LAB_REFERENCES) {
      const raw = values[ref.key];
      if (raw) {
        const num = parseFloat(raw);
        if (!Number.isNaN(num)) {
          labData[ref.key] = num;
        }
      }
    }
    onSave(labData as LabData);
  }, [patientId, date, values, onSave]);

  const sections = groupBySection(LAB_REFERENCES);

  return (
    <div className={styles.form}>
      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>検査日:</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      {SECTION_ORDER.map((section) => {
        const refs = sections.get(section);
        if (!refs) return null;
        return (
          <div key={section}>
            <h4 className={styles.sectionTitle}>{section}</h4>
            <div className={styles.grid}>
              {refs.map((ref) => (
                <div key={ref.key} className={styles.field}>
                  <label className={styles.label}>
                    {ref.label}
                    <span className={styles.unit}>({ref.unit})</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={values[ref.key] ?? ''}
                    onChange={(e) => handleChange(ref.key, e.target.value)}
                    className={getInputClass(values[ref.key] ?? '', ref)}
                    placeholder={`${ref.normalMin}–${ref.normalMax}`}
                  />
                  <p className={styles.rangeHint}>
                    基準: {ref.normalMin}–{ref.normalMax}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  );
}
