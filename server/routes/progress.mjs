// Learning data routes: lesson attempts, chapters and videos, minutes in the app, live status,
// the student's own progress report, and the class board.
import { db } from "../db.mjs";
import { authStudent } from "../auth.mjs";
import { parseItem, lessonPoints, stepPoints, starsFor, ITEMS_PER_LEVEL, LEVELS } from "../curriculum.mjs";
import { bad, cleanText, num, safeDay, isDay, normCode, json, mondayOf, todayUtc } from "../util.mjs";

const weekStartOf = (d) => (isDay(d) ? d : mondayOf(todayUtc()));

const DAILY_UPSERT = `
  INSERT INTO daily_activity (student_id, class_id, day, active_seconds, points, lessons_completed, items_completed, answers, correct)
  VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8, $9)
  ON CONFLICT (student_id, day) DO UPDATE SET
    active_seconds    = daily_activity.active_seconds    + EXCLUDED.active_seconds,
    points            = daily_activity.points            + EXCLUDED.points,
    lessons_completed = daily_activity.lessons_completed + EXCLUDED.lessons_completed,
    items_completed   = daily_activity.items_completed   + EXCLUDED.items_completed,
    answers           = daily_activity.answers           + EXCLUDED.answers,
    correct           = daily_activity.correct           + EXCLUDED.correct`;

/* ---------- a finished (or failed) lesson run ---------- */
export async function attempt(b) {
  const s = await authStudent(b, { write: true });
  const a = b.attempt || {};
  const info = parseItem(a.itemId);
  if (!info || !["lesson", "challenge"].includes(info.kind)) bad("bad_item");
  const clientId = cleanText(a.clientId, 40);
  if (clientId.length < 8) bad("bad_attempt");
  const level = info.level;
  const total = num(a.total, 12, 1);
  const answers = (Array.isArray(a.answers) ? a.answers : []).slice(0, 60)
    .map((x) => ({ i: num(x.i, 11), t: cleanText(x.t, 10) || "choice", ok: !!x.ok, r: !!x.r }));
  // The first-try score comes from the answer log when there is one.
  let firstTry = num(a.firstTry, total, 0);
  if (answers.length) firstTry = Math.min(total, new Set(answers.filter((x) => !x.r && x.ok).map((x) => x.i)).size);
  const completed = !!a.completed;
  const acc = firstTry / total;
  const points = lessonPoints({ level, total, firstTry, completed });
  const stars = starsFor(acc, completed);
  const day = safeDay(a.day);
  const duration = num(a.durationSec, 3600);
  const hearts = num(a.hearts, 3);
  const started = Number(a.startedAt);
  const startedIso = Number.isFinite(started) && started < Date.now() && Date.now() - started < 3 * 3600e3 ? new Date(started).toISOString() : null;
  const nCorrect = answers.filter((x) => x.ok).length;

  const result = await db().tx(async (q) => {
    const ins = await q(
      `INSERT INTO attempts (client_id, student_id, class_id, item_id, kind, unit_id, level, started_at, duration_seconds,
                             questions_total, first_try_correct, accuracy, hearts_left, completed, points)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::timestamptz,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (student_id, client_id) DO NOTHING RETURNING id::text AS id`,
      [clientId, s.id, s.cid, a.itemId, info.kind, info.unit, level, startedIso, duration, total, firstTry, acc.toFixed(4), hearts, completed, points]
    );
    if (!ins.length) return { duplicate: true, points: 0 };
    await q(
      `INSERT INTO answers (attempt_id, student_id, class_id, item_id, unit_id, level, q_index, qtype, correct, is_retry)
       SELECT $1::bigint, $2, $3, $4, $5, $6, x.i, x.t, x.ok, x.r
         FROM jsonb_to_recordset($7::jsonb) AS x(i int, t text, ok boolean, r boolean)`,
      [ins[0].id, s.id, s.cid, a.itemId, info.unit, level, JSON.stringify(answers)]
    );
    await q(
      `INSERT INTO lesson_progress (student_id, item_id, kind, unit_id, level, completed, attempts, best_accuracy, last_accuracy,
                                    best_stars, points_total, seconds_total, first_completed_at, last_activity_at)
       VALUES ($1,$2,$3,$4,$5,$6,1,$7,$8,$9,$10,$11, CASE WHEN $6 THEN now() END, now())
       ON CONFLICT (student_id, item_id) DO UPDATE SET
         completed          = lesson_progress.completed OR EXCLUDED.completed,
         attempts           = lesson_progress.attempts + 1,
         best_accuracy      = CASE WHEN $6 THEN GREATEST(COALESCE(lesson_progress.best_accuracy, 0), $7::numeric) ELSE lesson_progress.best_accuracy END,
         last_accuracy      = EXCLUDED.last_accuracy,
         best_stars         = GREATEST(lesson_progress.best_stars, EXCLUDED.best_stars),
         points_total       = lesson_progress.points_total + EXCLUDED.points_total,
         seconds_total      = lesson_progress.seconds_total + EXCLUDED.seconds_total,
         first_completed_at = COALESCE(lesson_progress.first_completed_at, EXCLUDED.first_completed_at),
         last_activity_at   = now()`,
      [s.id, a.itemId, info.kind, info.unit, level, completed, completed ? acc.toFixed(4) : null, acc.toFixed(4), stars, points, duration]
    );
    if (points) await q(`UPDATE students SET pts_${level} = pts_${level} + $2 WHERE id = $1`, [s.id, points]);
    await q(`UPDATE students SET last_seen_at = now() WHERE id = $1`, [s.id]);
    await q(DAILY_UPSERT, [s.id, s.cid, day, 0, points, completed ? 1 : 0, 0, answers.length, nCorrect]);
    return { duplicate: false, points };
  });
  return json({ ok: true, ...result, stars });
}

