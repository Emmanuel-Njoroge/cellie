// Minimal curriculum metadata the server needs to validate progress and compute completion.
// The full lesson content lives in the browser app (src/js/content). A test keeps the two in sync.
export const UNIT_IDS = ["cells", "heart", "lungs", "brain", "germs", "bones"];
export const LEVELS = ["b", "i", "x"];
export const MULT = { b: 1, i: 2, x: 3 };
export const LESSONS_PER_UNIT = 3;              // 2 lessons + 1 challenge
export const ITEMS_PER_LEVEL = UNIT_IDS.length * (2 + LESSONS_PER_UNIT); // chapter + video + 3 lessons per unit = 30

const unitAlt = UNIT_IDS.join("|");
const LESSON_RE = new RegExp(`^(${unitAlt})-([bix])-([123])$`);
const BOOK_RE = new RegExp(`^book-(${unitAlt})-([bix])$`);
const VIDEO_RE = new RegExp(`^vid-(${unitAlt})-([bix])$`);

// Returns { kind, unit, level } or null when the id is not a real curriculum step.
export function parseItem(id) {
  id = String(id || "");
  let m = LESSON_RE.exec(id);
  if (m) return { kind: m[3] === "3" ? "challenge" : "lesson", unit: m[1], level: m[2] };
  m = BOOK_RE.exec(id); if (m) return { kind: "chapter", unit: m[1], level: m[2] };
  m = VIDEO_RE.exec(id); if (m) return { kind: "video", unit: m[1], level: m[2] };
  return null;
}

// Points are always calculated on the server so they cannot be edited in the browser.
export function lessonPoints({ level, total, firstTry, completed }) {
  if (!completed) return 0;
  const perfect = firstTry === total;
  return (firstTry * 2 + 5 + (perfect ? 5 : 0)) * MULT[level];
}
export const stepPoints = (level) => 5 * MULT[level];
export const starsFor = (acc, completed) => (!completed ? 0 : acc >= 1 ? 3 : acc >= 0.8 ? 2 : 1);
