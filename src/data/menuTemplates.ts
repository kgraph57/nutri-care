export interface MenuTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly nutritionType: "enteral" | "parenteral";
  readonly category: "standard" | "disease" | "pediatric";
  readonly items: readonly TemplateItem[];
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
  },
] as const;
