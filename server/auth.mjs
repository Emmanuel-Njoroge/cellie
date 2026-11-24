// Authentication helpers for students (class code + id + token) and teachers (teacher key).
import { db } from "./db.mjs";
import { bad, fastHash, slowHash, safeEq, normCode, normKey, rnd, cleanText } from "./util.mjs";

export async function authStudent(b, { write = false } = {}) {
  const code = normCode(b.code);
  const token = String(b.token || "");
  if (code.length !== 6 || !token) bad("unauthorized", 401);
  const th = await fastHash(token);
  const rows = await db().query(
    `SELECT s.*, c.id AS cid, c.name AS class_name, c.archived_at AS class_archived
       FROM students s JOIN classes c ON c.id = s.class_id
      WHERE c.code = $1 AND s.id = $2 AND s.removed_at IS NULL
        AND EXISTS (SELECT 1 FROM student_tokens t WHERE t.student_id = s.id AND t.token_hash = $3)`,
    [code, cleanText(b.id, 16), th]
  );
  if (!rows.length) bad("unauthorized", 401);
  if (write && rows[0].class_archived) bad("class_archived", 403);
  return { ...rows[0], code };
}

export async function issueToken(q, studentId) {
  const token = rnd(32);
  await q(`INSERT INTO student_tokens (token_hash, student_id) VALUES ($1, $2)`, [await fastHash(token), studentId]);
  // keep only the 5 newest tokens (5 devices)
  await q(
    `DELETE FROM student_tokens WHERE student_id = $1 AND token_hash NOT IN
       (SELECT token_hash FROM student_tokens WHERE student_id = $1 ORDER BY created_at DESC LIMIT 5)`,
    [studentId]
  );
  return token;
}

export async function authTeacher(b) {
  const key = normKey(b.key);
  if (key.length !== 16) bad("unauthorized", 401);
  const rows = await db().query(`SELECT * FROM teachers WHERE key_id = $1`, [key.slice(0, 4)]);
  if (!rows.length) bad("unauthorized", 401);
  const t = rows[0];
  if (!safeEq(await slowHash(key.slice(4), t.key_salt), t.key_hash)) bad("unauthorized", 401);
  return t;
}

export async function authTeacherClass(b) {
  const t = await authTeacher(b);
  const code = normCode(b.code);
  const rows = await db().query(`SELECT * FROM classes WHERE code = $1 AND teacher_id = $2`, [code, t.id]);
  if (!rows.length) bad("class_not_found", 404);
  return { teacher: t, cls: rows[0] };
}

export async function audit(q, { teacherId, classId, action, target = null, detail = {} }) {
  await q(`INSERT INTO audit_log (teacher_id, class_id, action, target, detail) VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [teacherId, classId, action, target, JSON.stringify(detail)]);
}
