import { describe, it, expect } from "vitest";
import {
  generateFeedingProtocol,
  createProtocolFromRequirements,
  type ProtocolOptions,
} from "./feedingProtocol";
import type { NutritionRequirements } from "../types";

// ── Standard protocol ──

describe("generateFeedingProtocol — standard ICU", () => {
  const standardOptions: ProtocolOptions = {
    targetVolume: 1600,
    energyDensity: 1.0,
    infusionHours: 20,
    startPercent: 25,
    dailyIncrease: 25,
  };

  it("generates 4-day ramp to 100%", () => {
    const protocol = generateFeedingProtocol(standardOptions);
    expect(protocol.steps.length).toBe(4);
    expect(protocol.daysToTarget).toBe(4);
  });

  it("starts at 25% of target", () => {
    const protocol = generateFeedingProtocol(standardOptions);
    expect(protocol.steps[0].percentOfTarget).toBe(25);
    expect(protocol.steps[0].dailyVolume).toBe(400);
    expect(protocol.steps[0].dailyEnergy).toBe(400);
  });

  it("reaches 100% on the last step", () => {
    const protocol = generateFeedingProtocol(standardOptions);
    const lastStep = protocol.steps[protocol.steps.length - 1];
    expect(lastStep.percentOfTarget).toBe(100);
    expect(lastStep.dailyVolume).toBe(1600);
  });

  it("increases by 25% each day", () => {
    const protocol = generateFeedingProtocol(standardOptions);
    expect(protocol.steps[0].percentOfTarget).toBe(25);
    expect(protocol.steps[1].percentOfTarget).toBe(50);
    expect(protocol.steps[2].percentOfTarget).toBe(75);
    expect(protocol.steps[3].percentOfTarget).toBe(100);
  });

  it("calculates correct rates", () => {
    const protocol = generateFeedingProtocol(standardOptions);
    expect(protocol.targetRate).toBeCloseTo(80, 0); // 1600/20
    expect(protocol.steps[0].rate).toBeCloseTo(20, 0); // 400/20
  });

  it("includes GRV and diarrhea notes", () => {
    const protocol = generateFeedingProtocol(standardOptions);
    expect(protocol.notes.some((n) => n.includes("GRV"))).toBe(true);
    expect(protocol.notes.some((n) => n.includes("下痢"))).toBe(true);
  });
});

// ── High risk (Refeeding) ──

describe("generateFeedingProtocol — Refeeding high risk", () => {
  const highRiskOptions: ProtocolOptions = {
    targetVolume: 1200,
    energyDensity: 1.0,
    infusionHours: 20,
    startPercent: 15,
    dailyIncrease: 15,
    isHighRisk: true,
  };

  it("starts at 15% for high risk", () => {
    const protocol = generateFeedingProtocol(highRiskOptions);
    expect(protocol.steps[0].percentOfTarget).toBe(15);
    expect(protocol.steps[0].dailyVolume).toBe(180);
  });

  it("takes longer to reach target (6 steps: 15%→90%)", () => {
    const protocol = generateFeedingProtocol(highRiskOptions);
    // 15→30→45→60→75→90, next=105 exceeds while(<=100), so 6 steps
    expect(protocol.daysToTarget).toBe(6);
  });

  it("includes thiamine supplementation note", () => {
    const protocol = generateFeedingProtocol(highRiskOptions);
    expect(protocol.notes.some((n) => n.includes("チアミン"))).toBe(true);
  });

  it("includes electrolyte monitoring note", () => {
    const protocol = generateFeedingProtocol(highRiskOptions);
    expect(
      protocol.notes.some((n) => n.includes("リン") || n.includes("カリウム")),
    ).toBe(true);
  });

  it("includes fluid management note", () => {
    const protocol = generateFeedingProtocol(highRiskOptions);
    expect(protocol.notes.some((n) => n.includes("体液"))).toBe(true);
  });
});

// ── Max rate cap ──

