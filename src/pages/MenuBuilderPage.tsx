import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Save, Utensils } from "lucide-react";
import { usePatients } from "../hooks/usePatients";
import { useNutritionMenus } from "../hooks/useNutritionMenus";
import { useNutritionDatabase } from "../hooks/useNutritionDatabase";
import {
  calculateNutritionRequirements,
  adjustRequirementsForCondition,
} from "../services/nutritionCalculation";
import { Card, Button, AllergyAlert } from "../components/ui";
import { checkAllergies } from "../services/allergyChecker";
import type { NutritionType } from "../types";
import { RequirementsConfig } from "./menu-builder/RequirementsConfig";
import { ProductSelector } from "./menu-builder/ProductSelector";
import { MenuComposition } from "./menu-builder/MenuComposition";
import { NutritionAnalysisPanel } from "./menu-builder/NutritionAnalysisPanel";
import styles from "./MenuBuilderPage.module.css";

interface MenuItemState {
  id: string;
  product: Record<string, string | number>;
  volume: number;
  frequency: number;
}

const INITIAL_INTAKE: Record<string, number> = {
  energy: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  sodium: 0,
  potassium: 0,
  calcium: 0,
  magnesium: 0,
  phosphorus: 0,
  chloride: 0,
  iron: 0,
  zinc: 0,
  copper: 0,
  manganese: 0,
  iodine: 0,
  selenium: 0,
};

