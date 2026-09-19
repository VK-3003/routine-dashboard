import { describe, expect, it } from "vitest";
import { weekOverWeekDelta } from "../trend.js";

function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("weekOverWeekDelta", () => {
  it("returns null when there is no data at all", () => {
    expect(weekOverWeekDelta([])).toBeNull();
  });

  it("returns null when only one of the two windows has entries", () => {
    const entries = [0, 1, 2].map((i) => ({ date: daysAgoStr(i), fait: true }));
    expect(weekOverWeekDelta(entries)).toBeNull();
  });

  it("returns a positive delta when this week is better than last week", () => {
    const entries = [
      ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({ date: daysAgoStr(i), fait: true })), // this week: 100%
      ...[7, 8, 9, 10, 11, 12, 13].map((i) => ({ date: daysAgoStr(i), fait: false })), // last week: 0%
    ];
    expect(weekOverWeekDelta(entries)).toBe(100);
  });

  it("returns a negative delta when this week is worse than last week", () => {
    const entries = [
      ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({ date: daysAgoStr(i), fait: false })),
      ...[7, 8, 9, 10, 11, 12, 13].map((i) => ({ date: daysAgoStr(i), fait: true })),
    ];
    expect(weekOverWeekDelta(entries)).toBe(-100);
  });

  it("returns 0 when both weeks have the same completion rate", () => {
    // Same fait pattern repeated every 7 days -> identical ratio both weeks.
    const entries = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => ({
      date: daysAgoStr(i),
      fait: i % 7 < 3,
    }));
    expect(weekOverWeekDelta(entries)).toBe(0);
  });
});
