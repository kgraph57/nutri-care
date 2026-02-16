import { AlertTriangle } from "lucide-react";
import type { AllergyWarning } from "../../services/allergyChecker";
import styles from "./AllergyAlert.module.css";

interface AllergyAlertProps {
  readonly warnings: readonly AllergyWarning[];
}

export function AllergyAlert({ warnings }: AllergyAlertProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className={styles.alert} role="alert">
      <div className={styles.header}>
        <AlertTriangle size={18} className={styles.icon} />
        <h4 className={styles.title}>
          アレルギー警告 ({warnings.length}件)
        </h4>
      </div>
      <div className={styles.list}>
        {warnings.map((warning, index) => (
          <div key={`${warning.productName}-${warning.allergen}-${index}`} className={styles.item}>
            <span
              className={`${styles.dot} ${
                warning.severity === "high" ? styles.dotHigh : styles.dotMedium
              }`}
            />
            <span>{warning.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
