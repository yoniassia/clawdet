// Performance Monitoring & Metrics
// Tracks response times, API calls, and system health

interface Metric {
  count: number;
  totalTime: number;
  minTime: number;
  maxTime: number;
  lastUpdated: number;
}

class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map();
  private startTime: number = Date.now();

  /**
   * Start timing an operation
   */
  start(label: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(label, duration);
    };
  }

  /**
   * Record a metric manually
   */
  recordMetric(label: string, durationMs: number): void {
    const existing = this.metrics.get(label);

    if (existing) {
      existing.count++;
      existing.totalTime += durationMs;
      existing.minTime = Math.min(existing.minTime, durationMs);
      existing.maxTime = Math.max(existing.maxTime, durationMs);
      existing.lastUpdated = Date.now();
    } else {
      this.metrics.set(label, {
        count: 1,
        totalTime: durationMs,
        minTime: durationMs,
        maxTime: durationMs,
        lastUpdated: Date.now(),
      });
    }
  }

  /**
   * Get stats for a specific metric
   */
  getMetric(label: string) {
    const metric = this.metrics.get(label);
    if (!metric) return null;

    return {
      label,
      count: metric.count,
      avg: metric.totalTime / metric.count,
      min: metric.minTime,
      max: metric.maxTime,
      total: metric.totalTime,
      lastUpdated: new Date(metric.lastUpdated).toISOString(),
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const result: Record<string, any> = {};
    
    for (const [label, metric] of this.metrics.entries()) {
      result[label] = {
        count: metric.count,
        avg: Math.round(metric.totalTime / metric.count),
        min: metric.minTime,
        max: metric.maxTime,
        total: metric.totalTime,
      };
    }

    return result;
  }

  /**
   * Get system stats
   */
  getSystemStats() {
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime: {
        ms: uptime,
        human: this.formatUptime(uptime),
      },
      memory: process.memoryUsage(),
      startTime: new Date(this.startTime).toISOString(),
    };
  }

  /**
   * Format uptime to human-readable string
   */
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get summary stats
   */
  getSummary() {
    const metrics = this.getAllMetrics();
    const totalRequests = Object.values(metrics).reduce(
      (sum: number, m: any) => sum + m.count,
      0
    );

    return {
      totalRequests,
      uniqueEndpoints: this.metrics.size,
      metrics,
      system: this.getSystemStats(),
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Middleware helper to track API endpoint performance
 */
export function trackPerformance(label: string) {
  return performanceMonitor.start(label);
}

/**
 * Measure async function performance
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const end = performanceMonitor.start(label);
  try {
    return await fn();
  } finally {
    end();
  }
}

/**
 * Measure sync function performance
 */
export function measureSync<T>(label: string, fn: () => T): T {
  const end = performanceMonitor.start(label);
  try {
    return fn();
  } finally {
    end();
  }
}

export default performanceMonitor;
