import { describe, expect, it } from "vitest";
import { addDays, deadlineState, diffInDays, isValidDay } from "./dates";

describe("dates", () => {
  it("rejects impossible calendar days", () => {
    expect(isValidDay("2026-02-30")).toBe(false);
    expect(isValidDay("26-02-10")).toBe(false);
    expect(isValidDay("2026-02-28")).toBe(true);
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(diffInDays("2026-03-01", "2026-02-28")).toBe(1);
  });

  it("classifies deadlines relative to today", () => {
    const now = "2026-10-26";
    expect(deadlineState(null, now)).toBe("none");
    expect(deadlineState("2026-10-25", now)).toBe("overdue");
    expect(deadlineState("2026-10-26", now)).toBe("soon");
    expect(deadlineState("2026-10-29", now)).toBe("soon");
    expect(deadlineState("2026-10-30", now)).toBe("upcoming");
  });
});
