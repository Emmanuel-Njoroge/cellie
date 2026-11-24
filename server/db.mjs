// Database access. Production uses Netlify Database (Postgres) through @netlify/database.
// Tests and the local dev server inject a PGlite adapter with the same shape via setDb().
//
//   db().query(text, params)      -> rows[]
//   db().tx(async (q) => { ... }) -> runs several queries in one transaction, q(text, params) -> rows[]
import { getDatabase } from "@netlify/database";

let impl = null;
export const setDb = (adapter) => { impl = adapter; };

export function db() {
  if (impl) return impl;
  const nd = getDatabase();
  impl = {
    async query(text, params = []) {
      const res = await nd.pool.query(text, params);
      return res.rows;
    },
    async tx(fn) {
      const client = await nd.pool.connect();
      try {
        await client.query("BEGIN");
        const out = await fn(async (text, params = []) => (await client.query(text, params)).rows);
        await client.query("COMMIT");
        return out;
      } catch (e) {
        try { await client.query("ROLLBACK"); } catch { /* ignore */ }
        throw e;
      } finally {
        client.release();
      }
    },
  };
  return impl;
}
