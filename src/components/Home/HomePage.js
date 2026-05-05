import React from 'react';

const HomePage = () => {
  const plans = [
    {
      title: '头等舱套房',
      en: 'FIRST CLASS',
      desc: '私人套房配备180度平躺座椅，独立餐饮服务，顶级洗漱用品，专属空乘服务。',
      width: '86cm',
      space: '200cm',
      seats: 8,
      screen: '32" 4K',
      price: '¥45,000',
      highlight: false,
    },
    {
      title: '商务舱',
      en: 'BUSINESS CLASS',
      desc: '宽敞的个人空间，可调节的座椅转换为平躺床铺，优先登机和专属贵宾室服务。',
      width: '66cm',
      space: '150cm',
      seats: 28,
      screen: '18" HD',
      price: '¥18,000',
      highlight: true,
    },
    {
      title: '经济舱',
      en: 'ECONOMY CLASS',
      desc: '符合人体工程学的座椅设计，宽敞的腿部空间，个人娱乐系统和精选餐饮服务。',
      width: '46cm',
      space: '81cm',
      seats: 268,
      screen: '11" HD',
      price: '¥3,800',
      highlight: false,
    },
  ];

  return (
    <div className="bg-[#f5f7fb] min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-3xl overflow-hidden transition-all duration-500 transform 
            ${
              plan.highlight
                ? 'scale-105 z-10 shadow-[0_25px_60px_rgba(0,0,0,0.25)] border-2 border-yellow-400'
                : 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:-translate-y-2'
            }`}
          >
            {/* 顶部 */}
            <div
              className={`text-white text-center py-12 px-6 relative
              ${
                plan.highlight
                  ? 'bg-gradient-to-r from-[#2a1f5a] to-[#4a35a0]'
                  : 'bg-gradient-to-r from-[#2a1f5a] to-[#3b2a7a]'
              }`}
            >
              {plan.highlight && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full shadow">
                  最受欢迎
                </span>
              )}

              <div className="text-xs tracking-widest text-yellow-300 mb-2">
                {plan.en}
              </div>

              <h2 className="text-2xl font-bold">{plan.title}</h2>
            </div>

            {/* 内容 */}
            <div className="bg-white px-8 py-8">
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {plan.desc}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-8">
                <div>座椅宽度: {plan.width}</div>
                <div>座椅间距: {plan.space}</div>
                <div>舱位数量: {plan.seats}</div>
                <div>娱乐系统: {plan.screen}</div>
              </div>

              {/* 底部 */}
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {plan.price}
                  <span className="text-sm text-gray-400 ml-1">起</span>
                </div>

                <button
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-300
                  ${
                    plan.highlight
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 active:scale-95 shadow-md'
                      : 'border border-gray-300 text-gray-700 hover:border-yellow-400 hover:text-yellow-500 hover:scale-105 active:scale-95'
                  }`}
                >
                  选择
                </button>
              </div>
            </div>

            {/* 高亮卡片光晕 */}
            {plan.highlight && (
              <div className="absolute inset-0 rounded-3xl pointer-events-none shadow-[0_0_40px_rgba(255,215,0,0.3)]"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;