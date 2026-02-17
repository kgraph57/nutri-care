import type {
  WeaningPlan,
  WeaningPhaseConfig,
  WeaningMilestone,
} from '../types/weaningPlan'

/**
 * 離脱/移行計画サンプルデータ
 * 各患者の栄養経路離脱プランと進捗状況を管理
 */

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function daysFromNowISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// ─── P012 早産児（離脱計画：経腸栄養増量中）───

const P012_PHASES: readonly WeaningPhaseConfig[] = [
  {
    phase: 'trophic', label: '少量経腸栄養(トロフィック)',
    enteralPercent: 10, oralPercent: 0, parenteralPercent: 90,
    durationDays: 5,
    advanceCriteria: ['胃残量<体重の50%', '腹部膨満なし', '嘔吐なし'],
    holdCriteria: ['胃残量増加', '腹部膨満', 'NEC疑い所見'],
  },
  {
    phase: 'advancing', label: '増量段階',
    enteralPercent: 50, oralPercent: 0, parenteralPercent: 50,
    durationDays: 7,
    advanceCriteria: ['経腸栄養120mL/kg/日達成', '体重増加傾向', '電解質安定'],
    holdCriteria: ['不耐症状出現', '体重減少', '代謝異常'],
  },
  {
    phase: 'full-enteral', label: '全量経腸栄養',
    enteralPercent: 100, oralPercent: 0, parenteralPercent: 0,
    durationDays: 3,
    advanceCriteria: ['TPN離脱完了', '経腸のみで必要量充足', '体重増加15-20g/日'],
    holdCriteria: ['経腸栄養不耐', '体重増加不良'],
  },
  {
    phase: 'oral-introduction', label: '経口摂取導入',
    enteralPercent: 70, oralPercent: 30, parenteralPercent: 0,
    durationDays: 7,
    advanceCriteria: ['吸啜-嚥下-呼吸の協調確認', '経口摂取量増加傾向', 'SpO2低下なし'],
    holdCriteria: ['無呼吸発作', '嚥下障害', '酸素化低下'],
  },
  {
    phase: 'oral-transition', label: '経口移行段階',
    enteralPercent: 30, oralPercent: 70, parenteralPercent: 0,
    durationDays: 7,
    advanceCriteria: ['経口で必要量の70%以上', '体重増加維持', '疲労なく哺乳可能'],
    holdCriteria: ['哺乳疲労', '体重増加不良', '経口摂取量減少'],
  },
  {
    phase: 'full-oral', label: '完全経口摂取',
    enteralPercent: 0, oralPercent: 100, parenteralPercent: 0,
    durationDays: 3,
    advanceCriteria: ['経管栄養チューブ抜去', '全量経口で体重増加維持'],
    holdCriteria: ['経口摂取不良', '体重減少'],
  },
]

const P012_MILESTONES: readonly WeaningMilestone[] = [
  {
    id: 'P012-M1', phase: 'trophic',
    description: 'トロフィック栄養開始・腸管耐性確認',
    targetDate: daysAgoISO(2),
    completedDate: daysAgoISO(3),
    criteria: ['胃残量<体重の50%', '腹部膨満なし', '嘔吐なし'],
    met: true,
  },
  {
    id: 'P012-M2', phase: 'advancing',
    description: '経腸栄養120mL/kg/日達成',
    targetDate: daysFromNowISO(5),
    criteria: ['経腸栄養120mL/kg/日達成', '体重増加傾向', '電解質安定'],
    met: false,
  },
  {
    id: 'P012-M3', phase: 'full-enteral',
    description: 'TPN完全離脱・経腸のみで栄養充足',
    targetDate: daysFromNowISO(12),
    criteria: ['TPN離脱完了', '経腸のみで必要量充足'],
    met: false,
  },
  {
    id: 'P012-M4', phase: 'oral-introduction',
    description: '初回経口摂取開始',
    targetDate: daysFromNowISO(15),
    criteria: ['吸啜-嚥下-呼吸の協調確認', 'SpO2低下なし'],
    met: false,
  },
  {
    id: 'P012-M5', phase: 'oral-transition',
    description: '経口摂取で必要量の70%達成',
    targetDate: daysFromNowISO(22),
    criteria: ['経口で必要量の70%以上', '疲労なく哺乳可能'],
    met: false,
  },
  {
    id: 'P012-M6', phase: 'full-oral',
    description: '経管チューブ抜去・完全経口',
    targetDate: daysFromNowISO(25),
    criteria: ['経管栄養チューブ抜去', '全量経口で体重増加維持'],
    met: false,
  },
]

const P012_PLAN: WeaningPlan = {
  id: 'WP-P012-001',
  patientId: 'P012',
  createdDate: daysAgoISO(7),
  targetCompletionDate: daysFromNowISO(25),
  currentPhase: 'advancing',
  phases: P012_PHASES,
  milestones: P012_MILESTONES,
  notes: '在胎30週早産児。NEC既往なし。少量から慎重に増量中。',
  isActive: true,
}

// ─── P015 1歳心臓術後（離脱計画：全量経腸栄養到達）───

