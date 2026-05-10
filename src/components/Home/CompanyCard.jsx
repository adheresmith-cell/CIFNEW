/**
 * 公司卡片组件
 * @param {object} company - 公司数据
 * @param {function} onClick - 点击回调函数
 */
function CompanyCard({ company, onClick }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGrad)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div
      onClick={() => onClick(company)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={company.logo}
            alt={company.name}
            className="w-20 h-20 rounded-lg object-cover border border-gray-200 group-hover:border-primary-300 transition-colors"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {company.name}
            </h3>
            <span className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
              {renderStars(company.rating)}
              <span className="ml-1">{company.rating}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
              {company.industry}
            </span>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {company.scale}
            </span>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {company.city}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {company.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              在招岗位
              <span className="ml-1 text-primary-600 font-semibold">{company.jobs}</span>
              个
            </span>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
              查看详情 →
            </button>
          </div>

          {/* 关联组织标签 */}
          <div className="flex flex-wrap gap-1.5">
            {company.parent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200" title={`隶属于 ${company.parent}`}>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {company.parent}
              </span>
            )}
            {company.related && company.related.map((rel, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {rel}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyCard;
