// Progressive enhancement only: every section reads correctly without this file.
import type { KbEntry } from '../data/site';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Theme: persist the explicit choice -------------------------------- */
const saved = root.dataset.theme;
if (saved) (document.getElementById(`theme-${saved}`) as HTMLInputElement | null)?.click();
document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((el) =>
  el.addEventListener('change', () => {
    try {
      if (el.value === 'auto') { delete root.dataset.theme; localStorage.removeItem('theme'); }
      else { root.dataset.theme = el.value; localStorage.setItem('theme', el.value); }
    } catch {}
  }),
);

/* ---- Lens: mirror into ?lens= so a link opens in the same mode ----------- */
document.querySelectorAll<HTMLInputElement>('input[name="lens"]').forEach((el) =>
  el.addEventListener('change', () => {
    const url = new URL(location.href);
    url.searchParams.set('lens', el.value);
    history.replaceState(null, '', url);
  }),
);

/* ---- Scroll-spy ---------------------------------------------------------- */
const tocLinks = new Map(
  [...document.querySelectorAll<HTMLAnchorElement>('.toc a')].map((a) => [a.hash.slice(1), a]),
);
const spy = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      tocLinks.forEach((a, id) => a.setAttribute('aria-current', String(id === e.target.id)));
    }
  },
  { rootMargin: '-35% 0px -60% 0px' },
);
tocLinks.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

/* ---- Cursor spotlight ---------------------------------------------------- */
const spot = document.querySelector<HTMLElement>('.spotlight');
if (spot && !reduced && matchMedia('(pointer: fine)').matches) {
  let frame = 0;
  addEventListener('pointermove', (e) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      spot.style.setProperty('--mx', `${e.clientX}px`);
      spot.style.setProperty('--my', `${e.clientY}px`);
    });
  }, { passive: true });
}

/* ---- System maps --------------------------------------------------------- */
document.querySelectorAll<HTMLElement>('[data-map]').forEach((map) => {
  const nodes = [...map.querySelectorAll<HTMLButtonElement>('.node')];
  const edges = [...map.querySelectorAll<SVGLineElement>('.edge')];
  const out = map.querySelector<HTMLElement>('[data-detail-out]')!;
  const select = (btn: HTMLButtonElement) => {
    const id = btn.dataset.node!;
    nodes.forEach((n) => n.setAttribute('aria-pressed', String(n === btn)));
    edges.forEach((l) => l.classList.toggle('on', l.dataset.from === id || l.dataset.to === id));
    out.innerHTML = '';
    const s = document.createElement('strong');
    s.textContent = btn.textContent;
    out.append(s, ` ${btn.dataset.detail}`);
  };
  nodes.forEach((n) => n.addEventListener('click', () => select(n)));
  const hub = nodes.find((n) => n.classList.contains('hub'));
  if (hub) select(hub);
});

/* ---- Console: a tiny deterministic retrieval agent ----------------------- */
let kb: KbEntry[] = [];
const STOP = new Set('a an and are about as at be brent brent\'s can do does for from has have he his how i in is it me of on or so tell the to what whats when where which who why with you your'.split(' '));
const tokenize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9.\- ]+/g, ' ').split(/\s+/).filter((t) => t && !STOP.has(t));
const stem = (t: string) => t.replace(/(ing|ed|es|s)$/, '');

function retrieve(q: string) {
  const terms = tokenize(q);
  const scored = kb
    .map((e) => {
      let score = 0;
      const hits: string[] = [];
      for (const t of terms) {
        for (const k of e.keys) {
          const exact = k === t;
          const near = !exact && t.length > 3 && stem(k) === stem(t);
          if (exact || near) { score += exact ? 2 : 1; hits.push(k); break; }
        }
      }
      return { e, score, hits };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return { terms, scored };
}

const consoleEl = document.querySelector<HTMLElement>('[data-console]');
if (consoleEl) {
  kb = JSON.parse(document.getElementById('kb')?.textContent || '[]');
  const form = consoleEl.querySelector<HTMLFormElement>('[data-form]')!;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const trace = consoleEl.querySelector<HTMLOListElement>('[data-trace]')!;
  const answer = consoleEl.querySelector<HTMLElement>('[data-answer]')!;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  let run = 0;

  const step = (label: string, detail: string) => {
    const li = document.createElement('li');
    li.dataset.state = 'run';
    li.innerHTML = '<span class="dot"></span><b></b><code></code>';
    li.querySelector('b')!.textContent = label;
    li.querySelector('code')!.textContent = detail;
    trace.append(li);
    return li;
  };

  async function ask(q: string) {
    const id = ++run;
    q = q.trim().slice(0, 160);
    if (!q) return;
    input.value = q;
    trace.replaceChildren();
    answer.replaceChildren();

    const t0 = performance.now();
    const { terms, scored } = retrieve(q);
    const elapsed = performance.now() - t0;
    const top = scored[0];

    const steps: [string, string][] = [
      ['parse', terms.length ? `intent terms → [${terms.join(', ')}]` : 'no content terms found'],
      ['retrieve', `search_profile() → ${scored.length} of ${kb.length} passages matched`],
      ['rank', top ? `top: ${top.e.id} (score ${top.score}, via ${top.hits.join('/')})` : 'below confidence threshold'],
      ['compose', top ? `answer + citation → ${top.e.citeLabel}` : 'fallback → suggest a route'],
    ];
    for (const [label, detail] of steps) {
      const li = step(label, detail);
      await wait(260);
      if (id !== run) return;
      li.dataset.state = 'done';
    }

    const text = top
      ? top.e.answer
      : "That's outside what this page knows. Try asking about his work, leadership, CSS, or stack, or reach out on LinkedIn.";
    const p = document.createElement('p');
    p.className = 'caret';
    answer.append(p);
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      p.textContent = words.slice(0, i + 1).join(' ');
      await wait(18);
      if (id !== run) return;
    }
    p.classList.remove('caret');

    const meta = document.createElement('p');
    meta.className = 'cite mono muted';
    const href = top ? top.e.cite : '#contact';
    meta.innerHTML = `Source: <a href="${href}"></a> · computed in ${elapsed.toFixed(2)} ms · 0 network requests`;
    meta.querySelector('a')!.textContent = top ? top.e.citeLabel : 'Contact';
    answer.append(meta);
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  consoleEl.querySelectorAll<HTMLButtonElement>('[data-ask]').forEach((b) =>
    b.addEventListener('click', () => ask(b.dataset.ask!)),
  );
}
