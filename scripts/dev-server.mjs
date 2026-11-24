// Local server with no Netlify account needed: serves public/ and runs the API against an
// in-memory Postgres (PGlite) with the real migrations. Data is lost when you stop it.
//   npm run dev:local   ->   http://localhost:8888
// For the real Netlify setup use `npm run dev` (needs the Netlify CLI).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeDb } from "../tests/helpers/pg.mjs";
import { setDb } from "../server/db.mjs";
import { handle } from "../server/router.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(root, "public");
const PORT = Number(process.env.PORT || 8888);
setDb(await makeDb());

http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      const chunks = []; for await (const c of req) chunks.push(c);
      const r = await handle(new Request(`http://localhost:${PORT}${req.url}`, {
        method: req.method, headers: { "content-type": "application/json" },
        body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
      }));
      res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(await r.text()); return;
    }
    const f = path.join(PUB, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
    if (!f.startsWith(PUB) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": f.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
    res.end(fs.readFileSync(f));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}).listen(PORT, () => console.log(`Cellie running at http://localhost:${PORT} (in-memory database)`));
