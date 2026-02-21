import { useState, useCallback, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  History,
  TrendingUp,
  FileText,
} from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useDailyRound } from "../hooks/useDailyRound";
import { generateAdjustedPlan } from "../services/dailyPlanAdjuster";
import { scoreAssessment } from "../services/dailyAssessmentScorer";
import type {
  DailyAssessment,
  DailyRoundEntry,
} from "../types/dailyRound";
import type { NutritionRequirements } from "../types";
import { calculateTotalEnergyRequirement } from "../services/nutritionCalculation";
import { AssessmentForm } from "../components/daily-round/AssessmentForm";
import { AdjustedPlanPanel } from "../components/daily-round/AdjustedPlanPanel";
import {
  RoundTimeline,
  TrendCard,
} from "../components/daily-round/RoundTimeline";
import { Button, Modal } from "../components/ui";
import styles from "./DailyRoundPage.module.css";

function buildDefaultRequirements(
  weight: number,
  energyReq: number,
): NutritionRequirements {
  return {
    energy: energyReq,
    protein: Math.round(weight * 1.2),
    fat: Math.round((energyReq * 0.3) / 9),
    carbs: Math.round((energyReq * 0.5) / 4),
    sodium: 80,
    potassium: 60,
    calcium: 10,
    magnesium: 10,
    phosphorus: 15,
    chloride: 80,
    iron: 10,
    zinc: 10,
    copper: 1,
    manganese: 3,
    iodine: 130,
    selenium: 50,
  };
}

export function DailyRoundPage() {
  const { patients } = usePatients();
  const { getRoundHistory, getLatestRound, saveRound } = useDailyRound();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id ?? "",
  );
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DailyRoundEntry | null>(
    null,
  );

  const patient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  const history = useMemo(
    () => (selectedPatientId ? getRoundHistory(selectedPatientId) : []),
    [selectedPatientId, getRoundHistory],
  );

  const latestRound = useMemo(
    () => (selectedPatientId ? getLatestRound(selectedPatientId) : undefined),
    [selectedPatientId, getLatestRound],
  );

  const requirements = useMemo(() => {
    if (!patient) return null;
    const energy = calculateTotalEnergyRequirement(patient);
    return buildDefaultRequirements(patient.weight, energy);
  }, [patient]);

  const latestScore = useMemo(() => {
    if (!latestRound) return null;
    return scoreAssessment(
      latestRound.assessment,
      latestRound.adjustedPlan.requirements,
    );
  }, [latestRound]);

  const selectedScore = useMemo(() => {
    if (!selectedEntry) return null;
    return scoreAssessment(
      selectedEntry.assessment,
      selectedEntry.adjustedPlan.requirements,
    );
  }, [selectedEntry]);

  const handleSaveAssessment = useCallback(
    (assessment: DailyAssessment) => {
      if (!patient || !requirements) return;

      const previousPlan = latestRound?.adjustedPlan ?? null;
      const { plan } = generateAdjustedPlan(
        assessment,
        previousPlan,
        requirements,
      );

      const entry: DailyRoundEntry = {
        id: crypto.randomUUID(),
        patientId: patient.id,
        date: assessment.date,
        assessment,
        previousPlan,
        adjustedPlan: plan,
        manualOverrides: [],
        approvedBy: "",
        createdAt: new Date().toISOString(),
      };

      saveRound(patient.id, entry);
      setShowForm(false);
    },
    [patient, requirements, latestRound, saveRound],
  );

  const handleSelectEntry = useCallback((entry: DailyRoundEntry) => {
    setSelectedEntry(entry);
  }, []);

  if (patients.length === 0) {
    return (
      <div className={styles.page}>
        <p>患者データがありません。先に患者を登録してください。</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ヘッダー */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <ClipboardList size={24} className={styles.pageIcon} />
          デイリーラウンド
        </h1>
        <div className={styles.patientSelector}>
          <select
            className={styles.patientSelect}
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setShowForm(false);
              setSelectedEntry(null);
            }}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.ward})
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => {
              setShowForm(true);
              setSelectedEntry(null);
            }}
          >
            新規評価
          </Button>
        </div>
      </div>

      {/* メインレイアウト */}
      <div className={styles.layout}>
        {/* 左カラム: フォーム or 最新プラン */}
        <div className={styles.column}>
          {showForm ? (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FileText size={16} />
                アセスメント入力
              </div>
              <div className={styles.sectionBody}>
                <AssessmentForm
                  patientId={selectedPatientId}
                  onSave={handleSaveAssessment}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          ) : latestRound && latestScore ? (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <TrendingUp size={16} />
                最新の栄養プラン ({latestRound.date})
              </div>
              <div className={styles.sectionBody}>
                <AdjustedPlanPanel
                  plan={latestRound.adjustedPlan}
                  score={latestScore}
                />
              </div>
            </div>
          ) : (
            <div className={styles.section}>
              <div className={styles.sectionBody}>
                <p>
                  「新規評価」ボタンからアセスメントを入力してください。
                </p>
              </div>
            </div>
          )}

          {/* トレンド */}
          {history.length >= 2 && <TrendCard entries={history} />}
        </div>

        {/* 右カラム: タイムライン */}
        <div className={styles.column}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <History size={16} />
              回診履歴 ({history.length}件)
            </div>
            <div className={styles.sectionBody}>
              <RoundTimeline
                entries={history}
                onSelect={handleSelectEntry}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedEntry && selectedScore && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEntry(null)}
          title={`回診詳細 - ${selectedEntry.date}`}
        >
          <div className={styles.detailModal}>
            <AdjustedPlanPanel
              plan={selectedEntry.adjustedPlan}
              score={selectedScore}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
