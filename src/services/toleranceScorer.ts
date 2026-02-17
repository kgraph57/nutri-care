import type {
  ToleranceEntry,
  ToleranceTrend,
  VomitingSeverity,
  AbdominalDistension,
  FeedingAdjustment,
} from '../types/toleranceData';

type ToleranceAssessment = Omit<
  ToleranceEntry,
  'id' | 'patientId' | 'toleranceScore' | 'feedingAdjustment'
>;

const VOMITING_DEDUCTIONS: Readonly<Record<VomitingSeverity, number>> = {
  none: 0, mild: -1, moderate: -3, severe: -5,
};

const DISTENSION_DEDUCTIONS: Readonly<Record<AbdominalDistension, number>> = {
  none: 0, mild: -1, moderate: -2, severe: -4,
};

const BOWEL_SOUND_DEDUCTIONS: Readonly<Record<ToleranceEntry['bowelSounds'], number>> = {
  present: 0, reduced: -1, absent: -2,
};

const BASE_SCORE = 10;
const GOOD_DAY_THRESHOLD = 7;
const ADVANCE_CONSECUTIVE_DAYS = 2;
const TREND_DIFF_THRESHOLD = 1;
const MIN_ENTRIES_FOR_TREND = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function gastricResidualDeduction(
  action: ToleranceAssessment['gastricResidualAction'],
  residual: number,
): number {
  if (action === 'hold') return -4;
  if (action === 'reduce') return -2;
  if (action === 'continue' && residual > 0) return -1;
  return 0;
}

function stoolDeduction(
  consistency: ToleranceAssessment['stoolConsistency'],
  count: number,
): number {
  if (consistency === 'watery' && count > 3) return -2;
  if (consistency === 'watery') return -1;
  return 0;
}

/** Calculate tolerance score (0-10) from assessment components. Starts at 10, deducts for symptoms. */
export function calculateToleranceScore(entry: Readonly<ToleranceAssessment>): number {
  const deductions =
    gastricResidualDeduction(entry.gastricResidualAction, entry.gastricResidual) +
    VOMITING_DEDUCTIONS[entry.vomiting] +
    DISTENSION_DEDUCTIONS[entry.abdominalDistension] +
    BOWEL_SOUND_DEDUCTIONS[entry.bowelSounds] +
    stoolDeduction(entry.stoolConsistency, entry.stoolCount);

  return clamp(BASE_SCORE + deductions, 0, BASE_SCORE);
}

/** Determine feeding adjustment: >=8 advance, >=5 maintain, >=3 reduce, <3 hold. */
export function determineFeedingAdjustment(score: number): FeedingAdjustment {
  if (score >= 8) return 'advance';
  if (score >= 5) return 'maintain';
  if (score >= 3) return 'reduce';
  return 'hold';
}

function sortEntriesByDateDesc(
  entries: readonly ToleranceEntry[],
): readonly ToleranceEntry[] {
  return [...entries].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    return dateCompare !== 0 ? dateCompare : b.time.localeCompare(a.time);
  });
}

function countConsecutiveGoodDays(sorted: readonly ToleranceEntry[]): number {
  let count = 0;
  for (const entry of sorted) {
    if (entry.toleranceScore < GOOD_DAY_THRESHOLD) break;
    count += 1;
  }
  return count;
}

function averageScore(entries: readonly ToleranceEntry[]): number {
  if (entries.length === 0) return 0;
  return entries.reduce((acc, e) => acc + e.toleranceScore, 0) / entries.length;
}

function determineTrend(sorted: readonly ToleranceEntry[]): ToleranceTrend['trend'] {
  if (sorted.length < MIN_ENTRIES_FOR_TREND) return 'stable';

  const midpoint = Math.floor(sorted.length / 2);
  const newerAvg = averageScore(sorted.slice(0, midpoint));
  const olderAvg = averageScore(sorted.slice(midpoint));
  const diff = newerAvg - olderAvg;

  if (diff > TREND_DIFF_THRESHOLD) return 'improving';
  if (diff < -TREND_DIFF_THRESHOLD) return 'worsening';
  return 'stable';
}

/**
 * Analyze tolerance trend over multiple entries.
 * Sorts by date desc, calculates average, counts consecutive good days (score >= 7),
 * and determines trend from last 3+ entries. readyToAdvance = 2+ good days && avg >= 7.
 */
export function analyzeToleranceTrend(
  entries: readonly ToleranceEntry[],
): ToleranceTrend {
  if (entries.length === 0) {
    return {
      entries: [],
      averageScore: 0,
      trend: 'stable',
      consecutiveGoodDays: 0,
      readyToAdvance: false,
    };
  }

  const sorted = sortEntriesByDateDesc(entries);
  const avg = Math.round(averageScore(sorted) * 10) / 10;
  const consecutiveGoodDays = countConsecutiveGoodDays(sorted);
  const trend = determineTrend(sorted);
  const readyToAdvance =
    consecutiveGoodDays >= ADVANCE_CONSECUTIVE_DAYS &&
    avg >= GOOD_DAY_THRESHOLD;

  return {
    entries: sorted,
    averageScore: avg,
    trend,
    consecutiveGoodDays,
    readyToAdvance,
  };
}
