import { BaseService } from './baseService'
import { authService } from './authService'
import type { Stock, CreateStockData, UpdateStockData } from '../types'

class StockService extends BaseService<
  Stock,
  CreateStockData,
  UpdateStockData
> {
  constructor() {
    super({
      tableName: 'stocks',
      userIdField: 'user_id',
      requiredFields: [
        'stock_name',
        'quantity',
        'purchase_price',
        'current_price',
      ],
    })
  }

  // Convenience methods that maintain backward compatibility
  async getStocks(): Promise<Stock[]> {
    return this.getAll()
  }

  async createStock(stockData: CreateStockData): Promise<Stock> {
    return this.create(stockData)
  }

  async updateStock(stockData: UpdateStockData): Promise<Stock> {
    return this.update(stockData)
  }

  async deleteStock(id: string): Promise<void> {
    return this.delete(id)
  }

  async getStock(id: string): Promise<Stock | null> {
    return this.getById(id)
  }

  /**
   * Get stocks by ticker symbol
   */
  async getStocksByTicker(ticker: string): Promise<Stock[]> {
    try {
      const userId = await authService.getCurrentUserId()

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('ticker', ticker)
        .order('created_at', { ascending: false })

      if (error) {
        throw this.createError(`Failed to fetch stocks by ticker`, error)
      }

      return data || []
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(
        `Unexpected error fetching stocks by ticker`,
        error,
      )
    }
  }

  /**
   * Search stocks by name
   */
  async searchStocks(query: string): Promise<Stock[]> {
    try {
      const userId = await authService.getCurrentUserId()

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .ilike('stock_name', `%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        throw this.createError(`Failed to search stocks`, error)
      }

      return data || []
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(`Unexpected error searching stocks`, error)
    }
  }

  /**
   * Get total portfolio value
   */
  async getPortfolioValue(): Promise<{
    totalValue: number
    totalCost: number
    totalGainLoss: number
  }> {
    try {
      const stocks = await this.getStocks()

      const totalValue = stocks.reduce(
        (sum, stock) => sum + stock.quantity * stock.current_price,
        0,
      )
      const totalCost = stocks.reduce(
        (sum, stock) => sum + stock.quantity * stock.purchase_price,
        0,
      )
      const totalGainLoss = totalValue - totalCost

      return {
        totalValue,
        totalCost,
        totalGainLoss,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(
        `Unexpected error calculating portfolio value`,
        error,
      )
    }
  }

  /**
   * Validate stock data
   */
  validateStockData(data: CreateStockData | UpdateStockData): import('../types/base').BaseValidationResult {
    const errors: string[] = []

    if (
      'stock_name' in data &&
      (!data.stock_name || data.stock_name.trim() === '')
    ) {
      errors.push('Stock name is required')
    }

    if (
      'quantity' in data &&
      data.quantity !== undefined &&
      data.quantity <= 0
    ) {
      errors.push('Quantity must be greater than 0')
    }

    if (
      'purchase_price' in data &&
      data.purchase_price !== undefined &&
      data.purchase_price <= 0
    ) {
      errors.push('Purchase price must be greater than 0')
    }

    if (
      'current_price' in data &&
      data.current_price !== undefined &&
      data.current_price <= 0
    ) {
      errors.push('Current price must be greater than 0')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

}

export const stockService = new StockService()
