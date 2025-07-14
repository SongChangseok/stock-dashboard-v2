import React from 'react'
import type { FloatingActionButtonProps } from '../types'

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 z-40 flex items-center justify-center touch-manipulation ${className}`}
      title="Add Stock"
      style={{ minHeight: '44px', minWidth: '44px' }}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none"
        className="transition-transform duration-200 md:w-6 md:h-6"
      >
        <path 
          d="M12 5v14m-7-7h14" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}