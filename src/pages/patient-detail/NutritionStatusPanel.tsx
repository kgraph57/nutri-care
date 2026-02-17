import { useMemo } from "react";
import { Activity, Lightbulb } from "lucide-react";
import { Card } from "../../components/ui";
import { AdequacyScoreBadge } from "../../components/ui/AdequacyScoreBadge";
import { calculateAdequacyScore } from "../../services/adequacyScorer";
import type { AdequacyBreakdown } from "../../services/adequacyScorer";
import { generateStrategySummary } from "../../services/nutritionAdvisor";
import { NutrientAdequacyGrid } from "./NutrientAdequacyGrid";
import type { Patient } from "../../types";
import type { LabData } from "../../types/labData";
import type { NutritionMenuData } from "../../hooks/useNutritionMenus";
import styles from "./NutritionStatusPanel.module.css";

interface NutritionStatusPanelProps {
  readonly patient: Patient;
  readonly labData: LabData | undefined;
  readonly latestMenu: NutritionMenuData | undefined;
  readonly menus: readonly NutritionMenuData[];
}

function AdequacySection({
  adequacy,
}: {
  readonly adequacy: AdequacyBreakdown;
}) {
  return (
    <div className={styles.adequacySection}>
      <div className={styles.scoreCenter}>
        <AdequacyScoreBadge score={adequacy.overall} size="lg" />
      </div>

      <NutrientAdequacyGrid adequacy={adequacy} />
    </div>
  );
}

function StrategySection({ summary }: { readonly summary: string }) {
  return (
    <div className={styles.strategySection}>
      <Lightbulb size={18} className={styles.strategyIcon} />
      <p className={styles.strategyText}>{summary}</p>
    </div>
  );
}

export function NutritionStatusPanel({
  labData,
  latestMenu,
}: NutritionStatusPanelProps) {
  const adequacy = useMemo(() => {
    if (!latestMenu?.requirements || !latestMenu?.currentIntake) {
      return null;
    }
    return calculateAdequacyScore(
      latestMenu.requirements,
      latestMenu.currentIntake,
    );
  }, [latestMenu]);

  const strategySummary = useMemo(() => {
    if (!labData) return "";
    return generateStrategySummary(labData);
  }, [labData]);

  const hasMenu = latestMenu !== undefined;
  const hasLab = labData !== undefined;
  const hasAdequacy = adequacy !== null;
  const hasStrategy = strategySummary.length > 0;

  // Fully empty state: no menu and no lab data
  if (!hasMenu && !hasLab) {
    return (
      <Card>
        <div className={styles.panel}>
          <h3 className={styles.header}>
            <Activity size={20} className={styles.headerIcon} />
            栄養ステータス
          </h3>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              メニューを作成し検査値を入力すると、栄養状態の分析が表示されます
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.panel}>
        <h3 className={styles.header}>
          <Activity size={20} className={styles.headerIcon} />
          栄養ステータス
        </h3>

        {/* Section A: Adequacy Score + Nutrient Grid */}
        {hasAdequacy && <AdequacySection adequacy={adequacy} />}

        {/* Hint when menu exists but no lab data */}
        {hasMenu && !hasLab && (
          <>
            {hasAdequacy && <hr className={styles.divider} />}
            <p className={styles.hintText}>
              検査値を入力すると推奨が表示されます
            </p>
          </>
        )}

        {/* Hint when lab data exists but no menu */}
        {!hasMenu && hasLab && hasStrategy && (
          <p className={styles.hintText}>
            メニューを作成すると充足度が表示されます
          </p>
        )}

        {/* Section B: Strategy Summary */}
        {hasStrategy && (
          <>
            {hasAdequacy && hasLab && <hr className={styles.divider} />}
            <StrategySection summary={strategySummary} />
          </>
        )}
      </div>
    </Card>
  );
}
