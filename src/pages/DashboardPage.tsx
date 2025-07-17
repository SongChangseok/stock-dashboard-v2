import React, { useState } from 'react'
import { usePortfolio } from '../hooks'
import { 
  StockForm, 
  StockList, 
  PortfolioSummary, 
  FloatingActionButton,
  PortfolioChart,
  LazySkeletonLoader,
  AdaptiveSkeletonLoader
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
          <LazySkeletonLoader type="summary-card" count={3} />
        </div>

        {/* Portfolio Chart Skeleton */}
        <div className="mb-4 md:mb-8">
          <LazySkeletonLoader type="portfolio-chart" showLegend={true} />
        </div>

        {/* Stock List Skeleton */}
        <LazySkeletonLoader type="stock-list" count={3} />
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
        <AdaptiveSkeletonLoader
          type="summary-card"
          count={3}
          isLoading={isLoading}
          showProgressively={true}
        >
          <PortfolioSummary summary={portfolioSummary} />
        </AdaptiveSkeletonLoader>
      </div>

      {/* Portfolio Chart */}
      <div className="mb-4 md:mb-8">
        <AdaptiveSkeletonLoader
          type="portfolio-chart"
          isLoading={isLoading}
          showProgressively={true}
        >
          <PortfolioChart summary={portfolioSummary} />
        </AdaptiveSkeletonLoader>
      </div>

      {/* Stock List */}
      <AdaptiveSkeletonLoader
        type="stock-list"
        count={3}
        isLoading={isLoading}
        showProgressively={true}
      >
        <StockList
          stocks={stocksWithValue}
          onEdit={handleEditStock}
          onDelete={deleteStock}
          onAdd={handleAddStock}
        />
      </AdaptiveSkeletonLoader>

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