describe("generateFeedingProtocol — max rate cap", () => {
  it("respects maxRate limitation", () => {
    const options: ProtocolOptions = {
      targetVolume: 2000,
      energyDensity: 1.5,
      infusionHours: 20,
      startPercent: 50,
      dailyIncrease: 50,
      maxRate: 50,
    };
    const protocol = generateFeedingProtocol(options);
    for (const step of protocol.steps) {
      expect(step.rate).toBeLessThanOrEqual(50);
    }
  });
});

// ── Energy density variations ──

describe("generateFeedingProtocol — energy density", () => {
  it("calculates energy correctly for 1.5kcal/mL formula", () => {
    const options: ProtocolOptions = {
      targetVolume: 1000,
      energyDensity: 1.5,
      infusionHours: 20,
      startPercent: 50,
      dailyIncrease: 50,
    };
    const protocol = generateFeedingProtocol(options);
    expect(protocol.steps[0].dailyEnergy).toBe(750); // 500mL * 1.5
    expect(protocol.steps[1].dailyEnergy).toBe(1500); // 1000mL * 1.5
  });

  it("calculates energy correctly for 2kcal/mL high-density formula", () => {
    const options: ProtocolOptions = {
      targetVolume: 500,
      energyDensity: 2.0,
      infusionHours: 20,
      startPercent: 25,
      dailyIncrease: 25,
    };
    const protocol = generateFeedingProtocol(options);
    expect(protocol.steps[0].dailyEnergy).toBe(250); // 125mL * 2.0
  });
});

// ── createProtocolFromRequirements ──

describe("createProtocolFromRequirements", () => {
  const requirements: NutritionRequirements = {
    energy: 1800,
    protein: 90,
    fat: 60,
    carbs: 225,
    sodium: 90,
    potassium: 60,
    calcium: 30,
    magnesium: 18,
    phosphorus: 48,
    chloride: 72,
    iron: 6,
    zinc: 3,
    copper: 0.6,
    manganese: 0.3,
    iodine: 90,
    selenium: 60,
  };

  it("calculates target volume from energy and density", () => {
    const options = createProtocolFromRequirements(requirements, 1.0);
    expect(options.targetVolume).toBe(1800); // 1800kcal / 1.0
  });

  it("adjusts volume for higher density formula", () => {
    const options = createProtocolFromRequirements(requirements, 1.5);
    expect(options.targetVolume).toBe(1200); // 1800kcal / 1.5
  });

  it("uses standard 25% start for non-high-risk", () => {
    const options = createProtocolFromRequirements(requirements, 1.0, false);
    expect(options.startPercent).toBe(25);
    expect(options.dailyIncrease).toBe(25);
  });

  it("uses 15% start for high-risk patients", () => {
    const options = createProtocolFromRequirements(requirements, 1.0, true);
    expect(options.startPercent).toBe(15);
    expect(options.dailyIncrease).toBe(15);
    expect(options.isHighRisk).toBe(true);
  });

  it("defaults to 20-hour infusion", () => {
    const options = createProtocolFromRequirements(requirements, 1.0);
    expect(options.infusionHours).toBe(20);
  });
});

// ── Edge cases ──

describe("generateFeedingProtocol — edge cases", () => {
  it("handles 100% start (immediate target)", () => {
    const options: ProtocolOptions = {
      targetVolume: 1000,
      energyDensity: 1.0,
      infusionHours: 20,
      startPercent: 100,
      dailyIncrease: 25,
    };
    const protocol = generateFeedingProtocol(options);
    expect(protocol.steps.length).toBe(1);
    expect(protocol.steps[0].percentOfTarget).toBe(100);
  });

  it("caps at 14 days maximum", () => {
    const options: ProtocolOptions = {
      targetVolume: 2000,
      energyDensity: 1.0,
      infusionHours: 20,
      startPercent: 1,
      dailyIncrease: 1,
    };
    const protocol = generateFeedingProtocol(options);
    expect(protocol.steps.length).toBeLessThanOrEqual(14);
  });

  it("does not mutate options object", () => {
    const options: ProtocolOptions = {
      targetVolume: 1600,
      energyDensity: 1.0,
      infusionHours: 20,
      startPercent: 25,
      dailyIncrease: 25,
    };
    const copy = { ...options };
    generateFeedingProtocol(options);
    expect(options).toEqual(copy);
  });
});
