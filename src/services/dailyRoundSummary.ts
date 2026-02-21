import type { DailyRoundEntry } from "../types/dailyRound";
import {
  scoreAssessment,
  type AssessmentScoreResult,
} from "./dailyAssessmentScorer";

// ── トレンド ──

export type TrendDirection = "improving" | "stable" | "worsening";

export interface RoundTrend {
  readonly entries: readonly DailyRoundEntry[];
  readonly scores: readonly AssessmentScoreResult[];
  readonly overallTrend: TrendDirection;
  readonly giTrend: TrendDirection;
  readonly intakeTrend: TrendDirection;
  readonly daysTracked: number;
}

// ── サマリー ──

export interface RoundSummary {
  readonly latestScore: AssessmentScoreResult | null;
  readonly trend: RoundTrend;
  readonly energyAchievementPercent: number;
  readonly proteinAchievementPercent: number;
  readonly criticalWarnings: readonly string[];
  readonly daysSinceAdmission: number;
}

// ── ヘルパー ──

const MIN_ENTRIES_FOR_TREND = 3;
const TREND_DIFF_THRESHOLD = 5;

function sortByCreatedAtDesc(
  entries: readonly DailyRoundEntry[],
): DailyRoundEntry[] {
  return [...entries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

function sortByCreatedAtAsc(
  entries: readonly DailyRoundEntry[],
): DailyRoundEntry[] {
  return [...entries].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function detectTrend(
  scores: readonly AssessmentScoreResult[],
  extractor: (s: AssessmentScoreResult) => number,
): TrendDirection {
  if (scores.length < MIN_ENTRIES_FOR_TREND) return "stable";

  const midpoint = Math.floor(scores.length / 2);
  const newerAvg = average(scores.slice(0, midpoint).map(extractor));
  const olderAvg = average(scores.slice(midpoint).map(extractor));
  const diff = newerAvg - olderAvg;

  if (diff > TREND_DIFF_THRESHOLD) return "improving";
  if (diff < -TREND_DIFF_THRESHOLD) return "worsening";
  return "stable";
}

// ── メイントレンド分析 ──

export function analyzeRoundTrend(
  entries: readonly DailyRoundEntry[],
): RoundTrend {
  if (entries.length === 0) {
    return {
      entries: [],
      scores: [],
      overallTrend: "stable",
      giTrend: "stable",
      intakeTrend: "stable",
      daysTracked: 0,
    };
  }

  const sorted = sortByCreatedAtDesc(entries);
  const scores = sorted.map((e) =>
    scoreAssessment(e.assessment, e.adjustedPlan.requirements),
  );

  const uniqueDates = new Set(sorted.map((e) => e.date));

  return {
    entries: sorted,
    scores,
    overallTrend: detectTrend(scores, (s) => s.overall),
    giTrend: detectTrend(scores, (s) => s.giScore),
    intakeTrend: detectTrend(scores, (s) => s.intakeScore),
    daysTracked: uniqueDates.size,
  };
}

// ── サマリー生成 ──

export function generateRoundSummary(
  entries: readonly DailyRoundEntry[],
  admissionDate: string,
): RoundSummary {
  const trend = analyzeRoundTrend(entries);

  if (entries.length === 0) {
    return {
      latestScore: null,
      trend,
      energyAchievementPercent: 0,
      proteinAchievementPercent: 0,
      criticalWarnings: [],
      daysSinceAdmission: 0,
    };
  }

  const sorted = sortByCreatedAtDesc([...entries]);
  const latest = sorted[0];
  const req = latest.adjustedPlan.requirements;

  const latestScore = scoreAssessment(latest.assessment, req);

  const energyAchievement =
    req.energy > 0
      ? Math.round(
          (latest.assessment.actualIntake.estimatedEnergy / req.energy) * 100,
        )
      : 0;
  const proteinAchievement =
    req.protein > 0
      ? Math.round(
          (latest.assessment.actualIntake.estimatedProtein / req.protein) * 100,
        )
      : 0;

  const criticalWarnings = latestScore.warnings.filter(
    (w) =>
      w.includes("消失") ||
      w.includes("昏睡") ||
      w.includes("SpO2") ||
      w.includes("乏尿") ||
      w.includes("低体温"),
  );

  const admissionMs = new Date(admissionDate).getTime();
  const latestMs = new Date(latest.date).getTime();
  const daysSinceAdmission = Math.max(
    0,
    Math.floor((latestMs - admissionMs) / (1000 * 60 * 60 * 24)),
  );

  return {
    latestScore,
    trend,
    energyAchievementPercent: energyAchievement,
    proteinAchievementPercent: proteinAchievement,
    criticalWarnings,
    daysSinceAdmission,
  };
}

// ── チャートデータ変換 ──

export interface ChartDataPoint {
  readonly date: string;
  readonly overall: number;
  readonly gi: number;
  readonly vital: number;
  readonly intake: number;
  readonly energyPercent: number;
  readonly proteinPercent: number;
}

export function toChartData(
  entries: readonly DailyRoundEntry[],
): readonly ChartDataPoint[] {
  const sorted = sortByCreatedAtAsc(entries);

  return sorted.map((entry) => {
    const req = entry.adjustedPlan.requirements;
    const score = scoreAssessment(entry.assessment, req);

    const energyPercent =
      req.energy > 0
        ? Math.round(
            (entry.assessment.actualIntake.estimatedEnergy / req.energy) * 100,
          )
        : 0;
    const proteinPercent =
      req.protein > 0
        ? Math.round(
            (entry.assessment.actualIntake.estimatedProtein / req.protein) * 100,
          )
        : 0;

    return {
      date: entry.date,
      overall: score.overall,
      gi: score.giScore,
      vital: score.vitalScore,
      intake: score.intakeScore,
      energyPercent,
      proteinPercent,
    };
  });
}
