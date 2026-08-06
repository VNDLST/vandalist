## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

---

## Project: Vandalist website rebuild

This is a live client site AND a proving ground for a repeatable prompt-based
website build framework. Treat every fix as either "Vandalist-specific" or
"a general lesson for the framework" — don't blur the two.

**Repo:** github.com/VNDLST/vandalist (public, branch `main`)
**Live site:** https://vandalist.io/vandalist-2.0/ — staging/dev, not linked anywhere real yet.

### Starting and ending a session

Andrew works across two machines (home office, work office) on this
project, both with Claude Code installed, and wants to avoid ever having to
re-explain context when switching devices.

**At the start of a session** — before anything else — run `git pull` (so
the working copy reflects whatever the other machine last pushed) and read
`ONBOARDING.md` if present (recap of recent work, known open items,
two-device workflow notes). Do this once at session start, not on every
turn.

**Before ending a session** — whenever Andrew signals he's wrapping up
(says something like "that's it for now," "heading out," "picking this up
later," or just asks directly), or after finishing a substantial chunk of
work with no more planned for this session: update `ONBOARDING.md`'s
"recent work" and "known open items" sections to reflect what actually
happened and what's still mid-thought, then commit and push it — without
waiting to be asked. This is what makes the next session (on either
machine) start caught up instead of Andrew needing to recap anything
himself. If something is genuinely unresolved/undecided rather than just
unfinished, write down the state of the open question, not just "TODO:
finish this."

### Git identity

Commits in this repo should use `Andrew Knight <andrew@vandalist.com.au>` as
the author identity. Set this repo-locally (`git config user.name`/
`user.email`, no `--global`) rather than assuming it's already configured on
whatever machine a session runs from.

### Deploy

Deploy is one command, run on the VentraIP cPanel host (user `vandalis`):

```
bash /home/vandalis/deploy.sh
```

That script does `git pull && npm install && npm run build`, then copies
`dist/` into `public_html/vandalist-2.0/`. It requires SSH access to
`vandalis@<VentraIP host>` — **do not put SSH passwords or GitHub tokens in
this file or anywhere in the repo; this repo is public.** Set up an SSH key
locally instead (`ssh-keygen`, then add the public key via cPanel's SSH
Access panel) so a session can run `ssh vandalis@<host> "bash deploy.sh"`
without a stored secret ever touching version control. GitHub pushes work
the same way: use your own locally-configured git credentials/SSH key
rather than a pasted personal access token.

**Sandbox note (only relevant in Anthropic's own web/chat sandbox, not
here):** that sandbox only allows outbound HTTP(S), so it cannot SSH out to
run this deploy — this is exactly why this now runs from a local Claude
Code session instead.

### Deploy behavior

Once a change is made and verified locally (screenshot/build check as usual),
commit, push to main, and run the deploy script automatically — don't wait
for a separate go-ahead. The whole point of this local setup is to remove
the manual deploy step. Only pause and ask first if something seems
genuinely risky or destructive (e.g. deleting content, a change well outside
what was asked for) — routine page edits should go straight through to live.

### Tech stack

- Astro v5, Tailwind v3, Node capped at 20.20.2 (host limitation, not a
  free choice — see cpanel-deploy-gotchas.md if present in project files)
- Fonts: Plus Jakarta Sans (headings), Manrope (body)
- `astro.config.mjs` → `base: '/vandalist-2.0'`. Every internal href/img
  src must be prefixed with `${import.meta.env.BASE_URL}`.
- Color/shadow tokens live in `src/styles/global.css` `:root` — always
  reuse these vars (`--color-paper`, `--color-paper-dim`,
  `--color-paper-deep`, `--color-accent`, `--color-good`, `--shadow-card`,
  `--shadow-panel`, etc.) rather than introducing new hex values or new
  shadow strings. Note the Tailwind gotcha: `shadow-[var(--x)]` silently
  misparses the `var()` as a shadow *color* and never sets `--tw-shadow` —
  use the raw-property syntax `[box-shadow:var(--x)]` instead.
- Typography goes through shared components, not hand-rolled classes:
  `Eyebrow.astro`, `Heading.astro` (in-page section heading, `as="h1"` on
  pages with no separate hero), `PageHeading.astro` (big page-hero H1),
  `SectionHeading.astro` (eyebrow+heading+subtext composite).

### Layout conventions

- Standard content column: `max-w-7xl mx-auto px-6 md:px-10`
- Bleed-wider band pattern (darker background sections): outer
  `max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16`, containing a
  `rounded-[var(--radius-card)] bg-[var(--color-paper-dim)]` panel, with
  an inner `max-w-7xl mx-auto` wrapper for the actual content.
- `Astro.url.pathname` is unreliable in this static build — pass an
  explicit `currentPage` prop to `Header.astro` instead.
- Percentage/fixed-value `grid-template-columns` (e.g. `36%_32%_32%`) get
  an implicit auto minimum size in CSS Grid — a column's own content can
  silently force it wider than its declared share, pushing later columns
  past the container edge. Wrap each track in `minmax(0, ...)` whenever a
  grid column's content might be tight (long text, fixed-width children).
  Caught via `overflow-x-hidden` masking real clipped content rather than
  fixing it — `scrollWidth === clientWidth` alone doesn't prove nothing is
  cut off once overflow is hidden; check individual elements'
  `getBoundingClientRect()` against the container, or actually look at a
  screenshot.

### Before making changes

1. Read the relevant existing page/component first and match its exact
   shadow, spacing, and color-token usage — don't introduce a new value
   that looks similar. This has been the single most common source of
   inconsistency across pages.
2. Before building a new section from a mockup, tag every element as
   Objective (shown verbatim in the mockup) or Subjective (missing/
   ambiguous) and ask about the Subjective ones before writing code.
3. Verify visual changes with an actual screenshot/measurement
   (Playwright), not by eyeballing — "build succeeded" only means no
   syntax errors.
