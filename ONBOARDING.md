# Vandalist site — onboarding / continuity guide

Snapshot generated 2026-10-13. This is a "where we left off" briefing, not a
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
  tokens in `global.css`) and applied it across every page.
- Set up SSH-key based deploy (see below) so sessions can push+deploy
  without any password ever touching the repo or chat. **Confirmed
  working**, exercised for real multiple times now — see "Known open
  items" for the one recurring gotcha (dynamic IP, needs periodic
  re-whitelisting, not a sign anything's broken).
- **`how-we-work.astro` is now considered complete** (Andrew: "this page
  is now completed enough that we can move on"). Long iteration history
  condensed — see git log (`git log --oneline -- src/pages/how-we-work.astro`)
  for the full blow-by-blow if archaeology is ever needed:
  - The "Add a little Vandalist" campfire toggle went from concept →
    ~8 design iterations → shipped into the real hero, replacing the
    original placeholder graphic. Lives at
    `src/components/CampfireToggle.astro`.
  - "How engagements are structured" got a full icon/connector-line
    redesign per a supplied mockup, then that same connector pattern was
    extracted into a shared `CadenceSteps.astro` component (see below —
    a second page needed it at a different step count).
  - "How we fit in" simplified: dropped four corner labels entirely,
    replaced with one sentence in the center circle; enlarged that
    circle; cleaned up the decision-making table's background/border
    treatment.
  - Fixed a real mobile bug found along the way: `Heading.astro`'s
    `noWrap` prop forced `whitespace-nowrap` at every breakpoint
    (including mobile, where its only consumer — ProofGrid's heading —
    had no room for it), causing sitewide horizontal scroll on phones.
    Now `sm:whitespace-nowrap`. Unrelated to how-we-work itself, just
    surfaced while working on it.
  - Explored a "grunge/distressed" texture treatment for the new cadence
    icons (CSS filter + SVG feTurbulence) per Andrew's request, then a
    two-tone recolour approach after the filter version didn't land —
    **Andrew ultimately decided not to pursue either** ("spending two
    hours on that when the increase in value is so minimal"). Both demo
    pages (`icon-texture-demo.astro`, plus the `-2tone` icon assets) are
    now dead experiments, same situation as `campfire-demo.astro` below —
    **ask Andrew before deleting**, don't assume.
- **Started the services pages — 4-5 planned, first one shipped:**
  `src/pages/services/google-social-ads.astro` (Google Ads management),
  built from a supplied full-page mockup plus a second mockup that
  specifically replaced the process section. Sections Andrew blue-
  scribbled out in the mockup use the site's shared template chrome
  (`CtaBand`, `Footer`) rather than custom markup — that's the intended
  pattern for the remaining service pages too, not scope that got cut.
  - Extracted `CadenceSteps.astro` from how-we-work.astro's process
    section since this page needed the same "numbered circle + dotted
    connector" pattern at 6 steps instead of 5. Connector math is now
    derived from `steps.length` generically; `gridClass` and
    `connectorBreakpoint` are passed explicitly by the calling page
    (Tailwind's static scanner can't see classes built from a runtime
    array length, and the connector's visibility breakpoint has to match
    whichever breakpoint the grid actually becomes a single row — mixing
    those up was a real bug caught during verification, not theoretical).
  - Hero has **no decorative graphic yet, deliberately** — Andrew wants
    something more meaningful than a placeholder and is still thinking
    about what. Don't add a placeholder graphic without asking.
  - Hero now matches Home's exact button style (paper bg, border, orb +
    shadow-orb) and dropped its eyebrow, per follow-up feedback that it
    should read closer to Home's hero rather than introduce a new style.
  - "Results that matter"'s reporting section is a deliberately static
    illustrative card (hardcoded numbers, non-functional dropdowns) — not
    a real interactive dashboard, confirmed with Andrew before building.
    Its "See reporting example" link was upgraded from plain text to a
    proper pill button (icon badge + shadow + hover lift) per feedback
    that the plain link undersold it.
  - **Open question for Andrew, not yet resolved:** Header.astro's nav
    already links here as "Google & Social Media Ads", but the actual
    page content is Google Ads only — no social ads content anywhere.
    Worth asking whether that nav label should become "Google Ads", or
    social content is meant to land on this same page later.
- **Google Ads page, round two — real icons + layout rework, all live:**
  - Service cards, "How this typically works" steps, and "Who it's for"
    all got their real supplied icon assets (public/google-ads-icons/) in
    place of the placeholder inline icons — mix of SVG (flat, brand pink
    `#ff3d6a`) and PNG (the 6 process-step icons are glossy 3D renders, a
    deliberate style departure from every other icon on the site — Andrew
    supplied them knowing that, flagged not fixed).
  - Two of those 6 process-step icons arrived as images pasted directly
    into chat rather than file attachments (no path to read) — turned out
    Andrew had already saved them to `Assets/Google Ads/` as
    `Targeting.png`/`Setup.png`/`Creating.png`/`Launch.png`/
    `Optimisation.png`/`Reporting.png`; found them by searching common
    folders rather than asking him to re-attach. Worth remembering:
    "I pasted a picture in chat" and "I attached a file" aren't the same
    thing here — only the latter leaves something on disk to read.
  - "Our approach" rebuilt from a flat 9-item checklist into three
    grouped phases (Plan/Build/Improve), each with its own icon+blurb and
    a 3-card row of that phase's deliverables — per a supplied layout
    mockup. Needed two follow-up passes to get the spacing right: first
    attempt capped the card row's width, which fixed the cramped-card
    symptom but created dead space at the panel's true right edge instead
    (wrong-directioned fix — narrower isn't the same as "positioned
    correctly"). Second pass widened the label column and trimmed
    icon/padding overhead instead, verified with real measurement (line-
    wrap count per item, gap-to-panel-edge) rather than eyeballing either
    time — first fix logically also created less card space, but the
    measurement-vs-eyeball lesson generalises regardless of which fix.
  - "How this typically works": dropped the white circle behind each icon
    (looked wrong once populated with the 3D-render icons specifically)
    in favour of the bare icon + a soft drop-shadow. Added as a
    `CadenceSteps` prop (`iconContainer="bare"`, defaults `"circle"`) —
    verified how-we-work.astro's own cadence section is unaffected.
  - "Who it's for": retitled/reordered to Trade services / Professional
    services / Ecommerce and retail (descriptions deliberately left
    mismatched for now, Andrew's rewriting those separately later), and
    enlarged the icons ~3.3x with their badge squares removed — same
    treatment as how-we-work's "how we fit in" icon.
- **Google Ads page, round three — fixed the "Our approach" grid overflow
  properly this time, and widened the circled label column Andrew asked
  for.** Root cause: `grid-cols-[34%_66%]` had no `minmax(0,...)`
  protection — the exact CSS Grid gotcha already documented in CLAUDE.md,
  a second occurrence of it. The 66% column's own content was forcing it
  wider than its declared share, a measured 40px overflow past the
  panel's own padding — that's why the cards read as crammed against the
  dark panel's right edge in Andrew's screenshot. Fixed with
  `minmax(0,34%)/minmax(0,66%)`. While widening the Plan/Build/Improve
  label column (120px → 170px) found a *second*, smaller instance one
  level down (the 3-card mini-grid per phase row was plain `grid-cols-3`,
  no `minmax(0,...)` either) — fixed that too. All verified by
  `getBoundingClientRect()`/`scrollWidth` measurement at 390/1024/1774px,
  not eyeballing.
  - **Not fully resolved, flagged rather than fixed:** at exactly 1024px
    (the tightest point — right where the two-column split first kicks
    in on `lg:`), a couple of the longer phase-item phrases still overflow
    their card by up to ~25px, regardless of label width chosen. Rough
    math says this predates this session's changes (already present at
    the original 120px label). Invisible at the widths Andrew's actually
    looking at, didn't block the ask, not chased further — but don't be
    surprised if it comes up later.
- **"Question pile" for the Google Ads hero's empty graphic slot — now
  live on the real page, not just a demo.** Concept: a burst of anxious
  questions piles up fast (deliberately overwhelming), then clears to one
  calm resolution line ("We handle all of this for you."). Lives at
  `src/components/QuestionPile.astro` (reusable) +
  `src/pages/question-pile-demo.astro` (standalone preview, still useful
  for isolated testing since the real integration only shows md+ — see
  below). Iteration history, condensed (see git log on
  `QuestionPile.astro` for the full blow-by-blow):
  - **v1:** Andrew supplied a CodePen-style code bundle (mattdesl's
    "codevember" day 9) as a mechanic reference. It turned out to be a
    minified browserify build — fetched the real unminified source from
    GitHub rather than guessing from the minified version, and found it
    renders vector icon *silhouettes* with a jittery hand-sketched
    multi-stroke outline, a technique that only stays legible on simple
    icon shapes, not sentences. Rebuilt the underlying *idea* (rapid
    reveal across a bounded area, click to restart) from scratch as
    plain DOM+CSS chips instead, in Caveat (the campfire toggle's
    handwritten font) — scattered burst placement (~42 chips at once).
  - **v2:** per a reference sketch Andrew supplied, rebuilt as one
    question at a time, arrow-cued, landing in one spot with growing
    rotation. Font switched to Anton (new `@fontsource/anton`) for a
    bold "stamped headline" look. Found and fixed a real bug while
    verifying (predates v2, silently affected v1 too): `.qchip` elements
    are created via `document.createElement`, so they never get Astro's
    `data-astro-cid` scoping attribute — its scoped `<style>` rules were
    matching nothing. Split into a separate `<style is:global>` block.
  - **v3:** per feedback after seeing v2 live — arrow was only mockup
    shorthand, removed entirely; v2's landing spread was actually a
    radial fan (jitter outward from one point), not a real pile, reworked
    into genuine vertical stacking (each chip rises a step higher than
    the last); chips now alternate Anton/Caveat at randomised sizes for
    more chaos.
  - **v4 (current) — integrated into the real hero.** Per Andrew: "we'd
    need to get it set to the right size and speed on the page to really
    see how it works." `google-social-ads.astro`'s hero now matches
    Home's darker `bg-paper-dim` band + two columns (was single-column,
    no graphic) — hidden below `md`, same convention as the campfire
    toggle. Tuned per feedback: 8 chips → 24 (the whole question set),
    650ms/chip → 160ms/chip, noticeably larger type, and the pile now
    genuinely builds to the top of its box before resolving — "a heap
    more questions that come down a lot quicker... build right up to the
    top of the area." That last part took three real attempts, each one
    caught by actually testing rather than trusting the fix: a fixed
    stage-height fraction clipped on long text at large fonts; a
    trigonometric per-chip bounding-box prediction *also* clipped
    (predicting which axis a `translateY` moves along inside a transform
    list that also has a `rotate()` is genuinely fiddly); what actually
    worked was applying a candidate position, reading its real
    `getBoundingClientRect()`, and correcting against *that* — which then
    exposed a second bug (adjusting `--rise` a second time while `.is-in`
    was already applied silently starts a real CSS transition, so a
    second correction pass could measure a mid-transition, not final,
    position — fixed by forcing `transition: none` for the whole
    measure/correct cycle).
  - **New Browser-pane limitation found while chasing that:**
    `requestAnimationFrame` never fires in this environment at all
    (confirmed via a direct probe) — not just that transitions freeze
    mid-flight (already known). Every chip's double-rAF pop-in trigger
    never runs here, so on-pane testing has to manually force the
    `.is-in` class (with `transition: none`) to inspect a chip's real
    settled position rather than trusting a natural page load. Added to
    the standing Browser-pane note below.
  - **Where it stands:** Andrew saw v4 live on the real page and said
    "This is pretty good thanks. Let me ponder and come back with proper
    feedback." — a genuinely positive but *not yet final* signal. He has
    not given specific follow-up notes yet.
- **Google Ads hero height matched to Home's, plus two spacing/copy fixes
  — all live.** Andrew measured (on his own screen) Google Ads' hero+nav
  at 736px vs. Home's 706px and asked for a "universal hero rule."
  - Root causes, found by measuring both pages at 1440px rather than
    guessing: (1) `QuestionPile`'s `.qpile-stage` had grown to 480px tall
    in an earlier session (vs. the text column beside it at 370px) —
    trimmed to 370px/280px (desktop/mobile) to match. (2) Google Ads' H1
    is ~60% longer than Home's and still wraps to 3 lines at any
    reasonable column width within the two-column hero, so its text
    column is inherently 370px tall vs. Home's 322px.
  - **Not a reusable "universal rule" yet — a page-specific number.**
    Rather than reuse Home/how-we-work's literal `lg:py-32`, which would
    have made the overshoot worse, this page's hero padding was
    hand-tuned to a custom `lg:py-[104px]` specifically to land on
    Home's exact 578px/706px total given its taller content. **Flagged
    to Andrew but not yet resolved:** if a future page's H1 is long
    enough to wrap differently, this exact padding number won't
    transfer — there's no shared component/utility enforcing hero
    height sitewide yet, just consistent manual measurement per page.
    Worth deciding later whether that's worth building (e.g. a `Hero`
    wrapper component) once there are more service pages to compare.
  - Merged the "What's included" Plan/Build/Improve labels from a bold
    heading + separate small description into one small sentence (e.g.
    "**Plan:** We research and plan with purpose.") per Andrew's
    annotated screenshot example.
  - **Real bug caught from a follow-up screenshot, not eyeballing:**
    the service-cards section right after the hero had only
    `pb-16 md:pb-20` and no top padding, so it sat hard against the
    hero's colored band with zero gap — looked broken. Andrew's first
    phrasing of this ("no margin against the hero border... stay
    attached") was initially misread as *confirming* the flush
    attachment was correct; he clarified it was the opposite. Fixed
    with `pt-16 md:pt-20` (matching this page's own established
    `pb-16 md:pb-20` rhythm, not Home's literal `pt-24`), giving an 80px
    gap, verified by measuring the actual content's top offset (not the
    padded `<section>` box, which reports 0 either way).

- **All 5 planned service pages now exist.** The remaining four —
  Marketing Support, Consulting & Mentoring, Websites & Optimisation, AI
  Enablement — were built this session from Andrew's supplied mockups,
  following the pattern google-social-ads.astro established: shared
  Header/CtaBand/Footer chrome, Eyebrow/Heading/PageHeading/SectionHeading
  for typography, CadenceSteps for process sections, darker `bg-paper-dim`
  hero band (matching Home) + an intentionally EMPTY second hero column
  (grid structure present, nothing in it yet) pending Andrew deciding on a
  graphic for each — same "leave it empty, reserve the layout" approach as
  Google Ads' hero originally was before the question-pile concept landed.
  - **Nav renamed, resolving a long-standing open item:** "Google & Social
    Media Ads" → "Google Ads", "Integrations & AI Processes" → "AI
    Enablement". Paths unchanged, label-only, both per Andrew directly.
  - Marketing Support's mockup had a real error — its 4 service cards were
    drawn inside the hero itself; moved to their own section below it
    (matching Google Ads' Section 1 exactly), per Andrew flagging it.
  - **Per Andrew: "Disregard any new colours or inconsistent designs or
    elements"** — applied literally, not just to the initial pass. Several
    mockup elements were simplified rather than reproduced faithfully
    since nothing like them exists elsewhere on the site: a "center circle
    + orbiting satellite cards" diagram idea appeared in BOTH the Websites
    and AI Enablement mockups (3 pillars / 6 AI-helps-here areas) — both
    rebuilt as plain icon+title+description grids instead of introducing
    a new radial-diagram visual language; Websites' bespoke browser-chrome
    wireframe illustration and before/after wireframe thumbnails were
    dropped entirely rather than hand-building new one-off illustrations;
    AI Enablement's icons were drawn in a teal/green the token system
    doesn't have, recoloured to the standard `--color-accent` pink used
    everywhere else. One exception, kept close to as-drawn: AI
    Enablement's before/after workflow comparison uses red/green status
    tags that map exactly onto `--color-bad`/`--color-bad-soft` and
    `--color-good`/`--color-good-soft` — tokens that already existed but
    (per global.css's own comment) had nothing using `--color-bad` yet.
    Genuine reuse of an existing-but-unused token, not a new colour.
  - Marketing Support's "How we fit in" diagram reuses how-we-work.astro's
    exact 3-column visual treatment (dashed-circle centre, inward
    chevrons, tinted side panels) with this page's own labels/content —
    Andrew's mockup showed a purple tint for the "Other suppliers" panel,
    which doesn't exist in the token system (only pink/green tinted panels
    do), so it's neutral white/bordered instead (matching the equivalent
    neutral panel in how-we-work.astro's own version).
  - **Found and fixed a real, previously-undetected bug while verifying
    colours on the new pages — already shipped and wrong on the LIVE
    site, not something introduced this session.** Any Tailwind color
    utility using an arbitrary `var()` reference PLUS an opacity modifier
    (`border-[var(--color-good)]/20`, `bg-[var(--color-accent)]/15`, etc.)
    silently generates no CSS at all, since Tailwind can't compute an
    alpha-blended colour from a variable it can't read at build time — the
    element just falls back to the browser's plain gray default border.
    This exact pattern was already live in 6 files (`CadenceSteps.astro`,
    `CoverageTable.astro`, `HelpGrid.astro`, `HowWeWork.astro`,
    `how-we-work.astro`, and — as first drafted — the new
    `marketing-support.astro`), 21 total instances, unnoticed because the
    visual difference (default gray-200 vs. the intended tinted border) is
    subtle, and because this session's verification approach has mostly
    been DOM-measurement-based rather than colour-comparison-based. Fixed
    all of them with literal precomputed `rgba(r,g,b,a)` values instead of
    the `var()`+opacity combination, and documented the gotcha in
    CLAUDE.md right next to the existing (related) shadow-var gotcha.
    **If a base color token's hex ever changes, grep for its rgb-
    equivalent across the codebase** — these can't stay automatically
    derived from the token, that's the actual tradeoff of this fix.
  - **Also found and fixed a second, unrelated pre-existing bug while
    re-verifying:** how-we-work.astro's "Decision-making & accountability"
    grid (`lg:grid-cols-[34%_66%]`) had no `minmax(0,...)` protection —
    the same CSS Grid gotcha already documented in CLAUDE.md, a fourth
    occurrence of it now, causing the decision-making table to overflow
    its column by 40px on the live page (not clipped/visible since it had
    room to bleed into the page's own margin, but genuinely not respecting
    its declared grid track).
  - Both prior service pages (Google Ads, and this session's Marketing
    Support/Consulting & Mentoring) also got the same darker `bg-paper-dim`
    hero-band treatment applied retroactively, per a direct follow-up
    request from Andrew ("Both need the darker background in behind the
    heros please") after seeing them live.

- **SEO & AI Search Optimisation page shipped; AI Enablement's hub section
  rebuilt three times chasing the right pattern — now settled on a shared
  `SystemDiagram.astro` component, matching Andrew's actual mockup.**
  Sequence, since it's a real lesson for the "documented style" goal:
  1. Built `HubDiagram.astro` (connector-line hub-and-spoke — center circle,
     6 cards, dotted SVG lines) for both AI Enablement's "Where AI actually
     helps" and the new SEO page's "How SEO and content work together",
     per Andrew's mockups for both.
  2. Andrew articulated a durable design principle worth remembering for
     any future page: **a new visual element only earns its place if it
     conveys a genuinely different relationship than an existing pattern
     would — not just the same message via a different tool.** Applying
     it, we agreed a center-hub-with-6-equal-items diagram doesn't say
     anything a flat grid doesn't (contrast with how-we-work's "How we fit
     in", where Vandalist visually sitting *between* two parties is a
     relationship a grid genuinely can't show). He confirmed reverting
     both to plain grid.
  3. **Correction, before that revert even shipped:** Andrew pointed at
     about.astro's existing "A small team. A complete ecosystem." section
     (stable 3-column grid, hub + flanking cards, no connector lines) as
     his actual preferred model — since it already exists, reusing it
     isn't "a new design element" at all, so it's the most consistent
     choice under his own rule. `HubDiagram.astro` deleted; its layout
     extracted from about.astro as shared `SystemDiagram.astro` instead,
     wired into both pages.
  4. **Two real bugs found only after Andrew flagged the live page as
     wrong, both worth the process note:**
     - First pass forced AI Enablement/SEO's 6 items into about.astro's
       full 8-slot shape (2 left + 2 right + a card flanking the hub above
       *and* below) since that's what about.astro itself uses. Andrew's
       mockup showed the correct shape for a 6-item case is plain 3-left/
       3-right with the hub alone in the middle — `topCard`/`bottomCard`
       made optional on `SystemDiagram` (about.astro's own 8-card usage
       untouched) and both pages corrected to 3+3.
     - Even after that, Andrew said the live page "looks nothing like the
       mockup, every section is wrong." Every DOM/content/structure check
       said otherwise — turned out to be real, just invisible to
       text-based checks: each card had been collapsed to a single
       `--color-slate` (muted grey) line, matching about.astro's terser
       one-line card style, instead of a bold `--color-ink` title +
       description like the actual mockup shows. That single missing
       bold-text hierarchy read as the whole page being washed-out next
       to Andrew's mockup, even though every other section already had
       correct dark text. Confirmed via `getComputedStyle` color checks
       (not a screenshot — see standing Browser-pane limitation below),
       fixed by making `title` optional on `SystemDiagram`'s Card type.
     **Process lesson:** when a user says "this looks nothing like X" and
     structural/text checks say it matches, don't conclude the user is
     wrong — check actual computed colors/weights next. A component can be
     structurally identical and still look completely different if text
     hierarchy (bold title vs. muted single line) is off.
- **Three more commits landed from the other machine right after the
  SystemDiagram work above, while this machine's session kept running —
  worth reading in full since a prior open item above is now resolved by
  them:**
  - **Nav pixel-shift fixed sitewide + AI Enablement renamed and moved.**
    Root cause: pages without a vertical scrollbar centered their
    `max-w-7xl` containers ~7px further right than pages with one (a
    viewport-width-vs-scrollbar artifact, not a Header.astro bug) — fixed
    with `scrollbar-gutter: stable` on `html` in `global.css`, so every
    page reserves the same width regardless of its own content height.
    Separately, **the AI Enablement page moved**:
    `src/pages/services/integrations-ai-processes.astro` →
    `src/pages/services/ai-enablement-for-marketing-teams.astro`, nav
    label now "AI enablement for marketing teams", live URL now
    `/vandalist-2.0/services/ai-enablement-for-marketing-teams/` (old URL
    now 404s, confirmed). Update any bookmarks/links to the old path.
  - **AI Enablement rebuilt further, "Where AI actually helps" explicitly
    left alone** — resolves the open item above about whether Andrew
    confirmed the SystemDiagram fix: he came back with follow-up feedback
    on the OTHER two sections instead, and the commit message states
    "Where AI actually helps stays untouched" — a decent signal the hub
    section itself is settled, though still not an explicit "yes that's
    right" from him. "A practical enablement system..." (previously the
    section Andrew said not to touch at all) got rebuilt into the
    mockup's 3-column grid with bare icons — Andrew revisited that
    decision himself on this later pass, not a contradiction of the
    earlier instruction. "From manual and messy..." became an actual
    connected flow diagram (bordered step cards, dashed connector arrows,
    red pain-point marks, a center "transform" arrow) replacing the
    earlier plain two-list version. One flagged simplification kept: the
    row 1→row 2 corner connector is a straight vertical drop, not the
    mockup's diagonal jump between columns.
  - **Websites & Optimisation rebuilt further too:** "Three pillars" got
    a real hub-and-spoke diagram (center + 3 satellites + dashed
    connectors) — **deliberately didn't reuse `SystemDiagram`**, since
    that component assumes an even 3-left/3-right split and this mockup's
    3 satellites sit in an asymmetric radial arrangement, a genuinely
    different shape (good judgment call, not a missed reuse
    opportunity). Brought back a browser-chrome wireframe illustration
    (new shared `src/components/BrowserMockCard.astro`, static/decorative)
    for "Everything your website needs..." and a small Before/After
    wireframe pair for "Better structure..." using the same component —
    both previously simplified away, now restored per Andrew wanting
    them matched more closely to the original mockup.
  - **Two-device note, not a problem, just worth recording:** these
    commits were made and pushed (and deployed — verified live) by the
    other machine's session while this machine's session was still
    active and had already written its own ONBOARDING.md refresh. Andrew
    left that other session without explicitly telling it to wrap up,
    then asked here whether that mattered. It didn't — everything it did
    was already committed, pushed, and deployed by the time this was
    checked (`git fetch` + `git log HEAD..origin/main` showed nothing
    pending). The only thing this machine's session couldn't have known
    about automatically was catching this doc up after the fact, which
    it then did by reading the other session's commit messages/diffs
    directly rather than needing Andrew to relay anything.
- **Case Studies section built — a genuine content system, not two
  hard-coded pages, per a detailed written brief Andrew supplied.** Live
  at `/case-studies/` (archive) and `/case-studies/<slug>/` (template).
  - **Content collection** (`src/content/case-studies/*.md` +
    `src/content/config.ts`, zod schema) is the actual point of this
    build: every body section (situation/problem/findings/workstreams/
    reasoning/outcome/evidence/quote) is optional beyond the intro
    basics, so a case study with just a summary and outcome is a fully
    valid page — this is what makes "give Claude the project info in
    chat, it drafts a structured content file" (the future workflow
    Andrew described) actually work, rather than forcing every future
    case study through a fixed template shape.
  - `src/lib/services.ts` is the single source of truth for the 6
    service tags/keys feeding the zod enum, the filter bar, and card tag
    pills — deliberately separate from Header.astro's nav labels (the
    nav says "AI enablement for marketing teams", but the case-studies
    tag/filter, matching Andrew's own mockup, just says "AI Enablement").
  - `src/lib/caseStudies.ts`: `getRelatedCaseStudies` scores by
    overlapping `services` tags (manual `related` frontmatter override
    wins if set), `getFeatured` picks whichever entry has `featured:
    true` (falls back to most recent).
  - Archive: quiet intro (no bespoke CTA, per brief), one pinned featured
    editorial card (not part of the filterable grid), single-select
    filter bar (vanilla JS, no query params/search/multi-select — brief
    explicitly said not to over-build this), **2-column** grid — the
    brief explicitly preferred 2-col over the mockup screenshot's 3-col
    for more room per card, a deliberate deviation from the screenshot
    in favour of the written brief.
  - **Content-seeding decision, flagged rather than silently made:**
    Andrew's mockups name specific real-sounding organisations (Gladstone
    Regional Council, QUTeX, etc.) with specific stats. Built Gladstone
    Regional Council as the one fully fleshed-out example, using the
    copy the mockup already showed verbatim (Andrew's own supplied text,
    not invented). The other 6 (CQ Building Approvals, Carbrook State
    School, QUTeX, Retail HQ, Capricorn Enterprise, Precision Group) are
    **deliberately minimal** — summary + tags only, no invented context/
    problem/findings/reasoning paragraphs — since the brief's "never
    invent metrics/facts" rule seemed too important to soften even for
    scaffolding content about what might be real clients. **These 6 need
    Andrew to flesh them out (or explicitly ask for more) before they're
    genuinely done** — flagged in chat, not yet actioned further.
  - No real case-study photography exists yet — every entry currently
    renders `CaseStudyImage.astro`'s placeholder branch (tinted block,
    same "reserve the layout, add the real asset later" convention as
    every other empty graphic slot on this site). Add a `featuredImage`
    path to any entry's frontmatter once a real photo exists.
  - Verified: build succeeds (21 pages total), no console errors, no
    horizontal overflow at 375/1265px, filter bar shows/hides cards
    correctly by service tag (checked via `classList`/`dataset`, not
    just eyeballing), related-case-studies scoring double-checked by
    hand against the tag overlaps, a minimal entry (Precision Group)
    confirmed to render cleanly with no broken/empty sections.
  - Nav's "Services" (`/services`) and "Resources" (`/resources`) links
    are still dead ends — pre-existing gaps, not introduced by this
    session, out of scope for the case-studies ask specifically.
