import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Layout/Navigation';
import MarkdownEditor from './components/Editor/MarkdownEditor';
import ALLArticles from './components/Articles/ALLArticles';
import HappyFooter from './components/Articles/AppFooter';
import ArticleDetail from './components/Articles/ArticleDetail';
import { SearchProvider, useSearch } from './context/SearchContext';
import { loadAndStoreData } from "./services/loadCompInfo";
import HomePage from './components/Home/HomePage';
import FlightSearchBar from './components/Home/FlightSearchBar';
import CompanySearchBar from './components/Home/CompanySearchBar';
import DestinationSection from './components/Home/DestinationSection';
import CompanySection from './components/Home/CompanySection';
import CompanyList from './components/Home/CompanyList';
import CompanyDetail from './components/Home/CompanyDetail';
import { mockCompanies } from './components/data/mockCompanies';


import CytoscapeTree from './components/Editor/CytoscapeTree';

// 内部组件，确保 useNavigate 在 Router 内部使用
const AppRoutes = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { searchQuery, industry, city } = useSearch();
  const filteredCompanies = mockCompanies.filter(company => {
    const query = searchQuery.toLowerCase().trim();

    // 关键词过滤
    if (query && !(company.name.toLowerCase().includes(query) ||
      company.description.toLowerCase().includes(query) ||
      company.industry.toLowerCase().includes(query))) {
      return false;
    }

    // 行业过滤
    if (industry && !company.industry.includes(industry)) {
      return false;
    }

    // 地区过滤
    if (city && company.city !== city) {
      return false;
    }

    return true;
  });

  // 点击公司卡片时不跳转路由，改为设置选中公司以显示覆盖层
  const handleCompanyClick = useCallback((company) => {
    setSelectedCompany(company);
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  const handleCloseDetail = useCallback(() => {
    setSelectedCompany(null);
    setIsEditing(false);
    setEditCompany(null);
  }, []);

  const handleEdit = useCallback((company) => {
    setEditCompany(company);
    setIsEditing(true);
  }, []);

  const handleBackFromEdit = useCallback(() => {
    setIsEditing(false);
    setEditCompany(null);
  }, []);

  useEffect(() => {
    loadAndStoreData(); // 加载爬取的上市公司json数据
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="container mx-auto py-6">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                {selectedCompany && isEditing && editCompany ? (
                  <div className="relative">
                    <button
                      onClick={handleBackFromEdit}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors group"
                    >
                      <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      返回详情
                    </button>
                    <MarkdownEditor />
                  </div>
                ) : selectedCompany ? (
                  <CompanyDetail
                    company={selectedCompany}
                    onClose={handleCloseDetail}
                    onEdit={() => handleEdit(selectedCompany)}
                  />
                ) : (
                  <>
                    <CompanyList
                      companies={filteredCompanies}
                      onCompanyClick={handleCompanyClick}
                    />
                    {/* <ALLArticles /> */}
                  </>
                )}
                <HappyFooter />
              </div>
            }
          />
          <Route
            path="/editor"
            element={
              <MarkdownEditor />
            }
          />

          <Route
            path="/searchtree"
            element={
              <CytoscapeTree />
            }
          />

          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <SearchProvider>
      <Router>
        <AppRoutes />
      </Router>
    </SearchProvider>
  );
};

export default App;
