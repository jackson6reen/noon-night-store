// Extracts the approved evenly logo from the brand reference file (raster only; no vector source was supplied).
// The letterforms are NOT redrawn or retyped: each pixel's alpha comes from the original artwork,
// and the color is normalized to the brand green / cream.
// Usage: node scripts/brand/extract-logo.mjs
import fs from "node:fs";
import sharp from "sharp";

const SRC = "brand/reference/evenly_logo_concepts.webp";
const OUT = "wordpress/themes/evenly/assets/img";
fs.mkdirSync(OUT, { recursive: true });

const BG = 244; // luminance of the cream background in the reference
const INK = 52; // luminance of the green ink in the reference

async function wordmark(region, name) {
  const { data, info } = await sharp(SRC).extract(region).greyscale().raw().toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < data.length; i++) {
    const a = (BG - data[i]) / (BG - INK);
    alpha[i] = Math.round(255 * Math.min(1, Math.max(0, a)));
  }
  const mask = sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } });
  for (const [suffix, rgb] of [["green", { r: 0x12, g: 0x3d, b: 0x38 }], ["cream", { r: 0xff, g: 0xf8, b: 0xec }]]) {
    const solid = await sharp({ create: { width: info.width, height: info.height, channels: 3, background: rgb } }).png().toBuffer();
    const img = sharp(solid).joinChannel(await mask.clone().png().toBuffer());
    const trimmed = await img.png().toBuffer().then((b) => sharp(b).trim({ threshold: 1 }).png().toBuffer());
    await sharp(trimmed).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}-${suffix}.png`);
    const m = await sharp(trimmed).metadata();
    console.log(`✓ ${name}-${suffix}.png ${m.width}x${m.height}`);
  }
}

// Primary wordmark (top of the logo sheet).
await wordmark({ left: 95, top: 85, width: 1490, height: 470 }, "logo");

// App icon: the green rounded square with the "e", masked to its rounded shape.
const icon = { left: 1467, top: 705, width: 146, height: 146 };
const roundMask = Buffer.from(`<svg width="${icon.width}" height="${icon.height}"><rect width="${icon.width}" height="${icon.height}" rx="27" fill="#fff"/></svg>`);
await sharp(SRC).extract(icon).composite([{ input: roundMask, blend: "dest-in" }]).png().toFile(`${OUT}/icon-e.png`);
console.log("✓ icon-e.png");

// Web-sized versions (header/footer use these; 2x the largest display size).
for (const c of ["green", "cream"]) {
  await sharp(`${OUT}/logo-${c}.png`).resize({ width: 480 }).webp({ quality: 92, alphaQuality: 100 }).toFile(`${OUT}/logo-${c}.webp`);
}
await sharp(`${OUT}/icon-e.png`).resize(64).png().toFile(`${OUT}/icon-e-64.png`);
console.log("✓ web sizes");