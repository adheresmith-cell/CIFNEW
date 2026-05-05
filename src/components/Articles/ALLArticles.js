import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faUser, 
  faClock,
  faBuilding,
  faTimes,
  faPaperclip
} from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSearch } from '../../context/SearchContext';

// ==================== 虚假文章数据 ====================
// 模拟从 /api/getallarticles/ 获取的文章数据
const MOCK_ARTICLES = [
  {
    id: "100000001",
    title: "React 入门指南",
    content: `# React 入门指南

## 什么是 React？

React 是一个用于构建用户界面的 JavaScript 库。

### 核心概念

1. **组件化**：将 UI 拆分为独立、可复用的组件
2. **虚拟 DOM**：高效的 DOM 更新机制
3. **单向数据流**：数据从父组件流向子组件

### 快速开始

\`\`\`jsx
import React from 'react';

function App() {
  return <h1>Hello, React!</h1>;
}
\`\`\`

> React 让构建交互式 UI 变得轻而易举。`,
    tagObject: "前端+React+教程",
    category: "技术团队+前端组",
    timestamp: 1746364800000,
    author: "张三"
  },
  {
    id: "100000002",
    title: "Node.js 后端开发实践",
    content: `# Node.js 后端开发实践

## 为什么选择 Node.js？

Node.js 基于 Chrome V8 引擎，具有高性能、事件驱动、非阻塞 I/O 等特性。

### 常用框架

| 框架 | 特点 | 适用场景 |
|------|------|----------|
| Express | 轻量灵活 | RESTful API |
| Koa | 更现代的中间件 | 复杂应用 |
| NestJS | 全栈框架 | 企业级应用 |

### 示例代码

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000);
\`\`\``,
    tagObject: "后端+Node.js+实践",
    category: "技术团队+后端组",
    timestamp: 1746375600000,
    author: "李四"
  },
  {
    id: "100000003",
    title: "数据库设计原则",
    content: `# 数据库设计原则

良好的数据库设计是应用性能和数据一致性的基础。

## 三大范式

1. **第一范式**：字段不可再分
2. **第二范式**：非主键字段完全依赖主键
3. **第三范式**：非主键字段不传递依赖主键

## 索引优化

- 合理使用索引可以大幅提升查询性能
- 避免在频繁更新的列上建立过多索引
- 使用覆盖索引减少回表查询

### 设计注意事项

1. 预估数据量级，选择合适的数据库类型
2. 合理设计分表策略
3. 考虑读写分离方案`,
    tagObject: "数据库+设计+优化",
    category: "技术团队+数据库组",
    timestamp: 1746386400000,
    author: "王五"
  },
  {
    id: "100000004",
    title: "深入理解 JavaScript 闭包",
    content: `# 深入理解 JavaScript 闭包

闭包是 JavaScript 中最重要也最容易让人困惑的概念之一。

## 什么是闭包？

**闭包**是指能够访问自由变量的函数。自由变量是指在函数中使用的，但既不是函数参数也不是函数局部变量的变量。

### 经典示例

\`\`\`javascript
function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

### 闭包的应用场景

- 数据私有化
- 回调函数
- 函数柯里化
- 模块化编程`,
    tagObject: "JavaScript+闭包+进阶",
    category: "技术团队+前端组",
    timestamp: 1746397200000,
    author: "赵六"
  },
  {
    id: "100000005",
    title: "Docker 容器化部署",
    content: `# Docker 容器化部署

Docker 改变了软件开发和部署的方式。

## 基本概念

- **镜像 (Image)**：一个只读模板，包含创建容器的指令
- **容器 (Container)**：镜像的运行实例
- **仓库 (Registry)**：存储和分发镜像的地方

### Dockerfile 示例

\`\`\`dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### 常用命令

| 命令 | 说明 |
|------|------|
| docker build | 构建镜像 |
| docker run | 运行容器 |
| docker ps | 查看运行中的容器 |
| docker compose | 管理多容器应用 |`,
    tagObject: "Docker+容器化+部署",
    category: "运维团队+部署组",
    timestamp: 1746408000000,
    author: "钱七"
  },
  {
    id: "100000006",
    title: "产品需求文档模板",
    content: `# 产品需求文档模板

## 1. 项目背景

描述项目背景、目标和预期收益。

## 2. 用户故事

- 作为用户，我希望能快速注册账号
- 作为用户，我希望能搜索内容
- 作为管理员，我希望能管理用户权限

## 3. 功能需求

### 3.1 用户模块
- 注册/登录
- 个人信息管理
- 密码重置

### 3.2 内容模块
- 文章发布
- 文章编辑
- 文章删除

## 4. 非功能需求

- 响应时间 < 200ms
- 系统可用性 99.9%
- 支持 10000 并发用户`,
    tagObject: "产品+需求+文档",
    category: "产品团队+需求组",
    timestamp: 1746418800000,
    author: "孙八"
  },
  {
    id: "100000007",
    title: "UI/UX 设计规范",
    content: `# UI/UX 设计规范

## 设计原则

1. **一致性**：保持界面元素和行为一致
2. **反馈**：用户操作后给予及时反馈
3. **简洁**：去除不必要的元素
4. **可访问性**：确保所有用户都能使用

## 色彩系统

- 主色：#1890ff
- 成功：#52c41a
- 警告：#faad14
- 错误：#ff4d4f

## 字体规范

- 标题：24px/20px/16px
- 正文：14px
- 辅助文字：12px

> 好的设计是看不见的设计。`,
    tagObject: "UI+UX+设计规范",
    category: "产品团队+设计组",
    timestamp: 1746429600000,
    author: "周九"
  },
  {
    id: "100000008",
    title: "Git 工作流最佳实践",
    content: `# Git 工作流最佳实践

## 分支策略

### Git Flow
- **main**: 生产分支
- **develop**: 开发分支
- **feature/***: 功能分支
- **release/***: 发布分支
- **hotfix/***: 热修复分支

### 提交规范

\`\`\`
feat: 新功能
fix: 修复bug
docs: 文档变更
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
\`\`\`

### 常用命令

- git flow init
- git flow feature start my-feature
- git flow release start 1.0.0`,
    tagObject: "Git+工作流+实践",
    category: "技术团队+基础设施组",
    timestamp: 1746440400000,
    author: "吴十"
  },
  {
    id: "100000009",
    title: "机器学习入门",
    content: `# 机器学习入门

## 什么是机器学习？

机器学习是人工智能的一个分支，使计算机能够从数据中学习和改进。

## 主要类型

### 监督学习
- 线性回归
- 决策树
- 支持向量机
- 神经网络

### 无监督学习
- K-means 聚类
- 主成分分析
- 自编码器

### 强化学习
- Q-learning
- 策略梯度
- 深度强化学习

## 学习路线

1. Python 基础
2. 数学基础（线性代数、概率论）
3. 经典算法
4. 深度学习
5. 项目实践`,
    tagObject: "机器学习+AI+入门",
    category: "AI团队+算法组",
    timestamp: 1746451200000,
    author: "郑一"
  },
  {
    id: "100000010",
    title: "微服务架构设计",
    content: `# 微服务架构设计

## 什么是微服务？

微服务架构是一种将应用拆分为小、自治服务的架构风格。

## 核心特性

1. **独立部署**：每个服务可以独立部署
2. **技术多样性**：不同服务可以使用不同技术栈
3. **故障隔离**：单个服务故障不影响整体
4. **弹性扩展**：按需扩展特定服务

## 关键技术

- **服务发现**：Consul, Eureka
- **API 网关**：Kong, Nginx
- **服务通信**：gRPC, Message Queue
- **分布式追踪**：Jaeger, Zipkin
- **配置中心**：Apollo, Nacos`,
    tagObject: "微服务+架构+设计",
    category: "技术团队+架构组",
    timestamp: 1746462000000,
    author: "陈二"
  }
];

