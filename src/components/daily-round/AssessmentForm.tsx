import { useState, useCallback } from "react";
import {
  Heart,
  Stethoscope,
  Droplets,
  Activity,
  ClipboardList,
} from "lucide-react";
import type {
  DailyAssessment,
  VitalSigns,
  GIAssessment,
  ActualIntake,
  ConsciousnessLevel,
  RespiratoryStatus,
  SymptomSeverity,
} from "../../types/dailyRound";
import {
  CONSCIOUSNESS_LABELS,
  RESPIRATORY_LABELS,
  SYMPTOM_SEVERITY_LABELS,
  BOWEL_SOUNDS_LABELS,
  GI_RESIDUAL_ACTION_LABELS,
} from "../../types/dailyRound";
import { Button } from "../ui";
import styles from "./AssessmentForm.module.css";

interface AssessmentFormProps {
  readonly patientId: string;
  readonly initialData?: DailyAssessment;
  readonly onSave: (data: DailyAssessment) => void;
  readonly onCancel: () => void;
}

function now(): { date: string; time: string } {
  const d = new Date();
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}

const DEFAULT_VITALS: VitalSigns = {
  temperature: 36.5,
  heartRate: 80,
  systolicBP: 120,
  diastolicBP: 70,
  respiratoryRate: 16,
  spO2: 98,
};

const DEFAULT_GI: GIAssessment = {
  gastricResidual: 0,
  gastricResidualAction: "none",
  vomiting: "none",
  vomitingEpisodes: 0,
  diarrhea: "none",
  abdominalDistension: "none",
  bowelSounds: "present",
  stoolCount: 0,
  stoolConsistency: "none",
  constipation: false,
};

const DEFAULT_INTAKE: ActualIntake = {
  enteralVolume: 0,
  parenteralVolume: 0,
  oralVolume: 0,
  ivFluidVolume: 0,
  estimatedEnergy: 0,
  estimatedProtein: 0,
};

const STOOL_LABELS: Record<GIAssessment["stoolConsistency"], string> = {
  hard: "硬便",
  formed: "有形便",
  soft: "軟便",
  loose: "泥状便",
  watery: "水様便",
  none: "なし",
};

type NumericSetter<T> = (prev: T) => T;

