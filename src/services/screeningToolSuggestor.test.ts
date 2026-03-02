import { describe, it, expect } from "vitest";
import type { Patient } from "../types";
import type { ScreeningEntry, Nrs2002Result, MnaSfResult } from "../types/screening";
import {
  suggestScreeningTool,
  isScreeningDue,
  getScreeningStatusLabel,
} from "./screeningToolSuggestor";

function makePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: "p-1",
    name: "テスト太郎",
    age: 50,
    gender: "男性",
    ward: "3A",
    admissionDate: "2025-01-01",
    dischargeDate: "",
    patientType: "一般病棟",
    weight: 70,
    height: 170,
    diagnosis: "",
    allergies: [],
    medications: [],
    notes: "",
    ...overrides,
  };
}

function makeScreeningEntry(
  overrides: Partial<ScreeningEntry> = {},
): ScreeningEntry {
  const noRiskResult: Nrs2002Result = {
    toolType: "nrs2002",
    initialScreening: {
      bmiBelow205: false,
      weightLoss3Months: false,
      reducedIntakeLastWeek: false,
      severelyCritical: false,
    },
    initialPositive: false,
    finalScreening: null,
    totalScore: 0,
    riskLevel: "no-risk",
    recommendations: ["1週間後に再スクリーニング"],
  };

  return {
    id: "s-1",
    patientId: "p-1",
    date: "2025-01-15",
    time: "10:00",
    result: noRiskResult,
    notes: "",
    createdAt: "2025-01-15T10:00:00Z",
    ...overrides,
  };
}

// ── suggestScreeningTool ──

describe("suggestScreeningTool", () => {
  it("recommends NRS-2002 for adults under 65", () => {
    const patient = makePatient({ age: 40 });
    const result = suggestScreeningTool(patient, []);
    expect(result.recommended).toBe("nrs2002");
    expect(result.alternatives).toContain("mna-sf");
  });

  it("recommends MNA-SF for patients 65 or older", () => {
    const patient = makePatient({ age: 65 });
    const result = suggestScreeningTool(patient, []);
    expect(result.recommended).toBe("mna-sf");
    expect(result.alternatives).toContain("nrs2002");
  });

  it("recommends MNA-SF for patients over 65", () => {
    const patient = makePatient({ age: 80 });
    const result = suggestScreeningTool(patient, []);
    expect(result.recommended).toBe("mna-sf");
  });

  it("recommends GLIM when previous screening shows NRS-2002 at-risk", () => {
    const patient = makePatient({ age: 50 });
    const atRiskResult: Nrs2002Result = {
      toolType: "nrs2002",
      initialScreening: {
        bmiBelow205: true,
        weightLoss3Months: false,
        reducedIntakeLastWeek: false,
        severelyCritical: false,
      },
      initialPositive: true,
      finalScreening: {
        nutritionalStatus: 2,
        nutritionalStatusDetail: "",
        diseaseSeverity: 1,
        diseaseSeverityDetail: "",
        ageAdjustment: false,
      },
      totalScore: 3,
      riskLevel: "at-risk",
      recommendations: [],
    };
    const prev = [makeScreeningEntry({ result: atRiskResult })];
    const result = suggestScreeningTool(patient, prev);
    expect(result.recommended).toBe("glim");
  });

  it("recommends GLIM when MNA-SF shows malnourished", () => {
    const patient = makePatient({ age: 70 });
    const malnourishedResult: MnaSfResult = {
      toolType: "mna-sf",
      data: {
        foodIntakeDecline: 0,
        weightLoss: 0,
        mobility: 0,
        psychologicalStress: 0,
        neuropsychological: 0,
        bmiOrCalf: 0,
        usedCalfCircumference: false,
      },
      totalScore: 0,
      riskLevel: "malnourished",
      recommendations: [],
    };
    const prev = [makeScreeningEntry({ result: malnourishedResult })];
    const result = suggestScreeningTool(patient, prev);
    expect(result.recommended).toBe("glim");
  });

  it("provides a non-empty reason for all suggestions", () => {
    const young = suggestScreeningTool(makePatient({ age: 30 }), []);
    const old = suggestScreeningTool(makePatient({ age: 75 }), []);
    expect(young.reason.length).toBeGreaterThan(0);
    expect(old.reason.length).toBeGreaterThan(0);
  });
});

// ── isScreeningDue ──

describe("isScreeningDue", () => {
  it("returns true when no previous screening exists", () => {
    expect(isScreeningDue(undefined, "2025-01-20")).toBe(true);
  });

  it("returns false when screening was 3 days ago", () => {
    const entry = makeScreeningEntry({ date: "2025-01-17" });
    expect(isScreeningDue(entry, "2025-01-20")).toBe(false);
  });

  it("returns false when screening was 6 days ago", () => {
    const entry = makeScreeningEntry({ date: "2025-01-14" });
    expect(isScreeningDue(entry, "2025-01-20")).toBe(false);
  });

  it("returns true when screening was exactly 7 days ago", () => {
    const entry = makeScreeningEntry({ date: "2025-01-13" });
    expect(isScreeningDue(entry, "2025-01-20")).toBe(true);
  });

  it("returns true when screening was 14 days ago", () => {
    const entry = makeScreeningEntry({ date: "2025-01-06" });
    expect(isScreeningDue(entry, "2025-01-20")).toBe(true);
  });
});

// ── getScreeningStatusLabel ──

describe("getScreeningStatusLabel", () => {
  it("returns 未実施 when no screening exists", () => {
    expect(getScreeningStatusLabel(undefined, "2025-01-20")).toBe("未実施");
  });

  it("returns 再スクリーニング必要 when overdue", () => {
    const entry = makeScreeningEntry({ date: "2025-01-01" });
    expect(getScreeningStatusLabel(entry, "2025-01-20")).toBe(
      "再スクリーニング必要",
    );
  });

  it("returns リスクなし for recent NRS-2002 no-risk", () => {
    const entry = makeScreeningEntry({ date: "2025-01-18" });
    expect(getScreeningStatusLabel(entry, "2025-01-20")).toBe("リスクなし");
  });
});
