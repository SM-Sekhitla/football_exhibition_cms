import { expect, type Page } from '@playwright/test';
export const initialPassword='BrowserInitialPassword!2026';
export const adminPassword='BrowserChangedPassword!2026';
export async function signIn(page:Page,path='/admin') {
  let response=await page.request.post('/api/v1/auth/login',{data:{email:'admin@best5.co.za',password:adminPassword,remember:true}});
  if(response.status()===401) response=await page.request.post('/api/v1/auth/login',{data:{email:'admin@best5.co.za',password:initialPassword,remember:true}});
  expect(response.ok()).toBeTruthy();
  if((await response.json()).mustChangePassword) {
    const csrf=(await page.context().cookies()).find(c=>c.name==='best5_csrf')!.value;
    const changed=await page.request.post('/api/v1/auth/change-password',{headers:{'X-CSRF-Token':csrf},data:{currentPassword:initialPassword,newPassword:adminPassword}});
    expect(changed.ok()).toBeTruthy();
  }
  await page.goto(path);
  await expect(page.getByText('Operations platform',{exact:true})).toBeVisible();
}
export async function writeResource(page:Page,key:string,value:unknown) {
  const snapshot=await (await page.request.get('/api/v1/admin/bootstrap')).json();
  const csrf=(await page.context().cookies()).find(c=>c.name==='best5_csrf')!.value;
  const response=await page.request.put(`/api/v1/admin/content/${key}`,{headers:{'X-CSRF-Token':csrf},data:{revision:snapshot.revisions[key],value}});
  expect(response.ok(),await response.text()).toBeTruthy();
  return response.json();
}
export const proof={name:'proof.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF')};
