import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { PatientListPage } from './pages/PatientListPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { NutritionCalculatorPage } from './pages/NutritionCalculatorPage'
import { MenuBuilderPage } from './pages/MenuBuilderPage'
import { SavedMenusPage } from './pages/SavedMenusPage'

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  // If Supabase is configured, require auth
  if (isSupabaseConfigured && isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        読み込み中...
      </div>
    )
  }

  if (isSupabaseConfigured && !isAuthenticated) {
    return <AuthPage />
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
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
