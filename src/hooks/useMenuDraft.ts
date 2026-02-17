import { useState, useCallback, useEffect, useRef } from "react";

const DRAFT_KEY = "nutri-care-menu-draft";
const AUTO_SAVE_INTERVAL = 30_000; // 30 seconds

export interface MenuDraft {
  readonly patientId: string;
  readonly nutritionType: string;
  readonly menuName: string;
  readonly notes: string;
  readonly activityLevel: string;
  readonly stressLevel: string;
  readonly medicalCondition: string;
  readonly items: readonly {
    readonly id: string;
    readonly productName: string;
    readonly volume: number;
    readonly frequency: number;
  }[];
  readonly savedAt: string;
}

function loadDraft(): MenuDraft | null {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (stored) {
      return JSON.parse(stored) as MenuDraft;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveDraft(draft: MenuDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

function clearDraftStorage(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function useMenuDraft() {
  const [draft, setDraft] = useState<MenuDraft | null>(loadDraft);
  const [hasDraft, setHasDraft] = useState(draft !== null);
  const lastSaveRef = useRef<string>("");

  useEffect(() => {
    setHasDraft(draft !== null);
  }, [draft]);

  const save = useCallback((data: Omit<MenuDraft, "savedAt">) => {
    const draftData: MenuDraft = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    const key = JSON.stringify(data);
    // Skip if identical to last save
    if (key === lastSaveRef.current) return;
    lastSaveRef.current = key;
    saveDraft(draftData);
    setDraft(draftData);
  }, []);

  const restore = useCallback((): MenuDraft | null => {
    return draft;
  }, [draft]);

  const clear = useCallback(() => {
    clearDraftStorage();
    setDraft(null);
    lastSaveRef.current = "";
  }, []);

  return {
    hasDraft,
    draft,
    saveDraft: save,
    restoreDraft: restore,
    clearDraft: clear,
    AUTO_SAVE_INTERVAL,
  } as const;
}
