import { useMemo, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useNutritionMenus } from "../hooks/useNutritionMenus";
import { useLabData } from "../hooks/useLabData";
import { useFluidBalance } from "../hooks/useFluidBalance";
import { useToleranceData } from "../hooks/useToleranceData";
import type { LabData } from "../types/labData";
import type { FluidBalanceEntry } from "../types/fluidBalance";
import type { ToleranceEntry } from "../types/toleranceData";
import {
  EmptyState,
  Modal,
  NutritionTrendChart,
} from "../components/ui";
import { LabDataForm } from "../components/labs/LabDataForm";
import { FluidBalanceForm } from "../components/fluid/FluidBalanceForm";
import { LabTrendChart } from "../components/labs/LabTrendChart";
import { ToleranceEntryForm } from "../components/tolerance/ToleranceEntryForm";
import { PatientProfileCard } from "./patient-detail/PatientProfileCard";
import { NutritionStatusPanel } from "./patient-detail/NutritionStatusPanel";
import { ActiveMenuCard } from "./patient-detail/ActiveMenuCard";
import { FluidBalancePanel } from "./patient-detail/FluidBalancePanel";
import { ClinicalAlertsPanel } from "./patient-detail/ClinicalAlertsPanel";
import { LabOverviewGrid } from "./patient-detail/LabOverviewGrid";
import { TolerancePanel } from "./patient-detail/TolerancePanel";
import { StickyActionBar } from "./patient-detail/StickyActionBar";
import { useFeedingRoute } from "../hooks/useFeedingRoute";
import { useGrowthData } from "../hooks/useGrowthData";
import { useWeaningPlan } from "../hooks/useWeaningPlan";
import { isPediatricPatient } from "../services/pediatricNutritionCalculation";
import {
  generateDefaultWeaningPlan,
  advancePlanPhase,
} from "../services/weaningPlanner";
import { FeedingRoutePanel } from "./patient-detail/FeedingRoutePanel";
import { GrowthSummaryCard } from "./patient-detail/GrowthSummaryCard";
import { WeaningPanel } from "./patient-detail/WeaningPanel";
import { FeedingRouteForm } from "../components/feeding/FeedingRouteForm";
import { GrowthEntryForm } from "../components/growth/GrowthEntryForm";
import type { FeedingRouteEntry } from "../types/feedingRoute";
import type { GrowthMeasurement } from "../types/growthData";
import styles from "./PatientDetailPage.module.css";

/* ---- Helpers ---- */

function computeDaysAdmitted(admissionDate: string): number {
  const admission = new Date(admissionDate);
  const now = new Date();
  return Math.max(
    1,
    Math.ceil((now.getTime() - admission.getTime()) / 86_400_000),
  );
}