/* ---------- a finished textbook chapter or video ---------- */
export async function item(b) {
  const s = await authStudent(b, { write: true });
  const it = b.item || {};
  const info = parseItem(it.itemId);
  if (!info || !["chapter", "video"].includes(info.kind)) bad("bad_item");
  const seconds = num(it.seconds, 3600);
  const day = safeDay(it.day);
  const points = await db().tx(async (q) => {
    const first = await q(
      `INSERT INTO lesson_progress (student_id, item_id, kind, unit_id, level, completed, attempts, points_total, seconds_total, first_completed_at)
       VALUES ($1,$2,$3,$4,$5,true,1,$6,$7,now()) ON CONFLICT (student_id, item_id) DO NOTHING RETURNING item_id`,
      [s.id, it.itemId, info.kind, info.unit, info.level, stepPoints(info.level), seconds]
    );
    let pts = 0;
    if (first.length) {
      pts = stepPoints(info.level);
      await q(`UPDATE students SET pts_${info.level} = pts_${info.level} + $2 WHERE id = $1`, [s.id, pts]);
      await q(DAILY_UPSERT, [s.id, s.cid, day, 0, pts, 0, 1, 0, 0]);
    } else {
      await q(`UPDATE lesson_progress SET attempts = attempts + 1, seconds_total = seconds_total + $3, last_activity_at = now()
                WHERE student_id = $1 AND item_id = $2`, [s.id, it.itemId, seconds]);
    }
    await q(`UPDATE students SET last_seen_at = now() WHERE id = $1`, [s.id]);
    return pts;
  });
  return json({ ok: true, points });
}

