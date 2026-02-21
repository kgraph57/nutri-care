import {
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Pause,
  RefreshCw,
  TrendingUp,
  Zap,
  ShieldAlert,
} from "lucide-react";
import type { AdjustedPlan, PlanAdjustment } from "../../types/dailyRound";
import { ADJUSTMENT_TYPE_LABELS } from "../../types/dailyRound";
import { FEEDING_ADJUSTMENT_LABELS } from "../../types/toleranceData";
import type { AssessmentScoreResult, RiskLevel } from "../../services/dailyAssessmentScorer";
import styles from "./AdjustedPlanPanel.module.css";

interface AdjustedPlanPanelProps {
  readonly plan: AdjustedPlan;
  readonly score: AssessmentScoreResult;
}

// ── スコア色分け ──

function scoreColorClass(value: number): string {
  if (value >= 80) return styles.scoreOk;
  if (value >= 50) return styles.scoreMid;
  return styles.scoreLow;
}

function riskClass(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: styles.riskLow,
    moderate: styles.riskModerate,
    high: styles.riskHigh,
    critical: styles.riskCritical,
  };
  return map[level];
}

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "低リスク",
  moderate: "中リスク",
  high: "高リスク",
  critical: "最高リスク",
};

function feedingClass(adj: string): string {
  const map: Record<string, string> = {
    advance: styles.feedingAdvance,
    maintain: styles.feedingMaintain,
    reduce: styles.feedingReduce,
    hold: styles.feedingHold,
  };
  return map[adj] ?? styles.feedingMaintain;
}

function severityClass(severity: PlanAdjustment["severity"]): string {
  const map: Record<string, string> = {
    critical: styles.severityCritical,
    warning: styles.severityWarning,
    info: styles.severityInfo,
  };
  return map[severity];
}

function adjustmentIcon(type: PlanAdjustment["type"]) {
  const iconMap: Record<string, typeof ArrowUp> = {
    advance: ArrowUp,
    reduce: ArrowDown,
    maintain: Minus,
    hold: Pause,
    switch: RefreshCw,
  };
  const Icon = iconMap[type] ?? Zap;
  return <Icon size={16} />;
}

// ── コンポーネント ──

export function AdjustedPlanPanel({ plan, score }: AdjustedPlanPanelProps) {
  return (
    <div className={styles.panel}>
      {/* スコアサマリー */}
      <div className={styles.scoreRow}>
        <div className={styles.scoreCard}>
          <div className={`${styles.scoreValue} ${scoreColorClass(score.overall)}`}>
            {score.overall}
          </div>
          <div className={styles.scoreLabel}>総合</div>
        </div>
        <div className={styles.scoreCard}>
          <div className={`${styles.scoreValue} ${scoreColorClass(score.giScore)}`}>
            {score.giScore}
          </div>
          <div className={styles.scoreLabel}>消化管</div>
        </div>
        <div className={styles.scoreCard}>
          <div className={`${styles.scoreValue} ${scoreColorClass(score.vitalScore)}`}>
            {score.vitalScore}
          </div>
          <div className={styles.scoreLabel}>バイタル</div>
        </div>
        <div className={styles.scoreCard}>
          <div className={`${styles.scoreValue} ${scoreColorClass(score.intakeScore)}`}>
            {score.intakeScore}
          </div>
          <div className={styles.scoreLabel}>摂取量</div>
        </div>
      </div>

      {/* リスクレベル + 投与方針 */}
      <div style={{ display: "flex", gap: "var(--spacing-3)", alignItems: "center" }}>
        <span className={`${styles.riskBadge} ${riskClass(score.riskLevel)}`}>
          <ShieldAlert size={14} />
          {RISK_LABELS[score.riskLevel]}
        </span>
        <span className={`${styles.feedingBadge} ${feedingClass(plan.feedingAdjustment)}`}>
          <TrendingUp size={14} />
          {FEEDING_ADJUSTMENT_LABELS[plan.feedingAdjustment]}
        </span>
      </div>

      {/* 推奨プラン数値 */}
      <section>
        <h4 className={styles.sectionTitle}>
          <Zap size={16} className={styles.sectionIcon} />
          推奨プラン
        </h4>
        <div className={styles.planSummary}>
          <div className={styles.planMetric}>
            <div className={styles.planMetricValue}>{plan.totalEnergy}</div>
            <div className={styles.planMetricLabel}>kcal/日</div>
          </div>
          <div className={styles.planMetric}>
            <div className={styles.planMetricValue}>{plan.totalProtein}</div>
            <div className={styles.planMetricLabel}>タンパク質 g/日</div>
          </div>
          <div className={styles.planMetric}>
            <div className={styles.planMetricValue}>{plan.totalVolume}</div>
            <div className={styles.planMetricLabel}>投与量 mL/日</div>
          </div>
        </div>
      </section>

      {/* 栄養剤一覧 */}
      {plan.items.length > 0 && (
        <section>
          <h4 className={styles.sectionTitle}>栄養剤構成</h4>
          <table className={styles.itemTable}>
            <thead>
              <tr>
                <th>製品名</th>
                <th>量 (mL)</th>
                <th>回数/日</th>
                <th>根拠</th>
              </tr>
            </thead>
            <tbody>
              {plan.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.productName}</td>
                  <td>{item.volume}</td>
                  <td>{item.frequency}</td>
                  <td>{item.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* 調整推奨 */}
      {plan.adjustments.length > 0 && (
        <section>
          <h4 className={styles.sectionTitle}>
            <AlertTriangle size={16} className={styles.sectionIcon} />
            調整推奨
          </h4>
          <div className={styles.adjustmentList}>
            {plan.adjustments.map((adj, i) => (
              <div key={i} className={styles.adjustmentItem}>
                <span
                  className={`${styles.adjustmentIcon} ${severityClass(adj.severity)}`}
                >
                  {adjustmentIcon(adj.type)}
                </span>
                <div className={styles.adjustmentContent}>
                  <div className={`${styles.adjustmentType} ${severityClass(adj.severity)}`}>
                    {ADJUSTMENT_TYPE_LABELS[adj.type]}
                  </div>
                  <div className={styles.adjustmentReason}>{adj.reason}</div>
                  <div className={styles.adjustmentField}>{adj.field}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 警告 */}
      {plan.warnings.length > 0 && (
        <section>
          <div className={styles.warningList}>
            {plan.warnings.map((w, i) => (
              <div key={i} className={styles.warningItem}>
                <AlertTriangle size={14} />
                {w}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 総合根拠 */}
      <div className={styles.rationale}>{plan.overallRationale}</div>
    </div>
  );
}
