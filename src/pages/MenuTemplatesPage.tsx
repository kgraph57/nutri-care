import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronRight, AlertTriangle, Zap, Droplets } from "lucide-react";
import { MENU_TEMPLATES } from "../data/menuTemplates";
import type { MenuTemplate } from "../data/menuTemplates";
import { Card, Button, Badge, SearchInput } from "../components/ui";
import styles from "./MenuTemplatesPage.module.css";

type CategoryFilter = "all" | "standard" | "disease" | "pediatric";

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "全て",
  standard: "標準",
  disease: "疾患別",
  pediatric: "小児",
};

const CATEGORY_FILTERS: CategoryFilter[] = ["all", "standard", "disease", "pediatric"];

function matchesSearch(template: MenuTemplate, query: string): boolean {
  if (query.trim() === "") return true;
  const lower = query.toLowerCase();
  return (
    template.name.toLowerCase().includes(lower) ||
    (template.condition?.toLowerCase().includes(lower) ?? false) ||
    (template.tags?.some((t) => t.toLowerCase().includes(lower)) ?? false) ||
    template.description.toLowerCase().includes(lower)
  );
}

function NutritionTypeBadge({ type }: { readonly type: "enteral" | "parenteral" }) {
  return (
    <Badge
      variant={type === "enteral" ? "success" : "info"}
      className={styles.typeBadge}
    >
      {type === "enteral" ? "経腸" : "静脈"}
    </Badge>
  );
}

function TagChips({ tags }: { readonly tags: readonly string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className={styles.tagRow}>
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function CautionRow({ caution }: { readonly caution: string }) {
  return (
    <div className={styles.cautionRow}>
      <AlertTriangle size={14} className={styles.cautionIcon} />
      <p className={styles.cautionText}>{caution}</p>
    </div>
  );
}

function TemplateCard({
  template,
  onUse,
}: {
  readonly template: MenuTemplate;
  readonly onUse: (id: string) => void;
}) {
  const productNames = template.items.map((item) => item.productKeyword).join("、");

  return (
    <Card className={styles.card}>
      <div className={styles.cardHeader}>
        <NutritionTypeBadge type={template.nutritionType} />
        <h3 className={styles.cardTitle}>{template.name}</h3>
        {template.condition && (
          <p className={styles.cardCondition}>{template.condition}</p>
        )}
      </div>

      <p className={styles.cardDescription}>{template.description}</p>

      {template.tags && template.tags.length > 0 && (
        <TagChips tags={template.tags} />
      )}

      {template.targetEnergy !== undefined && (
        <div className={styles.targetRow}>
          <Zap size={13} className={styles.targetIcon} />
          <span className={styles.targetText}>
            目標: 約{template.targetEnergy.toLocaleString()} kcal/日
          </span>
          {template.targetProtein !== undefined && (
            <>
              <Droplets size={13} className={styles.targetIcon} />
              <span className={styles.targetText}>
                蛋白: {template.targetProtein} g/日
              </span>
            </>
          )}
        </div>
      )}

      {template.caution && <CautionRow caution={template.caution} />}

      <div className={styles.productsRow}>
        <FileText size={13} className={styles.productsIcon} />
        <span className={styles.productsText}>{productNames}</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<ChevronRight size={15} />}
        className={styles.useButton}
        onClick={() => onUse(template.id)}
      >
        メニュー作成で使う
      </Button>
    </Card>
  );
}

function CategoryFilterChips({
  active,
  onChange,
}: {
  readonly active: CategoryFilter;
  readonly onChange: (category: CategoryFilter) => void;
}) {
  return (
    <div className={styles.filterRow}>
      {CATEGORY_FILTERS.map((cat) => (
        <button
          key={cat}
          type="button"
          className={[
            styles.filterChip,
            active === cat ? styles.filterChipActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(cat)}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}

export function MenuTemplatesPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return MENU_TEMPLATES.filter((template) => {
      const categoryMatch =
        categoryFilter === "all" || template.category === categoryFilter;
      return categoryMatch && matchesSearch(template, searchQuery);
    });
  }, [categoryFilter, searchQuery]);

  const handleUseTemplate = (id: string) => {
    sessionStorage.setItem("pending-template-id", id);
    navigate("/menu-builder");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>テンプレートライブラリ</h1>
        <p className={styles.subtitle}>
          疾患・病態に合わせた栄養処方テンプレートを選択してメニュー作成を開始できます
        </p>
      </header>

      <div className={styles.toolbar}>
        <CategoryFilterChips
          active={categoryFilter}
          onChange={setCategoryFilter}
        />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="テンプレート名・疾患名で検索..."
          className={styles.searchInput}
        />
      </div>

      <p className={styles.resultCount}>
        {filteredTemplates.length} 件のテンプレート
        {searchQuery && ` (「${searchQuery}」で絞り込み)`}
      </p>

      {filteredTemplates.length > 0 ? (
        <div className={styles.grid}>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FileText size={40} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>テンプレートが見つかりません</p>
          <p className={styles.emptyDescription}>
            検索条件やフィルターを変更してください。
          </p>
        </div>
      )}
    </div>
  );
}
