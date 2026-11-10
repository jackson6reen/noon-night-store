// Converts source PNGs into web-ready WebP files in the theme's assets/img folder.
// Usage: node scripts/optimize-images.mjs <folder-with-pngs>
// Output names keep the source name: hero.png -> hero.webp (+ hero-960.webp for wide images).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("Usage: node scripts/optimize-images.mjs <folder-with-pngs>");
  process.exit(1);
}
const out = path.join(process.cwd(), "wordpress", "themes", "evenly", "assets", "img");
fs.mkdirSync(out, { recursive: true });

for (const file of fs.readdirSync(src).filter((f) => f.endsWith(".png"))) {
  const name = path.basename(file, ".png");
  const input = sharp(path.join(src, file));
  const { width } = await input.metadata();
  const wide = width >= 1600;
  const max = wide ? 1920 : 1000;
  await input.clone().resize({ width: Math.min(width, max) }).webp({ quality: 78 }).toFile(path.join(out, `${name}.webp`));
  if (wide) {
    await input.clone().resize({ width: 960 }).webp({ quality: 76 }).toFile(path.join(out, `${name}-960.webp`));
  }
  console.log("✓", name);
}
