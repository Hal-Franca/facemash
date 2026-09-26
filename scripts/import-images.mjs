/**
 * One-shot + repeatable image importer.
 * Source:  raw downloads (any size, jpg/png) e.g. C:/Users/Hal/Downloads/img
 * Dest:    public/images/comics/dc/<original-name>.webp (600x800 cover, q80)
 * Wiring character `image.url` happens separately in src/data (by filename match).
 *
 * Usage: node scripts/import-images.mjs "C:/Users/Hal/Downloads/img"
 */
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(fileURLToPath(import.meta.url));
const DEST = path.join(root, "..", "public", "images", "comics", "dc");
const SRC = process.argv[2];

if (!SRC) {
  console.error('Usage: node scripts/import-images.mjs "<source-dir>"');
  process.exit(1);
}

await mkdir(DEST, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

let ok = 0;
const failed = [];
for (const f of files) {
  const base = f.replace(/\.(jpe?g|png|webp)$/i, "");
  try {
    await sharp(path.join(SRC, f))
      .resize(600, 800, { fit: "cover", position: "attention" })
      .webp({ quality: 80 })
      .toFile(path.join(DEST, `${base}.webp`));
    ok++;
  } catch (err) {
    failed.push(`${f}: ${err.message}`);
  }
}

console.log(`imported ${ok}/${files.length} -> ${DEST}`);
if (failed.length) {
  console.log("FAILED:");
  for (const f of failed) console.log("  " + f);
  process.exit(1);
}
