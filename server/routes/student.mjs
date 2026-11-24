// Student account routes: join a class, register, log in, resume, save app state, leave.
import { db } from "../db.mjs";
import { authStudent, issueToken } from "../auth.mjs";
import { LEVELS } from "../curriculum.mjs";
import { bad, cleanText, nickKey, normCode, fmtCode, newId, rnd, slowHash, safeEq, json } from "../util.mjs";

export async function classJoin(b) {
  const [cls] = await db().query(`SELECT name, code, archived_at FROM classes WHERE code = $1`, [normCode(b.code)]);
  if (!cls) bad("class_not_found", 404);
  if (cls.archived_at) bad("class_archived", 403);
  return json({ name: cls.name, code: fmtCode(cls.code) });
}

export async function register(b) {
  const code = normCode(b.code);
  const [cls] = await db().query(`SELECT id, name, archived_at FROM classes WHERE code = $1`, [code]);
  if (!cls) bad("class_not_found", 404);
  if (cls.archived_at) bad("class_archived", 403);
  const nick = cleanText(b.nick, 24);
  if (nick.length < 3) bad("nick_short");
  if (!/^\d{4}$/.test(String(b.pin || ""))) bad("pin_format");
  const id = newId(10), salt = rnd(16);
  const pinHash = await slowHash(String(b.pin), salt);
  const level = LEVELS.includes(b.level) ? b.level : "b";
  let token;
  try {
    token = await db().tx(async (q) => {
      await q(
        `INSERT INTO students (id, class_id, nick, nick_key, avatar, level, pin_salt, pin_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, cls.id, nick, nickKey(nick), cleanText(b.avatar, 8), level, salt, pinHash]
      );
      return issueToken(q, id);
    });
  } catch (e) {
    if (e && e.code === "23505") bad("nick_taken", 409);
    throw e;
  }
  return json({ id, token, className: cls.name, code: fmtCode(code) });
}

export async function login(b) {
  const code = normCode(b.code);
  const [s] = await db().query(
    `SELECT s.*, c.name AS class_name, c.archived_at AS class_archived,
            (s.locked_until IS NOT NULL AND s.locked_until > now()) AS is_locked
       FROM students s JOIN classes c ON c.id = s.class_id
      WHERE c.code = $1 AND s.nick_key = $2 AND s.removed_at IS NULL`,
    [code, nickKey(b.nick)]
  );
  if (!s) bad("login_failed", 401);
  if (s.is_locked) bad("locked", 429);
  const ok = safeEq(await slowHash(String(b.pin || ""), s.pin_salt), s.pin_hash);
  if (!ok) {
    await db().query(
      `UPDATE students SET
         locked_until = CASE WHEN failed_attempts + 1 >= 8 THEN now() + interval '10 minutes' ELSE locked_until END,
         failed_attempts = CASE WHEN failed_attempts + 1 >= 8 THEN 0 ELSE failed_attempts + 1 END
       WHERE id = $1`, [s.id]);
    bad("login_failed", 401);
  }
  if (s.class_archived) bad("class_archived", 403);
  const token = await db().tx(async (q) => {
    await q(`UPDATE students SET failed_attempts = 0, locked_until = NULL, last_seen_at = now() WHERE id = $1`, [s.id]);
    return issueToken(q, s.id);
  });
  const [st] = await db().query(`SELECT state FROM student_state WHERE student_id = $1`, [s.id]);
  return json({ id: s.id, token, className: s.class_name, code: fmtCode(code), nick: s.nick, avatar: s.avatar, state: st ? st.state : null });
}

export async function me(b) {
  const s = await authStudent(b);
  const [st] = await db().query(`SELECT state FROM student_state WHERE student_id = $1`, [s.id]);
  return json({ id: s.id, className: s.class_name, nick: s.nick, avatar: s.avatar, state: st ? st.state : null });
}

// Saves the app's own state (settings, stickers, local history) so it follows the student to other devices.
// Points and progress are NOT taken from here: the server records those from attempts and items.
export async function save(b) {
  const s = await authStudent(b, { write: true });
  const state = b.state && typeof b.state === "object" ? b.state : {};
  const text = JSON.stringify(state);
  if (text.length > 120_000) bad("too_large", 413);
  const level = LEVELS.includes(state.level) ? state.level : s.level;
  const badges = (Array.isArray(state.badges) ? state.badges : []).slice(0, 60).map((x) => cleanText(x, 24)).filter(Boolean);
  await db().tx(async (q) => {
    await q(
      `INSERT INTO student_state (student_id, state, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (student_id) DO UPDATE SET state = EXCLUDED.state, updated_at = now()`,
      [s.id, text]
    );
    await q(`UPDATE students SET level = $2, last_seen_at = now() WHERE id = $1`, [s.id, level]);
    if (badges.length) {
      await q(
        `INSERT INTO student_badges (student_id, badge_id)
         SELECT $1, value FROM jsonb_array_elements_text($2::jsonb) ON CONFLICT DO NOTHING`,
        [s.id, JSON.stringify(badges)]
      );
    }
  });
  return json({ ok: true });
}

// A student leaves the class: all of their data is permanently deleted (cascade).
export async function leave(b) {
  const s = await authStudent(b);
  await db().query(`DELETE FROM students WHERE id = $1`, [s.id]);
  return json({ ok: true });
}
