import type { NutritionType } from "../../types";
import styles from "./RunningTotal.module.css";

interface RunningTotalProps {
  readonly energy: number;
  readonly protein: number;
  readonly volume: number;
  readonly itemCount: number;
  readonly nutritionType: NutritionType;
}

export function RunningTotal({
  energy,
  protein,
  volume,
  itemCount,
  nutritionType,
}: RunningTotalProps) {
  const accentClass =
    nutritionType === "enteral" ? styles.accentEnteral : styles.accentParenteral;

  return (
    <div className={styles.bar}>
      <div className={styles.item}>
        <span className={[styles.value, accentClass].join(" ")}>
          {itemCount}
        </span>
        <span className={styles.label}>製品</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <span className={styles.value}>{Math.round(energy)}</span>
        <span className={styles.label}>kcal</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <span className={styles.value}>{Math.round(protein * 10) / 10}</span>
        <span className={styles.label}>g protein</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <span className={styles.value}>{Math.round(volume)}</span>
        <span className={styles.label}>ml/日</span>
      </div>
    </div>
  );
}
