import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Patient, NutritionType } from '../types';

interface PatientManagementProps {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  currentTime: Date;
  onShowPatientForm: (patient?: Patient) => void;
  onShowMenuBuilder: (patient: Patient, nutritionType: NutritionType) => void;
  onShowRealTimeMenuBuilder: (patient: Patient, nutritionType: NutritionType) => void;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ patients, setPatients, currentTime, onShowPatientForm, onShowMenuBuilder, onShowRealTimeMenuBuilder }) => {
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Patient>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 患者の検索とフィルタリング
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ソート機能
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (field: keyof Patient) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('この患者を削除しますか？')) {
      setPatients(patients.filter(patient => patient.id !== id));
    }
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
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f3f4f6'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              患者管理
            </h1>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '16px'
            }}>
              患者情報の登録・管理・検索
            </p>
          </div>
          
          <button
            onClick={() => onShowPatientForm()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = '#2563eb';
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = '#3b82f6';
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <Plus size={20} />
            新規患者登録
          </button>
        </div>

        {/* 検索バー */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="患者名、病棟、診断名で検索..."
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

        {/* 患者一覧テーブル */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  <button
                    onClick={() => handleSort('name')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    患者名
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                  </button>
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  <button
                    onClick={() => handleSort('age')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    年齢
                    {sortField === 'age' && (
                      sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                  </button>
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  <button
                    onClick={() => handleSort('ward')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    病棟
                    {sortField === 'ward' && (
                      sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                  </button>
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  <button
                    onClick={() => handleSort('admissionDate')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    入院日
                    {sortField === 'admissionDate' && (
                      sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                  </button>
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient, index) => (
                <tr key={patient.id} style={{ borderBottom: index < sortedPatients.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px', fontWeight: '500', color: '#1f2937' }}>{patient.name}</td>
                  <td style={{ padding: '12px', color: '#374151' }}>{patient.age}歳</td>
                  <td style={{ padding: '12px', color: '#374151' }}>{patient.ward}</td>
                  <td style={{ padding: '12px', color: '#374151' }}>{patient.admissionDate}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => onShowPatientForm(patient)}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#059669'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#10b981'}
                      >
                        <Edit size={14} />
                        編集
                      </button>
                      <button
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => onShowRealTimeMenuBuilder(patient, 'enteral')}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#059669'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#10b981'}
                      >
                        経腸栄養
                      </button>
                      <button
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => onShowRealTimeMenuBuilder(patient, 'parenteral')}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#d97706'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#f59e0b'}
                      >
                        中心静脈
                      </button>
                      <button
                        style={{
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => onShowMenuBuilder(patient, 'enteral')}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#4b5563'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#6b7280'}
                      >
                        シンプル
                      </button>
                      <button
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => handleDelete(patient.id)}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#dc2626'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#ef4444'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;
