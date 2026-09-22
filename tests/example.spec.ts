import { test, expect } from '@playwright/test';

test('home opens with working local navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BEST5/);
  await expect(page.locator('main h1')).toContainText('Football');
  await page.locator('main').getByRole('button', { name:'Read all news' }).click();
  await expect(page).toHaveURL(/\/news$/);
  await expect(page.getByRole('heading', { name:'News', exact:true })).toBeVisible();
});
