/**
 * Performance monitoring utilities for quality metrics
 */

import React from 'react'

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'timing' | 'counter' | 'gauge'
  unit?: string
  tags?: Record<string, string>
}

export interface PerformanceReport {
  summary: {
    totalMetrics: number
    averageLoadTime: number
    averageInteractionTime: number
    errorRate: number
    performanceScore: number
  }
  metrics: PerformanceMetric[]
  thresholds: {
    loadTime: number
    interactionTime: number
    errorRate: number
  }
  violations: string[]
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private thresholds = {
    loadTime: 2000, // 2 seconds
    interactionTime: 100, // 100ms
    errorRate: 0.05 // 5%
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    })

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Time a function execution
   */
  async timeFunction<T>(
    name: string,
    fn: () => Promise<T> | T,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      
      this.recordMetric({
        name,
        value: duration,
        type: 'timing',
        unit: 'ms',
        tags
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      this.recordMetric({
        name: `${name}_error`,
        value: duration,
        type: 'timing',
        unit: 'ms',
        tags: { ...tags, error: 'true' }
      })
      
      throw error
    }
  }

  /**
   * Record page load performance
   */
  recordPageLoad(pageName: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        // Record various load timing metrics
        this.recordMetric({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          type: 'timing',
          unit: 'ms',
          tags: { page: pageName }
        })

        this.recordMetric({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          type: 'timing',
          unit: 'ms',
          tags: { page: pageName }
        })

        this.recordMetric({
          name: 'first_paint',
          value: navigation.loadEventEnd - navigation.fetchStart,
          type: 'timing',
          unit: 'ms',
          tags: { page: pageName }
        })
      }

      // Record Core Web Vitals if available
      this.recordCoreWebVitals(pageName)
    }
  }

  /**
   * Record Core Web Vitals
   */
  private recordCoreWebVitals(pageName: string): void {
    // This would typically use the web-vitals library
    // For now, we'll measure what we can with Performance API
    
    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      this.recordMetric({
        name: 'largest_contentful_paint',
        value: lastEntry.startTime,
        type: 'timing',
        unit: 'ms',
        tags: { page: pageName }
      })
    })
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // LCP not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsScore = 0
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      })
      
      this.recordMetric({
        name: 'cumulative_layout_shift',
        value: clsScore,
        type: 'gauge',
        tags: { page: pageName }
      })
    })
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // CLS not supported
    }
  }

  /**
   * Record user interaction timing
   */
  recordInteraction(interactionName: string, duration: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name: 'user_interaction',
      value: duration,
      type: 'timing',
      unit: 'ms',
      tags: { interaction: interactionName, ...tags }
    })

    // Check if interaction exceeds threshold
    if (duration > this.thresholds.interactionTime) {
      this.recordMetric({
        name: 'slow_interaction',
        value: 1,
        type: 'counter',
        tags: { interaction: interactionName, ...tags }
      })
    }
  }

  /**
   * Record an error occurrence
   */
  recordError(errorName: string, errorMessage: string, tags?: Record<string, string>): void {
    this.recordMetric({
      name: 'error_count',
      value: 1,
      type: 'counter',
      tags: { error: errorName, message: errorMessage, ...tags }
    })
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000) // Last 5 minutes

    // Calculate summary statistics
    const loadTimeMetrics = recentMetrics.filter(m => m.name === 'page_load_time')
    const interactionMetrics = recentMetrics.filter(m => m.name === 'user_interaction')
    const errorMetrics = recentMetrics.filter(m => m.name === 'error_count')
    const totalInteractions = interactionMetrics.length + errorMetrics.length

    const averageLoadTime = loadTimeMetrics.length > 0 
      ? loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length 
      : 0

    const averageInteractionTime = interactionMetrics.length > 0
      ? interactionMetrics.reduce((sum, m) => sum + m.value, 0) / interactionMetrics.length
      : 0

    const errorRate = totalInteractions > 0 ? errorMetrics.length / totalInteractions : 0

    // Calculate performance score (0-100)
    let performanceScore = 100
    if (averageLoadTime > this.thresholds.loadTime) {
      performanceScore -= 20
    }
    if (averageInteractionTime > this.thresholds.interactionTime) {
      performanceScore -= 15
    }
    if (errorRate > this.thresholds.errorRate) {
      performanceScore -= 25
    }

    // Identify violations
    const violations: string[] = []
    if (averageLoadTime > this.thresholds.loadTime) {
      violations.push(`Average load time (${averageLoadTime.toFixed(2)}ms) exceeds threshold (${this.thresholds.loadTime}ms)`)
    }
    if (averageInteractionTime > this.thresholds.interactionTime) {
      violations.push(`Average interaction time (${averageInteractionTime.toFixed(2)}ms) exceeds threshold (${this.thresholds.interactionTime}ms)`)
    }
    if (errorRate > this.thresholds.errorRate) {
      violations.push(`Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${this.thresholds.errorRate * 100}%)`)
    }

    return {
      summary: {
        totalMetrics: recentMetrics.length,
        averageLoadTime,
        averageInteractionTime,
        errorRate,
        performanceScore: Math.max(0, performanceScore)
      },
      metrics: recentMetrics,
      thresholds: this.thresholds,
      violations
    }
  }

  /**
   * Export metrics for external reporting
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Clear metrics (useful for testing)
   */
  clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Hook for React components
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    timeFunction: performanceMonitor.timeFunction.bind(performanceMonitor),
    recordInteraction: performanceMonitor.recordInteraction.bind(performanceMonitor),
    recordError: performanceMonitor.recordError.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor)
  }
}

// HOC for timing component renders
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const startTime = performance.now()
    
    React.useEffect(() => {
      const endTime = performance.now()
      performanceMonitor.recordMetric({
        name: 'component_render_time',
        value: endTime - startTime,
        type: 'timing',
        unit: 'ms',
        tags: { component: componentName }
      })
    })

    return React.createElement(WrappedComponent, props)
  }
}