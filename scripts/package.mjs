// Builds the two files you upload to WordPress:
//   dist/evenly-theme.zip  → Appearance → Themes → Add New → Upload
//   dist/evenly-core.zip   → Plugins → Add New → Upload (includes wordpress/setup for Tools → Evenly Setup)
// Usage: npm run package
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dist = path.join(root, "dist");
const build = path.join(dist, "build");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(build, { recursive: true });

const copy = (from, to) => fs.cpSync(path.join(root, from), path.join(build, to), { recursive: true });
copy("wordpress/themes/evenly", "evenly");
copy("wordpress/plugins/evenly-core", "evenly-core");
copy("wordpress/setup", "evenly-core/setup");

// bsdtar (Windows 10+, macOS) writes standard zips with forward slashes, which WordPress needs.
const zip = (folder, file) => execFileSync("tar", ["-a", "-c", "-f", path.join(dist, file), folder], { cwd: build, stdio: "inherit" });
zip("evenly", "evenly-theme.zip");
zip("evenly-core", "evenly-core.zip");
fs.rmSync(build, { recursive: true, force: true });

for (const f of fs.readdirSync(dist)) console.log(`✓ dist/${f}  ${(fs.statSync(path.join(dist, f)).size / 1024).toFixed(0)} KB`);