export function AssessmentForm({
  patientId,
  initialData,
  onSave,
  onCancel,
}: AssessmentFormProps) {
  const { date: todayDate, time: todayTime } = now();

  const [date, setDate] = useState(initialData?.date ?? todayDate);
  const [time, setTime] = useState(initialData?.time ?? todayTime);
  const [vitals, setVitals] = useState<VitalSigns>(
    initialData?.vitals ?? DEFAULT_VITALS,
  );
  const [consciousness, setConsciousness] = useState<ConsciousnessLevel>(
    initialData?.consciousness ?? "alert",
  );
  const [respiratoryStatus, setRespiratoryStatus] =
    useState<RespiratoryStatus>(initialData?.respiratoryStatus ?? "room-air");
  const [gi, setGI] = useState<GIAssessment>(initialData?.gi ?? DEFAULT_GI);
  const [intake, setIntake] = useState<ActualIntake>(
    initialData?.actualIntake ?? DEFAULT_INTAKE,
  );
  const [bodyWeight, setBodyWeight] = useState(
    initialData?.bodyWeight ?? 0,
  );
  const [urineOutput, setUrineOutput] = useState(
    initialData?.urineOutput ?? 0,
  );
  const [edema, setEdema] = useState<SymptomSeverity>(
    initialData?.edema ?? "none",
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    initialData?.clinicalNotes ?? "",
  );

  const updateVital = useCallback(
    <K extends keyof VitalSigns>(key: K, value: VitalSigns[K]) => {
      setVitals((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateGI = useCallback(
    <K extends keyof GIAssessment>(key: K, value: GIAssessment[K]) => {
      setGI((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateIntake = useCallback(
    <K extends keyof ActualIntake>(key: K, value: ActualIntake[K]) => {
      setIntake((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    const assessment: DailyAssessment = {
      id: initialData?.id ?? crypto.randomUUID(),
      patientId,
      date,
      time,
      vitals,
      consciousness,
      respiratoryStatus,
      gi,
      actualIntake: intake,
      bodyWeight,
      urineOutput,
      edema,
      clinicalNotes,
    };
    onSave(assessment);
  }, [
    initialData,
    patientId,
    date,
    time,
    vitals,
    consciousness,
    respiratoryStatus,
    gi,
    intake,
    bodyWeight,
    urineOutput,
    edema,
    clinicalNotes,
    onSave,
  ]);

  const numInput = (
    value: number,
    onChange: (v: number) => void,
    min?: number,
    max?: number,
    step?: number,
  ) => (
    <input
      type="number"
      className={styles.input}
      value={value}
      min={min}
      max={max}
      step={step ?? 1}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  );

  const selectInput = <T extends string>(
    value: T,
    onChange: (v: T) => void,
    options: Readonly<Record<string, string>>,
  ) => (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {Object.entries(options).map(([k, label]) => (
        <option key={k} value={k}>
          {label}
        </option>
      ))}
    </select>
  );

  return (
    <div className={styles.form}>
      {/* 日時 */}
      <div className={styles.header}>
        <div className={styles.headerDate}>
          <input
            type="date"
            className={styles.dateInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            className={styles.timeInput}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* バイタルサイン */}
      <section>
        <h4 className={styles.sectionTitle}>
          <Heart size={16} className={styles.sectionIcon} />
          バイタルサイン
        </h4>
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>
              体温 <span className={styles.unit}>°C</span>
            </span>
            {numInput(vitals.temperature, (v) => updateVital("temperature", v), 30, 43, 0.1)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              心拍数 <span className={styles.unit}>bpm</span>
            </span>
            {numInput(vitals.heartRate, (v) => updateVital("heartRate", v), 0, 300)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              SpO2 <span className={styles.unit}>%</span>
            </span>
            {numInput(vitals.spO2, (v) => updateVital("spO2", v), 0, 100)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              収縮期血圧 <span className={styles.unit}>mmHg</span>
            </span>
            {numInput(vitals.systolicBP, (v) => updateVital("systolicBP", v), 0, 300)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              拡張期血圧 <span className={styles.unit}>mmHg</span>
            </span>
            {numInput(vitals.diastolicBP, (v) => updateVital("diastolicBP", v), 0, 200)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              呼吸数 <span className={styles.unit}>/min</span>
            </span>
            {numInput(vitals.respiratoryRate, (v) => updateVital("respiratoryRate", v), 0, 60)}
          </div>
        </div>
      </section>

      {/* 全身状態 */}
      <section>
        <h4 className={styles.sectionTitle}>
          <Activity size={16} className={styles.sectionIcon} />
          全身状態
        </h4>
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>意識レベル</span>
            {selectInput(consciousness, setConsciousness, CONSCIOUSNESS_LABELS)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>呼吸状態</span>
            {selectInput(respiratoryStatus, setRespiratoryStatus, RESPIRATORY_LABELS)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>浮腫</span>
            {selectInput(edema, setEdema, SYMPTOM_SEVERITY_LABELS)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              体重 <span className={styles.unit}>kg</span>
            </span>
            {numInput(bodyWeight, setBodyWeight, 0, 300, 0.1)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              尿量(24h) <span className={styles.unit}>mL</span>
            </span>
            {numInput(urineOutput, setUrineOutput, 0, 10000)}
          </div>
        </div>
      </section>

      {/* 消化器評価 */}
      <section>
        <h4 className={styles.sectionTitle}>
          <Stethoscope size={16} className={styles.sectionIcon} />
          消化器評価
        </h4>
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>
              胃残留量 <span className={styles.unit}>mL</span>
            </span>
            {numInput(gi.gastricResidual, (v) => updateGI("gastricResidual", v), 0, 2000)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>胃残留量の対応</span>
            {selectInput(gi.gastricResidualAction, (v) => updateGI("gastricResidualAction", v), GI_RESIDUAL_ACTION_LABELS)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>嘔吐</span>
            {selectInput(gi.vomiting, (v) => updateGI("vomiting", v), SYMPTOM_SEVERITY_LABELS)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>嘔吐回数</span>
            {numInput(gi.vomitingEpisodes, (v) => updateGI("vomitingEpisodes", v), 0, 50)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>下痢</span>
            {selectInput(gi.diarrhea, (v) => updateGI("diarrhea", v), SYMPTOM_SEVERITY_LABELS)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>腹部膨満</span>
            {selectInput(gi.abdominalDistension, (v) => updateGI("abdominalDistension", v), SYMPTOM_SEVERITY_LABELS)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>腸蠕動音</span>
            {selectInput(gi.bowelSounds, (v) => updateGI("bowelSounds", v), BOWEL_SOUNDS_LABELS)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>排便回数</span>
            {numInput(gi.stoolCount, (v) => updateGI("stoolCount", v), 0, 20)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>便性状</span>
            {selectInput(gi.stoolConsistency, (v) => updateGI("stoolConsistency", v), STOOL_LABELS)}
          </div>
        </div>
        <div style={{ marginTop: "var(--spacing-2)" }}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={gi.constipation}
              onChange={(e) => updateGI("constipation", e.target.checked)}
            />
            便秘あり
          </label>
        </div>
      </section>

      {/* 栄養摂取量 */}
      <section>
        <h4 className={styles.sectionTitle}>
          <Droplets size={16} className={styles.sectionIcon} />
          栄養摂取量(24h)
        </h4>
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>
              経腸栄養 <span className={styles.unit}>mL</span>
            </span>
            {numInput(intake.enteralVolume, (v) => updateIntake("enteralVolume", v), 0, 5000)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              静脈栄養 <span className={styles.unit}>mL</span>
            </span>
            {numInput(intake.parenteralVolume, (v) => updateIntake("parenteralVolume", v), 0, 5000)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              経口摂取 <span className={styles.unit}>mL</span>
            </span>
            {numInput(intake.oralVolume, (v) => updateIntake("oralVolume", v), 0, 5000)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              輸液 <span className={styles.unit}>mL</span>
            </span>
            {numInput(intake.ivFluidVolume, (v) => updateIntake("ivFluidVolume", v), 0, 10000)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              推定エネルギー <span className={styles.unit}>kcal</span>
            </span>
            {numInput(intake.estimatedEnergy, (v) => updateIntake("estimatedEnergy", v), 0, 5000)}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>
              推定タンパク質 <span className={styles.unit}>g</span>
            </span>
            {numInput(intake.estimatedProtein, (v) => updateIntake("estimatedProtein", v), 0, 300, 0.1)}
          </div>
        </div>
      </section>

      {/* 臨床メモ */}
      <section>
        <h4 className={styles.sectionTitle}>
          <ClipboardList size={16} className={styles.sectionIcon} />
          臨床メモ
        </h4>
        <div className={styles.fieldFull}>
          <textarea
            className={styles.textarea}
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            placeholder="特記事項、計画変更理由など..."
          />
        </div>
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
