import { useState } from "react";
import { Trash2, ShoppingCart, Info } from "lucide-react";
import { Card, Button, EmptyState } from "../../components/ui";
import { DrugInfoModal } from "../../components/DrugInfoModal";
import styles from "./MenuComposition.module.css";

interface MenuItemState {
  id: string;
  product: Record<string, string | number>;
  volume: number;
  frequency: number;
}

interface MenuCompositionProps {
  readonly items: MenuItemState[];
  readonly onRemove: (id: string) => void;
  readonly onUpdate: (
    id: string,
    field: "volume" | "frequency",
    value: number,
  ) => void;
}

function MenuItemCard({
  item,
  onRemove,
  onUpdate,
  onInfo,
}: {
  readonly item: MenuItemState;
  readonly onRemove: () => void;
  readonly onUpdate: (field: "volume" | "frequency", value: number) => void;
  readonly onInfo: () => void;
}) {
  const name = String(item.product["製剤名"] ?? "");
  const maker = String(item.product["メーカー"] ?? "");
  const dailyTotal = item.volume * item.frequency;

  return (
    <div className={styles.itemCard}>
      <div className={styles.itemHeader}>
        <div className={styles.itemInfo}>
          <span className={styles.itemName}>{name}</span>
          <span className={styles.itemMaker}>{maker}</span>
        </div>
        <div className={styles.itemActions}>
          <button
            className={styles.infoButton}
            onClick={onInfo}
            aria-label={`${name}の薬品情報`}
            title="薬品情報"
            type="button"
          >
            <Info size={13} />
          </button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={12} />}
            onClick={onRemove}
          >
            削除
          </Button>
        </div>
      </div>

      <div className={styles.inputGrid}>
        <div className={styles.inputField}>
          <label className={styles.inputLabel} htmlFor={`volume-${item.id}`}>
            容量 (ml)
          </label>
          <input
            id={`volume-${item.id}`}
            type="number"
            className={styles.numberInput}
            value={item.volume}
            onChange={(e) =>
              onUpdate("volume", parseFloat(e.target.value) || 0)
            }
            min={0}
          />
        </div>
        <div className={styles.inputField}>
          <label className={styles.inputLabel} htmlFor={`frequency-${item.id}`}>
            回数 (回/日)
          </label>
          <input
            id={`frequency-${item.id}`}
            type="number"
            className={styles.numberInput}
            value={item.frequency}
            onChange={(e) =>
              onUpdate("frequency", parseFloat(e.target.value) || 0)
            }
            min={0}
          />
        </div>
      </div>

      <div className={styles.dailyTotal}>
        1日合計: {Math.round(dailyTotal)} ml/日
      </div>
    </div>
  );
}

export function MenuComposition({
  items,
  onRemove,
  onUpdate,
}: MenuCompositionProps) {
  const [infoProduct, setInfoProduct] = useState<Record<
    string,
    string | number
  > | null>(null);

  return (
    <Card className={styles.card}>
      <h3 className={styles.heading}>
        <ShoppingCart size={18} />
        メニュー構成 ({items.length}製品)
      </h3>

      <div className={styles.itemList}>
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={32} />}
            title="製品が選択されていません"
            description="左側の製品一覧から製品を追加してください。"
          />
        ) : (
          items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onUpdate={(field, value) => onUpdate(item.id, field, value)}
              onInfo={() => setInfoProduct(item.product)}
            />
          ))
        )}
      </div>
      <DrugInfoModal
        isOpen={infoProduct !== null}
        onClose={() => setInfoProduct(null)}
        product={infoProduct}
      />
    </Card>
  );
}
