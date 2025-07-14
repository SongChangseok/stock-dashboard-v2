import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks'
import { Header, BottomTabNavigation } from './'

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-4 pt-20 md:pt-24 pb-20 md:pb-8 max-w-7xl">
        <Outlet />
      </main>
      
      <BottomTabNavigation />
    </div>
  )
}