const P015_PHASES: readonly WeaningPhaseConfig[] = [
  {
    phase: 'trophic', label: '少量経腸栄養(トロフィック)',
    enteralPercent: 10, oralPercent: 0, parenteralPercent: 90,
    durationDays: 3,
    advanceCriteria: ['血行動態安定', '乳酸値正常化', '腸管蠕動音確認'],
    holdCriteria: ['低心拍出症候群', '乳酸値上昇', 'NEC疑い'],
  },
  {
    phase: 'advancing', label: '増量段階',
    enteralPercent: 50, oralPercent: 0, parenteralPercent: 50,
    durationDays: 4,
    advanceCriteria: ['経腸栄養100mL/kg/日達成', '循環動態安定', '利尿良好'],
    holdCriteria: ['血行動態不安定', '腸管虚血所見', '乳酸値再上昇'],
  },
  {
    phase: 'full-enteral', label: '全量経腸栄養',
    enteralPercent: 100, oralPercent: 0, parenteralPercent: 0,
    durationDays: 3,
    advanceCriteria: ['TPN離脱完了', '経腸のみで必要量充足', '体重増加傾向'],
    holdCriteria: ['経腸栄養不耐', '循環不安定'],
  },
  {
    phase: 'oral-introduction', label: '経口摂取導入',
    enteralPercent: 70, oralPercent: 30, parenteralPercent: 0,
    durationDays: 5,
    advanceCriteria: ['嚥下機能評価良好', '抜管後48時間以上経過', '経口摂取意欲あり'],
    holdCriteria: ['嚥下障害', '誤嚥リスク高', '呼吸状態不安定'],
  },
  {
    phase: 'oral-transition', label: '経口移行段階',
    enteralPercent: 30, oralPercent: 70, parenteralPercent: 0,
    durationDays: 7,
    advanceCriteria: ['経口で必要量の70%以上', '体重増加維持', '哺乳/食事良好'],
    holdCriteria: ['経口摂取不良', '体重増加不良', '心不全増悪'],
  },
  {
    phase: 'full-oral', label: '完全経口摂取',
    enteralPercent: 0, oralPercent: 100, parenteralPercent: 0,
    durationDays: 3,
    advanceCriteria: ['経管栄養チューブ抜去', '退院基準の栄養摂取量達成'],
    holdCriteria: ['経口摂取低下', '体重減少'],
  },
]

const P015_MILESTONES: readonly WeaningMilestone[] = [
  {
    id: 'P015-M1', phase: 'trophic',
    description: 'トロフィック栄養開始・循環動態安定確認',
    targetDate: daysAgoISO(9),
    completedDate: daysAgoISO(10),
    criteria: ['血行動態安定', '乳酸値正常化', '腸管蠕動音確認'],
    met: true,
  },
  {
    id: 'P015-M2', phase: 'advancing',
    description: '経腸栄養100mL/kg/日達成',
    targetDate: daysAgoISO(5),
    completedDate: daysAgoISO(5),
    criteria: ['経腸栄養100mL/kg/日達成', '循環動態安定', '利尿良好'],
    met: true,
  },
  {
    id: 'P015-M3', phase: 'full-enteral',
    description: 'TPN完全離脱・全量経腸栄養',
    targetDate: daysAgoISO(2),
    completedDate: daysAgoISO(2),
    criteria: ['TPN離脱完了', '経腸のみで必要量充足'],
    met: true,
  },
  {
    id: 'P015-M4', phase: 'oral-introduction',
    description: '初回経口摂取開始（嚥下評価後）',
    targetDate: daysFromNowISO(3),
    criteria: ['嚥下機能評価良好', '抜管後48時間以上経過', '経口摂取意欲あり'],
    met: false,
  },
  {
    id: 'P015-M5', phase: 'oral-transition',
    description: '経口摂取で必要量の70%達成',
    targetDate: daysFromNowISO(8),
    criteria: ['経口で必要量の70%以上', '哺乳/食事良好'],
    met: false,
  },
  {
    id: 'P015-M6', phase: 'full-oral',
    description: '経管チューブ抜去・退院準備',
    targetDate: daysFromNowISO(13),
    criteria: ['経管栄養チューブ抜去', '退院基準の栄養摂取量達成'],
    met: false,
  },
]

const P015_PLAN: WeaningPlan = {
  id: 'WP-P015-001',
  patientId: 'P015',
  createdDate: daysAgoISO(12),
  targetCompletionDate: daysFromNowISO(13),
  currentPhase: 'full-enteral',
  phases: P015_PHASES,
  milestones: P015_MILESTONES,
  notes: '1歳、VSD patch closure後。術後循環安定。経腸栄養増量順調、TPN離脱済み。',
  isActive: true,
}

/**
 * 全患者の離脱計画データ（Record<patientId, WeaningPlan[]>）
 * useWeaningPlanのseedデータとして使用
 */
export const sampleWeaningPlanMap: Record<string, WeaningPlan[]> = {
  P012: [P012_PLAN],
  P015: [P015_PLAN],
}
