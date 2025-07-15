import { supabase } from './supabase'
import type { Stock, CreateStockData, UpdateStockData } from '../types'

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

}

export const stockService = new StockService()