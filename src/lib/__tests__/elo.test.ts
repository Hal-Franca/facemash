import { describe, expect, it } from "vitest";
import { expectedScore, pickPair, updateElo } from "../elo";

describe("elo", () => {
  it("favors higher rated player", () => {
    expect(expectedScore(1600, 1400)).toBeGreaterThan(0.5);
  });
  it("winner gains, loser loses", () => {
    const r = updateElo(1400, 1400);
    expect(r.winner).toBeGreaterThan(1400);
    expect(r.loser).toBeLessThan(1400);
  });
  it("picks two distinct ids", () => {
    const [a, b] = pickPair(["x", "y", "z"]);
    expect(a).not.toBe(b);
  });
});
