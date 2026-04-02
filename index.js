'use strict';

const { chromium } = require('playwright');

const ZIP_CODE = '10001';

const ITEMS = [
  'large eggs dozen',
  'whole milk gallon',
  'white bread loaf',
  'butter salted',
  'cheddar cheese',
];

const RETAILERS = [
  {
    name: 'Walmart',
    url: 'https://www.walmart.com',
    zipTrigger:  '[data-testid="header-store-finder"]',
    zipInput:    'input[name="location"]',
    zipSubmit:   '[data-testid="set-store-submit-btn"]',
    storeOption: '[data-testid="store-list-item"]:first-child button',
    searchInput: '#global-search-input',
    resultTile:  '[data-testid="list-view"]',
    priceEl:     '[itemprop="price"]',
    nameEl:      '[data-testid="product-title"]',
  },
  {
    name: 'Aldi',
    url: 'https://www.aldi.us',
    zipTrigger:  '[data-testid="storeFinderLink"]',
    zipInput:    '#location-search',
    zipSubmit:   'button[type="submit"]',
    storeOption: '.store-list__item:first-child .store-list__select-btn',
    searchInput: '#search-input',
    resultTile:  '.product-tile',
    priceEl:     '.product-tile__price',
    nameEl:      '.product-tile__name',
  },
  {
    name: 'Target',
    url: 'https://www.target.com',
    zipTrigger:  '[data-test="@web/StoreFinderButton"]',
    zipInput:    'input[data-test="store-finder-input"]',
    zipSubmit:   'button[data-test="store-search-submit"]',
    storeOption: '[data-test="store-card-select-store"]:first-of-type',
    searchInput: '[data-test="@web/Search/SearchInput"]',
    resultTile:  '[data-test="product-details"]',
    priceEl:     '[data-test="product-price"]',
    nameEl:      '[data-test="product-title"]',
  },
];

// ─────────────────────────────────────────────
//  Entry point
// ─────────────────────────────────────────────
async function crawl() {
  const browser = await chromium.launch({ headless: true });

  for (const retailer of RETAILERS) {
    const page = await browser.newPage();

    console.log(`\n========== ${retailer.name} ==========`);

    // 1. Navigate to site
    await page.goto(retailer.url, { waitUntil: 'domcontentloaded' });

    // 2. Enter ZIP code and select nearest store
    await page.waitForSelector(retailer.zipTrigger);
    await page.click(retailer.zipTrigger);
    await page.waitForSelector(retailer.zipInput);
    await page.fill(retailer.zipInput, ZIP_CODE);
    await page.click(retailer.zipSubmit);
    await page.waitForSelector(retailer.storeOption);
    await page.click(retailer.storeOption);
    await page.waitForLoadState('networkidle');

    // 3. Search loop
    for (const item of ITEMS) {
      // Locate search bar, type item, submit
      await page.waitForSelector(retailer.searchInput);
      await page.click(retailer.searchInput, { clickCount: 3 });
      await page.fill(retailer.searchInput, item);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Grab first 5 result tiles
      const tiles = (await page.$$(retailer.resultTile)).slice(0, 5);

      let cheapestPrice = Infinity;
      let cheapestName  = null;

      for (const tile of tiles) {
        const nameEl  = await tile.$(retailer.nameEl);
        const priceEl = await tile.$(retailer.priceEl);
        if (!nameEl || !priceEl) continue;

        const name     = (await nameEl.innerText()).trim();
        const priceRaw = await priceEl.getAttribute('content') || await priceEl.innerText();
        const price    = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));

        if (!isNaN(price) && price < cheapestPrice) {
          cheapestPrice = price;
          cheapestName  = name;
        }
      }

      // Log result
      if (cheapestName) {
        console.log(`  ${item.padEnd(22)} $${cheapestPrice.toFixed(2)}  →  ${cheapestName}`);
      } else {
        console.log(`  ${item.padEnd(22)} no results`);
      }
    }

    // 4. Exit site and close page
    await page.close();
    console.log(`  [${retailer.name} done]`);
  }

  // 5. Close crawler gracefully
  await browser.close();
  console.log('\nAll done. Browser closed.');
}

crawl().catch(err => {
  console.error(err);
  process.exit(1);
});