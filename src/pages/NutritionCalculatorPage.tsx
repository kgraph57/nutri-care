import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { Card, Badge, Button, ProgressBar } from "../components/ui";
import {
  calculateBasalMetabolicRate,
  calculateNutritionRequirements,
  adjustRequirementsForCondition,
} from "../services/nutritionCalculation";
import type { Patient, NutritionType, NutritionRequirements } from "../types";
import styles from "./NutritionCalculatorPage.module.css";

type ActivityLevel = "bedrest" | "sedentary" | "light" | "moderate" | "active";
type StressLevel = "mild" | "moderate" | "severe" | "critical";
type InputMode = "patient" | "manual";

interface ManualInput {
  readonly weight: string;
  readonly height: string;
  readonly age: string;
  readonly gender: string;
}

const ACTIVITY_OPTIONS: ReadonlyArray<{ value: ActivityLevel; label: string }> =
  [
    { value: "bedrest", label: "安静臥床" },
    { value: "sedentary", label: "座位・軽い活動" },
    { value: "light", label: "軽い運動" },
    { value: "moderate", label: "中程度の運動" },
    { value: "active", label: "激しい運動" },
  ];

const STRESS_OPTIONS: ReadonlyArray<{ value: StressLevel; label: string }> = [
  { value: "mild", label: "軽度" },
  { value: "moderate", label: "中等度" },
  { value: "severe", label: "重度" },
  { value: "critical", label: "極重度" },
];

const CONDITION_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "none", label: "なし" },
  { value: "腎不全", label: "腎不全" },
  { value: "肝不全", label: "肝不全" },
  { value: "心不全", label: "心不全" },
  { value: "糖尿病", label: "糖尿病" },
  { value: "炎症性腸疾患", label: "炎症性腸疾患" },
  { value: "外傷・手術", label: "外傷・手術" },
];

function buildPatientFromManualInput(manual: ManualInput): Patient | null {
  const weight = parseFloat(manual.weight);
  const height = parseFloat(manual.height);
  const age = parseInt(manual.age, 10);

  if (isNaN(weight) || isNaN(height) || isNaN(age)) {
    return null;
  }
  if (weight <= 0 || height <= 0 || age < 0) {
    return null;
  }

  return {
    id: "manual",
    name: "手動入力",
    age,
    gender: manual.gender,
    ward: "",
    admissionDate: "",
    dischargeDate: "",
    patientType: "",
    weight,
    height,
    diagnosis: "",
    allergies: [],
    medications: [],
    notes: "",
  };
}

function PatientSelector({
  patients,
  selectedId,
  onSelect,
}: {
  readonly patients: readonly Patient[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>患者を選択</label>
      <select
        className={styles.select}
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">-- 患者を選択 --</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.age}歳, {p.weight}kg)
          </option>
        ))}
      </select>
    </div>
  );
}

function ManualInputForm({
  manual,
  onChange,
}: {
  readonly manual: ManualInput;
  readonly onChange: (updated: ManualInput) => void;
}) {
  return (
    <>
      <div className={styles.inlineGroup}>
        <div className={styles.formGroup}>
          <label className={styles.label}>体重 (kg)</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.1"
            value={manual.weight}
            onChange={(e) => onChange({ ...manual, weight: e.target.value })}
            placeholder="60"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>身長 (cm)</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.1"
            value={manual.height}
            onChange={(e) => onChange({ ...manual, height: e.target.value })}
            placeholder="170"
          />
        </div>
      </div>
      <div className={styles.inlineGroup}>
        <div className={styles.formGroup}>
          <label className={styles.label}>年齢</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            max="150"
            value={manual.age}
            onChange={(e) => onChange({ ...manual, age: e.target.value })}
            placeholder="65"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>性別</label>
          <select
            className={styles.select}
            value={manual.gender}
            onChange={(e) => onChange({ ...manual, gender: e.target.value })}
          >
            <option value="男性">男性</option>
            <option value="女性">女性</option>
          </select>
        </div>
      </div>
    </>
  );
}

function ResultsDisplay({
  requirements,
  bmr,
  condition,
}: {
  readonly requirements: NutritionRequirements;
  readonly bmr: number;
  readonly condition: string;
}) {
  return (
    <>
      <div className={styles.resultsSummary}>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>基礎代謝量</span>
          <span className={styles.resultValue}>
            {Math.round(bmr)}
            <span className={styles.resultUnit}> kcal</span>
          </span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>総エネルギー</span>
          <span className={styles.resultValue}>
            {requirements.energy}
            <span className={styles.resultUnit}> kcal</span>
          </span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>たんぱく質</span>
          <span className={styles.resultValue}>
            {requirements.protein}
            <span className={styles.resultUnit}> g</span>
          </span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>脂質</span>
          <span className={styles.resultValue}>
            {requirements.fat}
            <span className={styles.resultUnit}> g</span>
          </span>
        </div>
      </div>

      {condition !== "none" && (
        <div className={styles.conditionNote}>
          {condition}の病態に応じた調整が適用されています
        </div>
      )}

      <hr className={styles.sectionDivider} />

      <h3 className={styles.cardTitle}>電解質</h3>
      <div className={styles.progressList}>
        <ProgressBar
          current={requirements.sodium}
          max={150}
          label="ナトリウム"
          unit="mEq"
        />
        <ProgressBar
          current={requirements.potassium}
          max={100}
          label="カリウム"
          unit="mEq"
        />
        <ProgressBar
          current={requirements.calcium}
          max={40}
          label="カルシウム"
          unit="mEq"
        />
        <ProgressBar
          current={requirements.magnesium}
          max={30}
          label="マグネシウム"
          unit="mEq"
        />
        <ProgressBar
          current={requirements.phosphorus}
          max={60}
          label="リン"
          unit="mEq"
        />
        <ProgressBar
          current={requirements.chloride}
          max={120}
          label="クロール"
          unit="mEq"
        />
      </div>

      <hr className={styles.sectionDivider} />

      <h3 className={styles.cardTitle}>微量元素</h3>
      <div className={styles.progressList}>
        <ProgressBar
          current={requirements.iron}
          max={10}
          label="鉄"
          unit="mg"
        />
        <ProgressBar
          current={requirements.zinc}
          max={5}
          label="亜鉛"
          unit="mg"
        />
        <ProgressBar
          current={requirements.copper}
          max={1}
          label="銅"
          unit="mg"
        />
        <ProgressBar
          current={requirements.manganese}
          max={0.5}
          label="マンガン"
          unit="mg"
        />
        <ProgressBar
          current={requirements.iodine}
          max={150}
          label="ヨウ素"
          unit="μg"
        />
        <ProgressBar
          current={requirements.selenium}
          max={100}
          label="セレン"
          unit="μg"
        />
      </div>
    </>
  );
}

