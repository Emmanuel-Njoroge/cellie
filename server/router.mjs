// Maps /api/<path> to a handler. Every handler receives the parsed JSON body.
import { json, fail, readBody, todayUtc } from "./util.mjs";
import * as student from "./routes/student.mjs";
import * as progress from "./routes/progress.mjs";
import * as teacher from "./routes/teacher.mjs";
import { db } from "./db.mjs";

const routes = {
  "ping": async () => {
    let dbOk = false;
    try { await db().query("SELECT 1"); dbOk = true; } catch { /* reported below */ }
    return json({ ok: true, db: dbOk, needsSignup: !!process.env.TEACHER_SIGNUP_CODE, now: Date.now(), today: todayUtc() });
  },
  // students
  "class/join": student.classJoin,
  "class/board": progress.board,
  "student/register": student.register,
  "student/login": student.login,
  "student/me": student.me,
  "student/save": student.save,
  "student/leave": student.leave,
  "student/attempt": progress.attempt,
  "student/item": progress.item,
  "student/activity": progress.activity,
  "student/live": progress.live,
  "student/progress": progress.progress,
  // teachers
  "teacher/create": teacher.create,
  "teacher/login": teacher.login,
  "teacher/overview": teacher.overview,
  "teacher/student": teacher.student,
  "teacher/rename": teacher.rename,
  "teacher/archive": teacher.archive,
  "teacher/resetpin": teacher.resetPin,
  "teacher/remove": teacher.remove,
  "teacher/audit": teacher.auditLog,
  "teacher/export": teacher.exportCsv,
};

export async function handle(req) {
  try {
    const path = new URL(req.url).pathname.replace(/^\/(\.netlify\/functions\/)?api\//, "").replace(/\/+$/, "");
    const handler = routes[path];
    if (!handler) return fail("not_found", 404);
    if (path !== "ping" && req.method !== "POST") return fail("method_not_allowed", 405);
    const body = path === "ping" ? {} : await readBody(req);
    return await handler(body);
  } catch (e) {
    if (e && e.status) return fail(e.message, e.status);
    console.error("api error", e);
    return fail("server_error", 500);
  }
}
