/**
 * IndexedDB 服务
 *
 * 数据库名: CIFNEW_DB
 * object store: ipfsContent
 * primary key: cid
 *
 * 提供非 React Hook 的独立 IndexedDB 读写方法，
 * 供 PubSubAggregator 等普通 class 使用。
 */
import { openDB } from 'idb';

const DB_NAME = 'CIFNEW_DB';
const DB_VERSION = 1;
const STORE_NAME = 'ipfsContent';

let dbPromise = null;

/**
 * 获取数据库连接（单例模式）
 */
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // 使用 cid 作为主键
          db.createObjectStore(STORE_NAME, { keyPath: 'cid' });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * 保存 IPFS 内容到 IndexedDB
 *
 * @param {string} cid - 内容标识符（主键）
 * @param {string} content - IPFS 读取的原始内容
 * @param {Object} [metadata] - 附加元数据（如 title, from 等）
 * @returns {Promise<void>}
 */
export async function saveIPFSContent(cid, content, metadata = {}) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.put({
      cid,
      content,
      title: metadata.title || '',
      from: metadata.from || '',
      savedAt: Date.now(),
    });

    await tx.done;
    console.log(`✅ IndexedDB 已保存 CID: ${cid}`);
  } catch (error) {
    console.error('❌ IndexedDB 保存失败:', error.message);
  }
}

/**
 * 从 IndexedDB 读取 IPFS 内容
 *
 * @param {string} cid - 内容标识符
 * @returns {Promise<Object|null>} - 返回 { cid, content, title, savedAt } 或 null
 */
export async function getIPFSContent(cid) {
  try {
    const db = await getDB();
    const result = await db.get(STORE_NAME, cid);
    return result || null;
  } catch (error) {
    console.error('❌ IndexedDB 读取失败:', error.message);
    return null;
  }
}

/**
 * 检查 IndexedDB 中是否存在指定 CID
 *
 * @param {string} cid
 * @returns {Promise<boolean>}
 */
export async function hasIPFSContent(cid) {
  try {
    const db = await getDB();
    const result = await db.getKey(STORE_NAME, cid);
    return result !== undefined;
  } catch (error) {
    console.error('❌ IndexedDB 检查失败:', error.message);
    return false;
  }
}

/**
 * 删除 IndexedDB 中指定 CID 的数据
 *
 * @param {string} cid
 * @returns {Promise<void>}
 */
export async function deleteIPFSContent(cid) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(cid);
    await tx.done;
    console.log(`🗑️ IndexedDB 已删除 CID: ${cid}`);
  } catch (error) {
    console.error('❌ IndexedDB 删除失败:', error.message);
  }
}