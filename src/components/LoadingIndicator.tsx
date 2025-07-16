import { useLoadingState, useAnyLoading } from '../hooks/useLoadingState'

interface LoadingIndicatorProps {
  operationId?: string
  operationIds?: string[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'bar'
  className?: string
}

export const LoadingIndicator = ({
  operationId,
  operationIds,
  size = 'md',
  variant = 'spinner',
  className = ''
}: LoadingIndicatorProps) => {
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

