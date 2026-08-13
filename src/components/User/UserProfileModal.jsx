import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

/**
 * 用户信息填写模态框
 * @param {object} props
 * @param {boolean} props.isOpen - 是否显示
 * @param {function} props.onClose - 关闭回调
 * @param {function} props.onSave - 保存回调 (data) => void
 * @param {object} props.initialData - 初始数据（编辑时传入）
 */
const UserProfileModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    position: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // 从本地存储读取已保存的用户信息（优先使用传入的 initialData）
    let savedData = null;
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        savedData = JSON.parse(stored);
      }
    } catch (err) {
      console.error('读取本地用户信息失败:', err);
    }

    const baseData = initialData || savedData;
    if (baseData) {
      setFormData({
        name: baseData.name || '',
        email: baseData.email || '',
        phone: baseData.phone || '',
        address: baseData.address || '',
        company: baseData.company || '',
        position: baseData.position || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        position: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // 清除对应字段的错误提示
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = { ...formData };
    // 保存用户信息到本地存储
    try {
      localStorage.setItem('userProfile', JSON.stringify(userData));
    } catch (err) {
      console.error('保存用户信息到本地失败:', err);
    }

    const saveFn = onSave || ((data) => {
      console.log('保存用户信息:', data);
    });
    saveFn(userData);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">帐号数据</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 姓名（必填） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="请输入姓名"
              className={cn(
                'w-full px-4 py-2.5 border rounded-xl text-sm transition-colors outline-none',
                'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                errors.name
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="请输入邮箱地址"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 电话 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">电话</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="请输入电话号码"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">地址</label>
            <input
              type="text"
              value={formData.address}
              onChange={handleChange('address')}
              placeholder="请输入地址"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 公司 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">公司</label>
            <input
              type="text"
              value={formData.company}
              onChange={handleChange('company')}
              placeholder="请输入公司名称"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 职位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">职位</label>
            <input
              type="text"
              value={formData.position}
              onChange={handleChange('position')}
              placeholder="请输入职位"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
            />
          </div>

          {/* 按钮区域 */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;