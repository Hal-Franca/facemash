import type { Character } from "./types";
import { dcHeroes } from "./comics/dc/heroes";
import { dcVillains } from "./comics/dc/villains";
import { dcAntiHeroes } from "./comics/dc/anti-heroes";
import { dcHeroesExtra } from "./comics/dc/heroes-extra";
import { dcVillainsExtra } from "./comics/dc/villains-extra";
import { dcAntiHeroesExtra } from "./comics/dc/anti-heroes-extra";

// Future: import { marvelHeroes } from "./comics/marvel/heroes";
// Future: import { animeCharacters } from "./anime/characters";

export const catalog: Character[] = [
  ...dcHeroes,
  ...dcVillains,
  ...dcAntiHeroes,
  ...dcHeroesExtra,
  ...dcVillainsExtra,
  ...dcAntiHeroesExtra,
];

export const categories = ["comics"] as const;
export const universes = ["dc"] as const;

export function getCharacter(id: string): Character | undefined {
  return catalog.find((c) => c.id === id);
}