- **Header.astro nav redesign — services flyout + a new hover effect,
  confirmed live and settled (not a pending thread).**
  - Services dropdown rebuilt per a supplied mockup: each item now shows
    an icon square + bold title + short explainer line, not just plain
    text. Default state is a neutral grey icon square + ink title;
    hovering a single row switches just that row (icon square + title)
    to the accent-pink treatment — matches the mockup, which only pinked
    out its one highlighted example row, not the whole panel. Needed a
    named Tailwind group (`group/item` on each `<a>`) since the panel's
    own reveal was already driven by the outer `<li>`'s unnamed `group`.
    Reveal animation upgraded from a hard opacity cut to fade + slight
    rise/scale, using opacity/pointer-events rather than `invisible` so
    the animation isn't undercut by a mid-transition visibility snap.
  - New primary-nav hover effect, per a CodePen Andrew supplied (single
    shared `.dot` sliding via hardcoded per-link `translateX`, yellow,
    dot below the label): reworked rather than ported directly, since
    that technique assumes fixed-width fixed-position links and this
    nav's labels are variable-width and wrap responsively. Each nav item
    now gets its own small dot instead, shown via CSS opacity/scale on
    hover — works regardless of label width or breakpoint, no JS needed.
  - **First attempt also moved the active-page indicator itself from the
    underline to the same dot, permanently shown — Andrew tried it and
    asked to revert just that part:** "the active page will have the
    little red ball above it... when we hover on other menu items, the
    same red ball appears... looks a bit silly." Reverted cleanly with
    `git revert` (single commit, applied cleanly since it was the tip of
    `main`) — active pages are back to the pink underline below, the new
    hover-dot above stays for hover-only on everything else. Worth
    remembering as a UX lesson, not just a one-off: reusing one motif for
    two different meanings (state vs. interaction) can read as broken
    even when each half works correctly in isolation.
  - **Testing this surfaced a new standing Browser-pane limitation**,
    documented below under the existing transition-freeze note: synthetic
    hover registers `:hover` correctly at the DOM level but
    `getComputedStyle` reports pre-hover values for any transitioning
    property — confirmed against an already-shipped hover effect too, so
    it's a pane limitation, not new-code-specific. Workaround (inject
    `transition: none !important`, then hover, then read) is documented
    in the Browser-pane limitations list.
