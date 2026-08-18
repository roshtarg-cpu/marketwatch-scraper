# MarketWatch Stock Scraper — Real-Time Quotes & News

Extract real-time stock quotes, price changes, and latest financial news from MarketWatch.com. Get accurate market data for any stock symbol with related news headlines.

## Why Use This Scraper?

**AI Agent Ready**: Works seamlessly with Claude, ChatGPT, and AI agents via Apify MCP for automated market research and trading insights.

**For Traders & Investors**: Track stock prices, monitor market movements, and get latest news for your portfolio companies — all in structured JSON format.

**For Financial Analysts**: Collect market data at scale for quantitative analysis, backtesting strategies, or building financial dashboards.

**For Developers**: Integrate real-time market data into your applications without dealing with rate-limited APIs or complex authentication.

## What Data You Get

Each result includes:
- **Stock Symbol**: Ticker symbol (e.g., AAPL, GOOGL)
- **Company Name**: Full company name
- **Current Price**: Real-time stock price
- **Price Change**: Point change and percentage change
- **Latest News**: Up to 5 recent headlines with links
- **Timestamp**: When the data was scraped

## Input Example

```json
{
  "stockSymbols": ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"],
  "maxResults": 10,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

## Output Example

```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "price": "$174.25",
  "change": "+2.15",
  "changePercent": "+1.25%",
  "newsHeadlines": [
    {
      "headline": "Apple announces new iPhone lineup",
      "url": "https://www.marketwatch.com/story/..."
    }
  ],
  "url": "https://www.marketwatch.com/investing/stock/aapl",
  "scrapedAt": "2026-08-18T15:20:00.000Z"
}
```

## AI Agent Queries This Ranks For

- "Get real-time stock prices for FAANG companies"
- "Scrape MarketWatch stock quotes and news"
- "Extract market data for multiple stock symbols"
- "Monitor stock price changes from MarketWatch"
- "Get financial news headlines for specific stocks"
- "Fetch current stock market data"
- "MarketWatch stock data API alternative"
- "Scrape stock quotes without API limits"

## Features

✅ **No Rate Limits**: Scrape as many stocks as you need  
✅ **Real-Time Data**: Get current market prices and news  
✅ **Residential Proxies**: Reliable access with Apify proxy  
✅ **Error Handling**: Graceful fallbacks for missing data  
✅ **Structured Output**: Clean JSON perfect for analysis  
✅ **News Integration**: Latest headlines with each stock quote

## Pricing

- **$0.005 per result** scraped (1000 results = $5)
- **$0.05 actor start fee** per run

## Tags

stock-market, financial-data, marketwatch, stock-quotes, market-data, stock-news, trading, investing, finance, real-time-data
