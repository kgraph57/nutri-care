import { useState, useCallback, useMemo, useEffect } from "react";
import { ShieldCheck, Plus, History, Info, FileText } from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useScreeningData } from "../hooks/useScreeningData";
import { suggestScreeningTool } from "../services/screeningToolSuggestor";
import type {
  ScreeningToolType,
  ScreeningEntry,
  Nrs2002Result,
  MnaSfResult,
  GlimResult,
} from "../types/screening";
import { ScreeningToolTabs } from "../components/screening/ScreeningToolTabs";
import { NRS2002Form } from "../components/screening/NRS2002Form";
import { MnaSfForm } from "../components/screening/MnaSfForm";
import { GlimForm } from "../components/screening/GlimForm";
import { ScreeningResultCard } from "../components/screening/ScreeningResultCard";
import { ScreeningHistory } from "../components/screening/ScreeningHistory";
import { Button } from "../components/ui";
import styles from "./ScreeningPage.module.css";

export function ScreeningPage() {
  // 1. Hooks
  const { patients } = usePatients();
  const { getScreeningHistory, getLatestScreening, saveScreeningEntry } =
    useScreeningData();

  // 2. Local state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id ?? "",
  );
  const [activeTab, setActiveTab] = useState<ScreeningToolType>("nrs2002");
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ScreeningEntry | null>(
    null,
  );

  // 3. Computed
  const patient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  const history = useMemo(
    () => (selectedPatientId ? getScreeningHistory(selectedPatientId) : []),
    [selectedPatientId, getScreeningHistory],
  );

  const latestScreening = useMemo(
    () =>
      selectedPatientId ? getLatestScreening(selectedPatientId) : undefined,
    [selectedPatientId, getLatestScreening],
  );

  const suggestion = useMemo(
    () => (patient ? suggestScreeningTool(patient, history) : null),
    [patient, history],
  );

  // 4. Auto-set tab based on suggestion
  useEffect(() => {
    if (suggestion) {
      setActiveTab(suggestion.recommended);
    }
  }, [suggestion]);

  // 5. Handlers
  const handleSaveResult = useCallback(
    (result: Nrs2002Result | MnaSfResult | GlimResult) => {
      if (!patient) return;
      const entry: ScreeningEntry = {
        id: crypto.randomUUID(),
        patientId: patient.id,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5),
        result,
        notes: "",
        createdAt: new Date().toISOString(),
      };
      saveScreeningEntry(patient.id, entry);
      setShowForm(false);
      setSelectedEntry(entry);
    },
    [patient, saveScreeningEntry],
  );

  const handleProceedToGlim = useCallback(() => {
    setActiveTab("glim");
    setShowForm(true);
  }, []);

  const handleSelectEntry = useCallback((entry: ScreeningEntry) => {
    setSelectedEntry(entry);
    setShowForm(false);
  }, []);

  // 6. Render
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
        <div>
          <h1 className={styles.pageTitle}>
            <ShieldCheck size={24} className={styles.pageIcon} />
            栄養スクリーニング
          </h1>
          <p className={styles.subtitle}>NRS-2002 / MNA-SF / GLIM 基準</p>
        </div>
        <div className={styles.headerControls}>
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
              新規スクリーニング
            </Button>
          </div>
        </div>
      </div>

      {/* ツール推奨バナー */}
      {suggestion && (
        <div className={styles.suggestion}>
          <Info size={18} className={styles.suggestionIcon} />
          <span className={styles.suggestionText}>{suggestion.reason}</span>
        </div>
      )}

      {/* ツールタブ */}
      <ScreeningToolTabs
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setSelectedEntry(null);
        }}
        suggestedTool={suggestion?.recommended}
      />

      {/* コンテンツ */}
      <div className={styles.content}>
        {/* 左カラム: フォーム or 結果カード */}
        <div className={styles.main}>
          {showForm && patient ? (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FileText size={16} />
                {activeTab === "nrs2002" && "NRS-2002 スクリーニング"}
                {activeTab === "mna-sf" && "MNA-SF スクリーニング"}
                {activeTab === "glim" && "GLIM 低栄養診断"}
              </div>
              <div className={styles.sectionBody}>
                {activeTab === "nrs2002" && (
                  <NRS2002Form
                    patient={patient}
                    onSave={handleSaveResult}
                    onCancel={() => setShowForm(false)}
                  />
                )}
                {activeTab === "mna-sf" && (
                  <MnaSfForm
                    patient={patient}
                    onSave={handleSaveResult}
                    onCancel={() => setShowForm(false)}
                  />
                )}
                {activeTab === "glim" && (
                  <GlimForm
                    patient={patient}
                    previousScreening={latestScreening}
                    onSave={handleSaveResult}
                    onCancel={() => setShowForm(false)}
                  />
                )}
              </div>
            </div>
          ) : selectedEntry ? (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <ShieldCheck size={16} />
                スクリーニング結果
              </div>
              <div className={styles.sectionBody}>
                <ScreeningResultCard
                  entry={selectedEntry}
                  onProceedToGlim={handleProceedToGlim}
                />
              </div>
            </div>
          ) : (
            <div className={styles.section}>
              <div className={styles.sectionBody}>
                <p className={styles.emptyMessage}>
                  「新規スクリーニング」ボタンから評価を開始するか、
                  履歴から過去の結果を選択してください。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 右カラム: 履歴 */}
        <div className={styles.sidebar}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <History size={16} />
              スクリーニング履歴 ({history.length}件)
            </div>
            <div className={styles.sectionBody}>
              <ScreeningHistory
                entries={history}
                onSelectEntry={handleSelectEntry}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
