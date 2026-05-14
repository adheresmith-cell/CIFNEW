/**
 * IPFS 服务 - 使用 kubo-rpc-client 实现真实的 IPFS 交互
 * 
 * 提供文档内容的去中心化存储与读取。
 */
import { create } from 'kubo-rpc-client';
import config from '../config';

class IPFSClient {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  /**
   * 初始化并连接 IPFS 节点
   */
  async connect() {
    try {
      // 如果配置了完整 URL，使用 URL；否则使用 host/port/protocol
      if (config.ipfs.url) {
        this.client = create(config.ipfs.url);
      } else {
        this.client = create({
          host: config.ipfs.host,
          port: config.ipfs.port,
          protocol: config.ipfs.protocol,
        });
      }

      // 测试连接
      const id = await this.client.id();
      this.connected = true;
      console.log(`✅ IPFS 连接成功 - Node ID: ${id}...`);
      //console.log(`✅ IPFS 连接成功 - Node ID: ${id.id.slice(0, 20)}...`);

      return true;
    } catch (error) {
      this.connected = false;
      console.error('❌ IPFS 连接失败:', error.message);
      throw new Error(`IPFS 连接失败：${error.message}`);
    }
  }

  /**
   * 上传数据到 IPFS
   * @param {string|Buffer} data - 要上传的数据
   * @returns {Promise<{cid: string, size: number}>}
   */
  async upload(data) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      // kubo-rpc-client 的 add 方法接受 Buffer、string 或 Readable stream
      const result = await this.client.add(data, {
        pin: true, // 固定数据，防止被垃圾回收
        cidVersion: 1, // 使用 CID v1（推荐）
      });

      return {
        cid: result.cid.toString(),
        size: result.size,
      };
    } catch (error) {
      console.error('IPFS 上传失败:', error.message);
      throw new Error(`IPFS 上传失败：${error.message}`);
    }
  }

  /**
   * 从 IPFS 读取数据
   * @param {string} cid - 内容标识符
   * @returns {Promise<string>}
   */
  async read(cid) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      // 使用 cat 方法读取数据
      const chunks = [];
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }

      // 合并 Buffer 并转换为字符串
      const buffer = Buffer.concat(chunks);
      return buffer.toString('utf8');
    } catch (error) {
      // 区分错误类型
      if (
        error.message.includes('node not found') ||
        error.message.includes('path not resolved')
      ) {
        throw new Error(`CID 不存在：${cid}`);
      }

      console.error('IPFS 读取失败:', error.message);
      throw new Error(`IPFS 读取失败：${error.message}`);
    }
  }

  /**
   * 检查 CID 是否存在
   * @param {string} cid
   * @returns {Promise<boolean>}
   */
  async exists(cid) {
    try {
      await this.client.block.stat(cid);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取节点统计信息
   */
  async getStats() {
    try {
      const repoStat = await this.client.repo.stat();
      return {
        repoSize: repoStat.repoSize,
        numObjects: repoStat.numObjects,
      };
    } catch (error) {
      console.error('获取 IPFS 统计失败:', error.message);
      return null;
    }
  }
}

// 创建单例
const ipfsClient = new IPFSClient();

// ========== 兼容现有 ipfsService 接口 ==========

const ipfsService = {
  /**
   * 保存 Markdown 文档到 IPFS
   * @param {string} id - 文档 ID（用于日志，不作为 CID）
   * @param {string} content - Markdown 内容
   * @param {boolean} isPublic - 是否公开
   * @param {Array<string>} tags - 标签数组
   * @param {string|Object} category - 分类
   * @param {string} title - 文档标题
   * @returns {Promise<string>} - 返回 CID
   */
  async saveMarkdown(id, content, isPublic, tags, category, title) {
    console.log(`📝 正在保存文档到 IPFS: ${title || id}`);

    // 构建完整的文档数据对象（含元数据）
    const docData = JSON.stringify({
      id,
      title: title || '无标题',
      content,
      isPublic: !!isPublic,
      tags: Array.isArray(tags) ? tags : [],
      category: typeof category === 'object' ? category?.label || '' : category || '',
      timestamp: Date.now(),
      version: '1.0',
    });

    try {
      const result = await ipfsClient.upload(docData);
      console.log(`✅ 文档已保存到 IPFS - CID: ${result.cid}, 大小: ${result.size} bytes`);
      return result.cid;
    } catch (error) {
      console.error('❌ IPFS 保存失败:', error.message);
      // 返回 null 而不是抛出异常，让调用方决定如何处理
      return null;
    }
  },

  /**
   * 从 IPFS 读取文档
   * @param {string} cid - 内容标识符
   * @returns {Promise<Object|null>} - 返回解析后的文档对象，或 null
   */
  async getMarkdown(cid) {
    try {
      const data = await ipfsClient.read(cid);
      const docData = JSON.parse(data);

      console.log(`✅ 已从 IPFS 读取文档 - CID: ${cid}`);
      return {
        id: docData.id,
        title: docData.title,
        content: docData.content,
        isPublic: docData.isPublic,
        tags: docData.tags,
        category: docData.category,
        timestamp: docData.timestamp,
      };
    } catch (error) {
      console.error('❌ IPFS 读取失败:', error.message);
      return null;
    }
  },
};

export default ipfsService;