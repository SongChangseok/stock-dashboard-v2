/**
 * Error monitoring and boundary testing utilities
 */

import React from 'react'

export interface ErrorReport {
  id: string
  timestamp: number
  message: string
  stack?: string
  component?: string
  props?: Record<string, any>
  url: string
  userAgent: string
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'javascript' | 'network' | 'react' | 'boundary' | 'promise'
  context?: Record<string, any>
  recovered: boolean
}

export interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsBySeverity: Record<string, number>
  errorRate: number
  recoveryRate: number
  topErrors: Array<{
    message: string
    count: number
    lastOccurrence: number
  }>
  trend: Array<{
    timestamp: number
    count: number
  }>
}

class ErrorMonitor {
  private errors: ErrorReport[] = []
  private errorListeners: ((error: ErrorReport) => void)[] = []
  private isInitialized = false

  /**
   * Initialize error monitoring
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        component: 'Global',
        url: event.filename || window.location.href,
        severity: 'high',
        type: 'javascript',
        context: {
          line: event.lineno,
          column: event.colno
        }
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        component: 'Promise',
        url: window.location.href,
        severity: 'high',
        type: 'promise',
        context: {
          reason: event.reason
        }
      })
    })

    // Network errors (fetch failures)
    this.interceptFetch()

    this.isInitialized = true
  }

  /**
   * Record an error
   */
  recordError(errorData: Partial<ErrorReport> & { message: string }): string {
    const errorId = this.generateErrorId()
    
    const error: ErrorReport = {
      id: errorId,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      severity: 'medium',
      type: 'javascript',
      recovered: false,
      ...errorData
    }

    this.errors.push(error)

    // Keep only last 1000 errors
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000)
    }

    // Notify listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (e) {
        console.error('Error in error listener:', e)
      }
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error recorded:', error)
    }

    return errorId
  }

  /**
   * Record React error boundary error
   */
  recordBoundaryError(
    error: Error,
    errorInfo: { componentStack: string },
    component: string,
    props?: Record<string, any>
  ): string {
    return this.recordError({
      message: error.message,
      stack: error.stack,
      component,
      props: this.sanitizeProps(props),
      severity: 'critical',
      type: 'boundary',
      context: {
        componentStack: errorInfo.componentStack
      }
    })
  }

  /**
   * Record network error
   */
  recordNetworkError(
    url: string,
    status: number,
    statusText: string,
    method: string = 'GET'
  ): string {
    const severity = status >= 500 ? 'high' : status >= 400 ? 'medium' : 'low'
    
    return this.recordError({
      message: `Network error: ${status} ${statusText}`,
      component: 'Network',
      severity,
      type: 'network',
      context: {
        url,
        status,
        statusText,
        method
      }
    })
  }

  /**
   * Mark an error as recovered
   */
  markAsRecovered(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId)
    if (error) {
      error.recovered = true
    }
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: (error: ErrorReport) => void): () => void {
    this.errorListeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.errorListeners.indexOf(listener)
      if (index > -1) {
        this.errorListeners.splice(index, 1)
      }
    }
  }

  /**
   * Get error metrics
   */
  getMetrics(timeRange: number = 3600000): ErrorMetrics { // Default: last hour
    const now = Date.now()
    const recentErrors = this.errors.filter(e => now - e.timestamp < timeRange)

    // Count by type
    const errorsByType: Record<string, number> = {}
    recentErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1
    })

    // Count by severity
    const errorsBySeverity: Record<string, number> = {}
    recentErrors.forEach(error => {
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1
    })

    // Calculate error rate (errors per hour)
    const errorRate = (recentErrors.length / (timeRange / 3600000))

    // Calculate recovery rate
    const recoveredErrors = recentErrors.filter(e => e.recovered).length
    const recoveryRate = recentErrors.length > 0 ? recoveredErrors / recentErrors.length : 1

    // Top errors by frequency
    const errorCounts = new Map<string, { count: number; lastOccurrence: number }>()
    recentErrors.forEach(error => {
      const key = error.message
      const existing = errorCounts.get(key)
      if (existing) {
        existing.count++
        existing.lastOccurrence = Math.max(existing.lastOccurrence, error.timestamp)
      } else {
        errorCounts.set(key, { count: 1, lastOccurrence: error.timestamp })
      }
    })

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Error trend (hourly buckets)
    const trend = this.calculateErrorTrend(recentErrors, timeRange)

    return {
      totalErrors: recentErrors.length,
      errorsByType,
      errorsBySeverity,
      errorRate,
      recoveryRate,
      topErrors,
      trend
    }
  }

  /**
   * Export errors for external reporting
   */
  exportErrors(timeRange?: number): ErrorReport[] {
    if (timeRange) {
      const now = Date.now()
      return this.errors.filter(e => now - e.timestamp < timeRange)
    }
    return [...this.errors]
  }

  /**
   * Clear errors (useful for testing)
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * Test error boundary functionality
   */
  testErrorBoundary(): void {
    // Trigger an intentional error for testing
    setTimeout(() => {
      throw new Error('Test error for boundary testing')
    }, 0)
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Sanitize props to remove sensitive data
   */
  private sanitizeProps(props?: Record<string, any>): Record<string, any> | undefined {
    if (!props) return undefined

    const sanitized: Record<string, any> = {}
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth']

    Object.keys(props).forEach(key => {
      const lowerKey = key.toLowerCase()
      const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof props[key] === 'function') {
        sanitized[key] = '[Function]'
      } else if (typeof props[key] === 'object' && props[key] !== null) {
        sanitized[key] = '[Object]'
      } else {
        sanitized[key] = props[key]
      }
    })

    return sanitized
  }

  /**
   * Intercept fetch calls to monitor network errors
   */
  private interceptFetch(): void {
    if (typeof window === 'undefined' || !window.fetch) return

    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        if (!response.ok) {
          this.recordNetworkError(
            args[0] as string,
            response.status,
            response.statusText,
            (args[1] as RequestInit)?.method || 'GET'
          )
        }
        
        return response
      } catch (error) {
        this.recordNetworkError(
          args[0] as string,
          0,
          error instanceof Error ? error.message : 'Network error',
          (args[1] as RequestInit)?.method || 'GET'
        )
        throw error
      }
    }
  }

  /**
   * Calculate error trend over time
   */
  private calculateErrorTrend(errors: ErrorReport[], timeRange: number): Array<{ timestamp: number; count: number }> {
    const bucketSize = Math.max(300000, timeRange / 20) // At least 5-minute buckets
    const buckets = new Map<number, number>()
    const now = Date.now()

    errors.forEach(error => {
      const bucketTime = Math.floor(error.timestamp / bucketSize) * bucketSize
      buckets.set(bucketTime, (buckets.get(bucketTime) || 0) + 1)
    })

    // Fill in missing buckets with zero
    const startTime = now - timeRange
    const endTime = now
    const trend: Array<{ timestamp: number; count: number }> = []

    for (let time = startTime; time <= endTime; time += bucketSize) {
      const bucketTime = Math.floor(time / bucketSize) * bucketSize
      trend.push({
        timestamp: bucketTime,
        count: buckets.get(bucketTime) || 0
      })
    }

    return trend
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor()

// Initialize in browser environment
if (typeof window !== 'undefined') {
  errorMonitor.initialize()
}

// React hook for error monitoring
export function useErrorMonitor() {
  return {
    recordError: errorMonitor.recordError.bind(errorMonitor),
    recordBoundaryError: errorMonitor.recordBoundaryError.bind(errorMonitor),
    recordNetworkError: errorMonitor.recordNetworkError.bind(errorMonitor),
    markAsRecovered: errorMonitor.markAsRecovered.bind(errorMonitor),
    getMetrics: errorMonitor.getMetrics.bind(errorMonitor),
    addErrorListener: errorMonitor.addErrorListener.bind(errorMonitor)
  }
}

// Enhanced Error Boundary component
export class ErrorBoundaryWithMonitoring extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error: Error | null; errorId: string | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null, errorId: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = errorMonitor.recordBoundaryError(
      error,
      { componentStack: errorInfo.componentStack || '' },
      this.constructor.name,
      this.props
    )
    
    this.setState({ errorId })
  }

  retry = () => {
    if (this.state.errorId) {
      errorMonitor.markAsRecovered(this.state.errorId)
    }
    this.setState({ hasError: false, error: null, errorId: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      return (
        <div className="error-boundary p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.retry}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}