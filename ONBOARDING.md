# Vandalist site — onboarding / continuity guide

Snapshot generated 2026-08-12. This is a "where we left off" briefing, not a
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

## Known open items

- `src/pages/campfire-demo.astro` (old standalone preview) and
  `src/pages/icon-texture-demo.astro` (+ the `how-we-work-icons-2tone`
  assets) are all dead experiments now that how-we-work.astro is done —
  **ask Andrew before deleting any of them**, don't delete unilaterally.
- Nav label mismatch: "Google & Social Media Ads" vs. the actual (Google-
  only) page content — see above, ask Andrew rather than deciding.
- Google Ads hero still has no decorative graphic — deliberate, Andrew's
  still deciding, don't fill it with a placeholder.
- Google Ads "Who it's for" description text doesn't semantically match
  its (retitled) cards yet — deliberate, Andrew's rewriting it separately.
- 3-4 more service pages still to build, following the pattern
  established by google-social-ads.astro (shared template chrome for
  scribbled-out sections, CadenceSteps for any process/step sections,
  `iconContainer`/`iconMode`/`iconExt` props if a future page needs bare
  icons or a mixed SVG/PNG icon set like this one ended up with).
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
- The Browser pane's screenshot/compositing has been broken in this
  environment for a while now ("page is not compositing frames") — every
  visual check across recent sessions has used DOM measurement
  (`getBoundingClientRect`, computed styles) instead of an actual
  screenshot. Not a project issue, but worth re-testing occasionally in
  case it's fixed upstream.

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
