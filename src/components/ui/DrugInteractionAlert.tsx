import { AlertTriangle } from "lucide-react";
import type { DrugNutrientInteraction } from "../../services/drugNutrientChecker";
import styles from "./DrugInteractionAlert.module.css";

interface DrugInteractionAlertProps {
  readonly interactions: readonly DrugNutrientInteraction[];
}

const SEVERITY_LABELS: Record<string, string> = {
  high: "重大",
  medium: "注意",
  low: "参考",
};

export function DrugInteractionAlert({
  interactions,
}: DrugInteractionAlertProps) {
  if (interactions.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>
        <AlertTriangle size={16} />
        薬剤-栄養相互作用 ({interactions.length}件)
      </p>
      {interactions.map((interaction) => {
        const severityClass =
          interaction.severity === "high"
            ? styles.alertHigh
            : interaction.severity === "medium"
              ? styles.alertMedium
              : styles.alertLow;
        const badgeClass =
          interaction.severity === "high"
            ? styles.badgeHigh
            : interaction.severity === "medium"
              ? styles.badgeMedium
              : styles.badgeLow;

        return (
          <div
            key={`${interaction.ruleId}-${interaction.drug}`}
            className={`${styles.alert} ${severityClass}`}
          >
            <div className={styles.alertHeader}>
              <span className={`${styles.severityBadge} ${badgeClass}`}>
                {SEVERITY_LABELS[interaction.severity]}
              </span>
              <span className={styles.drugName}>{interaction.drug}</span>
            </div>
            <p className={styles.interactionText}>{interaction.interaction}</p>
            <p className={styles.recommendation}>{interaction.recommendation}</p>
          </div>
        );
      })}
    </div>
  );
}
