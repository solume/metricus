import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(`file://${path.join(__dirname, 'onboarding/index.html')}`, { waitUntil: 'networkidle0' });

// Step 1
await page.screenshot({ path: path.join(__dirname, '_ob-step1-empty.png'), fullPage: true });
console.log('Step 1 empty');

// Fill step 1
await page.type('#brandName', 'Acme CRM');
await page.type('#brandUrl', 'acmecrm.com');
await page.type('#brandDesc', 'CRM for small sales teams');
await page.screenshot({ path: path.join(__dirname, '_ob-step1-filled.png'), fullPage: true });
console.log('Step 1 filled');

// Click continue to step 2
await page.click('button.btn-checkout');
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: path.join(__dirname, '_ob-step2-empty.png'), fullPage: true });
console.log('Step 2 empty');

// Fill step 2
await page.type('#comp1', 'HubSpot');
await page.type('#comp2', 'Salesforce');
await page.type('#comp3', 'Pipedrive');
await page.type('#compMore', 'Zoho, Monday CRM');
await page.screenshot({ path: path.join(__dirname, '_ob-step2-filled.png'), fullPage: true });
console.log('Step 2 filled');

// Click continue to step 3 via JS
await page.evaluate(() => goStep(3));
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: path.join(__dirname, '_ob-step3-empty.png'), fullPage: true });
console.log('Step 3 empty');

// Fill step 3
await page.type('#queries', 'best CRM for small teams\nHubSpot vs alternatives\nwhat CRM should I use for a startup');
await page.type('#obEmail', 'test@acmecrm.com');
await page.type('#notes', 'We just launched a new API');
await page.screenshot({ path: path.join(__dirname, '_ob-step3-filled.png'), fullPage: true });
console.log('Step 3 filled');

// Submit via JS
await page.evaluate(() => submitOnboarding());
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: path.join(__dirname, '_ob-done.png'), fullPage: true });
console.log('Done state');

// Mobile flow
await page.setViewport({ width: 390, height: 844 });
await page.goto(`file://${path.join(__dirname, 'onboarding/index.html')}`, { waitUntil: 'networkidle0' });
await page.screenshot({ path: path.join(__dirname, '_ob-mobile-step1.png'), fullPage: true });
await page.type('#brandName', 'Acme CRM');
await page.evaluate(() => goStep(2));
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: path.join(__dirname, '_ob-mobile-step2.png'), fullPage: true });

console.log('All done!');
await browser.close();
