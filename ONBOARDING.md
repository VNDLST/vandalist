# Vandalist site — onboarding / continuity guide

Snapshot generated 2026-08-07. This is a "where we left off" briefing, not a
live sync — if you're reading this a while after it was written, check git
log for anything more recent.

## Start here

**[CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md) is the living source of
truth** for project conventions — deploy process, tech stack, design-system
components/tokens, layout conventions, and known gotchas. Read that first;
this doc only covers what AGENTS.md doesn't (recent-work recap + one-time
machine setup).

## ⚠️ Read this before touching git — repo folder is inside SharePoint sync

Discovered 2026-08-07: this repo's working directory lives inside a
SharePoint/OneDrive-synced library (mounted as `D:\Vandalist - Documents\...`
on the work machine, `C:\...` on the home machine — same underlying cloud
library, different drive letters). That sync client runs continuously in the
background, independent of git, and will happily "sync" `.git/` internals and
symlinks even though it can't represent either correctly. Symptoms actually
seen this session: `CLAUDE.md` (a symlink to `AGENTS.md`) got flattened to an
empty file, `AGENTS.md` got mangled into a broken self-referencing symlink,
and a conflict-copy `AGENTS-v1.md` appeared holding the real content. Trigger
was nothing exotic — just an ordinary ~10 minute gap where both machines'
OneDrive clients were live at once (walking from one machine to the other
without shutting the first one down).

**Run this quick health check at the start of any session, before assuming
the repo is trustworthy:**
```
git status --short
```
- Anything named `*-v1.*`, `*-v2.*`, "filename (1)", etc. = a SharePoint
  conflict copy. Don't assume the original is fine just because it's still
  there — compare the two before trusting either.
- Confirm `CLAUDE.md` is still an actual symlink and not 0 bytes:
  `Get-Item CLAUDE.md | Format-List` in PowerShell (or `ls -la CLAUDE.md` in
  Git Bash) — should show a `SymbolicLink` reparse point / `->` target, not a
  plain file.
- `git fsck` — should report no errors.
- If anything looks wrong: `git restore AGENTS.md CLAUDE.md` puts both back
  to HEAD's known-good state; delete any stray conflict-copy file once
  confirmed it's a duplicate.

**Not yet resolved:** whether to actually move the repo out of the
SharePoint-synced folder (the real fix — makes git's own push/pull the only
sync mechanism, as the two-device workflow below already assumes) or leave
it in place and just stay disciplined about not having both machines' sync
clients live at once (reduces risk, doesn't eliminate it — the symlink issue
specifically isn't timing-dependent and will likely keep recurring
regardless). Andrew hasn't decided yet — ask before doing anything about it,
don't just pick one.

## What's been done recently

- Built a shared typography/color/shadow design system (`Eyebrow.astro`,
  `Heading.astro`, `PageHeading.astro`, `SectionHeading.astro` components;
  `--color-good`, `--shadow-card`, `--shadow-panel`, `--gradient-orb`
  tokens in `global.css`) and applied it across every page, replacing
  drifted one-off hex values and shadow strings.
- Reworked `how-we-work.astro`'s top section: added a new two-column hero
  (text left, placeholder decorative graphic right — **still a
  placeholder, meant to be replaced with something more considered**),
  with the original "Our working style" section restored beneath it
  unchanged (own eyebrow/heading/four cards), fixed to be the page's `<h2>`
  now that the new hero holds the `<h1>`.
- Fixed a real CSS Grid bug in that restored section: percentage grid
  columns were letting the cards' own content force them wider than their
  share, pushing the last two cards past the edge. Fixed at the root with
  `minmax(0, ...)` on each track — see AGENTS.md's Layout Conventions for
  the general lesson.
- Set up SSH-key based deploy (see below) so sessions can push+deploy
  without any password ever touching the repo or chat.
