import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faChevronDown,
  faChevronUp,
  faLandmark,
  faLightbulb,
  faComments,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { getChapterName } from '../data/lawQA';

// ==================== 单条问答卡片 ====================
const QACardItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  // 评论区内容：优先使用 comment 数组，兼容旧版 scenario/analysis 字符串
  const comments = Array.isArray(item.comment)
    ? item.comment
    : [item.scenario, item.analysis].filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* 问题标题（点击展开/收起） */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mt-0.5">
            <FontAwesomeIcon icon={faGavel} className="text-indigo-500 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-snug">
              {item.question}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                {getChapterName(item.chapter)}
              </span>
              <span>共 {item.laws.length} 条相关法条</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 mt-1">
          <FontAwesomeIcon
            icon={expanded ? faChevronUp : faChevronDown}
            className={`text-gray-400 transition-colors ${expanded ? 'text-indigo-500' : ''}`}
          />
        </div>
      </button>

      {/* 展开详情 */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/50">
          {/* 评论区（comment 数组，每条字符串为一条评论，样式一致） */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faComments} className="text-gray-500" />
              <h4 className="text-sm font-bold text-gray-700">评论区</h4>
            </div>
            <div className="space-y-4">
              {comments.map((text, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-gray-500 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <span className="text-sm font-semibold text-gray-800">网友</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 法条知识 */}
          <div className="bg-white rounded-lg border border-emerald-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faLandmark} className="text-emerald-500" />
              <h4 className="text-sm font-bold text-emerald-700">⚖️ 法条知识</h4>
            </div>
            <div className="space-y-2">
              {item.laws.map((law, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></div>
                  <div>
                    <span className="text-sm font-medium text-emerald-800">{law.name}</span>
                    <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{law.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 实用建议 */}
          <div className="bg-white rounded-lg border border-purple-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faLightbulb} className="text-purple-500" />
              <h4 className="text-sm font-bold text-purple-700">💡 实用建议</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{item.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QACardItem;
