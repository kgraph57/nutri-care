import { useState, useEffect, useMemo } from "react";
import { Check, GitCompareArrows, BarChart2 } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { loadNutritionData } from "../utils/nutritionDataLoader";
import { Card, Button, SearchInput, EmptyState } from "../components/ui";
import styles from "./ProductComparePage.module.css";

const CHART_COLORS = ["#3B82F6", "#16A34A", "#D97706", "#EC4899"] as const;
const MAX_SELECTED = 4;

const RADAR_AXES = [
  { key: "エネルギー[kcal/ml]", label: "エネルギー" },
  { key: "タンパク質[g/100ml]", label: "タンパク質" },
  { key: "脂質[g/100ml]", label: "脂質" },
  { key: "炭水化物[g/100ml]", label: "炭水化物" },
  { key: "Na[mEq/L]", label: "Na" },
  { key: "Zn[mg/100ml]", label: "Zn" },
] as const;

const TABLE_ROWS: { label: string; key: string; numeric: boolean }[] = [
  { label: "メーカー", key: "メーカー", numeric: false },
  { label: "カテゴリ", key: "カテゴリ", numeric: false },
  { label: "投与経路", key: "投与経路", numeric: false },
  { label: "エネルギー (kcal/ml)", key: "エネルギー[kcal/ml]", numeric: true },
  { label: "タンパク質 (g/100ml)", key: "タンパク質[g/100ml]", numeric: true },
  { label: "脂質 (g/100ml)", key: "脂質[g/100ml]", numeric: true },
  { label: "炭水化物 (g/100ml)", key: "炭水化物[g/100ml]", numeric: true },
  { label: "Na (mEq/L)", key: "Na[mEq/L]", numeric: true },
  { label: "K (mEq/L)", key: "K[mEq/L]", numeric: true },
  { label: "Ca (mEq/L)", key: "Ca[mEq/L]", numeric: true },
  { label: "Mg (mEq/L)", key: "Mg[mEq/L]", numeric: true },
  { label: "P (mEq/L)", key: "P[mEq/L]", numeric: true },
  { label: "Cl (mEq/L)", key: "Cl[mEq/L]", numeric: true },
  { label: "Fe (mg/100ml)", key: "Fe[mg/100ml]", numeric: true },
  { label: "Zn (mg/100ml)", key: "Zn[mg/100ml]", numeric: true },
  { label: "Cu (mg/100ml)", key: "Cu[mg/100ml]", numeric: true },
];

type ViewMode = "radar" | "table";

function parseNum(product: Record<string, unknown>, key: string): number {
  return parseFloat(String(product[key] ?? "0")) || 0;
}

function buildRadarData(selected: Record<string, unknown>[]) {
  return RADAR_AXES.map(({ key, label }) => {
    const values = selected.map((p) => parseNum(p, key));
    const max = Math.max(...values, 1);
    const entry: Record<string, unknown> = { axis: label };
    selected.forEach((p, i) => {
      entry[`p${i}`] = Math.round((parseNum(p, key) / max) * 100);
    });
    return entry;
  });
}

function CompareTable({
  selected,
}: {
  readonly selected: Record<string, unknown>[];
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.stickyCol}>栄養素</th>
            {selected.map((p, i) => (
              <th key={i} className={styles.productHeaderCell}>
                {String(p["製剤名"])}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row) => {
            const values = selected.map((p) =>
              row.numeric ? parseNum(p, row.key) : String(p[row.key] ?? "-"),
            );
            const maxVal = row.numeric
              ? Math.max(...(values as number[]))
              : null;
            return (
              <tr key={row.key}>
                <td className={`${styles.stickyCol} ${styles.rowLabel}`}>
                  {row.label}
                </td>
                {values.map((v, i) => {
                  const isBest =
                    row.numeric &&
                    maxVal !== null &&
                    maxVal > 0 &&
                    (v as number) === maxVal;
                  return (
                    <td
                      key={i}
                      className={isBest ? styles.bestValue : undefined}
                    >
                      {typeof v === "number"
                        ? v.toFixed(v < 1 ? 2 : 1)
                        : v}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ProductComparePage() {
  const [allProducts, setAllProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("radar");

  useEffect(() => {
    loadNutritionData()
      .then((data: unknown) =>
        setAllProducts(data as Record<string, unknown>[]),
      )
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter((p) =>
      String(p["製剤名"]).toLowerCase().includes(q),
    );
  }, [allProducts, search]);

  const selectedProducts = useMemo(
    () =>
      selectedNames
        .map((name) =>
          allProducts.find((p) => String(p["製剤名"]) === name),
        )
        .filter((p): p is Record<string, unknown> => p !== undefined),
    [selectedNames, allProducts],
  );

  const toggleProduct = (name: string) => {
    setSelectedNames((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, name];
    });
  };

  const radarData = useMemo(
    () =>
      selectedProducts.length >= 2 ? buildRadarData(selectedProducts) : [],
    [selectedProducts],
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingText}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>栄養剤比較</h1>
        <p className={styles.subtitle}>
          最大4製剤を選んでレーダーチャート・表で成分を比較できます
        </p>
      </header>

      <div className={styles.controls}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="製剤名で検索..."
          className={styles.searchInput}
        />
        <div className={styles.viewToggle}>
          <Button
            type="button"
            variant={viewMode === "radar" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("radar")}
          >
            レーダーチャート
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            表で比較
          </Button>
        </div>
      </div>

      <div className={styles.selectorSection}>
        <span className={styles.selectorLabel}>
          製剤を選択 ({selectedNames.length}/{MAX_SELECTED})
        </span>
        <div className={styles.selectorGrid}>
          {filtered.map((product, idx) => {
            const name = String(product["製剤名"]);
            const maker = String(product["メーカー"] ?? "");
            const isSelected = selectedNames.includes(name);
            const isDisabled =
              !isSelected && selectedNames.length >= MAX_SELECTED;
            return (
              <Card
                key={`${name}-${idx}`}
                className={[
                  styles.productCard,
                  isSelected ? styles.productCardSelected : "",
                  isDisabled ? styles.productCardDisabled : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={isDisabled ? undefined : () => toggleProduct(name)}
              >
                <div
                  className={[
                    styles.checkIndicator,
                    isSelected ? styles.checkIndicatorSelected : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isSelected && <Check size={13} />}
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{name}</span>
                  <span className={styles.productMaker}>{maker}</span>
                </div>
              </Card>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className={styles.noResults}>該当製剤が見つかりません</p>
        )}
      </div>

      <div className={styles.divider} />

      <section className={styles.comparisonSection}>
        {selectedProducts.length < 2 ? (
          <EmptyState
            icon={<GitCompareArrows size={40} />}
            title="栄養剤を2つ以上選んで比較"
            description="上のリストから製剤を選択すると比較が表示されます"
          />
        ) : viewMode === "radar" ? (
          <div className={styles.chartArea}>
            <p className={styles.chartNote}>
              ※ 値は選択製剤内で正規化（0=最小, 100=最大）
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" />
                {selectedProducts.map((product, i) => (
                  <Radar
                    key={i}
                    name={String(product["製剤名"])}
                    dataKey={`p${i}`}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <CompareTable selected={selectedProducts} />
        )}
      </section>

      {selectedProducts.length >= 2 && viewMode === "table" && (
        <p className={styles.tableNote}>
          <BarChart2 size={14} />
          緑太字は各行の最高値
        </p>
      )}
    </div>
  );
}
