import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';

type Issue = { url: string; title: string; topics: string[]; findingIds: string[] };

const DESKTOP = { width: 1280, height: 900 };
const PHONE = { width: 390, height: 844 };
const BG = { light: 'rgb(243, 241, 234)', dark: 'rgb(11, 16, 14)' } as const;

async function issues(request: APIRequestContext): Promise<Issue[]> {
  const response = await request.get('/digest/index.json');
  expect(response.ok()).toBe(true);
  return (await response.json()).issues;
}

/** The pages every cross-cutting check runs on: home, digest index, latest issue, a topic. */
async function corePages(request: APIRequestContext) {
  const [latest] = await issues(request);
  return ['/', '/digest/', latest.url, `/digest/topic/${latest.topics[0]}/`];
}

const homeLink = (page: Page) => page.getByRole('banner').getByRole('link', { name: /Brent Stees/ });
const findingsNav = (page: Page) => page.getByRole('navigation', { name: 'Findings in this issue' });
const firstIssueLink = (page: Page) => page.locator('.digest-card h2 a').first();

test.beforeEach(async ({ page }) => {
  // The site drops transitions under reduced motion, which keeps style assertions deterministic.
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('round trip', () => {
  test('homepage → digest → issue → digest → homepage', async ({ page, request }) => {
    const [latest] = await issues(request);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Brent Stees' })).toBeVisible();

    await page.getByRole('link', { name: /Read the brief/ }).click();
    await expect(page).toHaveURL(/\/digest\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineering Brief');

    await firstIssueLink(page).click();
    await expect(page).toHaveURL(new RegExp(`${latest.url}$`));
    await expect(page.getByRole('heading', { level: 1, name: latest.title })).toBeVisible();

    await page.getByRole('link', { name: '← All issues' }).click();
    await expect(page).toHaveURL(/\/digest\/$/);

    await homeLink(page).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Brent Stees' })).toBeVisible();
  });

  test('homepage links the brief from the teaser, the section nav and the footer', async ({ page, request }) => {
    const [latest] = await issues(request);
    await page.setViewportSize(DESKTOP);
    await page.goto('/');
    const teaser = page.locator('#brief');
    await expect(teaser.getByRole('link', { name: latest.title })).toHaveAttribute('href', latest.url);
    await expect(teaser.getByRole('link', { name: /Read the brief/ })).toHaveAttribute('href', '/digest/');
    await expect(page.locator('.foot').getByRole('link', { name: 'AI engineering brief' })).toHaveAttribute('href', '/digest/');

    // Every nav entry carries the same number as the section it points to.
    const entries = page.getByRole('navigation', { name: 'Sections' }).getByRole('link');
    expect(await entries.count()).toBeGreaterThan(3);
    for (const entry of await entries.all()) {
      const number = (await entry.locator('.mono').textContent())!.trim();
      const target = page.locator((await entry.getAttribute('href'))!);
      await expect(target.locator('.kicker')).toContainText(`${number} ·`);
    }
    await expect(entries.filter({ hasText: 'Brief' })).toHaveAttribute('href', '#brief');
  });

  test('every digest page links home, to the digest index, and to the profiles', async ({ page, request }) => {
    for (const path of (await corePages(request)).slice(1)) {
      await page.goto(path);
      await expect(homeLink(page)).toHaveAttribute('href', '/');
      const banner = page.getByRole('banner');
      await expect(banner.getByRole('link', { name: 'All issues' })).toHaveAttribute('href', '/digest/');
      for (const name of ['GitHub', 'LinkedIn', 'CodePen']) await expect(banner.getByRole('link', { name })).toBeVisible();
      await expect(banner.getByRole('group', { name: 'Color theme' })).toBeVisible();
      await expect(page.locator('input[name="lens"]')).toHaveCount(0);
    }
  });

  test('unknown URLs get a real 404 page with a way home', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText("isn't here");
    await expect(page.getByRole('main').getByRole('link', { name: /homepage/ })).toHaveAttribute('href', '/');
  });
});

test.describe('theme', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} choice carries across the homepage, digest and issue`, async ({ page, request }) => {
      const [latest] = await issues(request);
      // The OS preference is the opposite, so only the stored choice can explain the result.
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme === 'light' ? 'dark' : 'light' });
      await page.goto('/');
      await page.locator(`label[for="theme-${theme}"]`).click();
      await expect(page.locator('body')).toHaveCSS('background-color', BG[theme]);

      for (const path of ['/digest/', latest.url, '/']) {
        await page.goto(path);
        await expect(page.locator(`#theme-${theme}`)).toBeChecked();
        await expect(page.locator('body')).toHaveCSS('background-color', BG[theme]);
      }
    });
  }

  test('choosing auto on a digest page clears the stored choice everywhere', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await page.goto('/');
    await page.locator('label[for="theme-dark"]').click();
    await page.goto('/digest/');
    await expect(page.locator('body')).toHaveCSS('background-color', BG.dark);
    await page.locator('label[for="theme-auto"]').click();
    await expect(page.locator('body')).toHaveCSS('background-color', BG.light);
    await page.goto('/');
    await expect(page.locator('#theme-auto')).toBeChecked();
    await expect(page.locator('body')).toHaveCSS('background-color', BG.light);
  });
});

