import { useEffect, useRef, useState } from 'react'

export interface ComponentPerformanceMetrics {
  renderCount: number
  renderTime: number
  componentName: string
  averageRenderTime: number
  slowRenderCount: number
  memoryUsage: number
  isSlowRender: boolean
}

export const usePerformanceMonitor = (componentName: string, options?: {
  enableLogging?: boolean
  slowRenderThreshold?: number
  enableMemoryTracking?: boolean
}): ComponentPerformanceMetrics => {
  const renderCountRef = useRef(0)
  const renderStartTimeRef = useRef<number>(0)
  const renderTimeRef = useRef<number>(0)
  const slowRenderCountRef = useRef(0)
  const totalRenderTimeRef = useRef(0)
  const [memoryUsage, setMemoryUsage] = useState(0)

  const {
    enableLogging = process.env.NODE_ENV === 'development',
    slowRenderThreshold = 16,
    enableMemoryTracking = false
  } = options || {}

  // Start performance timing
  renderStartTimeRef.current = performance.now()
  renderCountRef.current += 1

  useEffect(() => {
    // Calculate render time after component is mounted/updated
    const renderTime = performance.now() - renderStartTimeRef.current
    renderTimeRef.current = renderTime
    totalRenderTimeRef.current += renderTime

    const isSlowRender = renderTime > slowRenderThreshold
    if (isSlowRender) {
      slowRenderCountRef.current += 1
    }

    // Track memory usage if enabled
    if (enableMemoryTracking && 'memory' in performance) {
      const memoryInfo = (performance as any).memory
      setMemoryUsage(memoryInfo.usedJSHeapSize / (1024 * 1024)) // Convert to MB
    }

    // Log performance metrics in development
    if (enableLogging) {
      const averageRenderTime = totalRenderTimeRef.current / renderCountRef.current
      
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCountRef.current,
        renderTime: renderTime.toFixed(2) + 'ms',
        averageRenderTime: averageRenderTime.toFixed(2) + 'ms',
        slowRenderCount: slowRenderCountRef.current,
        memoryUsage: enableMemoryTracking ? memoryUsage.toFixed(2) + 'MB' : 'N/A'
      })
    }

    // Performance warning for slow renders
    if (isSlowRender) {
      console.warn(`[Performance Warning] ${componentName} took ${renderTime.toFixed(2)}ms to render (threshold: ${slowRenderThreshold}ms)`)
    }

    // Mark the render in performance timeline
    if ('performance' in window && 'mark' in performance) {
      try {
        performance.mark(`${componentName}-render-${renderCountRef.current}`)
      } catch (error) {
        // Ignore marking errors
      }
    }
  })

  return {
    renderCount: renderCountRef.current,
    renderTime: renderTimeRef.current,
    componentName,
    averageRenderTime: totalRenderTimeRef.current / renderCountRef.current,
    slowRenderCount: slowRenderCountRef.current,
    memoryUsage,
    isSlowRender: renderTimeRef.current > slowRenderThreshold
  }
}

