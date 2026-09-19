import { describe, expect, it } from "vitest";
import { appliesToday } from "../dates.js";

describe("appliesToday", () => {
  it("is true every day for Quotidien", () => {
    expect(appliesToday({ frequence: "Quotidien" }, "Mardi")).toBe(true);
  });

  it("is false for Ponctuel regardless of day (occasional, not a daily reminder)", () => {
    expect(appliesToday({ frequence: "Ponctuel", jours: [] }, "Mardi")).toBe(false);
  });

  it("is true for Nx/semaine only on an assigned day", () => {
    const routine = { frequence: "2x/semaine", jours: ["Mardi", "Vendredi"] };
    expect(appliesToday(routine, "Mardi")).toBe(true);
    expect(appliesToday(routine, "Lundi")).toBe(false);
  });
});
