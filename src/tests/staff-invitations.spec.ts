import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {signIn} from './helpers';

function testInvitation(email:string) {
  // Read only the isolated test outbox; no live email is sent by the test server.
  const code=`import sqlite3,sys
connection=sqlite3.connect(sys.argv[1])
row=connection.execute("SELECT body FROM email_jobs WHERE recipient=? AND status='pending' ORDER BY next_attempt DESC LIMIT 1",(sys.argv[2],)).fetchone()
print(next(line for line in row[0].splitlines() if '/admin/accept-invitation#' in line))`;
  const link=execFileSync('../../football_exhibition_backend/src/.venv/bin/python',['-c',code,process.env.BEST5_E2E_DB_PATH!,email],{encoding:'utf8'}).trim();
  const url=new URL(link);
  return url.pathname+url.hash;
}

test('staff receive a setup link, choose their own password and log in with their role',async({page,browser})=>{
  await signIn(page,'/admin/settings/users');
  const email=`invited-${Date.now()}@example.com`;
  await page.getByLabel('Staff name',{exact:true}).fill('Invited Reviewer');
  await page.getByLabel('Staff email',{exact:true}).fill(email);
  await page.getByLabel('Staff role',{exact:true}).selectOption('reviewer');
  await expect(page.getByLabel('Temporary password',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Create & invite user',exact:true}).click();
  const card=page.locator('article').filter({hasText:email});
  await expect(card).toContainText('Password setup: Pending');
  await expect(card).toContainText('Email: pending');
  const original=testInvitation(email);
  await card.getByRole('button',{name:'Resend invitation',exact:true}).click();
  await expect(page.getByRole('button',{name:'Create & invite user',exact:true})).toBeEnabled();
  const link=testInvitation(email);expect(link).not.toBe(original);
  const context=await browser.newContext();const staff=await context.newPage();
  await staff.goto(original);
  await staff.getByLabel('New password',{exact:true}).fill('MyOwnStaffPassword!2026');
  await staff.getByLabel('Confirm new password',{exact:true}).fill('MyOwnStaffPassword!2026');
  await staff.getByRole('button',{name:'Set password',exact:true}).click();
  await expect(staff.getByRole('alert')).toContainText('invalid or expired');
  await staff.goto(link);
  await staff.getByLabel('New password',{exact:true}).fill('MyOwnStaffPassword!2026');
  await staff.getByLabel('Confirm new password',{exact:true}).fill('MyOwnStaffPassword!2026');
  await staff.getByRole('button',{name:'Show new password',exact:true}).click();
  await expect(staff.getByLabel('New password',{exact:true})).toHaveAttribute('type','text');
  await staff.getByRole('button',{name:'Set password',exact:true}).click();
  await expect(staff.getByRole('heading',{name:'Your account is ready'})).toBeVisible();
  await staff.getByRole('link',{name:'Go to login'}).click();
  await staff.getByLabel('Email / Username').fill(email);
  await staff.getByLabel('Password',{exact:true}).fill('MyOwnStaffPassword!2026');
  await staff.getByRole('button',{name:'Login',exact:true}).click();
  await expect(staff.getByTestId('admin-role')).toHaveText('Reviewer');
  await expect(staff.getByRole('heading',{name:'Set your new password'})).toHaveCount(0);
  await page.getByRole('button',{name:'Refresh staff',exact:true}).click();
  await expect(card).toContainText('Password set');
  await context.close();
});
