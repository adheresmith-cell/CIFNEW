import { useState } from 'react';
import CompanyCard from './CompanyCard';
import AddCompanyModal from './AddCompanyModal';

/**
 * 公司列表组件
 * @param {array} companies - 公司数据列表
 * @param {function} onCompanyClick - 公司点击回调
 * @param {function} onAddCompany - 新增公司回调
 */
function CompanyList({ companies, onCompanyClick, onAddCompany }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddCompany = (newCompany) => {
    onAddCompany(newCompany);
    setShowAddModal(false);
  };

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配公司</h3>
        <p className="text-gray-500">试试调整搜索条件或筛选条件</p>

        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增公司节点
        </button>

        <AddCompanyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCompany}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          共找到 <span className="font-semibold text-primary-600">{companies.length}</span> 家公司
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增公司节点
        </button>
      </div>
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onClick={onCompanyClick}
        />
      ))}

      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCompany}
      />
    </div>
  );
}

export default CompanyList;
