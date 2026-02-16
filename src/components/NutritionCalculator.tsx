import React, { useState } from 'react';
import { Calculator, ArrowLeft, Users } from 'lucide-react';
import { Patient, NutritionCalculation } from '../types';

interface NutritionCalculatorProps {
  patients: Patient[];
  setCurrentView: (view: string) => void;
}

const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({ patients, setCurrentView }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [activityLevel, setActivityLevel] = useState('bedrest');
  const [calculationResults, setCalculationResults] = useState<NutritionCalculation | null>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const calculateNutrition = () => {
    if (!selectedPatient) return;

    // Harris-Benedict式による基礎代謝量計算
    let bmr: number;
    if (selectedPatient.gender === '男性') {
      bmr = 66.5 + (13.75 * selectedPatient.weight) + (5.003 * selectedPatient.height) - (6.775 * selectedPatient.age);
    } else {
      bmr = 655.1 + (9.563 * selectedPatient.weight) + (1.850 * selectedPatient.height) - (4.676 * selectedPatient.age);
    }

    // 活動係数
    const activityFactors: { [key: string]: number } = {
      bedrest: 1.0,
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const totalEnergy = bmr * activityFactors[activityLevel];
    
    // 栄養素の計算（ICU患者用）
    const protein = selectedPatient.weight * 1.5; // 1.5g/kg/day
    const fat = totalEnergy * 0.3 / 9; // 30% of energy from fat
    const carbs = (totalEnergy - (protein * 4) - (fat * 9)) / 4;

    setCalculationResults({
      energy: Math.round(totalEnergy),
      protein: Math.round(protein * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      carbs: Math.round(carbs * 10) / 10
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        padding: '30px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f3f4f6'
        }}>
          <button
            onClick={() => setCurrentView('landing')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280',
              fontSize: '16px',
              marginRight: '20px'
            }}
          >
            <ArrowLeft size={20} />
            戻る
          </button>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              栄養計算
            </h1>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '16px'
            }}>
              患者の必要栄養量を自動計算
            </p>
          </div>
        </div>

        {/* 患者選択 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            患者を選択
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          >
            <option value="">患者を選択してください</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name} ({patient.age}歳, {patient.ward})
              </option>
            ))}
          </select>
        </div>

        {/* 活動レベル選択 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            活動レベル
          </label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          >
            <option value="bedrest">安静臥床</option>
            <option value="sedentary">座位・軽い活動</option>
            <option value="light">軽い運動</option>
            <option value="moderate">中程度の運動</option>
            <option value="active">激しい運動</option>
            <option value="veryActive">非常に激しい運動</option>
          </select>
        </div>

        {/* 計算ボタン */}
        <button
          onClick={calculateNutrition}
          disabled={!selectedPatientId}
          style={{
            width: '100%',
            background: selectedPatientId ? '#10b981' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: selectedPatientId ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (selectedPatientId) {
              (e.target as HTMLElement).style.background = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedPatientId) {
              (e.target as HTMLElement).style.background = '#10b981';
            }
          }}
        >
          <Calculator size={20} />
          栄養量を計算
        </button>

        {/* 計算結果 */}
        {calculationResults && selectedPatient && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0c4a6e',
              margin: '0 0 16px 0'
            }}>
              {selectedPatient.name} さんの必要栄養量
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                  {calculationResults.energy}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>kcal/日</div>
              </div>
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                  {calculationResults.protein}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>g/日</div>
              </div>
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>
                  {calculationResults.fat}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>g/日</div>
              </div>
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ea580c' }}>
                  {calculationResults.carbs}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>g/日</div>
              </div>
            </div>
          </div>
        )}

        {/* 患者情報表示 */}
        {selectedPatient && (
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 12px 0'
            }}>
              患者情報
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <div>年齢: {selectedPatient.age}歳</div>
              <div>性別: {selectedPatient.gender}</div>
              <div>体重: {selectedPatient.weight}kg</div>
              <div>身長: {selectedPatient.height}cm</div>
              <div>病棟: {selectedPatient.ward}</div>
              <div>診断: {selectedPatient.diagnosis}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionCalculator;




