import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lightbulb,
  BarChart3,
  Target,
  Shield,
  Zap,
} from "lucide-react";
import { Card } from "../ui";
import { AiChatPanel } from "../ai/AiChatPanel";
import type {
  SimulationScore,
  FeedbackItem,
  IdealAnswer,
} from "../../types/simulation";
import styles from "./ScoreResult.module.css";

interface ScoreResultProps {
  readonly score: SimulationScore;
  readonly feedback: readonly FeedbackItem[];
  readonly idealAnswer: IdealAnswer;
  readonly onRetry: () => void;
  readonly onBackToLibrary: () => void;
  readonly caseId?: string;
  readonly systemPrompt?: string;
}

function getGaugeClass(score: number): string {
  if (score >= 80) return styles.gaugeFillExcellent;
  if (score >= 60) return styles.gaugeFillGood;
  if (score >= 40) return styles.gaugeFillFair;
  return styles.gaugeFillPoor;
}

function getFeedbackIcon(type: string) {
  switch (type) {
    case "correct":
      return <CheckCircle size={16} className={styles.feedbackIconCorrect} />;
    case "warning":
      return <AlertTriangle size={16} className={styles.feedbackIconWarning} />;
    case "error":
      return <XCircle size={16} className={styles.feedbackIconError} />;
    case "tip":
      return <Lightbulb size={16} className={styles.feedbackIconTip} />;
    default:
      return <Lightbulb size={16} className={styles.feedbackIconTip} />;
  }
}

function getFeedbackStyle(type: string): string {
  switch (type) {
    case "correct":
      return styles.feedbackCorrect;
    case "warning":
      return styles.feedbackWarning;
    case "error":
      return styles.feedbackError;
    case "tip":
      return styles.feedbackTip;
    default:
      return styles.feedbackTip;
  }
}

export function ScoreResult({
  score,
  feedback,
  idealAnswer,
  onRetry,
  onBackToLibrary,
  caseId,
  systemPrompt,
}: ScoreResultProps) {
  const [showIdeal, setShowIdeal] = useState(false);

  const radarData = [
    { axis: "栄養充足", value: score.macroScore },
    { axis: "制限遵守", value: score.constraintScore },
    { axis: "安全性", value: score.safetyScore },
    { axis: "効率性", value: score.efficiencyScore },
  ];

  const circumference = 2 * Math.PI * 65;
  const dashOffset = circumference - (score.overall / 100) * circumference;

  const breakdownItems = [
    {
      label: "栄養充足度",
      value: score.macroScore,
      icon: <BarChart3 size={14} />,
      fillClass: styles.breakdownFillMacro,
    },
    {
      label: "制限遵守",
      value: score.constraintScore,
      icon: <Target size={14} />,
      fillClass: styles.breakdownFillConstraint,
    },
    {
      label: "安全性",
      value: score.safetyScore,
      icon: <Shield size={14} />,
      fillClass: styles.breakdownFillSafety,
    },
    {
      label: "効率性",
      value: score.efficiencyScore,
      icon: <Zap size={14} />,
      fillClass: styles.breakdownFillEfficiency,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.scoreHeader}>
        <div className={styles.gaugeContainer}>
          <div className={styles.gauge}>
            <svg
              className={styles.gaugeSvg}
              width="160"
              height="160"
              viewBox="0 0 160 160"
            >
              <circle className={styles.gaugeTrack} cx="80" cy="80" r="65" />
              <circle
                className={`${styles.gaugeFill} ${getGaugeClass(score.overall)}`}
                cx="80"
                cy="80"
                r="65"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className={styles.gaugeText}>
              <span className={styles.gaugeScore}>{score.overall}</span>
              <span className={styles.gaugeLabel}>/ 100</span>
            </div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 12, fill: "#6b625a" }}
              />
              <Radar
                name="スコア"
                dataKey="value"
                stroke="#6aab7b"
                fill="#6aab7b"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.breakdownBars}>
          {breakdownItems.map((item) => (
            <div key={item.label} className={styles.breakdownItem}>
              <div className={styles.breakdownHeader}>
                <span className={styles.breakdownLabel}>
                  {item.icon} {item.label}
                </span>
                <span className={styles.breakdownValue}>{item.value}点</span>
              </div>
              <div className={styles.breakdownTrack}>
                <div
                  className={`${styles.breakdownFill} ${item.fillClass}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>フィードバック</h2>
        <div className={styles.feedbackList}>
          {feedback.map((fb, idx) => (
            <div
              key={idx}
              className={`${styles.feedbackItem} ${getFeedbackStyle(fb.type)}`}
            >
              <div className={styles.feedbackIcon}>
                {getFeedbackIcon(fb.type)}
              </div>
              <div className={styles.feedbackContent}>
                <span className={styles.feedbackCategory}>{fb.category}</span>
                <span className={styles.feedbackMessage}>{fb.message}</span>
                {fb.detail && (
                  <span className={styles.feedbackDetail}>{fb.detail}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          className={`${styles.idealToggle} ${showIdeal ? styles.idealToggleActive : ""}`}
          onClick={() => setShowIdeal((prev) => !prev)}
          type="button"
        >
          <Eye size={16} />
          {showIdeal ? "模範解答を隠す" : "模範解答を見る"}
        </button>

        {showIdeal && (
          <Card className={styles.idealSection}>
            <h3 className={styles.idealSubtitle}>重要ポイント</h3>
            <ul className={styles.idealKeyPoints}>
              {idealAnswer.keyPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>

            <h3 className={styles.idealSubtitle}>解説</h3>
            <p className={styles.idealText}>{idealAnswer.rationale}</p>

            <h3 className={styles.idealSubtitle}>よくある間違い</h3>
            <ul className={styles.idealKeyPoints}>
              {idealAnswer.commonMistakes.map((mistake, idx) => (
                <li key={idx}>{mistake}</li>
              ))}
            </ul>

            <h3 className={styles.idealSubtitle}>参考文献</h3>
            <ol className={styles.idealReferences}>
              {idealAnswer.references.map((ref, idx) => (
                <li key={idx}>{ref}</li>
              ))}
            </ol>
          </Card>
        )}
      </div>

      {caseId && systemPrompt && (
        <div className={styles.aiSection}>
          <AiChatPanel
            mode="education"
            systemPrompt={systemPrompt}
            contextId={`sim-result-${caseId}`}
          />
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.backButton}
          onClick={onBackToLibrary}
          type="button"
        >
          ケース一覧に戻る
        </button>
        <button className={styles.retryButton} onClick={onRetry} type="button">
          もう一度挑戦
        </button>
      </div>
    </div>
  );
}
