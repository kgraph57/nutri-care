export interface MenuTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly nutritionType: "enteral" | "parenteral";
  readonly category: "standard" | "disease" | "pediatric";
  readonly items: readonly TemplateItem[];
  readonly condition?: string;
  readonly tags?: readonly string[];
  readonly targetEnergy?: number;
  readonly targetProtein?: number;
  readonly caution?: string;
}

export interface TemplateItem {
  readonly productKeyword: string;
  readonly volume: number;
  readonly frequency: number;
}

export const MENU_TEMPLATES: readonly MenuTemplate[] = [
  // ── 成人 経腸栄養 ──
  {
    id: "adult-standard-en",
    name: "成人標準経腸栄養",
    description: "一般的なICU患者向け。1.0kcal/mL経腸栄養剤 1500mL/日",
    nutritionType: "enteral",
    category: "standard",
    items: [
      { productKeyword: "エンシュア", volume: 250, frequency: 3 },
      { productKeyword: "イノラス", volume: 125, frequency: 3 },
    ],
    tags: ["経腸", "標準", "ICU"],
    targetEnergy: 1500,
    targetProtein: 60,
  },
  {
    id: "adult-high-protein-en",
    name: "高蛋白経腸栄養",
    description: "蛋白要求量が高い患者(術後・褥瘡・サルコペニア)",
    nutritionType: "enteral",
    category: "standard",
    items: [
      { productKeyword: "ペプタメン", volume: 250, frequency: 3 },
      { productKeyword: "プロシュア", volume: 125, frequency: 2 },
    ],
    condition: "術後・褥瘡・サルコペニア",
    tags: ["経腸", "高蛋白", "術後"],
    targetEnergy: 1500,
    targetProtein: 90,
  },
  {
    id: "adult-renal-en",
    name: "腎不全用経腸栄養",
    description: "電解質制限、蛋白制限必要な腎不全患者",
    nutritionType: "enteral",
    category: "disease",
    items: [
      { productKeyword: "リーナレン", volume: 200, frequency: 3 },
    ],
    condition: "腎不全（保存期）",
    tags: ["経腸", "腎不全", "電解質制限", "低蛋白"],
    targetEnergy: 1200,
    targetProtein: 40,
    caution: "電解質（K・P・Na）を定期モニタリングのこと。蛋白過剰投与は腎機能悪化リスクあり。",
  },
  {
    id: "adult-hepatic-en",
    name: "肝不全用経腸栄養",
    description: "BCAA強化、アンモニア上昇リスクのある肝疾患患者",
    nutritionType: "enteral",
    category: "disease",
    items: [
      { productKeyword: "アミノレバン", volume: 200, frequency: 3 },
    ],
    condition: "肝硬変・肝性脳症",
    tags: ["経腸", "肝不全", "BCAA強化"],
    targetEnergy: 1200,
    targetProtein: 60,
    caution: "血中アンモニア値を定期確認。肝性脳症増悪時は蛋白制限を再検討。",
  },
  {
    id: "adult-diabetic-en",
    name: "糖尿病用経腸栄養",
    description: "低GI、糖質制限、食物繊維強化",
    nutritionType: "enteral",
    category: "disease",
    items: [
      { productKeyword: "グルセルナ", volume: 200, frequency: 3 },
    ],
    condition: "糖尿病",
    tags: ["経腸", "糖尿病", "低GI", "血糖管理"],
    targetEnergy: 1200,
    targetProtein: 55,
  },
  {
    id: "adult-respiratory-en",
    name: "呼吸不全用経腸栄養",
    description: "高脂質・低糖質(CO2産生抑制)、ARDS・人工呼吸器患者",
    nutritionType: "enteral",
    category: "disease",
    items: [
      { productKeyword: "プルモケア", volume: 250, frequency: 3 },
    ],
    condition: "呼吸不全・ARDS",
    tags: ["経腸", "呼吸不全", "低糖質", "高脂質"],
    targetEnergy: 1500,
    targetProtein: 65,
    caution: "過剰カロリーはCO2産生増加を招くため、目標カロリーを厳守すること。",
  },

  // ── 成人 静脈栄養 ──
  {
    id: "adult-standard-pn",
    name: "成人標準TPN",
    description: "経腸栄養不可時のTPN処方",
    nutritionType: "parenteral",
    category: "standard",
    items: [
      { productKeyword: "エルネオパ", volume: 1000, frequency: 1 },
      { productKeyword: "イントラリポス", volume: 250, frequency: 1 },
    ],
    tags: ["静脈", "TPN", "標準"],
    targetEnergy: 1400,
    targetProtein: 60,
  },

  // ── 小児 ──
  {
    id: "peds-standard-en",
    name: "小児標準経腸栄養",
    description: "小児一般患者向けの経腸栄養",
    nutritionType: "enteral",
    category: "pediatric",
    items: [
      { productKeyword: "エンシュア", volume: 100, frequency: 4 },
    ],
    tags: ["経腸", "小児", "標準"],
    targetEnergy: 800,
    targetProtein: 30,
  },
  {
    id: "peds-low-birth-en",
    name: "低出生体重児栄養",
    description: "NICU低出生体重児向けの高濃度栄養",
    nutritionType: "enteral",
    category: "pediatric",
    items: [
      { productKeyword: "母乳強化", volume: 20, frequency: 8 },
    ],
    condition: "低出生体重児（NICU）",
    tags: ["経腸", "NICU", "低出生体重児"],
    targetEnergy: 120,
    caution: "体重当たりエネルギー目標（110〜130 kcal/kg/日）を個別に設定すること。",
  },

  // ── 新規追加 10テンプレート ──

  // 1. 熱傷・高カロリー
  {
    id: "burn-high-calorie-combined",
    name: "熱傷・高カロリー経腸＋TPN",
    description: "熱傷患者向け高カロリー・高蛋白の経腸栄養と補完的TPN併用処方",
    nutritionType: "enteral",
    category: "disease",
    items: [
      { productKeyword: "ペプタメン", volume: 250, frequency: 4 },
      { productKeyword: "プロシュア", volume: 125, frequency: 2 },
    ],
    condition: "熱傷（TBSA 20%以上）",
    tags: ["経腸", "熱傷", "高カロリー", "高蛋白"],
    targetEnergy: 2500,
    targetProtein: 120,
    caution: "Curreri式または間接熱量測定でカロリー目標を個別設定。電解質・血糖を頻回モニタリングのこと。",
  },

  // 2. Refeeding症候群予防
  {
    id: "refeeding-prevention-pn",
    name: "Refeeding症候群予防TPN",
    description: "長期絶食・低栄養患者への段階的カロリー投与（低カロリー開始→漸増）",
    nutritionType: "parenteral",
    category: "disease",
    items: [
      { productKeyword: "ヴィーンF", volume: 500, frequency: 1 },
      { productKeyword: "ビカーボン", volume: 250, frequency: 1 },
    ],
    condition: "長期絶食・Refeeding症候群リスク",
    tags: ["静脈", "Refeeding", "低カロリー開始", "段階的増量"],
    targetEnergy: 500,
    targetProtein: 20,
    caution: "開始時は10 kcal/kg/日以下から。P・K・Mgを毎日測定し低下時は補充。チアミン（Vit B1）を開始前に必ず投与。",
  },

  // 3. 腎不全・透析中
  {
    id: "renal-dialysis-en",
    name: "透析患者経腸栄養",
    description: "血液透析中の腎不全患者向け。蛋白は透析による消失分を加味し増量",
    nutritionType: "enteral",
    category: "disease",
    items: [
      { productKeyword: "リーナレン", volume: 200, frequency: 3 },
      { productKeyword: "プロシュア", volume: 125, frequency: 2 },
    ],
    condition: "腎不全（透析中）",
    tags: ["経腸", "腎不全", "透析", "高蛋白"],
    targetEnergy: 1500,
    targetProtein: 70,
    caution: "透析非施行日と施行日でK・P摂取量を調整。透析中の蛋白喪失（約10g/回）を補うため保存期より蛋白量を増やす。",
  },

  // 4. 心不全・水分制限
  {
    id: "heart-failure-fluid-restrict-en",
    name: "心不全・水分制限経腸栄養",
    description: "濃縮製剤使用で水分制限を維持しながら必要カロリーを確保",
    nutritionType: "enteral",
    category: "disease",
    items: [
      { productKeyword: "イノラス", volume: 150, frequency: 3 },
    ],
    condition: "心不全（水分制限 1000〜1500 mL/日）",
    tags: ["経腸", "心不全", "水分制限", "高濃度"],
    targetEnergy: 1200,
    targetProtein: 50,
    caution: "1日総水分量（静注・内服・栄養剤）を合算して制限内に収める。体重・浮腫・尿量を毎日確認。Na制限（<2g/日）も並行管理。",
  },

  // 5. 呼吸不全TPN（経腸困難例）
  {
    id: "respiratory-failure-pn",
    name: "呼吸不全TPN",
    description: "経腸栄養困難な呼吸不全・ARDS患者への低糖・脂質強化TPN",
    nutritionType: "parenteral",
    category: "disease",
    items: [
      { productKeyword: "エルネオパ", volume: 1000, frequency: 1 },
      { productKeyword: "イントラリポス", volume: 250, frequency: 1 },
    ],
    condition: "呼吸不全・ARDS（経腸困難）",
    tags: ["静脈", "呼吸不全", "TPN", "脂質強化"],
    targetEnergy: 1400,
    targetProtein: 65,
    caution: "過剰なブドウ糖投与はCO2産生増加・呼吸商上昇を招く。間接熱量測定によるRQ管理が望ましい。",
  },

  // 6. 糖尿病TPN
  {
    id: "diabetic-pn",
    name: "糖尿病TPN（血糖管理強化）",
    description: "インスリン抵抗性を考慮し糖質を抑えた静脈栄養、血糖140mg/dL未満を目標",
    nutritionType: "parenteral",
    category: "disease",
    items: [
      { productKeyword: "ネオアミユー", volume: 500, frequency: 1 },
      { productKeyword: "イントラリポス", volume: 250, frequency: 1 },
      { productKeyword: "ヴィーンF", volume: 250, frequency: 1 },
    ],
    condition: "糖尿病・高血糖",
    tags: ["静脈", "糖尿病", "血糖管理", "TPN"],
    targetEnergy: 1200,
    targetProtein: 55,
    caution: "血糖140〜180 mg/dLを目標にインスリンで管理。低血糖（<70 mg/dL）にも注意。1〜2時間ごとの血糖測定を推奨。",
  },

  // 7. 小児PICU標準
  {
    id: "picu-standard-en",
    name: "小児PICU標準経腸栄養",
    description: "PICU小児患者向け年齢適正量の経腸栄養（学童期目安）",
    nutritionType: "enteral",
    category: "pediatric",
    items: [
      { productKeyword: "エンシュア", volume: 100, frequency: 5 },
    ],
    condition: "小児集中治療（PICU）",
    tags: ["経腸", "小児", "PICU", "標準"],
    targetEnergy: 1000,
    targetProtein: 35,
    caution: "年齢・体重による目標エネルギー（40〜60 kcal/kg/日）を個別設定。消化管耐性を確認しながら増量すること。",
  },

  // 8. NICU超早産児TPN
  {
    id: "nicu-preterm-pn",
    name: "NICU超早産児TPN",
    description: "在胎28週未満の超早産児向けTPN。アミノ酸・脂質の早期投与で成長を促進",
    nutritionType: "parenteral",
    category: "pediatric",
    items: [
      { productKeyword: "ネオアミユー", volume: 50, frequency: 1 },
      { productKeyword: "イントラリポス", volume: 20, frequency: 1 },
      { productKeyword: "ビカーボン", volume: 30, frequency: 1 },
    ],
    condition: "超早産児（在胎28週未満・NICU）",
    tags: ["静脈", "NICU", "超早産児", "TPN"],
    targetEnergy: 80,
    targetProtein: 4,
    caution: "エネルギー目標110〜120 kcal/kg/日、蛋白3.5〜4.5 g/kg/日を体重換算で設定。脂質は0.5 g/kg/日から開始し漸増。高血糖・電解質異常を毎日確認。",
  },

  // 9. 周術期TPN
  {
    id: "perioperative-pn",
    name: "周術期TPN",
    description: "消化管手術後など経腸栄養開始前の橋渡し静脈栄養処方",
    nutritionType: "parenteral",
    category: "standard",
    items: [
      { productKeyword: "エルネオパ", volume: 1000, frequency: 1 },
      { productKeyword: "モリヘパミン", volume: 250, frequency: 1 },
    ],
    condition: "周術期（消化管手術後）",
    tags: ["静脈", "周術期", "TPN", "術後"],
    targetEnergy: 1200,
    targetProtein: 55,
    caution: "経腸栄養が可能になり次第、早期に移行すること。感染リスク低減のため中心静脈カテーテル管理に留意。",
  },

  // 10. 肝硬変BCAA強化
  {
    id: "cirrhosis-bcaa-en",
    name: "肝硬変BCAA強化経腸栄養",
    description: "肝硬変Child C症例へのBCAA強化製剤。就寝前軽食（LES）も考慮した処方",
    nutritionType: "enteral",
    category: "disease",
    items: [
      { productKeyword: "アミノレバン", volume: 200, frequency: 2 },
      { productKeyword: "イノラス", volume: 100, frequency: 1 },
    ],
    condition: "肝硬変Child C",
    tags: ["経腸", "肝硬変", "BCAA強化", "就寝前軽食"],
    targetEnergy: 1200,
    targetProtein: 50,
    caution: "就寝前200 kcal程度の軽食（LES）が有効。芳香族アミノ酸過剰による肝性脳症悪化に注意。NH3値を定期測定。",
  },
] as const;
