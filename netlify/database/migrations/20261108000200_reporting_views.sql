-- Read-only views for reports and ad-hoc analysis (SQL editor, CSV exports, BI tools).

-- One row per student with lifetime totals.
CREATE VIEW v_student_totals AS
SELECT
  s.id                                   AS student_id,
  s.class_id,
  s.nick,
  s.level,
  (s.pts_b + s.pts_i + s.pts_x)          AS points_total,
  COALESCE(d.active_seconds, 0)          AS active_seconds,
  ROUND(COALESCE(d.active_seconds, 0) / 60.0, 1) AS active_minutes,
  COALESCE(d.days_active, 0)             AS days_active,
  COALESCE(a.answers, 0)                 AS answers,
  COALESCE(a.first_try_correct, 0)       AS first_try_correct,
  COALESCE(p.lessons_done, 0)            AS lessons_done,
  COALESCE(p.items_done, 0)              AS items_done,
  s.last_seen_at
FROM students s
LEFT JOIN (
  SELECT student_id, SUM(active_seconds)::int AS active_seconds,
         COUNT(*) FILTER (WHERE active_seconds > 0)::int AS days_active
  FROM daily_activity GROUP BY student_id
) d ON d.student_id = s.id
LEFT JOIN (
  SELECT student_id, COUNT(*)::int AS answers,
         COUNT(*) FILTER (WHERE correct)::int AS first_try_correct
  FROM answers WHERE NOT is_retry GROUP BY student_id
) a ON a.student_id = s.id
LEFT JOIN (
  SELECT student_id,
         COUNT(*) FILTER (WHERE completed AND kind IN ('lesson','challenge'))::int AS lessons_done,
         COUNT(*) FILTER (WHERE completed)::int AS items_done
  FROM lesson_progress GROUP BY student_id
) p ON p.student_id = s.id
WHERE s.removed_at IS NULL;

-- One row per class per day.
CREATE VIEW v_class_daily AS
SELECT
  class_id,
  day,
  SUM(active_seconds)::int                              AS active_seconds,
  ROUND(SUM(active_seconds) / 60.0, 1)                  AS active_minutes,
  COUNT(*) FILTER (WHERE active_seconds > 0)::int       AS active_students,
  SUM(lessons_completed)::int                           AS lessons_completed,
  SUM(answers)::int                                     AS answers,
  SUM(correct)::int                                     AS correct
FROM daily_activity
GROUP BY class_id, day;

-- One row per question: how often students get it right on the first try.
CREATE VIEW v_question_difficulty AS
SELECT
  class_id, item_id, unit_id, level, q_index,
  COUNT(*)::int                               AS first_tries,
  COUNT(*) FILTER (WHERE NOT correct)::int    AS misses,
  ROUND(COUNT(*) FILTER (WHERE NOT correct)::numeric / NULLIF(COUNT(*), 0), 3) AS miss_rate
FROM answers
WHERE NOT is_retry
GROUP BY class_id, item_id, unit_id, level, q_index;
