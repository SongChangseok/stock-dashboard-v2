import { useEffect } from 'react'
import { usePortfolioStore } from '../stores/portfolioStore'

export const usePortfolio = () => {
  const {
    stocks,
    stocksWithValue,
    portfolioSummary,
    isLoading,
    error,
    fetchStocks,
    deleteStock,
    refreshData
  } = usePortfolioStore()

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  return {
    stocks,
    stocksWithValue,
    portfolioSummary,
    isLoading,
    error,
    refreshData,
    deleteStock
  }
}