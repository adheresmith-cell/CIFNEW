/**
 * OrbitDB 月度数据同步服务
 *
 * 自动读取当前月份的 OrbitDB monthlyAll 文档，
 * 并将新文档写入 IndexedDB 缓存。
 */
import backendClient from './backendClient';
import { saveIPFSContent, hasIPFSContent } from './indexedDBService';
import { ipfsClient } from './ipfsDB';

/**
 * 获取当前月份字符串（YYYY-MM 格式）
 */
function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 同步当月 OrbitDB 数据到 IndexedDB
 *
 * 遍历当月所有文档，若 IndexedDB 中尚不存在则写入。
 * 适合在 App 启动时自动调用。
 *
 * @param {Object} [options]
 * @param {string} [options.month] - 指定月份，不传则使用当月
 * @param {boolean} [options.force] - 是否强制覆盖已存在的记录
 * @returns {Promise<{synced: number, skipped: number, errors: number}>}
 */
export async function syncMonthlyToIndexedDB(options = {}) {
  const month = options.month || getCurrentMonth();
  const force = options.force || false;

  console.log(`📡 同步 OrbitDB 月度数据: ${month}`);

  let synced = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // 1. 从后端拉取当月所有文档
    const docs = await backendClient.dbMonthlyAll(month);

    if (!Array.isArray(docs) || docs.length === 0) {
      console.log(`📭 月份 ${month} 没有数据`);
      return { synced, skipped, errors };
    }

    console.log(`📦 月份 ${month} 共 ${docs.length} 条文档`);

    // 2. 遍历文档，逐条写入 IndexedDB
    for (const doc of docs) {
      try {
        // OrbitDB documents() 返回的格式为 { hash, key, value: { _id, title, ... } }
        // 实际数据在 doc.value 中
        const data = doc.value || doc;
        const cid = data._id || doc.key;
        if (!cid) {
          console.warn('⚠️ 文档缺少 _id/cid/key，跳过:', doc);
          skipped++;
          continue;
        }

        // 检查是否已存在（除非 force 覆盖）
        if (!force) {
          const exists = await hasIPFSContent(cid);
          if (exists) {
            skipped++;
            continue;
          }
        }

        // 从 IPFS 读取实际内容（CID 指向 IPFS 存储的文档正文）
        let content;
        try {
          content = await ipfsClient.read(cid);
        } catch (readErr) {
          console.warn(`⚠️ IPFS 读取失败 ${cid}，回退使用元数据:`, readErr.message);
          content = typeof data === 'string' ? data : JSON.stringify(data);
        }

        // 写入 IndexedDB
        await saveIPFSContent(cid, content, {
          title: data.title || '',
          from: `orbit-month-${month}`,
          companyId: data.companyId || '',
        });

        synced++;
      } catch (docErr) {
        console.error(`❌ 文档同步失败:`, docErr.message);
        errors++;
      }
    }

    console.log(`✅ OrbitDB 月度同步完成: 新增 ${synced}, 跳过 ${skipped}, 错误 ${errors}`);
  } catch (err) {
    console.error('❌ OrbitDB 月度同步失败:', err.message);
    errors++;
  }

  return { synced, skipped, errors };
}

export default { syncMonthlyToIndexedDB };