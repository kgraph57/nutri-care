import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Calculator, Search, Filter } from 'lucide-react';
import { Patient, NutritionType, NutritionRequirements } from '../types';
import { loadNutritionData, getEnteralProducts, getParenteralProducts } from '../utils/nutritionDataLoader';
import { calculateNutritionRequirements, adjustRequirementsForCondition } from '../services/nutritionCalculation';

interface RealTimeNutritionMenuProps {
  patient: Patient;
  nutritionType: NutritionType;
  onSave: (menuData: any) => void;
  onCancel: () => void;
}

interface NutritionItem {
  id: string;
  product: any;
  volume: number; // ml
  frequency: number; // 回/日
}

const RealTimeNutritionMenu: React.FC<RealTimeNutritionMenuProps> = ({
  patient,
  nutritionType,
  onSave,
  onCancel
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [nutritionItems, setNutritionItems] = useState<NutritionItem[]>([]);
  const [requirements, setRequirements] = useState<NutritionRequirements | null>(null);
  const [menuName, setMenuName] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全てのカテゴリ');
  const [activityLevel, setActivityLevel] = useState('bedrest');
  const [stressLevel, setStressLevel] = useState('moderate');
  const [medicalCondition, setMedicalCondition] = useState('');

  // 栄養データを読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const allProducts = await loadNutritionData();
        console.log('全製品数:', allProducts.length);
        
        const filteredProducts = nutritionType === 'enteral' 
          ? getEnteralProducts(allProducts)
          : getParenteralProducts(allProducts);
        
        console.log(`${nutritionType === 'enteral' ? '経腸' : '中心静脈'}栄養製品数:`, filteredProducts.length);
        setProducts(filteredProducts.slice(0, 50));
      } catch (error) {
        console.error('栄養データの読み込みに失敗:', error);
      }
    };
    loadData();
  }, [nutritionType]);

  // 栄養要件を計算
  useEffect(() => {
    const calculatedRequirements = calculateNutritionRequirements(patient, nutritionType, activityLevel, stressLevel);
    let adjustedRequirements = calculatedRequirements;
    
    if (medicalCondition) {
      adjustedRequirements = adjustRequirementsForCondition(calculatedRequirements, medicalCondition);
    }
    
    setRequirements(adjustedRequirements);
  }, [patient, nutritionType, activityLevel, stressLevel, medicalCondition]);

  // フィルタリングされた製品を取得
  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.製剤名.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.メーカー.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.カテゴリ.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '全てのカテゴリ' || product.カテゴリ === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  // カテゴリ一覧を取得
  const getCategories = () => {
    return ['全てのカテゴリ', ...Array.from(new Set(products.map(p => p.カテゴリ)))];
  };

  // 製品を追加
  const addProduct = (product: any) => {
    const newItem: NutritionItem = {
      id: `${product.製剤名}_${Date.now()}`,
      product,
      volume: 100,
      frequency: 1
    };
    setNutritionItems(prev => [...prev, newItem]);
  };

  // 製品を削除
  const removeProduct = (id: string) => {
    setNutritionItems(prev => prev.filter(item => item.id !== id));
  };

  // 製品の設定を更新
  const updateProduct = (id: string, field: 'volume' | 'frequency', value: number) => {
    setNutritionItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 現在の栄養摂取量を計算（リアルタイム）
  const calculateCurrentIntake = () => {
    return nutritionItems.reduce((total, item) => {
      const dailyVolume = item.volume * item.frequency;
      const product = item.product;
      
      return {
        energy: total.energy + (parseFloat(product['エネルギー[kcal/ml]'] || '0') * dailyVolume),
        protein: total.protein + (parseFloat(product['タンパク質[g/100ml]'] || '0') * dailyVolume / 100),
        fat: total.fat + (parseFloat(product['脂質[g/100ml]'] || '0') * dailyVolume / 100),
        carbs: total.carbs + (parseFloat(product['炭水化物[g/100ml]'] || '0') * dailyVolume / 100),
        sodium: total.sodium + (parseFloat(product['Na[mEq/L]'] || '0') * dailyVolume / 1000),
        potassium: total.potassium + (parseFloat(product['K[mEq/L]'] || '0') * dailyVolume / 1000),
        calcium: total.calcium + (parseFloat(product['Ca[mEq/L]'] || '0') * dailyVolume / 1000),
        magnesium: total.magnesium + (parseFloat(product['Mg[mEq/L]'] || '0') * dailyVolume / 1000),
        phosphorus: total.phosphorus + (parseFloat(product['P[mEq/L]'] || '0') * dailyVolume / 1000),
        chloride: total.chloride + (parseFloat(product['Cl[mEq/L]'] || '0') * dailyVolume / 1000),
        iron: total.iron + (parseFloat(product['Fe[mg/100ml]'] || '0') * dailyVolume / 100),
        zinc: total.zinc + (parseFloat(product['Zn[mg/100ml]'] || '0') * dailyVolume / 100),
        copper: total.copper + (parseFloat(product['Cu[mg/100ml]'] || '0') * dailyVolume / 100),
        manganese: total.manganese + (parseFloat(product['Mn[mg/100ml]'] || '0') * dailyVolume / 100),
        iodine: total.iodine + (parseFloat(product['I[μg/100ml]'] || '0') * dailyVolume / 100),
        selenium: total.selenium + (parseFloat(product['Se[μg/100ml]'] || '0') * dailyVolume / 100)
      };
    }, {
      energy: 0, protein: 0, fat: 0, carbs: 0,
      sodium: 0, potassium: 0, calcium: 0, magnesium: 0, phosphorus: 0, chloride: 0,
      iron: 0, zinc: 0, copper: 0, manganese: 0, iodine: 0, selenium: 0
    });
  };

  const currentIntake = calculateCurrentIntake();
  const totalVolume = nutritionItems.reduce((sum, item) => sum + (item.volume * item.frequency), 0);

  // メニューを保存
  const handleSave = () => {
    const menuData = {
      patientId: patient.id,
      patientName: patient.name,
      nutritionType,
      menuName: menuName || `${patient.name}の${nutritionType === 'enteral' ? '経腸' : '中心静脈'}栄養メニュー`,
      items: nutritionItems,
      requirements,
      currentIntake,
      totalEnergy: Math.round(currentIntake.energy),
      totalVolume: Math.round(totalVolume),
      createdAt: new Date().toISOString(),
      notes,
      activityLevel,
      stressLevel,
      medicalCondition
    };
    onSave(menuData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        padding: '30px',
        maxWidth: '1400px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f3f4f6'
        }}>
          <button
            onClick={onCancel}
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
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {nutritionType === 'enteral' ? '経腸栄養' : '中心静脈栄養'}メニュー作成
            </h2>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '16px'
            }}>
              {patient.name} さん ({patient.age}歳, {patient.ward})
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 左側: 製品選択と設定 */}
          <div>
            {/* 患者設定 */}
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0'
              }}>
                患者設定
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                <div>
                  <label style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    活動レベル
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  >
                    <option value="bedrest">安静臥床</option>
                    <option value="sedentary">座位・軽い活動</option>
                    <option value="light">軽い運動</option>
                    <option value="moderate">中程度の運動</option>
                    <option value="active">激しい運動</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    ストレスレベル
                  </label>
                  <select
                    value={stressLevel}
                    onChange={(e) => setStressLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  >
                    <option value="mild">軽度ストレス</option>
                    <option value="moderate">中等度ストレス</option>
                    <option value="severe">重度ストレス</option>
                    <option value="critical">極重度ストレス</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    病態（任意）
                  </label>
                  <select
                    value={medicalCondition}
                    onChange={(e) => setMedicalCondition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  >
                    <option value="">なし</option>
                    <option value="腎不全">腎不全</option>
                    <option value="肝不全">肝不全</option>
                    <option value="心不全">心不全</option>
                    <option value="糖尿病">糖尿病</option>
                    <option value="炎症性腸疾患">炎症性腸疾患</option>
                    <option value="外傷・手術">外傷・手術</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 製品選択 */}
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0'
              }}>
                栄養製品選択
              </h3>

              {/* 検索・フィルター */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="製品名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 8px 8px 32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                >
                  {getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 製品一覧 */}
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}>
                {getFilteredProducts().length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6b7280',
                    fontSize: '12px'
                  }}>
                    {nutritionType === 'enteral' ? '経腸栄養' : '中心静脈栄養'}製品が見つかりません
                  </div>
                ) : (
                  getFilteredProducts().map((product, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        padding: '8px',
                        marginBottom: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => addProduct(product)}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#3b82f6';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            {product.製剤名}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#6b7280'
                          }}>
                            {product.メーカー} - {product.カテゴリ}
                          </div>
                          <div style={{
                            fontSize: '9px',
                            color: '#9ca3af'
                          }}>
                            エネルギー: {product['エネルギー[kcal/ml]'] || 0}kcal/ml
                          </div>
                        </div>
                        <Plus size={12} color="#3b82f6" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* メニュー名と備考 */}
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0'
              }}>
                メニュー情報
              </h3>
              <input
                type="text"
                placeholder="メニュー名を入力..."
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '8px'
                }}
              />
              <textarea
                placeholder="備考..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* 右側: メニュー構成とリアルタイム栄養分析 */}
          <div>
            {/* 選択した製品一覧 */}
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0'
              }}>
                メニュー構成 ({nutritionItems.length}製品)
              </h3>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}>
                {nutritionItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {item.product.製剤名}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {item.product.メーカー}
                        </div>
                      </div>
                      <button
                        onClick={() => removeProduct(item.id)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={12} />
                        削除
                      </button>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px'
                    }}>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          容量 (ml)
                        </label>
                        <input
                          type="number"
                          value={item.volume}
                          onChange={(e) => updateProduct(item.id, 'volume', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          回数/日
                        </label>
                        <input
                          type="number"
                          value={item.frequency}
                          onChange={(e) => updateProduct(item.id, 'frequency', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* リアルタイム栄養分析 */}
            {requirements && (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0c4a6e',
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Calculator size={20} />
                  リアルタイム栄養分析
                </h3>
                
                {/* 主要栄養素 */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    margin: '0 0 8px 0'
                  }}>
                    主要栄養素
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: currentIntake.energy >= requirements.energy * 0.9 ? '#059669' : '#dc2626'
                      }}>
                        {Math.round(currentIntake.energy)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>kcal/日</div>
                      <div style={{ fontSize: '9px', color: '#6b7280' }}>
                        必要: {requirements.energy}
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: currentIntake.protein >= requirements.protein * 0.9 ? '#059669' : '#dc2626'
                      }}>
                        {Math.round(currentIntake.protein * 10) / 10}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>g/日</div>
                      <div style={{ fontSize: '9px', color: '#6b7280' }}>
                        必要: {requirements.protein}
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: currentIntake.fat >= requirements.fat * 0.9 ? '#059669' : '#dc2626'
                      }}>
                        {Math.round(currentIntake.fat * 10) / 10}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>g/日</div>
                      <div style={{ fontSize: '9px', color: '#6b7280' }}>
                        必要: {requirements.fat}
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: currentIntake.carbs >= requirements.carbs * 0.9 ? '#059669' : '#dc2626'
                      }}>
                        {Math.round(currentIntake.carbs * 10) / 10}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>g/日</div>
                      <div style={{ fontSize: '9px', color: '#6b7280' }}>
                        必要: {requirements.carbs}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 電解質 */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    margin: '0 0 8px 0'
                  }}>
                    電解質
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    fontSize: '11px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Na:</span>
                      <span style={{ color: currentIntake.sodium >= requirements.sodium * 0.9 ? '#059669' : '#dc2626' }}>
                        {Math.round(currentIntake.sodium * 10) / 10}/{requirements.sodium}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>K:</span>
                      <span style={{ color: currentIntake.potassium >= requirements.potassium * 0.9 ? '#059669' : '#dc2626' }}>
                        {Math.round(currentIntake.potassium * 10) / 10}/{requirements.potassium}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ca:</span>
                      <span style={{ color: currentIntake.calcium >= requirements.calcium * 0.9 ? '#059669' : '#dc2626' }}>
                        {Math.round(currentIntake.calcium * 10) / 10}/{requirements.calcium}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mg:</span>
                      <span style={{ color: currentIntake.magnesium >= requirements.magnesium * 0.9 ? '#059669' : '#dc2626' }}>
                        {Math.round(currentIntake.magnesium * 10) / 10}/{requirements.magnesium}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>P:</span>
                      <span style={{ color: currentIntake.phosphorus >= requirements.phosphorus * 0.9 ? '#059669' : '#dc2626' }}>
                        {Math.round(currentIntake.phosphorus * 10) / 10}/{requirements.phosphorus}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cl:</span>
                      <span style={{ color: currentIntake.chloride >= requirements.chloride * 0.9 ? '#059669' : '#dc2626' }}>
                        {Math.round(currentIntake.chloride * 10) / 10}/{requirements.chloride}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  総容量: {Math.round(totalVolume)} ml/日
                </div>
              </div>
            )}

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={nutritionItems.length === 0}
              style={{
                width: '100%',
                background: nutritionItems.length > 0 ? '#10b981' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: nutritionItems.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Save size={20} />
              メニューを保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeNutritionMenu;




