import React, { memo, useEffect, useState } from 'react'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

// Simple animated loading screen for fullscreen loading
interface AnimatedLoadingScreenProps {
  message?: string
  variant?: 'fullscreen' | 'inline' | 'overlay'
  showProgress?: boolean
  progress?: number
  className?: string
}

export const AnimatedLoadingScreen: React.FC<AnimatedLoadingScreenProps> = memo(({
  message = 'Loading...',
  variant = 'inline',
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  usePerformanceMonitor('AnimatedLoadingScreen')
  
  const [dots, setDots] = useState('')
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [])

  const getContainerClasses = () => {
    const baseClasses = 'loading-container flex items-center justify-center'
    
    switch (variant) {
      case 'fullscreen':
        return `${baseClasses} fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 loading-fade-in`
      case 'overlay':
        return `${baseClasses} absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-40 loading-fade-in`
      case 'inline':
      default:
        return `${baseClasses} p-8 ${className}`
    }
  }

  return (
    <div className={getContainerClasses()}>
      <div className="skeleton-container flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="spinner-optimized w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-white/80 text-lg font-medium">{message}</span>
            <span className="text-indigo-400 text-lg font-medium min-w-[24px] text-left">{dots}</span>
          </div>
          
          {showProgress && (
            <div className="space-y-2">
              <div className="progress-bar w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <span className="text-white/60 text-sm">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
        
        <div className="dots-container">
          <div className="dot bg-indigo-600"></div>
          <div className="dot bg-indigo-600"></div>
          <div className="dot bg-indigo-600"></div>
        </div>
      </div>
    </div>
  )
})


// Page-level loading wrapper component
export const PageLoadingWrapper: React.FC<{
  isLoading: boolean
  children: React.ReactNode
  loadingMessage?: string
  skeleton?: React.ReactNode
  useTransition?: boolean
}> = memo(({ isLoading, children, loadingMessage = 'Loading page...', skeleton, useTransition = true }) => {
  usePerformanceMonitor('PageLoadingWrapper')
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        {skeleton || (
          <AnimatedLoadingScreen 
            variant="fullscreen" 
            message={loadingMessage}
            showProgress={false}
          />
        )}
      </div>
    )
  }
  
  return (
    <div className={useTransition ? 'loading-transition' : ''}>
      {children}
    </div>
  )
})