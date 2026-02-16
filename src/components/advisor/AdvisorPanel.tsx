import { useState, useMemo } from 'react';
import { Sparkles, ChevronDown, Plus } from 'lucide-react';
import { Card } from '../ui';
import type { Patient, NutritionType } from '../../types';
import type { LabData, NutritionRecommendation } from '../../types/labData';
import { analyzeLabData, getAbnormalFindings } from '../../services/labAnalyzer';
import { generateRecommendations, generateStrategySummary } from '../../services/nutritionAdvisor';
import styles from './AdvisorPanel.module.css';

type Product = Record<string, string | number>;

interface AdvisorPanelProps {
  readonly patient: Patient;
  readonly labData: LabData | undefined;
  readonly nutritionType: NutritionType;
  readonly products: readonly Product[];
  readonly onAddProduct?: (product: Product) => void;
  readonly onEditLabs?: () => void;
}

function statusLabel(status: string): { text: string; className: string } {
  switch (status) {
    case 'critical-high':
    case 'critical-low':
      return { text: '要注意', className: styles.labCritical };
    case 'high':
      return { text: '高値', className: styles.labHigh };
    case 'low':
      return { text: '低値', className: styles.labLow };
    default:
      return { text: '正常', className: styles.labNormal };
  }
}

function priorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'high':
      return styles.badgeHigh;
    case 'medium':
      return styles.badgeMedium;
    default:
      return styles.badgeLow;
  }
}

function priorityLabel(priority: string): string {
  switch (priority) {
    case 'high':
      return '優先度: 高';
    case 'medium':
      return '優先度: 中';
    default:
      return '優先度: 低';
  }
}

export function AdvisorPanel({
  patient,
  labData,
  nutritionType,
  products,
  onAddProduct,
  onEditLabs,
}: AdvisorPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const interpretations = useMemo(
    () => (labData ? analyzeLabData(labData) : []),
    [labData]
  );

  const abnormal = useMemo(
    () => getAbnormalFindings(interpretations),
    [interpretations]
  );

  const recommendations = useMemo(
    () =>
      labData
        ? generateRecommendations(patient, labData, nutritionType, products)
        : [],
    [patient, labData, nutritionType, products]
  );

  const strategy = useMemo(
    () => (labData ? generateStrategySummary(labData) : ''),
    [labData]
  );

  const abnormalCount = abnormal.length;

  if (!labData) {
    return (
      <Card className={styles.panel}>
        <h3 className={styles.heading}>
          <Sparkles size={16} />
          AIアドバイザー
        </h3>
        <div className={styles.emptyState}>
          <p>検査値データがありません</p>
          {onEditLabs && (
            <button className={styles.editLabsLink} onClick={onEditLabs}>
              検査値を入力する
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.panel}>
      <div className={styles.header} onClick={() => setIsOpen((prev) => !prev)}>
        <div className={styles.headerLeft}>
          <h3 className={styles.heading}>
            <Sparkles size={16} />
            AIアドバイザー
          </h3>
          {abnormalCount > 0 && (
            <span className={`${styles.badge} ${styles.badgeHigh}`}>
              {abnormalCount}件の異常
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </div>

      {isOpen && (
        <div className={styles.body}>
          {/* Strategy summary */}
          <p className={styles.strategy}>{strategy}</p>

          {/* Lab interpretations */}
          {abnormal.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>検査値の評価</h4>
              <div className={styles.labList}>
                {abnormal.map((item) => {
                  const badge = statusLabel(item.status);
                  return (
                    <div key={item.parameter} className={styles.labItem}>
                      <span className={`${styles.labBadge} ${badge.className}`}>
                        {badge.text}
                      </span>
                      <span className={styles.labMessage}>{item.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>推奨製品</h4>
              {recommendations.map((rec) => (
                <RecommendationCategory
                  key={rec.category}
                  recommendation={rec}
                  onAddProduct={onAddProduct}
                />
              ))}
            </div>
          )}

          {recommendations.length === 0 && abnormal.length > 0 && (
            <p className={styles.emptyState}>
              該当する推奨製品が見つかりませんでした
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function RecommendationCategory({
  recommendation,
  onAddProduct,
}: {
  readonly recommendation: NutritionRecommendation;
  readonly onAddProduct?: (product: Product) => void;
}) {
  return (
    <div className={styles.recCategory}>
      <h5 className={styles.recCategoryTitle}>
        {recommendation.category}
        <span
          className={`${styles.badge} ${priorityBadgeClass(recommendation.priority)}`}
        >
          {priorityLabel(recommendation.priority)}
        </span>
      </h5>
      <p className={styles.recReasoning}>{recommendation.reasoning}</p>
      <div className={styles.productList}>
        {recommendation.products.map((rec) => (
          <div
            key={String(rec.product['製剤名'])}
            className={styles.productCard}
          >
            <div className={styles.productInfo}>
              <div className={styles.productName}>
                {String(rec.product['製剤名'] ?? '不明')}
              </div>
              <div className={styles.productRationale}>{rec.rationale}</div>
            </div>
            {onAddProduct && (
              <button
                className={styles.addButton}
                onClick={() => onAddProduct(rec.product)}
                title="メニューに追加"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
