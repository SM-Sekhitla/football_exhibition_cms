import { test, expect } from '@playwright/test';

for (const path of ['/admin', '/admin/login']) {
  test(`sign in directly from ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.getByRole('textbox', { name: 'Email / Username' }).fill('admin@best5.co.za');
    await page.getByLabel('Password', { exact: true }).fill('Best5Admin2026');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Logout', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Admin Portal', exact: true })).toBeVisible();
  });
}

test('incorrect credentials show feedback and allow retry', async ({ page }) => {
  await page.goto('/admin');
  await page.getByRole('textbox', { name: 'Email / Username' }).fill('admin@best5.co.za');
  await page.getByLabel('Password', { exact: true }).fill('incorrect');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Incorrect email or password');
  await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeEnabled();
  await page.getByLabel('Password', { exact: true }).fill('Best5Admin2026');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
});

test('session storage failure shows an error instead of leaving the form busy', async ({ page }) => {
  await page.goto('/admin');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'best5_admin_session') throw new DOMException('Storage unavailable', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByRole('textbox', { name: 'Email / Username' }).fill('admin@best5.co.za');
  await page.getByLabel('Password', { exact: true }).fill('Best5Admin2026');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('browser storage');
  await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeEnabled();
});
