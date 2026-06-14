/**
 * Helia + OrbitDB 后端服务器
 *
 * 启动一个 Express HTTP 服务器，提供 REST API 接口供前端调用。
 * 在 Node.js 环境下运行 Helia + libp2p + OrbitDB。
 *
 * 启动方式：node helia-server.mjs
 */

import express from 'express'
import cors from 'cors'

// 从前端源码导入 HeliaOrbitService 类（EVM 兼容, .mjs 不受 package.json type 影响）
import { HeliaOrbitService } from './src/services/heliaOrbitService.js'

// =========================
// 配置
// =========================
const PORT = process.env.HELIA_PORT || 3456
const DB_NAME = process.env.DB_NAME || 'cifnew-db'
const DB_DIR = process.env.DB_DIR || './orbitdb-data'

// =========================
// 初始化服务
// =========================
const heliaService = new HeliaOrbitService()

async function startServer() {
  console.log('🚀 Starting Helia backend server...')

  try {
    await heliaService.connect({
      dbName: DB_NAME,
      directory: DB_DIR
    })
    console.log(`✅ Helia backend ready — PeerID: ${heliaService.getPeerId()}`)
  } catch (err) {
    console.error('❌ Failed to start Helia service:', err)
    process.exit(1)
  }

  // =========================
  // Express
  // =========================
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '10mb' }))

  // ---------- 健康检查 ----------
  app.get('/api/ping', (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() })
  })

  // ---------- P2P 状态 ----------
  app.get('/api/p2p/status', (_req, res) => {
    res.json({
      connected: heliaService.connected,
      peerId: heliaService.getPeerId(),
      peers: heliaService.getPeers().length,
    })
  })

  app.get('/api/p2p/peers', (_req, res) => {
    res.json({
      peers: heliaService.getPeers()
    })
  })

  // ---------- OrbitDB 文档操作 ----------
  app.post('/api/db/put', async (req, res) => {
    try {
      const doc = req.body
      if (!doc || typeof doc !== 'object') {
        return res.status(400).json({ error: 'Invalid document' })
      }
      const id = await heliaService.put(doc)
      res.json({ ok: true, id })
    } catch (err) {
      console.error('/api/db/put error:', err)
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/db/get/:id', async (req, res) => {
    try {
      const doc = await heliaService.get(req.params.id)
      res.json(doc || null)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/db/all', async (_req, res) => {
    try {
      const docs = await heliaService.all()
      res.json(docs)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ---------- PubSub ----------
  app.post('/api/pubsub/publish', async (req, res) => {
    try {
      const { topic, message } = req.body
      if (!topic) {
        return res.status(400).json({ error: 'topic required' })
      }
      await heliaService.publish(topic, message ?? '')
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/pubsub/subscribe', async (req, res) => {
    try {
      const { topic } = req.body
      if (!topic) {
        return res.status(400).json({ error: 'topic required' })
      }
      await heliaService.subscribe(topic)
      res.json({ ok: true, topic })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/pubsub/pop', async (req, res) => {
    try {
      const { topic } = req.body
      if (!topic) {
        return res.status(400).json({ error: 'topic required' })
      }
      const msg = heliaService.pubsubPop(topic)
      res.json(msg)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ---------- 关闭服务 ----------
  app.post('/api/stop', async (_req, res) => {
    res.json({ ok: true, message: 'shutting down...' })
    // 延迟一秒后关闭
    setTimeout(async () => {
      await heliaService.stop()
      process.exit(0)
    }, 1000)
  })

  // =========================
  // 启动 HTTP
  // =========================
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   Helia Backend Server                  ║
║   Port: ${String(PORT).padEnd(33)}║
║   PeerID: ${(heliaService.getPeerId() || '?').slice(0, 20).padEnd(28)}...║
║   OrbitDB: ${DB_NAME.padEnd(30)}║
╚══════════════════════════════════════════╝`)
  })
}

startServer().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})