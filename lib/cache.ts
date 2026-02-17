// In-Memory Cache with TTL Support
// Simple caching layer for reducing API calls and improving performance

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private hitCount = 0;
  private missCount = 0;

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.value as T;
  }

  /**
   * Set a value in cache with TTL (time to live) in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;
    
    return {
      size: this.store.size,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  /**
   * Remove expired entries (garbage collection)
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get or set pattern: fetch from cache or compute and store
   */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttlSeconds);
    return value;
  }
}

// Singleton instance
export const cache = new Cache();

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const removed = cache.cleanup();
    if (removed > 0) {
      console.log(`[Cache] Cleaned up ${removed} expired entries`);
    }
  }, 5 * 60 * 1000);
}

export default cache;
