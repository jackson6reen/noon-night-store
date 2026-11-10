// Renders "Sunlit Balance" packaging for every product from products.json:
// white bottle, white cap, cream label, the extracted evenly logo, the product name and
// descriptor, the format ONLY when the supplier label is verified, and overlapping
// quarter/half-circle "fruit slice" graphics. Every image is captioned "Packaging render".
//
// Usage: node scripts/brand/render-packaging.mjs <path-to-PlusJakartaSans.ttf>
import fs from "node:fs";
import sharp from "sharp";

const FONT = process.argv[2];
if (!FONT || !fs.existsSync(FONT)) throw new Error("Pass the Plus Jakarta Sans .ttf path");
const IMG = "wordpress/themes/evenly/assets/img";
const data = JSON.parse(fs.readFileSync("wordpress/setup/data/products.json", "utf8"));

const C = { cream: "#FFF8EC", label: "#FFF4E2", green: "#123D38", coral: "#FF735E", mango: "#FFC857", guava: "#EE91AC" };
const tint = (hex, amt = 0.45) => {
  const n = (h) => parseInt(hex.slice(h, h + 2), 16);
  const mix = (v, c) => Math.round(v + (c - v) * amt);
  const [r, g, b] = [n(1), n(3), n(5)];
  return `#${[mix(r, 0xff), mix(g, 0xf8), mix(b, 0xec)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

/** Pango text → PNG buffer in Plus Jakarta Sans. */
async function text(str, { size, weight = 700, color = C.green, spacing = 0 }) {
  const esc = str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return sharp({
    text: {
      text: `<span foreground="${color}" font_weight="${weight}" letter_spacing="${spacing * 1024}">${esc}</span>`,
      font: `Plus Jakarta Sans ${size}`,
      fontfile: FONT,
      rgba: true,
      dpi: 72,
    },
  }).png().toBuffer();
}

/**
 * One bottle on a transparent canvas (W x H). Returns PNG buffer.
 * jar = short wide powder jar.
 */
async function bottle(p, { W = 1000, H = 1000, jar = false } = {}) {
  const bw = jar ? 560 : 440; // body width
  const bh = jar ? 470 : 640; // body height
  const bx = (W - bw) / 2;
  const by = H - bh - 110;
  const capW = jar ? 500 : 300;
  const capH = jar ? 120 : 130;
  const capX = (W - capW) / 2;
  const capY = by - capH + (jar ? 24 : 6);
  const neckW = jar ? 0 : 330;
  const lx = bx; // label spans the body width
  const ly = by + (jar ? 70 : 110);
  const lw = bw;
  const lh = bh - (jar ? 120 : 170);
  const main = p.label_main;
  const acc = p.label_accent;

  // Fruit-slice graphics: two small quarter circles (tint) bottom-left + a large half circle (main) bottom-right.
  const gy = ly + lh; // label bottom
  const q = lh * 0.26;
  const big = lw * 0.56;
  const slices = `
    <path d="M ${lx} ${gy - q} A ${q} ${q} 0 0 1 ${lx + q} ${gy - 2 * q} L ${lx + q} ${gy - q} Z" fill="${tint(acc, 0.35)}"/>
    <path d="M ${lx} ${gy} L ${lx} ${gy - q} A ${q} ${q} 0 0 1 ${lx + q} ${gy} Z" fill="${tint(main, 0.4)}"/>
    <path d="M ${lx + q} ${gy} A ${q} ${q} 0 0 1 ${lx + 2 * q} ${gy - q} L ${lx + 2 * q} ${gy} Z" fill="${acc}"/>
    <path d="M ${lx + lw - big} ${gy} A ${big} ${big} 0 0 1 ${lx + lw} ${gy - big * 0.92} L ${lx + lw} ${gy} Z" fill="${main}"/>`;

  const ridges = Array.from({ length: 22 }, (_, i) => {
    const x = capX + 10 + (i * (capW - 20)) / 21;
    return `<line x1="${x}" y1="${capY + 8}" x2="${x}" y2="${capY + capH - 8}" stroke="#E4E2DD" stroke-width="3"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="body" x1="0" x2="1">
        <stop offset="0" stop-color="#E9E8E4"/><stop offset=".18" stop-color="#FFFFFF"/>
        <stop offset=".62" stop-color="#FAFAF8"/><stop offset="1" stop-color="#DCDBD6"/>
      </linearGradient>
      <linearGradient id="cap" x1="0" x2="1">
        <stop offset="0" stop-color="#E6E5E1"/><stop offset=".25" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DAD9D4"/>
      </linearGradient>
      <linearGradient id="shade" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".07"/><stop offset=".16" stop-color="#fff" stop-opacity=".18"/>
        <stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/>
      </linearGradient>
      <filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
      <clipPath id="labelClip"><rect x="${lx}" y="${ly}" width="${lw}" height="${lh}"/></clipPath>
    </defs>
    <ellipse cx="${W / 2}" cy="${by + bh + 8}" rx="${bw * 0.55}" ry="26" fill="#123D38" opacity=".18" filter="url(#blur)"/>
    ${neckW ? `<rect x="${(W - neckW) / 2}" y="${by - 30}" width="${neckW}" height="60" rx="18" fill="url(#body)"/>` : ""}
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${jar ? 46 : 70}" fill="url(#body)"/>
    <rect x="${capX}" y="${capY}" width="${capW}" height="${capH}" rx="16" fill="url(#cap)"/>
    ${ridges}
    <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="${C.label}"/>
    <g clip-path="url(#labelClip)">${slices}</g>
  </svg>`;

  const layers = [];
  const logoW = Math.round(lw * 0.62);
  const logo = await sharp(`${IMG}/logo-green.png`).resize({ width: logoW }).png().toBuffer();
  const logoMeta = await sharp(logo).metadata();
  let y = ly + Math.round(lh * 0.1);
  layers.push({ input: logo, left: Math.round(W / 2 - logoW / 2), top: y });
  y += logoMeta.height + Math.round(lh * 0.07);

  const lines = [
    [p.short_label.toUpperCase(), { size: jar ? 46 : 44, weight: 800, spacing: 3 }],
    [p.descriptor, { size: 24, weight: 600 }],
  ];
  if (p.format_verified) lines.push([p.format_verified, { size: 21, weight: 500, color: "#3D5A55" }]);
  for (const [str, opts] of lines) {
    const t = await text(str, opts);
    const m = await sharp(t).metadata();
    layers.push({ input: t, left: Math.round(W / 2 - m.width / 2), top: y });
    y += m.height + 10;
  }

  // Cylinder shading over the label so it reads as printed on the bottle.
  const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="url(#s)"/><defs><linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".08"/><stop offset=".18" stop-color="#fff" stop-opacity=".2"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".13"/></linearGradient></defs></svg>`);
  layers.push({ input: shade, left: 0, top: 0 });

  const flat = await sharp(Buffer.from(svg)).composite(layers).png().toBuffer();
  return sharp(flat).trim({ threshold: 0 }).png().toBuffer(); // drop transparent margins for layout
}

