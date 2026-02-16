import { useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Stethoscope,
  Plus,
  Printer,
  FlaskConical,
} from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useNutritionMenus } from "../hooks/useNutritionMenus";
import { useLabData } from "../hooks/useLabData";
import type { LabData } from "../types/labData";
import { LAB_REFERENCES } from "../types/labData";
import { analyzeLabData, getAbnormalFindings } from "../services/labAnalyzer";
import type { NutritionMenuData } from "../hooks/useNutritionMenus";
import {
  Card,
  Badge,
  Button,
  EmptyState,
  Modal,
  NutritionTrendChart,
} from "../components/ui";
import { LabDataForm } from "../components/labs/LabDataForm";
import styles from "./PatientDetailPage.module.css";

function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

function formatDateFull(isoString: string): string {
  return new Date(isoString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupByDate(
  menus: readonly NutritionMenuData[],
): Map<string, NutritionMenuData[]> {
  const sorted = [...menus].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const groups = new Map<string, NutritionMenuData[]>();
  for (const menu of sorted) {
    const dateKey = new Date(menu.createdAt).toISOString().slice(0, 10);
    const existing = groups.get(dateKey);
    if (existing) {
      groups.set(dateKey, [...existing, menu]);
    } else {
      groups.set(dateKey, [menu]);
    }
  }
  return groups;
}

function computeSummary(menus: readonly NutritionMenuData[]) {
  const totalMenus = menus.length;
  const enteralCount = menus.filter(
    (m) => m.nutritionType === "enteral",
  ).length;
  const parenteralCount = totalMenus - enteralCount;

  const latestMenu = [...menus].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  const latestEnergy = latestMenu ? Math.round(latestMenu.totalEnergy) : 0;

  return { totalMenus, enteralCount, parenteralCount, latestEnergy };
}

interface MenuEntryProps {
  readonly menu: NutritionMenuData;
}

function MenuEntry({ menu }: MenuEntryProps) {
  const isEnteral = menu.nutritionType === "enteral";

  return (
    <Card className={styles.menuEntry}>
      <div className={styles.menuEntryHeader}>
        <span className={styles.menuEntryName}>{menu.menuName}</span>
        <Badge variant={isEnteral ? "success" : "warning"}>
          {isEnteral ? "経腸栄養" : "静脈栄養"}
        </Badge>
      </div>

      <div className={styles.menuStats}>
        <div className={styles.menuStat}>
          <span className={styles.menuStatValue}>
            {Math.round(menu.totalEnergy)}
          </span>
          <span className={styles.menuStatLabel}>kcal</span>
        </div>
        <div className={styles.menuStat}>
          <span className={styles.menuStatValue}>
            {Math.round(menu.totalVolume)}
          </span>
          <span className={styles.menuStatLabel}>mL</span>
        </div>
        <div className={styles.menuStat}>
          <span className={styles.menuStatValue}>{menu.items.length}</span>
          <span className={styles.menuStatLabel}>品目</span>
        </div>
      </div>

      {menu.items.length > 0 && (
        <ul className={styles.itemsList}>
          {menu.items.map((item) => (
            <li key={item.id} className={styles.itemChip}>
              {item.productName} {item.volume}mL&times;{item.frequency}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

interface DateGroupProps {
  readonly dateKey: string;
  readonly menus: readonly NutritionMenuData[];
}

function DateGroup({ dateKey, menus }: DateGroupProps) {
  return (
    <div className={styles.dateGroup}>
      <div className={styles.dateDot} />
      <p className={styles.dateLabel}>{formatDateFull(dateKey)}</p>
      {menus.map((menu) => (
        <MenuEntry key={menu.id} menu={menu} />
      ))}
    </div>
  );
}

const KEY_LAB_PARAMS = [
  "albumin",
  "creatinine",
  "bloodSugar",
  "crp",
  "potassium",
  "sodium",
  "hemoglobin",
] as const;

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatient } = usePatients();
  const { getMenusForPatient } = useNutritionMenus();
  const { getLabData, saveLabData } = useLabData();
  const [showLabModal, setShowLabModal] = useState(false);

  const patient = patientId ? getPatient(patientId) : undefined;
  const patientMenus = useMemo(
    () => (patientId ? getMenusForPatient(patientId) : []),
    [patientId, getMenusForPatient],
  );

  const dateGroups = useMemo(() => groupByDate(patientMenus), [patientMenus]);
  const summary = useMemo(() => computeSummary(patientMenus), [patientMenus]);

  const labData = useMemo(
    () => (patientId ? getLabData(patientId) : undefined),
    [patientId, getLabData],
  );

  const labInterpretations = useMemo(
    () => (labData ? getAbnormalFindings(analyzeLabData(labData)) : []),
    [labData],
  );

  const handleLabSave = useCallback(
    (data: LabData) => {
      if (patientId) {
        saveLabData(patientId, data);
      }
      setShowLabModal(false);
    },
    [patientId, saveLabData],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!patient) {
    return (
      <div className={styles.page}>
        <Link to="/patients" className={styles.backLink}>
          <ArrowLeft size={16} />
          患者一覧に戻る
        </Link>
        <EmptyState
          icon={<Stethoscope size={48} />}
          title="患者が見つかりません"
          description="患者データが存在しないか、削除された可能性があります。"
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/patients" className={styles.backLink}>
        <ArrowLeft size={16} />
        患者一覧に戻る
      </Link>

      <div className={styles.patientHeader}>
        <div className={styles.patientInfo}>
          <h1 className={styles.patientName}>{patient.name}</h1>
          <div className={styles.patientMeta}>
            <span className={styles.metaItem}>{patient.age}歳</span>
            <span className={styles.metaItem}>
              <MapPin size={14} />
              {patient.ward}
            </span>
            <span className={styles.metaItem}>
              <Calendar size={14} />
              入院 {formatDateShort(patient.admissionDate)}
            </span>
            {patient.diagnosis && (
              <span className={styles.metaItem}>
                <Stethoscope size={14} />
                {patient.diagnosis}
              </span>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Link to={`/menu-builder/${patientId}?type=enteral`}>
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>
              経腸メニュー作成
            </Button>
          </Link>
          <Link to={`/menu-builder/${patientId}?type=parenteral`}>
            <Button variant="secondary" size="sm" icon={<Plus size={14} />}>
              静脈メニュー作成
            </Button>
          </Link>
          {patientMenus.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Printer size={14} />}
              onClick={handlePrint}
              className={styles.printButton}
            >
              PDF出力
            </Button>
          )}
        </div>
      </div>

      <div className={styles.summaryStrip}>
        <Card className={styles.summaryItem}>
          <span className={styles.summaryValue}>{summary.totalMenus}</span>
          <span className={styles.summaryLabel}>総メニュー数</span>
        </Card>
        <Card className={styles.summaryItem}>
          <span className={styles.summaryValue}>{summary.enteralCount}</span>
          <span className={styles.summaryLabel}>経腸栄養</span>
        </Card>
        <Card className={styles.summaryItem}>
          <span className={styles.summaryValue}>{summary.parenteralCount}</span>
          <span className={styles.summaryLabel}>静脈栄養</span>
        </Card>
        <Card className={styles.summaryItem}>
          <span className={styles.summaryValue}>{summary.latestEnergy}</span>
          <span className={styles.summaryLabel}>最新 kcal</span>
        </Card>
      </div>

      <section className={styles.section}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--spacing-3)",
          }}
        >
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            <FlaskConical size={18} style={{ marginRight: 6 }} />
            検査値データ
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLabModal(true)}
          >
            {labData ? "編集" : "入力"}
          </Button>
        </div>
        {labData ? (
          <Card style={{ padding: "var(--spacing-3)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "var(--spacing-2)",
              }}
            >
              {KEY_LAB_PARAMS.map((key) => {
                const ref = LAB_REFERENCES.find((r) => r.key === key);
                const val = labData[key];
                if (!ref || val === undefined) return null;
                const abnormal = labInterpretations.some(
                  (i) => i.parameter === key,
                );
                return (
                  <div key={key} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-neutral-500)",
                      }}
                    >
                      {ref.label}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: 600,
                        color: abnormal
                          ? "var(--color-danger)"
                          : "var(--color-neutral-800)",
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--color-neutral-400)",
                      }}
                    >
                      {ref.unit}
                    </div>
                  </div>
                );
              })}
            </div>
            {labInterpretations.length > 0 && (
              <div
                style={{
                  marginTop: "var(--spacing-2)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-danger)",
                }}
              >
                {labInterpretations.length}件の異常値あり
              </div>
            )}
          </Card>
        ) : (
          <Card
            style={{
              padding: "var(--spacing-4)",
              textAlign: "center",
              color: "var(--color-neutral-400)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            検査値が未入力です。入力するとAIアドバイザーが栄養推奨を行います。
          </Card>
        )}
      </section>

      {patientMenus.length >= 2 && (
        <section className={styles.section}>
          <NutritionTrendChart menus={patientMenus} />
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>栄養メニュー履歴</h2>

        {patientMenus.length === 0 ? (
          <EmptyState
            icon={<Calendar size={40} />}
            title="履歴がありません"
            description="メニューを作成すると、ここに日付順で表示されます。"
            action={
              <Link to={`/menu-builder/${patientId}`}>
                <Button variant="primary" icon={<Plus size={16} />}>
                  メニュー作成
                </Button>
              </Link>
            }
          />
        ) : (
          <div className={styles.timeline}>
            {Array.from(dateGroups.entries()).map(([dateKey, menus]) => (
              <DateGroup key={dateKey} dateKey={dateKey} menus={menus} />
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={showLabModal}
        title="検査値入力"
        onClose={() => setShowLabModal(false)}
      >
        {patientId && (
          <LabDataForm
            patientId={patientId}
            initialData={labData}
            onSave={handleLabSave}
            onCancel={() => setShowLabModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}
