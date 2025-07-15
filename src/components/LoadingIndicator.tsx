import React from 'react'
import { useLoadingState, useAnyLoading } from '../hooks/useLoadingState'
import { LOADING_OPERATIONS } from '../utils/loadingState'

interface LoadingIndicatorProps {
  operationId?: string
  operationIds?: string[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'bar'
  className?: string
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  operationId,
  operationIds,
  size = 'md',
  variant = 'spinner',
  className = ''
}) => {
  const singleState = useLoadingState(operationId || '')
  const anyLoading = useAnyLoading(operationIds || [])
  
  const isLoading = operationId ? singleState.isLoading : anyLoading

  if (!isLoading) return null

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const renderSpinner = () => (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  )

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`bg-current rounded-full animate-bounce ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'}`} style={{ animationDelay: '0ms' }}></div>
      <div className={`bg-current rounded-full animate-bounce ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'}`} style={{ animationDelay: '150ms' }}></div>
      <div className={`bg-current rounded-full animate-bounce ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'}`} style={{ animationDelay: '300ms' }}></div>
    </div>
  )

  const renderBar = () => (
    <div className={`bg-gray-200 rounded-full overflow-hidden ${size === 'sm' ? 'h-1' : size === 'md' ? 'h-2' : 'h-3'} ${className}`}>
      <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ 
        width: '40%',
        animation: 'loading-bar 2s ease-in-out infinite'
      }}></div>
    </div>
  )

  switch (variant) {
    case 'dots':
      return renderDots()
    case 'bar':
      return renderBar()
    default:
      return renderSpinner()
  }
}

// Global loading indicator for page-level loading
export const GlobalLoadingIndicator: React.FC = () => {
  const isLoading = useAnyLoading([
    LOADING_OPERATIONS.FETCH_STOCKS,
    LOADING_OPERATIONS.FETCH_TARGET_PORTFOLIOS,
    LOADING_OPERATIONS.SIGN_IN,
    LOADING_OPERATIONS.SIGN_UP,
    LOADING_OPERATIONS.SYNC_DATA
  ])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-indigo-600 transition-all duration-300 ease-out"
        style={{
          width: '100%',
          animation: 'loading-bar 2s ease-in-out infinite'
        }}
      />
    </div>
  )
}

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 flex items-center gap-3">
            <LoadingIndicator variant="spinner" size="sm" className="text-white" />
            <span className="text-white text-sm">{message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading button component
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText = 'Loading...',
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {isLoading && <LoadingIndicator variant="spinner" size="sm" />}
      {isLoading ? loadingText : children}
    </button>
  )
}