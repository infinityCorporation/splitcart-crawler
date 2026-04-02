const RETAILERS = [
  {
    name: 'Walmart',
    url: 'https://www.walmart.com',
    zipTrigger:  '[data-testid="header-store-finder"]', // All of these have to be set
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

module.export = RETAILERS;