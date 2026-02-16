import React from 'react';
import { Calendar, User, Zap, ArrowLeft } from 'lucide-react';

interface NutritionMenuListProps {
  menus: any[];
  onBack: () => void;
}

const NutritionMenuList: React.FC<NutritionMenuListProps> = ({ menus, onBack }) => {
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
        maxWidth: '1000px',
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
            onClick={onBack}
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
              栄養メニュー一覧
            </h1>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '16px'
            }}>
              作成された栄養メニューの一覧
            </p>
          </div>
        </div>

        {/* メニュー一覧 */}
        {menus.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280'
          }}>
            <Zap size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>まだ栄養メニューが作成されていません</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              患者管理画面から栄養メニューを作成してください
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {menus.map((menu, index) => (
              <div
                key={index}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      {menu.menuName}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <User size={16} />
                        {menu.patientName}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Calendar size={16} />
                        {new Date(menu.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: menu.nutritionType === 'enteral' ? '#8b5cf6' : '#f59e0b',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {menu.nutritionType === 'enteral' ? '経腸栄養' : '中心静脈栄養'}
                  </div>
                </div>

                {/* 栄養情報 */}
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 12px 0'
                  }}>
                    栄養情報
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: '#fef2f2',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#dc2626'
                      }}>
                        {menu.totalEnergy}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        kcal/日
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: '#f0fdf4',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#059669'
                      }}>
                        {menu.products.length}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        製品数
                      </div>
                    </div>
                  </div>
                </div>

                {/* 製品一覧 */}
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 12px 0'
                  }}>
                    使用製品
                  </h4>
                  <div style={{
                    display: 'grid',
                    gap: '8px'
                  }}>
                    {menu.products.map((product: any, productIndex: number) => (
                      <div
                        key={productIndex}
                        style={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          padding: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            {product.製剤名}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            {product.メーカー}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          textAlign: 'right'
                        }}>
                          <div>{product.volume}ml × {product.frequency}回</div>
                          <div>{product.volume * product.frequency}ml/日</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionMenuList;




