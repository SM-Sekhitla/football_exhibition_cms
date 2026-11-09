import {test,expect} from '@playwright/test';
import {signIn} from './helpers';

test('vendor category selection shows the correct price before submission',async({page})=>{
 await page.goto('/register/vendor');
 await expect(page.locator('main')).toContainText(/Stall fee: R\s*1[\s,]?000/);
 for(const category of ['Clothing & Accessories','Lifestyle & Services','Brand Activations']){
  await page.getByLabel('Vendor category').selectOption(category);
  await expect(page.locator('main')).toContainText(/Stall fee: R\s*350/);
 }
 await page.getByLabel('Vendor category').selectOption('Food & Drinks');
 await expect(page.locator('main')).toContainText(/Stall fee: R\s*1[\s,]?000/);
});

test('post order saves and is used by public news and homepage stories',async({page,browser})=>{
 await signIn(page,'/admin/posts');
 const cards=page.locator('main article');
 const first=(await cards.nth(0).getByRole('heading').textContent())!.trim();
 const second=(await cards.nth(1).getByRole('heading').textContent())!.trim();
 await cards.nth(1).getByRole('button',{name:/Move .* earlier/}).click();
 await expect(cards.nth(0).getByRole('heading')).toHaveText(second);
 await page.reload();
 await expect(cards.nth(0).getByRole('heading')).toHaveText(second);
 const context=await browser.newContext();const publicPage=await context.newPage();
 await publicPage.goto('/news');
 await expect(publicPage.locator('main article').nth(0).getByRole('heading')).toHaveText(second);
 await publicPage.goto('/');
 await expect(publicPage.locator('main article').nth(0).getByRole('heading')).toHaveText(second);
 await context.close();
 await page.getByLabel('Search posts').fill(first);
 await expect(page.getByRole('button',{name:/Move .* later/})).toBeDisabled();
});