// ==================== 模拟 API 请求函数 ====================
// 模拟从 /api/getallarticles/ 获取文章
const fetchMockArticles = () => {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      resolve([...MOCK_ARTICLES]);
    }, 500);
  });
};

// ==================== 文章详情弹窗组件 ====================
const ArticleDetailModal = ({ article, onClose }) => {
  // 点击遮罩背景关闭弹窗
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部：标题 + 关闭按钮 */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 truncate">
              文档 {article.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-lg" />
          </button>
        </div>

        {/* 元数据信息 */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
              <span>{article.author || '匿名'}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-500" />
              <span>{new Date(article.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-500" />
              <span>{article.category.split('+')[0] + "(" + (article.category.split('+')[1] || '') + ")" || '未分类'}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faPaperclip} className="mr-2 text-blue-500" />
              <div className="flex flex-wrap gap-1">
                {article.tagObject.indexOf("+") !== -1 ? (
                  article.tagObject.split('+').map((tag, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-md">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-md">
                    {article.tagObject}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 文章内容（可滚动） */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="markdown-body"
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

const ALLArticles = ({ companyName }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { searchQuery } = useSearch();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        // 从模拟 API /api/getallarticles/ 获取文章数据
        const data = await fetchMockArticles();
        console.log("ALLArticles - 从模拟 API 获取文章:", data);
        setArticles(data);
      } catch (err) {
        console.error('加载文章失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // 过滤文章：根据搜索关键词和公司名称过滤
  const filteredArticles = articles.filter(article => {
    // 按搜索关键词过滤
    const matchesSearch = searchQuery === '' || (article.content && article.content.toLowerCase().includes(searchQuery.toLowerCase()));
    // 按公司名称过滤（如果传入companyName）
    const matchesCompany = !companyName || (article.category && article.category.toLowerCase().includes(companyName.toLowerCase()));
    return matchesSearch && matchesCompany;
  });

  // 点击文章，弹出详情弹窗
  const handleArticleClick = (article) => {
    console.log("点击文章，弹出详情弹窗");
    setSelectedArticle(article);
  };

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setSelectedArticle(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      {/* 文章列表 - 每篇文章占据一行 */}
      <div className="grid grid-cols-1 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article)}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="p-6 relative">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <FontAwesomeIcon icon={faBook} className="mr-2 text-blue-500" />
                文档 {article.title || article.id}
              </h3>
              {
                article.tagObject && article.tagObject.indexOf("+") !== -1 ? (
                  <div className="absolute top-4 right-4 flex gap-2">
                    {Object.entries(article.tagObject.split('+')).map(([key, value], index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          {article.tagObject}
                    </span>
                  </div>
                )
              }
              <div className="text-gray-600 mb-4 line-clamp-3">
                {article.content}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBuilding} className="mr-1" />
                  <span>{article.category ? article.category.split('+')[0] : '未分类'}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          没有找到相关文章
        </div>
      )}

      {/* 文章详情弹窗 */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default ALLArticles;