// ========================================================================
// MODULE 3: Redis Cache — In-memory data store for frequently accessed data
// ========================================================================
// Topics: Caching, Redis key-value store, Async/Await, Error handling
//
// Redis stores data in RAM = extremely fast reads/writes
// Used here to cache product stock counts so we don't hit MongoDB every time
// Falls back to an in-memory Map if Redis server isn't running
// ========================================================================

const { createClient } = require('redis');

let client = null;
let useMemoryFallback = false;
const memoryStore = new Map(); // In-memory fallback (JavaScript Map)

// --- CONNECT TO REDIS ---
const connectRedis = async () => {
    try {
        client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        client.on('error', (err) => {
            console.log('Redis error, using in-memory fallback:', err.message);
            useMemoryFallback = true;
        });
        await client.connect();
        console.log('✅ Redis connected');
    } catch (error) {
        console.log('⚠️  Redis not available, using in-memory cache fallback');
        useMemoryFallback = true;
    }
};

// --- GET value from cache ---
const getCache = async (key) => {
    if (useMemoryFallback) return memoryStore.get(key) || null;
    try {
        return await client.get(key);
    } catch {
        return memoryStore.get(key) || null;
    }
};

// --- SET value in cache (with optional TTL in seconds) ---
const setCache = async (key, value, ttlSeconds = 300) => {
    if (useMemoryFallback) {
        memoryStore.set(key, String(value));
        return;
    }
    try {
        await client.set(key, String(value), { EX: ttlSeconds });
    } catch {
        memoryStore.set(key, String(value));
    }
};

// --- DELETE value from cache ---
const delCache = async (key) => {
    if (useMemoryFallback) { memoryStore.delete(key); return; }
    try { await client.del(key); } catch { memoryStore.delete(key); }
};

module.exports = { connectRedis, getCache, setCache, delCache };
