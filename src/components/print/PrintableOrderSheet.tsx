import type { Patient, NutritionRequirements } from "../../types";
import type { LabData } from "../../types/labData";
import { LAB_REFERENCES } from "../../types/labData";

interface MenuItem {
  readonly productName: string;
  readonly volume: number;
  readonly frequency: number;
}

interface PrintableOrderSheetProps {
  readonly patient: Patient;
  readonly menuName: string;
  readonly nutritionType: string;
  readonly items: readonly MenuItem[];
  readonly requirements: NutritionRequirements | null;
  readonly currentIntake: Record<string, number>;
  readonly totalVolume: number;
  readonly labData?: LabData;
  readonly notes?: string;
  readonly adequacyScore?: number;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PrintableOrderSheet({
  patient,
  menuName,
  nutritionType,
  items,
  requirements,
  currentIntake,
  totalVolume,
  labData,
  notes,
  adequacyScore,
}: PrintableOrderSheetProps) {
  const typeLabel = nutritionType === "enteral" ? "経腸栄養" : "中心静脈栄養";

  return (
    <div className="print-sheet">
      <div className="print-header">
        <h1>{typeLabel}指示書</h1>
        <p style={{ margin: "4px 0", fontSize: "10pt", color: "#666" }}>
          {formatDate(new Date())} 作成 | {menuName}
        </p>
      </div>

      <div className="print-patient-info">
        <span><strong>患者名:</strong> {patient.name}</span>
        <span><strong>病棟:</strong> {patient.ward}</span>
        <span><strong>年齢:</strong> {patient.age}歳</span>
        <span><strong>体重:</strong> {patient.weight}kg</span>
        <span><strong>身長:</strong> {patient.height}cm</span>
        <span><strong>診断:</strong> {patient.diagnosis || "—"}</span>
        {patient.allergies.length > 0 && (
          <span style={{ gridColumn: "1 / -1", color: "red" }}>
            <strong>アレルギー:</strong> {patient.allergies.join(", ")}
          </span>
        )}
        {patient.medications.length > 0 && (
          <span style={{ gridColumn: "1 / -1" }}>
            <strong>投薬:</strong> {patient.medications.join(", ")}
          </span>
        )}
      </div>

      <h2 className="print-section-title">栄養処方</h2>
      <table>
        <thead>
          <tr>
            <th>製剤名</th>
            <th>1回量 (mL)</th>
            <th>回数</th>
            <th>1日量 (mL)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.productName}</td>
              <td style={{ textAlign: "right" }}>{item.volume}</td>
              <td style={{ textAlign: "right" }}>{item.frequency}</td>
              <td style={{ textAlign: "right" }}>
                {item.volume * item.frequency}
              </td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700 }}>
            <td colSpan={3}>合計</td>
            <td style={{ textAlign: "right" }}>{totalVolume} mL</td>
          </tr>
        </tbody>
      </table>

      {requirements && (
        <>
          <h2 className="print-section-title">栄養充足状況</h2>
          {adequacyScore !== undefined && (
            <p style={{ fontSize: "11pt" }}>
              <strong>充足スコア:</strong> {adequacyScore}/100
            </p>
          )}
          <table>
            <thead>
              <tr>
                <th>栄養素</th>
                <th>必要量</th>
                <th>投与量</th>
                <th>達成率</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: "energy", label: "エネルギー", unit: "kcal" },
                { key: "protein", label: "タンパク質", unit: "g" },
                { key: "fat", label: "脂質", unit: "g" },
                { key: "carbs", label: "炭水化物", unit: "g" },
                { key: "sodium", label: "Na", unit: "mEq" },
                { key: "potassium", label: "K", unit: "mEq" },
                { key: "calcium", label: "Ca", unit: "mEq" },
                { key: "magnesium", label: "Mg", unit: "mEq" },
                { key: "phosphorus", label: "P", unit: "mEq" },
              ].map(({ key, label, unit }) => {
                const target =
                  requirements[key as keyof NutritionRequirements];
                const current = currentIntake[key] ?? 0;
                const pct =
                  target > 0 ? Math.round((current / target) * 100) : 0;
                return (
                  <tr key={key}>
                    <td>{label}</td>
                    <td style={{ textAlign: "right" }}>
                      {Math.round(target * 10) / 10} {unit}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {Math.round(current * 10) / 10} {unit}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: pct < 80 ? "red" : pct > 120 ? "orange" : "inherit",
                      }}
                    >
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {labData && (
        <>
          <h2 className="print-section-title">検査値 ({labData.date})</h2>
          <table>
            <thead>
              <tr>
                <th>項目</th>
                <th>値</th>
                <th>基準値</th>
              </tr>
            </thead>
            <tbody>
              {LAB_REFERENCES.map((ref) => {
                const val = labData[ref.key];
                if (val === undefined) return null;
                const abnormal =
                  val < ref.normalMin || val > ref.normalMax;
                return (
                  <tr key={ref.key}>
                    <td>{ref.label}</td>
                    <td
                      style={{
                        textAlign: "right",
                        color: abnormal ? "red" : "inherit",
                        fontWeight: abnormal ? 700 : 400,
                      }}
                    >
                      {val} {ref.unit}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {ref.normalMin}–{ref.normalMax} {ref.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {notes && (
        <>
          <h2 className="print-section-title">備考</h2>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "10pt" }}>{notes}</p>
        </>
      )}

      <div className="print-signature">
        <div className="print-signature-box">担当管理栄養士</div>
        <div className="print-signature-box">主治医</div>
        <div className="print-signature-box">看護師</div>
      </div>

      <div className="print-footer">
        nutri-care 栄養管理システム | 印刷日: {formatDate(new Date())}
      </div>
    </div>
  );
}
