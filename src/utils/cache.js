const PREFIX = 'wc2026_cache_';

export const TTL = {
  LIVE: 30_000,
  MATCH: 5 * 60_000,
  STANDINGS: 15 * 60_000,
  SCHEDULE: 60 * 60_000,
  TEAM: 24 * 60 * 60_000,
  STATIC: 7 * 24 * 60 * 60_000,
};

function key(namespace) { return `${PREFIX}${namespace}`; }

export const cache = {
  get(namespace) {
    try {
      const raw = localStorage.getItem(key(namespace));
      if (!raw) return null;
      const { data, expiresAt } = JSON.parse(raw);
      if (Date.now() > expiresAt) { localStorage.removeItem(key(namespace)); return null; }
      return data;
    } catch { return null; }
  },
  set(namespace, data, ttl = TTL.MATCH) {
    try {
      localStorage.setItem(key(namespace), JSON.stringify({ data, expiresAt: Date.now() + ttl }));
    } catch {
      evictOldest();
      try { localStorage.setItem(key(namespace), JSON.stringify({ data, expiresAt: Date.now() + ttl })); } catch {}
    }
  },
  invalidate(namespace) { localStorage.removeItem(key(namespace)); },
  invalidatePattern(pattern) {
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX) && k.includes(pattern)).forEach(k => localStorage.removeItem(k));
  },
  clear() { Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k)); },
  stats() {
    const entries = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    const bytes = entries.reduce((sum, k) => sum + (localStorage.getItem(k)?.length ?? 0), 0);
    return { entries: entries.length, sizeKb: (bytes / 1024).toFixed(1) };
  },
};

function evictOldest() {
  const entries = Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).map(k => {
    try { const { expiresAt } = JSON.parse(localStorage.getItem(k)); return { k, expiresAt }; }
    catch { return { k, expiresAt: 0 }; }
  }).sort((a, b) => a.expiresAt - b.expiresAt);
  entries.slice(0, Math.ceil(entries.length / 2)).forEach(({ k }) => localStorage.removeItem(k));
}

export async function withCache(namespace, fetchFn, ttl = TTL.MATCH) {
  const cached = cache.get(namespace);
  if (cached !== null) return cached;
  const data = await fetchFn();
  cache.set(namespace, data, ttl);
  return data;
}
