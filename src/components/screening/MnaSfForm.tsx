import { useState, useCallback, useMemo } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import type { Patient } from "../../types";
import type {
  MnaSfData,
  MnaSfResult,
  MnaFoodIntakeDecline,
  MnaWeightLoss,
  MnaMobility,
  MnaPsychologicalStress,
  MnaNeuropsychological,
  MnaBmiOrCalf,
} from "../../types/screening";
import {
  MNASF_RISK_LABELS,
} from "../../types/screening";
import {
  scoreMnaSf,
  calculateBmiScore,
  calculateCalfScore,
} from "../../services/mnaSfScorer";
import { Button } from "../ui";
import styles from "./MnaSfForm.module.css";

interface MnaSfFormProps {
  readonly patient: Patient;
  readonly onSave: (result: MnaSfResult) => void;
  readonly onCancel: () => void;
}

function calculateBmi(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) return 0;
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

function getRiskColor(riskLevel: MnaSfResult["riskLevel"]): string {
  switch (riskLevel) {
    case "normal":
      return "var(--color-success)";
    case "at-risk":
      return "var(--color-warning)";
    case "malnourished":
      return "var(--color-danger)";
  }
}

interface RadioOption<T extends number> {
  readonly value: T;
  readonly label: string;
}

const FOOD_INTAKE_OPTIONS: readonly RadioOption<MnaFoodIntakeDecline>[] = [
  { value: 0, label: "著明な食事量の減少" },
  { value: 1, label: "中等度の食事量の減少" },
  { value: 2, label: "食事量の減少なし" },
];

const WEIGHT_LOSS_OPTIONS: readonly RadioOption<MnaWeightLoss>[] = [
  { value: 0, label: "3kg以上の体重減少" },
  { value: 1, label: "わからない" },
  { value: 2, label: "1~3kgの体重減少" },
  { value: 3, label: "体重減少なし" },
];

const MOBILITY_OPTIONS: readonly RadioOption<MnaMobility>[] = [
  { value: 0, label: "寝たきりまたは車椅子" },
  { value: 1, label: "ベッドや車椅子を離れられるが外出不可" },
  { value: 2, label: "自由に外出できる" },
];

const PSYCHOLOGICAL_STRESS_OPTIONS: readonly RadioOption<MnaPsychologicalStress>[] = [
  { value: 0, label: "あり" },
  { value: 2, label: "なし" },
];

const NEUROPSYCHOLOGICAL_OPTIONS: readonly RadioOption<MnaNeuropsychological>[] = [
  { value: 0, label: "重度の認知症またはうつ状態" },
  { value: 1, label: "軽度の認知症" },
  { value: 2, label: "精神的問題なし" },
];

const BMI_OPTIONS: readonly RadioOption<MnaBmiOrCalf>[] = [
  { value: 0, label: "BMI 19未満" },
  { value: 1, label: "BMI 19以上21未満" },
  { value: 2, label: "BMI 21以上23未満" },
  { value: 3, label: "BMI 23以上" },
];

const CALF_OPTIONS: readonly RadioOption<MnaBmiOrCalf>[] = [
  { value: 0, label: "下腿周囲長 31cm未満" },
  { value: 3, label: "下腿周囲長 31cm以上" },
];

