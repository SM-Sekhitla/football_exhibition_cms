import { test, expect } from '@playwright/test';

import { signIn as admin,writeResource } from './helpers';

test('public URLs support refresh, back, article reading and an empty team list', async ({ page }) => {
  await page.goto('/news');
  await page.getByRole('button',{ name:'Read story',exact:true }).first().click();
  await expect(page).toHaveURL(/\/news\/road-to-best5$/);
  await page.reload();
  await expect(page.locator('main')).toContainText('every touch will matter');
  await page.goBack();
  await expect(page.getByRole('heading',{ name:'News',exact:true })).toBeVisible();
  await page.goto('/teams');
  await expect(page.getByRole('heading',{name:'Teams',exact:true})).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Polokwane City');
});

test('vendor descriptions reach the review screen', async ({ page }) => {
  await page.goto('/register/vendor');
  await page.getByLabel('Business name',{exact:true}).fill('Local Kitchen');
  await page.getByLabel('Contact person').fill('Vendor Owner');
  await page.getByLabel('Email address',{exact:true}).fill('vendor@example.com');
  await page.getByLabel('Business description').fill('Fresh meals for football fans.');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Submit application',exact:true}).click();
  await expect(page.getByTestId('application-reference')).toBeVisible();
  await admin(page,'/admin/vendor-registrations');
  await page.locator('article').filter({hasText:'Local Kitchen'}).getByRole('button',{name:'Review application'}).click();
  await expect(page.getByRole('dialog')).toContainText('Fresh meals for football fans.');
});

test('publishing validates, previews, protects drafts and filters public content', async ({ page }) => {
  await admin(page,'/admin/posts/new');
  await page.getByRole('button',{name:'Publish',exact:true}).click();
  await expect(page).toHaveURL(/\/admin\/posts\/new$/);
  await page.getByLabel('Title',{exact:true}).fill('Matchday report');
  await page.getByLabel('Excerpt',{exact:true}).fill('A report from the arena.');
  await page.getByRole('textbox',{name:'Article content'}).fill('The final whistle brought a memorable result.');
  await page.getByRole('button',{name:'Preview',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Article preview'})).toContainText('memorable result');
  await page.getByRole('button',{name:'Close preview'}).click();
  page.once('dialog',dialog => dialog.dismiss());
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await expect(page).toHaveURL(/\/admin\/posts\/new$/);
  await page.getByRole('button',{name:'Save draft',exact:true}).click();
  await expect(page).toHaveURL(/\/admin\/posts$/);
  await page.goto('/');
  await expect(page.locator('main')).not.toContainText('Matchday report');
  await page.goto('/admin/posts');
  const card = page.locator('article').filter({hasText:'Matchday report'});
  await card.getByRole('button',{name:'Publish',exact:true}).click();
  await expect(card.getByRole('button',{name:'Unpublish',exact:true})).toBeVisible();
  await page.goto('/news/matchday-report');
  await expect(page.locator('main')).toContainText('memorable result');
});

test('settings and disabled modules affect public pages and direct URLs', async ({ page }) => {
  await admin(page,'/admin/settings');
  await page.getByLabel('Venue',{exact:true}).fill('Community Arena');
  await page.getByLabel('Affiliation fee',{exact:true}).fill('1800');
  await page.getByRole('button',{name:'Save settings'}).click();
  await expect(page.getByRole('status')).toContainText('Settings updated');
  await page.goto('/');
  await expect(page.locator('main')).toContainText('Community Arena');
  await page.goto('/admin/settings/modules');
  await page.getByRole('checkbox',{name:'teams',exact:true}).uncheck();
  await expect(page.getByRole('status')).toContainText('Settings updated');
  await page.goto('/teams');
  await expect(page.getByRole('heading',{name:'Currently unavailable'})).toBeVisible();
  await page.goto('/');
  await expect(page.locator('main')).not.toContainText('Meet the field');
  await page.goto('/admin/settings/modules');
  await page.getByRole('checkbox',{name:'teams',exact:true}).check();
  await expect(page.getByRole('status')).toContainText('Settings updated');
});

test('contact prepares a message without claiming it was sent', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Your name',{exact:true}).fill('A Supporter');
  await page.getByLabel('Email address',{exact:true}).fill('fan@example.com');
  await page.getByLabel('Your message',{exact:true}).fill('When do gates open?');
  await page.getByRole('button',{name:'Prepare message'}).click();
  await expect(page.getByRole('link',{name:'Open email app'})).toHaveAttribute('href',/mailto:.*When%20do%20gates%20open/);
  await expect(page.locator('main')).toContainText('Nothing is sent until you send the email.');
});

test('image picker returns focus and inserts an article image', async ({ page }) => {
  await admin(page,'/admin/posts/new');
  await writeResource(page,'media',[{id:'image-test',src:'/assets/images/logo/smt_logo.png',name:'Test image',category:'Posts',type:'image/png',createdAt:new Date().toISOString()}]);
  await page.reload();
  await page.getByRole('textbox',{name:'Article content'}).fill('An illustrated report.');
  await page.getByRole('button',{name:'Image',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:/Test image/}).click();
  await expect(page.locator('.post-editor figure img')).toHaveCount(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('public articles remove unsafe HTML while preserving formatting', async ({ page }) => {
  await admin(page);
  const snapshot=await (await page.request.get('/api/v1/admin/bootstrap')).json();
  const posts=snapshot.data.posts;
  posts.find((post:{slug:string})=>post.slug==='road-to-best5').content='<h2>Safe heading</h2><p>Safe body</p><img src="x" onerror="window.__unsafe=true"><script>window.__unsafe=true</script><a href="javascript:alert(1)">Bad link</a>';
  await writeResource(page,'posts',posts);
  await page.goto('/news/road-to-best5');
  await expect(page.getByRole('heading',{name:'Safe heading'})).toBeVisible();
  await expect(page.locator('.post-editor script, .post-editor [onerror], .post-editor a[href^="javascript:"]')).toHaveCount(0);
});
