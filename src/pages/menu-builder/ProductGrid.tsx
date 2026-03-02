import { useState, useMemo } from "react";
import { Package, AlertCircle, Loader2 } from "lucide-react";
import { Card, SearchInput, EmptyState } from "../../components/ui";
import { DrugInfoModal } from "../../components/DrugInfoModal";
import type { NutritionType } from "../../types";
import { SubcategoryTabs } from "./SubcategoryTabs";
import { ProductChip } from "./ProductChip";
import { RunningTotal } from "./RunningTotal";
import styles from "./ProductGrid.module.css";

interface MenuItemState {
  readonly id: string;
  readonly product: Record<string, string | number>;
  readonly volume: number;
  readonly frequency: number;
}

interface ProductGridProps {
  readonly products: Record<string, string | number>[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly menuItems: ReadonlyArray<MenuItemState>;
  readonly nutritionType: NutritionType;
  readonly onToggleProduct: (
    product: Record<string, string | number>,
  ) => void;
  readonly onRemoveProduct: (id: string) => void;
  readonly onUpdateProduct: (
    id: string,
    field: "volume" | "frequency",
    value: number,
  ) => void;
  readonly currentIntake: Record<string, number>;
}

const ALL_TAB = "すべて";

function deriveSubcategories(
  products: Record<string, string | number>[],
): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const product of products) {
    const sub = String(product["サブカテゴリ"] ?? "").trim();
    if (sub.length > 0) {
      counts.set(sub, (counts.get(sub) ?? 0) + 1);
    }
  }
  return [
    { name: ALL_TAB, count: products.length },
    ...Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count })),
  ];
}

function filterProducts(
  products: Record<string, string | number>[],
  searchTerm: string,
  activeSubcategory: string,
): Record<string, string | number>[] {
  const lowerSearch = searchTerm.toLowerCase();

  return products.filter((product) => {
    const matchesSubcategory =
      activeSubcategory === ALL_TAB ||
      String(product["サブカテゴリ"] ?? "") === activeSubcategory;

    if (!matchesSubcategory) {
      return false;
    }

    if (searchTerm === "") {
      return true;
    }

    const name = String(product["製剤名"] ?? "").toLowerCase();
    const maker = String(product["メーカー"] ?? "").toLowerCase();
    return name.includes(lowerSearch) || maker.includes(lowerSearch);
  });
}

function buildSelectedMap(
  menuItems: ReadonlyArray<MenuItemState>,
): Map<string, MenuItemState> {
  const map = new Map<string, MenuItemState>();
  for (const item of menuItems) {
    const name = String(item.product["製剤名"] ?? "");
    map.set(name, item);
  }
  return map;
}

export function ProductGrid({
  products,
  isLoading,
  error,
  menuItems,
  nutritionType,
  onToggleProduct,
  onRemoveProduct,
  onUpdateProduct,
  currentIntake,
}: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubcategory, setActiveSubcategory] = useState(ALL_TAB);
  const [expandedProductName, setExpandedProductName] = useState<string | null>(
    null,
  );
  const [infoProduct, setInfoProduct] = useState<Record<
    string,
    string | number
  > | null>(null);

  const subcategories = useMemo(
    () => deriveSubcategories(products),
    [products],
  );

  const filteredProducts = useMemo(
    () => filterProducts(products, searchTerm, activeSubcategory),
    [products, searchTerm, activeSubcategory],
  );

  const selectedMap = useMemo(() => buildSelectedMap(menuItems), [menuItems]);

  const totalVolume = useMemo(
    () =>
      menuItems.reduce((sum, item) => sum + item.volume * item.frequency, 0),
    [menuItems],
  );

  const handleToggle = (product: Record<string, string | number>) => {
    const name = String(product["製剤名"] ?? "");
    if (selectedMap.has(name)) {
      const item = selectedMap.get(name);
      if (item) {
        onRemoveProduct(item.id);
      }
      if (expandedProductName === name) {
        setExpandedProductName(null);
      }
    } else {
      onToggleProduct(product);
      setExpandedProductName(name);
    }
  };

  const handleExpand = (productName: string) => {
    setExpandedProductName((prev) =>
      prev === productName ? null : productName,
    );
  };

  return (
    <Card className={styles.card}>
      <h3 className={styles.heading}>
        <Package size={18} />
        栄養製品を選択
      </h3>

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="製品名・メーカーで検索..."
      />

      <SubcategoryTabs
        subcategories={subcategories}
        activeSubcategory={activeSubcategory}
        onSelect={setActiveSubcategory}
        nutritionType={nutritionType}
      />

      <div className={styles.gridContainer}>
        {isLoading && (
          <div className={styles.statusMessage}>
            <Loader2 size={20} className={styles.spinner} />
            <span>製品データを読み込み中...</span>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <EmptyState
            icon={<Package size={32} />}
            title="製品が見つかりません"
            description="検索条件を変更してください。"
          />
        )}

        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className={styles.grid}>
            {filteredProducts.map((product, index) => {
              const name = String(product["製剤名"] ?? "");
              const menuItem = selectedMap.get(name);
              const isSelected = menuItem !== undefined;
              const isExpanded = expandedProductName === name && isSelected;

              return (
                <ProductChip
                  key={`${name}-${index}`}
                  product={product}
                  isSelected={isSelected}
                  isExpanded={isExpanded}
                  menuItem={menuItem}
                  onToggle={() => handleToggle(product)}
                  onExpand={() => handleExpand(name)}
                  onInfo={() => setInfoProduct(product)}
                  onUpdate={
                    menuItem
                      ? (field, value) =>
                          onUpdateProduct(menuItem.id, field, value)
                      : undefined
                  }
                  onRemove={
                    menuItem
                      ? () => {
                          onRemoveProduct(menuItem.id);
                          setExpandedProductName(null);
                        }
                      : undefined
                  }
                  nutritionType={nutritionType}
                />
              );
            })}
          </div>
        )}
      </div>

      {menuItems.length > 0 && (
        <RunningTotal
          energy={currentIntake["energy"] ?? 0}
          protein={currentIntake["protein"] ?? 0}
          volume={totalVolume}
          itemCount={menuItems.length}
          nutritionType={nutritionType}
        />
      )}

      <DrugInfoModal
        isOpen={infoProduct !== null}
        onClose={() => setInfoProduct(null)}
        product={infoProduct}
      />
    </Card>
  );
}
