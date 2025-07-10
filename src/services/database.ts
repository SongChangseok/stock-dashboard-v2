import { supabase } from './supabase'
import { Stock, Profile, TargetPortfolio, StockWithValue, PortfolioSummary } from '../types/database'

// Profile operations
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Stock operations
export const stockService = {
  async getStocks(userId: string): Promise<Stock[]> {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async addStock(stock: Omit<Stock, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('stocks')
      .insert([stock])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateStock(id: string, updates: Partial<Stock>) {
    const { data, error } = await supabase
      .from('stocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteStock(id: string) {
    const { error } = await supabase
      .from('stocks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Calculate portfolio summary
  calculatePortfolioSummary(stocks: Stock[]): PortfolioSummary {
    const stocksWithValue: StockWithValue[] = stocks.map(stock => {
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
    })

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
}

// Target Portfolio operations
export const targetPortfolioService = {
  async getTargetPortfolios(userId: string): Promise<TargetPortfolio[]> {
    const { data, error } = await supabase
      .from('target_portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async addTargetPortfolio(portfolio: Omit<TargetPortfolio, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('target_portfolios')
      .insert([portfolio])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateTargetPortfolio(id: string, updates: Partial<TargetPortfolio>) {
    const { data, error } = await supabase
      .from('target_portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteTargetPortfolio(id: string) {
    const { error } = await supabase
      .from('target_portfolios')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Authentication operations
export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}