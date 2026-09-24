import { catalog } from "../src/data/index.js";

const ids = new Set();
let bad = 0;
for (const c of catalog) {
  if (ids.has(c.id)) { console.error(`duplicate id: ${c.id}`); bad++; }
  ids.add(c.id);
  for (const f of ["superName","name","affiliation","gender","species"]) {
    if (!c[f]) { console.error(`${c.id} missing ${f}`); bad++; }
  }
  if (!c.firstAppearance?.comic || !c.firstAppearance?.issue || !c.firstAppearance?.year) {
    console.error(`${c.id} missing firstAppearance`); bad++;
  }
  if (!c.powers?.length) { console.error(`${c.id} missing powers`); bad++; }
}
console.log(`checked ${catalog.length} characters, ${bad} problems`);
process.exit(bad ? 1 : 0);
