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

// ─── P002 佐藤花子（12歳, 重症肺炎 PICU）─── 経鼻胃管→経口移行中 ───

const P002_PHASES: readonly WeaningPhaseConfig[] = [
  {
    phase: 'trophic', label: '少量経腸栄養(トロフィック)',
    enteralPercent: 20, oralPercent: 0, parenteralPercent: 80,
    durationDays: 3,
    advanceCriteria: ['GRV<100mL', '嘔吐なし', '腸蠕動音確認'],
    holdCriteria: ['嘔吐持続', '腹部膨満増悪', 'GRV>200mL'],
  },
  {
    phase: 'advancing', label: '増量段階',
    enteralPercent: 60, oralPercent: 0, parenteralPercent: 40,
    durationDays: 4,
    advanceCriteria: ['目標の60%達成', '耐性良好', '炎症改善傾向'],
    holdCriteria: ['耐性不良', '発熱増悪', '呼吸状態悪化'],
  },
  {
    phase: 'full-enteral', label: '全量経腸栄養',
    enteralPercent: 100, oralPercent: 0, parenteralPercent: 0,
    durationDays: 3,
    advanceCriteria: ['目標エネルギー100%達成', 'TPN離脱完了', '電解質安定'],
    holdCriteria: ['耐性不良', '体重減少'],
  },
  {
    phase: 'oral-introduction', label: '経口摂取導入',
    enteralPercent: 60, oralPercent: 40, parenteralPercent: 0,
    durationDays: 5,
    advanceCriteria: ['嚥下評価良好', '抜管後安定', '経口摂取意欲あり'],
    holdCriteria: ['嚥下障害', '誤嚥リスク', '呼吸不安定'],
  },
  {
    phase: 'oral-transition', label: '経口移行段階',
    enteralPercent: 20, oralPercent: 80, parenteralPercent: 0,
    durationDays: 5,
    advanceCriteria: ['経口で必要量の80%以上', '体重安定', '排便正常'],
    holdCriteria: ['経口摂取不良', '体重減少', '嚥下困難'],
  },
  {
    phase: 'full-oral', label: '完全経口摂取',
    enteralPercent: 0, oralPercent: 100, parenteralPercent: 0,
    durationDays: 2,
    advanceCriteria: ['チューブ抜去', '全量経口で栄養充足', '退院基準達成'],
    holdCriteria: ['経口不足', '体重減少'],
  },
]

const P002_MILESTONES: readonly WeaningMilestone[] = [
  {
    id: 'P002-M1', phase: 'trophic',
    description: 'トロフィック栄養開始・腸管耐性確認',
    targetDate: daysAgoISO(7),
    completedDate: daysAgoISO(8),
    criteria: ['GRV<100mL', '嘔吐なし'],
    met: true,
  },
  {
    id: 'P002-M2', phase: 'advancing',
    description: '経腸栄養目標60%達成',
    targetDate: daysAgoISO(3),
    completedDate: daysAgoISO(4),
    criteria: ['目標の60%達成', '耐性良好'],
    met: true,
  },
  {
    id: 'P002-M3', phase: 'full-enteral',
    description: 'TPN離脱・全量経腸栄養',
    targetDate: daysAgoISO(1),
    completedDate: daysAgoISO(1),
    criteria: ['TPN離脱完了', '目標エネルギー達成'],
    met: true,
  },
  {
    id: 'P002-M4', phase: 'oral-introduction',
    description: '経口摂取開始（嚥下評価後）',
    targetDate: daysFromNowISO(2),
    criteria: ['嚥下評価良好', '抜管後安定'],
    met: false,
  },
  {
    id: 'P002-M5', phase: 'oral-transition',
    description: '経口で必要量の80%達成',
    targetDate: daysFromNowISO(7),
    criteria: ['経口で必要量の80%以上'],
    met: false,
  },
  {
    id: 'P002-M6', phase: 'full-oral',
    description: 'チューブ抜去・完全経口',
    targetDate: daysFromNowISO(9),
    criteria: ['チューブ抜去', '全量経口で栄養充足'],
    met: false,
  },
]

const P002_PLAN: WeaningPlan = {
  id: 'WP-P002-001',
  patientId: 'P002',
  createdDate: daysAgoISO(12),
  targetCompletionDate: daysFromNowISO(9),
  currentPhase: 'oral-introduction',
  phases: P002_PHASES,
  milestones: P002_MILESTONES,
  notes: '12歳女児、重症肺炎回復期。TPN離脱済み、全量経腸に移行。抜管後の嚥下評価待ち。',
  isActive: true,
}

