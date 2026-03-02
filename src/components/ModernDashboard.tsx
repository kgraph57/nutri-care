import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Patient, NutritionType } from "../types";
import { samplePatients } from "../data/sampleData";

interface ModernDashboardProps {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  currentTime: Date;
  onShowPatientForm: (patient?: Patient) => void;
  onShowRealTimeMenuBuilder: (
    patient: Patient,
    nutritionType: NutritionType,
  ) => void;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({
  patients,
  setPatients,
  currentTime,
  onShowPatientForm,
  onShowRealTimeMenuBuilder,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState("heart");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // フィルタリングされた患者
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
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
    };
  };

  const nutritionStatus = selectedPatient
    ? getNutritionStatus(selectedPatient)
    : null;

  // 今後の予定
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. 田中 (循環器専門医)",
      time: "08:35 - 09:30",
      date: "21 August",
      type: "Cardiologist",
      patient: selectedPatient?.name || "患者A",
    },
    {
      id: 2,
      doctor: "Dr. 佐藤 (神経科医)",
      time: "10:00 - 11:00",
      date: "22 August",
      type: "Neurologist",
      patient: selectedPatient?.name || "患者B",
    },
    {
      id: 3,
      doctor: "Dr. 山田 (眼科医)",
      time: "14:00 - 15:00",
      date: "23 August",
      type: "Optician",
      patient: selectedPatient?.name || "患者C",
    },
    {
      id: 4,
      doctor: "Dr. 鈴木 (泌尿器科医)",
      time: "16:00 - 17:00",
      date: "27 August",
      type: "Urologist",
      patient: selectedPatient?.name || "患者D",
    },
  ];

  const bodyParts = [
    { id: "full", name: "Full Body", icon: "👤" },
    { id: "brain", name: "Brain", icon: "🧠" },
    { id: "heart", name: "Heart", icon: "❤️" },
    { id: "kidney", name: "Kidney", icon: "🫘" },
    { id: "eyes", name: "Eyes", icon: "👁️" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f2937",
              margin: 0,
            }}
          >
            NutriCare 栄養管理システム
          </h1>
          <nav style={{ display: "flex", gap: "24px" }}>
            {["Overview", "Patients", "Nutrition", "Reports", "Settings"].map(
              (item, index) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    color: index === 0 ? "#3b82f6" : "#6b7280",
                    textDecoration: "none",
                    fontWeight: index === 0 ? "600" : "500",
                    fontSize: "14px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: index === 0 ? "#eff6ff" : "transparent",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (index !== 0) {
                      (e.target as HTMLElement).style.background = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== 0) {
                      (e.target as HTMLElement).style.background =
                        "transparent";
                    }
                  }}
                >
                  {item}
                </a>
              ),
            )}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Search size={20} color="#6b7280" style={{ cursor: "pointer" }} />
          <Bell size={20} color="#6b7280" style={{ cursor: "pointer" }} />
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <User size={20} color="white" />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          padding: "24px",
        }}
      >
        {/* 左側パネル */}
        <div>
          {/* 患者選択 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1f2937",
                margin: "0 0 16px 0",
              }}
            >
              患者選択
            </h2>
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                placeholder="患者名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 44px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                  background: "#f9fafb",
                }}
              />
            </div>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "8px",
              }}
            >
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background:
                      selectedPatient?.id === patient.id
                        ? "#eff6ff"
                        : "transparent",
                    border:
                      selectedPatient?.id === patient.id
                        ? "2px solid #3b82f6"
                        : "2px solid transparent",
                    marginBottom: "4px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPatient?.id !== patient.id) {
                      (e.target as HTMLElement).style.background = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPatient?.id !== patient.id) {
                      (e.target as HTMLElement).style.background =
                        "transparent";
                    }
                  }}
                >
                  <div style={{ fontWeight: "600", color: "#1f2937" }}>
                    {patient.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {patient.age}歳, {patient.ward} - {patient.diagnosis}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* インタラクティブな人体モデル */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                margin: "0 0 16px 0",
              }}
            >
              {selectedPatient
                ? `${selectedPatient.name}さんの栄養状態`
                : "患者を選択してください"}
            </h3>

            {/* 心臓モデル */}
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                margin: "20px 0",
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3)",
                  animation: "pulse 2s infinite",
                }}
              >
                <Heart size={40} color="white" />
              </div>

              {/* 血糖値カード */}
              {nutritionStatus && (
                <div
                  style={{
                    position: "absolute",
                    right: "-20px",
                    top: "20px",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    padding: "12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    minWidth: "120px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    血糖値
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1f2937",
                    }}
                  >
                    {nutritionStatus.bloodGlucose} mg/dL
                  </div>
                </div>
              )}
            </div>

            {/* 身体部位選択 */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "20px",
              }}
            >
              {bodyParts.map((part) => (
                <button
                  key={part.id}
                  onClick={() => setSelectedBodyPart(part.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      selectedBodyPart === part.id ? "#3b82f6" : "#f3f4f6",
                    color: selectedBodyPart === part.id ? "white" : "#6b7280",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>{part.icon}</span>
                  {part.name}
                </button>
              ))}
            </div>
          </div>

          {/* 栄養メニュー作成ボタン */}
          {selectedPatient && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                  margin: "0 0 16px 0",
                }}
              >
                栄養メニュー作成
              </h3>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() =>
                    onShowRealTimeMenuBuilder(selectedPatient, "enteral")
                  }
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform =
                      "translateY(-2px)";
                    (e.target as HTMLElement).style.boxShadow =
                      "0 8px 25px rgba(16, 185, 129, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <Heart size={16} />
                  経腸栄養
                </button>
                <button
                  onClick={() =>
                    onShowRealTimeMenuBuilder(selectedPatient, "parenteral")
                  }
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform =
                      "translateY(-2px)";
                    (e.target as HTMLElement).style.boxShadow =
                      "0 8px 25px rgba(245, 158, 11, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <Droplets size={16} />
                  中心静脈
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右側パネル */}
        <div>
          {/* 健康指標 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                margin: "0 0 20px 0",
              }}
            >
              健康指標
            </h3>

            {nutritionStatus ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {/* 心拍数 */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <Heart size={16} color="#ef4444" />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      心拍数
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#1f2937",
                    }}
                  >
                    {nutritionStatus.heartRate}/Bpm
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "#e2e8f0",
                      borderRadius: "2px",
                      marginTop: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(nutritionStatus.heartRate / 2, 100)}%`,
                        background:
                          "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>

                {/* 血圧 */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <Activity size={16} color="#3b82f6" />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      血圧
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#1f2937",
                    }}
                  >
                    {nutritionStatus.bloodPressure}
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "#e2e8f0",
                      borderRadius: "2px",
                      marginTop: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "75%",
                        background:
                          "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>

                {/* 血糖値 */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <Droplets size={16} color="#10b981" />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      血糖値
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#1f2937",
                    }}
                  >
                    {nutritionStatus.bloodGlucose} mg/dL
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "2px",
                      marginTop: "8px",
                    }}
                  >
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: "4px",
                          background: i < 35 ? "#10b981" : "#e2e8f0",
                          borderRadius: "1px",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 心機能効率 */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <Zap size={16} color="#f59e0b" />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      心機能効率
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#1f2937",
                    }}
                  >
                    {nutritionStatus.heartEfficiency}% Moderate
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "#e2e8f0",
                      borderRadius: "2px",
                      marginTop: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${nutritionStatus.heartEfficiency}%`,
                        background:
                          "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                患者を選択して健康指標を表示
              </div>
            )}
          </div>

          {/* 今後の予定 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                今後の予定
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                  }}
                >
                  <ChevronLeft size={16} color="#6b7280" />
                </button>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    minWidth: "60px",
                    textAlign: "center",
                  }}
                >
                  21 Tue
                </span>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                  }}
                >
                  <ChevronRight size={16} color="#6b7280" />
                </button>
              </div>
            </div>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {appointment.doctor.split(" ")[1]?.charAt(0) || "D"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#1f2937",
                          fontSize: "14px",
                        }}
                      >
                        {appointment.doctor}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {appointment.type}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {appointment.time}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {appointment.date}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      style={{
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Phone size={12} />
                    </button>
                    <button
                      style={{
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MessageCircle size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default ModernDashboard;
