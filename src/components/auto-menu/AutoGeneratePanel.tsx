import { useState, useMemo, useCallback } from 'react';
import { Zap, RefreshCw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Patient, NutritionType } from '../../types';
import type { LabData } from '../../types/labData';
import {
  generateNutritionMenu,
  type AutoGenerateInput,
  type GeneratedMenu,
  type GeneratedMenuItem,
} from '../../services/autoMenuGenerator';
import { Card } from '../ui';
import { AllergyAlert } from '../ui/AllergyAlert';
import { DrugInteractionAlert } from '../ui/DrugInteractionAlert';
import styles from './AutoGeneratePanel.module.css';

type Product = Record<string, string | number>;

interface AutoGeneratePanelProps {
  readonly patient?: Patient;
  readonly labData?: LabData;
  readonly allProducts: readonly Product[];
  readonly isLoading: boolean;
  readonly onApply: (
    items: Array<{ product: Product; volume: number; frequency: number }>,
    nutritionType: NutritionType,
    conditionLabel: string,
    menuName: string,
  ) => void;
}

type PanelState = 'collapsed' | 'form' | 'review';

const COMMON_CONDITIONS = [
  '腎不全', '透析', '肝不全', '糖尿病', '呼吸不全',
  '心不全', '術後', '熱傷', '低栄養',
] as const;

