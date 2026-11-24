// API tests: every route runs against a real Postgres engine (PGlite) with the real migrations.
import test from "node:test";
import assert from "node:assert/strict";
import { makeDb } from "./helpers/pg.mjs";
import { setDb } from "../server/db.mjs";
import { handle } from "../server/router.mjs";

const database = await makeDb();
setDb(database);
const call = async (path, body) => {
  const r = await handle(new Request("http://x/api/" + path, body === undefined ? { method: "GET" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  return { s: r.status, j: await r.json() };
};
const TODAY = new Date().toISOString().slice(0, 10);
const monday = (() => { const d = new Date(TODAY + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); })();
const answersFor = (n, wrong = []) => Array.from({ length: n }, (_, i) => ({ i, t: "choice", ok: !wrong.includes(i), r: false }));

let teacher, cls, A, B;

test("ping reports the database is reachable", async () => {
  const r = await call("ping");
  assert.equal(r.s, 200); assert.equal(r.j.db, true);
});

test("teacher creates a class (new teacher key, class code)", async () => {
  const r = await call("teacher/create", { name: "Period 3 Biology" });
  assert.equal(r.s, 200);
  assert.match(r.j.code, /^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
  assert.match(r.j.teacherKey, /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/);
  teacher = r.j.teacherKey; cls = r.j.code;
  const l = await call("teacher/login", { key: teacher.toLowerCase() });
  assert.equal(l.s, 200); assert.equal(l.j.classes.length, 1); assert.equal(l.j.classes[0].name, "Period 3 Biology");
  assert.equal((await call("teacher/login", { key: "AAAA-BBBB-CCCC-DDDD" })).s, 401);
});

test("the same teacher key can own several classes", async () => {
  const r = await call("teacher/create", { name: "Period 5", key: teacher });
  assert.equal(r.s, 200); assert.equal(r.j.teacherKey, undefined);
  const l = await call("teacher/login", { key: teacher });
  assert.equal(l.j.classes.length, 2);
});

test("students register, names are unique, PIN format enforced", async () => {
  let r = await call("student/register", { code: cls, nick: "Brave Otter 21", avatar: "🦦", pin: "1234", level: "i" });
  assert.equal(r.s, 200); A = r.j;
  assert.equal((await call("student/register", { code: cls, nick: "brave otter 21", pin: "1234" })).s, 409);
  assert.equal((await call("student/register", { code: cls, nick: "Kind Panda 12", pin: "12" })).s, 400);
  r = await call("student/register", { code: cls, nick: "Kind Panda 12", avatar: "🐼", pin: "9876", level: "b" });
  assert.equal(r.s, 200); B = r.j;
  assert.equal((await call("class/join", { code: "zzz-zzz" })).s, 404);
});

test("a finished lesson: points are computed by the server and every table is updated", async () => {
  const r = await call("student/attempt", { code: cls, id: A.id, token: A.token, attempt: {
    clientId: "attempt-0001", itemId: "cells-i-1", total: 5, firstTry: 99 /* ignored: the answer log decides */, completed: true,
    hearts: 2, durationSec: 150, startedAt: Date.now() - 150000, day: TODAY, answers: [...answersFor(5, [3]), { i: 3, t: "choice", ok: true, r: true }] } });
  assert.equal(r.s, 200);
  assert.equal(r.j.points, (4 * 2 + 5) * 2, "4 first-try correct at Intermediate level = (8+5)*2");
  assert.equal(r.j.stars, 2, "80% accuracy earns 2 stars");
  const [lp] = await database.query(`SELECT completed, attempts, best_accuracy::float8 AS acc, points_total FROM lesson_progress WHERE student_id=$1 AND item_id='cells-i-1'`, [A.id]);
  assert.deepEqual({ completed: lp.completed, attempts: lp.attempts, acc: lp.acc, pts: lp.points_total }, { completed: true, attempts: 1, acc: 0.8, pts: 26 });
  const [an] = await database.query(`SELECT COUNT(*)::int AS n, COUNT(*) FILTER (WHERE is_retry)::int AS retries FROM answers WHERE student_id=$1`, [A.id]);
  assert.deepEqual(an, { n: 6, retries: 1 });
  const [d] = await database.query(`SELECT answers, correct, points, lessons_completed FROM daily_activity WHERE student_id=$1`, [A.id]);
  assert.deepEqual(d, { answers: 6, correct: 5, points: 26, lessons_completed: 1 });
});

test("retrying the same request does not double count (idempotent)", async () => {
  const body = { code: cls, id: A.id, token: A.token, attempt: { clientId: "attempt-0001", itemId: "cells-i-1", total: 5, completed: true, day: TODAY, answers: answersFor(5) } };
  const r = await call("student/attempt", body);
  assert.equal(r.j.duplicate, true);
  const [n] = await database.query(`SELECT COUNT(*)::int AS n FROM attempts WHERE student_id=$1`, [A.id]);
  assert.equal(n.n, 1);
});

test("a lesson that ended with no hearts is recorded but earns no points or completion", async () => {
  const r = await call("student/attempt", { code: cls, id: A.id, token: A.token, attempt: { clientId: "attempt-0002", itemId: "heart-i-1", total: 5, completed: false, hearts: 0, day: TODAY, answers: answersFor(3, [0, 1, 2]) } });
  assert.equal(r.j.points, 0);
  const [lp] = await database.query(`SELECT completed, attempts FROM lesson_progress WHERE student_id=$1 AND item_id='heart-i-1'`, [A.id]);
  assert.deepEqual({ c: lp.completed, a: lp.attempts }, { c: false, a: 1 });
});

test("chapters and videos award points once", async () => {
  let r = await call("student/item", { code: cls, id: A.id, token: A.token, item: { itemId: "book-cells-i", seconds: 120, day: TODAY } });
  assert.equal(r.j.points, 10);
  r = await call("student/item", { code: cls, id: A.id, token: A.token, item: { itemId: "book-cells-i", seconds: 60, day: TODAY } });
  assert.equal(r.j.points, 0, "replay earns nothing");
  const [lp] = await database.query(`SELECT attempts, seconds_total FROM lesson_progress WHERE student_id=$1 AND item_id='book-cells-i'`, [A.id]);
  assert.deepEqual({ a: lp.attempts, s: lp.seconds_total }, { a: 2, s: 180 });
});

test("invalid curriculum items are rejected", async () => {
  const bad = await call("student/attempt", { code: cls, id: A.id, token: A.token, attempt: { clientId: "attempt-9999", itemId: "../../etc", total: 5, completed: true } });
  assert.equal(bad.s, 400);
  assert.equal((await call("student/item", { code: cls, id: A.id, token: A.token, item: { itemId: "cells-i-1" } })).s, 400);
});

test("minutes tracked: pings are capped so time cannot be inflated", async () => {
  const sess = "session-abc123";
  let r = await call("student/activity", { code: cls, id: A.id, token: A.token, sessionId: sess, delta: 20, level: "i", day: TODAY, act: "Reading" });
  assert.equal(r.j.counted, 20);
  r = await call("student/activity", { code: cls, id: A.id, token: A.token, sessionId: sess, delta: 20, level: "i", day: TODAY });
  assert.ok(r.j.counted <= 5, "second ping arrives immediately, so almost nothing is counted: " + r.j.counted);
  r = await call("student/activity", { code: cls, id: A.id, token: A.token, sessionId: "session-xyz987", delta: 9999, level: "i", day: TODAY });
  assert.equal(r.j.counted, 40, "a huge delta is capped at 40 seconds");
  const [d] = await database.query(`SELECT active_seconds FROM daily_activity WHERE student_id=$1`, [A.id]);
  const [s] = await database.query(`SELECT SUM(active_seconds)::int AS n FROM activity_sessions WHERE student_id=$1`, [A.id]);
  assert.equal(s.n, d.active_seconds, "sessions and daily totals agree");
  assert.ok(d.active_seconds >= 60 && d.active_seconds <= 65);
});

test("student progress report reads back from the database", async () => {
  await call("student/save", { code: cls, id: A.id, token: A.token, state: { level: "i", badges: ["first", "perfect"], nick: "Brave Otter 21" } });
  const r = await call("student/progress", { code: cls, id: A.id, token: A.token, today: TODAY, weekStart: monday });
  assert.equal(r.s, 200);
  assert.equal(r.j.totals.points.i, 26 + 10);
  assert.ok(r.j.totals.seconds >= 60);
  assert.equal(r.j.totals.firstTryAnswers, 8);       // 5 from the first attempt + 3 from the failed one
  assert.equal(r.j.totals.firstTryCorrect, 4);
  assert.equal(r.j.totals.completion, Math.round((2 / 30) * 100));
  assert.deepEqual(r.j.badges.sort(), ["first", "perfect"]);
  assert.equal(r.j.recent.length, 2);
  assert.equal(r.j.items.length, 3);
  assert.equal((await call("student/progress", { code: cls, id: A.id, token: B.token })).s, 401, "another student's token is rejected");
});

test("class board is built from SQL and includes live status", async () => {
  await call("student/live", { code: cls, id: A.id, token: A.token, live: { act: "Cells: Inside the cell", qa: 2, qt: 5, sp: 30, ok: 6, tot: 8, run: 3 } });
  const r = await call("class/board", { code: cls, weekStart: monday });
  assert.equal(r.s, 200); assert.equal(r.j.students.length, 2);
  const a = r.j.students.find((s) => s.id === A.id);
  assert.equal(a.total, 36); assert.equal(a.wt, 9, "6 answers from the lesson + 3 from the failed run"); assert.equal(a.wc, 5);
  assert.equal(a.live.act, "Cells: Inside the cell"); assert.ok(r.j.now - a.live.ts < 5000);
  await call("student/live", { code: cls, id: A.id, token: A.token, off: true });
  const r2 = await call("class/board", { code: cls, weekStart: monday });
  assert.ok(r2.j.now - r2.j.students.find((s) => s.id === A.id).live.ts > 3600e3, "offline is far in the past");
});

test("logging in on a new device restores saved state; wrong PINs lock the account", async () => {
  const r = await call("student/login", { code: cls, nick: "brave otter 21", pin: "1234" });
  assert.equal(r.s, 200); assert.equal(r.j.state.level, "i"); assert.equal(r.j.nick, "Brave Otter 21");
  assert.equal((await call("student/login", { code: cls, nick: "Brave Otter 21", pin: "0000" })).s, 401);
  for (let i = 0; i < 8; i++) await call("student/login", { code: cls, nick: "Kind Panda 12", pin: "1111" });
  assert.equal((await call("student/login", { code: cls, nick: "Kind Panda 12", pin: "9876" })).s, 429);
});

test("teacher overview: minutes, completion, accuracy, hardest questions", async () => {
  for (let i = 0; i < 4; i++) {
    const r = await call("student/register", { code: cls, nick: "Extra Fox " + (10 + i), pin: "4444", level: "i" });
    await call("student/attempt", { code: cls, id: r.j.id, token: r.j.token, attempt: { clientId: "extra-attempt-" + i, itemId: "cells-i-2", total: 5, completed: true, day: TODAY, answers: answersFor(5, [1]) } });
  }
  const r = await call("teacher/overview", { key: teacher, code: cls, today: TODAY, weekStart: monday });
  assert.equal(r.s, 200);
  assert.equal(r.j.students.length, 6);
  const a = r.j.students.find((s) => s.id === A.id);
  assert.equal(a.total, 36); assert.ok(a.secs >= 60); assert.equal(a.attempts, 2); assert.equal(a.lessons, 1);
  assert.deepEqual(r.j.days.map((d) => d.day), [TODAY]);
  const hardest = r.j.hardest[0];
  assert.deepEqual({ item: hardest.item_id, q: hardest.q_index, misses: hardest.misses, tries: hardest.first_tries }, { item: "cells-i-2", q: 1, misses: 4, tries: 4 });
  const topic = r.j.topics.find((t) => t.unit_id === "cells");
  assert.ok(topic.total > 0 && topic.correct <= topic.total);
  assert.equal((await call("teacher/overview", { key: "AAAA-BBBB-CCCC-DDDD", code: cls })).s, 401);
});

test("reporting views agree with the API (cross-check)", async () => {
  const ov = await call("teacher/overview", { key: teacher, code: cls, today: TODAY, weekStart: monday });
  const [t] = await database.query(`SELECT points_total, active_seconds, lessons_done, items_done FROM v_student_totals WHERE student_id=$1`, [A.id]);
  const a = ov.j.students.find((s) => s.id === A.id);
  assert.equal(t.points_total, a.total); assert.equal(t.active_seconds, a.secs); assert.equal(t.lessons_done, a.lessons); assert.equal(t.items_done, a.items);
  const [cd] = await database.query(`SELECT SUM(active_seconds)::int AS s FROM v_class_daily WHERE class_id=(SELECT id FROM classes WHERE code=$1)`, [cls.replace("-", "")]);
  assert.equal(cd.s, ov.j.students.reduce((n, s) => n + s.secs, 0), "class minutes = sum of student minutes");
});

test("teacher student detail", async () => {
  const r = await call("teacher/student", { key: teacher, code: cls, id: A.id, today: TODAY });
  assert.equal(r.s, 200);
  assert.equal(r.j.attempts.length, 2); assert.equal(r.j.items.length, 3); assert.equal(r.j.student.pi, 36);
  assert.equal((await call("teacher/student", { key: teacher, code: cls, id: "NOPE" })).s, 404);
  // timestamps reach the browser as numbers (milliseconds), so dates display correctly
  for (const v of [r.j.student.created_ms, r.j.student.last_ms, r.j.attempts[0].at_ms, r.j.items[0].last_ms]) assert.equal(typeof v, "number");
  const ov = await call("teacher/overview", { key: teacher, code: cls, today: TODAY, weekStart: monday });
  assert.equal(typeof ov.j.now, "number"); assert.equal(typeof ov.j.students[0].last_ms, "number");
});

test("management actions work and are written to the audit log", async () => {
  assert.equal((await call("teacher/rename", { key: teacher, code: cls, name: "Period 3 Bio" })).s, 200);
  assert.equal((await call("teacher/resetpin", { key: teacher, code: cls, id: B.id, pin: "5555" })).s, 200);
  assert.equal((await call("student/me", { code: cls, id: B.id, token: B.token })).s, 401, "old sessions revoked");
  assert.equal((await call("student/login", { code: cls, nick: "Kind Panda 12", pin: "5555" })).s, 200, "lock cleared, new PIN works");
  assert.equal((await call("teacher/remove", { key: teacher, code: cls, id: B.id })).s, 200);
  const b2 = await call("class/board", { code: cls, weekStart: monday });
  assert.ok(!b2.j.students.find((s) => s.id === B.id), "removed student is gone from the board");
  const [kept] = await database.query(`SELECT removed_at IS NOT NULL AS removed FROM students WHERE id=$1`, [B.id]);
  assert.equal(kept.removed, true, "soft delete: the row is kept");
  assert.equal((await call("student/register", { code: cls, nick: "Kind Panda 12", pin: "4444" })).s, 200, "name is free again");
  const log = await call("teacher/audit", { key: teacher, code: cls });
  assert.deepEqual(log.j.entries.map((e) => e.action).slice(0, 3), ["student.removed", "student.pin_reset", "class.renamed"]);
});

test("archiving blocks student writes and joins, and can be undone", async () => {
  await call("teacher/archive", { key: teacher, code: cls, archived: true });
  assert.equal((await call("class/join", { code: cls })).s, 403);
  assert.equal((await call("student/activity", { code: cls, id: A.id, token: A.token, sessionId: "session-arch1", delta: 10 })).s, 403);
  assert.equal((await call("student/progress", { code: cls, id: A.id, token: A.token })).s, 200, "reading still works");
  await call("teacher/archive", { key: teacher, code: cls, archived: false });
  assert.equal((await call("class/join", { code: cls })).s, 200);
});

test("CSV exports", async () => {
  for (const kind of ["students", "attempts", "minutes"]) {
    const r = await call("teacher/export", { key: teacher, code: cls, kind });
    assert.equal(r.s, 200); assert.match(r.j.filename, /period-3-bio-.*\.csv$/);
    assert.ok(r.j.csv.split("\n").length >= 2, kind + " has rows");
  }
  const st = await call("teacher/export", { key: teacher, code: cls, kind: "students" });
  assert.match(st.j.csv, /Brave Otter 21/);
});

test("a student can only be reached through their own class and teacher", async () => {
  const other = await call("teacher/create", { name: "Someone else's class" });
  assert.equal((await call("teacher/student", { key: other.j.teacherKey, code: cls, id: A.id })).s, 404, "other teacher cannot open this class");
  assert.equal((await call("teacher/export", { key: other.j.teacherKey, code: cls })).s, 404);
});

test("a student leaving deletes all of their data", async () => {
  assert.equal((await call("student/leave", { code: cls, id: A.id, token: A.token })).s, 200);
  for (const t of ["attempts", "answers", "lesson_progress", "daily_activity", "activity_sessions", "student_state", "student_badges"]) {
    const [n] = await database.query(`SELECT COUNT(*)::int AS n FROM ${t} WHERE student_id=$1`, [A.id]);
    assert.equal(n.n, 0, t + " emptied");
  }
});

test("the signup code can protect class creation", async () => {
  process.env.TEACHER_SIGNUP_CODE = "SCHOOL25";
  assert.equal((await call("teacher/create", { name: "Sneaky" })).s, 403);
  assert.equal((await call("teacher/create", { name: "Allowed", signup: "SCHOOL25" })).s, 200);
  assert.equal((await call("teacher/create", { name: "Another class", key: teacher })).s, 200, "signed-in teachers do not need the code");
  delete process.env.TEACHER_SIGNUP_CODE;
});

test("routing: unknown routes and wrong methods", async () => {
  assert.equal((await call("nope", {})).s, 404);
  assert.equal((await call("class/board")).s, 405);
});
