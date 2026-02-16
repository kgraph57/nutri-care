// 栄養データベースを簡単に読み込む関数
export const loadNutritionData = async () => {
  try {
    // Viteの静的アセットとして読み込み
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/nutrition_database_normalized.json`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(
      "栄養データベース読み込み成功:",
      data.sheets["全製剤データベース"].length,
      "件",
    );
    return data.sheets["全製剤データベース"];
  } catch (error) {
    console.error("栄養データの読み込みに失敗:", error);
    // フォールバック用のサンプルデータ
    return [
      {
        製剤名: "エンシュア",
        メーカー: "アボット",
        カテゴリ: "経腸栄養剤",
        サブカテゴリ: "標準経腸栄養剤",
        エネルギー: 1.0,
        "エネルギー[kcal/ml]": 1.0,
        "タンパク質[g/100ml]": 3.4,
        "脂質[g/100ml]": 3.4,
        "炭水化物[g/100ml]": 12.0,
        "Na[mEq/L]": 30,
        "K[mEq/L]": 30,
        "Ca[mEq/L]": 15,
        "Mg[mEq/L]": 8,
        "P[mEq/L]": 15,
        "Cl[mEq/L]": 25,
        "Fe[mg/100ml]": 1.0,
        "Zn[mg/100ml]": 0.8,
        "Cu[mg/100ml]": 0.1,
        "Mn[mg/100ml]": 0.05,
        "I[μg/100ml]": 15,
        "Se[μg/100ml]": 5,
        投与経路: "経腸",
      },
    ];
  }
};

// 経腸栄養製品のみをフィルタリング
export const getEnteralProducts = (products: any[]) => {
  return products.filter((product) => {
    const route = product.投与経路 || "";
    const category = product.カテゴリ || "";
    const subCategory = product.サブカテゴリ || "";

    return (
      route.includes("経腸") ||
      category.includes("経腸") ||
      subCategory.includes("経腸") ||
      category.includes("栄養剤") ||
      // 静脈や点滴でないものを経腸として扱う
      (!route.includes("静脈") &&
        !category.includes("点滴") &&
        !category.includes("静脈"))
    );
  });
};

// 中心静脈栄養製品のみをフィルタリング
export const getParenteralProducts = (products: any[]) => {
  return products.filter((product) => {
    const route = product.投与経路 || "";
    const category = product.カテゴリ || "";
    const subCategory = product.サブカテゴリ || "";

    return (
      route.includes("静脈") ||
      category.includes("点滴") ||
      category.includes("静脈") ||
      subCategory.includes("静脈") ||
      subCategory.includes("点滴") ||
      category.includes("輸液") ||
      category.includes("注射")
    );
  });
};
