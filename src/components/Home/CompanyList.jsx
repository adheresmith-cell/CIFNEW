import CompanyCard from './CompanyCard';

/**
 * 公司列表组件
 * @param {array} companies - 公司数据列表
 * @param {function} onCompanyClick - 公司点击回调
 */
function CompanyList({ companies, onCompanyClick }) {
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          共找到 <span className="font-semibold text-primary-600">{companies.length}</span> 家公司
        </p>
      </div>
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onClick={onCompanyClick}
        />
      ))}
    </div>
  );
}

export default CompanyList;
