// Type-lock check: the site's text must use the shared type styles (t-* classes
// in src/styles/global.css) and nothing else. This script fails if any markup
// still carries a hand-written text size, weight, line-height, letter-spacing or
// font-size, which are exactly the things a type style fixes.
//
//   node scripts/check-type.mjs        (or: npm run check:type)
//
// Allowed on top of a style: COLOUR utilities only (text-[var(--color-...)]),
// because the same style can legitimately be ink, grey, pink, green or red.
//
// Not checked (on purpose, listed so it is a visible decision, not an accident):
//   - illustrations / mock UI whose text only has to look like a UI: whole files
//     in EXEMPT_FILES, or any block between the markers
//         <!-- type-exempt:start reason -->  ...  <!-- type-exempt:end -->
//   - ALLOWED_LINES: individual exceptions Andrew has chosen, each with a reason.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

const EXEMPT_FILES = [
  "components/BrowserMockCard.astro",
  "components/QuestionPile.astro",
  "components/TreadmillRunner.astro",
  "components/CampfireToggle.astro",
  "components/HeroCharacter.astro",
  "components/GradientIcon.astro",
  "components/PlainIcon.astro",
  "components/IconBadge.astro",
  "pages/campfire-demo.astro",
  "pages/icon-texture-demo.astro",
  "pages/question-pile-demo.astro",
];
const ALLOWED_LINES = [
  // [file, substring that identifies the line, reason]. Empty: the About value labels
  // (formerly 1.3rem here) now use t-subheading.
];

const FORMAT_TOKENS = [
  /\b(?:(?:sm|md|lg|xl|2xl):)?text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/,
  /\b(?:(?:sm|md|lg|xl|2xl):)?font-(?:thin|light|normal|medium|semibold|bold|extrabold)\b/,
  /\b(?:(?:sm|md|lg|xl|2xl):)?leading-[\w\[\].\/-]+/,
  /\b(?:(?:sm|md|lg|xl|2xl):)?tracking-[\w\[\].-]+/,
  /\btext-\[\d+(?:\.\d+)?(?:px|rem|em)\]/,
  /font-size\s*:/,
];

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
}

const violations = [];
const allowed = [];
for (const file of walk(root).filter((f) => f.endsWith(".astro"))) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (EXEMPT_FILES.includes(rel)) continue;
  const lines = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").split("\n");
  let exempt = false;
  // only look at the template part (after the frontmatter) and <style> blocks are skipped
  let inFront = false, seenFront = false, inStyle = false;
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t === "---") { if (!seenFront) { inFront = true; seenFront = true; } else if (inFront) inFront = false; return; }
    if (inFront) return;
    if (/<style\b/.test(line)) inStyle = true;
    if (inStyle) { if (/<\/style>/.test(line)) inStyle = false; return; }
    if (/type-exempt:start/.test(line)) exempt = true;
    if (exempt) { if (/type-exempt:end/.test(line)) exempt = false; return; }
    if (/^\s*(\/\/|\*|<!--)/.test(line) && !/class=/.test(line)) return; // comment lines
    if (!/class(:list)?=|style=/.test(line)) return;
    const hit = FORMAT_TOKENS.map((re) => line.match(re)).filter(Boolean).map((m) => m[0]);
    if (!hit.length) return;
    const allow = ALLOWED_LINES.find(([f, sub]) => f === rel && line.includes(sub));
    if (allow) { allowed.push(`${rel}:${i + 1}  ${allow[2]}`); return; }
    const rec = `${rel}:${i + 1}  [${hit.join(" ")}]  ${t.slice(0, 110)}`;
    violations.push(rec);
  });
}

if (allowed.length) { console.log("Allowed exceptions (chosen, with a reason):"); allowed.forEach((l) => console.log("  " + l)); console.log(""); }
if (violations.length) {
  console.log(`TYPE LOCK FAILED: ${violations.length} line(s) use text formatting outside the shared styles:\n`);
  violations.forEach((l) => console.log("  " + l));
  console.log("\nUse a t-* style from src/styles/global.css (plus a colour utility if needed).");
  process.exit(1);
}
console.log("Type lock OK: all site text uses the shared styles.");
