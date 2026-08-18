import { Actor } from 'apify';
import { CheerioCrawler, Dataset } from 'crawlee';

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

// Initialize crawler
const crawler = new CheerioCrawler({
    proxyConfiguration: proxyConfig,
    maxRequestRetries: 3,
    requestHandlerTimeoutSecs: 90,
    
    async requestHandler({ request, $, log }) {
        const url = request.url;
        const symbol = request.userData.symbol;
        
        log.info(`Scraping ${symbol} from ${url}`);
        
        try {
            // Extract stock data
            const title = $('title').text().trim();
            const h1 = $('h1.company__name').text().trim();
            
            // Price data - try multiple selectors
            let price = null;
            let change = null;
            let changePercent = null;
            
            // Method 1: bg-quote element
            price = $('.bg-quote').text().trim() || null;
            change = $('.change--point--q').text().trim() || null;
            changePercent = $('.change--percent--q').text().trim() || null;
            
            // Method 2: intraday__price
            if (!price) {
                price = $('.intraday__price .value').text().trim() || null;
            }
            
            // Method 3: J-quote
            if (!price) {
                const quoteMeta = $('meta[name="price"]').attr('content');
                if (quoteMeta) price = quoteMeta;
            }
            
            // Extract company info
            const companyName = h1 || $('h1').first().text().trim() || null;
            
            // Extract latest news headlines
            const newsHeadlines = [];
            $('.article__headline, .article-headline a, h3.article__headline a').each((i, el) => {
                if (i < 5) {
                    const headline = $(el).text().trim();
                    const link = $(el).attr('href') || $(el).closest('a').attr('href');
                    if (headline) {
                        newsHeadlines.push({
                            headline,
                            url: link ? (link.startsWith('http') ? link : `https://www.marketwatch.com${link}`) : null
                        });
                    }
                }
            });
            
            // Build result
            const result = {
                symbol,
                companyName,
                price,
                change,
                changePercent,
                newsHeadlines: newsHeadlines.length > 0 ? newsHeadlines : null,
                url,
                scrapedAt: new Date().toISOString(),
            };
            
            // Push to dataset immediately
            await Dataset.pushData(result);
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
