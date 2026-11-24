# Cellie

A Duolingo-style app that teaches kids how the human body works, at three levels:
🌱 Beginner (Kindergarten), 🌿 Intermediate (Middle school) and 🌳 Expert (High school).
Teachers create a class, students join with a class code, and everything students do is saved
in a Postgres database: lessons, every answer, chapters, videos and **minutes spent in the app**.

- 6 topics, 54 lessons, 276 questions, 18 textbook chapters, 18 short animated videos
- Students: log in with a class code, a generated animal name and a 4-number PIN, on any device
- Student **My progress** page: total time, time today and this week, minutes per day, course progress, accuracy by topic, recent activity
- Teacher dashboard: overview, students, time, insights (hardest questions), management, CSV exports and an activity log
- Live class board and leaderboards for points and weekly accuracy

## Project layout

```
cellie/
├── src/                          The app (split into small files, assembled by the build)
│   ├── index.template.html       Page shell
│   ├── manifest.json             Load order of every CSS and JS file
│   ├── css/                      Styles, one file per area
│   └── js/
│       ├── content/              Lessons, questions, chapters and videos
│       ├── views/                Screens (learn path, ranks, stickers, me, progress, grown-ups)
│       ├── 48-time-tracking.js   Counts active minutes and sends them to the database
│       ├── 64-progress-records.js Saves every lesson attempt, chapter and video (works offline)
│       ├── 80-82-*.js            Class codes, student login, teacher dashboard
│       └── ...                   State, theme, lesson engine, drag and drop, events
├── server/                       The API (plain Node, no framework)
│   ├── router.mjs                /api/<route> -> handler
│   ├── routes/student.mjs        Join, register, log in, save, leave
│   ├── routes/progress.mjs       Attempts, chapters/videos, minutes, live status, reports, class board
│   ├── routes/teacher.mjs        Teacher accounts, classes, dashboards, management, exports
│   ├── auth.mjs, db.mjs, util.mjs, curriculum.mjs
├── netlify/
│   ├── functions/api.mjs         Netlify Function entry point (serves /api/*)
│   └── database/migrations/      Database schema (applied automatically by Netlify)
├── scripts/build.mjs             Builds public/index.html from src/
├── scripts/dev-server.mjs        Local server with an in-memory database (no account needed)
├── tests/                        API tests on a real Postgres engine + curriculum checks
└── docs/                         DATABASE.md (every table) and DEVELOPMENT.md
```

`public/index.html` is generated. Edit files in `src/`, then run `npm run build`.

## Deploy on Netlify

1. In Netlify: **Add new project > Import an existing project > GitHub**, and choose this repository.
2. Leave the settings as they are. `netlify.toml` already sets the build command (`npm run build`),
   the publish folder (`public`) and the functions folder.
3. Click **Deploy**.

Netlify creates the Postgres database automatically because this project uses the
`@netlify/database` package, and it applies the files in `netlify/database/migrations/`
before each production deploy goes live. There is nothing else to set up.

> **Cost:** Netlify Database runs on Netlify's credit-based plans and uses credits while it is
> active. Check your plan and usage in the Netlify dashboard before using it with a whole class.

Optional: set the environment variable `TEACHER_SIGNUP_CODE` so that only people with that
code can create a new teacher account.

> **Moving from the earlier version:** the earlier zip stored progress in Netlify Blobs.
> This version uses a database instead and does not copy old Blobs data across. Students and
> teachers start fresh.

## Run it on your computer

```
npm install
npm run dev:local     # http://localhost:8888, in-memory database, nothing to sign up for
npm test              # 27 tests
```

To use Netlify's own local database instead: install the Netlify CLI, run `npm run dev`,
then `npm run db:migrate` in a second terminal the first time.

## Using it

**Teacher:** open the site, tap **I'm a teacher > Create class**. You get a class code (like
`ABC-123`) and a teacher key (like `XXXX-XXXX-XXXX-XXXX`). The key is shown once and opens all
of your classes, so save it. Tabs: **Overview** (minutes this week, completion, accuracy, who needs
attention), **Students** (time, points and accuracy per student; tap a student for everything they
did), **Time** (minutes per day), **Insights** (accuracy by topic, the questions students miss most),
**Manage** (rename, archive, CSV exports, activity log).

**Student:** tap **Join my class**, type the code, pick an animal name, level and color, and make a
PIN. On another device choose "I've played before". **Me > My progress** shows their time and results.

## Privacy

- Students never type a real name. Names are generated ("Brave Otter 21").
- PINs and teacher keys are stored hashed. Eight wrong PINs lock a student for 10 minutes.
- Time is only counted while the app is open and in use (or a video is playing).
- A teacher's "Remove" hides the student and signs them out but keeps their records.
  A student's own "Leave class" deletes all of their data.
- Follow your school's rules about student data. See `docs/DATABASE.md` for exactly what is stored.

Lesson content is general health education for kids, not medical advice.
