# Development guide

## How the app is built

The browser app is plain HTML, CSS and JavaScript with no framework. The source is split into
small files in `src/`, and `scripts/build.mjs` joins them, in the order listed in
`src/manifest.json`, into one file: `public/index.html`. All JS files share one scope (they are
wrapped in a single function), so a function defined in one file can be used in any other.

```
npm run build        # after any change in src/
npm run dev:local    # build + local server with an in-memory database
npm test             # API + curriculum tests
```

## Where things live

| I want to... | Edit |
|---|---|
| Change or add questions | `src/js/content/30-units.js` (lessons 1 and 2) or `31-curriculum-extra.js` (chapters, videos, challenges) |
| Change a diagram | `src/js/20-diagrams.js` |
| Change colors, fonts, spacing | `src/css/00-tokens.css` and the area's CSS file |
| Change the learn path | `src/js/views/50-shell-learn-setup.js`, `src/js/40-curriculum-sequence.js` |
| Change how lessons run | `src/js/60-lesson-engine.js` |
| Change the student progress page | `src/js/views/55-progress.js` |
| Change the teacher dashboard | `src/js/82-teacher.js` |
| Change time tracking | `src/js/48-time-tracking.js` (browser) and `activity()` in `server/routes/progress.mjs` |
| Add an API route | a handler in `server/routes/`, then add it to `server/router.mjs` |
| Change the database | add a new file in `netlify/database/migrations/` |

## Buttons

Newer screens register button handlers in the `ACT` object: a button with
`data-act="myThing"` calls `ACT.myThing(button, button.dataset, event)`. Older screens use the
`switch` in `src/js/70-events.js`.

## Adding a topic or level

The server only accepts curriculum steps it knows about (`server/curriculum.mjs`). If you add a
unit, add its id to `UNIT_IDS` there too. `tests/curriculum.test.mjs` fails if the two lists
disagree, so run `npm test` after content changes.

## Offline safety

Finished lessons, chapters and videos are put in a queue in the browser (`localStorage`,
key `cellie-outbox`) and sent to the server when possible. Each lesson run has a random id, so
sending it twice never counts it twice.
