import { describe, expect, it } from "vitest";
import { catalog, getCharacter } from "@/data";
import { ART } from "@/data/comics/dc/art";
import { buildBio, hasRealName } from "../names";

describe("hasRealName", () => {
  it("is true for a distinct civilian identity", () => {
    expect(hasRealName({ superName: "Batman", name: "Bruce Wayne" })).toBe(true);
  });

  it("is false for an empty name (Bane, Joker)", () => {
    expect(hasRealName({ superName: "Bane", name: "" })).toBe(false);
    expect(hasRealName({ superName: "Joker", name: "" })).toBe(false);
  });

  it("is false when the name duplicates the super name", () => {
    expect(hasRealName({ superName: "Ra's al Ghul", name: "Ra's al Ghul" })).toBe(false);
    expect(hasRealName({ superName: "Lobo", name: "Lobo" })).toBe(false);
  });
});

describe("buildBio", () => {
  const teams = ["Justice League", "Bat-Family"];
  const uni = "DC Universe — Earth-0";

  it("leads with 'Name is Super of …' for distinct identities", () => {
    expect(buildBio("Batman", "Bruce Wayne", uni, teams, "Vigilante.")).toBe(
      "Bruce Wayne is Batman of DC Universe — Earth-0, affiliated with Justice League; Bat-Family. Vigilante."
    );
  });

  it("leads with 'Super of …' for an empty name", () => {
    expect(buildBio("Bane", "", uni, teams, "Broke the Bat.")).toBe(
      "Bane of DC Universe — Earth-0, affiliated with Justice League; Bat-Family. Broke the Bat."
    );
  });

  it("leads with 'Super of …' when the name duplicates the super name", () => {
    expect(buildBio("Lobo", "Lobo", uni, ["Independent"], "Fragger.")).toBe(
      "Lobo of DC Universe — Earth-0, affiliated with Independent. Fragger."
    );
  });
});

describe("catalog civilian names (Earth-0 audit)", () => {
  it("leaves Bane and Joker nameless", () => {
    expect(getCharacter("dc-bane")?.name).toBe("");
    expect(getCharacter("dc-joker")?.name).toBe("");
  });

  it("only Bane and Joker have empty names", () => {
    const empty = catalog.filter((c) => !c.name).map((c) => c.id).sort();
    expect(empty).toEqual(["dc-bane", "dc-joker"]);
  });

  it("never writes 'X is X of …' bios", () => {
    const dupes = catalog.filter((c) => {
      const m = c.bio.match(/^(.+?) is (.+?) of /);
      return m !== null && m[1] === m[2];
    });
    expect(dupes.map((c) => c.id)).toEqual([]);
  });

  it("never starts a bio with a dangling ' is '", () => {
    expect(catalog.filter((c) => c.bio.startsWith(" is ")).map((c) => c.id)).toEqual([]);
  });

  it("pins the corrected audit identities", () => {
    expect(getCharacter("dc-deathstorm")?.name).toBe("Ronnie Raymond");
    expect(getCharacter("dc-johnny-quick")?.name).toBe("Jonathan Allen");
    expect(getCharacter("dc-superboy-prime")?.name).toBe("Clark Kent");
    expect(getCharacter("dc-etrigan")?.name).toBe("Jason Blood");
  });

  it("Etrigan's bio no longer repeats his name", () => {
    expect(getCharacter("dc-etrigan")?.bio).toBe(
      "Jason Blood is Etrigan of DC Universe — Earth-0, affiliated with Justice League Dark; Independent. Demon bound to Jason Blood, rhymes in battle."
    );
  });
});

describe("roster swap (Cobalt Blue in, Red X out)", () => {
  it("has Cobalt Blue with wired portrait", () => {
    const c = getCharacter("dc-cobalt-blue");
    expect(c?.superName).toBe("Cobalt Blue");
    expect(c?.name).toBe("Malcolm Thawne");
    expect(c?.image.url).toBe("/images/comics/dc/Cobalt Blue - Malcolm Thawne.webp");
  });

  it("has no Red X anywhere", () => {
    expect(getCharacter("dc-red-x")).toBeUndefined();
    expect("dc-red-x" in ART).toBe(false);
  });

  it("has no orphan art keys (every mapping resolves to a catalog id)", () => {
    const ids = new Set(catalog.map((c) => c.id));
    const orphans = Object.keys(ART).filter((id) => !ids.has(id));
    expect(orphans).toEqual([]);
  });
});
