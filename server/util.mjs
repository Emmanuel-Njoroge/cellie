// Small shared helpers: responses, ids, hashing, input cleaning.
const enc = new TextEncoder();
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
export const fail = (code, s = 400) => json({ error: code }, s);
export class HttpError extends Error { constructor(code, status = 400) { super(code); this.status = status; } }
export const bad = (code, status = 400) => { throw new HttpError(code, status); };

export const rnd = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map((v) => ALPHA[v % ALPHA.length]).join(""); };
export const newId = (n = 10) => rnd(n);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
export async function slowHash(secret, salt) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 60000, hash: "SHA-256" }, k, 256));
}
export const fastHash = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
export const safeEq = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0;
};

export const normCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
export const normKey = (k) => String(k || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
export const fmtCode = (c) => c.slice(0, 3) + "-" + c.slice(3);
export const fmtKey = (k) => k.match(/.{1,4}/g).join("-");
export const cleanText = (s, n) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, n);
export const nickKey = (n) => cleanText(n, 24).toLowerCase();
export const num = (v, max = 1e7, min = 0) => { v = Number(v); return Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : min; };
export const isDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d || "")) && !Number.isNaN(Date.parse(d + "T00:00:00Z"));
export const todayUtc = () => new Date().toISOString().slice(0, 10);
// Accept a client-supplied local calendar day only if it is within 2 days of server time.
export function safeDay(d) {
  if (!isDay(d)) return todayUtc();
  const diff = Math.abs(Date.parse(d + "T00:00:00Z") - Date.parse(todayUtc() + "T00:00:00Z")) / 864e5;
  return diff <= 2 ? d : todayUtc();
}
export const addDays = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export const mondayOf = (d) => { const x = new Date(d + "T00:00:00Z"); return addDays(d, -((x.getUTCDay() + 6) % 7)); };

const MAX_BODY = 200_000;
export async function readBody(req) {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BODY) bad("too_large", 413);
  const text = await req.text();
  if (text.length > MAX_BODY) bad("too_large", 413);
  try { return text ? JSON.parse(text) : {}; } catch { return bad("bad_json", 400); }
}

export function csv(rows, header) {
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [header.map(q).join(","), ...rows.map((r) => r.map(q).join(","))].join("\n");
}
