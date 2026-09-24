export type Affiliation = "hero" | "villain" | "anti-hero" | "other";
export type Gender = "male" | "female" | "other";
export type Species = "human" | "meta-human" | "alien" | "other";

export type CategoryId = "comics" | "anime" | "other";
export type UniverseId = "dc" | "marvel" | "other-dc" | string;

export interface FirstAppearance {
  comic: string;
  issue: string;
  year: number;
}

export interface CharacterImage {
  /** Remote URL when you have licensed art. Keep null until then — UI falls back to placeholder. */
  url: string | null;
  alt: string;
  credit?: string;
}

export interface Character {
  id: string;
  superName: string;
  name: string;
  category: CategoryId;
  universe: UniverseId;
  affiliation: Affiliation;
  gender: Gender;
  species: Species;
  powers: string[];
  firstAppearance: FirstAppearance;
  bio: string;
  image: CharacterImage;
  /** Base Elo for new characters. Runtime wins/losses live in localStorage, not here. */
  baseElo?: number;
}

export interface Rating {
  elo: number;
  wins: number;
  losses: number;
  battles: number;
}
