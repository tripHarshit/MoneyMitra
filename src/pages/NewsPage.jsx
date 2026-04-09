import { useState, useEffect } from 'react';
import { fetchFinancialNews } from '../services/newsService';
import { ArrowLeft, ExternalLink, Calendar, Newspaper, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getNews = async () => {
      setLoading(true);
      const articles = await fetchFinancialNews();
      setNews(articles || []);
      setLoading(false);
    };
    getNews();
  }, []);

  return (
    <div className="min-h-screen bg-[#f2fcf8] px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/85 px-5 py-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-7">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="rounded-full p-2 text-[#3d4a42] transition hover:bg-[#ecf6f2]"
              aria-label="Back to app"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-headline text-3xl font-extrabold tracking-tight text-[#141d1b]">Financial Briefing</h1>
                <p className="text-sm text-[#3d4a42]">Daily market intelligence curated for you.</p>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200 bg-[#ffdcc3]/40 px-3 py-1.5 text-xs font-bold text-[#6e3900] md:self-auto">
            <Sparkles className="h-3.5 w-3.5" />
            AI Recommendation Feed
          </div>
        </header>

        <section className="mb-8 rounded-3xl bg-[#ffdcc3] p-6 panel-shadow md:p-8">
          <div className="max-w-4xl">
            <span className="mb-4 inline-flex rounded-full bg-[#2f1500] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#ffdcc3]">
              AI Recommendation
            </span>
            <h2 className="font-headline text-2xl font-extrabold leading-tight text-[#2f1500] md:text-3xl">
              Strategic Shift: Why Mid-Cap Equities are the New Frontier for 2026
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#6e3900] md:text-base">
              Our signals detect a pivot in institutional liquidity. Explore why agility and sector rotation are outperforming broad passive exposure in current conditions.
            </p>
            <button className="mt-6 rounded-xl bg-[#2f1500] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
              Full Analysis
            </button>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-emerald-100 bg-white p-6">
                <div className="mb-4 h-5 w-1/3 rounded-full shimmer"></div>
                <div className="mb-3 h-7 rounded-lg shimmer"></div>
                <div className="mb-2 h-4 rounded shimmer"></div>
                <div className="mb-8 h-4 w-5/6 rounded shimmer"></div>
                <div className="h-4 w-2/5 rounded shimmer"></div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {news.map((item, idx) => (
              <article
                key={item.uuid || item.url || idx}
                className="group flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    {item.source || 'Market Update'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#6d7a72]">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Today'}
                  </span>
                </div>

                <h3 className="font-headline mb-3 text-xl font-extrabold leading-tight text-[#141d1b] transition group-hover:text-emerald-700">
                  {item.title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#3d4a42]">{item.description || 'Open this article for full context and detailed analysis.'}</p>

                <div className="mt-auto flex items-center justify-between border-t border-emerald-100 pt-4">
                  <span className="text-xs italic text-[#6d7a72]">{item.read_time || '4 min read'}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800"
                  >
                    Read Article
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
            <p className="text-sm font-medium text-[#3d4a42]">Unable to load top financial news right now. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
