import { useState, useCallback } from "react";
import type { NutritionType, NutritionRequirements } from "../types";
import { sampleMenus } from "../data/sampleMenus";

export interface NutritionMenuData {
  id: string;
  patientId: string;
  patientName: string;
  nutritionType: NutritionType;
  menuName: string;
  items: Array<{
    id: string;
    productName: string;
    manufacturer: string;
    volume: number;
    frequency: number;
  }>;
  totalEnergy: number;
  totalVolume: number;
  requirements: NutritionRequirements | null;
  currentIntake: Record<string, number>;
  notes: string;
  activityLevel: string;
  stressLevel: string;
  medicalCondition: string;
  createdAt: string;
}

const STORAGE_KEY = "nutri-care-menus";

const loadMenusFromStorage = (): NutritionMenuData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed as NutritionMenuData[];
      }
    }
  } catch {
    // Storage read/parse failed; return empty
  }
  return [...sampleMenus];
};

const saveMenusToStorage = (menus: NutritionMenuData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
  } catch {
    // Storage write failed silently
  }
};

const generateId = (): string => {
  return `menu-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export function useNutritionMenus() {
  const [menus, setMenus] = useState<NutritionMenuData[]>(loadMenusFromStorage);

  const saveMenu = useCallback(
    (menu: Omit<NutritionMenuData, "id" | "createdAt">): void => {
      setMenus((prev) => {
        const newMenu: NutritionMenuData = {
          ...menu,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        const next = [...prev, newMenu];
        saveMenusToStorage(next);
        return next;
      });
    },
    [],
  );

  const deleteMenu = useCallback((id: string): void => {
    setMenus((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMenusToStorage(next);
      return next;
    });
  }, []);

  const updateMenu = useCallback(
    (
      id: string,
      updates: Omit<NutritionMenuData, "id" | "createdAt">,
    ): void => {
      setMenus((prev) => {
        const next = prev.map((m) =>
          m.id === id ? { ...updates, id, createdAt: m.createdAt } : m,
        );
        saveMenusToStorage(next);
        return next;
      });
    },
    [],
  );

  const getMenuById = useCallback(
    (id: string): NutritionMenuData | undefined => {
      return menus.find((m) => m.id === id);
    },
    [menus],
  );

  const getMenusForPatient = useCallback(
    (patientId: string): NutritionMenuData[] => {
      return menus.filter((m) => m.patientId === patientId);
    },
    [menus],
  );

  return {
    menus,
    saveMenu,
    updateMenu,
    deleteMenu,
    getMenuById,
    getMenusForPatient,
  } as const;
}
