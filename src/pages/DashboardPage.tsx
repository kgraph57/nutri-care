import { Link } from "react-router-dom";
import {
  Users,
  ClipboardList,
  Plus,
  TrendingUp,
  Activity,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useNutritionMenus } from "../hooks/useNutritionMenus";
import { useLabData } from "../hooks/useLabData";
import { Card, Badge, Button, EmptyState } from "../components/ui";
import { PatientStatusGrid } from "../components/dashboard/PatientStatusGrid";
import { WeeklyNutritionChart } from "../components/dashboard/WeeklyNutritionChart";
import { CriticalLabAlerts } from "../components/dashboard/CriticalLabAlerts";
import { SIMULATION_CASES } from "../data/simulationCases";
import { useSimulationProgress } from "../hooks/useSimulationProgress";
import type { NutritionMenuData } from "../hooks/useNutritionMenus";
import type { Patient } from "../types";
import type { LabData } from "../types/labData";
import { LAB_REFERENCES } from "../types/labData";
import styles from "./DashboardPage.module.css";

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getNutritionTypeBadge(type: string) {
  const isEnteral = type === "enteral";
  return (
    <Badge variant={isEnteral ? "success" : "warning"}>
      {isEnteral ? "経腸栄養" : "静脈栄養"}
    </Badge>
  );
}

function getRecentMenus(
  menus: readonly NutritionMenuData[],
): NutritionMenuData[] {
  return [...menus]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
}

function SummaryCards({
  patientCount,
  menuCount,
  alertCount,
}: {
  readonly patientCount: number;
  readonly menuCount: number;
  readonly alertCount: number;
}) {
  return (
    <div className={styles.summaryGrid}>
      <Card className={styles.summaryCard}>
        <div className={`${styles.summaryIcon} ${styles.summaryIconPatients}`}>
          <Users size={24} />
        </div>
        <div className={styles.summaryContent}>
          <span className={styles.summaryLabel}>登録患者数</span>
          <span className={styles.summaryValue}>{patientCount}</span>
        </div>
      </Card>
      <Card className={styles.summaryCard}>
        <div className={`${styles.summaryIcon} ${styles.summaryIconMenus}`}>
          <ClipboardList size={24} />
        </div>
        <div className={styles.summaryContent}>
          <span className={styles.summaryLabel}>作成メニュー数</span>
          <span className={styles.summaryValue}>{menuCount}</span>
        </div>
      </Card>
      <Card className={styles.summaryCard}>
        <div className={`${styles.summaryIcon} ${styles.summaryIconAlerts}`}>
          <AlertTriangle size={24} />
        </div>
        <div className={styles.summaryContent}>
          <span className={styles.summaryLabel}>異常検査値</span>
          <span className={styles.summaryValue}>{alertCount}</span>
        </div>
      </Card>
    </div>
  );
}

function RecentMenuList({
  menus,
}: {
  readonly menus: readonly NutritionMenuData[];
}) {
  const recentMenus = getRecentMenus(menus);

  if (recentMenus.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={40} />}
        title="メニューがありません"
        description="メニュー作成ページから栄養メニューを作成してください。"
        action={
          <Link to="/menu-builder" className={styles.actionLink}>
            <Button variant="primary" icon={<Plus size={16} />}>
              メニュー作成
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className={styles.menuList}>
      {recentMenus.map((menu) => (
        <Card key={menu.id} className={styles.menuItem}>
          <div className={styles.menuInfo}>
            <span className={styles.menuName}>{menu.menuName}</span>
            <div className={styles.menuMeta}>
              <span>{menu.patientName}</span>
              {getNutritionTypeBadge(menu.nutritionType)}
              <span>{formatDate(menu.createdAt)}</span>
            </div>
          </div>
          <span className={styles.menuEnergy}>
            {Math.round(menu.totalEnergy)} kcal
          </span>
        </Card>
      ))}
    </div>
  );
}

function QuickActions() {
  return (
    <div className={styles.quickActions}>
      <Link to="/patients" className={styles.actionLink}>
        <Button variant="secondary" icon={<Plus size={16} />}>
          新規患者登録
        </Button>
      </Link>
      <Link to="/menu-builder" className={styles.actionLink}>
        <Button variant="primary" icon={<TrendingUp size={16} />}>
          メニュー作成
        </Button>
      </Link>
    </div>
  );
}

function countLabAlerts(
  patients: readonly Patient[],
  getLabData: (id: string) => LabData | undefined,
): number {
  let count = 0;
  for (const patient of patients) {
    const lab = getLabData(patient.id);
    if (!lab) continue;
    for (const ref of LAB_REFERENCES) {
      const value = lab[ref.key];
      if (value === undefined || value === null) continue;
      if (value < ref.normalMin || value > ref.normalMax) {
        count++;
      }
    }
  }
  return count;
}

export function DashboardPage() {
  const { patients } = usePatients();
  const { menus } = useNutritionMenus();
  const { getLabData } = useLabData();
  const { progress, completedCount } = useSimulationProgress(SIMULATION_CASES);

  const alertCount = countLabAlerts(patients, getLabData);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>ダッシュボード</h1>
        <p className={styles.subtitle}>ICU栄養管理の概要</p>
      </header>

      <SummaryCards
        patientCount={patients.length}
        menuCount={menus.length}
        alertCount={alertCount}
      />

      {completedCount > 0 && (
        <Card className={styles.simProgressCard}>
          <div className={styles.simProgressHeader}>
            <GraduationCap size={18} />
            <h3 className={styles.simProgressTitle}>症例演習の進捗</h3>
          </div>
          <div className={styles.simProgressStats}>
            <div className={styles.simProgressStat}>
              <span className={styles.simStatValue}>{completedCount}</span>
              <span className={styles.simStatLabel}>
                / {SIMULATION_CASES.length} 完了
              </span>
            </div>
            <div className={styles.simProgressStat}>
              <span className={styles.simStatValue}>
                {progress.averageScore}
              </span>
              <span className={styles.simStatLabel}>平均スコア</span>
            </div>
            <div className={styles.simProgressStat}>
              <span className={styles.simStatValue}>
                {progress.totalAttempts}
              </span>
              <span className={styles.simStatLabel}>総試行回数</span>
            </div>
          </div>
          {progress.weakCategories.length > 0 && (
            <div className={styles.simWeakCategories}>
              <span className={styles.simWeakLabel}>弱点カテゴリ:</span>
              {progress.weakCategories.map((cat) => (
                <Badge key={cat} variant="warning">
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className={styles.twoColumn}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Activity size={18} />
              週間エネルギー推移
            </h2>
          </div>
          <Card>
            <WeeklyNutritionChart menus={menus} />
          </Card>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <AlertTriangle size={18} />
              検査値アラート
            </h2>
          </div>
          <CriticalLabAlerts patients={patients} getLabData={getLabData} />
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Users size={18} />
            患者ステータス
          </h2>
        </div>
        <PatientStatusGrid patients={patients} menus={menus} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>最近のメニュー</h2>
        </div>
        <RecentMenuList menus={menus} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>クイックアクション</h2>
        </div>
        <QuickActions />
      </section>
    </div>
  );
}
