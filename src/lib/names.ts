/** Shared civilian-name display rules (single source of truth for UI + data). */

/** True when the character has a civilian identity worth showing in parentheses.
 * Empty (e.g. Bane, Joker) or identical to the super name (e.g. Ra's al Ghul)
 * → show the super name alone. */
export function hasRealName(c: { superName: string; name: string }): boolean {
  return !!c.name && c.name !== c.superName;
}

/** Catalog bio lead: "Name is Super of Universe, …" — or "Super of Universe, …"
 * when there is no distinct civilian identity (empty or same-as-super name). */
export function buildBio(
  superName: string,
  name: string,
  universeLabel: string,
  teams: string[],
  bio: string
): string {
  const where = `of ${universeLabel}, affiliated with ${teams.join("; ")}. ${bio}`;
  return hasRealName({ superName, name }) ? `${name} is ${superName} ${where}` : `${superName} ${where}`;
}
