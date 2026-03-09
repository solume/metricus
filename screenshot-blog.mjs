import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });

const pages = [
  { name: 'blog-index', file: 'blog/index.html' },
  { name: 'blog-article-1', file: 'blog/ai-chatbot-recommendations/index.html' },
  { name: 'blog-article-2', file: 'blog/seo-ignoring-buyers/index.html' },
  { name: 'blog-article-3', file: 'blog/ai-getting-pricing-wrong/index.html' },
];

for (const pg of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`file://${path.join(__dirname, pg.file)}`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(__dirname, `_screenshot-${pg.name}.png`), fullPage: true });
  console.log(`Captured: ${pg.name}`);
  await page.close();
}

await browser.close();
console.log('Done!');