// ─── P011 木村蒼太（3歳, 急性脳炎 PICU）─── 経鼻胃管持続投与中 ───

const P011_PHASES: readonly WeaningPhaseConfig[] = [
  {
    phase: 'trophic', label: '少量経腸栄養(トロフィック)',
    enteralPercent: 30, oralPercent: 0, parenteralPercent: 70,
    durationDays: 3,
    advanceCriteria: ['GRV<50mL', '嘔吐なし', '腸蠕動音確認'],
    holdCriteria: ['嘔吐持続', '痙攣発作', '意識レベル低下'],
  },
  {
    phase: 'advancing', label: '増量段階',
    enteralPercent: 70, oralPercent: 0, parenteralPercent: 30,
    durationDays: 5,
    advanceCriteria: ['目標の70%達成', 'フェニトイン安定', '耐性良好'],
    holdCriteria: ['痙攣再発', '嘔吐', '消化管機能低下'],
  },
  {
    phase: 'full-enteral', label: '全量経腸栄養',
    enteralPercent: 100, oralPercent: 0, parenteralPercent: 0,
    durationDays: 5,
    advanceCriteria: ['TPN離脱完了', '目標エネルギー達成', '意識レベル改善'],
    holdCriteria: ['不耐症状', '体重減少'],
  },
  {
    phase: 'oral-introduction', label: '経口摂取導入',
    enteralPercent: 50, oralPercent: 50, parenteralPercent: 0,
    durationDays: 7,
    advanceCriteria: ['意識清明', '嚥下評価良好', '経口摂取意欲あり'],
    holdCriteria: ['意識障害', '嚥下困難', '誤嚥リスク'],
  },
  {
    phase: 'full-oral', label: '完全経口摂取',
    enteralPercent: 0, oralPercent: 100, parenteralPercent: 0,
    durationDays: 3,
    advanceCriteria: ['チューブ抜去', '経口で必要量充足', '退院基準達成'],
    holdCriteria: ['経口摂取不良', '嚥下障害再燃'],
  },
]

const P011_MILESTONES: readonly WeaningMilestone[] = [
  {
    id: 'P011-M1', phase: 'trophic',
    description: 'トロフィック栄養開始・腸管耐性確認',
    targetDate: daysAgoISO(8),
    completedDate: daysAgoISO(9),
    criteria: ['GRV<50mL', '嘔吐なし'],
    met: true,
  },
  {
    id: 'P011-M2', phase: 'advancing',
    description: '経腸栄養目標70%達成',
    targetDate: daysAgoISO(3),
    criteria: ['目標の70%達成', '耐性良好'],
    met: false,
  },
  {
    id: 'P011-M3', phase: 'full-enteral',
    description: 'TPN離脱・全量経腸栄養',
    targetDate: daysFromNowISO(2),
    criteria: ['TPN離脱完了', '目標エネルギー達成'],
    met: false,
  },
  {
    id: 'P011-M4', phase: 'oral-introduction',
    description: '経口摂取開始（意識回復後）',
    targetDate: daysFromNowISO(9),
    criteria: ['意識清明', '嚥下評価良好'],
    met: false,
  },
  {
    id: 'P011-M5', phase: 'full-oral',
    description: 'チューブ抜去・完全経口',
    targetDate: daysFromNowISO(12),
    criteria: ['チューブ抜去', '経口で必要量充足'],
    met: false,
  },
]

