// Copies the theme's images into public/img so the Vercel preview serves the same files
// as WordPress. Runs automatically before `npm run dev` and `npm run build`.
import fs from "node:fs";
import path from "node:path";

const from = path.join(process.cwd(), "wordpress", "themes", "evenly", "assets", "img");
const to = path.join(process.cwd(), "public", "img");
fs.rmSync(to, { recursive: true, force: true });
fs.mkdirSync(to, { recursive: true });
for (const f of fs.readdirSync(from)) fs.copyFileSync(path.join(from, f), path.join(to, f));
fs.copyFileSync(path.join(from, "mark.svg"), path.join(process.cwd(), "app", "icon.svg"));
console.log(`synced ${fs.readdirSync(to).length} images`);
