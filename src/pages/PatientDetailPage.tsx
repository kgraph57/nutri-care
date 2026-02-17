import { useMemo, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useNutritionMenus } from "../hooks/useNutritionMenus";
import { useLabData } from "../hooks/useLabData";
import { useFluidBalance } from "../hooks/useFluidBalance";
import type { LabData } from "../types/labData";
import type { FluidBalanceEntry } from "../types/fluidBalance";
import type { NutritionMenuData } from "../hooks/useNutritionMenus";
import {
  Card,
  Badge,
  Button,
  EmptyState,
  Modal,
  NutritionTrendChart,
} from "../components/ui";
import { LabDataForm } from "../components/labs/LabDataForm";
import { FluidBalanceForm } from "../components/fluid/FluidBalanceForm";
import { LabTrendChart } from "../components/labs/LabTrendChart";
import { LabHistoryTable } from "../components/labs/LabHistoryTable";
import { PatientProfileCard } from "./patient-detail/PatientProfileCard";
import { LabOverviewGrid } from "./patient-detail/LabOverviewGrid";
import { NutritionStatusPanel } from "./patient-detail/NutritionStatusPanel";
import { ClinicalAlertsPanel } from "./patient-detail/ClinicalAlertsPanel";
import { ActiveMenuCard } from "./patient-detail/ActiveMenuCard";
import { CaloricDebtTracker } from "./patient-detail/CaloricDebtTracker";
import { FluidBalancePanel } from "./patient-detail/FluidBalancePanel";
import { StickyActionBar } from "./patient-detail/StickyActionBar";
import styles from "./PatientDetailPage.module.css";

/* ---- Helpers ---- */

