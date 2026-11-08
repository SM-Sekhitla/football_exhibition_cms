/** Generate install-icon sizes from the existing brand artwork. */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
const publicRoot = new URL('../public/', import.meta.url);
const source = 'data:image/png;base64,' + readFileSync(new URL('assets/images/logo/smt_logo.png',publicRoot)).toString('base64');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const [name,size,padding] of [['icon-192.png',192,.08],['icon-512.png',512,.08],['icon-maskable-512.png',512,.23],['apple-touch-icon.png',180,.1]]) {
    const data = await page.evaluate(async ({source,size,padding}) => {
      const image = new Image(); image.src = source; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
      const context = canvas.getContext('2d');
      context.fillStyle = '#07100c'; context.fillRect(0,0,size,size);
      const ratio = Math.min(size*(1-padding*2)/image.width,size*(1-padding*2)/image.height);
      const width = image.width*ratio, height = image.height*ratio;
      context.globalCompositeOperation = 'screen';
      context.drawImage(image,(size-width)/2,(size-height)/2,width,height);
      return canvas.toDataURL('image/png').split(',')[1];
    }, {source,size,padding});
    writeFileSync(new URL('icons/'+name,publicRoot),Buffer.from(data,'base64'));
  }
} finally { await browser.close(); }
