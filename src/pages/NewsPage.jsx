import { useState, useEffect } from 'react';
import { fetchFinancialNews } from '../services/newsService';
import { ArrowLeft, ExternalLink, Calendar, Newspaper } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0F1115] p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl max-h-screen overflow-y-auto chat-scroll pb-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-3 py-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-all mb-8 w-fit"
        >
          <ArrowLeft size={18} /> Back to MoneyMitra
        </button>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Financial Briefing</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="h-6 rounded-xl shimmer w-3/4"></div>
                <div className="h-4 rounded-xl shimmer w-full"></div>
                <div className="h-4 rounded-xl shimmer w-5/6"></div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid gap-6">
            {news.map((item) => (
              <div key={item.uuid} className="glass p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-white leading-tight flex-1 mr-4">{item.title}</h2>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-[#1A1D23] px-2 py-1 rounded-md whitespace-nowrap">
                    <Calendar size={12} />
                    {new Date(item.published_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{item.description}</p>
                <div className="flex justify-start">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-[#22262E] text-indigo-400 text-sm font-medium rounded-xl hover:bg-indigo-500/10 transition-colors"
                  >
                    Read full article <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-8 rounded-2xl border border-white/5 text-center">
            <p className="text-gray-400">Unable to load top financial news right now. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
