# brentstees.com

Personal site for brentstees.com. Astro 7 + vanilla CSS, zero client framework, fully static output.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/ (plain static files: any static host works)
npm run test:browser   # build, then Playwright + axe (Chromium, Firefox, WebKit)
npm run test:live      # the same suite against https://brentstees.com
```

## Structure

- `src/data/site.ts`: all copy, system-map nodes, and the console knowledge base (single source of truth)
- `src/pages/index.astro`: markup
- `src/styles/global.css`: tokens → layout → components
- `src/scripts/main.ts`: progressive enhancement (console agent, maps, scroll-spy, spotlight, theme persistence)

## Friday AI Engineering Brief

Issues live in `src/content/digests/YYYY-MM-DD.md` (schema: `src/content.config.ts`) and publish under `/digest/`.

Weekly flow:

1. The Friday brief task writes a draft in the shape of `scripts/brief/issue-template.md`, using
   `scripts/brief/prompts/brief.v1.md` and the sources in `scripts/brief/sources.v2.json`.
2. `npm run brief:new -- draft.md` (or `pbpaste | npm run brief:new -- -`) fills in the issue number, date and
   finding ids, validates, and pushes a `brief/YYYY-MM-DD` branch with a link to open the pull request.
3. CI validates, builds and runs the browser tests on the pull request. Merging it is the approval.
4. `npm run deploy`.

`npm run validate:digests` runs before every build and fails closed. New issues must have three to five numbered
findings, each with a dateline inside the seven-day window, an HTTPS primary source, what changed, why it matters
and a practical takeaway, be in scope (`scripts/brief/relevance.mjs`), keep quotes to 20 words, and carry no
`[REVIEW …]` flags. There is no draft state yet: add a draft/approved gate before the site is marketed.

## Design system notes

- **Split layout**: anchored left rail (identity, lens, scroll-spy nav), scrolling right column.
- **Leader / Builder lens**: radio + `:has()` swaps audience-specific copy with **no JS**; `@starting-style` fades it in. `?lens=lead|build` makes shareable links.
- **Theme**: `light-dark()` tokens; auto/light/dark via `:has()`, persisted with `localStorage`.
- **Agentic console** (hidden: `features.console` in `src/data/site.ts`): deterministic retrieval agent over `kb` (parse → retrieve → rank → compose → cite). Runs locally, no LLM.
- **System maps**: HTML buttons over an SVG edge layer sharing one 0–100 coordinate space; container query collapses to a list on narrow widths.
- Self-hosted fonts (Fontsource), `prefers-reduced-motion` respected.

## Launch TODO

- Add public email in `links.email` (`src/data/site.ts`).
- Facts are limited to Brent's own statements and public repos. Add employers or metrics only once verified.