export function NutritionCalculatorPage() {
  const { patients } = usePatients();
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>("patient");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [manualInput, setManualInput] = useState<ManualInput>({
    weight: "",
    height: "",
    age: "",
    gender: "男性",
  });
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("bedrest");
  const [stressLevel, setStressLevel] = useState<StressLevel>("moderate");
  const [condition, setCondition] = useState("none");
  const [nutritionType, setNutritionType] = useState<NutritionType>("enteral");

  const activePatient = useMemo((): Patient | null => {
    if (inputMode === "patient") {
      return patients.find((p) => p.id === selectedPatientId) ?? null;
    }
    return buildPatientFromManualInput(manualInput);
  }, [inputMode, selectedPatientId, patients, manualInput]);

  const bmr = useMemo(() => {
    if (!activePatient) return 0;
    return calculateBasalMetabolicRate(activePatient);
  }, [activePatient]);

  const requirements = useMemo((): NutritionRequirements | null => {
    if (!activePatient) return null;
    const base = calculateNutritionRequirements(
      activePatient,
      nutritionType,
      activityLevel,
      stressLevel,
    );
    if (condition === "none") return base;
    return adjustRequirementsForCondition(base, condition);
  }, [activePatient, nutritionType, activityLevel, stressLevel, condition]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>栄養必要量計算</h1>
        <p className={styles.subtitle}>患者の栄養必要量を算出します</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.inputPanel}>
          <Card>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>患者情報</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>入力方法</label>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${inputMode === "patient" ? styles.toggleButtonActive : ""}`}
                    onClick={() => setInputMode("patient")}
                  >
                    患者選択
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${inputMode === "manual" ? styles.toggleButtonActive : ""}`}
                    onClick={() => setInputMode("manual")}
                  >
                    手動入力
                  </button>
                </div>
              </div>

              {inputMode === "patient" ? (
                <PatientSelector
                  patients={patients}
                  selectedId={selectedPatientId}
                  onSelect={setSelectedPatientId}
                />
              ) : (
                <ManualInputForm
                  manual={manualInput}
                  onChange={setManualInput}
                />
              )}
            </div>
          </Card>

          <Card>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>計算パラメータ</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>栄養タイプ</label>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${nutritionType === "enteral" ? styles.toggleButtonActive : ""}`}
                    onClick={() => setNutritionType("enteral")}
                  >
                    経腸栄養
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${nutritionType === "parenteral" ? styles.toggleButtonActive : ""}`}
                    onClick={() => setNutritionType("parenteral")}
                  >
                    静脈栄養
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>活動レベル</label>
                <select
                  className={styles.select}
                  value={activityLevel}
                  onChange={(e) =>
                    setActivityLevel(e.target.value as ActivityLevel)
                  }
                >
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>ストレスレベル</label>
                <select
                  className={styles.select}
                  value={stressLevel}
                  onChange={(e) =>
                    setStressLevel(e.target.value as StressLevel)
                  }
                >
                  {STRESS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>基礎疾患</label>
                <select
                  className={styles.select}
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  {CONDITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.resultsPanel}>
          <Card>
            <div className={styles.cardContent}>
              <div className={styles.resultsHeader}>
                <h2 className={styles.resultsTitle}>計算結果</h2>
                <Badge
                  variant={nutritionType === "enteral" ? "success" : "warning"}
                >
                  {nutritionType === "enteral" ? "経腸栄養" : "静脈栄養"}
                </Badge>
              </div>

              {requirements ? (
                <>
                  <ResultsDisplay
                    requirements={requirements}
                    bmr={bmr}
                    condition={condition}
                  />

                  {inputMode === "patient" && selectedPatientId && (
                    <div className={styles.createMenuAction}>
                      <Button
                        variant="primary"
                        size="lg"
                        icon={<Utensils size={18} />}
                        onClick={() => {
                          const params = new URLSearchParams({
                            type: nutritionType,
                            activity: activityLevel,
                            stress: stressLevel,
                          });
                          if (condition !== "none") {
                            params.set("condition", condition);
                          }
                          navigate(
                            `/menu-builder/${selectedPatientId}?${params.toString()}`,
                          );
                        }}
                      >
                        この条件でメニューを作成
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.emptyResults}>
                  患者情報を入力して計算結果を表示
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
