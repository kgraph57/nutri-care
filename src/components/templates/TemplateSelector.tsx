import { useState, useMemo } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { MENU_TEMPLATES, type MenuTemplate } from "../../data/menuTemplates";
import type { NutritionType } from "../../types";
import { Card, Button } from "../ui";
import styles from "./TemplateSelector.module.css";

interface TemplateSelectorProps {
  readonly nutritionType: NutritionType;
  readonly products: ReadonlyArray<Record<string, string | number>>;
  readonly onApplyTemplate: (
    items: Array<{ product: Record<string, string | number>; volume: number; frequency: number }>,
  ) => void;
}

function matchProduct(
  products: ReadonlyArray<Record<string, string | number>>,
  keyword: string,
): Record<string, string | number> | undefined {
  return products.find((p) =>
    String(p["製剤名"] ?? "").includes(keyword),
  );
}

export function TemplateSelector({
  nutritionType,
  products,
  onApplyTemplate,
}: TemplateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredTemplates = useMemo(
    () => MENU_TEMPLATES.filter((t) => t.nutritionType === nutritionType),
    [nutritionType],
  );

  const handleApply = (template: MenuTemplate) => {
    const items = template.items
      .map((ti) => {
        const matched = matchProduct(products, ti.productKeyword);
        if (!matched) return null;
        return { product: matched, volume: ti.volume, frequency: ti.frequency };
      })
      .filter(
        (item): item is { product: Record<string, string | number>; volume: number; frequency: number } =>
          item !== null,
      );

    if (items.length > 0) {
      onApplyTemplate(items);
      setIsExpanded(false);
    }
  };

  if (filteredTemplates.length === 0) return null;

  return (
    <Card className={styles.card}>
      <button
        className={styles.header}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span className={styles.headerText}>
          <FileText size={16} />
          クイックテンプレート
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className={styles.list}>
          {filteredTemplates.map((template) => (
            <div key={template.id} className={styles.templateItem}>
              <div className={styles.templateInfo}>
                <span className={styles.templateName}>{template.name}</span>
                <span className={styles.templateDesc}>
                  {template.description}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApply(template)}
              >
                適用
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
