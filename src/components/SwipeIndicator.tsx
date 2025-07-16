import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDeviceCapabilities } from '../hooks'

interface SwipeIndicatorProps {
  currentPage: string
  totalPages: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

const navPages = [
  { route: '/dashboard', label: 'Dashboard', index: 0 },
  { route: '/target-portfolio', label: 'Portfolio', index: 1 },
  { route: '/analytics', label: 'Analytics', index: 2 },
  { route: '/settings', label: 'Settings', index: 3 }
]

export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  className = ''
}) => {
  const location = useLocation()
  const { isMobile, hasTouchScreen } = useDeviceCapabilities()
  const [showHint, setShowHint] = useState(false)

  const currentPageData = navPages.find(page => page.route === location.pathname)
  const currentIndex = currentPageData?.index ?? 0

  const getPreviousPage = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : navPages.length - 1
    return navPages[prevIndex]
  }

  const getNextPage = () => {
    const nextIndex = currentIndex < navPages.length - 1 ? currentIndex + 1 : 0
    return navPages[nextIndex]
  }

  // Show hint on first visit
  useEffect(() => {
    const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint')
    if (!hasSeenSwipeHint) {
      setShowHint(true)
      const timer = setTimeout(() => {
        setShowHint(false)
        localStorage.setItem('hasSeenSwipeHint', 'true')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Only show on mobile devices with touch screens
  if (!isMobile || !hasTouchScreen) {
    return null
  }

  const previousPage = getPreviousPage()
  const nextPage = getNextPage()

  return (
    <>
      {/* Swipe Hint Overlay */}
      {showHint && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm mx-auto text-center">
            <div className="text-2xl mb-3">👆</div>
            <h3 className="text-lg font-semibold text-white mb-2">Swipe to Navigate</h3>
            <p className="text-gray-300 text-sm mb-4">
              Swipe left or right anywhere on the page to quickly navigate between sections
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <span>←</span>
                <span>Next</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-1">
                <span>Previous</span>
                <span>→</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowHint(false)
                localStorage.setItem('hasSeenSwipeHint', 'true')
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Indicator */}
      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
        <div className="bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
          {/* Previous Page Hint */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">{previousPage.label}</span>
          </div>

          {/* Page Dots */}
          <div className="flex items-center gap-1.5">
            {navPages.map((page, index) => (
              <div
                key={page.route}
                className={`
                  w-2 h-2 rounded-full transition-all duration-200
                  ${index === currentIndex 
                    ? 'bg-indigo-400 w-6' 
                    : 'bg-gray-600'
                  }
                `}
              />
            ))}
          </div>

          {/* Next Page Hint */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="hidden sm:inline">{nextPage.label}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Edge Swipe Visual Feedback */}
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none">
        <div className="w-1 h-20 bg-gradient-to-r from-indigo-500/50 to-transparent rounded-r opacity-0 animate-pulse swipe-edge-left" />
      </div>
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none">
        <div className="w-1 h-20 bg-gradient-to-l from-indigo-500/50 to-transparent rounded-l opacity-0 animate-pulse swipe-edge-right" />
      </div>
    </>
  )
}

// Helper component to show swipe progress
export const SwipeProgress: React.FC<{
  progress: number
  direction: 'left' | 'right'
}> = ({ progress, direction }) => {
  if (progress === 0) return null

  return (
    <div className={`
      fixed top-1/2 transform -translate-y-1/2 z-40 pointer-events-none
      transition-opacity duration-200
      ${direction === 'left' ? 'left-4' : 'right-4'}
    `}>
      <div className="bg-indigo-600/90 backdrop-blur-xl rounded-full p-3 shadow-lg">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          className="text-white"
          style={{ 
            transform: `scale(${0.8 + progress * 0.4}) ${direction === 'left' ? 'rotate(0deg)' : 'rotate(180deg)'}` 
          }}
        >
          <path 
            d="M9 18l6-6-6-6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}