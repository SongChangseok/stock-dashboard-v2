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
    refreshData,
    simulatePriceUpdates,
    stopPriceUpdates
  } = usePortfolioStore()

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  useEffect(() => {
    if (stocks.length > 0) {
      simulatePriceUpdates()
    }
    
    return () => stopPriceUpdates()
  }, [stocks.length, simulatePriceUpdates, stopPriceUpdates])

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