function parseProductValue(
  product: Record<string, string | number>,
  key: string,
): number {
  const raw = product[key];
  if (raw === undefined || raw === null || raw === "") {
    return 0;
  }
  const parsed = typeof raw === "number" ? raw : parseFloat(String(raw));
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateCurrentIntake(
  items: MenuItemState[],
): Record<string, number> {
  return items.reduce<Record<string, number>>(
    (total, item) => {
      const dailyVolume = item.volume * item.frequency;
      const product = item.product;

      return {
        ...total,
        energy:
          total["energy"] +
          parseProductValue(product, "エネルギー[kcal/ml]") * dailyVolume,
        protein:
          total["protein"] +
          (parseProductValue(product, "タンパク質[g/100ml]") * dailyVolume) /
            100,
        fat:
          total["fat"] +
          (parseProductValue(product, "脂質[g/100ml]") * dailyVolume) / 100,
        carbs:
          total["carbs"] +
          (parseProductValue(product, "炭水化物[g/100ml]") * dailyVolume) / 100,
        sodium:
          total["sodium"] +
          (parseProductValue(product, "Na[mEq/L]") * dailyVolume) / 1000,
        potassium:
          total["potassium"] +
          (parseProductValue(product, "K[mEq/L]") * dailyVolume) / 1000,
        calcium:
          total["calcium"] +
          (parseProductValue(product, "Ca[mEq/L]") * dailyVolume) / 1000,
        magnesium:
          total["magnesium"] +
          (parseProductValue(product, "Mg[mEq/L]") * dailyVolume) / 1000,
        phosphorus:
          total["phosphorus"] +
          (parseProductValue(product, "P[mEq/L]") * dailyVolume) / 1000,
        chloride:
          total["chloride"] +
          (parseProductValue(product, "Cl[mEq/L]") * dailyVolume) / 1000,
        iron:
          total["iron"] +
          (parseProductValue(product, "Fe[mg/100ml]") * dailyVolume) / 100,
        zinc:
          total["zinc"] +
          (parseProductValue(product, "Zn[mg/100ml]") * dailyVolume) / 100,
        copper:
          total["copper"] +
          (parseProductValue(product, "Cu[mg/100ml]") * dailyVolume) / 100,
        manganese:
          total["manganese"] +
          (parseProductValue(product, "Mn[mg/100ml]") * dailyVolume) / 100,
        iodine:
          total["iodine"] +
          (parseProductValue(product, "I[μg/100ml]") * dailyVolume) / 100,
        selenium:
          total["selenium"] +
          (parseProductValue(product, "Se[μg/100ml]") * dailyVolume) / 100,
      };
    },
    { ...INITIAL_INTAKE },
  );
}

function generateItemId(productName: string): string {
  return `${productName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function PatientSelector({
  patients,
  selectedPatientId,
  onSelect,
}: {
  readonly patients: readonly { id: string; name: string; ward: string }[];
  readonly selectedPatientId: string;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.patientSelector}>
      <label className={styles.selectorLabel} htmlFor="patient-select">
        患者選択
      </label>
      <select
        id="patient-select"
        className={styles.patientSelect}
        value={selectedPatientId}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">患者を選択してください</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name} ({patient.ward})
          </option>
        ))}
      </select>
    </div>
  );
}

function NutritionTypeToggle({
  nutritionType,
  onTypeChange,
}: {
  readonly nutritionType: NutritionType;
  readonly onTypeChange: (type: NutritionType) => void;
}) {
  return (
    <div className={styles.typeToggle}>
      <button
        className={[
          styles.typeButton,
          nutritionType === "enteral" ? styles.typeButtonActiveEnteral : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onTypeChange("enteral")}
      >
        経腸栄養
      </button>
      <button
        className={[
          styles.typeButton,
          nutritionType === "parenteral"
            ? styles.typeButtonActiveParenteral
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onTypeChange("parenteral")}
      >
        静脈栄養
      </button>
    </div>
  );
}

function MenuInfoSection({
  menuName,
  notes,
  onMenuNameChange,
  onNotesChange,
}: {
  readonly menuName: string;
  readonly notes: string;
  readonly onMenuNameChange: (value: string) => void;
  readonly onNotesChange: (value: string) => void;
}) {
  return (
    <Card className={styles.menuInfoCard}>
      <h3 className={styles.sectionHeading}>
        <Utensils size={18} />
        メニュー情報
      </h3>
      <input
        type="text"
        className={styles.menuNameInput}
        placeholder="メニュー名を入力..."
        value={menuName}
        onChange={(e) => onMenuNameChange(e.target.value)}
      />
      <textarea
        className={styles.notesTextarea}
        placeholder="備考..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={3}
      />
    </Card>
  );
}

export function MenuBuilderPage() {
  const { patientId } = useParams<{ patientId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { patients, getPatient } = usePatients();
  const { saveMenu, updateMenu, getMenuById } = useNutritionMenus();

  const editMenuId = searchParams.get("edit");
  const editingMenu = editMenuId ? getMenuById(editMenuId) : undefined;
  const isEditMode = editingMenu !== undefined;

  const [selectedPatientId, setSelectedPatientId] = useState(
    editingMenu?.patientId ?? patientId ?? "",
  );
  const [nutritionType, setNutritionType] = useState<NutritionType>(
    editingMenu?.nutritionType ??
      (searchParams.get("type") as NutritionType) ??
      "enteral",
  );

  const [activityLevel, setActivityLevel] = useState(
    editingMenu?.activityLevel ?? searchParams.get("activity") ?? "bedrest",
  );
  const [stressLevel, setStressLevel] = useState(
    editingMenu?.stressLevel ?? searchParams.get("stress") ?? "moderate",
  );
  const [medicalCondition, setMedicalCondition] = useState(
    editingMenu?.medicalCondition ?? searchParams.get("condition") ?? "",
  );

  const [menuItems, setMenuItems] = useState<MenuItemState[]>([]);
  const [menuName, setMenuName] = useState(editingMenu?.menuName ?? "");
  const [notes, setNotes] = useState(editingMenu?.notes ?? "");
  const editItemsLoaded = useRef(false);

  const { products, categories, isLoading, error } =
    useNutritionDatabase(nutritionType);

  // Load saved items into editor when in edit mode and products are available
  useEffect(() => {
    if (!editingMenu || isLoading || editItemsLoaded.current) {
      return;
    }
    editItemsLoaded.current = true;

    const loadedItems: MenuItemState[] = editingMenu.items.map((savedItem) => {
      const matchedProduct = products.find(
        (p: Record<string, string | number>) =>
          String(p["製剤名"] ?? "") === savedItem.productName,
      );
      const product: Record<string, string | number> = matchedProduct ?? {
        製剤名: savedItem.productName,
        メーカー: savedItem.manufacturer,
      };
      return {
        id: savedItem.id,
        product,
        volume: savedItem.volume,
        frequency: savedItem.frequency,
      };
    });
    setMenuItems(loadedItems);
  }, [editingMenu, products, isLoading]);

  const selectedPatient = useMemo(
    () => (selectedPatientId ? getPatient(selectedPatientId) : undefined),
    [selectedPatientId, getPatient],
  );

  const requirements = useMemo(() => {
    if (!selectedPatient) {
      return null;
    }
    const base = calculateNutritionRequirements(
      selectedPatient,
      nutritionType,
      activityLevel,
      stressLevel,
    );
    if (medicalCondition) {
      return adjustRequirementsForCondition(base, medicalCondition);
    }
    return base;
  }, [
    selectedPatient,
    nutritionType,
    activityLevel,
    stressLevel,
    medicalCondition,
  ]);

  const currentIntake = useMemo(
    () => calculateCurrentIntake(menuItems),
    [menuItems],
  );

  const totalVolume = useMemo(
    () =>
      menuItems.reduce((sum, item) => sum + item.volume * item.frequency, 0),
    [menuItems],
  );

  const allergyWarnings = useMemo(
    () => (selectedPatient ? checkAllergies(selectedPatient, menuItems) : []),
    [selectedPatient, menuItems],
  );

  const addProduct = useCallback((product: Record<string, string | number>) => {
    const newItem: MenuItemState = {
      id: generateItemId(String(product["製剤名"] ?? "")),
      product,
      volume: 100,
      frequency: 1,
    };
    setMenuItems((prev) => [...prev, newItem]);
  }, []);

  const removeProduct = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateProduct = useCallback(
    (id: string, field: "volume" | "frequency", value: number) => {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!selectedPatient || menuItems.length === 0) {
      return;
    }

    const defaultName = `${selectedPatient.name}の${
      nutritionType === "enteral" ? "経腸" : "中心静脈"
    }栄養メニュー`;

    const menuData = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      nutritionType,
      menuName: menuName || defaultName,
      items: menuItems.map((item) => ({
        id: item.id,
        productName: String(item.product["製剤名"] ?? ""),
        manufacturer: String(item.product["メーカー"] ?? ""),
        volume: item.volume,
        frequency: item.frequency,
      })),
      totalEnergy: Math.round(currentIntake["energy"] ?? 0),
      totalVolume: Math.round(totalVolume),
      requirements,
      currentIntake,
      notes,
      activityLevel,
      stressLevel,
      medicalCondition,
    };

    if (isEditMode && editMenuId) {
      updateMenu(editMenuId, menuData);
    } else {
      saveMenu(menuData);
    }

    navigate("/menus");
  }, [
    selectedPatient,
    menuItems,
    nutritionType,
    menuName,
    currentIntake,
    totalVolume,
    requirements,
    notes,
    activityLevel,
    stressLevel,
    medicalCondition,
    isEditMode,
    editMenuId,
    saveMenu,
    updateMenu,
    navigate,
  ]);

  const canSave = selectedPatient !== undefined && menuItems.length > 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {nutritionType === "enteral" ? "経腸栄養" : "中心静脈栄養"}
            メニュー{isEditMode ? "編集" : "作成"}
          </h1>
          {selectedPatient && (
            <p className={styles.subtitle}>
              {selectedPatient.name} さん ({selectedPatient.age}歳,{" "}
              {selectedPatient.ward})
            </p>
          )}
        </div>
      </header>

      <div className={styles.controls}>
        <PatientSelector
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelect={setSelectedPatientId}
        />
        <NutritionTypeToggle
          nutritionType={nutritionType}
          onTypeChange={setNutritionType}
        />
      </div>

      {!selectedPatient ? (
        <Card className={styles.promptCard}>
          <p className={styles.promptText}>
            上の選択欄から患者を選択して、栄養メニューの作成を開始してください。
          </p>
        </Card>
      ) : (
        <div className={styles.twoColumn}>
          <div className={styles.leftColumn}>
            <RequirementsConfig
              activityLevel={activityLevel}
              stressLevel={stressLevel}
              medicalCondition={medicalCondition}
              onActivityChange={setActivityLevel}
              onStressChange={setStressLevel}
              onConditionChange={setMedicalCondition}
            />

            <ProductSelector
              products={products}
              categories={categories}
              isLoading={isLoading}
              error={error}
              onAddProduct={addProduct}
            />

            <MenuInfoSection
              menuName={menuName}
              notes={notes}
              onMenuNameChange={setMenuName}
              onNotesChange={setNotes}
            />
          </div>

          <div className={styles.rightColumn}>
            <AllergyAlert warnings={allergyWarnings} />

            <MenuComposition
              items={menuItems}
              onRemove={removeProduct}
              onUpdate={updateProduct}
            />

            <NutritionAnalysisPanel
              requirements={requirements}
              currentIntake={currentIntake}
              totalVolume={totalVolume}
            />

            <Button
              variant="primary"
              size="lg"
              icon={<Save size={20} />}
              onClick={handleSave}
              disabled={!canSave}
              className={styles.saveButton}
            >
              {isEditMode ? "変更を保存" : "メニューを保存"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
