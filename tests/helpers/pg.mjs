// Test helper: an in-memory Postgres (PGlite) with the real migrations applied.
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATIONS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../netlify/database/migrations");

export function migrationFiles() {
  return fs.readdirSync(MIGRATIONS, { withFileTypes: true })
    .map((e) => (e.isDirectory() ? path.join(MIGRATIONS, e.name, "migration.sql") : e.name.endsWith(".sql") ? path.join(MIGRATIONS, e.name) : null))
    .filter(Boolean).sort();
}

export async function makeDb() {
  const pg = new PGlite();
  for (const f of migrationFiles()) await pg.exec(fs.readFileSync(f, "utf8"));
  return {
    raw: pg,
    async query(text, params = []) { return (await pg.query(text, params)).rows; },
    async tx(fn) { return pg.transaction(async (t) => fn(async (text, params = []) => (await t.query(text, params)).rows)); },
  };
}
