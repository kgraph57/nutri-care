import { describe, it, expect } from "vitest";
import { checkDrugNutrientInteractions } from "./drugNutrientChecker";

type MenuItem = { product: Record<string, string | number> };

function makeEnteralItem(
  name: string,
  overrides: Record<string, string | number> = {},
): MenuItem {
  return {
    product: {
      製剤名: name,
      カテゴリ: "経腸栄養剤",
      サブカテゴリ: "半消化態",
      "K[mEq/L]": 20,
      "Mg[mEq/L]": 5,
      "Ca[mEq/L]": 15,
      "Fe[mg/100ml]": 1,
      "炭水化物[g/100ml]": 12,
      ...overrides,
    },
  };
}

// ── Warfarin ↔ VitK ──

describe("drugNutrientChecker — Warfarin + VitK", () => {
  it("detects warfarin interaction with VitK-containing product", () => {
    const results = checkDrugNutrientInteractions(
      ["ワルファリン"],
      [
        {
          product: {
            製剤名: "ビタミンK含有製品",
            カテゴリ: "経腸",
            サブカテゴリ: "",
          },
        },
      ],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "warfarin-vitk")).toBe(true);
    expect(results.find((r) => r.ruleId === "warfarin-vitk")?.severity).toBe(
      "high",
    );
  });

  it("detects ワーファリン variant spelling", () => {
    const results = checkDrugNutrientInteractions(
      ["ワーファリン"],
      [
        {
          product: { 製剤名: "VitK強化ミルク", カテゴリ: "", サブカテゴリ: "" },
        },
      ],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "warfarin-vitk")).toBe(true);
  });
});

// ── Loop diuretics ↔ K/Mg ──

describe("drugNutrientChecker — Loop diuretics", () => {
  it("detects furosemide + K interaction", () => {
    const results = checkDrugNutrientInteractions(
      ["フロセミド"],
      [makeEnteralItem("ペプタメン")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "loop-diuretic-k")).toBe(true);
  });

  it("detects furosemide + Mg interaction", () => {
    const results = checkDrugNutrientInteractions(
      ["フロセミド"],
      [makeEnteralItem("ペプタメン")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "loop-diuretic-mg")).toBe(true);
  });

  it("detects ラシックス brand name", () => {
    const results = checkDrugNutrientInteractions(
      ["ラシックス"],
      [makeEnteralItem("ペプタメン")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "loop-diuretic-k")).toBe(true);
  });
});

// ── Insulin ↔ glucose ──

describe("drugNutrientChecker — Insulin + glucose", () => {
  it("detects insulin + carbohydrate interaction", () => {
    const results = checkDrugNutrientInteractions(
      ["インスリン"],
      [makeEnteralItem("グルセルナ")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "insulin-glucose")).toBe(true);
    expect(results.find((r) => r.ruleId === "insulin-glucose")?.severity).toBe(
      "high",
    );
  });

  it("detects ヒューマログ brand name", () => {
    const results = checkDrugNutrientInteractions(
      ["ヒューマログ"],
      [makeEnteralItem("エネーボ")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "insulin-glucose")).toBe(true);
  });
});

// ── Phenytoin ↔ enteral ──

describe("drugNutrientChecker — Phenytoin + enteral", () => {
  it("detects phenytoin + enteral feeding interaction", () => {
    const results = checkDrugNutrientInteractions(
      ["フェニトイン"],
      [makeEnteralItem("エレンタールP")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "phenytoin-enteral")).toBe(true);
    expect(
      results.find((r) => r.ruleId === "phenytoin-enteral")?.severity,
    ).toBe("high");
  });

  it("does not detect phenytoin interaction with parenteral", () => {
    // Use a TPN product without '経腸' in category
    const tpnItem: MenuItem = {
      product: {
        製剤名: "エルネオパNF2号",
        カテゴリ: "静脈栄養剤",
        サブカテゴリ: "中心静脈",
        "K[mEq/L]": 20,
        "炭水化物[g/100ml]": 10,
      },
    };
    const results = checkDrugNutrientInteractions(
      ["フェニトイン"],
      [tpnItem],
      "parenteral",
    );
    expect(results.some((r) => r.ruleId === "phenytoin-enteral")).toBe(false);
  });

  it("detects アレビアチン brand name", () => {
    const results = checkDrugNutrientInteractions(
      ["アレビアチン"],
      [makeEnteralItem("ペプタメン")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "phenytoin-enteral")).toBe(true);
  });
});

// ── ACE inhibitors ↔ K ──

describe("drugNutrientChecker — ACE inhibitors + K", () => {
  it("detects ACE inhibitor + K interaction", () => {
    const results = checkDrugNutrientInteractions(
      ["エナラプリル"],
      [makeEnteralItem("ペプタメン")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "ace-potassium")).toBe(true);
    expect(results.find((r) => r.ruleId === "ace-potassium")?.severity).toBe(
      "medium",
    );
  });

  it("detects カプトプリル", () => {
    const results = checkDrugNutrientInteractions(
      ["カプトプリル"],
      [makeEnteralItem("ペプタメン")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "ace-potassium")).toBe(true);
  });
});

