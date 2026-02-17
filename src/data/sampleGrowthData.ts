import type { GrowthMeasurement } from '../types/growthData'

/**
 * 小児患者の成長モニタリングサンプルデータ
 * 各患者に臨床的に現実的な時系列データを持たせてトレンド確認可能に
 */

function daysAgoDate(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// ─── P002 佐藤花子（12歳F, 35kg, 148cm, 重症肺炎 PICU）─── 安定体重
const P002_GROWTH: GrowthMeasurement[] = [
  {
    id: 'gm-p002-001',
    patientId: 'P002',
    date: daysAgoDate(13),
    weight: 34.8,
    height: 148,
    notes: '入院時計測。重症肺炎、人工呼吸器管理開始。',
  },
  {
    id: 'gm-p002-002',
    patientId: 'P002',
    date: daysAgoDate(9),
    weight: 34.5,
    notes: '輸液管理中。経腸栄養20mL/h開始。軽度体重減少。',
  },
  {
    id: 'gm-p002-003',
    patientId: 'P002',
    date: daysAgoDate(5),
    weight: 34.7,
    notes: '経腸栄養40mL/hへ増量。体重安定傾向。',
  },
  {
    id: 'gm-p002-004',
    patientId: 'P002',
    date: daysAgoDate(1),
    weight: 35.0,
    height: 148,
    notes: '人工呼吸器離脱後。経口摂取開始。入院時体重に回復。',
  },
]

// ─── P011 木村蒼太（3歳M, 14kg, 95cm, 急性脳炎 PICU）─── 緩徐な体重回復
const P011_GROWTH: GrowthMeasurement[] = [
  {
    id: 'gm-p011-001',
    patientId: 'P011',
    date: daysAgoDate(12),
    weight: 13.2,
    height: 95,
    headCircumference: 49.5,
    notes: '入院時。痙攣重積後、意識障害。体重減少あり（病前14kg）。',
  },
  {
    id: 'gm-p011-002',
    patientId: 'P011',
    date: daysAgoDate(9),
    weight: 13.0,
    headCircumference: 49.5,
    notes: '絶食継続。末梢輸液のみ。さらに体重減少。',
  },
  {
    id: 'gm-p011-003',
    patientId: 'P011',
    date: daysAgoDate(6),
    weight: 13.3,
    headCircumference: 49.5,
    notes: '経腸栄養開始（乳糖フリー）。フェニトイン投与前後2h中断。',
  },
  {
    id: 'gm-p011-004',
    patientId: 'P011',
    date: daysAgoDate(3),
    weight: 13.6,
    headCircumference: 49.5,
    notes: '意識レベル改善。経腸栄養増量。緩やかな回復傾向。',
  },
  {
    id: 'gm-p011-005',
    patientId: 'P011',
    date: daysAgoDate(1),
    weight: 13.8,
    height: 95,
    headCircumference: 49.5,
    notes: '経口摂取一部開始。体重回復継続。目標14kgまで+200g。',
  },
]

// ─── P012 松本凛（早産児, 1.8kg, 42cm, NICU）─── 日々の体重増加（NICU成長パターン）
const P012_GROWTH: GrowthMeasurement[] = [
  {
    id: 'gm-p012-001',
    patientId: 'P012',
    date: daysAgoDate(10),
    weight: 1.78,
    height: 42,
    headCircumference: 29.0,
    notes: '出生体重1.80kg。生理的体重減少期。在胎32週。',
  },
  {
    id: 'gm-p012-002',
    patientId: 'P012',
    date: daysAgoDate(8),
    weight: 1.72,
    headCircumference: 29.0,
    notes: '生理的体重減少のナディア。母乳+強化パウダー開始。',
  },
  {
    id: 'gm-p012-003',
    patientId: 'P012',
    date: daysAgoDate(6),
    weight: 1.76,
    headCircumference: 29.2,
    notes: '出生体重復帰傾向。経腸栄養量増加中。',
  },
  {
    id: 'gm-p012-004',
    patientId: 'P012',
    date: daysAgoDate(4),
    weight: 1.82,
    headCircumference: 29.4,
    notes: '出生体重超過。体重増加15-20g/日で良好。',
  },
  {
    id: 'gm-p012-005',
    patientId: 'P012',
    date: daysAgoDate(2),
    weight: 1.86,
    headCircumference: 29.6,
    notes: '安定した体重増加。頭囲も順調に拡大。カフェイン継続。',
  },
  {
    id: 'gm-p012-006',
    patientId: 'P012',
    date: daysAgoDate(0),
    weight: 1.90,
    height: 42.5,
    headCircumference: 29.8,
    notes: '日齢10。体重増加約18g/日。120kcal/kg/日達成。退院基準に向け経過良好。',
  },
]

// ─── P013 井上大翔（8歳M, 28kg, 130cm, 虫垂炎術後）─── 術後回復
const P013_GROWTH: GrowthMeasurement[] = [
  {
    id: 'gm-p013-001',
    patientId: 'P013',
    date: daysAgoDate(7),
    weight: 27.5,
    height: 130,
    notes: '術前計測。穿孔性虫垂炎、緊急手術予定。',
  },
  {
    id: 'gm-p013-002',
    patientId: 'P013',
    date: daysAgoDate(4),
    weight: 26.8,
    notes: '術後3日目。絶食・末梢輸液管理。術後の体重減少（脱水+異化亢進）。',
  },
  {
    id: 'gm-p013-003',
    patientId: 'P013',
    date: daysAgoDate(1),
    weight: 27.2,
    height: 130,
    notes: '消化態製剤開始後。腹腔ドレーン排液減少。段階的に食事アップ予定。',
  },
]

// ─── P014 斎藤結衣（15歳F, 30kg, 158cm, 神経性やせ症）─── Refeeding慎重な体重増加
const P014_GROWTH: GrowthMeasurement[] = [
  {
    id: 'gm-p014-001',
    patientId: 'P014',
    date: daysAgoDate(11),
    weight: 29.5,
    height: 158,
    notes: '入院時。BMI 11.8。徐脈45bpm、低血圧80/50。Refeeding最高リスク。',
  },
  {
    id: 'gm-p014-002',
    patientId: 'P014',
    date: daysAgoDate(7),
    weight: 29.8,
    notes: '5kcal/kg/日で開始。電解質安定。チアミン・リン補充継続。微増。',
  },
  {
    id: 'gm-p014-003',
    patientId: 'P014',
    date: daysAgoDate(3),
    weight: 30.2,
    notes: '10kcal/kg/日へ増量。P・Mg正常範囲。浮腫なし。慎重に増加中。',
  },
  {
    id: 'gm-p014-004',
    patientId: 'P014',
    date: daysAgoDate(0),
    weight: 30.5,
    height: 158,
    notes: '15kcal/kg/日へ段階的増量。体重+1.0kg/11日。目標増加速度0.5-1.0kg/週以内。',
  },
]

// ─── P015 清水陽向（1歳M, 7.5kg, 72cm, ファロー四徴症術後）─── 心疾患児の成長
const P015_GROWTH: GrowthMeasurement[] = [
  {
    id: 'gm-p015-001',
    patientId: 'P015',
    date: daysAgoDate(13),
    weight: 7.2,
    height: 72,
    headCircumference: 45.0,
    notes: '術前計測。ファロー四徴症。哺乳量低下、体重増加不良あり。',
  },
  {
    id: 'gm-p015-002',
    patientId: 'P015',
    date: daysAgoDate(10),
    weight: 7.0,
    headCircumference: 45.0,
    notes: '術後3日目。絶食→経鼻経管栄養少量開始。水分制限100mL/kg/日。',
  },
  {
    id: 'gm-p015-003',
    patientId: 'P015',
    date: daysAgoDate(7),
    weight: 7.1,
    headCircumference: 45.2,
    notes: '高カロリー密度製剤（1kcal/mL）使用。利尿薬継続、K/Mg補充。',
  },
  {
    id: 'gm-p015-004',
    patientId: 'P015',
    date: daysAgoDate(4),
    weight: 7.3,
    headCircumference: 45.3,
    notes: '経口哺乳再開。1回量少なく頻回授乳。体重回復傾向。',
  },
  {
    id: 'gm-p015-005',
    patientId: 'P015',
    date: daysAgoDate(1),
    weight: 7.5,
    height: 72,
    headCircumference: 45.5,
    notes: '術前体重に回復。哺乳量安定。退院に向け栄養指導予定。',
  },
]

/**
 * 全小児患者の成長データ（Record<patientId, GrowthMeasurement[]>）
 * useGrowthDataのseedデータとして使用
 */
export const sampleGrowthDataMap: Record<string, GrowthMeasurement[]> = {
  P002: P002_GROWTH,
  P011: P011_GROWTH,
  P012: P012_GROWTH,
  P013: P013_GROWTH,
  P014: P014_GROWTH,
  P015: P015_GROWTH,
}
