import React from 'react'
import { EmptyStateProps } from '../../types/components'

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = ""
}) => {
  return (
    <div className={`text-center ${className}`}>
      {icon && (
        <div className="text-4xl md:text-6xl mb-4 opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-lg md:text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 mb-6 text-sm md:text-base">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="min-h-[44px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95 touch-manipulation select-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export { EmptyState }
export default EmptyState