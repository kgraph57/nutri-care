import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { ErrorBoundary } from "./components/ui";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { isSupabaseConfigured } from "./lib/supabase";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientListPage } from "./pages/PatientListPage";
import { PatientDetailPage } from "./pages/PatientDetailPage";
import { NutritionCalculatorPage } from "./pages/NutritionCalculatorPage";
import { MenuBuilderPage } from "./pages/MenuBuilderPage";
import { SavedMenusPage } from "./pages/SavedMenusPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ComparisonPage } from "./pages/ComparisonPage";
import { SimulationPage } from "./pages/SimulationPage";
import { GrowthMonitoringPage } from "./pages/GrowthMonitoringPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isSupabaseConfigured && isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (isSupabaseConfigured && !isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientListPage />} />
        <Route path="patients/:patientId" element={<PatientDetailPage />} />
        <Route path="calculator" element={<NutritionCalculatorPage />} />
        <Route path="menu-builder" element={<MenuBuilderPage />} />
        <Route path="menu-builder/:patientId" element={<MenuBuilderPage />} />
        <Route path="menus" element={<SavedMenusPage />} />
        <Route path="compare" element={<ComparisonPage />} />
        <Route path="simulation" element={<SimulationPage />} />
        <Route path="growth" element={<GrowthMonitoringPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
