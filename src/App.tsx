import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientListPage } from "./pages/PatientListPage";
import { PatientDetailPage } from "./pages/PatientDetailPage";
import { NutritionCalculatorPage } from "./pages/NutritionCalculatorPage";
import { MenuBuilderPage } from "./pages/MenuBuilderPage";
import { SavedMenusPage } from "./pages/SavedMenusPage";

function App() {
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
  );
}

export default App;
