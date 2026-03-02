import type { NutritionType } from "../../types";
import styles from "./SubcategoryTabs.module.css";

interface SubcategoryTabsProps {
  readonly subcategories: ReadonlyArray<{
    readonly name: string;
    readonly count: number;
  }>;
  readonly activeSubcategory: string;
  readonly onSelect: (subcategory: string) => void;
  readonly nutritionType: NutritionType;
}

export function SubcategoryTabs({
  subcategories,
  activeSubcategory,
  onSelect,
  nutritionType,
}: SubcategoryTabsProps) {
  const activeClass =
    nutritionType === "enteral"
      ? styles.tabActiveEnteral
      : styles.tabActiveParenteral;

  return (
    <div className={styles.container} role="tablist" aria-label="サブカテゴリ">
      {subcategories.map((sub) => {
        const isActive = sub.name === activeSubcategory;
        return (
          <button
            key={sub.name}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[styles.tab, isActive ? activeClass : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(sub.name)}
          >
            {sub.name}
            <span className={styles.count}>{sub.count}</span>
          </button>
        );
      })}
    </div>
  );
}
