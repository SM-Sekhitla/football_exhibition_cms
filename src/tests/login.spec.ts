import { test,expect } from '@playwright/test';
import { signIn, adminPassword,initialPassword } from './helpers';

test('initial password must change before administration, cookies persist and logout revokes session',async({page})=>{
  await page.goto('/admin/login');
  await page.getByLabel('Email / Username').fill('admin@best5.co.za');
  await page.getByLabel('Password',{exact:true}).fill(initialPassword);
  await page.getByRole('button',{name:'Login',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Set your new password'})).toBeVisible();
  const card=page.locator('main > section');
  const box=await card.boundingBox();const viewport=page.viewportSize()!;
  expect(Math.abs(box!.x+box!.width/2-viewport.width/2)).toBeLessThan(2);
  expect(Math.abs(box!.y+box!.height/2-viewport.height/2)).toBeLessThan(2);
  await page.getByRole('button',{name:'Show current password',exact:true}).click();
  await expect(page.getByLabel('Current password',{exact:true})).toHaveAttribute('type','text');
  await page.getByRole('button',{name:'Hide current password',exact:true}).click();
  await expect(page.getByLabel('Current password',{exact:true})).toHaveAttribute('type','password');
  await expect(page.getByRole('button',{name:'Show new password',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Show confirm new password',exact:true})).toBeVisible();
  await page.screenshot({path:'/tmp/best5-password-setup.png'});

  await page.getByLabel('Current password',{exact:true}).fill(initialPassword);
  await page.getByLabel('New password',{exact:true}).fill(adminPassword);
  await page.getByLabel('Confirm new password',{exact:true}).fill(adminPassword);
  await page.getByRole('button',{name:'Change password',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();
  const cookies=await page.context().cookies();expect(cookies.find(c=>c.name==='best5_session')?.httpOnly).toBeTruthy();
  expect(await page.evaluate(()=>localStorage.getItem('best5_admin_session'))).toBeNull();
  await page.getByRole('button',{name:'Logout',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Admin Portal',exact:true})).toBeVisible();
  expect((await page.request.get('/api/v1/auth/me')).status()).toBe(401);
});

test('incorrect credentials allow retry',async({page})=>{
  await page.goto('/admin');await page.getByLabel('Email / Username').fill('admin@best5.co.za');await page.getByLabel('Password',{exact:true}).fill('incorrect');await page.getByRole('button',{name:'Login',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Incorrect email or password');
  await signIn(page);await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();
});

test('staff and backend log screens load real server data',async({page})=>{
  await signIn(page,'/admin/settings/users');await expect(page.locator('main')).toContainText('admin@best5.co.za');
  await expect(page.getByRole('navigation',{name:'Admin navigation'}).getByRole('button',{name:'My Account',exact:true})).toHaveCount(0);
  await expect(page.getByRole('navigation',{name:'Settings pages'}).getByRole('button',{name:'My Account',exact:true})).toBeVisible();
  await expect(page.getByTestId('admin-role')).toHaveText('Super admin');
  await page.goto('/admin/logs');await expect(page.getByRole('heading',{name:'Backend logs',exact:true})).toBeVisible();await expect(page.locator('main')).toContainText('Signed in');
  await expect(page.getByRole('heading',{name:'Recent backend requests'})).toBeVisible();
});


test('an admin login cannot see super-admin navigation or access logs directly',async({page,browser})=>{
  await signIn(page,'/admin/settings/users');
  const csrf=(await page.context().cookies()).find(c=>c.name==='best5_csrf')!.value;
  const email=`admin-${Date.now()}@example.com`;
  const created=await page.request.post('/api/v1/admin/users',{headers:{'X-CSRF-Token':csrf},data:{email,name:'Tournament Admin',role:'admin',password:'OrdinaryAdminPassword!2026'}});
  expect(created.ok()).toBeTruthy();
  const context=await browser.newContext();const admin=await context.newPage();
  await admin.goto('/admin/login');
  await admin.getByLabel('Email / Username').fill(email);await admin.getByLabel('Password',{exact:true}).fill('OrdinaryAdminPassword!2026');
  await admin.getByRole('button',{name:'Login',exact:true}).click();
  await admin.getByLabel('Current password',{exact:true}).fill('OrdinaryAdminPassword!2026');
  await admin.getByLabel('New password',{exact:true}).fill('OrdinaryChangedPassword!2026');
  await admin.getByLabel('Confirm new password',{exact:true}).fill('OrdinaryChangedPassword!2026');
  await admin.getByRole('button',{name:'Change password',exact:true}).click();
  await expect(admin.getByTestId('admin-role')).toHaveText('Admin');
  await expect(admin.getByRole('button',{name:'Backend Logs',exact:true})).toHaveCount(0);
  await admin.getByRole('button',{name:'Settings',exact:true}).click();
  await expect(admin.getByRole('navigation',{name:'Settings pages'}).getByRole('button',{name:'Staff & Roles',exact:true})).toHaveCount(0);
  await admin.goto('/admin/logs');await expect(admin.getByRole('heading',{name:'You do not have access to this page'})).toBeVisible();
  expect((await admin.request.get('/api/v1/admin/logs')).status()).toBe(403);
  await context.close();
});
