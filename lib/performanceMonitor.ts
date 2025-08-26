// Performance monitoring utility for tracking query performance

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  // Track a performance metric
  track(
    operation: string,
    duration: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ) {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      success,
      error,
      metadata,
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > 1000) {
      // Log operations taking more than 1 second
      console.warn(
        `Slow operation detected: ${operation} took ${duration}ms`,
        metadata
      );
    }
  }

  // Get performance summary
  getSummary() {
    const successfulMetrics = this.metrics.filter((m) => m.success);
    const failedMetrics = this.metrics.filter((m) => !m.success);

    const avgDuration =
      successfulMetrics.length > 0
        ? successfulMetrics.reduce((sum, m) => sum + m.duration, 0) /
          successfulMetrics.length
        : 0;

    const slowOperations = successfulMetrics
      .filter((m) => m.duration > 500) // Operations taking more than 500ms
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalOperations: this.metrics.length,
      successfulOperations: successfulMetrics.length,
      failedOperations: failedMetrics.length,
      averageDuration: Math.round(avgDuration),
      slowOperations: slowOperations.map((m) => ({
        operation: m.operation,
        duration: m.duration,
        timestamp: m.timestamp,
      })),
      errorRate:
        this.metrics.length > 0
          ? (failedMetrics.length / this.metrics.length) * 100
          : 0,
    };
  }

  // Get metrics for a specific operation
  getOperationMetrics(operation: string) {
    return this.metrics.filter((m) => m.operation === operation);
  }

  // Clear metrics
  clear() {
    this.metrics = [];
  }

  // Export metrics for analysis
  export() {
    return {
      metrics: this.metrics,
      summary: this.getSummary(),
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Higher-order function to wrap async operations with performance tracking
export function withPerformanceTracking<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      const result = await fn(...args);
      success = true;
      return result;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.track(operation, duration, success, error, {
        args: args.length,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

// Utility to track database query performance
export function trackQuery<T extends any[], R>(
  queryName: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return withPerformanceTracking(`db_query:${queryName}`, fn);
}

// Utility to track component render performance
export function trackRender<T extends any[], R>(
  componentName: string,
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      const result = fn(...args);
      success = true;
      return result;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.track(
        `render:${componentName}`,
        duration,
        success,
        error
      );
    }
  };
}

// React hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const trackOperation = (operation: string) => {
    return <T extends any[], R>(fn: (...args: T) => Promise<R>) => {
      return trackQuery(`${componentName}:${operation}`, fn);
    };
  };

  return { trackOperation };
}

// Performance monitoring middleware for Next.js API routes
export function withPerformanceMiddleware(handler: Function) {
  return async (req: any, res: any) => {
    const startTime = Date.now();
    const operation = `${req.method} ${req.url}`;
    let success = false;
    let error: string | undefined;

    try {
      await handler(req, res);
      success = true;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.track(`api:${operation}`, duration, success, error, {
        method: req.method,
        url: req.url,
        userAgent: req.headers["user-agent"],
      });
    }
  };
}

// Debug utility to log performance issues
export function logPerformanceIssues() {
  const summary = performanceMonitor.getSummary();

  if (summary.errorRate > 5) {
    console.error(`High error rate detected: ${summary.errorRate.toFixed(2)}%`);
  }

  if (summary.averageDuration > 500) {
    console.warn(`High average response time: ${summary.averageDuration}ms`);
  }

  if (summary.slowOperations.length > 0) {
    console.warn("Slow operations detected:", summary.slowOperations);
  }
}

// Export for use in development
if (typeof window !== "undefined") {
  (window as any).performanceMonitor = performanceMonitor;
  (window as any).logPerformanceIssues = logPerformanceIssues;
}
