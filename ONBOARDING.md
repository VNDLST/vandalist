# Vandalist site — onboarding / continuity guide

Snapshot generated 2026-08-09. This is a "where we left off" briefing, not a
live sync — if you're reading this a while after it was written, check git
log for anything more recent.

## Start here

**[CLAUDE.md](CLAUDE.md) is the living source of truth** for project
conventions — deploy process, tech stack, design-system components/tokens,
layout conventions, and known gotchas. Read that first; this doc only
covers what CLAUDE.md doesn't (recent-work recap + one-time machine setup).
`AGENTS.md` is just a short pointer to CLAUDE.md now (see below) — don't
treat it as a second source of truth.

## ⚠️ Repo folder is inside SharePoint sync — file-integrity note

Discovered 2026-08-07: this repo's working directory lives inside a
SharePoint/OneDrive-synced library (mounted as `D:\Vandalist - Documents\...`
on the work machine, `C:\...` on the home machine — same underlying cloud
library, different drive letters). That sync client runs continuously in the
background, independent of git, and will happily "sync" `.git/` internals and
symlinks even though it can't represent either correctly. Symptoms actually
seen: `CLAUDE.md` (previously a symlink to `AGENTS.md`) got flattened to an
empty file, `AGENTS.md` got mangled into a broken self-referencing symlink,
and a conflict-copy `AGENTS-v1.md` appeared holding the real content.
Trigger was nothing exotic — just an ordinary ~10 minute gap where both
machines' OneDrive clients were live at once (walking from one machine to
the other without shutting the first one down).

