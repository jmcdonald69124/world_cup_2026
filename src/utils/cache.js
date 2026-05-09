const PREFIX = 'wc2026_cache_';

// TTL presets in milliseconds
export const TTL = {
  LIVE: 30_000,          // 30s — live match events
  MATCH: 5 * 60_000,     // 5m  — match details during tournament
  STANDINGS: 15 * 60_000, // 15m — standings / group tables
  SCHEDULE: 60 * 60_000,  // 1h  — fixture list
  TEAM: 24 * 60 * 60_000, // 24h — squad / team info
  STATIC: 7 * 24 * 60 * 60_000, // 7d — stadiums, weather history
};

function key(namespace) {
  return `${PREFIX}${namespace}`;
}

export const cache = {
  get(namespace) {
    try {
      const raw = localStorage.getItem(key(namespace));
      if (!raw) return null;
      const { data, expiresAt } = JSON.parse(raw);
      if (Date.now() > expiresAt) {
        localStorage.removeItem(key(namespace));
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  set(namespace, data, ttl = TTL.MATCH) {
    try {
      localStorage.setItem(
        key(namespace),
        JSON.stringify({ data, expiresAt: Date.now() + ttl })
      );
    } catch (e) {
      // localStorage full — evict oldest wc2026 entries and retry
      evictOldest();
      try {
        localStorage.setItem(
          key(namespace),
          JSON.stringify({ data, expiresAt: Date.now() + ttl })
        );
      } catch {
        // Silent fail — app still works, just without cache
      }
    }
  },

  invalidate(namespace) {
    localStorage.removeItem(key(namespace));
  },

  invalidatePattern(pattern) {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX) && k.includes(pattern))
      .forEach(k => localStorage.removeItem(k));
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },

  stats() {
    const entries = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    const bytes = entries.reduce((sum, k) => sum + (localStorage.getItem(k)?.length ?? 0), 0);
    return { entries: entries.length, sizeKb: (bytes / 1024).toFixed(1) };
  },
};

function evictOldest() {
  const entries = Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .map(k => {
      try {
        const { expiresAt } = JSON.parse(localStorage.getItem(k));
        return { k, expiresAt };
      } catch {
        return { k, expiresAt: 0 };
      }
    })
    .sort((a, b) => a.expiresAt - b.expiresAt);

  // Remove oldest half
  entries.slice(0, Math.ceil(entries.length / 2)).forEach(({ k }) => localStorage.removeItem(k));
}

// Wrap any async fetch fn with cache-aside logic
export async function withCache(namespace, fetchFn, ttl = TTL.MATCH) {
  const cached = cache.get(namespace);
  if (cached !== null) return cached;
  const data = await fetchFn();
  cache.set(namespace, data, ttl);
  return data;
}
