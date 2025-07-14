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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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