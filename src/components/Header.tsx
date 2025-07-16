import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { HeaderProps, NavItem } from '../types'

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard'
  },
  {
    id: 'portfolio',
    label: 'Target Portfolio',
    route: '/target-portfolio'
  },
  {
    id: 'analytics',
    label: 'Portfolio Comparison',
    route: '/portfolio-comparison'
  }
]

export const Header: React.FC<HeaderProps> = ({
  user,
  onSignOut
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Swipe navigation is handled in the Layout component

  const handleNavClick = (item: NavItem) => {
    if (item.route) {
      navigate(item.route)
    }
    setIsMobileMenuOpen(false)
  }

  const getActiveNavItem = () => {
    return navItems.find(item => item.route === location.pathname)?.id || 'dashboard'
  }

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false)
    await onSignOut()
  }

  return (
    <>
      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                StockDash
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = getActiveNavItem() === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`
                      relative py-2 px-1 text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-indigo-400' 
                        : 'text-gray-300 hover:text-indigo-400'
                      }
                    `}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Welcome!</p>
                <p className="text-white font-medium text-sm">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="min-h-[44px] px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all duration-300 font-medium text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
              aria-label="Menu"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none"
                className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              >
                {isMobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-80 max-w-[90vw] h-full bg-gray-900/95 backdrop-blur-xl border-r border-white/10">
            {/* Mobile Menu Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* User Info */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Logged in as</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
              
              {/* Navigation Items */}
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive = getActiveNavItem() === item.id
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`
                        w-full min-h-[44px] p-3 text-left rounded-lg transition-all flex items-center gap-3 font-medium
                        ${isActive 
                          ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
                          : 'text-white bg-white/5 border border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      {getNavIcon(item.id)}
                      {item.label}
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
              
              {/* Logout Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleSignOut}
                  className="w-full min-h-[44px] p-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-all flex items-center justify-center gap-3 font-medium"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Helper function to get navigation icons
function getNavIcon(id: string) {
  switch (id) {
    case 'dashboard':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
        </svg>
      )
    case 'portfolio':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
        </svg>
      )
    case 'analytics':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="currentColor"/>
        </svg>
      )
    default:
      return null
  }
}