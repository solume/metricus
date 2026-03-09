import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pages = [
  { name: 'home', file: 'index.html' },
  { name: 'example-report', file: 'example-report/index.html' },
  { name: 'onboarding', file: 'onboarding/index.html' },
  { name: 'thank-you', file: 'thank-you/index.html' },
];

const browser = await puppeteer.launch({ headless: true });

for (const pg of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`file://${path.join(__dirname, pg.file)}`, { waitUntil: 'networkidle0' });

  // Full page screenshot
  await page.screenshot({
    path: path.join(__dirname, `_screenshot-${pg.name}.png`),
    fullPage: true
  });

  console.log(`Captured: ${pg.name}`);
  await page.close();
}

// Mobile version of home
const mobilePage = await browser.newPage();
await mobilePage.setViewport({ width: 390, height: 844 });
await mobilePage.goto(`file://${path.join(__dirname, 'index.html')}`, { waitUntil: 'networkidle0' });
await mobilePage.screenshot({
  path: path.join(__dirname, '_screenshot-home-mobile.png'),
  fullPage: true
});
console.log('Captured: home-mobile');

await browser.close();
console.log('Done!');
