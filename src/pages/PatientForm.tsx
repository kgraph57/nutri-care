import { useState, useCallback } from "react";
import type { Patient } from "../types";
import { Button } from "../components/ui";
import styles from "./PatientForm.module.css";

interface PatientFormProps {
  readonly patient: Patient | null;
  readonly onSave: (patient: Patient) => void;
  readonly onCancel: () => void;
}

interface FormData {
  readonly name: string;
  readonly age: number;
  readonly gender: string;
  readonly ward: string;
  readonly weight: number;
  readonly height: number;
  readonly patientType: string;
  readonly admissionDate: string;
  readonly diagnosis: string;
  readonly allergiesText: string;
  readonly medicationsText: string;
  readonly notes: string;
  readonly birthDate: string;
  readonly gestationalAge: number;
  readonly birthWeight: number;
}

function isPediatricType(patientType: string): boolean {
  return ["PICU", "NICU", "小児一般"].includes(patientType);
}

function buildInitialFormData(patient: Patient | null): FormData {
  if (patient) {
    return {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      ward: patient.ward,
      weight: patient.weight,
      height: patient.height,
      patientType: patient.patientType,
      admissionDate: patient.admissionDate,
      diagnosis: patient.diagnosis,
      allergiesText: patient.allergies.join(", "),
      medicationsText: patient.medications.join(", "),
      notes: patient.notes,
      birthDate: patient.birthDate ?? "",
      gestationalAge: patient.gestationalAge ?? 40,
      birthWeight: patient.birthWeight ?? 0,
    };
  }

  return {
    name: "",
    age: 0,
    gender: "男性",
    ward: "",
    weight: 0,
    height: 0,
    patientType: "PICU",
    admissionDate: "",
    diagnosis: "",
    allergiesText: "",
    medicationsText: "",
    notes: "",
    birthDate: "",
    gestationalAge: 40,
    birthWeight: 0,
  };
}

function parseCommaSeparated(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function buildPatientFromForm(
  formData: FormData,
  existingId: string | null,
): Patient {
  const base: Patient = {
    id: existingId ?? `P${Date.now()}`,
    name: formData.name,
    age: formData.age,
    gender: formData.gender,
    ward: formData.ward,
    weight: formData.weight,
    height: formData.height,
    patientType: formData.patientType,
    admissionDate: formData.admissionDate,
    dischargeDate: "",
    diagnosis: formData.diagnosis,
    allergies: parseCommaSeparated(formData.allergiesText),
    medications: parseCommaSeparated(formData.medicationsText),
    notes: formData.notes,
  };

  if (!isPediatricType(formData.patientType)) return base;

  return {
    ...base,
    birthDate: formData.birthDate || undefined,
    gestationalAge:
      formData.gestationalAge !== 40 ? formData.gestationalAge : undefined,
    birthWeight: formData.birthWeight > 0 ? formData.birthWeight : undefined,
  };
}

export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    buildInitialFormData(patient),
  );

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const built = buildPatientFromForm(formData, patient?.id ?? null);
      onSave(built);
    },
    [formData, patient, onSave],
  );

  const isEditing = patient !== null;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label}>
            患者名<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            年齢<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="number"
            value={formData.age}
            onChange={(e) =>
              updateField("age", parseInt(e.target.value, 10) || 0)
            }
            required
            min={0}
            max={120}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            性別<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={formData.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            required
          >
            <option value="男性">男性</option>
            <option value="女性">女性</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            病棟<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="text"
            value={formData.ward}
            onChange={(e) => updateField("ward", e.target.value)}
            required
            placeholder="例: ICU-1"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            体重 kg<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="number"
            value={formData.weight}
            onChange={(e) =>
              updateField("weight", parseFloat(e.target.value) || 0)
            }
            required
            min={0}
            step={0.1}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            身長 cm<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="number"
            value={formData.height}
            onChange={(e) =>
              updateField("height", parseFloat(e.target.value) || 0)
            }
            required
            min={0}
            step={0.1}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            患者タイプ<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={formData.patientType}
            onChange={(e) => updateField("patientType", e.target.value)}
            required
          >
            <option value="PICU">PICU</option>
            <option value="NICU">NICU</option>
            <option value="小児一般">小児一般</option>
            <option value="ICU">ICU (成人)</option>
            <option value="一般病棟">一般病棟 (成人)</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            入院日<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="date"
            value={formData.admissionDate}
            onChange={(e) => updateField("admissionDate", e.target.value)}
            required
          />
        </div>

        {isPediatricType(formData.patientType) && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>生年月日</label>
              <input
                className={styles.input}
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>在胎週数</label>
              <input
                className={styles.input}
                type="number"
                value={formData.gestationalAge}
                onChange={(e) =>
                  updateField(
                    "gestationalAge",
                    parseInt(e.target.value, 10) || 40,
                  )
                }
                min={22}
                max={42}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>出生時体重 (kg)</label>
              <input
                className={styles.input}
                type="number"
                value={formData.birthWeight || ""}
                onChange={(e) =>
                  updateField("birthWeight", parseFloat(e.target.value) || 0)
                }
                min={0}
                step={0.01}
                placeholder="例: 3.2"
              />
            </div>
          </>
        )}

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>
            診断名<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="text"
            value={formData.diagnosis}
            onChange={(e) => updateField("diagnosis", e.target.value)}
            required
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>アレルギー</label>
          <input
            className={styles.input}
            type="text"
            value={formData.allergiesText}
            onChange={(e) => updateField("allergiesText", e.target.value)}
            placeholder="カンマ区切りで入力（例: ペニシリン, アスピリン）"
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>薬剤</label>
          <input
            className={styles.input}
            type="text"
            value={formData.medicationsText}
            onChange={(e) => updateField("medicationsText", e.target.value)}
            placeholder="カンマ区切りで入力（例: アスピリン, スタチン）"
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>備考</label>
          <textarea
            className={styles.textarea}
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">{isEditing ? "更新" : "登録"}</Button>
      </div>
    </form>
  );
}
