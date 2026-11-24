# Database

Cellie uses **Netlify Database** (Postgres). The schema lives in
`netlify/database/migrations/` and Netlify applies it automatically before each production deploy.
To change the schema, add a **new** migration file (for example `20270115000000_add_goals.sql`);
never edit one that has already been applied.

## Tables

### Teacher side (management)

| Table | One row per | What it holds |
|---|---|---|
| `teachers` | teacher | Hashed teacher key, created and last-login times |
| `classes` | class | 6-character class code, name, owning teacher, archived time |
| `audit_log` | teacher action | Class created, renamed, archived or restored; PIN reset; student removed |

### Student side

| Table | One row per | What it holds |
|---|---|---|
| `students` | student | Class, animal name, avatar, level, hashed PIN, lock-out counter, points per level (`pts_b`, `pts_i`, `pts_x`), joined and last-seen times, `removed_at` |
| `student_tokens` | signed-in device | Hashed login token (up to 5 devices per student) |
| `student_state` | student | The app's saved settings and history, so the app looks the same on any device |
| `student_badges` | sticker earned | Which sticker and when |

### Progress

| Table | One row per | What it holds |
|---|---|---|
| `lesson_progress` | student × curriculum step | Lesson, challenge, chapter or video; done or not; tries; best and last accuracy; stars; points; seconds spent |
| `attempts` | lesson run | Start and finish time, duration, questions, first-try correct, accuracy, hearts left, finished or ran out of hearts, points |
| `answers` | answer | Which question (`item_id` + `q_index`), question type, right or wrong, first try or retry |

### Time (minutes in the app)

| Table | One row per | What it holds |
|---|---|---|
| `activity_sessions` | visit (browser session) | Start time, last ping, active seconds, level, last activity |
| `daily_activity` | student × day | Active seconds, points, lessons completed, steps completed, answers, correct answers |
| `live_status` | student | What they are doing right now (powers the Live board) |

**How minutes are counted:** the app counts a second only while the student is learning (on the
Learn path, in a lesson, a chapter or a video), the page is visible, and they have clicked, typed,
scrolled or touched in the last 90 seconds (or a video is playing). Time on the Me, Ranks,
Stickers, Live and grown-ups screens does not count.
About every 20 seconds it sends "active for N seconds". The server accepts at most 40 seconds per
ping and never more than the real time since the previous ping, so time cannot be inflated.

**Points** are calculated on the server from the answers (`server/curriculum.mjs`):
lesson = (first-try correct × 2 + 5, plus 5 if perfect) × level multiplier (1, 2 or 3);
chapter or video = 5 × multiplier, the first time only.

## Reporting views

Ready-made views you can query in the Netlify database SQL editor or export:

- `v_student_totals`: one row per student with points, minutes, days active, lessons done, answers
- `v_class_daily`: one row per class per day with minutes, active students, lessons, accuracy
- `v_question_difficulty`: how often each question is missed on the first try

## Example queries

Minutes per student this week (replace the class code):

```sql
SELECT s.nick, ROUND(SUM(d.active_seconds) / 60.0, 1) AS minutes
FROM daily_activity d
JOIN students s ON s.id = d.student_id
JOIN classes c ON c.id = d.class_id
WHERE c.code = 'ABC123' AND d.day >= date_trunc('week', now())::date
GROUP BY s.nick ORDER BY minutes DESC;
```

The 10 most-missed questions in a class:

```sql
SELECT q.item_id, q.q_index, q.first_tries, q.miss_rate
FROM v_question_difficulty q JOIN classes c ON c.id = q.class_id
WHERE c.code = 'ABC123' AND q.first_tries >= 4
ORDER BY q.miss_rate DESC LIMIT 10;
```

Everything one student did, newest first:

```sql
SELECT a.finished_at, a.item_id, a.accuracy, a.duration_seconds, a.points, a.completed
FROM attempts a JOIN students s ON s.id = a.student_id
WHERE s.nick = 'Brave Otter 21'
ORDER BY a.finished_at DESC;
```

## Deleting data

- Teacher **Remove** sets `students.removed_at`, signs the student out and hides them. Records stay.
- Student **Leave class** deletes the student row; every related row is deleted with it (`ON DELETE CASCADE`).
- Deleting a class deletes its students and all of their data.
