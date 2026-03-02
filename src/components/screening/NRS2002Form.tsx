import { useState, useCallback, useMemo } from "react";
import { ChevronRight, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { Patient } from "../../types";
import type {
  Nrs2002InitialScreening,
  Nrs2002FinalScreening,
  Nrs2002Result,
  Nrs2002NutritionalStatus,
  Nrs2002DiseaseSeverity,
} from "../../types/screening";
import {
  NRS2002_NUTRITIONAL_STATUS_OPTIONS,
  NRS2002_DISEASE_SEVERITY_OPTIONS,
} from "../../types/screening";
import {
  scoreNrs2002,
  evaluateInitialScreening,
} from "../../services/nrs2002Scorer";
import { Button } from "../ui";
import styles from "./NRS2002Form.module.css";

interface NRS2002FormProps {
  readonly patient: Patient;
  readonly onSave: (result: Nrs2002Result) => void;
  readonly onCancel: () => void;
}

type Step = 1 | 2;

const INITIAL_QUESTIONS: readonly {
  readonly key: keyof Nrs2002InitialScreening;
  readonly label: string;
}[] = [
  { key: "bmiBelow205", label: "BMI < 20.5?" },
  { key: "weightLoss3Months", label: "過去3ヶ月で体重減少?" },
  { key: "reducedIntakeLastWeek", label: "先週の食事摂取量低下?" },
  { key: "severelyCritical", label: "重症患者?" },
];

function calculateBmi(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) return 0;
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

export function NRS2002Form({
  patient,
  onSave,
  onCancel,
}: NRS2002FormProps) {
  const patientBmi = useMemo(
    () => calculateBmi(patient.weight, patient.height),
    [patient.weight, patient.height],
  );

  const [step, setStep] = useState<Step>(1);

  const [initialScreening, setInitialScreening] =
    useState<Nrs2002InitialScreening>({
      bmiBelow205: patientBmi > 0 && patientBmi < 20.5,
      weightLoss3Months: false,
      reducedIntakeLastWeek: false,
      severelyCritical: false,
    });

  const [nutritionalStatus, setNutritionalStatus] =
    useState<Nrs2002NutritionalStatus>(0);
  const [nutritionalStatusDetail, setNutritionalStatusDetail] = useState(
    NRS2002_NUTRITIONAL_STATUS_OPTIONS[0].description,
  );
  const [diseaseSeverity, setDiseaseSeverity] =
    useState<Nrs2002DiseaseSeverity>(0);
  const [diseaseSeverityDetail, setDiseaseSeverityDetail] = useState(
    NRS2002_DISEASE_SEVERITY_OPTIONS[0].description,
  );
  const [ageAdjustment, setAgeAdjustment] = useState(patient.age >= 70);

  const initialPositive = useMemo(
    () => evaluateInitialScreening(initialScreening),
    [initialScreening],
  );

  const finalScreening: Nrs2002FinalScreening | null = useMemo(() => {
    if (step !== 2) return null;
    return {
      nutritionalStatus,
      nutritionalStatusDetail,
      diseaseSeverity,
      diseaseSeverityDetail,
      ageAdjustment,
    };
  }, [
    step,
    nutritionalStatus,
    nutritionalStatusDetail,
    diseaseSeverity,
    diseaseSeverityDetail,
    ageAdjustment,
  ]);

  const currentResult = useMemo(
    () => scoreNrs2002(initialScreening, finalScreening, patient.age),
    [initialScreening, finalScreening, patient.age],
  );

  const handleToggleInitial = useCallback(
    (key: keyof Nrs2002InitialScreening) => {
      setInitialScreening((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    [],
  );

  const handleNutritionalStatusChange = useCallback(
    (value: Nrs2002NutritionalStatus) => {
      setNutritionalStatus(value);
      const option = NRS2002_NUTRITIONAL_STATUS_OPTIONS.find(
        (o) => o.value === value,
      );
      if (option) {
        setNutritionalStatusDetail(option.description);
      }
    },
    [],
  );

  const handleDiseaseSeverityChange = useCallback(
    (value: Nrs2002DiseaseSeverity) => {
      setDiseaseSeverity(value);
      const option = NRS2002_DISEASE_SEVERITY_OPTIONS.find(
        (o) => o.value === value,
      );
      if (option) {
        setDiseaseSeverityDetail(option.description);
      }
    },
    [],
  );

  const handleAdvanceToStep2 = useCallback(() => {
    setStep(2);
  }, []);

  const handleBackToStep1 = useCallback(() => {
    setStep(1);
  }, []);

  const handleSave = useCallback(() => {
    onSave(currentResult);
  }, [onSave, currentResult]);

  return (
    <div className={styles.form}>
      {/* ステップインジケーター */}
      <div className={styles.stepIndicator}>
        <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ""}`}>
          1
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ""}`}>
          2
        </div>
      </div>

      {/* スコア表示 (Step 2) */}
      {step === 2 && (
        <div className={styles.scoreDisplay}>
          <span className={styles.scoreLabel}>合計スコア</span>
          <span className={styles.scoreValue}>{currentResult.totalScore}</span>
          <span className={styles.scoreMax}>/ 7</span>
        </div>
      )}

      {/* Step 1: 初回スクリーニング */}
      {step === 1 && (
        <section>
          <h4 className={styles.sectionTitle}>
            <Info size={16} className={styles.sectionIcon} />
            初回スクリーニング
          </h4>
          <p className={styles.hint}>
            以下の質問に「はい」「いいえ」で回答してください
            {patientBmi > 0 && (
              <span className={styles.bmiNote}>
                （現在のBMI: {patientBmi.toFixed(1)}）
              </span>
            )}
          </p>
          <div className={styles.questionList}>
            {INITIAL_QUESTIONS.map(({ key, label }) => (
              <div key={key} className={styles.questionRow}>
                <span className={styles.questionLabel}>{label}</span>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${
                      initialScreening[key] ? styles.toggleYes : ""
                    }`}
                    onClick={() => handleToggleInitial(key)}
                  >
                    はい
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${
                      !initialScreening[key] ? styles.toggleNo : ""
                    }`}
                    onClick={() => handleToggleInitial(key)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 初回スクリーニング結果 */}
          {!initialPositive && (
            <div className={styles.resultNoRisk}>
              <CheckCircle size={18} />
              <div>
                <p className={styles.resultTitle}>栄養リスクなし</p>
                <p className={styles.resultDescription}>
                  すべての項目が「いいえ」のため、現時点では栄養リスクはありません。1週間後に再スクリーニングを行ってください。
                </p>
              </div>
            </div>
          )}

          {initialPositive && (
            <div className={styles.resultAtRisk}>
              <AlertTriangle size={18} />
              <div>
                <p className={styles.resultTitle}>陽性項目あり</p>
                <p className={styles.resultDescription}>
                  最終スクリーニングに進んでください。
                </p>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <Button variant="secondary" onClick={onCancel}>
              キャンセル
            </Button>
            {!initialPositive ? (
              <Button variant="primary" onClick={handleSave}>
                保存
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleAdvanceToStep2}
                icon={<ChevronRight size={16} />}
              >
                最終スクリーニングへ
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Step 2: 最終スクリーニング */}
      {step === 2 && (
        <section>
          {/* 栄養状態スコア */}
          <div className={styles.radioSection}>
            <h4 className={styles.sectionTitle}>栄養状態スコア</h4>
            <div className={styles.radioGroup}>
              {NRS2002_NUTRITIONAL_STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`${styles.radioCard} ${
                    nutritionalStatus === option.value
                      ? styles.radioCardSelected
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="nutritionalStatus"
                    value={option.value}
                    checked={nutritionalStatus === option.value}
                    onChange={() =>
                      handleNutritionalStatusChange(option.value)
                    }
                    className={styles.radioInput}
                  />
                  <div className={styles.radioContent}>
                    <div className={styles.radioHeader}>
                      <span className={styles.radioScore}>{option.value}</span>
                      <span className={styles.radioLabel}>{option.label}</span>
                    </div>
                    <p className={styles.radioDescription}>
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 疾患重症度スコア */}
          <div className={styles.radioSection}>
            <h4 className={styles.sectionTitle}>疾患重症度スコア</h4>
            <div className={styles.radioGroup}>
              {NRS2002_DISEASE_SEVERITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`${styles.radioCard} ${
                    diseaseSeverity === option.value
                      ? styles.radioCardSelected
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="diseaseSeverity"
                    value={option.value}
                    checked={diseaseSeverity === option.value}
                    onChange={() =>
                      handleDiseaseSeverityChange(option.value)
                    }
                    className={styles.radioInput}
                  />
                  <div className={styles.radioContent}>
                    <div className={styles.radioHeader}>
                      <span className={styles.radioScore}>{option.value}</span>
                      <span className={styles.radioLabel}>{option.label}</span>
                    </div>
                    <p className={styles.radioDescription}>
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 年齢調整 */}
          <div className={styles.ageAdjustment}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={ageAdjustment}
                onChange={(e) => setAgeAdjustment(e.target.checked)}
              />
              <span>年齢調整 (+1点): 70歳以上</span>
            </label>
            {patient.age >= 70 && (
              <span className={styles.ageNote}>
                患者年齢: {patient.age}歳（自動チェック済み）
              </span>
            )}
          </div>

          {/* リスク判定 */}
          <div
            className={`${styles.riskBanner} ${
              currentResult.riskLevel === "high-risk"
                ? styles.riskHigh
                : currentResult.riskLevel === "at-risk"
                  ? styles.riskMedium
                  : styles.riskLow
            }`}
          >
            <span className={styles.riskLabel}>判定:</span>
            <span className={styles.riskValue}>
              {currentResult.riskLevel === "high-risk" && "高リスク"}
              {currentResult.riskLevel === "at-risk" && "栄養リスクあり"}
              {currentResult.riskLevel === "no-risk" && "リスクなし"}
            </span>
            <span className={styles.riskScore}>
              （スコア: {currentResult.totalScore}点）
            </span>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleBackToStep1}>
              戻る
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleSave}>
              保存
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
