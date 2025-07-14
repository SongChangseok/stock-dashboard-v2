import { supabase } from './supabase'
import type { Stock, StockWithValue, PortfolioSummary, CreateStockData, UpdateStockData } from '../types'

class StockService {
  async getStocks(): Promise<Stock[]> {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch stocks: ${error.message}`)
    }

    return data || []
  }

  async createStock(stockData: CreateStockData): Promise<Stock> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('stocks')
      .insert({
        ...stockData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create stock: ${error.message}`)
    }

    return data
  }

  async updateStock(stockData: UpdateStockData): Promise<Stock> {
    const { id, ...updateFields } = stockData
    
    const { data, error } = await supabase
      .from('stocks')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update stock: ${error.message}`)
    }

    return data
  }

  async deleteStock(id: string): Promise<void> {
    const { error } = await supabase
      .from('stocks')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete stock: ${error.message}`)
    }
  }

  calculateStockValue(stock: Stock): StockWithValue {
    const totalValue = stock.quantity * stock.current_price
    const totalCost = stock.quantity * stock.purchase_price
    const profitLoss = totalValue - totalCost
    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0

    return {
      ...stock,
      totalValue,
      profitLoss,
      profitLossPercent
    }
  }

  calculatePortfolioSummary(stocks: Stock[]): PortfolioSummary {
    const stocksWithValue = stocks.map(stock => this.calculateStockValue(stock))
    
    const totalValue = stocksWithValue.reduce((sum, stock) => sum + stock.totalValue, 0)
    const totalCost = stocksWithValue.reduce((sum, stock) => sum + (stock.quantity * stock.purchase_price), 0)
    const totalProfitLoss = totalValue - totalCost
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
      stocks: stocksWithValue
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }
}

export const stockService = new StockService()