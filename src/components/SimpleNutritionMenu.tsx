import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Patient, NutritionType } from '../types';
import { loadNutritionData, getEnteralProducts, getParenteralProducts } from '../utils/nutritionDataLoader';

interface SimpleNutritionMenuProps {
  patient: Patient;
  nutritionType: NutritionType;
  onSave: (menuData: any) => void;
  onCancel: () => void;
}

const SimpleNutritionMenu: React.FC<SimpleNutritionMenuProps> = ({
  patient,
  nutritionType,
  onSave,
  onCancel
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [menuName, setMenuName] = useState('');

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
        setProducts(filteredProducts.slice(0, 30)); // より多くの製品を表示
      } catch (error) {
        console.error('栄養データの読み込みに失敗:', error);
      }
    };
    loadData();
  }, [nutritionType]);

  // 製品を選択
  const addProduct = (product: any) => {
    const newItem = {
      ...product,
      volume: 100, // デフォルト100ml
      frequency: 1 // デフォルト1回/日
    };
    setSelectedProducts(prev => [...prev, newItem]);
  };

  // 製品を削除
  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  // 容量・回数を更新
  const updateProduct = (index: number, field: 'volume' | 'frequency', value: number) => {
    setSelectedProducts(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // 総エネルギーを計算
  const calculateTotalEnergy = () => {
    return selectedProducts.reduce((total, item) => {
      const dailyVolume = item.volume * item.frequency;
      const energyPerMl = parseFloat(item['エネルギー[kcal/ml]'] || '0');
      return total + (energyPerMl * dailyVolume);
    }, 0);
  };

  // メニューを保存
  const handleSave = () => {
    const menuData = {
      patientId: patient.id,
      patientName: patient.name,
      nutritionType,
      menuName: menuName || `${patient.name}の${nutritionType === 'enteral' ? '経腸' : '中心静脈'}栄養メニュー`,
      products: selectedProducts,
      totalEnergy: Math.round(calculateTotalEnergy()),
      createdAt: new Date().toISOString()
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
        maxWidth: '1000px',
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
          {/* 左側: 製品選択 */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              栄養製品選択
            </h3>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}>
              {products.map((product, index) => (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '8px',
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
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {product.製剤名}
                      </h4>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0'
                      }}>
                        {product.メーカー} - {product.カテゴリ}
                      </p>
                      <div style={{
                        fontSize: '11px',
                        color: '#6b7280'
                      }}>
                        エネルギー: {product['エネルギー[kcal/ml]']}kcal/ml
                      </div>
                    </div>
                    <Plus size={16} color="#3b82f6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右側: 選択した製品とメニュー情報 */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              メニュー構成
            </h3>

            {/* メニュー名入力 */}
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
                marginBottom: '16px'
              }}
            />

            {/* 選択した製品一覧 */}
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              {selectedProducts.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f9fafb',
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
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {item.製剤名}
                    </h4>
                    <button
                      onClick={() => removeProduct(index)}
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
                        onChange={(e) => updateProduct(index, 'volume', parseFloat(e.target.value) || 0)}
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
                        onChange={(e) => updateProduct(index, 'frequency', parseFloat(e.target.value) || 0)}
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

            {/* 総エネルギー表示 */}
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0c4a6e'
              }}>
                {Math.round(calculateTotalEnergy())} kcal/日
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                総エネルギー
              </div>
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={selectedProducts.length === 0}
              style={{
                width: '100%',
                background: selectedProducts.length > 0 ? '#10b981' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed',
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

export default SimpleNutritionMenu;
