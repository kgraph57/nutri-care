import { useState, useCallback, useEffect } from "react";
import type { WeaningPlan, WeaningPhase } from "../types/weaningPlan";
import { sampleWeaningPlanMap } from "../data/sampleWeaningPlans";

const WEANING_PLANS_KEY = "nutri-care-weaning-plans";

/**
 * Merge stored data with sample data.
 * If a patient already has user-entered data, preserve it.
 * If a patient has no data, seed with sample entries.
 */
function mergeWithSampleData(
  stored: Record<string, WeaningPlan[]>,
): Record<string, WeaningPlan[]> {
  const merged = { ...stored };
  for (const [patientId, samplePlans] of Object.entries(sampleWeaningPlanMap)) {
    if (!merged[patientId] || merged[patientId].length === 0) {
      merged[patientId] = samplePlans;
    }
  }
  return merged;
}

function loadFromStorage(): Record<string, WeaningPlan[]> {
  try {
    const stored = localStorage.getItem(WEANING_PLANS_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === "object" && parsed !== null) {
        return mergeWithSampleData(parsed as Record<string, WeaningPlan[]>);
      }
    }
  } catch {
    // ignore
  }
  // Seed from sample data when localStorage is empty
  return { ...sampleWeaningPlanMap };
}

function saveToStorage(data: Record<string, WeaningPlan[]>): void {
  try {
    localStorage.setItem(WEANING_PLANS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function sortByCreatedDateDesc(plans: readonly WeaningPlan[]): WeaningPlan[] {
  return [...plans].sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
  );
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function useWeaningPlan() {
  const [planMap, setPlanMap] =
    useState<Record<string, WeaningPlan[]>>(loadFromStorage);

  useEffect(() => {
    saveToStorage(planMap);
  }, [planMap]);

  /** Get the currently active weaning plan for a patient. */
  const getActivePlan = useCallback(
    (patientId: string): WeaningPlan | undefined => {
      const plans = planMap[patientId];
      if (!plans || plans.length === 0) return undefined;
      return plans.find((p) => p.isActive);
    },
    [planMap],
  );

  /** Get full plan history for a patient, sorted by createdDate desc. */
  const getPlanHistory = useCallback(
    (patientId: string): readonly WeaningPlan[] => {
      const plans = planMap[patientId];
      if (!plans || plans.length === 0) return [];
      return sortByCreatedDateDesc(plans);
    },
    [planMap],
  );

  /** Save (upsert) a plan. Deactivates any other active plan for the same patient. */
  const savePlan = useCallback((patientId: string, plan: WeaningPlan): void => {
    setPlanMap((prev) => {
      const existing = prev[patientId] ?? [];
      const withoutTarget = existing.filter((p) => p.id !== plan.id);
      const deactivated = plan.isActive
        ? withoutTarget.map((p) => (p.isActive ? { ...p, isActive: false } : p))
        : withoutTarget;
      return {
        ...prev,
        [patientId]: [...deactivated, { ...plan, patientId }],
      };
    });
  }, []);

  /** Update the currentPhase of the active plan for a patient. */
  const updatePlanPhase = useCallback(
    (patientId: string, newPhase: WeaningPhase): void => {
      setPlanMap((prev) => {
        const existing = prev[patientId] ?? [];
        return {
          ...prev,
          [patientId]: existing.map((p) =>
            p.isActive ? { ...p, currentPhase: newPhase } : p,
          ),
        };
      });
    },
    [],
  );

  /** Mark a milestone as completed (met=true, completedDate=today) on the active plan. */
  const completeMilestone = useCallback(
    (patientId: string, milestoneId: string): void => {
      setPlanMap((prev) => {
        const existing = prev[patientId] ?? [];
        return {
          ...prev,
          [patientId]: existing.map((p) =>
            p.isActive
              ? {
                  ...p,
                  milestones: p.milestones.map((m) =>
                    m.id === milestoneId
                      ? { ...m, met: true, completedDate: todayISO() }
                      : m,
                  ),
                }
              : p,
          ),
        };
      });
    },
    [],
  );

  /** Deactivate the active plan for a patient. */
  const deactivatePlan = useCallback((patientId: string): void => {
    setPlanMap((prev) => {
      const existing = prev[patientId] ?? [];
      return {
        ...prev,
        [patientId]: existing.map((p) =>
          p.isActive ? { ...p, isActive: false } : p,
        ),
      };
    });
  }, []);

  return {
    getActivePlan,
    getPlanHistory,
    savePlan,
    updatePlanPhase,
    completeMilestone,
    deactivatePlan,
  } as const;
}
