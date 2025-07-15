import { useEffect, useRef } from 'react'

export interface PerformanceMetrics {
  renderCount: number
  renderTime: number
  componentName: string
}

export const usePerformanceMonitor = (componentName: string): PerformanceMetrics => {
  const renderCountRef = useRef(0)
  const renderStartTimeRef = useRef<number>(0)
  const renderTimeRef = useRef<number>(0)

  // Start performance timing
  renderStartTimeRef.current = performance.now()
  renderCountRef.current += 1

  useEffect(() => {
    // Calculate render time after component is mounted/updated
    const renderTime = performance.now() - renderStartTimeRef.current
    renderTimeRef.current = renderTime

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCountRef.current,
        renderTime: renderTime.toFixed(2) + 'ms',
        averageRenderTime: ((renderTimeRef.current / renderCountRef.current) || 0).toFixed(2) + 'ms'
      })
    }

    // Performance warning for slow renders
    if (renderTime > 16) { // 16ms = 60fps threshold
      console.warn(`[Performance Warning] ${componentName} took ${renderTime.toFixed(2)}ms to render`)
    }
  })

  return {
    renderCount: renderCountRef.current,
    renderTime: renderTimeRef.current,
    componentName
  }
}

export const useRenderTimer = (componentName: string) => {
  const startTime = useRef<number>(0)
  
  // Start timing
  startTime.current = performance.now()
  
  useEffect(() => {
    const renderTime = performance.now() - startTime.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render Timer] ${componentName}: ${renderTime.toFixed(2)}ms`)
    }
  })
}