function formatDateFull(isoString: string): string {
  return new Date(isoString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupByDate(
  menus: readonly NutritionMenuData[],
): Map<string, NutritionMenuData[]> {
  const sorted = [...menus].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const groups = new Map<string, NutritionMenuData[]>();
  for (const menu of sorted) {
    const dateKey = new Date(menu.createdAt).toISOString().slice(0, 10);
    const existing = groups.get(dateKey);
    if (existing) {
      groups.set(dateKey, [...existing, menu]);
    } else {
      groups.set(dateKey, [menu]);
    }
  }
  return groups;
}

function computeDaysAdmitted(admissionDate: string): number {
  const admission = new Date(admissionDate);
  const now = new Date();
  return Math.max(
    1,
    Math.ceil((now.getTime() - admission.getTime()) / 86_400_000),
  );
}

/* ---- Timeline sub-components ---- */

interface MenuEntryProps {
  readonly menu: NutritionMenuData;
}

function MenuEntry({ menu }: MenuEntryProps) {
  const isEnteral = menu.nutritionType === "enteral";

  return (
    <Card className={styles.menuEntry}>
      <div className={styles.menuEntryHeader}>
        <span className={styles.menuEntryName}>{menu.menuName}</span>
        <Badge variant={isEnteral ? "success" : "warning"}>
          {isEnteral ? "経腸栄養" : "静脈栄養"}
        </Badge>
      </div>

      <div className={styles.menuStats}>
        <div className={styles.menuStat}>
          <span className={styles.menuStatValue}>
            {Math.round(menu.totalEnergy)}
          </span>
          <span className={styles.menuStatLabel}>kcal</span>
        </div>
        <div className={styles.menuStat}>
          <span className={styles.menuStatValue}>
            {Math.round(menu.totalVolume)}
          </span>
          <span className={styles.menuStatLabel}>mL</span>
        </div>
        <div className={styles.menuStat}>
          <span className={styles.menuStatValue}>{menu.items.length}</span>
          <span className={styles.menuStatLabel}>品目</span>
        </div>
      </div>

      {menu.items.length > 0 && (
        <ul className={styles.itemsList}>
          {menu.items.map((item) => (
            <li key={item.id} className={styles.itemChip}>
              {item.productName} {item.volume}mL&times;{item.frequency}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

interface DateGroupProps {
  readonly dateKey: string;
  readonly menus: readonly NutritionMenuData[];
}

function DateGroup({ dateKey, menus }: DateGroupProps) {
  return (
    <div className={styles.dateGroup}>
      <div className={styles.dateDot} />
      <p className={styles.dateLabel}>{formatDateFull(dateKey)}</p>
      {menus.map((menu) => (
        <MenuEntry key={menu.id} menu={menu} />
      ))}
    </div>
  );
}

/* ---- Page Component ---- */

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { getPatient } = usePatients();
  const { getMenusForPatient } = useNutritionMenus();
  const { getLabData, getLabHistory, saveLabData, deleteLabEntry } =
    useLabData();
  const { getFluidHistory, saveFluidBalance } = useFluidBalance();
  const [showLabModal, setShowLabModal] = useState(false);
  const [showFluidModal, setShowFluidModal] = useState(false);

  const patient = patientId ? getPatient(patientId) : undefined;
  const patientMenus = useMemo(
    () => (patientId ? getMenusForPatient(patientId) : []),
    [patientId, getMenusForPatient],
  );

  const dateGroups = useMemo(() => groupByDate(patientMenus), [patientMenus]);

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

  const targetEnergy = latestMenu?.requirements?.energy ?? null;
  const targetProtein = latestMenu?.requirements?.protein ?? null;

  const handleLabSave = useCallback(
    (data: LabData) => {
      if (patientId) {
        saveLabData(patientId, data);
      }
      setShowLabModal(false);
    },
    [patientId, saveLabData],
  );

  const handleDeleteLabEntry = useCallback(
    (date: string) => {
      if (patientId) {
        deleteLabEntry(patientId, date);
      }
    },
    [patientId, deleteLabEntry],
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

      {/* Section 1: Patient Profile */}
      <section className={styles.section}>
        <PatientProfileCard patient={patient} daysAdmitted={daysAdmitted} />
      </section>

      {/* Section 2: Clinical Alerts (shown only when alerts exist) */}
      <section className={styles.section}>
        <ClinicalAlertsPanel
          patient={patient}
          labData={labData}
          latestMenu={latestMenu}
        />
      </section>

      {/* Section 3: Lab Overview Grid (全18検査値) */}
      <section className={styles.section}>
        <LabOverviewGrid
          labData={labData}
          labHistory={labHistory}
          onEditLabs={handleEditLabs}
        />
      </section>

      {/* Section 4: Two-Column Layout */}
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
          <CaloricDebtTracker
            menus={patientMenus}
            targetEnergy={targetEnergy}
            targetProtein={targetProtein}
            daysAdmitted={daysAdmitted}
          />
        </div>

        <div className={styles.columnRight}>
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

      {/* Section 4: Lab History Table */}
      {labHistory.length > 0 && (
        <section className={styles.section}>
          <LabHistoryTable
            history={labHistory}
            onDelete={handleDeleteLabEntry}
          />
        </section>
      )}

      {/* Section 5: Menu Timeline */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>栄養メニュー履歴</h2>

        {patientMenus.length === 0 ? (
          <EmptyState
            icon={<Calendar size={40} />}
            title="履歴がありません"
            description="メニューを作成すると、ここに日付順で表示されます。"
            action={
              <Link to={`/menu-builder/${patientId}`}>
                <Button variant="primary" icon={<Plus size={16} />}>
                  メニュー作成
                </Button>
              </Link>
            }
          />
        ) : (
          <div className={styles.timeline}>
            {Array.from(dateGroups.entries()).map(([dateKey, menus]) => (
              <DateGroup key={dateKey} dateKey={dateKey} menus={menus} />
            ))}
          </div>
        )}
      </section>

      {/* Sticky Action Bar */}
      <StickyActionBar
        patientId={patientId ?? ""}
        hasMenus={patientMenus.length > 0}
        onEditLabs={handleEditLabs}
        onOpenAdvisor={handleOpenAdvisor}
        onPrint={handlePrint}
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
    </div>
  );
}
