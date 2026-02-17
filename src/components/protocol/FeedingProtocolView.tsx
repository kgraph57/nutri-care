import { useState, useMemo } from "react";
import { Clock, AlertTriangle, TrendingUp } from "lucide-react";
import type { NutritionRequirements } from "../../types";
import {
  generateFeedingProtocol,
  createProtocolFromRequirements,
} from "../../services/feedingProtocol";
import { Card, Button } from "../ui";
import styles from "./FeedingProtocolView.module.css";

interface FeedingProtocolViewProps {
  readonly requirements: NutritionRequirements | null;
  readonly energyDensity?: number;
}

export function FeedingProtocolView({
  requirements,
  energyDensity: defaultDensity = 1.0,
}: FeedingProtocolViewProps) {
  const [density, setDensity] = useState(defaultDensity);
  const [hours, setHours] = useState(20);
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const protocol = useMemo(() => {
    if (!requirements) return null;
    const options = {
      ...createProtocolFromRequirements(requirements, density, isHighRisk),
      infusionHours: hours,
    };
    return generateFeedingProtocol(options);
  }, [requirements, density, hours, isHighRisk]);

  if (!requirements) return null;

  return (
    <Card className={styles.card}>
      <button
        className={styles.header}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <h3 className={styles.title}>
          <TrendingUp size={16} />
          投与プロトコル
        </h3>
        <span className={styles.toggle}>{isExpanded ? "▲" : "▼"}</span>
      </button>

      {isExpanded && protocol && (
        <div className={styles.content}>
          <div className={styles.optionsRow}>
            <label className={styles.option}>
              <span className={styles.optionLabel}>エネルギー密度</span>
              <select
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className={styles.select}
              >
                <option value={0.5}>0.5 kcal/mL</option>
                <option value={0.75}>0.75 kcal/mL</option>
                <option value={1.0}>1.0 kcal/mL</option>
                <option value={1.2}>1.2 kcal/mL</option>
                <option value={1.5}>1.5 kcal/mL</option>
                <option value={2.0}>2.0 kcal/mL</option>
              </select>
            </label>
            <label className={styles.option}>
              <span className={styles.optionLabel}>投与時間</span>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className={styles.select}
              >
                <option value={16}>16時間</option>
                <option value={18}>18時間</option>
                <option value={20}>20時間</option>
                <option value={22}>22時間</option>
                <option value={24}>24時間</option>
              </select>
            </label>
            <label className={styles.checkOption}>
              <input
                type="checkbox"
                checked={isHighRisk}
                onChange={(e) => setIsHighRisk(e.target.checked)}
              />
              <span className={styles.optionLabel}>Refeeding高リスク</span>
            </label>
          </div>

          <div className={styles.summary}>
            <span>
              <Clock size={14} />
              {protocol.daysToTarget}日で目標到達
            </span>
            <span>目標: {protocol.targetVolume}mL/日</span>
            <span>最終速度: {protocol.targetRate}mL/hr</span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>速度</th>
                  <th>投与量</th>
                  <th>エネルギー</th>
                  <th>達成率</th>
                </tr>
              </thead>
              <tbody>
                {protocol.steps.map((step) => (
                  <tr
                    key={step.day}
                    className={
                      step.percentOfTarget >= 100
                        ? styles.rowComplete
                        : ""
                    }
                  >
                    <td className={styles.dayCell}>{step.day}</td>
                    <td>{step.rate} mL/hr</td>
                    <td>{step.dailyVolume} mL</td>
                    <td>{step.dailyEnergy} kcal</td>
                    <td>
                      <div className={styles.progressWrapper}>
                        <div
                          className={styles.progressBar}
                          style={{ width: `${Math.min(step.percentOfTarget, 100)}%` }}
                        />
                        <span className={styles.progressText}>
                          {step.percentOfTarget}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {protocol.notes.length > 0 && (
            <div className={styles.notes}>
              <p className={styles.notesTitle}>
                <AlertTriangle size={14} />
                注意事項
              </p>
              <ul className={styles.notesList}>
                {protocol.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            className={styles.printButton}
          >
            プロトコル印刷
          </Button>
        </div>
      )}
    </Card>
  );
}
