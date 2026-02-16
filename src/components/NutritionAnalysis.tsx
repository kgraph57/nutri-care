import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { NutritionRequirements } from '../types';

interface NutritionAnalysisProps {
  requirements: NutritionRequirements;
  currentIntake: {
    energy: number;
    protein: number;
    fat: number;
    carbs: number;
    sodium: number;
    potassium: number;
    calcium: number;
    magnesium: number;
    phosphorus: number;
    chloride: number;
    iron: number;
    zinc: number;
    copper: number;
    manganese: number;
    iodine: number;
    selenium: number;
  };
}

const NutritionAnalysis: React.FC<NutritionAnalysisProps> = ({ requirements, currentIntake }) => {
  // 栄養素の充足率を計算
  const calculateAdequacy = (current: number, required: number): { percentage: number; status: 'adequate' | 'deficient' | 'excessive' } => {
    const percentage = (current / required) * 100;
    
    if (percentage >= 90 && percentage <= 110) {
      return { percentage, status: 'adequate' };
    } else if (percentage < 90) {
      return { percentage, status: 'deficient' };
    } else {
      return { percentage, status: 'excessive' };
    }
  };

  // 栄養素の表示
  const renderNutrient = (label: string, current: number, required: number, unit: string) => {
    const adequacy = calculateAdequacy(current, required);
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'adequate': return '#059669';
        case 'deficient': return '#dc2626';
        case 'excessive': return '#f59e0b';
        default: return '#6b7280';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'adequate': return <CheckCircle size={16} color="#059669" />;
        case 'deficient': return <TrendingDown size={16} color="#dc2626" />;
        case 'excessive': return <TrendingUp size={16} color="#f59e0b" />;
        default: return null;
      }
    };

    return (
      <div
        key={label}
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getStatusIcon(adequacy.status)}
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            {label}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: getStatusColor(adequacy.status)
          }}>
            {current.toFixed(1)} / {required.toFixed(1)} {unit}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {adequacy.percentage.toFixed(0)}%
          </div>
        </div>
      </div>
    );
  };

  // 不足している栄養素を特定
  const getDeficiencies = () => {
    const deficiencies: string[] = [];
    
    if (currentIntake.energy < requirements.energy * 0.9) deficiencies.push('エネルギー');
    if (currentIntake.protein < requirements.protein * 0.9) deficiencies.push('蛋白質');
    if (currentIntake.fat < requirements.fat * 0.9) deficiencies.push('脂質');
    if (currentIntake.carbs < requirements.carbs * 0.9) deficiencies.push('炭水化物');
    if (currentIntake.sodium < requirements.sodium * 0.9) deficiencies.push('ナトリウム');
    if (currentIntake.potassium < requirements.potassium * 0.9) deficiencies.push('カリウム');
    if (currentIntake.calcium < requirements.calcium * 0.9) deficiencies.push('カルシウム');
    if (currentIntake.magnesium < requirements.magnesium * 0.9) deficiencies.push('マグネシウム');
    if (currentIntake.phosphorus < requirements.phosphorus * 0.9) deficiencies.push('リン');
    if (currentIntake.chloride < requirements.chloride * 0.9) deficiencies.push('クロール');
    if (currentIntake.iron < requirements.iron * 0.9) deficiencies.push('鉄');
    if (currentIntake.zinc < requirements.zinc * 0.9) deficiencies.push('亜鉛');
    if (currentIntake.copper < requirements.copper * 0.9) deficiencies.push('銅');
    if (currentIntake.manganese < requirements.manganese * 0.9) deficiencies.push('マンガン');
    if (currentIntake.iodine < requirements.iodine * 0.9) deficiencies.push('ヨウ素');
    if (currentIntake.selenium < requirements.selenium * 0.9) deficiencies.push('セレン');
    
    return deficiencies;
  };

  const deficiencies = getDeficiencies();

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <AlertTriangle size={20} color="#f59e0b" />
        栄養分析結果
      </h3>

      {/* 主要栄養素 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          margin: '0 0 12px 0'
        }}>
          主要栄養素
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {renderNutrient('エネルギー', currentIntake.energy, requirements.energy, 'kcal')}
          {renderNutrient('蛋白質', currentIntake.protein, requirements.protein, 'g')}
          {renderNutrient('脂質', currentIntake.fat, requirements.fat, 'g')}
          {renderNutrient('炭水化物', currentIntake.carbs, requirements.carbs, 'g')}
        </div>
      </div>

      {/* 電解質 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          margin: '0 0 12px 0'
        }}>
          電解質
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {renderNutrient('ナトリウム', currentIntake.sodium, requirements.sodium, 'mEq')}
          {renderNutrient('カリウム', currentIntake.potassium, requirements.potassium, 'mEq')}
          {renderNutrient('カルシウム', currentIntake.calcium, requirements.calcium, 'mEq')}
          {renderNutrient('マグネシウム', currentIntake.magnesium, requirements.magnesium, 'mEq')}
          {renderNutrient('リン', currentIntake.phosphorus, requirements.phosphorus, 'mEq')}
          {renderNutrient('クロール', currentIntake.chloride, requirements.chloride, 'mEq')}
        </div>
      </div>

      {/* 微量元素 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          margin: '0 0 12px 0'
        }}>
          微量元素
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {renderNutrient('鉄', currentIntake.iron, requirements.iron, 'mg')}
          {renderNutrient('亜鉛', currentIntake.zinc, requirements.zinc, 'mg')}
          {renderNutrient('銅', currentIntake.copper, requirements.copper, 'mg')}
          {renderNutrient('マンガン', currentIntake.manganese, requirements.manganese, 'mg')}
          {renderNutrient('ヨウ素', currentIntake.iodine, requirements.iodine, 'μg')}
          {renderNutrient('セレン', currentIntake.selenium, requirements.selenium, 'μg')}
        </div>
      </div>

      {/* 不足栄養素の警告 */}
      {deficiencies.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '16px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#dc2626',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AlertTriangle size={16} />
            不足している栄養素
          </h4>
          <p style={{
            fontSize: '14px',
            color: '#dc2626',
            margin: 0
          }}>
            {deficiencies.join('、')} が不足しています。追加の栄養製品を検討してください。
          </p>
        </div>
      )}

      {/* 推奨事項 */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '16px'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#0369a1',
          margin: '0 0 8px 0'
        }}>
          推奨事項
        </h4>
        <ul style={{
          fontSize: '14px',
          color: '#0369a1',
          margin: 0,
          paddingLeft: '16px'
        }}>
          <li>栄養要件の90-110%の範囲内で調整してください</li>
          <li>不足している栄養素は追加製品で補完してください</li>
          <li>過剰な栄養素は製品の量を調整してください</li>
          <li>定期的に栄養状態を評価してください</li>
        </ul>
      </div>
    </div>
  );
};

export default NutritionAnalysis;




