import { expect, test } from '@playwright/test';

test('hiring story and project evidence are available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveTitle(/Hands-On Engineering Leadership/);
  await expect(page.locator('#about')).toContainText('engineering leadership experience');
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
  await page.getByRole('link', { name: 'Discuss a role' }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact')).toContainText('remote roles');
});
