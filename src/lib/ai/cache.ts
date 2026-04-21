/** Simple in-memory LRU with TTL. Keyed by SHA-256-ish of (profile, question). */

interface Entry<V> {
  value: V;
  expiresAt: number;
}

export class LruCache<V> {
  private readonly max: number;
  private readonly ttlMs: number;
  private map = new Map<string, Entry<V>>();

  constructor(max = 200, ttlMs = 1000 * 60 * 30) {
    this.max = max;
    this.ttlMs = ttlMs;
  }

  get(key: string): V | undefined {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    // refresh recency
    this.map.delete(key);
    this.map.set(key, e);
    return e.value;
  }

  set(key: string, value: V) {
    if (this.map.size >= this.max) {
      const first = this.map.keys().next().value;
      if (first !== undefined) this.map.delete(first);
    }
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  size() {
    return this.map.size;
  }
}

/** Small fast hash for cache keys — no cryptographic needs. */
export function hashKey(parts: Array<string | number>): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  const s = parts.join("§");
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return (
    (4294967296 * (2097151 & h2) + (h1 >>> 0))
      .toString(16)
      .padStart(16, "0")
  );
}

/** Normalize a question so paraphrases hit the cache. */
export function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
