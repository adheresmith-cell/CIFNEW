import React, { useState, useEffect } from 'react';
import gunService from '../../services/gunDB';
import { useSearch } from '../../context/SearchContext';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const allArticles = await gunService.getAllArticles();
        setArticles(Array.isArray(allArticles) ? allArticles : []);
        setLoading(false);
      } catch (err) {
        console.error('加载文章失败:', err);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // 搜索过滤
  const filteredArticles = articles.filter(article => {
    return (
      searchQuery === '' ||
      (article.content &&
        article.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // 👉 将文章映射成卡片数据（没有数据时用默认）
  const plans =
    filteredArticles.length > 0
      ? filteredArticles.map((article, index) => ({
          title: article.title || `舱位 ${index + 1}`,
          en: article.category ? article.category.split('+')[0] : 'CLASS',
          desc: article.content || '暂无描述',
          width: '60cm',
          space: '120cm',
          seats: 20 + index,
          screen: '15" HD',
          price: `¥${(index + 1) * 3000}`,
          highlight: index === 1,
        }))
      : [
          {
            title: '头等舱套房',
            en: 'FIRST CLASS',
            desc: '私人套房配备180度平躺座椅，独立餐饮服务，顶级洗漱用品，专属空乘服务。',
            width: '86cm',
            space: '200cm',
            seats: 8,
            screen: '32" 4K',
            price: '¥45,000',
            highlight: false,
          },
          {
            title: '商务舱',
            en: 'BUSINESS CLASS',
            desc: '宽敞的个人空间，可调节的座椅转换为平躺床铺，优先登机和专属贵宾室服务。',
            width: '66cm',
            space: '150cm',
            seats: 28,
            screen: '18" HD',
            price: '¥18,000',
            highlight: true,
          },
          {
            title: '经济舱',
            en: 'ECONOMY CLASS',
            desc: '符合人体工程学的座椅设计，宽敞的腿部空间，个人娱乐系统和精选餐饮服务。',
            width: '46cm',
            space: '81cm',
            seats: 268,
            screen: '11" HD',
            price: '¥3,800',
            highlight: false,
          },
        ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`rounded-2xl overflow-hidden shadow-lg transition transform hover:-translate-y-2 
            ${plan.highlight ? 'border-2 border-yellow-400' : ''}`}
          >
            {/* 顶部 */}
            <div className="bg-[#1f2a5a] text-white text-center py-12 relative">
              {plan.highlight && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-black text-xs px-3 py-1 rounded">
                  最受欢迎
                </span>
              )}
              <div className="text-sm tracking-widest text-yellow-400 mb-2">
                {plan.en}
              </div>
              <h2 className="text-2xl font-bold">{plan.title}</h2>
            </div>

            {/* 内容 */}
            <div className="bg-[#1f2a5a] text-gray-300 px-6 py-6 border-t border-[#2e3a70]">
              <p className="text-sm leading-relaxed mb-6 line-clamp-3">
                {plan.desc}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>座椅宽度: {plan.width}</div>
                <div>座椅间距: {plan.space}</div>
                <div>舱位数量: {plan.seats}</div>
                <div>娱乐系统: {plan.screen}</div>
              </div>

              {/* 底部 */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-xl font-semibold text-white">
                  {plan.price} <span className="text-sm">起</span>
                </div>
                <button
                  className={`px-6 py-2 rounded-lg transition 
                  ${
                    plan.highlight
                      ? 'bg-yellow-400 text-black'
                      : 'border border-yellow-400 text-yellow-400'
                  }`}
                >
                  选择
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          没有数据
        </div>
      )}
    </div>
  );
};

export default HomePage;