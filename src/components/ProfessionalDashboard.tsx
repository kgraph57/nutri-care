import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  Heart, 
  Activity, 
  Droplets, 
  Zap,
  Calendar,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Star,
  Clock,
  Users,
  Award,
  ArrowRight,
  Filter,
  Menu
} from 'lucide-react';
import { Patient, NutritionType } from '../types';
import { samplePatients } from '../data/sampleData';

interface ProfessionalDashboardProps {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  currentTime: Date;
  onShowPatientForm: (patient?: Patient) => void;
  onShowRealTimeMenuBuilder: (patient: Patient, nutritionType: NutritionType) => void;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({
  patients,
  setPatients,
  currentTime,
  onShowPatientForm,
  onShowRealTimeMenuBuilder
}) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('8:00');

  // フィルタリングされた患者
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 栄養状態のシミュレーション
  const getNutritionStatus = (patient: Patient) => {
    return {
      energy: Math.floor(Math.random() * 200) + 1200,
      protein: Math.floor(Math.random() * 50) + 60,
      fat: Math.floor(Math.random() * 30) + 40,
      carbs: Math.floor(Math.random() * 100) + 150,
      heartRate: Math.floor(Math.random() * 40) + 70,
      bloodPressure: `${Math.floor(Math.random() * 20) + 110}/${Math.floor(Math.random() * 15) + 65}`,
      bloodGlucose: Math.floor(Math.random() * 50) + 80,
      heartEfficiency: Math.floor(Math.random() * 30) + 70,
      rating: 4.6,
      experience: 8,
      patientsCount: 3500,
      reviewsCount: 2800
    };
  };

  const nutritionStatus = selectedPatient ? getNutritionStatus(selectedPatient) : null;