const P011_PLAN: WeaningPlan = {
  id: 'WP-P011-001',
  patientId: 'P011',
  createdDate: daysAgoISO(10),
  targetCompletionDate: daysFromNowISO(12),
  currentPhase: 'advancing',
  phases: P011_PHASES,
  milestones: P011_MILESTONES,
  notes: '3歳男児、急性脳炎。フェニトイン投与中（経腸時に前後2h中断）。意識レベル改善に合わせて段階的に移行。',
  isActive: true,
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

// ─── P013 井上大翔（8歳, 虫垂炎術後）─── 経腸→経口移行順調 ───

const P013_PHASES: readonly WeaningPhaseConfig[] = [
  {
    phase: 'trophic', label: '少量経腸栄養(トロフィック)',
    enteralPercent: 30, oralPercent: 0, parenteralPercent: 70,
    durationDays: 2,
    advanceCriteria: ['腸蠕動音確認', 'GRV<100mL', '排便・排ガス確認'],
    holdCriteria: ['腸閉塞所見', '腹部膨満増悪', '嘔吐持続'],
  },
  {
    phase: 'advancing', label: '増量段階',
    enteralPercent: 80, oralPercent: 0, parenteralPercent: 20,
    durationDays: 3,
    advanceCriteria: ['目標の80%達成', '腹部症状なし', 'ドレーン排液減少'],
    holdCriteria: ['腹痛増悪', '発熱', 'ドレーン排液増加'],
  },
  {
    phase: 'full-enteral', label: '全量経腸栄養',
    enteralPercent: 100, oralPercent: 0, parenteralPercent: 0,
    durationDays: 2,
    advanceCriteria: ['IV離脱', '目標エネルギー充足', '炎症改善'],
    holdCriteria: ['耐性不良', '腹痛'],
  },
  {
    phase: 'oral-introduction', label: '経口摂取導入',
    enteralPercent: 40, oralPercent: 60, parenteralPercent: 0,
    durationDays: 3,
    advanceCriteria: ['経口摂取良好', '嚥下問題なし', '食欲あり'],
    holdCriteria: ['嘔吐', '腹痛', '経口拒否'],
  },
  {
    phase: 'full-oral', label: '完全経口摂取',
    enteralPercent: 0, oralPercent: 100, parenteralPercent: 0,
    durationDays: 2,
    advanceCriteria: ['チューブ抜去', '経口で必要量充足', '退院基準達成'],
    holdCriteria: ['経口不足', '体調不良'],
  },
]

const P013_MILESTONES: readonly WeaningMilestone[] = [
  {
    id: 'P013-M1', phase: 'trophic',
    description: 'トロフィック栄養開始・腸管確認',
    targetDate: daysAgoISO(4),
    completedDate: daysAgoISO(5),
    criteria: ['腸蠕動音確認', '排便・排ガス確認'],
    met: true,
  },
  {
    id: 'P013-M2', phase: 'advancing',
    description: '経腸栄養目標80%達成',
    targetDate: daysAgoISO(1),
    completedDate: daysAgoISO(2),
    criteria: ['目標の80%達成', 'ドレーン排液減少'],
    met: true,
  },
  {
    id: 'P013-M3', phase: 'oral-introduction',
    description: '経口摂取開始',
    targetDate: daysFromNowISO(1),
    criteria: ['経口摂取良好', '食欲あり'],
    met: false,
  },
  {
    id: 'P013-M4', phase: 'full-oral',
    description: 'チューブ抜去・完全経口・退院準備',
    targetDate: daysFromNowISO(4),
    criteria: ['チューブ抜去', '経口で必要量充足'],
    met: false,
  },
]

const P013_PLAN: WeaningPlan = {
  id: 'WP-P013-001',
  patientId: 'P013',
  createdDate: daysAgoISO(6),
  targetCompletionDate: daysFromNowISO(4),
  currentPhase: 'full-enteral',
  phases: P013_PHASES,
  milestones: P013_MILESTONES,
  notes: '8歳男児、穿孔性虫垂炎術後。回復良好。経口摂取への移行に向けて経腸栄養から段階的に移行中。',
  isActive: true,
}

// ─── P014 斎藤結衣（15歳, 神経性やせ症）─── 慎重なRefeeding・経口移行 ───

const P014_PHASES: readonly WeaningPhaseConfig[] = [
  {
    phase: 'assessment', label: '評価段階',
    enteralPercent: 0, oralPercent: 0, parenteralPercent: 100,
    durationDays: 2,
    advanceCriteria: ['電解質安定', 'チアミン補充完了', '心電図QTc正常'],
    holdCriteria: ['重篤な電解質異常', '心電図異常', '意識障害'],
  },
  {
    phase: 'trophic', label: '少量経腸栄養（5-10kcal/kg）',
    enteralPercent: 30, oralPercent: 0, parenteralPercent: 70,
    durationDays: 5,
    advanceCriteria: ['P>2.0mg/dL', 'K>3.5mEq/L', 'Mg>1.5mEq/L', '浮腫なし'],
    holdCriteria: ['P<2.0mg/dL', 'K<3.0mEq/L', '心不全症状', '浮腫出現'],
  },
  {
    phase: 'advancing', label: '漸増段階（10-20kcal/kg）',
    enteralPercent: 60, oralPercent: 0, parenteralPercent: 40,
    durationDays: 7,
    advanceCriteria: ['電解質安定継続', '目標の60%達成', '体重+0.5kg/週以内'],
    holdCriteria: ['電解質異常再燃', '浮腫', '体重増加過剰(>1kg/週)'],
  },
  {
    phase: 'full-enteral', label: '全量経腸栄養',
    enteralPercent: 100, oralPercent: 0, parenteralPercent: 0,
    durationDays: 5,
    advanceCriteria: ['目標エネルギー充足', '電解質正常', '体重増加0.5-1kg/週'],
    holdCriteria: ['電解質異常', '体重変動大'],
  },
  {
    phase: 'oral-introduction', label: '経口摂取導入',
    enteralPercent: 50, oralPercent: 50, parenteralPercent: 0,
    durationDays: 7,
    advanceCriteria: ['経口摂取意欲あり', '心理評価安定', '体重増加維持'],
    holdCriteria: ['食事拒否', '自己誘発嘔吐', '体重急減'],
  },
  {
    phase: 'oral-transition', label: '経口移行段階',
    enteralPercent: 20, oralPercent: 80, parenteralPercent: 0,
    durationDays: 14,
    advanceCriteria: ['経口で必要量の80%', '体重増加継続', '精神科フォロー安定'],
    holdCriteria: ['体重減少', '食行動異常再燃', '電解質異常'],
  },
  {
    phase: 'full-oral', label: '完全経口摂取',
    enteralPercent: 0, oralPercent: 100, parenteralPercent: 0,
    durationDays: 7,
    advanceCriteria: ['チューブ抜去', '目標体重50%回復', '外来フォロー体制確立'],
    holdCriteria: ['体重減少再燃', '精神状態悪化'],
  },
]

const P014_MILESTONES: readonly WeaningMilestone[] = [
  {
    id: 'P014-M1', phase: 'assessment',
    description: '電解質安定・Refeeding準備完了',
    targetDate: daysAgoISO(9),
    completedDate: daysAgoISO(10),
    criteria: ['電解質安定', 'チアミン補充完了'],
    met: true,
  },
  {
    id: 'P014-M2', phase: 'trophic',
    description: '少量経腸栄養開始（5kcal/kg）・電解質維持確認',
    targetDate: daysAgoISO(4),
    completedDate: daysAgoISO(5),
    criteria: ['P>2.0mg/dL', 'K>3.5mEq/L'],
    met: true,
  },
  {
    id: 'P014-M3', phase: 'advancing',
    description: '経腸栄養漸増・10kcal/kg達成',
    targetDate: daysFromNowISO(2),
    criteria: ['目標の60%達成', '電解質安定継続'],
    met: false,
  },
  {
    id: 'P014-M4', phase: 'full-enteral',
    description: '全量経腸栄養・目標エネルギー達成',
    targetDate: daysFromNowISO(9),
    criteria: ['目標エネルギー充足', '体重増加0.5-1kg/週'],
    met: false,
  },
  {
    id: 'P014-M5', phase: 'oral-introduction',
    description: '経口摂取導入開始',
    targetDate: daysFromNowISO(14),
    criteria: ['経口摂取意欲あり', '心理評価安定'],
    met: false,
  },
  {
    id: 'P014-M6', phase: 'full-oral',
    description: '経管チューブ抜去・完全経口・退院準備',
    targetDate: daysFromNowISO(35),
    criteria: ['チューブ抜去', '目標体重50%回復'],
    met: false,
  },
]

const P014_PLAN: WeaningPlan = {
  id: 'WP-P014-001',
  patientId: 'P014',
  createdDate: daysAgoISO(11),
  targetCompletionDate: daysFromNowISO(35),
  currentPhase: 'advancing',
  phases: P014_PHASES,
  milestones: P014_MILESTONES,
  notes: '15歳女児、神経性やせ症BMI12.0。Refeeding最高リスク。電解質1日2回モニタリング継続。精神科・栄養科・小児科チームで管理。',
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
  P002: [P002_PLAN],
  P011: [P011_PLAN],
  P012: [P012_PLAN],
  P013: [P013_PLAN],
  P014: [P014_PLAN],
  P015: [P015_PLAN],
}