test.describe('findings navigation', () => {
  test('every issue lists one numbered entry per finding, each pointing at a heading', async ({ page, request }) => {
    test.slow();
    for (const issue of await issues(request)) {
      await page.goto(issue.url);
      const links = findingsNav(page).getByRole('link');
      await expect(links, issue.url).toHaveCount(issue.findingIds.length);
      const entries = await links.evaluateAll((anchors) =>
        anchors.map((a) => ({
          number: a.querySelector('.mono')?.textContent?.trim(),
          heading: document.getElementById(decodeURIComponent((a as HTMLAnchorElement).hash.slice(1)))?.textContent ?? null,
        })),
      );
      entries.forEach((entry, index) => {
        expect(entry.number, issue.url).toBe(String(index + 1).padStart(2, '0'));
        expect(entry.heading, issue.url).toMatch(new RegExp(`^${index + 1}\\.\\s`));
      });
    }
  });

  test('scroll-spy tracks the finding being read, including jumps and scrolling back', async ({ page, request }) => {
    const [latest] = await issues(request);
    await page.setViewportSize(DESKTOP);
    await page.goto(latest.url);
    const links = findingsNav(page).getByRole('link');
    const current = findingsNav(page).locator('[aria-current="true"]');
    await expect(current).toHaveCount(0);

    // Jump straight into the body of the second finding without passing its heading slowly.
    await page.evaluate(() => {
      const hash = document.querySelectorAll<HTMLAnchorElement>('.digest-toc a')[1].hash;
      const heading = document.getElementById(decodeURIComponent(hash.slice(1)))!;
      scrollTo({ top: heading.getBoundingClientRect().bottom + scrollY + 40, behavior: 'instant' });
    });
    await expect(links.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(current).toHaveCount(1);

    await links.nth(3).click();
    await expect(links.nth(3)).toHaveAttribute('aria-current', 'true');
    await expect(page).toHaveURL(/#4-/);

    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(current).toHaveCount(0);
  });
});

test.describe('keyboard only', () => {
  test('round trip, findings nav and theme control without a pointer', async ({ page, request, browserName }) => {
    const [latest] = await issues(request);
    await page.setViewportSize(DESKTOP);
    // Safari only tabs to links with Option held unless the user changes a system setting.
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    const tabTo = async (target: Locator, key = tab) => {
      for (let presses = 0; presses < 120; presses += 1) {
        await page.keyboard.press(key);
        if (await target.evaluate((element) => element === document.activeElement)) return;
      }
      throw new Error(`Focus never reached ${target}`);
    };

    await page.goto('/');
    await page.keyboard.press(tab);
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await page.keyboard.press(tab);
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('main')))).toBe(true);

    const readBrief = page.getByRole('link', { name: /Read the brief/ });
    await tabTo(readBrief);
    await expect(readBrief).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/digest\/$/);

    await tabTo(firstIssueLink(page));
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${latest.url}$`));

    const second = findingsNav(page).getByRole('link').nth(1);
    await tabTo(second);
    await expect(second).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#2-/);
    await expect(second).toHaveAttribute('aria-current', 'true');

    // The theme control is one radio group: tab in, arrow between options.
    await page.goto(latest.url);
    await tabTo(page.locator('#theme-auto'));
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#theme-light')).toBeChecked();
    // Playwright's WebKit drops :focus-visible when an arrow key moves between radios.
    if (browserName !== 'webkit') await expect(page.locator('label[for="theme-light"]')).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await tabTo(homeLink(page), browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#theme-light')).toBeChecked();
  });
});

test.describe('390px wide', () => {
  test.use({ viewport: PHONE });

  test('no page scrolls sideways or pushes content off screen', async ({ page, request }) => {
    for (const path of [...(await corePages(request)), '/this-page-does-not-exist/']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => {
        const width = document.documentElement.clientWidth;
        const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return box.width > 0 && box.height > 0 && (box.right > width + 1 || box.left < -1) && getComputedStyle(element).position !== 'fixed';
          })
          .map((element) => `${element.tagName.toLowerCase()}.${element.className}`);
        return { scrollWidth: document.documentElement.scrollWidth, width, offenders: offenders.slice(0, 5) };
      });
      expect(overflow.scrollWidth, path).toBeLessThanOrEqual(overflow.width);
      expect(overflow.offenders, path).toEqual([]);
    }
  });

  test('digest header keeps the home link, digest links, profiles and theme control', async ({ page, request }) => {
    const [latest] = await issues(request);
    for (const path of ['/digest/', latest.url]) {
      await page.goto(path);
      const banner = page.getByRole('banner');
      await expect(homeLink(page)).toBeVisible();
      await expect(banner.getByRole('link', { name: 'All issues' })).toBeVisible();
      for (const name of ['GitHub', 'LinkedIn', 'CodePen']) await expect(banner.getByRole('link', { name })).toBeVisible();
      await expect(banner.getByRole('group', { name: 'Color theme' })).toBeVisible();
    }
  });

  test('findings nav is on the page and jumps to an item', async ({ page, request }) => {
    const [latest] = await issues(request);
    await page.goto(latest.url);
    const links = findingsNav(page).getByRole('link');
    await expect(links.first()).toBeVisible();
    await links.nth(2).click();
    await expect(page.getByRole('heading', { level: 2, name: /^3\.\s/ })).toBeInViewport();
  });

  test('round trip by tapping', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Read the brief/ }).click();
    await firstIssueLink(page).click();
    await expect(findingsNav(page)).toBeVisible();
    await homeLink(page).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Brent Stees' })).toBeVisible();
  });
});

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  for (const viewport of [DESKTOP, PHONE]) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${viewport.width}px ${theme}`, async ({ page, request }) => {
        test.slow();
        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
        for (const path of [...(await corePages(request)), '/this-page-does-not-exist/']) {
          await page.goto(path);
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          const summary = results.violations.map(
            (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(' | ')}`,
          );
          expect(summary, `${path} (${theme}, ${viewport.width}px)`).toEqual([]);
        }
      });
    }
  }
});
