/**
 * PubSub Hour Aggregator
 *
 * 功能：
 * - 订阅 PubSub topic
 * - 收集消息
 * - filter + dedup
 * - 按小时聚合
 * - 定时 flush 到 IPFS
 * - 生成 hour CID
 */

import { ipfsClient } from './ipfsDB';
import {
  saveIPFSContent,
  hasIPFSContent,
} from './indexedDBService';

class PubSubAggregator {
    constructor(options = {}) {
        // topic => Array<message>
        this.hourBuckets = new Map();

        // 去重
        this.seenCids = new Set();

        // 保存 hour -> cid
        this.hourIndex = new Map();

        // flush 间隔
        this.flushIntervalMs = options.flushIntervalMs || 60 * 1000;

        // 最大 bucket 数量
        this.maxBucketSize = options.maxBucketSize || 1000;

        // topic
        this.topic = options.topic || 'test_up_cid_12345';

        // timer
        this.flushTimer = null;

        // 是否启动
        this.started = false;
    }

    /**
     * 启动聚合器
     */
    async start() {
        if (this.started) {
            return;
        }

        console.log(`🚀 启动 PubSubAggregator`);

        // 订阅 topic
        await ipfsClient.pubsubSubscribe(this.topic);

        // 启动消息轮询
        this.startConsumeLoop();

        // 启动定时 flush
        this.flushTimer = setInterval(async () => {
            try {
                await this.flushExpiredBuckets();
            } catch (err) {
                console.error('flushExpiredBuckets 失败:', err);
            }
        }, this.flushIntervalMs);

        this.started = true;
    }

    /**
     * 停止聚合器
     */
    async stop() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        // flush 所有 bucket
        await this.flushAllBuckets();

        await ipfsClient.pubsubUnsubscribe(this.topic);

        this.started = false;