/* ---- Page Component ---- */

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { getPatient } = usePatients();
  const { getMenusForPatient } = useNutritionMenus();
  const { getLabData, getLabHistory, saveLabData } = useLabData();
  const { getFluidHistory, saveFluidBalance } = useFluidBalance();
  const { getToleranceHistory, saveToleranceEntry } = useToleranceData();
  const [showLabModal, setShowLabModal] = useState(false);
  const [showFluidModal, setShowFluidModal] = useState(false);
  const [showToleranceModal, setShowToleranceModal] = useState(false);

  // Pediatric hooks
  const { getRouteHistory, saveRoute } = useFeedingRoute();
  const { getGrowthHistory, saveGrowthMeasurement } = useGrowthData();
  const { getActivePlan, savePlan } = useWeaningPlan();

  // Pediatric modals
  const [showFeedingRouteModal, setShowFeedingRouteModal] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);

  const patient = patientId ? getPatient(patientId) : undefined;
  const patientMenus = useMemo(
    () => (patientId ? getMenusForPatient(patientId) : []),
    [patientId, getMenusForPatient],
  );

  const labData = useMemo(
    () => (patientId ? getLabData(patientId) : undefined),
    [patientId, getLabData],
  );

  const labHistory = useMemo(
    () => (patientId ? getLabHistory(patientId) : []),
    [patientId, getLabHistory],
  );

  const daysAdmitted = useMemo(
    () => (patient ? computeDaysAdmitted(patient.admissionDate) : 0),
    [patient],
  );

  const fluidHistory = useMemo(
    () => (patientId ? getFluidHistory(patientId) : []),
    [patientId, getFluidHistory],
  );

  const toleranceHistory = useMemo(
    () => (patientId ? getToleranceHistory(patientId) : []),
    [patientId, getToleranceHistory],
  );

  const latestMenu = useMemo(() => {
    if (patientMenus.length === 0) return undefined;
    return [...patientMenus].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  }, [patientMenus]);

  const todayMenus = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    return patientMenus.filter(
      (m) => new Date(m.createdAt).toISOString().slice(0, 10) === todayKey,
    );
  }, [patientMenus]);

  // Pediatric data
  const isPediatric = useMemo(
    () => (patient ? isPediatricPatient(patient) : false),
    [patient],
  );

  const feedingHistory = useMemo(
    () => (patientId ? getRouteHistory(patientId) : []),
    [patientId, getRouteHistory],
  );

  const growthData = useMemo(
    () => (patientId ? getGrowthHistory(patientId) : []),
    [patientId, getGrowthHistory],
  );

  const weaningPlan = useMemo(
    () => (patientId ? getActivePlan(patientId) : undefined),
    [patientId, getActivePlan],
  );

  const handleLabSave = useCallback(
    (data: LabData) => {
      if (patientId) {
        saveLabData(patientId, data);
      }
      setShowLabModal(false);
    },
    [patientId, saveLabData],
  );

  const handleEditLabs = useCallback(() => {
    setShowLabModal(true);
  }, []);

  const handleOpenAdvisor = useCallback(() => {
    if (patientId) {
      navigate(`/menu-builder/${patientId}`);
    }
  }, [patientId, navigate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleFluidSave = useCallback(
    (entry: FluidBalanceEntry) => {
      if (patientId) {
        saveFluidBalance(patientId, entry);
      }
      setShowFluidModal(false);
    },
    [patientId, saveFluidBalance],
  );

  const handleOpenFluidModal = useCallback(() => {
    setShowFluidModal(true);
  }, []);

  const handleToleranceSave = useCallback(
    (entry: ToleranceEntry) => {
      if (patientId) {
        saveToleranceEntry(patientId, entry);
      }
      setShowToleranceModal(false);
    },
    [patientId, saveToleranceEntry],
  );

  const handleFeedingRouteSave = useCallback(
    (entry: FeedingRouteEntry) => {
      if (patientId) {
        saveRoute(patientId, entry);
      }
      setShowFeedingRouteModal(false);
    },
    [patientId, saveRoute],
  );

  const handleGrowthSave = useCallback(
    (measurement: GrowthMeasurement) => {
      if (patientId) {
        saveGrowthMeasurement(patientId, measurement);
      }
      setShowGrowthModal(false);
    },
    [patientId, saveGrowthMeasurement],
  );

  const handleCreateWeaningPlan = useCallback(() => {
    if (patientId && patient) {
      const plan = generateDefaultWeaningPlan(patient);
      savePlan(patientId, plan);
    }
  }, [patientId, patient, savePlan]);

  const handleAdvanceWeaningPhase = useCallback(() => {
    if (patientId && weaningPlan) {
      const advanced = advancePlanPhase(weaningPlan);
      savePlan(patientId, advanced);
    }
  }, [patientId, weaningPlan, savePlan]);

  if (!patient) {
    return (
      <div className={styles.page}>
        <Link to="/patients" className={styles.backLink}>
          <ArrowLeft size={16} />
          患者一覧に戻る
        </Link>
        <EmptyState
          icon={<Calendar size={48} />}
          title="患者が見つかりません"
          description="患者データが存在しないか、削除された可能性があります。"
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/patients" className={styles.backLink}>
        <ArrowLeft size={16} />
        患者一覧に戻る
      </Link>

      {/* Patient Profile */}
      <section className={styles.section}>
        <PatientProfileCard patient={patient} daysAdmitted={daysAdmitted} />
      </section>

      {/* Clinical Alerts — always shown when alerts exist */}
      <section className={styles.section}>
        <ClinicalAlertsPanel
          patient={patient}
          labData={labData}
          latestMenu={latestMenu}
        />
      </section>

      {/* Growth Summary (pediatric only) */}
      {isPediatric && patient && (
        <section className={styles.section}>
          <GrowthSummaryCard patient={patient} measurements={growthData} />
        </section>
      )}

      {/* Two-Column Layout */}
      <div className={styles.twoColumn}>
        <div className={styles.columnLeft}>
          <NutritionStatusPanel
            patient={patient}
            labData={labData}
            latestMenu={latestMenu}
            menus={patientMenus}
          />
          <ActiveMenuCard
            latestMenu={latestMenu}
            todayMenus={todayMenus}
            patientId={patientId ?? ""}
          />
          {isPediatric && (
            <FeedingRoutePanel
              history={feedingHistory}
              onAddEntry={() => setShowFeedingRouteModal(true)}
            />
          )}
          {isPediatric && patient && (
            <WeaningPanel
              patientId={patientId ?? ""}
              patient={patient}
              plan={weaningPlan}
              onCreatePlan={handleCreateWeaningPlan}
              onAdvancePhase={handleAdvanceWeaningPhase}
            />
          )}
          {/* Tolerance Panel: shown for all patients receiving enteral feeding */}
          <TolerancePanel
            history={toleranceHistory}
            onAddEntry={() => setShowToleranceModal(true)}
          />
        </div>

        <div className={styles.columnRight}>
          <LabOverviewGrid
            labData={labData}
            labHistory={labHistory}
            onEditLabs={handleEditLabs}
          />
          <FluidBalancePanel
            history={fluidHistory}
            patientWeight={patient.weight}
            onAddEntry={handleOpenFluidModal}
          />
          {labHistory.length >= 2 && <LabTrendChart history={labHistory} />}
          {patientMenus.length >= 2 && (
            <NutritionTrendChart menus={patientMenus} />
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <StickyActionBar
        patientId={patientId ?? ""}
        hasMenus={patientMenus.length > 0}
        onEditLabs={handleEditLabs}
        onOpenAdvisor={handleOpenAdvisor}
        onPrint={handlePrint}
        isPediatric={isPediatric}
        onAddGrowthEntry={() => setShowGrowthModal(true)}
        onAddFeedingRoute={() => setShowFeedingRouteModal(true)}
      />

      {/* Lab Data Entry Modal */}
      <Modal
        isOpen={showLabModal}
        title="検査値入力"
        onClose={() => setShowLabModal(false)}
      >
        {patientId && (
          <LabDataForm
            patientId={patientId}
            initialData={labData}
            onSave={handleLabSave}
            onCancel={() => setShowLabModal(false)}
          />
        )}
      </Modal>

      {/* Fluid Balance Entry Modal */}
      <Modal
        isOpen={showFluidModal}
        title="水分出納入力"
        onClose={() => setShowFluidModal(false)}
      >
        {patientId && (
          <FluidBalanceForm
            patientId={patientId}
            onSave={handleFluidSave}
            onCancel={() => setShowFluidModal(false)}
          />
        )}
      </Modal>

      {/* Tolerance Entry Modal */}
      <Modal
        isOpen={showToleranceModal}
        title="経腸栄養耐性評価入力"
        onClose={() => setShowToleranceModal(false)}
      >
        {patientId && (
          <ToleranceEntryForm
            patientId={patientId}
            onSave={handleToleranceSave}
            onCancel={() => setShowToleranceModal(false)}
          />
        )}
      </Modal>

      {/* Feeding Route Form Modal */}
      <Modal
        isOpen={showFeedingRouteModal}
        title="投与ルート登録"
        onClose={() => setShowFeedingRouteModal(false)}
      >
        {patientId && (
          <FeedingRouteForm
            patientId={patientId}
            onSave={handleFeedingRouteSave}
            onCancel={() => setShowFeedingRouteModal(false)}
          />
        )}
      </Modal>

      {/* Growth Entry Form Modal */}
      <Modal
        isOpen={showGrowthModal}
        title="成長記録入力"
        onClose={() => setShowGrowthModal(false)}
      >
        {patientId && (
          <GrowthEntryForm
            patientId={patientId}
            onSave={handleGrowthSave}
            onCancel={() => setShowGrowthModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}