/* ---------- minutes in the app ---------- */
// The browser sends "I was active for N seconds" about every 20 seconds. The server never trusts a
// single ping for more than 40 seconds, and never more than the real time since the previous ping.
export async function activity(b) {
  const s = await authStudent(b, { write: true });
  const sess = cleanText(b.sessionId, 24);
  if (sess.length < 6) bad("bad_session");
  const sid = `${s.id}:${sess}`;
  const delta = num(b.delta, 60, 0);
  const level = LEVELS.includes(b.level) ? b.level : s.level;
  const [prev] = await db().query(
    `SELECT extract(epoch from now() - last_ping_at)::float8 AS since FROM activity_sessions WHERE id = $1 AND student_id = $2`, [sid, s.id]);
  const allowed = Math.max(0, prev ? Math.min(delta, 40, Math.floor(prev.since) + 5) : Math.min(delta, 40));
  const day = safeDay(b.day);
  await db().tx(async (q) => {
    await q(
      `INSERT INTO activity_sessions (id, student_id, class_id, active_seconds, level, last_activity)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET last_ping_at = now(), active_seconds = activity_sessions.active_seconds + $4,
                                      level = $5, last_activity = $6`,
      [sid, s.id, s.cid, allowed, level, cleanText(b.act, 80)]
    );
    if (allowed > 0) await q(DAILY_UPSERT, [s.id, s.cid, day, allowed, 0, 0, 0, 0, 0]);
    await q(`UPDATE students SET last_seen_at = now() WHERE id = $1`, [s.id]);
  });
  return json({ ok: true, counted: allowed });
}

/* ---------- live status ---------- */
export async function live(b) {
  const s = await authStudent(b, { write: true });
  const l = b.live || {};
  if (b.off) {
    await db().query(`UPDATE live_status SET activity = 'Offline', updated_at = 'epoch'::timestamptz WHERE student_id = $1`, [s.id]);
    return json({ ok: true });
  }
  await db().query(
    `INSERT INTO live_status (student_id, class_id, activity, qa, qt, session_points, session_correct, session_answers, streak, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
     ON CONFLICT (student_id) DO UPDATE SET activity = EXCLUDED.activity, qa = EXCLUDED.qa, qt = EXCLUDED.qt,
       session_points = EXCLUDED.session_points, session_correct = EXCLUDED.session_correct,
       session_answers = EXCLUDED.session_answers, streak = EXCLUDED.streak, updated_at = now()`,
    [s.id, s.cid, cleanText(l.act, 80), num(l.qa, 1000), num(l.qt, 1000), num(l.sp), num(l.ok, 1e5), num(l.tot, 1e5), num(l.run, 1e4)]
  );
  return json({ ok: true });
}

/* ---------- the student's own progress report ---------- */
export async function progress(b) {
  const s = await authStudent(b);
  const today = safeDay(b.today);
  const weekStart = weekStartOf(b.weekStart);
  const [tot] = await db().query(
    `SELECT COALESCE(SUM(active_seconds),0)::int AS secs,
            COALESCE(SUM(active_seconds) FILTER (WHERE day = $2::date),0)::int AS today_secs,
            COALESCE(SUM(active_seconds) FILTER (WHERE day >= $3::date),0)::int AS week_secs,
            COUNT(*) FILTER (WHERE active_seconds > 0)::int AS days_active
       FROM daily_activity WHERE student_id = $1`, [s.id, today, weekStart]);
  const [sess] = await db().query(`SELECT COUNT(*)::int AS n FROM activity_sessions WHERE student_id = $1 AND active_seconds > 0`, [s.id]);
  const days = await db().query(
    `SELECT to_char(day,'YYYY-MM-DD') AS day, active_seconds::int AS seconds, points::int AS points,
            answers::int AS answers, correct::int AS correct, lessons_completed::int AS lessons
       FROM daily_activity WHERE student_id = $1 AND day >= $2::date - 29 ORDER BY day`, [s.id, today]);
  const topics = await db().query(
    `SELECT unit_id, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE correct)::int AS correct
       FROM answers WHERE student_id = $1 AND NOT is_retry GROUP BY unit_id ORDER BY unit_id`, [s.id]);
  const items = await db().query(
    `SELECT item_id, kind, unit_id, level, completed, attempts::int, best_accuracy::float8 AS best_accuracy,
            best_stars::int, points_total::int, seconds_total::int, (extract(epoch from last_activity_at)*1000)::float8 AS last_ms
       FROM lesson_progress WHERE student_id = $1 ORDER BY last_activity_at DESC`, [s.id]);
  const recent = await db().query(
    `SELECT item_id, kind, unit_id, level, completed, points::int, duration_seconds::int AS seconds,
            accuracy::float8 AS accuracy, questions_total::int AS total, (extract(epoch from finished_at)*1000)::float8 AS at_ms
       FROM attempts WHERE student_id = $1 ORDER BY finished_at DESC LIMIT 20`, [s.id]);
  const badges = await db().query(`SELECT badge_id FROM student_badges WHERE student_id = $1 ORDER BY earned_at`, [s.id]);
  const [lvl] = await db().query(
    `SELECT COUNT(*) FILTER (WHERE completed AND level = $2)::int AS done_level FROM lesson_progress WHERE student_id = $1`, [s.id, s.level]);
  const [first] = await db().query(
    `SELECT COUNT(*)::int AS n, COUNT(*) FILTER (WHERE correct)::int AS c FROM answers WHERE student_id = $1 AND NOT is_retry`, [s.id]);
  return json({
    totals: {
      seconds: tot.secs, todaySeconds: tot.today_secs, weekSeconds: tot.week_secs, daysActive: tot.days_active, sessions: sess.n,
      points: { b: s.pts_b, i: s.pts_i, x: s.pts_x }, firstTryAnswers: first.n, firstTryCorrect: first.c,
      completion: Math.round((lvl.done_level / ITEMS_PER_LEVEL) * 100), level: s.level,
    },
    days, topics, items, recent, badges: badges.map((r) => r.badge_id),
  });
}