export function MnaSfForm({
  patient,
  onSave,
  onCancel,
}: MnaSfFormProps) {
  const patientBmi = useMemo(
    () => calculateBmi(patient.weight, patient.height),
    [patient.weight, patient.height],
  );

  const autoBmiScore = useMemo(
    () => (patientBmi > 0 ? calculateBmiScore(patientBmi) : 0),
    [patientBmi],
  );

  const [foodIntakeDecline, setFoodIntakeDecline] =
    useState<MnaFoodIntakeDecline>(2);
  const [weightLoss, setWeightLoss] = useState<MnaWeightLoss>(3);
  const [mobility, setMobility] = useState<MnaMobility>(2);
  const [psychologicalStress, setPsychologicalStress] =
    useState<MnaPsychologicalStress>(2);
  const [neuropsychological, setNeuropsychological] =
    useState<MnaNeuropsychological>(2);
  const [useCalf, setUseCalf] = useState(false);
  const [bmiOrCalf, setBmiOrCalf] = useState<MnaBmiOrCalf>(autoBmiScore);
  const [calfCircumference, setCalfCircumference] = useState(32);

  const handleToggleCalf = useCallback(() => {
    setUseCalf((prev) => {
      const next = !prev;
      if (next) {
        setBmiOrCalf(calculateCalfScore(calfCircumference));
      } else {
        setBmiOrCalf(autoBmiScore);
      }
      return next;
    });
  }, [autoBmiScore, calfCircumference]);

  const handleCalfChange = useCallback((value: number) => {
    setCalfCircumference(value);
    setBmiOrCalf(calculateCalfScore(value));
  }, []);

  const mnaSfData: MnaSfData = useMemo(
    () => ({
      foodIntakeDecline,
      weightLoss,
      mobility,
      psychologicalStress,
      neuropsychological,
      bmiOrCalf,
      usedCalfCircumference: useCalf,
    }),
    [
      foodIntakeDecline,
      weightLoss,
      mobility,
      psychologicalStress,
      neuropsychological,
      bmiOrCalf,
      useCalf,
    ],
  );

  const currentResult = useMemo(() => scoreMnaSf(mnaSfData), [mnaSfData]);

  const handleSave = useCallback(() => {
    onSave(currentResult);
  }, [onSave, currentResult]);

  const riskColor = getRiskColor(currentResult.riskLevel);

  return (
    <div className={styles.form}>
      {/* リアルタイムスコア表示 */}
      <div className={styles.scoreBar}>
        <div className={styles.scoreCircle} style={{ borderColor: riskColor }}>
          <span className={styles.scoreValue} style={{ color: riskColor }}>
            {currentResult.totalScore}
          </span>
          <span className={styles.scoreMax}>/ 14</span>
        </div>
        <div className={styles.scoreInfo}>
          <span className={styles.riskLabel} style={{ color: riskColor }}>
            {MNASF_RISK_LABELS[currentResult.riskLevel]}
          </span>
          <span className={styles.scoreSummary}>
            12-14: 正常 / 8-11: リスクあり / 0-7: 低栄養
          </span>
        </div>
      </div>

      {/* A: 食事摂取量の減少 */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.sectionLetter}>A</span>
          食事摂取量の減少（過去3ヶ月間）
        </h4>
        <div className={styles.radioGroup}>
          {FOOD_INTAKE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.radioCard} ${
                foodIntakeDecline === option.value
                  ? styles.radioCardSelected
                  : ""
              }`}
            >
              <input
                type="radio"
                name="foodIntake"
                value={option.value}
                checked={foodIntakeDecline === option.value}
                onChange={() => setFoodIntakeDecline(option.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioScore}>{option.value}</span>
              <span className={styles.radioLabel}>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* B: 体重減少 */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.sectionLetter}>B</span>
          体重減少（過去3ヶ月間）
        </h4>
        <div className={styles.radioGroup}>
          {WEIGHT_LOSS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.radioCard} ${
                weightLoss === option.value ? styles.radioCardSelected : ""
              }`}
            >
              <input
                type="radio"
                name="weightLoss"
                value={option.value}
                checked={weightLoss === option.value}
                onChange={() => setWeightLoss(option.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioScore}>{option.value}</span>
              <span className={styles.radioLabel}>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* C: 移動能力 */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.sectionLetter}>C</span>
          移動能力
        </h4>
        <div className={styles.radioGroup}>
          {MOBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.radioCard} ${
                mobility === option.value ? styles.radioCardSelected : ""
              }`}
            >
              <input
                type="radio"
                name="mobility"
                value={option.value}
                checked={mobility === option.value}
                onChange={() => setMobility(option.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioScore}>{option.value}</span>
              <span className={styles.radioLabel}>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* D: 精神的ストレス/急性疾患 */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.sectionLetter}>D</span>
          精神的ストレスまたは急性疾患（過去3ヶ月間）
        </h4>
        <div className={styles.radioGroup}>
          {PSYCHOLOGICAL_STRESS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.radioCard} ${
                psychologicalStress === option.value
                  ? styles.radioCardSelected
                  : ""
              }`}
            >
              <input
                type="radio"
                name="psychologicalStress"
                value={option.value}
                checked={psychologicalStress === option.value}
                onChange={() => setPsychologicalStress(option.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioScore}>{option.value}</span>
              <span className={styles.radioLabel}>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* E: 神経心理学的問題 */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.sectionLetter}>E</span>
          神経・心理学的問題
        </h4>
        <div className={styles.radioGroup}>
          {NEUROPSYCHOLOGICAL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.radioCard} ${
                neuropsychological === option.value
                  ? styles.radioCardSelected
                  : ""
              }`}
            >
              <input
                type="radio"
                name="neuropsychological"
                value={option.value}
                checked={neuropsychological === option.value}
                onChange={() => setNeuropsychological(option.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioScore}>{option.value}</span>
              <span className={styles.radioLabel}>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* F: BMI / 下腿周囲長 */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.sectionLetter}>F</span>
          BMI
          {patientBmi > 0 && (
            <span className={styles.bmiAuto}>
              （算出値: {patientBmi.toFixed(1)}）
            </span>
          )}
        </h4>

        <div className={styles.toggleRow}>
          <button
            type="button"
            className={styles.toggleCalf}
            onClick={handleToggleCalf}
          >
            {useCalf ? (
              <ToggleRight size={20} className={styles.toggleOn} />
            ) : (
              <ToggleLeft size={20} className={styles.toggleOff} />
            )}
            <span>
              {useCalf ? "下腿周囲長を使用中" : "BMIを使用中"}
            </span>
          </button>
          <span className={styles.toggleHint}>
            BMI測定が困難な場合は下腿周囲長に切り替え
          </span>
        </div>

        {!useCalf ? (
          <div className={styles.radioGroup}>
            {BMI_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`${styles.radioCard} ${
                  bmiOrCalf === option.value ? styles.radioCardSelected : ""
                }`}
              >
                <input
                  type="radio"
                  name="bmiOrCalf"
                  value={option.value}
                  checked={bmiOrCalf === option.value}
                  onChange={() => setBmiOrCalf(option.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioScore}>{option.value}</span>
                <span className={styles.radioLabel}>{option.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className={styles.calfInput}>
            <div className={styles.calfField}>
              <label className={styles.calfLabel}>
                下腿周囲長
                <span className={styles.unit}>cm</span>
              </label>
              <input
                type="number"
                className={styles.input}
                value={calfCircumference}
                min={0}
                max={100}
                step={0.1}
                onChange={(e) =>
                  handleCalfChange(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className={styles.radioGroup}>
              {CALF_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`${styles.radioCard} ${
                    bmiOrCalf === option.value ? styles.radioCardSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="bmiOrCalf"
                    value={option.value}
                    checked={bmiOrCalf === option.value}
                    onChange={() => setBmiOrCalf(option.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioScore}>{option.value}</span>
                  <span className={styles.radioLabel}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

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
