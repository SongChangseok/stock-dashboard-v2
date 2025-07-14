import React, { useState } from 'react'
import { useAuth, usePortfolio } from '../hooks'
import { 
  StockForm, 
  StockList, 
  PortfolioSummary, 
  FloatingActionButton,
  PortfolioChart
} from '../components'
import type { Stock } from '../types/database'

export const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth()
  const { stocksWithValue, portfolioSummary, isLoading, error, refreshData, deleteStock } = usePortfolio()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleAddStock = () => {
    setEditingStock(null)
    setIsFormOpen(true)
  }

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingStock(null)
  }

  const handleSaveStock = () => {
    refreshData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              StockDash
            </h1>
            <p className="text-gray-400 mt-1">Manage your portfolio and track real-time performance</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Welcome!</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary summary={portfolioSummary} />

        {/* Portfolio Chart */}
        <div className="mb-8">
          <PortfolioChart summary={portfolioSummary} />
        </div>

        {/* Stock List */}
        <StockList
          stocks={stocksWithValue}
          onEdit={handleEditStock}
          onDelete={deleteStock}
          onAdd={handleAddStock}
        />

        {/* Floating Action Button */}
        <FloatingActionButton onClick={handleAddStock} />

        {/* Stock Form Modal */}
        <StockForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveStock}
          editStock={editingStock}
        />
      </div>
    </div>
  )
}
