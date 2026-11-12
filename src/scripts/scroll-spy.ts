// Scroll-spy shared by the homepage rail and the digest findings nav.
// The current entry is the last target whose top has crossed a line partway down the
// viewport. Measuring on scroll (not IntersectionObserver) keeps it correct after
// anchor jumps, fast scrolls, reloads mid-page, and scrolling back up.
export function scrollSpy(linkSelector: string, line = 0.3) {
  const pairs = [...document.querySelectorAll<HTMLAnchorElement>(linkSelector)]
    .map((a) => [a, document.getElementById(decodeURIComponent(a.hash.slice(1)))] as const)
    .filter((pair): pair is readonly [HTMLAnchorElement, HTMLElement] => pair[1] !== null);
  if (!pairs.length) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const threshold = innerHeight * line;
    let current: HTMLAnchorElement | null = null;
    for (const [a, target] of pairs) if (target.getBoundingClientRect().top <= threshold) current = a;
    // A short last section never reaches the line, so the page bottom selects it.
    if (current && innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = pairs.at(-1)![0];
    for (const [a] of pairs) {
      if (a === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  };
  const schedule = () => { frame ||= requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  update();
}
