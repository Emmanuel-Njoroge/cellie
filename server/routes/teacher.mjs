// Teacher routes: accounts, classes, dashboards, student management, audit log, exports.
import { db } from "../db.mjs";
import { authTeacher, authTeacherClass, audit } from "../auth.mjs";
import { ITEMS_PER_LEVEL } from "../curriculum.mjs";
import { bad, cleanText, newId, rnd, slowHash, fmtCode, fmtKey, normKey, json, isDay, safeDay, addDays, mondayOf, csv } from "../util.mjs";

const ACTIVE_SECONDS = 45;

/* ---------- accounts and classes ---------- */
// Without a key: creates a new teacher account and its first class, and returns the teacher key once.
// With a key: adds another class to that teacher.
export async function create(b) {
  const name = cleanText(b.name, 40);
  if (name.length < 2) bad("name_required");
  let teacher = null;
  if (normKey(b.key).length) teacher = await authTeacher(b);
  else {
    const need = process.env.TEACHER_SIGNUP_CODE;
    if (need && String(b.signup || "").trim() !== need) bad("bad_signup", 403);
  }
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = rnd(6), classId = newId(10);
    try {
      const newKey = await db().tx(async (q) => {
        let tid = teacher && teacher.id, key = null;
        if (!tid) {
          tid = newId(10);
          const keyId = rnd(4), secret = rnd(12), salt = rnd(16);
          await q(`INSERT INTO teachers (id, key_id, key_salt, key_hash) VALUES ($1,$2,$3,$4)`, [tid, keyId, salt, await slowHash(secret, salt)]);
          key = keyId + secret;
        }
        await q(`INSERT INTO classes (id, code, teacher_id, name) VALUES ($1,$2,$3,$4)`, [classId, code, tid, name]);
        await audit(q, { teacherId: tid, classId, action: "class.created", detail: { name } });
        return key;
      });
      return json({ code: fmtCode(code), name, ...(newKey ? { teacherKey: fmtKey(newKey) } : {}) });
    } catch (e) {
      if (e && e.code === "23505") continue;   // code or key collision: try again
      throw e;
    }
  }
  return bad("try_again", 503);
}

export async function login(b) {
  const t = await authTeacher(b);
  await db().query(`UPDATE teachers SET last_login_at = now() WHERE id = $1`, [t.id]);
  const classes = await db().query(
    `SELECT c.code, c.name, (c.archived_at IS NOT NULL) AS archived,
            (SELECT COUNT(*)::int FROM students s WHERE s.class_id = c.id AND s.removed_at IS NULL) AS students,
            (SELECT COUNT(*)::int FROM live_status l JOIN students s ON s.id = l.student_id AND s.removed_at IS NULL
              WHERE l.class_id = c.id AND l.updated_at > now() - ($2 || ' seconds')::interval) AS active
       FROM classes c WHERE c.teacher_id = $1
      ORDER BY (c.archived_at IS NOT NULL), c.created_at DESC`, [t.id, String(ACTIVE_SECONDS)]);
  return json({ classes: classes.map((c) => ({ ...c, code: fmtCode(c.code) })) });
}

