import React from 'react';

const companies = [
  {
    name: '阿里巴巴',
    industry: '互联网',
    desc: '全球领先的数字商业平台公司，涵盖电商、云计算等领域。',
    location: '杭州',
    size: '10000+人',
    funding: '已上市',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    name: '腾讯',
    industry: '互联网',
    desc: '中国领先的互联网科技公司，拥有微信、QQ等产品。',
    location: '深圳',
    size: '10000+人',
    funding: '已上市',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: '字节跳动',
    industry: 'AI / 内容',
    desc: '全球知名科技公司，旗下拥有抖音、TikTok等产品。',
    location: '北京',
    size: '10000+人',
    funding: '未上市',
    gradient: 'from-pink-500 to-red-400',
  },
  {
    name: '华为',
    industry: '通信 / 硬件',
    desc: '全球领先的ICT基础设施和智能终端提供商。',
    location: '深圳',
    size: '10000+人',
    funding: '未上市',
    gradient: 'from-gray-600 to-gray-800',
  },
];

const CompanySection = () => {
  return (
    <div className="bg-[#f5f7fb] py-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* 标题 */}
        <h2 className="text-3xl font-bold text-center mb-10">
          热门公司
        </h2>

        {/* 卡片 */}
        <div className="grid md:grid-cols-4 gap-6">
          {companies.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition transform hover:-translate-y-2"
            >
              {/* 顶部渐变 */}
              <div className={`bg-gradient-to-r ${item.gradient} p-6 text-white`}>
                <div className="text-lg font-semibold">{item.name}</div>
                <div className="text-sm opacity-80">{item.industry}</div>
              </div>

              {/* 内容 */}
              <div className="p-5">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.desc}
                </p>

                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>📍 {item.location}</span>
                  <span>👥 {item.size}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                    {item.funding}
                  </span>

                  <button className="text-sm text-blue-500 hover:underline">
                    查看详情 →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CompanySection;