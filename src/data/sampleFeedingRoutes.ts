import type { FeedingRouteEntry } from '../types/feedingRoute'

/**
 * 小児患者の栄養投与経路サンプルデータ
 * 各患者に1-2件の経路エントリーを持たせて経路変更の履歴を確認可能に
 */

function daysAgoDate(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// ─── P002 佐藤花子（12歳, 35kg, 重症肺炎）─── NG管→経口移行
const P002_ROUTES: FeedingRouteEntry[] = [
  {
    id: 'FR-P002-001',
    patientId: 'P002',
    date: daysAgoDate(5),
    route: 'ng-tube',
    schedule: {
      id: 'SCH-P002-001',
      mode: 'continuous',
      startTime: '08:00',
      durationMinutes: 960,
      volumePerSession: 800,
      ratePerHour: 50,
    },
    notes: '人工呼吸器管理中。経鼻胃管より持続注入開始。残渣チェック4h毎。',
    tubeSize: '12Fr',
    insertionSite: '右鼻孔',
    lastChanged: daysAgoDate(5),
  },
  {
    id: 'FR-P002-002',
    patientId: 'P002',
    date: daysAgoDate(1),
    route: 'oral',
    schedule: {
      id: 'SCH-P002-002',
      mode: 'intermittent',
      startTime: '07:00',
      durationMinutes: 30,
      intervalHours: 4,
      volumePerSession: 200,
    },
    notes: '抜管後、嚥下評価クリア。経口摂取へ移行。軟食から開始。',
  },
]

// ─── P011 木村蒼太（3歳, 14kg, 急性脳炎）─── NG管持続投与
const P011_ROUTES: FeedingRouteEntry[] = [
  {
    id: 'FR-P011-001',
    patientId: 'P011',
    date: daysAgoDate(3),
    route: 'ng-tube',
    schedule: {
      id: 'SCH-P011-001',
      mode: 'continuous',
      startTime: '06:00',
      durationMinutes: 1080,
      volumePerSession: 540,
      ratePerHour: 30,
    },
    notes: '痙攣管理中、経口不可。乳糖フリー製剤使用。フェニトイン投与前後2h注入中断。',
    tubeSize: '8Fr',
    insertionSite: '左鼻孔',
    lastChanged: daysAgoDate(3),
  },
]

// ─── P012 松本凛（早産児32週, 1.8kg）─── OG管持続少量投与
const P012_ROUTES: FeedingRouteEntry[] = [
  {
    id: 'FR-P012-001',
    patientId: 'P012',
    date: daysAgoDate(2),
    route: 'og-tube',
    schedule: {
      id: 'SCH-P012-001',
      mode: 'continuous',
      startTime: '00:00',
      durationMinutes: 1440,
      volumePerSession: 120,
      ratePerHour: 5,
    },
    notes: '母乳＋母乳強化パウダー。24h持続微量注入。腹部膨満・残渣を3h毎に確認。',
    tubeSize: '5Fr',
    insertionSite: '経口',
    lastChanged: daysAgoDate(2),
  },
]

// ─── P013 井上大翔（8歳, 28kg, 穿孔性虫垂炎術後）─── NG管間欠投与→経口
const P013_ROUTES: FeedingRouteEntry[] = [
  {
    id: 'FR-P013-001',
    patientId: 'P013',
    date: daysAgoDate(4),
    route: 'ng-tube',
    schedule: {
      id: 'SCH-P013-001',
      mode: 'intermittent',
      startTime: '08:00',
      durationMinutes: 60,
      intervalHours: 4,
      volumePerSession: 100,
      ratePerHour: 100,
    },
    notes: '術後3日目、腸蠕動回復確認後に消化態製剤で経腸栄養開始。',
    tubeSize: '10Fr',
    insertionSite: '右鼻孔',
    lastChanged: daysAgoDate(4),
  },
  {
    id: 'FR-P013-002',
    patientId: 'P013',
    date: daysAgoDate(1),
    route: 'oral',
    schedule: {
      id: 'SCH-P013-002',
      mode: 'bolus',
      startTime: '07:30',
      durationMinutes: 20,
      intervalHours: 3,
      volumePerSession: 150,
    },
    notes: '経腸栄養良好につき経口へ移行。流動食から開始、段階的にアップ予定。',
  },
]

// ─── P015 清水陽向（1歳, 7.5kg, ファロー四徴症術後）─── NG管持続投与
const P015_ROUTES: FeedingRouteEntry[] = [
  {
    id: 'FR-P015-001',
    patientId: 'P015',
    date: daysAgoDate(2),
    route: 'ng-tube',
    schedule: {
      id: 'SCH-P015-001',
      mode: 'continuous',
      startTime: '06:00',
      durationMinutes: 1200,
      volumePerSession: 500,
      ratePerHour: 25,
    },
    notes: '心不全あり水分制限中。高カロリー密度製剤（1kcal/mL）使用。利尿薬投与中→K/Mgモニタ。',
    tubeSize: '6Fr',
    insertionSite: '右鼻孔',
    lastChanged: daysAgoDate(2),
  },
]

/**
 * 全小児患者の栄養投与経路データ（Record<patientId, FeedingRouteEntry[]>）
 * useFeedingRouteのseedデータとして使用
 */
export const sampleFeedingRouteMap: Record<string, FeedingRouteEntry[]> = {
  P002: P002_ROUTES,
  P011: P011_ROUTES,
  P012: P012_ROUTES,
  P013: P013_ROUTES,
  P015: P015_ROUTES,
}