/* ---------- class dashboard ---------- */
export async function overview(b) {
  const { cls } = await authTeacherClass(b);
  const today = safeDay(b.today);
  const weekStart = isDay(b.weekStart) ? b.weekStart : mondayOf(today);
  const since14 = addDays(today, -13);
  const students = await db().query(
    `SELECT s.id, s.nick, s.avatar, s.level, (s.pts_b + s.pts_i + s.pts_x)::int AS total,
            COALESCE(t.secs,0)::int AS secs, COALESCE(t.wsecs,0)::int AS wsecs,
            COALESCE(t.wanswers,0)::int AS wt, COALESCE(t.wcorrect,0)::int AS wc, COALESCE(t.days14,0)::int AS days14,
            COALESCE(p.done_level,0)::int AS done_level, COALESCE(p.lessons,0)::int AS lessons, COALESCE(p.items,0)::int AS items,
            COALESCE(a.n,0)::int AS attempts,
            (extract(epoch from s.last_seen_at)*1000)::float8 AS last_ms,
            (extract(epoch from l.updated_at)*1000)::float8 AS live_ms, l.activity, l.qa::int, l.qt::int
       FROM students s
       LEFT JOIN (SELECT student_id, SUM(active_seconds) AS secs,
                         SUM(active_seconds) FILTER (WHERE day >= $2::date) AS wsecs,
                         SUM(answers) FILTER (WHERE day >= $2::date) AS wanswers,
                         SUM(correct) FILTER (WHERE day >= $2::date) AS wcorrect,
                         COUNT(*) FILTER (WHERE day >= $3::date AND active_seconds > 0) AS days14
                    FROM daily_activity WHERE class_id = $1 GROUP BY student_id) t ON t.student_id = s.id
       LEFT JOIN (SELECT lp.student_id,
                         COUNT(*) FILTER (WHERE lp.completed AND lp.level = s2.level) AS done_level,
                         COUNT(*) FILTER (WHERE lp.completed AND lp.kind IN ('lesson','challenge')) AS lessons,
                         COUNT(*) FILTER (WHERE lp.completed) AS items
                    FROM lesson_progress lp JOIN students s2 ON s2.id = lp.student_id
                   WHERE s2.class_id = $1 GROUP BY lp.student_id) p ON p.student_id = s.id
       LEFT JOIN (SELECT student_id, COUNT(*) AS n FROM attempts WHERE class_id = $1 GROUP BY student_id) a ON a.student_id = s.id
       LEFT JOIN live_status l ON l.student_id = s.id
      WHERE s.class_id = $1 AND s.removed_at IS NULL
      ORDER BY s.nick`, [cls.id, weekStart, since14]);
  const days = await db().query(
    `SELECT to_char(day,'YYYY-MM-DD') AS day, SUM(active_seconds)::int AS seconds,
            COUNT(*) FILTER (WHERE active_seconds > 0)::int AS students, SUM(lessons_completed)::int AS lessons,
            SUM(answers)::int AS answers, SUM(correct)::int AS correct
       FROM daily_activity WHERE class_id = $1 AND day >= $2::date GROUP BY day ORDER BY day`, [cls.id, since14]);
  const topics = await db().query(
    `SELECT unit_id, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE correct)::int AS correct
       FROM answers WHERE class_id = $1 AND NOT is_retry GROUP BY unit_id ORDER BY unit_id`, [cls.id]);
  const hardest = await db().query(
    `SELECT item_id, unit_id, level, q_index::int, first_tries, misses, miss_rate::float8 AS miss_rate
       FROM v_question_difficulty WHERE class_id = $1 AND first_tries >= 4 AND misses > 0
      ORDER BY miss_rate DESC, first_tries DESC LIMIT 8`, [cls.id]);
  const [now] = await db().query(`SELECT (extract(epoch from now())*1000)::float8 AS ms`);
  return json({
    class: { name: cls.name, code: fmtCode(cls.code), archived: !!cls.archived_at },
    now: now.ms, activeMs: ACTIVE_SECONDS * 1000, itemsPerLevel: ITEMS_PER_LEVEL, weekStart, today,
    students: students.map((s) => ({
      ...s, comp: Math.min(100, Math.round((s.done_level / ITEMS_PER_LEVEL) * 100)),
      live: s.live_ms != null ? { ts: s.live_ms, act: s.activity, qa: s.qa, qt: s.qt } : null,
    })),
    days, topics, hardest,
  });
}

