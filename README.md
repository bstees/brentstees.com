# brentstees.com

Personal site for brentstees.com. Astro 7 + vanilla CSS, zero client framework, fully static output.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/ (plain static files: any static host works)
```

## Structure

- `src/data/site.ts`: all copy, system-map nodes, and the console knowledge base (single source of truth)
- `src/pages/index.astro`: markup
- `src/styles/global.css`: tokens → layout → components
- `src/scripts/main.ts`: progressive enhancement (console agent, maps, scroll-spy, spotlight, theme persistence)

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
