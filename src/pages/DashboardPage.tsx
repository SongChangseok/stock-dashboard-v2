import React, { useState } from 'react'
import { usePortfolio } from '../hooks'
import { 
  StockForm, 
  StockList, 
  PortfolioSummary, 
  FloatingActionButton,
  PortfolioChart,
  StockListSkeleton,
  PortfolioChartSkeleton,
  SummaryCardSkeleton
} from '../components'
import type { Stock } from '../types/database'

export const DashboardPage: React.FC = () => {
  const { stocksWithValue, portfolioSummary, isLoading, error, refreshData, deleteStock } = usePortfolio()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)

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

  const showInitialLoading = isLoading && stocksWithValue.length === 0

  if (showInitialLoading) {
    return (
      <>

        {/* Portfolio Summary Skeleton */}
        <div className="mb-4 md:mb-8">
          <SummaryCardSkeleton count={3} />
        </div>

        {/* Portfolio Chart Skeleton */}
        <div className="mb-4 md:mb-8">
          <PortfolioChartSkeleton showLegend={true} />
        </div>

        {/* Stock List Skeleton */}
        <StockListSkeleton count={3} />
      </>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
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
    <>

      {/* Portfolio Summary */}
      <div className="mb-4 md:mb-8">
        <PortfolioSummary summary={portfolioSummary} />
      </div>

      {/* Portfolio Chart */}
      <div className="mb-4 md:mb-8">
        <PortfolioChart summary={portfolioSummary} />
      </div>

      {/* Stock List */}
      <StockList
        stocks={stocksWithValue}
        onEdit={handleEditStock}
        onDelete={deleteStock}
        onAdd={handleAddStock}
      />

      {/* Floating Action Button - Hidden on mobile */}
      <div className="hidden md:block">
        <FloatingActionButton onClick={handleAddStock} />
      </div>

      {/* Stock Form Modal */}
      <StockForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveStock}
        editStock={editingStock}
      />
    </>
  )
}
