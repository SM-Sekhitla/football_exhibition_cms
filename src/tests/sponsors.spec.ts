import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {signIn} from './helpers';

test.setTimeout(60000);

test('admins upload sponsor artwork and publish it to the scrolling public strip',async({page,browser})=>{
 await signIn(page,'/admin/landing');
 await expect(page.getByRole('heading',{name:'Sponsor logos',exact:true})).toBeVisible();
 await expect(page.getByLabel('Sponsor 1 name',{exact:true})).toHaveValue('Silverdrop Water');
 await page.getByRole('button',{name:'Add sponsor logo',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Choose an image'});
 await dialog.locator('input[type=file]').setInputFiles({name:'sponsor-test.png',mimeType:'image/png',buffer:readFileSync(new URL('../public/assets/images/sponsors/aquelle.png',import.meta.url))});
 await dialog.getByRole('button',{name:/sponsor-test\.png/}).click();
 await page.getByLabel('Sponsor 4 name',{exact:true}).fill('Community Partner');
 await page.getByRole('button',{name:'Save changes',exact:true}).click();
 await expect(page.locator('main')).toContainText('Changes saved');
 await page.reload();
 await expect(page.getByLabel('Sponsor 4 name',{exact:true})).toHaveValue('Community Partner');
 const context=await browser.newContext();const publicPage=await context.newPage();
 await publicPage.goto('/');
 const strip=publicPage.getByRole('region',{name:'Our sponsors'});
 await strip.scrollIntoViewIfNeeded();
 await expect(strip).toContainText('Community Partner');
 await expect(strip.locator('img').first()).toBeVisible();
 await strip.screenshot({path:'/tmp/best5-sponsors-desktop.png'});
 await strip.getByRole('button',{name:'Pause sponsor logos'}).click();
 await expect(strip.locator('.sponsor-track')).toHaveCSS('animation-play-state','paused');
 await publicPage.setViewportSize({width:390,height:844});
 await strip.screenshot({path:'/tmp/best5-sponsors-mobile.png'});
 await publicPage.emulateMedia({reducedMotion:'reduce'});
 await expect(strip.locator('.sponsor-track')).toHaveCSS('animation-name','none');
 await publicPage.goto('/application-status#reference=B5-EXAMPLE');
 await expect(publicPage.getByLabel('Application reference')).toHaveValue('B5-EXAMPLE');
 await context.close();
});