**Fixed 2026-08-07 (the symlink specifically):** `CLAUDE.md` is now the
real, full file — no longer a symlink — since Claude Code needs its actual
content to auto-load reliably. `AGENTS.md` is now the thin pointer instead
(a plain text file, not a symlink, so SharePoint can't mangle it). This
removes the specific "CLAUDE.md flattened to 0 bytes" failure mode going
forward — but general SharePoint conflict-copy risk on *other* files isn't
eliminated, just this one recurring symptom.

**Quick health check worth running at the start of a session if the repo
has just synced from another machine:**
```
git status --short
```
- Anything named `*-v1.*`, `*-v2.*`, "filename (1)", etc. = a SharePoint
  conflict copy. Don't assume the original is fine just because it's still
  there — compare the two before trusting either (they're sometimes
  identical duplicates, safe to delete; don't assume that without checking).
- Confirm `CLAUDE.md` is a real file with actual content, not 0 bytes —
  `ls -la CLAUDE.md` (Git Bash) or `Get-Item CLAUDE.md | Format-List`
  (PowerShell). If it's ever unexpectedly empty: `git restore CLAUDE.md`.
- `git fsck --full` — should report no errors/output.

**Still not resolved (broader question):** whether to actually move the
repo out of the SharePoint-synced folder entirely (makes git's own
push/pull the only sync mechanism, as the two-device workflow below
already assumes) or leave it in place and stay disciplined about not
having both machines' sync clients live at once. The symlink fix above
removes one specific recurring symptom but doesn't resolve this bigger
architectural question. Andrew hasn't decided — ask before doing anything
about it, don't just pick one.

## What's been done recently

- Built a shared typography/color/shadow design system (`Eyebrow.astro`,
  `Heading.astro`, `PageHeading.astro`, `SectionHeading.astro` components;
  `--color-good`, `--shadow-card`, `--shadow-panel`, `--gradient-orb`
  tokens in `global.css`) and applied it across every page, replacing
  drifted one-off hex values and shadow strings.
- Reworked `how-we-work.astro`'s top section: added a new two-column hero
  (text left, decorative graphic right — originally a placeholder, later
  replaced by the campfire toggle, see below), with the original "Our
  working style" section restored beneath it unchanged (own eyebrow/
  heading/four cards), fixed to be the page's `<h2>` now that the new
  hero holds the `<h1>`.
- Fixed a real CSS Grid bug in that restored section: percentage grid
  columns were letting the cards' own content force them wider than their
  share, pushing the last two cards past the edge. Fixed at the root with
  `minmax(0, ...)` on each track — see CLAUDE.md's Layout Conventions for
  the general lesson.
- Set up SSH-key based deploy (see below) so sessions can push+deploy
  without any password ever touching the repo or chat.
- Automated the two-device continuity workflow itself: CLAUDE.md now
  instructs any session to auto-pull + read this file at session start,
  and to auto-refresh + push this file at session end — so switching
  between devices shouldn't require manually recapping anything anymore.
  (See the SharePoint warning above — this workflow's assumption of "git
  push/pull is the only sync mechanism" turned out not to hold.)
- Generated a fresh SSH deploy key on the work machine
  (`~/.ssh/id_ed25519`, no passphrase). **Deploy access confirmed working**
  as of 2026-08-07, after Andrew re-whitelisted this machine's IP — it had
  timed out/been refused on port 2683 twice in one session even without
  any config change here, so the VentraIP IP allowlist seems to need
  re-confirming periodically, not just once per machine. If deploy ever
  times out or gets connection-refused again, that's the first thing to
  ask Andrew to check before assuming something's actually broken.
- Redesigned "How engagements are structured" (Section 2) per a supplied
  mockup: removed the wrapping white card entirely, grew the step icons
  from 36px badges to 112px white circles (now with 68px icons inside,
  doubled again per follow-up feedback), redrew 3 of the 5 icons to match
  the mockup's concept (target+arrow, clipboard+check, magnifying glass),
  replaced the small circular number badges with plain bold pink
  zero-padded numerals, and added a dotted connector line with glowing
  chevron arrows between steps. That connector needed real math, not
  eyeballing — the icon circles are narrower than their (text-driven)
  grid columns, so naive percentage positioning was off by 60-90px; fixed
  with `calc()` mixing px and % and verified pixel-exact against actual
  `getBoundingClientRect()` at three viewport widths, not just visually.
  Tagline below it changed from "Short cycles. Honest feedback. Continuous
  improvement." to "Genuine advice and support you can rely on.", and
  moved to sit above the divider line rather than below it.
- Renamed that section's step 3 from "Execute & Communicate" to "Execute &
  Inform" (fits on one line) and replaced its icon — the original
  paper-plane path was geometrically almost centered (bbox center 11.5,11.5
  vs true 12,12) but its asymmetric directional-dart shape still read as
  visibly off-center to the eye. Swapped for Lucide's "send" icon, which
  bbox-centers at exactly (12,12) — a genuine optical-centering issue, not
  a layout bug (worth remembering if another directional/arrow-like icon
  ever looks "off" despite the math checking out).
- **Campfire toggle ("Add a little Vandalist") — built, iterated through
  ~8 versions, and shipped into the real `how-we-work.astro` hero.** No
  longer a placeholder/concept — it's live in production now, sitting next
  to the H1 in a real two-column hero with a mountain-vista SVG background
  behind the whole header+hero. Lives at
  `src/components/CampfireToggle.astro`; `src/pages/campfire-demo.astro`
  is the old standalone preview page — **now redundant since the real
  integration shipped, ask Andrew if it should just be deleted.**
  - Went through a full petal-fan flame redesign (adapted the geometry
    from a CodePen reference, "Campfire — Codevember #15" by Rose Liu),
    then a deliberate simplification (Andrew: one flame that gets
    bigger/faster on toggle, not two flames cross-fading), then a size
    bump, then a real-page integration with the supplied background SVG.
  - **Fixed a 3-part regression** that showed up once it was live: the
    boost transition snapped instead of animating smoothly (root cause:
    size was driven by swapping between two different `@keyframes`
    instead of transitioning a plain value — a running keyframe
    animation always wins over a transition on the same property); the
    whole hero row grew taller when boosted (root cause: the flame's
    stage container was growing its own height on boost, unnecessarily —
    absolutely-positioned children don't need that); and the background
    image visibly glitched during the toggle (same stage-height change
    was forcing the bg image's `object-fit: cover` crop to recompute
    every frame). All three fixed — stage height is now constant, flame
    width is a plain transitionable value per tier.
  - **Fixed the hero background image's crop.** The supplied SVG had
    ~105px of blank/transparent margin baked into its own canvas above
    *and* below the actual drawn scene. `object-position: bottom` was
    anchoring to that blank margin, not the artwork, so the image looked
    like it "stopped" partway up with flat/blank space below. Trimmed
    the SVG's own `viewBox` to the drawn content's real bounds (paths
    untouched) so `object-position: bottom` now means the actual bottom
    of the scene. On wide/short viewports this crops more of the
    sky/mountains — accepted tradeoff, per Andrew ("if the height is cut
    off, so be it").
  - Current hero polish: 50/50 heading/graphic columns (was 40/60), the
    flame+toggle bottom-aligned and nudged ~20px toward the text column
    (was floating centered alone in a wide column), and the toggle's
    "Add a little Vandalist" label recoloured to `--color-slate` (was
    full ink-black) and set in Caveat (a handwritten accent font, added
    via `@fontsource/caveat` — deliberately kept separate from the site's
    Manrope/Jakarta system, used only on this one label).
- **Scrapped the sitewide edge-padding idea.** `Layout.astro` briefly had
  a `pt-1.5/pl-1.5/pr-1.5` wrapper div around every page's `<slot />` —
  a "slight padding border around the whole site." Andrew decided against
  it ("it was a bad idea") — removed entirely, pages run flush to the
  viewport edge again.
- Ran the SharePoint health check from the warning above on a fresh
  session and confirmed the predicted symlink damage had actually
  recurred (`CLAUDE.md` flattened to 0 bytes again, plus a fresh
  `AGENTS-v1.md` conflict copy) — git itself was clean (`fsck` clean, HEAD
  and both campfire files present and correct). Fixed properly this time
  by swapping which file is canonical: `CLAUDE.md` is now the real file,
  `AGENTS.md` a plain-text pointer — see the warning section above for why
  this (rather than just restoring the symlink) actually closes the loop.
- **Standing tool limitation, not a project issue:** the Claude Code
  Browser pane in this environment can't composite/screenshot ("page is
  not compositing frames") — every visual check above was verified via
  DOM measurement (`getBoundingClientRect`, computed styles, grid track
  sizes) or, for the SVG background specifically, by rendering the exact
  crop through `sharp` (already in `node_modules`) and viewing the
  resulting PNG directly. Worth trying a real screenshot again at the
  start of a future session in case this has been fixed upstream — if it
  works now, the DOM-measurement workaround is no longer necessary.

## Known open items

- ~~The how-we-work hero's right-side graphic is a placeholder~~ —
  resolved. It's the campfire toggle + mountain-vista background now,
  live in production, iterated through Andrew's feedback across several
  rounds. See "What's been done recently" above.
- `src/pages/campfire-demo.astro` (the old standalone preview page) is
  now redundant since the real integration shipped into
  `how-we-work.astro` — **ask Andrew if it should be deleted**, don't
  delete it unilaterally.
- Services, Case Studies, and Resources pages don't exist yet. When they
  do: Services should get the same "secondary hero" treatment as
  how-we-work; Case Studies/Resources are expected to be blog-style listing
  pages, not hero pages — design that once there's real content to work
  against, not preemptively.
- **SharePoint-vs-git architecture conflict — the CLAUDE.md/AGENTS.md
  symlink-flattening symptom is fixed (see warning above), but the broader
  question is genuinely unresolved.** Andrew is aware and understands the
  mechanism but hasn't decided between moving the repo out of the synced
  folder vs. staying disciplined about not running both machines' sync
  clients at once. Don't make this call unilaterally in a future session —
  ask first.
- ~~Deploy not yet confirmed working~~ — confirmed working, see above. The
  IP allowlist has needed re-whitelisting more than once in one session
  though, so don't assume a connection timeout means something's broken.
- The Browser pane's screenshot/compositing is currently broken in this
  environment (see the tool-limitation note above) — every visual check
  on the campfire/hero work this session was done via DOM measurement or
  an independent `sharp` render instead of an actual screenshot. Not a
  project issue, but worth flagging to Andrew if a future session hits
  the same wall, and worth re-testing since it may get fixed upstream.

## Working across two devices

Andrew switches between home office and work office, both running Claude
Code, and wants to never have to re-explain context when switching. There's
no sync of the actual conversation/session between separate local Claude
Code installations — but this is handled automatically now, not manually:

- **Start of session:** per CLAUDE.md, any session opening this repo
  automatically runs `git pull` and reads this file first — no need to ask.
- **End of session:** per CLAUDE.md, when Andrew signals he's wrapping up
  (or a session naturally concludes), the active session automatically
  updates this file's "recent work"/"known open items" and pushes it —
  again, no need to ask. Still-unresolved/undecided threads should get
  written down as the actual open question, not just "TODO."
- The one thing that's still on Andrew, not automated: if he switches
  devices *mid-session* without a natural wrap-up point, the in-flight
  thread won't be captured unless he asks for a refresh first or just
  recaps it himself on the other end.
- Don't bother trying to sync Claude's local memory files between
  machines — treat those as disposable per-machine scratch notes; CLAUDE.md
  is the actual durable record.

## One-time setup on a new machine

1. **Node**: v20.20.2 is pinned (host limitation — see CLAUDE.md). If using
   nvm, `nvm install 20.20.2` / `nvm use 20.20.2`.
2. **Git identity** (repo-local, not global):
   ```
   git config user.name "Andrew Knight"
   git config user.email "andrew@vandalist.com.au"
   ```
3. **SSH deploy key**: generate a fresh one on this machine —
   ```
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
   ```
   then add the public key via cPanel's SSH Access panel for the
   `vandalis` user (VentraIP host). Don't reuse/copy the key from another
   machine unless you specifically want one shared identity across
   machines — a fresh key per machine is the normal flow here.
4. **Dev server**: `.claude/launch.json` isn't committed (it bakes in a
   machine-specific Node path) — recreate it pointing at this machine's
   Node/npm, per the pattern in CLAUDE.md's Development section.
