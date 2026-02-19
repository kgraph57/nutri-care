import { useState, useCallback, useEffect } from "react";
import type { NutritionType, NutritionRequirements } from "../types";
import { sampleMenus } from "../data/sampleMenus";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "./useAuth";

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

function toDbRow(
  menu: Omit<NutritionMenuData, "id" | "createdAt">,
  userId: string,
) {
  return {
    user_id: userId,
    patient_id: menu.patientId,
    patient_name: menu.patientName,
    nutrition_type: menu.nutritionType,
    menu_name: menu.menuName,
    items: menu.items.map((item) => ({
      id: item.id,
      product_name: item.productName,
      manufacturer: item.manufacturer,
      volume: item.volume,
      frequency: item.frequency,
    })),
    total_energy: menu.totalEnergy,
    total_volume: menu.totalVolume,
    requirements: menu.requirements as Record<string, number> | null,
    current_intake: menu.currentIntake,
    notes: menu.notes,
    activity_level: menu.activityLevel,
    stress_level: menu.stressLevel,
    medical_condition: menu.medicalCondition,
  };
}

function fromDbRow(row: Record<string, unknown>): NutritionMenuData {
  const items = (row.items as Array<Record<string, unknown>>) ?? [];
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    patientName: String(row.patient_name),
    nutritionType: String(row.nutrition_type) as NutritionType,
    menuName: String(row.menu_name),
    items: items.map((item) => ({
      id: String(item.id ?? ""),
      productName: String(item.product_name ?? ""),
      manufacturer: String(item.manufacturer ?? ""),
      volume: Number(item.volume ?? 0),
      frequency: Number(item.frequency ?? 0),
    })),
    totalEnergy: Number(row.total_energy ?? 0),
    totalVolume: Number(row.total_volume ?? 0),
    requirements: (row.requirements as NutritionRequirements) ?? null,
    currentIntake: (row.current_intake as Record<string, number>) ?? {},
    notes: String(row.notes ?? ""),
    activityLevel: String(row.activity_level ?? ""),
    stressLevel: String(row.stress_level ?? ""),
    medicalCondition: String(row.medical_condition ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export function useNutritionMenus() {
  const { user } = useAuth();
  const [menus, setMenus] = useState<NutritionMenuData[]>(
    isSupabaseConfigured ? [] : loadMenusFromStorage,
  );

  // Load from Supabase on mount
  useEffect(() => {
    if (!supabase || !user) return;

    const fetchMenus = async () => {
      const { data, error } = await supabase!
        .from("nutrition_menus")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setMenus(data.map(fromDbRow));
      }
    };

    fetchMenus();
  }, [user]);

  const saveMenu = useCallback(
    async (
      menu: Omit<NutritionMenuData, "id" | "createdAt">,
    ): Promise<void> => {
      if (supabase && user) {
        const { data, error } = await supabase
          .from("nutrition_menus")
          .insert(toDbRow(menu, user.id) as never)
          .select()
          .single();

        if (!error && data) {
          setMenus((prev) => [fromDbRow(data), ...prev]);
        }
      } else {
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
      }
    },
    [user],
  );

  const updateMenu = useCallback(
    async (
      id: string,
      updates: Omit<NutritionMenuData, "id" | "createdAt">,
    ): Promise<void> => {
      if (supabase && user) {
        const { error } = await supabase
          .from("nutrition_menus")
          .update(toDbRow(updates, user.id) as never)
          .eq("id", id);

        if (!error) {
          setMenus((prev) =>
            prev.map((m) =>
              m.id === id ? { ...updates, id, createdAt: m.createdAt } : m,
            ),
          );
        }
      } else {
        setMenus((prev) => {
          const next = prev.map((m) =>
            m.id === id ? { ...updates, id, createdAt: m.createdAt } : m,
          );
          saveMenusToStorage(next);
          return next;
        });
      }
    },
    [user],
  );

  const deleteMenu = useCallback(async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from("nutrition_menus").delete().eq("id", id);
    }
    setMenus((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (!isSupabaseConfigured) {
        saveMenusToStorage(next);
      }
      return next;
    });
  }, []);

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
