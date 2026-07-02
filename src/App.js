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
import CompanyList from './components/Home/CompanyList';
import CompanyDetail from './components/Home/CompanyDetail';
import StandardizePage from './components/Standardization/StandardizePage';
import NotFoundPage from './components/Home/NotFoundPage';
import { mockCompanies as initialCompanies } from './components/data/transformed_companies';


import CytoscapeTree from './components/Editor/CytoscapeTree';
// import pubsubAggregator from './services/pubsubAggregator';
import backendClient from './services/backendClient';
import { syncMonthlyToIndexedDB } from './services/orbitUpdateService';
import MonthlyDbTest from './components/Test/MonthlyDbTest';
import OrbitDbDocTest from './components/Test/OrbitDbDocTest';
import TestRouter from './components/Test/TestRouter';


// 内部组件，确保 useNavigate 在 Router 内部使用
const AppRoutes = () => {
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [listCurrentPage, setListCurrentPage] = useState(1);
  const { searchQuery, industry, city } = useSearch();
  const filteredCompanies = companies.filter(company => {
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
  }, [setSelectedCompany, setIsEditing, setEditCompany]);

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

    // 自动同步当月 OrbitDB 数据到 IndexedDB
    syncMonthlyToIndexedDB().catch(err => {
      console.error('OrbitDB 月度同步失败:', err);
    });
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
                {selectedCompany ? (
                  <CompanyDetail
                    company={selectedCompany}
                    onClose={handleCloseDetail}
                    onEdit={() => handleEdit(selectedCompany)}
                    isEditing={isEditing && editCompany?.id === selectedCompany?.id}
                    onBackFromEdit={isEditing ? handleBackFromEdit : undefined}
                  />
                ) : (
                  <>
                    <CompanyList
                      companies={filteredCompanies}
                      onCompanyClick={handleCompanyClick}
                      onAddCompany={(newCompany) => setCompanies(prev => [...prev, newCompany])}
                      currentPage={listCurrentPage}
                      onPageChange={setListCurrentPage}
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
              <MarkdownEditor company={null} />
            }
          />

          <Route
            path="/searchtree"
            element={
              <CytoscapeTree />
            }
          />

          <Route path="/standardize" element={<StandardizePage />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
          <Route path="/test" element={<TestRouter />} />
          <Route path="/test/orbitdb-doc" element={<OrbitDbDocTest />} />
          <Route path="/test/monthly-db" element={<MonthlyDbTest />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    // pubsubAggregator.start().catch(err => {
    //   console.error('PubSubAggregator 启动失败:', err);
    // });

    // 检测后端 Helia 服务是否就绪
    let mounted = true;
    const check = async () => {
      try {
        await backendClient.ping();
        if (mounted) setBackendReady(true);
      } catch {
        // 重试
        setTimeout(check, 2000);
      }
    };
    check();

    return () => {
      mounted = false;
      // pubsubAggregator.stop().catch(err => {
      //   console.error('PubSubAggregator 停止失败:', err);
      // });
    };
  }, []);

  if (!backendReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳ 正在连接后端 Helia 服务...</div>
          <div className="text-gray-500">请确保后端已启动：node helia-server.mjs</div>
        </div>
      </div>
    );
  }

  return (
    <SearchProvider>
      <Router>
        <AppRoutes />
      </Router>
    </SearchProvider>
  );
};

export default App;
