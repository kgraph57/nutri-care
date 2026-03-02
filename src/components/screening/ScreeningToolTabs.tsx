import { useCallback } from "react";
import type { ScreeningToolType } from "../../types/screening";
import { SCREENING_TOOL_LABELS } from "../../types/screening";
import styles from "./ScreeningToolTabs.module.css";

interface ScreeningToolTabsProps {
  readonly activeTab: ScreeningToolType;
  readonly onChangeTab: (tab: ScreeningToolType) => void;
  readonly suggestedTool?: ScreeningToolType;
}

const TABS: readonly ScreeningToolType[] = ["nrs2002", "mna-sf", "glim"];

export function ScreeningToolTabs({
  activeTab,
  onChangeTab,
  suggestedTool,
}: ScreeningToolTabsProps) {
  const handleTabClick = useCallback(
    (tab: ScreeningToolType) => {
      onChangeTab(tab);
    },
    [onChangeTab],
  );

  return (
    <nav className={styles.tabs} role="tablist" aria-label="スクリーニングツール選択">
      {TABS.map((tab) => {
        const isActive = tab === activeTab;
        const isSuggested = tab === suggestedTool;
        const isGlim = tab === "glim";

        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            onClick={() => handleTabClick(tab)}
            type="button"
          >
            <span className={styles.tabLabel}>
              {SCREENING_TOOL_LABELS[tab]}
            </span>
            {isSuggested && (
              <span className={styles.badgeSuggested}>推奨</span>
            )}
            {isGlim && (
              <span className={styles.badgeDiagnosis}>診断</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