- Automated the two-device continuity workflow itself: AGENTS.md now
  instructs any session to auto-pull + read this file at session start,
  and to auto-refresh + push this file at session end — so switching
  between devices shouldn't require manually recapping anything anymore.
  (See the SharePoint warning above — this workflow's assumption of "git
  push/pull is the only sync mechanism" turned out not to hold.)
- Generated a fresh SSH deploy key on the work machine
  (`~/.ssh/id_ed25519`, no passphrase). **Deploy access is NOT yet
  confirmed working** — connection attempts to the VentraIP host
  (43.250.142.30) timed out on both port 22 and port 2222. Needs the
  public key actually added via cPanel's SSH Access panel (and possibly an
  IP allowlist check) before deploy will work from this machine.
- Built a "campfire toggle" concept for how-we-work.astro: a small flame
  that grows and shifts from amber toward the Vandalist pink when you flip
  an "Add a little Vandalist" switch. Adapted from "CSSspark" by Ivan
  Grozdic (CodePen, MIT licensed) — kept the toggle mechanic and general
  idea, rebuilt the flame from scratch. Lives at
  `src/components/CampfireToggle.astro` + a standalone unlinked preview
  page `src/pages/campfire-demo.astro` (visit `/campfire-demo` locally).
  Both files are new/uncommitted as of this snapshot — **check they're
  actually present after `git pull` on the other machine**; if not, the
  SharePoint issue above may be why.
  - v1 had a dark night-scene panel behind the fire and a 3-blob flame —
    Andrew's feedback: remove the dark panel (needs to be judged against
    the real light site background) and unify the flame (three
    independently-flickering blobs read as disjointed, not one fire).
  - v2 (current): transparent stage (sits directly on the page background
    now), flame rebuilt as two layered gradient teardrop shapes (outer
    body + brighter inner core) moving together. Logs and drifting ember
    sparks kept as-is — Andrew liked those in v1.
  - **Not yet reviewed by Andrew** — v2 was just built, hasn't had
    feedback yet. Next step is showing it to him and deciding whether/how
    it goes into the real how-we-work.astro page.

## Known open items

- The how-we-work hero's right-side graphic is a deliberate placeholder
  (dashed circle + small shapes) — revisit when there's a real design for
  it.
- Services, Case Studies, and Resources pages don't exist yet. When they
  do: Services should get the same "secondary hero" treatment as
  how-we-work; Case Studies/Resources are expected to be blog-style listing
  pages, not hero pages — design that once there's real content to work
  against, not preemptively.
- **SharePoint-vs-git architecture conflict (see warning above) — genuinely
  unresolved.** Andrew is aware and understands the mechanism but hasn't
  decided between moving the repo out of the synced folder vs. staying
  disciplined about not running both machines' sync clients at once. Don't
  make this call unilaterally in a future session — ask first.
- Deploy (SSH to VentraIP) not yet confirmed working from the work machine
  — see above.
- Campfire toggle concept (`campfire-demo.astro`) built but not yet shown
  to/reviewed by Andrew in its current (v2) form.

## Working across two devices

Andrew switches between home office and work office, both running Claude
Code, and wants to never have to re-explain context when switching. There's
no sync of the actual conversation/session between separate local Claude
Code installations — but this is handled automatically now, not manually:

- **Start of session:** per AGENTS.md, any session opening this repo
  automatically runs `git pull` and reads this file first — no need to ask.
- **End of session:** per AGENTS.md, when Andrew signals he's wrapping up
  (or a session naturally concludes), the active session automatically
  updates this file's "recent work"/"known open items" and pushes it —
  again, no need to ask. Still-unresolved/undecided threads should get
  written down as the actual open question, not just "TODO."
- The one thing that's still on Andrew, not automated: if he switches
  devices *mid-session* without a natural wrap-up point, the in-flight
  thread won't be captured unless he asks for a refresh first or just
  recaps it himself on the other end.
- Don't bother trying to sync Claude's local memory files between
  machines — treat those as disposable per-machine scratch notes; AGENTS.md
  is the actual durable record.

## One-time setup on a new machine

1. **Node**: v20.20.2 is pinned (host limitation — see AGENTS.md). If using
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
