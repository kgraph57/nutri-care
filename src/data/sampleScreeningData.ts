import type {
  ScreeningEntry,
  Nrs2002Result,
  MnaSfResult,
} from "../types/screening";

/**
 * 栄養スクリーニングサンプルデータ
 * 各患者に1件ずつスクリーニング結果を持たせる
 */

function daysAgoDate(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ─── P001 田中太郎（65歳, ICU, 急性心筋梗塞）── NRS-2002 at-risk (score 4)
const P001_NRS2002: Nrs2002Result = {
  toolType: "nrs2002",
  initialScreening: {
    bmiBelow205: false,
    weightLoss3Months: true,
    reducedIntakeLastWeek: true,
    severelyCritical: true,
  },
  initialPositive: true,
  finalScreening: {
    nutritionalStatus: 1,
    nutritionalStatusDetail:
      "3ヶ月間で5%の体重減少。前週の食事摂取量が必要量の約60%。",
    diseaseSeverity: 2,
    diseaseSeverityDetail:
      "ICU管理中の急性心筋梗塞。PCI後の回復期、循環動態は安定化傾向。",
    ageAdjustment: true,
  },
  totalScore: 4,
  riskLevel: "at-risk",
  recommendations: [
    "NST介入を推奨",
    "栄養投与量の見直し（25-30kcal/kg/日目標）",
    "蛋白質1.2-1.5g/kg/日の確保",
    "ワルファリン使用中のためVitK含有量に注意",
    "1週間後に再スクリーニング実施",
  ],
};

const P001_SCREENING: ScreeningEntry = {
  id: "scr-P001-001",
  patientId: "P001",
  date: daysAgoDate(2),
  time: "09:30",
  result: P001_NRS2002,
  notes:
    "ICU入室後3日目にスクリーニング実施。心筋梗塞後の食欲低下が顕著。経口摂取量は必要量の約60%にとどまる。抗凝固療法中のためVitK管理も含めた栄養計画が必要。",
  createdAt: daysAgoIso(2),
};

// ─── P003 鈴木一郎（72歳, ICU, CKD stage 4）── NRS-2002 no-risk (score 1)
const P003_NRS2002: Nrs2002Result = {
  toolType: "nrs2002",
  initialScreening: {
    bmiBelow205: false,
    weightLoss3Months: false,
    reducedIntakeLastWeek: false,
    severelyCritical: false,
  },
  initialPositive: false,
  finalScreening: null,
  totalScore: 1,
  riskLevel: "no-risk",
  recommendations: [
    "現時点では栄養リスクなし",
    "1週間後に再スクリーニング実施",
    "CKD管理として蛋白制限（0.6-0.8g/kg）を継続",
    "体重・食事摂取量の定期モニタリング",
  ],
};

const P003_SCREENING: ScreeningEntry = {
  id: "scr-P003-001",
  patientId: "P003",
  date: daysAgoDate(5),
  time: "10:00",
  result: P003_NRS2002,
  notes:
    "入院時スクリーニング。体重減少なし、食事摂取良好。初期スクリーニング陰性のため最終スクリーニングは省略。CKD stage 4に伴う蛋白・K・P制限は継続中。栄養リスクとしては低いが腎機能に応じた定期評価が必要。",
  createdAt: daysAgoIso(5),
};

// ─── P005 高橋健太（35歳, ICU, 重症熱傷）── MNA-SF at-risk (score 10)
// Note: MNA-SF is typically for elderly patients (65+), but can be applied in
// specific clinical contexts. Here P005 is assessed with MNA-SF as requested.
const P005_MNASF: MnaSfResult = {
  toolType: "mna-sf",
  data: {
    foodIntakeDecline: 1,
    weightLoss: 1,
    mobility: 0,
    psychologicalStress: 2,
    neuropsychological: 2,
    bmiOrCalf: 3,
    usedCalfCircumference: false,
  },
  totalScore: 10,
  riskLevel: "at-risk",
  recommendations: [
    "低栄養のおそれあり — 詳細な栄養評価を実施",
    "熱傷による異化亢進を考慮した高カロリー投与（Curreri式で算出）",
    "蛋白質2g/kg/日の確保",
    "微量元素（Zn, Cu, Se）の積極補充",
    "2週間以内にGLIM基準での低栄養診断を検討",
  ],
};

const P005_SCREENING: ScreeningEntry = {
  id: "scr-P005-001",
  patientId: "P005",
  date: daysAgoDate(3),
  time: "14:00",
  result: P005_MNASF,
  notes:
    "重症熱傷入室後のスクリーニング。急性期の精神的ストレスおよび鎮静下での食事摂取困難あり。ベッド上安静のため活動性低下。BMI 23.7で正常範囲だが、異化亢進による急速な体重減少リスクが高い。GLIM基準での正式な低栄養診断を予定。",
  createdAt: daysAgoIso(3),
};

/**
 * 全患者のスクリーニングデータ（Record<patientId, ScreeningEntry[]>）
 * useScreeningDataのseedデータとして使用
 */
export const sampleScreeningDataMap: Record<string, ScreeningEntry[]> = {
  P001: [P001_SCREENING],
  P003: [P003_SCREENING],
  P005: [P005_SCREENING],
};
