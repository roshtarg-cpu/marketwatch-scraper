import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset } from 'crawlee';

await Actor.init();

const input = await Actor.getInput() || {};
const {
    stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'],
    maxResults = 50,
    proxyConfiguration,
} = input;

let count = 0;
const maxCount = parseInt(maxResults, 10);

// Create proxy configuration
const proxyConfig = await Actor.createProxyConfiguration(proxyConfiguration);

// Initialize crawler with Playwright (headless browser)
const crawler = new PlaywrightCrawler({
    proxyConfiguration: proxyConfig,
    maxRequestRetries: 3,
    requestHandlerTimeoutSecs: 90,
    launchContext: {
        launchOptions: {
            headless: true,
        },
    },
    
    async requestHandler({ request, page, log }) {
        const url = request.url;
        const symbol = request.userData.symbol;
        
        log.info(`Scraping ${symbol} from ${url}`);
        
        try {
            // Wait for page to load
            await page.waitForLoadState('networkidle');
            
            // Extract stock data
            const title = await page.title();
            
            // Extract data using page.evaluate
            const result = await page.evaluate((sym) => {
                const getText = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? el.textContent.trim() : null;
                };
                
                const getAttr = (selector, attr) => {
                    const el = document.querySelector(selector);
                    return el ? el.getAttribute(attr) : null;
                };
                
                // Company name
                const companyName = getText('h1.company__name') || getText('h1') || null;
                
                // Price data - try multiple selectors
                let price = getText('.bg-quote') || 
                           getText('.intraday__price .value') || 
                           getAttr('meta[name="price"]', 'content') || 
                           null;
                
                let change = getText('.change--point--q') || null;
                let changePercent = getText('.change--percent--q') || null;
                
                // Extract news headlines
                const newsHeadlines = [];
                document.querySelectorAll('.article__headline, .article-headline a, h3.article__headline a').forEach((el, i) => {
                    if (i < 5) {
                        const headline = el.textContent.trim();
                        const link = el.getAttribute('href') || el.closest('a')?.getAttribute('href');
                        if (headline) {
                            newsHeadlines.push({
                                headline,
                                url: link ? (link.startsWith('http') ? link : `https://www.marketwatch.com${link}`) : null
                            });
                        }
                    }
                });
                
                return {
                    companyName,
                    price,
                    change,
                    changePercent,
                    newsHeadlines: newsHeadlines.length > 0 ? newsHeadlines : null,
                };
            }, symbol);
            
            // Build final result
            const finalResult = {
                symbol,
                ...result,
                url,
                scrapedAt: new Date().toISOString(),
            };
            
            // Push to dataset immediately
            await Dataset.pushData(finalResult);
            count++;
            
            if (count % 10 === 0) {
                log.info(`Progress: ${count} results scraped`);
            }
            
        } catch (error) {
            log.error(`Failed to scrape ${symbol}: ${error.message}`);
            // Push partial result on error
            await Dataset.pushData({
                symbol,
                companyName: null,
                price: null,
                change: null,
                changePercent: null,
                newsHeadlines: null,
                url,
                error: error.message,
                scrapedAt: new Date().toISOString(),
            });
        }
    },
});

// Build request queue
const requests = [];
for (const symbol of stockSymbols.slice(0, maxCount)) {
    requests.push({
        url: `https://www.marketwatch.com/investing/stock/${symbol.toLowerCase()}`,
        userData: { symbol: symbol.toUpperCase() },
    });
}

await crawler.run(requests);

await Actor.exit();
