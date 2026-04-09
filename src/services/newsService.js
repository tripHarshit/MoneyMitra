// src/services/newsService.js
const MARKETAUX_API_KEY = import.meta.env.VITE_MARKETAUX_API_KEY;
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const FALLBACK_NEWS = [
  {
    uuid: 'fallback-1',
    title: 'How to Build a Resilient Portfolio in Volatile Markets',
    description: 'A practical framework for balancing equity growth with defensive assets and periodic rebalancing.',
    url: 'https://www.investor.gov/introduction-investing',
    published_at: new Date().toISOString(),
    source: 'MoneyMitra Digest'
  },
  {
    uuid: 'fallback-2',
    title: 'Emergency Fund Strategy: 3 to 6 Months, But How Do You Start?',
    description: 'Step-by-step guide to setting realistic monthly targets and keeping emergency savings liquid.',
    url: 'https://www.consumerfinance.gov/consumer-tools/',
    published_at: new Date(Date.now() - 3600_000).toISOString(),
    source: 'MoneyMitra Digest'
  },
  {
    uuid: 'fallback-3',
    title: 'Tax-Aware Investing Basics Every Beginner Should Know',
    description: 'Understand how long-term holding periods and account selection can improve net returns.',
    url: 'https://www.irs.gov/credits-deductions-for-individuals',
    published_at: new Date(Date.now() - 7200_000).toISOString(),
    source: 'MoneyMitra Digest'
  }
];

const withTimeout = async (url, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const normalizeMarketauxItem = (item) => ({
  uuid: item.uuid || item.url || `marketaux-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: item.title || '',
  description: item.description || item.snippet || 'Open article for detailed coverage.',
  url: item.url,
  published_at: item.published_at || new Date().toISOString(),
  source: item.source || 'Marketaux'
});

const normalizeNewsApiItem = (item) => ({
  uuid: item.url || `newsapi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: item.title || '',
  description: item.description || item.content || 'Open article for detailed coverage.',
  url: item.url,
  published_at: item.publishedAt || new Date().toISOString(),
  source: item.source?.name || 'NewsAPI'
});

export const fetchFinancialNews = async () => {
  try {
    const marketauxPromise = MARKETAUX_API_KEY
      ? withTimeout(
          `https://api.marketaux.com/v1/news/all?symbols=TSLA,AMZN,MSFT,AAPL,GOOGL,NVDA&filter_entities=true&language=en&limit=10&api_token=${MARKETAUX_API_KEY}`
        )
          .then(async (res) => {
            if (!res.ok) {
              const body = await res.text();
              throw new Error(`Marketaux ${res.status}: ${body}`);
            }
            return res.json();
          })
          .catch((err) => {
            console.error('Marketaux Fetch Error:', err);
            return { data: [] };
          })
      : Promise.resolve({ data: [] });

    const newsApiPromise = NEWS_API_KEY
      ? withTimeout(
          `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
        )
          .then(async (res) => {
            if (!res.ok) {
              const body = await res.text();
              throw new Error(`NewsAPI ${res.status}: ${body}`);
            }
            return res.json();
          })
          .catch((err) => {
            console.error('NewsAPI Fetch Error:', err);
            return { articles: [] };
          })
      : Promise.resolve({ articles: [] });

    const [marketauxData, newsApiData] = await Promise.all([marketauxPromise, newsApiPromise]);

    const marketauxArticles = Array.isArray(marketauxData?.data)
      ? marketauxData.data.map(normalizeMarketauxItem)
      : [];

    const newsApiArticles = Array.isArray(newsApiData?.articles)
      ? newsApiData.articles.map(normalizeNewsApiItem)
      : [];

    const dedupMap = new Map();
    [...marketauxArticles, ...newsApiArticles].forEach((item) => {
      if (!item.title || !item.url) return;
      if (item.title.includes('[Removed]')) return;
      const key = item.url;
      if (!dedupMap.has(key)) {
        dedupMap.set(key, item);
      }
    });

    const combinedNews = Array.from(dedupMap.values()).sort(
      (a, b) => new Date(b.published_at) - new Date(a.published_at)
    );

    if (combinedNews.length === 0) {
      return FALLBACK_NEWS;
    }

    return combinedNews.slice(0, 10);
  } catch (error) {
    console.error('Combined News Fetch Error:', error);
    return FALLBACK_NEWS;
  }
};
