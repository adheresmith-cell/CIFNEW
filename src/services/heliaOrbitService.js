/**
 * Helia + libp2p + OrbitDB Service（单例版）
 * 适用于 React / Node.js
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
    this.initializing = false

    this.pubsubQueues = new Map()
    this.subscriptions = new Map()
  }

  /**
   * 初始化 P2P + Helia + OrbitDB
   */
  async connect(options = {}) {
    if (this.connected) return this
    if (this.initializing) return this

    this.initializing = true

    try {
      // 1. libp2p
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

      // 2. Helia
      this.helia = await createHelia({
        libp2p: this.libp2p
      })

      console.log('✅ Helia started:', this.libp2p.peerId.toString())

      // 3. 可选连接 Kubo
      if (options.kuboAddr) {
        try {
          const addr = multiaddr(options.kuboAddr)
          await this.libp2p.dial(addr)
          console.log('🔗 Kubo connected')
        } catch (e) {
          console.warn('⚠️ Kubo dial failed:', e.message)
        }
      }

      // 4. OrbitDB
      this.orbitdb = await createOrbitDB({
        ipfs: this.helia,
        directory: options.directory || './orbitdb-data'
      })

      this.db = await this.orbitdb.open(
        options.dbName || 'example-db',
        { type: 'documents' }
      )

      console.log('📦 OrbitDB ready:', this.db.address)

      this.connected = true
      this.initializing = false

      return this
    } catch (err) {
      this.initializing = false
      this.connected = false
      console.error('❌ connect failed:', err)
      throw err
    }
  }

  // =========================
  // OrbitDB API
  // =========================

  async put(doc) {
    if (!this.db) throw new Error('DB not ready')

    const data = {
      ...doc,
      _id: doc._id || crypto.randomUUID(),
      createdAt: doc.createdAt || Date.now()
    }

    await this.db.put(data)
    return data._id
  }

  async get(id) {
    if (!this.db) throw new Error('DB not ready')
    return this.db.get(id)
  }

  async all() {
    if (!this.db) throw new Error('DB not ready')
    return this.db.all()
  }

  // =========================
  // PubSub（libp2p gossipsub）
  // =========================

  async publish(topic, message) {
    const data = new TextEncoder().encode(
      typeof message === 'string'
        ? message
        : JSON.stringify(message)
    )

    await this.libp2p.services.pubsub.publish(topic, data)
  }

  async subscribe(topic, handler) {
    if (this.subscriptions.has(topic)) return

    const queue = []
    this.pubsubQueues.set(topic, queue)

    await this.libp2p.services.pubsub.subscribe(topic, (msg) => {
      try {
        const raw = new TextDecoder().decode(msg.data)

        let data
        try {
          data = JSON.parse(raw)
        } catch {
          data = raw
        }

        const event = {
          from: msg.from.toString(),
          topic,
          data,
          timestamp: Date.now()
        }

        queue.push(event)
        handler?.(event)

      } catch (err) {
        console.error('pubsub parse error:', err)
      }
    })

    this.subscriptions.set(topic, true)
  }

  pubsubPop(topic) {
    const q = this.pubsubQueues.get(topic)
    if (!q || q.length === 0) return null
    return q.shift()
  }

  getPeers() {
    return this.libp2p?.getPeers()?.map(p => p.toString()) || []
  }

  getPeerId() {
    return this.libp2p?.peerId?.toString()
  }

  // =========================
  // graceful shutdown
  // =========================

  async stop() {
    try {
      if (this.db) await this.db.close()
      if (this.orbitdb) await this.orbitdb.stop()
      if (this.helia) await this.helia.stop()

      this.connected = false
      this.initializing = false

      console.log('🛑 service stopped')
    } catch (err) {
      console.error('stop error:', err)
    }
  }
}

// =========================
// 单例导出（React 推荐）
// =========================

const heliaOrbitService = new HeliaOrbitService()

export default heliaOrbitService
export { HeliaOrbitService }
