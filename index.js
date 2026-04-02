const { chromium } = require('playwright');

// Import our constants, at some point maybe some of these should go in a database, not rn tho
const RETAILERS = require('./data/retailers');
const ITEMS = require('./data/items');
const ZIP_CODE = require('./data/zipcodes');

async function crawl() {
  const browser = await chromium.launch({ headless: true });

  // loop through the retailers
  for (const retailer of RETAILERS) {
    const page = await browser.newPage();

    console.log(`Crawling - ${retailer.name}`);

    await page.goto(retailer.url, { waitUntil: 'domcontentloaded' });

    // Things start to get complicated here - need to get the triggers for each store's website, start with Aldi
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

      // Do your very best to attempt to parse the tile, most likely not successful tho
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

      // At a later date this result spot will be where we are saving things to the database, that is for a later date though
      if (cheapestName) console.log(`  ${item.padEnd(22)} $${cheapestPrice.toFixed(2)}  →  ${cheapestName}`);
      else console.log(`  ${item.padEnd(22)} no results`);
    }

    await page.close();
  }

  // don't forget to close the browser or bad things happen
  await browser.close();
}

crawl().catch(err => {
  console.error(err);
  process.exit(1);
});