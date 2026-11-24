// Keeps the server's curriculum rules in sync with the lessons in the app,
// and checks every question is well formed.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { UNIT_IDS, LEVELS, ITEMS_PER_LEVEL, parseItem } from "../server/curriculum.mjs";

const read = (f) => fs.readFileSync(new URL("../src/js/" + f, import.meta.url), "utf8");
const code = `const VIS=new Proxy({},{get:()=>()=>''});const LVK=['b','i','x'];
${read("content/30-units.js")}
${read("content/31-curriculum-extra.js")}
globalThis.UNITS=UNITS;`;
const ctx = {}; vm.createContext(ctx); vm.runInContext(code, ctx);
const UNITS = ctx.UNITS;

test("unit ids match the server", () => {
  assert.deepEqual(Array.from(UNITS, (u) => u.id), UNIT_IDS);
});

test("every level has 3 lessons, a chapter and a video per unit", () => {
  let steps = 0;
  for (const u of UNITS) for (const k of LEVELS) {
    assert.equal(u.lv[k].length, 3, `${u.id}/${k}`);
    assert.ok(u.book[k] && u.book[k].pages.length >= 3, `${u.id}/${k} chapter`);
    assert.ok(u.vid[k] && u.vid[k].length >= 4, `${u.id}/${k} video`);
    steps += 2 + u.lv[k].length;
  }
  assert.equal(steps / LEVELS.length, ITEMS_PER_LEVEL);
});

test("every lesson id is accepted by the server", () => {
  for (const u of UNITS) for (const k of LEVELS) {
    u.lv[k].forEach((l, i) => {
      const p = parseItem(l.id);
      assert.ok(p, l.id);
      assert.equal(p.unit, u.id); assert.equal(p.level, k);
      assert.equal(p.kind, i === 2 ? "challenge" : "lesson");
    });
    assert.ok(parseItem(`book-${u.id}-${k}`)); assert.ok(parseItem(`vid-${u.id}-${k}`));
  }
});

test("every question is well formed", () => {
  let n = 0;
  for (const u of UNITS) for (const k of LEVELS) for (const l of u.lv[k]) for (const q of l.qs) {
    n++;
    assert.ok(q.why, `${l.id}: explanation missing`);
    if (q.t === "choice") assert.ok(q.a >= 0 && q.a < q.opts.length, l.id);
    if (q.t === "tf") assert.equal(typeof q.a, "boolean", l.id);
    if (q.t === "fill") { assert.ok(q.q.includes("___"), l.id); assert.ok(q.a >= 0 && q.a < q.bank.length, l.id); }
    if (q.t === "sort") for (const it of q.items) assert.ok(it[1] >= 0 && it[1] < q.zones.length, l.id);
    if (q.t === "match") assert.ok(q.pairs.length >= 2, l.id);
  }
  assert.equal(n, 276);
});
