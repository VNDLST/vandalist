# Vandalist site — onboarding / continuity guide

Snapshot generated 2026-08-19. This is a "where we left off" briefing, not a
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

## Known open items

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
