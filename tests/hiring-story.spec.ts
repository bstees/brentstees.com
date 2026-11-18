import { expect, test } from '@playwright/test';

test('hiring story and project evidence are available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveTitle(/Hands-On Engineering Leadership/);
  await expect(page.locator('#about')).toContainText('I’ve led engineering teams');
  for (const id of ['ai-native', 'orca', 'nuk']) {
    const project = page.locator(`#${id}`);
    await expect(project.getByRole('heading', { name: 'What to inspect' })).toBeVisible();
    await expect(project).toContainText('Current scope:');
  }
  await expect(page.locator('#nuk a').first()).toHaveAttribute('href', 'https://nuk.brentstees.com/');
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || '{}');
  expect(schema.mainEntity.name).toBe('Brent Stees');
  expect(schema.mainEntity.jobTitle).toBeUndefined();
  await context.close();
});

test('both audience lenses keep the hiring and contact path', async ({ page }) => {
  await page.goto('/?lens=lead');
  await expect(page.locator('#lens-lead')).toBeChecked();
  await expect(page.locator('#about [data-lens="lead"]').first()).toBeVisible();
  await page.locator('label[for="lens-build"]').click();
  await expect(page.locator('#about [data-lens="build"]').first()).toBeVisible();
  await page.getByRole('link', { name: 'Connect', exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact')).toContainText('Let’s compare notes.');
});


test('historical career proof is visible in both lenses and links from the introduction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Leadership outcomes', exact: true }).click();
  await expect(page).toHaveURL(/#experience$/);
  const experience = page.locator('#experience');
  await expect(experience).toContainText('Skyline Technology Solutions');
  await expect(experience.locator('.career-highlights > li')).toHaveCount(3);
  await expect(experience).toContainText('4 teams · 24 engineers');
  await expect(experience).toContainText('One month to days');
  await expect(experience).toContainText('Approximately 75%');
  await page.locator('label[for="lens-lead"]').click();
  await expect(experience).toBeVisible();
  await expect(page.locator('#contact').getByRole('link', { name: /Connect on LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/brent-stees');
});


test('public copy describes capabilities without announcing a job search', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.statement')).toHaveText('Hands-on engineering. People-centered leadership.');
  for (const lens of ['lead', 'build']) {
    await page.locator(`label[for="lens-${lens}"]`).click();
    await expect(page.locator('#about .lede')).toContainText('I love building software and helping the people around me grow.');
    await expect(page.locator('#about .lede')).toContainText('I’ve led engineering teams');
  }
  await expect(page.locator('body')).not.toContainText(/interested in remote roles|looking for opportunities|discuss a role/i);
});

test('case study and recognition are linked and readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Read the 2021 recognition' })).toHaveAttribute('href',
    'https://technical.ly/software-development/reallist-engineers-software-most-influential/');
  await page.getByRole('link', { name: 'nūk case study: decisions, implementation, and evidence' }).click();
  await expect(page).toHaveURL(/\/work\/nuk\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('nūk');
  await expect(page.getByRole('heading', { name: 'Decisions and tradeoffs' })).toBeVisible();
  await expect(page.locator('main')).toContainText('first consumer');
  await expect(page.getByRole('link', { name: 'Browser and accessibility CI runs', exact: true })).toHaveAttribute('href', 'https://github.com/bstees/nuk/actions/workflows/browser-a11y.yml');
  await expect(page.locator('main')).toContainText('do not establish');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Back to selected work', exact: true }).click();
  await expect(page).toHaveURL(/\/#work$/);
  await context.close();
});