// ── Steroids ↔ Ca/glucose ──

describe("drugNutrientChecker — Steroids", () => {
  it("detects steroid + Ca interaction", () => {
    const results = checkDrugNutrientInteractions(
      ["デキサメタゾン"],
      [makeEnteralItem("エネーボ")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "steroid-calcium")).toBe(true);
  });

  it("detects steroid + glucose interaction", () => {
    const results = checkDrugNutrientInteractions(
      ["ヒドロコルチゾン"],
      [makeEnteralItem("エネーボ")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "steroid-glucose")).toBe(true);
  });

  it("detects プレドニゾロン", () => {
    const results = checkDrugNutrientInteractions(
      ["プレドニゾロン"],
      [makeEnteralItem("エネーボ")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "steroid-calcium")).toBe(true);
    expect(results.some((r) => r.ruleId === "steroid-glucose")).toBe(true);
  });
});

// ── Aminoglycosides ↔ Mg ──

describe("drugNutrientChecker — Aminoglycosides + Mg", () => {
  it("detects aminoglycoside + Mg interaction", () => {
    const results = checkDrugNutrientInteractions(
      ["ゲンタマイシン"],
      [makeEnteralItem("ペプタメン")],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "aminoglycoside-mg")).toBe(true);
  });
});

// ── Multiple interactions ──

describe("drugNutrientChecker — multiple interactions", () => {
  it("detects multiple interactions for P001 (ワルファリン + ACE阻害薬)", () => {
    const results = checkDrugNutrientInteractions(
      ["ワルファリン", "ACE阻害薬"],
      [
        {
          product: {
            製剤名: "ビタミンK含有製品",
            カテゴリ: "",
            サブカテゴリ: "",
            "K[mEq/L]": 20,
          },
        },
      ],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "warfarin-vitk")).toBe(true);
    expect(results.some((r) => r.ruleId === "ace-potassium")).toBe(true);
  });

  it("detects multiple interactions for P009 (ワルファリン + フロセミド + エナラプリル)", () => {
    const results = checkDrugNutrientInteractions(
      ["ワルファリン", "フロセミド", "エナラプリル"],
      [
        makeEnteralItem("ペプタメン"),
        { product: { 製剤名: "VitK配合", カテゴリ: "", サブカテゴリ: "" } },
      ],
      "enteral",
    );
    expect(results.some((r) => r.ruleId === "warfarin-vitk")).toBe(true);
    expect(results.some((r) => r.ruleId === "loop-diuretic-k")).toBe(true);
    expect(results.some((r) => r.ruleId === "loop-diuretic-mg")).toBe(true);
    expect(results.some((r) => r.ruleId === "ace-potassium")).toBe(true);
  });
});

// ── Severity ordering ──

describe("drugNutrientChecker — severity ordering", () => {
  it("returns results sorted by severity: high > medium > low", () => {
    const results = checkDrugNutrientInteractions(
      ["ワルファリン", "フロセミド", "オメプラゾール"],
      [makeEnteralItem("VitK配合")],
      "enteral",
    );
    if (results.length > 1) {
      for (let i = 1; i < results.length; i++) {
        const sevOrder = { high: 0, medium: 1, low: 2 } as const;
        expect(sevOrder[results[i].severity]).toBeGreaterThanOrEqual(
          sevOrder[results[i - 1].severity],
        );
      }
    }
  });
});

// ── Empty inputs ──

describe("drugNutrientChecker — empty inputs", () => {
  it("returns empty array for no medications", () => {
    const results = checkDrugNutrientInteractions(
      [],
      [makeEnteralItem("ペプタメン")],
      "enteral",
    );
    expect(results.length).toBe(0);
  });

  it("returns empty array for no menu items", () => {
    const results = checkDrugNutrientInteractions(
      ["ワルファリン"],
      [],
      "enteral",
    );
    expect(results.length).toBe(0);
  });
});

// ── Deduplication ──

describe("drugNutrientChecker — deduplication", () => {
  it("does not duplicate interactions for same drug+rule", () => {
    const results = checkDrugNutrientInteractions(
      ["フロセミド"],
      [makeEnteralItem("製品A"), makeEnteralItem("製品B")],
      "enteral",
    );
    const kInteractions = results.filter((r) => r.ruleId === "loop-diuretic-k");
    expect(kInteractions.length).toBe(1);
  });
});

// ── Immutability ──

describe("drugNutrientChecker — immutability", () => {
  it("does not mutate input arrays", () => {
    const meds = ["ワルファリン", "フロセミド"];
    const items = [makeEnteralItem("VitK配合")];
    const medsCopy = [...meds];
    const itemsCopy = JSON.parse(JSON.stringify(items));
    checkDrugNutrientInteractions(meds, items, "enteral");
    expect(meds).toEqual(medsCopy);
    expect(items).toEqual(itemsCopy);
  });
});
