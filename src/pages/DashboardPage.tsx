import { Users, AlertTriangle } from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useNutritionMenus } from "../hooks/useNutritionMenus";
import { useLabData } from "../hooks/useLabData";
import { PatientStatusGrid } from "../components/dashboard/PatientStatusGrid";
import { CriticalLabAlerts } from "../components/dashboard/CriticalLabAlerts";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const { patients } = usePatients();
  const { menus } = useNutritionMenus();
  const { getLabData } = useLabData();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>ダッシュボード</h1>
        <p className={styles.subtitle}>小児栄養管理の概要</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <AlertTriangle size={18} />
            検査値アラート
          </h2>
        </div>
        <CriticalLabAlerts patients={patients} getLabData={getLabData} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Users size={18} />
            患者ステータス
          </h2>
        </div>
        <PatientStatusGrid patients={patients} menus={menus} />
      </section>
    </div>
  );
}