  // 今後の予定
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. 田中 美咲',
      specialty: '循環器専門医',
      time: '08:35 - 09:30',
      date: '21 August',
      type: 'Cardiologist',
      patient: selectedPatient?.name || '患者A',
      rating: 4.8,
      experience: 12,
      patientsCount: 4200,
      reviewsCount: 3200
    },
    {
      id: 2,
      doctor: 'Dr. 佐藤 健一',
      specialty: '神経科医',
      time: '10:00 - 11:00',
      date: '22 August',
      type: 'Neurologist',
      patient: selectedPatient?.name || '患者B',
      rating: 4.7,
      experience: 10,
      patientsCount: 3800,
      reviewsCount: 2900
    },
    {
      id: 3,
      doctor: 'Dr. 山田 花子',
      specialty: '眼科医',
      time: '14:00 - 15:00',
      date: '23 August',
      type: 'Optician',
      patient: selectedPatient?.name || '患者C',
      rating: 4.9,
      experience: 15,
      patientsCount: 5100,
      reviewsCount: 4100
    },
    {
      id: 4,
      doctor: 'Dr. 鈴木 太郎',
      specialty: '泌尿器科医',
      time: '16:00 - 17:00',
      date: '27 August',
      type: 'Urologist',
      patient: selectedPatient?.name || '患者D',
      rating: 4.5,
      experience: 8,
      patientsCount: 3200,
      reviewsCount: 2400
    }
  ];

  const timeSlots = ['7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00'];
  const dates = [
    { day: '22', dayName: 'Friday', selected: false },
    { day: '23', dayName: 'Saturday', selected: false },
    { day: '24', dayName: 'Sunday', selected: true },
    { day: '25', dayName: 'Monday', selected: false },
    { day: '26', dayName: 'Tuesday', selected: false }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* ヘッダー */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Heart size={18} color="white" />
          </div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>
            NutriCare
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} color="#6b7280" style={{ cursor: 'pointer' }} />
          <Bell size={20} color="#6b7280" style={{ cursor: 'pointer' }} />
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <User size={18} color="white" />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* 患者選択セクション */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 20px 0'
          }}>
            患者を選択してください
          </h2>
          
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="患者名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 52px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '16px',
                outline: 'none',
                background: '#f8fafc',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                (e.target as HTMLElement).style.borderColor = '#667eea';
                (e.target as HTMLElement).style.background = 'white';
              }}
              onBlur={(e) => {
                (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                (e.target as HTMLElement).style.background = '#f8fafc';
              }}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                style={{
                  background: selectedPatient?.id === patient.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedPatient?.id === patient.id ? 'none' : '2px solid #e5e7eb',
                  boxShadow: selectedPatient?.id === patient.id ? '0 8px 25px rgba(102, 126, 234, 0.3)' : '0 4px 12px rgba(0,0,0,0.05)',
                  transform: selectedPatient?.id === patient.id ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (selectedPatient?.id !== patient.id) {
                    (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPatient?.id !== patient.id) {
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                    (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: selectedPatient?.id === patient.id ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: selectedPatient?.id === patient.id ? 'white' : '#1f2937',
                      fontSize: '16px',
                      marginBottom: '4px'
                    }}>
                      {patient.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: selectedPatient?.id === patient.id ? 'rgba(255,255,255,0.8)' : '#6b7280'
                    }}>
                      {patient.age}歳, {patient.ward}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: selectedPatient?.id === patient.id ? 'rgba(255,255,255,0.9)' : '#6b7280',
                  marginBottom: '12px'
                }}>
                  {patient.diagnosis}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowRealTimeMenuBuilder(patient, 'enteral');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: selectedPatient?.id === patient.id ? 'rgba(255,255,255,0.2)' : '#10b981',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Heart size={12} />
                    経腸栄養
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowRealTimeMenuBuilder(patient, 'parenteral');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: selectedPatient?.id === patient.id ? 'rgba(255,255,255,0.2)' : '#f59e0b',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Droplets size={12} />
                    中心静脈
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 選択された患者の詳細情報 */}
        {selectedPatient && nutritionStatus && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {selectedPatient.name}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {nutritionStatus.rating} ({nutritionStatus.experience}年の経験)
                  </span>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {selectedPatient.age}歳, {selectedPatient.ward} - {selectedPatient.diagnosis}
                </div>
              </div>
            </div>

            {/* 統計情報 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <Clock size={20} color="#667eea" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                  {nutritionStatus.experience}年
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>経験</div>
              </div>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <Users size={20} color="#10b981" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                  {nutritionStatus.patientsCount.toLocaleString()}+
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>患者</div>
              </div>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <Award size={20} color="#f59e0b" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                  {nutritionStatus.reviewsCount.toLocaleString()}+
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>レビュー</div>
              </div>
            </div>

            {/* 健康指標 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Heart size={16} color="#ef4444" />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>心拍数</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {nutritionStatus.heartRate}/Bpm
                </div>
                <div style={{
                  height: '4px',
                  background: '#e2e8f0',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(nutritionStatus.heartRate / 2, 100)}%`,
                    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '2px'
                  }} />
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Activity size={16} color="#3b82f6" />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>血圧</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {nutritionStatus.bloodPressure}
                </div>
                <div style={{
                  height: '4px',
                  background: '#e2e8f0',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: '75%',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '2px'
                  }} />
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Droplets size={16} color="#10b981" />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>血糖値</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {nutritionStatus.bloodGlucose} mg/dL
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '2px',
                  marginTop: '8px'
                }}>
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: '4px',
                        background: i < 35 ? '#10b981' : '#e2e8f0',
                        borderRadius: '1px'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Zap size={16} color="#f59e0b" />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>心機能効率</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {nutritionStatus.heartEfficiency}%
                </div>
                <div style={{
                  height: '4px',
                  background: '#e2e8f0',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${nutritionStatus.heartEfficiency}%`,
                    background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '2px'
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 今後の予定 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              今後の予定
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChevronLeft size={20} color="#6b7280" />
              </button>
              <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '80px', textAlign: 'center' }}>
                January
              </span>
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChevronRight size={20} color="#6b7280" />
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {dates.map((date, index) => (
              <div
                key={index}
                style={{
                  minWidth: '60px',
                  textAlign: 'center',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  background: date.selected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc',
                  color: date.selected ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{date.day}</div>
                <div style={{ fontSize: '12px' }}>{date.dayName}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {timeSlots.map((time, index) => (
              <div
                key={index}
                onClick={() => setSelectedTime(time)}
                style={{
                  minWidth: '80px',
                  textAlign: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: selectedTime === time ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc',
                  color: selectedTime === time ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: selectedTime === time ? 'none' : '1px solid #e5e7eb'
                }}
              >
                {time}
              </div>
            ))}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                style={{
                  background: '#f8fafc',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '16px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {appointment.doctor.split(' ')[1]?.charAt(0) || 'D'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px', marginBottom: '4px' }}>
                      {appointment.doctor}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                      {appointment.specialty}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {appointment.rating} ({appointment.experience}年の経験)
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600', marginBottom: '4px' }}>
                      {appointment.time}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {appointment.date}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end'
                }}>
                  <button style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = '#3b82f6';
                  }}
                  >
                    <Phone size={12} />
                    電話
                  </button>
                  <button style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = '#10b981';
                  }}
                  >
                    <MessageCircle size={12} />
                    チャット
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;




