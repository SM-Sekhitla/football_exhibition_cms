import { test, expect } from '@playwright/test';

test('new intake requires prerequisites and POP, preserves submission after reload', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Before you register' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('best5_teams')!))).toEqual([]);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Start team registration' }).click();
  await page.getByLabel('Team name', { exact: true }).fill('New United');
  await page.getByLabel('Captain name').fill('Player Name 1');
  await page.getByLabel('Email address', { exact: true }).fill('captain@example.com');
  await page.getByLabel('City', { exact: true }).fill('Polokwane');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  for (let i = 1; i <= 5; i++) await page.getByLabel(`Player ${i}`, { exact: true }).fill(`Player Name ${i}`);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByTestId('application-reference')).toHaveCount(0);
  await page.getByLabel('Spot booking proof of payment (POP)').setInputFiles({ name: 'proof.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test payment proof') });
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByTestId('application-reference')).toBeVisible();
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('best5_team_registrations')!)[0].proofOfPayment.name)).toBe('proof.pdf');
  await page.evaluate(() => localStorage.setItem('best5_admin_session', 'test'));
  await page.goto('/admin/team-registrations');
  await page.getByRole('button', { name: 'Review application' }).click();
  await expect(page.getByRole('link', { name: 'Download POP: proof.pdf' })).toHaveAttribute('download', 'proof.pdf');
});

test('banking changes require password and prerequisites are editable', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('best5_admin_session', 'test'));
  await page.goto('/admin/settings/registration');
  await page.getByLabel('Bank name', { exact: true }).fill('Updated bank');
  await page.getByLabel('Confirm admin password').fill('wrong');
  await page.getByRole('button', { name: 'Save banking details' }).click();
  await expect(page.getByRole('status')).toContainText('Incorrect admin password');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('best5_settings')!).banking.bankName)).toBe('Standard Bank');
  await page.getByLabel('Confirm admin password').fill('Best5Admin2026');
  await page.getByRole('button', { name: 'Save banking details' }).click();
  await page.getByLabel('Prerequisites and required documents').fill('Bring your payment proof and five players.');
  await page.getByRole('button', { name: 'Save prerequisites' }).click();
  await page.goto('/register');
  await expect(page.locator('main')).toContainText('Bring your payment proof and five players.');
  await expect(page.locator('main')).toContainText('Updated bank');
});

test('existing intake is cleared once without clearing future registrations', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('best5_clean_intake_v1');
    localStorage.setItem('best5_teams', JSON.stringify([{ id: 'old-team' }]));
    localStorage.setItem('best5_team_registrations', JSON.stringify([{ id: 'old-registration' }]));
    localStorage.setItem('best5_fixtures', JSON.stringify([{ id: 'old-fixture' }]));
  });
  await page.reload();
  expect(await page.evaluate(() => ['best5_teams','best5_team_registrations','best5_fixtures'].map(key => JSON.parse(localStorage.getItem(key)!)))).toEqual([[],[],[]]);
  await page.evaluate(() => localStorage.setItem('best5_team_registrations', JSON.stringify([{ id: 'new-registration' }])));
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('best5_team_registrations')!))).toEqual([{ id: 'new-registration' }]);
});
