import { useState, useMemo } from "react";
import {
  ClipboardList,
  Trash2,
  Plus,
  Pencil,
  GitCompareArrows,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNutritionMenus } from "../hooks/useNutritionMenus";
import { Card, Badge, Button, SearchInput, EmptyState } from "../components/ui";
import type { NutritionMenuData } from "../hooks/useNutritionMenus";
import styles from "./SavedMenusPage.module.css";

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function filterMenusBySearch(
  menus: readonly NutritionMenuData[],
  query: string,
): NutritionMenuData[] {
  if (query.trim() === "") {
    return [...menus];
  }
  const lowerQuery = query.toLowerCase();
  return menus.filter((menu) =>
    menu.patientName.toLowerCase().includes(lowerQuery),
  );
}

function MenuCard({
  menu,
  onDelete,
}: {
  readonly menu: NutritionMenuData;
  readonly onDelete: (id: string) => void;
}) {
  const handleDelete = () => {
    const confirmed = window.confirm(
      `「${menu.menuName}」を削除してもよろしいですか？`,
    );
    if (confirmed) {
      onDelete(menu.id);
    }
  };

  const isEnteral = menu.nutritionType === "enteral";

  return (
    <Card className={styles.menuCard}>
      <div className={styles.menuCardHeader}>
        <h3 className={styles.menuCardName}>{menu.menuName}</h3>
        <Badge variant={isEnteral ? "success" : "warning"}>
          {isEnteral ? "経腸栄養" : "静脈栄養"}
        </Badge>
      </div>

      <div className={styles.menuCardDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>患者名</span>
          <span>{menu.patientName}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>作成日</span>
          <span>{formatDate(menu.createdAt)}</span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>総エネルギー</span>
          <span className={styles.statValue}>
            {Math.round(menu.totalEnergy)} kcal
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>アイテム数</span>
          <span className={styles.statValue}>{menu.items.length} 品</span>
        </div>
      </div>

      <div className={styles.menuCardFooter}>
        <Link to={`/menu-builder/${menu.patientId}?edit=${menu.id}`}>
          <Button variant="secondary" size="sm" icon={<Pencil size={14} />}>
            編集
          </Button>
        </Link>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={handleDelete}
        >
          削除
        </Button>
      </div>
    </Card>
  );
}

export function SavedMenusPage() {
  const { menus, deleteMenu } = useNutritionMenus();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenus = useMemo(
    () => filterMenusBySearch(menus, searchQuery),
    [menus, searchQuery],
  );

  const sortedMenus = useMemo(
    () =>
      [...filteredMenus].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [filteredMenus],
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>保存済みメニュー</h1>
        <p className={styles.subtitle}>作成した栄養メニューの一覧</p>
      </header>

      {menus.length > 0 && (
        <>
          <div className={styles.toolbar}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="患者名で検索..."
            />
            {menus.length >= 2 && (
              <Link to="/compare">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<GitCompareArrows size={14} />}
                >
                  メニュー比較
                </Button>
              </Link>
            )}
          </div>

          <p className={styles.resultCount}>
            {sortedMenus.length} 件のメニュー
            {searchQuery && ` (「${searchQuery}」で絞り込み)`}
          </p>

          {sortedMenus.length > 0 ? (
            <div className={styles.menuGrid}>
              {sortedMenus.map((menu) => (
                <MenuCard key={menu.id} menu={menu} onDelete={deleteMenu} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ClipboardList size={40} />}
              title="検索結果なし"
              description={`「${searchQuery}」に一致するメニューが見つかりませんでした。`}
            />
          )}
        </>
      )}

      {menus.length === 0 && (
        <EmptyState
          icon={<ClipboardList size={40} />}
          title="保存済みメニューがありません"
          description="メニュー作成ページから栄養メニューを作成して保存してください。"
          action={
            <Link to="/menu-builder" className={styles.actionLink}>
              <Button variant="primary" icon={<Plus size={16} />}>
                メニュー作成
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
