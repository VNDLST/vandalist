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

## Known open items

- The how-we-work hero's right-side graphic is a deliberate placeholder
  (dashed circle + small shapes) — revisit when there's a real design for
  it.
- Services, Case Studies, and Resources pages don't exist yet. When they
  do: Services should get the same "secondary hero" treatment as
  how-we-work; Case Studies/Resources are expected to be blog-style listing
  pages, not hero pages — design that once there's real content to work
  against, not preemptively.

## Working across two devices

Andrew regularly switches between two machines on this project. There's no
sync of the actual conversation/session between separate local Claude Code
installations — the two things that do carry over are (1) this repo via git
and (2) whatever's written into AGENTS.md/CLAUDE.md. So:

- **Always `git push` before switching devices, always `git pull` before
  starting.** This is the one rule that actually matters — everything else
  is inconvenience, this is the one that can cause real problems (stale
  state, merge conflicts) if skipped.
- Keep pushing durable decisions/conventions/gotchas into AGENTS.md as they
  come up (not just chat) — that's the real cross-device memory, not this
  file.
- Refresh this file's "recent work" / "known open items" sections when
  switching devices mid-arc on something, or after wrapping a chunk of
  work worth flagging — not as a strict per-session ritual. Ask whichever
  session is active to update ONBOARDING.md and re-share; it updates the
  same link rather than minting a new one.
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
