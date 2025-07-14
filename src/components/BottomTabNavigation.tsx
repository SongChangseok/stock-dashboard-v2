import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { TabItem } from '../types'

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    route: '/target-portfolio',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'analytics',
    label: 'Analytics',
    route: '/analytics',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="currentColor"/>
      </svg>
    )
  }
]

export const BottomTabNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleTabClick = (tab: TabItem) => {
    if (tab.route && location.pathname !== tab.route) {
      navigate(tab.route)
    }
  }

  const getActiveTab = () => {
    const currentTab = tabs.find(tab => tab.route === location.pathname)
    return currentTab?.id || 'dashboard'
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 md:hidden z-40">
      <div className="flex items-center justify-around px-2 py-2 safe-area-padding-bottom">
        {tabs.map((tab) => {
          const isActive = getActiveTab() === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                flex flex-col items-center justify-center p-2 min-h-[48px] min-w-[48px] rounded-lg transition-all duration-200
                ${isActive 
                  ? 'text-indigo-400 bg-indigo-500/10' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                }
              `}
              aria-label={tab.label}
            >
              <div className={`mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-indigo-400' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}