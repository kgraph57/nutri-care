import React, { useState } from 'react';
import { Utensils, ArrowLeft, Search } from 'lucide-react';
import { Food } from '../types';
import { sampleFoods } from '../data/sampleData';

interface FoodDatabaseProps {
  setCurrentView: (view: string) => void;
}

const FoodDatabase: React.FC<FoodDatabaseProps> = ({ setCurrentView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全てのカテゴリ');

  // 食品の検索とフィルタリング
  const filteredFoods = sampleFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全てのカテゴリ' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['全てのカテゴリ', ...Array.from(new Set(sampleFoods.map(food => food.category)))];

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
        maxWidth: '1200px',
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
              栄養データベース
            </h1>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '16px'
            }}>
              食品の栄養成分を検索・確認
            </p>
          </div>
        </div>

        {/* 検索バー */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="食品名またはカテゴリで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
        </div>

        {/* カテゴリフィルター */}
        <div style={{ marginBottom: '20px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* 食品一覧 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(0)';
                (e.target as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <Utensils size={20} color="#8b5cf6" style={{ marginRight: '8px' }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {food.name}
                </h3>
              </div>
              
              <div style={{
                background: '#f3f4f6',
                borderRadius: '6px',
                padding: '8px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {food.category}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                <div style={{
                  background: '#fef2f2',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626' }}>
                    {food.energy}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>kcal</div>
                </div>
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                    {food.protein}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>g</div>
                </div>
                <div style={{
                  background: '#fef3c7',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#d97706' }}>
                    {food.fat}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>g</div>
                </div>
                <div style={{
                  background: '#f3e8ff',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#7c3aed' }}>
                    {food.carbs}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>g</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFoods.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            <Utensils size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>検索条件に一致する食品が見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDatabase;




