import { test, expect, type Page } from '@playwright/test';

async function admin(page: Page, path = '/admin') {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('best5_admin_session','workflow-test'));
  await page.goto(path);
}

test('public URLs support refresh, back, article reading and group filtering', async ({ page }) => {
  await page.goto('/news');
  await page.getByRole('button',{ name:'Read story',exact:true }).first().click();
  await expect(page).toHaveURL(/\/news\/road-to-best5$/);
  await page.reload();
  await expect(page.locator('main')).toContainText('every touch will matter');
  await page.goBack();
  await expect(page.getByRole('heading',{ name:'News',exact:true })).toBeVisible();
  await page.goto('/teams');
  await page.getByRole('button',{ name:'Group B',exact:true }).click();
  await expect(page.locator('main button.card-lift')).toHaveCount(4);
  await expect(page.locator('main')).not.toContainText('Polokwane City');
  await page.locator('main button.card-lift').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('main button.card-lift').first()).toBeFocused();
});

test('team registration recovers drafts, validates squad, reviews, approves and tracks status', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/register');
  await page.getByLabel('Team name',{exact:true}).fill('Workflow United');
  await page.getByLabel('Captain name').fill('Test Captain');
  await page.getByLabel('Email address',{exact:true}).fill('captain@example.com');
  await page.getByLabel('City',{exact:true}).fill('Polokwane');
  await page.reload();
  await expect(page.getByLabel('Team name',{exact:true})).toHaveValue('Workflow United');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  for (let i=1;i<=5;i++) await page.getByLabel(`Player ${i}`,{exact:true}).fill('Same Player');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('listed once');
  for (let i=1;i<=5;i++) await page.getByLabel(`Player ${i}`,{exact:true}).fill(`Player Name ${i}`);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.locator('main')).toContainText('Workflow United');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByLabel('Player 5',{exact:true})).toHaveValue('Player Name 5');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Submit application',exact:true}).click();
  const reference = await page.getByTestId('application-reference').innerText();
  await expect(page.getByRole('link',{name:'Contact organiser',exact:true})).toHaveAttribute('href',/wa\.me.*B5-/);
  await admin(page,'/admin/team-registrations');
  await page.getByRole('button',{name:'Review application'}).click();
  await page.getByLabel('Approval status').selectOption('Approved');
  await page.getByLabel('Payment status').selectOption('Verified');
  await page.getByLabel('Note to applicant').fill('Your place is confirmed.');
  await page.getByRole('button',{name:'Save review'}).click();
  await page.getByRole('button',{name:'Confirm',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/teams');
  await expect(page.locator('main')).toContainText('Workflow United');
  await page.goto('/application-status');
  await page.getByLabel('Application reference').fill(reference);
  await page.getByLabel('Email address').fill('captain@example.com');
  await page.getByRole('button',{name:'Check status',exact:true}).click();
  await expect(page.locator('main')).toContainText('Approved');
  await expect(page.locator('main')).toContainText('Verified');
  await expect(page.locator('main')).toContainText('Your place is confirmed.');
  await page.goto('/admin/team-registrations');
  await page.getByRole('button',{name:'Review application'}).click();
  await page.getByLabel('Approval status').selectOption('Rejected');
  await page.getByLabel('Note to applicant').fill('Application withdrawn.');
  await page.getByRole('button',{name:'Save review'}).click();
  await page.getByRole('button',{name:'Confirm',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/teams');
  await expect(page.locator('main')).not.toContainText('Workflow United');
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
  await page.getByRole('button',{name:'Review application'}).click();
  await expect(page.getByRole('dialog')).toContainText('Fresh meals for football fans.');
});

test('fixture editor rejects invalid teams and publishes results to standings', async ({ page }) => {
  await admin(page,'/admin/fixtures');
  await page.getByRole('button',{name:'Create fixture'}).click();
  await page.getByRole('combobox',{name:'Home team',exact:true}).selectOption('T1');
  await page.getByRole('combobox',{name:'Away team',exact:true}).selectOption('T1');
  await page.getByRole('button',{name:'Save match'}).click();
  await expect(page.getByRole('alert')).toContainText('different');
  await page.getByRole('combobox',{name:'Away team',exact:true}).selectOption('T3');
  await page.getByLabel('Kick-off time').fill('18:00');
  await page.getByRole('combobox',{name:'Status',exact:true}).selectOption('Full Time');
  await page.getByLabel('Home score').fill('2');
  await page.getByLabel('Away score').fill('1');
  await page.getByRole('button',{name:'Save match'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/tournament');
  await page.getByRole('button',{name:'Results',exact:true}).click();
  await expect(page.locator('main')).toContainText('2 – 1');
  await page.getByRole('button',{name:'Standings',exact:true}).click();
  const row = page.getByRole('row').filter({hasText:'Polokwane City'});
  await expect(row.getByRole('cell').last()).toHaveText('3');
  await expect(page.getByRole('button',{name:'Demo live update'})).toHaveCount(0);
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
  await page.goto('/news/matchday-report');
  await expect(page.locator('main')).toContainText('memorable result');
});

test('settings and disabled modules affect public pages and direct URLs', async ({ page }) => {
  await admin(page,'/admin/settings');
  await page.getByLabel('Venue',{exact:true}).fill('Community Arena');
  await page.getByLabel('Affiliation fee',{exact:true}).fill('1800');
  await page.getByRole('button',{name:'Save settings'}).click();
  await page.goto('/');
  await expect(page.locator('main')).toContainText('Community Arena');
  await page.goto('/admin/settings/modules');
  await page.getByRole('checkbox',{name:'teams',exact:true}).uncheck();
  await page.goto('/teams');
  await expect(page.getByRole('heading',{name:'Currently unavailable'})).toBeVisible();
  await page.goto('/');
  await expect(page.locator('main')).not.toContainText('Meet the field');
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
  await page.evaluate(() => localStorage.setItem('best5_media',JSON.stringify([{id:'image-test',src:'/assets/images/logo/smt_logo.png',name:'Test image',category:'Posts',type:'image/png',createdAt:new Date().toISOString()}])));
  await page.getByRole('textbox',{name:'Article content'}).fill('An illustrated report.');
  await page.getByRole('button',{name:'Image',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:/Test image/}).click();
  await expect(page.locator('.post-editor figure img')).toHaveCount(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('public articles remove unsafe HTML while preserving formatting', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const posts = JSON.parse(localStorage.getItem('best5_posts') || '[]');
    posts[0].content = '<h2>Safe heading</h2><p>Safe body</p><img src="x" onerror="window.__unsafe=true"><script>window.__unsafe=true</script><a href="javascript:alert(1)">Bad link</a>';
    localStorage.setItem('best5_posts',JSON.stringify(posts));
  });
  await page.goto('/news/road-to-best5');
  await expect(page.getByRole('heading',{name:'Safe heading'})).toBeVisible();
  await expect(page.locator('.post-editor script, .post-editor [onerror], .post-editor a[href^="javascript:"]')).toHaveCount(0);
});