function AchievementBar({ label, value }: { readonly label: string; readonly value: number }) {
  const colorClass = value >= 90 ? styles.achievementGood
    : value >= 70 ? styles.achievementWarn
    : styles.achievementLow;

  return (
    <div className={styles.achievementItem}>
      <div className={styles.achievementLabel}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className={styles.achievementBar}>
        <div
          className={`${styles.achievementFill} ${colorClass}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function QuickInputForm({
  onGenerate,
  initialDiagnosis,
}: {
  readonly onGenerate: (input: AutoGenerateInput) => void;
  readonly initialDiagnosis: string;
}) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('男性');
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [fluidRestriction, setFluidRestriction] = useState('');

  const handleSubmit = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h || !a || !diagnosis.trim()) return;

    onGenerate({
      weight: w,
      height: h,
      age: a,
      gender,
      diagnosis: diagnosis.trim(),
      patientType: a < 18 ? 'PICU' : 'ICU',
      allergies: allergies.split(/[,、]/).map((s) => s.trim()).filter(Boolean),
      medications: medications.split(/[,、]/).map((s) => s.trim()).filter(Boolean),
      fluidRestriction: fluidRestriction ? parseFloat(fluidRestriction) : undefined,
    });
  };

  const toggleCondition = (cond: string) => {
    setDiagnosis((prev) => {
      if (prev.includes(cond)) return prev.replace(cond, '').replace(/[、,]\s*[、,]/g, '、').trim();
      return prev ? `${prev}、${cond}` : cond;
    });
  };

  const canSubmit = weight && height && age && diagnosis.trim();

  return (
    <>
      <div className={styles.quickForm}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>体重 (kg)</label>
          <input type="number" className={styles.fieldInput} value={weight}
            onChange={(e) => setWeight(e.target.value)} placeholder="60" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>身長 (cm)</label>
          <input type="number" className={styles.fieldInput} value={height}
            onChange={(e) => setHeight(e.target.value)} placeholder="165" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>年齢</label>
          <input type="number" className={styles.fieldInput} value={age}
            onChange={(e) => setAge(e.target.value)} placeholder="65" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>性別</label>
          <select className={styles.fieldInput} value={gender}
            onChange={(e) => setGender(e.target.value)}>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
          </select>
        </div>
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.fieldLabel}>診断名・病態</label>
          <input type="text" className={styles.fieldInput} value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="例: 腎不全、糖尿病" />
          <div className={styles.conditionChips}>
            {COMMON_CONDITIONS.map((cond) => (
              <button key={cond} type="button"
                className={`${styles.chip} ${diagnosis.includes(cond) ? styles.chipActive : ''}`}
                onClick={() => toggleCondition(cond)}>
                {cond}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>アレルギー (任意)</label>
          <input type="text" className={styles.fieldInput} value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="乳、大豆" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>内服薬 (任意)</label>
          <input type="text" className={styles.fieldInput} value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="ワルファリン" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>水分制限 (mL/日, 任意)</label>
          <input type="number" className={styles.fieldInput} value={fluidRestriction}
            onChange={(e) => setFluidRestriction(e.target.value)}
            placeholder="制限なし" />
        </div>
      </div>
      <button type="button" className={styles.generateButton} onClick={handleSubmit}
        disabled={!canSubmit}>
        <Zap size={18} />
        プラン自動生成
      </button>
    </>
  );
}

function ReviewPanel({
  menu,
  onApply,
  onRegenerate,
  onCancel,
  onUpdateItem,
}: {
  readonly menu: GeneratedMenu;
  readonly onApply: () => void;
  readonly onRegenerate: () => void;
  readonly onCancel: () => void;
  readonly onUpdateItem: (index: number, field: 'volume' | 'frequency', value: number) => void;
}) {
  return (
    <div className={styles.reviewPanel}>
      <div className={styles.summaryHeader}>
        <span className={styles.conditionBadge}>{menu.conditionLabel}</span>
        <span className={`${styles.typeBadge} ${
          menu.nutritionType === 'enteral' ? styles.typeBadgeEnteral : styles.typeBadgeParenteral
        }`}>
          {menu.nutritionType === 'enteral' ? '経腸栄養' : '静脈栄養'}
        </span>
      </div>

      <div className={styles.rationale}>{menu.rationale}</div>

      {menu.items.map((item: GeneratedMenuItem, i: number) => (
        <div key={`${String(item.product['製剤名'])}-${i}`} className={styles.productItem}>
          <div style={{ flex: 1 }}>
            <div className={styles.productName}>{String(item.product['製剤名'] ?? '')}</div>
            <div className={styles.productDetail}>{item.rationale}</div>
          </div>
          <input type="number" className={styles.volumeInput}
            value={item.volume}
            onChange={(e) => onUpdateItem(i, 'volume', parseInt(e.target.value, 10) || 0)} />
          <span style={{ fontSize: '0.75rem' }}>mL</span>
          <span style={{ fontSize: '0.75rem', margin: '0 2px' }}>&times;</span>
          <input type="number" className={styles.freqInput}
            value={item.frequency}
            onChange={(e) => onUpdateItem(i, 'frequency', parseInt(e.target.value, 10) || 1)} />
          <span style={{ fontSize: '0.75rem' }}>回/日</span>
        </div>
      ))}

      <div className={styles.achievementBars}>
        <AchievementBar label={`エネルギー (${menu.totalEnergy} kcal)`} value={menu.energyAchievement} />
        <AchievementBar label={`蛋白質 (${menu.totalProtein} g)`} value={menu.proteinAchievement} />
      </div>

      <AllergyAlert warnings={menu.allergyWarnings} />
      <DrugInteractionAlert interactions={menu.drugInteractions} />

      {menu.warnings.length > 0 && (
        <div className={styles.warningBox}>
          {menu.warnings.map((w, i) => <div key={i}>{w}</div>)}
        </div>
      )}

      {menu.cautions.length > 0 && (
        <ul className={styles.cautionList}>
          {menu.cautions.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      )}

      <div className={styles.actionButtons}>
        <button type="button" className={styles.applyButton} onClick={onApply}>
          <Check size={16} />
          メニューに適用
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onRegenerate}>
          <RefreshCw size={14} />
          再生成
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          キャンセル
        </button>
      </div>

      <p className={styles.disclaimer}>
        自動生成は参考値です。臨床判断に基づいて調整してください。
      </p>
    </div>
  );
}

export function AutoGeneratePanel({
  patient,
  labData,
  allProducts,
  isLoading,
  onApply,
}: AutoGeneratePanelProps) {
  const [state, setState] = useState<PanelState>('collapsed');
  const [generatedMenu, setGeneratedMenu] = useState<GeneratedMenu | null>(null);
  const [lastInput, setLastInput] = useState<AutoGenerateInput | null>(null);

  const handleGenerateFromPatient = useCallback(() => {
    if (!patient || allProducts.length === 0) return;

    const input: AutoGenerateInput = {
      weight: patient.weight,
      height: patient.height,
      age: patient.age,
      gender: patient.gender,
      diagnosis: patient.diagnosis,
      patientType: patient.patientType,
      allergies: patient.allergies,
      medications: patient.medications,
    };

    setLastInput(input);
    const menu = generateNutritionMenu(input, allProducts);
    setGeneratedMenu(menu);
    setState('review');
  }, [patient, allProducts]);

  const handleGenerateFromForm = useCallback((input: AutoGenerateInput) => {
    if (allProducts.length === 0) return;
    setLastInput(input);
    const menu = generateNutritionMenu(input, allProducts);
    setGeneratedMenu(menu);
    setState('review');
  }, [allProducts]);

  const handleRegenerate = useCallback(() => {
    if (!lastInput || allProducts.length === 0) return;
    const menu = generateNutritionMenu(lastInput, allProducts);
    setGeneratedMenu(menu);
  }, [lastInput, allProducts]);

  const handleApply = useCallback(() => {
    if (!generatedMenu) return;
    const items = generatedMenu.items.map((item) => ({
      product: item.product,
      volume: item.volume,
      frequency: item.frequency,
    }));
    const patientName = patient?.name ?? '患者';
    const menuName = `${patientName} ${generatedMenu.conditionLabel}${
      generatedMenu.nutritionType === 'enteral' ? '経腸' : '静脈'
    }栄養メニュー`;

    onApply(items, generatedMenu.nutritionType, generatedMenu.conditionLabel, menuName);
    setState('collapsed');
    setGeneratedMenu(null);
  }, [generatedMenu, patient, onApply]);

  const handleUpdateItem = useCallback((index: number, field: 'volume' | 'frequency', value: number) => {
    if (!generatedMenu || !lastInput) return;
    const updatedItems = generatedMenu.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setGeneratedMenu({ ...generatedMenu, items: updatedItems });
  }, [generatedMenu, lastInput]);

  const handleCancel = useCallback(() => {
    setState('collapsed');
    setGeneratedMenu(null);
  }, []);

  const toggleExpand = useCallback(() => {
    setState((prev) => prev === 'collapsed' ? 'form' : 'collapsed');
    setGeneratedMenu(null);
  }, []);

  if (isLoading) return null;

  return (
    <Card className={styles.panel}>
      {state === 'collapsed' && (
        <>
          {patient ? (
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <button type="button" className={styles.generateButton} onClick={handleGenerateFromPatient}
                style={{ flex: 1 }}>
                <Zap size={18} />
                {patient.name}さんのプランを自動生成
              </button>
              <button type="button" className={styles.secondaryButton} onClick={toggleExpand}>
                <ChevronDown size={16} />
                手入力
              </button>
            </div>
          ) : (
            <button type="button" className={styles.generateButton} onClick={toggleExpand}>
              <Zap size={18} />
              栄養プラン自動生成
              <ChevronDown size={16} />
            </button>
          )}
        </>
      )}

      {state === 'form' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>栄養プラン自動生成</h3>
            <button type="button" className={styles.secondaryButton} onClick={toggleExpand}>
              <ChevronUp size={14} />
            </button>
          </div>
          <QuickInputForm
            onGenerate={handleGenerateFromForm}
            initialDiagnosis={patient?.diagnosis ?? ''}
          />
        </>
      )}

      {state === 'review' && generatedMenu && (
        <ReviewPanel
          menu={generatedMenu}
          onApply={handleApply}
          onRegenerate={handleRegenerate}
          onCancel={handleCancel}
          onUpdateItem={handleUpdateItem}
        />
      )}
    </Card>
  );
}
