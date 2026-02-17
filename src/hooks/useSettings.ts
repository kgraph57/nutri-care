import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "nutri-care-settings";

export interface AppSettings {
  readonly defaultNutritionType: "enteral" | "parenteral";
  readonly defaultActivityLevel: string;
  readonly defaultStressLevel: string;
  readonly autoSaveEnabled: boolean;
  readonly showAdvancedNutrients: boolean;
  readonly language: "ja" | "en";
  readonly aiModel: "haiku" | "sonnet";
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultNutritionType: "enteral",
  defaultActivityLevel: "bedrest",
  defaultStressLevel: "moderate",
  autoSaveEnabled: true,
  showAdvancedNutrients: true,
  language: "ja",
  aiModel: "haiku",
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings } as const;
}
