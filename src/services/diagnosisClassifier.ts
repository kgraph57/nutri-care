export type ConditionCategory =
  | "standard"
  | "renal"
  | "renal_dialysis"
  | "hepatic"
  | "diabetes"
  | "respiratory"
  | "burn"
  | "refeeding_risk"
  | "cardiac"
  | "postoperative"
  | "pediatric_standard"
  | "pediatric_nicu";

export interface ClassifiedCondition {
  readonly primary: ConditionCategory;
  readonly secondary: readonly ConditionCategory[];
  readonly fluidRestriction: number | null;
  readonly refeedingRisk: boolean;
}

interface KeywordRule {
  readonly category: ConditionCategory;
  readonly keywords: readonly string[];
  readonly priority: number;
  readonly fluidRestriction?: number;
}

const KEYWORD_RULES: readonly KeywordRule[] = [
  {
    category: "renal_dialysis",
    keywords: [
      "透析",
      "HD",
      "CHDF",
      "CRRT",
      "hemodialysis",
      "血液透析",
      "腹膜透析",
      "CAPD",
    ],
    priority: 10,
  },
  {
    category: "renal",
    keywords: [
      "腎不全",
      "腎障害",
      "CKD",
      "AKI",
      "急性腎障害",
      "慢性腎臓病",
      "腎機能低下",
      "renal",
    ],
    priority: 9,
  },
  {
    category: "burn",
    keywords: ["熱傷", "burn", "TBSA", "やけど", "広範囲熱傷"],
    priority: 8,
  },
  {
    category: "refeeding_risk",
    keywords: [
      "refeeding",
      "リフィーディング",
      "長期絶食",
      "拒食症",
      "神経性やせ症",
      "食思不振症",
      "食欲不振症",
      "AN",
      "飢餓",
      "高度低栄養",
    ],
    priority: 7,
  },
  {
    category: "hepatic",
    keywords: [
      "肝不全",
      "肝硬変",
      "肝性脳症",
      "肝障害",
      "劇症肝炎",
      "肝臓",
      "cirrhosis",
      "hepatic",
    ],
    priority: 6,
  },
  {
    category: "respiratory",
    keywords: [
      "呼吸不全",
      "ARDS",
      "人工呼吸",
      "COPD",
      "気管切開",
      "呼吸器",
      "ventilator",
      "酸素化不良",
    ],
    priority: 5,
  },
  {
    category: "cardiac",
    keywords: [
      "心不全",
      "CHF",
      "心筋梗塞",
      "AMI",
      "心臓",
      "cardiac",
      "浮腫",
      "体液過剰",
    ],
    priority: 4,
    fluidRestriction: 1500,
  },
  {
    category: "diabetes",
    keywords: [
      "糖尿病",
      "DM",
      "高血糖",
      "インスリン",
      "HbA1c",
      "diabetes",
      "血糖コントロール不良",
    ],
    priority: 3,
  },
  {
    category: "postoperative",
    keywords: [
      "術後",
      "外傷",
      "手術",
      "周術期",
      "postop",
      "trauma",
      "多発外傷",
      "創傷治癒",
    ],
    priority: 2,
  },
];

const REFEEDING_KEYWORDS = [
  "refeeding",
  "リフィーディング",
  "長期絶食",
  "拒食症",
  "食思不振症",
  "食欲不振症",
  "神経性やせ症",
  "低栄養",
  "飢餓",
  "BMI<16",
  "BMI 16",
  "高度るいそう",
];

function matchesKeywords(text: string, keywords: readonly string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

export function classifyDiagnosis(
  diagnosis: string,
  patientType: string,
  age: number,
): ClassifiedCondition {
  if (patientType === "NICU" || (age < 1 && patientType === "PICU")) {
    return {
      primary: "pediatric_nicu",
      secondary: [],
      fluidRestriction: null,
      refeedingRisk: false,
    };
  }

  if (patientType === "PICU" || age < 18) {
    const secondary: ConditionCategory[] = [];
    for (const rule of KEYWORD_RULES) {
      if (matchesKeywords(diagnosis, rule.keywords)) {
        secondary.push(rule.category);
      }
    }
    return {
      primary: "pediatric_standard",
      secondary,
      fluidRestriction: null,
      refeedingRisk: matchesKeywords(diagnosis, REFEEDING_KEYWORDS),
    };
  }

  const matched: Array<{
    category: ConditionCategory;
    priority: number;
    fluidRestriction?: number;
  }> = [];

  for (const rule of KEYWORD_RULES) {
    if (matchesKeywords(diagnosis, rule.keywords)) {
      matched.push({
        category: rule.category,
        priority: rule.priority,
        fluidRestriction: rule.fluidRestriction,
      });
    }
  }

  if (matched.length === 0) {
    return {
      primary: "standard",
      secondary: [],
      fluidRestriction: null,
      refeedingRisk: matchesKeywords(diagnosis, REFEEDING_KEYWORDS),
    };
  }

  const sorted = [...matched].sort((a, b) => b.priority - a.priority);
  const primary = sorted[0];
  const secondary = sorted.slice(1).map((m) => m.category);

  const fluidRestriction =
    sorted.find((m) => m.fluidRestriction !== undefined)?.fluidRestriction ??
    null;
  const refeedingRisk =
    matched.some((m) => m.category === "refeeding_risk") ||
    matchesKeywords(diagnosis, REFEEDING_KEYWORDS);

  return {
    primary: primary.category,
    secondary,
    fluidRestriction,
    refeedingRisk,
  };
}

export function conditionToJapanese(condition: ConditionCategory): string {
  const MAP: Record<ConditionCategory, string> = {
    standard: "標準",
    renal: "腎不全",
    renal_dialysis: "透析",
    hepatic: "肝不全",
    diabetes: "糖尿病",
    respiratory: "呼吸不全",
    burn: "熱傷",
    refeeding_risk: "Refeeding症候群リスク",
    cardiac: "心不全",
    postoperative: "術後・外傷",
    pediatric_standard: "小児",
    pediatric_nicu: "NICU",
  };
  return MAP[condition];
}
