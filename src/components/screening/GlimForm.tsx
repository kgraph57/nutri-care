import { useState, useCallback, useMemo } from "react";
import { Scale, Utensils, AlertCircle, CheckCircle } from "lucide-react";
import type { Patient } from "../../types";
import type {
  ScreeningEntry,
  GlimPhenotypicCriteria,
  GlimEtiologicCriteria,
  GlimResult,
  GlimWeightLossTimeframe,
  GlimSeverity,
} from "../../types/screening";
import { GLIM_SEVERITY_LABELS } from "../../types/screening";
import { diagnoseGlim } from "../../services/glimDiagnoser";
import { Button } from "../ui";
import styles from "./GlimForm.module.css";

interface GlimFormProps {
  readonly patient: Patient;
  readonly previousScreening?: ScreeningEntry;
  readonly onSave: (result: GlimResult) => void;
  readonly onCancel: () => void;
}

function calculateBmi(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) return 0;
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

const TIMEFRAME_OPTIONS: readonly {
  readonly value: GlimWeightLossTimeframe;
  readonly label: string;
}[] = [
  { value: "none", label: "該当なし" },
  { value: "6months", label: "6ヶ月以内" },
  { value: "6monthsPlus", label: "6ヶ月以上" },
];

const MUSCLE_METHODS: readonly string[] = [
  "DEXA",
  "BIA（生体電気インピーダンス）",
  "CT/MRI",
  "身体計測（上腕周囲長等）",
  "握力",
  "その他",
];

const INTAKE_DURATIONS: readonly string[] = [
  "1週間未満",
  "1~2週間",
  "2週間以上",
  "1ヶ月以上",
];

function getSeverityColor(severity: GlimSeverity): string {
  switch (severity) {
    case "none":
      return "var(--color-success)";
    case "stage1":
      return "var(--color-warning)";
    case "stage2":
      return "var(--color-danger)";
  }
}

