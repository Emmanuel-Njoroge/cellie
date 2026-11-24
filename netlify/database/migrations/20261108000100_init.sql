-- Cellie classroom database: core schema.
-- Netlify applies this automatically before each production deploy is published.
-- Never edit a migration after it has been applied; add a new migration file instead.

-- ---------------------------------------------------------------------------
-- Teachers and classes (management side)
-- ---------------------------------------------------------------------------
CREATE TABLE teachers (
  id            text PRIMARY KEY,
  key_id        text NOT NULL UNIQUE,            -- first 4 characters of the teacher key (lookup handle)
  key_salt      text NOT NULL,
  key_hash      text NOT NULL,                   -- PBKDF2 of the secret part of the key
  display_name  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE classes (
  id          text PRIMARY KEY,
  code        text NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{6}$'),
  teacher_id  text NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  name        text NOT NULL,
  archived_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX classes_teacher_idx ON classes (teacher_id);

-- Everything a teacher does to a class or student is recorded here.
CREATE TABLE audit_log (
  id         bigserial PRIMARY KEY,
  teacher_id text REFERENCES teachers(id) ON DELETE SET NULL,
  class_id   text REFERENCES classes(id)  ON DELETE CASCADE,
  action     text NOT NULL,                      -- e.g. class.created, student.pin_reset
  target     text,                               -- usually a student id
  detail     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_class_time_idx ON audit_log (class_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Students, sessions and saved app state
-- ---------------------------------------------------------------------------
CREATE TABLE students (
  id              text PRIMARY KEY,
  class_id        text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  nick            text NOT NULL,                 -- generated animal name, never a real name
  nick_key        text NOT NULL,                 -- lower-case nick for uniqueness
  avatar          text NOT NULL DEFAULT '',
  level           char(1) NOT NULL DEFAULT 'b' CHECK (level IN ('b','i','x')),
  pin_salt        text NOT NULL,
  pin_hash        text NOT NULL,
  failed_attempts int  NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  pts_b           int  NOT NULL DEFAULT 0,       -- points earned at Beginner level
  pts_i           int  NOT NULL DEFAULT 0,       -- ... Intermediate
  pts_x           int  NOT NULL DEFAULT 0,       -- ... Expert
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz,
  removed_at      timestamptz                    -- soft delete (teacher removal)
);
CREATE UNIQUE INDEX students_nick_active_uq ON students (class_id, nick_key) WHERE removed_at IS NULL;
CREATE INDEX students_class_idx ON students (class_id) WHERE removed_at IS NULL;

CREATE TABLE student_tokens (
  token_hash   text PRIMARY KEY,                 -- SHA-256 of the login token
  student_id   text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX student_tokens_student_idx ON student_tokens (student_id, created_at);

-- Snapshot of the whole app state so a student can continue on another device.
CREATE TABLE student_state (
  student_id text PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  state      jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE student_badges (
  student_id text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id   text NOT NULL,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, badge_id)
);

-- ---------------------------------------------------------------------------
-- Learning progress
-- ---------------------------------------------------------------------------
-- One row per student per curriculum step (lesson, challenge, chapter, video).
CREATE TABLE lesson_progress (
  student_id         text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  item_id            text NOT NULL,              -- e.g. heart-i-2, book-cells-b, vid-lungs-x
  kind               text NOT NULL CHECK (kind IN ('lesson','challenge','chapter','video')),
  unit_id            text NOT NULL,
  level              char(1) NOT NULL CHECK (level IN ('b','i','x')),
  completed          boolean NOT NULL DEFAULT false,
  attempts           int NOT NULL DEFAULT 0,
  best_accuracy      numeric(5,4),
  last_accuracy      numeric(5,4),
  best_stars         int NOT NULL DEFAULT 0,
  points_total       int NOT NULL DEFAULT 0,
  seconds_total      int NOT NULL DEFAULT 0,
  first_completed_at timestamptz,
  last_activity_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, item_id)
);
CREATE INDEX lesson_progress_level_idx ON lesson_progress (student_id, level) WHERE completed;

-- One row per lesson run, including runs that ended with no hearts left.
CREATE TABLE attempts (
  id                bigserial PRIMARY KEY,
  client_id         text NOT NULL,               -- random id from the browser, makes retries safe
  student_id        text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id          text NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  item_id           text NOT NULL,
  kind              text NOT NULL,
  unit_id           text NOT NULL,
  level             char(1) NOT NULL,
  started_at        timestamptz,
  finished_at       timestamptz NOT NULL DEFAULT now(),
  duration_seconds  int NOT NULL DEFAULT 0,
  questions_total   int NOT NULL,
  first_try_correct int NOT NULL,
  accuracy          numeric(5,4) NOT NULL,
  hearts_left       int NOT NULL DEFAULT 0,
  completed         boolean NOT NULL,
  points            int NOT NULL DEFAULT 0,
  UNIQUE (student_id, client_id)
);
CREATE INDEX attempts_student_time_idx ON attempts (student_id, finished_at DESC);
CREATE INDEX attempts_class_time_idx   ON attempts (class_id, finished_at DESC);

-- Every answer a student gave, so teachers can see which questions are hard.
CREATE TABLE answers (
  id          bigserial PRIMARY KEY,
  attempt_id  bigint NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  student_id  text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id    text NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  item_id     text NOT NULL,
  unit_id     text NOT NULL,
  level       char(1) NOT NULL,
  q_index     int NOT NULL,                      -- position of the question inside its lesson
  qtype       text NOT NULL,                     -- choice, tf, match, order, sort, fill
  correct     boolean NOT NULL,
  is_retry    boolean NOT NULL DEFAULT false,
  answered_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX answers_class_question_idx ON answers (class_id, item_id, q_index) WHERE NOT is_retry;
CREATE INDEX answers_student_idx ON answers (student_id, answered_at DESC);

-- ---------------------------------------------------------------------------
-- Time tracking (minutes in the app)
-- ---------------------------------------------------------------------------
-- One row per visit. active_seconds only counts time when the page was visible
-- and the student was interacting (or watching a video).
CREATE TABLE activity_sessions (
  id             text PRIMARY KEY,               -- <student id>:<browser session id>
  student_id     text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id       text NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  started_at     timestamptz NOT NULL DEFAULT now(),
  last_ping_at   timestamptz NOT NULL DEFAULT now(),
  active_seconds int NOT NULL DEFAULT 0,
  level          char(1),
  last_activity  text
);
CREATE INDEX activity_sessions_student_idx ON activity_sessions (student_id, started_at DESC);

-- One row per student per local calendar day: the main table for reports.
CREATE TABLE daily_activity (
  student_id        text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id          text NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  day               date NOT NULL,
  active_seconds    int NOT NULL DEFAULT 0,
  points            int NOT NULL DEFAULT 0,
  lessons_completed int NOT NULL DEFAULT 0,
  items_completed   int NOT NULL DEFAULT 0,
  answers           int NOT NULL DEFAULT 0,
  correct           int NOT NULL DEFAULT 0,
  PRIMARY KEY (student_id, day)
);
CREATE INDEX daily_activity_class_day_idx ON daily_activity (class_id, day);

-- What each student is doing right now (drives the Live class board).
CREATE TABLE live_status (
  student_id      text PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  class_id        text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  activity        text NOT NULL DEFAULT '',
  qa              int NOT NULL DEFAULT 0,        -- progress inside the current activity
  qt              int NOT NULL DEFAULT 0,
  session_points  int NOT NULL DEFAULT 0,
  session_correct int NOT NULL DEFAULT 0,
  session_answers int NOT NULL DEFAULT 0,
  streak          int NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX live_status_class_idx ON live_status (class_id, updated_at DESC);
