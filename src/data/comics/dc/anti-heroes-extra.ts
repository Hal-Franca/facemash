import type { Character } from "../../types";
import { artFor } from "./art";

const E0 = "DC Universe — Earth-0";

function a(
  id: string,
  superName: string,
  name: string,
  universeLabel: string,
  teams: string[],
  gender: Character["gender"],
  species: Character["species"],
  powers: string[],
  comic: string,
  issue: string,
  year: number,
  bio: string
): Character {
  return {
    id, superName, name, category: "comics", universe: "dc",
    universeLabel, teams, affiliation: "anti-hero", gender, species, powers,
    firstAppearance: { comic, issue, year },
    bio: `${name} is ${superName} of ${universeLabel}, affiliated with ${teams.join("; ")}. ${bio}`,
    image: artFor(id, superName),
  };
}

export const dcAntiHeroesExtra: Character[] = [
  a("dc-azrael-lane", "Azrael", "Michael Lane", E0, ["Order of St. Dumas", "Bat-Family"], "male", "human",
    ["Flaming sword", "Armor of Sorrows"], "Azrael: Death's Dark Knight", "#1", 2009, "Ex-cop bearing the cursed armor."),
  a("dc-bronze-tiger", "Bronze Tiger", "Ben Turner", E0, ["Suicide Squad", "League of Assassins"], "male", "human",
    ["Martial arts mastery"], "Richard Dragon, Kung Fu Fighter", "#1", 1975, "Redeemed tiger of martial arts."),
  a("dc-catman", "Catman", "Thomas Blake", E0, ["Secret Six"], "male", "human",
    ["Cat claws", "Tracking"], "Detective Comics", "#311", 1963, "Jungle king turned Secret Six muscle."),
  a("dc-enchantress", "Enchantress", "June Moone", E0, ["Suicide Squad", "Shadowpact"], "female", "human",
    ["Chaos magic"], "Strange Adventures", "#187", 1966, "Artist possessed by a witch entity."),
  a("dc-grifter", "Grifter", "Cole Cash", "WildStorm / DC Universe", ["WildC.A.T.s"], "male", "human",
    ["Gunslinging", "Telekinesis"], "WildC.A.T.s", "#1", 1992, "Smart-mouthed WildStorm gunman."),
  a("dc-hawk", "Hawk", "Hank Hall", E0, ["Hawk and Dove"], "male", "human",
    ["Super strength", "Rage empowerment"], "Showcase", "#75", 1968, "Avatar of war's hot temper."),
  a("dc-star-sapphire", "Star Sapphire", "Carol Ferris", E0, ["Star Sapphires"], "female", "human",
    ["Love-powered ring"], "Green Lantern", "#16", 1962, "Hal's love wielding violet light."),
  a("dc-killer-frost", "Killer Frost", "Caitlin Snow", E0, ["Suicide Squad", "Justice League"], "female", "meta-human",
    ["Cryokinesis", "Heat absorption"], "Forever Evil", "#1", 2013, "Scientist freezing to survive."),
  a("dc-king-shark", "King Shark", "Nanaue", E0, ["Suicide Squad"], "male", "other",
    ["Shark strength", "Regeneration"], "Superboy", "#0", 1994, "Demigod shark prince turned Squad muscle."),
  a("dc-vigilante", "Vigilante", "Adrian Chase", E0, ["Independent"], "male", "human",
    ["Marksmanship", "Motorcycle"], "New Teen Titans Annual", "#2", 1983, "Judge turned lethal vigilante."),
];
