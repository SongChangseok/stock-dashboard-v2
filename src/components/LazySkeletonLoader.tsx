import React, { lazy, Suspense, memo, useEffect, useState } from 'react'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

// Lazy load skeleton components for better performance
const LazyStockListSkeleton = lazy(() => import('./SkeletonLoader').then(module => ({ default: module.StockListSkeleton })))
const LazyPortfolioChartSkeleton = lazy(() => import('./SkeletonLoader').then(module => ({ default: module.PortfolioChartSkeleton })))
const LazyTargetPortfolioListSkeleton = lazy(() => import('./SkeletonLoader').then(module => ({ default: module.TargetPortfolioListSkeleton })))
const LazyFormSkeleton = lazy(() => import('./SkeletonLoader').then(module => ({ default: module.FormSkeleton })))
const LazySummaryCardSkeleton = lazy(() => import('./SkeletonLoader').then(module => ({ default: module.SummaryCardSkeleton })))

interface LazySkeletonLoaderProps {
  type: 'stock-list' | 'portfolio-chart' | 'target-portfolio-list' | 'form' | 'summary-card'
  fallback?: React.ReactNode
  timeout?: number
  [key: string]: unknown
}

// Fallback skeleton component for immediate rendering
const MinimalSkeleton: React.FC<{ className?: string }> = memo(({ className = '' }) => (
  <div className={`animate-pulse bg-white/10 rounded-lg ${className}`}>
    <div className="space-y-3 p-4">
      <div className="h-4 bg-white/10 rounded w-3/4"></div>
      <div className="h-4 bg-white/10 rounded w-1/2"></div>
      <div className="h-4 bg-white/10 rounded w-5/6"></div>
    </div>
  </div>
))

export const LazySkeletonLoader: React.FC<LazySkeletonLoaderProps> = memo(({ 
  type, 
  fallback = <MinimalSkeleton />, 
  timeout = 100,
  ...props 
}) => {
  usePerformanceMonitor('LazySkeletonLoader')
  
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout])

  const renderSkeletonComponent = () => {
    switch (type) {
      case 'stock-list':
        return <LazyStockListSkeleton {...props} />
      case 'portfolio-chart':
        return <LazyPortfolioChartSkeleton {...props} />
      case 'target-portfolio-list':
        return <LazyTargetPortfolioListSkeleton {...props} />
      case 'form':
        return <LazyFormSkeleton {...props} />
      case 'summary-card':
        return <LazySummaryCardSkeleton {...props} />
      default:
        return <MinimalSkeleton className="h-32" />
    }
  }

  return (
    <Suspense fallback={showFallback ? fallback : null}>
      {renderSkeletonComponent()}
    </Suspense>
  )
})

// Intersection Observer based lazy loading
export const IntersectionLazyLoader: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}> = memo(({ children, fallback, threshold = 0.1, rootMargin = '50px', className = '' }) => {
  usePerformanceMonitor('IntersectionLazyLoader')
  const [isVisible, setIsVisible] = useState(false)
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!elementRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(elementRef)

    return () => observer.disconnect()
  }, [elementRef, threshold, rootMargin])

  return (
    <div ref={setElementRef} className={className}>
      {isVisible ? children : (fallback || <MinimalSkeleton className="h-32" />)}
    </div>
  )
})


// Skeleton component with adaptive loading
export const AdaptiveSkeletonLoader: React.FC<{
  type: 'stock-list' | 'portfolio-chart' | 'target-portfolio-list' | 'form' | 'summary-card'
  count?: number
  isLoading: boolean
  children: React.ReactNode
  showProgressively?: boolean
  className?: string
}> = memo(({ 
  type, 
  count = 3, 
  isLoading, 
  children, 
  showProgressively = false,
  className = '' 
}) => {
  usePerformanceMonitor('AdaptiveSkeletonLoader')
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (showProgressively) {
        const timer = setTimeout(() => {
          setShowContent(true)
        }, 150)
        return () => clearTimeout(timer)
      } else {
        setShowContent(true)
      }
    } else {
      setShowContent(false)
    }
  }, [isLoading, showProgressively])

  if (isLoading) {
    return (
      <div className={`skeleton-container ${className}`}>
        <LazySkeletonLoader type={type} count={count} />
      </div>
    )
  }

  return (
    <div className={`${showContent ? 'loading-fade-in' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  )
})

