import { describe, expect, it } from "vitest";
import { buildBoard, tierFor, type BoardInput } from "../ranking";

const row = (id: string, elo: number, wins = 0, battles = 0): BoardInput => ({
  id,
  name: id,
  elo,
  wins,
  battles,
});

describe("buildBoard", () => {
  it("orders by elo, then wins, then battles, then name", () => {
    const board = buildBoard([
      row("b", 1400, 1, 1),
      row("a", 1400, 1, 1),
      row("c", 1500, 0, 0),
      row("d", 1400, 2, 2),
      row("e", 1400, 1, 3),
    ]);
    expect(board.map((r) => r.id)).toEqual(["c", "d", "e", "a", "b"]);
  });

  it("assigns competition ranks with letter suffixes (#1, #2A, #2B, #4A, #4B, #6)", () => {
    const board = buildBoard([
      row("solo1", 1600, 5, 5),
      row("t1", 1500, 3, 3),
      row("t2", 1500, 3, 3),
      row("u1", 1400, 1, 1),
      row("u2", 1400, 1, 1),
      row("solo2", 1300, 0, 0),
    ]);
    expect(board.map((r) => r.rank)).toEqual(["1", "2A", "2B", "4A", "4B", "6"]);
  });

  it("grandmaster takes the first 20 display rows (ties included, never split)", () => {
    const entries: BoardInput[] = [];
    for (let i = 0; i < 21; i++) {
      entries.push({ id: `c${i}`, name: `c${i}`, elo: 2000 - i * 10, wins: 10, battles: 10 });
    }
    // Force a tie at #2 (two rows share rank 2).
    entries[1].elo = entries[2].elo = 1990;
    entries[1].wins = entries[2].wins = 9;
    entries[1].battles = entries[2].battles = 9;
    const board = buildBoard(entries);
    const gm = board.filter((r) => r.tier === "Grandmaster");
    expect(gm).toHaveLength(20);
    expect(board[1].rank).toBe("2A");
    expect(board[2].rank).toBe("2B");
    // Competition ranking: one doubled rank shifts everything after it by one,
    // so the 20th row reads #20 (NOT #19 — 20 rows, one size-2 tie => last is #20).
    expect(board[19].rank).toBe("20");
    expect(board[20].tier).not.toBe("Grandmaster");
  });

  it("grandmaster never splits a tie group straddling the cutoff", () => {
    const entries: BoardInput[] = [];
    for (let i = 0; i < 19; i++) {
      entries.push({ id: `c${i}`, name: `c${i}`, elo: 2000 - i * 10, wins: 10, battles: 10 });
    }
    // Tie straddling positions 20-21.
    entries.push({ id: "t1", name: "t1", elo: 1000, wins: 5, battles: 5 });
    entries.push({ id: "t2", name: "t2", elo: 1000, wins: 5, battles: 5 });
    const board = buildBoard(entries);
    const gm = board.filter((r) => r.tier === "Grandmaster");
    expect(gm).toHaveLength(21);
    expect(board[20].tier).toBe("Grandmaster");
  });

  it("skips ineligible rows for grandmaster (battles gate)", () => {
    const board = buildBoard([row("newbie", 2500, 1, 1), row("vet", 2400, 9, 9)]);
    expect(board[0].tier).not.toBe("Grandmaster");
    expect(board[1].tier).toBe("Grandmaster");
  });

  it("maps elo bands to tiers", () => {
    expect(tierFor(1100)).toBe("Bronze");
    expect(tierFor(1300)).toBe("Silver");
    expect(tierFor(1400)).toBe("Gold");
    expect(tierFor(1700)).toBe("Platinum");
    expect(tierFor(1900)).toBe("Diamond");
  });
});
