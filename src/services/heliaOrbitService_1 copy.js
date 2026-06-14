/**
 * Helia + libp2p + OrbitDB 服务
 * 封装去中心化存储 + PubSub + DB 操作
 */

import { createHelia } from 'helia'
import { createOrbitDB } from '@orbitdb/core'
import { createLibp2p } from 'libp2p'

import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'

import { identify } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'

import { multiaddr } from '@multiformats/multiaddr'

class HeliaOrbitService {
  constructor() {
    this.libp2p = null
    this.helia = null
    this.orbitdb = null
    this.db = null

    this.connected = false
    this.peersCache = new Set()
  }

  /**
   * 初始化整个 P2P + IPFS + OrbitDB
   */
  async connect(options = {}) {
    if (this.connected) return true

    try {
      // 1. 创建 libp2p
      this.libp2p = await createLibp2p({
        transports: [tcp()],
        connectionEncrypters: [noise()],
        streamMuxers: [yamux()],
        services: {
          identify: identify(),
          pubsub: gossipsub({
            allowPublishToZeroTopicPeers: true
          })
        }
      })

      // 2. 创建 Helia
      this.helia = await createHelia({
        libp2p: this.libp2p
      })

      console.log('✅ Helia started')
      console.log('PeerId:', this.libp2p.peerId.toString())

      // 3. 连接 Kubo 节点（可选）
      if (options.kuboMultiaddr) {
        try {
          const addr = multiaddr(options.kuboMultiaddr)
          const conn = await this.libp2p.dial(addr)

          console.log('🔗 Connected to Kubo:', conn.remotePeer.toString())
        } catch (err) {
          console.error('⚠️ Kubo dial failed:', err.message)
        }
      }

      // 4. 创建 OrbitDB
      this.orbitdb = await createOrbitDB({
        ipfs: this.helia,
        directory: options.directory || './orbitdb-data'
      })

      // 5. 打开默认 DB
      this.db = await this.orbitdb.open(
        options.dbName || 'example-db',
        { type: 'documents' }
      )

      console.log('📦 OrbitDB ready:', this.db.address)

      this.connected = true
      return true
    } catch (err) {
      console.error('❌ Helia service connect failed:', err)
      this.connected = false
      throw err
    }
  }

  // =========================
  // DB 操作
  // =========================

  async put(doc) {
    if (!this.db) throw new Error('DB not initialized')

    const data = {
      ...doc,
      _id: doc._id || Date.now().toString(),
      createdAt: doc.createdAt || Date.now()
    }

    await this.db.put(data)
    return data._id
  }

  async get(id) {
    if (!this.db) throw new Error('DB not initialized')
    return await this.db.get(id)
  }

  async all() {
    if (!this.db) throw new Error('DB not initialized')
    return await this.db.all()
  }

  // =========================
  // PubSub（基于 libp2p gossipsub）
  // =========================

  async publish(topic, message) {
    if (!this.libp2p) throw new Error('libp2p not ready')

    const data = new TextEncoder().encode(
      typeof message === 'string'
        ? message
        : JSON.stringify(message)
    )

    await this.libp2p.services.pubsub.publish(topic, data)
    console.log(`📤 Published to ${topic}`)
  }

  async subscribe(topic, handler) {
    if (!this.libp2p) throw new Error('libp2p not ready')

    await this.libp2p.services.pubsub.subscribe(topic, (msg) => {
      try {
        const raw = new TextDecoder().decode(msg.data)

        let parsed
        try {
          parsed = JSON.parse(raw)
        } catch {
          parsed = raw
        }

        handler?.({
          from: msg.from.toString(),
          topic,
          data: parsed,
          timestamp: Date.now()
        })
      } catch (err) {
        console.error('PubSub parse error:', err.message)
      }
    })

    console.log(`📥 Subscribed: ${topic}`)
  }

  // =========================
  // 网络状态
  // =========================

  getPeers() {
    if (!this.libp2p) return []
    return this.libp2p.getPeers().map(p => p.toString())
  }

  getPeerId() {
    return this.libp2p?.peerId?.toString()
  }

  // =========================
  // 关闭服务
  // =========================

  async stop() {
    try {
      if (this.db) await this.db.close()
      if (this.orbitdb) await this.orbitdb.stop()
      if (this.helia) await this.helia.stop()

      this.connected = false
      console.log('🛑 HeliaOrbitService stopped')
    } catch (err) {
      console.error('Stop failed:', err.message)
    }
  }
}

// =========================
// 单例导出（类似 ipfsService）
// =========================

const heliaOrbitService = new HeliaOrbitService()

export default heliaOrbitService
export { HeliaOrbitService }