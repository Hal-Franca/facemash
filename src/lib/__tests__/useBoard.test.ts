import { describe, expect, it } from "vitest";
import { parseFilters } from "../useBoard";

describe("parseFilters", () => {
  it("passes valid values through", () => {
    const p = new URLSearchParams("aff=hero&gender=female&species=alien");
    expect(parseFilters(p)).toEqual({ aff: "hero", gender: "female", species: "alien" });
  });

  it("falls back to all on missing or invalid values", () => {
    expect(parseFilters(new URLSearchParams(""))).toEqual({
      aff: "all",
      gender: "all",
      species: "all",
    });
    const p = new URLSearchParams("aff=lantern&gender=x&species=robot");
    expect(parseFilters(p)).toEqual({ aff: "all", gender: "all", species: "all" });
  });
});