/* ---------- class board (points, weekly accuracy, live) ---------- */
export async function board(b) {
  const code = normCode(b.code);
  const [cls] = await db().query(`SELECT id, name FROM classes WHERE code = $1`, [code]);
  if (!cls) bad("class_not_found", 404);
  const weekStart = weekStartOf(b.weekStart);
  const rows = await db().query(
    `SELECT s.id, s.nick, s.avatar, s.level, s.pts_b::int AS pb, s.pts_i::int AS pi, s.pts_x::int AS px,
            COALESCE(w.answers,0)::int AS wt, COALESCE(w.correct,0)::int AS wc,
            COALESCE(c.n,0)::int AS done_level,
            l.activity, l.qa::int, l.qt::int, l.session_points::int AS sp, l.session_correct::int AS ok,
            l.session_answers::int AS tot, l.streak::int AS run, (extract(epoch from l.updated_at)*1000)::float8 AS live_ms
       FROM students s
       LEFT JOIN (SELECT student_id, SUM(answers) AS answers, SUM(correct) AS correct
                    FROM daily_activity WHERE class_id = $1 AND day >= $2::date GROUP BY student_id) w ON w.student_id = s.id
       LEFT JOIN LATERAL (SELECT COUNT(*) AS n FROM lesson_progress lp
                           WHERE lp.student_id = s.id AND lp.completed AND lp.level = s.level) c ON true
       LEFT JOIN live_status l ON l.student_id = s.id
      WHERE s.class_id = $1 AND s.removed_at IS NULL
      ORDER BY s.nick`, [cls.id, weekStart]);
  const students = rows.map((r) => ({
    id: r.id, nick: r.nick, avatar: r.avatar, level: r.level,
    pts: { b: r.pb, i: r.pi, x: r.px }, total: r.pb + r.pi + r.px,
    wk: weekStart, wc: r.wc, wt: r.wt,
    comp: Math.min(100, Math.round((r.done_level / ITEMS_PER_LEVEL) * 100)),
    live: r.live_ms != null ? { ts: r.live_ms, act: r.activity, qa: r.qa, qt: r.qt, sp: r.sp, ok: r.ok, tot: r.tot, run: r.run } : null,
  }));
  const [now] = await db().query(`SELECT (extract(epoch from now())*1000)::float8 AS ms`);
  return json({ name: cls.name, now: now.ms, students });
}
