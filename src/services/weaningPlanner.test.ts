import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateDefaultWeaningPlan,
  calculateWeaningProgress,
  advancePlanPhase,
} from "./weaningPlanner";
import type { Patient } from "../types";
import type { WeaningPlan, WeaningPhase, WeaningMilestone } from "../types/weaningPlan";

// ── Patient fixtures ──

function makePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: "P001",
    name: "Test Patient",
    age: 5,
    gender: "男性",
    ward: "PICU",
    admissionDate: "2026-01-01",
    dischargeDate: "",
    patientType: "PICU",
    weight: 18,
    height: 110,
    diagnosis: "術後管理",
    allergies: [],
    medications: [],
    notes: "",
    ...overrides,
  };
}

const pretermPatient = makePatient({
  id: "P_PRETERM",
  age: 0,
  ageInMonths: 0,
  gestationalAge: 30,
  weight: 1.2,
  height: 38,
});

const infantPatient = makePatient({
  id: "P_INFANT",
  age: 0,
  ageInMonths: 6,
  weight: 7,
  height: 65,
});

const childPatient = makePatient({
  id: "P_CHILD",
  age: 5,
  ageInMonths: 60,
  weight: 18,
  height: 110,
});

// ── Helpers ──

/** Freeze "today" so tests are deterministic. */
function freezeDate(isoDate: string): void {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${isoDate}T00:00:00Z`));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Build a WeaningPlan fixture for progress / advance tests. */
function makePlan(overrides: Partial<WeaningPlan> = {}): WeaningPlan {
  return {
    id: "WP_TEST",
    patientId: "P001",
    createdDate: "2026-01-01",
    targetCompletionDate: "2026-01-25",
    currentPhase: "trophic",
    phases: [],
    milestones: [
      makeMilestone({ id: "M1", phase: "trophic", targetDate: "2026-01-04" }),
      makeMilestone({
        id: "M2",
        phase: "advancing",
        targetDate: "2026-01-08",
      }),
      makeMilestone({
        id: "M3",
        phase: "full-enteral",
        targetDate: "2026-01-11",
      }),
      makeMilestone({
        id: "M4",
        phase: "oral-introduction",
        targetDate: "2026-01-16",
      }),
      makeMilestone({
        id: "M5",
        phase: "oral-transition",
        targetDate: "2026-01-23",
      }),
      makeMilestone({
        id: "M6",
        phase: "full-oral",
        targetDate: "2026-01-25",
      }),
    ],
    notes: "",
    isActive: true,
    ...overrides,
  };
}

function makeMilestone(
  overrides: Partial<WeaningMilestone> = {},
): WeaningMilestone {
  return {
    id: "M_TEST",
    phase: "trophic",
    description: "テスト達成",
    targetDate: "2026-01-05",
    criteria: ["基準1"],
    met: false,
    ...overrides,
  };
}

// ── Setup / Teardown ──

beforeEach(() => {
  freezeDate("2026-01-15");
});

afterEach(() => {
  vi.useRealTimers();
});

// ==========================================================================
// generateDefaultWeaningPlan
// ==========================================================================

describe("generateDefaultWeaningPlan", () => {
  // ── Basic structure ──

  describe("basic structure", () => {
    it("returns a plan with all 6 phases when starting from trophic", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      expect(plan.phases).toHaveLength(6);
      expect(plan.milestones).toHaveLength(6);
    });

    it("assigns the patient id", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      expect(plan.patientId).toBe("P_CHILD");
    });

    it("sets createdDate to today", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      expect(plan.createdDate).toBe("2026-01-15");
    });

    it("starts active with currentPhase matching the startPhase", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      expect(plan.isActive).toBe(true);
      expect(plan.currentPhase).toBe("trophic");
    });

    it("includes a non-empty id prefixed with WP_", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      expect(plan.id).toMatch(/^WP_/);
    });

    it("sets notes to empty string", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      expect(plan.notes).toBe("");
    });

    it("has all milestones initially unmet", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      for (const m of plan.milestones) {
        expect(m.met).toBe(false);
      }
    });

    it("milestone ids are prefixed with WM_", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      for (const m of plan.milestones) {
        expect(m.id).toMatch(/^WM_/);
      }
    });
  });

  // ── Phase ordering ──

  describe("phase ordering", () => {
    it("phases follow the canonical order", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const phaseNames = plan.phases.map((p) => p.phase);
      expect(phaseNames).toEqual([
        "trophic",
        "advancing",
        "full-enteral",
        "oral-introduction",
        "oral-transition",
        "full-oral",
      ]);
    });

    it("milestones match the phase order", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const milestonePhases = plan.milestones.map((m) => m.phase);
      const phaseNames = plan.phases.map((p) => p.phase);
      expect(milestonePhases).toEqual(phaseNames);
    });
  });

  // ── Custom startPhase ──

  describe("custom startPhase", () => {
    it("starts from advancing when specified", () => {
      const plan = generateDefaultWeaningPlan(childPatient, "advancing");
      expect(plan.currentPhase).toBe("advancing");
      expect(plan.phases[0].phase).toBe("advancing");
      expect(plan.phases).toHaveLength(5);
      expect(plan.milestones).toHaveLength(5);
    });

    it("starts from full-enteral when specified", () => {
      const plan = generateDefaultWeaningPlan(childPatient, "full-enteral");
      expect(plan.currentPhase).toBe("full-enteral");
      expect(plan.phases).toHaveLength(4);
    });

    it("starts from full-oral (single phase) when specified", () => {
      const plan = generateDefaultWeaningPlan(childPatient, "full-oral");
      expect(plan.phases).toHaveLength(1);
      expect(plan.phases[0].phase).toBe("full-oral");
    });

    it("falls back to all phases for an unknown startPhase", () => {
      // "assessment" is a valid WeaningPhase type but not in PLAN_PHASES
      const plan = generateDefaultWeaningPlan(
        childPatient,
        "assessment" as WeaningPhase,
      );
      expect(plan.phases).toHaveLength(6);
    });
  });

  // ── Duration by age category ──

  describe("duration adjustment by age category", () => {
    it("preterm: trophic=5, advancing=7 (longer durations)", () => {
      const plan = generateDefaultWeaningPlan(pretermPatient);
      const trophic = plan.phases.find((p) => p.phase === "trophic");
      const advancing = plan.phases.find((p) => p.phase === "advancing");
      expect(trophic?.durationDays).toBe(5);
      expect(advancing?.durationDays).toBe(7);
    });

    it("infant: oral-introduction=7 (age-specific duration)", () => {
      const plan = generateDefaultWeaningPlan(infantPatient);
      const oralIntro = plan.phases.find(
        (p) => p.phase === "oral-introduction",
      );
      expect(oralIntro?.durationDays).toBe(7);
    });

    it("child: trophic uses default=3, advancing uses default=4", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const trophic = plan.phases.find((p) => p.phase === "trophic");
      const advancing = plan.phases.find((p) => p.phase === "advancing");
      expect(trophic?.durationDays).toBe(3);
      expect(advancing?.durationDays).toBe(4);
    });

    it("child: oral-introduction uses default=5 (no child-specific override)", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const oralIntro = plan.phases.find(
        (p) => p.phase === "oral-introduction",
      );
      expect(oralIntro?.durationDays).toBe(5);
    });

    it("full-enteral uses fixed duration=3 regardless of age", () => {
      const pretermPlan = generateDefaultWeaningPlan(pretermPatient);
      const infantPlan = generateDefaultWeaningPlan(infantPatient);
      const childPlan = generateDefaultWeaningPlan(childPatient);
      expect(
        pretermPlan.phases.find((p) => p.phase === "full-enteral")
          ?.durationDays,
      ).toBe(3);
      expect(
        infantPlan.phases.find((p) => p.phase === "full-enteral")?.durationDays,
      ).toBe(3);
      expect(
        childPlan.phases.find((p) => p.phase === "full-enteral")?.durationDays,
      ).toBe(3);
    });

    it("oral-transition uses fixed duration=7 regardless of age", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const phase = plan.phases.find((p) => p.phase === "oral-transition");
      expect(phase?.durationDays).toBe(7);
    });

    it("full-oral uses fixed duration=3 regardless of age", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const phase = plan.phases.find((p) => p.phase === "full-oral");
      expect(phase?.durationDays).toBe(3);
    });
  });

  // ── Total duration and targetCompletionDate ──

  describe("target completion date", () => {
    it("preterm total = 5+7+3+5+7+3 = 30 days", () => {
      const plan = generateDefaultWeaningPlan(pretermPatient);
      const totalDays = plan.phases.reduce(
        (sum, p) => sum + p.durationDays,
        0,
      );
      expect(totalDays).toBe(30);
      expect(plan.targetCompletionDate).toBe(addDays("2026-01-15", 30));
    });

    it("infant total = 3+4+3+7+7+3 = 27 days", () => {
      const plan = generateDefaultWeaningPlan(infantPatient);
      const totalDays = plan.phases.reduce(
        (sum, p) => sum + p.durationDays,
        0,
      );
      expect(totalDays).toBe(27);
      expect(plan.targetCompletionDate).toBe(addDays("2026-01-15", 27));
    });

    it("child total = 3+4+3+5+7+3 = 25 days", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const totalDays = plan.phases.reduce(
        (sum, p) => sum + p.durationDays,
        0,
      );
      expect(totalDays).toBe(25);
      expect(plan.targetCompletionDate).toBe(addDays("2026-01-15", 25));
    });

    it("completion date = createdDate + total duration days", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const totalDays = plan.phases.reduce(
        (sum, p) => sum + p.durationDays,
        0,
      );
      expect(plan.targetCompletionDate).toBe(
        addDays(plan.createdDate, totalDays),
      );
    });
  });

  // ── Milestone target dates ──

  describe("milestone target dates", () => {
    it("milestone dates are cumulative from createdDate", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      let cumulative = 0;
      for (let i = 0; i < plan.phases.length; i++) {
        cumulative += plan.phases[i].durationDays;
        expect(plan.milestones[i].targetDate).toBe(
          addDays("2026-01-15", cumulative),
        );
      }
    });

    it("last milestone targetDate equals targetCompletionDate", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const lastMilestone = plan.milestones[plan.milestones.length - 1];
      expect(lastMilestone.targetDate).toBe(plan.targetCompletionDate);
    });
  });

  // ── Phase config details ──

  describe("phase config percentages and criteria", () => {
    it("trophic: 20% enteral, 0% oral, 80% parenteral", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const trophic = plan.phases.find((p) => p.phase === "trophic");
      expect(trophic?.enteralPercent).toBe(20);
      expect(trophic?.oralPercent).toBe(0);
      expect(trophic?.parenteralPercent).toBe(80);
    });

    it("full-enteral: 100% enteral, 0% parenteral", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const fe = plan.phases.find((p) => p.phase === "full-enteral");
      expect(fe?.enteralPercent).toBe(100);
      expect(fe?.parenteralPercent).toBe(0);
      expect(fe?.oralPercent).toBe(0);
    });

    it("full-oral: 100% oral", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      const fo = plan.phases.find((p) => p.phase === "full-oral");
      expect(fo?.oralPercent).toBe(100);
      expect(fo?.enteralPercent).toBe(0);
      expect(fo?.parenteralPercent).toBe(0);
    });

    it("each phase has advanceCriteria and holdCriteria", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      for (const phase of plan.phases) {
        expect(phase.advanceCriteria.length).toBeGreaterThan(0);
        expect(phase.holdCriteria.length).toBeGreaterThan(0);
      }
    });

    it("each phase has a non-empty Japanese label", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      for (const phase of plan.phases) {
        expect(phase.label.length).toBeGreaterThan(0);
      }
    });

    it("milestone descriptions contain the phase label", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      for (let i = 0; i < plan.phases.length; i++) {
        expect(plan.milestones[i].description).toContain(plan.phases[i].label);
      }
    });

    it("milestone criteria match the phase advanceCriteria", () => {
      const plan = generateDefaultWeaningPlan(childPatient);
      for (let i = 0; i < plan.phases.length; i++) {
        expect(plan.milestones[i].criteria).toEqual(
          plan.phases[i].advanceCriteria,
        );
      }
    });
  });

  // ── Immutability ──

  describe("immutability", () => {
    it("does not mutate the patient object", () => {
      const patient = makePatient({ id: "IMMUT" });
      const copy = { ...patient };
      generateDefaultWeaningPlan(patient);
      expect(patient).toEqual(copy);
    });
  });
});

// ==========================================================================
// calculateWeaningProgress
// ==========================================================================

describe("calculateWeaningProgress", () => {
  // ── completedPhases ──

  describe("completedPhases count", () => {
    it("returns 0 when no milestones are met", () => {
      const plan = makePlan();
      const progress = calculateWeaningProgress(plan);
      expect(progress.completedPhases).toBe(0);
    });

    it("returns correct count when some milestones are met", () => {
      const plan = makePlan({
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: true }),
          makeMilestone({ id: "M2", phase: "advancing", met: true }),
          makeMilestone({ id: "M3", phase: "full-enteral", met: false }),
        ],
      });
      const progress = calculateWeaningProgress(plan);
      expect(progress.completedPhases).toBe(2);
    });

    it("returns totalPhases when all milestones are met", () => {
      const plan = makePlan({
        milestones: [
          makeMilestone({ id: "M1", met: true }),
          makeMilestone({ id: "M2", met: true }),
          makeMilestone({ id: "M3", met: true }),
        ],
      });
      const progress = calculateWeaningProgress(plan);
      expect(progress.completedPhases).toBe(3);
      expect(progress.totalPhases).toBe(3);
    });
  });

  // ── totalPhases ──

  describe("totalPhases", () => {
    it("equals the number of milestones in the plan", () => {
      const plan = makePlan();
      const progress = calculateWeaningProgress(plan);
      expect(progress.totalPhases).toBe(plan.milestones.length);
    });
  });

  // ── daysElapsed ──

  describe("daysElapsed", () => {
    it("counts days from createdDate to today", () => {
      // today is frozen to 2026-01-15, createdDate is 2026-01-01
      const plan = makePlan({ createdDate: "2026-01-01" });
      const progress = calculateWeaningProgress(plan);
      expect(progress.daysElapsed).toBe(14);
    });

    it("returns 0 when plan was created today", () => {
      const plan = makePlan({ createdDate: "2026-01-15" });
      const progress = calculateWeaningProgress(plan);
      expect(progress.daysElapsed).toBe(0);
    });

    it("returns 0 (not negative) when createdDate is in the future", () => {
      const plan = makePlan({ createdDate: "2026-02-01" });
      const progress = calculateWeaningProgress(plan);
      expect(progress.daysElapsed).toBe(0);
    });
  });

  // ── daysRemaining ──

  describe("daysRemaining", () => {
    it("counts days from today to targetCompletionDate", () => {
      // today=2026-01-15, target=2026-01-25 -> 10 days
      const plan = makePlan({ targetCompletionDate: "2026-01-25" });
      const progress = calculateWeaningProgress(plan);
      expect(progress.daysRemaining).toBe(10);
    });

    it("returns 0 when target date has passed", () => {
      const plan = makePlan({ targetCompletionDate: "2026-01-10" });
      const progress = calculateWeaningProgress(plan);
      expect(progress.daysRemaining).toBe(0);
    });

    it("returns 0 when target date is today", () => {
      const plan = makePlan({ targetCompletionDate: "2026-01-15" });
      const progress = calculateWeaningProgress(plan);
      expect(progress.daysRemaining).toBe(0);
    });
  });

  // ── onTrack ──

  describe("onTrack calculation", () => {
    it("is true when completedPhases >= expectedPhases", () => {
      // 6 milestones, createdDate=2026-01-01, target=2026-01-25
      // totalDuration=24, daysElapsed=14
      // expectedPhases = floor((14/24)*6) = floor(3.5) = 3
      const plan = makePlan({
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: true }),
          makeMilestone({ id: "M2", phase: "advancing", met: true }),
          makeMilestone({ id: "M3", phase: "full-enteral", met: true }),
          makeMilestone({ id: "M4", phase: "oral-introduction", met: false }),
          makeMilestone({ id: "M5", phase: "oral-transition", met: false }),
          makeMilestone({ id: "M6", phase: "full-oral", met: false }),
        ],
      });
      const progress = calculateWeaningProgress(plan);
      expect(progress.onTrack).toBe(true);
    });

    it("is false when completedPhases < expectedPhases", () => {
      // same timeline: expected=3, but only 1 completed
      const plan = makePlan({
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: true }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
          makeMilestone({ id: "M3", phase: "full-enteral", met: false }),
          makeMilestone({ id: "M4", phase: "oral-introduction", met: false }),
          makeMilestone({ id: "M5", phase: "oral-transition", met: false }),
          makeMilestone({ id: "M6", phase: "full-oral", met: false }),
        ],
      });
      const progress = calculateWeaningProgress(plan);
      expect(progress.onTrack).toBe(false);
    });

    it("is true on day zero (no phases expected yet)", () => {
      const plan = makePlan({
        createdDate: "2026-01-15",
        targetCompletionDate: "2026-02-15",
      });
      const progress = calculateWeaningProgress(plan);
      // daysElapsed=0, expectedPhases=0, completedPhases=0 -> onTrack
      expect(progress.onTrack).toBe(true);
    });

    it("is true when all milestones completed ahead of schedule", () => {
      const plan = makePlan({
        milestones: [
          makeMilestone({ id: "M1", met: true }),
          makeMilestone({ id: "M2", met: true }),
          makeMilestone({ id: "M3", met: true }),
        ],
        createdDate: "2026-01-14",
        targetCompletionDate: "2026-01-25",
      });
      const progress = calculateWeaningProgress(plan);
      expect(progress.onTrack).toBe(true);
    });

    it("handles totalDuration of 0 (expectedPhases defaults to 0)", () => {
      const plan = makePlan({
        createdDate: "2026-01-15",
        targetCompletionDate: "2026-01-15",
      });
      const progress = calculateWeaningProgress(plan);
      // totalDuration=0, expectedPhases=0, completedPhases=0 -> onTrack
      expect(progress.onTrack).toBe(true);
    });
  });

  // ── nextMilestone ──

  describe("nextMilestone", () => {
    it("returns the first unmet milestone", () => {
      const plan = makePlan({
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: true }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
          makeMilestone({ id: "M3", phase: "full-enteral", met: false }),
        ],
      });
      const progress = calculateWeaningProgress(plan);
      expect(progress.nextMilestone).not.toBeNull();
      expect(progress.nextMilestone?.id).toBe("M2");
      expect(progress.nextMilestone?.phase).toBe("advancing");
    });

    it("returns null when all milestones are met", () => {
      const plan = makePlan({
        milestones: [
          makeMilestone({ id: "M1", met: true }),
          makeMilestone({ id: "M2", met: true }),
        ],
      });
      const progress = calculateWeaningProgress(plan);
      expect(progress.nextMilestone).toBeNull();
    });

    it("returns the first milestone when none are met", () => {
      const plan = makePlan({
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: false }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
        ],
      });
      const progress = calculateWeaningProgress(plan);
      expect(progress.nextMilestone?.id).toBe("M1");
    });
  });

  // ── plan reference ──

  describe("plan reference", () => {
    it("includes the original plan in the result", () => {
      const plan = makePlan();
      const progress = calculateWeaningProgress(plan);
      expect(progress.plan).toBe(plan);
    });
  });

  // ── Immutability ──

  describe("immutability", () => {
    it("does not mutate the input plan", () => {
      const plan = makePlan();
      const copy = JSON.parse(JSON.stringify(plan));
      calculateWeaningProgress(plan);
      expect(plan).toEqual(copy);
    });
  });
});

// ==========================================================================
// advancePlanPhase
// ==========================================================================

describe("advancePlanPhase", () => {
  // ── Milestone marking ──

  describe("marks current milestone as met", () => {
    it("sets met=true on the milestone matching currentPhase", () => {
      const plan = makePlan({
        currentPhase: "trophic",
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: false }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
        ],
      });
      const result = advancePlanPhase(plan);
      const trophicMilestone = result.milestones.find(
        (m) => m.phase === "trophic",
      );
      expect(trophicMilestone?.met).toBe(true);
    });

    it("adds completedDate to the met milestone", () => {
      const plan = makePlan({
        currentPhase: "trophic",
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: false }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
        ],
      });
      const result = advancePlanPhase(plan);
      const trophicMilestone = result.milestones.find(
        (m) => m.phase === "trophic",
      );
      expect(trophicMilestone?.completedDate).toBe("2026-01-15");
    });

    it("does not modify already-met milestones", () => {
      const plan = makePlan({
        currentPhase: "advancing",
        milestones: [
          makeMilestone({
            id: "M1",
            phase: "trophic",
            met: true,
            completedDate: "2026-01-05",
          }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
          makeMilestone({ id: "M3", phase: "full-enteral", met: false }),
        ],
      });
      const result = advancePlanPhase(plan);
      const trophicMilestone = result.milestones.find(
        (m) => m.phase === "trophic",
      );
      expect(trophicMilestone?.met).toBe(true);
      expect(trophicMilestone?.completedDate).toBe("2026-01-05");
    });

    it("does not modify milestones of later phases", () => {
      const plan = makePlan({
        currentPhase: "trophic",
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: false }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
          makeMilestone({ id: "M3", phase: "full-enteral", met: false }),
        ],
      });
      const result = advancePlanPhase(plan);
      expect(result.milestones[1].met).toBe(false);
      expect(result.milestones[2].met).toBe(false);
    });
  });

  // ── Phase advancement ──

  describe("advances currentPhase", () => {
    it("advances trophic to advancing", () => {
      const plan = makePlan({ currentPhase: "trophic" });
      const result = advancePlanPhase(plan);
      expect(result.currentPhase).toBe("advancing");
    });

    it("advances advancing to full-enteral", () => {
      const plan = makePlan({ currentPhase: "advancing" });
      const result = advancePlanPhase(plan);
      expect(result.currentPhase).toBe("full-enteral");
    });

    it("advances full-enteral to oral-introduction", () => {
      const plan = makePlan({ currentPhase: "full-enteral" });
      const result = advancePlanPhase(plan);
      expect(result.currentPhase).toBe("oral-introduction");
    });

    it("advances oral-introduction to oral-transition", () => {
      const plan = makePlan({ currentPhase: "oral-introduction" });
      const result = advancePlanPhase(plan);
      expect(result.currentPhase).toBe("oral-transition");
    });

    it("advances oral-transition to full-oral", () => {
      const plan = makePlan({ currentPhase: "oral-transition" });
      const result = advancePlanPhase(plan);
      expect(result.currentPhase).toBe("full-oral");
    });
  });

  // ── Last phase handling ──

  describe("handles last phase (full-oral)", () => {
    it("advances full-oral to completed", () => {
      const plan = makePlan({
        currentPhase: "full-oral",
        milestones: [
          makeMilestone({ id: "M1", phase: "full-oral", met: false }),
        ],
      });
      const result = advancePlanPhase(plan);
      expect(result.currentPhase).toBe("completed");
    });

    it("sets isActive to false when reaching completed", () => {
      const plan = makePlan({
        currentPhase: "full-oral",
        milestones: [
          makeMilestone({ id: "M1", phase: "full-oral", met: false }),
        ],
      });
      const result = advancePlanPhase(plan);
      expect(result.isActive).toBe(false);
    });

    it("keeps isActive true for non-final advancement", () => {
      const plan = makePlan({
        currentPhase: "trophic",
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: false }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
        ],
      });
      const result = advancePlanPhase(plan);
      expect(result.isActive).toBe(true);
    });
  });

  // ── Sequential advancement ──

  describe("sequential advancement through all phases", () => {
    it("advances through all 6 phases to completed", () => {
      const phases: WeaningPhase[] = [
        "trophic",
        "advancing",
        "full-enteral",
        "oral-introduction",
        "oral-transition",
        "full-oral",
      ];

      let plan = makePlan({
        currentPhase: "trophic",
        milestones: phases.map((phase, i) =>
          makeMilestone({ id: `M${i}`, phase, met: false }),
        ),
      });

      for (const phase of phases) {
        expect(plan.currentPhase).toBe(phase);
        expect(plan.isActive).toBe(true);
        plan = advancePlanPhase(plan);
      }

      expect(plan.currentPhase).toBe("completed");
      expect(plan.isActive).toBe(false);
      // All milestones should be met
      for (const m of plan.milestones) {
        expect(m.met).toBe(true);
      }
    });
  });

  // ── Immutability ──

  describe("immutability", () => {
    it("returns a new plan object (does not mutate input)", () => {
      const plan = makePlan({
        currentPhase: "trophic",
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: false }),
        ],
      });
      const originalPhase = plan.currentPhase;
      const originalMet = plan.milestones[0].met;

      const result = advancePlanPhase(plan);

      // Original unchanged
      expect(plan.currentPhase).toBe(originalPhase);
      expect(plan.milestones[0].met).toBe(originalMet);

      // Result is different
      expect(result).not.toBe(plan);
      expect(result.currentPhase).not.toBe(originalPhase);
    });

    it("does not mutate the milestones array", () => {
      const plan = makePlan({
        currentPhase: "trophic",
        milestones: [
          makeMilestone({ id: "M1", phase: "trophic", met: false }),
          makeMilestone({ id: "M2", phase: "advancing", met: false }),
        ],
      });
      const originalMilestones = plan.milestones;
      const result = advancePlanPhase(plan);
      expect(result.milestones).not.toBe(originalMilestones);
    });
  });
});

// ==========================================================================
// Integration: generate -> progress -> advance cycle
// ==========================================================================

describe("integration: generate -> progress -> advance", () => {
  it("newly generated plan shows 0 progress and is onTrack", () => {
    freezeDate("2026-02-01");
    const plan = generateDefaultWeaningPlan(childPatient);
    const progress = calculateWeaningProgress(plan);

    expect(progress.completedPhases).toBe(0);
    expect(progress.daysElapsed).toBe(0);
    expect(progress.onTrack).toBe(true);
    expect(progress.nextMilestone?.phase).toBe("trophic");
  });

  it("after advancing first phase, progress reflects 1 completed", () => {
    freezeDate("2026-02-01");
    const plan = generateDefaultWeaningPlan(childPatient);
    const advanced = advancePlanPhase(plan);
    const progress = calculateWeaningProgress(advanced);

    expect(progress.completedPhases).toBe(1);
    expect(progress.nextMilestone?.phase).toBe("advancing");
    expect(advanced.currentPhase).toBe("advancing");
  });

  it("fully advanced plan shows all phases completed", () => {
    freezeDate("2026-02-01");
    let plan = generateDefaultWeaningPlan(childPatient);

    // Advance through all phases
    const phaseCount = plan.phases.length;
    for (let i = 0; i < phaseCount; i++) {
      plan = advancePlanPhase(plan);
    }

    expect(plan.currentPhase).toBe("completed");
    expect(plan.isActive).toBe(false);

    const progress = calculateWeaningProgress(plan);
    expect(progress.completedPhases).toBe(phaseCount);
    expect(progress.nextMilestone).toBeNull();
  });
});
