import { test, expect, type Page } from '@playwright/test';

async function fits(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
}

for (const width of [320, 390, 768]) {
  test(`public mobile layout ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 667 });
    await page.goto('/');
    await fits(page);
    for (const name of ['News', 'Tournament', 'Teams', 'Vendors', 'Gallery', 'About', 'Contact']) {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await page.locator('header').getByRole('button', { name, exact: true }).click();
      await fits(page);
      if (name === 'Tournament') {
        for (const tab of ['Fixtures', 'Standings', 'Knockout', 'Teams']) {
          await page.locator('main').getByRole('button', { name: tab, exact: true }).click();
          await fits(page);
        }
      }
      if (name === 'Teams') {
        await page.locator('main button.card-lift').first().click();
        await fits(page);
        await page.getByRole('button', { name: 'Close team details' }).click();
      }
    }
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.locator('header').getByRole('button', { name: 'Register Your Team' }).click();
    await fits(page);
  });

  test(`admin mobile layout ${width}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 667 });
    await page.goto('/admin/login');
    await fits(page);
    await page.evaluate(() => localStorage.setItem('best5_admin_session', 'layout-test'));
    for (const path of ['', '/landing', '/posts', '/posts/new', '/media', '/media/gallery', '/vendors', '/teams', '/team-registrations', '/settings', '/settings/modules', '/settings/social', '/media/branding', '/fixtures', '/vendor-registrations']) {
      await page.goto(`/admin${path}`);
      await fits(page);
      if (path === '/posts/new') {
        await page.getByRole('button', { name: 'Choose image', exact: true }).click();
        await fits(page);
        await expect(page.getByRole('button', { name: 'Close image picker' })).toBeInViewport();
      }
    }
    await page.getByRole('button', { name: 'Open admin navigation' }).click();
    const logout = page.getByRole('button', { name: 'Logout', exact: true });
    await logout.scrollIntoViewIfNeeded();
    await expect(logout).toBeInViewport();
  });
}

test('phone landscape menu scrolls to registration', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 320 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  const register = page.locator('header').getByRole('button', { name: 'Register Your Team' });
  await register.scrollIntoViewIfNeeded();
  await expect(register).toBeInViewport();
  await register.click();
  await fits(page);
});
