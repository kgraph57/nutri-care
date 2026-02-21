import { useState, useCallback } from 'react';
import { Button } from '../ui';
import type { FluidBalanceEntry, FluidInput, FluidOutput } from '../../types/fluidBalance';
import { computeTotalInput, computeTotalOutput } from '../../types/fluidBalance';
import styles from './FluidBalanceForm.module.css';

interface FluidBalanceFormProps {
  readonly patientId: string;
  readonly initialData?: FluidBalanceEntry;
  readonly onSave: (entry: FluidBalanceEntry) => void;
  readonly onCancel: () => void;
}

interface FieldDef {
  readonly key: string;
  readonly label: string;
}

const INPUT_FIELDS: readonly FieldDef[] = [
  { key: 'ivFluids', label: '輸液' },
  { key: 'enteralNutrition', label: '経腸栄養' },
  { key: 'oralIntake', label: '経口摂取' },
  { key: 'ivMedications', label: '注射薬剤' },
  { key: 'other', label: 'その他' },
] as const;

const OUTPUT_FIELDS: readonly FieldDef[] = [
  { key: 'urine', label: '尿量' },
  { key: 'stool', label: '便' },
  { key: 'drains', label: 'ドレーン排液' },
  { key: 'vomitOrNG', label: '嘔吐/NG' },
  { key: 'other', label: 'その他' },
] as const;

const DEFAULT_INPUT: FluidInput = {
  ivFluids: 0,
  enteralNutrition: 0,
  oralIntake: 0,
  ivMedications: 0,
  other: 0,
};

const DEFAULT_OUTPUT: FluidOutput = {
  urine: 0,
  stool: 0,
  drains: 0,
  vomitOrNG: 0,
  other: 0,
};

function parseNumericValue(raw: string): number {
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getNetBalanceClass(net: number): string {
  if (net > 0) return styles.positive;
  if (net < 0) return styles.negative;
  return styles.zero;
}

function formatBalance(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function FluidBalanceForm({
  patientId,
  initialData,
  onSave,
  onCancel,
}: FluidBalanceFormProps) {
  const [date, setDate] = useState(
    initialData?.date ?? new Date().toISOString().slice(0, 10)
  );

  const [inputValues, setInputValues] = useState<FluidInput>(
    initialData?.input ?? DEFAULT_INPUT
  );

  const [outputValues, setOutputValues] = useState<FluidOutput>(
    initialData?.output ?? DEFAULT_OUTPUT
  );

  const handleInputChange = useCallback(
    (key: string, raw: string) => {
      setInputValues((prev) => ({
        ...prev,
        [key]: parseNumericValue(raw),
      }));
    },
    []
  );

  const handleOutputChange = useCallback(
    (key: string, raw: string) => {
      setOutputValues((prev) => ({
        ...prev,
        [key]: parseNumericValue(raw),
      }));
    },
    []
  );

  const totalIn = computeTotalInput(inputValues);
  const totalOut = computeTotalOutput(outputValues);
  const netBalance = totalIn - totalOut;

  const handleSave = useCallback(() => {
    if (!date) return;

    const entry: FluidBalanceEntry = {
      patientId,
      date,
      input: { ...inputValues },
      output: { ...outputValues },
    };
    onSave(entry);
  }, [patientId, date, inputValues, outputValues, onSave]);

  return (
    <div className={styles.form}>
      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>記録日:</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      <div className={styles.columns}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>IN (水分摂取)</h4>
          {INPUT_FIELDS.map((field) => (
            <div key={field.key} className={styles.field}>
              <label className={styles.label}>
                {field.label}
                <span className={styles.unit}>(mL)</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={inputValues[field.key as keyof FluidInput]}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className={styles.input}
              />
            </div>
          ))}
          <div className={styles.subtotalRow}>
            <span className={styles.subtotalLabel}>小計</span>
            <span className={styles.subtotalValue}>{totalIn} mL</span>
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>OUT (水分排出)</h4>
          {OUTPUT_FIELDS.map((field) => (
            <div key={field.key} className={styles.field}>
              <label className={styles.label}>
                {field.label}
                <span className={styles.unit}>(mL)</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={outputValues[field.key as keyof FluidOutput]}
                onChange={(e) => handleOutputChange(field.key, e.target.value)}
                className={styles.input}
              />
            </div>
          ))}
          <div className={styles.subtotalRow}>
            <span className={styles.subtotalLabel}>小計</span>
            <span className={styles.subtotalValue}>{totalOut} mL</span>
          </div>
        </div>
      </div>

      <div className={styles.netBalance}>
        <span className={styles.netBalanceLabel}>水分バランス (IN - OUT)</span>
        <span className={`${styles.netBalanceValue} ${getNetBalanceClass(netBalance)}`}>
          {formatBalance(netBalance)} mL
        </span>
      </div>

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