export function GlimForm({
  patient,
  previousScreening,
  onSave,
  onCancel,
}: GlimFormProps) {
  const patientBmi = useMemo(
    () => calculateBmi(patient.weight, patient.height),
    [patient.weight, patient.height],
  );

  const isLowBmiAuto = useMemo(() => {
    if (patientBmi <= 0) return false;
    if (patient.age >= 70) return patientBmi < 22;
    return patientBmi < 20;
  }, [patientBmi, patient.age]);

  // -- Phenotypic state --
  const [weightLossChecked, setWeightLossChecked] = useState(false);
  const [weightLossPercentage, setWeightLossPercentage] = useState(0);
  const [weightLossTimeframe, setWeightLossTimeframe] =
    useState<GlimWeightLossTimeframe>("none");
  const [lowBmi, setLowBmi] = useState(isLowBmiAuto);
  const [reducedMuscleMass, setReducedMuscleMass] = useState(false);
  const [muscleMassMethod, setMuscleMassMethod] = useState("");

  // -- Etiologic state --
  const [reducedFoodIntake, setReducedFoodIntake] = useState(false);
  const [intakeReductionPercentage, setIntakeReductionPercentage] = useState(0);
  const [intakeReductionDuration, setIntakeReductionDuration] = useState("");
  const [malabsorption, setMalabsorption] = useState(false);
  const [inflammation, setInflammation] = useState(false);
  const [inflammationEvidence, setInflammationEvidence] = useState("");

  const phenotypic: GlimPhenotypicCriteria = useMemo(
    () => ({
      unintentionalWeightLoss: weightLossChecked,
      weightLossPercentage,
      weightLossTimeframe,
      lowBmi,
      bmiValue: patientBmi,
      reducedMuscleMass,
      muscleMassMethod,
    }),
    [
      weightLossChecked,
      weightLossPercentage,
      weightLossTimeframe,
      lowBmi,
      patientBmi,
      reducedMuscleMass,
      muscleMassMethod,
    ],
  );

  const etiologic: GlimEtiologicCriteria = useMemo(
    () => ({
      reducedFoodIntake,
      intakeReductionPercentage,
      intakeReductionDuration,
      malabsorption,
      inflammation,
      inflammationEvidence,
    }),
    [
      reducedFoodIntake,
      intakeReductionPercentage,
      intakeReductionDuration,
      malabsorption,
      inflammation,
      inflammationEvidence,
    ],
  );

  const currentResult = useMemo(
    () => diagnoseGlim(phenotypic, etiologic, patient.age),
    [phenotypic, etiologic, patient.age],
  );

  const handleSave = useCallback(() => {
    onSave(currentResult);
  }, [onSave, currentResult]);

  const severityColor = getSeverityColor(currentResult.severity);

  return (
    <div className={styles.form}>
      {/* 前回スクリーニング情報 */}
      {previousScreening && (
        <div className={styles.previousInfo}>
          <AlertCircle size={14} />
          <span>
            前回スクリーニング: {previousScreening.date}（
            {previousScreening.result.toolType.toUpperCase()}）
          </span>
        </div>
      )}

      <div className={styles.columns}>
        {/* 左: Phenotypic基準 */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>
            <Scale size={16} className={styles.columnIcon} />
            Phenotypic基準（表現型）
          </h4>

          {/* 体重減少 */}
          <div className={styles.criteriaBlock}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={weightLossChecked}
                onChange={(e) => setWeightLossChecked(e.target.checked)}
              />
              <span className={styles.checkLabel}>意図しない体重減少</span>
            </label>
            {weightLossChecked && (
              <div className={styles.subFields}>
                <div className={styles.field}>
                  <span className={styles.label}>
                    減少率 <span className={styles.unit}>%</span>
                  </span>
                  <input
                    type="number"
                    className={styles.input}
                    value={weightLossPercentage}
                    min={0}
                    max={100}
                    step={0.1}
                    onChange={(e) =>
                      setWeightLossPercentage(
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>期間</span>
                  <select
                    className={styles.select}
                    value={weightLossTimeframe}
                    onChange={(e) =>
                      setWeightLossTimeframe(
                        e.target.value as GlimWeightLossTimeframe,
                      )
                    }
                  >
                    {TIMEFRAME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 低BMI */}
          <div className={styles.criteriaBlock}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={lowBmi}
                onChange={(e) => setLowBmi(e.target.checked)}
              />
              <span className={styles.checkLabel}>低BMI</span>
            </label>
            <div className={styles.autoValue}>
              {patientBmi > 0 ? (
                <span>
                  BMI: {patientBmi.toFixed(1)}
                  {isLowBmiAuto && (
                    <span className={styles.autoTag}>自動検出</span>
                  )}
                  <span className={styles.threshold}>
                    （基準: {patient.age >= 70 ? "<22" : "<20"}
                    {patient.age >= 70 ? " [70歳以上]" : " [70歳未満]"}）
                  </span>
                </span>
              ) : (
                <span className={styles.noData}>身長・体重データなし</span>
              )}
            </div>
          </div>

          {/* 筋肉量低下 */}
          <div className={styles.criteriaBlock}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={reducedMuscleMass}
                onChange={(e) => setReducedMuscleMass(e.target.checked)}
              />
              <span className={styles.checkLabel}>筋肉量低下</span>
            </label>
            {reducedMuscleMass && (
              <div className={styles.subFields}>
                <div className={styles.field}>
                  <span className={styles.label}>評価方法</span>
                  <select
                    className={styles.select}
                    value={muscleMassMethod}
                    onChange={(e) => setMuscleMassMethod(e.target.value)}
                  >
                    <option value="">選択してください</option>
                    {MUSCLE_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Phenotypic判定 */}
          <div
            className={`${styles.criteriaStatus} ${
              currentResult.phenotypicMet
                ? styles.criteriaMet
                : styles.criteriaNotMet
            }`}
          >
            {currentResult.phenotypicMet ? (
              <CheckCircle size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            <span>
              {currentResult.phenotypicMet
                ? "Phenotypic基準を満たしています"
                : "Phenotypic基準を満たしていません"}
            </span>
          </div>
        </div>

        {/* 右: Etiologic基準 */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>
            <Utensils size={16} className={styles.columnIcon} />
            Etiologic基準（病因型）
          </h4>

          {/* 食事摂取低下 */}
          <div className={styles.criteriaBlock}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={reducedFoodIntake}
                onChange={(e) => setReducedFoodIntake(e.target.checked)}
              />
              <span className={styles.checkLabel}>食事摂取量の低下/消化吸収障害</span>
            </label>
            {reducedFoodIntake && (
              <div className={styles.subFields}>
                <div className={styles.field}>
                  <span className={styles.label}>
                    摂取低下率 <span className={styles.unit}>%</span>
                  </span>
                  <input
                    type="number"
                    className={styles.input}
                    value={intakeReductionPercentage}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(e) =>
                      setIntakeReductionPercentage(
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>期間</span>
                  <select
                    className={styles.select}
                    value={intakeReductionDuration}
                    onChange={(e) =>
                      setIntakeReductionDuration(e.target.value)
                    }
                  >
                    <option value="">選択してください</option>
                    {INTAKE_DURATIONS.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 吸収不良 */}
          <div className={styles.criteriaBlock}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={malabsorption}
                onChange={(e) => setMalabsorption(e.target.checked)}
              />
              <span className={styles.checkLabel}>吸収不良</span>
            </label>
          </div>

          {/* 炎症 */}
          <div className={styles.criteriaBlock}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={inflammation}
                onChange={(e) => setInflammation(e.target.checked)}
              />
              <span className={styles.checkLabel}>
                炎症/疾患による負荷
              </span>
            </label>
            {inflammation && (
              <div className={styles.subFields}>
                <div className={styles.field}>
                  <span className={styles.label}>根拠</span>
                  <textarea
                    className={styles.textarea}
                    value={inflammationEvidence}
                    onChange={(e) =>
                      setInflammationEvidence(e.target.value)
                    }
                    placeholder="CRP上昇、急性疾患、慢性疾患など"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Etiologic判定 */}
          <div
            className={`${styles.criteriaStatus} ${
              currentResult.etiologicMet
                ? styles.criteriaMet
                : styles.criteriaNotMet
            }`}
          >
            {currentResult.etiologicMet ? (
              <CheckCircle size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            <span>
              {currentResult.etiologicMet
                ? "Etiologic基準を満たしています"
                : "Etiologic基準を満たしていません"}
            </span>
          </div>
        </div>
      </div>

      {/* 診断結果バナー */}
      <div
        className={`${styles.diagnosisBanner} ${
          currentResult.diagnosed
            ? styles.diagnosisPositive
            : styles.diagnosisNegative
        }`}
      >
        <div className={styles.diagnosisHeader}>
          {currentResult.diagnosed ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          <span className={styles.diagnosisTitle}>
            {currentResult.diagnosed
              ? "低栄養と診断"
              : "低栄養基準を満たさず"}
          </span>
        </div>
        {currentResult.diagnosed && (
          <div className={styles.severityBadge}>
            <span
              className={styles.severityDot}
              style={{ backgroundColor: severityColor }}
            />
            <span className={styles.severityText}>
              {GLIM_SEVERITY_LABELS[currentResult.severity]}
            </span>
          </div>
        )}
        <div className={styles.diagnosisDetail}>
          <span>
            Phenotypic: {currentResult.phenotypicMet ? "該当" : "非該当"} /
            Etiologic: {currentResult.etiologicMet ? "該当" : "非該当"}
          </span>
        </div>
      </div>

      {/* アクション */}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  );
}