        console.log(`🛑 PubSubAggregator 已停止`);
    }

    /**
     * 消费循环
     */
    async startConsumeLoop() {
        const loop = async () => {
            while (true) {
                try {
                    const msg = await ipfsClient.pubsubPop(this.topic);

                    if (msg) {
                        await this.processMessage(msg);
                    } else {
                        // 避免空转 CPU
                        await this.sleep(500);
                    }

                } catch (err) {
                    console.error('消费消息失败:', err);

                    await this.sleep(1000);
                }
            }
        };

        loop();
    }

    /**
     * 处理消息
     */
    async processMessage(msg) {
        const filtered = this.filterMessage(msg);// 消息过滤 + 标准化

        // 被过滤
        if (!filtered) {
            return;
        }

        // 
        console.log("---- 新增：从 IPFS 读取内容并存储到 IndexedDB ----");
        try {
            // 检查是否已经存储过该 CID（避免重复读取）
            const exists = await hasIPFSContent(filtered.cid);
            if (!exists) {
                console.log(
                    `📥 正在从 IPFS 读取 CID: ${filtered.cid}`
                );
                const content = await ipfsClient.read(
                    filtered.cid
                );

                await saveIPFSContent(filtered.cid, content, {
                    title: filtered.title,
                    from: filtered.from,
                });
            } else {
                console.log(
                    `⏭️ CID 已在 IndexedDB 中，跳过: ${filtered.cid}`
                );
            }
        } catch (err) {
            // IPFS 读取或 IndexedDB 存储失败，不影响后续聚合流程
            console.error(
                `⚠️ 读取/存储 CID 内容失败: ${filtered.cid}`,
                err.message
            );
        }
        // ---- 结束新增 ----

        const hourKey = this.getHourKey(filtered.receivedAt);

        // 初始化 bucket
        if (!this.hourBuckets.has(hourKey)) {
            this.hourBuckets.set(hourKey, []);
        }

        const bucket = this.hourBuckets.get(hourKey);

        bucket.push(filtered);

        console.log(
            `📦 bucket=${hourKey}, 当前数量=${bucket.length}`
        );

        // bucket 超限立即 flush
        if (bucket.length >= this.maxBucketSize) {
            console.log(`⚠️ bucket 达到上限，立即 flush`);

            await this.flushBucket(hourKey);
        }
    }

    /**
     * 消息过滤 + 标准化
     */
    filterMessage(msg) {
        try {
            if (!msg?.data) {
                return null;
            }

            const data = msg.data;

            // 必须有 CID
            if (!data.cid) {
                return null;
            }

            // CID 必须是字符串
            if (typeof data.cid !== 'string') {
                return null;
            }

            // 去重
            if (this.seenCids.has(data.cid)) {
                console.log(`⚠️ 重复 CID: ${data.cid}`);

                return null;
            }

            this.seenCids.add(data.cid);

            // 标准化
            return {
                cid: data.cid,
                title: data.title || '',
                from: msg.from,
                topic: msg.topic,
                receivedAt: msg.timestamp || Date.now(),
            };

        } catch (err) {
            console.error('filterMessage 失败:', err);

            return null;
        }
    }

    /**
     * 获取小时 key
     *
     * 例如：
     * 2026-05-17-14
     */
    getHourKey(timestamp = Date.now()) {
        const d = new Date(timestamp);

        const yyyy = d.getUTCFullYear();

        const mm = String(
            d.getUTCMonth() + 1
        ).padStart(2, '0');

        const dd = String(
            d.getUTCDate()
        ).padStart(2, '0');

        const hh = String(
            d.getUTCHours()
        ).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}-${hh}`;
    }

    /**
     * flush 已结束小时 bucket  start调用
     */
    async flushExpiredBuckets() {
        const currentHour = this.getHourKey();

        for (const [hourKey] of this.hourBuckets.entries()) {

            // 当前小时还在接收
            if (hourKey === currentHour) {
                continue;
            }

            await this.flushBucket(hourKey);
        }
    }

    /**
     * flush 单个 bucket
     * hourKey = "2026-05-17-14" 表示：2026-05-17 14:00 ~ 14:59 这一小时内的所有消息
     */
    async flushBucket(hourKey) {
        const bucket = this.hourBuckets.get(hourKey);// 获取 bucket，即该小时对应的消息数组

        if (!bucket || bucket.length === 0) {
            return;
        }

        console.log(
            `💾 开始 flush hour bucket: ${hourKey}, count=${bucket.length}`
        );

        // 归档“文件内容”：metadata + bucket
        const payload = {
            topic: this.topic,
            hour: hourKey,
            count: bucket.length,
            createdAt: Date.now(),
            messages: bucket,
        };

        // 上传到 IPFS
        try {
            const result = await ipfsClient.upload(
                JSON.stringify(payload)
            );

            const hourCid = result.cid;

            // 保存 index
            this.hourIndex.set(hourKey, {
                cid: hourCid,
                count: bucket.length,
                flushedAt: Date.now(),
            });

            console.log(
                `✅ Hour Bucket 已上传:
                hour=${hourKey}
                cid=${hourCid}
                count=${bucket.length}`
            );

            // flush 后清理内存
            this.hourBuckets.delete(hourKey);

            // 可选：
            // 保存 hour index
            await this.flushHourIndex();

        } catch (err) {
            console.error(
                `❌ flushBucket 失败: ${hourKey}`,
                err
            );
        }
    }

    /**
     * 保存 hour index
     */
    async flushHourIndex() {
        try {
            const indexObject = {
                topic: this.topic,
                updatedAt: Date.now(),
                hours: Object.fromEntries(this.hourIndex),
            };

            const result = await ipfsClient.upload(
                JSON.stringify(indexObject)
            );

            console.log(
                `📚 Hour Index CID: ${result.cid}`
            );

            this.latestIndexCid = result.cid;

        } catch (err) {
            console.error('flushHourIndex 失败:', err);
        }
    }

    /**
     * flush 所有 bucket stop时调用
     */
    async flushAllBuckets() {
        for (const [hourKey] of this.hourBuckets.entries()) {
            await this.flushBucket(hourKey);
        }
    }

    /**
     * sleep
     */
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}

// 单例模式
const pubsubAggregator = new PubSubAggregator({
    topic: 'test_up_cid_12345',

    // 每分钟检查
    flushIntervalMs: 60 * 1000,

    // 每小时 bucket 最大消息数
    maxBucketSize: 1000,
});

export default pubsubAggregator;