const caption = await text("Packaging render", { size: 18, weight: 600, color: "#8A8F86" });

/**
 * Lays trimmed bottles side by side on a cream canvas, scaled to fill ~84% of the
 * width (capped at 74% of the height) and centered vertically. b.h = relative height.
 */
async function scene(bottles, { W = 1000, H = 1000, gap = -40, out, bg = C.cream }) {
  const metas = await Promise.all(bottles.map((b) => sharp(b.buf).metadata()));
  // Width of the row at unit scale (each bottle normalized to height b.h * 1000).
  const unit = metas.reduce((n, m, i) => n + (m.width * (bottles[i].h * 1000)) / m.height, 0) + gap * (bottles.length - 1);
  const maxH = Math.max(...bottles.map((b) => b.h)) * 1000;
  const k = Math.min((W * 0.84) / unit, (H * 0.74) / maxH);
  const items = [];
  let total = 0;
  for (const [i, b] of bottles.entries()) {
    const buf = await sharp(b.buf).resize({ height: Math.round(b.h * 1000 * k) }).png().toBuffer();
    const m = await sharp(buf).metadata();
    items.push({ buf, w: m.width, h: m.height });
    total += m.width + (i ? gap : 0);
  }
  let x = Math.round((W - total) / 2);
  const floor = (H + maxH * k) / 2;
  const comps = items.map((it, i) => {
    const c = { input: it.buf, left: x, top: Math.round(floor - it.h + (i % 2 ? H * 0.025 : 0)) };
    x += it.w + gap;
    return c;
  });
  // Middle items in front for groups of 3+.
  if (comps.length >= 3) comps.push(comps.splice(Math.floor(comps.length / 2), 1)[0]);
  const cm = await sharp(caption).metadata();
  comps.push({ input: caption, left: W - cm.width - 24, top: H - cm.height - 18 });
  await sharp({ create: { width: W, height: H, channels: 3, background: bg } }).composite(comps).webp({ quality: 84 }).toFile(`${IMG}/${out}`);
  console.log("✓", out);
}

// ----- products -----
const LABEL = {
  "EV-SLEEP": ["guava", "mango"],
  "EV-UNWIND": ["guava", "coral"],
  "EV-CYCLE": ["coral", "guava"],
  "EV-DIGEST": ["mango", "coral"],
  "EV-FLORA": ["mango", "guava"],
  "EV-RESTORE": ["coral", "mango"],
  "EV-CALM": ["mango", "guava"],
};
const cache = {};
for (const p of data.products) {
  const [main, acc] = LABEL[p.sku];
  const [label, descriptor] = p.name.replace(/^Evenly /, "").split(": ");
  const verified = p.supplier?.label_verified;
  const info = {
    short_label: label,
    descriptor: descriptor.replace(" Powder", ""),
    format_verified: verified ? p.format.split(" · ")[0] : "",
    label_main: C[main],
    label_accent: C[acc],
  };
  const jar = p.sku === "EV-RESTORE";
  cache[p.sku] = await bottle(info, { jar });
  await scene([{ buf: cache[p.sku], h: jar ? 0.8 : 1 }], { out: p.image, gap: 0 });
}

// ----- kits -----
for (const k of data.bundles) {
  const n = k.includes.length;
  const bs = k.includes.map((sku) => ({ buf: cache[sku], h: sku === "EV-RESTORE" ? 0.75 : 1 }));
  await scene(bs, { out: k.image, gap: n >= 3 ? -20 : -12 });
}

// ----- lineup (wide) -----
const four = ["EV-SLEEP", "EV-CYCLE", "EV-DIGEST", "EV-CALM"].map((s) => ({ buf: cache[s], h: 1 }));
await scene(four, { W: 1920, H: 1088, out: "lineup.webp", gap: 36, bg: "#FBF0DF" });
await sharp(`${IMG}/lineup.webp`).resize({ width: 960 }).webp({ quality: 80 }).toFile(`${IMG}/lineup-960.webp`);
console.log("✓ lineup-960.webp");
