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

### Tech stack

- Astro v5, Tailwind v3, Node capped at 20.20.2 (host limitation, not a
  free choice — see cpanel-deploy-gotchas.md if present in project files)
- Fonts: Plus Jakarta Sans (headings), Manrope (body)
- `astro.config.mjs` → `base: '/vandalist-2.0'`. Every internal href/img
  src must be prefixed with `${import.meta.env.BASE_URL}`.
- Color tokens live in `src/styles/global.css` `:root` — always reuse
  these vars (`--color-paper`, `--color-paper-dim`, `--color-paper-deep`,
  `--color-accent`, etc.) rather than introducing new hex values or new
  shadow strings. The standard card shadow is
  `shadow-[0_16px_32px_-14px_rgba(28,27,26,0.22)]` — reuse this exact
  value, don't invent a similar-but-different one.

### Layout conventions

- Standard content column: `max-w-7xl mx-auto px-6 md:px-10`
- Bleed-wider band pattern (darker background sections): outer
  `max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16`, containing a
  `rounded-[var(--radius-card)] bg-[var(--color-paper-dim)]` panel, with
  an inner `max-w-7xl mx-auto` wrapper for the actual content.
- `Astro.url.pathname` is unreliable in this static build — pass an
  explicit `currentPage` prop to `Header.astro` instead.

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
