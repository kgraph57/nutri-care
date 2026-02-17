// 栄養投与経路の型定義

/** 栄養投与経路 */
export type FeedingRouteType =
  | 'oral'
  | 'ng-tube'
  | 'og-tube'
  | 'nj-tube'
  | 'gastrostomy'
  | 'jejunostomy'
  | 'peripheral-iv'
  | 'central-iv';

/** 投与スケジュールモード */
export type FeedingScheduleMode = 'continuous' | 'intermittent' | 'bolus';

/** 投与スケジュール */
export interface FeedingSchedule {
  readonly id: string;
  readonly mode: FeedingScheduleMode;
  readonly startTime: string;            // HH:mm 形式
  readonly durationMinutes: number;
  readonly intervalHours?: number;       // 間欠・ボーラス投与時
  readonly volumePerSession: number;     // mL
  readonly ratePerHour?: number;         // mL/hr
}

/** 栄養投与経路エントリー */
export interface FeedingRouteEntry {
  readonly id: string;
  readonly patientId: string;
  readonly date: string;                 // ISO date string
  readonly route: FeedingRouteType;
  readonly schedule: FeedingSchedule;
  readonly notes: string;
  readonly tubeSize?: string;            // 例: "8Fr"
  readonly insertionSite?: string;       // 例: "右鼻孔"
  readonly lastChanged?: string;         // ISO date string
}

/** 栄養投与経路サマリー */
export interface FeedingRouteSummary {
  readonly currentRoute: FeedingRouteType;
  readonly currentSchedule: FeedingSchedule;
  readonly daysOnCurrentRoute: number;
  readonly routeHistory: readonly FeedingRouteEntry[];
}

/** 栄養投与経路の日本語ラベル */
export const FEEDING_ROUTE_LABELS: Record<FeedingRouteType, string> = {
  'oral': '経口',
  'ng-tube': '経鼻胃管',
  'og-tube': '経口胃管',
  'nj-tube': '経鼻空腸管',
  'gastrostomy': '胃瘻(PEG)',
  'jejunostomy': '空腸瘻',
  'peripheral-iv': '末梢静脈',
  'central-iv': '中心静脈',
} as const;

/** 投与スケジュールモードの日本語ラベル */
export const FEEDING_SCHEDULE_MODE_LABELS: Record<FeedingScheduleMode, string> = {
  'continuous': '持続投与',
  'intermittent': '間欠投与',
  'bolus': 'ボーラス投与',
} as const;
