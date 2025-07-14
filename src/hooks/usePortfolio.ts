import { useState, useEffect, useCallback } from 'react'
import { stockService } from '../services/stockService'
import type { Stock, StockWithValue, PortfolioSummary } from '../types/database'

export const usePortfolio = () => {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [stocksWithValue, setStocksWithValue] = useState<StockWithValue[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
    stocks: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStocks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedStocks = await stockService.getStocks()
      setStocks(fetchedStocks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks')
      console.error('Error fetching stocks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateCalculations = useCallback(() => {
    const summary = stockService.calculatePortfolioSummary(stocks)
    setStocksWithValue(summary.stocks)
    setPortfolioSummary(summary)
  }, [stocks])

  const deleteStock = useCallback(async (stockId: string) => {
    try {
      await stockService.deleteStock(stockId)
      await fetchStocks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete stock')
      console.error('Error deleting stock:', err)
    }
  }, [fetchStocks])

  const refreshData = useCallback(() => {
    fetchStocks()
  }, [fetchStocks])

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  useEffect(() => {
    updateCalculations()
  }, [updateCalculations])

  // Simulate real-time price updates
  useEffect(() => {
    if (stocks.length === 0) return

    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => ({
          ...stock,
          current_price: Math.max(0.01, stock.current_price * (1 + (Math.random() - 0.5) * 0.02))
        }))
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [stocks.length])

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