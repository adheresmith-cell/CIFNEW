import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faUser, faClock, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

const QACard = ({ article, onClick }) => {
  const navigate = useNavigate();

  // 从 qa 文章的 content 中提取问题标题
  const extractQATitle = (content) => {
    const match = content.match(/## 📌 问题标题\n\n([^#\n]+)/);
    return match ? match[1].trim() : null;
  };

  // 从 qa 文章的 content 中提取问题描述
  const extractQADescription = (content) => {
    const match = content.match(/## 📝 问题描述\n\n([^#]+)/);
    return match ? match[1].trim().substring(0, 200) : null;
  };

  // 从 qa 文章的 content 中提取问题类型
  const extractQAType = (content) => {
    const match = content.match(/- \*\*问题类型\*\*: ([^\n]+)/);
    return match ? match[1].trim() : null;
  };

  const qaTitle = extractQATitle(article.content);
  const qaDesc = extractQADescription(article.content);
  const qaType = extractQAType(article.content);

  const handleWriteAnswer = (e) => {
    e.stopPropagation();
    navigate('/editor', {
      state: {
        title: `A:${qaTitle || article.title || article.id}`,
        editorMode: 'markdown',
        category: { type: 'ans', label: article.cid },
        companyId: article.companyId,
      }
    });
  };

  return (
    <div className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-purple-500">
      <div
        onClick={() => {onClick(article);console.log("QACard 参数：",article)}}
        className="p-6 relative cursor-pointer"
      >
        <h3 className="text-xl font-semibold mb-2 flex items-center text-purple-700">
          <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 text-purple-500" />
          {qaTitle || article.title || article.id}
        </h3>
        <div className="absolute top-4 right-4 flex gap-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
            问答
          </span>
          {qaType && (
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
              {qaType}
            </span>
          )}
        </div>
        <div className="text-gray-600 mb-4 line-clamp-3">
          {qaDesc || article.content}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-1" />
            <span>{article.author || '匿名'}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-1" />
            <span>{new Date(article.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="px-6 pb-4">
        <button
          onClick={handleWriteAnswer}
          className="flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
          写回答
        </button>
      </div>
    </div>
  );
};

export default QACard;