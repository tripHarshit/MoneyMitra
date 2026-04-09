// src/services/newsService.js
const MARKETAUX_API_KEY = import.meta.env.VITE_MARKETAUX_API_KEY || 'Y1DOkoB6WkvGZc892DLlbAbvLPomwDYHnBEfJZ9N';
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '1fdb79b2537b4c0aae66ba23b4652d65';

export const fetchFinancialNews = async () => {
  try {
    // 1. Fetch from Marketaux (Financial News API)
    const marketauxPromise = fetch(
      `https://api.marketaux.com/v1/news/all?symbols=TSLA,AMZN,MSFT,AAPL,GOOGL,NVDA&filter_entities=true&language=en&limit=10&api_token=${MARKETAUX_API_KEY}`
    ).then(res => res.json()).catch(err => {
      console.error("Marketaux Fetch Error:", err);
      return { data: [] };
    });

    // 2. Fetch from NewsAPI (Top Headlines strictly in Business category)
    const newsApiPromise = fetch(
      `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
    ).then(res => res.json()).catch(err => {
      console.error("NewsAPI Fetch Error:", err);
      return { articles: [] };
    });

    const [marketauxData, newsApiData] = await Promise.all([marketauxPromise, newsApiPromise]);

    // 3. Normalize Marketaux data
    const marketauxArticles = Array.isArray(marketauxData?.data) ? marketauxData.data.map(item => ({
      uuid: item.uuid,
      title: item.title,
      description: item.description,
      url: item.url,
      published_at: item.published_at,
      source: item.source || 'Marketaux'
    })) : [];

    // 4. Normalize NewsAPI data
    const newsApiArticles = Array.isArray(newsApiData?.articles) ? newsApiData.articles.map(item => ({
      uuid: item.url || Date.now().toString() + Math.random().toString(), // URL works as a unique key for NewsAPI
      title: item.title,
      description: item.description,
      url: item.url,
      published_at: item.publishedAt,
      source: item.source?.name || 'NewsAPI'
    })) : [];

    // 5. Combine, strictly filter out incomplete or removed articles, sort by date, and returning exactly 10
    const combinedNews = [...marketauxArticles, ...newsApiArticles]
      .filter(item => 
        item.title && 
        item.description && 
        item.url && 
        !item.title.includes('[Removed]') && 
        !item.description.includes('[Removed]')
      )
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    return combinedNews.slice(0, 10);
  } catch (error) {
    console.error("Combined News Fetch Error:", error);
    return [];
  }
};
