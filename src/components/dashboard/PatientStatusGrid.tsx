import { Link } from "react-router-dom";
import { Card } from "../ui";
import type { Patient } from "../../types";
import type { NutritionMenuData } from "../../hooks/useNutritionMenus";
import { calculateAdequacyScore } from "../../services/adequacyScorer";
import styles from "./PatientStatusGrid.module.css";

interface PatientStatusGridProps {
  readonly patients: readonly Patient[];
  readonly menus: readonly NutritionMenuData[];
}

function getLatestMenu(
  patientId: string,
  menus: readonly NutritionMenuData[],
): NutritionMenuData | undefined {
  return [...menus]
    .filter((m) => m.patientId === patientId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
}

function getScoreClass(score: number): string {
  if (score >= 80) return styles.scoreGood;
  if (score >= 50) return styles.scoreFair;
  return styles.scorePoor;
}

export function PatientStatusGrid({
  patients,
  menus,
}: PatientStatusGridProps) {
  if (patients.length === 0) return null;

  return (
    <div className={styles.grid}>
      {patients.map((patient) => {
        const latestMenu = getLatestMenu(patient.id, menus);
        const adequacy =
          latestMenu?.requirements && latestMenu.currentIntake
            ? calculateAdequacyScore(
                latestMenu.requirements,
                latestMenu.currentIntake,
              )
            : null;

        return (
          <Link
            key={patient.id}
            to={`/patients/${patient.id}`}
            style={{ textDecoration: "none" }}
          >
            <Card className={styles.patientCard}>
              <div className={styles.cardHeader}>
                <span className={styles.patientName}>{patient.name}</span>
                <span className={styles.ward}>{patient.ward}</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>診断</span>
                  <span className={styles.infoValue}>
                    {patient.diagnosis || "—"}
                  </span>
                </div>

                {latestMenu ? (
                  <>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>最新メニュー</span>
                      <span className={styles.infoValue}>
                        {Math.round(latestMenu.totalEnergy)} kcal
                      </span>
                    </div>
                    {adequacy !== null && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>充足スコア</span>
                        <span className={styles.infoValue}>
                          {adequacy.overall}%
                        </span>
                      </div>
                    )}
                    {adequacy !== null && (
                      <div className={styles.scoreBar}>
                        <div
                          className={`${styles.scoreFill} ${getScoreClass(adequacy.overall)}`}
                          style={{ width: `${Math.min(adequacy.overall, 100)}%` }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <span className={styles.noMenu}>メニュー未作成</span>
                )}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
