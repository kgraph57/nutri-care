import { Link } from "react-router-dom";
import { Utensils, ExternalLink } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import type { NutritionMenuData } from "../../hooks/useNutritionMenus";
import styles from "./ActiveMenuCard.module.css";

interface ActiveMenuCardProps {
  readonly latestMenu: NutritionMenuData | undefined;
  readonly todayMenus: readonly NutritionMenuData[];
  readonly patientId: string;
}

/* ---- Helper functions ---- */

function formatMenuDate(isoString: string): string {
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
): "success" | "warning" {
  return type === "enteral" ? "success" : "warning";
}

function menuBorderColor(type: "enteral" | "parenteral"): string {
  return type === "enteral"
    ? "var(--color-success, #22c55e)"
    : "var(--color-warning, #f59e0b)";
}

function formatProductVolume(
  item: NutritionMenuData["items"][number]
): string {
  return `${item.productName} ${item.volume}mL\u00D7${item.frequency}回`;
}

/* ---- Sub-components ---- */

interface MenuItemCardProps {
  readonly menu: NutritionMenuData;
}

function MenuItemCard({ menu }: MenuItemCardProps) {
  return (
    <div
      className={styles.menuItem}
      style={
        { "--menu-border-color": menuBorderColor(menu.nutritionType) } as React.CSSProperties
      }
    >
      <div className={styles.menuHeader}>
        <Badge variant={nutritionTypeBadgeVariant(menu.nutritionType)}>
          {nutritionTypeLabel(menu.nutritionType)}
        </Badge>
        <span className={styles.menuName}>{menu.menuName}</span>
      </div>

      {menu.items.length > 0 && (
        <ul className={styles.productList}>
          {menu.items.map((item) => (
            <li key={item.id} className={styles.productItem}>
              {formatProductVolume(item)}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>エネルギー</span>
          <span className={styles.statValue}>
            {menu.totalEnergy}
            <span className={styles.statUnit}> kcal</span>
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>水分量</span>
          <span className={styles.statValue}>
            {menu.totalVolume}
            <span className={styles.statUnit}> mL</span>
          </span>
        </div>
      </div>

      <span className={styles.timestamp}>
        最終更新: {formatMenuDate(menu.createdAt)}
      </span>
    </div>
  );
}

/* ---- Empty state ---- */

function EmptyState({ patientId }: { readonly patientId: string }) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyText}>栄養メニューが未作成です</p>
      <Link
        to={`/menu-builder/${patientId}`}
        className={styles.emptyLink}
      >
        メニューを作成する
        <ExternalLink size={14} />
      </Link>
    </div>
  );
}

/* ---- Main component ---- */

export function ActiveMenuCard({
  latestMenu,
  todayMenus,
  patientId,
}: ActiveMenuCardProps) {
  const hasMenus = latestMenu !== undefined;
  const menusToDisplay: readonly NutritionMenuData[] =
    todayMenus.length > 0 ? todayMenus : latestMenu ? [latestMenu] : [];

  return (
    <Card>
      <div className={styles.panel}>
        <h3 className={styles.header}>
          <Utensils size={20} className={styles.headerIcon} />
          現在の栄養プラン
        </h3>

        {!hasMenus ? (
          <EmptyState patientId={patientId} />
        ) : (
          <>
            {menusToDisplay.map((menu, index) => (
              <div key={menu.id}>
                {index > 0 && <hr className={styles.divider} />}
                <MenuItemCard menu={menu} />
              </div>
            ))}

            <Link
              to={`/menu-builder/${patientId}`}
              className={styles.editLink}
            >
              メニューを編集
              <ExternalLink size={14} />
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}