export async function student(b) {
  const { cls } = await authTeacherClass(b);
  const today = safeDay(b.today);
  const [s] = await db().query(
    `SELECT id, nick, avatar, level, pts_b::int AS pb, pts_i::int AS pi, pts_x::int AS px,
            (extract(epoch from created_at)*1000)::float8 AS created_ms, (extract(epoch from last_seen_at)*1000)::float8 AS last_ms
       FROM students WHERE id = $1 AND class_id = $2 AND removed_at IS NULL`, [cleanText(b.id, 16), cls.id]);
  if (!s) bad("not_found", 404);
  const [tot] = await db().query(
    `SELECT COALESCE(SUM(active_seconds),0)::int AS secs, COUNT(*) FILTER (WHERE active_seconds > 0)::int AS days_active
       FROM daily_activity WHERE student_id = $1`, [s.id]);
  const [sess] = await db().query(`SELECT COUNT(*)::int AS n FROM activity_sessions WHERE student_id = $1 AND active_seconds > 0`, [s.id]);
  const days = await db().query(
    `SELECT to_char(day,'YYYY-MM-DD') AS day, active_seconds::int AS seconds, points::int AS points, answers::int AS answers,
            correct::int AS correct, lessons_completed::int AS lessons
       FROM daily_activity WHERE student_id = $1 AND day >= $2::date - 29 ORDER BY day`, [s.id, today]);
  const topics = await db().query(
    `SELECT unit_id, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE correct)::int AS correct
       FROM answers WHERE student_id = $1 AND NOT is_retry GROUP BY unit_id ORDER BY unit_id`, [s.id]);
  const items = await db().query(
    `SELECT item_id, kind, unit_id, level, completed, attempts::int, best_accuracy::float8 AS best_accuracy, best_stars::int,
            points_total::int, seconds_total::int, (extract(epoch from last_activity_at)*1000)::float8 AS last_ms
       FROM lesson_progress WHERE student_id = $1 ORDER BY level, item_id`, [s.id]);
  const attempts = await db().query(
    `SELECT item_id, kind, unit_id, level, completed, points::int, duration_seconds::int AS seconds, accuracy::float8 AS accuracy,
            questions_total::int AS total, hearts_left::int AS hearts, (extract(epoch from finished_at)*1000)::float8 AS at_ms
       FROM attempts WHERE student_id = $1 ORDER BY finished_at DESC LIMIT 40`, [s.id]);
  const badges = await db().query(`SELECT badge_id FROM student_badges WHERE student_id = $1 ORDER BY earned_at`, [s.id]);
  return json({ student: s, totals: { seconds: tot.secs, daysActive: tot.days_active, sessions: sess.n }, days, topics, items, attempts, badges: badges.map((r) => r.badge_id) });
}

/* ---------- management actions (all audited) ---------- */
async function findStudent(cls, id) {
  const [s] = await db().query(`SELECT id, nick FROM students WHERE id = $1 AND class_id = $2 AND removed_at IS NULL`, [cleanText(id, 16), cls.id]);
  if (!s) bad("not_found", 404);
  return s;
}
export async function rename(b) {
  const { teacher, cls } = await authTeacherClass(b);
  const name = cleanText(b.name, 40);
  if (name.length < 2) bad("name_required");
  await db().tx(async (q) => {
    await q(`UPDATE classes SET name = $2 WHERE id = $1`, [cls.id, name]);
    await audit(q, { teacherId: teacher.id, classId: cls.id, action: "class.renamed", detail: { from: cls.name, to: name } });
  });
  return json({ ok: true, name });
}
export async function archive(b) {
  const { teacher, cls } = await authTeacherClass(b);
  const on = !!b.archived;
  await db().tx(async (q) => {
    await q(`UPDATE classes SET archived_at = CASE WHEN $2 THEN now() ELSE NULL END WHERE id = $1`, [cls.id, on]);
    await audit(q, { teacherId: teacher.id, classId: cls.id, action: on ? "class.archived" : "class.restored" });
  });
  return json({ ok: true, archived: on });
}
export async function resetPin(b) {
  const { teacher, cls } = await authTeacherClass(b);
  if (!/^\d{4}$/.test(String(b.pin || ""))) bad("pin_format");
  const s = await findStudent(cls, b.id);
  const salt = rnd(16), hash = await slowHash(String(b.pin), salt);
  await db().tx(async (q) => {
    await q(`UPDATE students SET pin_salt = $2, pin_hash = $3, failed_attempts = 0, locked_until = NULL WHERE id = $1`, [s.id, salt, hash]);
    await q(`DELETE FROM student_tokens WHERE student_id = $1`, [s.id]);       // sign out every device
    await audit(q, { teacherId: teacher.id, classId: cls.id, action: "student.pin_reset", target: s.id, detail: { nick: s.nick } });
  });
  return json({ ok: true });
}
// Soft delete: the student disappears from the class and cannot log in, but their records stay in the database.
export async function remove(b) {
  const { teacher, cls } = await authTeacherClass(b);
  const s = await findStudent(cls, b.id);
  await db().tx(async (q) => {
    await q(`UPDATE students SET removed_at = now() WHERE id = $1`, [s.id]);
    await q(`DELETE FROM student_tokens WHERE student_id = $1`, [s.id]);
    await q(`DELETE FROM live_status WHERE student_id = $1`, [s.id]);
    await audit(q, { teacherId: teacher.id, classId: cls.id, action: "student.removed", target: s.id, detail: { nick: s.nick } });
  });
  return json({ ok: true });
}
export async function auditLog(b) {
  const { cls } = await authTeacherClass(b);
  const rows = await db().query(
    `SELECT action, target, detail, (extract(epoch from created_at)*1000)::float8 AS ms FROM audit_log
      WHERE class_id = $1 ORDER BY created_at DESC, id DESC LIMIT 60`, [cls.id]);
  return json({ entries: rows });
}

