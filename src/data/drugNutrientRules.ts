export type InteractionSeverity = "high" | "medium" | "low";

export interface DrugNutrientRule {
  readonly id: string;
  readonly drugKeywords: readonly string[];
  readonly nutrientKeywords: readonly string[];
  readonly severity: InteractionSeverity;
  readonly interaction: string;
  readonly recommendation: string;
}

/**
 * Evidence-based drug-nutrient interaction rules for ICU nutrition management.
 */
export const DRUG_NUTRIENT_RULES: readonly DrugNutrientRule[] = [
  // ── Warfarin ↔ Vitamin K ──
  {
    id: "warfarin-vitk",
    drugKeywords: ["ワルファリン", "ワーファリン", "warfarin"],
    nutrientKeywords: ["ビタミンK", "VitK", "ビタミンk", "フィトナジオン"],
    severity: "high",
    interaction:
      "ワルファリンはビタミンK拮抗薬です。経腸栄養剤に含まれるビタミンKが抗凝固効果を減弱させます。",
    recommendation:
      "ビタミンK含有量が一定の製剤を選択し、PT-INRを頻回にモニタリングしてください。急激な経腸栄養の開始・中止時は特に注意が必要です。",
  },

  // ── Loop diuretics ↔ K / Mg ──
  {
    id: "loop-diuretic-k",
    drugKeywords: [
      "フロセミド",
      "ラシックス",
      "ブメタニド",
      "トルセミド",
      "furosemide",
      "lasix",
      "ループ利尿",
    ],
    nutrientKeywords: ["K", "カリウム", "potassium"],
    severity: "high",
    interaction:
      "ループ利尿薬はカリウムの尿中排泄を増加させ、低カリウム血症のリスクがあります。",
    recommendation:
      "血清K値を定期的にモニタリングし、必要に応じてカリウム補充を検討してください。K含有量の多い製剤の選択も有効です。",
  },
  {
    id: "loop-diuretic-mg",
    drugKeywords: [
      "フロセミド",
      "ラシックス",
      "ブメタニド",
      "トルセミド",
      "furosemide",
      "lasix",
      "ループ利尿",
    ],
    nutrientKeywords: ["Mg", "マグネシウム", "magnesium"],
    severity: "medium",
    interaction:
      "ループ利尿薬はマグネシウムの尿中排泄も増加させます。",
    recommendation:
      "血清Mg値をモニタリングし、低下傾向があればMg補充を検討してください。",
  },

  // ── Insulin ↔ glucose / carbs ──
  {
    id: "insulin-glucose",
    drugKeywords: [
      "インスリン",
      "insulin",
      "ヒューマリン",
      "ノボリン",
      "ランタス",
      "トレシーバ",
      "ノボラピッド",
      "ヒューマログ",
    ],
    nutrientKeywords: ["炭水化物", "糖", "ブドウ糖", "グルコース", "glucose", "carbs"],
    severity: "high",
    interaction:
      "インスリン投与中の患者では、栄養投与の中断により重篤な低血糖を来す危険があります。",
    recommendation:
      "経腸栄養の中断・減量時はインスリン量の調整が必要です。血糖値を頻回にモニタリングし、栄養投与スケジュールとインスリン投与を同期させてください。",
  },

  // ── Phenytoin ↔ enteral feeding ──
  {
    id: "phenytoin-enteral",
    drugKeywords: [
      "フェニトイン",
      "アレビアチン",
      "phenytoin",
      "ジフェニルヒダントイン",
    ],
    nutrientKeywords: ["経腸", "enteral", "チューブ", "経管"],
    severity: "high",
    interaction:
      "経腸栄養はフェニトインの吸収を40%以上低下させることがあります。",
    recommendation:
      "フェニトイン投与前後2時間は経腸栄養を中断してください。血中濃度のモニタリングを強化し、必要に応じて増量を検討してください。",
  },

  // ── ACE inhibitors ↔ potassium ──
  {
    id: "ace-potassium",
    drugKeywords: [
      "ACE阻害",
      "エナラプリル",
      "カプトプリル",
      "リシノプリル",
      "ペリンドプリル",
      "enalapril",
      "captopril",
      "ARB",
      "バルサルタン",
      "カンデサルタン",
      "オルメサルタン",
    ],
    nutrientKeywords: ["K", "カリウム", "potassium"],
    severity: "medium",
    interaction:
      "ACE阻害薬/ARBはカリウム排泄を抑制し、高カリウム血症のリスクがあります。",
    recommendation:
      "カリウム含有量の多い製剤の使用に注意し、血清K値を定期的にモニタリングしてください。",
  },

  // ── Corticosteroids ↔ Ca / glucose ──
  {
    id: "steroid-calcium",
    drugKeywords: [
      "プレドニゾロン",
      "メチルプレドニゾロン",
      "デキサメタゾン",
      "ヒドロコルチゾン",
      "ステロイド",
      "prednisolone",
      "dexamethasone",
      "hydrocortisone",
    ],
    nutrientKeywords: ["Ca", "カルシウム", "calcium"],
    severity: "medium",
    interaction:
      "ステロイドはカルシウム吸収を低下させ、骨粗鬆症リスクを増大させます。",
    recommendation:
      "カルシウムとビタミンDの補充を検討してください。長期投与では骨密度のモニタリングも考慮してください。",
  },
  {
    id: "steroid-glucose",
    drugKeywords: [
      "プレドニゾロン",
      "メチルプレドニゾロン",
      "デキサメタゾン",
      "ヒドロコルチゾン",
      "ステロイド",
      "prednisolone",
      "dexamethasone",
      "hydrocortisone",
    ],
    nutrientKeywords: ["炭水化物", "糖", "ブドウ糖", "グルコース", "glucose", "carbs"],
    severity: "medium",
    interaction:
      "ステロイドはインスリン抵抗性を増大させ、高血糖を引き起こします。",
    recommendation:
      "血糖モニタリングを強化し、糖質含有量の少ない製剤の選択やインスリン調整を検討してください。",
  },

  // ── Aminoglycosides ↔ Mg / Ca ──
  {
    id: "aminoglycoside-mg",
    drugKeywords: [
      "ゲンタマイシン",
      "トブラマイシン",
      "アミカシン",
      "アミノグリコシド",
      "gentamicin",
      "tobramycin",
      "amikacin",
    ],
    nutrientKeywords: ["Mg", "マグネシウム", "magnesium"],
    severity: "medium",
    interaction:
      "アミノグリコシド系抗菌薬は腎でのマグネシウム再吸収を阻害し、低Mg血症を引き起こします。",
    recommendation:
      "血清Mg値を定期的にモニタリングし、低下時にはMg補充を行ってください。",
  },

  // ── Methotrexate ↔ folate ──
  {
    id: "mtx-folate",
    drugKeywords: [
      "メトトレキサート",
      "MTX",
      "methotrexate",
      "リウマトレックス",
    ],
    nutrientKeywords: ["葉酸", "フォレート", "folate", "folic"],
    severity: "medium",
    interaction:
      "メトトレキサートは葉酸代謝を阻害します。葉酸補充のタイミングが重要です。",
    recommendation:
      "メトトレキサート投与日の翌日以降にフォリン酸（ロイコボリン）の補充を検討してください。",
  },

  // ── Proton pump inhibitors ↔ Mg / Ca / Fe / B12 ──
  {
    id: "ppi-absorption",
    drugKeywords: [
      "オメプラゾール",
      "ランソプラゾール",
      "エソメプラゾール",
      "ラベプラゾール",
      "PPI",
      "プロトンポンプ",
      "omeprazole",
      "lansoprazole",
    ],
    nutrientKeywords: ["Mg", "マグネシウム", "Ca", "カルシウム", "Fe", "鉄"],
    severity: "low",
    interaction:
      "PPIの長期使用はMg・Ca・Fe・B12の吸収を低下させる可能性があります。",
    recommendation:
      "長期PPI使用患者では微量元素の定期的なモニタリングを推奨します。",
  },
] as const;
