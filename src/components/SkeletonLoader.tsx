import React, { memo } from 'react'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  className?: string
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = memo(({
  variant = 'rectangular',
  width,
  height,
  className = ''
}) => {
  usePerformanceMonitor('SkeletonLoader')
  
  const baseClasses = 'skeleton-shimmer bg-white/10'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
})

interface StockListSkeletonProps {
  count?: number
}

export const StockListSkeleton: React.FC<StockListSkeletonProps> = memo(({ count = 3 }) => {
  usePerformanceMonitor('StockListSkeleton')
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
        <SkeletonLoader variant="text" width="120px" height="24px" />
        <SkeletonLoader variant="rounded" width="140px" height="44px" />
      </div>
      
      {/* Desktop Table Skeleton */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/2">
              {Array.from({ length: 8 }).map((_, i) => (
                <th key={i} className="p-4">
                  <SkeletonLoader variant="text" width="80px" height="16px" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="p-4">
                  <div className="space-y-2">
                    <SkeletonLoader variant="text" width="60px" height="16px" />
                    <SkeletonLoader variant="text" width="120px" height="14px" />
                  </div>
                </td>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="p-4">
                    <SkeletonLoader variant="text" width="80px" height="16px" />
                  </td>
                ))}
                <td className="p-4">
                  <div className="flex gap-2">
                    <SkeletonLoader variant="rounded" width="60px" height="32px" />
                    <SkeletonLoader variant="rounded" width="60px" height="32px" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="md:hidden space-y-3 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <SkeletonLoader variant="text" width="80px" height="20px" />
                <SkeletonLoader variant="text" width="140px" height="14px" />
              </div>
              <div className="text-right space-y-2">
                <SkeletonLoader variant="text" width="100px" height="16px" />
                <SkeletonLoader variant="text" width="60px" height="14px" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <SkeletonLoader variant="text" width="60px" height="12px" />
                  <SkeletonLoader variant="text" width="80px" height="16px" />
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2">
              <SkeletonLoader variant="rounded" width="100%" height="44px" />
              <SkeletonLoader variant="rounded" width="100%" height="44px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

interface PortfolioChartSkeletonProps {
  showLegend?: boolean
}

export const PortfolioChartSkeleton: React.FC<PortfolioChartSkeletonProps> = memo(({ showLegend = true }) => {
  usePerformanceMonitor('PortfolioChartSkeleton')
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-xl mx-4 md:mx-0">
      <SkeletonLoader variant="text" width="180px" height="24px" className="mb-4 md:mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <div className="h-64 md:h-80 flex items-center justify-center">
            <SkeletonLoader variant="circular" width="160px" height="160px" className="md:w-60 md:h-60" />
          </div>
        </div>
        
        {showLegend && (
          <div className="space-y-2 md:space-y-3">
            <SkeletonLoader variant="text" width="80px" height="20px" className="mb-3 md:mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 md:p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 md:gap-3">
                    <SkeletonLoader variant="circular" width="12px" height="12px" />
                    <SkeletonLoader variant="text" width="60px" height="14px" />
                  </div>
                  <div className="space-y-1">
                    <SkeletonLoader variant="text" width="40px" height="14px" />
                    <SkeletonLoader variant="text" width="60px" height="12px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

interface TargetPortfolioListSkeletonProps {
  count?: number
}

export const TargetPortfolioListSkeleton: React.FC<TargetPortfolioListSkeletonProps> = memo(({ count = 2 }) => {
  usePerformanceMonitor('TargetPortfolioListSkeleton')
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
        <SkeletonLoader variant="text" width="160px" height="24px" />
        <SkeletonLoader variant="rounded" width="140px" height="44px" />
      </div>

      {/* Desktop Grid Skeleton */}
      <div className="hidden md:block p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white/3 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <SkeletonLoader variant="text" width="140px" height="20px" />
                  <SkeletonLoader variant="text" width="200px" height="14px" />
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <SkeletonLoader key={j} variant="rounded" width="44px" height="44px" />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <SkeletonLoader variant="text" width="60px" height="14px" />
                    <SkeletonLoader variant="text" width="40px" height="14px" />
                  </div>
                ))}
                
                <div className="space-y-2">
                  <SkeletonLoader variant="text" width="80px" height="12px" />
                  <div className="space-y-1">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex justify-between">
                        <SkeletonLoader variant="text" width="60px" height="12px" />
                        <SkeletonLoader variant="text" width="40px" height="12px" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <SkeletonLoader variant="text" width="120px" height="12px" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile List Skeleton */}
      <div className="md:hidden space-y-3 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="space-y-2">
              <SkeletonLoader variant="text" width="140px" height="20px" />
              <SkeletonLoader variant="text" width="180px" height="14px" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <SkeletonLoader variant="text" width="50px" height="12px" />
                  <SkeletonLoader variant="text" width="60px" height="16px" />
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-4 gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <SkeletonLoader key={j} variant="rounded" width="100%" height="44px" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

interface FormSkeletonProps {
  fields?: number
  hasSubmitButton?: boolean
}

export const FormSkeleton: React.FC<FormSkeletonProps> = memo(({ fields = 4, hasSubmitButton = true }) => {
  usePerformanceMonitor('FormSkeleton')
  
  return (
    <div className="space-y-4 md:space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonLoader variant="text" width="100px" height="16px" />
          <SkeletonLoader variant="rounded" width="100%" height="44px" />
        </div>
      ))}
      
      {hasSubmitButton && (
        <div className="flex gap-3 pt-4">
          <SkeletonLoader variant="rounded" width="100px" height="44px" />
          <SkeletonLoader variant="rounded" width="80px" height="44px" />
        </div>
      )}
    </div>
  )
})

interface SummaryCardSkeletonProps {
  count?: number
}

export const SummaryCardSkeleton: React.FC<SummaryCardSkeletonProps> = memo(({ count = 3 }) => {
  usePerformanceMonitor('SummaryCardSkeleton')
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-xl">
          <div className="space-y-3">
            <SkeletonLoader variant="text" width="120px" height="16px" />
            <SkeletonLoader variant="text" width="140px" height="32px" />
            <SkeletonLoader variant="text" width="80px" height="14px" />
          </div>
        </div>
      ))}
    </div>
  )
})