/* ---------- CSV exports ---------- */
export async function exportCsv(b) {
  const { cls } = await authTeacherClass(b);
  const kind = String(b.kind || "students");
  const stem = cls.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "class";
  if (kind === "attempts") {
    const rows = await db().query(
      `SELECT s.nick, a.item_id, a.kind, a.unit_id, a.level, to_char(a.finished_at,'YYYY-MM-DD HH24:MI') AS finished,
              a.duration_seconds, a.questions_total, a.first_try_correct, a.accuracy::float8 AS accuracy, a.hearts_left, a.completed, a.points
         FROM attempts a JOIN students s ON s.id = a.student_id WHERE a.class_id = $1 ORDER BY a.finished_at`, [cls.id]);
    return json({ filename: `${stem}-attempts.csv`, csv: csv(rows.map((r) => [r.nick, r.item_id, r.kind, r.unit_id, r.level, r.finished, r.duration_seconds, r.questions_total, r.first_try_correct, r.accuracy, r.hearts_left, r.completed, r.points]),
      ["Student", "Item", "Kind", "Unit", "Level", "Finished (UTC)", "Seconds", "Questions", "First-try correct", "Accuracy", "Hearts left", "Completed", "Points"]) });
  }
  if (kind === "minutes") {
    const rows = await db().query(
      `SELECT s.nick, to_char(d.day,'YYYY-MM-DD') AS day, ROUND(d.active_seconds / 60.0, 1)::float8 AS minutes, d.points, d.lessons_completed, d.answers, d.correct
         FROM daily_activity d JOIN students s ON s.id = d.student_id WHERE d.class_id = $1 ORDER BY d.day, s.nick`, [cls.id]);
    return json({ filename: `${stem}-minutes.csv`, csv: csv(rows.map((r) => [r.nick, r.day, r.minutes, r.points, r.lessons_completed, r.answers, r.correct]),
      ["Student", "Day", "Minutes active", "Points", "Lessons completed", "Answers", "Correct"]) });
  }
  const rows = await db().query(
    `SELECT t.nick, t.level, t.points_total, t.active_minutes::float8 AS minutes, t.days_active, t.lessons_done, t.items_done, t.answers,
            t.first_try_correct, to_char(t.last_seen_at,'YYYY-MM-DD HH24:MI') AS last_seen
       FROM v_student_totals t WHERE t.class_id = $1 ORDER BY t.nick`, [cls.id]);
  return json({ filename: `${stem}-students.csv`, csv: csv(rows.map((r) => [r.nick, r.level, r.points_total, r.minutes, r.days_active, r.lessons_done, r.items_done, r.answers, r.first_try_correct, r.last_seen]),
    ["Student", "Level", "Points", "Minutes in app", "Days active", "Lessons done", "Steps done", "First-try answers", "First-try correct", "Last seen (UTC)"]) });
}
