import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, GitCompareArrows, Table2, Radar } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar as RechartsRadar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNutritionMenus } from "../hooks/useNutritionMenus";
import { compareMenus } from "../services/menuComparator";
import type { MenuComparisonResult } from "../services/menuComparator";
import { Card, Button, Badge, EmptyState } from "../components/ui";
import styles from "./ComparisonPage.module.css";

const CHART_COLORS = ["#3B82F6", "#16A34A", "#D97706", "#EC4899"] as const;

const RADAR_AXES = [
  { key: "energy", label: "エネルギー" },
  { key: "protein", label: "タンパク質" },
  { key: "fat", label: "脂質" },
  { key: "carbs", label: "炭水化物" },
  { key: "sodium", label: "Na" },
  { key: "potassium", label: "K" },
] as const;

function buildRadarData(result: MenuComparisonResult) {
  return RADAR_AXES.map(({ key, label }) => {
    const values =
      result.nutrients.find((n) => n.nutrient === key)?.values ??
      result.menus.map(() => 0);
    const maxVal = Math.max(...values, 1);
    const entry: Record<string, string | number> = { axis: label };
    values.forEach((v, i) => {
      entry[`m${i}`] = Math.round((v / maxVal) * 100);
    });
    return entry;
  });
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

function ComparisonTable({
  result,
}: {
  readonly result: MenuComparisonResult;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>栄養素</th>
            {result.menus.map((menu) => (
              <th key={menu.id} className={styles.menuHeaderCell}>
                {menu.menuName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>患者</td>
            {result.menus.map((menu) => (
              <td key={menu.id}>{menu.patientName}</td>
            ))}
          </tr>
          <tr>
            <td>タイプ</td>
            {result.menus.map((menu) => (
              <td key={menu.id}>
                <Badge
                  variant={
                    menu.nutritionType === "enteral" ? "success" : "warning"
                  }
                >
                  {menu.nutritionType === "enteral" ? "経腸" : "静脈"}
                </Badge>
              </td>
            ))}
          </tr>
          <tr>
            <td>総エネルギー</td>
            {result.totalEnergies.map((e, i) => (
              <td key={result.menus[i].id}>
                {e}
                <span className={styles.unit}>kcal</span>
              </td>
            ))}
          </tr>
          <tr>
            <td>総水分量</td>
            {result.totalVolumes.map((v, i) => (
              <td key={result.menus[i].id}>
                {v}
                <span className={styles.unit}>mL</span>
              </td>
            ))}
          </tr>
          <tr>
            <td>アイテム数</td>
            {result.itemCounts.map((c, i) => (
              <td key={result.menus[i].id}>{c} 品</td>
            ))}
          </tr>
          {result.nutrients.map((n) => (
            <tr key={n.nutrient}>
              <td>
                {n.label}
                <span className={styles.unit}>({n.unit})</span>
              </td>
              {n.values.map((v, i) => (
                <td
                  key={result.menus[i].id}
                  className={i === n.best ? styles.bestValue : undefined}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ViewMode = "table" | "radar";

function RadarChartView({ result }: { readonly result: MenuComparisonResult }) {
  const radarData = buildRadarData(result);

  return (
    <div className={styles.chartContainer}>
      <p className={styles.chartNote}>
        各栄養素を選択メニュー内の最大値を100として正規化して表示
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 13 }} />
          {result.menus.map((menu, i) => (
            <RechartsRadar
              key={menu.id}
              name={menu.menuName}
              dataKey={`m${i}`}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              fillOpacity={0.25}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonPage() {
  const { menus } = useNutritionMenus();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("ids")?.split(",") ?? [];

  const [selectedIds, setSelectedIds] = useState<readonly string[]>(
    preselected.filter((id) => menus.some((m) => m.id === id)),
  );
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const toggleMenu = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const result: MenuComparisonResult | null = useMemo(() => {
    if (selectedIds.length < 2) return null;
    const selected = selectedIds
      .map((id) => menus.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => m !== undefined);
    if (selected.length < 2) return null;
    return compareMenus(selected);
  }, [selectedIds, menus]);

  if (menus.length < 2) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>メニュー比較</h1>
        </header>
        <EmptyState
          icon={<GitCompareArrows size={40} />}
          title="比較にはメニューが2つ以上必要です"
          description="メニュー作成ページからメニューを作成してください。"
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>メニュー比較</h1>
        <p className={styles.subtitle}>
          2〜4つのメニューを選んで栄養成分を比較
        </p>
      </header>

      <div className={styles.selectorSection}>
        <span className={styles.selectorLabel}>
          比較するメニューを選択 ({selectedIds.length}/4)
        </span>
        <div className={styles.selectorGrid}>
          {menus.map((menu) => {
            const isSelected = selectedIds.includes(menu.id);
            return (
              <Card
                key={menu.id}
                className={`${styles.menuOption} ${isSelected ? styles.menuOptionSelected : ""}`}
                onClick={() => toggleMenu(menu.id)}
              >
                <div
                  className={`${styles.optionCheck} ${isSelected ? styles.optionCheckSelected : ""}`}
                >
                  {isSelected && <Check size={14} />}
                </div>
                <div className={styles.optionInfo}>
                  <span className={styles.optionName}>{menu.menuName}</span>
                  <span className={styles.optionMeta}>
                    {menu.patientName} · {Math.round(menu.totalEnergy)} kcal ·{" "}
                    {formatDate(menu.createdAt)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {result ? (
        <section>
          <div className={styles.viewToggle}>
            <Button
              variant={viewMode === "table" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <Table2 size={15} />
              表で比較
            </Button>
            <Button
              variant={viewMode === "radar" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("radar")}
            >
              <Radar size={15} />
              レーダーチャート
            </Button>
          </div>
          {viewMode === "table" ? (
            <ComparisonTable result={result} />
          ) : (
            <RadarChartView result={result} />
          )}
        </section>
      ) : (
        selectedIds.length > 0 && (
          <p className={styles.subtitle}>
            比較するにはもう{2 - selectedIds.length}つメニューを選択してください
          </p>
        )
      )}
    </div>
  );
}
