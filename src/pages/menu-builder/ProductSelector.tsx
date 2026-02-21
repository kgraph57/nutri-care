import { useState, useMemo } from "react";
import { Plus, Package, AlertCircle, Loader2, Info } from "lucide-react";
import { Card, SearchInput, EmptyState } from "../../components/ui";
import { DrugInfoModal } from "../../components/DrugInfoModal";
import styles from "./ProductSelector.module.css";

interface ProductSelectorProps {
  readonly products: Record<string, string | number>[];
  readonly categories: string[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly onAddProduct: (product: Record<string, string | number>) => void;
}

function filterProducts(
  products: Record<string, string | number>[],
  searchTerm: string,
  selectedCategory: string,
): Record<string, string | number>[] {
  const lowerSearch = searchTerm.toLowerCase();

  return products.filter((product) => {
    const name = String(product["製剤名"] ?? "").toLowerCase();
    const maker = String(product["メーカー"] ?? "").toLowerCase();
    const category = String(product["カテゴリ"] ?? "").toLowerCase();

    const matchesSearch =
      searchTerm === "" ||
      name.includes(lowerSearch) ||
      maker.includes(lowerSearch) ||
      category.includes(lowerSearch);

    const matchesCategory =
      selectedCategory === "" ||
      String(product["カテゴリ"] ?? "") === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}

function ProductCard({
  product,
  onAdd,
  onInfo,
}: {
  readonly product: Record<string, string | number>;
  readonly onAdd: () => void;
  readonly onInfo: () => void;
}) {
  const name = String(product["製剤名"] ?? "");
  const maker = String(product["メーカー"] ?? "");
  const category = String(product["カテゴリ"] ?? "");
  const energy = product["エネルギー[kcal/ml]"] ?? 0;

  return (
    <div
      className={styles.productCard}
      onClick={onAdd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAdd();
        }
      }}
    >
      <div className={styles.productInfo}>
        <span className={styles.productName}>{name}</span>
        <span className={styles.productMeta}>
          {maker} - {category}
        </span>
        <span className={styles.productEnergy}>
          エネルギー: {energy}kcal/ml
        </span>
      </div>
      <div className={styles.cardActions}>
        <button
          className={styles.infoButton}
          onClick={(e) => {
            e.stopPropagation();
            onInfo();
          }}
          aria-label={`${name}の薬品情報`}
          title="薬品情報"
        >
          <Info size={14} />
        </button>
        <button
          className={styles.addButton}
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          aria-label={`${name}を追加`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function ProductSelector({
  products,
  categories,
  isLoading,
  error,
  onAddProduct,
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [infoProduct, setInfoProduct] = useState<Record<
    string,
    string | number
  > | null>(null);

  const filteredProducts = useMemo(
    () => filterProducts(products, searchTerm, selectedCategory),
    [products, searchTerm, selectedCategory],
  );

  return (
    <Card className={styles.card}>
      <h3 className={styles.heading}>
        <Package size={18} />
        栄養製品選択
      </h3>

      <div className={styles.filters}>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="製品名・メーカー・カテゴリで検索..."
        />

        <select
          className={styles.categorySelect}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="カテゴリフィルター"
        >
          <option value="">全てのカテゴリ</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.productList}>
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

        {!isLoading &&
          !error &&
          filteredProducts.map((product, index) => (
            <ProductCard
              key={`${String(product["製剤名"])}-${index}`}
              product={product}
              onAdd={() => onAddProduct(product)}
              onInfo={() => setInfoProduct(product)}
            />
          ))}
      </div>
      <DrugInfoModal
        isOpen={infoProduct !== null}
        onClose={() => setInfoProduct(null)}
        product={infoProduct}
      />
    </Card>
  );
}
