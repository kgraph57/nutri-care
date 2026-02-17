interface CsvColumn {
  readonly key: string;
  readonly label: string;
}

function escapeCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to CSV string.
 */
export function toCsvString(
  rows: ReadonlyArray<Record<string, unknown>>,
  columns: readonly CsvColumn[],
): string {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(","),
  );
  return [header, ...body].join("\n");
}

/**
 * Download a CSV string as a file with BOM for Excel compatibility.
 */
export function downloadCsv(csvString: string, filename: string): void {
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export patient list as CSV.
 */
export function exportPatientsCsv(
  patients: ReadonlyArray<Record<string, unknown>>,
): void {
  const columns: CsvColumn[] = [
    { key: "name", label: "患者名" },
    { key: "age", label: "年齢" },
    { key: "gender", label: "性別" },
    { key: "ward", label: "病棟" },
    { key: "weight", label: "体重(kg)" },
    { key: "height", label: "身長(cm)" },
    { key: "diagnosis", label: "診断" },
    { key: "admissionDate", label: "入院日" },
  ];
  const csv = toCsvString(patients, columns);
  downloadCsv(csv, `patients_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export nutrition menu as CSV.
 */
export function exportMenuCsv(
  menuName: string,
  items: ReadonlyArray<{
    productName: string;
    volume: number;
    frequency: number;
  }>,
  currentIntake?: Record<string, number>,
): void {
  const columns: CsvColumn[] = [
    { key: "productName", label: "製剤名" },
    { key: "volume", label: "1回量(mL)" },
    { key: "frequency", label: "回数/日" },
    { key: "dailyVolume", label: "1日量(mL)" },
  ];
  const rows = items.map((item) => ({
    ...item,
    dailyVolume: item.volume * item.frequency,
  }));
  let csv = toCsvString(rows, columns);

  if (currentIntake) {
    csv += "\n\n栄養成分\n";
    const nutrientCols: CsvColumn[] = [
      { key: "nutrient", label: "栄養素" },
      { key: "value", label: "投与量" },
    ];
    const nutrientRows = [
      { nutrient: "エネルギー(kcal)", value: Math.round(currentIntake["energy"] ?? 0) },
      { nutrient: "タンパク質(g)", value: Math.round((currentIntake["protein"] ?? 0) * 10) / 10 },
      { nutrient: "脂質(g)", value: Math.round((currentIntake["fat"] ?? 0) * 10) / 10 },
      { nutrient: "炭水化物(g)", value: Math.round((currentIntake["carbs"] ?? 0) * 10) / 10 },
      { nutrient: "Na(mEq)", value: Math.round((currentIntake["sodium"] ?? 0) * 10) / 10 },
      { nutrient: "K(mEq)", value: Math.round((currentIntake["potassium"] ?? 0) * 10) / 10 },
    ];
    csv += toCsvString(nutrientRows, nutrientCols);
  }

  downloadCsv(csv, `${menuName}_${new Date().toISOString().slice(0, 10)}.csv`);
}
