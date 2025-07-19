import React from 'react'
import { LoadingButtonProps } from '../../types/components'

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
    touch-manipulation select-none
  `

  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 disabled:from-indigo-800 disabled:to-purple-800',
    secondary: 'bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 focus:ring-blue-500 disabled:bg-blue-600/10 disabled:text-blue-600',
    danger: 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 focus:ring-red-500 disabled:bg-red-600/10 disabled:text-red-600'
  }

  const sizeClasses = {
    sm: 'min-h-[32px] px-3 py-1 text-sm',
    md: 'min-h-[44px] px-4 py-2',
    lg: 'min-h-[48px] px-6 py-3 text-lg'
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

export { LoadingButton }
export default LoadingButton