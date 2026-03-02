import { Check, Info, X } from "lucide-react";
import type { NutritionType } from "../../types";
import { VolumeStepper } from "./VolumeStepper";
import styles from "./ProductChip.module.css";

interface ProductChipProps {
  readonly product: Record<string, string | number>;
  readonly isSelected: boolean;
  readonly isExpanded: boolean;
  readonly menuItem?: {
    readonly id: string;
    readonly volume: number;
    readonly frequency: number;
  };
  readonly onToggle: () => void;
  readonly onExpand: () => void;
  readonly onInfo: () => void;
  readonly onUpdate?: (field: "volume" | "frequency", value: number) => void;
  readonly onRemove?: () => void;
  readonly nutritionType: NutritionType;
}

export function ProductChip({
  product,
  isSelected,
  isExpanded,
  menuItem,
  onToggle,
  onExpand,
  onInfo,
  onUpdate,
  onRemove,
  nutritionType,
}: ProductChipProps) {
  const name = String(product["製剤名"] ?? "");
  const maker = String(product["メーカー"] ?? "");
  const energy = product["エネルギー[kcal/ml]"] ?? 0;

  const isEnteral = nutritionType === "enteral";
  const volumeStep = isEnteral ? 25 : 50;

  const chipClass = [
    styles.chip,
    isSelected
      ? isEnteral
        ? styles.chipSelectedEnteral
        : styles.chipSelectedParenteral
      : "",
    isExpanded ? styles.chipExpanded : "",
  ]
    .filter(Boolean)
    .join(" ");

  const checkmarkClass = [
    styles.checkmark,
    isEnteral ? styles.checkmarkEnteral : styles.checkmarkParenteral,
  ].join(" ");

  const handleChipClick = () => {
    if (isSelected) {
      onExpand();
    } else {
      onToggle();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleChipClick();
    }
  };

  return (
    <div
      className={chipClass}
      onClick={handleChipClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${name} ${isSelected ? "選択済み" : "未選択"}`}
    >
      {isSelected && (
        <span className={checkmarkClass}>
          <Check size={12} strokeWidth={3} />
        </span>
      )}

      <button
        type="button"
        className={styles.infoButton}
        onClick={(e) => {
          e.stopPropagation();
          onInfo();
        }}
        aria-label={`${name}の詳細`}
      >
        <Info size={12} />
      </button>

      <span className={styles.name}>{name}</span>
      <span className={styles.meta}>{maker}</span>
      <span className={styles.energy}>{energy} kcal/ml</span>

      {isExpanded && isSelected && menuItem && onUpdate && onRemove && (
        <div
          className={styles.expandedArea}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.steppers}>
            <VolumeStepper
              label="容量"
              value={menuItem.volume}
              step={volumeStep}
              min={0}
              max={2000}
              unit="ml"
              onChange={(v) => onUpdate("volume", v)}
            />
            <VolumeStepper
              label="回数"
              value={menuItem.frequency}
              step={1}
              min={1}
              max={8}
              unit="回/日"
              onChange={(v) => onUpdate("frequency", v)}
            />
          </div>
          <div className={styles.expandedFooter}>
            <span className={styles.dailyTotal}>
              1日: {Math.round(menuItem.volume * menuItem.frequency)} ml
            </span>
            <button
              type="button"
              className={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label={`${name}を削除`}
            >
              <X size={14} />
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
