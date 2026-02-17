import { useMemo } from "react";
import { Activity, Lightbulb } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import { AdequacyScoreBadge } from "../../components/ui/AdequacyScoreBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { calculateAdequacyScore } from "../../services/adequacyScorer";
import type { AdequacyBreakdown } from "../../services/adequacyScorer";
import { generateStrategySummary } from "../../services/nutritionAdvisor";
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

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function nutritionTypeLabel(type: "enteral" | "parenteral"): string {
  return type === "enteral" ? "経腸栄養" : "静脈栄養";
}

function nutritionTypeBadgeVariant(
  type: "enteral" | "parenteral"
): "info" | "warning" {
  return type === "enteral" ? "info" : "warning";
}

function AdequacySection({
  adequacy,
  latestMenu,
}: {
  readonly adequacy: AdequacyBreakdown;
  readonly latestMenu: NutritionMenuData;
}) {
  return (
    <div className={styles.adequacySection}>
      <div className={styles.scoreCenter}>
        <AdequacyScoreBadge score={adequacy.overall} size="lg" />
      </div>

      <div className={styles.progressBars}>
        <ProgressBar
          current={adequacy.macroScore}
          max={100}
          label="マクロ栄養素"
        />
        <ProgressBar
          current={adequacy.electrolyteScore}
          max={100}
          label="電解質"
        />
        <ProgressBar
          current={adequacy.traceElementScore}
          max={100}
          label="微量元素"
        />
      </div>

      <div className={styles.menuMeta}>
        <span className={styles.menuName}>{latestMenu.menuName}</span>
        <span>最終更新: {formatDate(latestMenu.createdAt)}</span>
      </div>
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

function MenuStatsSection({
  latestMenu,
}: {
  readonly latestMenu: NutritionMenuData;
}) {
  return (
    <div className={styles.statsRow}>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>エネルギー</span>
        <span className={styles.statValue}>
          {latestMenu.totalEnergy}
          <span className={styles.statUnit}> kcal</span>
        </span>
      </div>

      <div className={styles.statItem}>
        <span className={styles.statLabel}>水分量</span>
        <span className={styles.statValue}>
          {latestMenu.totalVolume}
          <span className={styles.statUnit}> mL</span>
        </span>
      </div>

      <div className={styles.statItem}>
        <span className={styles.statLabel}>品目数</span>
        <span className={styles.statValue}>
          {latestMenu.items.length}
          <span className={styles.statUnit}> 品目</span>
        </span>
      </div>

      <div className={styles.typeBadge}>
        <Badge variant={nutritionTypeBadgeVariant(latestMenu.nutritionType)}>
          {nutritionTypeLabel(latestMenu.nutritionType)}
        </Badge>
      </div>
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
      latestMenu.currentIntake
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

        {/* Section A: Adequacy Score */}
        {hasAdequacy && latestMenu && (
          <AdequacySection adequacy={adequacy} latestMenu={latestMenu} />
        )}

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

        {/* Section C: Menu Summary Stats */}
        {hasMenu && latestMenu && (
          <>
            <hr className={styles.divider} />
            <MenuStatsSection latestMenu={latestMenu} />
          </>
        )}
      </div>
    </Card>
  );
}
