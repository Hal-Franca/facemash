import { describe, expect, it } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { catalog } from "@/data";
import { ART } from "@/data/comics/dc/art";

const IMG_DIR = path.join(process.cwd(), "public", "images", "comics", "dc");

describe("catalog integrity", () => {
  it("has unique ids", () => {
    const ids = catalog.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every character has required fields", () => {
    for (const c of catalog) {
      expect(c.superName, c.id).toBeTruthy();
      // name may be "" when the character has no civilian identity (e.g. Bane)
      expect(typeof c.name, c.id).toBe("string");
      expect(c.powers.length, c.id).toBeGreaterThan(0);
      expect(c.firstAppearance.year, c.id).toBeGreaterThan(1900);
      expect(c.teams.length, c.id).toBeGreaterThan(0);
    }
  });

  it("every character has wired art that exists on disk", () => {
    const files = new Set(readdirSync(IMG_DIR));
    const missing = catalog.filter((c) => {
      const f = ART[c.id];
      return !f || !files.has(f);
    });
    expect(
      missing.map((c) => c.id),
      "characters without portrait files"
    ).toEqual([]);
  });
});
