import { useState, useMemo, useCallback } from "react";
import { TrendingUp, Plus, Baby } from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useGrowthData } from "../hooks/useGrowthData";
import { isPediatricPatient } from "../services/pediatricNutritionCalculation";
import { GrowthChart } from "../components/growth/GrowthChart";
import { GrowthEntryForm } from "../components/growth/GrowthEntryForm";
import { GrowthSummaryCard } from "./patient-detail/GrowthSummaryCard";
import type { Patient } from "../types";
import type { GrowthMeasurement } from "../types/growthData";
import { Card, Button, EmptyState, Modal } from "../components/ui";
import styles from "./GrowthMonitoringPage.module.css";

/* ---- Types ---- */

type MeasureType = "weight" | "height" | "headCircumference";
type GenderLabel = "男性" | "女性";

interface ExpandedState {
  readonly [patientId: string]: boolean;
}

interface ChartTypeState {
  readonly [patientId: string]: MeasureType;
}

/* ---- Helpers ---- */

function resolveGenderLabel(gender: string): GenderLabel {
  if (gender === "女性" || gender === "female") return "女性";
  return "男性";
}

function formatAgeDisplay(patient: Patient): string {
  if (patient.ageInMonths !== undefined && patient.ageInMonths < 24) {
    return `${patient.ageInMonths}ヶ月`;
  }
  if (patient.age < 2 && patient.ageInMonths !== undefined) {
    return `${patient.ageInMonths}ヶ月`;
  }
  return `${patient.age}歳`;
}

const MEASURE_TYPE_LABELS: Record<MeasureType, string> = {
  weight: "体重",
  height: "身長",
  headCircumference: "頭囲",
};

/* ---- Patient Growth Card ---- */

interface PatientGrowthCardProps {
  readonly patient: Patient;
  readonly measurements: readonly GrowthMeasurement[];
  readonly isExpanded: boolean;
  readonly chartType: MeasureType;
  readonly onToggleExpand: () => void;
  readonly onChangeChartType: (type: MeasureType) => void;
  readonly onAddEntry: () => void;
}

function PatientGrowthCard({
  patient,
  measurements,
  isExpanded,
  chartType,
  onToggleExpand,
  onChangeChartType,
  onAddEntry,
}: PatientGrowthCardProps) {
  const genderLabel = resolveGenderLabel(patient.gender);

  return (
    <Card className={styles.patientCard}>
      <div className={styles.patientCardHeader}>
        <div className={styles.patientInfo}>
          <div className={styles.patientIconWrapper}>
            <Baby size={18} />
          </div>
          <div>
            <p className={styles.patientName}>{patient.name}</p>
            <p className={styles.patientAge}>
              {formatAgeDisplay(patient)} / {genderLabel} / {patient.ward}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={onAddEntry}
        >
          記録追加
        </Button>
      </div>

      <GrowthSummaryCard patient={patient} measurements={measurements} />

      <div className={styles.chartToggle}>
        <Button variant="secondary" size="sm" onClick={onToggleExpand}>
          {isExpanded ? "チャートを閉じる" : "成長曲線を表示"}
        </Button>
      </div>

      {isExpanded && (
        <div className={styles.chartSection}>
          <div className={styles.chartTabs}>
            {(
              Object.entries(MEASURE_TYPE_LABELS) as ReadonlyArray<
                [MeasureType, string]
              >
            ).map(([type, label]) => (
              <button
                key={type}
                type="button"
                className={[
                  styles.chartTab,
                  chartType === type ? styles.chartTabActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onChangeChartType(type)}
              >
                {label}
              </button>
            ))}
          </div>
          <GrowthChart
            patient={patient}
            measurements={measurements}
            measureType={chartType}
            gender={genderLabel}
          />
        </div>
      )}
    </Card>
  );
}

/* ---- Page Component ---- */

export function GrowthMonitoringPage() {
  const { patients } = usePatients();
  const { getGrowthHistory, saveGrowthMeasurement } = useGrowthData();

  const [expandedMap, setExpandedMap] = useState<ExpandedState>({});
  const [chartTypeMap, setChartTypeMap] = useState<ChartTypeState>({});
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  const pediatricPatients = useMemo(
    () => patients.filter(isPediatricPatient),
    [patients],
  );

  const handleToggleExpand = useCallback((patientId: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  }, []);

  const handleChangeChartType = useCallback(
    (patientId: string, type: MeasureType) => {
      setChartTypeMap((prev) => ({
        ...prev,
        [patientId]: type,
      }));
    },
    [],
  );

  const handleOpenEntryModal = useCallback((patientId: string) => {
    setSelectedPatientId(patientId);
    setShowEntryModal(true);
  }, []);

  const handleCloseEntryModal = useCallback(() => {
    setShowEntryModal(false);
    setSelectedPatientId(null);
  }, []);

  const handleSaveMeasurement = useCallback(
    (measurement: GrowthMeasurement) => {
      if (selectedPatientId) {
        saveGrowthMeasurement(selectedPatientId, measurement);
      }
      handleCloseEntryModal();
    },
    [selectedPatientId, saveGrowthMeasurement, handleCloseEntryModal],
  );

  if (pediatricPatients.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleArea}>
              <div className={styles.headerIcon}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h1 className={styles.title}>成長モニタリング</h1>
                <p className={styles.subtitle}>
                  小児患者の成長曲線と体格評価
                </p>
              </div>
            </div>
          </div>
        </header>
        <EmptyState
          icon={<Baby size={48} />}
          title="小児患者がいません"
          description="小児患者を登録すると、成長モニタリングが利用できます。"
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleArea}>
            <div className={styles.headerIcon}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className={styles.title}>成長モニタリング</h1>
              <p className={styles.subtitle}>小児患者の成長曲線と体格評価</p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.patientGrid}>
        {pediatricPatients.map((patient) => {
          const measurements = getGrowthHistory(patient.id);

          return (
            <PatientGrowthCard
              key={patient.id}
              patient={patient}
              measurements={measurements}
              isExpanded={expandedMap[patient.id] ?? false}
              chartType={chartTypeMap[patient.id] ?? "weight"}
              onToggleExpand={() => handleToggleExpand(patient.id)}
              onChangeChartType={(type) =>
                handleChangeChartType(patient.id, type)
              }
              onAddEntry={() => handleOpenEntryModal(patient.id)}
            />
          );
        })}
      </div>

      <Modal
        isOpen={showEntryModal}
        title="成長記録を追加"
        onClose={handleCloseEntryModal}
      >
        {selectedPatientId && (
          <GrowthEntryForm
            patientId={selectedPatientId}
            onSave={handleSaveMeasurement}
            onCancel={handleCloseEntryModal}
          />
        )}
      </Modal>
    </div>
  );
}