- **The remaining 5 service-page heroes matched to Home's 706px; two
  flush-card fixes; Marketing Support got a real hero graphic (twice).**
  Andrew measured 626px on his own screen (Marketing Support, Consulting
  & Mentoring, Websites & Optimisation, SEO & AI Search Optimisation, AI
  Enablement — every service page except Google Ads, which got this fix
  in an earlier session) and asked for consistency.
  - Same approach as Google Ads: measured each page's actual hero-content
    height, then computed the exact `lg:py-[Npx]` needed to land on
    Home's 578px hero / 706px total, rather than reusing one literal
    class everywhere. Marketing Support/Consulting & Mentoring (370px
    content) → `lg:py-[104px]`; Websites & Optimisation (342px) →
    `lg:py-[118px]`; SEO & AI Search Optimisation (322px, matches Home's
    own) → `lg:py-32` (Home's stock value); AI Enablement (294px content,
    under the `min-h-[322px]` floor) → `lg:py-32` too — **first pass on
    this last one got the padding math wrong** (computed against the raw
    294px content height, not accounting for the min-height floor
    actually binding at 322px once added), measured 734px, caught and
    corrected via the same measurement discipline rather than trusting
    the arithmetic blind.
  - Marketing Support and Consulting & Mentoring were also missing the
    top padding on their first section (the same flush-against-the-hero-
    band bug fixed on Google Ads previously) — added `pt-16 md:pt-20`.
    Websites/SEO/AI Enablement already had this from their earlier
    mockup-rebuild pass.
  - All 5 verified at exactly 706px via `getBoundingClientRect`, no
    horizontal overflow at 390/1024/1440px, no new console errors —
    confirmed again on the *live* site after deploy, not just locally.
  - **Marketing Support's empty second hero column got a real graphic —
    twice, same day.** First pass: Andrew supplied a CodePen ("Interactive
    Eggs-ercise" by Chris Gannon, MIT licensed) — an egg-shaped character
    running on a treadmill with a barbell nearby, speed controlled by a
    draggable slider. Built `EggRunner.astro`, recoloured to the site's
    tokens by tracing every fill/stroke colour to its actual layer name
    first (not guessed blind) rather than using the Pen's original blue/
    orange/gold palette, and made its full-frame sky-blue background
    transparent rather than recoloured, so it sits on the hero band
    directly. New deps: `lottie-web` + `gsap` (incl. Draggable).
  - **Andrew came back after seeing it live: the egg shape read as
    confusing on a marketing page.** Rather than just asking me to
    recolour differently, he supplied a second CodePen (Bram van Dijk's
    "Running Dude", also MIT) and asked to keep the treadmill setting but
    drop the egg and the barbell/weights. Swapped in
    `TreadmillRunner.astro`: same recolour-by-tracing-each-layer approach
    (this one was actually easier — Bram had already hidden his own
    background solid and all the rig's control nulls in the source, so
    there was no background box to strip this time). **Real framing
    problem caught before shipping, not just a straight character swap:**
    the source canvas is 1920x1080 but the actual character is a tall
    ~587x933 region roughly centred in it (measured via `getBBox`, not
    guessed) — fitting the full canvas into a 4:3 box the way the egg
    component did would've rendered him tiny with huge empty margins.
    Cropped the SVG viewBox to that region at runtime and resized the
    container to match its actual proportions instead. This source JSON
    also has no treadmill/ground of its own (just the runner + shadow +
    footfall dust — the demo Pen's "grass" was a plain CSS background div,
    not part of the Lottie data), so the treadmill deck under him is a
    plain CSS shape built specifically for this component, not ported
    from either Pen (the egg Pen's actual conveyor mechanism, and its
    barbell, are both gone along with the egg character).
  - **Licensing flagged, explicitly not resolved, on both passes:**
    Andrew raised this himself before even the first CodePen went in
    ("I am not sure of the license type but even if it is in place for
    now until I am clear if it will work or not would be good"). Two
    separate licenses are actually in play for either version: the
    CodePen's own code (MIT, permissive, fine) and GSAP itself, added as
    a dependency for the drag interaction — GSAP ships under its own
    "Standard no-charge license" (gsap.com/standard-license), **not**
    MIT. Don't treat this as settled just because it's live; it's
    provisional per Andrew's own framing.
  - **Deploy blocked mid-session on the recurring dynamic-IP allowlist
    issue** (see "Known open items" below) — this time surfacing as an
    active "connection refused" on port 2683 rather than the previously-
    documented silent timeout. Ruled out a general outage first (HTTPS to
    vandalist.io worked throughout) and a stale IP (checked
    `api.ipify.org` fresh each retry — same IP, `1.146.66.98`, every time)
    before concluding it was the allowlist again, not something new.
    Andrew fixed it after being given the IP; deploy succeeded on retry.
    Worth noting for next time: the failure signature can apparently be
    "refused" as well as "timeout" — don't assume it's a different root
    cause just because the exact error text differs.
  - **Andrew asked, as a question not a request, whether Claude could
    "work with a different model" for the egg** before supplying the
    second CodePen — worth remembering the answer given, since it'll
    likely come up again: no image/3D-model generation capability, but
    yes to (a) adapting a different supplied/found existing animated
    asset the same way, or (b) building something simpler directly
    (plain SVG/CSS shapes, no found asset needed) if he'd rather not go
    hunting for another Pen. He chose (a).
- **Contact page formally signed off + footer formalized sitewide +
  orb pulse added everywhere the orb appears.** Andrew's explicit
  sign-off list, all shipped:
  - Contact: dropped the "Contact" eyebrow above the heading; fixed
    heading→subtext spacing to match the site's actual hero pattern
    (`PageHeading mb-6` + `text-lg` subtext — this page had drifted to
    `mb-4`/`text-base`, which is why it read as "too close"); form
    fields now default to the page's own background colour
    (`--color-paper`, not the white the form panel sits on) and turn
    white on focus — verified via computed style with transitions
    neutralized first (same `transition: none !important` workaround
    documented below, since this pane freezes pre-focus values
    otherwise); removed "Project stage" (dropdown + its options array)
    entirely; added a native `<details>` accordion — "Additional
    information (optional, but it all helps)" — holding four new
    fields (Website URL, Approximate budget, Do you have a deadline?,
    How did you find us?), no JS needed, verified closed state is a
    real 58px and expands to 274px on click, not just visually
    collapsed; address/email/response-time updated to Andrew's exact
    wording (single-line address, `promise@vandalist.com.au`,
    "Typically within one business day").
  - Footer: replaced the old 6-col-grid version — whose "Services"/
    "Company" columns were generic placeholder labels, not the real
    service pages or site nav — with a formal 4-column footer:
    logo+tagline+ABN+established-year; real Services links (kept in
    sync with Header.astro's own list **by hand**, not a shared
    import — small/stable enough that duplicating read simpler than an
    indirection layer, but update both if either list changes); a
    Company column (How We Work/About Us/Contact Us/Case Studies/
    Resources — Resources links to `#`, no real page yet, same
    convention as before); a Contact Details column with email/phone/
    address plus 4 social icons (LinkedIn/Facebook/Instagram/YouTube)
    linking to Andrew's supplied URLs. This is the shared `Footer.astro`
    component, so it applies to every page automatically.
  - Orb pulse: per a CodePen Andrew supplied (Florin Pop's "CSS Pulse
    Effect", MIT licensed) — not copied verbatim, the same well-known
    box-shadow-ring technique re-authored against `--shadow-orb`
    specifically (the glow stays constant across every keyframe stop,
    only an added ring layer pulses), deliberately subtler than the
    reference per "only slightly though" (0.97–1 scale, not the
    reference's 0.95–1). One shared `.orb-pulse` class added to
    `global.css`, applied to all 9 `--gradient-orb`/`--shadow-orb`
    usages sitewide (every hero CTA, CtaBand, the contact form) plus
    QuestionPile's resolution dot, rather than duplicating a keyframe
    per file.
  - **New Browser-pane limitation, extending an existing one:**
    confirmed the animation rule applies correctly (`animationName`/
    `animationDuration` both read back right), but couldn't confirm
    actual frame-to-frame visual progression in this pane — sampled
    the orb's computed `transform` twice, 1.4s apart, and got the
    identical value both times. This is the same root "compositing is
    broken" limitation already documented below, just newly confirmed
    to extend to plain always-running `@keyframes infinite` animations,
    not only hover/transition-triggered ones. Standard CSS animation
    semantics aren't in question (this is extremely well-established
    browser behaviour) — it's specifically this pane's rendering
    pipeline that can't show it. **Andrew hasn't yet confirmed the
    pulse actually reads right on the real site** — worth asking if he
    hasn't brought it up unprompted.
  - **Deploy hit a real disk-quota wall mid-session, not the usual IP-
    allowlist issue.** `deploy.sh`'s `git pull` failed with "disk quota
    exceeded" while unpacking objects, so `npm install`/`astro build`
    never ran — but the script's final `echo DEPLOY SUCCESS` prints
    unconditionally regardless of whether earlier steps failed, so the
    terminal output looked like a clean success. **Caught this by not
    trusting that line at face value** — checked `git status`/`git
    fsck` on the host directly (clean, just one harmless dangling
    commit object from the interrupted unpack, no corruption) and
    confirmed via `df -h`/`du -sh ~/*` that the account's 54GB usage
    was overwhelmingly OTHER sites on the same shared hosting account
    (`intranetchrc.vandalist.io` alone at 30GB), not the 39MB Vandalist
    repo. Didn't touch any of that myself — flagged it to Andrew and
    waited; he freed up space (105GB available afterward, up from 79GB)
    and the retry completed cleanly. **Worth remembering for next time
    this comes up: "DEPLOY SUCCESS" in the output is not proof of a
    successful deploy** — this script has no error-checking between
    steps, so a failure partway through can still end with that line.
    Confirm via the actual step output (or just re-check the live site)
    rather than trusting the final line alone. **Confirmed a second time
    this session** (2026-09-08, mid this same batch) — an esbuild service
    crash mid-build on the shared host, same "prints DEPLOY SUCCESS
    regardless" blind spot, caught by independently curling the live HTML
    afterward rather than trusting the script's own output. Do this as
    standing practice now, not just when something feels off.
- **Contact/About/How We Work adjustment batch, all shipped — a longer,
  multi-round session working through Andrew's detailed feedback on 3
  pages he'd flagged as feeling "rushed," using about.astro as the
  intentionality benchmark.** Several real corrections along the way,
  each worth reading in full if picking this back up:
  - **Contact:** the "Additional information" section's `<details>`
    toggle removed — permanently expanded now, same content/layout.
    Later: pink asterisk + `required` added to the 5 actually-mandatory
    main-form fields (Name/Email/Phone/Business name/"What do you need
    help with?"); the 4 optional fields stay unmarked.
  - **About:** the system diagram's "bloaty and disconnected" feel fixed
    with small radial dash marks around the hub — **first pass added just
    2 sparkle marks at the column seams, which Andrew's follow-up
    screenshot showed wasn't the intent; corrected to 8 short dashes, one
    toward each of the 8 surrounding cards, reviving the diagram's own
    pre-simplification "8 nodes, 45deg apart" radial technique** (see the
    file's own historical comment). Partnerships & trust: the intro cell
    now has a dashed --color-paper-dim border + white fill, distinct from
    the 5 plain partner cells.
  - **How We Work, several distinct threads:**
    - Section 1 icons (Responsiveness/Capability/Transparency/
      Accountability) reduced 80px → 60px (25%, as asked).
    - `CadenceSteps.astro` gained two new opt-in props (`circleBg`,
      `shimmerConnector`, both default off) so this page's own cadence
      section could get a darker circle + a slow sliding shimmer sweep
      (same technique as the homepage teaser's `HowWeWork.astro`) without
      touching Google Ads' existing usage of the same component.
    - "How we fit in" fully rebuilt around a supplied mockup: "Your team
      brings / Together / Vandalist brings", with real dashed connector
      lines + arrow-circle midpoints — a deliberately different, bilateral
      relationship from the hub-diagram pattern used elsewhere (About,
      AI Enablement, SEO), so real connector lines are consistent with the
      established "new visual element only earns its place if it shows a
      relationship a grid can't" rule, not an exception to it. The
      "Together" column's height was initially shorter/centered
      (mismatched the mockup) — fixed to stretch to the same height as the
      two side cards, per Andrew's direct correction.
    - **The "Decision-making & accountability" table went through several
      real rounds, each catching something the last one missed — worth
      reading the full commit sequence
      (`git log --oneline -- src/pages/how-we-work.astro`), not just this
      summary:**
      1. Renamed "Tactical"→"Execution", "Your ownership"→"Your
         oversight"; header cells got their own icon + pink/green tint.
      2. Andrew: **"just a plain white table with a couple of highlighted
         cells."** Root cause: every cell had been left with no
         background/shadow/border at all — floating icon+text with
         nothing behind it. Fixed with a consistent tinted first column
         and real white+shadowed cards for the 4 content cells.
      3. A detailed 7-point desktop-only brief followed: widen the intro/
         panel split (34/66 → 28/72, broader+shallower), tighten the
         matrix gap substantially, **remove the content cells' individual
         shadows entirely** (outer container's shadow should be the only
         one), fix the label column to a narrow 152px instead of "auto",
         reduce cell padding so rows hug their content, lock the
         transparency banner to one line at desktop widths specifically.
         All implemented and verified via computed-style checks, not
         eyeballing.
      4. Andrew: **"too flat"** — removing the content cells' shadows
         entirely (step 3) overcorrected. Landed on a middle tier: outer
         container keeps `--shadow-card`; the 4 content cells get a
         hairline border + a new, deliberately soft literal shadow value
         (`0 4px 10px -4px rgba(28,27,26,0.12)`, no existing token matches
         it — flagged as a style-guide candidate, not turned into a new
         named token for one usage); label cells and header cells stay
         flat (tint only, no shadow). This is where it stands now.
  - **The puzzle icon on "Together" — a real process lesson, not just a
    UI fix, and now documented in `CLAUDE.md` under "Recovering an image
    Andrew shared in chat" so it isn't re-learned the hard way again.**
    Two hand-drawn SVG attempts both failed (Andrew, bluntly: "garbage").
    What followed was a long, avoidable back-and-forth: repeated searches
    of the project folder / Downloads / Desktop / scratchpad found
    nothing, and — worse — this got filled in with confident-sounding but
    unverified explanations (claiming the Google Ads icons from an
    earlier session must have been pre-existing files Andrew coincidentally
    had saved, presented as fact rather than a guess). Andrew correctly
    and repeatedly pushed back that he has never needed to manually place
    a file anywhere for this to work, and proved it by pointing at
    `public/how-we-work-hero-bg.svg` — a file that exists ONLY in this
    repo, with no counterpart anywhere in his Assets folder, meaning a
    prior session got a real file through chat alone. **The actual
    mechanism, found by checking this session's own transcript file:**
    every image sent in a Claude Code chat is embedded as base64 directly
    in that session's `.jsonl` under `~/.claude/projects/<project>/
    <session-id>.jsonl` — a small Node script streaming that file,
    finding the image content block, and base64-decoding it recovered the
    exact PNG Andrew had sent. It's now a real asset,
    `public/system-icons/puzzle-together.png`, wired into the "Together"
    card in place of both failed hand-drawn attempts.
- **TreadmillRunner moved pages; Marketing Support's hero rebuilt to match
  How We Work's; How We Work's hero emptied out — a short, focused
  session, one real bug fix in the middle of it.**
  - TreadmillRunner (the running-character hero graphic) moved from
    Marketing Support's hero to Websites & Optimisation's — was that
    page's "deliberately empty" second hero column, now genuinely used.
    Not duplicated — fully removed from marketing-support.astro.
  - **Real bug found and fixed, not guessed at:** Andrew reported the
    runner's "legs are backwards, walks like an alien." Inspecting
    `public/marketing-support-hero/runner.json` directly (comparing
    front-limb vs. back-limb joint layers, which should mirror each
    other) found two corrupted scale values — `front leg::Ankle` was
    `[17882,-16215,100]` (absurd magnitude, negative/flipped height)
    where `back leg::Ankle` was the correct `[100,100,100]`; same pattern
    on `front arm::Wrist`. Reset both to match their back-limb
    counterparts. Almost certainly a casualty of the earlier one-off
    recolour script, not something in Bram van Dijk's original source.
    Fixed in the data itself, so it travels with the component
    automatically — confirmed via the live-served JSON, not just the
    local file. **Nobody has actually watched the animation play** (this
    pane can't render/composite Lottie playback) — worth Andrew's own
    look at the live site to confirm the gait actually reads right now,
    not just that the numbers aren't absurd anymore.
  - Marketing Support's hero rebuilt wholesale to match How We Work's
    hero pattern, per Andrew directly: full-bleed background image behind
    Header+hero (this page's own new `marketing-support-bg.svg`, a
    distinct supplied asset, not a copy of how-we-work-hero-bg.svg), same
    heading/subtext copy, CampfireToggle in the second column. **The
    "Book a strategy call" CTA this page's hero used to have was
    dropped** — how-we-work's hero (the thing being copied wholesale) has
    none, and Andrew's instruction was "the FULL hero" — flagged as a
    judgment call, not silently decided, since a CTA disappearing from a
    service page's hero is a real thing to notice if it wasn't intended.
  - How We Work's hero content removed per "left blank for now, content
    removed" — background image and reserved height kept (still reads as
    a hero band), heading/subtext/CampfireToggle gone. **The page
    currently has no `<h1>` at all** as a direct result (the next heading
    down is an h2) — flagged, not patched with an invented placeholder
    heading, since Andrew said "for now."
  - Deploy hit the dynamic-IP allowlist issue again mid-session (see
    "Known open items" below) — this time Andrew's own cPanel "add IP"
    flow suggested a *different* IP than the one this session reported,
    and he added both rather than picking one. Worth remembering: his own
    browser's outbound IP and this session's outbound IP aren't
    guaranteed to be the same address, so if a re-add doesn't fix a
    timeout, a second IP might be needed too.

- **"Universal changes" round (2026-10-12) — header, nav, CTA band, brand pink,
  Previous Work rename, Australian spelling. All live.** Andrew supplied a
  washed-out mockup (only the relevant parts left visible), answered a
  list of confirm-first questions, then this shipped in one pass:
  - **Logo +66%, desktop only** (48px -> 80px at `lg`+; mobile/tablet logo
    unchanged). Header vertical padding trimmed (`lg:py-6`) so the header
    stays **128px** and the "every hero is 706px total" rule is untouched —
    Andrew approved that trade rather than letting every page grow to 738px.
  - **Nav labels 1rem bold.** This is what forced a breakpoint change: the
    bigger logo + bigger labels need ~970px, and at 768px the labels
    wrapped onto two lines even with tighter gaps. **The full desktop nav
    now starts at `lg` (1024px), not `md`** — below that the compact row is
    used. Measured (not eyeballed): single-line labels, 41px spare, no
    overflow at 1024px.
  - **"Case Studies" -> "Previous Work"** in header, footer, page title,
    eyebrow, back link, "Related work" and the SEO page's link; the route
    moved `/case-studies` -> `/previous-work` (old URL now 404s, nothing
    linked to it). The content collection is still named `case-studies`
    internally (src/content/case-studies) and card CTAs still say "View case
    study" — section is "Previous Work", individual items remain case studies.
  - **"Services" is no longer a link** (it pointed at `/services`, which has
    never existed). It's a button; the desktop flyout opens on hover and on
    keyboard focus (`group-has-[:focus-visible]`). **Mobile/tablet gained a
    tap-to-expand Services list** — previously the compact row's only route
    to the service pages was that same dead link.
  - **CTA band (shared, every page):** left-aligned, small "Brain dump or
    specific requirements:" line, large headline with a rotating pink word
    (direction / support / resources / concepts / clarity), button and band
    background unchanged. Technique is Cruip's MIT "Sliding Text Animation
    with Tailwind CSS" CodePen, re-authored (keyframes in `global.css`,
    `word-slide`); its percentages assume six rows = five words + a repeat
    of the first. Screen readers get one static sentence; reduced-motion
    freezes on the first word. Headline is 28px at md+ so it sits on one
    line like the mockup.
    **Refined the same day after Andrew saw it live** (his three notes + a
    size note), all measured, not eyeballed: (1) pink flecks above some words
    were the tails of p/y from the word above poking into the window — the
    font's ink overshot a 1.2em row by ~1.5px; rows are now 1.5em. (2) Words
    are centred in the window (it's still as wide as the widest word, so the
    sentence doesn't jump). (3) The word sat ~5px low (19px after the row
    change); its lowercase centre line now matches the sentence's within
    0.03px, via `align-[-0.08em]` calibrated from measured baselines — my
    first theoretical value was wrong for an inline-flex box, so trust the
    measurement approach if this is ever retuned. (4) Headline is now 40px
    at xl (36/30/24 below), ~1.35x the section H2 as in his mockup, column
    widened to `max-w-6xl` (text starts ~64px in, like the mockup). Negative
    margins on the word window stop the roomier rows inflating the line.
    **Word list changed afterwards (Andrew): support -> flexibility, clarity ->
    guidance** (now direction / flexibility / resources / concepts / guidance).
    Reason: the words are centred in a window as wide as the widest word, so
    "clarity" (169px) left ~50px of extra space each side next to "resources"
    (270px). Andrew chose swapping words over adding measuring script or
    moving the word to the end of the sentence (that alternative would remove
    the gap problem entirely if the copy ever changes: put the word last with
    no full stop after it). New widths are within 24px of each other
    (246-270px), i.e. ~12px either side. Per-word vertical centring was also
    offered (words differ ~8px in visual centre because of tall letters vs
    tails) and declined as not worth the extra code.
  - **Brand pink changed sitewide: `--color-accent` is now #FF3D6B** (the logo
    colour; was #e8467c). Andrew's call: "FF3D6B is our brand colour and
    used in our logo. So perhaps we need to replace e8467c." Derived values
    were recomputed, not just swapped: `--color-accent-soft` #ffe8ed, orb
    gradient stops #ff6e90 / #db2951, `--shadow-orb` and the orb-pulse
    keyframes (rgba 255,61,107), every literal old-pink hex/rgba in 7 files,
    and the Lottie runner JSON (recoloured via script). **If a future
    session sees #e8467c anywhere, it's stale.** Side effect to be aware of:
    #FF3D6B on the paper background is ~3.3:1 contrast (old pink was ~3.6:1)
    — fine for the large/decorative uses here, but small pink body text
    would be borderline.
  - **Australian spelling:** four American -ize words fixed
    (organizations/Prioritize/Modernized/Specialized -> -ise). Everything
    else containing a Z is genuine (puzzle, lazy, bezier) or a proper noun
    (Zzzopa, Berlitz, Grozdic) and was left alone.
  - Verified by measurement at 390/768/1024/1440 (header height, nav
    wrapping, overflow, hero totals), production build, and then against the
    **live** site after deploy (not just the script's DEPLOY SUCCESS line,
    per the earlier false-success lesson).
  - Deploy access: SSH needed a fresh allowlist entry again (IP 1.146.85.43
    this time); Andrew added it and it connected on the next check.

- **Homepage round (2026-10-12/13): hero swap, How We Work arrows, missing icon,
  logo grid, CTA padding. All live.** Andrew confirmed the plan first, then:
  - **Hero swap.** Homepage now has Marketing Support's old hero: camp-site
    background + the "Add a little Vandalist" CampfireToggle (offsets copied
    verbatim, so at his 1920px mockup width the campfire sits at 59% — an
    exact match). It keeps its own heading/copy and "How can we help?" button
    and still totals 706px. Marketing Support got the old homepage image
    (`public/vandalist-hero.png`, opaque paper-dim background so it needs the
    tinted band) with its "Book a strategy call" button restored. The camp
    asset was renamed `marketing-support-bg.svg` -> `home-hero-bg.svg`. The
    homepage background image is taller than the hero by half of the first
    row's top padding (3rem of 6rem at md+, 2rem of 4rem on mobile) so the
    curves finish lower; it only overlaps empty padding, 48px stays clear
    above row one. Measured: lower wave edges now start at y>=684 vs the CTA
    bottom at 578. **Marketing Support's image shows from lg (1024px) only**:
    at 768px the full-width text column ran over the artwork by 40-160px
    (checked by comparing each text line's right edge to the PNG's leftmost
    artwork pixel at that height); at 1440 it clears every line by >=81px, at
    1024 one subtext line grazes a soft shadow edge by 32px (accepted).
  - **How We Work arrows (homepage only):** pulse 25% slower (1.6s -> 2.0s per
    arrow, 6s cycle; read as "25% longer", the speed-based reading would be
    2.13s), connector and arrowheads doubled to 4px, re-centred on the circles
    (0px off). The same pulse line on the How We Work page / service pages
    (CadenceSteps) was deliberately NOT changed.
  - **Missing "Post-transaction or new brand" icon** added
    (`public/who-icons/post-transaction.webp`, 700x700 / 24KB, matching the
    other five); the card image box is exactly square so nothing is cropped.
  - **Client logos:** marquees replaced by a grid of white tiles (5x2; 2x3 on
    phones) where one random tile crossfades every 3s to a logo not on screen.
    14 logos in the pool (Andrew said use 14, not 15), 10 slots; all 10 slots
    always hold different logos, only visible tiles swap, never the same tile
    twice running; pauses off-screen/hidden tab; static under reduced motion.
    **Two bugs found only by testing the live behaviour:** the first version
    waited on `img.decode()` before fading, which never resolves while the
    page isn't rendered, leaving tiles half-swapped (state said new logo,
    screen showed old, so duplicates could appear) — now it waits on `load`
    with a 1.2s timeout; and the in-view flag now starts true so a silent
    IntersectionObserver can't stall swaps forever. Pane note: this preview
    pane reports `document.hidden = true` and never fires IntersectionObserver,
    so to test timers/animation logic override
    `Object.defineProperty(document,'hidden',{get:()=>false})` after load.
  - **CTA band padding** reduced to 2.5rem top and bottom (was 5rem at md+).
  - **Coverage section link:** "Explore how it works" (a dead `#`) is now "Find out how we
    work →" and links to `/how-we-work` (CoverageTable.astro).
  - **Contact page intro (2026-10-13):** heading is now "We will get back to you
    within the day." with "We won't leave you hanging! ..." beneath, and the intro
    gained top padding (`pt-8 md:pt-12`, same as About) — it sat tight under the nav
    once the logo/menu grew (heading was 0px below the header, now 48px).
    Follow-ups same day: removed the 3rem (`mb-12`) under the subtext (gap to the
    form is now the wrapper's 40px). Then Andrew made the heading change UNIVERSAL:
    `PageHeading` is now line-height 1.2 + normal tracking. Discovery: the old
    `leading-[1.05]` never applied at md+ because `md:text-5xl` sets line-height:1 inside
    the md media query (heading was really 1.0 / 48px); so the component now repeats
    `md:leading-[1.2]`. General lesson for the framework: a `text-Nxl` utility carries
    its own line-height at each breakpoint; pair it with a same-breakpoint `leading-*`.
    Because headings got taller (and Google Ads now wraps to 4 lines), the six service
    heroes + homepage hero were switched from hand-tuned `lg:py-[104px]`/`32`/`[118px]`
    to `lg:py-12 lg:min-h-[578px] lg:flex lg:items-center` (grid gets `lg:w-full`), so
    header+hero = 706px at 1440 regardless of heading height (verified all 7). About
    pb 112->93px and Previous Work pb 56->46px keep their old totals (464 / 328).
  - **About page round (2026-10-13):**
    - Intro video: the "Play intro video" button on the left is gone, replaced by the
      97-second summary paragraph; the right-hand video box is still a placeholder
      (Andrew will supply the video later — OPEN, nothing to embed yet).
    - "Our core values" -> "Our values". The five cards are now a fixed 320px wide
      (min-h 9.25rem) and flip on hover / keyboard focus / tap to pink (--color-accent)
      with white icon + Andrew's explanation text; label fades out, card size never
      changes. Scoped CSS in about.astro (.value-card) + a tiny click-toggle script
      (.is-open) for touch. Note: white 14px text on #ff3d6b is ~3.3:1 contrast, below
      WCAG AA for small text — flagged to Andrew, not changed.
    - How we work diagram (revised 2026-10-14 from Andrew's mockup, colours sampled
      from the screenshot): capability cards have a 5px --color-accent-soft border
      (screenshot measured 5px at 1:1, though he'd said 2-3px earlier — went with the
      image), card width 80% -> 90% of the column so the two middle cards stop wrapping
      to 4 lines (all 3 now at 1483px), hub circle border back to 10px but in
      --color-paper (#faf9f7, matches the screenshot ring).
    - Values cards (revised 2026-10-14): resting label 1.3rem + `capitalize`
      ("Start Excited, Stay Excited"), icons 3.5rem; labels now wrap to 2 lines on
      three of the five cards at 320px wide; card heights stay equal (148px).
    - Peeling corner on the values cards (2026-10-14, Andrew's mockup, pure CSS):
      `.value-card::before` = pink underside triangle, `::after` = curled white flap
      (mask + shading gradient, rounded free corner), 2rem (1.5rem below sm). Done as
      overlays, not clip-path, so the card's drop shadow isn't clipped (would need a
      filter: drop-shadow wrapper if the section ever gets a photo/texture behind it).
      On hover/focus/tap both layers fade out entirely (Andrew: by then the visitor has
      worked out the interaction) — earlier idea of a light-pink flap was dropped.
      Verified with a headless-Edge screenshot (the pane's own screenshot still fails):
      `msedge --headless=new --screenshot=... --window-size=1440,2600 <url>`, then crop
      with System.Drawing — handy when the pane can't render.
  - **How We Work hero character (2026-10-14):** Andrew supplied the CodePen "Initiating
    the Hack (Pure CSS Sombra)" (Béthy/Tee, MIT) as inspiration. It is a fan drawing of
    Sombra (Blizzard IP) — the MIT licence covers the code, NOT the character — so the
    pen's code/art/audio/skull were NOT used. Instead `src/components/HeroCharacter.astro`
    is an ORIGINAL inline-SVG character (glasses, curly hair, brand-pink hoodie) among four
    floating screens: code lines that type in, a strategy play diagram (X's, an O and a
    sweeping arrow that draws itself, per Andrew's reference image), a progress bar and a
    hexagon loader. Pure CSS animation inside prefers-reduced-motion: no-preference (still
    picture otherwise), no JS, no audio. Same day Andrew asked for the STANDARD hero layout:
    the hero is now the service-page recipe — bg-[var(--color-paper-dim)] band behind
    Header + hero, h1 + paragraph on the left (PLACEHOLDER copy: "How we work with you" /
    "Placeholder text: ..."), character on the right, no CTA button, the old mountains bg
    image (how-we-work-hero-bg.svg, still in /public, now unused) removed. The page now
    has its one h1. `lg:min-h-[578px]` recipe: 706px at 1440, no overflow at 390.
    Andrew will source SVG office furniture to go behind the character later. Credit to the
    pen is in the component's header comment — keep it, and if any of that pen's code is
    ever copied keep Béthy's MIT notice. Pen files live on Andrew's Desktop, not in the repo.
    Follow-ups same day: (1) How We Work's first section under the hero had pt-8
    md:pt-12 (3rem) vs 5rem on the other pages -> now pt-16 md:pt-20. (2) BUG on every
    page: the Services flyout's descriptions ran outside the panel and looked bold,
    because the desktop nav <ul> has `whitespace-nowrap font-bold` (added in the
    header/nav round) and the flyout inherited both. Fixed with `whitespace-normal
    font-normal` on the flyout panel in Header.astro. General lesson: utilities on a
    nav list inherit into dropdown panels — reset them on the panel.
    Background scene added (2026-10-14): Andrew's own Illustrator SVGs (desk with
    monitor/speakers/keyboard, plant, clock; originals + the .ai in his
    Assets/How We Work folder, untouched) were copied to `public/how-we-work-scene/`
    with ALL metadata stripped at his request (Adobe Content Credentials / "Firefly"
    manifest, XML prolog, Illustrator layer ids — ~90% of each file; 53/43/39 KB ->
    15/5/1 KB; the generic `.cls-N` style class names remain). They are placed as
    <image> elements behind the character inside HeroCharacter.astro (desk x302 y31
    378x299, plant x56 y96 102x215, clock x208 y71 51x51 in the 680x430 space), matched to
    his mock-up. Not animated (the clock's hands are one joined shape). If re-exporting
    from Illustrator, strip the <metadata> block again (a quick regex removal is enough).
    Enlarged ~50% (2026-10-14, Andrew: "more space over there"): HeroCharacter's viewBox
    was cropped from 0 0 680 430 to 40 24 640 380 (drawing coordinates unchanged, empty
    margins removed; max-width 820px) and the hero grid became
    `lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]` (fixed 360px text column, art takes the
    rest: 800px wide at 1440, head ~1.47x bigger). Heading now wraps to 2 lines. Hero still
    706px at 1440 / 578 section at 1024, no overflow at 390. Arm pivots switched to
    fill-box percentages so they don't depend on the viewBox origin.
  - **How We Work page, round 2 (2026-10-20):** hero copy is now Andrew's real copy
    ("We simplify the agency relationship" / "We combine great humans & systems to make
    sure we are easy to work with & a genuine problem-solving solution."); the h1 uses
    `text-balance` so the narrow 360px column breaks "We simplify / the agency /
    relationship" instead of stranding "agency". First section redesigned from his
    mockup (its hero, arrow and sparkles deliberately omitted): eyebrow "How we work",
    40px heading "Sometimes we're boringly conventional. Other times we are
    eyebrow-raisingly unorthodox." with the second sentence's last phrase in pink (line
    break after "conventional." only at lg+), line "But we are always well organised,
    responsive, and reliable.", then four cards in a row (Organised by design /
    Communication matters / Thinking beyond the brief / Respect for your time) using his
    supplied illustrations, converted PNG -> WebP into `public/working-style-cards/`.
    Replaced the old 2x2 tilted "working style" cards (styleCards const removed; the
    old `public/working-style-icons/*.svg` are now unused by this page). Deviations
    from the mockup: eyebrow is the site's sentence-case Eyebrow, not ALL CAPS; cards
    use the site's border + shadow-card style. Recovered the icon PNGs from the session's
    images folder (they were attached in chat), no re-upload needed.
  - **Campfire label tucked up:** removed the 0.75rem gap between the fire and
    "Add a little Vandalist" (`.campfire-demo { gap: 0 }` in CampfireToggle) —
    label moves up 12px, fire does not move. (Andrew's earlier "note the
    campfire and text" referred to this label gap, not hero text position.)
  - Not done / left for Andrew: in his mockup the hero text starts ~37px
    further right than the logo and cards (at 1920px) and sits ~30px higher
    than ours; ours lines up with the logo like every other page and centres
    in the 706px hero, so it was left alone. His mockup's hero subtext also
    looks very faint over the hills — not verified on the real page.

## Known open items

- **2026-10-28 — About page text review (Andrew).** Audited element by element: the values-card flip text is
  t-small-strong in white; the How-we-work diagram uses t-small / t-small-strong / t-link; partnerships use
  t-eyebrow / t-small-strong / t-small / t-heading / t-body: all inside the set. Only exception: the five
  value-card FRONT labels (1.3rem, Andrew chose it); cleaned so they carry t-title with just an inline
  font-size (they were disguised as t-body + font-weight override). OPEN: keep that single exception, or bring
  it into the set (t-title at 18px, or raise t-title to ~20px sitewide so the exception disappears; Andrew to
  choose). Also: the CTA band eyebrow ("Brain dump or specific requirements:") is now the standard t-eyebrow
  (deep pink) instead of plain ink text; chrome exempt lines 20 -> 19. Optional: drop its trailing colon to
  match other eyebrows (copy not changed).

- **2026-10-27 (round 2) — Andrew's decisions applied; TYPE SET IS NOW LOCKED. Not yet seen by him live.**
  His rule: a locked set of text formats; no text may operate outside it; if one module changes, update all.
  1. TYPE LOCK: 9 styles in global.css (display, heading, intro, title, body, small, small-strong, eyebrow,
     and NEW t-link 14px medium deep pink). A style may take only a COLOUR utility on top (ink, slate,
     accent-text, good, bad, white, text-inherit). `npm run check:type` (scripts/check-type.mjs) fails if any
     markup hand-writes a size / weight / line-height / tracking / font-size. RUN IT BEFORE EVERY DEPLOY.
     Exempt, listed in the script: illustration/mock components (BrowserMockCard, QuestionPile,
     TreadmillRunner, CampfireToggle, HeroCharacter, icons, demo pages), blocks wrapped in
     <!-- type-exempt:start reason --> ... <!-- type-exempt:end --> (Google Ads and SEO dashboard mock-ups),
     site chrome (Header, Footer, CtaBand: 20 lines, own typography, NOT converted: decision pending), and one
     chosen exception (About value-card labels, 1.3rem). 75 more elements were converted this round
     (links -> t-link; "medium" 14px ink -> t-small-strong; 12px chips -> 14px; uppercase tracked micro-labels
     lost the uppercase and became t-small/t-eyebrow; case-study h1 -> t-display, h2 -> t-heading; form labels
     -> t-small-strong). A rendered-text audit of 863 elements on the 12 pages found no unexplained outlier.
  2. ICON CHIPS: three sizes only: sm 32px/16px icon, md 44px/20px, lg 56px/26px (1.5 stroke); old 7/8/9 -> sm,
     10/11 -> md, 14 -> lg. Andrew delegated the choice and said he can review. Props are now size="sm|md|lg".
  3. SPACING: ONE standard: every Section/Band has pb-16 md:pb-20 (4rem/5rem); `top` adds pt-16 md:pt-20 and is
     used on the first section under a hero. The old roomy 5rem/7rem is gone everywhere (How We Work, About,
     last service sections, raw wrappers on about/contact/previous-work). Homepage now has an even 5rem rhythm
     (home bands HowWeWork/CoverageTable use pb instead of py-10; hero bg overhang adjusted to 2.5rem). If it
     looks too tight: change the one value in Section.astro and Band.astro.
  4. CADENCE SCROLL: now the ONLY behaviour of CadenceSteps (props activateOnScroll/circleBg/unifiedType are
     gone) on How We Work and all six service pages. Three treatments: line icons in circles (inline or SVG
     file) recolour grey -> pink -> soft pink; full-colour PNG art (Google Ads) goes greyed/faded -> full colour
     with a slight lift. Verified by seeking the animation on every page. This closes the earlier reminder.
  KNOWN EDGES / for Andrew: (a) the About partnerships intro heading is 5 lines in its narrow card at 40px;
  homepage "Marketing capabilities without the headcount" is 4 lines; SEO step titles wrap at 7 across.
  (b) At ~1000-1100px with a classic scrollbar the long Consulting hero wraps to 4 lines and the hero is 740px
  not 706 (existing, not caused by this work). (c) Marketing Support (and maybe other service pages) still has
  the heart + "Ongoing, collaborative, and built to adapt." tagline Andrew removed from How We Work as juvenile:
  ask whether to remove them all. (d) Header/Footer/CtaBand typography is outside the lock.
  PROCESS SLIP (Claude): I promised to run test builds with --outDir outside the SharePoint folder and then
  built into dist/ a handful of times this round anyway. Do it properly next time.

- **SharePoint "heap of deletions" notification (2026-10-27) — explained, no data lost.** Cause: the repo folder
  is inside the SharePoint-synced library, and every `npm run build` wipes and recreates the git-ignored
  `dist/` (~207 files); a day of verification work meant dozens of builds. The only deliberate deletions were
  5 tracked files (old hero bg + 4 working-style icons), recoverable from git. Andrew's Assets folder was
  only read. `node_modules` (13k files) also lives in the synced folder. A stale `.git/worktrees/wt` metadata
  folder from a temporary comparison build could not be deleted (permission denied, likely a sync lock): harmless,
  `git worktree prune` removes it later. GOING FORWARD (Claude): run verification/test builds with
  `astro build --outDir <folder outside the repo>` and only build into `dist/` for the real deploy.
  OPEN QUESTION for Andrew: keep working inside SharePoint (noisy but fine) or move the working copy outside
  it (git is the real sync; keep only Assets in SharePoint). Not changed.

- **2026-10-27 — STRUCTURE / TEMPLATING WORK IN PROGRESS (Andrew approved the full plan, in order).**
  Audit of how-we-work.astro found: hero recipe copy-pasted in 8 files; 8 different section-spacing
  recipes site-wide; icon-in-circle rebuilt by hand (6 size variants on that page, 8 files); inline
  SVG icon strings duplicated; decision table + side panels built twice; one-off literals; dead code;
  orphan assets; comment bloat. Andrew's rule for heroes: LOCK heading style, intro text style, height
  (706px at 1440) and structure; leave column split / grid / art side free per page (presets
  text-lead 60/40, balanced 50/50, art-lead ~33/67 as shortcuts, plus a custom escape hatch; keep a
  minimum readable text width ~384px).
  METHOD: every refactor is verified by a before/after LAYOUT SNAPSHOT of 12 pages (home, about,
  contact, how-we-work, previous-work, one case study, 6 service pages) at 1440/1024/390 using a
  static `astro preview` of dist on :4322 and element rects stored in localStorage (animated areas
  excluded: svg, rotating CTA word, logo grid, campfire, .qpile-stage question pile).
  STEP 1 DONE (verified IDENTICAL on all pages, deployed): removed the unused CadenceSteps
  `shimmerConnector` option (prop, markup, CSS); deleted orphaned public/how-we-work-hero-bg.svg and
  public/working-style-icons/*.svg (recoverable from git); added tokens --color-accent-line (0.4),
  --color-accent-line-soft (0.3), --shadow-soft and used them in how-we-work.astro, CadenceSteps,
  BrowserMockCard (other pink strengths 0.15/0.2/0.25/0.35 appear once each, left as literals);
  trimmed the history-style comments in how-we-work.astro. Still not done and out of scope here:
  three demo pages (campfire-demo, icon-texture-demo, question-pile-demo) are live public routes.
  STEP 2 DONE (2026-10-27), all verified and deployed. New shared components in src/components/:
    PageHero (+ HeroBand): locks h1 style, t-intro text, spacing and the 706px height; free per-page
      column split via split="balanced|art-lead|text-lead" (+ from="md|lg", artClass, sectionClass,
      gridClass, titleClass, introClass, slots title / intro / default / art / overlay). Used by all
      8 heroes (home Hero.astro, 6 services, how-we-work). VISIBLE CHANGE: hero intro text on the other
      7 heroes is now t-intro (near-black, line-height 1.6) instead of grey 1.75; desktop hero height
      still 706px, phones grow 2-4px.
    OrbButton: the pink-orb pill button as <a> (href) or <button> (no href); size lg (hero) / md (CTA band,
      contact submit).
    IconChip: the icon-in-a-circle/rounded-square, 40 hand-built copies converted EXACTLY (23 recipes:
      sizes 7/8/9/10/11/14, icons 13-26px, strokes 1.5/1.75, shapes full/lg). The SIZE SCALE IS STILL AN
      OPEN DESIGN DECISION (pick ~3 sizes and retire the rest = visible change). NOTE: an older, unused
      src/components/IconBadge.astro (check/cross status badge) exists; I overwrote it by mistake once and
      restored it from git; the new component is named IconChip to avoid the clash. Dead-code candidate.
    Section: standard 7xl section with top="tight" and bottom="tight|roomy"; the 7 off-standard sections
      (pt-12 md:pt-16 pb-20 md:pb-28 x3, py-16 md:py-24 x2, pt-16 md:pt-24 pb-16 md:pb-24 x2) are passed as
      raw `class`, so they show up as exceptions. Spacing rhythm differs by page (service pages mostly
      4rem/5rem, How We Work / About 5rem/7rem): NOT unified, Andrew's call.
    Band: the wide tinted panel (bottom, padding default|roomy|wide, as div|section), 12 of 13 converted.
      HowWeWork.astro (homepage teaser) deliberately keeps its own markup: its <style define:vars> sets
      --cycle only on the component's own root element, and a wrapper component as root swallowed it.
  NOT DONE from the audit (smaller): decision table + side panels still built twice / near-duplicated;
  shared icon registry (icon SVG strings are still duplicated per page); demo pages still public.
  LESSONS: (1) verify refactors with BOTH a layout snapshot AND a tag-level HTML diff of two builds (the
  layout check could not see the define:vars regression); build the previous commit with a git worktree +
  node_modules junction and diff dist/ tag by tag (ignoring attribute order and data-astro-cid). (2) In
  Astro, an import inserted at the END of a long frontmatter data block broke the build in one file; put
  new imports next to the existing ones. (3) Use iframes inside one javascript call to snapshot many
  pages/widths at once; the top-level pane has a 15px scrollbar gutter, iframes don't, so always compare
  iframe-to-iframe baselines.
  STEP 3 DONE (2026-10-27), deployed, Andrew has NOT yet seen it on the other pages: the 8 text styles
  now run sitewide.
    Components: Heading (no more "section"/"statement" sizes: ONE size, t-heading 30/36/40px, balanced) and
    SectionHeading (wrapper max-w-5xl, subtext t-intro) and CadenceSteps (t-eyebrow number / t-title /
    t-small; the unifiedType option is gone) now use the styles by default, so ALL pages get them.
    Pages/components: a script converted 129 hand-written text elements whose class set matched a style
    exactly (t-title 27, t-small 59, t-body 14, t-small-strong 19, t-intro 4 incl. About mission/video text,
    t-heading 8) across HelpGrid, HowWeWork, ProofGrid, SystemDiagram, WhoThisIsFor, CoverageTable,
    CaseStudy*, about, contact, previous-work, the six services. Skipped on purpose: Header, Footer,
    CtaBand, form labels, the mock-UI/animation components, demo pages.
    VISIBLE EFFECTS: all non-hero section headings are now 40px (were 30px); intro/hero text near-black;
    16px card titles are 18px; every 12px (text-xs) text became 14px (caption style retired), so dense
    cards (SystemDiagram, compare tables) wrap more; heading in narrow columns wraps more (homepage
    "Marketing capabilities without the headcount" is 4 lines; the SEO journey step titles wrap to 2
    lines at 7 across). Desktop hero still 706px, no horizontal overflow at 1440/1024/390.
    STILL OUTSIDE THE 8 STYLES (audit of computed styles per page; ~290 elements, ~40 formats; none are
    accidentally unstyled): text links (14px medium accent/deep-pink, e.g. "Find out how we work ->",
    "View case study"), comparison-table cells and checklist rows (14px medium ink, 16px ink, 14px ink),
    chips and labels (12px medium ink, 12px medium green/red status, 14px semibold green/red), numbers
    and stat figures, case study meta text, form labels, a few large display numbers. DECISION FOR ANDREW:
    add a small second tier (e.g. link, label/chip, status) or leave these as component-specific.
    BUG CAUGHT BY EYE (not by the automated checks): while removing CadenceSteps' option I left
    class:list="..." as a bare string, so step numbers/titles/text lost their classes on every page that
    uses it; fixed before deploy. Lesson: add a computed-typography audit (type-audit) next to the layout
    snapshot and the HTML diff; positions alone cannot see lost styling.
  NEXT: Andrew reviews the other pages live and decides on the second tier of styles, the icon-chip size
  scale and the section-spacing differences; the cadence scroll-activation for the six service pages is
  still pending (his earlier reminder).

- **2026-10-26 — TYPE STYLE SET trialled on How We Work ONLY; awaiting Andrew's verdict on how it
  looks live before a sitewide rollout.** An audit of the page (computed styles, 1440px) found 20
  text formats (15 visibly different), many differing only in line-height or colour. Replaced by
  8 styles (originally 9; t-caption retired) defined once in `global.css` (`@layer components`): t-display 36/48px 600
  1.2 ink; t-heading 30/36/40px 600 1.2 ink (+ pink emphasis phrase); t-intro 18px 400 1.6 ink;
  t-title 18px 600 1.4 ink; t-body 16px 400 1.6 slate; t-small 14px 400 1.5 slate; t-small-strong
  14px 600 1.5 ink; t-eyebrow 14px 500 1.4 +0.025em deeper pink; t-caption 12px 400 1.4 slate.
  Each style fixes size+weight+line-height+colour together. Re-audit afterwards: exactly those 9
  styles (plus the pink-emphasis colour variant) and nothing else on the page body; hero still 706px.
  Wiring: `Eyebrow.astro` (SITEWIDE, visually identical, line-height 20px -> 19.6px), `PageHeading`
  (SITEWIDE, now class t-display, identical output incl. tracking-normal) and `Heading`
  size="statement" (How We Work only) all use the t-* classes; `SectionHeading` statement subtext
  uses t-intro; `CadenceSteps` has an opt-in `unifiedType` prop (How We Work only) so the six
  service pages are unchanged. Page decisions taken by default where Andrew didn't answer (easy to
  flip): hero small text now near-black (t-intro) instead of grey; panel titles ("Together", "Your
  team brings", "Vandalist brings") and decision-table titles shrank to 18px; step body stays 14px.
  His calls: tagline lost its italic/light-grey style (now plain t-small); step numbers use the
  eyebrow style. Also removed `lg:whitespace-nowrap` from the "Transparent by default." banner text
  (it overflowed at 18px titles) — this ALSO fixes the old ~1024px horizontal overflow (open item
  below can be considered closed). NEXT: if he likes it, roll the styles out page by page (hero
  small text colour on the six service heroes is the big visible change), re-audit each page.
  FOLLOW-UP SAME DAY (2026-10-26): Andrew's calls — (1) the "Genuine advice and support you can rely
  on." tagline + heart icon was REMOVED (felt generic/juvenile; nothing replaced it); (2) new copy:
  "How we fit in" heading = "Your context and purpose. Our planning and capability."; section 4 =
  "Clear roles and responsibilities." with intro "Clear responsibilities and specific tasks lead to
  greater momentum and better outcomes." (he wrote "leads"; fixed the grammar to "lead" and told him);
  (3) the decision table now uses ONE type treatment in every cell — header cells moved from
  t-small-strong/t-caption to t-title + t-small like the row labels and cells. t-caption and
  t-small-strong now appear only in the three "Together" mini-cards: candidates to merge into
  t-small(-strong) if Andrew wants the set down further. LATER SAME DAY: Andrew OK'd retiring the
  caption — the three "Together" mini-card descriptions now use t-small and t-caption was DELETED
  from global.css. CORRECTION to the line above: t-small-strong is NOT mini-card-only (it is also
  the list-item title style in both side panels), so it stays; the set is now EIGHT styles
  (display, heading, intro, title, body, small, small-strong, eyebrow). Re-audit: 8 style classes,
  9 computed looks (the 9th is the pink emphasis colour on the first heading's phrase), hero 706px.
  Note "Clear roles" is also a mini-card title in the Together panel, near-duplicating the new
  section heading (Andrew has not decided whether to rename it).
  HERO (2026-10-26, Andrew): h1 changed from "We simplify the agency relationship" (a claim) to
  "A simple agency relationship" (less claimy, shorter). Text column widened 360 -> 384px (needed:
  "A simple agency" is 377px at 48px) and the text/art gap cut 40 -> 16px, so text+gap is still 400px
  and the illustration keeps its size/position (800px at 1440, starting x=513): only the space between
  text and picture is tighter. Heading breaks "A simple agency / relationship". Hero still 706px.

- **2026-10-21 — scroll-activated cadence row is LIVE on How We Work only. REMIND ANDREW
  when we review the service pages** (he asked; also saved as a Claude memory). Built as an
  opt-in `activateOnScroll` prop on `CadenceSteps.astro`: icons start grey (pale circle,
  muted glyph, grey dotted line + chevrons); when the row is ~25% on screen (IntersectionObserver)
  a pulse crosses the line once (1.3s per gap, 0.5s start delay, ~6s total), each icon goes
  bright pink + white glyph then settles to soft pink + pink glyph, the line behind the pulse
  turns pink, ending as a full pink row; no repeat. Chevron glow removed in this mode. Below lg
  (connector hidden) the icons just light up in turn with the same timing. Reduced motion / no JS
  = finished pink state shown at once (an inline script arms the idle state before paint).
  Glyphs are CSS-masked (`--icon` url) so only single-colour icons work. Step numbers in
  CadenceSteps now use `--color-accent-text` on EVERY page that uses it. Verified by seeking the
  Web Animations timeline in the browser pane (exact colours at 0.5s/1.8s/3.1s/5.7s/8s) plus a
  headless Edge capture. Service pages still use the old shimmer behaviour: before enabling there,
  check each page's icons (some are PNGs / inline) are single-colour silhouettes.

- **2026-10-21 UPDATE — type hierarchy test case is LIVE on How We Work only.** Andrew chose
  "use How We Work as the test case; if it looks as punchy as hoped, roll out elsewhere and
  adjust layouts as needed". Done: `Heading.astro` and `SectionHeading.astro` gained a
  `size="statement"` option (30/36/40px, line-height 1.2 incl. the md repeat, `text-balance`;
  SectionHeading statement = max-w-5xl wrapper + 18px ink subtext). Applied to all four
  headings under the hero on how-we-work.astro (the first-row heading no longer has inline
  size classes). His note that the first-row heading's line-height looked tight was right:
  `leading-tight` lost to `md:text-4xl`'s own line-height (1.0, 40px) — now 48px (1.2).
  ALSO, sitewide, by his OK: `Eyebrow.astro` now uses a new token `--color-accent-text`
  (#d4163f, 5.0:1 on paper / 4.6:1 on paper-dim) instead of brand pink. NOT changed (still
  brand pink at small sizes, candidates for the same treatment): text links like "See how we
  work →", step numbers (01-05), and white-on-pink About value cards. NEXT: Andrew reviews
  How We Work live; if happy, roll "statement" headings + 18px ink intro text out to the
  other pages (SectionHeading has ~24 uses) and re-measure each page.
  Earlier note (2026-10-20, kept for the reasoning): site-wide type hierarchy + contrast. Andrew likes the new
  How We Work intro line (18px, --color-ink) better than the old standard small text
  (SectionHeading subtext: 16px, --color-slate) and is worried about consistency
  elsewhere. Findings so far:
  - Measured sizes today: hero heading 36/48px (PageHeading); section heading 24/30px
    (Heading); a larger "statement" heading 30/36/40px (the new How We Work heading, and
    the CTA band's 40px at xl); eyebrow 14px; intro text 18px grey (hero paragraphs) vs
    16px grey (SectionHeading subtext) vs 18px ink (new line); card titles a mix of
    18-24px; element text 14px (135 uses) / 12px (55).
  - Proposed tiers: Hero heading, Statement heading (one per page), Section heading,
    Intro text (18px), Body (16px), Element title, Element text, Caption — via shared
    components (e.g. a new Lead.astro like Eyebrow/Heading). Moving SectionHeading's
    subtext to the new look would touch ~24 uses (HelpGrid, HowWeWork, ProofGrid,
    WhoThisIsFor, how-we-work x2, and the six service pages) — review every page after.
  - QUESTION STILL OPEN: should intro text be 18px ink everywhere (one pass, with
    before/after measurements), or only where chosen (start with How We Work only)?
  - Contrast (WCAG): slate on paper 5.28:1 / on paper-dim 4.88:1 (passes AA), ink 15-16:1.
    FAILS for small text: brand pink on paper 3.25:1 / paper-dim 3.01:1 (the 14px
    eyebrows), --color-slate-light 2.80:1 (check where it is used for readable text), and
    white on --color-accent ~3.3:1 (the flipped About value cards). Bold does not change
    the ratio; WCAG only relaxes to 3:1 for text >= 24px or >= 18.7px bold. Options given:
    bold + ~19px, or a deeper pink for SMALL pink text only (#d4163f = 5.01 on paper /
    4.63 on paper-dim; #d91a4a = 4.76 / 4.40), or leave as is. My recommendation was the
    deeper pink for eyebrows, tried on one page first so Andrew can compare. Awaiting
    his call.

- **Pre-existing horizontal overflow on How We Work at ~1024px:** a <p class="text-sm
  ... lg:whitespace-nowrap"> far down the page (~y 3977) runs ~115px past the viewport
  at 1024 (page scrollWidth 1124 vs 1009). Not caused by the hero work; found while
  testing. Unfixed — Andrew hasn't asked; check at 1024-1100px widths.
- **How We Work hero (2026-10-14):** the character is live but Andrew has not seen it
  in motion on the live site yet (pane can't render animation; checked via a headless
  screenshot + computed animations). Hero copy is final as of 2026-10-20.

- **Wrap-up 2026-10-13 — newest items first.** Andrew confirmed ("looks great")
  the Contact page, the sitewide heading change and the About video section.
  Still open from this stretch:
  - About intro video itself: Andrew will supply it later; the box is a
    placeholder with no play action wired up.
  - About value cards: white 14px text on #ff3d6b is ~3.3:1 contrast (below AA).
    Raised with Andrew, not yet decided (bigger text or a slightly darker pink).
  - Sitewide heading is now line-height 1.2 / normal tracking and heroes use
    `lg:min-h-[578px]` centring (706px held at 1440, verified at 1024 for Google
    Ads). Tablet (768-1023) and phone hero heights are NOT pinned to any target and
    were not eyeballed — Andrew should glance at them on a phone.
  - Browser-pane reminder: after a long idle the pane can lose its tab; reopen with
    `navigate` to the localhost URL (the dev server itself usually keeps running).
- **Andrew has not yet seen the new header/CTA live** (the pane's screenshot
  tool is broken, so everything above was verified by measurement). Worth
  asking how the 80px logo, bold nav and rotating CTA word actually read,
  especially the uneven gap after short words and the tablet (768-1023px)
  compact row, which now shows where the full nav used to.

- **Also top of the list:** two judgment calls from the Marketing
  Support/Websites/How We Work hero shuffle haven't been confirmed —
  (1) Marketing Support's hero lost its "Book a strategy call" CTA
  entirely (how-we-work's hero, which was copied wholesale, never had
  one), and (2) how-we-work.astro now has no `<h1>` on the page at all.
  Both were flagged in chat rather than silently decided, but neither has
  an explicit "yes that's fine" from Andrew yet.
- **Top of the list for next session:** the Decision-making & accountability
  table's latest shadow tier (content cells: hairline border + a soft
  literal shadow; label/header cells: flat) hasn't been explicitly
  confirmed by Andrew as right yet — the last message before wrap-up was
  his ask, not his sign-off on the result. Same for About's 8-radial-dash
  hub marks (built from a screenshot Andrew sent, not an explicit "yes").
  Check both are actually landed before assuming settled.
- The orb pulse hasn't been visually confirmed by Andrew yet either —
  same underlying reason as the TreadmillRunner item just below (this
  pane's compositing is broken, this time confirmed to also affect
  plain infinite CSS animations, not just hover/transition-triggered
  ones). The CSS rule is verified correct (`animationName`, keyframe
  math), but nobody has actually watched it pulse. Ask if he hasn't
  brought it up unprompted — "only slightly though" was the one
  specific calibration request, worth checking it landed where he meant.
- **TreadmillRunner (now on Websites & Optimisation, not Marketing
  Support) still hasn't actually been watched play, only measured.** This
  pane can't render/composite Lottie animation (see standing Browser-pane
  limitations below), so both the original viewBox crop/container sizing
  AND this session's leg-scale bug fix were verified via
  `getBoundingClientRect`/`getBBox` math and reading the JSON directly,
  never by eye. It's live, the numbers check out, and the animation data
  is no longer objectively corrupted — but a real look at the actual
  gait on the live site is still owed before calling this genuinely done.
- **GSAP's own license is still unresolved, on top of whichever CodePen
  ends up staying.** Andrew flagged this himself and said to proceed
  provisionally — "Standard no-charge license" (gsap.com/standard-
  license), not MIT. Don't treat the current TreadmillRunner setup as a
  permanent fixture until he's actually reviewed it.
- **Top of the list for next session:** the 6 non-Gladstone case studies
  (CQ Building Approvals, Carbrook State School, QUTeX, Retail HQ,
  Capricorn Enterprise, Precision Group) are deliberately thin stubs —
  summary + tags only, see "Case Studies section" above for why. Andrew
  hasn't yet said whether he'll flesh these out himself, wants Claude to
  draft fuller versions from source material (the "future AI-driven
  workflow" his brief described), or is fine leaving them light for now.
  Ask rather than assume.
- Also from Case Studies: real client photography doesn't exist for any
  entry yet (all render the placeholder image treatment) — same
  "come back once there's a real asset" status as several other empty
  graphic slots across the site.
- After three rounds of fixes to
  "Where AI actually helps" (layout shape, then card title/description),
  the follow-up session's rebuild explicitly left that section untouched
  and moved on to other sections instead — a decent signal it's settled,
  but still not an explicit "yes that's right" from Andrew. Don't assume
  confirmed unless he actually says so.
- Whether the SEO page's "How SEO and content work together" section
  (same `SystemDiagram` component, same card-title fix applied
  proactively even though Andrew's complaint was specifically about AI
  Enablement) actually looks right to him too hasn't been separately
  confirmed — worth a quick check next time it comes up.
- Add to the "documented style guide" candidate list (see existing note
  below on inconsistent "what we do" section layouts): `SystemDiagram` is
  now a *fourth* distinct pattern for "central thing + supporting facets"
  content, alongside the three already-noted "what we do" layouts. Worth
  folding into the same eventual consolidation pass rather than treating
  as a separate issue.
- Separately (unrelated thread, still open): Andrew is holding specific
  feedback on question-pile v4 (live on the real Google Ads hero — see
  above) for a future session, after saying it "looks pretty good" but
  wanting to think it over first. Ask what he wants adjusted rather than
  assuming "pretty good" means it's finished — he's explicitly still
  deciding, this is a genuinely open thread, not a wrap-up formality.
- **The "universal hero rule" Andrew asked for isn't actually a shared
  rule yet** — Google Ads' hero now visually matches Home's height, but
  only via a hand-tuned page-specific padding value (`lg:py-[104px]`)
  compensating for its longer H1. This was surfaced to Andrew but he
  hasn't responded on it yet. If a future service page's hero content
  doesn't fit Home's budget either, the same manual measure-and-tune
  process will be needed again unless a real shared solution (shorter
  headlines by convention, or a `Hero` component that adapts padding to
  content) gets decided on. Worth raising again once more service pages
  exist to compare against, not something to silently keep patching
  page-by-page.
- The 1024px-pinch-point text-overflow on Google Ads' "Our approach"
  cards (see above) — not fixed, low priority, only revisit if Andrew
  actually spots it or asks for a pass on tablet widths specifically.
- `src/pages/campfire-demo.astro` (old standalone preview) and
  `src/pages/icon-texture-demo.astro` (+ the `how-we-work-icons-2tone`
  assets) are dead experiments now that how-we-work.astro is done —
  **ask Andrew before deleting any of them**, don't delete unilaterally.
  `question-pile-demo.astro` is NOT in this bucket yet — it's still live
  and still useful for isolated testing (the real hero integration only
  renders it at md+, so the demo page is the easiest way to check mobile
  behaviour or iterate without needing the whole page around it).
- ~~Nav label mismatch: "Google & Social Media Ads"~~ — resolved, renamed
  to "Google Ads" (and "Integrations & AI Processes" → "AI Enablement")
  this session, both per Andrew directly.
- ~~Google Ads hero still has no decorative graphic~~ — resolved, it's
  the question-pile concept now (see above), live on the real page as of
  this session.
- Google Ads "Who it's for" description text doesn't semantically match
  its (retitled) cards yet — deliberate, Andrew's rewriting it separately.
- ~~3-4 more service pages still to build~~ — resolved, all 5 planned
  service pages now exist (see above). **Marketing Support and Consulting
  & Mentoring's second hero columns are still deliberately empty**,
  pending Andrew coming up with graphics for them (same status Google Ads
  was in before question-pile) — don't fill them with a placeholder.
  Websites & Optimisation and AI Enablement's second hero columns are
  the same: empty, reserved, not yet decided.
- **New from this session — worth a dedicated pass once there's time,
  not urgent:** Andrew's stated end-of-project goal is a documented site
  style guide, and specifically wants inconsistencies raised rather than
  silently left. Two concrete candidates surfaced while building these
  four pages, not fixed (that's a design decision, not a bug):
  - Three different "what we do" section layouts now exist across the 5
    service pages — Google Ads groups items under phase headings with
    icon+description+3-per-row cards; Marketing Support is a 2×2 grid of
    labelled vertical pill-stacks; Consulting & Mentoring, Websites, and
    AI Enablement each use a flatter icon+title+description grid/list
    (three more small variations of each other, not identical either).
    All conceptually the same idea, several different structures.
  - The opacity-modifier fix above (see "found and fixed a real bug")
    also exposed that the site uses a wide, inconsistent range of border/
    background opacity fractions (`/70, /50, /40, /30, /25, /20, /15`)
    with no clear system behind which value gets used where — exactly the
    kind of "too many one-off values" Andrew wants reduced. Worth
    consolidating into a small fixed set (e.g. just a "hairline" and a
    "soft-tint" opacity) as part of the eventual style guide, rather than
    continuing to pick a new fraction per section.
- Case Studies and Resources pages don't exist yet — expected to be
  blog-style listing pages, not hero pages; design once there's real
  content to work against, not preemptively.
- **SharePoint-vs-git architecture conflict — the CLAUDE.md/AGENTS.md
  symlink-flattening symptom is fixed (see warning above), but the broader
  question is genuinely unresolved.** Andrew is aware and understands the
  mechanism but hasn't decided between moving the repo out of the synced
  folder vs. staying disciplined about not running both machines' sync
  clients at once. Don't make this call unilaterally in a future session —
  ask first.
- Deploy's IP allowlist has needed re-whitelisting multiple times across
  sessions now (Andrew's IP is dynamic) — a timeout means "ask Andrew to
  re-check the allowlist", not "something's broken." Get the current
  outbound IP with `curl https://api.ipify.org` when this comes up.
- **Standing Browser-pane limitations, not a project issue** — worth
  re-testing occasionally in case any of these are fixed upstream, but
  don't assume they are:
  - Screenshot/compositing has been broken for a while ("page is not
    compositing frames") — visual checks use DOM measurement
    (`getBoundingClientRect`, computed styles) instead.
  - CSS transitions freeze at their pre-transition value for all further
    `getComputedStyle`/geometry reads once triggered — confirmed multiple
    times across sessions (campfire toggle, question pile).
  - **This extends to plain `:hover`-driven CSS, no JS involved** —
    confirmed 2026-08-19 testing the nav's new hover-dot effect. The
    `computer` tool's synthetic hover DOES register at the DOM level
    (`element.matches(':hover')` correctly returns `true`), but
    `getComputedStyle` still reports the pre-hover value for any property
    that has a `transition` on it — even on an *already-shipped, already-
    working* hover effect (tested against the "Book a strategy call"
    button's existing `hover:border-color`), so this isn't specific to
    new code. Workaround: inject a temporary
    `<style>* { transition: none !important; }</style>`, hover, read
    `getComputedStyle`, then remove the injected style — with transitions
    neutralized, hover-driven computed styles read correctly.
  - `requestAnimationFrame` never fires at all in this environment
    (confirmed via a direct probe during the question-pile work) — any
    code gated on rAF (this project's convention for triggering CSS
    transitions on newly-created elements) never runs here. To inspect a
    JS-created element's real settled state on-pane, manually force
    whatever class the rAF callback would have added, with
    `element.style.transition = 'none'` set first so the forced change
    doesn't itself get caught by the transition-freezing issue above.
  - **Plain `@keyframes infinite` CSS animations don't visibly progress
    either** — confirmed 2026-08-25 on the orb-pulse effect: the
    animation rule applies correctly (`animationName`/`animationDuration`
    both read back right), but sampling the animated element's computed
    `transform` twice, 1.4s apart, returned the identical value both
    times. Same root "compositing is broken" limitation as the first
    bullet above, just newly confirmed to extend to animations that
    aren't hover/transition-triggered at all — this isn't a sign the
    animation itself is broken (infinite keyframe animations are
    completely standard, well-established browser behaviour), just
    something this pane specifically can't render frame-to-frame. No
    known workaround beyond checking the live site directly.

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
