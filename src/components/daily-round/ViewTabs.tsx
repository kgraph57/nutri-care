import { List, GitBranch, Table } from "lucide-react";
import styles from "./ViewTabs.module.css";

export type ViewMode = "timeline" | "flow" | "compare";

interface ViewTabsProps {
  readonly activeView: ViewMode;
  readonly onChangeView: (view: ViewMode) => void;
}

const TABS: readonly { mode: ViewMode; label: string; icon: typeof List }[] = [
  { mode: "timeline", label: "タイムライン", icon: List },
  { mode: "flow", label: "フロー", icon: GitBranch },
  { mode: "compare", label: "比較", icon: Table },
];

export function ViewTabs({ activeView, onChangeView }: ViewTabsProps) {
  return (
    <div className={styles.tabs}>
      {TABS.map(({ mode, label, icon: Icon }) => {
        const isActive = activeView === mode;
        const className = [styles.tab, isActive ? styles.tabActive : ""]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={mode}
            type="button"
            className={className}
            onClick={() => onChangeView(mode)}
            aria-pressed={isActive}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
