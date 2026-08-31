import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';

/**
 * 提问题弹窗 - 输入标题和问题描述
 *
 * @param {boolean} isOpen - 是否显示
 * @param {function} onClose - 关闭回调
 * @param {function} onSubmit - 提交回调（可选），参数为 { title, content }
 */
const AskQuestionModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState(''); // 问题标题
  const [content, setContent] = useState(''); // 问题描述
  const [message, setMessage] = useState(null); // 提交提示 { type, content }

  if (!isOpen) return null;

  // 关闭并重置表单
  const handleClose = () => {
    setTitle('');
    setContent('');
    setMessage(null);
    onClose();
  };

  // 提交提问（当前为占位逻辑，后续可通过 onSubmit 接入真实存储）
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', content: '请填写标题和问题描述后再提交。' });
      return;
    }
    if (onSubmit) onSubmit({ title: title.trim(), content: content.trim() });
    setMessage({ type: 'success', content: '提问提交成功！我们已收到你的问题，将尽快处理。' });
    setTitle('');
    setContent('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={faLightbulb} className="mr-2 text-indigo-500" />
            提问题
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* 弹窗内容 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入问题标题，如：租房押金不退怎么办？"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {/* 问题描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                问题描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请详细描述你的问题，越具体越容易得到帮助..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-y"
              />
            </div>

            {/* 提交提示 */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {message.content}
              </div>
            )}
          </div>

          {/* 弹窗底部按钮 */}
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              提交提问
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionModal;
