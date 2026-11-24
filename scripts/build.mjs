// Assembles src/ into a single static page: public/index.html
//   npm run build
// Source files are listed (in order) in src/manifest.json. No bundler, no dependencies.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const manifest = JSON.parse(fs.readFileSync(path.join(src, "manifest.json"), "utf8"));
const read = (f) => {
  const p = path.join(src, f);
  if (!fs.existsSync(p)) throw new Error(`manifest lists a missing file: ${f}`);
  return fs.readFileSync(p, "utf8").replace(/\s+$/, "") + "\n";
};

const css = manifest.css.map(read).join("\n");
const js = manifest.js.map(read).join("\n");
const tpl = fs.readFileSync(path.join(src, "index.template.html"), "utf8");
const html = tpl.replace("/*__CSS__*/", () => css).replace("/*__JS__*/", () => js);

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(path.join(root, "public", "index.html"), html);
console.log(`built public/index.html (${(html.length / 1024).toFixed(0)} KB, ${manifest.js.length} js + ${manifest.css.length} css files)`);
