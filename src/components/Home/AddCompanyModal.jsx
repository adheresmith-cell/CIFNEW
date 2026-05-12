import React, { useState } from 'react';

/**
 * 新增公司节点弹窗
 * @param {boolean} isOpen - 是否显示
 * @param {function} onClose - 关闭回调
 * @param {function} onSubmit - 提交回调，参数为新公司数据对象
 */
function AddCompanyModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    scale: '1-99 人',
    city: '',
    description: '',
    tags: '',
    rating: '',
    founded: '',
    website: '',
    parent: '',
    related: '',
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newCompany = {
      id: Date.now(),
      name: formData.name.trim(),
      logo: `https://via.placeholder.com/80x80/6366f1/FFFFFF?text=${encodeURIComponent(formData.name.slice(0, 2))}`,
      industry: formData.industry.trim() || '其他',
      scale: formData.scale,
      city: formData.city.trim(),
      description: formData.description.trim(),
      tags: formData.tags.trim(),
      rating: parseFloat(formData.rating) || 3.0,
      founded: formData.founded.trim(),
      website: formData.website.trim(),
    };

    if (formData.parent.trim()) {
      newCompany.parent = formData.parent.trim();
    }

    if (formData.related.trim()) {
      newCompany.related = formData.related.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
    }

    onSubmit(newCompany);
    setFormData({
      name: '',
      industry: '',
      scale: '1-99 人',
      city: '',
      description: '',
      tags: '',
      rating: '',
      founded: '',
      website: '',
      parent: '',
      related: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">新增公司节点</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 公司名称 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公司名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="请输入公司名称"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                autoFocus
                required
              />
            </div>

            {/* 行业 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">行业</label>
              <input
                type="text"
                value={formData.industry}
                onChange={e => handleChange('industry', e.target.value)}
                placeholder="如：互联网/电子商务"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* 规模 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">规模</label>
              <select
                value={formData.scale}
                onChange={e => handleChange('scale', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option>1-99 人</option>
                <option>100-499 人</option>
                <option>500-999 人</option>
                <option>1000-9999 人</option>
                <option>10000 人以上</option>
              </select>
            </div>

            {/* 城市 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                placeholder="如：杭州"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => handleChange('tags', e.target.value)}
                placeholder="用逗号分隔，如：新能源汽车、人工智能"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* 评分 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">评分</label>
              <input
                type="number"
                value={formData.rating}
                onChange={e => handleChange('rating', e.target.value)}
                placeholder="3.0"
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* 成立时间 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">成立时间</label>
              <input
                type="text"
                value={formData.founded}
                onChange={e => handleChange('founded', e.target.value)}
                placeholder="如：2010 年"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* 官网 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">官网</label>
              <input
                type="text"
                value={formData.website}
                onChange={e => handleChange('website', e.target.value)}
                placeholder="如：www.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* 上级组织 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">上级组织</label>
              <input
                type="text"
                value={formData.parent}
                onChange={e => handleChange('parent', e.target.value)}
                placeholder="如：阿里巴巴集团（选填）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* 关联组织 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">关联组织</label>
              <input
                type="text"
                value={formData.related}
                onChange={e => handleChange('related', e.target.value)}
                placeholder="用逗号分隔，如：蚂蚁集团、阿里云（选填）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* 描述 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">公司描述</label>
              <textarea
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="请输入公司简介"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              确认新增
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCompanyModal;