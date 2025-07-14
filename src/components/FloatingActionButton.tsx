import React from 'react'

interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center ${className}`}
      title="Add Stock"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        className="transition-transform duration-200"
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