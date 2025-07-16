import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useSwipeNavigation } from '../hooks'
import { Header } from './'
import { SwipeIndicator } from './SwipeIndicator'

const navItems = [
  { route: '/dashboard' },
  { route: '/target-portfolio' },
  { route: '/analytics' },
  { route: '/settings' }
]

export const Layout = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Navigation helpers for swipe gestures
  const getCurrentNavIndex = () => {
    const currentPath = location.pathname
    return navItems.findIndex(item => item.route === currentPath)
  }

  const navigateToNext = () => {
    const currentIndex = getCurrentNavIndex()
    if (currentIndex === -1) return // Unknown route
    
    const nextIndex = currentIndex < navItems.length - 1 ? currentIndex + 1 : 0
    const nextItem = navItems[nextIndex]
    navigate(nextItem.route)
  }

  const navigateToPrevious = () => {
    const currentIndex = getCurrentNavIndex()
    if (currentIndex === -1) return // Unknown route
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : navItems.length - 1
    const prevItem = navItems[prevIndex]
    navigate(prevItem.route)
  }

  // Swipe navigation for the main content area
  const { ref: swipeRef } = useSwipeNavigation(
    navigateToNext,     // Swipe left = next page
    navigateToPrevious, // Swipe right = previous page
    { enableHapticFeedback: true, threshold: 80 }
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main 
        ref={swipeRef}
        className="container mx-auto px-4 pt-20 md:pt-24 pb-16 max-w-7xl touch-pan-y"
      >
        <Outlet />
      </main>

      {/* Swipe Navigation Indicator */}
      <SwipeIndicator 
        currentPage={location.pathname}
        totalPages={navItems.length}
        onSwipeLeft={navigateToNext}
        onSwipeRight={navigateToPrevious}
      />
    </div>
  )
}