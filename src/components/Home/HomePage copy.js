import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faNewspaper,
  faEdit,
  faSearch,
  faGlobe,
  faChartLine,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';
import { Search } from 'lucide-react';
import gunService from '../../services/gunDB';

const HomePage = () => {
  const [recentArticles, setRecentArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allArticles = await gunService.getAllArticles();
        setRecentArticles(allArticles.slice(0, 6)); // 获取最近的6篇文章
        setTotalArticles(allArticles.length);
      } catch (err) {
        console.error('加载文章失败:', err);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (searchInput.trim()) {
      // 将搜索词传递给全局搜索上下文
      // 这里我们直接跳转到文章列表页，并在URL参数中传递搜索词
      navigate(`/articles?search=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            欢迎来到 CIFNEW 博客
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Career Information For NewFish，致力于降低职业风险与减少不确定性。
            在这里您可以发现、分享和探索各种职业发展相关的知识和经验。
          </p>
          
          {/* 搜索框 */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="搜索文章、主题或关键词..."
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              搜索
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">平台特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-blue-50 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faNewspaper} className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">丰富内容</h3>
              <p className="text-gray-600">
                涵盖职业发展、技能提升、行业趋势等多个领域的高质量文章和资源
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-green-50 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faEdit} className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">创作分享</h3>
              <p className="text-gray-600">
                轻松创建和编辑内容，与社区分享您的经验和见解
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-purple-50 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faGlobe} className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">知识图谱</h3>
              <p className="text-gray-600">
                通过可视化知识图谱探索概念之间的关联和联系
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600">{totalArticles}</div>
              <div className="text-gray-600 mt-2">总文章数</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600">
                <FontAwesomeIcon icon={faBook} />
              </div>
              <div className="text-gray-600 mt-2">知识节点</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600">
                <FontAwesomeIcon icon={faDatabase} />
              </div>
              <div className="text-gray-600 mt-2">数据源</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-yellow-600">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div className="text-gray-600 mt-2">成长轨迹</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">最新文章</h2>
            <Link 
              to="/articles" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              查看全部
            </Link>
          </div>
          
          {recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <Link
                  to={`/article/${article.id}`}
                  key={article.id}
                  className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <FontAwesomeIcon icon={faBook} className="mr-2 text-blue-500" />
                      {article.title || '未命名文章'}
                    </h3>
                    <div className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {article.content?.substring(0, 100)}...
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>
                        {article.category.type || '未分类'}
                      </div>
                      <div>
                        {new Date(article.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              暂无文章，请稍后再来查看
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">开始您的知识之旅</h2>
          <p className="text-xl mb-8 opacity-90">
            加入我们的社区，分享您的知识，发现新的机会，规划您的职业发展道路
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/editor"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              开始写作
            </Link>
            <Link
              to="/articles"
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              探索内容
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;