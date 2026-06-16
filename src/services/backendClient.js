/**
 * 后端 HTTP 客户端
 *
 * 封装所有向后端 Helia 服务发起的 API 调用。
 * 前端不再直接运行 Helia，全部通过此模块转 HTTP 请求。
 */

const BACKEND_URL = process.env.REACT_APP_HELIA_URL || 'http://localhost:3456'

class BackendClient {
  /**
   * 通用 fetch 封装
   */
  async _fetch(path, options = {}) {
    const url = `${BACKEND_URL}${path}`

    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`[${response.status}] ${text}`)
    }

    return response.json()
  }

  // =========================
  // 健康检查
  // =========================

  /**
   * 检查后端是否在线
   */
  async ping() {
    return this._fetch('/api/ping')
  }

  // =========================
  // P2P 状态
  // =========================

  /**
   * 获取 P2P 节点状态
   */
  async getStatus() {
    return this._fetch('/api/p2p/status')
  }

  /**
   * 获取已连接的对等节点列表
   */
  async getPeers() {
    return this._fetch('/api/p2p/peers')
  }

  // =========================
  // OrbitDB 文档操作
  // =========================

  /**
   * 写入文档到 OrbitDB
   * @param {Object} doc - 文档对象，必须有 _id 或会自动生成
   * @returns {Promise<{ok: boolean, id: string}>}
   */
  async dbPut(doc) {
    return this._fetch('/api/db/put', {
      method: 'POST',
      body: JSON.stringify(doc),
    })
  }

  /**
   * 从 OrbitDB 读取文档
   * @param {string} id - 文档 ID
   * @returns {Promise<Object|null>}
   */
  async dbGet(id) {
    return this._fetch(`/api/db/get/${encodeURIComponent(id)}`)
  }

  /**
   * 获取 OrbitDB 所有文档
   * @returns {Promise<Array>}
   */
  async dbAll() {
    return this._fetch('/api/db/all')
  }

  // =========================
  // 公司专属 OrbitDB 操作
  // =========================

  /**
   * 写入文档到公司专属的 OrbitDB 数据库
   * @param {string} companyId - 公司 ID
   * @param {Object} doc - 文档对象（必须包含 _id）
   * @returns {Promise<{ok: boolean}>}
   */
  async dbCompanyPut(companyId, doc) {
    return this._fetch(`/api/db/${encodeURIComponent(companyId)}/put`, {
      method: 'POST',
      body: JSON.stringify(doc),
    })
  }

  /**
   * 从公司专属的 OrbitDB 数据库读取文档
   * @param {string} companyId - 公司 ID
   * @param {string} id - 文档 ID（CID）
   * @returns {Promise<Object|null>}
   */
  async dbCompanyGet(companyId, id) {
    return this._fetch(`/api/db/${encodeURIComponent(companyId)}/get/${encodeURIComponent(id)}`)
  }

  // =========================
  // PubSub
  // =========================

  /**
   * 发布消息到 topic
   * @param {string} topic
   * @param {string|Object} message
   */
  async pubsubPublish(topic, message) {
    return this._fetch('/api/pubsub/publish', {
      method: 'POST',
      body: JSON.stringify({ topic, message }),
    })
  }

  /**
   * 订阅 topic
   * @param {string} topic
   */
  async pubsubSubscribe(topic) {
    return this._fetch('/api/pubsub/subscribe', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    })
  }

  /**
   * 从 topic 队列消费一条消息
   * @param {string} topic
   * @returns {Promise<Object|null>}
   */
  async pubsubPop(topic) {
    return this._fetch('/api/pubsub/pop', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    })
  }
}

// 单例
const backendClient = new BackendClient()
export default backendClient