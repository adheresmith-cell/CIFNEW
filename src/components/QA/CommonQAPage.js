import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faScaleBalanced,
  faLightbulb,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { LAW_CHAPTERS, LAW_QA, getChapterName } from '../data/lawQA';
import AskQuestionModal from './AskQuestionModal';
import QACardItem from './QACardItem';

// ==================== 主页面 ====================
const CommonQAPage = () => {
  const [activeChapter, setActiveChapter] = useState(LAW_CHAPTERS[0].id);
  const [searchKeyword, setSearchKeyword] = useState(''); // 已提交的搜索关键词（点击“搜索问题”后更新）
  const [searchInput, setSearchInput] = useState(''); // 输入框草稿（打字时不触发搜索）
  const [askMenuOpen, setAskMenuOpen] = useState(false); // 胶囊按钮下拉菜单开关
  const capsuleRef = useRef(null);
  const [askModalOpen, setAskModalOpen] = useState(false); // “提问题”弹窗开关

  // 点击下拉菜单外部时自动关闭
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (capsuleRef.current && !capsuleRef.current.contains(e.target)) {
        setAskMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 左侧“搜索问题”按钮：提交搜索关键词，点击后才显示搜索结果
  const handleSearch = () => {
    setAskMenuOpen(false);
    setSearchKeyword(searchInput.trim());
  };

  // 右侧下拉箭头：切换下拉菜单
  const toggleAskMenu = () => {
    setAskMenuOpen(prev => !prev);
  };

  // 下拉中的“提问题”按钮：打开提问弹窗
  const handleAskClick = () => {
    setAskMenuOpen(false);
    setAskModalOpen(true);
  };

  // 搜索过滤
  const filteredAll = useMemo(() => {
    if (!searchKeyword.trim()) return [];
    const kw = searchKeyword.trim().toLowerCase();
    return LAW_QA.filter(qa => {
      return (
        qa.question.toLowerCase().includes(kw) ||
        qa.scenario.toLowerCase().includes(kw) ||
        qa.analysis.toLowerCase().includes(kw) ||
        qa.suggestion.toLowerCase().includes(kw) ||
        qa.laws.some(law =>
          law.name.toLowerCase().includes(kw) ||
          law.summary.toLowerCase().includes(kw)
        )
      );
    });
  }, [searchKeyword]);

  // 当前章节的问答
  const currentQAs = useMemo(() => {
    if (searchKeyword.trim()) return filteredAll;
    return LAW_QA.filter(qa => qa.chapter === activeChapter);
  }, [activeChapter, searchKeyword, filteredAll]);

  // 每个章节的条目数
  const chapterCounts = useMemo(() => {
    const counts = {};
    LAW_QA.forEach(qa => {
      counts[qa.chapter] = (counts[qa.chapter] || 0) + 1;
    });
    return counts;
  }, []);

  const handleChapterClick = (chapterId) => {
    setActiveChapter(chapterId);
    setSearchKeyword('');
    setSearchInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部吸顶搜索栏：始终置顶，随时可搜 */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-0">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="搜索问题、案例或法条关键词，如：押金、加班费、彩礼..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Quora 风格胶囊按钮：蓝色胶囊 + 白色文字 + 深蓝分隔线 + 下拉箭头 */}
            <div ref={capsuleRef} className="relative flex-shrink-0">
              <div className="inline-flex items-center overflow-hidden rounded-full bg-blue-600 shadow-sm hover:bg-blue-700 transition-colors">
                {/* 左侧：搜索问题 */}
                <button
                  type="button"
                  onClick={handleSearch}
                  title="搜索问题"
                  className="px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  搜索问题
                </button>

                {/* 中间：深蓝分隔线 */}
                <span className="w-px h-6 bg-blue-800" aria-hidden="true" />

                {/* 右侧：下拉箭头 */}
                <button
                  type="button"
                  onClick={toggleAskMenu}
                  title="更多操作"
                  aria-expanded={askMenuOpen}
                  aria-haspopup="true"
                  className={`px-3 py-3 text-white transition-colors ${
                    askMenuOpen ? 'bg-blue-800' : 'hover:bg-blue-700'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xs transition-transform ${askMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              {/* 下拉菜单 */}
              {askMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50">
                  <button
                    type="button"
                    onClick={handleAskClick}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
                  >
                    <FontAwesomeIcon icon={faLightbulb} className="text-blue-500 text-sm" />
                    提问题
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 章节导航 */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
          {LAW_CHAPTERS.map((chapter) => {
            const isActive = activeChapter === chapter.id && !searchKeyword;
            return (
              <button
                key={chapter.id}
                onClick={() => handleChapterClick(chapter.id)}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all ${
                  isActive
                    ? `${chapter.color} text-white border-transparent shadow-md scale-[1.02]`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <span className="text-xl leading-none">{chapter.icon}</span>
                <span className="text-sm font-medium">{chapter.name}</span>
                <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  {chapterCounts[chapter.id] || 0} 问
                </span>
              </button>
            );
          })}
        </div>

        {/* 分区说明 */}
        {!searchKeyword.trim() && (
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {LAW_CHAPTERS.find(c => c.id === activeChapter)?.icon}{' '}
              {getChapterName(activeChapter)}专题
            </h2>
            <span className="text-sm text-gray-400">
              — 共 {currentQAs.length} 个问答
            </span>
          </div>
        )}

        {/* 搜索结果提示 */}
        {searchKeyword.trim() && (
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-800">🔍 搜索结果</h2>
            <span className="text-sm text-gray-400">
              关键词 " {searchKeyword} " 共 {currentQAs.length} 条
            </span>
            <button
              onClick={() => {
                setSearchKeyword('');
                setSearchInput('');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              清除搜索
            </button>
          </div>
        )}

        {/* 问答列表 */}
        <div className="space-y-4">
          {currentQAs.length > 0 ? (
            currentQAs.map((item) => (
              <QACardItem key={item.id} item={item} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500">未找到相关问答，换个关键词试试</p>
            </div>
          )}
        </div>

        {/* 底部说明 */}
        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon={faScaleBalanced} className="mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">免责声明：</span>
              本页面内容为法律知识科普，基于常见生活场景编写，仅供参考，不构成正式法律意见。遇到具体法律纠纷时，请及时咨询专业律师或拨打法律热线（12348）。
            </p>
          </div>
        </div>
      </div>

      {/* 提问题弹窗 */}
      <AskQuestionModal
        isOpen={askModalOpen}
        onClose={() => setAskModalOpen(false)}
      />
    </div>
  );
};

export default CommonQAPage;